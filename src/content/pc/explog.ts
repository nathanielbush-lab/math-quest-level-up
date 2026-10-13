// Unit 4: Exponential and logarithmic functions and equations
// (PC.F.4.1–F.4.4, PC.F.4.7, PC.A.2.1, PC.A.2.2).
import { choice, cst, exact, expr, ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { f1, f2, pick2, round, shiftExpr, shiftText, trapsTol } from "./util";

const T = "pc-explog";

const bText = (b: number) => (b === 0.5 ? "({1/2})" : b === 0.25 ? "({1/4})" : b === 1 / 3 ? "({1/3})" : String(b));
const bInline = (b: number) => (b === 0.5 ? "(1/2)" : b === 0.25 ? "(1/4)" : b === 1 / 3 ? "(1/3)" : String(b));
const aText = (a: number) => (a === 1 ? "" : a === -1 ? "−" : ms(a));

const expFeatures: Skill = {
  id: "pc.explog.exp-features",
  title: "Key features of exponential functions",
  topic: T,
  standards: ["PC.F.4.1"],
  prereqs: [],
  lesson: {
    bigIdea: "f(x) = a·b^x + k has a horizontal asymptote y = k, y-intercept a + k, and grows if b > 1 (decays if 0 < b < 1). The sign of a decides which side of the asymptote it lives on.",
    explain: [
      "f(x) = 3 · 2^x − 4: as x → −∞, 2^x → 0, so f(x) → −4. The asymptote is **y = −4**. The y-intercept is f(0) = 3 − 4 = −1.",
      "In limit notation: lim_(x→−∞) f(x) = −4 and lim_(x→∞) f(x) = ∞.",
      "Range: since 3 · 2^x is always positive, f(x) > −4, so the range is (−4, ∞). With a negative a the graph is below the asymptote instead.",
      "Concavity: a > 0 makes the graph bend upward (concave up); a < 0 flips it to concave down.",
    ],
    visual: { type: "plot", xMin: -6, xMax: 3, yMin: -6, yMax: 10, curves: [{ expr: "3*2^x-4", label: "f(x) = 3·2ˣ − 4" }], hlines: [{ y: -4, dashed: true, label: "y = −4" }], points: [{ x: 0, y: -1, label: "(0, −1)" }] },
    tip: "The asymptote is whatever is added at the end. The exponential part can get close to 0 but never reach it.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(x) = 5 · 2^x + 3 never reach y = 3?", choices: ["5 · 2^x is always positive, so f(x) is always more than 3.", "Because the graph stops at x = 3.", "It reaches 3 when x = 0.", "Because 2^x can be negative."], correct: 0, explain: "Powers of a positive base are always positive. Adding a positive amount to 3 can get very close to 3 but never equal it." },
    { kind: "written", prompt: "Explain how you can tell, without graphing, whether f(x) = −2(0.5)^x + 1 is increasing or decreasing.", keyIdeas: ["(0.5)^x decreases since the base is between 0 and 1", "multiplying by −2 flips it", "so f is increasing"], exemplar: "(0.5)^x gets smaller as x grows because the base is less than 1. Multiplying by −2 flips that, so −2(0.5)^x gets bigger (less negative). Adding 1 doesn't change direction, so f is increasing." },
  ],
  generate(r, lv) {
    const a = lv === 1 ? r.pick([1, 2, 3, 5]) : r.pick([2, 3, -1, -2, 4, -3]);
    const b = lv === 1 ? r.pick([2, 3, 4]) : r.pick([2, 3, 0.5, 4, 1 / 3]);
    const k = r.int(-6, 6);
    const fx = `f(x) = ${aText(a)}${Math.abs(a) === 1 ? "" : " · "}${bText(b)}^x${cst(k)}`;
    const grow = b > 1;
    if (lv === 1) {
      return {
        prompt: `${fx}. Find the horizontal asymptote and the y-intercept.`,
        answer: { kind: "multi", fields: [{ value: frac(k), pre: "asymptote y =" }, { value: frac(a + k), pre: "y-intercept (0," , post: ")" }] },
        hints: ["As x → −∞, b^x gets closer and closer to 0. What does f(x) approach?", `The y-intercept is f(0), and ${b}^0 = 1.`],
        steps: [st("Asymptote.", `${bText(b)}^x → 0, so f(x) → ${ms(k)}. The asymptote is y = ${ms(k)}.`), st("y-intercept.", `f(0) = ${a === 1 ? "" : `${ms(a)} · `}1${cst(k)} = ${ms(a + k)}, so (0, ${ms(a + k)}).`)],
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const dir = grow ? "−∞" : "∞";
        return {
          prompt: `${fx}. Find lim_(x→${dir}) f(x).`,
          answer: num(k),
          hints: [`As x → ${dir}, what happens to ${bText(b)}^x?`, `${bText(b)}^x → 0, so only the constant is left.`],
          steps: [st(`Look at ${bText(b)}^x as x → ${dir}.`, `${grow ? "A base bigger than 1 with a very negative exponent" : "A base between 0 and 1 with a huge exponent"} gives a number very close to 0.`), st("So the limit is", `${ms(a)} · 0${cst(k)} = ${ms(k)}`)],
          traps: traps(frac(k), [trap(a + k, "That's f(0), the y-intercept. The limit is about very large |x|."), trap(a, "The exponential part goes to 0, so multiplying by a gives 0, not a.")]),
        };
      }
      const correct = a > 0 ? `(${ms(k)}, ∞)` : `(−∞, ${ms(k)})`;
      return {
        prompt: `What is the range of ${fx}?`,
        answer: choice(r, correct, [[a > 0 ? `[${ms(k)}, ∞)` : `(−∞, ${ms(k)}]`, `f(x) never actually equals ${ms(k)}: that's the asymptote.`], [a > 0 ? `(−∞, ${ms(k)})` : `(${ms(k)}, ∞)`, a > 0 ? "a is positive, so the graph is above the asymptote." : "a is negative, so the graph is below the asymptote."], ["All real numbers", "An exponential function has a horizontal asymptote, so it can't take every value."], [`(${ms(a + k)}, ∞)`, "The y-intercept isn't a boundary of the range; the asymptote is."]]),
        hints: [`The asymptote is y = ${ms(k)}.`, `${bText(b)}^x is always positive, and a = ${ms(a)} is ${a > 0 ? "positive" : "negative"}. Is the graph above or below the asymptote?`],
        steps: [st("Asymptote.", `y = ${ms(k)}`), st("Which side?", `${aText(a) || "1 · "}${bText(b)}^x is always ${a > 0 ? "positive" : "negative"}, so f(x) ${a > 0 ? ">" : "<"} ${ms(k)}.`), st("Range.", correct)],
      };
    }
    const inc = (a > 0) === grow;
    const up = a > 0;
    const correct = `${inc ? "Increasing" : "Decreasing"} and concave ${up ? "up" : "down"}`;
    return {
      prompt: `Which describes the graph of ${fx}?`,
      answer: choice(r, correct, [[`${inc ? "Decreasing" : "Increasing"} and concave ${up ? "up" : "down"}`, `Check the direction: base ${bInline(b)} ${grow ? "grows" : "shrinks"}, and a = ${ms(a)} ${a < 0 ? "flips it" : "keeps it"}.`], [`${inc ? "Increasing" : "Decreasing"} and concave ${up ? "down" : "up"}`, `Concavity depends on the sign of a: ${a > 0 ? "positive bends up" : "negative bends down"}.`], [`${inc ? "Decreasing" : "Increasing"} and concave ${up ? "down" : "up"}`, "Both direction and concavity are off."]]),
      hints: [`First, does ${bInline(b)}^x grow or shrink as x increases?`, `Multiplying by a negative number flips the graph over its asymptote, which reverses both direction and concavity.`],
      steps: [st("Base.", `${bInline(b)} is ${grow ? "greater than 1, so b^x increases" : "between 0 and 1, so b^x decreases"}.`), st("Effect of a.", a > 0 ? "a > 0 keeps the shape: concave up." : "a < 0 reflects over the asymptote: direction reverses and the graph is concave down."), st("Answer.", correct)],
    };
  },
};

