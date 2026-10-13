// Unit 2: Exponential and logarithmic functions.
import { choice, cst, expr, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { dn, trapsTol, xm, xmT } from "./util";

const T = "m3-explog";

const logName = (b: number | "e") => (b === "e" ? "ln" : b === 10 ? "log" : `log_${b}`);
const r2 = (x: number) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------------
const build: Skill = {
  id: "m3.exp.build",
  title: "Build exponential functions",
  topic: T,
  standards: ["NC.M3.F-BF.1a", "NC.M3.A-CED.2", "NC.M3.F-BF.1"],
  prereqs: [],
  lesson: {
    bigIdea: "An exponential function f(x) = a·b^x starts at a (when x = 0) and is multiplied by b every time x goes up by 1.",
    explain: [
      "**From a description:** 500 followers growing 8% per month: each month multiplies by 1 + 0.08 = 1.08, so F(t) = 500(1.08)^t. A 15% *decrease* multiplies by 1 − 0.15 = 0.85.",
      "**From two points:** through (1, 6) and (3, 54). Divide the y-values: {54/6} = 9 = b^2 (two steps of x), so b = 3. Then 6 = a · 3, so a = 2: **f(x) = 2 · 3^x**.",
      "Check: f(3) = 2 · 27 = 54 ✓.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 4, yMin: -5, yMax: 60, yStep: 10, curves: [{ expr: "2*3^x" }], points: [{ x: 1, y: 6, label: "(1, 6)" }, { x: 3, y: 54, label: "(3, 54)" }] },
    tip: "A percent change becomes a factor: +r% → 1 + r, −r% → 1 − r (as decimals).",
  },
  why: [
    { kind: "choice", prompt: "Why do you divide the y-values (instead of subtracting) to find b?", choices: ["Exponential functions multiply by the same factor each step, so the ratio of outputs reveals b.", "Because dividing gives smaller numbers.", "Subtracting gives b; dividing gives a."], correct: 0, explain: "Equal steps in x multiply the output by b each time, so ratios (not differences) are constant." },
    { kind: "written", prompt: "A car worth $24,000 loses 15% of its value each year. Explain why the model is V(t) = 24000(0.85)^t and not 24000(0.15)^t.", keyIdeas: ["losing 15% means keeping 85%", "each year the value is multiplied by 0.85", "0.15 would mean losing 85% each year"], exemplar: "If the car loses 15% of its value, it keeps 85% of it, so each year you multiply by 0.85. Multiplying by 0.15 would mean only 15% is left each year, an 85% loss." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const grow = r.chance(0.6);
      const pct = r.pick(grow ? [3, 4, 5, 6, 8, 10, 12, 15] : [5, 8, 10, 12, 15, 20]);
      const b = grow ? 1 + pct / 100 : 1 - pct / 100;
      const ctx = grow
        ? r.pick([{ s: "A streaming channel has", a: r.pick([400, 500, 1200, 2500]), u: "subscribers and gains", per: "month", f: "S" }, { s: "A town has", a: r.pick([8000, 12000, 15000]), u: "residents and grows by", per: "year", f: "P" }])
        : r.pick([{ s: "A new phone is worth", a: r.pick([800, 900, 1200]), u: "dollars and loses", per: "year", f: "V" }, { s: "A cup of coffee has", a: r.pick([120, 160, 200]), u: "mg of caffeine, and your body clears", per: "hour", f: "C" }]);
      const bs = dn(b, 2);
      return {
        prompt: `${ctx.s} ${ctx.a} ${ctx.u} ${pct}% per ${ctx.per}. Write a function ${ctx.f}(t) for the amount after t ${ctx.per}s.`,
        answer: expr(`${ctx.a}*${bs}^t`, { vars: ["t"], lhs: `${ctx.f}(t)`, display: `${ctx.a}(${bs})^t` }),
        hints: [`The starting amount is a = ${ctx.a}.`, `${grow ? "Growing" : "Losing"} ${pct}% each ${ctx.per} means multiplying by 1 ${grow ? "+" : "−"} ${dn(pct / 100)} = ${bs}.`],
        steps: [
          st("Starting value.", `a = ${ctx.a} (the amount when t = 0)`),
          st("Growth or decay factor.", `${grow ? "Add" : "Subtract"} the rate: b = 1 ${grow ? "+" : "−"} ${dn(pct / 100)} = ${bs}`),
          st("Write the function.", `${ctx.f}(t) = ${ctx.a}(${bs})^t`),
        ],
      };
    }
    let a: number, b: number, x1: number, x2: number;
    if (lv === 2) {
      b = r.pick([2, 3, 4, 0.5]);
      a = b === 0.5 ? r.pick([16, 32, 48, 64, 80]) : r.int(2, 6);
      x1 = 0;
      x2 = b === 4 ? 1 : 2;
    } else {
      b = r.pick([2, 3, 0.5]);
      a = b === 0.5 ? r.pick([16, 32, 64]) : r.int(2, 5);
      x1 = 1;
      x2 = 3;
    }
    const y1 = a * b ** x1, y2 = a * b ** x2;
    const bD = b === 0.5 ? "({1/2})" : String(b);
    const bT = b === 0.5 ? "0.5" : String(b);
    const display = `${a} · ${bD}^x`;
    const top = Math.max(y1, y2, a);
    return {
      prompt: `Write an exponential function f(x) = a · b^x whose graph passes through (${x1}, ${y1}) and (${x2}, ${y2}).`,
      visual: { type: "plot", xMin: -2, xMax: 5, yMin: -top * 0.1, yMax: top * 1.25, yStep: top > 100 ? 20 : top > 40 ? 10 : top > 16 ? 4 : 2, curves: [], points: [{ x: x1, y: y1, label: `(${x1}, ${y1})` }, { x: x2, y: y2, label: `(${x2}, ${y2})` }] },
      answer: expr(`${a}*${bT}^x`, { lhs: "f(x)", display }),
      hints: x1 === 0
        ? [`At x = 0, f(0) = a · b^0 = a, so a = ${y1}.`, `Going from x = 0 to x = ${x2} multiplies by b${x2 === 1 ? "" : `^${x2}`}: ${y2} ÷ ${y1} = ${dn(y2 / y1)}.`]
        : [`Divide the outputs: {${y2}/${y1}} = b^(${x2} − ${x1}) = b^2.`, `b^2 = ${dn(y2 / y1)}, so b = ${dn(b)}. Then use ${y1} = a · b to find a.`],
      steps: x1 === 0
        ? [
            st("Find a.", `f(0) = a = ${y1}`),
            st("Find b.", `${y2} = ${y1} · b${x2 === 1 ? "" : "^" + x2}, so b${x2 === 1 ? "" : "^" + x2} = ${dn(y2 / y1)} and b = ${dn(b)}.`),
            st("Write the function.", `f(x) = ${display}`),
          ]
        : [
            st("Divide the two equations.", `{a · b^3/a · b} = {${y2}/${y1}}, so b^2 = ${dn(y2 / y1)}.`),
            st("Find b.", `b = ${dn(b)} (b must be positive)`),
            st("Find a.", `${y1} = a · ${dn(b)}, so a = ${a}.`),
            st("Check and write.", `f(3) = ${a} · ${dn(b)}^3 = ${y2} ✓, so f(x) = ${display}`),
          ],
    };
  },
};

// ---------------------------------------------------------------------------
const features: Skill = {
  id: "m3.exp.features",
  title: "Key features of exponential and log graphs",
  topic: T,
  standards: ["NC.M3.F-IF.7", "NC.M3.F-IF.4", "NC.M3.F-BF.3"],
  prereqs: ["m3.exp.build"],
  lesson: {
    bigIdea: "f(x) = a·b^x + k levels off toward the horizontal asymptote y = k. Its inverse type, g(x) = log_b(x − h) + k, has a vertical asymptote x = h and only exists for x > h.",
    explain: [
      "f(x) = 2 · 3^x − 4: as x → −∞, 3^x → 0, so f(x) → −4. The horizontal asymptote is **y = −4**, and since a = 2 > 0 the range is y > −4. The y-intercept is f(0) = 2 − 4 = −2.",
      "g(x) = log_2(x − 1) + 3: you can only take the log of a positive number, so x − 1 > 0. The domain is **x > 1** and the vertical asymptote is **x = 1**. Its range is all real numbers.",
      "If a < 0, the exponential graph is flipped: it lies *below* its asymptote and the range is y < k.",
    ],
    visual: { type: "plot", xMin: -5, xMax: 3, yMin: -6, yMax: 10, curves: [{ expr: "2*3^x-4" }], hlines: [{ y: -4, dashed: true, label: "y = −4" }], points: [{ x: 0, y: -2, label: "(0, −2)" }] },
    tip: "Exponentials have horizontal asymptotes; logarithms have vertical ones.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(x) = 5 · 2^x + 1 never reach y = 1?", choices: ["5 · 2^x is always positive, so f(x) is always more than 1.", "Because 2^x is never more than 1.", "It reaches y = 1 at x = 0."], correct: 0, explain: "2^x > 0 for every x, so the graph gets closer and closer to y = 1 but stays above it." },
    { kind: "written", prompt: "Explain why log_3(x + 2) has the vertical asymptote x = −2.", keyIdeas: ["you can only take the log of a positive number", "x + 2 > 0 means x > −2", "as x gets close to −2, x + 2 gets close to 0 and the log goes to −∞"], exemplar: "A logarithm is only defined for positive inputs, so x + 2 > 0 and x > −2. As x moves toward −2, x + 2 gets close to 0 and log_3 of a tiny number is a large negative number, so the graph drops along the line x = −2 without touching it." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const b = r.pick([2, 3, 0.5]), a = r.pick([1, 2, 3, -1, -2]), k = r.nonzero(-5, 5);
      const bT = b === 0.5 ? "0.5" : String(b), bD = b === 0.5 ? "({1/2})" : String(b);
      const yi = a + k;
      const aDot = a === 1 ? "" : `${ms(a)} · `;
      const fD = `${a === 1 ? "" : a === -1 ? "−" : `${ms(a)} · `}${bD}^x${cst(k)}`;
      const visual = { type: "plot" as const, xMin: -5, xMax: 5, yMin: a > 0 ? k - 6 : k - 14, yMax: a > 0 ? k + 14 : k + 6, yStep: 2, curves: [{ expr: `${a}*${bT}^x+${k}`.replace("+-", "-") }], hlines: [{ y: k, dashed: true }] };
      if (lv === 1) {
        return {
          prompt: `The graph of f(x) = ${fD} is shown. What is the equation of its horizontal asymptote? Enter the value of k in y = k.`,
          visual,
          answer: num(k, { pre: "y = " }),
          hints: [`What happens to ${bD}^x as x heads ${b > 1 ? "toward −∞" : "toward +∞"}?`, `${bD}^x gets close to 0, so f(x) gets close to ${aDot}0${cst(k)} = ${ms(k)}.`],
          steps: [
            st("The exponential part shrinks to 0.", `As x → ${b > 1 ? "−∞" : "+∞"}, ${bD}^x → 0.`),
            st("So f(x) levels off at k.", `f(x) → ${ms(k)}, so the asymptote is y = ${ms(k)}.`),
          ],
          traps: traps(frac(k), [trap(yi, `${ms(yi)} is the y-intercept, f(0). The asymptote is the level the graph approaches but never reaches.`), trap(0, "y = 0 is the asymptote of the parent function b^x. The vertical shift moves it.")]),
        };
      }
      if (r.chance(0.5)) {
        return {
          prompt: `What is the y-intercept of f(x) = ${fD}?`,
          answer: num(yi, { pre: "y = " }),
          hints: ["The y-intercept is f(0).", `Any nonzero number to the power 0 is 1, so f(0) = ${aDot}1${cst(k)}.`],
          steps: [st("Substitute x = 0.", `f(0) = ${aDot}${bD}^0${cst(k)} = ${aDot}1${cst(k)} = ${ms(yi)}`)],
          traps: traps(frac(yi), [trap(k, "That's the asymptote level, not the value at x = 0."), trap(a, `Don't forget the${cst(k)} at the end.`), trap(a * b + k, "You substituted x = 1. The y-intercept uses x = 0.")]),
        };
      }
      const correct = a > 0 ? `y > ${ms(k)}` : `y < ${ms(k)}`;
      return {
        prompt: `What is the range of f(x) = ${fD}?`,
        visual,
        answer: choice(r, correct, [
          [a > 0 ? `y < ${ms(k)}` : `y > ${ms(k)}`, a > 0 ? `a = ${a} is positive, so the graph is above its asymptote.` : `a = ${a} is negative, so the graph is flipped below its asymptote.`],
          ["All real numbers", "The graph never crosses its horizontal asymptote, so some y-values are missed."],
          [a > 0 ? `y ≥ ${ms(k)}` : `y ≤ ${ms(k)}`, `The graph never actually reaches y = ${ms(k)}.`],
        ]),
        hints: [`The horizontal asymptote is y = ${ms(k)}.`, `Is a = ${ms(a)} positive or negative? That tells you whether the graph is above or below the asymptote.`],
        steps: [st("Asymptote.", `y = ${ms(k)}`), st("Above or below?", `a = ${ms(a)} is ${a > 0 ? "positive, so every output is above" : "negative, so every output is below"} ${ms(k)}.`), st("Range.", correct)],
      };
    }
    const b = r.pick([2, 3, 10]), h = r.nonzero(-4, 4), k = r.int(-3, 3);
    const gD = `${logName(b)}(${xm(h)})${cst(k)}`;
    const visual = { type: "plot" as const, xMin: h - 2, xMax: h + 10, yMin: k - 6, yMax: k + 5, curves: [{ expr: `${b === 10 ? "log" : `log_${b}`}(${xmT(h)})+${k}`.replace("+-", "-"), domain: [h + 0.001, h + 10] as [number, number] }], vlines: [{ x: h, dashed: true }] };
    if (r.chance(0.5)) {
      return {
        prompt: `The graph of g(x) = ${gD} is shown. What is its vertical asymptote? Enter the value of h in x = h.`,
        visual,
        answer: num(h, { pre: "x = " }),
        hints: ["You can only take the log of a positive number.", `Set the inside equal to 0: ${xm(h)} = 0.`],
        steps: [st("The log's input must be positive.", `${xm(h)} > 0, so x > ${ms(h)}.`), st("Asymptote.", `As x approaches ${ms(h)}, the input approaches 0 and g(x) → −∞. The asymptote is x = ${ms(h)}.`)],
        traps: traps(frac(h), [trap(-h, `Check the sign: ${xm(h)} = 0 when x = ${ms(h)}.`), trap(k, `${ms(k)} is the vertical shift, which doesn't move a vertical asymptote.`)]),
      };
    }
    const correct = `x > ${ms(h)}`;
    return {
      prompt: `What is the domain of g(x) = ${gD}?`,
      answer: choice(r, correct, [[`x > ${ms(-h)}`, `Solve ${xm(h)} > 0 carefully.`], [`x ≥ ${ms(h)}`, `The log of 0 doesn't exist, so x = ${ms(h)} is not allowed.`], ["All real numbers", "The log only accepts positive inputs."], ...(k ? [[`x > ${ms(k)}`, `The${cst(k)} shifts the graph vertically; it doesn't affect the domain.`] as [string, string]] : [])]),
      hints: ["The input of a logarithm must be positive.", `Solve ${xm(h)} > 0.`],
      steps: [st("Set the input positive.", `${xm(h)} > 0`), st("Solve.", correct)],
    };
  },
};

// ---------------------------------------------------------------------------
const rates: Skill = {
  id: "m3.exp.rates",
  title: "Rewrite exponentials to compare rates",
  topic: T,
  standards: ["NC.M3.A-SSE.3", "NC.M3.A-SSE.1b", "NC.M3.A-SSE.2"],
  prereqs: ["m3.exp.build"],
  lesson: {
    bigIdea: "Exponent rules let you rewrite a growth factor for a different time unit: b^t = (b^(1/12))^(12t) and b^(t/4) = (b^(1/4))^t.",
    explain: [
      "An account grows 8% per year: A = P(1.08)^t. Per month: 1.08^t = (1.08^(1/12))^(12t) ≈ 1.00643^(12t). The monthly rate is about **0.64%**, not 8 ÷ 12 ≈ 0.67%, because growth compounds.",
      "Going the other way, 2% per month gives (1.02)^12 ≈ 1.2682 per year, an annual rate of about **26.82%** (more than 12 × 2% = 24%).",
      "A population P = 300 · 2^(t/4) doubles every 4 hours. Rewrite: 2^(t/4) = (2^(1/4))^t ≈ 1.1892^t, so it grows about **18.92% per hour**.",
    ],
    tip: "Rate as a percent = (factor − 1) × 100. For decay, it's (1 − factor) × 100.",
  },
  why: [
    { kind: "choice", prompt: "Why is a 12% annual growth rate NOT the same as 1% per month?", choices: ["Monthly growth compounds: 1.01^12 ≈ 1.1268, which is 12.68% per year.", "Because some months are longer than others.", "They are the same."], correct: 0, explain: "Each month's growth is on a bigger amount, so twelve 1% increases add up to more than 12%." },
    { kind: "written", prompt: "Explain how rewriting 500(1/2)^(t/6) shows the hourly decay rate of a medicine with a 6-hour half-life.", keyIdeas: ["(1/2)^(t/6) = ((1/2)^(1/6))^t", "(1/2)^(1/6) ≈ 0.891", "so about 10.9% is lost each hour"], exemplar: "Using exponent rules, (1/2)^(t/6) = ((1/2)^(1/6))^t ≈ 0.891^t. Each hour the amount is multiplied by about 0.891, so about 1 − 0.891 = 0.109, or 10.9%, is lost per hour." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m = r.pick([1, 1.5, 2, 2.5, 3]);
      const fac = (1 + m / 100) ** 12;
      const ans = r2((fac - 1) * 100);
      return {
        prompt: `A savings app grows your balance by ${m}% per month: B = P(${dn(1 + m / 100, 3)})^m after m months. What is the equivalent annual growth rate? Give a percent to two decimal places.`,
        answer: num(ans, { tolerance: 0.01, unit: "%" }),
        hints: ["A year is 12 months, so the yearly factor is the monthly factor to the 12th power.", `(${dn(1 + m / 100, 3)})^12 ≈ ${dn(fac, 4)}. Subtract 1 and change to a percent.`],
        steps: [
          st("Rewrite in years.", `With t years, m = 12t, so B = P(${dn(1 + m / 100, 3)})^(12t) = P((${dn(1 + m / 100, 3)})^12)^t.`),
          st("Compute the annual factor.", `(${dn(1 + m / 100, 3)})^12 ≈ ${dn(fac, 4)}`),
          st("Convert to a rate.", `${dn(fac, 4)} − 1 = ${dn(fac - 1, 4)}, about ${dn(ans)}% per year.`),
        ],
        traps: trapsTol(ans, 0.01, [[12 * m, `${12 * m}% ignores compounding: each month's growth is on a larger balance.`], [r2(fac * 100), "Subtract 1 from the factor before converting to a percent."]]),
      };
    }
    if (lv === 2) {
      const y = r.pick([6, 8, 9, 10, 12, 15, 18, 20, 24]);
      const fac = (1 + y / 100) ** (1 / 12);
      const ans = r2((fac - 1) * 100);
      return {
        prompt: `An investment grows ${y}% per year: A = P(${dn(1 + y / 100)})^t. What is the equivalent monthly growth rate? Give a percent to two decimal places.`,
        answer: num(ans, { tolerance: 0.01, unit: "%" }),
        hints: ["Write t years as 12t months: (1.xx)^t = ((1.xx)^(1/12))^(12t).", `The monthly factor is (${dn(1 + y / 100)})^(1/12) ≈ ${dn(fac, 5)}.`],
        steps: [
          st("Rewrite with months.", `(${dn(1 + y / 100)})^t = ((${dn(1 + y / 100)})^(1/12))^(12t)`),
          st("Compute the monthly factor.", `(${dn(1 + y / 100)})^(1/12) ≈ ${dn(fac, 5)}`),
          st("Convert to a rate.", `${dn(fac, 5)} − 1 ≈ ${dn(fac - 1, 5)}, about ${dn(ans)}% per month.`),
        ],
        traps: trapsTol(ans, 0.01, [[y / 12, `${dn(y / 12)}% just divides by 12, which ignores compounding.`], [r2(fac * 100), "Subtract 1 from the factor before converting to a percent."]]),
      };
    }
    const d = r.pick([2, 3, 4, 5, 6, 8, 10]);
    const grow = r.chance(0.5);
    const a = r.pick([40, 80, 200, 300, 500]);
    const fac = (grow ? 2 : 0.5) ** (1 / d);
    const ans = r2((grow ? fac - 1 : 1 - fac) * 100);
    return {
      prompt: grow
        ? `A video's views follow V = ${a} · 2^(t/${d}), where t is in hours. By what percent do the views grow each hour? Give a percent to two decimal places.`
        : `A medicine in the bloodstream follows M = ${a}({1/2})^(t/${d}), where t is in hours. By what percent does the amount decrease each hour? Give a percent to two decimal places.`,
      answer: num(ans, { tolerance: 0.01, unit: "%" }),
      hints: [`Rewrite ${grow ? "2" : "(1/2)"}^(t/${d}) as (${grow ? "2" : "(1/2)"}^(1/${d}))^t.`, `${grow ? "2" : "(1/2)"}^(1/${d}) ≈ ${dn(fac, 4)}. That's the hourly factor.`],
      steps: [
        st("Use the power rule.", `${grow ? "2" : "({1/2})"}^(t/${d}) = (${grow ? "2" : "({1/2})"}^(1/${d}))^t`),
        st("Compute the hourly factor.", `${grow ? "2" : "0.5"}^(1/${d}) ≈ ${dn(fac, 4)}`),
        st("Convert to a rate.", grow ? `${dn(fac, 4)} − 1 = ${dn(fac - 1, 4)}, about ${dn(ans)}% growth per hour.` : `1 − ${dn(fac, 4)} = ${dn(1 - fac, 4)}, about ${dn(ans)}% lost per hour.`),
      ],
      traps: trapsTol(ans, 0.01, [[grow ? 100 / d : 50 / d, `That spreads the ${grow ? "doubling" : "halving"} evenly over ${d} hours, but exponential change compounds.`], [r2(fac * 100), "Convert the factor to a rate of change: subtract it from 1 (or 1 from it)."]]),
    };
  },
};

// ---------------------------------------------------------------------------
const logEval: Skill = {
  id: "m3.exp.log-eval",
  title: "Evaluate logarithms",
  topic: T,
  standards: ["NC.M3.F-BF.4a", "NC.M3.F-LE.4"],
  prereqs: [],
  lesson: {
    bigIdea: "log_b(x) is the exponent you put on b to get x: log_b(x) = y means b^y = x. Logs undo exponentials.",
    explain: [
      "log_2(32) asks: 2 to what power is 32? 2^5 = 32, so **log_2(32) = 5**.",
      "Negative and fractional exponents work too: log_3({1/9}) = −2 because 3^-2 = {1/9}, and log_4(8) = {3/2} because 4^(3/2) = (√4)^3 = 8.",
      "log(x) with no base means base 10 (log(1000) = 3), and ln(x) means base *e* (ln(e^4) = 4).",
    ],
    tip: "Rewrite the log as a question: “base to what power gives this number?”",
  },
  why: [
    { kind: "choice", prompt: "Why is log_b(1) = 0 for every base b?", choices: ["Any nonzero base to the power 0 is 1.", "Because 1 is the smallest positive number.", "log of 1 is undefined."], correct: 0, explain: "b^0 = 1, so the exponent that gives 1 is always 0." },
    { kind: "written", prompt: "Explain why log_2(−8) is undefined.", keyIdeas: ["log_2(−8) asks 2 to what power is −8", "2 to any power is positive", "so no exponent works"], exemplar: "log_2(−8) asks for the exponent y with 2^y = −8. But 2 raised to any real power is positive, so no exponent gives −8, and the log is undefined." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 4, 5, 10, 2, 3]);
      const maxN = b === 2 ? 7 : b === 3 ? 5 : b === 10 ? 5 : 4;
      const n = r.int(2, maxN);
      const x = b ** n;
      return {
        prompt: `Evaluate ${logName(b)}(${x}).`,
        answer: num(n),
        hints: [`Ask: ${b} to what power equals ${x}?`, `Count the factors: ${Array(Math.min(n, 3)).fill(b).join(" × ")}${n > 3 ? " × …" : ""} until you reach ${x}.`],
        steps: [st("Rewrite as an exponent question.", `${logName(b)}(${x}) = y means ${b}^y = ${x}.`), st("Find the power.", `${b}^${n} = ${x}, so ${logName(b)}(${x}) = ${n}.`)],
        traps: traps(frac(n), [trap(x / b, `That's ${x} ÷ ${b}. A logarithm is an exponent, not a quotient.`), trap(n + 1, `Check: ${b}^${n + 1} = ${b ** (n + 1)}, which is too big.`)]),
      };
    }
    if (lv === 2) {
      const kind = r.int(0, 2);
      if (kind === 0) {
        const b = r.pick([2, 3, 5]), n = r.int(1, b === 2 ? 5 : 3);
        return {
          prompt: `Evaluate ${logName(b)}({1/${b ** n}}).`,
          answer: num(-n),
          hints: [`${b ** n} = ${b}^${n}. How do you write 1 over a power using an exponent?`, `{1/${b}^${n}} = ${b}^-${n}.`],
          steps: [st("Write the input as a power of " + b + ".", `{1/${b ** n}} = {1/${b}^${n}} = ${b}^-${n}`), st("Read the exponent.", `${logName(b)}({1/${b ** n}}) = −${n}`)],
          traps: traps(frac(-n), [trap(n, `${b}^${n} = ${b ** n}, not {1/${b ** n}}. A reciprocal needs a negative exponent.`)]),
        };
      }
      if (kind === 1) {
        const n = r.int(1, 4);
        const x = `0.${"0".repeat(n - 1)}1`;
        return {
          prompt: `Evaluate log(${x}).`,
          answer: num(-n),
          hints: ["log with no base means base 10.", `${x} = {1/${10 ** n}} = 10^-${n}.`],
          steps: [st("Write as a power of 10.", `${x} = {1/${10 ** n}} = 10^-${n}`), st("Read the exponent.", `log(${x}) = −${n}`)],
          traps: traps(frac(-n), [trap(n, "Numbers between 0 and 1 have negative logs."), trap(-(n + 1), `Count the decimal places: ${x} has ${n}.`)]),
        };
      }
      const n = r.int(2, 9);
      return {
        prompt: `Evaluate ln(e^${n}).`,
        answer: num(n),
        hints: ["ln means log base e.", `e to what power is e^${n}?`],
        steps: [st("ln undoes e^x.", `ln(e^${n}) = ${n}`)],
        traps: traps(frac(n), [trap(Math.round(Math.E * n * 100) / 100, "ln(e^n) is just n; don't multiply by e.")]),
      };
    }
    const list: [string, number, number, string][] = [
      ["log_4(8)", 3, 2, "4^(3/2) = (√4)^3 = 2^3 = 8"],
      ["log_8(4)", 2, 3, "8^(2/3) = (∛8)^2 = 2^2 = 4"],
      ["log_9(27)", 3, 2, "9^(3/2) = (√9)^3 = 3^3 = 27"],
      ["log_27(9)", 2, 3, "27^(2/3) = (∛27)^2 = 3^2 = 9"],
      ["log_25(125)", 3, 2, "25^(3/2) = (√25)^3 = 5^3 = 125"],
      ["log_4(2)", 1, 2, "4^(1/2) = √4 = 2"],
      ["log_16(8)", 3, 4, "16^(3/4) = (∜16)^3 = 2^3 = 8"],
      ["log_2(√8)", 3, 2, "√8 = 8^(1/2) = (2^3)^(1/2) = 2^(3/2)"],
      ["log_5(√5)", 1, 2, "√5 = 5^(1/2)"],
      ["log_3(∛9)", 2, 3, "∛9 = (3^2)^(1/3) = 3^(2/3)"],
      ["log_8(32)", 5, 3, "8^(5/3) = (∛8)^5 = 2^5 = 32"],
      ["log_4({1/8})", -3, 2, "4^(−3/2) = 1 ÷ 4^(3/2) = {1/8}"],
    ];
    const [e, p, q, why] = r.pick(list);
    const base = Number(e.match(/log_(\d+)/)![1]);
    return {
      prompt: `Evaluate ${e}. Give an exact answer (a fraction is fine).`,
      answer: num(frac(p, q)),
      hints: [`Write both the base ${base} and the input as powers of the same small number.`, "Then compare exponents: (small number)^(m·y) = (small number)^n means m·y = n."],
      steps: [st("Write everything with a common base.", why), st("Read the exponent.", `${e} = ${p < 0 ? "−" : ""}{${Math.abs(p)}/${q}}`)],
      traps: traps(frac(p, q), [trap(frac(q, p), "You have the fraction upside down. Check by raising the base to your answer."), trap(frac(Math.abs(p), q), "The input is less than 1, so the exponent should be negative.")]),
    };
  },
};

