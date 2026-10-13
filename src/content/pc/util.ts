// Shared helpers for the Pre-Calculus units: angles as multiples of π, exact trig values,
// unit-circle and triangle figures, and traps for rounded answers.
import { frac, gcd, fmtNum, type Frac } from "../../lib/rational";
import { exact, num } from "../helpers";
import type { Answer, Trap, Visual } from "../types";

// ---------- Angles k·π/d ----------

export interface Ang {
  n: number;
  d: number;
}

export function ang(n: number, d = 1): Ang {
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const angV = (a: Ang) => (a.n * Math.PI) / a.d;
export const angDeg = (a: Ang) => (180 * a.n) / a.d;
export const fromDeg = (deg: number) => ang(deg, 180);

/** Stacked display: {5π/6}, −{π/3}, 2π, 0. */
export function angText(a: Ang): string {
  if (a.n === 0) return "0";
  const sg = a.n < 0 ? "−" : "";
  const k = Math.abs(a.n);
  const top = k === 1 ? "π" : `${k}π`;
  return a.d === 1 ? `${sg}${top}` : `${sg}{${top}/${a.d}}`;
}

/** Inline display for choices: 5π/6, −π/3. */
export function angInline(a: Ang): string {
  if (a.n === 0) return "0";
  const sg = a.n < 0 ? "−" : "";
  const k = Math.abs(a.n);
  return `${sg}${k === 1 ? "" : k}π${a.d === 1 ? "" : "/" + a.d}`;
}

/** Typed syntax: 5pi/6, -pi/3. */
export function angExpr(a: Ang): string {
  if (a.n === 0) return "0";
  const k = Math.abs(a.n);
  return `${a.n < 0 ? "-" : ""}${k === 1 ? "" : k}pi${a.d === 1 ? "" : "/" + a.d}`;
}

/** Exact-answer for an angle. */
export function angAns(a: Ang): Answer {
  return a.n === 0 ? num(0) : exact(angExpr(a), angText(a));
}

/** Angle reduced to [0, 2π). */
export function norm(a: Ang): Ang {
  const per = 2 * a.d;
  return ang(((a.n % per) + per) % per, a.d);
}

export const addAng = (a: Ang, b: Ang) => ang(a.n * b.d + b.n * a.d, a.d * b.d);
export const subAng = (a: Ang, b: Ang) => ang(a.n * b.d - b.n * a.d, a.d * b.d);

/** Quadrant 1–4 of an angle in standard position (0 for quadrantal angles). */
export function quadrant(a: Ang): number {
  const t = norm(a);
  const x = t.n / t.d; // in units of π
  if (x === 0 || x === 0.5 || x === 1 || x === 1.5) return 0;
  return x < 0.5 ? 1 : x < 1 ? 2 : x < 1.5 ? 3 : 4;
}

/** Reference angle (in [0, π/2]). */
export function refAng(a: Ang): Ang {
  const t = norm(a);
  const x = t.n / t.d;
  if (x <= 0.5) return t;
  if (x <= 1) return ang(t.d - t.n, t.d);
  if (x <= 1.5) return ang(t.n - t.d, t.d);
  return ang(2 * t.d - t.n, t.d);
}

export const QUAD = ["on an axis", "Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"];

// ---------- Exact values ----------

export interface Ex {
  v: number;
  /** Display markup (stacked fractions). */
  text: string;
  /** Inline text for choices. */
  inline: string;
  /** Typed syntax. */
  typed: string;
  /** Present when the value is rational. */
  q?: Frac;
}

const R2 = Math.SQRT2, R3 = Math.sqrt(3);
const BASE: Ex[] = [
  { v: 0, text: "0", inline: "0", typed: "0", q: frac(0) },
  { v: 0.5, text: "{1/2}", inline: "1/2", typed: "1/2", q: frac(1, 2) },
  { v: 1, text: "1", inline: "1", typed: "1", q: frac(1) },
  { v: 2, text: "2", inline: "2", typed: "2", q: frac(2) },
  { v: R2 / 2, text: "{√2/2}", inline: "√2/2", typed: "sqrt(2)/2" },
  { v: R3 / 2, text: "{√3/2}", inline: "√3/2", typed: "sqrt(3)/2" },
  { v: R3 / 3, text: "{√3/3}", inline: "√3/3", typed: "sqrt(3)/3" },
  { v: R3, text: "√3", inline: "√3", typed: "sqrt(3)" },
  { v: R2, text: "√2", inline: "√2", typed: "sqrt(2)" },
  { v: (2 * R3) / 3, text: "{2√3/3}", inline: "2√3/3", typed: "2sqrt(3)/3" },
];

/** Exact form of a special trig value (throws if it isn't one). */
export function exOf(x: number): Ex {
  const b = BASE.find((e) => Math.abs(Math.abs(x) - e.v) < 1e-9);
  if (!b) throw new Error(`no exact value for ${x}`);
  if (x > 0 || b.v === 0) return b;
  return { v: -b.v, text: "−" + b.text, inline: "−" + b.inline, typed: "-" + b.typed, q: b.q ? frac(-b.q.n, b.q.d) : undefined };
}

export type TrigFn = "sin" | "cos" | "tan" | "csc" | "sec" | "cot";

export function trigNum(fn: TrigFn, x: number): number {
  switch (fn) {
    case "sin": return Math.sin(x);
    case "cos": return Math.cos(x);
    case "tan": return Math.tan(x);
    case "csc": return 1 / Math.sin(x);
    case "sec": return 1 / Math.cos(x);
    case "cot": return Math.cos(x) / Math.sin(x);
  }
}

/** Exact value of fn at a special angle, or null where the function is not defined. */
export function trigEx(fn: TrigFn, a: Ang): Ex | null {
  const x = angV(a);
  const s = Math.sin(x), c = Math.cos(x);
  const zs = Math.abs(s) < 1e-9, zc = Math.abs(c) < 1e-9;
  if ((fn === "tan" || fn === "sec") && zc) return null;
  if ((fn === "cot" || fn === "csc") && zs) return null;
  if (fn === "cot" && zc) return exOf(0);
  if (fn === "tan" && zs) return exOf(0);
  return exOf(trigNum(fn, x));
}

/** Number answer for rational values, exact answer otherwise. */
export function exAns(e: Ex): Answer {
  return e.q ? num(e.q) : exact(e.typed, e.text);
}

// ---------- Rounded answers ----------

export const round = (x: number, p = 1) => Math.round((x + Math.sign(x) * 1e-12) * 10 ** p) / 10 ** p;
export const f1 = (x: number) => fmtNum(round(x, 1)).replace(/^-/, "−");
export const f2 = (x: number) => fmtNum(round(x, 2)).replace(/^-/, "−");
export const fx = (x: number, p = 4) => fmtNum(x, p).replace(/^-/, "−");

/** Traps for answers checked with a tolerance: drops any trap close enough to count as correct. */
export function trapsTol(ans: number, tol: number, list: Trap[]): Trap[] {
  const out: Trap[] = [];
  for (const t of list) {
    const v = t.value.n / t.value.d;
    if (!Number.isFinite(v) || Math.abs(v - ans) <= 2 * tol + 1e-9) continue;
    if (out.some((o) => Math.abs(o.value.n / o.value.d - v) <= 2 * tol + 1e-9)) continue;
    out.push(t);
  }
  return out;
}

export const DEG = "°";
export const rad = (deg: number) => (deg * Math.PI) / 180;
export const degOf = (x: number) => (x * 180) / Math.PI;

// ---------- Figures ----------

/** Unit circle with the terminal side of angle a (radians) and point P. */
export function unitCircle(a: Ang | number, label = "θ"): Visual {
  const x = typeof a === "number" ? a : angV(a);
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, X: { x: 1, y: 0 }, P: { x: Math.cos(x), y: Math.sin(x) }, L: { x: -1.25, y: 0 }, R: { x: 1.25, y: 0 }, D: { x: 0, y: -1.25 }, U: { x: 0, y: 1.25 } },
    circles: [{ center: "O", r: 1 }],
    segments: [{ from: "L", to: "R", dashed: true }, { from: "D", to: "U", dashed: true }, { from: "O", to: "P", label: "1" }],
    angles: [{ at: "O", from: "X", to: "P", label }],
  };
}