const model: Skill = {
  id: "pc.explog.model",
  title: "Build exponential growth and decay models",
  topic: T,
  standards: ["PC.F.4.2"],
  prereqs: ["pc.explog.exp-features"],
  lesson: {
    bigIdea: "A quantity that changes by the same factor each time period is modeled by A(t) = A_0 · b^t: A_0 is the starting amount and b is the growth factor.",
    explain: [
      "Percent change: growing 8% per month means b = 1 + 0.08 = 1.08; losing 15% per year means b = 1 − 0.15 = 0.85.",
      "Doubling every 3 hours: A(t) = A_0 · 2^(t/3). Half-life of 5 hours: A(t) = A_0 · ({1/2})^(t/5). The exponent counts how many doubling (or halving) periods have passed.",
      "Continuous growth at rate r: A(t) = A_0 e^(rt). Example: $500 at 4% compounded continuously is A(t) = 500e^(0.04t).",
      "From data: if A(0) = 500 and A(2) = 720, then b^2 = {720/500} = 1.44, so b = 1.2 and A(t) = 500(1.2)^t.",
    ],
    tip: "Decay factors are less than 1. If your model for a decreasing quantity has b > 1, check the sign of the percent.",
  },
  why: [
    { kind: "choice", prompt: "Why is a 6% increase modeled with the factor 1.06 instead of 0.06?", choices: ["You keep the whole amount (1) and add 6% of it (0.06).", "Because 0.06 is too small to graph.", "Because percents are always more than 1.", "1.06 is the rate and 0.06 is the factor."], correct: 0, explain: "After one period you have 100% + 6% = 106% of what you had: multiply by 1.06. Multiplying by 0.06 would leave only 6%." },
    { kind: "written", prompt: "Explain why the model for something that doubles every 4 days is A(t) = A_0 · 2^(t/4), not A_0 · 2^(4t).", keyIdeas: ["t/4 counts the number of 4-day periods", "after 4 days the exponent is 1, so it has doubled once", "2^(4t) would double 4 times every day"], exemplar: "The exponent should count doublings. After t days there have been t/4 four-day periods, so the amount is multiplied by 2 that many times: 2^(t/4). With 2^(4t), after 1 day it would already have doubled 4 times." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const up = r.chance(0.5);
      const pct = up ? r.pick([3, 5, 8, 12, 20]) : r.pick([4, 10, 15, 20, 25]);
      const A0 = up ? r.pick([1500, 2500, 4000, 800]) : r.pick([18000, 24000, 32000]);
      const b = up ? 1 + pct / 100 : 1 - pct / 100;
      const ctx = up ? `A streamer has ${A0} followers, and the count grows ${pct}% per month.` : `A car is worth $${A0} and loses ${pct}% of its value each year.`;
      const L = up ? "F" : "V";
      return {
        prompt: `${ctx} Write a model ${L}(t) for t ${up ? "months" : "years"} from now.`,
        answer: expr(`${A0}*${b}^t`, { vars: ["t"], lhs: `${L}(t)`, display: `${A0}(${b})^t` }),
        hints: ["Use A_0 · b^t. What is the starting amount?", `${up ? "Growing" : "Losing"} ${pct}% means the factor is 1 ${up ? "+" : "−"} ${pct / 100}.`],
        steps: [st("Starting amount.", `A_0 = ${A0}`), st("Growth factor.", `b = 1 ${up ? "+" : "−"} ${pct / 100} = ${b}`), st("Model.", `${L}(t) = ${A0}(${b})^t`)],
      };
    }
    if (lv === 2) {
      const dbl = r.chance(0.5);
      const per = r.pick([2, 3, 4, 5, 6]);
      const A0 = dbl ? r.pick([200, 300, 400, 50]) : r.pick([100, 200, 160, 400]);
      const ctx = dbl ? `A bacteria culture starts with ${A0} cells and doubles every ${per} hours.` : `You drink ${A0} mg of caffeine. Its half-life in your body is ${per} hours.`;
      const L = dbl ? "N" : "C";
      return {
        prompt: `${ctx} Write a model ${L}(t) for the amount after t hours.`,
        answer: expr(`${A0}*${dbl ? 2 : "(1/2)"}^(t/${per})`, { vars: ["t"], lhs: `${L}(t)`, display: `${A0}${dbl ? "(2)" : "({1/2})"}^(t/${per})` }),
        hints: [`The factor for each ${per}-hour period is ${dbl ? "2" : "1/2"}.`, `The number of ${per}-hour periods in t hours is t/${per}. Put that in the exponent.`],
        steps: [st("Start.", `${L}(0) = ${A0}`), st("Factor per period.", dbl ? "Doubling: × 2" : "Half-life: × 1/2"), st("Number of periods after t hours.", `t/${per}`), st("Model.", `${L}(t) = ${A0}${dbl ? "(2)" : "({1/2})"}^(t/${per})`)],
      };
    }
    if (r.chance(0.5)) {
      const P = r.pick([500, 1000, 2000, 1500]), rate = r.pick([3, 4, 5, 6]);
      return {
        prompt: `$${P} is invested at ${rate}% interest compounded continuously. Write a model A(t) for the balance after t years.`,
        answer: expr(`${P}e^(${rate / 100}t)`, { vars: ["t"], lhs: "A(t)", display: `${P}e^(${rate / 100}t)` }),
        hints: ["Continuous compounding uses A = Pe^(rt).", `r is the rate as a decimal: ${rate / 100}.`],
        steps: [st("Formula.", "A(t) = Pe^(rt)"), st("Substitute.", `P = ${P}, r = ${rate / 100}`), st("Model.", `A(t) = ${P}e^(${rate / 100}t)`)],
      };
    }
    const b = r.pick([1.2, 1.5, 0.8, 0.5, 1.1]);
    const A0 = r.pick([500, 400, 1000, 2000]);
    const A2 = round(A0 * b * b, 2);
    return {
      prompt: `A population is modeled by P(t) = a · b^t. P(0) = ${A0} and P(2) = ${A2}. Write the model.`,
      answer: expr(`${A0}*${b}^t`, { vars: ["t"], lhs: "P(t)", display: `${A0}(${b})^t` }),
      hints: [`P(0) = a · b^0 = a, so a = ${A0}.`, `P(2) = ${A0} · b^2 = ${A2}. Solve for b^2, then take the square root.`],
      steps: [st("Find a.", `P(0) = a = ${A0}`), st("Set up for b.", `${A0}b^2 = ${A2}, so b^2 = {${A2}/${A0}} = ${round(b * b, 4)}`), st("Solve.", `b = √${round(b * b, 4)} = ${b} (b must be positive)`), st("Model.", `P(t) = ${A0}(${b})^t`)],
    };
  },
};

