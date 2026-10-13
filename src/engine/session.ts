import { CHALLENGES } from "../content/challenges";
import { ORDERED, SKILL_BY_ID, TOPIC_BY_ID } from "../content";
import type { Level, Skill, Strand } from "../content/types";
import { randomSeed } from "../lib/rng";
import { recordAttempt, type AttemptOutcome } from "./mastery";
import { newSkillState, skillState, today, type AppState, type AttemptMode, type MistakeEntry } from "./state";

export type Item =
  | { kind: "message"; title: string; text: string; tone: "info" | "celebrate" | "stepback" }
  | { kind: "lesson"; skillId: string; recap: boolean }
  | { kind: "worked"; skillId: string; seed: number; level: Level }
  | { kind: "problem"; skillId: string; seed: number; level: Level; mode: AttemptMode; guided: boolean; mistakeId?: string }
  | { kind: "why"; skillId: string }
  | { kind: "explain"; skillId: string }
  | { kind: "challenge"; challengeId: string; seed: number }
  | { kind: "done" };

export type SessionType = "daily" | "topic" | "mistakes";
export type Phase = "warmup" | "learn" | "challenge" | "done";

export interface SessionCtx {
  type: SessionType;
  phase: Phase;
  startedAt: number;
  answered: number;
  correct: number;
  warmup: { skillId: string; mistakeId?: string; mode: AttemptMode }[];
  warmupTotal: number;
  focus: string | null;
  focusCount: number;
  stack: string[];
  probes: string[];
  stepBackFrom: string | null;
  lessonShown: string[];
  workedShown: string[];
  guidedPending: string | null;
  learnAnswered: number;
  focusesDone: string[];
  touched: string[];
  challengeDone: boolean;
  explainDone: boolean;
  forcedSkill?: string;
  /** Messages waiting to be shown before the next item. */
  queue: Item[];
  /** How each answered question went, for the progress dots (ok = right first time without help). */
  marks?: ("ok" | "help" | "miss")[];
  /** Last challenge id used, so the next session picks a different one. */
  lastChallenge?: string;
}

export const LIMITS = {
  short: { warmup: 3, learn: 8, minutes: 12 },
  standard: { warmup: 5, learn: 14, minutes: 20 },
};

const strandOf = (s: Skill): Strand => TOPIC_BY_ID[s.topic].strand;
const courseOf = (s: Skill) => TOPIC_BY_ID[s.topic].course;

export function dueReviews(state: AppState, day = today()): string[] {
  return ORDERED.filter((s) => {
    const ss = state.skills[s.id];
    return ss?.nextReview && ss.nextReview <= day;
  })
    .sort((a, b) => {
      const A = state.skills[a.id]!, B = state.skills[b.id]!;
      if (!!A.reviewMiss !== !!B.reviewMiss) return A.reviewMiss ? -1 : 1;
      return (A.nextReview ?? "").localeCompare(B.nextReview ?? "");
    })
    .map((s) => s.id);
}

/** Skills she's ready to learn next: every prerequisite is solid, the skill itself isn't yet. */
export function frontier(state: AppState): Skill[] {
  return ORDERED.filter((s) => !skillState(state, s.id).ready && s.prereqs.every((p) => skillState(state, p).ready));
}

export function pickFocus(state: AppState, ctx: Pick<SessionCtx, "focusesDone">, opts: { strand?: Strand; topic?: string } = {}): Skill | null {
  let list = frontier(state).filter((s) => !ctx.focusesDone.includes(s.id));
  // New learning stays in the course the student picked; reviews still come from every course.
  if (opts.topic) list = list.filter((s) => s.topic === opts.topic);
  else list = list.filter((s) => courseOf(s) === (state.settings.course ?? "m1"));
  if (!list.length) return null;
  const preferred = opts.strand ? list.filter((s) => strandOf(s) === opts.strand) : list;
  const pool = preferred.length ? preferred : list;
  // Keep going with something already started before opening something new.
  const started = pool.filter((s) => (state.skills[s.id]?.attempts ?? 0) > 0);
  return (started.length ? started : pool)[0];
}

