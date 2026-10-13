// Unit 5: Regression with nonlinear models and residuals (NC.M4.AF.5).
import { choice, expr, ms, num, poly, polyExpr, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { PEOPLE, dec, rnd, tolTraps } from "./util";

const T = "m4-regression";

type Shape = "linear" | "quadratic" | "exponential" | "logarithmic" | "sinusoidal";
const SHAPE_TEXT: Record<Shape, string> = {
  linear: "Linear: y = ax + b",
  quadratic: "Quadratic: y = ax^2 + bx + c",
  exponential: "Exponential: y = a·b^x",
  logarithmic: "Logarithmic: y = a + b·ln(x)",
  sinusoidal: "Sinusoidal: y = a·sin(bx + c) + d",
};
const SHAPE_WHY: Record<Shape, string> = {
  linear: "The points fall along a straight line with a steady rate of change.",
  quadratic: "The points rise then fall (or fall then rise) around a turning point, like a parabola.",
  exponential: "The points grow slowly at first, then faster and faster: equal steps in x multiply y.",
  logarithmic: "The points rise quickly at first, then level off but keep slowly increasing.",
  sinusoidal: "The points go up and down in a repeating cycle.",
};

function shapeData(r: { int: (a: number, b: number) => number }, s: Shape): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const noise = (scale: number) => (r.int(-10, 10) / 10) * scale;
  for (let i = 0; i < 12; i++) {
    const x = s === "logarithmic" ? 1 + i * 1.5 : i;
    let y: number;
    if (s === "linear") y = 4 + 1.6 * x + noise(0.8);
    else if (s === "quadratic") y = -0.45 * (x - 5.5) ** 2 + 16 + noise(0.7);
    else if (s === "exponential") y = 1.2 * 1.38 ** x + noise(0.4 + 0.03 * 1.38 ** x);
    else if (s === "logarithmic") y = 2 + 4 * Math.log(x) + noise(0.5);
    else y = 8 + 4 * Math.sin((Math.PI * x) / 3) + noise(0.5);
    out.push({ x, y: rnd(y, 1) });
  }
  return out;
}

