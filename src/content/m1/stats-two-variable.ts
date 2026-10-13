// Unit 5: Two-variable statistics (NC.M1.S-ID.6, 6a, 6b, 6c, 7, 8, 9).
import { choice, num, trap, traps } from "../helpers";
import { fromDecimal } from "../../lib/rational";
import type { Rng } from "../../lib/rng";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, lsrl, trapsTol } from "./util";

const T = "m1-two-var-stats";

const r2 = (x: number) => Math.round(x * 100) / 100;
const r1 = (x: number) => Math.round(x * 10) / 10;
/** "2.5x + 40" / "−1.2x + 88" with decimals. */
const eqText = (m: number, b: number, v = "x") => `${f(m)}${v}${b < 0 ? " − " : " + "}${f(Math.abs(b))}`;

type Pt = { x: number; y: number };

interface Ctx { x: string; y: string; xn: string; yn: string; xs: [number, number]; m: [number, number]; b: [number, number]; xu: string; yu: string; slopeMean: string; intMean: string; noZero?: string }

const CTXS: Ctx[] = [
  { x: "Hours studied", y: "Test score", xn: "hours studied", yn: "test score", xs: [0, 10], m: [3, 6], b: [45, 60], xu: "hour of studying", yu: "points", slopeMean: "the predicted test score goes up about M points for each additional hour studied", intMean: "a student who studies 0 hours is predicted to score about B" },
  { x: "Temperature (°F, above 50)", y: "Smoothies sold", xn: "degrees above 50°F", yn: "smoothies sold", xs: [0, 40], m: [1.5, 3], b: [10, 30], xu: "degree", yu: "smoothies", slopeMean: "about M more smoothies are predicted to sell for each 1-degree increase", intMean: "at 50°F, about B smoothies are predicted to sell" },
  { x: "Age of car (years)", y: "Value (hundreds of $)", xn: "a car's age in years", yn: "its value in hundreds of dollars", xs: [0, 12], m: [-14, -8], b: [200, 260], xu: "year", yu: "hundred dollars", slopeMean: "the predicted value drops about M hundred dollars for each year of age", intMean: "a brand-new car (0 years) is predicted to be worth about B hundred dollars" },
  { x: "Hours of screen time per day", y: "Hours of sleep", xn: "daily hours of screen time", yn: "hours of sleep", xs: [1, 9], m: [-0.6, -0.3], b: [9, 10], xu: "hour of screen time", yu: "hours of sleep", slopeMean: "predicted sleep goes down about M hours for each additional hour of screen time", intMean: "someone with 0 hours of screen time is predicted to sleep about B hours" },
];

function scatterData(r: Rng, n: number, m: number, b: number, noise: number, x0 = 1, x1 = 12): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round((x0 + ((x1 - x0) * i) / (n - 1) + (r.next() - 0.5)) * 10) / 10;
    const y = Math.round((m * x + b + (r.next() * 2 - 1) * noise) * 10) / 10;
    pts.push({ x: Math.max(0, x), y });
  }
  return pts;
}

// ---------- describing scatter plots ----------

