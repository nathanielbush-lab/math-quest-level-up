// The weekly report in the Teacher corner: pure computation over the saved state.
// Everything here is about one Monday–Sunday week, in the computer's local time.

import { SKILL_BY_ID, SKILLS, TOPIC_BY_ID } from "../content";
import { CHALLENGES, MISSIONS } from "../content/challenges";
import { LEVEL_NAMES, addDays, daysBetween, today, weekStart, type AppState, type AssessmentResult, type AttemptEvent, type MasteryLevel, type TutorChat } from "./state";

/** How many weeks back the week picker goes (0 = this week). */
export const MAX_WEEKS_BACK = 8;

/** Rule thresholds, exported so the tests and the page agree. */
export const RULES = {
  /** Flag a skill when fewer than this share were right on the first try without help… */
  lowFirstTry: 0.5,
  /** …over at least this many questions. */
  minQuestions: 4,
  /** Average hints per question that counts as heavy hint use. */
  heavyHints: 1,
  /** A wrong answer faster than this (seconds) might be a rushed one. */
  rushSecs: 8,
  /** Rushed answers in a week before it's worth mentioning. */
  minRushed: 3,
  /** Mistakes on one skill in a week that count as "the same mistake keeps coming back". */
  repeatedMistakes: 3,
  /** Questions with the tutor in a week before it's worth a look. */
  tutorQuestions: 5,
} as const;

export interface WeekRange {
  /** Monday, yyyy-mm-dd. */
  start: string;
  /** Sunday, yyyy-mm-dd. */
  end: string;
  /** 0 = this week, 1 = last week, … */
  offset: number;
}

/** The week `offset` weeks before the one containing `now`. */
export function weekRange(offset: number, now = new Date()): WeekRange {
  const start = addDays(weekStart(today(now)), -7 * offset);
  return { start, end: addDays(start, 6), offset };
}

/** This week, last week and the weeks before it, newest first. */
export function weekOptions(now = new Date(), weeksBack = MAX_WEEKS_BACK): WeekRange[] {
  return Array.from({ length: weeksBack + 1 }, (_, i) => weekRange(i, now));
}

export function inWeek(day: string | undefined, wk: WeekRange): boolean {
  return !!day && day >= wk.start && day <= wk.end;
}

/** Local calendar day of an event timestamp. */
export function eventDay(t: number): string {
  return today(new Date(t));
}

/** Screeners, checkpoints and the starting-point check: tests, not practice. */
export function isTestMode(mode: string): boolean {
  return mode.startsWith("placement") || mode.startsWith("screener") || mode.startsWith("checkpoint");
}

/** Right on the first try, with no hint, steps or tutor. */
export function firstTry(e: AttemptEvent): boolean {
  return e.ok && e.tries === 0 && !e.assisted;
}

/** Display name and icon for an event's skill id (a skill, a challenge or a stage mission). */
export function skillLabel(id: string): { title: string; icon: string; topic?: string; kind: "skill" | "challenge" | "mission" | "other" } {
  const s = SKILL_BY_ID[id];
  if (s) {
    const t = TOPIC_BY_ID[s.topic];
    return { title: s.title, icon: t?.icon ?? "📘", topic: t?.title, kind: "skill" };
  }
  const m = MISSIONS.find((x) => x.id === id);
  if (m) return { title: `Stage challenge: ${m.title}`, icon: "🚩", kind: "mission" };
  const c = CHALLENGES.find((x) => x.id === id);
  if (c) return { title: `Challenge: ${c.title}`, icon: "🧩", kind: "challenge" };
  return { title: id, icon: "❔", kind: "other" };
}

export interface Glance {
  quests: number;
  goal: number;
  goalMet: boolean;
  sessions: number;
  minutes: number;
  /** Days with any session. */
  activeDays: number;
  answered: number;
  firstTry: number;
  /** null when no questions have detailed data. */
  firstTryPct: number | null;
  hints: number;
  /** Messages the student sent to the tutor (or questions with the tutor, when no chats were saved). */
  tutorMessages: number;
  tutorQuestions: number;
  streak: number;
  freezes: number;
  bestStreak: number;
}

