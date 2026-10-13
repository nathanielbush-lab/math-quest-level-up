import { beforeEach, describe, expect, it } from "vitest";
import { SKILL_BY_ID, skillsInTopic } from "../src/content";
import { MAX_FREEZES, WEEK_BONUS, bumpStreak, checkWeeklyGoal, currentStreak, recordAttempt, recordWhyChoice, setWrittenStatus } from "../src/engine/mastery";
import { placementAnswer, startPlacement } from "../src/engine/placement";
import { afterAnswer, frontier, nextItem, startSession, type Item } from "../src/engine/session";
import { addDays, exportJson, newSkillState, newState, parseImport, today, weekStart, type AppState } from "../src/engine/state";

let state: AppState;
beforeEach(() => {
  state = newState();
});

function answer(ok: boolean, assisted = false) {
  return { ok, assisted, given: "x", correct: "y", prompt: "p" };
}

describe("mastery", () => {
  it("moves Exploring → Practicing → ready, and needs a later day for Independent", () => {
    const id = "g5.equiv";
    const day1 = new Date(2026, 9, 12, 10);
    recordAttempt(state, { skillId: id, ok: false, assisted: false, mode: "learn" }, day1);
    expect(state.skills[id].level).toBe(1);
    for (let i = 0; i < 6; i++) recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "learn" }, day1);
    const ss = state.skills[id];
    expect(ss.level).toBe(2);
    expect(ss.ready).toBe(true);
    expect(ss.nextReview).toBe(addDays(today(day1), 1));
    // Same-day review doesn't make it Independent.
    recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "review" }, day1);
    expect(ss.level).toBe(2);
    const day2 = new Date(2026, 9, 13, 10);
    recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "review" }, day2);
    expect(ss.level).toBe(3);
    expect(ss.dates.independent).toBe(today(day2));
  });

  it("needs both explanations and a later recheck for Can explain & apply", () => {
    const id = "g5.equiv";
    const d1 = new Date(2026, 9, 12), d2 = new Date(2026, 9, 13), d5 = new Date(2026, 9, 16);
    for (let i = 0; i < 6; i++) recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "learn" }, d1);
    recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "review" }, d2);
    recordWhyChoice(state, id, true, d2);
    setWrittenStatus(state, id, "pass", d2);
    expect(state.skills[id].level).toBe(3);
    recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "review" }, d5);
    expect(state.skills[id].level).toBe(4);
  });

  it("does not demote on a single review miss, but does on two in a row", () => {
    const id = "g5.equiv";
    const d1 = new Date(2026, 9, 12), d2 = new Date(2026, 9, 13), d3 = new Date(2026, 9, 20);
    for (let i = 0; i < 6; i++) recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "learn" }, d1);
    recordAttempt(state, { skillId: id, ok: true, assisted: false, mode: "review" }, d2);
    expect(state.skills[id].level).toBe(3);
    let out = recordAttempt(state, { skillId: id, ok: false, assisted: false, mode: "review" }, d3);
    expect(out.demoted).toBe(false);
    expect(state.skills[id].level).toBe(3);
    out = recordAttempt(state, { skillId: id, ok: false, assisted: false, mode: "review" }, d3);
    expect(out.demoted).toBe(true);
    expect(state.skills[id].level).toBe(2);
    expect(state.skills[id].ready).toBe(false);
  });

  it("assisted answers don't make a skill ready", () => {
    for (let i = 0; i < 10; i++) recordAttempt(state, { skillId: "g5.equiv", ok: true, assisted: true, mode: "learn" });
    expect(state.skills["g5.equiv"].ready).toBe(false);
  });
});