const scatterDescribe: Skill = {
  id: "m1.stat2.scatter",
  title: "Describe a scatter plot",
  topic: T,
  standards: ["NC.M1.S-ID.6"],
  prereqs: [],
  lesson: {
    bigIdea: "Describe an association by its direction (positive or negative), form (linear or curved) and strength (how tightly the points cluster around the pattern).",
    explain: [
      "**Positive:** as x increases, y tends to increase (points rise to the right). **Negative:** y tends to decrease.",
      "**Linear** means the points follow a straight-line pattern; **nonlinear** means they bend. **Strong** means the points stay close to the pattern; **weak** means they're scattered loosely around it.",
      "Worked example: hours of practice vs. free throws made, rising steadily with points close to a line: a **strong, positive, linear** association. Shoe size vs. GPA: no pattern at all: **no association**.",
    ],
    visual: { type: "scatter", points: [{ x: 1, y: 22 }, { x: 2, y: 25 }, { x: 3, y: 31 }, { x: 4, y: 33 }, { x: 5, y: 38 }, { x: 6, y: 40 }, { x: 7, y: 46 }, { x: 8, y: 49 }], xLabel: "Hours of practice", yLabel: "Free throws made" },
  },
  why: [
    { kind: "choice", prompt: "A scatter plot falls from left to right with points tightly packed. Why is it called a strong negative association?", choices: ["y tends to decrease as x increases (negative), and the points stay close to a line (strong).", "Because the y-values are negative numbers.", "Because the slope is greater than 1."], correct: 0, explain: "\"Negative\" describes direction, not the sign of the data values." },
    { kind: "written", prompt: "Explain the difference between a weak positive association and no association.", keyIdeas: ["weak positive: y tends to rise as x rises, but loosely", "no association: no upward or downward trend at all", "knowing x helps a little in the first case and not at all in the second"], exemplar: "In a weak positive association, y still tends to go up as x goes up, but the points are spread loosely around the trend. With no association there's no trend at all, so knowing x tells you nothing about y." },
  ],
  generate(r, lv) {
    const kinds = lv === 1 ? ["pos", "neg", "none"] : ["spos", "wpos", "sneg", "wneg", "curve", "none"];
    const kind = r.pick(kinds);
    const n = 12;
    let pts: Pt[];
    const mag = r.int(3, 6);
    if (kind === "pos" || kind === "spos") pts = scatterData(r, n, mag, 20, 3);
    else if (kind === "wpos") pts = scatterData(r, n, mag, 20, 18);
    else if (kind === "neg" || kind === "sneg") pts = scatterData(r, n, -mag, 20 + 13 * mag, 3);
    else if (kind === "wneg") pts = scatterData(r, n, -mag, 20 + 13 * mag, 18);
    else if (kind === "curve") pts = Array.from({ length: n }, (_, i) => { const x = i + 1; return { x, y: Math.round((70 - 1.6 * (x - 6.5) ** 2 + (r.next() - 0.5) * 4) * 10) / 10 }; });
    else pts = Array.from({ length: n }, (_, i) => ({ x: i + 1, y: r.int(20, 70) }));
    // Make sure "no association" really has a tiny correlation.
    if (kind === "none") { let k = 0; while (Math.abs(lsrl(pts).r) > 0.25 && k++ < 40) pts = Array.from({ length: n }, (_, i) => ({ x: i + 1, y: r.int(20, 70) })); }
    const pair = r.pick([["Hours practiced", "Points scored"], ["Days since planting", "Height (cm)"], ["Price ($)", "Units sold"], ["Minutes of exercise", "Resting heart rate"]]);
    const visual: Visual = { type: "scatter", points: pts, xLabel: pair[0], yLabel: pair[1] };
    const names: Record<string, string> = { pos: "Positive", neg: "Negative", none: "No association", spos: "Strong positive linear", wpos: "Weak positive linear", sneg: "Strong negative linear", wneg: "Weak negative linear", curve: "Nonlinear (curved)" };
    const fb: Record<string, string> = {
      pos: "Positive means the points rise from left to right.", neg: "Negative means the points fall from left to right.", none: "There is a clear trend here, so there is an association.",
      spos: "Check direction and how tightly the points hug a line.", wpos: "Check how tightly the points cluster.", sneg: "Check direction and how tightly the points hug a line.", wneg: "Check how tightly the points cluster.", curve: "The points follow a straight-line pattern, not a curve.",
    };
    const options = kinds.filter((k) => k !== kind);
    const pick = lv === 1 ? options : r.shuffle(options).slice(0, 3);
    return {
      prompt: lv === 1 ? "Which describes the association in the scatter plot?" : "Which best describes the association shown in the scatter plot?",
      visual,
      answer: choice(r, names[kind], pick.map((k) => [names[k], kind === "none" && k !== "curve" ? "The points show no upward or downward trend." : fb[k]] as [string, string])),
      hints: ["Read left to right: do the points tend to rise, fall, or neither?", lv === 1 ? "If there's no trend up or down, there's no association." : "Then ask: do they follow a straight line or a curve, and how closely?"],
      steps: [st("Direction.", kind === "none" ? "No consistent rise or fall." : kind === "curve" ? "The points rise, then fall." : kind.includes("pos") ? "Points rise to the right: positive." : "Points fall to the right: negative."), st("Form and strength.", kind === "none" ? "Scattered with no pattern: no association." : kind === "curve" ? "They bend: a nonlinear association." : kind.startsWith("w") ? "Roughly linear but loosely scattered: weak." : "Close to a straight line: strong and linear.")],
    };
  },
};

// ---------- using a regression line ----------

