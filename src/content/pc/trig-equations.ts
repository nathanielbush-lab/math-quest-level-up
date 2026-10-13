// Unit 7: Inverse trig, identities and trig equations (PC.F.3.1, PC.A.2.3, PC.F.3.3).
import { choice, num, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill } from "../types";
import { DEG, ang, angAns, angDeg, angInline, angText, angV, exOf, quadrant, refAng, type Ang } from "./util";

const T = "pc-trig-equations";

/** Special angles in [0, 2π). */
const CAND: Ang[] = (() => {
  const out: Ang[] = [];
  for (let k = 0; k < 12; k++) out.push(ang(k, 6));
  for (const k of [1, 3, 5, 7]) out.push(ang(k, 4));
  const seen = new Set<string>();
  return out.filter((a) => (seen.has(`${a.n}/${a.d}`) ? false : (seen.add(`${a.n}/${a.d}`), true))).sort((a, b) => angV(a) - angV(b));
})();

const fval = (fn: "sin" | "cos" | "tan", x: number) => (fn === "sin" ? Math.sin(x) : fn === "cos" ? Math.cos(x) : Math.tan(x));
function solveSpecial(fn: "sin" | "cos" | "tan", v: number): Ang[] {
  return CAND.filter((a) => {
    const x = angV(a);
    if (fn === "tan" && Math.abs(Math.cos(x)) < 1e-9) return false;
    return Math.abs(fval(fn, x) - v) < 1e-9;
  });
}
const setText = (s: Ang[]) => (s.length ? s.map(angInline).join(", ") : "No solution");
const degFields = (s: Ang[]): Answer => ({ kind: "multi", fields: s.map((a, i) => ({ value: frac(angDeg(a)), pre: i === 0 ? "x =" : "and", post: DEG })), anyOrder: s.map((_, i) => i) });

/** Values with a display form as "coefficient·fn(x) + constant = 0" (q·fn(x) − top = 0). */
const VALS: { v: number; q: number; top: string; topV: number }[] = [
  { v: 0.5, q: 2, top: "1", topV: 1 }, { v: -0.5, q: 2, top: "−1", topV: -1 },
  { v: Math.SQRT2 / 2, q: 2, top: "√2", topV: Math.SQRT2 }, { v: -Math.SQRT2 / 2, q: 2, top: "−√2", topV: -Math.SQRT2 },
  { v: Math.sqrt(3) / 2, q: 2, top: "√3", topV: Math.sqrt(3) }, { v: -Math.sqrt(3) / 2, q: 2, top: "−√3", topV: -Math.sqrt(3) },
];
const TVALS: typeof VALS = [
  { v: 1, q: 1, top: "1", topV: 1 }, { v: -1, q: 1, top: "−1", topV: -1 },
  { v: Math.sqrt(3), q: 1, top: "√3", topV: Math.sqrt(3) }, { v: -Math.sqrt(3), q: 1, top: "−√3", topV: -Math.sqrt(3) },
  { v: Math.sqrt(3) / 3, q: 3, top: "√3", topV: Math.sqrt(3) }, { v: -Math.sqrt(3) / 3, q: 3, top: "−√3", topV: -Math.sqrt(3) },
];
const eqText = (fn: string, q: number, top: string) => `${q === 1 ? "" : q}${fn} x ${top.startsWith("−") ? "+" : "−"} ${top.replace("−", "")} = 0`;