describe("session", () => {
  function run(maxItems: number, decide: (item: Extract<Item, { kind: "problem" }>) => boolean, ctx = startSession(state, "daily")) {
    const seen: Item[] = [];
    for (let i = 0; i < maxItems; i++) {
      const item = nextItem(state, ctx);
      seen.push(item);
      if (item.kind === "done") break;
      if (item.kind === "problem") afterAnswer(state, ctx, item, answer(decide(item)));
      if (item.kind === "lesson") state.skills[item.skillId] = { ...newSkillState(), ...state.skills[item.skillId], lessonSeen: true };
    }
    return { seen, ctx };
  }

  it("teaches a lesson and a worked example before practice for a new skill", () => {
    const { seen } = run(4, () => true);
    expect(seen[0].kind).toBe("lesson");
    expect(seen[1].kind).toBe("worked");
    expect(seen[2]).toMatchObject({ kind: "problem", guided: true });
  });

  it("starts with skills that have no unmet prerequisites", () => {
    for (const s of frontier(state)) for (const p of s.prereqs) expect(state.skills[p]?.ready).toBe(true);
  });

  it("steps back to a prerequisite when she keeps missing, then returns", () => {
    // Make the first skill's prerequisites look known so the session focuses on a skill that has prerequisites.
    const target = "g6.ns.div-fractions";
    for (const id of ["g5.equiv", "g5.multiply", "g6.ns.div-groups"]) state.skills[id] = { ...newSkillState(), ready: true, level: 2, p: 0.85 };
    const ctx = startSession(state, "topic", { skillId: target });
    let sawProbe = false;
    let sawStepBack = false;
    for (let i = 0; i < 40; i++) {
      const item = nextItem(state, ctx);
      if (item.kind === "done") break;
      if (item.kind === "message" && item.tone === "stepback") sawStepBack = true;
      if (item.kind === "problem") {
        if (item.mode === "probe") sawProbe = true;
        // Fails the target skill and the probe of its prerequisite; succeeds elsewhere.
        afterAnswer(state, ctx, item, answer(item.skillId !== target && item.mode !== "probe"));
      }
      if (ctx.stack.includes(target)) break;
    }
    expect(sawStepBack).toBe(true);
    expect(sawProbe).toBe(true);
    expect(ctx.stack).toContain(target);
    expect(SKILL_BY_ID[target].prereqs).toContain(ctx.focus);
  });

  it("ends a daily session after the learn limit with a challenge or done", () => {
    const { seen } = run(80, () => true);
    expect(seen.at(-1)!.kind).toBe("done");
    const problems = seen.filter((s) => s.kind === "problem").length;
    expect(problems).toBeGreaterThan(5);
    expect(problems).toBeLessThan(30);
  });
});

describe("placement", () => {
  it("marks skills up to the highest passed one as known", () => {
    const ctx = startPlacement("g6-ns");
    const skills = skillsInTopic("g6-ns").map((s) => s.id);
    const knowsUpTo = 6;
    let guard = 0;
    while (!ctx.done && guard++ < 30) placementAnswer(state, ctx, skills.indexOf(ctx.skills[ctx.mid]) <= knowsUpTo);
    expect(ctx.done).toBe(true);
    expect(ctx.asked).toBeLessThan(12);
    for (let i = 0; i <= knowsUpTo; i++) expect(state.skills[skills[i]]?.ready, skills[i]).toBe(true);
    expect(state.skills[skills[knowsUpTo + 1]]?.ready ?? false).toBe(false);
  });
});

describe("export/import", () => {
  it("round-trips progress and leaves out the API key by default", () => {
    state.settings.apiKey = "sk-test";
    state.xp = 42;
    const back = parseImport(exportJson(state));
    expect(back.xp).toBe(42);
    expect(back.settings.apiKey).toBeUndefined();
    expect(() => parseImport('{"hello": 1}')).toThrow();
  });
});

describe("streaks, freezes and weekly goals", () => {
  const at = (d: string) => new Date(`${d}T12:00:00`);

  it("counts consecutive days and resets after a gap with no freezes", () => {
    const s = newState();
    bumpStreak(s, at("2026-10-05"));
    bumpStreak(s, at("2026-10-06"));
    bumpStreak(s, at("2026-10-06"));
    expect(s.streak.count).toBe(2);
    bumpStreak(s, at("2026-10-09"));
    expect(s.streak.count).toBe(1);
    expect(s.streak.best).toBe(2);
  });

  it("earns a freeze every 7 days (max 2) and uses one per missed day", () => {
    const s = newState();
    for (let d = 1; d <= 21; d++) bumpStreak(s, at(`2026-09-${String(d).padStart(2, "0")}`));
    expect(s.streak.count).toBe(21);
    expect(s.streak.freezes).toBe(MAX_FREEZES);
    expect(currentStreak(s, at("2026-09-23"))).toBe(21); // one missed day, covered
    const out = bumpStreak(s, at("2026-09-24")); // missed the 22nd and 23rd
    expect(out.usedFreezes).toBe(2);
    expect(s.streak.count).toBe(22);
    expect(s.streak.freezes).toBe(0);
    expect(currentStreak(s, at("2026-09-26"))).toBe(0);
  });

  it("pays the weekly goal bonus once per week", () => {
    const s = newState();
    s.settings.weeklyGoal = 2;
    const log = (d: string) => s.sessions.push({ date: d, minutes: 20, answered: 10, correct: 8, skills: [], kind: "daily" });
    log("2026-10-12"); // Monday
    expect(checkWeeklyGoal(s, at("2026-10-12"))).toBe(false);
    log("2026-10-12"); // a bonus round the same day doesn't count twice
    expect(checkWeeklyGoal(s, at("2026-10-12"))).toBe(false);
    log("2026-10-14");
    const xp = s.xp;
    expect(checkWeeklyGoal(s, at("2026-10-14"))).toBe(true);
    expect(s.xp).toBe(xp + WEEK_BONUS);
    log("2026-10-15");
    expect(checkWeeklyGoal(s, at("2026-10-15"))).toBe(false);
    expect(weekStart("2026-10-18")).toBe("2026-10-12"); // Sunday belongs to the week starting Monday
  });
});
