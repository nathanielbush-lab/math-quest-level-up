// Unit 7: Linear and exponential functions
// (NC.M1.N-RN.2, F-LE.1, F-LE.3, F-LE.5, F-IF.7, F-IF.8b, F-BF.1, F-BF.1a, A-CED.1, A-CED.2, A-SSE.1b).
import { choice, expr, ms, num, trap, traps, NAMES } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, fracMark, lineText, lineTyped, pt } from "./util";

const T = "m1-lin-exp";

/** x^p display, with x^1 → x and x^0 → nothing. */
const pw = (v: string, p: number) => (p === 0 ? "" : p === 1 ? v : `${v}^${p < 0 ? `-${-p}` : p}`);
/** Display c·x^p·y^q. */
const mono = (c: number, ps: [string, number][]) => `${c === 1 && ps.some(([, p]) => p !== 0) ? "" : c === -1 && ps.some(([, p]) => p !== 0) ? "−" : ms(c)}${ps.map(([v, p]) => pw(v, p)).join("")}`;
const paren = (p: number) => (p < 0 ? `(${ms(p)})` : String(p));

// ---------- exponent rules ----------

const exponentRules: Skill = {
  id: "m1.linexp.exponent-rules",
  title: "Exponent rules",
  topic: T,
  standards: ["NC.M1.N-RN.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Same base: multiply → add exponents; divide → subtract exponents; power of a power → multiply exponents. A negative exponent means a reciprocal.",
    explain: [
      "x^3 · x^4 = x^7 (3 + 4). {x^7/x^2} = x^5 (7 − 2). (x^3)^4 = x^12 (3 × 4). x^0 = 1.",
      "Coefficients follow ordinary arithmetic: (3x^2)(5x^4) = 15x^6, and (2x^3)^3 = 2^3 · x^9 = 8x^9. The power applies to the coefficient too.",
      "Negative exponents: x^-3 = {1/x^3}. Example: {12x^2/4x^5} = 3x^-3 = {3/x^3}.",
      "Worked example: (2x^3y^-1)^2 · 5xy^4 = 4x^6y^-2 · 5xy^4 = **20x^7y^2**.",
    ],
    tip: "Don't multiply the exponents when you multiply powers: x^3 · x^4 is x^7, not x^12.",
  },
  why: [
    { kind: "choice", prompt: "Why is x^3 · x^4 = x^7?", choices: ["x^3 is three x's multiplied and x^4 is four more, so there are seven x's in all.", "Because 3 × 4 = 7.", "Because you add the bases."], correct: 0, explain: "(x·x·x)(x·x·x·x) = x^7." },
    { kind: "written", prompt: "Explain why x^0 = 1 using the quotient rule with {x^5/x^5}.", keyIdeas: ["{x^5/x^5} = x^(5−5) = x^0 by the quotient rule", "any nonzero number divided by itself is 1", "so x^0 must equal 1"], exemplar: "By the quotient rule {x^5/x^5} = x^(5 − 5) = x^0. But anything (nonzero) divided by itself is 1. Both are the same expression, so x^0 = 1." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(2, 6), b = r.int(2, 6), m = r.int(1, 6), n = r.int(1, 6);
      const quotient = r.chance(0.4);
      if (quotient) {
        const top = a * b, p = m + n;
        return {
          prompt: `Simplify {${top}x^${p}/${a}x^${m}}. Write it as c·x^p and enter c and p.`,
          answer: { kind: "multi", fields: [{ value: frac(b), pre: "c =" }, { value: frac(n), pre: "p =" }] },
          hints: ["Divide the coefficients.", "Same base divided: subtract the exponents."],
          steps: [st("Coefficients.", `${top} ÷ ${a} = ${b}`), st("Exponents.", `x^${p} ÷ x^${m} = x^(${p} − ${m}) = x^${n}`), st("Result.", mono(b, [["x", n]]))],
        };
      }
      return {
        prompt: `Simplify (${a}x^${m})(${b}x^${n}). Write it as c·x^p and enter c and p.`,
        answer: { kind: "multi", fields: [{ value: frac(a * b), pre: "c =" }, { value: frac(m + n), pre: "p =" }] },
        hints: ["Multiply the coefficients.", "Same base multiplied: add the exponents."],
        steps: [st("Coefficients.", `${a} × ${b} = ${a * b}`), st("Exponents.", `x^${m} · x^${n} = x^(${m} + ${n}) = x^${m + n}`), st("Result.", mono(a * b, [["x", m + n]]))],
      };
    }
    if (lv === 2) {
      const a = r.pick([2, 3, -2]), m = r.nonzero(-3, 4), k = r.pick([2, 3]);
      const c2 = r.int(1, 4), n = r.nonzero(-5, 5);
      const C = a ** k * c2, P = m * k + n;
      return {
        prompt: `Simplify (${a < 0 ? `−${-a}` : a}x^${paren(m)})^${k} · ${c2 === 1 ? "" : c2}x^${paren(n)}. Write it as c·x^p (p may be negative) and enter c and p.`,
        answer: { kind: "multi", fields: [{ value: frac(C), pre: "c =" }, { value: frac(P), pre: "p =" }] },
        hints: [`Power of a power: raise ${a < 0 ? `(−${-a})` : a} to the ${k} and multiply the exponent ${m} by ${k}.`, "Then multiply by the second factor: multiply coefficients, add exponents."],
        steps: [st("Power of a power.", `(${a < 0 ? `−${-a}` : a}x^${paren(m)})^${k} = ${ms(a ** k)}x^${paren(m * k)}`), st("Multiply.", `${ms(a ** k)} × ${c2} = ${ms(C)}; exponents ${ms(m * k)} + ${paren(n)} = ${ms(P)}`), st("Result.", `${mono(C, [["x", P]])}${P < 0 ? ` = {${ms(C)}/x^${-P}}` : ""}`)],
        traps: [],
      };
    }
    const a = r.pick([2, 3]), m = r.int(1, 3), n = r.nonzero(-2, 2), k = 2;
    const c2 = r.int(2, 5), m2 = r.nonzero(-3, 3), n2 = r.int(1, 5);
    const C = a ** k * c2, P = m * k + m2, Q = n * k + n2;
    const ex = (v: string, p: number) => (p === 1 ? v : `${v}^${paren(p)}`);
    return {
      prompt: `Simplify (${a}${ex("x", m)}${ex("y", n)})^${k} · ${c2}${ex("x", m2)}${ex("y", n2)}. Write it as c·x^p·y^q and enter c, p and q.`,
      answer: { kind: "multi", fields: [{ value: frac(C), pre: "c =" }, { value: frac(P), pre: "p =" }, { value: frac(Q), pre: "q =" }] },
      hints: ["Apply the outside power to every factor inside the parentheses, including the coefficient.", "Then multiply coefficients and add exponents of matching bases."],
      steps: [st("Power of a product.", `(${a}${ex("x", m)}${ex("y", n)})^${k} = ${a ** k}x^${paren(m * k)}y^${paren(n * k)}`), st("Multiply coefficients.", `${a ** k} × ${c2} = ${C}`), st("Add exponents.", `x: ${ms(m * k)} + ${paren(m2)} = ${ms(P)}; y: ${ms(n * k)} + ${paren(n2)} = ${ms(Q)}`), st("Result.", mono(C, [["x", P], ["y", Q]]))],
    };
  },
};

