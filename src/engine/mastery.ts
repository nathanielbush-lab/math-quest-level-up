import { SKILL_BY_ID } from "../content";
import type { Level } from "../content/types";
import { addDays, daysBetween, newSkillState, today, weekStart, type AppState, type AttemptMode, type SkillState } from "./state";

/** Review spacing in days after each successful retention check. */
const INTERVALS = [1, 3, 7, 14, 30, 60];

export interface AttemptInput {
  skillId: string;
  ok: boolean;
  /** Used a hint, needed a second try, or was shown steps. */
  assisted: boolean;
  mode: AttemptMode;
}

export interface AttemptOutcome {
  becameReady: boolean;
  levelUp?: SkillState["level"];
  demoted: boolean;
  /** Struggling in this skill; the session should step back. */
  struggling: boolean;
  difficultyChanged?: Level;
  xp: number;
}

function nextInterval(current: number): number {
  return INTERVALS.find((d) => d > current) ?? 60;
}

/** Records one answer and updates the skill's mastery. Mutates `state`. */
export function recordAttempt(state: AppState, input: AttemptInput, now = new Date()): AttemptOutcome {
  const day = today(now);
  const ss: SkillState = state.skills[input.skillId] ?? newSkillState();
  state.skills[input.skillId] = ss;
  const out: AttemptOutcome = { becameReady: false, demoted: false, struggling: false, xp: 0 };
  const before = ss.level;

  ss.attempts++;
  ss.lastPracticed = day;
  ss.recent = [...ss.recent, { t: now.getTime(), ok: input.ok, assisted: input.assisted, mode: input.mode }].slice(-12);
  if (ss.level === 0) {
    ss.level = 1;
    ss.dates.exploring ??= day;
  }

  if (input.ok && !input.assisted) {
    ss.p = ss.p + (1 - ss.p) * (input.mode === "review" ? 0.25 : 0.3);
    ss.correct++;
    ss.streak++;
    ss.missStreak = 0;
    if (!ss.correctDays.includes(day)) ss.correctDays = [...ss.correctDays, day].slice(-8);
    out.xp = 10 + ss.difficulty * 2;
  } else if (input.ok) {
    ss.p = ss.p + (1 - ss.p) * 0.08;
    ss.correct++;
    ss.streak = 0;
    ss.missStreak = 0;
    out.xp = 4;
  } else {
    ss.p = ss.p * 0.65;
    ss.streak = 0;
    ss.missStreak++;
    out.xp = 1;
  }

  if (ss.level === 1 && input.ok && !input.assisted) {
    ss.level = 2;
    ss.dates.practicing ??= day;
  }

  // Difficulty within the skill.
  if (ss.streak >= 3 && ss.difficulty < 3) {
    ss.difficulty = (ss.difficulty + 1) as Level;
    ss.streak = 0;
    out.difficultyChanged = ss.difficulty;
  } else if (ss.missStreak >= 2 && ss.difficulty > 1) {
    ss.difficulty = (ss.difficulty - 1) as Level;
    ss.missStreak = 0;
    out.difficultyChanged = ss.difficulty;
  }

  // Ready to build on: a strong estimate AND recent consistency without help.
  const last5 = ss.recent.slice(-5);
  const cleanRecent = last5.filter((a) => a.ok && !a.assisted).length;
  if (!ss.ready && ss.p >= 0.8 && (cleanRecent >= 4 || (ss.recent.slice(-3).every((a) => a.ok && !a.assisted) && ss.recent.length >= 3))) {
    ss.ready = true;
    out.becameReady = true;
    // First retention check tomorrow: "a single successful example is not enough".
    if (ss.level < 3) {
      ss.interval = 1;
      ss.nextReview = addDays(day, 1);
    }
  }

  if (input.mode === "review" || input.mode === "mistake") {
    if (input.ok && !input.assisted) {
      ss.reviewMiss = false;
      // A check on a later day than she first got it right confirms Independent.
      if (ss.level === 2 && ss.ready && ss.correctDays.length >= 2) {
        ss.level = 3;
        ss.dates.independent ??= day;
        ss.placed = false;
      }
      ss.interval = nextInterval(ss.interval);
      ss.nextReview = addDays(day, ss.interval);
      if (ss.level >= 3) ss.dates.recheck = day;
    } else if (ss.reviewMiss) {
      // Two misses in a row on review: this needs relearning, not just a reminder.
      ss.reviewMiss = false;
      if (ss.level >= 3 || ss.ready) out.demoted = true;
      ss.level = Math.min(ss.level, 2) as SkillState["level"];
      ss.ready = false;
      ss.p = Math.min(ss.p, 0.5);
      ss.interval = 0;
      ss.nextReview = undefined;
      ss.difficulty = 1;
    } else {
      ss.reviewMiss = true;
      ss.nextReview = day;
    }
  }

  maybeExplainLevel(ss, day);

  const window = ss.recent.slice(-4).filter((a) => a.mode === "learn" || a.mode === "free");
  out.struggling = !input.ok && window.length >= 3 && window.filter((a) => !a.ok).length >= 3;
  if (ss.level > before) out.levelUp = ss.level;
  return out;
}