export interface SkillRow {
  id: string;
  title: string;
  icon: string;
  topic?: string;
  questions: number;
  firstTry: number;
  firstTryPct: number;
  hints: number;
  hinted: number;
  avgSecs: number;
  wrong: number;
  rushed: number;
  tutor: number;
}

export interface LevelUp {
  skillId: string;
  title: string;
  icon: string;
  topic?: string;
  /** Highest level reached this week. */
  level: MasteryLevel;
  levelName: string;
  date: string;
  /** Marked as known by the starting-point check, not learned this week. */
  placed: boolean;
}

export interface Pace {
  target: string;
  daysLeft: number;
  ready: number;
  total: number;
  remaining: number;
  /** New skills a week that would cover everything by the target date. */
  needPerWeek: number;
  /** New skills a week lately (reached Practicing on their own, last few weeks). */
  recentPerWeek: number;
  weeksMeasured: number;
  status: "done" | "past" | "on-track" | "close" | "behind" | "starting";
}

export interface Example {
  prompt: string;
  given: string;
  correct: string;
}

export interface AttentionItem {
  id: string;
  icon: string;
  title: string;
  detail: string;
  suggestion: string;
  examples?: Example[];
}

export interface Win {
  icon: string;
  text: string;
}

export interface TestSummary {
  id: string;
  kind: AssessmentResult["kind"];
  label: string;
  date: string;
  right: number;
  total: number;
  skipped: number;
  pct: number;
  minutes: number;
  /** Topics with the most misses, weakest first. */
  weakest: { topic: string; title: string; icon: string; right: number; total: number }[];
  /** Change in percentage points from the previous test of the same kind. */
  change?: number;
}

export interface ExplanationRow {
  id: string;
  skillTitle: string;
  date: string;
  status: "pending" | "pass" | "revise";
  rounds: number;
  gradedBy?: "claude" | "parent";
}

export interface ChatRow extends TutorChat {
  skillTitle?: string;
  studentMessages: number;
}