const inverse: Skill = {
  id: "pc.trigeq.inverse",
  title: "Inverse trig values",
  topic: T,
  standards: ["PC.F.3.1", "PC.A.2.3"],
  prereqs: [],
  lesson: {
    bigIdea: "arcsin, arccos and arctan return ONE angle, from a restricted range: arcsin and arctan give angles in [−{π/2}, {π/2}], arccos gives angles in [0, π].",
    explain: [
      "arcsin(−{1/2}) asks: which angle between −{π/2} and {π/2} has sine −{1/2}? Answer: **−{π/6}** (not {7π/6}, which is outside the range).",
      "arccos(−{1/2}) must be between 0 and π: **{2π/3}**.",
      "Compositions: cos(arcsin {3/5}). Let θ = arcsin {3/5}, so sin θ = {3/5} with θ in Quadrant I. Then cos θ = {4/5}.",
    ],
    tip: "Restricted ranges keep each inverse a function. Think: arcsin and arctan live on the right half of the circle; arccos lives on the top half.",
  },
  why: [
    { kind: "choice", prompt: "Why must arcsin have a restricted range?", choices: ["sin x takes each value infinitely often, so the inverse must choose one angle to be a function.", "Because angles bigger than π/2 don't have sines.", "Because calculators can't show large angles.", "It doesn't; arcsin(1/2) has many outputs."], correct: 0, explain: "A function gives one output. Restricting sine to [−π/2, π/2] makes it one-to-one there, so its inverse is well defined." },
    { kind: "written", prompt: "Explain why arcsin(sin {5π/6}) is {π/6} and not {5π/6}.", keyIdeas: ["sin(5π/6) = 1/2", "arcsin returns an angle in [−π/2, π/2]", "the angle there with sine 1/2 is π/6"], exemplar: "First sin({5π/6}) = {1/2}. arcsin must return an angle between −{π/2} and {π/2}, and the only one with sine {1/2} is {π/6}. {5π/6} is outside arcsin's range." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const fn = r.pick(["arcsin", "arccos", "arctan"] as const);
      const pos = lv === 1;
      let a: Ang;
      if (fn === "arcsin") a = r.pick(pos ? [ang(1, 6), ang(1, 4), ang(1, 3), ang(1, 2)] : [ang(-1, 6), ang(-1, 4), ang(-1, 3), ang(-1, 2)]);
      else if (fn === "arccos") a = r.pick(pos ? [ang(1, 6), ang(1, 4), ang(1, 3), ang(0, 1)] : [ang(2, 3), ang(3, 4), ang(5, 6), ang(1, 1)]);
      else a = r.pick(pos ? [ang(1, 6), ang(1, 4), ang(1, 3)] : [ang(-1, 6), ang(-1, 4), ang(-1, 3)]);
      const base = fn === "arcsin" ? "sin" : fn === "arccos" ? "cos" : "tan";
      const val = exOf(fval(base, angV(a)));
      const range = fn === "arccos" ? "[0, π]" : fn === "arcsin" ? "[−{π/2}, {π/2}]" : "(−{π/2}, {π/2})";
      return {
        prompt: `Find the exact value of ${fn}(${val.text}).`,
        answer: angAns(a),
        hints: [`${fn}(${val.text}) is the angle in ${range} whose ${base} is ${val.text}.`, `The reference angle with ${base} = ${val.text.replace("−", "")} is ${angText(refAng(a))}.${!pos ? (fn === "arccos" ? " Negative cosine: go to Quadrant II." : " Negative value: go clockwise (a negative angle).") : ""}`],
        steps: [st("Range.", `${fn} gives an angle in ${range}.`), st("Find the angle.", `${base}(${angText(a)}) = ${val.text}, and ${angText(a)} is in that range.`), st("Answer.", `${fn}(${val.text}) = ${angText(a)}`)],
      };
    }
    if (r.chance(0.5)) {
      const fn = r.pick(["arcsin", "arccos"] as const);
      const a = r.pick(fn === "arcsin" ? [ang(5, 6), ang(2, 3), ang(3, 4), ang(7, 6), ang(4, 3)] : [ang(7, 6), ang(5, 3), ang(7, 4), ang(-1, 3), ang(-1, 6)]);
      const base = fn === "arcsin" ? "sin" : "cos";
      const val = exOf(fval(base, angV(a)));
      // The angle in the inverse's range with the same value.
      const inRange = solveSpecial(base, val.v).map((x) => (angV(x) > Math.PI + 1e-9 ? ang(x.n - 2 * x.d, x.d) : x));
      const final = inRange.find((x) => (fn === "arcsin" ? Math.abs(angV(x)) <= Math.PI / 2 + 1e-9 : angV(x) >= -1e-9 && angV(x) <= Math.PI + 1e-9))!;
      return {
        prompt: `Find the exact value of ${fn}(${base}(${angText(a)})).`,
        answer: angAns(final),
        hints: [`First ${base}(${angText(a)}) = ${val.text}.`, `Now find ${fn}(${val.text}): it must be in ${fn === "arcsin" ? "[−{π/2}, {π/2}]" : "[0, π]"}, so it isn't necessarily ${angText(a)}.`],
        steps: [st("Inside first.", `${base}(${angText(a)}) = ${val.text}`), st(`${fn} of that value.`, `The angle in ${fn === "arcsin" ? "[−{π/2}, {π/2}]" : "[0, π]"} with ${base} = ${val.text} is ${angText(final)}.`), st("Answer.", `${angText(final)} (the inverse only "undoes" ${base} on its restricted range)`)],
      };
    }
    const [x, y, h] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17]] as const);
    const fn = r.pick(["arcsin", "arccos"] as const);
    const neg = r.chance(0.5);
    // arcsin(±y/h) or arccos(±x/h); then ask the other function.
    const inner = fn === "arcsin" ? frac(neg ? -y : y, h) : frac(neg ? -x : x, h);
    const outer = r.pick(fn === "arcsin" ? ["cos", "tan"] : ["sin", "tan"]);
    // arcsin: QI or QIV (cos ≥ 0). arccos: QI or QII (sin ≥ 0).
    const sinv = fn === "arcsin" ? inner : frac(y, h);
    const cosv = fn === "arccos" ? inner : frac(x, h);
    const ans: Frac = outer === "sin" ? sinv : outer === "cos" ? cosv : frac(sinv.n * cosv.d, sinv.d * cosv.n);
    const ft = (f: Frac) => (f.n < 0 ? `−{${-f.n}/${f.d}}` : `{${f.n}/${f.d}}`);
    const quad = fn === "arcsin" ? (neg ? "IV" : "I") : neg ? "II" : "I";
    return {
      prompt: `Find the exact value of ${outer}(${fn}(${ft(inner)})).`,
      answer: num(ans, { simplest: true }),
      hints: [`Let θ = ${fn}(${ft(inner)}). Then ${fn === "arcsin" ? "sin" : "cos"} θ = ${ft(inner)} and θ is in Quadrant ${quad}.`, `Draw a right triangle with sides ${x}, ${y}, ${h} (or use sin^2θ + cos^2θ = 1). In Quadrant ${quad}, ${fn === "arcsin" ? "cos θ ≥ 0" : "sin θ ≥ 0"}.`],
      steps: [st("Name the angle.", `θ = ${fn}(${ft(inner)}): ${fn === "arcsin" ? "sin" : "cos"} θ = ${ft(inner)}, θ in Quadrant ${quad}.`), st("Find the other side.", `${fn === "arcsin" ? "cos" : "sin"} θ = ${ft(fn === "arcsin" ? cosv : sinv)}`), st(`Compute ${outer} θ.`, `${outer} θ = ${ft(ans)}`)],
      traps: traps(ans, [trap(frac(-ans.n, ans.d), `${fn} returns an angle in Quadrant ${quad}; check the sign there.`), trap(inner, `That's the input. Find ${outer} of the angle.`)]),
    };
  },
};

