// Small helpers shared by the Math 3 units (display of π, exact trig values, rounded-answer traps).
import { prettyExpr } from "../../lib/expr";
import { fmtNum } from "../../lib/rational";
import { trap } from "../helpers";
import type { Trap } from "../types";

/** Pretty display of a typed expression: "log_2(x-3)+1" → "log_2(x − 3) + 1". */
export const pe = (s: string) => prettyExpr(s);

/** Rounded number with a true minus sign. */
export function dn(x: number, places = 2): string {
  const s = fmtNum(x, places);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

/** Unicode powers for use inside stacked fractions (where ^ markup isn't read). */
export function uni(s: string): string {
  return s.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\^4/g, "⁴");
}

/** Traps for an answer checked with a tolerance: drops any trap that would be accepted as correct. */
export function trapsTol(answer: number, tol: number, list: [number, string][]): Trap[] {
  const out: Trap[] = [];
  for (const [v, text] of list) {
    if (!Number.isFinite(v)) continue;
    const rv = Math.round(v * 100) / 100;
    if (Math.abs(rv - answer) <= tol * 2 + 1e-9) continue;
    if (out.some((t) => Math.abs(t.value.n / t.value.d - rv) <= tol * 2)) continue;
    out.push(trap(rv, text));
  }
  return out;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** An angle n·π/d, reduced. */
export interface PiAngle {
  n: number;
  d: number;
}

export function piReduce(n: number, d: number): PiAngle {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/** Display markup: π, {π/3}, {5π/6}, −{π/4}, 2π. */
export function piText(n: number, d: number): string {
  const a = piReduce(n, d);
  if (a.n === 0) return "0";
  const sign = a.n < 0 ? "−" : "";
  const k = Math.abs(a.n);
  const top = `${k === 1 ? "" : k}π`;
  return a.d === 1 ? `${sign}${top}` : `${sign}{${top}/${a.d}}`;
}

/** Plain (non-stacked) text for choices: "5π/6". */
export function piPlain(n: number, d: number): string {
  const a = piReduce(n, d);
  if (a.n === 0) return "0";
  const sign = a.n < 0 ? "−" : "";
  const k = Math.abs(a.n);
  const top = `${k === 1 ? "" : k}π`;
  return a.d === 1 ? `${sign}${top}` : `${sign}${top}/${a.d}`;
}

/** Typed syntax: "5pi/6". */
export function piTyped(n: number, d: number): string {
  const a = piReduce(n, d);
  if (a.n === 0) return "0";
  const k = Math.abs(a.n);
  const top = `${a.n < 0 ? "-" : ""}${k === 1 ? "" : k}pi`;
  return a.d === 1 ? top : `${top}/${a.d}`;
}

/** Exact value of sin or cos at a multiple of π/6 or π/4: typed form and display markup. */
export function trigExact(v: number): { typed: string; display: string; plain: string } {
  const s = v < -1e-9 ? -1 : 1;
  const a = Math.abs(v);
  const neg = s < 0;
  const m = neg ? "-" : "";
  const md = neg ? "−" : "";
  if (a < 1e-9) return { typed: "0", display: "0", plain: "0" };
  if (Math.abs(a - 1) < 1e-9) return { typed: `${m}1`, display: `${md}1`, plain: `${md}1` };
  if (Math.abs(a - 0.5) < 1e-9) return { typed: `${m}1/2`, display: `${md}{1/2}`, plain: `${md}1/2` };
  if (Math.abs(a - Math.SQRT2 / 2) < 1e-9) return { typed: `${m}sqrt(2)/2`, display: `${md}{√2/2}`, plain: `${md}√2/2` };
  if (Math.abs(a - Math.sqrt(3) / 2) < 1e-9) return { typed: `${m}sqrt(3)/2`, display: `${md}{√3/2}`, plain: `${md}√3/2` };
  throw new Error(`not a special value: ${v}`);
}

/** Linear expression in typed syntax: lin(2, -3) → "2x-3". */
export function linT(m: number, b: number, v = "x"): string {
  const mm = m === 1 ? "" : m === -1 ? "-" : String(m);
  const head = m === 0 ? "" : `${mm}${v}`;
  if (b === 0) return head || "0";
  if (!head) return String(b);
  return `${head}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}

/** "x − 3" / "x + 2" / "x" (no parentheses) for display. */
export function xm(h: number, v = "x"): string {
  if (h === 0) return v;
  return `${v} ${h > 0 ? "−" : "+"} ${fmtNum(Math.abs(h))}`;
}

/** Typed "x-3" / "x+2" / "x". */
export function xmT(h: number, v = "x"): string {
  if (h === 0) return v;
  return `${v}${h > 0 ? "-" : "+"}${fmtNum(Math.abs(h))}`;
}

/** Coefficient prefix for display: 1 → "", −1 → "−", 3 → "3". */
export function coef(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "−";
  return a < 0 ? `−${fmtNum(-a)}` : fmtNum(a);
}

/** Coefficient prefix for typed syntax. */
export function coefT(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return `${fmtNum(a)}*`;
}

/** Sign word for shifts. */
export const plural = (n: number, w: string) => `${n} ${w}${Math.abs(n) === 1 ? "" : "s"}`;