// ---------- linear or exponential? ----------

const linearOrExp: Skill = {
  id: "m1.linexp.linear-or-exp",
  title: "Linear or exponential?",
  topic: T,
  standards: ["NC.M1.F-LE.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Over equal steps in x, a linear function adds the same amount (constant difference); an exponential function multiplies by the same factor (constant ratio).",
    explain: [
      "x: 0, 1, 2, 3 and y: 5, 8, 11, 14: differences +3, +3, +3 → **linear**.",
      "y: 5, 10, 20, 40: differences 5, 10, 20 aren't constant, but ratios ×2, ×2, ×2 are → **exponential**.",
      "In words: \"increases by $50 each month\" is linear; \"increases by 5% each month\" is exponential, because 5% of a growing amount is a growing amount.",
    ],
    visual: { type: "table", headers: ["x", "0", "1", "2", "3"], rows: [["linear", 5, 8, 11, 14], ["exponential", 5, 10, 20, 40]] },
    tip: "Make sure the x-values go up by equal steps before comparing differences or ratios.",
  },
  why: [
    { kind: "choice", prompt: "Why is \"grows 10% per year\" exponential and not linear?", choices: ["Each year's increase is 10% of a larger amount, so the increases keep growing.", "Because 10 is a big number.", "Percentages are always linear."], correct: 0, explain: "Equal factors (×1.10), not equal differences." },
    { kind: "written", prompt: "A table shows y-values 4, 12, 36, 108 for x = 0, 1, 2, 3. Explain how you know the relationship is exponential, and give the factor.", keyIdeas: ["differences (8, 24, 72) are not constant", "ratios are all 3", "constant ratio over equal steps means exponential with factor 3"], exemplar: "The differences 8, 24, 72 aren't constant, so it isn't linear. But each value is 3 times the one before (12/4 = 36/12 = 108/36 = 3). A constant ratio over equal x-steps means it's exponential with growth factor 3." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const kind = r.pick(["linear", "exp", "neither"] as const);
      const start = r.int(2, 8);
      const xs = lv === 1 ? [0, 1, 2, 3, 4] : [0, 2, 4, 6, 8];
      let ys: number[];
      const d = r.nonzero(-6, 9), k = r.pick([2, 3]);
      if (kind === "linear") ys = xs.map((_, i) => (d < 0 ? 30 + start : start * 4) + d * i);
      else if (kind === "exp") ys = r.chance(0.7) ? xs.map((_, i) => start * k ** i) : xs.map((_, i) => 1296 / 2 ** i);
      else ys = xs.map((_, i) => start + i * i + i);
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      const ratios = ys.slice(1).map((y, i) => y / ys[i]);
      const names = { linear: "Linear: the outputs have a constant difference", exp: "Exponential: the outputs have a constant ratio", neither: "Neither: no constant difference or ratio" };
      return {
        prompt: "Is the relationship in the table linear, exponential, or neither?",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...ys.map((y) => f(y))]] },
        answer: choice(r, names[kind], (Object.keys(names) as (keyof typeof names)[]).filter((k2) => k2 !== kind).map((k2) => [names[k2], k2 === "linear" ? `Differences: ${diffs.map(f).join(", ")}. Not all the same.` : k2 === "exp" ? `Ratios: ${ratios.map((q) => f(Math.round(q * 100) / 100)).join(", ")}. Not all the same.` : "Check the differences and the ratios again."] as [string, string]), true),
        hints: ["The x-values go up by equal steps. Find the differences between consecutive y-values.", "If the differences aren't constant, try the ratios (divide each y by the one before)."],
        steps: [st("Differences.", diffs.map(f).join(", ")), st("Ratios.", ratios.map((q) => f(Math.round(q * 100) / 100)).join(", ")), st("Conclude.", kind === "linear" ? `Constant difference ${f(diffs[0])}: linear.` : kind === "exp" ? `Constant ratio ${f(ratios[0])}: exponential.` : "Neither is constant: neither linear nor exponential.")],
      };
    }
    const nm = r.pick(NAMES);
    const scen = r.pick([
      { t: `${nm}'s savings account earns 3% interest each year.`, k: "exp" },
      { t: `${nm} saves $40 every month.`, k: "linear" },
      { t: "A phone loses 20% of its value each year.", k: "exp" },
      { t: "A candle burns down 0.5 inch every hour.", k: "linear" },
      { t: "A rumor's number of listeners triples every day.", k: "exp" },
      { t: "A gym charges $25 per month plus a $50 sign-up fee.", k: "linear" },
      { t: "A medicine's amount in the body is cut in half every 6 hours.", k: "exp" },
    ]);
    const right = scen.k === "linear" ? "Linear: it changes by the same amount each period" : "Exponential: it changes by the same factor (percent) each period";
    return {
      prompt: `${scen.t} Is this situation modeled better by a linear or an exponential function?`,
      answer: choice(r, right, [[scen.k === "linear" ? "Exponential: it changes by the same factor (percent) each period" : "Linear: it changes by the same amount each period", scen.k === "linear" ? "A fixed amount added (or subtracted) each period is linear." : "A percent or a factor (half, triple) each period is exponential."], ["Neither: it doesn't change in a pattern", "There is a regular pattern; decide whether it adds or multiplies."]]),
      hints: ["Is the same AMOUNT added or subtracted each period, or is it multiplied by the same FACTOR?", "Percents, \"doubles\", \"triples\", \"half\" → factor."],
      steps: [st("Look at the change.", scen.k === "linear" ? "A constant amount each period." : "A constant factor (percent) each period."), st("Conclude.", right + ".")],
    };
  },
};

