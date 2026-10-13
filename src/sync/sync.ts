// Sync progress between computers through a Google Sheet the family owns.
//
// The teacher/parent makes a Google Sheet, pastes the small Apps Script below into it
// (Extensions → Apps Script) and deploys it as a web app. The app then reads and writes
// the progress through that web app's URL, using a random secret so only someone with
// the full "sync code" can touch it. No Google sign-in happens in the app itself, and the
// script can only see that one spreadsheet (@OnlyCurrentDoc).

import { parseImport, type AppState, type ExportFile } from "../engine/state";

export interface SyncConfig {
  url: string;
  key: string;
  /** updatedAt of the progress last known to match the Sheet (after a pull or push). */
  lastSynced?: string;
  /** When the last successful sync happened (ms), for the status line. */
  lastOkAt?: number;
  lastError?: string;
}

const CONFIG_KEY = "levelup.sync";
const BACKUP_KEY = "levelup.sync-backups";

export function loadSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as SyncConfig) : null;
  } catch {
    return null;
  }
}

export function saveSyncConfig(c: SyncConfig | null) {
  try {
    if (c) localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {
    // storage blocked: sync just won't remember itself
  }
}

/** A long random secret for the script (letters and digits only, so it's easy to paste). */
export function newSecret(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

const URL_RE = /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;

export function isScriptUrl(u: string): boolean {
  return URL_RE.test(u.trim());
}

/** One string to paste on another computer: the web app URL with the secret after "#". */
export function syncCode(c: Pick<SyncConfig, "url" | "key">): string {
  return `${c.url}#${c.key}`;
}

export function parseSyncCode(code: string): { url: string; key: string } | null {
  const [url, key] = code.trim().split("#");
  if (!url || !key || !isScriptUrl(url) || !/^[A-Za-z0-9]{12,}$/.test(key)) return null;
  return { url, key };
}

/** The Apps Script the teacher/parent pastes into their Sheet, with this setup's secret filled in. */
export function scriptSource(secret: string): string {
  return `/**
 * Level Up progress sync. Paste this into Extensions → Apps Script of a Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * It can only read and write THIS spreadsheet. Please don't edit the "mathquest" tab by hand.
 * @OnlyCurrentDoc
 */
const SECRET = '${secret}';
const CHUNK = 40000; // a Sheets cell holds at most 50,000 characters

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName('mathquest') || ss.insertSheet('mathquest');
}

// Every stored cell starts with a letter so Sheets never turns it into a number, date or formula.
function read_() {
  const sh = sheet_();
  const stamp = String(sh.getRange('B1').getValue() || '');
  const n = sh.getLastRow();
  if (stamp.indexOf('v:') !== 0 || n < 1) return { updated: null, data: null };
  const data = sh.getRange(1, 1, n, 1).getValues()
    .map(function (r) { return String(r[0]); })
    .filter(function (s) { return s.charAt(0) === 'x'; })
    .map(function (s) { return s.slice(1); })
    .join('');
  return { updated: stamp.slice(2), data: data };
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== SECRET) return json_({ ok: false, error: 'wrong-key' });
  const r = read_();
  return json_({ ok: true, updated: r.updated, data: r.data });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad-request' }); }
  if (body.key !== SECRET) return json_({ ok: false, error: 'wrong-key' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const current = read_();
    // Someone else saved since this computer last synced: send theirs back instead of overwriting.
    if (current.updated && current.updated !== body.base && !body.force) {
      return json_({ ok: false, error: 'conflict', updated: current.updated, data: current.data });
    }
    const sh = sheet_();
    const data = String(body.data);
    const rows = [];
    for (var i = 0; i < data.length; i += CHUNK) rows.push(['x' + data.slice(i, i + CHUNK)]);
    sh.getRange('A:A').clearContent();
    sh.getRange(1, 1, rows.length, 1).setValues(rows);
    sh.getRange('B1').setValue('v:' + body.updated);
    sh.getRange('C1').setValue('Level Up progress, last saved ' + new Date());
    return json_({ ok: true, updated: body.updated });
  } finally {
    lock.releaseLock();
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
`;
}

// ---------- Talking to the script ----------

export interface Remote {
  updated: string | null;
  state: AppState | null;
}

export class SyncError extends Error {
  constructor(
    message: string,
    public kind: "network" | "wrong-key" | "bad-response" | "conflict",
    public remote?: Remote,
  ) {
    super(message);
  }
}

/** Serialize without the API key (it stays on each computer). Compact, unlike the download file. */
export function serialize(state: AppState): string {
  const copy: AppState = JSON.parse(JSON.stringify(state));
  delete copy.settings.apiKey;
  const file: ExportFile = { app: "math-quest-level-up", exportedAt: new Date().toISOString(), state: copy };
  return JSON.stringify(file);
}

function toRemote(updated: string | null, data: string | null): Remote {
  if (!updated || !data) return { updated: null, state: null };
  return { updated, state: parseImport(data) };
}

async function call(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow", ...init });
  } catch {
    throw new SyncError("Couldn't reach Google (offline?).", "network");
  }
  let json: Record<string, unknown>;
  try {
    json = await res.json();
  } catch {
    throw new SyncError("Google sent back something unexpected. Check the web app URL and that access is set to “Anyone”.", "bad-response");
  }
  if (json.error === "wrong-key") throw new SyncError("The sync code doesn't match this Sheet's script.", "wrong-key");
  return json;
}

export async function pull(c: Pick<SyncConfig, "url" | "key">): Promise<Remote> {
  const json = await call(`${c.url}?key=${encodeURIComponent(c.key)}`);
  if (!json.ok) throw new SyncError("The Sheet's script reported a problem.", "bad-response");
  return toRemote((json.updated as string) ?? null, (json.data as string) ?? null);
}

/** Save to the Sheet. Throws a "conflict" SyncError (with the Sheet's copy) if another computer saved since `base`. */
export async function push(c: Pick<SyncConfig, "url" | "key">, state: AppState, base: string | undefined, force = false): Promise<void> {
  const json = await call(c.url, {
    method: "POST",
    // text/plain keeps this a "simple" request, which Apps Script accepts from a web page.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ key: c.key, data: serialize(state), updated: state.updatedAt, base: base ?? null, force }),
  });
  if (json.ok) return;
  if (json.error === "conflict") throw new SyncError("Another computer saved first.", "conflict", toRemote((json.updated as string) ?? null, (json.data as string) ?? null));
  throw new SyncError("The Sheet's script reported a problem.", "bad-response");
}

// ---------- Deciding which copy wins ----------

export type Decision = "noop" | "pull" | "push" | "take-remote" | "keep-local";

/**
 * local/remote: each copy's updatedAt. lastSynced: the updatedAt both sides last agreed on.
 * Only one side changed → copy it over. Both changed (say, one computer was offline) → the
 * more recently changed copy wins; the caller keeps a backup of the other.
 */
export function decide(local: string, remote: string | null, lastSynced: string | undefined): Decision {
  if (!remote) return "push";
  if (remote === local) return "noop";
  const localChanged = !lastSynced || local !== lastSynced;
  const remoteChanged = !lastSynced || remote !== lastSynced;
  if (remoteChanged && !localChanged) return "pull";
  if (localChanged && !remoteChanged) return "push";
  return remote > local ? "take-remote" : "keep-local";
}

// ---------- Backups of the copy that lost a conflict ----------

export interface Backup {
  savedAt: string;
  reason: string;
  file: string;
}

export function loadBackups(): Backup[] {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) ?? "[]") as Backup[];
  } catch {
    return [];
  }
}

export function keepBackup(state: AppState, reason: string) {
  try {
    const list = [{ savedAt: new Date().toISOString(), reason, file: serialize(state) }, ...loadBackups()].slice(0, 3);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
  } catch {
    // storage full: skip the backup rather than block sync
  }
}
