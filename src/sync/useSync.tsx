import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppState } from "../engine/state";
import { SyncError, decide, keepBackup, loadSyncConfig, pull, push, saveSyncConfig, type SyncConfig } from "./sync";

export interface SyncStatus {
  phase: "off" | "syncing" | "ok" | "error";
  message?: string;
}

interface SyncApi {
  status: SyncStatus;
  config: SyncConfig | null;
  /** Sync right away (pull, then push if this computer has newer progress). */
  syncNow: () => Promise<void>;
  /** Save a new config (or null to disconnect) and sync. */
  setConfig: (c: SyncConfig | null) => void;
}

const SyncContext = createContext<SyncApi>({ status: { phase: "off" }, config: null, syncNow: async () => {}, setConfig: () => {} });

export function useSyncApi() {
  return useContext(SyncContext);
}

const PUSH_DELAY_MS = 8000;
const POLL_MS = 5 * 60 * 1000;

/**
 * Keeps progress in step with the Google Sheet. Pulls when the app opens, when the window
 * gets focus and every few minutes; pushes a few seconds after progress changes.
 * While she's in the middle of an activity (`busy`), it never swaps in another copy.
 */
export function SyncProvider({ state, replace, busy, children }: { state: AppState; replace: (s: AppState) => void; busy: boolean; children: ReactNode }) {
  const [config, setConfigState] = useState<SyncConfig | null>(loadSyncConfig);
  const [status, setStatus] = useState<SyncStatus>(() => ({ phase: loadSyncConfig() ? "ok" : "off" }));
  const stateRef = useRef(state);
  stateRef.current = state;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const running = useRef(false);
  const again = useRef(false);

  const update = (c: SyncConfig) => {
    saveSyncConfig(c);
    setConfigState({ ...c });
  };

  const syncNow = useCallback(async () => {
    const cfg = loadSyncConfig();
    if (!cfg) return;
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    setStatus({ phase: "syncing" });
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const local = stateRef.current;
        const remote = await pull(cfg);
        const d = decide(local.updatedAt, remote.updated, cfg.lastSynced);
        if (d === "noop") {
          cfg.lastSynced = local.updatedAt;
          break;
        }
        if (d === "pull" || d === "take-remote") {
          if (busyRef.current) {
            // Don't swap progress mid-activity; try again when it's over.
            setStatus({ phase: "ok", message: "Newer progress is waiting in Google Sheets; it'll load after this activity." });
            running.current = false;
            return;
          }
          if (d === "take-remote") keepBackup(local, "This computer's copy, replaced by a newer one from Google Sheets");
          const next = remote.state!;
          next.settings.apiKey = local.settings.apiKey; // the key stays on each computer
          replace(next);
          cfg.lastSynced = remote.updated!;
          break;
        }
        if (d === "keep-local" && remote.state) keepBackup(remote.state, "Google Sheets' copy, replaced by a newer one from this computer");
        try {
          await push(cfg, local, remote.updated ?? undefined);
          cfg.lastSynced = local.updatedAt;
          break;
        } catch (e) {
          if (e instanceof SyncError && e.kind === "conflict") continue; // another computer saved in between: look again
          throw e;
        }
      }
      cfg.lastOkAt = Date.now();
      cfg.lastError = undefined;
      update(cfg);
      setStatus({ phase: "ok" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sync didn't work.";
      cfg.lastError = message;
      update(cfg);
      setStatus({ phase: "error", message });
    } finally {
      running.current = false;
      if (again.current) {
        again.current = false;
        void syncNow();
      }
    }
  }, [replace]);

  // Open, focus, and a slow poll.
  useEffect(() => {
    if (!config) return;
    void syncNow();
    const onFocus = () => void syncNow();
    window.addEventListener("focus", onFocus);
    const id = setInterval(() => void syncNow(), POLL_MS);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, [config?.url, config?.key, syncNow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push soon after progress changes.
  useEffect(() => {
    if (!config || state.updatedAt === config.lastSynced) return;
    const id = setTimeout(() => void syncNow(), PUSH_DELAY_MS);
    return () => clearTimeout(id);
  }, [state.updatedAt, config, syncNow]);

  // When an activity ends, catch up on anything that was waiting.
  useEffect(() => {
    if (!busy && config) void syncNow();
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps

  const setConfig = useCallback((c: SyncConfig | null) => {
    saveSyncConfig(c);
    setConfigState(c);
    setStatus({ phase: c ? "ok" : "off" });
  }, []);

  return <SyncContext.Provider value={{ status, config, syncNow, setConfig }}>{children}</SyncContext.Provider>;
}