// ---------- building linear functions ----------

const buildLinear: Skill = {
  id: "m1.linexp.build-linear",
  title: "Build a linear function",
  topic: T,
  standards: ["NC.M1.F-BF.1", "NC.M1.F-BF.1a", "NC.M1.A-CED.2"],
  prereqs: ["m1.linexp.linear-or-exp", "m1.coord.slope"],
  lesson: {
    bigIdea: "A linear function f(x) = mx + b needs a rate of change m and a starting value b; get them from a table, two points or a description.",
    explain: [
      "Table: x 0, 1, 2 and y 7, 11, 15 → b = 7 (the value at x = 0), m = 4 (the constant difference): f(x) = 4x + 7.",
      "Two points: (2, 30) and (5, 45). m = {45 − 30/5 − 2} = 5. Then 30 = 5(2) + b, so b = 20: **f(x) = 5x + 20**.",
      "Description: \"A tank holds 300 gallons and drains 12 gallons per minute\" → f(x) = −12x + 300.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In a table where x goes up by 2 each row and y goes up by 6, why is the slope 3 and not 6?", choices: ["Slope is change in y per 1 unit of x: 6 ÷ 2 = 3.", "Because 6 − 3 = 3.", "The slope is 6."], correct: 0, explain: "Always divide by the change in x." },
    { kind: "written", prompt: "A plumber charges $90 for 1 hour and $150 for 3 hours. Explain how to write the cost as a linear function of hours.", keyIdeas: ["rate = (150 − 90) ÷ (3 − 1) = 30 per hour", "use a point to find the starting fee: 90 = 30(1) + b, b = 60", "C(h) = 30h + 60"], exemplar: "The rate is (150 − 90) ÷ (3 − 1) = $30 per hour. Using 1 hour costs $90: 90 = 30(1) + b, so b = 60, a $60 base fee. The function is C(h) = 30h + 60." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m = r.nonzero(-5, 7), b = r.int(-8, 12);
      const step = r.pick([1, 1, 2]);
      const xs = [0, step, 2 * step, 3 * step];
      return {
        prompt: "Write a linear function f(x) for the table.",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...xs.map((x) => m * x + b)]] },
        answer: expr(lineTyped(m, b), { lhs: "f(x)", display: lineText(m, b) }),
        hints: ["The starting value b is f(0).", step === 1 ? "The slope is the constant difference between outputs." : `The x-values go up by ${step}, so divide the output change by ${step}.`],
        steps: [st("Starting value.", `f(0) = ${ms(b)}, so b = ${ms(b)}`), st("Rate of change.", `Outputs change by ${ms(m * step)} each time x goes up by ${step}: m = ${ms(m)}`), st("Function.", `f(x) = ${lineText(m, b)}`)],
      };
    }
    if (lv === 2) {
      const m = r.pick([5, 8, 12, 15, 20, 25]), b = r.pick([20, 30, 40, 50, 60]);
      const x1 = r.int(2, 3), x2 = x1 + r.int(2, 4);
      const job = r.pick([["A plumber", "hours"], ["A DJ", "hours"], ["A dog walker", "walks"]]);
      return {
        prompt: `${job[0]} charges $${m * x1 + b} for ${x1} ${job[1]} and $${m * x2 + b} for ${x2} ${job[1]}. Write the cost C(x) as a linear function of x, the number of ${job[1]}.`,
        answer: expr(`${m}x+${b}`, { lhs: "C(x)", display: `${m}x + ${b}` }),
        hints: [`Rate: (${m * x2 + b} − ${m * x1 + b}) ÷ (${x2} − ${x1}).`, `Use one point to find b: ${m * x1 + b} = m(${x1}) + b.`],
        steps: [st("Rate of change.", `{${m * x2 + b} − ${m * x1 + b}/${x2} − ${x1}} = {${m * (x2 - x1)}/${x2 - x1}} = ${m} dollars per ${job[1].slice(0, -1)}`), st("Starting value.", `${m * x1 + b} = ${m}(${x1}) + b → b = ${b}`), st("Function.", `C(x) = ${m}x + ${b}`)],
      };
    }
    const nm = r.pick(NAMES);
    const scen = r.pick([
      () => { const s = r.pick([240, 300, 360]), d = r.pick([12, 15, 20]); return { t: `A ${s}-gallon tank drains at ${d} gallons per minute. Write the amount left, A(x), after x minutes.`, m: -d, b: s, lhs: "A(x)" }; },
      () => { const s = r.pick([150, 200, 250]), d = r.pick([25, 30, 35]); return { t: `${nm} has $${s} in a game-store gift card balance and buys a $${d} game every month. Write the balance B(x) after x months.`, m: -d, b: s, lhs: "B(x)" }; },
      () => { const s = r.pick([18, 24, 30]), d = r.pick([2, 3, 4]); return { t: `A plant is ${s} cm tall and grows ${d} cm per week. Write its height H(x) after x weeks.`, m: d, b: s, lhs: "H(x)" }; },
    ])();
    return {
      prompt: scen.t,
      answer: expr(lineTyped(scen.m, scen.b), { lhs: scen.lhs, display: lineText(scen.m, scen.b) }),
      hints: ["What's the value at the start (x = 0)? That's b.", "What's the change per unit of x? Is it an increase or a decrease? That's m."],
      steps: [st("Starting value.", `b = ${scen.b}`), st("Rate.", `m = ${ms(scen.m)} per unit of x (${scen.m < 0 ? "decreasing" : "increasing"})`), st("Function.", `${scen.lhs} = ${lineText(scen.m, scen.b)}`)],
    };
  },
};