const regression: Skill = {
  id: "m1.stat2.regression",
  title: "Fit and use a regression line",
  topic: T,
  standards: ["NC.M1.S-ID.6a", "NC.M1.S-ID.7"],
  prereqs: ["m1.stat2.scatter"],
  lesson: {
    bigIdea: "The least-squares regression line ŷ = mx + b is the line of best fit; substitute an x-value to get a predicted y.",
    explain: [
      "Technology finds the line: on Desmos type y_1 ~ mx_1 + b with your data in a table; on a TI calculator use STAT → CALC → LinReg(ax+b).",
      "Worked example: the line ŷ = 4.2x + 51 predicts test scores from hours studied. For 6 hours: ŷ = 4.2(6) + 51 = 76.2 points.",
      "To find the x for a target y, solve: 80 = 4.2x + 51 gives x ≈ 6.9 hours.",
    ],
    tip: "The hat in ŷ means \"predicted\". Real data points are usually above or below the line.",
  },
  why: [
    { kind: "choice", prompt: "Why is the regression line called \"least squares\"?", choices: ["Of all lines, it makes the sum of the squared residuals as small as possible.", "Because it passes through the fewest points.", "Because its slope is the smallest possible."], correct: 0, explain: "It minimizes the total squared vertical distance from the points to the line." },
    { kind: "written", prompt: "A regression line predicts a score of 82 for a student who actually scored 75. Explain why that doesn't mean the line is wrong.", keyIdeas: ["the line describes the overall trend", "individual points vary around the line", "the difference is a residual"], exemplar: "The line describes the general trend, not each person exactly. Real students scatter above and below it; this student's score is 7 points below the prediction, which is just a residual of −7." },
  ],
  generate(r, lv) {
    const c = r.pick(CTXS);
    const m = r1(c.m[0] + r.next() * (c.m[1] - c.m[0]));
    const b = r1(c.b[0] + r.next() * (c.b[1] - c.b[0]));
    if (lv === 1) {
      const x = r.int(c.xs[0] + 1, c.xs[1]);
      const y = r2(m * x + b);
      return {
        prompt: `For data on ${c.xn} (x) and ${c.yn} (y), the regression line is ŷ = ${eqText(m, b)}. Predict y when x = ${x}.`,
        answer: num(fromDecimal(y), { tolerance: 0.01 }),
        hints: [`Substitute ${x} for x.`, `Multiply ${f(m)} × ${x}, then add ${f(b)}.`],
        steps: [st("Substitute.", `ŷ = ${f(m)}(${x}) + ${f(b)}`), st("Evaluate.", `${f(r2(m * x))} + ${f(b)} = ${f(y)}`)],
        traps: trapsTol(y, 0.01, [trap(fromDecimal(r2(m + b)), "Multiply the slope by x before adding."), trap(fromDecimal(r2(m * x)), `Don't forget to add the intercept, ${f(b)}.`)]),
      };
    }
    if (lv === 2) {
      const x = r.int(c.xs[0] + 2, c.xs[1]);
      const target = r1(m * x + b);
      const sol = r1((target - b) / m);
      return {
        prompt: `The regression line ŷ = ${eqText(m, b)} models ${c.yn} (y) from ${c.xn} (x). For what x does the model predict y = ${f(target)}? Round to the nearest tenth.`,
        answer: num(fromDecimal(sol), { tolerance: 0.1 }),
        hints: [`Set ${f(target)} = ${eqText(m, b)}.`, `Subtract ${f(b)}, then divide by ${f(m)}.`],
        steps: [st("Set up.", `${f(target)} = ${eqText(m, b)}`), st(`Subtract ${f(b)}.`, `${f(r1(target - b))} = ${f(m)}x`), st(`Divide by ${f(m)}.`, `x ≈ ${f(sol)}`)],
        traps: trapsTol(sol, 0.1, [trap(fromDecimal(r2(m * target + b)), "That's the prediction at x = " + f(target) + ". Here y is given; solve for x.")]),
      };
    }
    // Level 3: fit with technology, then predict.
    const xs = [1, 2, 3, 4, 5, 6];
    const mm = r.int(2, 6) * r.sign(), bb = mm < 0 ? r.int(55, 75) : r.int(20, 40);
    const pts = xs.map((x) => ({ x, y: mm * x + bb + r.int(-3, 3) }));
    const fit = lsrl(pts);
    const ms2 = r2(fit.m), bs2 = r2(fit.b);
    const xp = r.pick([8, 9, 10]);
    const pred = r1(ms2 * xp + bs2);
    return {
      prompt: `Use technology to find the least-squares regression line for the data (round the slope and intercept to the nearest hundredth). Then predict y when x = ${xp}, to the nearest tenth.`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...pts.map((p) => p.y)]] },
      answer: num(fromDecimal(pred), { tolerance: 0.15 }),
      hints: ["Enter the data in two lists (or a Desmos table) and run linear regression: Desmos y_1 ~ mx_1 + b, or LinReg(ax+b).", `Your line should have a slope near ${f(Math.round(fit.m))}.`, `Substitute x = ${xp} into your line.`],
      steps: [st("Run linear regression.", `ŷ ≈ ${eqText(ms2, bs2)} (r ≈ ${f(r2(fit.r))})`), st("Substitute.", `ŷ ≈ ${f(ms2)}(${xp}) + ${f(bs2)} ≈ ${f(pred)}`)],
    };
  },
};

// ---------- interpreting slope, intercept, and predictions ----------