const solveBasic: Skill = {
  id: "pc.trigeq.solve-basic",
  title: "Solve basic trig equations",
  topic: T,
  standards: ["PC.F.3.1", "PC.A.2.3"],
  prereqs: ["pc.trigeq.inverse"],
  lesson: {
    bigIdea: "Isolate the trig function, find the reference angle, then use the sign to find EVERY angle in the interval. Periodicity adds all the rest.",
    explain: [
      "2 sin x + 1 = 0 → sin x = −{1/2}. Reference angle {π/6}. Sine is negative in Quadrants III and IV: x = π + {π/6} = **{7π/6}** and x = 2π − {π/6} = **{11π/6}**.",
      "arcsin(−{1/2}) only gives −{π/6}: the inverse finds one answer; you find the others.",
      "All solutions: x = {7π/6} + 2kπ or x = {11π/6} + 2kπ for any integer k. For tangent, add kπ instead, since its period is π.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 6.3, yMin: -1.5, yMax: 1.5, xStep: Math.PI / 6, curves: [{ expr: "sin(x)" }], hlines: [{ y: -0.5, dashed: true, label: "y = −1/2" }], points: [{ x: (7 * Math.PI) / 6, y: -0.5, label: "7π/6" }, { x: (11 * Math.PI) / 6, y: -0.5, label: "11π/6" }] },
    tip: "Sketch the graph and the horizontal line. The number of crossings is the number of solutions.",
  },
  why: [
    { kind: "choice", prompt: "Why does sin x = 1/2 have two solutions in [0, 2π) but arcsin(1/2) gives only one?", choices: ["arcsin returns one angle from its restricted range; the equation asks for every angle with that sine.", "Because arcsin is wrong for positive values.", "The equation only has one solution.", "Because sine has period π."], correct: 0, explain: "Sine is positive in Quadrants I and II, so two angles in one turn have sine 1/2. arcsin gives the Quadrant I one; symmetry gives π − π/6 = 5π/6." },
    { kind: "written", prompt: "Explain why the general solution of tan x = 1 is x = π/4 + kπ, not π/4 + 2kπ.", keyIdeas: ["tangent has period π", "tan(5π/4) = 1 too", "adding π gives the next solution"], exemplar: "Tangent repeats every π, not every 2π. tan(π/4) = 1 and tan(5π/4) = 1 as well, so every solution is π/4 plus a whole number of π's." },
  ],
  generate(r, lv) {
    const fn = r.pick(["sin", "cos", "tan"] as const);
    const pool = fn === "tan" ? TVALS : VALS;
    const V = r.pick(pool);
    const sols = solveSpecial(fn, V.v);
    const isolate = st(`Isolate ${fn} x.`, `${fn} x = ${exOf(V.v).text}`);
    const ref = refAng(sols[0]);
    const quads = sols.map((s) => quadrant(s));
    const why = st("Reference angle and quadrants.", `Reference angle ${angText(ref)}; ${fn} is ${V.v > 0 ? "positive" : "negative"} in Quadrants ${quads.map((q) => ["", "I", "II", "III", "IV"][q]).join(" and ")}.`);
    if (lv === 1) {
      const degText = sols.map((s) => `${angDeg(s)}${DEG}`).join(" and ");
      return {
        prompt: `Solve ${eqText(fn, V.q, V.top)} for 0${DEG} ≤ x < 360${DEG}.`,
        answer: degFields(sols),
        hints: [`Isolate ${fn} x: ${fn} x = ${exOf(V.v).text}.`, `The reference angle is ${angDeg(ref)}${DEG}. ${fn} is ${V.v > 0 ? "positive" : "negative"} in two quadrants: which?`],
        steps: [isolate, st("Reference angle and quadrants.", `Reference angle ${angDeg(ref)}${DEG}; ${fn} is ${V.v > 0 ? "positive" : "negative"} in Quadrants ${quads.map((q) => ["", "I", "II", "III", "IV"][q]).join(" and ")}.`), st("Solutions.", degText)],
      };
    }
    const other: "sin" | "cos" = fn === "sin" ? "cos" : "sin";
    const wrong: [string, string][] = [
      [setText(solveSpecial(fn, -V.v)), "Sign error: those angles give the opposite value."],
      [setText([sols[0]]), "There's a second solution in [0, 2π). Use the other quadrant where the sign matches."],
      ...(fn !== "tan" ? [[setText(solveSpecial(other, V.v)), `Those solve ${other} x = ${exOf(V.v).text}, not ${fn} x.`] as [string, string]] : []),
      [setText([ref, ang(ref.n + ref.d, ref.d)].filter((x) => angV(x) < 2 * Math.PI)), "Use the quadrants where the sign is right, not just reference angle + π."],
    ];
    if (lv === 2) {
      return {
        prompt: `Solve ${eqText(fn, V.q, V.top)} on [0, 2π).`,
        answer: choice(r, setText(sols), wrong.filter((w) => w[0] !== setText(sols))),
        hints: [`Isolate ${fn} x.`, `Reference angle ${angText(ref)}. Which quadrants make ${fn} ${V.v > 0 ? "positive" : "negative"}?`],
        steps: [isolate, why, st("Solutions.", setText(sols))],
      };
    }
    // Level 3: rearrange, then give the general solution.
    const c = r.int(1, 3);
    const lhsCoef = V.q + c;
    const per = fn === "tan" ? "π" : "2π";
    const gen = fn === "tan" ? `x = ${angInline(sols[0])} + kπ` : sols.map((s) => `x = ${angInline(s)} + 2kπ`).join(" or ");
    const genWrong = fn === "tan" ? `x = ${angInline(sols[0])} + 2kπ` : sols.map((s) => `x = ${angInline(s)} + kπ`).join(" or ");
    return {
      prompt: `Find all solutions of ${lhsCoef}${fn} x ${V.top.startsWith("−") ? "+" : "−"} ${V.top.replace("−", "")} = ${c}${fn} x. (k is any integer.)`,
      answer: choice(r, gen, [[genWrong, `Check the period: ${fn} repeats every ${per}.`], [fn === "tan" ? `x = ${angInline(solveSpecial(fn, -V.v)[0])} + kπ` : solveSpecial(fn, -V.v).map((s) => `x = ${angInline(s)} + 2kπ`).join(" or "), "Sign error when isolating."], [`x = ${angInline(sols[0])} + 2kπ`, fn === "tan" ? "Tangent repeats every π." : "There's a second family of solutions."]]),
      hints: [`Collect the ${fn} x terms: ${lhsCoef}${fn} x − ${c}${fn} x = ${V.q}${fn} x.`, `${fn} x = ${exOf(V.v).text}. Find the solutions in one period, then add multiples of ${per}.`],
      steps: [st("Collect terms.", eqText(fn, V.q, V.top)), isolate, why, st(`Add multiples of the period (${per}).`, gen)],
    };
  },
};

type F2 = "sin" | "cos";
const ROOTS = [1, -1, 0.5, -0.5, 0];
const factorText = (fn: F2, r0: number) => (r0 === 0 ? `${fn} x` : Math.abs(r0) === 1 ? `(${fn} x ${r0 > 0 ? "−" : "+"} 1)` : `(2${fn} x ${r0 > 0 ? "−" : "+"} 1)`);
const factorCoef = (r0: number): [number, number] => (r0 === 0 ? [1, 0] : Math.abs(r0) === 1 ? [1, -r0] : [2, -2 * r0]);

const quadratic: Skill = {
  id: "pc.trigeq.quadratic",
  title: "Trig equations in quadratic form",
  topic: T,
  standards: ["PC.A.2.3"],
  prereqs: ["pc.trigeq.solve-basic"],
  lesson: {
    bigIdea: "Treat sin x (or cos x) like a single variable u: factor the quadratic, solve each factor for the trig function, then find the angles.",
    explain: [
      "2 sin^2x − sin x − 1 = 0. With u = sin x: 2u^2 − u − 1 = (2u + 1)(u − 1) = 0, so sin x = −{1/2} or sin x = 1.",
      "sin x = −{1/2}: x = {7π/6}, {11π/6}. sin x = 1: x = {π/2}. Three solutions in [0, 2π).",
      "Mixed functions? Use sin^2x = 1 − cos^2x (or the reverse) so only one function remains. For 2cos^2x + 3 sin x − 3 = 0: 2(1 − sin^2x) + 3 sin x − 3 = 0 → 2 sin^2x − 3 sin x + 1 = 0.",
    ],
    tip: "A factor like sin x = 2 has no solution: sine never leaves [−1, 1].",
  },
  why: [
    { kind: "choice", prompt: "Why can't you divide both sides of sin^2x = sin x by sin x?", choices: ["You'd lose the solutions where sin x = 0, because you can't divide by zero.", "Because dividing trig functions isn't allowed.", "It works fine and gives all solutions.", "Because sin^2 x / sin x = 1."], correct: 0, explain: "Factor instead: sin x(sin x − 1) = 0 keeps both sin x = 0 and sin x = 1." },
    { kind: "written", prompt: "Explain why replacing cos^2x with 1 − sin^2x is allowed, and why it helps solve 2cos^2x − sin x − 1 = 0.", keyIdeas: ["sin^2x + cos^2x = 1 is true for every x", "it rewrites the equation using only sin x", "then it's a quadratic in sin x that can be factored"], exemplar: "The Pythagorean identity holds for every angle, so the swap doesn't change the equation's solutions. After it, the equation only has sin x: 2 − 2sin^2x − sin x − 1 = 0, which is a quadratic in sin x that I can factor." },
  ],
  generate(r, lv) {
    const fn: F2 = r.pick(["sin", "cos"]);
    const [r1, r2] = r.shuffle(ROOTS).slice(0, 2);
    const [a1, b1] = factorCoef(r1), [a2, b2] = factorCoef(r2);
    const A = a1 * a2, B = a1 * b2 + a2 * b1, C = b1 * b2;
    const sols = [...solveSpecial(fn, r1), ...solveSpecial(fn, r2)].sort((x, y) => angV(x) - angV(y));
    const term = (c: number, t: string, first = false) => (c === 0 ? "" : `${first ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 && t ? "" : Math.abs(c)}${t}`);
    const expanded = `${term(A, `${fn}^2x`, true)}${term(B, ` ${fn} x`.trim())}${term(C, "")} = 0`;
    const factored = `${factorText(fn, r1)}${factorText(fn, r2)} = 0`;
    const roots = [r1, r2].map((v) => `${fn} x = ${exOf(v).text}`).join(" or ");
    const angSteps = [r1, r2].map((v) => st(`${fn} x = ${exOf(v).text}.`, setText(solveSpecial(fn, v))));
    if (lv === 1) {
      return {
        prompt: `Solve ${factored} for 0${DEG} ≤ x < 360${DEG}. (There are ${sols.length} solutions.)`,
        answer: degFields(sols),
        hints: ["Set each factor equal to zero.", `${roots}. Find every angle for each.`],
        steps: [st("Zero product property.", roots), ...[r1, r2].map((v) => st(`${fn} x = ${exOf(v).text}.`, solveSpecial(fn, v).map((s) => `${angDeg(s)}${DEG}`).join(", "))), st("All solutions.", sols.map((s) => `${angDeg(s)}${DEG}`).join(", "))],
      };
    }
    const other: F2 = fn === "sin" ? "cos" : "sin";
    // Level 3: write A fn^2 as A − A other^2.
    const shown = lv === 2 ? expanded : `${term(A, `${other}^2x`, true)}${term(-B, `${fn} x`)}${term(-(A + C), "")} = 0`;
    const wrong: [string, string][] = [
      [setText([...solveSpecial(fn, -r1), ...solveSpecial(fn, -r2)].sort((x, y) => angV(x) - angV(y))), "Sign error: the factor (2u − 1) gives u = +1/2."],
      [setText(solveSpecial(fn, r1)), `You lost the solutions from ${fn} x = ${exOf(r2).text}.`],
      [setText(solveSpecial(fn, r2)), `You lost the solutions from ${fn} x = ${exOf(r1).text}.`],
      [setText([...solveSpecial(other, r1), ...solveSpecial(other, r2)].sort((x, y) => angV(x) - angV(y))), `Those angles solve the equation for ${other} x, not ${fn} x.`],
    ];
    return {
      prompt: `Solve ${shown} on [0, 2π).`,
      answer: choice(r, setText(sols), wrong.filter((w) => w[0] !== setText(sols))),
      hints: [
        ...(lv === 3 ? [`Replace ${other}^2x with 1 − ${fn}^2x so only ${fn} x remains.`] : []),
        `Let u = ${fn} x and factor ${term(A, "u^2", true)}${term(B, "u")}${term(C, "")}.`,
        `${roots}.`,
      ],
      steps: [
        ...(lv === 3 ? [st("Use the Pythagorean identity.", `${term(A, `(1 − ${fn}^2x)`, true)}${term(-B, `${fn} x`)}${term(-(A + C), "")} = 0 → ${term(-A, `${fn}^2x`, true)}${term(-B, `${fn} x`)}${term(-C, "")} = 0. Multiply by −1: ${expanded}`)] : []),
        st("Factor.", factored),
        st("Solve each factor.", roots),
        ...angSteps,
        st("All solutions.", setText(sols)),
      ],
    };
  },
};

const doubleAngle: Skill = {
  id: "pc.trigeq.double-angle",
  title: "Double-angle formulas",
  topic: T,
  standards: ["PC.A.2.3"],
  prereqs: ["pc.trigeq.quadratic"],
  lesson: {
    bigIdea: "sin 2θ = 2 sin θ cos θ and cos 2θ = cos^2θ − sin^2θ = 1 − 2sin^2θ = 2cos^2θ − 1. Use them to evaluate and to turn 2x into x in equations.",
    explain: [
      "Evaluate: sin θ = {3/5} in Quadrant II, so cos θ = −{4/5}. sin 2θ = 2({3/5})(−{4/5}) = **−{24/25}**; cos 2θ = 1 − 2({9/25}) = **{7/25}**.",
      "Solve sin 2x = sin x on [0, 2π): 2 sin x cos x − sin x = 0 → sin x(2 cos x − 1) = 0 → sin x = 0 or cos x = {1/2} → x = 0, {π/3}, π, {5π/3}.",
    ],
    tip: "Pick the version of cos 2x that matches the rest of the equation: 1 − 2sin^2x if the equation has sin x, 2cos^2x − 1 if it has cos x.",
  },
  why: [
    { kind: "choice", prompt: "Why is sin 2θ not equal to 2 sin θ?", choices: ["Sine isn't linear: doubling the angle doesn't double the height. sin(2 · 90°) = 0, not 2.", "It is equal.", "Because 2 sin θ is bigger than 1.", "Because cos θ is involved."], correct: 0, explain: "Try θ = 90°: sin 180° = 0 but 2 sin 90° = 2. The correct formula is 2 sin θ cos θ." },
    { kind: "written", prompt: "Show that cos 2θ = 1 − 2sin^2θ starting from cos 2θ = cos^2θ − sin^2θ.", keyIdeas: ["replace cos^2θ with 1 − sin^2θ (Pythagorean identity)", "1 − sin^2θ − sin^2θ", "= 1 − 2sin^2θ"], exemplar: "Since sin^2θ + cos^2θ = 1, cos^2θ = 1 − sin^2θ. So cos 2θ = (1 − sin^2θ) − sin^2θ = 1 − 2sin^2θ." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const [a, b, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17]] as const);
      const q = r.int(1, 4);
      const sx = q === 1 || q === 4 ? 1 : -1, sy = q <= 2 ? 1 : -1;
      const s = frac(sy * b, c), co = frac(sx * a, c);
      const giveSin = r.chance(0.5);
      const ft = (f: Frac) => (f.n < 0 ? `−{${-f.n}/${f.d}}` : `{${f.n}/${f.d}}`);
      const quadName = ["", "I", "II", "III", "IV"][q];
      const pw = (f: Frac) => (f.n < 0 ? `(${ft(f)})` : ft(f));
      const s2 = frac(2 * s.n * co.n, s.d * co.d), c2 = frac(co.n * co.n - s.n * s.n, c * c);
      const want = lv === 1 ? "sin" : "cos";
      const ans = want === "sin" ? s2 : c2;
      return {
        prompt: `${giveSin ? `sin θ = ${ft(s)}` : `cos θ = ${ft(co)}`} and θ is in Quadrant ${quadName}. Find ${want} 2θ.`,
        answer: num(ans, { simplest: true }),
        hints: [`First find ${giveSin ? "cos θ" : "sin θ"} with sin^2θ + cos^2θ = 1 and the quadrant.`, want === "sin" ? "sin 2θ = 2 sin θ cos θ." : "cos 2θ = cos^2θ − sin^2θ."],
        steps: [
          st(`Find ${giveSin ? "cos θ" : "sin θ"}.`, giveSin ? `cos θ = ${ft(co)} (Quadrant ${quadName})` : `sin θ = ${ft(s)} (Quadrant ${quadName})`),
          want === "sin" ? st("Double-angle formula.", `sin 2θ = 2 · ${pw(s)} · ${pw(co)} = ${ft(s2)}`) : st("Double-angle formula.", `cos 2θ = {${a * a}/${c * c}} − {${b * b}/${c * c}} = ${ft(c2)}`),
        ],
        traps: traps(ans, want === "sin" ? [trap(frac(2 * s.n, s.d), "sin 2θ isn't 2 sin θ. Use 2 sin θ cos θ."), trap(frac(-s2.n, s2.d), `Check the signs of sin θ and cos θ in Quadrant ${quadName}.`)] : [trap(frac(2 * co.n, co.d), "cos 2θ isn't 2 cos θ."), trap(frac(-c2.n, c2.d), "cos 2θ = cos²θ − sin²θ, in that order.")]),
      };
    }
    const TPL = [
      { eq: "sin 2x = sin x", work: "2 sin x cos x − sin x = 0 → sin x(2cos x − 1) = 0", parts: "sin x = 0 or cos x = {1/2}", sols: [ang(0, 1), ang(1, 3), ang(1, 1), ang(5, 3)] },
      { eq: "sin 2x = cos x", work: "2 sin x cos x − cos x = 0 → cos x(2 sin x − 1) = 0", parts: "cos x = 0 or sin x = {1/2}", sols: [ang(1, 6), ang(1, 2), ang(5, 6), ang(3, 2)] },
      { eq: "cos 2x = cos x", work: "2cos^2x − 1 − cos x = 0 → (2cos x + 1)(cos x − 1) = 0", parts: "cos x = −{1/2} or cos x = 1", sols: [ang(0, 1), ang(2, 3), ang(4, 3)] },
      { eq: "cos 2x = sin x", work: "1 − 2sin^2x − sin x = 0 → (2 sin x − 1)(sin x + 1) = 0", parts: "sin x = {1/2} or sin x = −1", sols: [ang(1, 6), ang(5, 6), ang(3, 2)] },
      { eq: "sin 2x + sin x = 0", work: "2 sin x cos x + sin x = 0 → sin x(2cos x + 1) = 0", parts: "sin x = 0 or cos x = −{1/2}", sols: [ang(0, 1), ang(2, 3), ang(1, 1), ang(4, 3)] },
      { eq: "cos 2x + cos x = 0", work: "2cos^2x − 1 + cos x = 0 → (2cos x − 1)(cos x + 1) = 0", parts: "cos x = {1/2} or cos x = −1", sols: [ang(1, 3), ang(1, 1), ang(5, 3)] },
    ];
    const t = r.pick(TPL);
    const halfOnly = t.sols.filter((x) => angV(x) < Math.PI);
    const wrongs: [string, string][] = [
      [setText(halfOnly), "Check the whole interval [0, 2π): some solutions are past π."],
      [setText(t.sols.slice(1)), "Don't drop the solutions from the first factor (or x = 0)."],
      [setText(t.sols.map((x) => ang(x.n, x.d * 2))), "Using the double-angle formula means you solve for x directly; don't halve the angles."],
    ];
    return {
      prompt: `Solve ${t.eq} on [0, 2π).`,
      answer: choice(r, setText(t.sols), wrongs.filter((w) => w[0] !== setText(t.sols))),
      hints: ["Rewrite the 2x with a double-angle formula so everything is in terms of x.", `${t.work}.`, `${t.parts}.`],
      steps: [st("Double-angle formula and factor.", t.work), st("Solve each factor.", t.parts), st("Solutions in [0, 2π).", setText(t.sols))],
    };
  },
};

