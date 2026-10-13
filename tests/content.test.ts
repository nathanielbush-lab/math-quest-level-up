import { describe, expect, it } from "vitest";
import { ORDERED, SKILLS, SKILL_BY_ID, TOPICS } from "../src/content";
import { makeRng } from "../src/lib/rng";
import { canonicalResponse, check } from "../src/engine/check";
import { toNum } from "../src/lib/rational";
import type { Level, Problem, Visual } from "../src/content/types";
import { evaluate, parseExpr } from "../src/lib/expr";

/** Checks a visual's references and expressions; returns a problem description or null. */
function visualIssue(v: Visual | undefined): string | null {
  if (!v) return null;
  if (v.type === "plot") {
    if (!(v.xMin < v.xMax && v.yMin < v.yMax)) return "plot window is empty";
    for (const c of v.curves ?? []) {
      try { parseExpr(c.expr, ["x"]); } catch (e) { return `plot curve "${c.expr}" doesn't parse: ${(e as Error).message}`; }
      const lo = c.domain?.[0] ?? v.xMin, hi = c.domain?.[1] ?? v.xMax;
      let ok = 0;
      for (let k = 0; k <= 40; k++) if (Number.isFinite(evaluate(c.expr, { x: lo + ((hi - lo) * k) / 40 }))) ok++;
      if (!ok) return `plot curve "${c.expr}" has no finite values in the window`;
    }
  }
  if (v.type === "geo") {
    const has = (k: string) => k in v.points;
    for (const poly of v.polygons ?? []) for (const k of poly) if (!has(k)) return `geo polygon uses unknown point ${k}`;
    for (const sg of v.segments ?? []) if (!has(sg.from) || !has(sg.to)) return `geo segment ${sg.from}${sg.to} uses an unknown point`;
    for (const a of v.angles ?? []) if (!has(a.at) || !has(a.from) || !has(a.to)) return `geo angle at ${a.at} uses an unknown point`;
    for (const c of v.circles ?? []) if (!has(c.center)) return `geo circle uses unknown center ${c.center}`;
  }
  if (v.type === "histogram" && !v.bins.length) return "histogram has no bins";
  if (v.type === "normal" && !(v.sd > 0)) return "normal curve needs sd > 0";
  return null;
}

const SEEDS = 250;

function textOf(p: Problem): string {
  const a = p.answer;
  const extra = a.kind === "choice" ? a.choices.join(" | ") + (a.feedback ?? []).join(" ") : "";
  return [p.prompt, ...p.hints, ...p.steps, ...(p.traps ?? []).map((t) => t.feedback), extra, JSON.stringify(p.visual ?? {})].join("\n");
}

describe("skill graph", () => {
  it("has unique ids and valid topics", () => {
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(SKILLS.length);
    const topics = new Set(TOPICS.map((t) => t.id));
    for (const s of SKILLS) expect(topics.has(s.topic), s.id).toBe(true);
  });
  it("has known prerequisites and no cycles", () => {
    for (const s of SKILLS) for (const p of s.prereqs) expect(SKILL_BY_ID[p], `${s.id} → ${p}`).toBeDefined();
    expect(ORDERED.length).toBe(SKILLS.length);
    const pos = new Map(ORDERED.map((s, i) => [s.id, i]));
    for (const s of SKILLS) for (const p of s.prereqs) expect(pos.get(p)!).toBeLessThan(pos.get(s.id)!);
  });
  it("every topic has skills, and every skill has a lesson and both kinds of why-question", () => {
    for (const t of TOPICS) expect(SKILLS.some((s) => s.topic === t.id), t.id).toBe(true);
    for (const s of SKILLS) {
      expect(s.lesson.explain.length, s.id).toBeGreaterThan(0);
      expect(visualIssue(s.lesson.visual), s.id).toBeNull();
      expect(s.id.startsWith(`${TOPICS.find((t) => t.id === s.topic)?.course}.`), `${s.id} should start with its course id`).toBe(true);
      expect(s.why.some((w) => w.kind === "choice"), s.id).toBe(true);
      expect(s.why.some((w) => w.kind === "written"), s.id).toBe(true);
      for (const w of s.why) if (w.kind === "choice") expect(w.correct).toBeLessThan(w.choices.length);
    }
  });
});

describe.each(SKILLS.map((s) => [s.id, s] as const))("generator %s", (_id, skill) => {
  it.each([1, 2, 3] as Level[])("level %i produces valid, self-consistent problems", (lv) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = skill.generate(makeRng(seed * 7919 + lv), lv);
      const where = `${skill.id} L${lv} seed ${seed}: ${p.prompt}`;
      const txt = textOf(p);
      expect(txt, where).not.toMatch(/undefined|NaN|Infinity|\[object Object\]/);
      expect(p.prompt.length, where).toBeGreaterThan(5);
      expect(p.hints.length, where).toBeGreaterThan(0);
      expect(p.steps.length, where).toBeGreaterThan(0);
      const a = p.answer;
      if (a.kind === "number") {
        expect(Number.isFinite(toNum(a.value)), where).toBe(true);
        expect(a.value.d, where).toBeGreaterThan(0);
      }
      if (a.kind === "multi") for (const f of a.fields) expect(Number.isFinite(toNum(f.value)), where).toBe(true);
      if (a.kind === "choice") {
        expect(a.choices.length, where).toBeGreaterThanOrEqual(2);
        expect(new Set(a.choices).size, where).toBe(a.choices.length);
        expect(a.correct, where).toBeGreaterThanOrEqual(0);
        expect(a.correct, where).toBeLessThan(a.choices.length);
      }
      if (a.kind === "point") {
        expect(a.x, where).toBeGreaterThanOrEqual(a.min);
        expect(a.x, where).toBeLessThanOrEqual(a.max);
        expect(a.y, where).toBeGreaterThanOrEqual(a.min);
        expect(a.y, where).toBeLessThanOrEqual(a.max);
        expect(Number.isInteger(a.x) && Number.isInteger(a.y), where).toBe(true);
      }
      if (a.kind === "expr") {
        expect(() => parseExpr(a.value, a.vars), `${where} (answer "${a.value}" must parse with vars ${a.vars.join(",")})`).not.toThrow();
      }
      expect(visualIssue(p.visual), where).toBeNull();
      expect(check(p, canonicalResponse(a)).verdict, where).toBe("correct");
      for (const t of p.traps ?? []) {
        expect(check(p, { kind: "number", text: `${t.value.n}/${t.value.d}` }).verdict, `${where} trap ${t.value.n}/${t.value.d}`).not.toBe("correct");
      }
    }
  });
});

import { CHALLENGES, MISSIONS } from "../src/content/challenges";

describe("challenges and missions", () => {
  it("only need real skills and build valid parts", () => {
    for (const c of [...CHALLENGES, ...MISSIONS]) {
      for (const n of c.needs) expect(SKILL_BY_ID[n], `${c.id} needs ${n}`).toBeDefined();
      for (let seed = 1; seed <= 200; seed++) {
        const { intro, parts } = c.build(makeRng(seed));
        expect(intro).not.toMatch(/undefined|NaN/);
        expect(parts.length).toBeGreaterThan(1);
        for (const p of parts) {
          expect(textOf(p), `${c.id} seed ${seed}`).not.toMatch(/undefined|NaN|Infinity/);
          expect(check(p, canonicalResponse(p.answer)).verdict, `${c.id} seed ${seed}: ${p.prompt}`).toBe("correct");
          if (p.answer.kind === "choice") expect(new Set(p.answer.choices).size).toBe(p.answer.choices.length);
        }
      }
    }
  });
});
