// Unit 9: Inverse variation and square-root functions (models, graphs and transformations, equations with
// extraneous solutions, intersections, and interpreting expressions in context).
import { choice, ms, num, sn, trap, traps } from "../helpers";

const cx = (n: number) => (n === 1 ? "" : String(n));
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { PlotCurve, Skill, Visual } from "../types";
import { pt, r1, r2, tolTraps } from "./util";

const T = "m2-variation";

/** Typed expression for k/(x − h) + v. */
function invE(k: number, h: number, v: number) {
  const den = h === 0 ? "x" : `(x${h > 0 ? "-" : "+"}${Math.abs(h)})`;
  return `${k}/${den}${v === 0 ? "" : v > 0 ? `+${v}` : `-${-v}`}`;
}
function invText(k: number, h: number, v: number) {
  const den = h === 0 ? "x" : `x ${h > 0 ? "−" : "+"} ${Math.abs(h)}`;
  return `{${ms(k)}/${den}}${v === 0 ? "" : v > 0 ? ` + ${v}` : ` − ${-v}`}`;
}
function invCurves(k: number, h: number, v: number, xMin: number, xMax: number, color: 1 | 2 | 3 = 1): PlotCurve[] {
  const e = invE(k, h, v);
  return [{ expr: e, domain: [xMin, h - 0.15], color }, { expr: e, domain: [h + 0.15, xMax], color }];
}
function sqrtE(a: number, h: number, k: number) {
  const inside = h === 0 ? "x" : `x${h > 0 ? "-" : "+"}${Math.abs(h)}`;
  return `${a === 1 ? "" : a === -1 ? "-" : a}sqrt(${inside})${k === 0 ? "" : k > 0 ? `+${k}` : `-${-k}`}`;
}
function sqrtText(a: number, h: number, k: number) {
  const inside = h === 0 ? "x" : `(x ${h > 0 ? "−" : "+"} ${Math.abs(h)})`;
  return `${a === 1 ? "" : a === -1 ? "−" : ms(a)}√${inside}${k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${-k}`}`;
}

// ---------- 1. Inverse variation models ----------
const inverseModel: Skill = {
  id: "m2.var.inverse-model",
  title: "Inverse variation models",
  topic: T,
  standards: ["NC.M2.F-BF.1", "NC.M2.A-CED.2", "NC.M2.A-CED.1", "NC.M2.A-SSE.1"],
  prereqs: [],
  lesson: {
    bigIdea: "y varies inversely with x when y = {k/x}, or xy = k. When one quantity doubles, the other is cut in half.",
    explain: [
      "Find k from one pair: if y = 8 when x = 3, then k = 3 · 8 = 24, so y = {24/x}.",
      "Predict: when x = 6, y = {24/6} = **4**. Doubling x halved y.",
      "Context: 4 painters take 15 hours to paint a house, so (painters)(hours) = 60. With 6 painters it takes {60/6} = 10 hours. The constant 60 is the total work in painter-hours.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: 12, curves: [{ expr: "24/x", domain: [2, 12], label: "y = 24/x" }], points: [{ x: 3, y: 8, label: "(3, 8)" }, { x: 6, y: 4, label: "(6, 4)" }] },
  },
  why: [
    { kind: "choice", prompt: "If y varies inversely with x, why does tripling x divide y by 3?", choices: ["xy stays equal to k, so if x is 3 times as big, y must be 1/3 as big.", "Because y = 3x.", "Because inverse means subtract.", "It multiplies y by 3."], correct: 0, explain: "The product is constant: (3x)(y/3) = xy = k." },
    { kind: "written", prompt: "Explain how to tell from a table whether y varies inversely with x.", keyIdeas: ["multiply each x by its y", "if every product is the same number k, it's inverse variation", "then y = k/x"], exemplar: "Multiply x and y in each row. If every product is the same number, then xy = k for all the data, which is inverse variation with y = k/x. If the products differ, it isn't." },
  ],
  generate(r, lv) {
    const k = r.pick([12, 18, 24, 30, 36, 48, 60, 72, 90, 120]);
    const divs = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter((d) => k % d === 0);
    const x1 = r.pick(divs), y1 = k / x1;
    if (lv === 1) {
      return {
        prompt: `y varies inversely with x, and y = ${y1} when x = ${x1}. Find the constant of variation k.`,
        answer: num(k),
        hints: ["Inverse variation: y = k/x, so k = xy.", `k = ${x1} · ${y1}.`],
        steps: [st("Use k = xy.", `k = ${x1} · ${y1} = ${k}`), st("Model.", `y = {${k}/x}`)],
        traps: traps(frac(k), [trap(frac(y1, x1), "That would be direct variation (k = y/x). For inverse variation, k = xy."), trap(x1 + y1, "Multiply x and y; don't add.")]),
      };
    }
    if (lv === 2) {
      let x2 = r.pick(divs);
      if (x2 === x1) x2 = divs[(divs.indexOf(x2) + 1) % divs.length];
      const y2 = k / x2;
      return {
        prompt: `y varies inversely with x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`,
        answer: num(y2),
        hints: [`First find k = xy = ${x1} · ${y1}.`, `Then y = {${k}/${x2}}.`],
        steps: [st("Find k.", `k = ${x1} · ${y1} = ${k}`), st("Write the model.", `y = {${k}/x}`), st("Substitute.", `y = {${k}/${x2}} = ${y2}`)],
        traps: traps(frac(y2), [trap(frac(y1 * x2, x1), "That's direct variation (y grows with x). Inverse variation keeps xy constant."), trap(k, "That's k. Now divide by the new x.")]),
      };
    }
    const ctx = r.pick(["painters", "speed", "pressure"]);
    if (ctx === "painters") {
      const n1 = r.pick([2, 3, 4, 6]), t1 = r.pick([6, 8, 10, 12, 15]);
      const W = n1 * t1;
      const n2 = r.pick([2, 3, 4, 5, 6, 8, 10, 12].filter((n) => W % n === 0 && n !== n1));
      return {
        prompt: `It takes ${n1} people ${t1} hours to set up a festival stage. The time varies inversely with the number of people. How long would it take ${n2} people?`,
        answer: num(W / n2, { unit: " hours" }),
        hints: ["(people) × (hours) stays the same: that's the total work.", `${n1} × ${t1} = ${W} person-hours. Divide by ${n2}.`],
        steps: [st("Find the constant.", `k = ${n1} × ${t1} = ${W} person-hours`), st("Divide by the new number of people.", `t = {${W}/${n2}} = ${W / n2} hours`)],
        traps: traps(frac(W / n2), [trap(frac(t1 * n2, n1), "More people should take less time, not more.")]),
      };
    }
    if (ctx === "speed") {
      const d = r.pick([120, 180, 240, 300, 360]);
      const s1 = r.pick([30, 40, 60].filter((s) => d % s === 0));
      const s2 = r.pick([20, 30, 40, 45, 60, 72, 90].filter((s) => d % s === 0 && s !== s1));
      return {
        prompt: `A road trip of ${d} miles takes t = {${d}/s} hours at an average speed of s mph. What does ${d} represent, and how long does the trip take at ${s2} mph? Enter the time.`,
        answer: num(d / s2, { unit: " hours" }),
        hints: [`${d} is the distance, which stays fixed: s · t = ${d}.`, `t = {${d}/${s2}}.`],
        steps: [st("Interpret the constant.", `${d} is the trip distance in miles; speed × time = ${d}.`), st("Substitute.", `t = {${d}/${s2}} = ${d / s2} hours`)],
        traps: traps(frac(d / s2), [trap(d * s2, "Divide the distance by the speed.")]),
      };
    }
    const p1 = r.pick([2, 3, 4, 5]), v1 = r.pick([6, 8, 10, 12]);
    const K = p1 * v1;
    const v2 = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24].filter((v) => K % v === 0 && v !== v1));
    return {
      prompt: `For a gas at constant temperature, pressure P varies inversely with volume V. At V = ${v1} L, P = ${p1} atm. Find P when V = ${v2} L.`,
      answer: num(K / v2, { unit: " atm" }),
      hints: ["PV = k.", `k = ${p1} · ${v1} = ${K}. Then P = {${K}/${v2}}.`],
      steps: [st("Find k.", `k = PV = ${p1} · ${v1} = ${K}`), st("Solve for P.", `P = {${K}/${v2}} = ${K / v2} atm`)],
      traps: traps(frac(K / v2), [trap(frac(p1 * v2, v1), "That treats P and V as directly proportional. They vary inversely.")]),
    };
  },
};

// ---------- 2. Inverse variation graphs ----------
const inverseGraph: Skill = {
  id: "m2.var.inverse-graph",
  title: "Graphs of inverse variation functions",
  topic: T,
  standards: ["NC.M2.F-IF.7", "NC.M2.F-BF.3", "NC.M2.A-CED.2", "NC.M2.F-IF.4"],
  prereqs: ["m2.var.inverse-model", "m2.quad.transform"],
  lesson: {
    bigIdea: "y = {k/x} has two branches that approach the axes without touching them (asymptotes). y = {k/x − h} + v shifts the asymptotes to x = h and y = v.",
    explain: [
      "y = {6/x}: x can't be 0 and y is never 0. As x grows, y shrinks toward 0 (end behavior). With k > 0 the branches are in Quadrants I and III; with k < 0, II and IV.",
      "Worked example: y = {4/x − 2} + 1 has vertical asymptote **x = 2** (where the denominator is 0) and horizontal asymptote **y = 1**. Domain: x ≠ 2. Range: y ≠ 1.",
      "The graph is symmetric about the point where the asymptotes cross, (2, 1).",
    ],
    visual: { type: "plot", xMin: -4, xMax: 8, yMin: -5, yMax: 7, curves: invCurves(4, 2, 1, -4, 8), vlines: [{ x: 2, dashed: true, label: "x = 2" }], hlines: [{ y: 1, dashed: true, label: "y = 1" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is x = 2 a vertical asymptote of y = 4/(x − 2) + 1?", choices: ["At x = 2 the denominator is 0, so there's no output, and near 2 the outputs get huge.", "Because the graph crosses x = 2 twice.", "Because 4 ÷ 2 = 2.", "Because the y-intercept is 2."], correct: 0, explain: "Division by numbers close to 0 gives very large values; at 0 it is not defined." },
    { kind: "written", prompt: "Explain why y = 6/x never equals 0.", keyIdeas: ["a fraction is 0 only when its numerator is 0", "the numerator is 6, never 0", "so y can get close to 0 but never reach it (horizontal asymptote y = 0)"], exemplar: "A fraction equals 0 only if its top is 0. Here the top is always 6, so 6/x can't be 0. It gets closer and closer to 0 as x gets large, which is why y = 0 is a horizontal asymptote." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const k = r.pick([2, 3, 4, 6, 8, -4, -6]);
      const ds = [1, 2, 3, 4, 6, 8].filter((d) => Math.abs(k) % d === 0 && d !== 1);
      const x0 = r.pick(ds.length ? ds : [1]);
      return {
        prompt: `The graph of y = {k/x} passes through ${pt(x0, k / x0)}, as shown. Find k.`,
        visual: { type: "plot", xMin: -8, xMax: 8, yMin: -8, yMax: 8, curves: invCurves(k, 0, 0, -8, 8), points: [{ x: x0, y: k / x0, label: pt(x0, k / x0) }] },
        answer: num(k),
        hints: ["For y = k/x, k = xy.", `k = ${x0} · ${ms(k / x0)}.`],
        steps: [st("Multiply the coordinates.", `k = ${x0} · ${sn(k / x0)} = ${ms(k)}`), st("Check the quadrants.", `k ${k > 0 ? "> 0: branches in Quadrants I and III" : "< 0: branches in Quadrants II and IV"}. ✓`)],
        traps: traps(frac(k), [trap(frac(k / x0, x0), "For inverse variation k = xy, not y/x.")]),
      };
    }
    const k = r.pick([2, 3, 4, 6, -2, -3, -4]), h = r.nonzero(-4, 4), v = r.int(-4, 4);
    const xMin = h - 7, xMax = h + 7;
    const vis: Visual = { type: "plot", xMin, xMax, yMin: v - 7, yMax: v + 7, curves: invCurves(k, h, v, xMin, xMax) };
    if (lv === 2) {
      return {
        prompt: `Find the asymptotes of y = ${invText(k, h, v)}.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "vertical: x =" }, { value: frac(v), pre: "horizontal: y =" }] },
        hints: ["The vertical asymptote is where the denominator equals 0.", `The horizontal asymptote is the constant added outside the fraction: y = ${ms(v)}.`],
        steps: [st("Vertical asymptote.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = 0 gives x = ${ms(h)}`), st("Horizontal asymptote.", `The fraction never equals 0, so y never equals ${ms(v)}: y = ${ms(v)}`), st("Transformation view.", `y = {${ms(k)}/x} shifted ${Math.abs(h)} ${h > 0 ? "right" : "left"} and ${Math.abs(v)} ${v >= 0 ? "up" : "down"}.`)],
      };
    }
    const correct = `y = ${invText(k, h, v)}`;
    return {
      prompt: "Which equation matches the graph shown? (Its asymptotes are dashed.)",
      visual: { ...vis, vlines: [{ x: h, dashed: true }], hlines: [{ y: v, dashed: true }], points: [{ x: h + 1, y: k + v, label: pt(h + 1, k + v) }] } as Visual,
      answer: choice(r, correct, [[`y = ${invText(k, -h, v)}`, `The vertical asymptote is x = ${ms(h)}, so the denominator is zero at ${ms(h)}.`], [`y = ${invText(-k, h, v)}`, `Check the point ${pt(h + 1, k + v)}: the sign of k decides which quadrants (around the center) the branches are in.`], [`y = ${invText(k, v, h)}`, "The vertical asymptote comes from the denominator; the horizontal one is the added constant."]]),
      hints: ["The vertical asymptote x = h appears in the denominator as x − h; the horizontal asymptote y = v is added on.", `Use the labeled point ${pt(h + 1, k + v)} to find k: one unit right of the asymptote, the height is v + k.`],
      steps: [st("Read the asymptotes.", `x = ${ms(h)} and y = ${ms(v)}`), st("Find k from the point.", `${ms(k + v)} = {k/${ms(h + 1)} − ${h < 0 ? `(${ms(h)})` : h}}${v === 0 ? "" : v > 0 ? ` + ${v}` : ` − ${-v}`} = k${v === 0 ? "" : v > 0 ? ` + ${v}` : ` − ${-v}`}, so k = ${ms(k)}`), st("Equation.", correct)],
    };
  },
};

