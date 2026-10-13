import { beforeEach, describe, expect, it } from "vitest";
import { SKILL_BY_ID, TOPICS, TOPIC_BY_ID, skillsInTopic } from "../src/content";
import { canonicalResponse } from "../src/engine/check";
import {
  ASSESS_SPEC,
  FINISH_BONUS,
  STARS_PER_CORRECT,
  checkpointDue,
  compareCheckpoints,
  fmtClock,
  gradeQuotas,
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

const gradeOf = (topic: string) => TOPIC_BY_ID[topic].grade;

describe("screener question selection", () => {
  it("splits questions about 30/35/35 across Grades 6–8", () => {
    expect(gradeQuotas(30)).toEqual({ 6: 9, 7: 11, 8: 10 });
    expect(gradeQuotas(12)).toEqual({ 6: 4, 7: 4, 8: 4 });
  });

  it("full test: 30 questions, every Grade 6–8 topic at least once, grades in order", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const items = pickScreenerItems(state, "screener-full", seed);
      expect(items).toHaveLength(30);
      const topics = new Set(items.map((i) => i.topic));
      for (const t of TOPICS.filter((t) => t.grade >= 6)) expect(topics.has(t.id), `${t.id} seed ${seed}`).toBe(true);
      expect(items.some((i) => i.topic === "g5")).toBe(false);
      const grades = items.map((i) => gradeOf(i.topic));
      expect([...grades].sort()).toEqual(grades); // easier grades first
      expect(grades.filter((g) => g === 6)).toHaveLength(9);
      // No repeated skills (every topic has enough skills for its share).
      expect(new Set(items.map((i) => i.skillId)).size).toBe(30);
      // Skill really belongs to the topic.
      for (const i of items) expect(SKILL_BY_ID[i.skillId].topic).toBe(i.topic);
    }
  });

  it("quick test: 12 questions with both strands in every grade", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const items = pickScreenerItems(state, "screener-quick", seed);
      expect(items).toHaveLength(ASSESS_SPEC["screener-quick"].count);
      for (const g of [6, 7, 8]) {
        const mine = items.filter((i) => gradeOf(i.topic) === g);
        expect(mine).toHaveLength(4);
        const strands = new Set(mine.map((i) => TOPIC_BY_ID[i.topic].strand));
        expect(strands.size).toBe(2);
      }
      expect(new Set(items.map((i) => i.skillId)).size).toBe(12);
    }
  });

  it("mostly level 2 with about 30% level 3", () => {
    const items = pickScreenerItems(state, "screener-full", 7);
    expect(items.filter((i) => i.level === 3)).toHaveLength(9);
    expect(items.filter((i) => i.level === 2)).toHaveLength(21);
    const quick = pickScreenerItems(state, "screener-quick", 7);
    expect(quick.filter((i) => i.level === 3)).toHaveLength(4);
  });

  it("is reproducible from the seed", () => {
    expect(pickScreenerItems(state, "screener-full", 99)).toEqual(pickScreenerItems(state, "screener-full", 99));
    expect(pickScreenerItems(state, "screener-full", 99)).not.toEqual(pickScreenerItems(state, "screener-full", 100));
  });

  it("prefers skills she has seen but still includes new ones", () => {
    // Mark the first skill of each Grade 6–8 topic as practiced.
    const practiced = new Set<string>();
    for (const t of TOPICS.filter((t) => t.grade >= 6)) {
      const id = skillsInTopic(t.id)[0].id;
      practiced.add(id);
      state.skills[id] = { ...newSkillState(), attempts: 5, correct: 4, level: 2 };
    }
    let seenPicks = 0, unseenPicks = 0;
    for (let seed = 1; seed <= 100; seed++) {
      for (const i of pickScreenerItems(state, "screener-quick", seed)) (practiced.has(i.skillId) ? seenPicks++ : unseenPicks++);
    }
    const quickTopicsPicked = 1200; // 100 tests × 12 questions, one per chosen topic
    expect(seenPicks + unseenPicks).toBe(quickTopicsPicked);
    // With no preference it would be about 1 in 5 (practiced skill is 1 of ~5 per topic); with the preference it's well above that.
    expect(seenPicks / quickTopicsPicked).toBeGreaterThan(0.35);
    expect(unseenPicks).toBeGreaterThan(300);
  });

  it("every picked problem generates", () => {
    for (const i of pickScreenerItems(state, "screener-full", 5)) {
      const p = problemFor(i);
      expect(p.prompt.length).toBeGreaterThan(0);
      expect(problemFor(i)).toEqual(p); // same problem each time she comes back to it
    }
  });
});

describe("checkpoint selection", () => {
  it("one level-2 question per topic, Grade 5–8", () => {
    const items = pickCheckpointItems(state, 3);
    expect(items).toHaveLength(16);
    expect(items.map((i) => i.topic)).toEqual(TOPICS.map((t) => t.id));
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
      : { kind: "number" as const, text: "987654" };
    return { response: wrong, flagged: i === 1, secs: 40 };
  });
}

describe("scoring and saving", () => {
  it("scores right, wrong and skipped answers", () => {
    const items = pickScreenerItems(state, "screener-quick", 11);
    const scored = scoreTest(items, answersFor(items, ["right", "wrong", "skip"]));
    expect(scored.filter((x) => x.ok)).toHaveLength(4);
    expect(scored.filter((x) => x.skipped)).toHaveLength(4);
    expect(scored.filter((x) => !x.ok && !x.skipped)).toHaveLength(4);
    expect(scored[1].flagged).toBe(true);
    expect(scored[0].correct.length).toBeGreaterThan(0);
  });

  it("saves the result, logs answered items, journals misses, awards stars, leaves mastery alone", () => {
    const items = pickScreenerItems(state, "screener-quick", 11);
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
    const items = [
      { topic: "g6-rp", ok: true }, { topic: "g6-rp", ok: true },
      { topic: "g7-ns", ok: true }, { topic: "g7-ns", ok: false },
      { topic: "g8-f", ok: false },
    ];
    const { strongest, weakest } = strongWeak(items);
    expect(strongest.map((t) => t.topic.id)).toEqual(["g6-rp"]);
    expect(weakest.map((t) => t.topic.id)).toEqual(["g8-f"]);
    expect(strongWeak([{ topic: "g6-rp", ok: true }, { topic: "g7-ns", ok: true }])).toEqual({ strongest: [], weakest: [] });
    // One question per topic: ties are listed (up to 3).
    const singles = strongWeak([{ topic: "g5", ok: true }, { topic: "g6-rp", ok: false }, { topic: "g6-ns", ok: false }, { topic: "g6-ee", ok: false }, { topic: "g6-g", ok: false }]);
    expect(singles.strongest.map((t) => t.topic.id)).toEqual(["g5"]);
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
    expect(c.total).toBe(16);
    expect(c.topics[TOPICS[0].id]).toBe("same");
    expect(c.topics[TOPICS[1].id]).toBe("down");
    expect(c.topics[TOPICS[2].id]).toBe("up");
    expect(c.topics[TOPICS[3].id]).toBe("same");
    expect(compareCheckpoints(undefined, cur).before).toBeUndefined();
  });

  it("checkpoint is due after 28 days, and not on day one", () => {
    const day = "2026-10-12";
    expect(checkpointDue(state, day)).toBe(false); // brand new
    state.placement["g6-rp"] = "skipped";
    expect(checkpointDue(state, day)).toBe(false);
    state.placement["g6-rp"] = "done";
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
