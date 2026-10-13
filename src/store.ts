import { useCallback, useRef, useState } from "react";
import { MISSIONS } from "./content/challenges";
import { SKILLS, TOPICS } from "./content";
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
  atLeast("independent-1", "🦉", "First Independent skill", "Pass a review of a skill on a later day", (s) => lv(s, 3), 1),
  atLeast("independent-10", "🏅", "10 Independent skills", "Reach Independent on 10 skills", (s) => lv(s, 3), 10),
  atLeast("independent-25", "🏆", "25 Independent skills", "Reach Independent on 25 skills", (s) => lv(s, 3), 25),
  atLeast("explainer", "🎤", "Can explain & apply", "Explain a skill in your own words (and pass the check-back)", (s) => lv(s, 4), 1),
  atLeast("explainer-5", "👩‍🏫", "Explained 5 skills", "Reach “Can explain & apply” on 5 skills", (s) => lv(s, 4), 5),
  atLeast("streak-3", "🔥", "3-day streak", "Do a quest 3 days in a row", (s) => s.streak.count, 3),
  atLeast("streak-7", "☄️", "7-day streak", "Do a quest 7 days in a row", (s) => s.streak.count, 7),
  atLeast("goal-1", "🎯", "Met my weekly goal", "Do your weekly goal of quests in one week", (s) => s.goalWeeks.length, 1),
  atLeast("goal-4", "📆", "Weekly goal 4 times", "Meet your weekly goal in 4 different weeks", (s) => s.goalWeeks.length, 4),
  atLeast("first-buy", "🛍️", "First shop treat", "Spend stars in the shop", (s) => s.owned.length, 1),
  atLeast("screener-1", "📝", "Took a practice screener", "Finish a screener practice", (s) => s.assessments.filter((a) => a.kind !== "checkpoint").length, 1),
  atLeast("checkpoint-3", "📅", "3 monthly checkpoints", "Finish the monthly checkpoint 3 times", (s) => s.assessments.filter((a) => a.kind === "checkpoint").length, 3),
  atLeast("mistake-fixer", "🛠️", "Fixed 5 old mistakes", "Get 5 questions right from your mistake journal", (s) => s.mistakes.filter((m) => m.resolved).length, 5),
  atLeast("placement", "🧭", "Found my starting point", "Finish the starting-point check for 5 topics", (s) => Object.keys(s.placement).length, 5),
  ...TOPICS.map((t) => {
    const skills = SKILLS.filter((k) => k.topic === t.id);
    return atLeast(`topic-${t.id}`, t.icon, `Topic star: ${t.title}`, `Unlock every skill in ${t.title}`, (s) => skills.filter((k) => s.skills[k.id]?.ready).length, skills.length);
  }),
  ...MISSIONS.map((m) => atLeast(`mission-${m.id}`, "🚩", `Mission: ${m.title}`, `Complete the “${m.title}” stage challenge`, (s) => (s.missions[m.id]?.done ? 1 : 0), 1)),
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

/** The roadmap's month-by-month suggestion. */
export function monthFocus(d = new Date()): { title: string; text: string } {
  const m = d.getMonth();
  if (m === 9) return { title: "October: diagnose and build connections", text: "Check Grades 6–8 in short sessions. Begin fraction division, decimals, ratios, rates and percents. Start a geometry or data topic alongside." };
  if (m === 10) return { title: "November: strengthen algebra", text: "Signed numbers, expressions, equations, inequalities and proportions. Continue scale drawings, circles, data and probability." };
  if (m === 11) return { title: "December: reach Grade 8 ideas", text: "Powers and roots, functions, slope and systems as foundations permit. Include transformations, Pythagorean reasoning, solid volumes and data relationships." };
  if (m === 0) return { title: "Early January: review and retain", text: "Mixed problems and revisiting earlier errors. Treat unlearned topics as learning needs, not failures." };
  return { title: "Keep building", text: "Short, regular sessions: review, learn something new, then try an unfamiliar problem." };
}