const interpret: Skill = {
  id: "m1.stat2.interpret",
  title: "Interpret a linear model",
  topic: T,
  standards: ["NC.M1.S-ID.7"],
  prereqs: ["m1.stat2.regression"],
  lesson: {
    bigIdea: "The slope is the predicted change in y for each 1-unit increase in x; the intercept is the predicted y when x = 0. Predictions inside the data's x-range (interpolation) are more trustworthy than predictions far outside it (extrapolation).",
    explain: [
      "Model: ŷ = −12x + 240 for a car's value (hundreds of dollars) vs. age in years. Slope: the predicted value drops $1,200 per year. Intercept: a new car is predicted to be worth $24,000.",
      "Always say \"predicted\" and use the units of the context.",
      "If the data covered cars 1 to 10 years old, predicting for 25 years is **extrapolation**: the model gives −60, a negative value, which is impossible. The trend can't continue forever.",
      "Sometimes the intercept has no real meaning (a 0-foot-tall adult), because x = 0 is far outside the data.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is extrapolating far beyond the data risky?", choices: ["The pattern might change outside the range of the data, and the model has no evidence there.", "Because the slope changes when x is large.", "Extrapolation is never allowed in math."], correct: 0, explain: "The model only reflects the data it was built from." },
    { kind: "written", prompt: "A model predicts plant height from days since planting: ŷ = 1.5x + 2. Interpret the slope and the intercept.", keyIdeas: ["slope: predicted growth of 1.5 units per day", "intercept: predicted height of 2 units at day 0 (when planted)", "use 'predicted' and units"], exemplar: "The slope 1.5 means the plant is predicted to grow about 1.5 cm each day. The intercept 2 means the model predicts a height of 2 cm on the day it was planted (day 0)." },
  ],
  generate(r, lv) {
    const c = r.pick(CTXS);
    const m = r1(c.m[0] + r.next() * (c.m[1] - c.m[0]));
    const b = r1(c.b[0] + r.next() * (c.b[1] - c.b[0]));
    const eq = `ŷ = ${eqText(m, b)}`;
    const slopeRight = c.slopeMean.replace("M", f(Math.abs(m)));
    const intRight = c.intMean.replace("B", f(b));
    if (lv < 3) {
      const askSlope = lv === 1 ? true : r.chance(0.5);
      const right = askSlope ? slopeRight : intRight;
      const wrongs: [string, string][] = askSlope
        ? [[intRight, "That's the meaning of the intercept."], [`${c.yn} is always exactly ${f(Math.abs(m))} more than ${c.xn}`, "The slope is a rate of change, not a difference between x and y."], [`the predicted ${c.yn} is ${f(Math.abs(m))} when x is 1`, "That's not what slope measures: it's the change in ŷ per 1 unit of x."]]
        : [[slopeRight, "That's the meaning of the slope."], [`the ${c.xn} is ${f(b)} when y is 0`, "The intercept is a y-value at x = 0."], [`${c.yn} increases by ${f(b)} each time`, "A constant in the model is a starting value, not a rate."]];
      return {
        prompt: `A model for ${c.yn} (y) based on ${c.xn} (x) is ${eq}. What does the ${askSlope ? `slope, ${f(m)},` : `y-intercept, ${f(b)},`} mean?`,
        answer: choice(r, right.charAt(0).toUpperCase() + right.slice(1), wrongs.map(([w, fbk]) => [w.charAt(0).toUpperCase() + w.slice(1), fbk] as [string, string])),
        hints: [askSlope ? "Slope = change in ŷ for each increase of 1 in x." : "The y-intercept is the predicted value when x = 0.", "Use the units of the context."],
        steps: [st(askSlope ? "Slope." : "Intercept.", askSlope ? `${f(m)} ${c.yu} per ${c.xu}.` : `When x = 0, ŷ = ${f(b)}.`), st("In context.", right + ".")],
      };
    }
    const lo = c.xs[0] + 1, hi = c.xs[1];
    const far = r.chance(0.5);
    const xq = far ? hi * 3 : r.int(lo, hi);
    const yq = r2(m * xq + b);
    const right = far ? `Not reliable: x = ${xq} is far outside the data (x from ${lo} to ${hi}), so it's extrapolation` : `Reasonably reliable: x = ${xq} is inside the data's range (interpolation)`;
    return {
      prompt: `The model ${eq} was built from data with x-values from ${lo} to ${hi} (x = ${c.xn}). It predicts ŷ = ${f(yq)} when x = ${xq}. How reliable is this prediction?`,
      answer: choice(r, right, far
        ? [[`Reliable: the model works for any x`, "A model only reflects the range of the data it came from."], [`Reasonably reliable: x = ${xq} is inside the data's range (interpolation)`, `${xq} is outside ${lo} to ${hi}.`], ["Not reliable: predictions from a regression line are never useful", "Inside the data range, predictions are reasonable."]]
        : [[`Not reliable: x = ${xq} is far outside the data, so it's extrapolation`, `${xq} is between ${lo} and ${hi}.`], ["Not reliable: predictions from a regression line are never useful", "Inside the data range, predictions are reasonable."], ["Exactly correct: the actual value will be " + f(yq), "Predictions are estimates; actual values vary around the line."]]),
      hints: ["Compare the x-value with the range of x in the data.", "Inside the range is interpolation; far outside is extrapolation."],
      steps: [st("Data range.", `x from ${lo} to ${hi}.`), st("Compare.", far ? `${xq} is far beyond ${hi}: extrapolation, so the trend may not hold${yq < 0 ? ` (here it even predicts a negative value, ${f(yq)})` : ""}.` : `${xq} is within the range: interpolation, so the prediction is reasonable.`)],
    };
  },
};

// ---------- residuals ----------