// ---------- building exponential functions ----------

const buildExp: Skill = {
  id: "m1.linexp.build-exp",
  title: "Build an exponential function",
  topic: T,
  standards: ["NC.M1.F-BF.1a", "NC.M1.A-CED.2", "NC.M1.F-BF.1"],
  prereqs: ["m1.linexp.linear-or-exp"],
  lesson: {
    bigIdea: "An exponential function f(x) = a·b^x has starting value a = f(0) and growth factor b, the constant ratio between consecutive outputs.",
    explain: [
      "Table: x 0, 1, 2, 3 and y 3, 6, 12, 24 → a = 3, b = 2: **f(x) = 3(2)^x**.",
      "Percent growth: grows 6% per year → b = 1 + 0.06 = 1.06. Percent decay: loses 15% per year → b = 1 − 0.15 = 0.85.",
      "Two points without x = 0: f(1) = 10 and f(3) = 90. Two steps multiply by b^2 = 9, so b = 3, and a = 10 ÷ 3 = {10/3}.",
    ],
    tip: "Type exponential answers like 3(2)^x or 500(1.06)^x.",
  },
  why: [
    { kind: "choice", prompt: "Why is the factor for a 15% decrease 0.85 and not 0.15?", choices: ["After losing 15%, 85% of the amount remains, and that is what you multiply by.", "Because decreases are always 0.85.", "It is 0.15."], correct: 0, explain: "100% − 15% = 85% = 0.85." },
    { kind: "written", prompt: "Explain why a in f(x) = a·b^x is the value of f(0).", keyIdeas: ["b^0 = 1 for any nonzero b", "so f(0) = a · 1 = a", "a is the starting value"], exemplar: "Any nonzero base to the 0 power is 1, so f(0) = a·b^0 = a · 1 = a. That makes a the starting value (the y-intercept)." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(2, 8), b = r.pick([2, 3, 4]);
      const xs = [0, 1, 2, 3];
      return {
        prompt: "Write an exponential function f(x) = a·b^x for the table.",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...xs.map((x) => a * b ** x)]] },
        answer: expr(`${a}(${b})^x`, { lhs: "f(x)", display: `${a}(${b})^x` }),
        hints: ["a is the value when x = 0.", "b is the ratio: divide each output by the one before."],
        steps: [st("Starting value.", `f(0) = ${a}, so a = ${a}`), st("Ratio.", `${a * b} ÷ ${a} = ${b}, ${a * b * b} ÷ ${a * b} = ${b}: b = ${b}`), st("Function.", `f(x) = ${a}(${b})^x`)],
      };
    }
    if (lv === 2) {
      const grow = r.chance(0.5);
      const p = grow ? r.pick([3, 4, 5, 6, 8, 12]) : r.pick([5, 10, 15, 20, 25]);
      const a = grow ? r.pick([500, 1200, 2500]) : r.pick([800, 1500, 22000]);
      const b = grow ? 1 + p / 100 : 1 - p / 100;
      const ctx = grow ? r.pick([`A town of ${a} people grows ${p}% per year.`, `An investment of $${a} grows ${p}% per year.`]) : r.pick([`A car worth $${a} loses ${p}% of its value each year.`, `A lake with ${a} fish loses ${p}% of them each year.`]);
      return {
        prompt: `${ctx} Write a function f(x) for the amount after x years.`,
        answer: expr(`${a}(${f(b)})^x`, { lhs: "f(x)", display: `${a}(${f(b)})^x` }),
        hints: ["The starting amount is a.", grow ? `Growth of ${p}% means multiply by 1 + ${f(p / 100)} each year.` : `Losing ${p}% means ${100 - p}% remains: multiply by 1 − ${f(p / 100)} each year.`],
        steps: [st("Starting value.", `a = ${a}`), st("Growth factor.", grow ? `b = 1 + ${f(p / 100)} = ${f(b)}` : `b = 1 − ${f(p / 100)} = ${f(b)}`), st("Function.", `f(x) = ${a}(${f(b)})^x`)],
      };
    }
    const b = r.pick([2, 3]), a = r.int(1, 5) * (b === 2 ? 1 : 1);
    const x1 = r.int(1, 2), x2 = x1 + 2;
    const y1 = a * b ** x1, y2 = a * b ** x2;
    return {
      prompt: `An exponential function f(x) = a·b^x passes through ${pt(x1, y1)} and ${pt(x2, y2)}, with b > 0. Write f(x).`,
      visual: { type: "plot", xMin: -1, xMax: x2 + 1, yMin: 0, yMax: Math.ceil(y2 * 1.2), curves: [{ expr: `${a}(${b})^x` }], points: [{ x: x1, y: y1, label: pt(x1, y1) }, { x: x2, y: y2, label: pt(x2, y2) }] },
      answer: expr(`${a}(${b})^x`, { lhs: "f(x)", display: `${a}(${b})^x` }),
      hints: [`From x = ${x1} to x = ${x2} is 2 steps, so the output is multiplied by b^2.`, `b^2 = ${y2} ÷ ${y1} = ${b * b}. Then work back to x = 0 to find a.`],
      steps: [st("Two steps of growth.", `b^2 = {${y2}/${y1}} = ${b * b}, so b = ${b}`), st("Back to x = 0.", `a = ${y1} ÷ ${b}^${x1} = ${y1} ÷ ${b ** x1} = ${a}`), st("Function.", `f(x) = ${a}(${b})^x`)],
    };
  },
};