export function startSession(state: AppState, type: SessionType, opts: { skillId?: string; lastChallenge?: string } = {}): SessionCtx {
  const lim = LIMITS[state.settings.sessionLength];
  const ctx: SessionCtx = {
    type,
    phase: type === "daily" ? "warmup" : type === "mistakes" ? "warmup" : "learn",
    startedAt: Date.now(),
    answered: 0,
    correct: 0,
    warmup: [],
    warmupTotal: 0,
    focus: opts.skillId ?? null,
    focusCount: 0,
    stack: [],
    probes: [],
    stepBackFrom: null,
    lessonShown: [],
    workedShown: [],
    guidedPending: null,
    learnAnswered: 0,
    focusesDone: [],
    touched: [],
    challengeDone: false,
    explainDone: false,
    forcedSkill: opts.skillId,
    queue: [],
    lastChallenge: opts.lastChallenge,
  };
  if (type === "daily") {
    const due = dueReviews(state).slice(0, lim.warmup).map((skillId) => ({ skillId, mode: "review" as AttemptMode }));
    const room = lim.warmup - due.length;
    const mistakes = state.mistakes.filter((m) => !m.resolved && !due.some((d) => d.skillId === m.skillId)).slice(-Math.max(0, Math.min(2, room)));
    ctx.warmup = [...due, ...mistakes.map((m) => ({ skillId: m.skillId, mistakeId: m.id, mode: "mistake" as AttemptMode }))];
    if (!ctx.warmup.length) {
      const solid = ORDERED.filter((s) => state.skills[s.id]?.ready);
      const picks = solid.length ? [solid[Math.floor(Math.random() * solid.length)], solid[Math.floor(Math.random() * solid.length)]] : [];
      ctx.warmup = [...new Set(picks.map((s) => s.id))].map((skillId) => ({ skillId, mode: "free" as AttemptMode }));
    }
  } else if (type === "mistakes") {
    const open = state.mistakes.filter((m) => !m.resolved);
    const seen = new Set<string>();
    for (const m of [...open].reverse()) {
      if (seen.has(m.skillId)) continue;
      seen.add(m.skillId);
      ctx.warmup.push({ skillId: m.skillId, mistakeId: m.id, mode: "mistake" });
      if (ctx.warmup.length >= 8) break;
    }
  }
  ctx.warmupTotal = ctx.warmup.length;
  if (ctx.phase === "warmup" && !ctx.warmup.length) ctx.phase = type === "daily" ? "learn" : "done";
  return ctx;
}

function minutes(ctx: SessionCtx) {
  return (Date.now() - ctx.startedAt) / 60000;
}

function problemFor(state: AppState, skillId: string, mode: AttemptMode, guided = false, mistakeId?: string): Item {
  const ss = skillState(state, skillId);
  const mistake = mistakeId ? state.mistakes.find((m) => m.id === mistakeId) : undefined;
  const level: Level = mode === "review" ? (Math.max(2, ss.difficulty) as Level) : mistake ? mistake.level : ss.difficulty;
  return { kind: "problem", skillId, seed: randomSeed(), level, mode, guided, mistakeId };
}

