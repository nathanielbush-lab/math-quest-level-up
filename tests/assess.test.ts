import { beforeEach, describe, expect, it } from "vitest";
import { ORDERED, SKILL_BY_ID, TOPICS, TOPIC_BY_ID, skillsInTopic } from "../src/content";
import { canonicalResponse } from "../src/engine/check";
import {
  ASSESS_SPEC,
  FINISH_BONUS,
  STARS_PER_CORRECT,
  checkpointDue,
  compareCheckpoints,
  fmtClock,
  domainOf,
  domainQuotas,
  eocCourseFor,
  nextCheckpointDate,
  pickCheckpointItems,
  pickScreenerItems,
  problemFor,
  readinessBand,
  saveTest,
  scoreTest,
  secondsLeft,
  strongWeak,
  unreadable,
  type ItemAnswer,
} from "../src/engine/assess";
import { addDays, newSkillState, newState, today, type AppState, type AssessmentResult } from "../src/engine/state";

let state: AppState;
beforeEach(() => {
  state = newState();
});

const M1 = TOPICS.filter((t) => t.course === "m1");
const M3 = TOPICS.filter((t) => t.course === "m3");
const courseOf = (topic: string) => TOPIC_BY_ID[topic].course;

describe("EOC practice question selection", () => {
  it("splits questions by the blueprint's domain weights", () => {
    const all = { NA: 20, F: 20, G: 20, S: 20 };
    const q = domainQuotas("m1", 50, all);
    expect(q.NA + q.F + q.G + q.S).toBe(50);
    expect(q).toEqual({ NA: 19, F: 17, G: 5, S: 9 });
    expect(domainQuotas("m3", 50, all)).toEqual({ NA: 17, F: 17, G: 11, S: 5 });
    // A domain with no skills yet gets nothing; the rest share its questions.
    const noGeo = domainQuotas("m1", 20, { ...all, G: 0 });
    expect(noGeo.G).toBe(0);
    expect(noGeo.NA + noGeo.F + noGeo.S).toBe(20);
  });

  it("reads the domain from the standard code", () => {
    const fake = (code: string) => ({ ...SKILL_BY_ID[ORDERED[0].id], standards: [code] });
    expect(domainOf(fake("NC.M1.A-SSE.1a"))).toBe("NA");
    expect(domainOf(fake("NC.M1.N-RN.2"))).toBe("NA");
    expect(domainOf(fake("NC.M3.F-IF.4"))).toBe("F");
    expect(domainOf(fake("NC.M1.G-GPE.5"))).toBe("G");
    expect(domainOf(fake("NC.M1.S-ID.1"))).toBe("S");
  });

  it("maps every course to an EOC", () => {
    expect(["m1", "m2", "m3", "m4", "pc"].map((c) => eocCourseFor(c as never))).toEqual(["m1", "m1", "m3", "m3", "m3"]);
  });

  it.runIf(M1.length > 0)("Math 1 full test: 50 questions from Math 1, calculator off for the first 15", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const items = pickScreenerItems(state, "screener-full", seed, "m1");
      expect(items).toHaveLength(ASSESS_SPEC["screener-full"].count);
      expect(items.every((i) => courseOf(i.topic) === "m1")).toBe(true);
      expect(items.filter((i) => i.noCalc)).toHaveLength(15);
      expect(items.slice(0, 15).every((i) => i.noCalc)).toBe(true);
    }
  });

  it.runIf(M3.length > 0)("Math 3 tests have no calculator-off section", () => {
    const items = pickScreenerItems(state, "screener-quick", 4, "m3");
    expect(items).toHaveLength(ASSESS_SPEC["screener-quick"].count);
    expect(items.every((i) => courseOf(i.topic) === "m3" && !i.noCalc)).toBe(true);
  });

  it.runIf(M1.length > 0)("follows the domain quotas and spreads across units", () => {
    const items = pickScreenerItems(state, "screener-full", 8, "m1");
    const units = new Set(items.map((i) => i.topic));
    expect(units.size).toBe(Math.min(M1.length, units.size));
    const count = (d: string) => items.filter((i) => domainOf(SKILL_BY_ID[i.skillId]) === d).length;
    const pool = { NA: 0, F: 0, G: 0, S: 0 } as Record<"NA" | "F" | "G" | "S", number>;
    for (const t of M1) for (const sk of skillsInTopic(t.id)) pool[domainOf(sk)]++;
    const q = domainQuotas("m1", 50, pool);
    for (const d of ["NA", "F", "G", "S"]) expect(count(d), d).toBe(q[d as keyof typeof q]);
  });

  it.runIf(M1.length > 0)("about 30% level 3, the rest level 2", () => {
    const items = pickScreenerItems(state, "screener-full", 7, "m1");
    expect(items.filter((i) => i.level === 3)).toHaveLength(15);
    expect(items.filter((i) => i.level === 2)).toHaveLength(35);
  });

  it.runIf(M1.length > 0)("is reproducible from the seed", () => {
    expect(pickScreenerItems(state, "screener-full", 99, "m1")).toEqual(pickScreenerItems(state, "screener-full", 99, "m1"));
    expect(pickScreenerItems(state, "screener-full", 99, "m1")).not.toEqual(pickScreenerItems(state, "screener-full", 100, "m1"));
  });

  it.runIf(M1.length > 1)("prefers skills the student has practiced but still includes new ones", () => {
    const practiced = new Set<string>();
    for (const t of M1) {
      const id = skillsInTopic(t.id)[0].id;
      practiced.add(id);
      state.skills[id] = { ...newSkillState(), attempts: 5, correct: 4, level: 2 };
    }
    const m1Skills = M1.flatMap((t) => skillsInTopic(t.id)).length;
    let seenPicks = 0, total = 0;
    for (let seed = 1; seed <= 60; seed++) {
      for (const i of pickScreenerItems(state, "screener-quick", seed, "m1")) { total++; if (practiced.has(i.skillId)) seenPicks++; }
    }
    // Without a preference the share would be about practiced/all skills.
    expect(seenPicks / total).toBeGreaterThan((1.5 * practiced.size) / m1Skills);
    expect(total - seenPicks).toBeGreaterThan(total * 0.2);
  });

  it.runIf(M1.length > 0)("every picked problem generates, the same way each time", () => {
    for (const i of pickScreenerItems(state, "screener-full", 5, "m1")) {
      const p = problemFor(i);
      expect(p.prompt.length).toBeGreaterThan(0);
      expect(problemFor(i)).toEqual(p);
    }
  });
});