const residuals: Skill = {
  id: "m1.stat2.residuals",
  title: "Calculate residuals",
  topic: T,
  standards: ["NC.M1.S-ID.6b"],
  prereqs: ["m1.stat2.regression"],
  lesson: {
    bigIdea: "Residual = actual y − predicted y. A positive residual means the point is above the line; negative means below.",
    explain: [
      "Line: ŷ = 2.5x + 10. The data point (6, 28) has predicted ŷ = 2.5(6) + 10 = 25, so its residual is 28 − 25 = **3**: the point is 3 units above the line.",
      "The order matters: always actual minus predicted.",
      "Residuals near 0 mean the line predicts well for that point.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 10, yMin: 0, yMax: 40, xStep: 1, yStep: 5, curves: [{ expr: "2.5x+10" }], points: [{ x: 6, y: 28, label: "(6, 28)" }, { x: 6, y: 25, open: true, label: "ŷ = 25" }] },
  },
  why: [
    { kind: "choice", prompt: "A point has residual −4. What does that tell you?", choices: ["The actual value is 4 less than the line predicts: the point is below the line.", "The point is 4 units above the line.", "The line's slope is −4."], correct: 0, explain: "Residual = actual − predicted; negative means actual is smaller." },
    { kind: "written", prompt: "Explain why the residuals of a least-squares line add up to (about) zero.", keyIdeas: ["some points are above the line (positive residuals) and some below (negative)", "the best-fit line balances them", "so they cancel"], exemplar: "The least-squares line runs through the middle of the data, with some points above it and some below. The positive residuals of the points above balance the negative residuals below, so the total is zero." },
  ],
  generate(r, lv) {
    const m = r.pick([1.5, 2, 2.5, 3, 3.5, 4, -1.5, -2.5]);
    const b = r.int(10, 40) + (m < 0 ? 40 : 0);
    const x = r.int(2, 10);
    const pred = m * x + b;
    const res = r.nonzero(-12, 12) / 2;
    const actual = pred + res;
    if (lv < 3) {
      const tableX = lv === 2 ? [x - 1, x, x + 1, x + 2].map((v) => Math.max(1, v)) : [x];
      const rows = tableX.map((xx) => (xx === x ? actual : m * xx + b + r.nonzero(-8, 8) / 2));
      return {
        prompt: lv === 1 ? `The regression line is ŷ = ${eqText(m, b)}. The data point (${x}, ${f(actual)}) is in the data set. What is its residual?` : `The regression line for the data in the table is ŷ = ${eqText(m, b)}. What is the residual for x = ${x}?`,
        visual: lv === 2 ? { type: "table", headers: ["x", ...tableX.map(String)], rows: [["y", ...rows.map((v) => f(v))]] } : undefined,
        answer: num(fromDecimal(res)),
        hints: [`Predicted: ŷ = ${f(m)}(${x}) + ${b}.`, "Residual = actual − predicted."],
        steps: [st("Predicted value.", `ŷ = ${f(m)}(${x}) + ${b} = ${f(pred)}`), st("Residual.", `${f(actual)} − ${f(pred)} = ${f(res)}`), st("Meaning.", res > 0 ? "The point is above the line." : "The point is below the line.")],
        traps: traps(fromDecimal(res), [trap(fromDecimal(-res), "Residual is actual minus predicted, not predicted minus actual."), trap(fromDecimal(pred), "That's the predicted value. Subtract it from the actual value.")]),
      };
    }
    return {
      prompt: `A regression line is ŷ = ${eqText(m, b)}. A data point at x = ${x} has residual ${f(res)}. What is its actual y-value?`,
      answer: num(fromDecimal(actual)),
      hints: ["Residual = actual − predicted, so actual = predicted + residual.", `Predicted at x = ${x}: ${f(m)}(${x}) + ${b}.`],
      steps: [st("Predicted value.", `ŷ = ${f(pred)}`), st("Actual = predicted + residual.", `${f(pred)} + ${res < 0 ? `(${f(res)})` : f(res)} = ${f(actual)}`)],
      traps: traps(fromDecimal(actual), [trap(fromDecimal(pred - res), "Actual = predicted + residual. You subtracted.")]),
    };
  },
};

// ---------- residual plots ----------

const residualPlot: Skill = {
  id: "m1.stat2.residual-plot",
  title: "Judge fit with a residual plot",
  topic: T,
  standards: ["NC.M1.S-ID.6b", "NC.M1.S-ID.8"],
  prereqs: ["m1.stat2.residuals"],
  lesson: {
    bigIdea: "A residual plot graphs each residual against x. Random scatter around 0 means a linear model fits; a clear pattern (like a U shape) means it doesn't.",
    explain: [
      "If a line fits well, the leftovers (residuals) should look like random noise above and below 0, with no trend.",
      "A U-shape or arch means the data curve: the line is too high in some places and too low in others in a systematic way. Try a nonlinear model.",
      "Residuals that grow farther from 0 as x increases (a fan shape) mean predictions get less reliable for larger x.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 12, yMin: -5, yMax: 5, hlines: [{ y: 0 }], points: [{ x: 1, y: 3.5 }, { x: 2, y: 1.6 }, { x: 3, y: 0.1 }, { x: 4, y: -1.2 }, { x: 5, y: -2.1 }, { x: 6, y: -2.4 }, { x: 7, y: -2.2 }, { x: 8, y: -1.3 }, { x: 9, y: 0 }, { x: 10, y: 1.7 }, { x: 11, y: 3.6 }] },
  },
  why: [
    { kind: "choice", prompt: "Why does a U-shaped residual plot mean a line is a poor model?", choices: ["The line misses in a predictable pattern: too low at the ends and too high in the middle, so the data are curved.", "Because some residuals are negative.", "Because the residuals add to zero."], correct: 0, explain: "A good model leaves only random error." },
    { kind: "written", prompt: "A scatter plot looks fairly linear and r = 0.93, but the residual plot shows a clear curve. Explain what you should conclude.", keyIdeas: ["a high r alone doesn't prove the relationship is linear", "the residual pattern shows systematic error", "a nonlinear model would fit better"], exemplar: "Even with r = 0.93, the curved residual plot shows the line misses in a systematic way, so the relationship is really curved. A nonlinear model (like exponential or quadratic) would fit better than the line." },
  ],
  generate(r, lv) {
    const kind = lv === 1 ? r.pick(["random", "curve"]) : r.pick(["random", "curve", "fan"]);
    const pts = Array.from({ length: 12 }, (_, i) => {
      const x = i + 1;
      const y = kind === "random" ? (r.next() * 2 - 1) * 3 : kind === "curve" ? (r.chance(0.5) ? 1 : -1) * 0 + 0.3 * (x - 6.5) ** 2 - 3.2 + (r.next() - 0.5) * 0.8 : (r.next() < 0.5 ? -1 : 1) * (0.3 + 0.4 * x * r.next());
      return { x, y: Math.round(y * 10) / 10 };
    });
    const visual: Visual = { type: "plot", xMin: 0, xMax: 13, yMin: -6, yMax: 6, hlines: [{ y: 0 }], points: pts };
    const right = kind === "random" ? "Yes: the residuals are scattered randomly around 0 with no pattern" : kind === "curve" ? "No: the residuals form a curved pattern, so the data are not linear" : "Use caution: the residuals spread out as x increases, so predictions get less reliable for large x";
    const all = ["Yes: the residuals are scattered randomly around 0 with no pattern", "No: the residuals form a curved pattern, so the data are not linear", "Use caution: the residuals spread out as x increases, so predictions get less reliable for large x", "No: some residuals are negative, so the line is wrong"];
    return {
      prompt: `The residual plot for a linear model is shown. Is a linear model appropriate for the data?`,
      visual,
      answer: choice(r, right, all.filter((a) => a !== right && (lv > 1 || !a.startsWith("Use caution"))).map((a) => [a, a.includes("negative") ? "Negative residuals are normal: about half the points should be below the line." : "Look again at the overall shape of the residuals."] as [string, string])),
      hints: ["A good linear fit leaves residuals that look like random noise around 0.", "Look for a shape: a U or arch, or a widening fan."],
      steps: [st("Look for a pattern.", kind === "random" ? "Points bounce above and below 0 with no shape." : kind === "curve" ? "The residuals are positive at the ends and negative in the middle: a U-shape." : "The residuals start close to 0 and spread farther out as x grows."), st("Conclude.", right + ".")],
    };
  },
};

// ---------- correlation coefficient ----------

const correlation: Skill = {
  id: "m1.stat2.correlation",
  title: "Correlation coefficient r",
  topic: T,
  standards: ["NC.M1.S-ID.8"],
  prereqs: ["m1.stat2.scatter"],
  lesson: {
    bigIdea: "The correlation coefficient r (from −1 to 1) measures the direction and strength of a LINEAR relationship.",
    explain: [
      "r near 1: strong positive linear. r near −1: strong negative linear. r near 0: little or no linear relationship.",
      "Strength depends on how close |r| is to 1, not on the sign. r = −0.91 is a stronger relationship than r = 0.75.",
      "Technology gives r along with the regression line (in Desmos it shows with y_1 ~ mx_1 + b; on a TI, turn DiagnosticOn).",
      "r only measures linear patterns: a perfect U-shape can have r ≈ 0.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Which shows the stronger linear relationship: r = −0.88 or r = 0.62?", choices: ["r = −0.88, because |−0.88| is closer to 1.", "r = 0.62, because it's positive.", "They are equally strong."], correct: 0, explain: "The sign shows direction; the size shows strength." },
    { kind: "written", prompt: "A data set follows a perfect U-shaped curve, yet r is close to 0. Explain how that can happen.", keyIdeas: ["r measures only linear association", "the U-shape has a strong but nonlinear pattern", "the rising and falling halves cancel in the linear measure"], exemplar: "r only measures how well a straight line fits. A U-shape falls on one side and rises on the other, so there's no overall linear trend and r is near 0, even though the variables are strongly related in a curved way." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const targets = [{ r: 0.95, m: 4, noise: 2 }, { r: 0.5, m: 3, noise: 16 }, { r: -0.95, m: -4, noise: 2 }, { r: -0.5, m: -3, noise: 16 }, { r: 0, m: 0, noise: 0 }];
      const t = r.pick(targets);
      let pts = t.m === 0 ? Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: r.int(20, 70) })) : scatterData(r, 12, t.m, t.m > 0 ? 20 : 75, t.noise);
      let k = 0;
      const ok = () => { const rr = lsrl(pts).r; return Math.abs(rr - t.r) < 0.2; };
      while (!ok() && k++ < 60) pts = t.m === 0 ? Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: r.int(20, 70) })) : scatterData(r, 12, t.m, t.m > 0 ? 20 : 75, t.noise);
      const actual = r2(lsrl(pts).r);
      const label = (v: number) => (v === 0 ? "0.02" : f(v).replace("-", "−"));
      return {
        prompt: "Which value is closest to the correlation coefficient r for the data shown?",
        visual: { type: "scatter", points: pts, xLabel: "x", yLabel: "y" },
        answer: choice(r, `r = ${label(t.r)}`, targets.filter((o) => o.r !== t.r).map((o) => [`r = ${label(o.r)}`, o.r * t.r < 0 ? "Check the direction: do the points rise or fall?" : "Check how tightly the points follow a line."] as [string, string]), true),
        hints: ["Direction: rising points mean positive r; falling mean negative.", "Strength: tightly packed along a line means |r| is close to 1."],
        steps: [st("Direction.", t.r > 0 ? "Points rise: r > 0." : t.r < 0 ? "Points fall: r < 0." : "No trend: r ≈ 0."), st("Strength.", `${Math.abs(t.r) > 0.9 ? "Very close to a line" : Math.abs(t.r) > 0.3 ? "A loose linear trend" : "No linear pattern"} (actual r ≈ ${f(actual)}).`)],
      };
    }
    if (lv === 2) {
      const c = r.pick(CTXS);
      const sign = c.m[0] > 0 ? 1 : -1;
      const val = r.pick([0.92, 0.85, 0.35, 0.18]) * sign;
      const strength = Math.abs(val) > 0.7 ? "strong" : Math.abs(val) > 0.3 ? "weak" : "very weak";
      const dir = sign > 0 ? "positive" : "negative";
      const right = `A ${strength} ${dir} linear relationship: as ${c.xn} increases, ${c.yn} tends to ${sign > 0 ? "increase" : "decrease"}`;
      return {
        prompt: `For data on ${c.xn} and ${c.yn}, r = ${f(val)}. Which interpretation is correct?`,
        answer: choice(r, right, [
          [`A ${strength} ${sign > 0 ? "negative" : "positive"} linear relationship: as ${c.xn} increases, ${c.yn} tends to ${sign > 0 ? "decrease" : "increase"}`, "The sign of r gives the direction."],
          [`A ${strength === "strong" ? "weak" : "strong"} ${dir} linear relationship`, "Strength comes from how close |r| is to 1."],
          [`${c.x} causes ${c.yn} to ${sign > 0 ? "increase" : "decrease"}`, "Correlation alone doesn't show causation."],
        ]),
        hints: ["The sign of r tells the direction.", "|r| near 1 is strong; near 0 is weak."],
        steps: [st("Direction.", `r is ${dir}.`), st("Strength.", `|r| = ${f(Math.abs(val))}, so ${strength}.`)],
      };
    }
    const vals = r.shuffle([0.81, -0.94, 0.12, -0.47, 0.67, -0.73, 0.9]).slice(0, 4);
    const best = vals.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a));
    return {
      prompt: "Four data sets have these correlation coefficients. Which shows the strongest linear relationship?",
      answer: choice(r, `r = ${f(best)}`, vals.filter((v) => v !== best).map((v) => [`r = ${f(v)}`, v > 0 && best < 0 ? "Strength ignores the sign: compare |r|." : "Compare how close each |r| is to 1."] as [string, string])),
      hints: ["Strength depends on |r|, the size without the sign.", "The closest to 1 or −1 wins."],
      steps: [st("Take absolute values.", vals.map((v) => `|${f(v)}| = ${f(Math.abs(v))}`).join(", ")), st("Largest.", `r = ${f(best)} is closest to ±1.`)],
    };
  },
};

