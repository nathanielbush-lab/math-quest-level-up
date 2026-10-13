// Unit 1: Functions and inverses (piecewise and absolute value, transformations, inverse functions).
import { choice, cst, expr, linear, money, ms, num, poly, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { coef, dn, linT, xm, xmT } from "./util";

const T = "m3-functions";

/** "2(−3) + 1 = −5" for evaluating mx + b at x. */
function subLin(m: number, b: number, x: number): string {
  const head = m === 0 ? "" : `${m === 1 ? "" : m === -1 ? "−" : ms(m)}(${ms(x)})`;
  return `${head}${head ? cst(b) : ms(b)} = ${ms(m * x + b)}`;
}

// ---------------------------------------------------------------------------
const piecewiseEval: Skill = {
  id: "m3.fn.piecewise-eval",
  title: "Evaluate piecewise functions",
  topic: T,
  standards: ["NC.M3.F-IF.2", "NC.M3.A-SSE.1", "NC.M3.A-SSE.1a"],
  prereqs: [],
  lesson: {
    bigIdea: "A piecewise function uses different rules on different parts of its domain. Find the piece the input belongs to, then use only that rule.",
    explain: [
      "Take f(x) = 2x + 1 if x < 3, and 12 − x if x ≥ 3.",
      "To find f(5): 5 ≥ 3, so use the second rule: f(5) = 12 − 5 = **7**. To find f(−2): −2 < 3, so f(−2) = 2(−2) + 1 = **−3**.",
      "At a boundary, read the inequality signs. x = 3 belongs to the piece marked x ≥ 3, so f(3) = 12 − 3 = **9**. On the graph, that piece gets the filled dot at x = 3 and the other piece gets an open dot.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 8, yMin: -6, yMax: 12, curves: [{ expr: "2x+1", domain: [-4, 3] }, { expr: "12-x", domain: [3, 8] }], points: [{ x: 3, y: 7, open: true }, { x: 3, y: 9, label: "(3, 9)" }] },
    tip: "Check the boundary signs before you substitute. That's where most mistakes happen.",
  },
  why: [
    { kind: "choice", prompt: "f(x) = x + 4 if x < 2, and 3x if x ≥ 2. Why is f(2) = 6 and not 6 and 6 at once, or 6 and 4?", choices: ["Each input belongs to exactly one piece, so x = 2 uses only the rule for x ≥ 2.", "Because 3x is the bigger rule.", "You average the two pieces at the boundary."], correct: 0, explain: "A function gives each input one output. The inequalities decide which single rule applies." },
    { kind: "written", prompt: "A job pays $12 an hour for the first 40 hours in a week and $18 an hour for every hour after that. Explain why a piecewise function is a good model for weekly pay.", keyIdeas: ["the rate changes at 40 hours", "one rule for hours up to 40, another for hours over 40", "the overtime piece starts from the pay already earned at 40 hours"], exemplar: "The pay rate changes at 40 hours, so one formula can't describe the whole week. P(h) = 12h for h ≤ 40, and P(h) = 480 + 18(h − 40) for h > 40, because by hour 40 you've already earned 12 · 40 = $480 and each extra hour adds $18." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      if (r.chance(0.5)) {
        const base = r.pick([30, 35, 40, 45]), cap = r.pick([5, 8, 10, 15]), over = r.pick([5, 6, 8, 10]);
        const g = r.chance(0.65) ? cap + r.int(1, 6) : r.int(1, cap);
        const ans = g <= cap ? base : base + over * (g - cap);
        return {
          prompt: `A phone plan costs C(g) dollars per month for g gigabytes of data: C(g) = ${base} if 0 ≤ g ≤ ${cap}, and C(g) = ${base} + ${over}(g − ${cap}) if g > ${cap}. Find C(${g}).`,
          answer: num(ans, { pre: "$" }),
          hints: [`Which piece applies when g = ${g}? Compare ${g} with ${cap}.`, g <= cap ? `${g} ≤ ${cap}, so you're in the flat-rate piece.` : `${g} > ${cap}, so use ${base} + ${over}(g − ${cap}). The (g − ${cap}) counts only the gigabytes over the limit.`],
          steps: [
            st("Pick the piece.", g <= cap ? `${g} is between 0 and ${cap}, so C(${g}) = ${base}.` : `${g} > ${cap}, so use C(g) = ${base} + ${over}(g − ${cap}).`),
            ...(g <= cap ? [] : [st("Substitute.", `C(${g}) = ${base} + ${over}(${g} − ${cap}) = ${base} + ${over}(${g - cap}) = ${base} + ${over * (g - cap)} = ${ans}`)]),
            st("Interpret.", `Using ${g} GB costs $${ans} that month.`),
          ],
          traps: traps(frac(ans), [trap(base + over * g, `That charges $${over} for every gigabyte. Only the ${g - cap} GB over ${cap} cost extra.`), trap(over * (g - cap), `Don't forget the $${base} base price.`)]),
        };
      }
      const rate = r.pick([11, 12, 13, 14, 15]), ot = rate * 1.5, h = r.chance(0.7) ? 40 + r.pick([2, 4, 5, 6, 8, 10]) : r.pick([20, 25, 30, 36]);
      const ans = h <= 40 ? rate * h : rate * 40 + ot * (h - 40);
      return {
        prompt: `${r.pick(["Maya", "Diego", "Priya", "Jonah"])} earns P(h) dollars for working h hours in a week: P(h) = ${rate}h if 0 ≤ h ≤ 40, and P(h) = ${rate * 40} + ${dn(ot)}(h − 40) if h > 40. Find P(${h}).`,
        answer: num(ans, { pre: "$" }),
        hints: [`Is ${h} at most 40 or more than 40?`, h <= 40 ? "Use the first rule." : `Use the overtime rule: the ${h - 40} hours over 40 are paid ${money(ot)} each, on top of $${rate * 40}.`],
        steps: [
          st("Pick the piece.", h <= 40 ? `${h} ≤ 40, so P(h) = ${rate}h.` : `${h} > 40, so P(h) = ${rate * 40} + ${dn(ot)}(h − 40).`),
          st("Substitute.", h <= 40 ? `P(${h}) = ${rate} · ${h} = ${ans}` : `P(${h}) = ${rate * 40} + ${dn(ot)}(${h - 40}) = ${rate * 40} + ${dn(ot * (h - 40))} = ${dn(ans)}`),
          st("Interpret.", `Working ${h} hours earns ${money(ans)}.`),
        ],
        traps: traps(frac(ans), [trap(rate * h, `That pays every hour at $${rate}. Hours past 40 earn ${money(ot)}.`), trap(ot * h, "Only the hours over 40 get the overtime rate.")]),
      };
    }
    if (lv === 1) {
      const c = r.int(-2, 3);
      const m1 = r.nonzero(-3, 3), b1 = r.int(-5, 5), m2 = r.nonzero(-3, 3), b2 = r.int(-6, 6);
      const leftIncl = r.chance(0.5);
      const x = r.chance(0.5) ? c - r.int(1, 4) : c + r.int(1, 4);
      const left = leftIncl ? x <= c : x < c;
      const ans = left ? m1 * x + b1 : m2 * x + b2;
      const other = left ? m2 * x + b2 : m1 * x + b1;
      const def = `f(x) = ${linear(m1, b1)} if x ${leftIncl ? "≤" : "<"} ${ms(c)}, and f(x) = ${linear(m2, b2)} if x ${leftIncl ? ">" : "≥"} ${ms(c)}`;
      return {
        prompt: `${def}. Find f(${ms(x)}).`,
        answer: num(ans),
        hints: [`Compare ${ms(x)} with ${ms(c)} to decide which rule to use.`, `${ms(x)} is ${x < c ? "less" : "greater"} than ${ms(c)}, so use f(x) = ${left ? linear(m1, b1) : linear(m2, b2)}.`],
        steps: [
          st("Pick the piece.", `${ms(x)} ${x < c ? "<" : ">"} ${ms(c)}, so use f(x) = ${left ? linear(m1, b1) : linear(m2, b2)}.`),
          st("Substitute.", `f(${ms(x)}) = ${left ? subLin(m1, b1, x) : subLin(m2, b2, x)}`),
        ],
        traps: traps(frac(ans), [trap(other, "That's the other piece's rule. Check which inequality " + ms(x) + " satisfies.")]),
      };
    }
    // Level 2: three pieces, input at a boundary.
    const c1 = r.int(-3, -1), c2 = r.int(1, 3);
    const m1 = r.nonzero(-3, 3), b1 = r.int(-4, 4), k = r.int(-6, 8);
    const q = r.int(-4, 3);
    const lowIncl = r.chance(0.5), highIncl = r.chance(0.5);
    const x = r.pick([c1, c2]);
    const f1 = (t: number) => m1 * t + b1, f2 = (t: number) => t * t + q, f3 = () => k;
    const piece = x === c1 ? (lowIncl ? 1 : 2) : highIncl ? 2 : 3;
    const val = (p: number) => (p === 1 ? f1(x) : p === 2 ? f2(x) : f3());
    const ans = val(piece);
    const otherP = x === c1 ? (piece === 1 ? 2 : 1) : piece === 2 ? 3 : 2;
    const midL = lowIncl ? "<" : "≤", midR = highIncl ? "≤" : "<";
    const def = `f(x) = ${linear(m1, b1)} if x ${lowIncl ? "≤" : "<"} ${ms(c1)}; f(x) = ${poly([1, 0, q])} if ${ms(c1)} ${midL} x ${midR} ${c2}; f(x) = ${ms(k)} if x ${highIncl ? ">" : "≥"} ${c2}`;
    const rule = (p: number) => (p === 1 ? linear(m1, b1) : p === 2 ? poly([1, 0, q]) : ms(k));
    const work = (p: number) => (p === 1 ? subLin(m1, b1, x) : p === 2 ? (q ? `(${ms(x)})^2${cst(q)} = ${x * x}${cst(q)} = ${ms(x * x + q)}` : `(${ms(x)})^2 = ${x * x}`) : ms(k));
    return {
      prompt: `${def}. Find f(${ms(x)}).`,
      answer: num(ans),
      hints: [`x = ${ms(x)} is a boundary. Look for the piece whose inequality includes ${ms(x)} (the one with ≤ or ≥ at ${ms(x)}).`, `Here x = ${ms(x)} belongs to the piece f(x) = ${rule(piece)}.`],
      steps: [
        st("Find the piece that includes the boundary.", `The ${piece === 1 ? "first" : piece === 2 ? "middle" : "last"} piece includes x = ${ms(x)} (its inequality has an “or equal to” there).`),
        st("Substitute.", `f(${ms(x)}) = ${work(piece)}`),
      ],
      traps: traps(frac(ans), [trap(val(otherP), `That uses the piece f(x) = ${rule(otherP)}, but its inequality doesn't include x = ${ms(x)}.`)]),
    };
  },
};

// ---------------------------------------------------------------------------
const piecewiseGraph: Skill = {
  id: "m3.fn.piecewise-graph",
  title: "Read and match piecewise graphs",
  topic: T,
  standards: ["NC.M3.F-IF.7", "NC.M3.F-IF.4", "NC.M3.A-CED.2"],
  prereqs: ["m3.fn.piecewise-eval"],
  lesson: {
    bigIdea: "On a piecewise graph, a filled dot is a point on the graph and an open dot is a point that is left out. The filled dot tells you the value at the boundary.",
    explain: [
      "In the graph below, the left piece is y = x + 1 and ends with an open dot at (2, 3). The right piece is y = −x + 6 and starts with a filled dot at (2, 4).",
      "So f(2) = **4**, not 3. In symbols: f(x) = x + 1 if x < 2, and f(x) = −x + 6 if x ≥ 2.",
      "The graph has a **jump discontinuity** at x = 2: you'd have to lift your pencil to draw it.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 7, yMin: -3, yMax: 7, curves: [{ expr: "x+1", domain: [-4, 2] }, { expr: "-x+6", domain: [2, 7] }], points: [{ x: 2, y: 3, open: true }, { x: 2, y: 4, label: "(2, 4)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why can't a piecewise graph have filled dots at both (2, 3) and (2, 4)?", choices: ["Then the input 2 would have two outputs, so it wouldn't be a function.", "Because filled dots must be on the x-axis.", "It can; that's what a jump means."], correct: 0, explain: "A function gives one output per input. At a jump, exactly one of the two endpoints is filled." },
    { kind: "written", prompt: "Explain how you can tell from the inequality signs which piece gets the filled dot at a boundary.", keyIdeas: ["≤ or ≥ includes the boundary value", "< or > leaves it out", "the piece that includes it gets the filled dot; the other gets an open dot"], exemplar: "If a piece says x ≤ 2 or x ≥ 2, then 2 is part of that piece, so its endpoint is filled. If it says x < 2 or x > 2, 2 isn't included, so that end is an open dot." },
  ],
  generate(r, lv) {
    const c = r.int(-2, 2);
    const m1 = r.pick([-2, -1, 0, 1, 2]), m2 = r.pick([-2, -1, 1, 2]);
    const y1 = r.int(-3, 4);
    let y2 = r.int(-3, 4);
    if (y2 === y1) y2 = y1 + r.pick([-3, 2, 3]);
    const b1 = y1 - m1 * c, b2 = y2 - m2 * c;
    const leftClosed = r.chance(0.5);
    const f1 = (x: number) => m1 * x + b1, f2 = (x: number) => m2 * x + b2;
    const ys = [f1(-6), f1(c), f2(c), f2(6)];
    const yMin = Math.min(...ys, 0) - 1, yMax = Math.max(...ys, 0) + 1;
    const visual = {
      type: "plot" as const, xMin: -6, xMax: 6, yMin, yMax, yStep: yMax - yMin > 24 ? 4 : 2,
      curves: [{ expr: linT(m1, b1), domain: [-6, c] as [number, number] }, { expr: linT(m2, b2), domain: [c, 6] as [number, number] }],
      points: [{ x: c, y: y1, open: !leftClosed }, { x: c, y: y2, open: leftClosed }],
    };
    const closedY = leftClosed ? y1 : y2, openY = leftClosed ? y2 : y1;
    if (lv === 1) {
      const side = r.chance(0.5) ? -1 : 1;
      const x = c + side * r.int(1, 3);
      const ans = side < 0 ? f1(x) : f2(x);
      return {
        prompt: `The graph of y = f(x) is shown. Find f(${ms(x)}).`,
        visual,
        answer: num(ans),
        hints: [`Find x = ${ms(x)} on the horizontal axis and go up or down to the graph.`, `x = ${ms(x)} is ${side < 0 ? "left" : "right"} of the break at x = ${ms(c)}, so read the ${side < 0 ? "left" : "right"} piece.`],
        steps: [st("Locate the input.", `x = ${ms(x)} is on the ${side < 0 ? "left" : "right"} piece.`), st("Read the output.", `The graph passes through (${ms(x)}, ${ms(ans)}), so f(${ms(x)}) = ${ms(ans)}.`)],
        traps: traps(frac(ans), [trap(side < 0 ? f2(x) : f1(x), "That's where the other piece would be if it continued. Only one piece exists at each x.")]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `The graph of y = f(x) is shown. Find f(${ms(c)}).`,
        visual,
        answer: num(closedY),
        hints: ["Two pieces meet at this x-value. Which endpoint is a filled dot?", `The filled dot is on the ${leftClosed ? "left" : "right"} piece.`],
        steps: [
          st("Look at the boundary x = " + ms(c) + ".", `There's an open dot at (${ms(c)}, ${ms(openY)}) and a filled dot at (${ms(c)}, ${ms(closedY)}).`),
          st("Use the filled dot.", `The open dot is not on the graph, so f(${ms(c)}) = ${ms(closedY)}.`),
        ],
        traps: traps(frac(closedY), [trap(openY, "That point is an open dot, so it is not part of the graph.")]),
      };
    }
    const L = linear(m1, b1), R = linear(m2, b2);
    const s1 = leftClosed ? "≤" : "<", s2 = leftClosed ? ">" : "≥";
    const mk = (a: string, sa: string, b: string, sb: string) => `f(x) = ${a} if x ${sa} ${ms(c)}; f(x) = ${b} if x ${sb} ${ms(c)}`;
    const correct = mk(L, s1, R, s2);
    const wrongL = m1 !== 0 ? linear(-m1, b1) : linear(m1, b1 + 2);
    return {
      prompt: "Which definition matches the graph of y = f(x)?",
      visual,
      answer: choice(r, correct, [
        [mk(L, leftClosed ? "<" : "≤", R, leftClosed ? "≥" : ">"), "The rules are right, but check which endpoint is filled at the boundary."],
        [mk(R, s1, L, s2), "The rules are swapped: find the slope and intercept of the left piece first."],
        [mk(wrongL, s1, R, s2), "Check the left piece's slope and intercept using two points on it."],
      ]),
      hints: [`Find the equation of each line from two points on it. The left piece passes through (${ms(c)}, ${ms(y1)}).`, `The ${leftClosed ? "left" : "right"} piece has the filled dot at x = ${ms(c)}, so its inequality uses ${leftClosed ? "≤" : "≥"}.`],
      steps: [
        st("Left piece.", `It passes through (${ms(c)}, ${ms(y1)}) with slope ${ms(m1)}, so y = ${L}.`),
        st("Right piece.", `It passes through (${ms(c)}, ${ms(y2)}) with slope ${ms(m2)}, so y = ${R}.`),
        st("Boundary.", `The filled dot is on the ${leftClosed ? "left" : "right"} piece, so that piece includes x = ${ms(c)}.`),
        st("Answer.", correct),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const absValue: Skill = {
  id: "m3.fn.abs-value",
  title: "Absolute value equations and inequalities",
  topic: T,
  standards: ["NC.M3.A-CED.1", "NC.M3.F-IF.7", "NC.M3.A-REI.1"],
  prereqs: [],
  lesson: {
    bigIdea: "|x − h| is the distance from x to h. Isolate the absolute value, then split into two cases: the inside equals +d or −d.",
    explain: [
      "Solve 2|x − 3| + 1 = 9. Subtract 1: 2|x − 3| = 8. Divide by 2: |x − 3| = 4.",
      "Distance 4 from 3 means x − 3 = 4 or x − 3 = −4, so **x = 7 or x = −1**. On the graph, these are where y = 2|x − 3| + 1 meets y = 9.",
      "Inequalities use the same distance idea: |x − 3| ≤ 4 means *within* 4 of 3, so −1 ≤ x ≤ 7. |x − 3| > 4 means *farther* than 4, so x < −1 or x > 7.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 9, yMin: -1, yMax: 12, curves: [{ expr: "2abs(x-3)+1" }, { expr: "9", color: 2, label: "y = 9" }], points: [{ x: -1, y: 9, label: "(−1, 9)" }, { x: 7, y: 9, label: "(7, 9)" }] },
    tip: "If isolating gives |stuff| = a negative number, there is no solution: distances are never negative.",
  },
  why: [
    { kind: "choice", prompt: "Why does |x − 5| = 2 have two solutions?", choices: ["Two numbers are exactly 2 away from 5: 3 and 7.", "Because absolute value doubles everything.", "It only has one solution, x = 7."], correct: 0, explain: "Absolute value measures distance, and you can go 2 units either way from 5." },
    { kind: "written", prompt: "When you solve −3|x + 1| + 4 ≥ −8, the inequality sign flips at one step. Explain which step and why.", keyIdeas: ["subtract 4 to get −3|x + 1| ≥ −12", "divide by −3", "dividing by a negative reverses the inequality, giving |x + 1| ≤ 4"], exemplar: "First subtract 4: −3|x + 1| ≥ −12. Then divide both sides by −3. Dividing by a negative number reverses the order of the two sides, so the sign flips: |x + 1| ≤ 4. That means −5 ≤ x ≤ 3." },
  ],
  generate(r, lv) {
    const h = r.int(-6, 6), d = r.int(1, 7);
    const inside = `|${xm(h)}|`;
    if (lv === 1) {
      return {
        prompt: `Solve ${inside} = ${d}. Give both solutions.`,
        answer: { kind: "multi", fields: [{ value: frac(h - d), pre: "x =" }, { value: frac(h + d), pre: "x =" }], anyOrder: [0, 1] },
        hints: [`Absolute value is distance: which numbers are ${d} away from ${ms(h)}?`, `Set up two equations: ${xm(h)} = ${d} and ${xm(h)} = −${d}.`],
        steps: [
          st("Split into two cases.", `${xm(h)} = ${d}  or  ${xm(h)} = −${d}`),
          st("Solve each.", `x = ${ms(h)} + ${d} = ${ms(h + d)}  or  x = ${ms(h)} − ${d} = ${ms(h - d)}`),
          st("Check.", `|${ms(h + d)}${cst(-h)}| = ${d} ✓ and |${ms(h - d)}${cst(-h)}| = |−${d}| = ${d} ✓`),
        ],
      };
    }
    const a = r.pick(lv === 2 ? [2, 3, 4, 5] : [2, 3, 4, -2, -3]), k = r.nonzero(-9, 9);
    const rhs = a * d + k;
    if (lv === 2) {
      return {
        prompt: `Solve ${a}${inside}${cst(k)} = ${ms(rhs)}. Give both solutions.`,
        answer: { kind: "multi", fields: [{ value: frac(h - d), pre: "x =" }, { value: frac(h + d), pre: "x =" }], anyOrder: [0, 1] },
        hints: [`Get the absolute value by itself first: undo the ${k > 0 ? "+" : "−"} ${Math.abs(k)}, then divide by ${a}.`, `You should get ${inside} = ${d}. Now split into two cases.`],
        steps: [
          st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)} on both sides.`, `${a}${inside} = ${ms(rhs - k)}`),
          st(`Divide by ${a}.`, `${inside} = ${d}`),
          st("Split into two cases.", `${xm(h)} = ${d} gives x = ${ms(h + d)}; ${xm(h)} = −${d} gives x = ${ms(h - d)}.`),
        ],
      };
    }
    // Level 3: inequality, possibly dividing by a negative.
    const ops = ["<", "≤", ">", "≥"] as const;
    const op = r.pick(ops);
    const flip = (o: (typeof ops)[number]) => (o === "<" ? ">" : o === ">" ? "<" : o === "≤" ? "≥" : "≤");
    const shown = a < 0 ? flip(op) : op; // the inequality we print (before dividing by a)
    const within = op === "<" || op === "≤", incl = op === "≤" || op === "≥";
    const lo = h - d, hi = h + d;
    const between = (i: boolean, l: number, u: number) => `${ms(l)} ${i ? "≤" : "<"} x ${i ? "≤" : "<"} ${ms(u)}`;
    const outside = (i: boolean, l: number, u: number) => `x ${i ? "≤" : "<"} ${ms(l)} or x ${i ? "≥" : ">"} ${ms(u)}`;
    const sol = (w: boolean, i: boolean, l = lo, u = hi) => (w ? between(i, l, u) : outside(i, l, u));
    const correct = sol(within, incl);
    const wrongCenter = h !== 0 ? sol(within, incl, -h - d, -h + d) : sol(!within, !incl);
    return {
      prompt: `Solve ${a}${inside}${cst(k)} ${shown} ${ms(rhs)}.`,
      answer: choice(r, correct, [
        [sol(!within, incl), a < 0 ? "Dividing by a negative number flips the inequality. Did you flip it?" : "“Less than” a distance means *within* it (between two values); “greater than” means outside."],
        [sol(within, !incl), "Check the endpoints: ≤ and ≥ include them; < and > don't."],
        [wrongCenter, `The center is ${ms(h)}, because ${xm(h)} = 0 when x = ${ms(h)}.`],
      ]),
      hints: [
        `Isolate the absolute value: ${k > 0 ? "subtract" : "add"} ${Math.abs(k)}, then divide by ${a}.${a < 0 ? " You're dividing by a negative, so flip the sign." : ""}`,
        `You should get ${inside} ${op} ${d}: x is ${within ? "within" : "more than"} ${d} unit${d === 1 ? "" : "s"} ${within ? "of" : "away from"} ${ms(h)}.`,
      ],
      steps: [
        st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${a}${inside} ${shown} ${ms(rhs - k)}`),
        st(`Divide by ${a}.`, `${inside} ${op} ${d}${a < 0 ? " (dividing by a negative flips the sign)" : ""}`),
        st("Think distance.", `x is ${within ? "within" : "more than"} ${d} unit${d === 1 ? "" : "s"} ${within ? "of" : "away from"} ${ms(h)}${incl ? " (endpoints included)" : ""}. The endpoints are ${ms(h)} − ${d} = ${ms(lo)} and ${ms(h)} + ${d} = ${ms(hi)}.`),
        st("Answer.", correct),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
interface Parent {
  name: string;
  /** typed f(u) */
  t: (u: string) => string;
  /** display f(u) */
  d: (u: string) => string;
  sqrt?: boolean;
}

const PARENTS: Parent[] = [
  { name: "x^2", t: (u) => `(${u})^2`, d: (u) => (u === "x" ? "x^2" : `(${u})^2`) },
  { name: "|x|", t: (u) => `abs(${u})`, d: (u) => `|${u}|` },
  { name: "√x", t: (u) => `sqrt(${u})`, d: (u) => (u === "x" ? "√x" : `√(${u})`), sqrt: true },
  { name: "x^3", t: (u) => `(${u})^3`, d: (u) => (u === "x" ? "x^3" : `(${u})^3`) },
  { name: "2^x", t: (u) => `2^(${u})`, d: (u) => (u === "x" ? "2^x" : `2^(${u})`) },
];

const transformWrite: Skill = {
  id: "m3.fn.transform-write",
  title: "Write transformed functions",
  topic: T,
  standards: ["NC.M3.F-BF.3"],
  prereqs: [],
  lesson: {
    bigIdea: "g(x) = a·f(b(x − h)) + k: numbers outside f move the graph up/down or stretch it vertically; numbers inside f act on x, so they move it left/right or squeeze it horizontally, and they work “backwards”.",
    explain: [
      "Start with f(x) = x^2. Shifting 3 units **right** replaces x with x − 3: f(x − 3) = (x − 3)^2. (Inside changes are opposite to the sign you see.)",
      "Stretching vertically by 2 multiplies the outputs: 2f(x − 3) = 2(x − 3)^2. Then shifting 4 units down subtracts 4: **g(x) = 2(x − 3)^2 − 4**.",
      "f(2x) compresses the graph horizontally by a factor of {1/2} (points move halfway to the y-axis). f({1/2}x) stretches it horizontally by 2. −f(x) reflects it across the x-axis.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 7, yMin: -5, yMax: 9, curves: [{ expr: "x^2", label: "f", color: 2, dashed: true }, { expr: "2(x-3)^2-4", label: "g" }], points: [{ x: 3, y: -4, label: "(3, −4)" }] },
    tip: "Inside f: x − 3 means right 3, x + 3 means left 3. Outside f: + 3 means up 3.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(x − 3) shift the graph to the right, not the left?", choices: ["g(x) = f(x − 3) reaches each output 3 units later: g(5) = f(2), so every point moves right 3.", "Because subtracting always moves things right.", "It actually shifts left."], correct: 0, explain: "For g to output what f outputs at x = 2, you need x − 3 = 2, so x = 5: every point slides 3 to the right." },
    { kind: "written", prompt: "Explain the difference between g(x) = 2f(x) and h(x) = f(2x).", keyIdeas: ["2f(x) multiplies outputs by 2: vertical stretch", "f(2x) changes the inputs: horizontal compression by 1/2", "points on 2f(x) keep their x; points on f(2x) keep their y"], exemplar: "In 2f(x) the outputs are doubled, so each point (x, y) becomes (x, 2y): a vertical stretch. In f(2x) the input is doubled, so h reaches each output at half the x-value: (x, y) becomes (x/2, y), a horizontal compression." },
  ],
  generate(r, lv) {
    const p = r.pick(PARENTS);
    let a = 1, h = 0, k = 0, b = 1;
    const pickH = () => (p.sqrt ? r.nonzero(-5, 2) : r.nonzero(-5, 5));
    if (lv === 1) {
      const which = r.int(0, 2);
      if (which === 0) h = pickH();
      else if (which === 1) k = r.nonzero(-6, 6);
      else a = r.pick([2, 3, 4, -1]);
    } else if (lv === 2) {
      const which = r.int(0, 2);
      if (which === 0) { h = pickH(); k = r.nonzero(-6, 6); }
      else if (which === 1) { a = r.pick([2, 3, -2, -1]); k = r.nonzero(-6, 6); }
      else { a = r.pick([2, 3, -1, 0.5]); h = pickH(); }
    } else {
      if (r.chance(0.5)) { b = r.pick([2, 3, 0.5]); k = r.nonzero(-6, 6); if (r.chance(0.5)) a = r.pick([-1, 2]); }
      else { a = r.pick([-1, -2, 3]); h = pickH(); k = r.nonzero(-6, 6); }
    }
    const innerT = b !== 1 ? (b === 0.5 ? "x/2" : `${b}x`) : xmT(h);
    const innerD = b !== 1 ? (b === 0.5 ? "{1/2}x" : `${b}x`) : xm(h);
    const aT = a === 1 ? "" : a === -1 ? "-" : `${a}*`;
    const aD = (a === 0.5 ? "{1/2}" : coef(a)) + (p.name === "2^x" && Math.abs(a) !== 1 ? "·" : "");
    const typed = `${aT}${p.t(innerT)}${k ? (k > 0 ? `+${k}` : `${k}`) : ""}`;
    const display = `${aD}${p.d(innerD)}${cst(k)}`;
    const desc: string[] = [];
    const steps: string[] = [];
    if (h) {
      desc.push(`shifted ${Math.abs(h)} unit${Math.abs(h) === 1 ? "" : "s"} ${h > 0 ? "right" : "left"}`);
      steps.push(st(`Shift ${h > 0 ? "right" : "left"} ${Math.abs(h)}: replace x with ${xm(h)}.`, `f(${xm(h)}) = ${p.d(xm(h))}`));
    }
    if (b !== 1) {
      desc.push(b === 0.5 ? "stretched horizontally by a factor of 2" : `compressed horizontally by a factor of {1/${b}}`);
      steps.push(st(b === 0.5 ? "Horizontal stretch by 2: replace x with {1/2}x." : `Horizontal compression by {1/${b}}: replace x with ${b}x.`, `f(${innerD}) = ${p.d(innerD)}`));
    }
    if (a !== 1) {
      const words = a === -1 ? "reflected across the x-axis" : a < 0 ? `reflected across the x-axis and stretched vertically by a factor of ${-a}` : a === 0.5 ? "compressed vertically by a factor of {1/2}" : `stretched vertically by a factor of ${a}`;
      desc.push(words);
      steps.push(st(a === -1 ? "Reflect across the x-axis: multiply the outputs by −1." : `Multiply the outputs by ${a === 0.5 ? "{1/2}" : ms(a)}.`, `${aD}${p.d(innerD)}`));
    }
    if (k) {
      desc.push(`shifted ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "up" : "down"}`);
      steps.push(st(`Shift ${k > 0 ? "up" : "down"} ${Math.abs(k)}: ${k > 0 ? "add" : "subtract"} ${Math.abs(k)} ${k > 0 ? "to" : "from"} the outputs.`, `${display}`));
    }
    const list = desc.length > 1 ? `${desc.slice(0, -1).join(", ")}, and then ${desc[desc.length - 1]}` : desc[0];
    steps.push(st("Answer.", `g(x) = ${display}`));
    return {
      prompt: `The graph of g is the graph of f(x) = ${p.d("x")} ${list}. Write g(x).`,
      answer: expr(typed, { lhs: "g(x)", display }),
      hints: [
        h ? `A horizontal shift changes the input: ${h > 0 ? "right" : "left"} ${Math.abs(h)} means replace x with ${xm(h)} (the sign looks opposite).` : b !== 1 ? `A horizontal ${b === 0.5 ? "stretch" : "compression"} multiplies the input x by ${b === 0.5 ? "{1/2}" : b}.` : `${a !== 1 ? "A vertical stretch or reflection multiplies the whole output." : "A vertical shift adds to the whole output."}`,
        `Build it step by step: start from f(x) = ${p.d("x")} and apply each change in order.`,
      ],
      steps,
    };
  },
};

// ---------------------------------------------------------------------------
const transformPoint: Skill = {
  id: "m3.fn.transform-point",
  title: "How transformations move graphs and points",
  topic: T,
  standards: ["NC.M3.F-BF.3"],
  prereqs: ["m3.fn.transform-write"],
  lesson: {
    bigIdea: "Track a single point. For g(x) = a·f(x − h) + k, the point (p, q) on f moves to (p + h, a·q + k). For f(bx), the x-coordinate is divided by b.",
    explain: [
      "Suppose (4, 6) is on the graph of f, and g(x) = 2f(x − 3) + 1.",
      "Inside: x − 3 = 4 when x = 7, so the x-coordinate becomes 7. Outside: the output is 2 · 6 + 1 = 13. So **(7, 13)** is on g.",
      "For h(x) = f(2x): 2x = 4 when x = 2, so (4, 6) moves to **(2, 6)**. Inside changes act on x, and they undo the operation you see.",
    ],
  },
  why: [
    { kind: "choice", prompt: "(4, 6) is on f. Why is (2, 6) on y = f(2x), and not (8, 6)?", choices: ["When x = 2, the input to f is 2 · 2 = 4, which gives f(4) = 6.", "Because you always halve the y-coordinate.", "It should be (8, 6), since you multiply x by 2."], correct: 0, explain: "You need 2x to equal 4, which happens at x = 2." },
    { kind: "written", prompt: "(1, 5) is on the graph of f. Explain how to find a point on g(x) = −f(x) + 3.", keyIdeas: ["the input stays 1 (no change inside f)", "the output 5 is multiplied by −1 to get −5", "then 3 is added: −5 + 3 = −2, so (1, −2)"], exemplar: "Nothing changes inside f, so x stays 1. The output f(1) = 5 is reflected to −5, then shifted up 3 to −2. So (1, −2) is on g." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const kind = r.int(0, 3);
      const n = r.int(2, 5);
      const opts: Record<string, string> = {
        left: `Shifted ${n} units left`, right: `Shifted ${n} units right`, up: `Shifted ${n} units up`, down: `Shifted ${n} units down`,
        vs: `Stretched vertically by a factor of ${n}`, hc: `Compressed horizontally by a factor of 1/${n}`, hs: `Stretched horizontally by a factor of ${n}`, vc: `Compressed vertically by a factor of 1/${n}`,
      };
      const cases = [
        { g: `g(x) = f(x + ${n})`, ok: "left", wrong: [["right", "Inside f, + moves the graph left: g(x) = f(x + n) reaches each output n units sooner."], ["up", `Adding inside the parentheses changes x, not y.`], ["down", "Inside changes are horizontal."]] },
        { g: `g(x) = f(x) − ${n}`, ok: "down", wrong: [["left", "Subtracting outside f changes the outputs, so the move is vertical."], ["right", "Outside changes are vertical."], ["up", "Subtracting lowers every output."]] },
        { g: `g(x) = ${n}f(x)`, ok: "vs", wrong: [["hc", `Multiplying the output by ${n} stretches vertically; f(${n}x) would compress horizontally.`], ["up", `That would be f(x) + ${n}.`], ["vc", "Multiplying by a number greater than 1 makes it taller, not shorter."]] },
        { g: `g(x) = f(${n}x)`, ok: "hc", wrong: [["vs", `That would be ${n}f(x). Multiplying the input squeezes the graph toward the y-axis.`], ["hs", "Inside changes work backwards: f(nx) reaches each output sooner, so it's compressed."], ["right", "Multiplying x doesn't slide the graph; it squeezes it."]] },
      ];
      const c = cases[kind];
      return {
        prompt: `How does the graph of ${c.g} compare with the graph of y = f(x)?`,
        answer: choice(r, opts[c.ok], c.wrong.map(([k, fb]) => [opts[k], fb] as [string, string])),
        hints: ["Is the change inside f (acting on x) or outside f (acting on the output)?", "Inside changes are horizontal and work the opposite way you'd expect; outside changes are vertical and work as written."],
        steps: [st("Inside or outside?", kind === 0 || kind === 3 ? "The change is inside f, so it's horizontal." : "The change is outside f, so it's vertical."), st("Answer.", opts[c.ok] + ".")],
      };
    }
    const p = r.int(-5, 5), q = r.int(-6, 6);
    if (lv === 2) {
      const a = r.pick([2, 3, -1, -2, 4]), h = r.nonzero(-5, 5), k = r.nonzero(-6, 6);
      const gx = p + h, gy = a * q + k;
      return {
        prompt: `The point (${ms(p)}, ${ms(q)}) is on the graph of y = f(x). Which point must be on the graph of g(x) = ${coef(a)}f(${xm(h)})${cst(k)}?`,
        answer: { kind: "multi", fields: [{ value: frac(gx), pre: "x =" }, { value: frac(gy), pre: "y =" }] },
        hints: [`For the x-coordinate, ask: what x makes ${xm(h)} equal to ${ms(p)}?`, `For the y-coordinate, apply the outside changes to f(${ms(p)}) = ${ms(q)}: multiply by ${ms(a)}, then ${k > 0 ? "add" : "subtract"} ${Math.abs(k)}.`],
        steps: [
          st("Find the new x.", `${xm(h)} = ${ms(p)} when x = ${ms(p)} ${h > 0 ? "+" : "−"} ${Math.abs(h)} = ${ms(gx)}.`),
          st("Find the new y.", `g(${ms(gx)}) = ${ms(a)} · f(${ms(p)})${cst(k)} = ${ms(a)} · ${sn(q)}${cst(k)} = ${ms(gy)}.`),
          st("Answer.", `(${ms(gx)}, ${ms(gy)})`),
        ],
      };
    }
    const b = r.pick([2, 3, -1, 0.5]);
    const pp = b === 0.5 ? p : b * r.int(-3, 3);
    const k = r.nonzero(-6, 6), a = r.pick([1, 2, -1]);
    const gx = pp / b, gy = a * q + k;
    const bD = b === 0.5 ? "{1/2}x" : b === -1 ? "−x" : `${b}x`;
    return {
      prompt: `The point (${ms(pp)}, ${ms(q)}) is on the graph of y = f(x). Which point must be on the graph of g(x) = ${coef(a)}f(${bD})${cst(k)}?`,
      answer: { kind: "multi", fields: [{ value: frac(gx), pre: "x =" }, { value: frac(gy), pre: "y =" }] },
      hints: [`What x makes ${bD} = ${ms(pp)}?`, `Divide: x = ${ms(pp)} ÷ ${b === 0.5 ? "{1/2}" : sn(b)}. Then apply the outside changes to ${ms(q)}.`],
      steps: [
        st("Find the new x.", `${bD} = ${ms(pp)} when x = ${ms(pp)} ÷ ${b === 0.5 ? "{1/2}" : sn(b)} = ${ms(gx)}.`),
        st("Find the new y.", `g(${ms(gx)}) = ${a === 1 ? "" : `${ms(a)} · `}f(${ms(pp)})${cst(k)} = ${a === 1 ? "" : `${ms(a)} · `}${sn(q)}${cst(k)} = ${ms(gy)}.`),
        st("Answer.", `(${ms(gx)}, ${ms(gy)})`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const inverseLinear: Skill = {
  id: "m3.fn.inverse-linear",
  title: "Find the inverse of a linear function",
  topic: T,
  standards: ["NC.M3.F-BF.4", "NC.M3.F-BF.4a"],
  prereqs: [],
  lesson: {
    bigIdea: "An inverse function undoes f: if f(a) = b, then f^-1(b) = a. To find it, write y = f(x), swap x and y, and solve for y.",
    explain: [
      "f(x) = 3x − 5. Write y = 3x − 5, then swap: x = 3y − 5.",
      "Solve for y: x + 5 = 3y, so y = {x + 5/3}. That's **f^-1(x) = {x + 5/3}**.",
      "Check: f(4) = 7 and f^-1(7) = {12/3} = 4. The inverse undoes \"times 3, minus 5\" with \"plus 5, divide by 3\". The graphs are reflections of each other across y = x.",
    ],
    visual: { type: "plot", xMin: -6, xMax: 8, yMin: -6, yMax: 8, curves: [{ expr: "3x-5", label: "f" }, { expr: "(x+5)/3", label: "f^-1", color: 2 }, { expr: "x", dashed: true, color: 3, label: "y = x" }], points: [{ x: 4, y: 7, label: "(4, 7)" }, { x: 7, y: 4, label: "(7, 4)" }] },
    tip: "f^-1(x) means the inverse function, not 1 ÷ f(x).",
  },
  why: [
    { kind: "choice", prompt: "Why do you swap x and y to find an inverse?", choices: ["An inverse sends each output back to its input, so the roles of input and output trade places.", "Because x always has to come first.", "To make the slope positive."], correct: 0, explain: "If (a, b) is on f, then (b, a) is on f^-1." },
    { kind: "written", prompt: "Explain how you can check that g(x) = (x − 2)/4 is the inverse of f(x) = 4x + 2.", keyIdeas: ["compose them: f(g(x)) and g(f(x))", "both simplify to x", "or test a value: f(1) = 6 and g(6) = 1"], exemplar: "Compose them: f(g(x)) = 4 · (x − 2)/4 + 2 = x − 2 + 2 = x, and g(f(x)) = (4x + 2 − 2)/4 = x. Since each undoes the other, they're inverses. For example f(1) = 6 and g(6) = 1." },
  ],
  generate(r, lv) {
    const b = r.nonzero(-9, 9);
    if (lv === 1) {
      const a = r.int(2, 6);
      const display = `{x${cst(-b)}/${a}}`;
      return {
        prompt: `f(x) = ${linear(a, b)}. Find f^-1(x).`,
        answer: expr(`(${xmT(b)})/${a}`, { lhs: "f^-1(x)", display }),
        hints: ["Write y = f(x), then swap x and y.", `x = ${a}y${cst(b)}. Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)} first, then divide by ${a}.`],
        steps: [
          st("Write y = f(x) and swap x and y.", `x = ${a}y${cst(b)}`),
          st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}.`, `x${cst(-b)} = ${a}y`),
          st(`Divide by ${a}.`, `y = ${display}, so f^-1(x) = ${display}`),
          st("Check with a number.", `f(1) = ${ms(a + b)} and f^-1(${ms(a + b)}) = {${ms(a + b)}${cst(-b)}/${a}} = 1 ✓`),
        ],
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const a = r.int(2, 5);
        const display = `${a}(${xm(b)})`;
        return {
          prompt: `f(x) = {x/${a}}${cst(b)}. Find f^-1(x).`,
          answer: expr(`${a}(${xmT(b)})`, { lhs: "f^-1(x)", display }),
          hints: ["Swap x and y: x = {y/" + a + "}" + cst(b) + ".", `Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)}, then undo the division by multiplying by ${a}.`],
          steps: [
            st("Swap x and y.", `x = {y/${a}}${cst(b)}`),
            st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}.`, `x${cst(-b)} = {y/${a}}`),
            st(`Multiply by ${a}.`, `y = ${display}, so f^-1(x) = ${display}`),
          ],
        };
      }
      const a = r.int(2, 6);
      const display = `{${ms(b)} − x/${a}}`;
      return {
        prompt: `f(x) = ${linear(-a, b)}. Find f^-1(x).`,
        answer: expr(`(${b}-x)/${a}`, { lhs: "f^-1(x)", display }),
        hints: ["Swap x and y, then solve for y.", `x = −${a}y${cst(b)}. Move the ${ms(b)} first, then divide by −${a}.`],
        steps: [
          st("Swap x and y.", `x = −${a}y${cst(b)}`),
          st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}.`, `x${cst(-b)} = −${a}y`),
          st(`Divide by −${a}.`, `y = {x${cst(-b)}/−${a}} = ${display}`),
        ],
      };
    }
    const pairs: [number, number][] = [[2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3]];
    const [p, q] = r.pick(pairs);
    const s = r.sign();
    const display = `${s < 0 ? "−" : ""}{${q}/${p}}(${xm(b)})`;
    return {
      prompt: `f(x) = ${s < 0 ? "−" : ""}{${p}/${q}}x${cst(b)}. Find f^-1(x).`,
      answer: expr(`${s < 0 ? "-" : ""}${q}/${p}*(${xmT(b)})`, { lhs: "f^-1(x)", display }),
      hints: ["Swap x and y: x = " + (s < 0 ? "−" : "") + `{${p}/${q}}y${cst(b)}.`, `After moving ${ms(b)}, multiply both sides by the reciprocal ${s < 0 ? "−" : ""}{${q}/${p}}.`],
      steps: [
        st("Swap x and y.", `x = ${s < 0 ? "−" : ""}{${p}/${q}}y${cst(b)}`),
        st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}.`, `x${cst(-b)} = ${s < 0 ? "−" : ""}{${p}/${q}}y`),
        st("Multiply by the reciprocal.", `y = ${display}`),
        st("Answer.", `f^-1(x) = ${display}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const inverseQuadratic: Skill = {
  id: "m3.fn.inverse-quadratic",
  title: "Inverses of quadratic and square root functions",
  topic: T,
  standards: ["NC.M3.F-BF.4a", "NC.M3.F-BF.4c", "NC.M3.F-BF.4"],
  prereqs: ["m3.fn.inverse-linear"],
  lesson: {
    bigIdea: "Squaring and square-rooting undo each other, but only on half of a parabola. Restrict the quadratic to one side of its vertex, then swap x and y and solve.",
    explain: [
      "f(x) = (x − 2)^2 + 1 for x ≥ 2. Swap: x = (y − 2)^2 + 1. Subtract 1: x − 1 = (y − 2)^2.",
      "Take the square root. Because y ≥ 2 (the restricted domain), use the positive root: y − 2 = √(x − 1), so **f^-1(x) = 2 + √(x − 1)** for x ≥ 1.",
      "It works the other way too: the inverse of g(x) = √(x − 3) + 4 is g^-1(x) = (x − 4)^2 + 3, with domain x ≥ 4 (the range of g).",
    ],
    visual: { type: "plot", xMin: -1, xMax: 9, yMin: -1, yMax: 9, curves: [{ expr: "(x-2)^2+1", domain: [2, 9], label: "f" }, { expr: "2+sqrt(x-1)", label: "f^-1", color: 2 }, { expr: "x", dashed: true, color: 3 }], points: [{ x: 2, y: 1 }, { x: 1, y: 2 }] },
    tip: "The domain of the inverse is the range of the original function.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(x) = x^2 need a restricted domain before it has an inverse function?", choices: ["Without it, two inputs like 3 and −3 give the same output 9, so the inverse wouldn't know which to return.", "Because square roots of negatives don't exist.", "It doesn't; x^2 always has an inverse."], correct: 0, explain: "An inverse function needs each output to come from exactly one input." },
    { kind: "written", prompt: "f(x) = (x + 1)^2 − 5 for x ≥ −1. Explain why its inverse uses + √ and not − √.", keyIdeas: ["the domain of f, x ≥ −1, becomes the range of the inverse", "so the inverse's outputs must be at least −1", "−1 + √(x + 5) is at least −1; −1 − √(x + 5) would be less"], exemplar: "The inverse's outputs are f's inputs, which are all at least −1. The inverse is −1 ± √(x + 5). Only −1 + √(x + 5) gives values of −1 or more, so that's the one that matches the restricted domain." },
  ],
  generate(r, lv) {
    const lhs = "f^-1(x)";
    if (lv === 1) {
      const k = r.nonzero(-7, 2);
      return {
        prompt: `f(x) = x^2${cst(k)} for x ≥ 0. Find f^-1(x).`,
        answer: expr(`sqrt(${xmT(k)})`, { lhs, display: `√(${xm(k)})` }),
        hints: ["Swap x and y: x = y^2" + cst(k) + ".", `Isolate y^2, then take the square root. Since the original x ≥ 0, use the positive root.`],
        steps: [
          st("Swap x and y.", `x = y^2${cst(k)}`),
          st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `y^2 = ${xm(k)}`),
          st("Take the positive square root (the inverse's outputs are f's inputs, which are ≥ 0).", `y = √(${xm(k)})`),
          st("Answer.", `f^-1(x) = √(${xm(k)}) for x ≥ ${ms(k)}`),
        ],
      };
    }
    const h = r.nonzero(-5, 5);
    if (lv === 2) {
      if (r.chance(0.5)) {
        const k = r.nonzero(-7, 2);
        const display = `${ms(h)} + √(${xm(k)})`;
        return {
          prompt: `f(x) = (${xm(h)})^2${cst(k)} for x ≥ ${ms(h)}. Find f^-1(x).`,
          answer: expr(`${h}+sqrt(${xmT(k)})`, { lhs, display }),
          hints: [`Swap x and y: x = (y${cst(-h)})^2${cst(k)}.`, `Isolate the square, take the positive square root, then ${h > 0 ? "add" : "subtract"} ${Math.abs(h)}.`],
          steps: [
            st("Swap x and y.", `x = (y${cst(-h)})^2${cst(k)}`),
            st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${xm(k)} = (y${cst(-h)})^2`),
            st("Take the positive square root (y ≥ " + ms(h) + ").", `√(${xm(k)}) = y${cst(-h)}`),
            st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = ${display} for x ≥ ${ms(k)}`),
          ],
        };
      }
      const k = r.nonzero(-6, 6);
      const display = `(${xm(k)})^2${cst(h)}`;
      return {
        prompt: `f(x) = √(${xm(h)})${cst(k)}. Find f^-1(x).`,
        answer: expr(`(${xmT(k)})^2${h > 0 ? "+" : "-"}${Math.abs(h)}`, { lhs, display }),
        hints: [`Swap x and y: x = √(y${cst(-h)})${cst(k)}.`, `Isolate the square root, then square both sides.`],
        steps: [
          st("Swap x and y.", `x = √(y${cst(-h)})${cst(k)}`),
          st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${xm(k)} = √(y${cst(-h)})`),
          st("Square both sides.", `(${xm(k)})^2 = y${cst(-h)}`),
          st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = ${display}, for x ≥ ${ms(k)} (the range of f)`),
        ],
      };
    }
    if (r.chance(0.5)) {
      const a = r.pick([2, 3, 4]), k = r.nonzero(-7, 2);
      const display = `${ms(h)} + √({${xm(k)}/${a}})`;
      return {
        prompt: `f(x) = ${a}(${xm(h)})^2${cst(k)} for x ≥ ${ms(h)}. Find f^-1(x).`,
        answer: expr(`${h}+sqrt((${xmT(k)})/${a})`, { lhs, display }),
        hints: [`Swap x and y, then undo the ${cst(k).trim()} and the × ${a}.`, `You should reach {${xm(k)}/${a}} = (y${cst(-h)})^2. Take the positive root.`],
        steps: [
          st("Swap x and y.", `x = ${a}(y${cst(-h)})^2${cst(k)}`),
          st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)} and divide by ${a}.`, `{${xm(k)}/${a}} = (y${cst(-h)})^2`),
          st("Take the positive square root.", `√({${xm(k)}/${a}}) = y${cst(-h)}`),
          st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = ${display} for x ≥ ${ms(k)}`),
        ],
      };
    }
    const c = r.pick([2, 3]), k = r.nonzero(-6, 6);
    const display = `({${xm(k)}/${c}})^2${cst(h)}`;
    return {
      prompt: `f(x) = ${c}√(${xm(h)})${cst(k)}. Find f^-1(x).`,
      answer: expr(`((${xmT(k)})/${c})^2${h > 0 ? "+" : "-"}${Math.abs(h)}`, { lhs, display }),
      hints: ["Swap x and y, then isolate the square root.", `{${xm(k)}/${c}} = √(y${cst(-h)}). Square both sides.`],
      steps: [
        st("Swap x and y.", `x = ${c}√(y${cst(-h)})${cst(k)}`),
        st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)} and divide by ${c}.`, `{${xm(k)}/${c}} = √(y${cst(-h)})`),
        st("Square both sides.", `({${xm(k)}/${c}})^2 = y${cst(-h)}`),
        st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = ${display} for x ≥ ${ms(k)}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const YES = "Yes. Each output comes from exactly one input, so it passes the horizontal line test.";
const NO = "No. Some output comes from two different inputs, so it fails the horizontal line test.";
const YES_V = "Yes. Each input has exactly one output, so it passes the vertical line test.";
const NO_F = "No. It isn't a function, so it can't have an inverse.";

const inverseExists: Skill = {
  id: "m3.fn.inverse-exists",
  title: "Does an inverse function exist?",
  topic: T,
  standards: ["NC.M3.F-BF.4b"],
  prereqs: ["m3.fn.inverse-linear"],
  lesson: {
    bigIdea: "f has an inverse function exactly when every output comes from only one input (f is one-to-one). On a graph, that's the horizontal line test.",
    explain: [
      "**Graph:** if any horizontal line hits the graph more than once, there's no inverse function. y = x^2 fails (y = 4 hits at x = −2 and x = 2); y = x^3 passes.",
      "**Table:** look for a repeated output. If f(1) = 5 and f(4) = 5, then f^-1(5) would have to be both 1 and 4, so no inverse function exists.",
      "**Equation:** restricting the domain can fix it. x^2 fails, but x^2 for x ≥ 0 passes, because only the right half of the parabola is left.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 4, yMin: -2, yMax: 8, curves: [{ expr: "x^2", label: "y = x^2" }, { expr: "4", dashed: true, color: 2, label: "y = 4" }], points: [{ x: -2, y: 4 }, { x: 2, y: 4 }] },
    tip: "Vertical line test: is it a function? Horizontal line test: does its inverse exist?",
  },
  why: [
    { kind: "choice", prompt: "Why does the horizontal line test (not the vertical one) decide whether an inverse exists?", choices: ["The inverse swaps inputs and outputs, so a horizontal line on f becomes a vertical line on f^-1.", "Horizontal lines are easier to draw.", "Both tests always give the same answer."], correct: 0, explain: "Reflecting across y = x turns horizontal lines into vertical lines, so f^-1 is a function exactly when f passes the horizontal line test." },
    { kind: "written", prompt: "Explain why f(x) = |x| has no inverse function, and how you could restrict its domain so that it does.", keyIdeas: ["|−3| = |3| = 3, so the output 3 comes from two inputs", "the inverse couldn't choose between them", "restrict to x ≥ 0 (or x ≤ 0) so each output comes from one input"], exemplar: "Different inputs share outputs: |−3| and |3| are both 3, so f^-1(3) would need two values. If you only use x ≥ 0, then |x| = x there, every output comes from one input, and the inverse is f^-1(x) = x for x ≥ 0." },
  ],
  generate(r, lv) {
    const wrongFor = (yes: boolean): [string, string][] => yes
      ? [[NO, "Try drawing horizontal lines: none of them crosses more than once."], [YES_V, "Being a function is not enough; the test for an inverse is about outputs."], [NO_F, "It is a function: each input has one output."]]
      : [[YES, "Look again: at least one output is shared by two inputs."], [YES_V, "It is a function, but an inverse needs each output to come from one input."], [NO_F, "It is a function; the problem is that outputs repeat."]];
    if (lv === 1) {
      const s = r.int(-2, 2), t = r.int(-1, 2);
      const graphs = [
        { e: `x^2${t ? (t > 0 ? `+${t}` : `${t}`) : ""}-2`, yes: false, why: "the parabola gives the same y for x-values on either side of its vertex" },
        { e: `0.5(x${s >= 0 ? "-" : "+"}${Math.abs(s)})^3+${t + 1}`, yes: true, why: "this cubic is always increasing, so no output repeats" },
        { e: `abs(x${s >= 0 ? "-" : "+"}${Math.abs(s)})+${t}`, yes: false, why: "the V-shape gives the same y on both sides of its vertex" },
        { e: `2^x${t ? (t > 0 ? `+${t}` : `${t}`) : ""}`, yes: true, why: "the exponential is always increasing" },
        { e: `sqrt(x+4)${t ? (t > 0 ? `+${t}` : `${t}`) : ""}`, yes: true, why: "the square root graph is always increasing" },
        { e: "x^3-4x", yes: false, why: "the graph rises, falls, and rises again, so some horizontal lines cross it three times" },
        { e: "2sin(x)+1", yes: false, why: "the wave repeats its outputs forever" },
        { e: `-0.5x+${t + 1}`, yes: true, why: "a non-horizontal line never repeats an output" },
      ];
      const g = r.pick(graphs);
      const correct = g.yes ? YES : NO;
      return {
        prompt: "Does the function graphed below have an inverse function?",
        visual: { type: "plot", xMin: -5, xMax: 5, yMin: -6, yMax: 8, curves: [{ expr: g.e }] },
        answer: choice(r, correct, wrongFor(g.yes), true),
        hints: ["Imagine sliding a horizontal line up and down the graph.", "If any horizontal line crosses the graph twice, two inputs share an output."],
        steps: [st("Apply the horizontal line test.", `${g.yes ? "No horizontal line crosses the graph more than once" : "Some horizontal lines cross the graph more than once"}: ${g.why}.`), st("Conclusion.", correct)],
      };
    }
    if (lv === 2) {
      const xs = [0, 1, 2, 3, 4, 5].map((v) => v + r.int(-2, 0) * 0);
      const base = r.shuffle([-7, -4, -1, 2, 3, 5, 6, 8, 9, 11, 12, 15]).slice(0, 6);
      const yes = r.chance(0.5);
      let i = -1, j = -1;
      if (!yes) {
        i = r.int(0, 2);
        j = r.int(3, 5);
        base[j] = base[i];
      }
      const correct = yes ? YES : NO;
      return {
        prompt: "Does the function f in the table have an inverse function?",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...base.map((v) => ms(v))]] },
        answer: choice(r, correct, wrongFor(yes), true),
        hints: ["Look at the f(x) row. Does any output appear twice?", "If two different x-values share an output, the inverse wouldn't know which one to send it back to."],
        steps: yes
          ? [st("Check the outputs.", `All six outputs are different, so each output comes from exactly one input.`), st("Conclusion.", correct)]
          : [st("Check the outputs.", `f(${xs[i]}) = f(${xs[j]}) = ${ms(base[i])}.`), st("So f^-1(" + ms(base[i]) + ") would need two values.", correct)],
      };
    }
    const h = r.int(1, 4), k = r.int(1, 6);
    const eqs = [
      { f: `f(x) = x^2 + ${k}`, yes: false, why: `f(−1) = f(1) = ${1 + k}` },
      { f: `f(x) = x^2 + ${k}, for x ≥ 0`, yes: true, why: "only the right half of the parabola is used, and it's always increasing" },
      { f: `f(x) = (x − ${h})^2, for x ≤ ${h}`, yes: true, why: "only the left half of the parabola is used, and it's always decreasing" },
      { f: `f(x) = (x − ${h})^2`, yes: false, why: `f(${h - 1}) = f(${h + 1}) = 1` },
      { f: `f(x) = |x| − ${k}`, yes: false, why: `f(−2) = f(2) = ${ms(2 - k)}` },
      { f: `f(x) = |x − ${h}|, for x ≥ ${h}`, yes: true, why: `on x ≥ ${h} this is just x − ${h}, a line` },
      { f: `f(x) = x^3 + ${k}`, yes: true, why: "cubing is always increasing, so no output repeats" },
      { f: `f(x) = ${k + 1} − 2x`, yes: true, why: "it's a line with nonzero slope" },
      { f: `f(x) = x^4 − ${k}`, yes: false, why: `f(−1) = f(1) = ${ms(1 - k)}` },
      { f: `f(x) = ${k}·2^x`, yes: true, why: "an exponential function is always increasing" },
    ];
    const e = r.pick(eqs);
    const correct = e.yes ? YES : NO;
    return {
      prompt: `Does ${e.f} have an inverse function?`,
      answer: choice(r, correct, wrongFor(e.yes), true),
      hints: ["Can two different inputs give the same output? Try a pair of opposites like −1 and 1.", "Pay attention to any domain restriction: it removes part of the graph."],
      steps: [st("Look for repeated outputs.", e.yes ? `None: ${e.why}.` : `Yes: ${e.why}.`), st("Conclusion.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const inverseContext: Skill = {
  id: "m3.fn.inverse-context",
  title: "Use inverse functions in context",
  topic: T,
  standards: ["NC.M3.F-BF.4c", "NC.M3.F-BF.4"],
  prereqs: ["m3.fn.inverse-linear"],
  lesson: {
    bigIdea: "If f turns an input into an output, f^-1 answers the reverse question: “what input gives this output?”",
    explain: [
      "A rideshare costs C(m) = 2.5m + 4 dollars for m miles. C(10) = 29 answers “how much for 10 miles?”",
      "C^-1(24) answers “how many miles for $24?” Solve 2.5m + 4 = 24: m = 8. So **C^-1(24) = 8**: $24 buys an 8-mile ride.",
      "The inverse as a formula is C^-1(x) = {x − 4/2.5}: subtract the $4 fee, then divide by $2.50 per mile.",
    ],
  },
  why: [
    { kind: "choice", prompt: "T(c) = 1.8c + 32 converts Celsius to Fahrenheit. What does T^-1(50) mean?", choices: ["The Celsius temperature that equals 50°F.", "The Fahrenheit temperature that equals 50°C.", "1 ÷ T(50)."], correct: 0, explain: "T^-1 takes a Fahrenheit output and returns the Celsius input: T^-1(50) = 10." },
    { kind: "written", prompt: "The table shows a drone's height h(t) in feet after t seconds. Explain how to find h^-1(40) from the table and what it means.", keyIdeas: ["look for 40 in the h(t) row (outputs)", "read the t-value above it", "it's the time when the drone is 40 feet high"], exemplar: "h^-1(40) asks for the input that gives an output of 40. Find 40 in the height row and read the time above it. That time is when the drone reaches 40 feet." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      if (r.chance(0.5)) {
        const rate = r.pick([1.5, 2, 2.5, 3]), fee = r.pick([3, 4, 5, 6]), m = r.int(4, 18);
        const total = rate * m + fee;
        return {
          prompt: `A rideshare costs C(m) = ${dn(rate)}m + ${fee} dollars for a trip of m miles. Find C^-1(${dn(total)}).`,
          answer: num(m, { unit: " miles" }),
          hints: [`C^-1(${dn(total)}) asks: how many miles cost $${dn(total)}?`, `Solve ${dn(rate)}m + ${fee} = ${dn(total)}.`],
          steps: [
            st("Set up the reverse question.", `${dn(rate)}m + ${fee} = ${dn(total)}`),
            st(`Subtract ${fee}.`, `${dn(rate)}m = ${dn(total - fee)}`),
            st(`Divide by ${dn(rate)}.`, `m = ${m}`),
            st("Interpret.", `$${dn(total)} pays for a trip of ${m} miles, so C^-1(${dn(total)}) = ${m}.`),
          ],
          traps: traps(frac(m), [trap(rate * total + fee, `That's C(${dn(total)}), the cost of ${dn(total)} miles. The inverse goes the other way.`), trap(total / rate, `Remember to subtract the $${fee} fee before dividing.`)]),
        };
      }
      const c = r.pick([-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40]);
      const F = 1.8 * c + 32;
      return {
        prompt: `T(c) = 1.8c + 32 converts c degrees Celsius to degrees Fahrenheit. Find T^-1(${dn(F)}).`,
        answer: num(c, { unit: "°C" }),
        hints: [`T^-1(${dn(F)}) is the Celsius temperature that equals ${dn(F)}°F.`, `Solve 1.8c + 32 = ${dn(F)}: subtract 32, then divide by 1.8.`],
        steps: [
          st("Set up.", `1.8c + 32 = ${dn(F)}`),
          st("Subtract 32.", `1.8c = ${dn(F - 32)}`),
          st("Divide by 1.8.", `c = ${ms(c)}`),
          st("Interpret.", `${dn(F)}°F is the same as ${ms(c)}°C.`),
        ],
        traps: traps(frac(c), [trap(Math.round((1.8 * F + 32) * 10) / 10, "That converts the number as if it were Celsius. T^-1 turns Fahrenheit back into Celsius."), trap(Math.round((F / 1.8) * 100) / 100, "Subtract the 32 before dividing by 1.8.")]),
      };
    }
    if (lv === 2) {
      const ts = [0, 1, 2, 3, 4, 5];
      const start = r.int(2, 10), step = r.pick([6, 8, 10, 12]);
      const hs = ts.map((t) => start + step * t + (t > 2 ? r.int(0, 0) : 0));
      const i = r.int(2, 5);
      const v = hs[i];
      const askT = ts.includes(v) ? v : -1;
      return {
        prompt: `The table shows the height h(t), in feet, of a drone t seconds after takeoff. Find h^-1(${v}).`,
        visual: { type: "table", headers: ["t (seconds)", ...ts.map(String)], rows: [["h(t) (feet)", ...hs]] },
        answer: num(ts[i], { unit: " seconds" }),
        hints: [`h^-1(${v}) asks: at what time is the height ${v} feet?`, `Find ${v} in the height row and read the time.`],
        steps: [st("Find the output in the table.", `h(${ts[i]}) = ${v}.`), st("Reverse it.", `So h^-1(${v}) = ${ts[i]}: the drone is ${v} feet up after ${ts[i]} seconds.`)],
        traps: askT >= 0 ? traps(frac(ts[i]), [trap(hs[askT], `That's h(${v}), the height at ${v} seconds. The inverse starts from a height.`)]) : undefined,
      };
    }
    if (r.chance(0.5)) {
      const p0 = r.pick([50, 100, 200, 250, 500]), n = r.int(3, 8);
      const N = p0 * 2 ** n;
      return {
        prompt: `A bacteria culture has P(t) = ${p0} · 2^t cells after t hours. The inverse is P^-1(x) = log_2({x/${p0}}). Find P^-1(${N}) and say what it means.`,
        answer: num(n, { unit: " hours" }),
        hints: [`P^-1(${N}) is the time when there are ${N} cells.`, `${N} ÷ ${p0} = ${N / p0}. What power of 2 is ${N / p0}?`],
        steps: [
          st("Substitute.", `P^-1(${N}) = log_2({${N}/${p0}}) = log_2(${N / p0})`),
          st("Evaluate.", `2^${n} = ${N / p0}, so log_2(${N / p0}) = ${n}.`),
          st("Interpret.", `The culture reaches ${N} cells after ${n} hours.`),
        ],
        traps: traps(frac(n), [trap(N / p0, `${N / p0} is how many times bigger the culture is. The answer is the exponent: 2 to what power is ${N / p0}?`), trap(N / p0 / 2, "Halving isn't the same as taking log base 2.")]),
      };
    }
    const s = r.int(2, 7), d = 16 * s * s;
    return {
      prompt: `A phone dropped from a bridge falls d(t) = 16t^2 feet in t seconds (t ≥ 0). Find d^-1(${d}) and say what it means.`,
      answer: num(s, { unit: " seconds" }),
      hints: [`d^-1(${d}) is the time it takes to fall ${d} feet.`, `Solve 16t^2 = ${d}: divide by 16, then take the positive square root.`],
      steps: [
        st("The inverse.", "Swap and solve: t = √({d/16}), so d^-1(x) = √({x/16}) for x ≥ 0."),
        st("Substitute.", `d^-1(${d}) = √({${d}/16}) = √${s * s} = ${s}`),
        st("Interpret.", `The phone takes ${s} seconds to fall ${d} feet.`),
      ],
      traps: traps(frac(s), [trap(s * s, "That's t^2. Take the square root to get t."), trap(d / 16 / 2, "Halving isn't the same as taking a square root.")]),
    };
  },
};

const skills: Skill[] = [piecewiseEval, piecewiseGraph, absValue, transformWrite, transformPoint, inverseLinear, inverseQuadratic, inverseExists, inverseContext];
export default skills;