// ---------- 3. Square-root function graphs ----------
const sqrtGraph: Skill = {
  id: "m2.var.sqrt-graph",
  title: "Graphs of square-root functions",
  topic: T,
  standards: ["NC.M2.F-IF.7", "NC.M2.F-BF.3", "NC.M2.A-CED.2", "NC.M2.F-IF.4"],
  prereqs: ["m2.quad.transform", "m2.rad.simplify"],
  lesson: {
    bigIdea: "y = √x starts at (0, 0) and rises more and more slowly. y = a√(x − h) + k starts at (h, k); the radicand x − h must be ≥ 0, so the domain is x ≥ h.",
    explain: [
      "y = √(x − 3) + 1 starts at (3, 1). Domain x ≥ 3 (the radicand can't be negative); range y ≥ 1.",
      "Easy points come from perfect squares in the radicand: x − 3 = 0, 1, 4, 9 gives (3, 1), (4, 2), (7, 3), (12, 4).",
      "a stretches or flips it: y = −2√x starts at (0, 0) and goes down, twice as steep as √x.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 13, yMin: -1, yMax: 6, curves: [{ expr: "sqrt(x)", dashed: true, label: "√x", domain: [0, 13] }, { expr: "sqrt(x-3)+1", domain: [3, 13], color: 2 }], points: [{ x: 3, y: 1, label: "(3, 1)" }, { x: 7, y: 3, label: "(7, 3)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the domain of y = √(x − 3) the numbers x ≥ 3?", choices: ["The radicand x − 3 must be ≥ 0 for the square root to be a real number.", "Because the graph starts at y = 3.", "Because square roots are always bigger than 3.", "The domain is all real numbers."], correct: 0, explain: "Square roots of negative numbers aren't real." },
    { kind: "written", prompt: "Describe how the graph of y = −√(x + 2) + 4 relates to y = √x.", keyIdeas: ["shift left 2 (x + 2)", "reflect over the x-axis (the negative), so it goes down", "shift up 4; it starts at (−2, 4), domain x ≥ −2, range y ≤ 4"], exemplar: "The x + 2 shifts the graph 2 left, the negative sign flips it so it goes down instead of up, and the + 4 moves it up 4. It starts at (−2, 4), with domain x ≥ −2 and range y ≤ 4." },
  ],
  generate(r, lv) {
    const a = lv === 1 ? 1 : r.pick([1, 2, -1, 3, -2]);
    const h = r.int(-5, 5), k = r.int(-4, 4);
    const xMax = h + 16;
    const vis: Visual = { type: "plot", xMin: h - 3, xMax, yMin: Math.min(k, k + a * 4) - 3, yMax: Math.max(k, k + a * 4) + 3, curves: [{ expr: sqrtE(a, h, k), domain: [h, xMax] }] };
    if (lv === 1) {
      return {
        prompt: `Find the starting point (endpoint) of the graph of y = ${sqrtText(a, h, k)}.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "(", post: "," }, { value: frac(k), post: ")" }] },
        hints: ["The graph starts where the radicand equals 0.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = 0 at x = ${ms(h)}. What is y there?`],
        steps: [st("Set the radicand to 0.", `x = ${ms(h)}`), st("Find y.", `y = √0 ${k < 0 ? "−" : "+"} ${Math.abs(k)} = ${ms(k)}`), st("Starting point.", pt(h, k))],
      };
    }
    if (lv === 2) {
      const ask = r.pick(["domain", "range"]);
      const dom = `x ≥ ${ms(h)}`, ran = a > 0 ? `y ≥ ${ms(k)}` : `y ≤ ${ms(k)}`;
      const correct = ask === "domain" ? dom : ran;
      return {
        prompt: `What is the ${ask} of y = ${sqrtText(a, h, k)}?`,
        visual: vis,
        answer: choice(r, correct, [[`x ≥ ${ms(-h)}`, "Solve x − h ≥ 0 carefully: the sign flips from what's written."], [ask === "domain" ? ran : dom, ask === "domain" ? "That's the range (y-values)." : "That's the domain (x-values)."], [a > 0 ? `y ≤ ${ms(k)}` : `y ≥ ${ms(k)}`, a > 0 ? "With a > 0 the graph goes up from its start." : "With a < 0 the graph goes down from its start."], ["All real numbers", "Square roots of negatives aren't real, and the outputs start at one value."]].filter((w) => w[0] !== correct) as [string, string][]),
        hints: [ask === "domain" ? "The radicand must be ≥ 0." : `The graph starts at y = ${ms(k)}. Does it go up or down from there?`, ask === "domain" ? `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} ≥ 0.` : `a = ${ms(a)} is ${a > 0 ? "positive, so it goes up" : "negative, so it goes down"}.`],
        steps: [st("Starting point.", pt(h, k)), st(ask === "domain" ? "Radicand ≥ 0." : "Direction.", ask === "domain" ? `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} ≥ 0, so ${dom}` : `a ${a > 0 ? "> 0: rises" : "< 0: falls"}, so ${ran}`)],
      };
    }
    // Level 3: evaluate / write from graph.
    const s = r.pick([1, 4, 9]);
    const x0 = h + s;
    const y0 = k + a * Math.sqrt(s);
    const correct = `y = ${sqrtText(a, h, k)}`;
    return {
      prompt: `The graph starts at ${pt(h, k)} and passes through ${pt(x0, y0)}. Which equation matches it?`,
      visual: { ...vis, points: [{ x: h, y: k, label: pt(h, k) }, { x: x0, y: y0, label: pt(x0, y0) }] } as Visual,
      answer: choice(r, correct, [[`y = ${sqrtText(a, -h, k)}`, `The start x = ${ms(h)} makes the radicand 0; check the sign inside.`], [`y = ${sqrtText(a, k, h)}`, "h goes inside the root (horizontal shift), k outside (vertical)."], [`y = ${sqrtText(a === 1 ? 2 : a === -1 ? -2 : a > 0 ? 1 : -1, h, k)}`, `Test ${pt(x0, y0)}: the stretch factor a must give that point.`]]),
      hints: [`The start ${pt(h, k)} gives y = a${sqrtText(1, h, k)}.`, `Substitute ${pt(x0, y0)}: ${ms(y0)} = a√${s}${k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k)}`}. Solve for a.`],
      steps: [st("Use the starting point.", `y = a${sqrtText(1, h, k)}`), st("Find a.", `${ms(y0)} = a · ${Math.sqrt(s)}${k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k)}`}, so a = ${ms(a)}`), st("Equation.", correct)],
    };
  },
};

