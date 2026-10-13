import { prettyExpr } from "../lib/expr";
// EOC practice tests and monthly checkpoints: picking questions, scoring, saving.
// Pure logic (no React) so it can be unit-tested.
import { SKILL_BY_ID, TOPICS, TOPIC_BY_ID, skillsInTopic } from "../content";
import type { CourseId, Level, Problem, Skill, Topic } from "../content/types";
import { makeRng, type Rng } from "../lib/rng";
import { answerText, check, type Response } from "./check";
import { addDays, daysBetween, logEvent, today, type AppState, type AssessmentResult, type MistakeEntry } from "./state";

export type AssessKind = "screener-full" | "screener-quick" | "checkpoint";

export const ASSESS_SPEC: Record<AssessKind, { count: number; minutes: number; title: string; icon: string }> = {
  "screener-full": { count: 50, minutes: 180, title: "Full EOC practice", icon: "📝" },
  "screener-quick": { count: 20, minutes: 70, title: "Quick EOC practice", icon: "⚡" },
  checkpoint: { count: 0, minutes: 0, title: "Monthly checkpoint", icon: "📅" },
};

/** Days between checkpoints. */
export const CHECKPOINT_DAYS = 28;

/** One question on a test. The seed and level re-create the same problem every time it's shown. */
export interface TestItem {
  skillId: string;
  topic: string;
  seed: number;
  level: Level;
  /** Part of Math 1's calculator-off section. */
  noCalc?: boolean;
}

/** How she answered one question while taking the test. */
export interface ItemAnswer {
  response: Response | null;
  flagged: boolean;
  /** Seconds spent on this question's screen (all visits added up). */
  secs: number;
}

export function problemFor(item: TestItem): Problem {
  return SKILL_BY_ID[item.skillId].generate(makeRng(item.seed), item.level);
}

// ---------- Picking questions ----------

const seen = (state: AppState, id: string) => (state.skills[id]?.attempts ?? 0) > 0;