/** Level 4 needs Independent + both explanation checks + a retention check a few days after Independent. */
export function maybeExplainLevel(ss: SkillState, day: string): boolean {
  if (ss.level !== 3 || !ss.whyChoice || ss.whyWritten !== "pass" || !ss.dates.independent || !ss.dates.recheck) return false;
  if (daysBetween(ss.dates.independent, ss.dates.recheck) < 2) return false;
  ss.level = 4;
  ss.dates.explain ??= day;
  return true;
}

export function recordWhyChoice(state: AppState, skillId: string, ok: boolean, now = new Date()) {
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (ok) ss.whyChoice = true;
  maybeExplainLevel(ss, today(now));
}

export function setWrittenStatus(state: AppState, skillId: string, status: SkillState["whyWritten"], now = new Date()) {
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (ss.whyWritten === "pass" && status !== "pass") return;
  ss.whyWritten = status;
  maybeExplainLevel(ss, today(now));
}

/** Mark a skill (and everything it depends on) as already known from the placement check. */
export function placeSkill(state: AppState, skillId: string, now = new Date(), seen = new Set<string>()) {
  if (seen.has(skillId)) return;
  seen.add(skillId);
  const day = today(now);
  const ss = state.skills[skillId] ?? newSkillState();
  state.skills[skillId] = ss;
  if (!ss.ready) {
    ss.ready = true;
    ss.placed = true;
    ss.level = Math.max(ss.level, 2) as SkillState["level"];
    ss.p = Math.max(ss.p, 0.8);
    ss.difficulty = 2;
    ss.dates.exploring ??= day;
    ss.dates.practicing ??= day;
    ss.interval = 1;
    // Spread the confirmation checks over the next week so warm-ups stay short.
    ss.nextReview = addDays(day, 1 + (seen.size % 6));
  }
  for (const p of SKILL_BY_ID[skillId]?.prereqs ?? []) placeSkill(state, p, now, seen);
}

/** Update the daily streak at the end of a session. */
/** Most streak freezes she can hold at once. */
export const MAX_FREEZES = 2;
/** A free freeze every this many days in a row. */
export const FREEZE_EVERY = 7;
/** Bonus stars for meeting the weekly goal. */
export const WEEK_BONUS = 50;

export interface StreakOutcome {
  /** Freezes used up to cover missed days. */
  usedFreezes: number;
  /** She earned a free freeze for a 7-day run. */
  earnedFreeze: boolean;
}

/**
 * Count today toward the streak. Missed days are covered by saved freezes if she has
 * enough of them (one per missed day); otherwise the streak starts again at 1.
 */
export function bumpStreak(state: AppState, now = new Date()): StreakOutcome {
  const out: StreakOutcome = { usedFreezes: 0, earnedFreeze: false };
  const day = today(now);
  const st = state.streak;
  const last = st.lastDay;
  if (last === day) return out;
  const gap = last ? daysBetween(last, day) : Infinity;
  const freezes = st.freezes ?? 0;
  if (gap === 1) st.count += 1;
  else if (gap > 1 && gap - 1 <= freezes && st.count > 0) {
    out.usedFreezes = gap - 1;
    st.freezes = freezes - out.usedFreezes;
    st.count += 1;
  } else st.count = 1;
  st.lastDay = day;
  st.best = Math.max(st.best ?? 0, st.count);
  if (st.count % FREEZE_EVERY === 0 && (st.freezes ?? 0) < MAX_FREEZES) {
    st.freezes = (st.freezes ?? 0) + 1;
    out.earnedFreeze = true;
  }
  return out;
}

/** Days this week (Monday–Sunday) with a finished daily quest. */
export function questDaysThisWeek(state: AppState, now = new Date()): number {
  const start = weekStart(today(now));
  return new Set(state.sessions.filter((x) => x.kind === "daily" && x.date >= start && x.date <= today(now)).map((x) => x.date)).size;
}

/** Pay the weekly-goal bonus once, the first time she reaches the goal in a week. Returns true when it was just met. */
export function checkWeeklyGoal(state: AppState, now = new Date()): boolean {
  const wk = weekStart(today(now));
  if (state.goalWeeks.includes(wk)) return false;
  if (questDaysThisWeek(state, now) < state.settings.weeklyGoal) return false;
  state.goalWeeks.push(wk);
  state.xp += WEEK_BONUS;
  return true;
}

/** The streak as it stands today: 0 if she has missed more days than her freezes can cover. */
export function currentStreak(state: AppState, now = new Date()): number {
  const last = state.streak.lastDay;
  if (!last) return 0;
  const gap = daysBetween(last, today(now));
  if (gap <= 1) return state.streak.count;
  return gap - 2 < (state.streak.freezes ?? 0) ? state.streak.count : 0;
}