describe("checkpoint selection", () => {
  it.runIf(M1.length > 0)("one level-2 question per unit of the current course", () => {
    const items = pickCheckpointItems(state, 3);
    expect(items.map((i) => i.topic)).toEqual(M1.map((t) => t.id));
    expect(items.every((i) => i.level === 2)).toBe(true);
  });
});

function answersFor(items: ReturnType<typeof pickScreenerItems>, pattern: ("right" | "wrong" | "skip")[]): ItemAnswer[] {
  return items.map((it, i) => {
    const p = problemFor(it);
    const kind = pattern[i % pattern.length];
    if (kind === "skip") return { response: null, flagged: false, secs: 0 };
    if (kind === "right") return { response: canonicalResponse(p.answer), flagged: false, secs: 30 };
    const a = p.answer;
    const wrong =
      a.kind === "choice" ? { kind: "choice" as const, index: (a.correct + 1) % a.choices.length }
      : a.kind === "point" ? { kind: "point" as const, x: a.x + 1, y: a.y }
      : a.kind === "multi" ? { kind: "multi" as const, texts: a.fields.map(() => "987654") }
      : a.kind === "expr" ? { kind: "expr" as const, text: "987654" }
      : { kind: "number" as const, text: "987654" };
    return { response: wrong, flagged: i === 1, secs: 40 };
  });
}

describe("scoring and saving", () => {
  it("scores right, wrong and skipped answers", () => {
    const items = pickScreenerItems(state, "screener-quick", 11).slice(0, 12);
    const scored = scoreTest(items, answersFor(items, ["right", "wrong", "skip"]));
    expect(scored.filter((x) => x.ok)).toHaveLength(4);
    expect(scored.filter((x) => x.skipped)).toHaveLength(4);
    expect(scored.filter((x) => !x.ok && !x.skipped)).toHaveLength(4);
    expect(scored[1].flagged).toBe(true);
    expect(scored[0].correct.length).toBeGreaterThan(0);
  });

  it("saves the result, logs answered items, journals misses, awards stars, leaves mastery alone", () => {
    const items = pickScreenerItems(state, "screener-quick", 11).slice(0, 12);
    state.skills[items[0].skillId] = { ...newSkillState(), level: 2, attempts: 3, correct: 3 };
    const before = JSON.stringify(state.skills);
    const scored = scoreTest(items, answersFor(items, ["right", "wrong", "skip"]));
    const { result, stars } = saveTest(state, "screener-quick", scored, 600, new Date(2026, 9, 12, 10));
    expect(state.assessments).toHaveLength(1);
    expect(result.kind).toBe("screener-quick");
    expect(result.date).toBe("2026-10-12");
    expect(result.minutes).toBe(10);
    expect(result.items).toHaveLength(12);
    expect(result.items.filter((i) => i.skipped)).toHaveLength(4);
    expect(state.events).toHaveLength(8);
    expect(state.events.every((e) => e.mode === "screener" && !e.assisted && e.hints === 0 && e.tries === 0)).toBe(true);
    expect(state.mistakes).toHaveLength(4);
    expect(state.mistakes.every((m) => !m.resolved && m.correct.length > 0 && m.given.length > 0)).toBe(true);
    expect(stars).toBe(4 * STARS_PER_CORRECT + FINISH_BONUS);
    expect(state.xp).toBe(stars);
    expect(JSON.stringify(state.skills)).toBe(before);
  });

  it("checkpoint events use the checkpoint mode", () => {
    const items = pickCheckpointItems(state, 4);
    saveTest(state, "checkpoint", scoreTest(items, answersFor(items, ["right"])), 900);
    expect(state.events.every((e) => e.mode === "checkpoint" && e.ok)).toBe(true);
    expect(state.mistakes).toHaveLength(0);
  });

  it("doesn't flag an unreadable number as wrong, just unreadable", () => {
    const items = pickScreenerItems(state, "screener-full", 2);
    const numberItem = items.find((i) => problemFor(i).answer.kind === "number")!;
    const p = problemFor(numberItem);
    expect(unreadable(p, { kind: "number", text: "banana" })).toBeTruthy();
    expect(unreadable(p, { kind: "number", text: "987654" })).toBeNull();
  });
});