const chooseModel: Skill = {
  id: "m4.reg.choose-model",
  title: "Choose a regression model",
  topic: T,
  standards: ["NC.M4.AF.5.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Before running a regression, look at the shape of the data and the context. The model family should match both.",
    explain: [
      "Straight trend → linear. Up-then-down → quadratic. Speeds up by multiplying → exponential. Shoots up then levels off → logarithmic. Repeats in cycles → sinusoidal.",
      "In a table with equal x-steps: constant first differences → linear, constant second differences → quadratic, constant ratios → exponential.",
      "Then use technology (a graphing calculator or Desmos) to find the best-fit equation of that type, and check its residuals.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 12, yMin: 0, yMax: 14, xStep: 2, yStep: 2, points: [{ x: 0, y: 8 }, { x: 1, y: 11.4 }, { x: 2, y: 11.5 }, { x: 3, y: 8.1 }, { x: 4, y: 4.5 }, { x: 5, y: 4.6 }, { x: 6, y: 8.2 }, { x: 7, y: 11.3 }, { x: 8, y: 11.6 }, { x: 9, y: 7.9 }, { x: 10, y: 4.4 }, { x: 11, y: 4.7 }] },
  },
  why: [
    { kind: "choice", prompt: "Why isn't a high r² enough to pick a model?", choices: ["A model can fit the data you have and still have the wrong shape, so its predictions outside the data fail.", "r² is always 1 for nonlinear models.", "A high r² always means the model is perfect."], correct: 0, explain: "Check the shape, the residual plot and the context too." },
    { kind: "written", prompt: "Hours of daylight are recorded on the 1st of each month for two years. Explain which type of regression you'd use and why.", keyIdeas: ["daylight goes up and down each year", "the pattern repeats every 12 months", "so a sinusoidal model"], exemplar: "Daylight rises to a peak in summer and drops to a low in winter, then repeats every year. A repeating up-and-down pattern calls for a sinusoidal regression with a period of about 12 months." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const kind = r.pick(["linear", "quadratic", "exponential"] as Shape[]);
      const xs = [0, 1, 2, 3, 4, 5];
      let ys: number[];
      if (kind === "linear") { const m = r.nonzero(-6, 9), b = r.int(5, 40); ys = xs.map((x) => m * x + b); }
      else if (kind === "quadratic") { const a = r.pick([1, 2, -1, -2]), b = r.int(-3, 8), c = r.int(10, 30); ys = xs.map((x) => a * x * x + b * x + c); }
      else { const a = r.pick([2, 3, 5, 10]), b = r.pick([2, 3]); ys = xs.map((x) => a * b ** x); }
      const d1 = ys.slice(1).map((y, i) => y - ys[i]);
      const d2 = d1.slice(1).map((d, i) => d - d1[i]);
      return {
        prompt: "Which type of regression model fits the data in the table exactly?",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...ys]] },
        answer: choice(r, SHAPE_TEXT[kind], (["linear", "quadratic", "exponential", "logarithmic"] as Shape[]).filter((s) => s !== kind).map((s) => [SHAPE_TEXT[s], s === "logarithmic" ? "A log model can't use x = 0, and its differences shrink." : `Check the ${s === "linear" ? "first differences" : s === "quadratic" ? "second differences" : "ratios"}: they aren't constant.`] as [string, string])),
        hints: ["Compute the first differences (y_(n+1) − y_n). Are they constant?", "If not, try second differences, then ratios."],
        steps: [
          st("First differences.", d1.map(ms).join(", ")),
          ...(kind === "linear" ? [] : [st("Second differences.", d2.map(ms).join(", "))]),
          ...(kind === "exponential" ? [st("Ratios.", ys.slice(1).map((y, i) => `${y}/${ys[i]} = ${dec(y / ys[i])}`).join(", "))] : []),
          st("Conclusion.", kind === "linear" ? "Constant first differences → linear." : kind === "quadratic" ? "Constant second differences → quadratic." : "Constant ratios → exponential."),
        ],
      };
    }
    const pool: Shape[] = lv === 1 ? ["linear", "quadratic", "exponential"] : ["linear", "quadratic", "exponential", "logarithmic", "sinusoidal"];
    const kind = r.pick(pool);
    const pts = shapeData(r, kind);
    const ys = pts.map((p) => p.y);
    const vis: Visual = { type: "plot", xMin: 0, xMax: Math.ceil(Math.max(...pts.map((p) => p.x))) + 1, yMin: Math.min(0, Math.floor(Math.min(...ys)) - 1), yMax: Math.ceil(Math.max(...ys)) + 2, xStep: 1, points: pts };
    const ctx: Record<Shape, string> = {
      linear: "A scatterplot shows a streamer's total hours of content (y) after x weeks.",
      quadratic: "A scatterplot shows the height (y, in meters) of a drone during a test flight x seconds after launch.",
      exponential: "A scatterplot shows the number of views (y, in thousands) of a video x days after it was posted.",
      logarithmic: "A scatterplot shows a player's skill rating (y) after x hours of practice.",
      sinusoidal: "A scatterplot shows the water level (y, in feet) at a dock x hours after midnight.",
    };
    return {
      prompt: `${ctx[kind]} Which type of regression is most appropriate?`,
      visual: vis,
      answer: choice(r, SHAPE_TEXT[kind], pool.filter((s) => s !== kind).map((s) => [SHAPE_TEXT[s], `${SHAPE_WHY[s].replace("The points", "That model's points")} Look at the overall shape again.`] as [string, string]), true),
      hints: ["Ignore the small wiggles and describe the overall shape.", "Does it go straight, curve with a turning point, speed up, level off, or repeat?"],
      steps: [st("Describe the shape.", SHAPE_WHY[kind]), st("Choose the model.", SHAPE_TEXT[kind])],
    };
  },
};

