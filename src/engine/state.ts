import type { CourseId, Level } from "../content/types";
import type { PriorRound } from "../grading/types";

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

/** The roadmap's four stages, plus "not started". */
export const LEVEL_NAMES = ["Not started", "Exploring", "Practicing", "Independent", "Can explain & apply"] as const;

export interface Attempt {
  t: number;
  ok: boolean;
  assisted: boolean;
  mode: AttemptMode;
}

export type AttemptMode = "learn" | "review" | "probe" | "placement" | "challenge" | "mistake" | "free";

export interface SkillState {
  level: MasteryLevel;
  /** Running estimate (0–1) that she knows the skill. */
  p: number;
  difficulty: Level;
  /** Consecutive unassisted correct answers at the current difficulty. */
  streak: number;
  /** Consecutive misses (any mode), used to lower difficulty. */
  missStreak: number;
  recent: Attempt[];
  /** Days (yyyy-mm-dd) with at least one unassisted correct answer. */
  correctDays: string[];
  attempts: number;
  correct: number;
  /** Solid enough to build on: unlocks skills that depend on it. */
  ready: boolean;
  nextReview?: string;
  interval: number;
  /** A review was missed; the next review question decides whether to step back. */
  reviewMiss?: boolean;
  whyChoice: boolean;
  whyWritten: "none" | "pending" | "pass" | "revise";
  dates: { exploring?: string; practicing?: string; independent?: string; explain?: string; recheck?: string };
  placed?: boolean;
  lessonSeen: boolean;
  lastPracticed?: string;
}

export interface MistakeEntry {
  id: string;
  skillId: string;
  level: Level;
  prompt: string;
  given: string;
  correct: string;
  date: string;
  resolved: boolean;
}

export interface Explanation {
  id: string;
  skillId: string;
  prompt: string;
  keyIdeas: string[];
  exemplar: string;
  response: string;
  date: string;
  status: "pending" | "pass" | "revise";
  feedback?: string;
  parentNote?: string;
  gradedBy?: "claude" | "parent";
  /** Every draft and the feedback on it, oldest first (present when she revised with Claude's feedback). */
  rounds?: PriorRound[];
  howToImprove?: string;
  modelExplanation?: string;
}

export interface SessionLog {
  date: string;
  minutes: number;
  answered: number;
  correct: number;
  skills: string[];
  kind: string;
}

export interface Settings {
  studentName: string;
  parentPin?: string;
  calculator: boolean;
  sessionLength: "short" | "standard";
  readAloud: boolean;
  apiKey?: string;
  model: string;
  targetDate: string;
  /** The first-launch home page tour has been seen (or skipped). */
  tourDone?: boolean;
  /** She chose "Not now" on the starting-point card on the Today tab. */
  placementHidden?: boolean;
  /** Daily quests per week she's aiming for (Monday–Sunday). */
  weeklyGoal: number;
  /** "I'm stuck" tutor (needs an API key). */
  tutorEnabled: boolean;
  /** Most tutor messages she can send per day, to keep cost predictable. */
  tutorDailyLimit: number;
  /** The app's look: clean and minimal (Studio) or dark and game-like (Night Run). */
  skin: "studio" | "night";
  /** The course new learning comes from. Reviews come from every course. */
  course: CourseId;
  /** Light or dark screen. "auto" follows the computer's own setting. */
  appearance?: "auto" | "light" | "dark";
}

/** One answered question, kept for the parent report and for reviewing how the app is working. */
export interface AttemptEvent {
  /** Time (ms since 1970). */
  t: number;
  /** Skill id, or a challenge/mission id for multi-part problems. */
  skill: string;
  level?: number;
  /** learn, review, guided, challenge, mission, placement, screener, checkpoint, … */
  mode: string;
  ok: boolean;
  assisted: boolean;
  tries: number;
  hints: number;
  secs: number;
  tutor?: boolean;
}

/** A screener practice or monthly checkpoint result. */
export interface AssessmentResult {
  id: string;
  kind: "screener-full" | "screener-quick" | "checkpoint";
  /** EOC tests: the EOC practiced (m1/m3). Checkpoints: the course checked. */
  course?: CourseId;
  date: string;
  minutes: number;
  items: { skillId: string; topic: string; ok: boolean; skipped?: boolean; prompt: string; given: string; correct: string; secs: number }[];
}

export interface TutorChat {
  id: string;
  date: string;
  skillId?: string;
  prompt: string;
  messages: { role: "student" | "tutor"; text: string }[];
}