export interface WeeklyReportData {
  week: WeekRange;
  isCurrent: boolean;
  /** Day the detailed per-question log starts (undefined when there's none yet). */
  eventsSince?: string;
  /** This week has questions with detailed data. */
  hasDetail: boolean;
  /** Anything at all happened this week. */
  hasActivity: boolean;
  glance: Glance;
  levelUps: LevelUp[];
  /** Skills practiced this week that are ready to build on now. */
  readyPracticed: number;
  pace: Pace;
  practiced: SkillRow[];
  attention: AttentionItem[];
  wins: Win[];
  /** Badge ids we can tell were earned this week. */
  badges: string[];
  tests: TestSummary[];
  explanations: ExplanationRow[];
  /** Explanations waiting for review right now (any week). */
  pendingExplanations: number;
  chats: ChatRow[];
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
/** Show math markup ({a/b}, **bold**) as plain text. */
export function plainMath(s: string): string {
  return s.replace(/\{([^{}/]+)\/([^{}]+)\}/g, "$1/$2").replace(/\*\*/g, "").replace(/-(?=\d)/g, "−");
}

export function skillRows(events: AttemptEvent[]): SkillRow[] {
  const by = new Map<string, AttemptEvent[]>();
  for (const e of events) by.set(e.skill, [...(by.get(e.skill) ?? []), e]);
  const rows: SkillRow[] = [];
  for (const [id, list] of by) {
    const lbl = skillLabel(id);
    const ft = list.filter(firstTry).length;
    rows.push({
      id,
      title: lbl.title,
      icon: lbl.icon,
      topic: lbl.topic,
      questions: list.length,
      firstTry: ft,
      firstTryPct: pct(ft, list.length),
      hints: list.reduce((a, e) => a + (e.hints || 0), 0),
      hinted: list.filter((e) => e.hints > 0).length,
      avgSecs: Math.round(list.reduce((a, e) => a + (e.secs || 0), 0) / list.length),
      wrong: list.filter((e) => !e.ok).length,
      rushed: list.filter((e) => !e.ok && e.secs < RULES.rushSecs).length,
      tutor: list.filter((e) => e.tutor).length,
    });
  }
  return rows.sort((a, b) => b.questions - a.questions || a.title.localeCompare(b.title));
}

const LEVEL_KEYS: [keyof AppState["skills"][string]["dates"], MasteryLevel][] = [
  ["explain", 4],
  ["independent", 3],
  ["practicing", 2],
  ["exploring", 1],
];

export function levelUps(state: AppState, wk: WeekRange): LevelUp[] {
  const out: LevelUp[] = [];
  for (const [id, ss] of Object.entries(state.skills)) {
    const hit = LEVEL_KEYS.find(([k]) => inWeek(ss.dates[k], wk));
    if (!hit) continue;
    const [key, level] = hit;
    const lbl = skillLabel(id);
    out.push({ skillId: id, title: lbl.title, icon: lbl.icon, topic: lbl.topic, level, levelName: LEVEL_NAMES[level], date: ss.dates[key]!, placed: !!ss.placed && level <= 2 });
  }
  return out.sort((a, b) => b.level - a.level || a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/** Pace toward the target date, as of `asOf` (normally today). Mirrors the Overview tab. */
export function pace(state: AppState, asOf: string): Pace {
  const total = SKILLS.length;
  const ready = SKILLS.filter((s) => state.skills[s.id]?.ready).length;
  const remaining = total - ready;
  const target = state.settings.targetDate;
  const daysLeft = daysBetween(asOf, target);
  const needPerWeek = daysLeft > 0 && remaining > 0 ? Math.ceil(remaining / Math.max(1, daysLeft / 7)) : 0;
  // Recent pace: skills that reached Practicing by solving on their own (not placed) in the last 4 weeks
  // (or since the start, if that's sooner).
  const first = [state.createdAt.slice(0, 10), ...state.sessions.map((s) => s.date)].sort()[0];
  const days = Math.max(7, Math.min(28, daysBetween(first, asOf) + 1));
  const weeksMeasured = Math.round((days / 7) * 10) / 10;
  const from = addDays(asOf, -(days - 1));
  const learned = Object.values(state.skills).filter((ss) => !ss.placed && ss.dates.practicing && ss.dates.practicing >= from && ss.dates.practicing <= asOf).length;
  const recentPerWeek = Math.round((learned / weeksMeasured) * 10) / 10;
  let status: Pace["status"];
  if (remaining <= 0) status = "done";
  else if (daysLeft <= 0) status = "past";
  else if (!learned && !state.sessions.length) status = "starting";
  else if (recentPerWeek >= needPerWeek) status = "on-track";
  else if (recentPerWeek >= needPerWeek * 0.7) status = "close";
  else status = "behind";
  return { target, daysLeft, ready, total, remaining, needPerWeek, recentPerWeek, weeksMeasured, status };
}

function testLabel(kind: AssessmentResult["kind"]): string {
  return kind === "checkpoint" ? "Monthly checkpoint" : kind === "screener-quick" ? "Screener practice (quick)" : "Screener practice (full)";
}

export function summarizeTest(a: AssessmentResult, previous?: AssessmentResult): TestSummary {
  const counted = a.items.filter((i) => !i.skipped);
  const right = a.items.filter((i) => i.ok).length;
  const total = a.items.length;
  const byTopic = new Map<string, { right: number; total: number }>();
  for (const i of a.items) {
    const t = byTopic.get(i.topic) ?? { right: 0, total: 0 };
    t.total++;
    if (i.ok) t.right++;
    byTopic.set(i.topic, t);
  }
  const weakest = [...byTopic.entries()]
    .filter(([, v]) => v.right < v.total)
    .sort((a, b) => a[1].right / a[1].total - b[1].right / b[1].total || b[1].total - a[1].total)
    .slice(0, 3)
    .map(([topic, v]) => ({ topic, title: TOPIC_BY_ID[topic]?.title ?? topic, icon: TOPIC_BY_ID[topic]?.icon ?? "📘", ...v }));
  const out: TestSummary = { id: a.id, kind: a.kind, label: testLabel(a.kind), date: a.date, right, total, skipped: total - counted.length, pct: pct(right, total), minutes: a.minutes, weakest };
  if (previous && previous.items.length) out.change = out.pct - pct(previous.items.filter((i) => i.ok).length, previous.items.length);
  return out;
}

/** Badges whose earning moment we can date to this week (most have no saved date). */
export function badgesThisWeek(state: AppState, wk: WeekRange): string[] {
  const out: string[] = [];
  const nth = (dates: (string | undefined)[], n: number) => dates.filter((d): d is string => !!d).sort()[n - 1];
  const check = (id: string, day: string | undefined) => {
    if (state.badges.includes(id) && inWeek(day, wk)) out.push(id);
  };
  const skills = Object.values(state.skills);
  const indep = skills.map((s) => s.dates.independent);
  const explain = skills.map((s) => s.dates.explain);
  check("independent-1", nth(indep, 1));
  check("independent-10", nth(indep, 10));
  check("independent-25", nth(indep, 25));
  check("explainer", nth(explain, 1));
  check("explainer-5", nth(explain, 5));
  check("goal-1", nth(state.goalWeeks, 1));
  check("goal-4", nth(state.goalWeeks, 4));
  check("screener-1", nth(state.assessments.filter((a) => a.kind !== "checkpoint").map((a) => a.date), 1));
  check("checkpoint-3", nth(state.assessments.filter((a) => a.kind === "checkpoint").map((a) => a.date), 3));
  return out;
}

const LOW_TIPS: ((title: string, hasExamples: boolean) => string)[] = [
  (_t, ex) => `${ex ? "Pick one of the misses below" : "Pick one of these together"} and ask the student to explain how they got their answer, step by step, before showing the correct one. Hearing their thinking usually shows exactly where the idea breaks down.`,
  (t, ex) => `Ask the student to draw a quick picture or model for ${ex ? "one of the misses below" : `one “${t}” question`}, then solve it again. Seeing it often makes the rule make sense.`,
  (_t, ex) => `Try one together where you are the student and make the same slip${ex ? " as below" : ""}. Let them find and fix your mistake; explaining it to you builds confidence.`,
];

function attentionItems(state: AppState, wk: WeekRange, practice: AttemptEvent[], rows: SkillRow[], chats: ChatRow[]): AttentionItem[] {
  const out: AttentionItem[] = [];
  const weekMistakes = state.mistakes.filter((m) => inWeek(m.date, wk));
  const mistakesFor = (id: string) => weekMistakes.filter((m) => m.skillId === id);
  const examplesFor = (id: string): Example[] =>
    mistakesFor(id)
      .slice(-2)
      .reverse()
      .map((m) => ({ prompt: plainMath(m.prompt), given: plainMath(m.given), correct: plainMath(m.correct) }));
  const skillRowsOnly = rows.filter((r) => SKILL_BY_ID[r.id]);
  const flagged = new Set<string>();

  // 1. Low first-try rate on a skill.
  for (const r of skillRowsOnly) {
    if (r.questions < RULES.minQuestions || r.firstTry / r.questions >= RULES.lowFirstTry) continue;
    flagged.add(r.id);
    const ex = examplesFor(r.id);
    out.push({
      id: `low-${r.id}`,
      icon: "🧩",
      title: `${r.title}: still settling in`,
      detail: `${r.firstTry} of ${r.questions} right on the first try without help (${r.firstTryPct}%).${ex.length ? " Recent misses are below." : ""}`,
      suggestion: LOW_TIPS[out.length % LOW_TIPS.length](r.title, ex.length > 0),
      examples: ex.length ? ex : undefined,
    });
  }

  // 2. The same skill kept showing up in the mistake journal.
  for (const id of new Set(weekMistakes.map((m) => m.skillId))) {
    if (flagged.has(id) || !SKILL_BY_ID[id]) continue;
    const list = mistakesFor(id);
    if (list.length < RULES.repeatedMistakes) continue;
    flagged.add(id);
    out.push({
      id: `repeat-${id}`,
      icon: "🔁",
      title: `${skillLabel(id).title}: the same kind of mistake came back`,
      detail: `${plural(list.length, "mistake")} on this skill this week${list.some((m) => m.resolved) ? `, ${list.filter((m) => m.resolved).length} already fixed` : ""}.`,
      suggestion: `Look at one of these together and ask the student to find the slip themselves (“Where would you check first?”). Spotting their own mistake sticks better than being told.`,
      examples: examplesFor(id),
    });
  }

  // 3. Heavy hint use.
  const hinty = skillRowsOnly.filter((r) => r.questions >= RULES.minQuestions && r.hints / r.questions >= RULES.heavyHints);
  if (hinty.length) {
    const names = hinty.slice(0, 3).map((r) => `${r.title} (${plural(r.hints, "hint")} on ${plural(r.questions, "question")})`);
    out.push({
      id: "hints",
      icon: "💡",
      title: "Leaning on hints",
      detail: `Hints came up on most questions in ${names.join("; ")}.`,
      suggestion: `Hints are there to help, so this isn't a problem by itself. Before the next hint, try asking “What could you try first?” and wait a moment. Even a rough first step builds independence.`,
    });
  }

  // 4. Fast wrong answers (possible rushing).
  const rushed = practice.filter((e) => !e.ok && e.secs < RULES.rushSecs);
  if (rushed.length >= RULES.minRushed) {
    const where = [...new Set(rushed.map((e) => skillLabel(e.skill).title))].slice(0, 3);
    out.push({
      id: "rushing",
      icon: "⏱️",
      title: "Some answers may have been rushed",
      detail: `${plural(rushed.length, "wrong answer")} came in under ${RULES.rushSecs} seconds (${where.join(", ")}).`,
      suggestion: `Try an “estimate first” habit: before typing, say roughly what the answer should be, then check the answer against it. Shorter sessions can also help if energy is low.`,
    });
  }

  // 5. Lots of tutor help.
  const tutorQs = practice.filter((e) => e.tutor).length;
  if (tutorQs >= RULES.tutorQuestions) {
    const top = rows.filter((r) => r.tutor).sort((a, b) => b.tutor - a.tutor)[0];
    out.push({
      id: "tutor",
      icon: "🤖",
      title: "Used the tutor often",
      detail: `The “I'm stuck” tutor helped on ${plural(tutorQs, "question")}${top ? `, most often in ${top.title}` : ""}.`,
      suggestion: chats.length
        ? `Skim the tutor chats at the end of this report. The student's own words there are a good window into what feels confusing.`
        : `Ask the student which questions felt confusing and work through one together.`,
    });
  }

  // 6. Explanations waiting for a teacher or parent.
  // Waiting right now, among those submitted by the end of this week.
  const pending = state.explanations.filter((e) => e.status === "pending" && e.date <= wk.end);
  if (pending.length) {
    out.push({
      id: "pending-explanations",
      icon: "✍️",
      title: `${plural(pending.length, "written explanation")} waiting for review`,
      detail: `Skills: ${[...new Set(pending.map((e) => skillLabel(e.skillId).title))].slice(0, 4).join(", ")}.`,
      suggestion: `Open the Explanations tab to mark them. Reading one aloud together and asking “How would you explain this to a younger student?” is a great conversation starter.`,
    });
  }

  // 7. A finished week with fewer quests than the goal (never shamed, just noted).
  const weekSessions = state.sessions.filter((s) => inWeek(s.date, wk));
  const sessionsInWeek = weekSessions.length;
  const quests = new Set(weekSessions.filter((s) => s.kind === "daily").map((s) => s.date)).size;
  if (wk.offset > 0 && quests < state.settings.weeklyGoal && !state.goalWeeks.includes(wk.start) && sessionsInWeek > 0) {
    out.push({
      id: "quiet-week",
      icon: "📅",
      title: "A lighter week",
      detail: `${plural(quests, "daily quest")} of the ${state.settings.weeklyGoal} planned.`,
      suggestion: `Busy weeks happen. Picking set days and a regular time (for example, right after a snack) makes it easier to keep going; short sessions count too.`,
    });
  }
  return out;
}

function winsFor(g: Glance, ups: LevelUp[], practice: AttemptEvent[], tests: TestSummary[], explanations: ExplanationRow[], isCurrent: boolean): Win[] {
  const out: Win[] = [];
  if (g.goalMet) out.push({ icon: "🎯", text: g.quests >= g.goal ? `Met the weekly goal: ${g.quests} of ${g.goal} daily quests.` : "Met the weekly goal." });
  const learned = ups.filter((u) => !u.placed);
  const atLeast = (lv: number) => learned.filter((u) => u.level >= lv);
  if (atLeast(4).length) out.push({ icon: "🎤", text: `Can now explain and apply ${atLeast(4).map((u) => u.title).join(", ")}.` });
  const indep = learned.filter((u) => u.level === 3);
  if (indep.length) out.push({ icon: "🦉", text: `Reached Independent (still right on a later day) in ${plural(indep.length, "skill")}.` });
  const practicing = learned.filter((u) => u.level === 2);
  if (practicing.length) out.push({ icon: "🌱", text: `Started solving ${plural(practicing.length, "new skill")} without help.` });
  if (g.answered >= 15 && g.firstTryPct !== null && g.firstTryPct >= 80) out.push({ icon: "💪", text: `${g.firstTryPct}% right on the first try without help over ${g.answered} questions.` });
  const reviews = practice.filter((e) => e.mode === "review" && firstTry(e)).length;
  if (reviews >= 3) out.push({ icon: "🧠", text: `Remembered ${reviews} review questions from earlier lessons.` });
  const fixed = practice.filter((e) => e.mode === "mistake" && e.ok).length;
  if (fixed) out.push({ icon: "🛠️", text: `Fixed ${plural(fixed, "old mistake")} from the mistake journal.` });
  const passed = explanations.filter((e) => e.status === "pass");
  if (passed.length) out.push({ icon: "✍️", text: `Wrote ${plural(passed.length, "explanation")} that ${passed.length === 1 ? "was" : "were"} marked “got it”.` });
  for (const t of tests) if ((t.change ?? 0) > 0) out.push({ icon: "📈", text: `${t.label}: up ${t.change} points from last time (${t.pct}%).` });
  if (isCurrent && g.streak >= 3) out.push({ icon: "🔥", text: `A ${g.streak}-day streak${g.streak >= g.bestStreak && g.streak > 3 ? " (a new best!)" : ""}.` });
  else if (g.activeDays >= 5) out.push({ icon: "🔥", text: `Practiced on ${g.activeDays} days this week.` });
  return out;
}

export function buildReport(state: AppState, offset = 0, now = new Date()): WeeklyReportData {
  const wk = weekRange(offset, now);
  const day = today(now);
  const isCurrent = offset === 0;
  const events = state.events.filter((e) => inWeek(eventDay(e.t), wk));
  const practice = events.filter((e) => !isTestMode(e.mode));
  const sessions = state.sessions.filter((s) => inWeek(s.date, wk));
  const chats: ChatRow[] = state.tutorChats
    .filter((c) => inWeek(c.date, wk))
    .map((c) => ({ ...c, skillTitle: c.skillId ? skillLabel(c.skillId).title : undefined, studentMessages: c.messages.filter((m) => m.role === "student").length }));

  const quests = new Set(sessions.filter((s) => s.kind === "daily").map((s) => s.date)).size;
  const goal = state.settings.weeklyGoal;
  const ft = events.filter(firstTry).length;
  const tutorQuestions = events.filter((e) => e.tutor).length;
  const chatMessages = chats.reduce((a, c) => a + c.studentMessages, 0);
  const answeredFromSessions = sessions.reduce((a, s) => a + s.answered, 0);
  const glance: Glance = {
    quests,
    goal,
    goalMet: quests >= goal || state.goalWeeks.includes(wk.start),
    sessions: sessions.length,
    minutes: sessions.reduce((a, s) => a + s.minutes, 0),
    activeDays: new Set(sessions.map((s) => s.date)).size,
    answered: events.length || answeredFromSessions,
    firstTry: ft,
    firstTryPct: events.length ? pct(ft, events.length) : null,
    hints: events.reduce((a, e) => a + (e.hints || 0), 0),
    tutorMessages: chatMessages || tutorQuestions,
    tutorQuestions,
    streak: state.streak.count,
    freezes: state.streak.freezes ?? 0,
    bestStreak: state.streak.best ?? state.streak.count,
  };

  const ups = levelUps(state, wk);
  const rows = skillRows(practice);
  const readyPracticed = rows.filter((r) => state.skills[r.id]?.ready).length;
  const sortedTests = [...state.assessments].sort((a, b) => a.date.localeCompare(b.date));
  const tests = sortedTests
    .filter((a) => inWeek(a.date, wk))
    .map((a) => {
      const i = sortedTests.indexOf(a);
      const prev = sortedTests.slice(0, i).reverse().find((x) => x.kind === a.kind);
      return summarizeTest(a, prev);
    });
  const explanations: ExplanationRow[] = state.explanations
    .filter((e) => inWeek(e.date, wk))
    .map((e) => ({ id: e.id, skillTitle: skillLabel(e.skillId).title, date: e.date, status: e.status, rounds: Math.max(1, e.rounds?.length ?? 1), gradedBy: e.gradedBy }));

  const eventsSince = state.events.length ? eventDay(Math.min(...state.events.map((e) => e.t))) : undefined;
  return {
    week: wk,
    isCurrent,
    eventsSince,
    hasDetail: events.length > 0,
    hasActivity: events.length > 0 || sessions.length > 0 || ups.length > 0 || tests.length > 0 || explanations.length > 0 || chats.length > 0,
    glance,
    levelUps: ups,
    readyPracticed,
    pace: pace(state, day),
    practiced: rows,
    attention: attentionItems(state, wk, practice, rows, chats),
    wins: winsFor(glance, ups, practice, tests, explanations, isCurrent),
    badges: badgesThisWeek(state, wk),
    tests,
    explanations,
    pendingExplanations: state.explanations.filter((e) => e.status === "pending").length,
    chats,
  };
}

/** Aggregated numbers only (no names, no student writing) for the optional Claude summary. */
export interface ReportStats {
  week: string;
  weeklyGoal: number;
  quests: number;
  goalMet: boolean;
  minutes: number;
  questionsAnswered: number;
  firstTryPercent: number | null;
  hintsUsed: number;
  tutorQuestions: number;
  streakDays: number;
  newLevels: { skill: string; topic?: string; level: string }[];
  skillsPracticed: { skill: string; questions: number; firstTryPercent: number; hints: number; avgSeconds: number }[];
  thingsToWatch: string[];
  wins: string[];
  tests: { name: string; percent: number; changeFromLastTime?: number; weakestTopics: string[] }[];
  explanations: { skill: string; status: string; drafts: number }[];
  pace: { skillsReady: number; totalSkills: number; daysToTarget: number; neededPerWeek: number; recentPerWeek: number; status: string };
}

export function reportStats(r: WeeklyReportData): ReportStats {
  return {
    week: `${r.week.start} to ${r.week.end}`,
    weeklyGoal: r.glance.goal,
    quests: r.glance.quests,
    goalMet: r.glance.goalMet,
    minutes: r.glance.minutes,
    questionsAnswered: r.glance.answered,
    firstTryPercent: r.glance.firstTryPct,
    hintsUsed: r.glance.hints,
    tutorQuestions: r.glance.tutorQuestions,
    streakDays: r.isCurrent ? r.glance.streak : 0,
    newLevels: r.levelUps.filter((u) => !u.placed).map((u) => ({ skill: u.title, topic: u.topic, level: u.levelName })),
    skillsPracticed: r.practiced.slice(0, 12).map((s) => ({ skill: s.title, questions: s.questions, firstTryPercent: s.firstTryPct, hints: s.hints, avgSeconds: s.avgSecs })),
    thingsToWatch: r.attention.map((a) => `${a.title}: ${a.detail}`),
    wins: r.wins.map((w) => w.text),
    tests: r.tests.map((t) => ({ name: t.label, percent: t.pct, changeFromLastTime: t.change, weakestTopics: t.weakest.map((w) => w.title) })),
    explanations: r.explanations.map((e) => ({ skill: e.skillTitle, status: e.status, drafts: e.rounds })),
    pace: { skillsReady: r.pace.ready, totalSkills: r.pace.total, daysToTarget: r.pace.daysLeft, neededPerWeek: r.pace.needPerWeek, recentPerWeek: r.pace.recentPerWeek, status: r.pace.status },
  };
}