/** Decide what to show next. Mutates ctx. */
export function nextItem(state: AppState, ctx: SessionCtx): Item {
  if (ctx.queue.length) return ctx.queue.shift()!;
  const lim = LIMITS[state.settings.sessionLength];

  if (ctx.phase === "warmup") {
    const next = ctx.warmup.shift();
    if (next) return problemFor(state, next.skillId, next.mode, false, next.mistakeId);
    if (ctx.type === "mistakes") {
      ctx.phase = "done";
      return nextItem(state, ctx);
    }
    ctx.phase = "learn";
    if (ctx.warmupTotal) return { kind: "message", title: "Warm-up done!", text: "Now let's learn something new.", tone: "info" };
  }

  if (ctx.phase === "learn") {
    const outOfTime = ctx.learnAnswered >= lim.learn || minutes(ctx) >= lim.minutes;
    if (ctx.probes.length) return problemFor(state, ctx.probes[0], "probe");
    if ((outOfTime && !ctx.stack.length) || ctx.learnAnswered >= lim.learn + 8) {
      ctx.phase = ctx.type === "daily" ? "challenge" : "done";
      return nextItem(state, ctx);
    }
    if (!ctx.focus) {
      const strand: Strand = ctx.focusesDone.length % 2 === 0 ? "algebra" : "geo-stats";
      const topic = ctx.forcedSkill ? SKILL_BY_ID[ctx.forcedSkill].topic : undefined;
      const s = pickFocus(state, ctx, { strand, topic });
      if (!s) {
        ctx.phase = ctx.type === "daily" ? "challenge" : "done";
        return nextItem(state, ctx);
      }
      ctx.focus = s.id;
      ctx.focusCount = 0;
    }
    const id = ctx.focus;
    const ss = skillState(state, id);
    if (!ctx.touched.includes(id)) ctx.touched.push(id);

    if (ss.ready && ctx.focusCount >= (ctx.forcedSkill === id ? 6 : 1)) {
      // Finished this skill for now.
      ctx.focusesDone.push(id);
      ctx.focus = null;
      if (!ss.whyChoice) return { kind: "why", skillId: id };
      return nextItem(state, ctx);
    }
    if (!ctx.lessonShown.includes(id) && (ss.level <= 1 || !ss.lessonSeen || ss.p < 0.5)) {
      ctx.lessonShown.push(id);
      return { kind: "lesson", skillId: id, recap: ss.lessonSeen };
    }
    if (!ctx.workedShown.includes(id) && ss.level <= 2 && !ss.ready && ss.p < 0.6) {
      ctx.workedShown.push(id);
      ctx.guidedPending = id;
      return { kind: "worked", skillId: id, seed: randomSeed(), level: 1 };
    }
    // Long stretch without getting solid: park it for next time rather than wearing her out.
    if (ctx.focusCount >= 10 && !ctx.stack.length) {
      ctx.focusesDone.push(id);
      ctx.focus = null;
      return { kind: "message", title: "Good effort!", text: `We'll come back to “${SKILL_BY_ID[id].title}” next time. Practice spread over days helps it stick.`, tone: "info" };
    }
    const guided = ctx.guidedPending === id;
    ctx.guidedPending = null;
    return problemFor(state, id, ctx.forcedSkill || ctx.type === "topic" ? "free" : "learn", guided);
  }

  if (ctx.phase === "challenge") {
    if (!ctx.challengeDone) {
      ctx.challengeDone = true;
      const ok = CHALLENGES.filter((c) => c.needs.every((n) => state.skills[n]?.ready));
      const pool = ok.filter((c) => c.id !== ctx.lastChallenge);
      const pick = (pool.length ? pool : ok)[Math.floor(Math.random() * (pool.length || ok.length))];
      if (pick) {
        ctx.lastChallenge = pick.id;
        return { kind: "challenge", challengeId: pick.id, seed: randomSeed() };
      }
      // Nothing unlocked yet: stretch with a harder version of something she knows.
      const known = ORDERED.filter((s) => state.skills[s.id]?.ready);
      if (known.length) {
        const s = known[known.length - 1 - Math.floor(Math.random() * Math.min(3, known.length))];
        return { kind: "problem", skillId: s.id, seed: randomSeed(), level: 3, mode: "challenge", guided: false };
      }
    }
    if (!ctx.explainDone) {
      ctx.explainDone = true;
      const cand = ORDERED.find((s) => {
        const ss = state.skills[s.id];
        return ss?.ready && ss.whyChoice && (ss.whyWritten === "none" || ss.whyWritten === "revise");
      });
      if (cand) return { kind: "explain", skillId: cand.id };
    }
    ctx.phase = "done";
  }
  return { kind: "done" };
}

export interface AnswerResult {
  ok: boolean;
  assisted: boolean;
  given: string;
  correct: string;
  prompt: string;
}

