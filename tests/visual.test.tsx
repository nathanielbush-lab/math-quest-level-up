import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Visual, sampleCurve } from "../src/components/Visual";
import type { Visual as V } from "../src/content/types";
import { parseExpr } from "../src/lib/expr";

const html = (v: V) => renderToStaticMarkup(<Visual v={v} />);
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
const clean = (s: string) => {
  expect(s).not.toMatch(/NaN|undefined|Infinity|null/);
  expect(s).toMatch(/role="img"/);
  expect(s).toMatch(/aria-label="[^"]{10,}"/);
};

describe("plot", () => {
  it("draws a shaded parabola with axes, ticks and labels", () => {
    const s = html({ type: "plot", xMin: -5, xMax: 5, yMin: -6, yMax: 8, curves: [{ expr: "x^2-4", shade: "below", dashed: true, label: "y < x² − 4" }], points: [{ x: 2, y: 0, label: "(2, 0)" }, { x: 0, y: -4, open: true }] });
    clean(s);
    expect(s).toContain("clipPath");
    expect(s).toContain('fill-opacity="0.18"');
    expect(s).toContain('stroke-dasharray="7 5"');
    expect(s).toContain("(2, 0)");
    expect(s).toContain("y &lt; x² − 4");
    expect(s).toContain(">−4<");
    expect(count(s, /<circle/g)).toBe(2);
  });

  it("breaks 1/(x-2) at its asymptote", () => {
    const v: V = { type: "plot", xMin: -4, xMax: 6, yMin: -5, yMax: 5, curves: [{ expr: "1/(x-2)" }], vlines: [{ x: 2, dashed: true, label: "x = 2" }], hlines: [{ y: 0 }] };
    const s = html(v);
    clean(s);
    expect(s).toContain("x = 2");
    expect(sampleCurve(parseExpr("1/(x-2)"), -4, 6, -5, 5)).toHaveLength(2);
    // Two curve pieces (stroke-width 2.6) — no vertical line across the asymptote.
    expect(count(s, /stroke-width="2.6"/g)).toBe(2);
  });

  it("labels π ticks and splits tan x into branches", () => {
    const s = html({ type: "plot", xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -4, yMax: 4, xStep: Math.PI / 2, curves: [{ expr: "tan(x)", color: 2 }] });
    clean(s);
    for (const t of [">π/2<", ">π<", ">3π/2<", ">2π<", ">−π/2<", ">−2π<"]) expect(s).toContain(t);
    expect(sampleCurve(parseExpr("tan(x)"), -2 * Math.PI, 2 * Math.PI, -4, 4)).toHaveLength(5);
    // With no step given, a π-based window still gets π ticks.
    expect(html({ type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5, curves: [{ expr: "sin(x)" }] })).toContain(">3π/2<");
  });

  it("starts sqrt(x) at its domain edge and skips unparseable curves", () => {
    const pieces = sampleCurve(parseExpr("sqrt(x)"), -2, 6, -1, 4);
    expect(pieces).toHaveLength(1);
    expect(Math.abs(pieces[0][0][0])).toBeLessThan(1e-6);
    clean(html({ type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: 287, xStep: 2, yStep: 50, curves: [{ expr: "20x+40", label: "C" }, { expr: "2x+(" }] }));
  });
});

describe("geo", () => {
  it("draws a triangle with ticks, angle marks and vertex letters", () => {
    const s = html({
      type: "geo",
      points: { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 0, y: 4 }, M: { x: 3, y: 0 } },
      polygons: [["A", "B", "C"]],
      segments: [{ from: "A", to: "M", tick: 1 }, { from: "M", to: "B", tick: 1 }, { from: "B", to: "C", label: "x" }, { from: "C", to: "M", dashed: true }],
      angles: [{ at: "A", from: "B", to: "C", right: true }, { at: "B", from: "A", to: "C", label: "34°" }],
      showLabels: true,
    });
    clean(s);
    expect(s).toContain("<polygon");
    expect(s).toContain("34°");
    for (const k of [">A<", ">B<", ">C<", ">M<"]) expect(s).toContain(k);
    expect(s).toMatch(/ A [\d.]+ [\d.]+ 0 0 [01]/); // the angle arc
    expect(s).toContain("right angle at A");
  });

  it("draws circles and an optional grid", () => {
    const s = html({ type: "geo", points: { O: { x: 1, y: 1 }, P: { x: 4, y: 5 } }, circles: [{ center: "O", r: 5 }], segments: [{ from: "O", to: "P", label: "5" }], grid: true, showLabels: true });
    clean(s);
    expect(s).toMatch(/<circle[^>]*r="\d/);
  });
});

describe("histogram", () => {
  it("draws touching bars with count ticks and edge labels", () => {
    const s = html({ type: "histogram", bins: [{ from: 60, to: 70, count: 3 }, { from: 70, to: 80, count: 7 }, { from: 80, to: 90, count: 12 }, { from: 90, to: 100, count: 5 }], xLabel: "Test score", yLabel: "Students" });
    clean(s);
    expect(count(s, /<rect/g)).toBe(4);
    for (const t of [">60<", ">80<", ">100<", ">12<", "Test score", "Students"]) expect(s).toContain(t);
    const xs = [...s.matchAll(/<rect x="([\d.]+)"[^>]* width="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    for (let i = 1; i < xs.length; i++) expect(Math.abs(xs[i - 1][0] + xs[i - 1][1] - xs[i][0])).toBeLessThan(0.3);
  });
});

describe("normal", () => {
  it("draws a bell curve with sd ticks and a shaded tail", () => {
    const s = html({ type: "normal", mean: 70, sd: 5, shadeFrom: 80, label: "P(X > 80)" });
    clean(s);
    for (const t of [">55<", ">65<", ">70<", ">85<", "P(X &gt; 80)"]) expect(s).toContain(t);
    expect(s).toContain('fill-opacity="0.45"');
    expect(s).toContain("shaded above 80");
  });

  it("labels a shade bound that is not on a tick", () => {
    const s = html({ type: "normal", mean: 100, sd: 15, shadeFrom: 92, shadeTo: 121 });
    clean(s);
    expect(s).toContain(">92<");
    expect(s).toContain(">121<");
  });
});
