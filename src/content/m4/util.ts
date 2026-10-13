// Shared helpers for the NC Math 4 units (statistics functions, rounding, polynomial algebra, traps with tolerance).
import { frac } from "../../lib/rational";
import type { Rng } from "../../lib/rng";
import type { Trap } from "../types";

// ---------- Rounding and display ----------

/** Rounds to `p` decimal places and prints with a true minus sign (no trailing zeros). */
export function dec(x: number, p = 4): string {
  const v = Number((Math.round((x + Math.sign(x) * 1e-12) * 10 ** p) / 10 ** p).toFixed(p));
  const s = String(Object.is(v, -0) ? 0 : v);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

/** Rounds to `p` places, keeping trailing zeros (0.3000): useful for probabilities. */
export function fix(x: number, p = 4): string {
  const s = (Math.round((x + Math.sign(x) * 1e-12) * 10 ** p) / 10 ** p).toFixed(p);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

export function rnd(x: number, p: number): number {
  return Math.round((x + Math.sign(x) * 1e-12) * 10 ** p) / 10 ** p;
}

/** Percent text from a proportion: pct(0.425) → "42.5%". */
export function pct(p: number, places = 1): string {
  return `${dec(p * 100, places)}%`;
}

/** Signed term for display after a first term: " + 3" or " − 3". */
export function plusMinus(x: number, p = 4): string {
  return x < 0 ? ` − ${dec(-x, p)}` : ` + ${dec(x, p)}`;
}

/**
 * Traps for a rounded answer: drops any trap within the tolerance of the answer (it would be marked right)
 * or of another trap, and any that isn't a finite number.
 */
export function tolTraps(answer: number, tol: number, list: [number, string][]): Trap[] {
  const out: Trap[] = [];
  const gap = tol * 2 + 1e-9;
  for (const [v, feedback] of list) {
    if (!Number.isFinite(v)) continue;
    if (Math.abs(v - answer) <= gap) continue;
    if (out.some((o) => Math.abs(o.value.n / o.value.d - v) <= gap)) continue;
    out.push({ value: frac(Number(v.toFixed(6))), feedback });
  }
  return out;
}

// ---------- Probability ----------

function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

/** Standard normal cumulative probability P(Z < z). */
export function normCdf(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/** Inverse standard normal: the z with P(Z < z) = p (Acklam's method). */
export function invNorm(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) return -invNorm(1 - p);
  const q = p - 0.5, s = q * q;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * q) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}

export function nCk(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let out = 1;
  for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i;
  return Math.round(out);
}

export function binomPmf(n: number, k: number, p: number): number {
  return nCk(n, k) * p ** k * (1 - p) ** (n - k);
}

/** One simulated binomial count using the seeded generator. */
export function simBinomial(r: Rng, n: number, p: number): number {
  let k = 0;
  for (let i = 0; i < n; i++) if (r.next() < p) k++;
  return k;
}

// ---------- Polynomials (coefficients highest power first) ----------

function lowFirst(c: number[]): number[] {
  return [...c].reverse();
}

export function polyAdd(a: number[], b: number[]): number[] {
  const A = lowFirst(a), B = lowFirst(b);
  const out = Array.from({ length: Math.max(A.length, B.length) }, (_, i) => (A[i] ?? 0) + (B[i] ?? 0));
  return trim(out.reverse());
}

export function polyMul(a: number[], b: number[]): number[] {
  const A = lowFirst(a), B = lowFirst(b);
  const out = new Array(A.length + B.length - 1).fill(0);
  A.forEach((x, i) => B.forEach((y, j) => (out[i + j] += x * y)));
  return trim(out.reverse());
}

/** f(g(x)) for polynomials f and g. */
export function polyCompose(f: number[], g: number[]): number[] {
  let out = [0];
  for (const c of f) out = polyAdd(polyMul(out, g), [c]);
  return out;
}

export function polyEval(c: number[], x: number): number {
  return c.reduce((acc, k) => acc * x + k, 0);
}

function trim(c: number[]): number[] {
  let i = 0;
  while (i < c.length - 1 && c[i] === 0) i++;
  return c.slice(i);
}

export const PEOPLE = ["Maya", "Leo", "Priya", "Sam", "Ava", "Diego", "Zoe", "Kai", "Nora", "Eli", "Ruby", "Omar", "Lily", "Jonah", "Mei", "Theo", "Jada", "Marcus", "Sofia", "Andre"];
