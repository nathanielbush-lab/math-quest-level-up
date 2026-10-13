// Small helpers shared by the Math 2 units (points, figures, rounding, traps with tolerance).
import { frac, type Frac } from "../../lib/rational";
import { ms, round } from "../helpers";
import type { Answer, Trap, Visual } from "../types";
import type { Rng } from "../../lib/rng";

export const DEG = Math.PI / 180;

export type P = { x: number; y: number };

/** "(3, −2)" */
export function pt(x: number, y: number): string {
  return `(${ms(x)}, ${ms(y)})`;
}

/** Two-field answer for a point: x = …, y = … */
export function pointAns(x: number | Frac, y: number | Frac, names: [string, string] = ["x =", "y ="]): Answer {
  const f = (v: number | Frac) => (typeof v === "number" ? frac(v) : v);
  return { kind: "multi", fields: [{ value: f(x), pre: names[0] }, { value: f(y), pre: names[1] }] };
}

/** Twice the signed area of triangle abc. */
export function area2(a: P, b: P, c: P): number {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

/** A triangle with integer vertices in [lo, hi], not too thin. */
export function randTriangle(r: Rng, lo: number, hi: number): [P, P, P] {
  for (;;) {
    const a = { x: r.int(lo, hi), y: r.int(lo, hi) };
    const b = { x: r.int(lo, hi), y: r.int(lo, hi) };
    const c = { x: r.int(lo, hi), y: r.int(lo, hi) };
    const A = Math.abs(area2(a, b, c));
    const d = (p: P, q: P) => Math.hypot(p.x - q.x, p.y - q.y);
    if (A >= 6 && d(a, b) >= 2 && d(b, c) >= 2 && d(a, c) >= 2) return [a, b, c];
  }
}

/** Traps for an answer accepted within a tolerance: drop any trap that would be marked right. */
export function tolTraps(answer: number, tol: number, list: Trap[]): Trap[] {
  const out: Trap[] = [];
  for (const t of list) {
    const v = t.value.n / t.value.d;
    if (!Number.isFinite(v) || Math.abs(v - answer) <= tol + 1e-6) continue;
    if (out.some((o) => Math.abs(o.value.n / o.value.d - v) <= tol + 1e-6)) continue;
    out.push(t);
  }
  return out;
}

export const r1 = (x: number) => round(x, 1);
export const r2 = (x: number) => round(x, 2);

/** Number to one decimal place as display text with a true minus. */
export function d1(x: number): string {
  return ms(r1(x));
}

/** Degrees display: 35°. */
export function deg(x: number): string {
  return `${ms(round(x, 1))}°`;
}

/** Coordinate-plane figure: polygons from named points, plus optional dashed lines through two points. */
export function plane(points: Record<string, P>, polygons: string[][], lines: { from: P; to: P; label: string }[] = []): Visual {
  const pts: Record<string, P> = { ...points };
  const segments: { from: string; to: string; dashed?: boolean; label?: string }[] = [];
  lines.forEach((l, i) => {
    // Line ends are named by the line's label and a blank name, so only one label shows.
    const a = l.label, b = " ".repeat(i + 1);
    pts[a] = l.from;
    pts[b] = l.to;
    segments.push({ from: b, to: a, dashed: true });
  });
  return { type: "geo", points: pts, polygons, segments, showLabels: true, grid: true };
}

/** gcd for positive integers. */
export function g(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction text a/b (stacked) in lowest terms with true minus. */
export function fracText(n: number, d: number): string {
  const f = frac(n, d);
  if (f.d === 1) return ms(f.n);
  return f.n < 0 ? `−{${-f.n}/${f.d}}` : `{${f.n}/${f.d}}`;
}

/** Plain a/b text for choices. */
export function fracPlain(n: number, d: number): string {
  const f = frac(n, d);
  if (f.d === 1) return ms(f.n);
  return `${ms(f.n)}/${f.d}`;
}

export const PRIME = "′";