/** Keep the attempt log from growing without limit (a few hundred KB at most). */
export const MAX_EVENTS = 4000;

export interface AppState {
  version: 1;
  createdAt: string;
  updatedAt: string;
  settings: Settings;
  skills: Record<string, SkillState>;
  /** Stars earned over all time. The spendable balance is xp − starsSpent. */
  xp: number;
  starsSpent: number;
  /** Shop items she owns (avatars, themes) and which ones are in use. */
  owned: string[];
  equipped: { avatar?: string; theme?: string };
  /** freezes: saved "streak freezes" that cover a missed day. best: longest streak. */
  streak: { count: number; lastDay?: string; freezes?: number; best?: number };
  /** Weeks (their Monday's date) in which she met her weekly goal; the bonus is paid once per week. */
  goalWeeks: string[];
  events: AttemptEvent[];
  assessments: AssessmentResult[];
  tutorChats: TutorChat[];
  badges: string[];
  mistakes: MistakeEntry[];
  explanations: Explanation[];
  sessions: SessionLog[];
  placement: Record<string, "done" | "skipped">;
  missions: Record<string, { done: boolean; date?: string; score?: number }>;
}

export const DEFAULT_MODEL = "claude-haiku-5-5";

export function today(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday of the week containing `day` (weeks run Monday–Sunday). */
export function weekStart(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; // Monday = 0
  return addDays(day, -dow);
}

/** Stars she can spend right now. */
export function starBalance(s: AppState): number {
  return Math.max(0, s.xp - (s.starsSpent ?? 0));
}

/** Add to the attempt log, dropping the oldest entries past MAX_EVENTS. */
export function logEvent(s: AppState, e: Omit<AttemptEvent, "t"> & { t?: number }) {
  s.events.push({ t: Date.now(), ...e });
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return today(new Date(y, m - 1, d + n));
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function newSkillState(): SkillState {
  return {
    level: 0,
    p: 0.15,
    difficulty: 1,
    streak: 0,
    missStreak: 0,
    recent: [],
    correctDays: [],
    attempts: 0,
    correct: 0,
    ready: false,
    interval: 0,
    whyChoice: false,
    whyWritten: "none",
    dates: {},
    lessonSeen: false,
  };
}

export function newState(): AppState {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings: { studentName: "", calculator: false, sessionLength: "standard", readAloud: false, model: DEFAULT_MODEL, targetDate: "2027-05-28", weeklyGoal: 4, tutorEnabled: true, tutorDailyLimit: 20, skin: "studio", course: "m1" },
    skills: {},
    xp: 0,
    starsSpent: 0,
    owned: [],
    equipped: {},
    streak: { count: 0, freezes: 0, best: 0 },
    goalWeeks: [],
    events: [],
    assessments: [],
    tutorChats: [],
    badges: [],
    mistakes: [],
    explanations: [],
    sessions: [],
    placement: {},
    missions: {},
  };
}

export function skillState(state: AppState, id: string): SkillState {
  return state.skills[id] ?? newSkillState();
}

// ---------- Saving, export and import ----------

const KEY = "levelup.v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    // fall through to a fresh state
  }
  return newState();
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function migrate(raw: unknown): AppState {
  const base = newState();
  const s = raw as Partial<AppState>;
  if (!s || typeof s !== "object" || s.version !== 1) throw new Error("Unrecognized save data");
  const skills: Record<string, SkillState> = {};
  for (const [id, v] of Object.entries(s.skills ?? {})) skills[id] = { ...newSkillState(), ...v };
  const settings = { ...base.settings, ...s.settings };
  if (settings.skin !== "studio" && settings.skin !== "night") settings.skin = "studio";
  return { ...base, ...s, settings, skills };
}

export interface ExportFile {
  app: "math-quest-level-up";
  exportedAt: string;
  state: AppState;
}

/** Progress file contents. The API key stays on this computer unless asked for. */
export function exportJson(state: AppState, includeKey = false): string {
  const copy: AppState = JSON.parse(JSON.stringify(state));
  if (!includeKey) delete copy.settings.apiKey;
  const file: ExportFile = { app: "math-quest-level-up", exportedAt: new Date().toISOString(), state: copy };
  return JSON.stringify(file, null, 1);
}

export function parseImport(text: string): AppState {
  const file = JSON.parse(text) as Partial<ExportFile>;
  if (file.app !== "math-quest-level-up" || !file.state) throw new Error("This doesn't look like a Level Up: Level Up progress file.");
  return migrate(file.state);
}
