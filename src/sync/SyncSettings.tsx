import { useEffect, useRef, useState } from "react";
import { parseImport, type AppState } from "../engine/state";
import { isScriptUrl, keepBackup, loadBackups, newSecret, parseSyncCode, pull, push, saveSyncConfig, scriptSource, syncCode, type Remote, type SyncConfig } from "./sync";
import { useSyncApi } from "./useSync";
import "./sync.css";

const PENDING_KEY = "levelup.sync-pending-secret";

function ago(ms?: number): string {
  if (!ms) return "";
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return new Date(ms).toLocaleDateString();
}

function hasProgress(s: AppState) {
  return s.sessions.length > 0 || Object.keys(s.skills).length > 0;
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Teacher corner → Settings card for syncing progress through a Google Sheet. */
export function SyncSettings({ state, replace }: { state: AppState; replace: (s: AppState) => void }) {
  const { status, config, syncNow, setConfig } = useSyncApi();
  const [mode, setMode] = useState<"intro" | "setup" | "join">("intro");
  const [secret] = useState(() => {
    try {
      const old = localStorage.getItem(PENDING_KEY);
      if (old) return old;
      const s = newSecret();
      localStorage.setItem(PENDING_KEY, s);
      return s;
    } catch {
      return newSecret();
    }
  });
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "info" | "warn" | "good"; text: string } | null>(null);
  const [choice, setChoice] = useState<{ cfg: SyncConfig; remote: Remote } | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [, tick] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const flash = async (what: string, text: string) => {
    if (await copy(text)) {
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } else setMsg({ tone: "warn", text: "Couldn't copy automatically. Select the text and copy it (⌘C / Ctrl+C)." });
  };

  /** Try the connection, then decide what to do with any progress already in the Sheet. */
  const connect = async (cfg: SyncConfig) => {
    setBusy(true);
    setMsg(null);
    try {
      const remote = await pull(cfg);
      const local = stateRef.current;
      if (!remote.state) {
        await push(cfg, local, undefined);
        finish({ ...cfg, lastSynced: local.updatedAt }, "Connected! This computer's progress is now saved in your Google Sheet.");
      } else if (!hasProgress(local)) {
        takeRemote(cfg, remote);
      } else {
        setChoice({ cfg, remote });
      }
    } catch (e) {
      setMsg({ tone: "warn", text: e instanceof Error ? e.message : "That didn't work." });
    } finally {
      setBusy(false);
    }
  };

  const finish = (cfg: SyncConfig, text: string) => {
    cfg.lastOkAt = Date.now();
    saveSyncConfig(cfg);
    setConfig(cfg);
    setChoice(null);
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
    setMsg({ tone: "good", text });
  };

  const takeRemote = (cfg: SyncConfig, remote: Remote) => {
    const local = stateRef.current;
    if (hasProgress(local)) keepBackup(local, "This computer's copy, before loading progress from Google Sheets");
    const next = remote.state!;
    next.settings.apiKey = local.settings.apiKey;
    replace(next);
    finish({ ...cfg, lastSynced: remote.updated! }, `Connected! Loaded ${next.settings.studentName || "the student"}'s progress from your Google Sheet.`);
  };

  const keepLocal = async (cfg: SyncConfig, remote: Remote) => {
    setBusy(true);
    try {
      if (remote.state) keepBackup(remote.state, "Google Sheets' copy, before this computer's progress replaced it");
      const local = stateRef.current;
      await push(cfg, local, remote.updated ?? undefined, true);
      finish({ ...cfg, lastSynced: local.updatedAt }, "Connected! Your Google Sheet now has this computer's progress.");
    } catch (e) {
      setMsg({ tone: "warn", text: e instanceof Error ? e.message : "That didn't work." });
    } finally {
      setBusy(false);
    }
  };

  const backups = loadBackups();

  if (choice) {
    const r = choice.remote.state!;
    return (
      <div className="card">
        <h3>Which progress should we keep?</h3>
        <p className="small">Your Google Sheet already has progress for <strong>{r.settings.studentName || "a student"}</strong> (last saved {new Date(choice.remote.updated!).toLocaleString()}, {r.sessions.length} sessions). This computer also has progress for <strong>{state.settings.studentName || "a student"}</strong> ({state.sessions.length} sessions). The one you don't pick is kept as a backup on this computer.</p>
        <div className="row">
          <button className="btn primary" disabled={busy} onClick={() => takeRemote(choice.cfg, choice.remote)}>Use the Google Sheet's progress</button>
          <button className="btn" disabled={busy} onClick={() => keepLocal(choice.cfg, choice.remote)}>Use this computer's progress</button>
          <button className="btn ghost" disabled={busy} onClick={() => setChoice(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  if (config) {
    const codeText = syncCode(config);
    return (
      <div className="card">
        <h3>☁️ Sync across computers</h3>
        <p className="small" style={{ marginTop: 0 }}>
          {status.phase === "syncing" ? "Syncing…" : status.phase === "error" ? <span className="sync-bad">⚠️ {status.message} Progress is still saved on this computer and will sync when it can.</span> : <span className="sync-good">✓ Connected to your Google Sheet{config.lastOkAt ? ` · last synced ${ago(config.lastOkAt)}` : ""}</span>}
          {status.phase === "ok" && status.message ? <><br />{status.message}</> : null}
        </p>
        <p className="small muted">Progress saves to the Sheet a few seconds after changes, and loads the newest copy whenever the app is opened. To add another computer, open Level Up there and choose <strong>I have a sync code</strong>.</p>
        <div className="row">
          <button className="btn" disabled={status.phase === "syncing"} onClick={() => void syncNow()}>🔄 Sync now</button>
          <button className="btn" onClick={() => setShowCode((s) => !s)}>{showCode ? "Hide sync code" : "🔑 Show sync code"}</button>
          <button className="btn ghost" onClick={() => { if (confirm("Stop syncing on this computer? Progress stays here and in the Sheet.")) setConfig(null); }}>Disconnect this computer</button>
        </div>
        {showCode && (
          <div className="sync-code">
            <p className="small">Paste this on each other computer. Treat it like a password: anyone with it can change the progress.</p>
            <div className="row">
              <input readOnly value={codeText} onFocus={(e) => e.currentTarget.select()} aria-label="sync code" />
              <button className="btn" onClick={() => flash("code", codeText)}>{copied === "code" ? "Copied ✓" : "Copy"}</button>
            </div>
          </div>
        )}
        {msg && <div className={`feedback ${msg.tone === "good" ? "good" : msg.tone === "warn" ? "warn" : "info"}`}>{msg.text}</div>}
        <Backups backups={backups} replace={replace} />
      </div>
    );
  }

  return (
    <div className="card">
      <h3>☁️ Sync across computers (Google Sheets)</h3>
      {mode === "intro" && (
        <>
          <p className="small">Keep progress in step on every computer the student uses, without moving files around. It saves to a Google Sheet in <strong>your</strong> Google account through a small script you add to that Sheet. The script can only see that one Sheet, and nothing is stored anywhere else. The API key is never synced.</p>
          <div className="row">
            <button className="btn primary" onClick={() => setMode("setup")}>Set up sync (first computer)</button>
            <button className="btn" onClick={() => setMode("join")}>I have a sync code</button>
          </div>
        </>
      )}

      {mode === "setup" && (
        <ol className="sync-steps">
          <li>
            Open <a href="https://sheets.new" target="_blank" rel="noreferrer">sheets.new</a> to make a new Google Sheet (signed in to your own Google account). Name it something like <em>Level Up progress</em>.
          </li>
          <li>
            In the Sheet, choose <strong>Extensions → Apps Script</strong>. Delete the code that's there, and paste this script (it already contains this setup's secret):
            <textarea className="sync-script" readOnly value={scriptSource(secret)} onFocus={(e) => e.currentTarget.select()} aria-label="Apps Script code" />
            <button className="btn" onClick={() => flash("script", scriptSource(secret))}>{copied === "script" ? "Copied ✓" : "📋 Copy script"}</button>
          </li>
          <li>Click 💾 <strong>Save</strong>. Then <strong>Deploy → New deployment</strong>. Click the ⚙️ next to “Select type” and choose <strong>Web app</strong>. Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>, then <strong>Deploy</strong>.</li>
          <li>Click <strong>Authorize access</strong> and pick your account. Google will say <em>“Google hasn't verified this app”</em>, because it's your own script rather than a published one: click <strong>Advanced → Go to … (unsafe)</strong>, then <strong>Allow</strong>. It only asks for this one spreadsheet.</li>
          <li>
            Copy the <strong>Web app URL</strong> (it ends in <code>/exec</code>) and paste it here:
            <div className="row" style={{ marginTop: 6 }}>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/…/exec" aria-label="Web app URL" />
              <button className="btn primary" disabled={busy || !isScriptUrl(url)} onClick={() => connect({ url: url.trim(), key: secret })}>{busy ? "Connecting…" : "Connect"}</button>
            </div>
            {url && !isScriptUrl(url) && <div className="small sync-bad">That doesn't look like an Apps Script web app URL (https://script.google.com/macros/s/…/exec).</div>}
          </li>
          <li className="small muted" style={{ listStyle: "none" }}>
            <button className="btn ghost" onClick={() => setMode("intro")}>← Back</button>
          </li>
        </ol>
      )}

      {mode === "join" && (
        <>
          <p className="small">On the computer that's already syncing, open Teacher corner → Settings → <strong>Show sync code</strong>, copy it, and paste it here.</p>
          <div className="row">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="https://script.google.com/macros/s/…/exec#…" aria-label="sync code" />
            <button className="btn primary" disabled={busy || !parseSyncCode(code)} onClick={() => connect(parseSyncCode(code)!)}>{busy ? "Connecting…" : "Connect"}</button>
          </div>
          {code && !parseSyncCode(code) && <div className="small sync-bad">That doesn't look like a complete sync code.</div>}
          <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => setMode("intro")}>← Back</button>
        </>
      )}
      {msg && <div className={`feedback ${msg.tone === "good" ? "good" : msg.tone === "warn" ? "warn" : "info"}`}>{msg.text}</div>}
      <Backups backups={backups} replace={replace} />
    </div>
  );
}

function Backups({ backups, replace }: { backups: ReturnType<typeof loadBackups>; replace: (s: AppState) => void }) {
  if (!backups.length) return null;
  const download = (file: string, savedAt: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([file], { type: "application/json" }));
    a.download = `level-up-backup-${savedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const restore = (file: string) => {
    if (!confirm("Restore this backup? It replaces the current progress (on every synced computer).")) return;
    const s = parseImport(file);
    s.updatedAt = new Date().toISOString();
    replace(s);
  };
  return (
    <details className="small" style={{ marginTop: 10 }}>
      <summary>Backups kept after a sync choice ({backups.length})</summary>
      <ul>
        {backups.map((b) => (
          <li key={b.savedAt}>
            {new Date(b.savedAt).toLocaleString()}: {b.reason}{" "}
            <button className="btn ghost" onClick={() => download(b.file, b.savedAt)}>Download</button>
            <button className="btn ghost" onClick={() => restore(b.file)}>Restore</button>
          </li>
        ))}
      </ul>
    </details>
  );
}