interface Ident { e: string; a: string; steps: string[]; lv: number }
const IDS: Ident[] = [
  { e: "sin x · cot x", a: "cos x", steps: ["cot x = {cos x/sin x}", "sin x · {cos x/sin x} = cos x"], lv: 1 },
  { e: "tan x · cos x", a: "sin x", steps: ["tan x = {sin x/cos x}", "{sin x/cos x} · cos x = sin x"], lv: 1 },
  { e: "sin x · sec x", a: "tan x", steps: ["sec x = {1/cos x}", "sin x · {1/cos x} = {sin x/cos x} = tan x"], lv: 1 },
  { e: "{cot x/csc x}", a: "cos x", steps: ["{cos x/sin x} ÷ {1/sin x} = {cos x/sin x} · sin x", "= cos x"], lv: 1 },
  { e: "{1 − cos^2x/sin x}", a: "sin x", steps: ["1 − cos^2x = sin^2x (Pythagorean identity)", "{sin^2x/sin x} = sin x"], lv: 2 },
  { e: "sec^2x − tan^2x", a: "1", steps: ["1 + tan^2x = sec^2x (divide sin^2 + cos^2 = 1 by cos^2)", "sec^2x − tan^2x = 1"], lv: 2 },
  { e: "(1 + tan^2x) cos^2x", a: "1", steps: ["1 + tan^2x = sec^2x", "sec^2x · cos^2x = {1/cos^2x} · cos^2x = 1"], lv: 2 },
  { e: "(1 − sin^2x) sec x", a: "cos x", steps: ["1 − sin^2x = cos^2x", "cos^2x · {1/cos x} = cos x"], lv: 2 },
  { e: "cos x (sec x − cos x)", a: "sin^2x", steps: ["cos x · sec x − cos^2x = 1 − cos^2x", "1 − cos^2x = sin^2x"], lv: 3 },
  { e: "sec x − cos x", a: "sin x tan x", steps: ["{1/cos x} − cos x = {1 − cos^2x/cos x}", "= {sin^2x/cos x} = sin x · {sin x/cos x} = sin x tan x"], lv: 3 },
  { e: "csc x − sin x", a: "cos x cot x", steps: ["{1/sin x} − sin x = {1 − sin^2x/sin x}", "= {cos^2x/sin x} = cos x · {cos x/sin x} = cos x cot x"], lv: 3 },
  { e: "{sin^2x/1 − cos x}", a: "1 + cos x", steps: ["sin^2x = 1 − cos^2x = (1 − cos x)(1 + cos x)", "Cancel (1 − cos x): 1 + cos x"], lv: 3 },
];
const ID_OPTS = ["sin x", "cos x", "tan x", "1", "sec x", "csc x", "cot x", "sin^2x", "cos^2x", "1 + cos x", "cos x cot x", "sin x tan x", "−1", "1 − cos x"];