const fitExact: Skill = {
  id: "m4.reg.fit-exact",
  title: "Find a model from exact data",
  topic: T,
  standards: ["NC.M4.AF.5.1"],
  prereqs: ["m4.reg.choose-model"],
  lesson: {
    bigIdea: "When data fit a model perfectly, the structure gives you the parameters: for y = a·b^x, b is the common ratio and a is the value at x = 0.",
    explain: [
      "x: 0, 1, 2, 3 and y: 5, 15, 45, 135. Each y is 3 times the last, so b = 3, and at x = 0, y = 5, so **y = 5(3)^x**.",
      "No x = 0 in the table? If y = 24 at x = 1 and b = 2, back up one step: a = 24 ÷ 2 = 12.",
      "A calculator's exponential regression on these points gives the same a and b (with r² = 1), because the fit is perfect. Real data won't be this tidy.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In y = a·b^x, why is a the y-value when x = 0?", choices: ["b^0 = 1, so y = a · 1 = a.", "Because a is always the first number in the table.", "Because b = 0 when x = 0."], correct: 0, explain: "Any nonzero base to the 0 power is 1." },
    { kind: "written", prompt: "Explain how to tell from a table whether an exponential model fits exactly, and how to find b.", keyIdeas: ["x-values must go up in equal steps", "divide each y by the one before it", "if the ratios are all equal, that ratio is b (per step)"], exemplar: "With x going up by 1 each time, divide each y-value by the previous one. If every ratio is the same number, the data are exactly exponential, and that common ratio is b." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const a = r.pick([1, 2, -1, 3]), b = r.int(-4, 6), c = r.int(-5, 12);
      const xs = [0, 1, 2, 3, 4];
      const ys = xs.map((x) => a * x * x + b * x + c);
      const d1 = ys.slice(1).map((y, i) => y - ys[i]);
      return {
        prompt: "The data in the table fit a quadratic model exactly. Find the equation y = ax^2 + bx + c.",
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...ys]] },
        answer: expr(polyExpr([a, b, c]), { lhs: "y", display: poly([a, b, c]) }),
        hints: ["At x = 0, y = c. The second difference equals 2a.", `c = ${ms(c)}. First differences: ${d1.map(ms).join(", ")}; second differences: ${ms(2 * a)}.`],
        steps: [
          st("Find c.", `At x = 0, y = c = ${ms(c)}.`),
          st("Find a.", `First differences ${d1.map(ms).join(", ")} have a constant second difference of ${ms(2 * a)}, so 2a = ${ms(2 * a)} and a = ${ms(a)}.`),
          st("Find b.", `At x = 1: ${ms(ys[1])} = ${ms(a)}(1) + b${c < 0 ? ` − ${-c}` : ` + ${c}`}, so b = ${ms(b)}.`),
          st("Equation.", `y = ${poly([a, b, c])}`),
        ],
      };
    }
    const a = r.pick([2, 3, 4, 5, 8, 10, 12, 20]);
    const b = r.pick(lv === 1 ? [2, 3, 4, 5] : [2, 3, 1.5, 0.5]);
    const xs = lv === 1 ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];
    const aa = lv === 2 && b === 1.5 ? r.pick([4, 8, 16]) : lv === 2 && b === 0.5 ? r.pick([64, 96, 128]) : a;
    const ys = xs.map((x) => rnd(aa * b ** x, 4));
    const typed = `${aa}(${b})^x`;
    return {
      prompt: `The data in the table fit an exponential model y = a·b^x exactly. Find the equation.`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["y", ...ys]] },
      answer: expr(typed, { lhs: "y", display: `${aa}(${b})^x` }),
      hints: ["Divide each y-value by the previous one to find b.", lv === 1 ? `b = ${dec(ys[1])} ÷ ${dec(ys[0])} = ${b}. a is the y-value at x = 0.` : `b = ${b}. To find a, undo one step from x = 1: a = ${dec(ys[0])} ÷ ${b}.`],
      steps: [
        st("Common ratio.", ys.slice(1).map((y, i) => `${dec(y)} ÷ ${dec(ys[i])} = ${b}`).join("; ")),
        st("Starting value.", lv === 1 ? `At x = 0, y = ${aa}, so a = ${aa}.` : `y(1) = a·${b} = ${dec(ys[0])}, so a = ${dec(ys[0])} ÷ ${b} = ${aa}.`),
        st("Equation.", `y = ${aa}(${b})^x`),
        st("Check.", `x = ${xs[xs.length - 1]}: ${aa}(${b})^${xs[xs.length - 1]} = ${dec(ys[ys.length - 1])} ✓`),
      ],
    };
  },
};

interface RegModel { kind: string; eq: string; f: (x: number) => number; deg?: (x: number) => number; inv?: (y: number) => number; xName: string; yName: string; invWork?: (y: number) => string[] }

function regModel(r: { pick: <T>(a: readonly T[]) => T; int: (a: number, b: number) => number }, kinds: string[]): RegModel {
  const kind = r.pick(kinds);
  if (kind === "exp") {
    const a = r.int(80, 250) / 10, b = r.pick([1.12, 1.15, 1.18, 1.21, 1.08]);
    return { kind, eq: `y = ${a}(${b})^x`, f: (x) => a * b ** x, inv: (y) => Math.log(y / a) / Math.log(b), xName: "months since launch", yName: "subscribers (thousands)", invWork: (y) => [`${b}^x = {${y}/${a}} ≈ ${dec(y / a)}`, `x = {log(${dec(y / a)})/log(${b})} ≈ ${dec(Math.log(y / a) / Math.log(b), 3)}`] };
  }
  if (kind === "decay") {
    const a = r.int(400, 900) / 10, b = r.pick([0.85, 0.88, 0.9, 0.92]);
    return { kind, eq: `y = ${a}(${b})^x`, f: (x) => a * b ** x, inv: (y) => Math.log(y / a) / Math.log(b), xName: "hours since full charge", yName: "battery level (%)", invWork: (y) => [`${b}^x = {${y}/${a}} ≈ ${dec(y / a)}`, `x = {log(${dec(y / a)})/log(${b})} ≈ ${dec(Math.log(y / a) / Math.log(b), 3)}`] };
  }
  if (kind === "log") {
    const a = r.int(200, 400) / 10, b = r.int(80, 160) / 10;
    return { kind, eq: `y = ${a} + ${b}·ln(x)`, f: (x) => a + b * Math.log(x), inv: (y) => Math.exp((y - a) / b), xName: "hours of practice", yName: "skill rating", invWork: (y) => [`ln(x) = {${y} − ${a}/${b}} ≈ ${dec((y - a) / b)}`, `x = e^(${dec((y - a) / b)}) ≈ ${dec(Math.exp((y - a) / b), 3)}`] };
  }
  if (kind === "quad") {
    const a = -r.int(40, 60) / 10, b = r.int(30, 50), c = r.int(10, 40) / 10;
    return { kind, eq: `y = ${ms(a)}x^2 + ${b}x + ${c}`, f: (x) => a * x * x + b * x + c, xName: "seconds after launch", yName: "height of a model rocket (m)" };
  }
  const A = r.int(20, 30) / 10, B = 0.0172, C = -1.39, D = r.int(115, 125) / 10;
  return { kind: "sin", eq: `y = ${A}sin(${B}x ${ms(C).replace("−", "− ")}) + ${D}`, f: (x) => A * Math.sin(B * x + C) + D, deg: (x) => A * Math.sin(((B * x + C) * Math.PI) / 180) + D, xName: "day of the year", yName: "hours of daylight" };
}