describe("readiness and comparison", () => {
  it("readiness bands", () => {
    expect(readinessBand(80).id).toBe("ready");
    expect(readinessBand(79).id).toBe("close");
    expect(readinessBand(60).id).toBe("close");
    expect(readinessBand(59).id).toBe("building");
  });

  it("strongest and weakest topics", () => {
    const [A, B, C, D, E] = TOPICS.map((t) => t.id);
    const items = [
      { topic: A, ok: true }, { topic: A, ok: true },
      { topic: B, ok: true }, { topic: B, ok: false },
      { topic: C, ok: false },
    ];
    const { strongest, weakest } = strongWeak(items);
    expect(strongest.map((t) => t.topic.id)).toEqual([A]);
    expect(weakest.map((t) => t.topic.id)).toEqual([C]);
    expect(strongWeak([{ topic: A, ok: true }, { topic: B, ok: true }])).toEqual({ strongest: [], weakest: [] });
    // One question per topic: ties are listed (up to 3).
    const singles = strongWeak([{ topic: D, ok: true }, { topic: A, ok: false }, { topic: E, ok: false }, { topic: TOPICS[5].id, ok: false }, { topic: TOPICS[6].id, ok: false }]);
    expect(singles.strongest.map((t) => t.topic.id)).toEqual([D]);
    expect(singles.weakest).toHaveLength(3);
  });

  const cp = (oks: boolean[], date: string): AssessmentResult => ({
    id: date, kind: "checkpoint", date, minutes: 12,
    items: TOPICS.map((t, i) => ({ skillId: skillsInTopic(t.id)[0].id, topic: t.id, ok: oks[i] ?? false, prompt: "p", given: "g", correct: "c", secs: 30 })),
  });

  it("compares checkpoints topic by topic", () => {
    const prev = cp([true, true, false, false], "2026-09-01");
    const cur = cp([true, false, true, false], "2026-10-01");
    const c = compareCheckpoints(prev, cur);
    expect(c.before).toBe(2);
    expect(c.after).toBe(2);
    expect(c.total).toBe(TOPICS.length);
    expect(c.topics[TOPICS[0].id]).toBe("same");
    expect(c.topics[TOPICS[1].id]).toBe("down");
    expect(c.topics[TOPICS[2].id]).toBe("up");
    expect(c.topics[TOPICS[3].id]).toBe("same");
    expect(compareCheckpoints(undefined, cur).before).toBeUndefined();
  });

  it("checkpoint is due after 28 days, and not on day one", () => {
    const day = "2026-10-12";
    expect(checkpointDue(state, day)).toBe(false); // brand new
    state.placement[TOPICS[0].id] = "skipped";
    expect(checkpointDue(state, day)).toBe(false);
    state.placement[TOPICS[0].id] = "done";
    expect(checkpointDue(state, day)).toBe(true);
    state.placement = {};
    for (let i = 0; i < 3; i++) state.sessions.push({ date: day, minutes: 10, answered: 10, correct: 8, skills: [], kind: "daily" });
    expect(checkpointDue(state, day)).toBe(true);
    state.assessments.push(cp([], addDays(day, -27)));
    expect(checkpointDue(state, day)).toBe(false);
    expect(nextCheckpointDate(state)).toBe(addDays(day, 1));
    expect(checkpointDue(state, addDays(day, 1))).toBe(true);
    // A screener doesn't count as a checkpoint.
    state.assessments = [{ ...cp([], day), kind: "screener-quick" }];
    expect(checkpointDue(state, day)).toBe(true);
    expect(today().length).toBe(10);
  });
});

describe("timer", () => {
  it("counts down and stops at zero", () => {
    const start = 1_000_000;
    expect(secondsLeft(900, start, start)).toBe(900);
    expect(secondsLeft(900, start, start + 1500)).toBe(899);
    expect(secondsLeft(900, start, start + 900_000)).toBe(0);
    expect(secondsLeft(900, start, start + 2_000_000)).toBe(0);
    expect(fmtClock(305)).toBe("5:05");
    expect(fmtClock(0)).toBe("0:00");
  });
});