// ---------------------------------------------------------------------------
const inverse: Skill = {
  id: "m3.exp.inverse",
  title: "Inverses of exponential and log functions",
  topic: T,
  standards: ["NC.M3.F-BF.4a", "NC.M3.F-BF.4c", "NC.M3.F-BF.4"],
  prereqs: ["m3.exp.log-eval", "m3.fn.inverse-linear"],
  lesson: {
    bigIdea: "y = b^x and y = log_b(x) are inverse functions. To invert an exponential, isolate the power and take a log; to invert a log, isolate the log and exponentiate.",
    explain: [
      "f(x) = 2^(x − 1) + 3. Swap x and y: x = 2^(y − 1) + 3. Subtract 3: x − 3 = 2^(y − 1).",
      "Take log base 2 of both sides: log_2(x − 3) = y − 1. Add 1: **f^-1(x) = log_2(x − 3) + 1**.",
      "Notice what got swapped: f has a horizontal asymptote y = 3, and f^-1 has a vertical asymptote x = 3.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 10, yMin: -3, yMax: 10, curves: [{ expr: "2^(x-1)+3", label: "f" }, { expr: "log_2(x-3)+1", domain: [3.001, 10], label: "f^-1", color: 2 }, { expr: "x", dashed: true, color: 3 }], hlines: [{ y: 3, dashed: true }], vlines: [{ x: 3, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why are y = 3^x and y = log_3(x) inverses?", choices: ["log_3(x) gives the exponent that 3 needs to make x, which undoes raising 3 to that exponent.", "Because both graphs go up.", "Because log_3(x) = 1 ÷ 3^x."], correct: 0, explain: "log_3(3^x) = x and 3^(log_3 x) = x: each undoes the other." },
    { kind: "written", prompt: "f(x) = 5^x + 2 has range y > 2. Explain what this tells you about the domain of f^-1.", keyIdeas: ["the range of f is the domain of f^-1", "so f^-1 is defined for x > 2", "f^-1(x) = log_5(x − 2), which needs x − 2 > 0"], exemplar: "An inverse swaps inputs and outputs, so the outputs of f (y > 2) are the inputs of f^-1. That matches f^-1(x) = log_5(x − 2), which only works when x − 2 > 0, that is x > 2." },
  ],
  generate(r, lv) {
    const lhs = "f^-1(x)";
    const b = r.pick([2, 3, 5, 10] as const);
    const L = logName(b);
    const Lt = b === 10 ? "log" : `log_${b}`;
    const k = r.nonzero(-6, 2);
    const h = r.nonzero(-4, 4);
    const sgnT = (n: number) => (n === 0 ? "" : n > 0 ? `+${n}` : `${n}`);
    if (lv === 1) {
      if (r.chance(0.5)) {
        return {
          prompt: `f(x) = ${b}^x${cst(k)}. Find f^-1(x).`,
          answer: expr(`${Lt}(${xmT(k)})`, { lhs, display: `${L}(${xm(k)})` }),
          hints: [`Swap x and y: x = ${b}^y${cst(k)}.`, `Isolate ${b}^y, then take ${L} of both sides.`],
          steps: [
            st("Swap x and y.", `x = ${b}^y${cst(k)}`),
            st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${xm(k)} = ${b}^y`),
            st(`Take ${L} of both sides.`, `y = ${L}(${xm(k)})`),
            st("Answer.", `f^-1(x) = ${L}(${xm(k)}), for x > ${ms(k)}`),
          ],
        };
      }
      const kk = r.nonzero(-6, 6);
      return {
        prompt: `f(x) = ${L}(x)${cst(kk)}. Find f^-1(x).`,
        answer: expr(`${b}^(${xmT(kk)})`, { lhs, display: `${b}^(${xm(kk)})` }),
        hints: [`Swap x and y: x = ${L}(y)${cst(kk)}.`, `Isolate the log, then rewrite it as an exponential: ${L}(y) = c means y = ${b}^c.`],
        steps: [
          st("Swap x and y.", `x = ${L}(y)${cst(kk)}`),
          st(`${kk > 0 ? "Subtract" : "Add"} ${Math.abs(kk)}.`, `${xm(kk)} = ${L}(y)`),
          st("Rewrite in exponential form.", `y = ${b}^(${xm(kk)})`),
        ],
      };
    }
    if (lv === 2) {
      const kind = r.int(0, 2);
      if (kind === 0) {
        const display = `${L}(${xm(k)})${cst(h)}`;
        return {
          prompt: `f(x) = ${b}^(${xm(h)})${cst(k)}. Find f^-1(x).`,
          answer: expr(`${Lt}(${xmT(k)})${sgnT(h)}`, { lhs, display }),
          hints: [`Swap x and y, then isolate the power: ${xm(k)} = ${b}^(y${cst(-h)}).`, `Take ${L} of both sides, then ${h > 0 ? "add" : "subtract"} ${Math.abs(h)}.`],
          steps: [
            st("Swap x and y.", `x = ${b}^(y${cst(-h)})${cst(k)}`),
            st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${xm(k)} = ${b}^(y${cst(-h)})`),
            st(`Take ${L}.`, `${L}(${xm(k)}) = y${cst(-h)}`),
            st("Solve for y.", `f^-1(x) = ${display}`),
          ],
        };
      }
      if (kind === 1) {
        const kk = r.nonzero(-5, 5);
        const display = `${b}^(${xm(kk)})${cst(h)}`;
        return {
          prompt: `f(x) = ${L}(${xm(h)})${cst(kk)}. Find f^-1(x).`,
          answer: expr(`${b}^(${xmT(kk)})${sgnT(h)}`, { lhs, display }),
          hints: [`Swap x and y and isolate the log: ${xm(kk)} = ${L}(y${cst(-h)}).`, `Exponentiate: y${cst(-h)} = ${b}^(${xm(kk)}).`],
          steps: [
            st("Swap x and y.", `x = ${L}(y${cst(-h)})${cst(kk)}`),
            st(`${kk > 0 ? "Subtract" : "Add"} ${Math.abs(kk)}.`, `${xm(kk)} = ${L}(y${cst(-h)})`),
            st("Rewrite in exponential form.", `y${cst(-h)} = ${b}^(${xm(kk)})`),
            st("Solve for y.", `f^-1(x) = ${display}`),
          ],
        };
      }
      return {
        prompt: `f(x) = e^x${cst(k)}. Find f^-1(x).`,
        answer: expr(`ln(${xmT(k)})`, { lhs, display: `ln(${xm(k)})` }),
        hints: ["Swap x and y: x = e^y" + cst(k) + ".", "Isolate e^y, then take the natural log (ln) of both sides."],
        steps: [st("Swap and isolate.", `${xm(k)} = e^y`), st("Take ln.", `y = ln(${xm(k)})`), st("Answer.", `f^-1(x) = ln(${xm(k)}), for x > ${ms(k)}`)],
      };
    }
    if (r.chance(0.5)) {
      const a = r.pick([2, 3, 4, 5]);
      const display = `${L}({${xm(k)}/${a}})`;
      return {
        prompt: `f(x) = ${a} · ${b}^x${cst(k)}. Find f^-1(x).`,
        answer: expr(`${Lt}((${xmT(k)})/${a})`, { lhs, display }),
        hints: [`Swap x and y, then undo the ${cst(k).trim()} and the × ${a} to isolate ${b}^y.`, `{${xm(k)}/${a}} = ${b}^y. Now take ${L}.`],
        steps: [
          st("Swap x and y.", `x = ${a} · ${b}^y${cst(k)}`),
          st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}, then divide by ${a}.`, `{${xm(k)}/${a}} = ${b}^y`),
          st(`Take ${L}.`, `f^-1(x) = ${display}`),
        ],
      };
    }
    const a = r.pick([2, 3]), kk = r.nonzero(-5, 5);
    const display = `${b}^({${xm(kk)}/${a}})`;
    return {
      prompt: `f(x) = ${a}${L}(x)${cst(kk)}. Find f^-1(x).`,
      answer: expr(`${b}^((${xmT(kk)})/${a})`, { lhs, display }),
      hints: [`Swap x and y and isolate the log: {${xm(kk)}/${a}} = ${L}(y).`, `Rewrite in exponential form: y = ${b}^(…).`],
      steps: [
        st("Swap x and y.", `x = ${a}${L}(y)${cst(kk)}`),
        st(`${kk > 0 ? "Subtract" : "Add"} ${Math.abs(kk)}, then divide by ${a}.`, `{${xm(kk)}/${a}} = ${L}(y)`),
        st("Rewrite in exponential form.", `f^-1(x) = ${display}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const solve: Skill = {
  id: "m3.exp.solve",
  title: "Solve exponential equations with logs",
  topic: T,
  standards: ["NC.M3.F-LE.4", "NC.M3.A-CED.1", "NC.M3.A-REI.1"],
  prereqs: ["m3.exp.log-eval"],
  lesson: {
    bigIdea: "To solve a · b^(ct) = d, isolate the power, then take a log of both sides to bring the exponent down: t = {log(d/a)/c · log(b)}.",
    explain: [
      "$1500 grows at 4% per year: 1500(1.04)^t = 2500. When does it reach $2500?",
      "Divide by 1500: 1.04^t = {2500/1500} ≈ 1.6667. Take log of both sides: t · log(1.04) = log(1.6667).",
      "So t = {log(1.6667)/log(1.04)} ≈ **13.02 years**. Check on a calculator: 1500(1.04)^13.02 ≈ 2500 ✓.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 20, yMin: 0, yMax: 3500, xStep: 5, yStep: 500, curves: [{ expr: "1500*1.04^x" }, { expr: "2500", dashed: true, color: 2, label: "2500" }], points: [{ x: 13.02, y: 2500, label: "(13.02, 2500)" }] },
    tip: "Divide by a before taking the log. log(a · b^t) is not t · log(a · b).",
  },
  why: [
    { kind: "choice", prompt: "Why can you take the log of both sides of 3^x = 50?", choices: ["Equal positive numbers have equal logs, and log(3^x) = x · log(3) brings x down.", "Because logs make every number smaller.", "You can only do it when 50 is a power of 3."], correct: 0, explain: "Applying the same function to both sides keeps them equal; the power rule then isolates x." },
    { kind: "written", prompt: "Lena solved 200(1.05)^t = 600 by writing 210^t = 600. Explain her mistake and solve correctly.", keyIdeas: ["200(1.05)^t is not (200 · 1.05)^t", "the exponent applies only to 1.05", "divide by 200 first: 1.05^t = 3, so t = log 3 / log 1.05 ≈ 22.52"], exemplar: "The exponent belongs only to 1.05, so you can't multiply 200 by 1.05 first. Divide by 200: 1.05^t = 3. Then t = log(3)/log(1.05) ≈ 22.52." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 5, 1.5]);
      let d = r.int(12, 250);
      if (Number.isInteger(Math.log(d) / Math.log(b))) d += 1;
      const exactX = Math.log(d) / Math.log(b);
      const ans = r2(exactX);
      return {
        prompt: `Solve ${b}^x = ${d}. Round to the nearest hundredth.`,
        answer: num(ans, { tolerance: 0.01 }),
        hints: ["Take log of both sides.", `x · log(${b}) = log(${d}), so x = {log(${d})/log(${b})}.`],
        steps: [
          st("Take the log of both sides.", `log(${b}^x) = log(${d})`),
          st("Bring the exponent down.", `x · log(${b}) = log(${d})`),
          st("Divide.", `x = {log(${d})/log(${b})} ≈ {${dn(Math.log10(d), 4)}/${dn(Math.log10(b), 4)}} ≈ ${dn(ans)}`),
          st("Check.", `${b}^${dn(ans)} ≈ ${dn(b ** ans, 1)} ✓`),
        ],
        traps: trapsTol(ans, 0.01, [[d / b, `That's ${d} ÷ ${b}. The unknown is an exponent, so you need logs.`], [Math.log10(d / b), "log(d ÷ b) isn't the same as log(d) ÷ log(b)."]]),
      };
    }
    if (lv === 2) {
      const grow = r.chance(0.6);
      const a = grow ? r.pick([500, 1000, 1500, 2000, 2500]) : r.pick([18000, 24000, 30000]);
      const pct = grow ? r.pick([3, 4, 5, 6, 8]) : r.pick([10, 12, 15, 20]);
      const b = grow ? 1 + pct / 100 : 1 - pct / 100;
      const d = grow ? a * r.pick([1.5, 2, 2.5, 3]) : a * r.pick([0.25, 0.4, 0.5, 0.6]);
      const t = Math.log(d / a) / Math.log(b);
      const ans = r2(t);
      const who = r.pick(["Ava", "Omar", "Nora", "Theo", "Mei"]);
      return {
        prompt: grow
          ? `${who} puts $${a} in an account that earns ${pct}% per year: A(t) = ${a}(${dn(b)})^t. After how many years will the balance reach $${d}? Round to the nearest hundredth.`
          : `A car bought for $${a} loses ${pct}% of its value each year: V(t) = ${a}(${dn(b)})^t. After how many years will it be worth $${d}? Round to the nearest hundredth.`,
        answer: num(ans, { tolerance: 0.01, unit: " years" }),
        hints: [`Divide both sides by ${a} first: (${dn(b)})^t = ${dn(d / a)}.`, `Take log of both sides: t = {log(${dn(d / a)})/log(${dn(b)})}.`],
        steps: [
          st(`Set up and divide by ${a}.`, `${a}(${dn(b)})^t = ${d}, so (${dn(b)})^t = ${dn(d / a, 4)}`),
          st("Take the log of both sides.", `t · log(${dn(b)}) = log(${dn(d / a, 4)})`),
          st("Divide.", `t = {log(${dn(d / a, 4)})/log(${dn(b)})} ≈ ${dn(ans)}`),
          st("Interpret.", `After about ${dn(ans)} years the ${grow ? "balance" : "car's value"} reaches $${d}.`),
        ],
        traps: trapsTol(ans, 0.01, [[Math.log(d) / Math.log(b), `Divide by ${a} before taking logs.`], [grow ? (d / a - 1) / (pct / 100) : (1 - d / a) / (pct / 100), "That treats the change as the same dollar amount every year (linear), but the percent applies to a changing amount."]]),
      };
    }
    const kind = r.int(0, 2);
    if (kind === 2) {
      const a = r.pick([50, 100, 200, 250]), k = r.pick([0.02, 0.03, 0.04, 0.05, 0.06]), d = a * r.pick([2, 3, 4, 5]);
      const t = Math.log(d / a) / k, ans = r2(t);
      return {
        prompt: `A population follows P(t) = ${a}e^(${k}t), with t in years. When will it reach ${d}? Round to the nearest hundredth.`,
        answer: num(ans, { tolerance: 0.01, unit: " years" }),
        hints: [`Divide by ${a}: e^(${k}t) = ${d / a}.`, `Take ln of both sides: ${k}t = ln(${d / a}).`],
        steps: [
          st(`Divide by ${a}.`, `e^(${k}t) = ${d / a}`),
          st("Take the natural log.", `${k}t = ln(${d / a}) ≈ ${dn(Math.log(d / a), 4)}`),
          st(`Divide by ${k}.`, `t ≈ ${dn(ans)} years`),
        ],
        traps: trapsTol(ans, 0.01, [[Math.log(d / a), `Don't forget to divide by ${k}.`], [Math.log(d) / k, `Divide by ${a} first.`]]),
      };
    }
    const c = r.pick([2, 3, 4, 5, 6, 8]);
    const grow = kind === 0;
    const a = r.pick([40, 80, 100, 120, 200]);
    const d = grow ? a * r.pick([5, 6, 10, 12, 20]) : a * r.pick([0.3, 0.2, 0.15, 0.1]);
    const b = grow ? 2 : 0.5;
    const t = (c * Math.log(d / a)) / Math.log(b), ans = r2(t);
    return {
      prompt: grow
        ? `A meme's shares double every ${c} hours: S(t) = ${a} · 2^(t/${c}). After how many hours will there be ${d} shares? Round to the nearest hundredth.`
        : `A medicine has a half-life of ${c} hours: M(t) = ${a}({1/2})^(t/${c}) mg. When will ${dn(d)} mg remain? Round to the nearest hundredth.`,
      answer: num(ans, { tolerance: 0.01, unit: " hours" }),
      hints: [`Divide by ${a}: ${grow ? "2" : "(1/2)"}^(t/${c}) = ${dn(d / a)}.`, `Take logs: {t/${c}} · log(${grow ? "2" : "0.5"}) = log(${dn(d / a)}). Solve for t/${c}, then multiply by ${c}.`],
      steps: [
        st(`Divide by ${a}.`, `${grow ? "2" : "({1/2})"}^(t/${c}) = ${dn(d / a)}`),
        st("Take the log of both sides.", `{t/${c}} · log(${grow ? "2" : "0.5"}) = log(${dn(d / a)})`),
        st("Solve for t/" + c + ".", `{t/${c}} = {log(${dn(d / a)})/log(${grow ? "2" : "0.5"})} ≈ ${dn(t / c, 4)}`),
        st(`Multiply by ${c}.`, `t ≈ ${dn(ans)} hours`),
      ],
      traps: trapsTol(ans, 0.01, [[t / c, `That's t/${c}. Multiply by ${c} to get t.`], [t / c / c, `Multiply by ${c}; don't divide.`]]),
    };
  },
};

// ---------------------------------------------------------------------------
const interpret: Skill = {
  id: "m3.exp.interpret",
  title: "Interpret exponential models",
  topic: T,
  standards: ["NC.M3.A-SSE.1", "NC.M3.A-SSE.1a", "NC.M3.A-SSE.1b", "NC.M3.F-IF.4"],
  prereqs: ["m3.exp.build"],
  lesson: {
    bigIdea: "In A(t) = a · b^(t/c): a is the amount at t = 0, b is the factor applied each cycle, and c is the length of one cycle.",
    explain: [
      "V(t) = 24000(0.85)^t: the car was worth $24,000 when new, and each year its value is multiplied by 0.85, so it **loses 15% per year**.",
      "F(t) = 300(1.2)^(t/3): starts at 300 and grows **20% every 3 years** (the exponent t/3 counts 3-year cycles).",
      "M(t) = 80({1/2})^(t/6): 80 mg to start, and **half is left every 6 hours** (a half-life of 6 hours).",
    ],
  },
  why: [
    { kind: "choice", prompt: "In P(t) = 5000(1.03)^t, why is the growth rate 3% and not 103%?", choices: ["1.03 = 1 + 0.03: you keep the original 100% and add 3%.", "Because 1.03 rounds to 1.", "It is 103%."], correct: 0, explain: "A factor of 1.03 means the new amount is 103% of the old, which is a 3% increase." },
    { kind: "written", prompt: "Explain what each number means in T(m) = 180(0.96)^m, the temperature in °F of a pizza m minutes after it comes out of the oven.", keyIdeas: ["180 is the starting temperature", "0.96 is the factor each minute", "the temperature drops 4% per minute"], exemplar: "The pizza starts at 180°F (m = 0). Every minute the temperature is multiplied by 0.96, so it keeps 96% of its temperature and drops by 4% each minute." },
  ],
  generate(r, lv) {
    const ctxs = [
      { f: "V", what: "the value of a used car, in dollars,", unit: "year", a: r.pick([18000, 22000, 26000]), b: r.pick([0.82, 0.85, 0.88, 0.9]) },
      { f: "F", what: "the number of followers of a gaming channel", unit: "month", a: r.pick([800, 1200, 2500]), b: r.pick([1.06, 1.08, 1.12, 1.15]) },
      { f: "C", what: "the caffeine in your body, in mg,", unit: "hour", a: r.pick([95, 120, 160]), b: r.pick([0.86, 0.88, 0.9]) },
      { f: "P", what: "the population of a town", unit: "year", a: r.pick([14000, 25000, 40000]), b: r.pick([1.02, 1.03, 1.04]) },
    ];
    const c = r.pick(ctxs);
    const grow = c.b > 1;
    const pct = Math.round(Math.abs(c.b - 1) * 100);
    const model = `${c.f}(t) = ${c.a.toLocaleString("en-US")}(${c.b})^t`;
    if (lv === 1) {
      const correct = `The amount when t = 0: ${c.a.toLocaleString("en-US")}`;
      return {
        prompt: `${model} models ${c.what} t ${c.unit}s from now. What does ${c.a.toLocaleString("en-US")} represent?`,
        answer: choice(r, correct, [
          [`The amount after 1 ${c.unit}`, `After 1 ${c.unit} the amount is ${c.a.toLocaleString("en-US")} × ${c.b}.`],
          [`The amount it changes each ${c.unit}`, `The change each ${c.unit} is a percent, set by ${c.b}.`],
          [`The ${grow ? "largest" : "smallest"} the amount can ever be`, grow ? "The amount keeps growing." : "The amount keeps shrinking toward 0."],
        ]),
        hints: ["Substitute t = 0. What is any number to the power 0?", `${c.f}(0) = ${c.a.toLocaleString("en-US")} × ${c.b}^0 = ${c.a.toLocaleString("en-US")} × 1.`],
        steps: [st("Evaluate at t = 0.", `${c.f}(0) = ${c.a.toLocaleString("en-US")}(${c.b})^0 = ${c.a.toLocaleString("en-US")}`), st("Interpret.", "It's the starting amount (initial value).")],
      };
    }
    if (lv === 2) {
      const correct = `It ${grow ? "increases" : "decreases"} by ${pct}% each ${c.unit}.`;
      return {
        prompt: `${model} models ${c.what} t ${c.unit}s from now. What does ${c.b} tell you?`,
        answer: choice(r, correct, [
          [`It ${grow ? "increases" : "decreases"} by ${Math.round(c.b * 100)}% each ${c.unit}.`, `${c.b} is the factor. The rate is the difference from 1: ${dn(Math.abs(c.b - 1))} = ${pct}%.`],
          [`It ${grow ? "decreases" : "increases"} by ${pct}% each ${c.unit}.`, `${c.b} is ${grow ? "more" : "less"} than 1, so the amount ${grow ? "grows" : "shrinks"}.`],
          [`It ${grow ? "increases" : "decreases"} by ${c.b} each ${c.unit}.`, "Exponential models change by a percent, not a fixed amount."],
        ]),
        hints: [`Is ${c.b} more or less than 1?`, `Rate = |${c.b} − 1| = ${dn(Math.abs(c.b - 1))}.`],
        steps: [st("Compare the factor with 1.", `${c.b} ${grow ? ">" : "<"} 1, so the model ${grow ? "grows" : "decays"}.`), st("Find the rate.", `|${c.b} − 1| = ${dn(Math.abs(c.b - 1))} = ${pct}% per ${c.unit}.`)],
      };
    }
    const cyc = r.pick([2, 3, 4, 5, 6]);
    if (r.chance(0.5)) {
      const g = r.pick([1.2, 1.25, 1.5, 1.1]);
      const p = Math.round((g - 1) * 100);
      const correct = `It grows ${p}% every ${cyc} years.`;
      return {
        prompt: `The number of members of a club is modeled by M(t) = ${r.pick([150, 240, 400])}(${g})^(t/${cyc}), with t in years. Which statement is true?`,
        answer: choice(r, correct, [
          [`It grows ${p}% each year.`, `The exponent t/${cyc} increases by 1 only after ${cyc} years.`],
          [`It grows ${dn(p / cyc)}% each year.`, `Splitting the percent evenly ignores compounding. The model applies one ${p}% increase per ${cyc}-year cycle.`],
          [`It grows ${Math.round(g * 100)}% every ${cyc} years.`, `${g} is the factor; the increase is ${p}%.`],
        ]),
        hints: [`When does the exponent t/${cyc} go up by 1?`, `Every ${cyc} years the amount is multiplied by ${g}.`],
        steps: [st("Read the exponent.", `t/${cyc} counts ${cyc}-year periods.`), st("Read the factor.", `${g} = 1 + ${dn(g - 1)}, a ${p}% increase per period.`), st("Answer.", correct)],
      };
    }
    const correct = `Half of the drug remains after every ${cyc} hours.`;
    return {
      prompt: `The amount of a drug in a patient's body is D(t) = ${r.pick([200, 400, 500])}({1/2})^(t/${cyc}) mg after t hours. Which statement is true?`,
      answer: choice(r, correct, [
        [`Half of the drug remains after every hour.`, `The exponent t/${cyc} only increases by 1 every ${cyc} hours.`],
        [`The drug decreases by ${cyc} mg every hour.`, "Exponential decay removes a fraction, not a fixed amount."],
        [`All of the drug is gone after ${2 * cyc} hours.`, `After ${2 * cyc} hours, a quarter is left. Exponential decay never reaches 0.`],
      ]),
      hints: ["The base 1/2 means the amount is halved.", `How long does it take for t/${cyc} to go up by 1?`],
      steps: [st("Read the base.", "Each cycle multiplies the amount by 1/2."), st("Read the cycle length.", `The exponent increases by 1 every ${cyc} hours: a half-life of ${cyc} hours.`)],
    };
  },
};

// ---------------------------------------------------------------------------
const vsPoly: Skill = {
  id: "m3.exp.vs-poly",
  title: "Exponential vs. polynomial growth",
  topic: T,
  standards: ["NC.M3.F-LE.3"],
  prereqs: ["m3.exp.build"],
  lesson: {
    bigIdea: "Any increasing exponential function eventually grows faster than any polynomial, no matter how big the polynomial's coefficients are.",
    explain: [
      "Compare f(x) = 2^x and g(x) = 100x. At x = 5, f = 32 and g = 500: g is way ahead.",
      "But f doubles at every step while g only adds 100. At x = 9, f = 512 < 900 = g; at x = 10, f = 1024 > 1000 = g. From **x = 10** on, f stays ahead forever.",
      "The same happens against x^2, x^3, or 1000x^5: the exponential is slow at first, then passes the polynomial for good.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: 2000, xStep: 2, yStep: 250, curves: [{ expr: "2^x", label: "f = 2^x" }, { expr: "100x", label: "g = 100x", color: 2 }], points: [{ x: 10, y: 1024, label: "(10, 1024)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does 2^x eventually pass x^3?", choices: ["2^x multiplies by 2 each step, while x^3 grows by a factor that shrinks toward 1 as x gets large.", "Because 2 is bigger than 3.", "It doesn't; x^3 is always bigger."], correct: 0, explain: "The ratio (x + 1)^3 / x^3 gets close to 1 for big x, but 2^x always doubles." },
    { kind: "written", prompt: "A company says its profits grow “exponentially”, at 2% a year, while a rival's grow by $5 million a year. Explain why the first company's yearly gain eventually becomes bigger.", keyIdeas: ["2% of a growing amount keeps getting bigger", "the rival adds the same amount each year (linear)", "eventually 2% of the profit exceeds $5 million"], exemplar: "The rival always adds $5 million. The first company adds 2% of its current profit, and that profit keeps growing, so its yearly gain keeps growing too. Once its profit is over $250 million, 2% is more than $5 million, and from then on it gains more each year." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([1.05, 1.1, 1.2, 1.5]);
      const g = r.pick([`1000x^2`, `500x^3`, `10000x`, `200x^4`]);
      const gD = g;
      const correct = `f(x) = ${b}^x, because exponential growth eventually beats any polynomial.`;
      return {
        prompt: `Which function has greater values for very large x: f(x) = ${b}^x or g(x) = ${gD}?`,
        answer: choice(r, correct, [
          [`g(x) = ${gD}, because its coefficient is much bigger.`, "Big coefficients only delay it; the exponential still wins eventually."],
          [`g(x) = ${gD}, because ${b}^x grows too slowly to ever catch up.`, `${b}^x multiplies by ${b} every step, so it eventually catches any polynomial.`],
          ["Neither; they stay about equal.", "One of them eventually becomes vastly larger."],
        ]),
        hints: ["Think about what happens when x goes up by 1 for each function.", `f multiplies by ${b} every step; g's growth factor gets closer and closer to 1.`],
        steps: [st("Compare growth per step.", `f is multiplied by ${b} each time x increases by 1. For g, (x + 1)/x gets close to 1 as x grows, so g's multiplying factor shrinks toward 1.`), st("Conclusion.", correct)],
      };
    }
    const f = lv === 2 ? { b: 2, t: "2^x" } : { b: 1.5, t: "1.5^x" };
    const gs = lv === 2
      ? [{ t: "20x", e: (x: number) => 20 * x }, { t: "50x", e: (x: number) => 50 * x }, { t: "100x", e: (x: number) => 100 * x }, { t: "5x^2", e: (x: number) => 5 * x * x }, { t: "10x^2", e: (x: number) => 10 * x * x }]
      : [{ t: "x^2", e: (x: number) => x * x }, { t: "10x", e: (x: number) => 10 * x }, { t: "25x", e: (x: number) => 25 * x }, { t: "2x^2", e: (x: number) => 2 * x * x }, { t: "x^3", e: (x: number) => x ** 3 }];
    const g = r.pick(gs);
    const start = lv === 2 ? 1 : 2;
    let ans = start;
    while (f.b ** ans <= g.e(ans)) ans++;
    if (lv === 2) {
      const xs = Array.from({ length: ans + 1 }, (_, i) => i + 1).filter((x) => x >= Math.max(1, ans - 6));
      return {
        prompt: `Use the table. What is the first whole number x at which f(x) = 2^x is greater than g(x) = ${g.t}?`,
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x) = 2^x", ...xs.map((x) => 2 ** x)], [`g(x) = ${g.t}`, ...xs.map((x) => g.e(x))]] },
        answer: num(ans),
        hints: ["Compare the two rows column by column.", "Find the first column where the top number is bigger."],
        steps: [st("Compare.", `At x = ${ans - 1}: f = ${2 ** (ans - 1)}, g = ${g.e(ans - 1)}, so g is bigger. At x = ${ans}: f = ${2 ** ans}, g = ${g.e(ans)}, so f is bigger.`), st("Answer.", `x = ${ans}, and from then on f stays ahead because it doubles each step.`)],
        traps: traps(frac(ans), [trap(ans - 1, `At x = ${ans - 1}, g is still bigger.`)]),
      };
    }
    return {
      prompt: `Use a table or graph on your calculator. What is the smallest whole number x ≥ 2 for which f(x) = ${f.t} is greater than g(x) = ${g.t}?`,
      answer: num(ans),
      hints: ["Make a table of both functions in your calculator, starting at x = 2.", `Scroll until ${f.t} passes ${g.t}. It takes a while: the exponential starts slowly.`],
      steps: [
        st("Compare just before.", `x = ${ans - 1}: f ≈ ${dn(f.b ** (ans - 1), 1)}, g = ${g.e(ans - 1)}, so g is bigger.`),
        st("Compare at the crossing.", `x = ${ans}: f ≈ ${dn(f.b ** ans, 1)}, g = ${g.e(ans)}, so f is bigger.`),
        st("Answer.", `x = ${ans}. After this, the exponential stays ahead forever.`),
      ],
      traps: traps(frac(ans), [trap(ans - 1, `At x = ${ans - 1}, g is still bigger.`)]),
    };
  },
};

// ---------------------------------------------------------------------------
const compare: Skill = {
  id: "m3.exp.compare",
  title: "Compare functions in different forms",
  topic: T,
  standards: ["NC.M3.F-IF.9", "NC.M3.F-IF.4"],
  prereqs: ["m3.exp.build"],
  lesson: {
    bigIdea: "To compare functions given as a table, a graph and an equation, find the same feature for each one (starting value, growth factor, maximum, average rate of change), then compare numbers.",
    explain: [
      "Account A is shown in a table: 1000, 1050, 1102.50, … (each value is 1.05 times the last). Account B is B(t) = 900(1.06)^t.",
      "Factors: A grows by 1.05 (5% per year), B by 1.06 (6% per year). A starts higher, but B grows faster, so B eventually has more.",
      "For average rate of change on [a, b], use {f(b) − f(a)/b − a} for each function, reading values from whichever form you have.",
    ],
  },
  why: [
    { kind: "choice", prompt: "To compare the growth rates of an exponential in a table and one in an equation, what should you find from the table?", choices: ["The ratio between consecutive outputs (the growth factor).", "The difference between consecutive outputs.", "The largest number in the table."], correct: 0, explain: "Exponential functions have a constant ratio, which is the b in a · b^x." },
    { kind: "written", prompt: "f is a parabola shown on a graph with vertex (3, 7). g(x) = −(x − 1)^2 + 9. Explain how to decide which has the greater maximum.", keyIdeas: ["the maximum of a downward parabola is the vertex's y-value", "f's maximum is 7 from the graph", "g's vertex is (1, 9), so its maximum is 9", "g has the greater maximum"], exemplar: "Both open down, so each maximum is the y-coordinate of the vertex. From the graph, f's maximum is 7. g is in vertex form with vertex (1, 9), so its maximum is 9. g has the greater maximum." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a1 = r.pick([1000, 2000, 500]), b1 = r.pick([1.05, 1.1, 1.2]);
      let b2 = r.pick([1.04, 1.06, 1.08, 1.12, 1.15]);
      if (b2 === b1) b2 = 1.15;
      const a2 = r.pick([800, 1500, 2500]);
      const rows = [0, 1, 2, 3].map((t) => Math.round(a1 * b1 ** t * 100) / 100);
      const fasterA = b1 > b2;
      const p1 = Math.round((b1 - 1) * 100), p2 = Math.round((b2 - 1) * 100);
      const correct = fasterA ? `Account A: it grows ${p1}% per year, compared with ${p2}% for B.` : `Account B: it grows ${p2}% per year, compared with ${p1}% for A.`;
      return {
        prompt: `Account A's balance is shown in the table. Account B's balance is B(t) = ${a2}(${b2})^t. Which account grows by the greater percent each year?`,
        visual: { type: "table", headers: ["t (years)", "0", "1", "2", "3"], rows: [["A(t) ($)", ...rows.map((v) => dn(v))]] },
        answer: choice(r, correct, [
          [fasterA ? `Account B: it grows ${p2}% per year, compared with ${p1}% for A.` : `Account A: it grows ${p1}% per year, compared with ${p2}% for B.`, "Find A's factor by dividing consecutive values, then compare it with B's base."],
          [a1 > a2 ? "Account A, because it starts with more money." : "Account B, because it starts with more money.", "The starting amount doesn't affect the percent growth."],
        ]),
        hints: ["For the table, divide one year's balance by the year before.", `${dn(rows[1])} ÷ ${dn(rows[0])} = ${b1}.`],
        steps: [
          st("Account A's factor.", `${dn(rows[1])} ÷ ${dn(rows[0])} = ${b1}, a ${p1}% yearly increase.`),
          st("Account B's factor.", `The base is ${b2}, a ${p2}% yearly increase.`),
          st("Compare.", correct),
        ],
      };
    }
    if (lv === 2) {
      const h1 = r.int(-3, 3), k1 = r.int(2, 9);
      const h2 = r.int(-3, 3);
      let k2 = r.int(2, 9);
      if (k2 === k1) k2 = k1 + r.pick([-2, 2]);
      const a2 = r.pick([-1, -2]);
      // g in standard form: a2(x − h2)^2 + k2
      const B = -2 * a2 * h2, C = a2 * h2 * h2 + k2;
      const gD = `${a2 === -1 ? "−" : "−2"}x^2${B ? (B > 0 ? ` + ${B}x` : ` − ${-B}x`) : ""}${cst(C)}`;
      const big = Math.max(k1, k2), small = Math.min(k1, k2);
      return {
        prompt: `f is the parabola graphed below. g(x) = ${gD}. What is the greater of the two maximum values?`,
        visual: { type: "plot", xMin: h1 - 5, xMax: h1 + 5, yMin: k1 - 10, yMax: k1 + 3, curves: [{ expr: `-(x-${h1})^2+${k1}`.replace("--", "+") }], points: [{ x: h1, y: k1, label: `(${ms(h1)}, ${k1})` }] },
        answer: num(big),
        hints: ["Each maximum is the y-coordinate of a vertex.", `For g, the vertex is at x = −{b/2a} = −{${ms(B)}/2(${ms(a2)})} = ${ms(h2)}. Then find g(${ms(h2)}).`],
        steps: [
          st("Maximum of f.", `From the graph, the vertex is (${ms(h1)}, ${k1}), so the maximum is ${k1}.`),
          st("Vertex of g.", `x = −{b/2a} = −{${ms(B)}/${ms(2 * a2)}} = ${ms(h2)}`),
          st("Maximum of g.", `g(${ms(h2)}) = ${ms(k2)}`),
          st("Compare.", `${big} > ${small}, so the greater maximum is ${big} (${big === k1 ? "f" : "g"}).`),
        ],
        traps: traps(frac(big), [trap(small, "That's the smaller of the two maximums."), trap(C, `${ms(C)} is g's y-intercept, not its maximum.`)]),
      };
    }
    const x2 = r.pick([2, 3, 4]);
    const m = r.int(2, 9), b = r.int(-5, 5);
    const fTable = [0, 1, 2, 3, 4].map((x) => m * x + b + (x === 0 || x === x2 ? 0 : r.int(-1, 1)));
    const a = r.pick([1, 2, 3]), base = r.pick([2, 3]);
    const g = (x: number) => a * base ** x;
    if ((fTable[x2] - fTable[0]) === g(x2) - g(0)) fTable[x2] += 1;
    const fNum = fTable[x2] - fTable[0], gNum = g(x2) - g(0);
    const fRate = frac(fNum, x2), gRate = frac(gNum, x2);
    const gBig = gNum > fNum;
    const bigger = gBig ? gRate : fRate, smaller = gBig ? fRate : gRate;
    const show = (f: ReturnType<typeof frac>) => (f.d === 1 ? ms(f.n) : `${f.n < 0 ? "−" : ""}{${Math.abs(f.n)}/${f.d}}`);
    return {
      prompt: `f is given by the table, and g(x) = ${a === 1 ? "" : `${a} · `}${base}^x. On the interval 0 ≤ x ≤ ${x2}, which function has the greater average rate of change? Enter that greater rate.`,
      visual: { type: "table", headers: ["x", "0", "1", "2", "3", "4"], rows: [["f(x)", ...fTable.map((v) => ms(v))]] },
      answer: num(bigger),
      hints: [`Average rate of change = {f(${x2}) − f(0)/${x2} − 0}.`, `f: {${ms(fTable[x2])} − ${sn0(fTable[0])}/${x2}}. For g, g(${x2}) = ${g(x2)} and g(0) = ${a}.`],
      steps: [
        st("Rate for f (from the table).", `{${ms(fTable[x2])} − ${sn0(fTable[0])}/${x2}} = ${show(fRate)}`),
        st("Rate for g (from the equation).", `{${g(x2)} − ${a}/${x2}} = ${show(gRate)}`),
        st("Compare.", `${gBig ? "g" : "f"} has the greater average rate of change: ${show(bigger)}.`),
      ],
      traps: traps(bigger, [trap(smaller, "That's the smaller rate."), trap(gBig ? g(x2) - g(0) : fNum, "Divide the change in output by the change in x.")]),
    };
  },
};

function sn0(v: number): string {
  return v < 0 ? `(−${-v})` : String(v);
}

const skills: Skill[] = [build, features, rates, logEval, inverse, solve, interpret, vsPoly, compare];
export default skills;