const predict: Skill = {
  id: "m4.reg.predict",
  title: "Use a regression model",
  topic: T,
  standards: ["NC.M4.AF.5.1"],
  prereqs: ["m4.reg.choose-model"],
  lesson: {
    bigIdea: "A regression equation is a tool: substitute an x-value to predict y, or solve for x to find when the model reaches a y-value.",
    explain: [
      "A calculator fit y = 12.5(1.15)^x for subscribers (thousands) after x months. Predict month 6: 12.5(1.15)^6 ≈ 12.5(2.313) ≈ **28.9 thousand**.",
      "When does it reach 50 thousand? 1.15^x = 4, so x = {log 4/log 1.15} ≈ **9.9 months**.",
      "Be careful predicting far outside the data (extrapolation): real growth usually slows down.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why are predictions far outside the data range risky?", choices: ["The pattern may not continue: the model was only checked against the data you had.", "Because calculators can't handle large x-values.", "They aren't risky if r is close to 1."], correct: 0, explain: "Extrapolation assumes the trend keeps its shape, which real situations often don't." },
    { kind: "written", prompt: "A model y = 30 + 12ln(x) predicts a skill rating after x hours of practice. Explain why it makes sense for practice and why it can't be used at x = 0.", keyIdeas: ["log growth is fast at first, then slows (diminishing returns)", "ln(0) isn't defined", "the model only applies for x > 0"], exemplar: "Logarithmic growth rises quickly at first and then slows, like improving fast as a beginner and slower later. But ln(0) isn't defined, so the model can't describe zero hours; it only works for x > 0." },
  ],
  generate(r, lv) {
    const m = regModel(r, lv === 1 ? ["exp", "decay"] : lv === 2 ? ["log", "quad", "sin"] : ["exp", "decay", "log"]);
    if (lv < 3) {
      const x = m.kind === "sin" ? r.pick([45, 100, 172, 250, 300]) : m.kind === "quad" ? r.int(2, 6) : m.kind === "log" ? r.pick([5, 10, 20, 40, 60]) : r.int(3, 12);
      const ans = rnd(m.f(x), 1);
      const subst = m.eq.replace(/^y = /, "").replace(/\(x\)/g, `(${x})`).replace(/(\d)x/g, `$1(${x})`).replace(/\^x/g, `^(${x})`);
      return {
        prompt: `A regression on data about ${m.yName} (y) vs. ${m.xName} (x) gave ${m.eq}. Use the model to predict y when x = ${x}. Round to the nearest tenth.`,
        answer: num(ans, { tolerance: 0.1 }),
        hints: [`Substitute x = ${x} into the equation.`, `${subst}. Evaluate carefully (${m.kind === "sin" ? "your calculator must be in radian mode" : m.kind === "log" ? "ln is the natural log" : m.kind === "quad" ? "square first, then multiply" : "exponent first, then multiply"}).`],
        steps: [st("Substitute.", `y = ${subst}`), st("Evaluate.", `y ≈ ${dec(m.f(x), 3)}`), st("Round.", `y ≈ ${dec(ans, 1)}`)],
        traps: m.kind === "sin" ? tolTraps(ans, 0.1, [[rnd(m.deg!(x), 1), "Your calculator is probably in degree mode; this model uses radians."]]) : m.kind === "exp" || m.kind === "decay" ? tolTraps(ans, 0.1, [[Number(m.eq.match(/= ([\d.]+)/)![1]) * Number(m.eq.match(/\(([\d.]+)\)/)![1]) * x, "That multiplies by the base and x. The exponent means repeated multiplication."]]) : [],
      };
    }
    const target = m.kind === "log" ? rnd(m.f(r.pick([15, 25, 30, 45])) + r.int(-5, 5) / 10, 0) : m.kind === "decay" ? r.pick([20, 25, 30, 15]) : rnd(m.f(r.int(8, 14)) + r.int(-9, 9) / 10, 0);
    const ans = rnd(m.inv!(target), 1);
    const work = m.invWork!(target);
    return {
      prompt: `A regression on data about ${m.yName} (y) vs. ${m.xName} (x) gave ${m.eq}. According to the model, when does y reach ${target}? Round x to the nearest tenth.`,
      answer: num(ans, { tolerance: 0.15 }),
      hints: [m.kind === "log" ? "Isolate ln(x), then undo it with e." : "Divide to isolate the power, then take the log of both sides.", work[0]],
      steps: [st("Set the model equal to the target.", `${target} = ${m.eq.replace(/^y = /, "")}`), st("Isolate.", work[0]), st("Solve.", work[1]), st("Answer.", `x ≈ ${dec(ans, 1)} ${m.xName.split(" ")[0]}`)],
      traps: tolTraps(ans, 0.15, m.kind === "log" ? [[(target - Number(m.eq.match(/= ([\d.]+)/)![1])) / Number(m.eq.match(/\+ ([\d.]+)·/)![1]), "That's ln(x). Raise e to that power to get x."]] : [[Math.log(target) / Math.log(Number(m.eq.match(/\(([\d.]+)\)/)![1])), "Divide by a before taking logs."]]),
    };
  },
};

