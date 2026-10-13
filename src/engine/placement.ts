import { skillsInTopic } from "../content";
import type { Level } from "../content/types";
import { randomSeed } from "../lib/rng";
import { placeSkill, recordAttempt } from "./mastery";
import type { AppState } from "./state";

/**
 * A short adaptive check for one topic: binary search over the topic's skills (easiest to hardest).
 * Two right answers in a row on a skill means she already knows it and everything before it.
 */
export interface PlacementCtx {
  topicId: string;
  skills: string[];
  lo: number;
  hi: number;
  mid: number;
  rightThisRound: number;
  asked: number;
  passedUpTo: number;
  done: boolean;
}

export function startPlacement(topicId: string): PlacementCtx {
  const skills = skillsInTopic(topicId).map((s) => s.id);
  const hi = skills.length - 1;
  return { topicId, skills, lo: 0, hi, mid: Math.floor(hi / 2), rightThisRound: 0, asked: 0, passedUpTo: -1, done: skills.length === 0 };
}

export function placementProblem(ctx: PlacementCtx) {
  return { kind: "problem" as const, skillId: ctx.skills[ctx.mid], seed: randomSeed(), level: 2 as Level, mode: "placement" as const, guided: false };
}

export function placementAnswer(state: AppState, ctx: PlacementCtx, ok: boolean) {
  const skillId = ctx.skills[ctx.mid];
  recordAttempt(state, { skillId, ok, assisted: false, mode: "placement" });
  ctx.asked++;
  if (ok) {
    ctx.rightThisRound++;
    if (ctx.rightThisRound < 2) return;
    for (let i = 0; i <= ctx.mid; i++) placeSkill(state, ctx.skills[i]);
    ctx.passedUpTo = ctx.mid;
    ctx.lo = ctx.mid + 1;
  } else {
    ctx.hi = ctx.mid - 1;
  }
  ctx.rightThisRound = 0;
  if (ctx.lo > ctx.hi) {
    ctx.done = true;
    state.placement[ctx.topicId] = "done";
  } else {
    ctx.mid = Math.floor((ctx.lo + ctx.hi) / 2);
  }
}