const identities: Skill = {
  id: "pc.trigeq.identities",
  title: "Simplify with trig identities",
  topic: T,
  standards: ["PC.A.2.3", "PC.F.3.3"],
  prereqs: ["pc.unitcircle.six"],
  lesson: {
    bigIdea: "Rewrite everything in sines and cosines, use sin^2x + cos^2x = 1 (and its cousins 1 + tan^2x = sec^2x, 1 + cot^2x = csc^2x), then simplify the fractions.",
    explain: [
      "Simplify sec x − cos x. In sines and cosines: {1/cos x} − cos x = {1 − cos^2x/cos x}.",
      "Pythagorean identity: 1 − cos^2x = sin^2x, so it's {sin^2x/cos x} = sin x · {sin x/cos x} = **sin x tan x**.",
      "Dividing sin^2x + cos^2x = 1 by cos^2x gives tan^2x + 1 = sec^2x; dividing by sin^2x gives 1 + cot^2x = csc^2x.",
    ],
    tip: "Check a simplification by plugging in a value, like x = π/3, on both sides.",
  },
  why: [
    { kind: "choice", prompt: "Why is 1 + tan^2x = sec^2x true?", choices: ["Divide every term of sin^2x + cos^2x = 1 by cos^2x.", "Because tan x = sec x − 1.", "Because tan x and sec x are both reciprocals.", "It's only true at x = 0."], correct: 0, explain: "sin^2x/cos^2x + cos^2x/cos^2x = 1/cos^2x, which reads tan^2x + 1 = sec^2x." },
    { kind: "written", prompt: "Explain how you could check that sin x · cot x = cos x using a specific angle, and why a check like that is not a full proof.", keyIdeas: ["plug in x = π/3: sin(π/3) cot(π/3) = (√3/2)(√3/3) = 1/2 = cos(π/3)", "one value agreeing doesn't show it works for every x", "a proof rewrites one side into the other using identities"], exemplar: "At x = π/3: sin x cot x = (√3/2)(√3/3) = 1/2 and cos(π/3) = 1/2, so they match. But matching at one angle doesn't prove it for all angles. To prove it, rewrite cot x as cos x/sin x and cancel." },
  ],
  generate(r, lv) {
    const id = r.pick(IDS.filter((x) => x.lv === lv));
    const wrong = r.shuffle(ID_OPTS.filter((o) => o !== id.a)).slice(0, 3);
    return {
      prompt: `Simplify: ${id.e}`,
      answer: choice(r, id.a, wrong),
      hints: ["Rewrite everything in terms of sin x and cos x.", lv === 1 ? "Then cancel common factors." : "Look for 1 − sin^2x, 1 − cos^2x or 1 + tan^2x: each is a Pythagorean identity."],
      steps: id.steps.map((s, i) => st(i === 0 ? "Rewrite." : "Simplify.", s)),
    };
  },
};

export default [inverse, solveBasic, quadratic, doubleAngle, identities];