const residuals: Skill = {
  id: "m4.reg.residuals",
  title: "Compute residuals",
  topic: T,
  standards: ["NC.M4.AF.5.2"],
  prereqs: ["m4.reg.predict"],
  lesson: {
    bigIdea: "Residual = observed y − predicted y. Positive means the point is above the model; negative means below.",
    explain: [
      "Model: y = 50(1.2)^x. At x = 2 the model predicts 50(1.44) = 72. If the actual value was 75, the residual is 75 − 72 = **3** (the point is 3 above the curve).",
      "The sum of squared residuals (SSR) measures overall fit: square each residual so negatives don't cancel positives, then add. Smaller SSR = closer fit.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do we square residuals before adding them to judge fit?", choices: ["So positive and negative residuals don't cancel out and hide large errors.", "Because residuals are always negative.", "To make the numbers smaller."], correct: 0, explain: "Squaring makes every error count as positive, and big errors count extra." },
    { kind: "written", prompt: "A data point has a residual of −6. Explain what that means about the point and the model.", keyIdeas: ["observed − predicted = −6", "the actual value is 6 less than the model predicted", "the point lies below the curve"], exemplar: "Residual = observed − predicted, so −6 means the actual y-value was 6 less than the model predicted. The point sits 6 units below the model's curve." },
  ],
  generate(r, lv) {
    const exp = r.chance(0.5);
    const a = exp ? r.pick([20, 40, 50, 80, 100]) : r.pick([1, 2, -1]);
    const b = exp ? r.pick([1.5, 2, 1.2]) : r.int(2, 10);
    const c = exp ? 0 : r.int(5, 20);
    const f = (x: number) => (exp ? rnd(a * b ** x, 4) : a * x * x + b * x + c);
    const eq = exp ? `y = ${a}(${b})^x` : `y = ${poly([a, b, c])}`;
    const what = exp ? r.pick(["app downloads (hundreds)", "bacteria count (thousands)", "followers (hundreds)"]) : r.pick(["revenue (hundreds of dollars)", "height (feet)", "attendance (hundreds)"]);
    if (lv === 1 || lv === 2) {
      const x = r.int(1, exp ? 4 : 5);
      const pred = f(x), res = r.nonzero(-8, 8);
      const obs = rnd(pred + res, 4);
      if (lv === 1) {
        return {
          prompt: `A model for ${what} is ${eq}. At x = ${x}, the observed value was ${dec(obs)}. Find the residual.`,
          answer: num(res),
          hints: ["Residual = observed − predicted.", `Predicted: ${eq.replace("y = ", "")} at x = ${x} is ${dec(pred)}.`],
          steps: [st("Predicted value.", `${eq.replace("y = ", "").replace(/x/g, `(${x})`)} = ${dec(pred)}`), st("Residual.", `observed − predicted = ${dec(obs)} − ${dec(pred)} = ${ms(res)}`), st("Meaning.", `The point is ${Math.abs(res)} ${res > 0 ? "above" : "below"} the model.`)],
          traps: [{ value: frac(-res), feedback: "That's predicted − observed. Residuals are observed minus predicted." }],
        };
      }
      return {
        prompt: `A model for ${what} is ${eq}. At x = ${x}, the residual was ${ms(res)}. What was the observed value?`,
        answer: num(obs),
        hints: ["observed = predicted + residual.", `Predicted at x = ${x}: ${dec(pred)}.`],
        steps: [st("Predicted value.", `${dec(pred)}`), st("Add the residual.", `observed = ${dec(pred)} + ${res < 0 ? `(${ms(res)})` : res} = ${dec(obs)}`)],
        traps: [{ value: frac(rnd(pred - res, 4)), feedback: "Residual = observed − predicted, so observed = predicted + residual." }],
      };
    }
    const xs = [1, 2, 3, 4];
    const res = xs.map(() => r.int(-4, 4));
    const obs = xs.map((x, i) => rnd(f(x) + res[i], 4));
    const ssr = res.reduce((s, e) => s + e * e, 0);
    return {
      prompt: `A model for ${what} is ${eq}. Use the table to find the sum of the squared residuals.`,
      visual: { type: "table", headers: ["x", "observed y", "predicted y"], rows: xs.map((x, i) => [x, obs[i], f(x)]) },
      answer: num(ssr),
      hints: ["Find each residual: observed − predicted.", `Residuals: ${res.map(ms).join(", ")}. Now square each one and add.`],
      steps: [st("Residuals.", xs.map((x, i) => `${dec(obs[i])} − ${dec(f(x))} = ${ms(res[i])}`).join("; ")), st("Square them.", res.map((e) => `${e < 0 ? `(${ms(e)})` : e}^2 = ${e * e}`).join(", ")), st("Add.", `${res.map((e) => e * e).join(" + ")} = ${ssr}`)],
      traps: traps(frac(ssr), [trap(res.reduce((s, e) => s + e, 0), "Square each residual before adding; otherwise positives and negatives cancel."), trap(res.reduce((s, e) => s + Math.abs(e), 0), "Square the residuals; don't just take absolute values.")]),
    };
  },
};

