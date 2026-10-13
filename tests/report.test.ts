import { beforeEach, describe, expect, it } from "vitest";
import { SKILLS, SKILL_BY_ID } from "../src/content";
import { RULES, badgesThisWeek, buildReport, eventDay, inWeek, levelUps, pace, reportStats, skillRows, summarizeTest, weekOptions, weekRange } from "../src/engine/report";
import { newSkillState, newState, type AppState, type AttemptEvent } from "../src/engine/state";

// Wednesday, October 14, 2026, mid-morning local time. The week runs Mon Oct 12 – Sun Oct 18.
const NOW = new Date(2026, 9, 14, 10, 0);
const at = (d: number, h = 16, m = 0) => new Date(2026, 9, d, h, m).getTime();

let state: AppState;
beforeEach(() => {
  state = newState();
  state.createdAt = new Date(2026, 8, 1).toISOString();
  state.settings.studentName = "Robin";
  state.settings.weeklyGoal = 3;
});

function ev(t: number, skill: string, opts: Partial<AttemptEvent> = {}): AttemptEvent {
  return { t, skill, mode: "learn", ok: true, assisted: false, tries: 0, hints: 0, secs: 30, ...opts };
}

function session(date: string, kind = "daily", minutes = 20, answered = 10) {
  state.sessions.push({ date, minutes, answered, correct: answered - 2, skills: [], kind });
}

describe("weeks", () => {
  it("runs Monday to Sunday", () => {
    expect(weekRange(0, NOW)).toEqual({ start: "2026-10-12", end: "2026-10-18", offset: 0 });
    expect(weekRange(1, NOW)).toEqual({ start: "2026-10-05", end: "2026-10-11", offset: 1 });
    // Sunday and Monday belong to different weeks.
    expect(weekRange(0, new Date(2026, 9, 18, 23, 59)).start).toBe("2026-10-12");
    expect(weekRange(0, new Date(2026, 9, 19, 0, 1)).start).toBe("2026-10-19");
  });

  it("offers this week plus 8 earlier weeks", () => {
    const w = weekOptions(NOW);
    expect(w).toHaveLength(9);
    expect(w[8].start).toBe("2026-08-17");
    expect(inWeek("2026-10-18", w[0])).toBe(true);
    expect(inWeek("2026-10-11", w[0])).toBe(false);
    expect(inWeek(undefined, w[0])).toBe(false);
  });

  it("puts a late-Sunday event and an early-Monday event in different weeks", () => {
    state.events.push(ev(at(11, 23, 50), "g5.equiv"), ev(at(12, 0, 10), "g5.addsub", { ok: false, tries: 2, assisted: true }));
    expect(eventDay(at(11, 23, 50))).toBe("2026-10-11");
    const thisWeek = buildReport(state, 0, NOW);
    const lastWeek = buildReport(state, 1, NOW);
    expect(thisWeek.practiced.map((r) => r.id)).toEqual(["g5.addsub"]);
    expect(thisWeek.glance.firstTryPct).toBe(0);
    expect(lastWeek.practiced.map((r) => r.id)).toEqual(["g5.equiv"]);
    expect(lastWeek.glance.firstTryPct).toBe(100);
  });
});

describe("empty weeks", () => {
  it("handles a brand-new learner", () => {
    const r = buildReport(state, 0, NOW);
    expect(r.hasActivity).toBe(false);
    expect(r.hasDetail).toBe(false);
    expect(r.eventsSince).toBeUndefined();
    expect(r.glance.firstTryPct).toBeNull();
    expect(r.glance.answered).toBe(0);
    expect(r.practiced).toEqual([]);
    expect(r.attention).toEqual([]);
    expect(r.wins).toEqual([]);
    expect(r.pace.status).toBe("starting");
  });

  it("gently notes a quiet finished week, but not the week in progress", () => {
    session("2026-10-06");
    expect(buildReport(state, 1, NOW).attention.map((a) => a.id)).toEqual(["quiet-week"]);
    expect(buildReport(state, 0, NOW).attention).toEqual([]);
    // A week with nothing at all gets the empty-week card instead.
    expect(buildReport(state, 2, NOW).attention).toEqual([]);
    // Met under an earlier goal setting: not "lighter".
    state.goalWeeks.push("2026-10-05");
    expect(buildReport(state, 1, NOW).attention).toEqual([]);
  });

  it("falls back to session counts for weeks before detailed events", () => {
    session("2026-10-06", "daily", 25, 12);
    state.events.push(ev(at(13), "g5.equiv"));
    const r = buildReport(state, 1, NOW);
    expect(r.hasDetail).toBe(false);
    expect(r.glance.answered).toBe(12);
    expect(r.glance.firstTryPct).toBeNull();
    expect(r.eventsSince).toBe("2026-10-13");
  });
});