// ---------- 4. Square-root equations ----------
const sqrtEq: Skill = {
  id: "m2.var.sqrt-equations",
  title: "Solve square-root equations (and spot extraneous solutions)",
  topic: T,
  standards: ["NC.M2.A-REI.2", "NC.M2.A-REI.1", "NC.M2.A-CED.1"],
  prereqs: ["m2.var.sqrt-graph", "m2.qeq.formula"],
  lesson: {
    bigIdea: "Isolate the radical, square both sides, solve, then CHECK every answer in the original equation. Squaring can create extraneous solutions.",
    explain: [
      "√(2x + 3) = 5 → 2x + 3 = 25 → x = 11. Check: √25 = 5 ✓.",
      "√(x + 7) = x + 1 → x + 7 = x^2 + 2x + 1 → x^2 + x − 6 = 0 → x = 2 or x = −3. Check x = −3: √4 = 2 but −3 + 1 = −2. ✗ So −3 is extraneous and **x = 2** is the only solution.",
      "Why it happens: squaring turns a = −2 and a = 2 into the same statement a^2 = 4, so it can add answers that solved “√ = negative.”",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why must you check solutions after squaring both sides?", choices: ["Squaring can turn a false equation into a true one (like −2 = 2 becoming 4 = 4), adding extraneous solutions.", "Because you might have made an arithmetic mistake, but otherwise it's unnecessary.", "Because square roots are always negative.", "Squaring removes solutions."], correct: 0, explain: "Squaring isn't reversible: both 2 and −2 square to 4." },
    { kind: "written", prompt: "Explain why √x = −3 has no solution, even though squaring gives x = 9.", keyIdeas: ["√ means the principal (non-negative) square root", "√9 = 3, not −3", "so x = 9 is extraneous and there is no solution"], exemplar: "The square root symbol means the non-negative root, so √x can never be −3. Squaring gives x = 9, but checking it, √9 = 3, not −3. So 9 is extraneous and the equation has no solution." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(1, 5), c = r.int(2, 9);
      const x = r.int(-5, 15);
      const b = c * c - a * x;
      return {
        prompt: `Solve √(${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}) = ${c}.`,
        answer: num(x),
        hints: ["Square both sides to remove the square root.", `${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c * c}.`],
        steps: [st("Square both sides.", `${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c * c}`), st("Solve.", `${a === 1 ? "" : a}x = ${c * c - b}, so x = ${x}`), st("Check.", `√(${a * x + b}) = √${c * c} = ${c} ✓`)],
        traps: traps(frac(x), [trap(frac(c - b, a), `Square both sides: the right side becomes ${c * c}, not ${c}.`)]),
      };
    }
    if (lv === 2) {
      const s = r.int(1, 7), h = r.int(-6, 8), d = r.int(1, 9);
      const x = s * s - h; // √(x + h) = s
      const rhs = s + d;
      return {
        prompt: `Solve √(x ${h < 0 ? "−" : "+"} ${Math.abs(h)}) + ${d} = ${rhs}.`.replace("x + 0", "x"),
        answer: num(x),
        hints: [`Isolate the radical first: subtract ${d}.`, `√(x ${h < 0 ? "−" : "+"} ${Math.abs(h)}) = ${s}. Now square both sides.`],
        steps: [st("Isolate the radical.", `√(x ${h < 0 ? "−" : "+"} ${Math.abs(h)}) = ${s}`), st("Square both sides.", `x ${h < 0 ? "−" : "+"} ${Math.abs(h)} = ${s * s}`), st("Solve.", `x = ${x}`), st("Check.", `√(${x + h}) + ${d} = ${s} + ${d} = ${rhs} ✓`)],
        traps: traps(frac(x), [trap(rhs * rhs - h, `Isolate the radical before squaring. Squaring "√(…) + ${d}" doesn't remove the root.`)]),
      };
    }
    // √(x + p) = x + q with roots u (valid) and w (extraneous).
    let u: number, w: number, p: number, q: number;
    for (;;) {
      u = r.int(-2, 6); w = r.int(-8, 4);
      // x + q = ±√(x + p); valid u: u + q ≥ 0; extraneous w: w + q < 0.
      // (x + q)^2 = x + p with roots u, w → x^2 + (2q − 1)x + q^2 − p = 0 → −(u + w) = 2q − 1
      if ((1 - u - w) % 2 !== 0) continue;
      q = (1 - u - w) / 2;
      p = q * q - u * w;
      if (u !== w && u + q >= 0 && w + q < 0 && u + p >= 0 && Math.abs(p) <= 15 && Math.abs(q) <= 8) break;
    }
    const lhs = `√(x ${p < 0 ? "−" : "+"} ${Math.abs(p)})`.replace("x + 0", "x");
    const rhs = `x ${q < 0 ? "−" : "+"} ${Math.abs(q)}`.replace(" + 0", "");
    return {
      prompt: `Solve ${lhs} = ${rhs}. (Check for extraneous solutions.)`,
      answer: num(u),
      hints: ["Square both sides, then solve the quadratic.", `You should get x = ${ms(u)} or x = ${ms(w)}. Check each in the ORIGINAL equation.`],
      steps: [
        st("Square both sides.", `x ${p < 0 ? "−" : "+"} ${Math.abs(p)} = (${rhs})^2 = x^2 ${2 * q < 0 ? "−" : "+"} ${Math.abs(2 * q)}x + ${q * q}`.replace("+ 0x ", "")),
        st("Standard form.", `x^2 ${2 * q - 1 < 0 ? "−" : "+"} ${cx(Math.abs(2 * q - 1))}x ${q * q - p < 0 ? "−" : "+"} ${Math.abs(q * q - p)} = 0`),
        st("Solve.", `(x ${u > 0 ? "−" : "+"} ${Math.abs(u)})(x ${w > 0 ? "−" : "+"} ${Math.abs(w)}) = 0, so x = ${ms(u)} or x = ${ms(w)}`),
        st(`Check x = ${ms(u)}.`, `√(${u + p}) = ${Math.sqrt(u + p)} and ${ms(u)} ${q < 0 ? "−" : "+"} ${Math.abs(q)} = ${u + q} ✓`),
        st(`Check x = ${ms(w)}.`, `√(${w + p}) = ${Math.sqrt(w + p)} but ${ms(w)} ${q < 0 ? "−" : "+"} ${Math.abs(q)} = ${ms(w + q)} ✗ (extraneous)`),
        st("Answer.", `x = ${ms(u)}`),
      ],
      traps: traps(frac(u), [trap(w, `x = ${ms(w)} makes the right side negative, but a square root can't be negative. It's extraneous.`)]),
    };
  },
};

// ---------- 5. Inverse-variation equations ----------
const inverseEq: Skill = {
  id: "m2.var.inverse-equations",
  title: "Solve inverse-variation equations",
  topic: T,
  standards: ["NC.M2.A-REI.2", "NC.M2.A-REI.1", "NC.M2.A-CED.1"],
  prereqs: ["m2.var.inverse-graph", "m2.qeq.formula"],
  lesson: {
    bigIdea: "Multiply both sides by the denominator to clear the fraction, solve, then check: any value that makes a denominator 0 is extraneous.",
    explain: [
      "{12/x − 1} = 4 → 12 = 4(x − 1) → 12 = 4x − 4 → **x = 4**. Check: 12/3 = 4 ✓.",
      "{6/x} = x − 1 → 6 = x^2 − x → x^2 − x − 6 = 0 → x = 3 or x = −2. Both check, so both are solutions.",
      "{x^2/x − 3} = {9/x − 3} → x^2 = 9 → x = ±3. But x = 3 makes the denominator 0, so it's extraneous: **x = −3** only.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is x = 3 not a solution of x^2/(x − 3) = 9/(x − 3), even though it solves x^2 = 9?", choices: ["At x = 3 both denominators are 0, so the original equation is not defined there.", "Because 3 is positive.", "Because x^2 = 9 has no solutions.", "It is a solution."], correct: 0, explain: "Multiplying by x − 3 is only allowed when x − 3 ≠ 0." },
    { kind: "written", prompt: "Explain why multiplying both sides by x is a valid step when solving 20/x = 5, and what you must keep in mind.", keyIdeas: ["multiplying both sides by the same nonzero number keeps the equation equivalent", "x ≠ 0 here because 20/x must be defined", "20 = 5x, so x = 4, which is not 0, so it's valid"], exemplar: "Multiplying both sides by the same nonzero quantity keeps the solutions the same. x can't be 0 since 20/x has to be defined, so it's safe: 20 = 5x gives x = 4, and 4 isn't 0, so it checks." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const c = r.nonzero(-6, 8), h = r.int(-4, 4);
      let x = r.nonzero(-6, 9);
      if (x === h) x = h + 2;
      const k = c * (x - h);
      const den = h === 0 ? "x" : `x ${h > 0 ? "−" : "+"} ${Math.abs(h)}`;
      return {
        prompt: `Solve {${ms(k)}/${den}} = ${ms(c)}.`,
        answer: num(x),
        hints: [`Multiply both sides by ${h === 0 ? "x" : `(${den})`}.`, `${ms(k)} = ${ms(c)}(${den}). Divide by ${ms(c)}.`],
        steps: [st("Clear the fraction.", `${ms(k)} = ${ms(c)}(${den})`), st("Divide.", `${den} = ${ms(k / c)}`), ...(h !== 0 ? [st("Solve.", `x = ${ms(x)}`)] : []), st("Check.", `{${ms(k)}/${ms(x - h)}} = ${ms(c)} ✓`)],
        traps: traps(frac(x), [trap(frac(c, k), "Multiply both sides by the denominator; don't flip the fraction."), trap(k * c + h, "Divide by " + ms(c) + " instead of multiplying.")]),
      };
    }
    if (lv === 2) {
      const p = r.int(2, 6);
      // k/x = x − m with roots p and −q', choose roots p and s with p·s = −k... x^2 − m x − k = 0 → roots p, s: m = p + s, k = −p s
      let s = -r.int(1, 6);
      if (p + s === 0) s -= 1;
      const m = p + s, k = -p * s;
      return {
        prompt: `Solve {${k}/x} = x ${m < 0 ? "+" : "−"} ${Math.abs(m)}.`,
        answer: { kind: "multi", fields: [{ value: frac(p), pre: "x =" }, { value: frac(s), pre: "x =" }], anyOrder: [0, 1] },
        hints: ["Multiply both sides by x.", `${k} = x^2 ${m < 0 ? "+" : "−"} ${cx(Math.abs(m))}x, so x^2 ${m < 0 ? "+" : "−"} ${cx(Math.abs(m))}x − ${k} = 0.`],
        steps: [st("Multiply both sides by x.", `${k} = x^2 ${m < 0 ? "+" : "−"} ${cx(Math.abs(m))}x`), st("Standard form and factor.", `x^2 ${m < 0 ? "+" : "−"} ${cx(Math.abs(m))}x − ${k} = (x − ${p})(x + ${-s}) = 0`), st("Solve.", `x = ${p} or x = ${ms(s)}`), st("Check (neither makes x = 0).", `{${k}/${p}} = ${k / p} = ${p} ${m < 0 ? "+" : "−"} ${Math.abs(m)} ✓; {${k}/${ms(s)}} = ${ms(k / s)} = ${ms(s)} ${m < 0 ? "+" : "−"} ${Math.abs(m)} ✓`)],
      };
    }
    const a = r.int(2, 9);
    return {
      prompt: `Solve {x^2/x − ${a}} = {${a * a}/x − ${a}}.`,
      answer: num(-a),
      hints: [`Both sides have denominator x − ${a}. Multiply both sides by it (remember x ≠ ${a}).`, `x^2 = ${a * a}, so x = ±${a}. Which one makes a denominator 0?`],
      steps: [st("Note the restriction.", `x − ${a} ≠ 0, so x ≠ ${a}`), st("Multiply both sides by x − " + a + ".", `x^2 = ${a * a}`), st("Solve.", `x = ${a} or x = −${a}`), st("Reject the extraneous solution.", `x = ${a} makes the denominators 0, so the only solution is x = −${a}.`)],
      traps: traps(frac(-a), [trap(a, `x = ${a} makes the denominator x − ${a} equal 0, so the original equation is not defined there. It's extraneous.`)]),
    };
  },
};

// ---------- 6. Intersections of graphs ----------
const intersections: Skill = {
  id: "m2.var.intersections",
  title: "Solve f(x) = g(x) with graphs",
  topic: T,
  standards: ["NC.M2.A-REI.11", "NC.M2.F-IF.9"],
  prereqs: ["m2.var.sqrt-graph", "m2.var.inverse-graph"],
  lesson: {
    bigIdea: "The solutions of f(x) = g(x) are the x-coordinates of the points where the graphs of y = f(x) and y = g(x) intersect.",
    explain: [
      "√(x + 1) = x − 1: graph y = √(x + 1) and y = x − 1. They cross at (3, 2), so **x = 3**. (Check: √4 = 2 = 3 − 1 ✓.)",
      "{6/x} = x + 1 has graphs meeting at (2, 3) and (−3, −2): two solutions, x = 2 and x = −3.",
      "When the crossing isn't at a grid point, use a graphing calculator's intersect feature or zoom in, and round as asked.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 8, yMin: -3, yMax: 6, curves: [{ expr: "sqrt(x+1)", domain: [-1, 8] }, { expr: "x-1", color: 2 }], points: [{ x: 3, y: 2, label: "(3, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the x-coordinate of an intersection point a solution of f(x) = g(x)?", choices: ["At that x, both graphs have the same height, so f(x) and g(x) are equal.", "Because intersections are always on the x-axis.", "Because the y-coordinate is 0.", "Only the y-coordinate matters."], correct: 0, explain: "Same point means same input and same output for both functions." },
    { kind: "written", prompt: "Explain why √x = −x − 2 has no solution, using graphs.", keyIdeas: ["y = √x is never negative (it's on or above the x-axis)", "y = −x − 2 is negative for every x ≥ 0", "so the graphs never meet for x ≥ 0, and √x isn't defined for x < 0"], exemplar: "The graph of y = √x only exists for x ≥ 0 and is never below the x-axis. For x ≥ 0, −x − 2 is always negative, so that line is below the x-axis there. The graphs never meet, so there's no solution." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const s = r.int(1, 4), h = r.int(-3, 3);
      const x0 = s * s - h; // √(x + h) = s at x0
      const m = r.pick([1, 2, -1]);
      const b = s - m * x0;
      const g = `${m === 1 ? "" : m === -1 ? "−" : m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
      return {
        prompt: `Use the graph to solve √(x ${h < 0 ? "−" : "+"} ${Math.abs(h)}) = ${g}.`.replace("x + 0", "x").replace(" + 0)", ")"),
        visual: { type: "plot", xMin: Math.min(-h - 2, x0 - 4), xMax: x0 + 4, yMin: -3, yMax: s + 4, curves: [{ expr: sqrtE(1, -h, 0), domain: [-h, x0 + 4] }, { expr: `${m}*x+${b}`.replace("+-", "-"), color: 2 }], points: [{ x: x0, y: s }] },
        answer: num(x0),
        hints: ["Find where the two graphs cross.", "The solution is the x-coordinate of the crossing point. Check it in both expressions."],
        steps: [st("Read the intersection.", pt(x0, s)), st("Check.", `√(${x0 + h}) = ${s} and ${m === 1 ? "" : m === -1 ? "−" : m}(${ms(x0)}) ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${s} ✓`), st("Answer.", `x = ${ms(x0)}`)],
        traps: traps(frac(x0), [trap(s, "That's the y-coordinate of the intersection. The solution is the x-value.")]),
      };
    }
    if (lv === 2) {
      // k/x = x + m with integer roots p and s
      const p = r.int(1, 4);
      let s = -r.int(1, 5);
      if (p + s === 0) s -= 1;
      const m = -(p + s), k = -p * s;
      return {
        prompt: `Use the graph to solve {${k}/x} = x ${m < 0 ? "−" : "+"} ${Math.abs(m)}.`.replace(" + 0.", "."),
        visual: { type: "plot", xMin: -8, xMax: 8, yMin: -8, yMax: 8, curves: [...invCurves(k, 0, 0, -8, 8), { expr: `x+${m}`.replace("+-", "-"), color: 2 }], points: [{ x: p, y: k / p }, { x: s, y: k / s }] },
        answer: { kind: "multi", fields: [{ value: frac(p), pre: "x =" }, { value: frac(s), pre: "x =" }], anyOrder: [0, 1] },
        hints: ["The line crosses the curve twice: once on each branch.", "Read both x-coordinates, then check them in the equation."],
        steps: [st("Read the intersections.", `${pt(p, k / p)} and ${pt(s, k / s)}`), st("Check.", `{${k}/${p}} = ${k / p} = ${p} ${m < 0 ? "−" : "+"} ${Math.abs(m)} ✓ and {${k}/${ms(s)}} = ${ms(k / s)} = ${ms(s)} ${m < 0 ? "−" : "+"} ${Math.abs(m)} ✓`), st("Solutions.", `x = ${p} or x = ${ms(s)}`)],
      };
    }
    // Level 3: approximate.
    const [c, m] = r.pick([[3, 1], [4, 1], [5, 1], [7, 1], [3, 0.5], [5, 0.5], [6, 0.5]] as [number, number][]);
    // √x = m x − c... choose √x = c − m·x? Use √x = 6 − x style: m x + √x − c = 0 → let u = √x: m u^2 + u − c = 0.
    const u = (-1 + Math.sqrt(1 + 4 * m * c)) / (2 * m);
    const x0 = u * u;
    const ansR = Math.round(x0 * 10) / 10;
    const g = `${c} − ${m === 1 ? "" : "0.5"}x`;
    return {
      prompt: `The graphs of y = √x and y = ${g} are shown. Estimate the solution of √x = ${g} to the nearest tenth.`,
      visual: { type: "plot", xMin: -1, xMax: c / m + 1, yMin: -2, yMax: c + 1, curves: [{ expr: "sqrt(x)", domain: [0, c / m + 1] }, { expr: `${c}-${m}*x`, color: 2 }] },
      answer: num(ansR, { tolerance: 0.15 }),
      hints: ["Look for where the curve and the line cross; zoom in or use a table of values.", `Try values near x = ${Math.floor(x0)}: compare √x with ${g}.`],
      steps: [st("Locate the crossing.", `Between x = ${Math.floor(x0)} and x = ${Math.floor(x0) + 1}.`), st("Refine with a table.", `x = ${r1(x0 - 0.1)}: √x ≈ ${r2(Math.sqrt(x0 - 0.1))} and the line ≈ ${r2(c - m * (x0 - 0.1))}; x = ${r1(x0 + 0.1)}: √x ≈ ${r2(Math.sqrt(x0 + 0.1))} and the line ≈ ${r2(c - m * (x0 + 0.1))}. The values switch order in between.`), st("Answer.", `x ≈ ${ansR} (exactly ${r2(x0)} to two decimals)`)],
      traps: tolTraps(ansR, 0.15, [trap(r1(u), "That's the y-value (√x) at the crossing. The solution is the x-value.")]),
    };
  },
};

// ---------- 7. Interpreting square-root and inverse models ----------
const models: Skill = {
  id: "m2.var.models",
  title: "Square-root and inverse models in context",
  topic: T,
  standards: ["NC.M2.A-SSE.1", "NC.M2.A-SSE.1a", "NC.M2.A-SSE.1b", "NC.M2.A-CED.1", "NC.M2.F-IF.4"],
  prereqs: ["m2.var.sqrt-equations", "m2.var.inverse-model"],
  lesson: {
    bigIdea: "Read each part of a formula: what's under the radical, what's in the denominator, and what the constants mean. Then solve for the quantity you need.",
    explain: [
      "Dropped from h feet, an object takes t = {√h/4} seconds to fall. The radicand h is the height. From 64 ft: t = {√64/4} = 2 s. To fall for 3 s: 3 = {√h/4}, so √h = 12 and h = **144 ft**.",
      "Police estimate a car's speed from skid marks with s = √(30fd): d is the skid length in feet and f is the road's friction factor. Quadrupling d only doubles s, because of the square root.",
      "Light intensity I = {k/d^2} decreases as the distance d grows, and doubling d divides I by 4.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In t = √h / 4, why does dropping something from 4 times as high only double the fall time?", choices: ["√(4h) = 2√h, so the time is multiplied by 2.", "Because the 4 in the denominator cancels.", "Because gravity gets weaker.", "It would quadruple the time."], correct: 0, explain: "Square roots turn a factor of 4 into a factor of 2." },
    { kind: "written", prompt: "In s = √(30fd), explain what happens to the speed estimate when the skid length d is multiplied by 9.", keyIdeas: ["the radicand is multiplied by 9", "√9 = 3", "so the speed estimate triples"], exemplar: "If d is multiplied by 9, everything under the square root is multiplied by 9. Since √(9 · 30fd) = 3√(30fd), the estimated speed triples." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const H = r.pick([16, 64, 144, 256, 400]);
      const t = Math.sqrt(H) / 4;
      return {
        prompt: `A phone dropped from h feet falls for t = {√h/4} seconds. How long does a fall from ${H} ft take?`,
        answer: num(t, { unit: " s" }),
        hints: [`Substitute h = ${H}.`, `√${H} = ${Math.sqrt(H)}, then divide by 4.`],
        steps: [st("Substitute.", `t = {√${H}/4}`), st("Evaluate.", `{${Math.sqrt(H)}/4} = ${t} s`)],
        traps: traps(frac(t * 4, 4), [trap(H / 4, "Take the square root first, then divide by 4."), trap(Math.sqrt(H), "Don't forget to divide by 4.")]),
      };
    }
    if (lv === 2) {
      const kind = r.pick(["solve", "meaning"]);
      if (kind === "solve") {
        const t = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5]);
        const H = (4 * t) ** 2;
        return {
          prompt: `An object dropped from h feet falls for t = {√h/4} seconds. From what height does a fall take ${t} s?`,
          answer: num(H, { unit: " ft" }),
          hints: [`Set ${t} = {√h/4} and multiply both sides by 4.`, `√h = ${4 * t}. Square both sides.`],
          steps: [st("Write the equation.", `${t} = {√h/4}`), st("Multiply by 4.", `√h = ${4 * t}`), st("Square both sides.", `h = ${4 * t}^2 = ${H} ft`), st("Check.", `{√${H}/4} = {${4 * t}/4} = ${t} ✓`)],
          traps: traps(frac(H), [trap(4 * t, "That's √h. Square it to get h."), trap(16 * t, "Square the whole quantity 4t, not just 4.")]),
        };
      }
      const correct = "The length of the skid marks";
      return {
        prompt: "Police estimate a car's speed (mph) with s = √(30fd), where f is the road's friction factor. What does d represent?",
        answer: choice(r, correct, [["The car's speed", "That's s, the output."], ["The friction factor of the road", "That's f."], ["The time the car skidded", "Time doesn't appear in this formula; d is a distance."]]),
        hints: ["Read the definitions of the other letters first.", "Skid evidence is measured in feet along the road."],
        steps: [st("Match variables.", "s = speed, f = friction factor, d = length of the skid marks (ft)."), st("Answer.", correct)],
      };
    }
    const f = r.pick([0.6, 0.75, 0.8]);
    const s = r.pick([30, 45, 60]);
    // d = s^2 / (30 f)
    const d = r1((s * s) / (30 * f));
    const mult = r.pick([4, 9]);
    const kind = r.chance(0.5);
    if (kind) {
      return {
        prompt: `Using s = √(30fd) with friction factor f = ${f}, how long (in feet) would skid marks be for a car going ${s} mph? Round to the nearest tenth.`,
        answer: num(d, { tolerance: 0.1, unit: " ft" }),
        hints: [`Substitute: ${s} = √(30 · ${f} · d) = √(${r2(30 * f)}d).`, `Square both sides: ${s * s} = ${r2(30 * f)}d.`],
        steps: [st("Substitute.", `${s} = √(${r2(30 * f)}d)`), st("Square both sides.", `${s * s} = ${r2(30 * f)}d`), st("Divide.", `d = {${s * s}/${r2(30 * f)}} ≈ ${d} ft`)],
        traps: tolTraps(d, 0.1, [trap(r1(s / (30 * f)), "Square both sides before dividing.")]),
      };
    }
    return {
      prompt: `With s = √(30fd), a car leaves skid marks d feet long. If a second car's skid marks are ${mult} times as long (same road), how many times faster was it going?`,
      answer: num(Math.sqrt(mult)),
      hints: [`Replace d with ${mult}d: √(30f · ${mult}d).`, `√(${mult} · 30fd) = √${mult} · √(30fd).`],
      steps: [st("Scale d.", `s_2 = √(30f · ${mult}d) = √${mult} · √(30fd)`), st("Simplify.", `√${mult} = ${Math.sqrt(mult)}, so the speed is ${Math.sqrt(mult)} times as fast.`)],
      traps: traps(frac(Math.sqrt(mult)), [trap(mult, "The square root turns a factor of " + mult + " into √" + mult + ".")]),
    };
  },
};

const skills: Skill[] = [inverseModel, inverseGraph, sqrtGraph, sqrtEq, inverseEq, intersections, models];
export default skills;