const residualPlot: Skill = {
  id: "m4.reg.residual-plot",
  title: "Judge fit with residual plots",
  topic: T,
  standards: ["NC.M4.AF.5.2"],
  prereqs: ["m4.reg.residuals"],
  lesson: {
    bigIdea: "A good model leaves residuals scattered randomly around 0. A clear pattern (a curve, a U, a wave) means the model missed part of the shape.",
    explain: [
      "Plot each residual against x. If the points look like random noise above and below 0, the model's shape is right.",
      "If the residuals form a U or an arch, the data curve and the model doesn't (for example, a line fit to exponential data). Try a different model.",
      "To compare two models, compare the residual plots first, then the sum of squared residuals (smaller is better).",
    ],
    visual: { type: "plot", xMin: 0, xMax: 10, yMin: -4, yMax: 4, xStep: 1, hlines: [{ y: 0 }], points: [{ x: 1, y: 3 }, { x: 2, y: 1.2 }, { x: 3, y: -0.6 }, { x: 4, y: -1.8 }, { x: 5, y: -2.2 }, { x: 6, y: -2 }, { x: 7, y: -1 }, { x: 8, y: 0.8 }, { x: 9, y: 3.2 }] },
  },
  why: [
    { kind: "choice", prompt: "A linear model's residual plot shows a U shape. What does that tell you?", choices: ["The data curve, so a nonlinear model (like quadratic or exponential) would fit better.", "The linear model is perfect.", "There are too many data points."], correct: 0, explain: "The pattern is structure the line failed to capture." },
    { kind: "written", prompt: "Two models have nearly the same sum of squared residuals, but one residual plot is random and the other is curved. Explain which you'd choose.", keyIdeas: ["random residuals mean the shape is right", "a curved pattern means systematic error", "choose the model with the random residual plot; it will predict better"], exemplar: "I'd choose the one with the random residual plot. A curved pattern means the model is systematically too high in some places and too low in others, so its predictions will be off in a predictable way, especially outside the data." },
  ],
  generate(r, lv) {
    const xs = Array.from({ length: 10 }, (_, i) => i + 1);
    if (lv === 1 || lv === 2) {
      const pattern = lv === 1 ? r.pick(["random", "curved"]) : r.pick(["u", "arch"]);
      const res = xs.map((x) => {
        const n = r.int(-10, 10) / 10;
        if (pattern === "random") return rnd(n * 2.5, 1);
        if (pattern === "curved" || pattern === "u") return rnd(0.25 * (x - 5.5) ** 2 - 2 + n * 0.5, 1);
        return rnd(-0.25 * (x - 5.5) ** 2 + 2 + n * 0.5, 1);
      });
      const vis: Visual = { type: "plot", xMin: 0, xMax: 11, yMin: -5, yMax: 5, xStep: 1, hlines: [{ y: 0 }], points: xs.map((x, i) => ({ x, y: res[i] })) };
      if (lv === 1) {
        const good = pattern === "random";
        return {
          prompt: `${r.pick(PEOPLE)} fit an exponential model to data and made the residual plot shown. What does it suggest?`,
          visual: vis,
          answer: choice(r, good ? "The model is appropriate: the residuals are scattered randomly around 0." : "The model is not appropriate: the residuals follow a curved pattern.", [
            good ? ["The model is not appropriate: the residuals follow a curved pattern.", "Look again: there's no clear curve, just scatter above and below 0."] : ["The model is appropriate: the residuals are scattered randomly around 0.", "The residuals form a U shape, not random scatter."],
            ["The model is appropriate because some residuals are 0.", "A few zero residuals don't make a model good; the overall pattern matters."],
            ["The model is not appropriate because some residuals are negative.", "Every good model has negative residuals; points fall on both sides."],
          ] as [string, string][]),
          hints: ["Look for a pattern: a curve, a U, a wave, or a fan.", "Random scatter around 0 means the model's shape fits; a pattern means it doesn't."],
          steps: [st("Describe the residuals.", good ? "They jump above and below 0 with no clear shape." : "They start high, dip below 0 in the middle, and rise again: a U shape."), st("Conclusion.", good ? "The model is appropriate." : "The model misses the curvature; try a different model.")],
        };
      }
      const u = pattern === "u";
      return {
        prompt: `A linear model was fit to data, and its residual plot is shown. What should you do next?`,
        visual: vis,
        answer: choice(r, `Try a model that curves ${u ? "upward (like exponential or an upward quadratic)" : "downward (like a downward quadratic or logarithmic)"}: the residuals form ${u ? "a U" : "an arch"}.`, [
          ["Keep the linear model: the residuals are centered on 0.", `The residuals are centered on 0 overall, but they make ${u ? "a U" : "an arch"}, which is a pattern.`],
          [`Try a model that curves ${u ? "downward" : "upward"}: the residuals form ${u ? "an arch" : "a U"}.`, `Look again: the residuals are ${u ? "high at the ends and low in the middle" : "low at the ends and high in the middle"}.`],
          ["Remove the points with the largest residuals and refit the line.", "Deleting data to fix a pattern hides the real shape."],
        ] as [string, string][]),
        hints: ["Where are the residuals positive (data above the line) and where negative?", u ? "Data above the line at both ends and below in the middle: the data bend upward." : "Data below the line at both ends and above in the middle: the data bend downward."],
        steps: [st("Read the pattern.", u ? "Residuals are positive at the ends and negative in the middle (a U)." : "Residuals are negative at the ends and positive in the middle (an arch)."), st("Interpret.", u ? "The data curve upward away from the line." : "The data curve downward away from the line."), st("Next step.", `Fit a model that curves ${u ? "upward" : "downward"} and check its residuals.`)],
      };
    }
    const xs6 = [1, 2, 3, 4, 5, 6];
    const resA = xs6.map(() => r.int(-3, 3));
    const resB = xs6.map((x) => Math.round(1.2 * (x - 3.5) ** 2 - 3.5) + r.int(-1, 1));
    const ssA = resA.reduce((s, e) => s + e * e, 0), ssB = resB.reduce((s, e) => s + e * e, 0);
    const exp = ssA <= ssB;
    return {
      prompt: "Model A (exponential) and Model B (linear) were fit to the same data. Their residuals are in the table. Which model fits better?",
      visual: { type: "table", headers: ["x", "Model A residual", "Model B residual"], rows: xs6.map((x, i) => [x, resA[i], resB[i]]) },
      answer: choice(r, exp ? `Model A: its residuals have no pattern and a smaller sum of squares (${ssA} vs. ${ssB}).` : `Model A: its residuals have no pattern, even though its sum of squares is a little larger (${ssA} vs. ${ssB}).`, [
        [exp ? `Model B: its sum of squared residuals is smaller (${ssB} vs. ${ssA}).` : `Model B: its sum of squared residuals is smaller (${ssB} vs. ${ssA}).`, exp ? "Compute again: square each residual and add." : "Model B's residuals go high-low-high, a curved pattern, so its shape is wrong."],
        ["Model B: its residuals add up closer to 0.", "Residuals of any least-squares fit add to about 0; that doesn't measure fit."],
        ["They fit equally well because both have positive and negative residuals.", "Look at the pattern and the size of the residuals."],
      ] as [string, string][]),
      hints: ["Look at the pattern in each residual column (random or curved?).", `Then square and add: Model A ${resA.map((e) => e * e).join(" + ")}; Model B ${resB.map((e) => e * e).join(" + ")}.`],
      steps: [st("Patterns.", "Model A's residuals bounce randomly; Model B's start positive, go negative in the middle, then positive again (a U)."), st("Sums of squares.", `A: ${ssA}. B: ${ssB}.`), st("Decision.", `Model A ${exp ? "has no pattern and the smaller SSR" : "has no pattern, which matters more than a small difference in SSR"}.`)],
    };
  },
};