/**
 * Triangle ABC from its side lengths and angle A (degrees), with chosen labels.
 * A at the origin, B on the positive x-axis.
 */
export function triangleFig(b: number, c: number, A: number, labels: { a?: string; b?: string; c?: string; A?: string; B?: string; C?: string }): Visual {
  const C = { x: b * Math.cos(rad(A)), y: b * Math.sin(rad(A)) };
  return {
    type: "geo",
    showLabels: true,
    points: { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C },
    polygons: [["A", "B", "C"]],
    segments: [
      ...(labels.a ? [{ from: "B", to: "C", label: labels.a }] : []),
      ...(labels.b ? [{ from: "A", to: "C", label: labels.b }] : []),
      ...(labels.c ? [{ from: "A", to: "B", label: labels.c }] : []),
    ],
    angles: [
      ...(labels.A ? [{ at: "A", from: "B", to: "C", label: labels.A }] : []),
      ...(labels.B ? [{ at: "B", from: "C", to: "A", label: labels.B }] : []),
      ...(labels.C ? [{ at: "C", from: "A", to: "B", label: labels.C }] : []),
    ],
  };
}

/** "+ 3" / "− 3" for typed expressions. */
export const plusExpr = (c: number) => (c === 0 ? "" : c < 0 ? `-${fmtNum(-c)}` : `+${fmtNum(c)}`);
/** "(x − 3)" style shift inside a function, display. h is the shift; returns "x" when 0. */
export const shiftText = (h: number, v = "x") => (h === 0 ? v : `${v} ${h > 0 ? "−" : "+"} ${fmtNum(Math.abs(h))}`);
export const shiftExpr = (h: number, v = "x") => (h === 0 ? v : `${v}${h > 0 ? "-" : "+"}${fmtNum(Math.abs(h))}`);