// ---------- correlation vs causation ----------

const SCENARIOS = [
  { text: "Towns with more ice cream sales also have more drownings.", lurk: "Hot weather increases both ice cream sales and swimming." },
  { text: "Students who own more books tend to have higher test scores.", lurk: "Family resources and reading habits could affect both." },
  { text: "Cities with more firefighters have more fire damage.", lurk: "Bigger cities have both more firefighters and more fires." },
  { text: "People who drink more coffee have more wrinkles.", lurk: "Age could affect both coffee drinking and wrinkles." },
  { text: "Kids with bigger shoe sizes have better reading scores.", lurk: "Older kids have bigger feet and read better." },
  { text: "Phones with bigger screens get higher customer ratings.", lurk: "Bigger-screen phones are often newer, more expensive models with better features overall." },
];

const causation: Skill = {
  id: "m1.stat2.causation",
  title: "Correlation vs. causation",
  topic: T,
  standards: ["NC.M1.S-ID.9"],
  prereqs: ["m1.stat2.correlation"],
  lesson: {
    bigIdea: "A strong correlation shows that two variables move together, not that one causes the other. Only a well-designed experiment can show cause and effect.",
    explain: [
      "Ice cream sales and sunburns are positively correlated, but ice cream doesn't cause sunburn. A **lurking variable**, hot sunny weather, drives both.",
      "Other explanations for a correlation: coincidence, a lurking variable, or the cause running the other way.",
      "To test causation, run a randomized experiment: randomly assign subjects to groups so the only systematic difference is the treatment.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can't an observational study with r = 0.9 prove causation?", choices: ["A lurking variable could be causing both variables to change.", "Because r must be exactly 1 to prove causation.", "Because 0.9 is a weak correlation."], correct: 0, explain: "Without random assignment, other factors can explain the link." },
    { kind: "written", prompt: "Hours of video games played and grades are negatively correlated among students. Explain why this doesn't prove gaming lowers grades, and describe how you could test it.", keyIdeas: ["correlation isn't causation", "a lurking variable (like time spent studying or sleep) might explain both", "a randomized experiment assigning gaming time could test cause"], exemplar: "The correlation could come from something else, like students who study less having more free time for games. To test cause, randomly assign students to different amounts of gaming time and compare grades; random assignment balances out other factors." },
  ],
  generate(r, lv) {
    const sc = r.pick(SCENARIOS);
    if (lv < 3) {
      return {
        prompt: `A study finds a strong positive correlation: ${sc.text} Which conclusion is best?`,
        answer: choice(r, "The variables are associated, but this doesn't show that one causes the other", [["One variable causes the other because the correlation is strong", "Strength doesn't prove causation."], ["There is no relationship between the variables", "A strong correlation does show an association."], ["Reducing one variable will definitely reduce the other", "That would require a cause-and-effect relationship."]]),
        hints: ["Is this an experiment with random assignment, or an observation of data?", "Could something else explain both variables?"],
        steps: [st("Correlation shows association.", "The two variables tend to increase together."), st("Look for a lurking variable.", sc.lurk), st("Conclude.", "Association, not proof of causation.")],
      };
    }
    return {
      prompt: `${sc.text} Which is the most likely explanation for this correlation?`,
      answer: choice(r, sc.lurk, r.shuffle(SCENARIOS.filter((s) => s !== sc)).slice(0, 2).map((s) => [s.lurk, "That explanation belongs to a different situation."] as [string, string]).concat([["The first variable directly causes the second", "Look for a third factor that drives both."]])),
      hints: ["Think of a third variable that could make both go up together.", "That's called a lurking (confounding) variable."],
      steps: [st("Find a lurking variable.", sc.lurk), st("Conclude.", "The correlation is real, but it doesn't show direct causation.")],
    };
  },
};