// ---------- growth and decay rates ----------

const growthDecay: Skill = {
  id: "m1.linexp.growth-decay",
  title: "Growth and decay rates",
  topic: T,
  standards: ["NC.M1.F-IF.8b"],
  prereqs: ["m1.linexp.build-exp"],
  lesson: {
    bigIdea: "In a·b^t, b > 1 means growth at rate b − 1; 0 < b < 1 means decay at rate 1 − b. Write the rate as a percent.",
    explain: [
      "V = 2000(1.045)^t: b = 1.045 > 1, so the value **grows 4.5% per year**.",
      "A = 60(0.92)^t: b = 0.92 < 1, so the amount **decays 8% per period** (1 − 0.92 = 0.08).",
      "Halving: M = 80({1/2})^(t/5) means the amount is cut in half every 5 hours. After 10 hours: 80({1/2})^2 = 20.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does b = 0.92 mean an 8% decrease and not a 92% decrease?", choices: ["Multiplying by 0.92 keeps 92% of the amount, so 8% is lost.", "Because 0.92 rounds to 1.", "It does mean a 92% decrease."], correct: 0, explain: "The factor is what remains, not what is lost." },
    { kind: "written", prompt: "Two accounts: A = 1000(1.05)^t and B = 1000(1.5)^t. Explain the difference in their growth rates.", keyIdeas: ["A grows 5% per year (b − 1 = 0.05)", "B grows 50% per year (b − 1 = 0.5)", "B grows much faster"], exemplar: "For A, b − 1 = 0.05, a 5% yearly growth rate. For B, b − 1 = 0.5, a 50% growth rate. Both start at $1000, but B grows ten times faster in percent terms." },
  ],
  generate(r, lv) {
    const grow = r.chance(0.5);
    const p = grow ? r.pick([2, 3.5, 4, 6, 7.5, 12, 25]) : r.pick([2, 4, 8, 12.5, 15, 30]);
    const b = grow ? 1 + p / 100 : 1 - p / 100;
    const a = r.pick([60, 250, 1200, 4000]);
    const what = grow ? r.pick(["followers", "a savings balance", "a city's population"]) : r.pick(["a car's value", "the amount of a medicine in the bloodstream", "the number of trees in a forest"]);
    if (lv === 1) {
      const right = `${grow ? "Growth" : "Decay"} of ${f(p)}% per year`;
      return {
        prompt: `f(t) = ${a}(${f(b)})^t models ${what} after t years. Which describes it?`,
        answer: choice(r, right, [[`${grow ? "Decay" : "Growth"} of ${f(p)}% per year`, grow ? "b > 1 means growth." : "b < 1 means decay."], [`${grow ? "Growth" : "Decay"} of ${f(Math.round(b * 10000) / 100)}% per year`, "The rate is the difference between b and 1."], [`${grow ? "Growth" : "Decay"} of ${f(b)}% per year`, "Convert b − 1 (or 1 − b) to a percent."]]),
        hints: ["Compare b with 1.", "The rate is |b − 1| written as a percent."],
        steps: [st("Compare b with 1.", `${f(b)} ${grow ? ">" : "<"} 1: ${grow ? "growth" : "decay"}`), st("Rate.", `|${f(b)} − 1| = ${f(p / 100)} = ${f(p)}%`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `f(t) = ${a}(${f(b)})^t models ${what} after t years. By what percent does it ${grow ? "increase" : "decrease"} each year?`,
        answer: num(frac(Math.round(p * 10), 10), { unit: "%" }),
        hints: ["The factor b tells how much is kept or gained each year.", grow ? "Rate = b − 1." : "Rate = 1 − b."],
        steps: [st("Factor.", `b = ${f(b)}`), st("Rate.", grow ? `${f(b)} − 1 = ${f(p / 100)}` : `1 − ${f(b)} = ${f(p / 100)}`), st("Percent.", `${f(p)}%`)],
        traps: traps(frac(Math.round(p * 10), 10), [trap(frac(Math.round(b * 1000), 10), `That's b as a percent. The rate is the difference from 1 (100%).`), trap(frac(Math.round(p * 10), 1000), "Write the rate as a percent: multiply by 100.")]),
      };
    }
    const half = r.pick([3, 4, 5, 6, 8]), M0 = r.pick([40, 64, 80, 96, 160]), k = r.int(1, 3);
    const t = half * k;
    const ans = frac(M0, 2 ** k);
    return {
      prompt: `The amount of a medicine in the body t hours after a dose is M(t) = ${M0}({1/2})^(t/${half}) milligrams. How many milligrams remain after ${t} hours?`,
      answer: num(ans),
      hints: [`The exponent t/${half} counts how many ${half}-hour periods have passed.`, `After ${t} hours that's ${k} half-lives: divide ${M0} by 2 that many times.`],
      steps: [st("Count the half-lives.", `${t} ÷ ${half} = ${k}`), st("Halve that many times.", `${M0}({1/2})^${k} = ${M0} ÷ ${2 ** k} = ${fracMark(ans)} mg`)],
      traps: traps(ans, [trap(frac(M0, 2 ** t), `The exponent is t/${half}, not t: it halves every ${half} hours, not every hour.`), ...(M0 - (M0 / 2) * k > 0 ? [trap(M0 - (M0 / 2) * k, "Halving is multiplying by 1/2 each time, not subtracting the same amount.")] : [])]),
    };
  },
};

// ---------- interpreting parameters ----------

const interpretParams: Skill = {
  id: "m1.linexp.interpret",
  title: "Interpret parameters in context",
  topic: T,
  standards: ["NC.M1.F-LE.5", "NC.M1.A-SSE.1b"],
  prereqs: ["m1.linexp.build-linear", "m1.linexp.build-exp"],
  lesson: {
    bigIdea: "In f(x) = mx + b, m is the constant amount of change per unit and b is the starting value. In g(x) = a·b^x, a is the starting value and b is the constant factor of change per unit.",
    explain: [
      "Streaming: C(m) = 12m + 5 → $12 per month and a $5 one-time fee.",
      "Followers: F(w) = 300(1.15)^w → 300 followers at the start, multiplied by 1.15 (up 15%) each week.",
      "Both have a \"starting value\", but the linear rate ADDS and the exponential factor MULTIPLIES.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In F(w) = 300(1.15)^w, why isn't the weekly increase always 45 followers?", choices: ["The increase is 15% of the current total, which grows each week.", "Because 1.15 × 300 = 345.", "It is always 45."], correct: 0, explain: "Week 1 adds 45, week 2 adds 51.75, and so on." },
    { kind: "written", prompt: "A ride-share costs C(d) = 2.5d + 4 for d miles. A second app models a promo as P(d) = 4(1.1)^d. Compare what the 4 means in each.", keyIdeas: ["in C, 4 is a base fee added once", "in P, 4 is the starting value multiplied by 1.1 each mile", "both are the value when d = 0"], exemplar: "In both, 4 is the value at d = 0. In C it's a one-time base fee, with $2.50 added per mile. In P it's the starting amount that gets multiplied by 1.1 for each mile." },
  ],
  generate(r, lv) {
    const isExp = lv === 1 ? false : lv === 2 ? true : r.chance(0.5);
    if (!isExp) {
      const m = r.pick([12, 15, 20, 35]), b = r.pick([5, 10, 25, 50]);
      const askM = r.chance(0.5);
      const c = r.pick([
        { t: `C(x) = ${m}x + ${b} is the total cost in dollars of a streaming bundle for x months.`, rm: `It costs $${m} more for each additional month`, rb: `There is a one-time charge of $${b}` },
        { t: `S(x) = ${b} + ${m}x is the number of songs in a playlist after x days.`, rm: `${m} songs are added each day`, rb: `The playlist started with ${b} songs` },
      ]);
      return {
        prompt: `${c.t} What does ${askM ? m : b} represent?`,
        answer: choice(r, askM ? c.rm : c.rb, [[askM ? c.rb : c.rm, askM ? "That's the meaning of the constant term." : "That's the meaning of the rate."], [`The total after ${askM ? m : b} units of x`, "Neither number is a total by itself."], [askM ? `The amount is multiplied by ${m} each unit` : `It increases ${b}% each unit`, "A linear function adds a constant amount; it doesn't multiply."]]),
        hints: ["The coefficient of x is the change per unit of x.", "The constant is the value when x = 0."],
        steps: [st("Identify.", askM ? `${m} multiplies x: it's the rate.` : `${b} is the constant: the value at x = 0.`), st("Interpret.", (askM ? c.rm : c.rb) + ".")],
      };
    }
    const grow = r.chance(0.6);
    const pct = grow ? r.pick([5, 8, 10, 15, 20]) : r.pick([10, 20, 25]);
    const b = grow ? 1 + pct / 100 : 1 - pct / 100;
    const a = r.pick([150, 300, 500, 800]);
    const askA = lv === 3 ? r.chance(0.5) : r.chance(0.4);
    const c = grow ? { t: `F(w) = ${a}(${f(b)})^w models a creator's followers w weeks after launch.`, ra: `The creator had ${a} followers at launch`, rb: `The followers increase by ${pct}% each week` } : { t: `V(t) = ${a}(${f(b)})^t is the value in dollars of a used gaming console after t years.`, ra: `The console was worth $${a} at t = 0`, rb: `The value decreases by ${pct}% each year` };
    const right = askA ? c.ra : c.rb;
    return {
      prompt: `${c.t} What does ${askA ? a : f(b)} represent?`,
      answer: choice(r, right, [[askA ? c.rb : c.ra, askA ? "That's the meaning of the factor b." : "That's the meaning of the starting value a."], [askA ? `${a} is added each ${grow ? "week" : "year"}` : `${grow ? "The followers increase" : "The value decreases"} by ${f(b)} each ${grow ? "week" : "year"}`, askA ? "a isn't added repeatedly; it's the starting amount." : "b is a multiplier, not an amount added."], [askA ? `The value after 1 ${grow ? "week" : "year"}` : `${grow ? "The followers increase" : "The value decreases"} by ${Math.round(b * 100)}% each ${grow ? "week" : "year"}`, askA ? `After 1 period it's ${a}(${f(b)}).` : "The percent change is the difference between b and 1."]]),
      hints: ["a is the value when the input is 0.", "b is the factor applied each period; compare it with 1 to get the percent change."],
      steps: [st("Identify.", askA ? `${a} is a, the starting value.` : `${f(b)} is b, the factor per period.`), st("Interpret.", right + ".")],
    };
  },
};

// ---------- exponential vs linear ----------

const expVsLinear: Skill = {
  id: "m1.linexp.exp-vs-linear",
  title: "Exponential vs. linear growth",
  topic: T,
  standards: ["NC.M1.F-LE.3", "NC.M1.A-CED.1"],
  prereqs: ["m1.linexp.build-exp", "m1.linexp.build-linear"],
  lesson: {
    bigIdea: "An increasing exponential function eventually passes any linear (or quadratic) function, because it grows by multiplying.",
    explain: [
      "Compare f(x) = 100x and g(x) = 2^x. At x = 5: 500 vs 32. At x = 10: 1000 vs 1024. From then on g stays ahead, and the gap explodes.",
      "To find when one passes the other, make a table (or graph both) and find the first x where the exponential is bigger.",
      "You can also solve simple exponential equations by matching powers: 3·2^x = 96 → 2^x = 32 = 2^5, so **x = 5**.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: 1600, xStep: 1, yStep: 200, curves: [{ expr: "100x", label: "100x" }, { expr: "2^x", color: 2, label: "2^x" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does 2^x eventually pass 100x?", choices: ["Each step, 2^x doubles, adding more and more, while 100x always adds just 100.", "Because exponential functions start higher.", "It never does."], correct: 0, explain: "Once 2^x is above 100, doubling adds more than 100 per step." },
    { kind: "written", prompt: "Job A pays $1000 a day. Job B pays 1 cent on day 1 and doubles every day. Explain which pays more on day 30.", keyIdeas: ["A pays $1000 on day 30", "B pays 0.01·2^29 dollars, over $5 million", "exponential growth overtakes linear"], exemplar: "Job A still pays $1000 on day 30. Job B pays 0.01·2^29 ≈ $5.4 million that day, because doubling 29 times multiplies by over 500 million. Exponential growth eventually overtakes any linear pay." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(2, 6), b = r.pick([2, 3]), x = r.int(2, b === 2 ? 6 : 4);
      const c = a * b ** x;
      return {
        prompt: `Solve ${a}·${b}^x = ${c}.`,
        answer: num(x),
        hints: [`Divide both sides by ${a} first.`, `Write ${c / a} as a power of ${b}.`],
        steps: [st(`Divide by ${a}.`, `${b}^x = ${c / a}`), st(`Write ${c / a} as a power of ${b}.`, `${c / a} = ${b}^${x}`), st("Match exponents.", `x = ${x}`)],
        traps: traps(frac(x), [trap(c / a / b, `${b}^x isn't ${b} times x: find the power of ${b} that gives ${c / a}.`), trap(frac(c, a * b), `Divide by ${a} only, then find the exponent.`)]),
      };
    }
    const a0 = r.pick([1, 2, 3, 5]), base = 2;
    const m = r.pick([20, 30, 50, 75, 100]), b0 = r.pick([0, 10, 50]);
    const quad = lv === 3 && r.chance(0.5);
    const r2q = r.pick([5, 10, 20]);
    const lin = (x: number) => (quad ? r2q * x * x : m * x + b0);
    const g = (x: number) => a0 * base ** x;
    let ans = 1;
    for (let k = 40; k >= 1; k--) { if (g(k) <= lin(k)) { ans = k + 1; break; } }
    const expText = a0 === 1 ? "2^x" : `${a0}(2)^x`;
    const linText = quad ? `${r2q}x^2` : `${m}x${b0 ? ` + ${b0}` : ""}`;
    const rows = [ans - 2, ans - 1, ans, ans + 1].filter((v) => v >= 0);
    return {
      prompt: `${quad ? "" : `Option A gives ${linText} points after x rounds; option B gives ${expText} points. `}What is the smallest whole number x for which ${expText} is greater than ${linText} at x and at every larger whole number?`,
      answer: num(ans),
      hints: ["Make a table of both functions for x = 1, 2, 3, …", "Find the last x where the exponential is not greater; the answer is the next whole number."],
      steps: [st("Compare values.", rows.map((v) => `x = ${v}: ${linText.replace(/x/, `(${v})`)} = ${lin(v)}, ${a0 === 1 ? "" : a0}${a0 === 1 ? "2" : "(2)"}^${v} = ${g(v)}`).join("; ")), st("Find the crossover.", `At x = ${ans - 1} the exponential is ${g(ans - 1) === lin(ans - 1) ? "equal" : "smaller"}; from x = ${ans} on, it is greater and keeps doubling.`)],
      traps: traps(frac(ans), [trap(ans - 1, `At x = ${ans - 1}, ${g(ans - 1)} is not greater than ${lin(ans - 1)}.`)]),
    };
  },
};

// ---------- graphs of exponential functions ----------

const expGraph: Skill = {
  id: "m1.linexp.exp-graph",
  title: "Graphs of exponential functions",
  topic: T,
  standards: ["NC.M1.F-IF.7", "NC.M1.F-IF.4"],
  prereqs: ["m1.linexp.build-exp"],
  lesson: {
    bigIdea: "The graph of y = a·b^x (a > 0) crosses the y-axis at a, rises if b > 1 or falls if 0 < b < 1, and gets closer and closer to the x-axis on one side without touching it.",
    explain: [
      "y = 3(2)^x: y-intercept 3; through (1, 6) and (2, 12); as x → −∞, y → 0; as x → ∞, y → ∞.",
      "y = 8({1/2})^x: y-intercept 8, decreasing; as x → ∞, y → 0.",
      "The line y = 0 is a **horizontal asymptote**. The domain is all real numbers; the range is y > 0.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 4, yMin: -1, yMax: 16, curves: [{ expr: "3(2)^x", label: "3(2)^x" }, { expr: "8(0.5)^x", color: 2, label: "8(1/2)^x" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does y = 3(2)^x never reach 0?", choices: ["3 times any power of 2 is positive; negative exponents just make it a small positive fraction.", "Because the graph stops at x = −4.", "It reaches 0 at x = −3."], correct: 0, explain: "2^−10 is tiny but still positive." },
    { kind: "written", prompt: "Explain how you can tell from the graph of y = a·b^x whether b is greater or less than 1.", keyIdeas: ["if the graph rises left to right, b > 1 (growth)", "if it falls, 0 < b < 1 (decay)", "compare y at x = 0 and x = 1: b = y(1)/y(0)"], exemplar: "If the graph rises from left to right, the outputs are being multiplied by more than 1 each step, so b > 1. If it falls, b is between 0 and 1. You can find b exactly by dividing the y-value at x = 1 by the y-value at x = 0." },
  ],
  generate(r, lv) {
    const a = r.pick([1, 2, 3, 4, 5]);
    const grow = r.chance(0.5);
    const b = grow ? r.pick([2, 3]) : 0.5;
    const yMax = grow ? a * b ** 3 + 2 : a * 8 + 2;
    const visual: Visual = { type: "plot", xMin: -4, xMax: 4, yMin: -1, yMax, curves: [{ expr: `${a}(${b})^x` }], points: [{ x: 0, y: a }, { x: 1, y: a * b }] };
    const bText = b === 0.5 ? "({1/2})" : `(${b})`;
    if (lv === 1) {
      return {
        prompt: "The graph of y = a·b^x is shown. What is a, the y-intercept?",
        visual,
        answer: num(a),
        hints: ["The y-intercept is where the graph crosses the y-axis (x = 0).", "In y = a·b^x, that value is a because b^0 = 1."],
        steps: [st("Read the graph at x = 0.", `(0, ${a})`), st("Answer.", `a = ${a}`)],
        traps: traps(frac(a), [trap(a * b, "That's the value at x = 1. Read where x = 0.")]),
      };
    }
    if (lv === 2) {
      const right = `y = ${a === 1 ? "" : a}${bText}^x`;
      const alt = (aa: number, bb: string) => `y = ${aa === 1 ? "" : aa}${bb}^x`;
      return {
        prompt: "Which equation matches the graph?",
        visual,
        answer: choice(r, right, [[alt(a * b, bText), `The y-intercept is ${a}, so a = ${a}.`], [alt(a, b === 0.5 ? "(2)" : "({1/2})"), grow ? "The graph rises, so b > 1." : "The graph falls, so b < 1."], [`y = ${b === 0.5 ? "−" : ""}${b === 0.5 ? "" : b}${b === 0.5 ? `{1/2}` : ""}x + ${a}`, "The graph curves and never crosses the x-axis: it's exponential, not linear."]]),
        hints: ["Read the y-intercept to get a.", "Divide the y-value at x = 1 by the y-value at x = 0 to get b."],
        steps: [st("y-intercept.", `(0, ${a}): a = ${a}`), st("Factor.", `y(1) ÷ y(0) = ${f(a * b)} ÷ ${a} = ${f(b)}`), st("Equation.", right)],
      };
    }
    const right = grow ? "As x → ∞, y → ∞; as x → −∞, y → 0" : "As x → ∞, y → 0; as x → −∞, y → ∞";
    return {
      prompt: `Which describes the end behavior of y = ${a === 1 ? "" : a}${bText}^x?`,
      visual,
      answer: choice(r, right, [[grow ? "As x → ∞, y → 0; as x → −∞, y → ∞" : "As x → ∞, y → ∞; as x → −∞, y → 0", grow ? "With b > 1 the graph rises to the right." : "With b < 1 the graph falls to the right."], ["As x → ∞, y → ∞; as x → −∞, y → −∞", "An exponential with a > 0 is always positive; it can't go to −∞."], [`As x → −∞, y → ${a}`, `${a} is the y-intercept. Far to the ${grow ? "left" : "right"} the graph approaches 0.`]]),
      hints: ["Follow the graph far to the right, then far to the left.", "Which side flattens out toward the x-axis?"],
      steps: [st("Right side.", grow ? "Rises without bound: y → ∞." : "Flattens toward the x-axis: y → 0."), st("Left side.", grow ? "Flattens toward the x-axis: y → 0." : "Rises without bound: y → ∞.")],
    };
  },
};

export default [exponentRules, linearOrExp, buildLinear, buildExp, growthDecay, interpretParams, expVsLinear, expGraph];
