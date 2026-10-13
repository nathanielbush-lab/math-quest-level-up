// Ranks from all XP ever earned. Spending XP in the shop never lowers a rank.

export interface Rank {
  level: number;
  name: string;
  /** XP needed to reach this rank. */
  from: number;
  /** XP needed for the next rank. */
  to: number;
}

const NAMES = ["Rookie", "Apprentice", "Solver", "Analyst", "Strategist", "Theorist", "Architect", "Prodigy", "Mastermind", "Legend"];
const THRESHOLDS = [0, 250, 700, 1400, 2400, 3800, 5600, 8000, 11000, 15000];
const LEGEND_STEP = 5000;

export function rankFor(totalXp: number): Rank {
  const xp = Math.max(0, totalXp);
  let i = THRESHOLDS.length - 1;
  while (i > 0 && xp < THRESHOLDS[i]) i--;
  if (i < THRESHOLDS.length - 1) return { level: i + 1, name: NAMES[i], from: THRESHOLDS[i], to: THRESHOLDS[i + 1] };
  // Past Legend: Legend II, III… every 5,000 XP.
  const extra = Math.floor((xp - THRESHOLDS[i]) / LEGEND_STEP);
  const from = THRESHOLDS[i] + extra * LEGEND_STEP;
  return { level: i + 1 + extra, name: extra ? `Legend ${roman(extra + 1)}` : "Legend", from, to: from + LEGEND_STEP };
}

function roman(n: number): string {
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}