const logFeatures: Skill = {
  id: "pc.explog.log-features",
  title: "Key features of logarithmic functions",
  topic: T,
  standards: ["PC.F.4.3"],
  prereqs: ["pc.explog.exp-features"],
  lesson: {
    bigIdea: "y = log_b(x) is the inverse of y = b^x: its domain is x > 0, it has a vertical asymptote x = 0, and it passes through (1, 0) and (b, 1).",
    explain: [
      "log_b(x) answers: what power of b gives x? log_2(8) = 3 because 2^3 = 8.",
      "For f(x) = log_2(x − 3) + 1: the inside must be positive, so the domain is x > 3 and the asymptote is **x = 3**.",
      "x-intercept: log_2(x − 3) + 1 = 0 means log_2(x − 3) = −1, so x − 3 = 2^(−1) = {1/2} and x = 3{1/2}.",
      "Key point: when the inside equals b, the log is 1. x − 3 = 2 gives the point (5, 2).",
    ],
    visual: { type: "plot", xMin: -1, xMax: 12, yMin: -4, yMax: 5, curves: [{ expr: "log_2(x-3)+1", domain: [3.01, 12], label: "f(x) = log₂(x − 3) + 1" }], vlines: [{ x: 3, dashed: true, label: "x = 3" }], points: [{ x: 3.5, y: 0, label: "(3.5, 0)" }, { x: 5, y: 2, label: "(5, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is log_3(x) not defined for x ≤ 0?", choices: ["No power of 3 is zero or negative, so there's no exponent that works.", "Because 3 is odd.", "Because logs are only defined for integers.", "It is defined; log_3(−9) = −2."], correct: 0, explain: "3^y is positive for every real y. Since log_3(x) asks which y gives 3^y = x, there's no answer when x ≤ 0." },
    { kind: "written", prompt: "Explain how the graphs of y = 2^x and y = log_2(x) are related, and use it to explain the asymptote of the log graph.", keyIdeas: ["they are inverses", "reflect over y = x", "the horizontal asymptote y = 0 of 2^x becomes the vertical asymptote x = 0"], exemplar: "They're inverse functions, so each graph is the other reflected over y = x. The exponential has a horizontal asymptote y = 0; reflecting swaps x and y, so the log has a vertical asymptote x = 0." },
  ],
  generate(r, lv) {
    const b = r.pick([2, 3, 5]);
    const h = r.int(-6, 6), k = r.int(-3, 3);
    const fx = `f(x) = log_${b}(${shiftText(h)})${cst(k)}`;
    const fE = `log_${b}(${shiftExpr(h)})${k ? (k > 0 ? "+" + k : k) : ""}`;
    if (lv === 1) {
      if (r.chance(0.5)) {
        return {
          prompt: `${fx}. What is the vertical asymptote?`,
          visual: { type: "plot", xMin: h - 2, xMax: h + 12, yMin: k - 5, yMax: k + 4, curves: [{ expr: fE, domain: [h + 0.01, h + 12] }] },
          answer: num(h, { pre: "x = " }),
          hints: ["The inside of a log must be positive. Where does it equal 0?", `${shiftText(h)} = 0 when x = ${ms(h)}.`],
          steps: [st("Set the inside equal to 0.", `${shiftText(h)} = 0`), st("Solve.", `x = ${ms(h)}. The graph approaches this vertical line but never touches it.`)],
          traps: traps(frac(h), [trap(-h, "Check the sign: solve the inside = 0."), trap(k, "That's the vertical shift. The asymptote comes from the inside of the log.")]),
        };
      }
      const n = r.int(0, 3);
      const x0 = h + b ** n;
      return {
        prompt: `${fx}. Find f(${ms(x0)}).`,
        answer: num(n + k),
        hints: [`Compute the inside first: ${ms(x0)}${cst(-h)} = ${b ** n}.`, `log_${b}(${b ** n}) asks: ${b} to what power is ${b ** n}?`],
        steps: [st("Inside.", `${ms(x0)}${cst(-h)} = ${b ** n}`), st("Log.", `log_${b}(${b ** n}) = ${n} because ${b}^${n} = ${b ** n}`), ...(k ? [st("Add the shift.", `${n}${cst(k)} = ${ms(n + k)}`)] : [])],
        traps: traps(frac(n + k), [trap(b ** n + k, "Take the log of the inside, don't add the shift to the inside itself.")]),
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const correct = `(${ms(h)}, ∞)`;
        return {
          prompt: `What is the domain of ${fx}?`,
          answer: choice(r, correct, [[`[${ms(h)}, ∞)`, `At x = ${ms(h)} the inside is 0, and log of 0 doesn't exist.`], [`(${ms(-h)}, ∞)`, "Solve the inside > 0 carefully; the sign is off."], [`(${ms(k)}, ∞)`, "The vertical shift doesn't affect the domain."], ["All real numbers", "The inside of a log has to be positive."]]),
          hints: ["Set the inside of the log greater than 0.", `${shiftText(h)} > 0`],
          steps: [st("The inside must be positive.", `${shiftText(h)} > 0`), st("Solve.", `x > ${ms(h)}`), st("Interval notation.", correct)],
        };
      }
      const kk = -Math.abs(k) || -1;
      const xi = h + b ** -kk;
      const fx2 = `f(x) = log_${b}(${shiftText(h)})${cst(kk)}`;
      return {
        prompt: `Find the x-intercept of ${fx2}.`,
        answer: num(xi, { pre: "x = " }),
        hints: ["At the x-intercept, f(x) = 0.", `log_${b}(${shiftText(h)}) = ${-kk}. Rewrite in exponential form.`],
        steps: [st("Set f(x) = 0.", `log_${b}(${shiftText(h)}) = ${-kk}`), st("Exponential form.", `${shiftText(h)} = ${b}^${-kk} = ${b ** -kk}`), st("Solve.", `x = ${b ** -kk}${cst(h)} = ${ms(xi)}`)],
        traps: traps(frac(xi), [trap(h + b * -kk, `${b}^${-kk} means repeated multiplication, not ${b} × ${-kk}.`), trap((-kk) ** b + h, "The base is the number being raised to a power.")]),
      };
    }
    const kk = Math.abs(k) || 1;
    const xi = frac(h * b ** kk + 1, b ** kk);
    return {
      prompt: `Find the x-intercept of f(x) = log_${b}(${shiftText(h)}) + ${kk}. Give an exact value.`,
      answer: { kind: "number", value: xi, pre: "x = " },
      hints: ["Set f(x) = 0 and isolate the log.", `log_${b}(${shiftText(h)}) = −${kk}, so ${shiftText(h)} = ${b}^(−${kk}).`],
      steps: [st("Set f(x) = 0.", `log_${b}(${shiftText(h)}) = −${kk}`), st("Exponential form.", `${shiftText(h)} = ${b}^(−${kk}) = {1/${b ** kk}}`), st("Solve.", `x = {1/${b ** kk}}${cst(h)} = ${xi.n < 0 ? "−" : ""}{${Math.abs(xi.n)}/${xi.d}}`)],
      traps: traps(xi, [trap(h - b ** kk, `${b}^(−${kk}) is {1/${b ** kk}}, not −${b ** kk}.`), trap(h + b ** kk, "The exponent is negative after you move the constant over.")]),
    };
  },
};

const transform: Skill = {
  id: "pc.explog.transform",
  title: "Transformations of exponential and log graphs",
  topic: T,
  standards: ["PC.F.4.7"],
  prereqs: ["pc.explog.exp-features", "pc.explog.log-features"],
  lesson: {
    bigIdea: "Exponential and log graphs shift and stretch like any function. Track the asymptote and one key point.",
    explain: [
      "y = 2^(x + 3) − 1: shift y = 2^x left 3 and down 1. The asymptote moves from y = 0 to **y = −1**, and the point (0, 1) moves to (−3, 0).",
      "y = log_3(x − 2) + 4: shift right 2 and up 4. The asymptote moves from x = 0 to **x = 2**, and the point (1, 0) moves to (3, 4).",
      "A vertical shift moves an exponential's asymptote; a horizontal shift moves a log's asymptote.",
    ],
    visual: { type: "plot", xMin: -6, xMax: 4, yMin: -3, yMax: 8, curves: [{ expr: "2^x", dashed: true, color: 3, label: "y = 2ˣ" }, { expr: "2^(x+3)-1", label: "y = 2^(x+3) − 1" }], hlines: [{ y: -1, dashed: true, label: "y = −1" }], points: [{ x: -3, y: 0, label: "(−3, 0)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why doesn't shifting y = 2^x left or right change its horizontal asymptote?", choices: ["A horizontal shift slides the graph sideways; the height it approaches stays the same.", "Because exponentials can't be shifted horizontally.", "It does: the asymptote moves left too.", "Because the asymptote is vertical."], correct: 0, explain: "A horizontal asymptote is a height. Sliding left or right doesn't change heights, so only a vertical shift moves it." },
    { kind: "written", prompt: "Describe how to graph y = −log_2(x + 1) starting from y = log_2(x). Include the asymptote and one point.", keyIdeas: ["shift left 1: asymptote x = −1", "reflect over the x-axis", "(2, 1) goes to (1, −1)"], exemplar: "Shift log_2(x) left 1, so the asymptote is x = −1 and the point (2, 1) moves to (1, 1). Then reflect over the x-axis: the point becomes (1, −1) and the graph now falls as x increases." },
  ],
  generate(r, lv) {
    const isExp = r.chance(0.5);
    const b = r.pick([2, 3]);
    const h = r.nonzero(-4, 4);
    const k = lv === 1 ? 0 : r.nonzero(-4, 4);
    const ref = lv === 3 && r.chance(0.6) ? -1 : 1;
    const negE = ref < 0 ? "-" : "";
    // h is the rightward shift.
    const make = (hh: number, kk: number, rr: number) => {
      const n = rr < 0 ? "−" : "";
      return isExp ? `y = ${n}${b}^(${shiftText(hh)})${cst(kk)}` : `y = ${n}log_${b}(${shiftText(hh)})${cst(kk)}`;
    };
    const correct = make(h, k, ref);
    const e = isExp ? `${negE}${b}^(${shiftExpr(h)})${k ? (k > 0 ? "+" + k : k) : ""}` : `${negE}log_${b}(${shiftExpr(h)})${k ? (k > 0 ? "+" + k : k) : ""}`;
    const key = isExp ? { x: h, y: ref + k } : { x: h + 1, y: k };
    const key2 = isExp ? { x: h + 1, y: ref * b + k } : { x: h + b, y: ref + k };
    const visual = {
      type: "plot" as const,
      xMin: isExp ? h - 6 : h - 2, xMax: isExp ? h + 3 : h + 10, yMin: k - 7, yMax: k + 7,
      curves: [{ expr: isExp ? `${b}^x` : `log_${b}(x)`, dashed: true, color: 3 as const, label: isExp ? `y = ${b}ˣ` : `y = log${b === 2 ? "₂" : "₃"}x`, ...(isExp ? {} : { domain: [0.01, h + 10] as [number, number] }) }, { expr: e, label: "?", ...(isExp ? {} : { domain: [h + 0.01, h + 10] as [number, number] }) }],
      ...(isExp ? { hlines: [{ y: k, dashed: true, label: `y = ${ms(k)}` }] } : { vlines: [{ x: h, dashed: true, label: `x = ${ms(h)}` }] }),
      points: [{ x: key.x, y: key.y, label: `(${ms(key.x)}, ${ms(key.y)})` }, { x: key2.x, y: key2.y, label: `(${ms(key2.x)}, ${ms(key2.y)})` }],
    };
    return {
      prompt: `The dashed curve is ${isExp ? `y = ${b}^x` : `y = log_${b}(x)`}. Which equation gives the solid curve?`,
      visual,
      answer: choice(r, correct, [[make(-h, k, ref), "The horizontal shift is backwards: (x − h) moves the graph right h."], ...(k ? [[make(h, -k, ref), "The vertical shift is backwards."] as [string, string]] : [[make(h, h, ref), "The graph didn't move up or down: check the asymptote."] as [string, string]]), [make(h, k, -ref), ref < 0 ? "The solid curve is flipped over, so there's a negative sign in front." : "The solid curve isn't flipped, so no negative sign."], [make(-h, -k || -h, ref), "Read the asymptote and the labeled points again."]]),
      hints: [isExp ? `Where is the horizontal asymptote? That's the vertical shift.` : `Where is the vertical asymptote? That's the horizontal shift.`, isExp ? `The point (0, 1) on y = ${b}^x moves with the graph. Where is it now?` : `The point (1, 0) on y = log_${b}(x) moves with the graph. Where is it now?`, `Check a labeled point in your equation.`],
      steps: [
        st("Asymptote.", isExp ? `Horizontal asymptote y = ${ms(k)}: shift ${k === 0 ? "none" : k > 0 ? `up ${k}` : `down ${-k}`}.` : `Vertical asymptote x = ${ms(h)}: shift ${h > 0 ? `right ${h}` : `left ${-h}`}.`),
        st("Key point.", isExp ? `(0, 1) moved to (${ms(key.x)}, ${ms(key.y)}): shift ${h > 0 ? `right ${h}` : `left ${-h}`}${ref < 0 ? ", and it's below the asymptote, so the graph is reflected" : ""}.` : `(1, 0) moved to (${ms(key.x)}, ${ms(key.y)}): shift ${k === 0 ? "none vertically" : k > 0 ? `up ${k}` : `down ${-k}`}${ref < 0 ? `; (${b}, 1) became (${ms(key2.x)}, ${ms(key2.y)}), below the shift, so it's reflected` : ""}.`),
        st("Equation.", correct),
        st("Check.", `Plug x = ${ms(key2.x)} into the equation: you get ${ms(key2.y)} ✓`),
      ],
    };
  },
};

const logProps: Skill = {
  id: "pc.explog.log-props",
  title: "Use the properties of logarithms",
  topic: T,
  standards: ["PC.A.2.1"],
  prereqs: ["pc.explog.log-features"],
  lesson: {
    bigIdea: "Logs turn multiplication into addition: log(MN) = log M + log N, log({M/N}) = log M − log N, and log(M^p) = p·log M.",
    explain: [
      "These come straight from exponent rules: multiplying powers adds exponents, and a log *is* an exponent.",
      "Evaluate: log_6(4) + log_6(9) = log_6(36) = **2**, even though neither piece is a whole number.",
      "Expand: log({x^3√y/z}) = 3 log x + {1/2} log y − log z.",
      "Estimate: if log_b 2 ≈ 0.43 and log_b 3 ≈ 0.68, then log_b 12 = log_b(2^2 · 3) ≈ 2(0.43) + 0.68 = 1.54.",
    ],
    tip: "There is no rule for log(M + N). Only products, quotients and powers split apart.",
  },
  why: [
    { kind: "choice", prompt: "Why is log_b(MN) = log_b M + log_b N?", choices: ["If M = b^p and N = b^q, then MN = b^(p+q), and the log of that is p + q.", "Because logs distribute over multiplication like parentheses.", "Because log_b(MN) = log_b M · log_b N.", "It only works when M = N."], correct: 0, explain: "Logs are exponents. Multiplying powers of the same base adds their exponents, which is exactly the product rule." },
    { kind: "written", prompt: "Explain why log_2(8^5) = 15 using a property of logarithms.", keyIdeas: ["power rule: log(M^p) = p log M", "log_2 8 = 3", "5 · 3 = 15"], exemplar: "By the power rule, log_2(8^5) = 5 · log_2(8). Since 2^3 = 8, log_2(8) = 3, so the answer is 5 · 3 = 15." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 4, 6, 10]);
      const k = r.pick([2, 3]);
      const total = b ** k;
      const lg = b === 10 ? "log" : `log_${b}`;
      const divs = [] as number[];
      for (let d = 2; d < total; d++) if (total % d === 0 && d !== b && total / d !== b) divs.push(d);
      const add = r.chance(0.5) && divs.length > 0;
      if (add) {
        const m = r.pick(divs), n = total / m;
        return {
          prompt: `Evaluate ${lg}(${m}) + ${lg}(${n}).`,
          answer: num(k),
          hints: ["Use the product rule to combine into a single log.", `log_${b}(${m}) + log_${b}(${n}) = log_${b}(${m} · ${n}).`],
          steps: [st("Product rule.", `log_${b}(${m}) + log_${b}(${n}) = log_${b}(${total})`), st("Evaluate.", `${b}^${k} = ${total}, so the answer is ${k}.`)],
          traps: traps(frac(k), [trap(m + n, "The product rule multiplies the inputs; it doesn't add them."), trap(total, `${total} is the input. The log is the exponent that gives ${total}.`)]),
        };
      }
      const N = r.pick([2, 3, 5, 6]), M = N * total;
      return {
        prompt: `Evaluate ${lg}(${M}) − ${lg}(${N}).`,
        answer: num(k),
        hints: ["Use the quotient rule to combine into a single log.", `log_${b}(${M}) − log_${b}(${N}) = log_${b}({${M}/${N}}).`],
        steps: [st("Quotient rule.", `log_${b}(${M}) − log_${b}(${N}) = log_${b}(${total})`), st("Evaluate.", `${b}^${k} = ${total}, so the answer is ${k}.`)],
        traps: traps(frac(k), [trap(total, `${total} is the input. The log is the exponent that gives ${total}.`), trap(M - N, "The quotient rule divides the inputs.")]),
      };
    }
    if (lv === 2) {
      const [b, l2, l3] = r.pick([[5, 0.43, 0.68], [6, 0.39, 0.61], [7, 0.36, 0.56], [4, 0.5, 0.79]] as const);
      const forms = [
        { n: 12, text: "12 = 2^2 · 3", f: (a: number, c: number) => 2 * a + c, how: `2(${l2}) + ${l3}` },
        { n: 18, text: "18 = 2 · 3^2", f: (a: number, c: number) => a + 2 * c, how: `${l2} + 2(${l3})` },
        { n: 1.5, text: "1.5 = {3/2}", f: (a: number, c: number) => c - a, how: `${l3} − ${l2}` },
        { n: 24, text: "24 = 2^3 · 3", f: (a: number, c: number) => 3 * a + c, how: `3(${l2}) + ${l3}` },
        { n: 8, text: "8 = 2^3", f: (a: number) => 3 * a, how: `3(${l2})` },
      ];
      const fm = r.pick(forms);
      const ans = round(fm.f(l2, l3), 2);
      return {
        prompt: `Given log_${b}(2) ≈ ${l2} and log_${b}(3) ≈ ${l3}, find log_${b}(${fm.n}).`,
        answer: num(ans, { tolerance: 0.011 }),
        hints: [`Write ${fm.n} using only 2s and 3s.`, `${fm.text}. Now use the product, quotient and power rules.`],
        steps: [st("Factor.", fm.text), st("Expand the log.", `log_${b}(${fm.n}) = ${fm.how.replace(/0\.\d+/g, (m) => (m === String(l2) ? `log_${b}(2)` : `log_${b}(3)`)).replace(/\(log/g, "log").replace(/\)\)/g, ")")}`), st("Substitute.", `${fm.how} = ${ans}`)],
        traps: trapsTol(ans, 0.011, [trap(round(l2 * l3, 4), "The product rule adds logs; it doesn't multiply them."), trap(round(l2 + l3, 2), `That's log_${b}(6). Check how many 2s and 3s are in ${fm.n}.`)]),
      };
    }
    const p = r.pick([2, 3, 4]), q = r.pick([2, 3]);
    const expand = r.chance(0.5);
    if (expand) {
      const correct = `${p} log x + {1/2} log y − ${q} log z`.replace("{1/2}", "½");
      return {
        prompt: `Which expression is equivalent to log({x^${p}√y/z^${q}})?`,
        answer: choice(r, correct, [[`${p} log x + 2 log y − ${q} log z`, "√y = y^(1/2), so its coefficient is 1/2."], [`${p} log x + ½ log y + ${q} log z`, "Division becomes subtraction."], [`${p} log x · ½ log y ÷ ${q} log z`, "Logs turn products into sums, not products of logs."], [`log(${p}x) + log(½y) − log(${q}z)`, "Exponents come out in front as multipliers, not inside the log."]]),
        hints: ["Split the quotient first: log(top) − log(bottom).", "Then split the product, and bring each exponent to the front. Remember √y = y^(1/2)."],
        steps: [st("Quotient rule.", `log(x^${p}√y) − log(z^${q})`), st("Product rule.", `log(x^${p}) + log(y^(1/2)) − log(z^${q})`), st("Power rule.", correct)],
      };
    }
    return {
      prompt: `Write as a single logarithm: ${p} ln x − ln y + ${q} ln z`,
      answer: choice(r, `ln(x^${p}z^${q}/y)`, [[`ln(x^${p}y z^${q})`, "The minus sign means y goes in the denominator."], [`ln(${p}x − y + ${q}z)`, "Logs combine into products and quotients, not sums of the inputs."], [`ln(x^${p}/(y z^${q}))`, "Only y is subtracted, so only y goes in the denominator."], [`${p * q} ln(xz/y)`, "Each coefficient becomes an exponent on its own variable."]]),
      hints: ["Move each coefficient up as an exponent first (power rule).", `ln(x^${p}) − ln(y) + ln(z^${q}). Added logs multiply; subtracted logs divide.`],
      steps: [st("Power rule.", `ln(x^${p}) − ln(y) + ln(z^${q})`), st("Product and quotient rules.", `ln({x^${p}z^${q}/y})`)],
    };
  },
};

const solveExp: Skill = {
  id: "pc.explog.solve-exp",
  title: "Solve exponential equations",
  topic: T,
  standards: ["PC.A.2.2"],
  prereqs: ["pc.explog.log-props"],
  lesson: {
    bigIdea: "Isolate the exponential. If both sides are powers of the same base, set the exponents equal; otherwise take a log of both sides.",
    explain: [
      "Same base: 4^(x + 1) = 8^(x − 1). Write both as powers of 2: 2^(2x + 2) = 2^(3x − 3). So 2x + 2 = 3x − 3 and **x = 5**.",
      "Logs: 3 · 5^x = 48. Divide: 5^x = 16. Take log base 5: x = log_5(16) = {ln 16/ln 5} ≈ 1.72.",
      "Base e: e^(2x) = 9 gives 2x = ln 9, so x = {ln 9/2} = ln 3.",
    ],
    tip: "Isolate the power before taking logs. log(3 · 5^x) is not x · log(15).",
  },
  why: [
    { kind: "choice", prompt: "Why can you set exponents equal when 2^A = 2^B?", choices: ["y = 2^x is one-to-one: each output comes from exactly one input.", "Because both sides equal 2.", "Because exponents are always integers.", "You can only do this when A and B are positive."], correct: 0, explain: "An increasing exponential never repeats an output, so equal outputs force equal inputs." },
    { kind: "written", prompt: "Explain why x = log_5(16) is the exact solution of 5^x = 16, and how to get a decimal.", keyIdeas: ["log_5(16) is defined as the exponent that turns 5 into 16", "change of base: ln 16 / ln 5", "≈ 1.72"], exemplar: "log_5(16) means the power you raise 5 to in order to get 16, which is exactly what the equation asks for. To get a decimal, use change of base: ln 16 ÷ ln 5 ≈ 1.72." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const fam = r.pick([[2, [2, 4, 8, 16]], [3, [3, 9, 27]], [5, [5, 25, 125]]] as const);
      const g = fam[0];
      let i = r.int(0, fam[1].length - 1), j = r.int(0, fam[1].length - 1);
      while (j === i) j = r.int(0, fam[1].length - 1);
      const B1 = fam[1][i], B2 = fam[1][j], m1 = i + 1, m2 = j + 1;
      // m1(x + a) = m2(x + c) with integer solution x0.
      // m1(x0 + a) = m2(x0 + c) when a = m2·s − x0 and c = m1·s − x0.
      const x0 = r.int(-4, 7), sft = r.pick([-1, 1, 2]);
      const a = m2 * sft - x0, c = m1 * sft - x0;
      const ex = (s: number) => (s === 0 ? "x" : shiftText(-s));
      const pw = (base: number, s: number) => (s === 0 ? `${base}^x` : `${base}^(${ex(s)})`);
      const mul = (m: number, s: number) => (m === 1 ? ex(s) : `${m}(${ex(s)})`);
      return {
        prompt: `Solve ${pw(B1, a)} = ${pw(B2, c)}.`,
        answer: num(x0, { pre: "x = " }),
        hints: [`Write both bases as powers of ${g}: ${B1} = ${g}^${m1} and ${B2} = ${g}^${m2}.`, `${g}^(${mul(m1, a)}) = ${g}^(${mul(m2, c)}). Set the exponents equal.`],
        steps: [st(`Rewrite with base ${g}.`, `${m1 === 1 ? g : `(${g}^${m1})`}^(${ex(a)}) = ${m2 === 1 ? g : `(${g}^${m2})`}^(${ex(c)})`), st("Multiply exponents.", `${g}^(${mul(m1, a)}) = ${g}^(${mul(m2, c)})`), st("Set the exponents equal.", `${mul(m1, a)} = ${mul(m2, c)}`), st("Solve.", `${m1 === 1 ? "" : m1}x${cst(m1 * a)} = ${m2 === 1 ? "" : m2}x${cst(m2 * c)}, so ${m1 - m2 === 1 ? "" : m1 - m2 === -1 ? "−" : ms(m1 - m2)}x = ${ms(m2 * c - m1 * a)} and x = ${ms(x0)}`)],
        traps: traps(frac(x0), [trap(frac(c - a, m1 - m2), "Multiply the WHOLE exponent by the power: (x + a) times m, not just x."), trap(frac(m2 * c - m1 * a, m2 - m1), "Check the sign when you collect the x-terms.")]),
      };
    }
    if (lv === 2) {
      const b = r.pick([2, 3, 5]);
      const a = r.pick([2, 3, 4, 5]);
      const c = r.int(-5, 9);
      if (r.chance(0.5)) {
        const n = r.int(2, b === 2 ? 6 : 4);
        const rhs = a * b ** n + c;
        return {
          prompt: `Solve ${a} · ${b}^x${cst(c)} = ${rhs}.`,
          answer: num(n, { pre: "x = " }),
          hints: ["Isolate the power first: undo the constant, then divide.", `${b}^x = ${b ** n}. Which power of ${b} is that?`],
          steps: [st(`${c >= 0 ? "Subtract" : "Add"} ${Math.abs(c)}.`, `${a} · ${b}^x = ${rhs - c}`), st(`Divide by ${a}.`, `${b}^x = ${b ** n}`), st("Solve.", `${b}^${n} = ${b ** n}, so x = ${n}`)],
          traps: traps(frac(n), [trap(round(Math.log(rhs / a) / Math.log(b), 4), `Move the ${ms(c)} before dividing.`), trap(round(Math.log((rhs - c)) / Math.log(a * b), 4), `${a} · ${b}^x is not (${a * b})^x. Divide by ${a} first.`)]),
        };
      }
      const N = r.pick([6, 7, 10, 11, 12, 20]);
      const rhs = a * N + c;
      return {
        prompt: `Solve ${a} · ${b}^x${cst(c)} = ${rhs}. Give an exact answer.`,
        answer: exact(`log_${b}(${N})`, `log_${b}(${N})`),
        hints: ["Isolate the power first.", `${b}^x = ${N}. ${N} isn't a whole-number power of ${b}, so take log base ${b} of both sides.`],
        steps: [st("Isolate the power.", `${a} · ${b}^x = ${rhs - c}, so ${b}^x = ${N}`), st(`Take log base ${b}.`, `x = log_${b}(${N})`), st("Decimal check (change of base).", `x = {ln ${N}/ln ${b}} ≈ ${f2(Math.log(N) / Math.log(b))}`)],
      };
    }
    if (r.chance(0.5)) {
      const a = r.pick([2, 3, 4, 5]), k = r.pick([2, 3]), c = r.int(-6, 6), N = r.pick([3, 5, 6, 7, 10, 11]);
      const rhs = a * N + c;
      return {
        prompt: `Solve ${a}e^(${k}x)${cst(c)} = ${rhs}. Give an exact answer.`,
        answer: exact(`ln(${N})/${k}`, `{ln ${N}/${k}}`),
        hints: ["Isolate e^(kx) first.", `e^(${k}x) = ${N}. Take the natural log of both sides.`],
        steps: [st("Isolate.", `${a}e^(${k}x) = ${rhs - c}, so e^(${k}x) = ${N}`), st("Take ln.", `${k}x = ln ${N}`), st("Divide.", `x = {ln ${N}/${k}} ≈ ${f2(Math.log(N) / k)}`)],
      };
    }
    const [p, q] = pick2(r, [2, 3, 5, 7]);
    return {
      prompt: `Solve ${p}^(x + 1) = ${q}^x. Give an exact answer.`,
      answer: exact(`ln(${p})/(ln(${q})-ln(${p}))`, `{ln ${p}/ln ${q} − ln ${p}}`),
      hints: ["The bases are different and not powers of each other, so take ln of both sides.", `(x + 1) ln ${p} = x ln ${q}. Collect the x-terms.`],
      steps: [st("Take ln of both sides.", `(x + 1) ln ${p} = x ln ${q}`), st("Distribute.", `x ln ${p} + ln ${p} = x ln ${q}`), st("Collect x.", `ln ${p} = x(ln ${q} − ln ${p})`), st("Solve.", `x = {ln ${p}/ln ${q} − ln ${p}} ≈ ${f2(Math.log(p) / (Math.log(q) - Math.log(p)))}`)],
    };
  },
};

const solveLog: Skill = {
  id: "pc.explog.solve-log",
  title: "Solve logarithmic equations",
  topic: T,
  standards: ["PC.A.2.2"],
  prereqs: ["pc.explog.log-props"],
  lesson: {
    bigIdea: "Combine logs into a single log, rewrite in exponential form, solve, then check: any solution that makes a log's input zero or negative is extraneous.",
    explain: [
      "log_2(3x − 1) = 3 means 3x − 1 = 2^3 = 8, so **x = 3**.",
      "log_3(x) + log_3(x − 8) = 2: combine to log_3(x(x − 8)) = 2, so x^2 − 8x = 9, x^2 − 8x − 9 = 0, (x − 9)(x + 1) = 0.",
      "Check: x = −1 gives log_3(−1), which doesn't exist. Only **x = 9** works.",
    ],
    tip: "Always plug answers back into the ORIGINAL equation. Combining logs can create fake solutions.",
  },
  why: [
    { kind: "choice", prompt: "Why can solving log(x) + log(x − 3) = 1 produce an extraneous solution?", choices: ["Combining into log(x(x − 3)) allows negative x where x(x − 3) is positive, but log(x) itself isn't defined there.", "Because logs are always extraneous.", "Because the quadratic formula is unreliable.", "Because 1 isn't a log."], correct: 0, explain: "The combined equation has a bigger domain than the original. A negative x can make x(x − 3) positive even though log(x) is undefined." },
    { kind: "written", prompt: "Explain how to solve log_5(2x + 3) = 2.", keyIdeas: ["rewrite as 5^2 = 2x + 3", "25 = 2x + 3", "x = 11", "check 2(11) + 3 = 25 > 0"], exemplar: "The log equation means 5 to the 2nd power equals 2x + 3. So 2x + 3 = 25, 2x = 22, x = 11. Checking: 2(11) + 3 = 25 is positive and log_5(25) = 2." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 5, 10]), k = b === 10 ? r.int(1, 2) : r.int(1, b === 2 ? 5 : 3);
      const a = r.pick([1, 2, 3, 4]), x0 = r.int(-3, 12);
      const B = b ** k, c = B - a * x0;
      const inside = `${a === 1 ? "" : a}x${cst(c)}`;
      return {
        prompt: `Solve ${b === 10 ? "log" : `log_${b}`}(${inside}) = ${k}.`,
        answer: num(x0, { pre: "x = " }),
        hints: ["Rewrite in exponential form: base^(answer) = inside.", `${inside} = ${b}^${k} = ${B}.`],
        steps: [st("Exponential form.", `${inside} = ${b}^${k} = ${B}`), st("Solve.", `${a === 1 ? "" : a}x = ${B}${cst(-c)} = ${a * x0}${a === 1 ? "" : `, so x = ${ms(x0)}`}`), st("Check.", `${a === 1 ? "" : a + " · "}${sn(x0)}${cst(c)} = ${B} > 0 ✓`)],
        traps: traps(frac(x0), [trap(frac(b * k - c, a), `${b}^${k} means ${b} multiplied by itself ${k} times, not ${b} × ${k}.`), trap(frac(k ** b - c, a), "The base of the log is the base of the power.")]),
      };
    }
    if (lv === 2) {
      const [b, x0, d, k] = r.pick([[2, 4, 2, 3], [2, 8, 6, 4], [2, 4, 3, 2], [2, 8, 4, 5], [3, 9, 6, 3], [3, 3, 2, 1], [3, 9, 8, 2], [10, 20, 15, 2], [10, 10, 9, 1], [2, 16, 12, 6], [2, 16, 14, 5]] as const);
      const other = d - x0;
      const L = b === 10 ? "log" : `log_${b}`;
      return {
        prompt: `Solve ${L}(x) + ${L}(x − ${d}) = ${k}.`,
        answer: num(x0, { pre: "x = " }),
        hints: ["Combine the logs into one using the product rule.", `${L}(x(x − ${d})) = ${k}, so x^2 − ${d}x = ${b ** k}.`, "Solve the quadratic, then check each answer in the original equation."],
        steps: [st("Product rule.", `${L}(x(x − ${d})) = ${k}`), st("Exponential form.", `x^2 − ${d}x = ${b}^${k} = ${b ** k}`), st("Solve.", `x^2 − ${d}x − ${b ** k} = 0 → (x − ${x0})(x + ${-other}) = 0 → x = ${x0} or x = ${ms(other)}`), st("Check.", `x = ${ms(other)} would need ${L}(${ms(other)}), the log of a negative number, so it is extraneous. x = ${x0}: ${L}(${x0}) + ${L}(${x0 - d}) = ${k} ✓`)],
        traps: traps(frac(x0), [trap(other, `Check it in the original: ${L}(${ms(other)}) doesn't exist, so ${ms(other)} is extraneous.`)]),
      };
    }
    const [b, k] = r.pick([[2, 1], [2, 2], [3, 1], [5, 1], [2, 3], [3, 2]] as const);
    const B = b ** k, c = r.int(1, 5), x0 = c + r.int(1, 4), a = B * (x0 - c) - x0;
    const L = `log_${b}`;
    return {
      prompt: `Solve ${L}(${shiftText(-a)}) − ${L}(x − ${c}) = ${k}.`,
      answer: num(x0, { pre: "x = " }),
      hints: ["Combine using the quotient rule.", `${L}({${shiftText(-a)}/x − ${c}}) = ${k}, so {${shiftText(-a)}/x − ${c}} = ${B}.`, `Multiply both sides by (x − ${c}) and solve the linear equation.`],
      steps: [
        st("Quotient rule.", `${L}({${shiftText(-a)}/x − ${c}}) = ${k}`),
        st("Exponential form.", `{${shiftText(-a)}/x − ${c}} = ${B}`),
        st("Clear the fraction.", `${shiftText(-a)} = ${B}x − ${B * c}`),
        st("Solve.", `${ms(a)} + ${B * c} = ${B - 1}x, so x = {${a + B * c}/${B - 1}} = ${x0}`),
        st("Check.", `Inputs: ${x0 + a} and ${x0 - c}, both positive ✓`),
      ],
      traps: traps(frac(x0), [...(k === 1 ? [] : [trap(frac(a + k * c, k - 1), `The fraction equals ${b}^${k} = ${B}, not ${k}.`)])]),
    };
  },
};

const context: Skill = {
  id: "pc.explog.context",
  title: "Exponential and log equations in context",
  topic: T,
  standards: ["PC.F.4.4"],
  prereqs: ["pc.explog.model", "pc.explog.solve-exp"],
  lesson: {
    bigIdea: "Real questions like 'when will it reach…?' put the unknown in the exponent. Set the model equal to the target and solve with logs.",
    explain: [
      "Half-life: 400 mg of a medicine with a 6-hour half-life. When is 50 mg left? 400({1/2})^(t/6) = 50 → ({1/2})^(t/6) = {1/8} = ({1/2})^3, so t/6 = 3 and **t = 18 hours**.",
      "Continuous growth: 1000e^(0.05t) = 2000 → e^(0.05t) = 2 → t = {ln 2/0.05} ≈ 13.9 years.",
      "Log scales: decibels dB = 10 log({I/I_0}). Making a sound 100 times as intense adds 10 log(100) = **20 dB**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the doubling time of 1000e^(0.05t) not depend on the 1000?", choices: ["Setting it equal to 2000 and dividing by 1000 leaves e^(0.05t) = 2, which has no 1000 in it.", "Because 1000 is a round number.", "It does: bigger amounts double more slowly.", "Because e cancels the 1000."], correct: 0, explain: "Any starting amount doubles when the growth factor e^(0.05t) equals 2, so the doubling time is ln 2 / 0.05 for every starting amount." },
    { kind: "written", prompt: "pH = −log[H⁺]. Explain why a solution with pH 3 is 100 times as acidic as one with pH 5.", keyIdeas: ["[H⁺] = 10^(−pH)", "10^(−3) and 10^(−5)", "ratio 10^2 = 100"], exemplar: "From the formula, [H⁺] = 10^(−pH). So pH 3 means 10^(−3) and pH 5 means 10^(−5). Dividing, 10^(−3) ÷ 10^(−5) = 10^2 = 100, so the pH 3 solution has 100 times the hydrogen ion concentration." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const h = r.pick([3, 4, 5, 6, 8, 12]), n = r.int(2, 5), A0 = r.pick([200, 320, 400, 640, 800]);
      const A = A0 / 2 ** n;
      return {
        prompt: `A medicine has a half-life of ${h} hours. A patient's body has ${A0} mg. Using A(t) = ${A0}({1/2})^(t/${h}), after how many hours will ${A} mg remain?`,
        answer: num(n * h, { unit: " hours" }),
        hints: [`Divide: ({1/2})^(t/${h}) = {${A}/${A0}} = {1/${2 ** n}}.`, `{1/${2 ** n}} = ({1/2})^${n}, so t/${h} = ${n}.`],
        steps: [st("Set up.", `${A0}({1/2})^(t/${h}) = ${A}`), st("Divide.", `({1/2})^(t/${h}) = {1/${2 ** n}} = ({1/2})^${n}`), st("Match exponents.", `t/${h} = ${n}, so t = ${n * h} hours`)],
        traps: traps(frac(n * h), [trap(n, `${n} is the number of half-lives. Each one is ${h} hours.`), trap(h * A0 / A, "The amount halves each period; it doesn't decrease by a constant amount.")]),
      };
    }
    if (lv === 2) {
      const rate = r.pick([3, 4, 5, 6, 7, 8]), mult = r.pick([2, 3, 1.5]);
      const P = r.pick([1000, 2500, 5000]);
      const continuous = r.chance(0.5);
      const t = continuous ? Math.log(mult) / (rate / 100) : Math.log(mult) / Math.log(1 + rate / 100);
      const target = P * mult;
      const ans = round(t, 1);
      return {
        prompt: continuous
          ? `$${P} grows continuously at ${rate}% per year: A(t) = ${P}e^(${rate / 100}t). How many years until it reaches $${target}? Round to the nearest tenth.`
          : `$${P} earns ${rate}% interest compounded yearly: A(t) = ${P}(${1 + rate / 100})^t. How many years until it reaches $${target}? Round to the nearest tenth.`,
        answer: num(ans, { tolerance: 0.051, unit: " years" }),
        hints: [`Divide both sides by ${P}: ${continuous ? `e^(${rate / 100}t)` : `(${1 + rate / 100})^t`} = ${mult}.`, continuous ? "Take ln of both sides." : "Take log (or ln) of both sides and use the power rule."],
        steps: [
          st("Set up.", continuous ? `${P}e^(${rate / 100}t) = ${target}` : `${P}(${1 + rate / 100})^t = ${target}`),
          st("Divide.", continuous ? `e^(${rate / 100}t) = ${mult}` : `(${1 + rate / 100})^t = ${mult}`),
          st("Take logs.", continuous ? `${rate / 100}t = ln ${mult}` : `t · ln ${1 + rate / 100} = ln ${mult}`),
          st("Solve.", `t = ${continuous ? `{ln ${mult}/${rate / 100}}` : `{ln ${mult}/ln ${1 + rate / 100}}`} ≈ ${f1(t)} years`),
        ],
        traps: trapsTol(ans, 0.051, [trap(round(Math.log(mult) / (rate / 100), 1), "That's the continuous-growth time. This account compounds once a year."), trap(round((mult - 1) * 100 / rate, 1), "That's simple interest. Compound interest grows on the interest too.")]),
      };
    }
    if (r.chance(0.5)) {
      const k = r.int(1, 4), ratio = 10 ** k, base = r.pick([40, 50, 60, 70]);
      return {
        prompt: `Loudness in decibels is L = 10 log({I/I_0}). A conversation is ${base} dB. A sound ${ratio.toLocaleString("en-US")} times as intense is how many decibels?`,
        answer: num(base + 10 * k, { unit: " dB" }),
        hints: [`Multiplying the intensity by ${ratio.toLocaleString("en-US")} adds 10 log(${ratio.toLocaleString("en-US")}) decibels.`, `log(${ratio.toLocaleString("en-US")}) = ${k}.`],
        steps: [st("Product rule.", `10 log({${ratio}I/I_0}) = 10 log(${ratio}) + 10 log({I/I_0})`), st("Evaluate.", `10 log(${ratio}) = 10 · ${k} = ${10 * k}`), st("Add.", `${base} + ${10 * k} = ${base + 10 * k} dB`)],
        traps: traps(frac(base + 10 * k), [trap(base * ratio, "Decibels are a log scale: multiplying intensity adds decibels."), trap(base + k, `Remember the factor of 10: 10 log(${ratio}) = ${10 * k}.`)]),
      };
    }
    const p1 = r.int(2, 5), p2 = p1 + r.int(1, 3);
    return {
      prompt: `pH = −log[H⁺]. How many times greater is the hydrogen ion concentration [H⁺] of a solution with pH ${p1} than one with pH ${p2}?`,
      answer: num(10 ** (p2 - p1), { unit: " times" }),
      hints: ["Solve for [H⁺]: [H⁺] = 10^(−pH).", `Compare 10^(−${p1}) with 10^(−${p2}).`],
      steps: [st("Concentrations.", `pH ${p1}: 10^(−${p1}). pH ${p2}: 10^(−${p2}).`), st("Divide.", `{10^(−${p1})/10^(−${p2})} = 10^(${p2 - p1}) = ${10 ** (p2 - p1)}`)],
      traps: traps(frac(10 ** (p2 - p1)), [trap(p2 - p1, "pH is a log scale: each step of 1 is a factor of 10."), trap(2 * (p2 - p1), "Each pH unit multiplies the concentration by 10, not 2.")]),
    };
  },
};

export default [expFeatures, model, logFeatures, transform, logProps, solveExp, solveLog, context];