/** Weighted pick without replacement. Returns the index. */
function weightedIndex(rng: Rng, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/**
 * Pick `count` skills from a topic: different skills where possible, leaning toward ones she
 * has practiced (weight 3) but still including new ones (weight 1) — real tests don't wait.
 */
function pickSkills(state: AppState, topic: Topic, count: number, rng: Rng, used: Set<string>): Skill[] {
  const out: Skill[] = [];
  const all = skillsInTopic(topic.id);
  for (let k = 0; k < count; k++) {
    let pool = all.filter((s) => !used.has(s.id));
    if (!pool.length) pool = all; // more slots than skills: repeat (with a different seed)
    const s = pool[weightedIndex(rng, pool.map((x) => (seen(state, x.id) ? 3 : 1)))];
    used.add(s.id);
    out.push(s);
  }
  return out;
}

/** Roughly 30% of questions at level 3, the rest at level 2. */
function assignLevels(items: TestItem[], rng: Rng) {
  const hard = Math.round(items.length * 0.3);
  const order = rng.shuffle(items.map((_, i) => i));
  order.forEach((idx, k) => (items[idx].level = k < hard ? 3 : 2));
}

const newSeed = (rng: Rng) => rng.int(1, 2 ** 31 - 1);

/** EOC domains: Number & Quantity with Algebra, Functions, Geometry, Statistics & Probability. */
export type Domain = "NA" | "F" | "G" | "S";

/** NC test-specification weights (midpoints of the published ranges). */
export const EOC_WEIGHTS: Record<"m1" | "m3", Record<Domain, number>> = {
  m1: { NA: 0.38, F: 0.34, G: 0.1, S: 0.18 },
  m3: { NA: 0.34, F: 0.34, G: 0.22, S: 0.1 },
};

/** Math 1's EOC opens with a short section where calculators are off. */
export const NO_CALC_SHARE = 15 / 50;

/** The EOC a course practices for: its own (Math 1, Math 3) or the nearest one. */
export function eocCourseFor(course: CourseId): "m1" | "m3" {
  return course === "m1" || course === "m2" ? "m1" : "m3";
}

/** Domain of a skill from its first standard code ("NC.M1.A-SSE.1a" → NA). */
export function domainOf(skill: Skill): Domain {
  const code = skill.standards[0] ?? "";
  const m = /NC\.M\d\.([A-Z])-/.exec(code);
  const d = m?.[1] ?? "A";
  return d === "F" ? "F" : d === "G" ? "G" : d === "S" ? "S" : "NA";
}

/** How many questions come from each domain, following the blueprint. */
export function domainQuotas(course: "m1" | "m3", n: number, available: Record<Domain, number>): Record<Domain, number> {
  const w = EOC_WEIGHTS[course];
  const doms = (Object.keys(w) as Domain[]).filter((d) => available[d] > 0);
  const total = doms.reduce((a, d) => a + w[d], 0);
  const q = { NA: 0, F: 0, G: 0, S: 0 } as Record<Domain, number>;
  let used = 0;
  for (const d of doms) { q[d] = Math.floor((n * w[d]) / total); used += q[d]; }
  // Hand out the remainder by largest fractional part.
  const rest = doms.map((d) => [d, (n * w[d]) / total - q[d]] as const).sort((a, b) => b[1] - a[1]);
  for (let k = 0; used < n && rest.length; k++, used++) q[rest[k % rest.length][0]]++;
  return q;
}

/** Questions for an EOC-style practice test, weighted by domain, spread across units, shuffled. */
export function pickScreenerItems(state: AppState, kind: "screener-full" | "screener-quick", seed: number, course: "m1" | "m3" = eocCourseFor(state.settings.course ?? "m1")): TestItem[] {
  const rng = makeRng(seed);
  const n = ASSESS_SPEC[kind].count;
  const skills = TOPICS.filter((t) => t.course === course).flatMap((t) => skillsInTopic(t.id));
  const byDomain = { NA: [], F: [], G: [], S: [] } as Record<Domain, Skill[]>;
  for (const s of skills) byDomain[domainOf(s)].push(s);
  const quotas = domainQuotas(course, n, { NA: byDomain.NA.length, F: byDomain.F.length, G: byDomain.G.length, S: byDomain.S.length });
  const out: TestItem[] = [];
  for (const d of Object.keys(quotas) as Domain[]) {
    const used = new Set<string>();
    const topicsUsed = new Map<string, number>();
    for (let k = 0; k < quotas[d]; k++) {
      let pool = byDomain[d].filter((s) => !used.has(s.id));
      if (!pool.length) { used.clear(); pool = byDomain[d]; }
      // Prefer practiced skills and units not used much yet.
      const weights = pool.map((s) => (seen(state, s.id) ? 3 : 1) / (1 + (topicsUsed.get(s.topic) ?? 0)));
      const s = pool[weightedIndex(rng, weights)];
      used.add(s.id);
      topicsUsed.set(s.topic, (topicsUsed.get(s.topic) ?? 0) + 1);
      out.push({ skillId: s.id, topic: s.topic, seed: newSeed(rng), level: 2 });
    }
  }
  const items = rng.shuffle(out);
  assignLevels(items, rng);
  if (course === "m1") {
    const k = Math.round(items.length * NO_CALC_SHARE);
    items.forEach((it, idx) => { if (idx < k) it.noCalc = true; });
  }
  return items;
}

/** One level-2 question from every unit of the current course, in unit order. */
export function pickCheckpointItems(state: AppState, seed: number): TestItem[] {
  const rng = makeRng(seed);
  const used = new Set<string>();
  const course = state.settings.course ?? "m1";
  return TOPICS.filter((t) => t.course === course).map((t) => {
    const [s] = pickSkills(state, t, 1, rng, used);
    return { skillId: s.id, topic: t.id, seed: newSeed(rng), level: 2 as Level };
  });
}

export function pickItems(state: AppState, kind: AssessKind, seed: number): TestItem[] {
  return kind === "checkpoint" ? pickCheckpointItems(state, seed) : pickScreenerItems(state, kind, seed);
}

// ---------- Answers ----------

const minus = (t: string) => t.trim().replace(/^-/, "−");

/** Her answer as text (for the results page and the mistake journal). */
export function describeResponse(problem: Problem, r: Response): string {
  switch (r.kind) {
    case "number":
      return minus(r.text);
    case "multi":
      return r.texts.map(minus).join(" , ");
    case "choice":
      return problem.answer.kind === "choice" ? problem.answer.choices[r.index] : String(r.index);
    case "expr":
      return prettyExpr(r.text);
    case "point":
      return `(${r.x}, ${r.y})`.replace(/-/g, "−");
  }
}

/** True when the response can't be read as an answer at all (an unreadable number), so it isn't saved. */
export function unreadable(problem: Problem, r: Response): string | null {
  const v = check(problem, r);
  return v.verdict === "invalid" ? v.message ?? "I couldn't read that. Try a number like 12, −3, 0.75 or 3/4." : null;
}

export interface ScoredItem {
  item: TestItem;
  problem: Problem;
  ok: boolean;
  skipped: boolean;
  given: string;
  correct: string;
  secs: number;
  flagged: boolean;
}

/**
 * Mark every question. "Almost" (right amount, not in simplest form when simplest form was asked)
 * counts as a miss, as it would on a real test.
 */
export function scoreTest(items: TestItem[], answers: ItemAnswer[]): ScoredItem[] {
  return items.map((item, i) => {
    const problem = problemFor(item);
    const a = answers[i] ?? { response: null, flagged: false, secs: 0 };
    const correct = answerText(problem.answer);
    if (!a.response) return { item, problem, ok: false, skipped: true, given: "", correct, secs: Math.round(a.secs), flagged: a.flagged };
    const ok = check(problem, a.response).verdict === "correct";
    return { item, problem, ok, skipped: false, given: describeResponse(problem, a.response), correct, secs: Math.round(a.secs), flagged: a.flagged };
  });
}

// ---------- Saving ----------

export const STARS_PER_CORRECT = 5;
export const FINISH_BONUS = 20;

/** Same shape as the session's mistake-journal entries, so missed test questions come back later with fresh numbers. */
export function mistakeEntry(skillId: string, level: Level, prompt: string, given: string, correct: string, day = today()): MistakeEntry {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    skillId,
    level,
    prompt,
    given,
    correct,
    date: day,
    resolved: false,
  };
}