const interpret: Skill = {
  id: "m4.reg.interpret",
  title: "Interpret regression parameters",
  topic: T,
  standards: ["NC.M4.AF.5.1"],
  prereqs: ["m4.reg.predict"],
  lesson: {
    bigIdea: "Each parameter of a regression model means something in context: a starting value, a growth or decay rate, an average level, a cycle length.",
    explain: [
      "Exponential y = 240(1.15)^x: 240 is the value at x = 0, and 1.15 means y grows **15%** per unit of x. A base of 0.92 means it shrinks 8% per unit.",
      "Sinusoidal y = 2.5sin(0.524x − 1.6) + 12.1: 12.1 is the average level, 2.5 is how far it swings above and below, and the period is {2π/0.524} ≈ 12.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a base of 0.92 in y = a(0.92)^x mean an 8% decrease?", choices: ["Each step multiplies by 0.92 = 1 − 0.08, keeping 92% and losing 8%.", "Because 0.92 is less than 1, so it decreases 92%.", "Because 9 − 2 = 7, so about 8%."], correct: 0, explain: "Growth factor = 1 + rate; here the rate is −0.08." },
    { kind: "written", prompt: "Explain what the 240 means in y = 240(1.15)^x if y is the number of streams of a song x days after release.", keyIdeas: ["240 is the value at x = 0", "the model predicts 240 streams on release day", "it's the starting value, then growth of 15% per day"], exemplar: "At x = 0, (1.15)^0 = 1, so y = 240. The model says the song had about 240 streams on the day it was released, and then streams grew 15% each day." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const grow = lv === 1;
      const a = r.int(100, 900);
      const pctv = grow ? r.pick([4, 6, 8, 12, 15, 20, 25]) : r.pick([3, 5, 8, 10, 12, 20]);
      const b = grow ? 1 + pctv / 100 : 1 - pctv / 100;
      const bt = dec(b, 2);
      const ctx = grow ? r.pick([["number of streams of a new song", "day"], ["number of users of a new app", "week"], ["follower count of a meme account", "week"]]) : r.pick([["value of a used car (in hundreds of dollars)", "year"], ["amount of caffeine in the body (mg)", "hour"], ["amount of a medicine in the bloodstream (mg)", "hour"]]);
      const askB = r.chance(0.6);
      const correct = askB ? `The ${ctx[0]} ${grow ? "increases" : "decreases"} by ${pctv}% each ${ctx[1]}.` : `The ${ctx[0]} was about ${a} at the start (x = 0).`;
      return {
        prompt: `An exponential regression for the ${ctx[0]} after x ${ctx[1]}s gave y = ${a}(${bt})^x. What does the ${askB ? bt : a} mean?`,
        answer: choice(r, correct, askB ? [
          [`The ${ctx[0]} ${grow ? "increases" : "decreases"} by ${bt}% each ${ctx[1]}.`, `The growth factor ${bt} is 1 ${grow ? "+" : "−"} ${pctv / 100}, so the rate is ${pctv}%.`],
          [`The ${ctx[0]} ${grow ? "increases" : "decreases"} by ${bt} each ${ctx[1]}.`, "Exponential change is by a percent (a multiplier), not a fixed amount."],
          [`The ${ctx[0]} ${grow ? "decreases" : "increases"} by ${pctv}% each ${ctx[1]}.`, `A base ${grow ? "greater" : "less"} than 1 means ${grow ? "growth" : "decay"}.`],
        ] : [
          [`The ${ctx[0]} changes by ${a} each ${ctx[1]}.`, "a is a starting value, not a rate."],
          [`The ${ctx[0]} after one ${ctx[1]} is ${a}.`, `At x = 1 the model gives ${a} × ${bt}, not ${a}.`],
          [`The ${ctx[0]} can never be more than ${a}.`, grow ? "This model keeps growing past a." : "a is the starting value; nothing caps it."],
        ] as [string, string][]),
        hints: ["In y = a·b^x, a is the value at x = 0 and b is the multiplier per unit of x.", `b = ${bt} = 1 ${grow ? "+" : "−"} ${dec(pctv / 100, 2)}.`],
        steps: [st("Starting value.", `At x = 0, y = ${a}(${bt})^0 = ${a}.`), st("Growth factor.", `${bt} = 1 ${grow ? "+" : "−"} ${dec(pctv / 100, 2)}, so y ${grow ? "grows" : "shrinks"} ${pctv}% per ${ctx[1]}.`), st("Answer.", correct)],
      };
    }
    const A = r.int(15, 35) / 10, D = r.int(110, 130) / 10;
    const [P, unit, thing] = r.pick([[12, "months", "hours of daylight in a city"], [24, "hours", "electricity demand (in GW)"], [365, "days", "hours of daylight"]] as [number, string, string][]);
    const B = rnd((2 * Math.PI) / P, 4);
    const correct = `It repeats about every ${P} ${unit}.`;
    return {
      prompt: `A sinusoidal regression for ${thing} gave y = ${A}sin(${B}x − 1.6) + ${D}, with x in ${unit}. What does the model say about the cycle?`,
      answer: choice(r, correct, [
        [`It repeats about every ${dec(B * 100, 0)} ${unit}.`, `The period is 2π ÷ ${B}, not related to ${B} × 100.`],
        [`It repeats about every ${dec(Math.PI / B, 0)} ${unit}.`, "One full cycle is 2π divided by B, not π divided by B."],
        [`It swings between ${D} and ${dec(D + A)} on average every ${unit.slice(0, -1)}.`, `The swing goes ${A} above AND below the midline ${D}.`],
      ] as [string, string][]),
      hints: ["The period of y = a·sin(bx + c) + d is {2π/b}.", `2π ÷ ${B} ≈ ?`],
      steps: [st("Period.", `{2π/${B}} ≈ ${dec((2 * Math.PI) / B, 2)}, so about ${P} ${unit}`), st("Other parameters.", `Midline ${D} (average level), amplitude ${A} (swing above and below), range about ${dec(D - A)} to ${dec(D + A)}.`), st("Answer.", correct)],
    };
  },
};

export default [chooseModel, fitExact, predict, residuals, residualPlot, interpret] satisfies Skill[];