describe("at a glance", () => {
  it("counts quests, minutes, first tries, hints and tutor messages", () => {
    session("2026-10-12");
    session("2026-10-12", "topic", 10);
    session("2026-10-13");
    session("2026-10-14");
    state.events.push(
      ev(at(12), "g5.equiv"),
      ev(at(12), "g5.equiv", { ok: true, tries: 1, assisted: true }),
      ev(at(13), "g5.equiv", { ok: true, assisted: true, hints: 2 }),
      ev(at(14), "g5.addsub", { ok: false, tries: 2, assisted: true, hints: 1, tutor: true }),
    );
    state.tutorChats.push({ id: "c1", date: "2026-10-14", skillId: "g5.addsub", prompt: "{1/2} + {1/3}", messages: [{ role: "student", text: "help" }, { role: "tutor", text: "What's a common denominator?" }, { role: "student", text: "6?" }] });
    state.streak = { count: 4, freezes: 1, best: 6, lastDay: "2026-10-14" };
    const g = buildReport(state, 0, NOW).glance;
    expect(g.quests).toBe(3);
    expect(g.goalMet).toBe(true);
    expect(g.minutes).toBe(70);
    expect(g.sessions).toBe(4);
    expect(g.activeDays).toBe(3);
    expect(g.answered).toBe(4);
    expect(g.firstTry).toBe(1);
    expect(g.firstTryPct).toBe(25);
    expect(g.hints).toBe(3);
    expect(g.tutorMessages).toBe(2);
    expect(g.tutorQuestions).toBe(1);
    expect(g.streak).toBe(4);
    expect(g.freezes).toBe(1);
    expect(g.bestStreak).toBe(6);
  });

  it("builds the practiced table sorted by questions, with averages", () => {
    const rows = skillRows([
      ev(at(12), "g5.addsub", { secs: 10 }),
      ev(at(12), "g5.equiv", { secs: 20, hints: 1, assisted: true }),
      ev(at(12), "g5.equiv", { secs: 41 }),
      ev(at(12), "recipe", { mode: "challenge" }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(["g5.equiv", "g5.addsub", "recipe"]);
    expect(rows[0]).toMatchObject({ questions: 2, firstTry: 1, firstTryPct: 50, hints: 1, hinted: 1, avgSecs: 31 });
    expect(rows[0].icon).toBe("🧱");
    expect(rows[2].title).toMatch(/^Challenge: /);
  });
});

describe("progress", () => {
  it("lists skills that reached a new level this week at their highest level", () => {
    const a = { ...newSkillState(), level: 3 as const, ready: true, dates: { exploring: "2026-09-20", practicing: "2026-10-01", independent: "2026-10-13" } };
    const b = { ...newSkillState(), level: 2 as const, dates: { exploring: "2026-10-12", practicing: "2026-10-14" } };
    const c = { ...newSkillState(), level: 2 as const, ready: true, placed: true, dates: { exploring: "2026-10-12", practicing: "2026-10-12" } };
    const d = { ...newSkillState(), level: 2 as const, dates: { exploring: "2026-10-01", practicing: "2026-10-11" } };
    state.skills = { "g5.equiv": a, "g5.addsub": b, "g5.multiply": c, "g5.decimals": d };
    const ups = levelUps(state, weekRange(0, NOW));
    expect(ups.map((u) => [u.skillId, u.levelName, u.placed])).toEqual([
      ["g5.equiv", "Independent", false],
      ["g5.multiply", "Practicing", true],
      ["g5.addsub", "Practicing", false],
    ]);
    expect(ups[0].topic).toBe("Fraction foundations");
  });

  it("says on track or behind against the target date", () => {
    state.settings.targetDate = "2027-01-13"; // 91 days = 13 weeks after Oct 14
    const ready = SKILLS.length - 26; // 26 to go → 2 a week
    SKILLS.slice(0, ready).forEach((s) => (state.skills[s.id] = { ...newSkillState(), ready: true, level: 2, dates: { practicing: "2026-01-01" } }));
    session("2026-10-01");
    const behind = pace(state, "2026-10-14");
    expect(behind.needPerWeek).toBe(2);
    expect(behind.recentPerWeek).toBe(0);
    expect(behind.status).toBe("behind");
    // 8 new skills in the last 4 weeks = 2 a week.
    SKILLS.slice(ready, ready + 8).forEach((s) => (state.skills[s.id] = { ...newSkillState(), level: 2, dates: { practicing: "2026-10-05" } }));
    const onTrack = pace(state, "2026-10-14");
    expect(onTrack.recentPerWeek).toBe(2);
    expect(onTrack.status).toBe("on-track");
    state.settings.targetDate = "2026-10-01";
    expect(pace(state, "2026-10-14").status).toBe("past");
  });
});

describe("needs attention", () => {
  const ids = (s: AppState) => buildReport(s, 0, NOW).attention.map((a) => a.id);

  it("flags a low first-try rate only with enough questions", () => {
    state.events.push(ev(at(12), "g5.addsub", { ok: false, tries: 2, assisted: true, secs: 40 }), ev(at(12), "g5.addsub", { ok: true, tries: 1, assisted: true, secs: 40 }), ev(at(12), "g5.addsub", { secs: 40 }));
    expect(ids(state)).toEqual([]);
    state.events.push(ev(at(13), "g5.addsub", { ok: false, tries: 2, assisted: true, secs: 40 }));
    expect(ids(state)).toEqual(["low-g5.addsub"]);
    // Exactly half is fine.
    state.events.push(ev(at(13), "g5.addsub", { secs: 40 }));
    expect(ids(state)).toEqual(["low-g5.addsub"]);
    state.events.push(ev(at(13), "g5.addsub", { secs: 40 }));
    expect(ids(state)).toEqual([]);
  });

  it("attaches this week's mistakes as examples and folds repeated mistakes into the same item", () => {
    for (let i = 0; i < 4; i++) state.events.push(ev(at(13), "g5.addsub", { ok: false, tries: 2, assisted: true, secs: 50 }));
    for (const [i, d] of ["2026-10-09", "2026-10-13", "2026-10-13", "2026-10-14"].entries()) state.mistakes.push({ id: `m${i}`, skillId: "g5.addsub", level: 1, prompt: `{1/2} + {1/${i + 3}}`, given: "2/5", correct: "5/6", date: d, resolved: false });
    const r = buildReport(state, 0, NOW);
    expect(r.attention.map((a) => a.id)).toEqual(["low-g5.addsub"]);
    expect(r.attention[0].examples).toHaveLength(2);
    expect(r.attention[0].examples![0].prompt).toBe("1/2 + 1/6");
  });

  it("flags the same mistake coming back three times", () => {
    for (let i = 0; i < 3; i++) state.mistakes.push({ id: `m${i}`, skillId: "g5.equiv", level: 1, prompt: "p", given: "1", correct: "2", date: "2026-10-13", resolved: i === 0 });
    expect(ids(state)).toEqual(["repeat-g5.equiv"]);
    state.mistakes.pop();
    expect(ids(state)).toEqual([]);
  });

  it("flags heavy hint use", () => {
    // 4 hints over 4 questions; the two without hints were first-try, so 50% isn't "low".
    for (let i = 0; i < 4; i++) state.events.push(ev(at(12), "g5.equiv", { assisted: i < 2, hints: i < 2 ? 2 : 0 }));
    expect(ids(state)).toEqual(["hints"]);
  });

  it("flags fast wrong answers but ignores tests", () => {
    state.events.push(ev(at(12), "g5.equiv", { ok: false, tries: 2, assisted: true, secs: 3 }), ev(at(12), "g5.addsub", { ok: false, tries: 2, assisted: true, secs: 5 }));
    state.events.push(ev(at(12), "g5.multiply", { mode: "placement", ok: false, tries: 1, assisted: true, secs: 2 }));
    expect(ids(state)).toEqual([]);
    state.events.push(ev(at(12), "g5.decimals", { ok: false, tries: 2, assisted: true, secs: 7 }));
    expect(ids(state)).toEqual(["rushing"]);
    expect(buildReport(state, 0, NOW).attention[0].detail).toMatch(/^3 wrong answers came in under 8 seconds/);
    expect(RULES.rushSecs).toBe(8);
  });

  it("points out explanations waiting for review", () => {
    state.explanations.push({ id: "x", skillId: "g5.equiv", prompt: "Why?", keyIdeas: [], exemplar: "", response: "because", date: "2026-10-13", status: "pending" });
    expect(ids(state)).toEqual(["pending-explanations"]);
    // Not in the report for a week before it was written.
    expect(buildReport(state, 1, NOW).attention.map((a) => a.id)).not.toContain("pending-explanations");
  });
});

describe("wins, tests and badges", () => {
  it("celebrates the goal, new levels and an improved checkpoint", () => {
    for (const d of ["2026-10-12", "2026-10-13", "2026-10-14"]) session(d);
    state.skills["g5.equiv"] = { ...newSkillState(), level: 3, dates: { exploring: "2026-09-01", practicing: "2026-09-02", independent: "2026-10-13" } };
    state.badges = ["independent-1"];
    const item = (ok: boolean, topic = "g5") => ({ skillId: "g5.equiv", topic, ok, prompt: "p", given: "g", correct: "c", secs: 20 });
    state.assessments.push(
      { id: "a1", kind: "checkpoint", date: "2026-09-14", minutes: 20, items: [item(true), item(false), item(false), item(false)] },
      { id: "a2", kind: "checkpoint", date: "2026-10-13", minutes: 18, items: [item(true), item(true), item(true), item(false, "g6-ns")] },
    );
    const r = buildReport(state, 0, NOW);
    expect(r.wins.map((w) => w.icon)).toEqual(expect.arrayContaining(["🎯", "🦉", "📈"]));
    expect(r.badges).toEqual(["independent-1"]);
    expect(r.tests).toHaveLength(1);
    expect(r.tests[0]).toMatchObject({ right: 3, total: 4, pct: 75, change: 50 });
    expect(r.tests[0].weakest.map((w) => w.title)).toEqual(["Fractions, decimals and number lines"]);
  });

  it("only dates badges it can actually date", () => {
    state.goalWeeks = ["2026-09-28", "2026-10-12"];
    state.badges = ["goal-1"];
    expect(badgesThisWeek(state, weekRange(0, NOW))).toEqual([]);
    expect(badgesThisWeek(state, weekRange(2, NOW))).toEqual(["goal-1"]);
  });

  it("summarizes a screener with skips", () => {
    const t = summarizeTest({ id: "s", kind: "screener-quick", date: "2026-10-13", minutes: 12, items: [
      { skillId: "a", topic: "g7-ns", ok: false, skipped: true, prompt: "", given: "", correct: "", secs: 0 },
      { skillId: "a", topic: "g7-ns", ok: false, prompt: "", given: "", correct: "", secs: 9 },
      { skillId: "b", topic: "g6-rp", ok: true, prompt: "", given: "", correct: "", secs: 9 },
      { skillId: "b", topic: "g6-rp", ok: false, prompt: "", given: "", correct: "", secs: 9 },
    ] });
    expect(t).toMatchObject({ right: 1, total: 4, skipped: 1, pct: 25, label: "Screener practice (quick)" });
    expect(t.weakest.map((w) => w.topic)).toEqual(["g7-ns", "g6-rp"]);
    expect(t.change).toBeUndefined();
  });

  it("lists this week's explanations and tutor chats", () => {
    state.explanations.push({ id: "x", skillId: "g5.equiv", prompt: "Why?", keyIdeas: [], exemplar: "", response: "because", date: "2026-10-13", status: "pass", gradedBy: "claude", rounds: [{ response: "a", verdict: "almost", feedback: "f" }, { response: "b", verdict: "got_it", feedback: "g" }] });
    state.tutorChats.push({ id: "c", date: "2026-10-04", prompt: "p", messages: [] });
    const r = buildReport(state, 0, NOW);
    expect(r.explanations).toEqual([{ id: "x", skillTitle: expect.any(String), date: "2026-10-13", status: "pass", rounds: 2, gradedBy: "claude" }]);
    expect(r.chats).toEqual([]);
    expect(buildReport(state, 2, NOW).chats).toHaveLength(1);
  });
});

describe("stats for Claude", () => {
  it("contains aggregated numbers only: no name, no student writing", () => {
    session("2026-10-13");
    state.events.push(ev(at(13), "g5.addsub", { ok: false, tries: 2, assisted: true }));
    state.mistakes.push({ id: "m", skillId: "g5.addsub", level: 1, prompt: "SECRET-PROMPT", given: "SECRET-GIVEN", correct: "5/6", date: "2026-10-13", resolved: false });
    state.explanations.push({ id: "x", skillId: "g5.equiv", prompt: "Why?", keyIdeas: [], exemplar: "", response: "SECRET-RESPONSE", date: "2026-10-13", status: "pending" });
    state.tutorChats.push({ id: "c", date: "2026-10-13", prompt: "SECRET-CHAT-PROMPT", messages: [{ role: "student", text: "SECRET-CHAT" }] });
    const json = JSON.stringify(reportStats(buildReport(state, 0, NOW)));
    expect(json).not.toMatch(/Robin|SECRET/);
    expect(json).toContain(SKILL_BY_ID["g5.addsub"].title);
  });
});