/**
 * Save a finished test: the result, one attempt event per answered question, missed questions in
 * the mistake journal, and stars. Mastery levels are deliberately NOT changed: a test is a snapshot
 * taken without hints or feedback (and with skills she may not have learned yet), not practice, so
 * it shouldn't push skills up or down. Practice sessions do that.
 * Returns the saved result and the stars earned.
 */
export function saveTest(s: AppState, kind: AssessKind, scored: ScoredItem[], secsUsed: number, now = new Date()): { result: AssessmentResult; stars: number } {
  const day = today(now);
  const result: AssessmentResult = {
    id: `${kind}-${now.getTime().toString(36)}`,
    kind,
    course: kind === "checkpoint" ? s.settings.course ?? "m1" : TOPIC_BY_ID[scored[0]?.item.topic]?.course === "m3" ? "m3" : "m1",
    date: day,
    minutes: Math.max(1, Math.round(secsUsed / 60)),
    items: scored.map((x) => ({
      skillId: x.item.skillId,
      topic: x.item.topic,
      ok: x.ok,
      ...(x.skipped ? { skipped: true } : {}),
      prompt: x.problem.prompt,
      given: x.given,
      correct: x.correct,
      secs: x.secs,
    })),
  };
  s.assessments.push(result);
  const mode = kind === "checkpoint" ? "checkpoint" : "screener";
  for (const x of scored) {
    // Unanswered questions aren't logged: she didn't try them, so they say nothing about the skill.
    if (x.skipped) continue;
    logEvent(s, { t: now.getTime(), skill: x.item.skillId, level: x.item.level, mode, ok: x.ok, assisted: false, tries: 0, hints: 0, secs: x.secs });
    if (!x.ok && !s.mistakes.some((m) => !m.resolved && m.skillId === x.item.skillId && m.level === x.item.level)) {
      s.mistakes = [...s.mistakes, mistakeEntry(x.item.skillId, x.item.level, x.problem.prompt, x.given, x.correct, day)].slice(-200);
    }
  }
  const stars = scored.filter((x) => x.ok).length * STARS_PER_CORRECT + FINISH_BONUS;
  s.xp += stars;
  return { result, stars };
}

// ---------- Readiness and comparisons ----------

export type BandId = "ready" | "close" | "building";

export function readinessBand(pct: number): { id: BandId; label: string; text: string } {
  if (pct >= 80) return { id: "ready", label: "Looking ready", text: "You handled most of these on your own. Keep your skills fresh with your daily quests." };
  if (pct >= 60) return { id: "close", label: "Getting close", text: "You know a lot of this already. A little more practice on the topics below will help." };
  return { id: "building", label: "Keep building", text: "That's what practice is for! Every question you missed shows you what to work on next." };
}

