// Reference skills showing the content conventions (typed expressions, graphs, factored form).
// Course authors: copy these patterns. See CONTENT_GUIDE.md at the repo root.
import { binom, binomExpr, choice, cst, expr, linear, ms, num, poly, sn, term, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";

const T = "m1-examples";

const multiStep: Skill = {
  id: "m1.ex.multi-step",
  title: "Solve multi-step equations",
  topic: T,
  standards: ["NC.M1.A-REI.1", "NC.M1.A-REI.3"],
  prereqs: [],
  lesson: {
    bigIdea: "Undo operations in reverse order, doing the same thing to both sides, until the variable is alone.",
    explain: [
      "To solve 3(x − 2) + 4 = 19: subtract 4 from both sides to get 3(x − 2) = 15, divide by 3 to get x − 2 = 5, then add 2: **x = 7**.",
      "You can also distribute first: 3x − 6 + 4 = 19, so 3x − 2 = 19, 3x = 21, x = 7. Both paths give the same answer.",
      "Check by substituting: 3(7 − 2) + 4 = 15 + 4 = 19. ✓",
    ],
    tip: "Write each step on its own line. Most mistakes happen when two steps are squeezed into one.",
  },
  why: [
    { kind: "choice", prompt: "Why must you do the same thing to both sides of an equation?", choices: ["So both sides stay equal and the solution doesn't change.", "Because it makes the numbers smaller.", "You only need to change the side with the variable."], correct: 0, explain: "An equation is a balance: changing only one side breaks the equality." },
    { kind: "written", prompt: "Explain how you could check that x = 7 is the solution of 3(x − 2) + 4 = 19 without solving it again.", keyIdeas: ["substitute 7 for x", "evaluate the left side", "it equals 19, so the equation is true"], exemplar: "Put 7 in for x: 3(7 − 2) + 4 = 3 · 5 + 4 = 19. The left side equals the right side, so x = 7 makes the equation true." },
  ],
  generate(r, lv) {
    const a = r.int(2, lv === 1 ? 5 : 9);
    const h = r.nonzero(-6, 6);
    const c = r.nonzero(-9, 9);
    const x = r.nonzero(-8, 10);
    const rhs = a * (x - h) + c;
    const inner = rhs - c;
    const ans = frac(x);
    return {
      prompt: `Solve for x: ${a}${binom(h)}${cst(c)} = ${ms(rhs)}`,
      answer: num(x),
      hints: [
        `Start by undoing the ${c > 0 ? "+" : "−"} ${Math.abs(c)} on the left: ${c > 0 ? "subtract" : "add"} ${Math.abs(c)} on both sides.`,
        `That leaves ${a}${binom(h)} = ${ms(inner)}. Now divide both sides by ${a}.`,
      ],
      steps: [
        st(`${c > 0 ? "Subtract" : "Add"} ${Math.abs(c)} on both sides.`, `${a}${binom(h)} = ${ms(rhs)}${cst(-c)} = ${ms(inner)}`),
        st(`Divide both sides by ${a}.`, `${binom(h).replace(/[()]/g, "")} = ${ms(inner / a)}`),
        st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)} on both sides.`, `x = ${ms(x)}`),
        st("Check.", `${a}(${ms(x)}${cst(-h)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${a} · ${sn(x - h)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${ms(rhs)} ✓`),
      ],
      traps: traps(ans, [trap((rhs + c) / a + h, `It looks like you ${c > 0 ? "added" : "subtracted"} ${Math.abs(c)} instead of undoing it. To remove ${c > 0 ? "+" : "−"}${Math.abs(c)}, do the opposite.`), trap(inner / a - h, `Check the last step: to undo ${binom(h).replace(/[()]/g, "")}, ${h > 0 ? "add" : "subtract"} ${Math.abs(h)}.`)]),
    };
  },
};

const lineThroughPoints: Skill = {
  id: "m1.ex.line-two-points",
  title: "Equation of a line through two points",
  topic: T,
  standards: ["NC.M1.F-LE.2", "NC.M1.A-CED.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Find the slope from the two points, then use one point to find the y-intercept: y = mx + b.",
    explain: [
      "Through (1, 5) and (3, 9): slope m = {9 − 5/3 − 1} = {4/2} = 2.",
      "Put one point into y = 2x + b: 5 = 2(1) + b, so b = 3. The line is **y = 2x + 3**.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 6, yMin: -2, yMax: 14, curves: [{ expr: "2x+3" }], points: [{ x: 1, y: 5, label: "(1, 5)" }, { x: 3, y: 9, label: "(3, 9)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does it not matter which of the two points you use to find b?", choices: ["Both points are on the same line, so either one satisfies y = mx + b.", "Because b is always 0.", "It does matter: you must use the first point."], correct: 0, explain: "Every point on the line satisfies its equation." },
    { kind: "written", prompt: "A line has slope 2 and passes through (0, −1). Explain what the slope and the point tell you about the graph.", keyIdeas: ["the line crosses the y-axis at −1 (y-intercept)", "for each step of 1 to the right, the line rises 2", "so the equation is y = 2x − 1"], exemplar: "The point (0, −1) is where the line crosses the y-axis, so b = −1. The slope 2 means every time x goes up 1, y goes up 2. So the line is y = 2x − 1." },
  ],
  generate(r, lv) {
    const m = lv === 1 ? r.nonzero(-3, 4) : r.nonzero(-5, 5);
    const b = r.int(-6, 6);
    const x1 = r.int(-4, 2);
    const x2 = x1 + r.int(1, 4);
    const y1 = m * x1 + b, y2 = m * x2 + b;
    const top = Math.max(y1, y2, b) + 3, bottom = Math.min(y1, y2, b) - 3;
    return {
      prompt: `Write the equation of the line through (${ms(x1)}, ${ms(y1)}) and (${ms(x2)}, ${ms(y2)}) in the form y = mx + b.`,
      visual: { type: "plot", xMin: Math.min(x1, 0) - 2, xMax: Math.max(x2, 0) + 2, yMin: bottom, yMax: top, points: [{ x: x1, y: y1, label: `(${ms(x1)}, ${ms(y1)})` }, { x: x2, y: y2, label: `(${ms(x2)}, ${ms(y2)})` }] },
      answer: expr(linear(m, b).replace(/−/g, "-").replace(/\s/g, ""), { lhs: "y", display: linear(m, b) }),
      hints: [
        `Slope = (change in y) ÷ (change in x) = (${ms(y2)} − ${sn(y1)}) ÷ (${ms(x2)} − ${sn(x1)}).`,
        `The slope is ${ms(m)}. Now put (${ms(x1)}, ${ms(y1)}) into y = ${ms(m)}x + b and solve for b.`,
      ],
      steps: [
        st("Find the slope.", `m = {${ms(y2)} − ${sn(y1)}/${ms(x2)} − ${sn(x1)}} = {${ms(y2 - y1)}/${x2 - x1}} = ${ms(m)}`),
        st("Substitute one point to find b.", `${ms(y1)} = ${ms(m)} · ${sn(x1)} + b, so ${ms(y1)} = ${ms(m * x1)} + b and b = ${ms(b)}.`),
        st("Write the equation.", `y = ${linear(m, b)}`),
      ],
    };
  },
};

const factorTrinomial: Skill = {
  id: "m1.ex.factor-trinomial",
  title: "Factor x² + bx + c",
  topic: T,
  standards: ["NC.M1.A-SSE.3a"],
  prereqs: [],
  lesson: {
    bigIdea: "To factor x² + bx + c, find two numbers that multiply to c and add to b.",
    explain: [
      "x^2 + 7x + 12: which two numbers multiply to 12 and add to 7? 3 and 4. So x^2 + 7x + 12 = **(x + 3)(x + 4)**.",
      "Signs matter: x^2 − x − 12 needs numbers that multiply to −12 and add to −1: −4 and 3, so (x − 4)(x + 3).",
      "Check by multiplying back: (x + 3)(x + 4) = x^2 + 4x + 3x + 12 = x^2 + 7x + 12. ✓",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do the two numbers have to add to b?", choices: ["When you multiply (x + p)(x + q), the middle term is px + qx = (p + q)x.", "Because the constant is always the sum.", "They don't have to; only the product matters."], correct: 0, explain: "The x-terms from the two 'outer' and 'inner' products combine into (p + q)x." },
    { kind: "written", prompt: "Explain how factoring x² + 5x + 6 helps you solve x² + 5x + 6 = 0.", keyIdeas: ["it factors to (x + 2)(x + 3)", "if a product is zero, one factor must be zero", "so x = −2 or x = −3"], exemplar: "x² + 5x + 6 = (x + 2)(x + 3). If two numbers multiply to 0, one of them is 0, so x + 2 = 0 or x + 3 = 0. That gives x = −2 or x = −3." },
  ],
  generate(r, lv) {
    let p = r.nonzero(-9, 9), q = r.nonzero(-9, 9);
    if (lv === 1) { p = Math.abs(p); q = Math.abs(q); }
    if (p + q === 0) q += 1;
    const b = p + q, c = p * q;
    const coefs = [1, b, c];
    // (x + p)(x + q) has roots −p and −q.
    const fact = `${binom(-p)}${binom(-q)}`;
    return {
      prompt: `Factor completely: ${poly(coefs)}`,
      answer: expr(`${binomExpr(-p)}${binomExpr(-q)}`, { form: "factored", display: fact }),
      hints: [
        `Find two numbers that multiply to ${ms(c)} and add to ${ms(b)}.`,
        `They are ${ms(p)} and ${ms(q)}. Each one goes into a factor (x + number).`,
      ],
      steps: [
        st("Look for two numbers with product c and sum b.", `Product ${ms(c)}, sum ${ms(b)}: ${ms(p)} · ${sn(q)} = ${ms(c)} and ${ms(p)} + ${sn(q)} = ${ms(b)}.`),
        st("Write the factors.", fact),
        st("Check by multiplying.", `${fact} = x^2 ${term(q, "x", false).trim()} ${term(p, "x", false).trim()}${cst(c)} = ${poly(coefs)} ✓`),
      ],
    };
  },
};

const slopeMeaning: Skill = {
  id: "m1.ex.slope-meaning",
  title: "Interpret slope in context",
  topic: T,
  standards: ["NC.M1.F-LE.5", "NC.M1.S-ID.7"],
  prereqs: ["m1.ex.line-two-points"],
  lesson: {
    bigIdea: "In a model y = mx + b, the slope is the change in y for each 1-unit increase in x, in context units.",
    explain: ["A phone plan costs C = 15n + 40 dollars for n months. The slope 15 means the cost goes up **$15 per month**; the 40 is a one-time $40 starting cost."],
  },
  why: [
    { kind: "choice", prompt: "In C = 15n + 40, why is 40 not 'per month'?", choices: ["It's the cost when n = 0, before any months pass.", "Because 40 is bigger than 15.", "It is per month."], correct: 0, explain: "The constant term is the starting value." },
    { kind: "written", prompt: "A candle's height is h = 20 − 1.5t after t hours. Explain what −1.5 and 20 mean.", keyIdeas: ["the candle starts at 20 units tall", "it gets 1.5 units shorter every hour", "negative slope means decreasing"], exemplar: "The candle starts 20 units tall at t = 0. The −1.5 is the slope: every hour the candle gets 1.5 units shorter, which is why it's negative." },
  ],
  generate(r) {
    const rate = r.pick([12, 15, 18, 25, 30]);
    const start = r.pick([20, 35, 40, 50]);
    return {
      prompt: `A gym charges C = ${rate}m + ${start} dollars for m months. What does ${rate} represent?`,
      answer: choice(r, `The cost increases $${rate} for each month`, [[`The cost of joining before any months`, `That's the ${start}: the cost when m = 0.`], [`The total cost after ${rate} months`, "The slope is a rate (per month), not a total."], [`The number of months`, "m is the number of months; the slope is how fast the cost changes."]]),
      hints: ["The number multiplied by m is the slope: how much C changes when m goes up by 1."],
      steps: [st("Identify the slope.", `In C = ${rate}m + ${start}, the coefficient of m is ${rate}.`), st("Interpret it.", `Each extra month adds $${rate} to the cost.`)],
      visual: { type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: start + rate * 12 + 20, xStep: 2, yStep: 50, curves: [{ expr: `${rate}x+${start}`, label: "C" }] },
    };
  },
};

export default [multiStep, lineThroughPoints, factorTrinomial, slopeMeaning];
