// Shared helpers for the Math 1 units (formatting, statistics, lines).
import { frac, fmtNum, type Frac } from "../../lib/rational";
import type { Rng } from "../../lib/rng";
import type { Trap } from "../types";
import { ms } from "../helpers";

/** Display a number with a true minus sign. */
export const f = (x: number) => ms(fmtNum(x));

/** A point "(3, −2)". */
export const pt = (x: number, y: number) => `(${f(x)}, ${f(y)})`;

/** Typed syntax from display markup: true minus → "-", no spaces. */
export const typed = (s: string) => s.replace(/−/g, "-").replace(/\s+/g, "");

/** Fraction as plain inline text "−3/4" or "5". */
export const fracText = (a: Frac) => (a.d === 1 ? f(a.n) : `${a.n < 0 ? "−" : ""}${Math.abs(a.n)}/${a.d}`);

/** Stacked-fraction markup with a true minus: "−{3/4}". */
export const fracMark = (a: Frac) => (a.d === 1 ? f(a.n) : `${a.n < 0 ? "−" : ""}{${Math.abs(a.n)}/${a.d}}`);

/** Coefficient times a variable, for display: 3x, −x, x, {2/3}x, −{1/2}x. */
export function coefVar(m: Frac, v = "x"): string {
  if (m.d === 1) {
    if (m.n === 1) return v;
    if (m.n === -1) return `−${v}`;
    return `${f(m.n)}${v}`;
  }
  return `${fracMark(m)}${v}`;
}

/** Display a line y = mx + b with fraction-friendly slope: "{2/3}x − 4". */
export function lineText(m: Frac | number, b: Frac | number, v = "x"): string {
  const M = typeof m === "number" ? frac(m) : m;
  const B = typeof b === "number" ? frac(b) : b;
  const bText = B.n === 0 ? "" : `${B.n < 0 ? " − " : " + "}${fracMark(frac(Math.abs(B.n), B.d))}`;
  if (M.n === 0) return fracMark(B);
  return `${coefVar(M, v)}${bText}`;
}

/** Typed version of a line for expr answers and plot curves: "(2/3)x-4". */
export function lineTyped(m: Frac | number, b: Frac | number, v = "x"): string {
  const M = typeof m === "number" ? frac(m) : m;
  const B = typeof b === "number" ? frac(b) : b;
  const bPart = B.n === 0 ? "" : `${B.n < 0 ? "-" : "+"}${B.d === 1 ? Math.abs(B.n) : `${Math.abs(B.n)}/${B.d}`}`;
  if (M.n === 0) return B.d === 1 ? String(B.n) : `${B.n}/${B.d}`;
  const mPart = M.d === 1 ? (M.n === 1 ? "" : M.n === -1 ? "-" : String(M.n)) : `(${M.n}/${M.d})`;
  return `${mPart}${v}${bPart}`;
}

export const sortNums = (xs: number[]) => [...xs].sort((a, b) => a - b);

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function med(xs: number[]): number {
  const s = sortNums(xs);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Five-number summary, quartiles as medians of the lower and upper halves (median left out when n is odd). */
export function fiveNum(xs: number[]) {
  const s = sortNums(xs);
  const n = s.length;
  const lower = s.slice(0, Math.floor(n / 2));
  const upper = s.slice(Math.ceil(n / 2));
  return { min: s[0], q1: med(lower), median: med(s), q3: med(upper), max: s[n - 1], sorted: s, lower, upper };
}

/** Population standard deviation. */
export function sdPop(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length);
}

/** Least-squares line through points. */
export function lsrl(pts: { x: number; y: number }[]) {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  const m = sxy / sxx;
  return { m, b: my - m * mx, r: sxy / Math.sqrt(sxx * syy) };
}

/** Traps for a toleranced answer: drops any trap within the tolerance of the answer (or of each other). */
export function trapsTol(answer: number, tol: number, list: Trap[]): Trap[] {
  const out: Trap[] = [];
  for (const t of list) {
    const v = t.value.n / t.value.d;
    if (!Number.isFinite(v) || Math.abs(v - answer) <= tol + 1e-9) continue;
    if (out.some((o) => Math.abs(o.value.n / o.value.d - v) <= tol + 1e-9)) continue;
    out.push(t);
  }
  return out;
}

/** Pick k distinct items. */
export function pickN<T>(r: Rng, items: readonly T[], k: number): T[] {
  return r.shuffle(items).slice(0, k);
}

/** A tidy plot window around some x and y values. */
export function window(xs: number[], ys: number[], pad = 2) {
  const xMin = Math.floor(Math.min(0, ...xs) - pad), xMax = Math.ceil(Math.max(0, ...xs) + pad);
  const yMin = Math.floor(Math.min(0, ...ys) - pad), yMax = Math.ceil(Math.max(0, ...ys) + pad);
  return { xMin, xMax, yMin, yMax };
}

/** "an" or "a" before a word. */
export const article = (w: string) => (/^[aeiou8]/i.test(w) || /^11/.test(w) || /^18/.test(w) ? "an" : "a");

/** Percent text from a growth factor like 1.05 → "5%". */
export const pctText = (p: number) => `${fmtNum(p)}%`;

/** "3(−2)", "(−2)" for coefficient 1, "−(−2)" for −1: a coefficient times a substituted value. */
export function times(a: number, v: number): string {
  const inner = `(${f(v)})`;
  return a === 1 ? inner : a === -1 ? `−${inner}` : `${f(a)}${inner}`;
}

/** "a(x) + b(y)" with signs handled, e.g. "2(3) − 4(−1)". */
export function times2(a: number, x: number, b: number, y: number): string {
  const second = b < 0 ? ` − ${times(-b, y)}` : ` + ${times(b, y)}`;
  return `${times(a, x)}${second}`;
}