export function scoreOf(r: AssessmentResult): { right: number; total: number; pct: number } {
  const right = r.items.filter((i) => i.ok).length;
  const total = r.items.length;
  return { right, total, pct: total ? Math.round((right / total) * 100) : 0 };
}

export interface TopicScore {
  topic: Topic;
  right: number;
  total: number;
}

/** Right/total per topic, in map order. */
export function topicScores(items: { topic: string; ok: boolean }[]): TopicScore[] {
  return TOPICS.filter((t) => items.some((i) => i.topic === t.id)).map((t) => {
    const mine = items.filter((i) => i.topic === t.id);
    return { topic: t, right: mine.filter((i) => i.ok).length, total: mine.length };
  });
}

/**
 * Strongest and weakest topics: the topics tied for the best share right (if above 0) and those
 * tied for the lowest (if below 100%), at most `max` each. Ties go to topics with more questions,
 * then map order. Both are empty when every topic scored the same.
 */
export function strongWeak(items: { topic: string; ok: boolean }[], max = 3): { strongest: TopicScore[]; weakest: TopicScore[] } {
  const ts = topicScores(items);
  const rate = (t: TopicScore) => t.right / t.total;
  const rates = ts.map(rate);
  const hi = Math.max(...rates), lo = Math.min(...rates);
  if (ts.length < 2 || hi === lo) return { strongest: [], weakest: [] };
  const byTotal = (a: TopicScore, b: TopicScore) => b.total - a.total;
  return {
    strongest: hi > 0 ? ts.filter((t) => rate(t) === hi).sort(byTotal).slice(0, max) : [],
    weakest: lo < 1 ? ts.filter((t) => rate(t) === lo).sort(byTotal).slice(0, max) : [],
  };
}

export type Change = "up" | "down" | "same";

/** Per-topic changes since the previous checkpoint, plus overall scores. */
export function compareCheckpoints(prev: AssessmentResult | undefined, cur: AssessmentResult): { before?: number; after: number; total: number; topics: Record<string, Change> } {
  const after = cur.items.filter((i) => i.ok).length;
  if (!prev) return { after, total: cur.items.length, topics: {} };
  const topics: Record<string, Change> = {};
  for (const it of cur.items) {
    const was = prev.items.find((p) => p.topic === it.topic);
    if (!was) continue;
    topics[it.topic] = it.ok === was.ok ? "same" : it.ok ? "up" : "down";
  }
  return { before: prev.items.filter((i) => i.ok).length, after, total: cur.items.length, topics };
}

// ---------- When is the checkpoint due? ----------

export function checkpoints(s: AppState): AssessmentResult[] {
  return s.assessments.filter((a) => a.kind === "checkpoint");
}

export function lastCheckpoint(s: AppState): AssessmentResult | undefined {
  const all = checkpoints(s);
  return all[all.length - 1];
}

/** She's done enough to make a checkpoint fair: 3 practice sessions, or a starting-point check. */
export function checkpointEligible(s: AppState): boolean {
  return s.sessions.length >= 3 || Object.values(s.placement).some((v) => v === "done");
}

/** Due when there's no checkpoint in the last 28 days and she's past day one. */
export function checkpointDue(s: AppState, day = today()): boolean {
  const last = lastCheckpoint(s);
  if (last && daysBetween(last.date, day) < CHECKPOINT_DAYS) return false;
  return checkpointEligible(s);
}

/** The day the next checkpoint opens (undefined before the first one: it opens once she's eligible). */
export function nextCheckpointDate(s: AppState): string | undefined {
  const last = lastCheckpoint(s);
  return last ? addDays(last.date, CHECKPOINT_DAYS) : undefined;
}

// ---------- Timer ----------

/** Seconds left on the clock (never below 0). */
export function secondsLeft(limitSecs: number, startedAt: number, now: number): number {
  return Math.max(0, Math.ceil(limitSecs - (now - startedAt) / 1000));
}

export const WARN_SECS = 5 * 60;

export function fmtClock(secs: number): string {
  const s = Math.max(0, Math.round(secs));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function topicTitle(id: string): string {
  return TOPIC_BY_ID[id]?.title ?? id;
}