/** Record an answer and apply the adaptive rules (step back when stuck, return when solid). */
export function afterAnswer(state: AppState, ctx: SessionCtx, item: Extract<Item, { kind: "problem" }>, res: AnswerResult): AttemptOutcome {
  const out = recordAttempt(state, { skillId: item.skillId, ok: res.ok, assisted: res.assisted, mode: item.mode });
  state.xp += out.xp;
  ctx.answered++;
  if (res.ok && !res.assisted) ctx.correct++;
  if (!ctx.touched.includes(item.skillId)) ctx.touched.push(item.skillId);
  logMistake(state, item, res);

  if (item.mode === "learn" || item.mode === "free") {
    ctx.learnAnswered++;
    ctx.focusCount++;
  }

  // Review missed once: ask one more right away before deciding anything.
  if (item.mode === "review" && !res.ok && state.skills[item.skillId]?.reviewMiss) {
    ctx.warmup.unshift({ skillId: item.skillId, mode: "review" });
  }
  if (out.demoted) {
    ctx.queue.push({ kind: "message", title: "Let's refresh this one", text: `“${SKILL_BY_ID[item.skillId].title}” slipped a little. That's normal! It'll come back into your lessons.`, tone: "stepback" });
  }

  if (item.mode === "probe") {
    ctx.probes.shift();
    if (!res.ok || res.assisted) {
      // Found the gap: work on the building block, then come back.
      const from = ctx.stepBackFrom!;
      ctx.probes = [];
      ctx.stepBackFrom = null;
      if (!ctx.stack.includes(from)) ctx.stack.push(from);
      const ss = state.skills[item.skillId] ?? newSkillState();
      state.skills[item.skillId] = ss;
      ss.ready = false;
      ctx.focus = item.skillId;
      ctx.focusCount = 0;
      ctx.lessonShown = ctx.lessonShown.filter((x) => x !== item.skillId);
      ctx.workedShown = ctx.workedShown.filter((x) => x !== item.skillId);
      ctx.queue.push({ kind: "message", title: "Let's strengthen a building block", text: `“${SKILL_BY_ID[from].title}” uses “${SKILL_BY_ID[item.skillId].title}”. Let's practice that first, then go back.`, tone: "stepback" });
    } else if (!ctx.probes.length) {
      // Building blocks are fine; re-teach the skill itself more gently.
      const from = ctx.stepBackFrom!;
      ctx.stepBackFrom = null;
      reteach(state, ctx, from);
    }
    return out;
  }

  if ((item.mode === "learn" || item.mode === "free") && out.struggling && ctx.focus === item.skillId) {
    const skill = SKILL_BY_ID[item.skillId];
    const candidates = skill.prereqs
      .filter((p) => !ctx.stack.includes(p))
      .sort((a, b) => skillState(state, a).p - skillState(state, b).p)
      .slice(0, 2);
    if (candidates.length && ctx.stack.length < 3) {
      ctx.probes = candidates;
      ctx.stepBackFrom = item.skillId;
      ctx.queue.push({ kind: "message", title: "Quick check", text: "This one's tricky! Let's check a building block it uses.", tone: "stepback" });
    } else {
      reteach(state, ctx, item.skillId);
    }
    return out;
  }

  // Finished a building block: return to the skill we stepped back from.
  if (out.becameReady && ctx.stack.length && ctx.focus === item.skillId) {
    const back = ctx.stack.pop()!;
    ctx.focusesDone.push(item.skillId);
    ctx.focus = back;
    ctx.focusCount = 0;
    const ss = state.skills[back];
    if (ss) ss.recent = ss.recent.map((a) => ({ ...a, mode: a.mode === "learn" ? ("probe" as AttemptMode) : a.mode }));
    ctx.queue.push({ kind: "message", title: "Building block solid! 💪", text: `Back to “${SKILL_BY_ID[back].title}”. You've got more tools now.`, tone: "celebrate" });
  }
  return out;
}

function reteach(state: AppState, ctx: SessionCtx, skillId: string) {
  const ss = state.skills[skillId];
  if (ss) {
    ss.difficulty = 1;
    // Fresh start for the struggle detector.
    ss.recent = ss.recent.map((a) => ({ ...a, mode: a.mode === "learn" || a.mode === "free" ? ("probe" as AttemptMode) : a.mode }));
  }
  ctx.focus = skillId;
  ctx.lessonShown = ctx.lessonShown.filter((x) => x !== skillId);
  ctx.workedShown = ctx.workedShown.filter((x) => x !== skillId);
  if (ss) ss.p = Math.min(ss.p, 0.45);
  ctx.queue.push({ kind: "message", title: "Let's look at it another way", text: "We'll review the idea with an example, then try some easier ones.", tone: "stepback" });
}

function logMistake(state: AppState, item: Extract<Item, { kind: "problem" }>, res: AnswerResult) {
  if (item.mistakeId && res.ok && !res.assisted) {
    const m = state.mistakes.find((x) => x.id === item.mistakeId);
    if (m) m.resolved = true;
    // Also clear older entries for the same skill: she's shown she can do it now.
    for (const x of state.mistakes) if (x.skillId === item.skillId && x.level <= item.level) x.resolved = true;
    return;
  }
  if (res.ok && (!res.assisted || item.guided)) return;
  const entry: MistakeEntry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    skillId: item.skillId,
    level: item.level,
    prompt: res.prompt,
    given: res.given,
    correct: res.correct,
    date: today(),
    resolved: false,
  };
  state.mistakes = [...state.mistakes, entry].slice(-200);
}

/** What today's quest will roughly contain, for the home screen. */
export function previewToday(state: AppState) {
  const due = dueReviews(state).length;
  const lim = LIMITS[state.settings.sessionLength];
  const first = pickFocus(state, { focusesDone: [] }, { strand: "algebra" });
  const second = pickFocus(state, { focusesDone: first ? [first.id] : [] }, { strand: "geo-stats" });
  return { reviews: Math.min(due, lim.warmup), dueTotal: due, focus: [first, second].filter(Boolean) as Skill[] };
}
