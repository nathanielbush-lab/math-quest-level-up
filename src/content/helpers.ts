import { frac, fmtFrac, fmtNum, type Frac } from "../lib/rational";
import type { Rng } from "../lib/rng";
import type { Answer, Trap } from "./types";

export const F = frac;

/** Number answer from an integer, decimal or fraction. */
export function num(v: number | Frac, opts: { tolerance?: number; simplest?: boolean; unit?: string; pre?: string } = {}): Answer {
  return { kind: "number", value: typeof v === "number" ? frac(v) : v, ...opts };
}

/**
 * Multiple choice. `correct` is the right option; `wrong` are distractors with optional feedback.
 * Options are shuffled; duplicates are dropped.
 */
export function choice(rng: Rng, correct: string, wrong: (string | [string, string])[], keepOrder = false): Answer {
  const seen = new Set([correct]);
  const opts: { text: string; fb?: string; ok: boolean }[] = [{ text: correct, ok: true }];
  for (const w of wrong) {
    const [text, fb] = Array.isArray(w) ? w : [w, undefined];
    if (seen.has(text)) continue;
    seen.add(text);
    opts.push({ text, fb, ok: false });
  }
  // "keepOrder" lists options alphabetically so the right answer's position never gives it away.
  const order = keepOrder ? [...opts].sort((a, b) => a.text.localeCompare(b.text)) : rng.shuffle(opts);
  return {
    kind: "choice",
    choices: order.map((o) => o.text),
    correct: order.findIndex((o) => o.ok),
    feedback: order.map((o) => o.fb),
  };
}

export function trap(value: number | Frac, feedback: string): Trap {
  return { value: typeof value === "number" ? frac(value) : value, feedback };
}

/** Removes traps that accidentally equal the right answer. */
export function traps(answer: Frac, list: Trap[]): Trap[] {
  const out: Trap[] = [];
  for (const t of list) {
    if (t.value.n * answer.d === answer.n * t.value.d) continue;
    if (out.some((o) => o.value.n * t.value.d === t.value.n * o.value.d)) continue;
    out.push(t);
  }
  return out;
}

/** Inline stacked fraction markup understood by <MathText>. */
export function fr(a: Frac | number, b?: number): string {
  if (typeof a === "number") return b === undefined ? String(a) : `{${a}/${b}}`;
  if (a.d === 1) return String(a.n);
  return a.n < 0 ? `-{${-a.n}/${a.d}}` : `{${a.n}/${a.d}}`;
}

/** Mixed-number markup: 2{1/3}. */
export function mixed(a: Frac): string {
  if (a.d === 1 || Math.abs(a.n) < a.d) return fr(a);
  const w = Math.trunc(Math.abs(a.n) / a.d);
  const r = Math.abs(a.n) % a.d;
  return `${a.n < 0 ? "-" : ""}${w}{${r}/${a.d}}`;
}

export function money(x: number): string {
  const s = Math.abs(x).toFixed(2);
  return `${x < 0 ? "-" : ""}$${s}`;
}

/** Signed number with a true minus sign and parentheses when negative, for use inside expressions. */
export function sn(x: number | string): string {
  const v = typeof x === "number" ? fmtNum(x) : x;
  return v.startsWith("-") ? `(−${v.slice(1)})` : v;
}

/** Number with a true minus sign. */
export function ms(x: number | string): string {
  const v = typeof x === "number" ? fmtNum(x) : x;
  return v.startsWith("-") ? `−${v.slice(1)}` : v;
}

/** Plain fraction text for choices (no stacking): "3/4". */
export function ft(a: Frac): string {
  return fmtFrac(a).replace("-", "−");
}

/** Term like "3x", "−x", "x" for algebra display. */
export function term(coef: number, v: string, first = true): string {
  const sign = coef < 0 ? (first ? "−" : " − ") : first ? "" : " + ";
  const a = Math.abs(coef);
  return `${sign}${a === 1 ? "" : fmtNum(a)}${v}`;
}

/** Constant term with spacing: " + 5", " − 3". */
export function cst(c: number, first = false): string {
  if (first) return ms(c);
  if (c === 0) return "";
  return c < 0 ? ` − ${fmtNum(-c)}` : ` + ${fmtNum(c)}`;
}

export function linear(m: number, b: number, v = "x"): string {
  if (m === 0) return ms(b);
  return `${term(m, v)}${cst(b)}`;
}

export const NAMES = ["Maya", "Leo", "Priya", "Sam", "Ava", "Diego", "Zoe", "Kai", "Nora", "Eli", "Ruby", "Omar", "Lily", "Jonah", "Mei", "Theo"];

export function round(x: number, places: number): number {
  const p = 10 ** places;
  return Math.round((x + Number.EPSILON) * p) / p;
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- High-school helpers ----------

/** Typed-expression answer: expr("x^2+5x+6", { form: "expanded" }). Values use plain typed syntax. */
export function expr(value: string, opts: { vars?: string[]; form?: "factored" | "expanded" | "vertex"; lhs?: string; exact?: boolean; display?: string; pre?: string; post?: string } = {}): Answer {
  return { kind: "expr", value, vars: opts.vars ?? ["x"], ...opts };
}

/** Exact constant answer such as "3sqrt(2)" or "4pi" (decimals get an "almost: give the exact value" nudge). */
export function exact(value: string, display?: string): Answer {
  return { kind: "expr", value, vars: [], exact: true, display };
}

function polyTerms(coefs: number[], v: string, pretty: boolean): string {
  const deg = coefs.length - 1;
  let out = "";
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const a = Math.abs(c);
    const coef = p > 0 && a === 1 ? "" : fmtNum(a);
    const pow = p === 0 ? "" : p === 1 ? v : `${v}^${p}`;
    const sign = c < 0 ? (out ? (pretty ? " − " : "-") : pretty ? "−" : "-") : out ? (pretty ? " + " : "+") : "";
    out += `${sign}${coef}${pow}`;
  });
  return out || "0";
}

/** Polynomial display markup, highest power first: poly([2, -3, 1]) → "2x^2 − 3x + 1". */
export function poly(coefs: number[], v = "x"): string {
  return polyTerms(coefs, v, true);
}

/** The same polynomial in typed syntax, for expr answers and plot curves: "2x^2-3x+1". */
export function polyExpr(coefs: number[], v = "x"): string {
  return polyTerms(coefs, v, false);
}

/** "(x − 3)" / "(x + 2)" for factored forms (r is the root). */
export function binom(r: number, v = "x"): string {
  return r === 0 ? v : `(${v} ${r > 0 ? "−" : "+"} ${fmtNum(Math.abs(r))})`;
}

/** Typed-syntax version of binom: "(x-3)". */
export function binomExpr(r: number, v = "x"): string {
  return r === 0 ? v : `(${v}${r > 0 ? "-" : "+"}${fmtNum(Math.abs(r))})`;
}

/** Simplified radical a√b (b square-free) for √n: radical(18) → { a: 3, b: 2 }. */
export function radical(n: number): { a: number; b: number } {
  let a = 1, b = n;
  for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; }
  return { a, b };
}

/** Display markup for a√b: "3√2", "√5", "4". */
export function radText(a: number, b: number): string {
  if (b === 1) return String(a);
  return `${a === 1 ? "" : a}√${b}`;
}
