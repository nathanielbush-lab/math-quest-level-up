import { useCallback, useRef, useState } from "react";
import { MISSIONS } from "./content/challenges";
import { SKILLS, TOPICS } from "./content";
import { COURSES, COURSE_BY_ID } from "./content/topics";
import { loadState, saveState, type AppState } from "./engine/state";

export interface Badge {
  id: string;
  icon: string;
  name: string;
  /** How to earn it, phrased for her ("Get 3 days in a row"). Shown on locked badges and in the celebration. */
  how: string;
  test: (s: AppState) => boolean;
  /** [done, goal] for the "next badge" nudge. */
  progress: (s: AppState) => [number, number];
}

const lv = (s: AppState, min: number) => Object.values(s.skills).filter((x) => x.level >= min).length;
const count = (n: number, goal: number): [number, number] => [Math.min(n, goal), goal];
const atLeast = (id: string, icon: string, name: string, how: string, n: (s: AppState) => number, goal: number): Badge => ({
  id,
  icon,
  name,
  how,
  test: (s) => n(s) >= goal,
  progress: (s) => count(n(s), goal),
});

export const BADGES: Badge[] = [
  atLeast("first-correct", "🌱", "First right answer", "Answer a question correctly", (s) => Object.values(s.skills).filter((x) => x.correct > 0).length, 1),
  atLeast("first-ready", "🔓", "Unlocked a new skill", "Practice a new skill until it unlocks the next ones", (s) => Object.values(s.skills).filter((x) => x.ready && !x.placed).length, 1),
  atLeast("independent-1", "💡", "First Independent skill", "Pass a review of a skill on a later day", (s) => lv(s, 3), 1),
  atLeast("independent-10", "🏅", "10 Independent skills", "Reach Independent on 10 skills", (s) => lv(s, 3), 10),
  atLeast("independent-25", "🏆", "25 Independent skills", "Reach Independent on 25 skills", (s) => lv(s, 3), 25),
  atLeast("explainer", "🎤", "Can explain & apply", "Explain a skill in your own words (and pass the check-back)", (s) => lv(s, 4), 1),
  atLeast("explainer-5", "🧠", "Explained 5 skills", "Reach “Can explain & apply” on 5 skills", (s) => lv(s, 4), 5),
  atLeast("streak-3", "🔥", "3-day streak", "Do a run 3 days in a row", (s) => s.streak.count, 3),
  atLeast("streak-7", "☄️", "7-day streak", "Do a run 7 days in a row", (s) => s.streak.count, 7),
  atLeast("goal-1", "🎯", "Met my weekly goal", "Hit your weekly goal of runs in one week", (s) => s.goalWeeks.length, 1),
  atLeast("goal-4", "📆", "Weekly goal 4 times", "Meet your weekly goal in 4 different weeks", (s) => s.goalWeeks.length, 4),
  atLeast("first-buy", "🛍️", "First unlock", "Spend XP in the shop", (s) => s.owned.length, 1),
  atLeast("screener-1", "📝", "First EOC practice", "Finish an EOC practice test", (s) => s.assessments.filter((a) => a.kind !== "checkpoint").length, 1),
  atLeast("checkpoint-3", "📅", "3 monthly checkpoints", "Finish the monthly checkpoint 3 times", (s) => s.assessments.filter((a) => a.kind === "checkpoint").length, 3),
  atLeast("mistake-fixer", "🛠️", "Fixed 5 old mistakes", "Get 5 questions right in Mistake replay", (s) => s.mistakes.filter((m) => m.resolved).length, 5),
  atLeast("placement", "🧭", "Found my starting point", "Finish the skip-ahead check for 5 units", (s) => Object.keys(s.placement).length, 5),
  ...TOPICS.map((t) => {
    const skills = SKILLS.filter((k) => k.topic === t.id);
    return atLeast(`topic-${t.id}`, "🎖️", `Unit cleared: ${t.title}`, `Unlock every skill in ${COURSE_BY_ID[t.course].short} Unit ${t.unit}, ${t.title}`, (s) => skills.filter((k) => s.skills[k.id]?.ready).length, skills.length);
  }),
  ...COURSES.map((c) => {
    const ids = new Set(TOPICS.filter((t) => t.course === c.id).map((t) => t.id));
    const skills = SKILLS.filter((k) => ids.has(k.topic));
    return atLeast(`course-${c.id}`, "👑", `${c.short} complete`, `Unlock every skill in ${c.name}`, (s) => skills.filter((k) => s.skills[k.id]?.ready).length, Math.max(1, skills.length));
  }),
  ...MISSIONS.map((m) => atLeast(`mission-${m.id}`, "🚩", `Mission: ${m.title}`, `Complete the “${m.title}” mission`, (s) => (s.missions[m.id]?.done ? 1 : 0), 1)),
];

/** The locked badge she's closest to, for a "next badge" nudge. */
export function nextBadge(s: AppState): { badge: Badge; done: number; goal: number } | null {
  let best: { badge: Badge; done: number; goal: number } | null = null;
  for (const b of BADGES) {
    if (s.badges.includes(b.id)) continue;
    const [done, goal] = b.progress(s);
    if (done >= goal) continue;
    const frac = done / goal;
    if (!best || frac > best.done / best.goal || (frac === best.done / best.goal && goal - done < best.goal - best.done)) best = { badge: b, done, goal };
  }
  return best;
}

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);
  const ref = useRef(state);
  const [saveFailed, setSaveFailed] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  /** Apply changes to a copy of the state, award badges, save. */
  const mutate = useCallback((fn: (s: AppState) => void) => {
    const next: AppState = structuredClone(ref.current);
    fn(next);
    const earned = BADGES.filter((b) => !next.badges.includes(b.id) && b.test(next)).map((b) => b.id);
    if (earned.length) {
      next.badges = [...next.badges, ...earned];
      setNewBadges((x) => [...x, ...earned]);
    }
    next.updatedAt = new Date().toISOString();
    ref.current = next;
    setState(next);
    setSaveFailed(!saveState(next));
  }, []);

  const replace = useCallback((s: AppState) => {
    ref.current = s;
    setState(s);
    setSaveFailed(!saveState(s));
  }, []);

  const popBadge = useCallback(() => setNewBadges((x) => x.slice(1)), []);
  return { state, mutate, replace, saveFailed, newBadges, popBadge };
}

/** A month-by-month suggestion that follows the NC school year. */
export function monthFocus(d = new Date()): { title: string; text: string } {
  const m = d.getMonth();
  if (m === 7 || m === 8) return { title: "Start of the year: lock in the basics", text: "Use the skip-ahead checks so practice starts where you are, then build a habit of short daily runs." };
  if (m === 9 || m === 10) return { title: "Fall: steady habits", text: "Keep pace with class: learn each new unit here the week it's taught, and let the warm-ups keep older skills fresh." };
  if (m === 11 || m === 0) return { title: "Semester exams: mixed review", text: "Take a monthly checkpoint and clear your Mistake replay. Mixed practice beats re-reading notes." };
  if (m >= 1 && m <= 2) return { title: "Winter: keep the streak", text: "This is when skills fade if you stop. A few runs a week keeps them yours." };
  if (m === 3 || m === 4) return { title: "EOC season", text: "If your course has an EOC, take a practice test every week or two and work on the units it flags." };
  return { title: "Summer: get ahead", text: "Preview next year's course. Starting it early makes the fall much easier." };
}