// ---------- exponential models ----------

const expModel: Skill = {
  id: "m1.stat2.exp-model",
  title: "Exponential regression models",
  topic: T,
  standards: ["NC.M1.S-ID.6c", "NC.M1.F-LE.5"],
  prereqs: ["m1.stat2.regression"],
  lesson: {
    bigIdea: "When data grow (or shrink) by a roughly constant percent, fit an exponential model ŷ = a·b^x with technology and use it like a regression line.",
    explain: [
      "Desmos: y_1 ~ a·b^(x_1). TI: STAT → CALC → ExpReg. The output gives a (starting value) and b (growth factor).",
      "Worked example: followers ŷ = 250(1.18)^x after x weeks. Prediction for week 6: 250(1.18)^6 ≈ 675. The factor 1.18 means about 18% growth per week.",
      "If b < 1 the quantity decays: b = 0.92 means an 8% decrease per time period.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 8, yMin: 0, yMax: 1000, xStep: 1, yStep: 100, curves: [{ expr: "250(1.18)^x" }], points: [{ x: 0, y: 250 }, { x: 2, y: 340 }, { x: 4, y: 495 }, { x: 6, y: 690 }] },
  },
  why: [
    { kind: "choice", prompt: "Why would an exponential model fit data that grow by about 10% each year better than a line?", choices: ["A line adds the same amount each year, but 10% growth adds more each year as the total grows.", "Because exponential models always have higher r.", "Because lines can't model growth."], correct: 0, explain: "Constant percent change means multiplying, not adding." },
    { kind: "written", prompt: "A model for a phone's value is ŷ = 900(0.8)^x after x years. Explain what 900 and 0.8 mean.", keyIdeas: ["900: predicted value when new (x = 0)", "0.8: each year the value is 80% of the year before", "that is a 20% decrease per year"], exemplar: "900 is the predicted value in dollars when the phone is new (x = 0). The factor 0.8 means each year it keeps 80% of its value, so it loses about 20% per year." },
  ],
  generate(r, lv) {
    const ctx = r.pick([
      { what: "followers", subj: "The number of followers", per: "week", a: [200, 400], g: [1.08, 1.25] },
      { what: "bacteria (thousands)", subj: "The number of bacteria", per: "hour", a: [5, 20], g: [1.2, 1.5] },
      { what: "the value of a laptop (dollars)", subj: "The laptop's value", per: "year", a: [800, 1200], g: [0.7, 0.88] },
    ]);
    const a = Math.round(ctx.a[0] + r.next() * (ctx.a[1] - ctx.a[0]));
    const b = r2(ctx.g[0] + r.next() * (ctx.g[1] - ctx.g[0]));
    if (lv === 1) {
      const x = r.int(2, 6);
      const y = r1(a * b ** x);
      return {
        prompt: `An exponential model for ${ctx.what} after x ${ctx.per}s is ŷ = ${a}(${f(b)})^x. Predict the value when x = ${x}, to the nearest tenth.`,
        answer: num(fromDecimal(y), { tolerance: Math.max(0.15, y * 0.002) }),
        hints: [`Substitute x = ${x}: ${a}(${f(b)})^${x}.`, "Raise the base to the power first, then multiply by " + a + "."],
        steps: [st("Substitute.", `ŷ = ${a}(${f(b)})^${x}`), st("Evaluate.", `(${f(b)})^${x} ≈ ${f(Math.round(b ** x * 10000) / 10000)}, × ${a} ≈ ${f(y)}`)],
        traps: trapsTol(y, Math.max(0.15, y * 0.002), [trap(fromDecimal(r1(a * b * x)), "The exponent means multiplying by b repeatedly, not multiplying by x.")]),
      };
    }
    if (lv === 2) {
      const pct = Math.round(Math.abs(b - 1) * 100);
      const grow = b > 1;
      const right = `${ctx.subj} ${grow ? "increases" : "decreases"} by about ${pct}% per ${ctx.per}`;
      return {
        prompt: `An exponential model for ${ctx.what} after x ${ctx.per}s is ŷ = ${a}(${f(b)})^x. What does ${f(b)} tell you?`,
        answer: choice(r, right, [[`${ctx.subj} ${grow ? "decreases" : "increases"} by about ${pct}% per ${ctx.per}`, grow ? "b > 1 means growth." : "b < 1 means decay."], [`${ctx.subj} changes by ${f(b)} each ${ctx.per}`, "b is a multiplier, not an amount added."], [`${ctx.subj} starts at ${f(b)}`, `The starting value is a = ${a}.`]]),
        hints: ["b is the factor the quantity is multiplied by each period.", "b = 1 + rate for growth, or 1 − rate for decay."],
        steps: [st("Compare b with 1.", `${f(b)} ${grow ? ">" : "<"} 1, so it's ${grow ? "growth" : "decay"}.`), st("Find the percent.", `|${f(b)} − 1| = ${f(r2(Math.abs(b - 1)))} = ${pct}% per ${ctx.per}.`)],
      };
    }
    const xs = [0, 1, 2, 3, 4, 5];
    const ys = xs.map((x) => Math.round(a * b ** x * (1 + (r.next() - 0.5) * 0.06)));
    const ln = lsrl(xs.map((x, i) => ({ x, y: Math.log(ys[i]) })));
    const bFit = r2(Math.exp(ln.m));
    return {
      prompt: `Use technology to fit an exponential model ŷ = a·b^x to the data. What is b, rounded to the nearest hundredth?`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...ys]] },
      answer: num(fromDecimal(bFit), { tolerance: 0.011 }),
      hints: ["Use exponential regression: Desmos y_1 ~ a·b^(x_1), or ExpReg on a TI.", "Check: the ratio of consecutive y-values should be close to b.", `For example, ${ys[1]} ÷ ${ys[0]} ≈ ${f(r2(ys[1] / ys[0]))}.`],
      steps: [st("Run exponential regression.", `ŷ ≈ ${f(Math.round(Math.exp(ln.b)))}(${f(bFit)})^x`), st("Read b.", `b ≈ ${f(bFit)}, ${bFit > 1 ? "growth" : "decay"} of about ${Math.round(Math.abs(bFit - 1) * 100)}% per step.`)],
    };
  },
};

export default [scatterDescribe, regression, interpret, residuals, residualPlot, correlation, causation, expModel];
