// Unit 6: Functions (NC.M1.F-IF.1, 2, 4, 5, 6, 7, 9; A-REI.11).
import { choice, ms, num, poly, polyExpr, sn, trap, traps, NAMES } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, fracMark, lineText, lineTyped, pt } from "./util";

const T = "m1-functions";

/** Quadratic a(x − p)(x − q) as coefficients. */
const quadCoefs = (a: number, p: number, q: number) => [a, -a * (p + q), a * p * q];
const evalPoly = (c: number[], x: number) => c.reduce((acc, k) => acc * x + k, 0);

// ---------- what is a function ----------

const isFunction: Skill = {
  id: "m1.func.is-function",
  title: "Is it a function?",
  topic: T,
  standards: ["NC.M1.F-IF.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A function gives each input exactly one output. If any input is paired with two different outputs, it's not a function.",
    explain: [
      "{(1, 4), (2, 5), (3, 4)} is a function: each x appears once. Two inputs can share an output (1 and 3 both give 4); that's fine.",
      "{(2, 3), (2, 7), (5, 1)} is NOT a function: the input 2 has two outputs.",
      "On a graph, use the **vertical line test**: if any vertical line hits the graph more than once, some x has two y-values, so it's not a function.",
      "Notation: f(x) is the output when the input is x, and the graph of f is all points (x, f(x)).",
    ],
    visual: { type: "plot", xMin: -1, xMax: 9, yMin: -4, yMax: 4, curves: [{ expr: "sqrt(x)" }, { expr: "-sqrt(x)" }], vlines: [{ x: 4, dashed: true }] },
    tip: "Repeated outputs are fine. Repeated inputs with different outputs are not.",
  },
  why: [
    { kind: "choice", prompt: "Why does a vertical line crossing a graph twice show it's not a function?", choices: ["Both crossing points have the same x but different y-values, so one input has two outputs.", "Because the graph is too steep.", "Because functions can't have negative values."], correct: 0, explain: "A vertical line is all points with one x-value." },
    { kind: "written", prompt: "Is \"each student → their birthday\" a function? Is \"each birthday → the students born that day\" a function? Explain.", keyIdeas: ["each student has exactly one birthday, so the first is a function", "one birthday can belong to several students", "so the second is not a function"], exemplar: "Student → birthday is a function, because each student has exactly one birthday. Birthday → student is not, because one date can match several students, so one input could have several outputs." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const isF = r.chance(0.5);
      const xs = r.shuffle([-3, -2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 5);
      const pairs = xs.map((x) => ({ x, y: r.int(-5, 9) }));
      let dup = -1;
      if (!isF) { dup = r.int(1, 4); pairs[dup] = { x: pairs[0].x, y: pairs[0].y + r.nonzero(-4, 4) }; }
      const shown = r.shuffle(pairs);
      return {
        prompt: "Does the table represent y as a function of x?",
        visual: { type: "table", headers: ["x", ...shown.map((p) => f(p.x))], rows: [["y", ...shown.map((p) => f(p.y))]] },
        answer: choice(r, isF ? "Yes: each x-value has exactly one y-value" : `No: x = ${ms(pairs[0].x)} has two different y-values`, isF ? [["No: some y-values repeat", "Repeated outputs are allowed in a function."], ["No: the x-values aren't in order", "Order doesn't matter."]] : [["Yes: each y-value is different", "What matters is whether an x-value repeats with different y-values."], ["Yes: there are five inputs", "Check whether any input has two outputs."]]),
        hints: ["Look for an x-value that appears more than once.", "If a repeated x has two different y-values, it's not a function."],
        steps: isF ? [st("Check the inputs.", "No x-value repeats."), st("Conclude.", "Each input has one output: it's a function.")] : [st("Check the inputs.", `x = ${ms(pairs[0].x)} appears twice, with y = ${ms(pairs[0].y)} and y = ${ms(pairs[dup].y)}.`), st("Conclude.", "One input has two outputs: not a function.")],
      };
    }
    if (lv === 2) {
      const kind = r.pick(["parabola", "line", "sideways", "circle", "exp", "abs"]);
      const h = r.int(-2, 2), k = r.int(-2, 2);
      let curves: { expr: string }[];
      if (kind === "parabola") curves = [{ expr: `(x-(${h}))^2+(${k})` }];
      else if (kind === "line") curves = [{ expr: `${r.nonzero(-2, 2)}x+(${k})` }];
      else if (kind === "exp") curves = [{ expr: `2^x+(${k})` }];
      else if (kind === "abs") curves = [{ expr: `abs(x-(${h}))+(${k})` }];
      else if (kind === "sideways") curves = [{ expr: `sqrt(x-(${h}))+(${k})` }, { expr: `-sqrt(x-(${h}))+(${k})` }];
      else curves = [{ expr: "sqrt(16-x^2)" }, { expr: "-sqrt(16-x^2)" }];
      const isF = !["sideways", "circle"].includes(kind);
      return {
        prompt: "Does the graph represent y as a function of x?",
        visual: { type: "plot", xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves },
        answer: choice(r, isF ? "Yes: every vertical line crosses the graph at most once" : "No: some vertical lines cross the graph twice", isF ? [["No: some vertical lines cross the graph twice", "Try sliding a vertical line across: it never hits two points."], ["No: some horizontal lines cross the graph twice", "The test uses vertical lines; repeated outputs are fine."]] : [["Yes: every vertical line crosses the graph at most once", `Try the vertical line x = ${kind === "circle" ? 0 : h + 1}.`], ["Yes: it passes the horizontal line test", "The function test uses vertical lines."]]),
        hints: ["Use the vertical line test.", "Imagine sliding a vertical line across the graph. Does it ever hit two points at once?"],
        steps: [st("Vertical line test.", isF ? "Every vertical line meets the graph at most once." : `The line x = ${kind === "circle" ? 0 : h + 1} meets the graph at two points.`), st("Conclude.", isF ? "It's a function." : "Not a function: one x-value has two y-values.")],
      };
    }
    const mk = (fn: boolean) => {
      const xs = r.shuffle([-2, -1, 0, 1, 2, 3, 4]).slice(0, 4);
      const ps = xs.map((x) => [x, r.int(-4, 6)]);
      if (!fn) ps[3] = [ps[0][0], ps[0][1] + r.nonzero(-3, 3)];
      return `{${ps.map(([x, y]) => pt(x, y)).join(", ")}}`;
    };
    const askIs = r.chance(0.5);
    const right = mk(askIs);
    const others = [mk(!askIs), mk(!askIs), mk(!askIs)];
    return {
      prompt: askIs ? "Which set of ordered pairs represents a function?" : "Which set of ordered pairs does NOT represent a function?",
      answer: choice(r, right, others.map((o) => [o, askIs ? "Look for an x-value that is paired with two different y-values." : "In this set every x-value appears only once."] as [string, string])),
      hints: ["In each set, check whether any x-value appears twice.", "A repeated x with two different y-values breaks the function rule."],
      steps: [st("Check each set's x-values.", askIs ? "Three of the sets repeat an x-value with different y-values." : "Three of the sets give each x-value one y-value."), st("Answer.", right)],
    };
  },
};

// ---------- evaluating functions ----------

const evaluate: Skill = {
  id: "m1.func.evaluate",
  title: "Evaluate functions",
  topic: T,
  standards: ["NC.M1.F-IF.2"],
  prereqs: ["m1.func.is-function"],
  lesson: {
    bigIdea: "f(a) means replace every x in the rule with a, then follow the order of operations.",
    explain: [
      "f(x) = 3x − 5: f(4) = 3(4) − 5 = **7**.",
      "g(x) = x^2 − 2x + 1: g(−3) = (−3)^2 − 2(−3) + 1 = 9 + 6 + 1 = **16**. Put negative inputs in parentheses so the square applies to the whole number.",
      "h(x) = 5·2^x: h(3) = 5 · 8 = **40**, and h(−1) = 5 · {1/2} = {5/2}. Exponents come before multiplying.",
    ],
    tip: "−3^2 is −9, but (−3)^2 is 9. Parentheses around negative inputs prevent that mistake.",
  },
  why: [
    { kind: "choice", prompt: "For h(x) = 5·2^x, why is h(3) equal to 40 and not 1000?", choices: ["Only the 2 is raised to the power: 5 · 2^3 = 5 · 8.", "Because 5 and 2 are multiplied first.", "It is 1000."], correct: 0, explain: "Exponents apply only to the base they're attached to." },
    { kind: "written", prompt: "Explain what f(2) = 11 tells you about the graph of f.", keyIdeas: ["the input 2 gives output 11", "the point (2, 11) is on the graph", "graph of f is the set of points (x, f(x))"], exemplar: "f(2) = 11 means when the input is 2 the output is 11, so the point (2, 11) is on the graph of f." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m = r.nonzero(-6, 7), b = r.int(-10, 10), x = r.int(-6, 8);
      const ans = m * x + b;
      return {
        prompt: `f(x) = ${lineText(m, b)}. Find f(${ms(x)}).`,
        answer: num(ans),
        hints: [`Replace x with ${ms(x)}.`, `Compute ${ms(m)} × ${sn(x)} first, then ${b < 0 ? "subtract" : "add"} ${Math.abs(b)}.`],
        steps: [st("Substitute.", `f(${ms(x)}) = ${ms(m)}(${ms(x)})${b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`}`), st("Evaluate.", `${ms(m * x)}${b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`} = ${ms(ans)}`)],
        traps: traps(frac(ans), [trap(m + x + b, "f(x) means multiply the input by the coefficient, not add."), trap(-m * x + b, "Check the sign of the product.")]),
      };
    }
    if (lv === 2) {
      const a = r.nonzero(-3, 3), b = r.int(-6, 6), c = r.int(-9, 9), x = r.int(-4, -1);
      const ans = a * x * x + b * x + c;
      return {
        prompt: `g(x) = ${poly([a, b, c])}. Find g(${ms(x)}).`,
        answer: num(ans),
        hints: [`Replace every x with (${ms(x)}).`, `(${ms(x)})^2 = ${x * x}: squaring a negative gives a positive.`],
        steps: [st("Substitute with parentheses.", `g(${ms(x)}) = ${a === 1 ? "" : a === -1 ? "−" : ms(a)}(${ms(x)})^2${b === 0 ? "" : ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}(${ms(x)})`}${c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`}`), st("Square first.", `(${ms(x)})^2 = ${x * x}`), st("Multiply and add.", `${ms(a * x * x)}${b === 0 ? "" : ` ${b * x < 0 ? "−" : "+"} ${Math.abs(b * x)}`}${c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`} = ${ms(ans)}`)],
        traps: traps(frac(ans), [trap(-a * x * x + b * x + c, `(${ms(x)})^2 is positive ${x * x}, not −${x * x}.`), trap(a * 2 * x + b * x + c, "x^2 means x times x, not 2 times x.")]),
      };
    }
    const a = r.int(2, 6), base = r.pick([2, 3]), x = r.int(-2, 4);
    const val = frac(a * base ** Math.max(x, 0), base ** Math.max(-x, 0));
    return {
      prompt: `h(x) = ${a}·${base}^x. Find h(${ms(x)}).`,
      answer: num(val),
      hints: [`Evaluate ${base}^${x < 0 ? `(${ms(x)})` : x} first.`, x < 0 ? `A negative exponent means a reciprocal: ${base}^(${ms(x)}) = {1/${base ** -x}}.` : `Then multiply by ${a}.`],
      steps: [st("Power first.", `${base}^${x < 0 ? `(${ms(x)})` : x} = ${x < 0 ? `{1/${base ** -x}}` : base ** x}`), st(`Multiply by ${a}.`, `${a} × ${x < 0 ? `{1/${base ** -x}}` : base ** x} = ${fracMark(val)}`)],
      traps: traps(val, [...(x > 0 ? [trap((a * base) ** x, `Only ${base} is raised to the power, not ${a} × ${base}.`), trap(a * base * x, "An exponent is repeated multiplication, not multiplying by x.")] : []), ...(x < 0 ? [trap(-a * base ** -x, "A negative exponent gives a reciprocal, not a negative number.")] : [])]),
    };
  },
};

// ---------- function notation in context ----------

const notationContext: Skill = {
  id: "m1.func.notation-context",
  title: "Function notation in context",
  topic: T,
  standards: ["NC.M1.F-IF.2", "NC.M1.A-CED.1"],
  prereqs: ["m1.func.evaluate"],
  lesson: {
    bigIdea: "In context, f(input) = output is a sentence: the input goes in the parentheses, the result is on the other side.",
    explain: [
      "C(n) = 12n + 30 is the cost in dollars of n concert T-shirts with shipping. C(5) = 90 means **5 shirts cost $90**.",
      "\"How many shirts can you buy for $150?\" asks for n with C(n) = 150: 12n + 30 = 150, so n = 10.",
      "Finding C(5) means evaluate. Solving C(n) = 150 means work backward. Read which one the question wants.",
    ],
  },
  why: [
    { kind: "choice", prompt: "For C(n), the cost of n items, why does C(5) = 90 not mean 90 items cost $5?", choices: ["The input (inside the parentheses) is the number of items; the output is the cost.", "Because 90 is larger than 5.", "It does mean that."], correct: 0, explain: "Inputs go inside; outputs come out." },
    { kind: "written", prompt: "P(t) is a town's population t years after 2020. Explain the difference between finding P(4) and solving P(t) = 4000.", keyIdeas: ["P(4) is the population in 2024 (input given, find output)", "P(t) = 4000 asks when the population reaches 4000 (output given, find input)", "evaluate vs. solve"], exemplar: "P(4) means put in t = 4 and get the population in 2024. Solving P(t) = 4000 means the population is known and you work backward to find the year, the value of t that gives 4000." },
  ],
  generate(r, lv) {
    const nm = r.pick(NAMES);
    const rate = r.pick([8, 12, 15, 18, 25]), fee = r.pick([10, 20, 30, 45]);
    if (lv === 1) {
      const n = r.int(2, 9), val = rate * n + fee;
      return {
        prompt: `C(n) = ${rate}n + ${fee} gives the cost in dollars for ${nm} to rent a kayak for n hours. What does C(${n}) = ${val} mean?`,
        answer: choice(r, `Renting for ${n} hours costs $${val}`, [[`Renting for ${val} hours costs $${n}`, "The input (hours) is inside the parentheses."], [`Each hour costs $${val}`, `$${val} is the total for ${n} hours.`], [`${nm} can rent for ${n} more hours with $${val}`, "C(n) is the cost of n hours in total."]]),
        hints: ["The number inside the parentheses is the input: hours.", "The value on the other side is the output: dollars."],
        steps: [st("Input.", `n = ${n} hours`), st("Output.", `C(${n}) = ${val} dollars`), st("Sentence.", `${n} hours cost $${val}.`)],
      };
    }
    if (lv === 2) {
      const n = r.int(3, 12), total = rate * n + fee;
      return {
        prompt: `C(n) = ${rate}n + ${fee} gives the cost in dollars to rent a kayak for n hours. Solve C(n) = ${total} and give n.`,
        answer: num(n),
        hints: [`Set ${rate}n + ${fee} = ${total}.`, `Subtract ${fee}, then divide by ${rate}.`],
        steps: [st("Set up.", `${rate}n + ${fee} = ${total}`), st(`Subtract ${fee}.`, `${rate}n = ${total - fee}`), st(`Divide by ${rate}.`, `n = ${n} hours`)],
        traps: traps(frac(n), [trap(rate * total + fee, `That's C(${total}). Here the output is given; solve for n.`), trap(frac(total, rate), `Subtract the $${fee} fee before dividing.`)]),
      };
    }
    const P0 = r.pick([500, 800, 1200]), g = r.pick([1.1, 1.2]), t = r.int(2, 4);
    const v = Math.round(P0 * g ** t * 100) / 100;
    return {
      prompt: `P(t) = ${P0}(${f(g)})^t models the number of subscribers to a channel t months after launch. Which statement says "after ${t} months the channel has about ${f(v)} subscribers"?`,
      answer: choice(r, `P(${t}) = ${f(v)}`, [[`P(${f(v)}) = ${t}`, "The input inside the parentheses is the time t."], [`P(${t}) = ${P0}`, `${P0} is the number at launch, P(0).`], [`P(0) = ${f(v)}`, "P(0) is the starting number at launch."]]),
      hints: ["Which quantity is the input t? Which is the output P?", "Input goes inside the parentheses."],
      steps: [st("Input.", `t = ${t} months`), st("Output.", `about ${f(v)} subscribers`), st("Write it.", `P(${t}) = ${f(v)}`)],
    };
  },
};

// ---------- key features from graphs ----------

function quadPlot(a: number, p: number, q: number, extra: Partial<Extract<Visual, { type: "plot" }>> = {}): Visual {
  const c = quadCoefs(a, p, q);
  const h = (p + q) / 2, k = evalPoly(c, h);
  const ys = [k, c[2], 0];
  return { type: "plot", xMin: Math.min(p, q, 0) - 3, xMax: Math.max(p, q, 0) + 3, yMin: Math.floor(Math.min(...ys)) - 3, yMax: Math.ceil(Math.max(...ys)) + 3, curves: [{ expr: polyExpr(c) }], ...extra };
}

const keyFeatures: Skill = {
  id: "m1.func.key-features",
  title: "Key features of a graph",
  topic: T,
  standards: ["NC.M1.F-IF.4", "NC.M1.F-IF.7"],
  prereqs: ["m1.func.evaluate"],
  lesson: {
    bigIdea: "Read a graph's story: where it crosses the axes (intercepts), its highest or lowest point (max/min), where it rises or falls, and where it's above or below the x-axis.",
    explain: [
      "**x-intercepts** (zeros): where y = 0. **y-intercept**: where x = 0.",
      "**Increasing** on an interval means the graph rises as you move right; **decreasing** means it falls. Describe intervals with x-values: \"increasing for x < 2\".",
      "**Positive** where the graph is above the x-axis, **negative** where it's below.",
      "Worked example: the parabola shown has zeros at x = −1 and x = 5, a maximum of 9 at x = 2, y-intercept 5, increases for x < 2, decreases for x > 2, and is positive for −1 < x < 5.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 7, yMin: -4, yMax: 11, curves: [{ expr: "-(x+1)(x-5)" }], points: [{ x: 2, y: 9, label: "(2, 9)" }, { x: -1, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }] },
    tip: "Intervals of increase and decrease use x-values, never y-values.",
  },
  why: [
    { kind: "choice", prompt: "A parabola has its vertex at (3, −4) and opens up. Why does it decrease for x < 3?", choices: ["Moving right toward the lowest point, the graph goes down until x = 3, then rises.", "Because −4 is negative.", "Because all parabolas decrease on the left."], correct: 0, explain: "An upward parabola falls to its minimum, then rises." },
    { kind: "written", prompt: "Explain the difference between where a function is positive and where it is increasing.", keyIdeas: ["positive means the y-values are above 0 (above the x-axis)", "increasing means the y-values are getting larger as x increases", "a graph can be positive and decreasing at the same time"], exemplar: "Positive is about the location of the graph: y > 0, above the x-axis. Increasing is about direction: y gets bigger as x moves right. A graph can be above the axis but heading down, so it's positive and decreasing there." },
  ],
  generate(r, lv) {
    const a = r.pick([1, -1]);
    let p = r.int(-5, 3), q = p + 2 * r.int(1, 3);
    if (r.chance(0.3)) { p = -p; q = -q; [p, q] = [Math.min(p, q), Math.max(p, q)]; }
    const c = quadCoefs(a, p, q);
    const h = (p + q) / 2, k = evalPoly(c, h);
    const visual = quadPlot(a, p, q);
    const fname = r.pick(["f", "g", "h"]);
    if (lv === 1) {
      const ask = r.pick(["zeros", "yint", "ext"] as const);
      if (ask === "zeros") return {
        prompt: `What are the x-intercepts of the graph of ${fname} shown?`,
        visual,
        answer: { kind: "multi", fields: [{ value: frac(p), pre: "x =" }, { value: frac(q), pre: "x =" }], anyOrder: [0, 1] },
        hints: ["x-intercepts are where the graph crosses the x-axis.", "At those points y = 0. Read the x-values."],
        steps: [st("Find where the graph meets the x-axis.", `At x = ${ms(p)} and x = ${ms(q)}.`)],
      };
      if (ask === "yint") return {
        prompt: `What is the y-intercept of the graph of ${fname} shown?`,
        visual,
        answer: num(c[2]),
        hints: ["The y-intercept is where the graph crosses the y-axis.", "That's the output when x = 0."],
        steps: [st("Find where x = 0.", `The graph crosses the y-axis at (0, ${ms(c[2])}).`)],
        traps: traps(frac(c[2]), [trap(p, "That's an x-intercept. The y-intercept is on the vertical axis."), trap(k, "That's the vertex's y-value.")]),
      };
      return {
        prompt: `What is the ${a < 0 ? "maximum" : "minimum"} value of ${fname}?`,
        visual,
        answer: num(k),
        hints: [`Find the ${a < 0 ? "highest" : "lowest"} point of the graph (the vertex).`, "The max or min VALUE is the y-coordinate of that point."],
        steps: [st("Find the vertex.", pt(h, k)), st(`${a < 0 ? "Maximum" : "Minimum"} value.`, `The y-coordinate: ${ms(k)}.`)],
        traps: traps(frac(k), [trap(h, "That's where the extreme happens (x). The value is the y-coordinate.")]),
      };
    }
    if (lv === 2) {
      const inc = a < 0 ? `x < ${f(h)}` : `x > ${f(h)}`;
      const dec = a < 0 ? `x > ${f(h)}` : `x < ${f(h)}`;
      const askInc = r.chance(0.5);
      const right = askInc ? inc : dec;
      return {
        prompt: `Over which interval is ${fname} ${askInc ? "increasing" : "decreasing"}?`,
        visual,
        answer: choice(r, right, [[askInc ? dec : inc, `On that interval the graph ${askInc ? "falls" : "rises"} as you move right.`], [`y < ${f(k)}`, "Intervals of increase and decrease are described with x-values."], [`${f(p)} < x < ${f(q)}`, "That's where the graph is " + (a < 0 ? "above" : "below") + " the x-axis, not where it rises or falls."]]),
        hints: ["Trace the graph from left to right.", `It changes direction at the vertex, x = ${f(h)}.`],
        steps: [st("Vertex.", pt(h, k)), st("Direction.", a < 0 ? `Rises until x = ${f(h)}, then falls.` : `Falls until x = ${f(h)}, then rises.`), st("Answer.", `${askInc ? "Increasing" : "Decreasing"} for ${right}.`)],
      };
    }
    const askPos = r.chance(0.5);
    const between = `${f(p)} < x < ${f(q)}`, outside = `x < ${f(p)} or x > ${f(q)}`;
    const right = (a < 0) === askPos ? between : outside;
    return {
      prompt: `For which x-values is ${fname}(x) ${askPos ? "> 0" : "< 0"}?`,
      visual,
      answer: choice(r, right, [[right === between ? outside : between, `Check: is the graph above or below the x-axis there?`], [a < 0 ? `x < ${f(h)}` : `x > ${f(h)}`, "That's where the function is increasing, not where it's positive or negative."], [`${ms(Math.min(k, 0))} < y < ${ms(Math.max(k, 0))}`, "The question asks for x-values."]]),
      hints: [`${fname}(x) ${askPos ? "> 0" : "< 0"} means the graph is ${askPos ? "above" : "below"} the x-axis.`, `The graph crosses the x-axis at ${ms(p)} and ${ms(q)}.`],
      steps: [st("Zeros.", `x = ${ms(p)} and x = ${ms(q)}`), st(`Where is it ${askPos ? "above" : "below"} the axis?`, right)],
    };
  },
};

// ---------- domain and range ----------

const domainRange: Skill = {
  id: "m1.func.domain-range",
  title: "Domain and range",
  topic: T,
  standards: ["NC.M1.F-IF.5", "NC.M1.F-IF.7"],
  prereqs: ["m1.func.key-features"],
  lesson: {
    bigIdea: "The domain is every input the function allows (x-values); the range is every output it produces (y-values). Context can restrict both.",
    explain: [
      "Graph: read the domain left to right and the range bottom to top. A filled dot includes the endpoint (≤); an open dot excludes it (<).",
      "y = (x − 1)^2 + 2 is defined for every x, so the domain is all real numbers. Its lowest point is 2, so the range is **y ≥ 2**.",
      "Context: if C(n) = 9n is the cost of n movie tickets and the theater holds 150 people, the domain is the whole numbers 0, 1, 2, …, 150. You can't buy 2.5 tickets.",
      "Exponential functions like y = 3·2^x have domain all real numbers and range y > 0: the graph gets close to 0 but never reaches it.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 5, yMin: -1, yMax: 10, curves: [{ expr: "(x-1)^2+2" }], hlines: [{ y: 2, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the domain of \"cost of n concert tickets\" not all real numbers?", choices: ["n must be a whole number from 0 up to the number of tickets available.", "Because costs can't be negative.", "Because the range is limited."], correct: 0, explain: "You can only buy whole tickets, and only so many exist." },
    { kind: "written", prompt: "A ball's height is h(t) for 0 ≤ t ≤ 4 seconds, peaking at 64 feet and landing at t = 4. Explain the domain and range.", keyIdeas: ["domain: times 0 ≤ t ≤ 4 (from throw to landing)", "range: heights from 0 up to the max 64", "0 ≤ h ≤ 64 assuming it starts at or above the ground"], exemplar: "The domain is the time the ball is in the air, 0 ≤ t ≤ 4 seconds. The range is the heights it reaches, from the ground (0 ft) up to its maximum, so 0 ≤ h ≤ 64." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const price = r.pick([8, 9, 12, 15]), cap = r.pick([40, 60, 120, 150]);
      const item = r.pick(["tickets to a show", "T-shirts from a limited drop", "seats on a bus tour"]);
      return {
        prompt: `C(n) = ${price}n is the cost in dollars of n ${item}. Only ${cap} are available. What is the domain of C in this context?`,
        answer: choice(r, `The whole numbers 0, 1, 2, …, ${cap}`, [[`All real numbers from 0 to ${cap}`, `You can't buy a fraction of one, so n must be a whole number.`], [`The whole numbers 0, ${price}, ${2 * price}, …, ${price * cap}`, "Those are possible costs: that's the range."], ["All real numbers", `n can't be negative or more than ${cap}, and must be whole.`]]),
        hints: ["The domain is the set of possible inputs n.", "Can n be a fraction? Can it be more than the number available?"],
        steps: [st("Inputs.", `n counts ${item}, so it's a whole number.`), st("Limits.", `From 0 up to ${cap}.`), st("Domain.", `0, 1, 2, …, ${cap}`)],
      };
    }
    if (lv === 2) {
      // A parabola piece with endpoints.
      const a = r.pick([1, -1]), h = r.int(-2, 2), k = r.int(-3, 3);
      const lo = h - r.int(1, 3), hi = h + r.int(1, 3);
      const yEnd = [a * (lo - h) ** 2 + k, a * (hi - h) ** 2 + k];
      const loOpen = r.chance(0.4), hiOpen = r.chance(0.4);
      const ext = a > 0 ? Math.max(...yEnd) : Math.min(...yEnd);
      // which endpoint gives the far end of the range
      const extOpen = (yEnd[0] === ext && loOpen && (yEnd[1] !== ext || hiOpen)) || (yEnd[1] === ext && hiOpen && (yEnd[0] !== ext || loOpen));
      const askRange = r.chance(0.6);
      const dom = `${f(lo)} ${loOpen ? "<" : "≤"} x ${hiOpen ? "<" : "≤"} ${f(hi)}`;
      const rng = a > 0 ? `${f(k)} ≤ y ${extOpen ? "<" : "≤"} ${f(ext)}` : `${f(ext)} ${extOpen ? "<" : "≤"} y ≤ ${f(k)}`;
      const visual: Visual = { type: "plot", xMin: lo - 2, xMax: hi + 2, yMin: Math.min(k, ...yEnd) - 2, yMax: Math.max(k, ...yEnd) + 2, curves: [{ expr: `${a}(x-(${h}))^2+(${k})`, domain: [lo, hi] }], points: [{ x: lo, y: yEnd[0], open: loOpen }, { x: hi, y: yEnd[1], open: hiOpen }] };
      const right = askRange ? rng : dom;
      const wrongs: [string, string][] = askRange
        ? [[dom.replace(/x/g, "y"), "That uses the x-values. The range is the set of y-values."], [a > 0 ? `${f(Math.min(...yEnd))} ≤ y ≤ ${f(ext)}` : `${f(ext)} ≤ y ≤ ${f(Math.max(...yEnd))}`, `The ${a > 0 ? "lowest" : "highest"} point is the vertex, y = ${f(k)}, not an endpoint.`], [a > 0 ? `y ≥ ${f(k)}` : `y ≤ ${f(k)}`, "The graph stops at its endpoints, so the range is limited."]]
        : [[rng.replace(/y/g, "x"), "Those are y-values. The domain is the set of x-values."], [`${f(lo)} ≤ x ≤ ${f(hi)}`, "Check the endpoints: open dots aren't included."], ["All real numbers", "The graph has endpoints, so x is limited."]];
      return {
        prompt: `What is the ${askRange ? "range" : "domain"} of the function graphed?`,
        visual,
        answer: choice(r, right, wrongs.filter(([w]) => w !== right)),
        hints: [askRange ? "Range: read the y-values from the lowest point to the highest point." : "Domain: read the x-values from the left end to the right end.", "Open dots are not included (<); filled dots are (≤)."],
        steps: askRange ? [st("Lowest and highest points.", a > 0 ? `Lowest: vertex y = ${f(k)}. Highest: endpoint y = ${f(ext)}${extOpen ? " (open dot, not included)" : ""}.` : `Highest: vertex y = ${f(k)}. Lowest: endpoint y = ${f(ext)}${extOpen ? " (open dot, not included)" : ""}.`), st("Range.", rng)] : [st("Left and right ends.", `x = ${f(lo)} (${loOpen ? "open" : "filled"}) to x = ${f(hi)} (${hiOpen ? "open" : "filled"})`), st("Domain.", dom)],
      };
    }
    const kind = r.pick(["quad", "exp"]);
    if (kind === "quad") {
      const a = r.pick([1, -1, 2, -2]), h = r.int(-3, 3), k = r.int(-5, 5);
      const right = a > 0 ? `Domain: all real numbers; range: y ≥ ${f(k)}` : `Domain: all real numbers; range: y ≤ ${f(k)}`;
      return {
        prompt: `What are the domain and range of f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}(x ${h < 0 ? "+" : "−"} ${Math.abs(h)})^2 ${k < 0 ? "−" : "+"} ${Math.abs(k)}?`,
        visual: { type: "plot", xMin: h - 5, xMax: h + 5, yMin: Math.min(k, 0) - 6, yMax: Math.max(k, 0) + 6, curves: [{ expr: `${a}(x-(${h}))^2+(${k})` }] },
        answer: choice(r, right, [[a > 0 ? `Domain: all real numbers; range: y ≤ ${f(k)}` : `Domain: all real numbers; range: y ≥ ${f(k)}`, `The parabola opens ${a > 0 ? "up" : "down"}, so ${f(k)} is a ${a > 0 ? "minimum" : "maximum"}.`], [`Domain: x ≥ ${f(h)}; range: all real numbers`, "Any x can be squared, so the domain is all real numbers; the range is limited by the vertex."], [`Domain: all real numbers; range: y ≥ ${f(h)}`, "The vertex's y-coordinate limits the range, not its x-coordinate."]]),
        hints: ["Can you substitute any x into this rule?", `The vertex is (${f(h)}, ${f(k)}). Does the parabola open up or down?`],
        steps: [st("Domain.", "Any real x works in a polynomial: all real numbers."), st("Range.", `Vertex (${f(h)}, ${f(k)}); opens ${a > 0 ? "up" : "down"}, so y ${a > 0 ? "≥" : "≤"} ${f(k)}.`)],
      };
    }
    const a0 = r.int(2, 6), b0 = r.pick([2, 3, 0.5]);
    return {
      prompt: `What is the range of f(x) = ${a0}(${f(b0)})^x?`,
      visual: { type: "plot", xMin: -4, xMax: 4, yMin: -2, yMax: 20, curves: [{ expr: `${a0}(${b0})^x` }], hlines: [{ y: 0, dashed: true }] },
      answer: choice(r, "y > 0", [["y ≥ 0", "The graph gets closer and closer to 0 but never reaches it."], [`y ≥ ${a0}`, `${a0} is the y-intercept, but the graph goes below it on the ${b0 > 1 ? "left" : "right"}.`], ["All real numbers", "A positive number times a power of a positive base is always positive."]]),
      hints: ["Can a·b^x ever be zero or negative when a and b are positive?", `What happens to the graph as x goes far to the ${b0 > 1 ? "left" : "right"}?`],
      steps: [st("Sign.", `${a0} > 0 and (${f(b0)})^x > 0 for every x, so f(x) > 0.`), st("Approaching 0.", `As x → ${b0 > 1 ? "−∞" : "∞"}, f(x) gets close to 0 but never equals it.`), st("Range.", "y > 0")],
    };
  },
};

// ---------- average rate of change ----------

const rateOfChange: Skill = {
  id: "m1.func.rate-of-change",
  title: "Average rate of change",
  topic: T,
  standards: ["NC.M1.F-IF.6"],
  prereqs: ["m1.func.evaluate", "m1.coord.slope"],
  lesson: {
    bigIdea: "Average rate of change from x = a to x = b is {f(b) − f(a)/b − a}: the slope of the segment joining those two points on the graph.",
    explain: [
      "For a line it's the same everywhere (the slope). For curves it depends on the interval.",
      "Worked example: f(x) = x^2 from x = 1 to x = 4: {f(4) − f(1)/4 − 1} = {16 − 1/3} = **5**.",
      "In context, give units: a car's distance goes from 30 miles at t = 1 h to 150 miles at t = 3 h, so its average rate is {150 − 30/3 − 1} = **60 miles per hour**.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 5, yMin: -1, yMax: 18, curves: [{ expr: "x^2" }, { expr: "5x-4", domain: [1, 4], dashed: true, color: 2 }], points: [{ x: 1, y: 1, label: "(1, 1)" }, { x: 4, y: 16, label: "(4, 16)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the average rate of change of x^2 different on [0, 1] and [3, 4]?", choices: ["The curve gets steeper as x grows, so the output changes more over the later interval.", "Because the intervals have different widths.", "It isn't different."], correct: 0, explain: "0 → 1 changes by 1; 9 → 16 changes by 7." },
    { kind: "written", prompt: "Explain why the average rate of change of a linear function is the same on every interval.", keyIdeas: ["a line has constant slope", "equal steps in x give equal changes in y", "so change in y ÷ change in x is always m"], exemplar: "A linear function changes by the same amount m for every 1-unit step in x, so over any interval the change in y divided by the change in x is m. That's why its average rate of change is constant." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const xs = [0, 1, 2, 3, 4, 5];
      const c = [r.pick([1, -1, 2]), r.int(-4, 4), r.int(-5, 5)];
      const ys = xs.map((x) => evalPoly(c, x));
      const a = r.int(0, 3), b = a + r.int(1, 5 - a);
      const ans = frac(ys[b] - ys[a], b - a);
      return {
        prompt: `Using the table, find the average rate of change of f from x = ${a} to x = ${b}.`,
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...ys]] },
        answer: num(ans),
        hints: [`Read f(${a}) and f(${b}) from the table.`, `Compute (f(${b}) − f(${a})) ÷ (${b} − ${a}).`],
        steps: [st("Read the values.", `f(${a}) = ${ms(ys[a])}, f(${b}) = ${ms(ys[b])}`), st("Divide the changes.", `{${ms(ys[b])} − ${sn(ys[a])}/${b} − ${a}} = {${ms(ys[b] - ys[a])}/${b - a}} = ${fracMark(ans)}`)],
        traps: traps(ans, [trap(ys[b] - ys[a], `Divide by the change in x, ${b - a}.`), ...(ys[b] !== ys[a] ? [trap(frac(b - a, ys[b] - ys[a]), "That's change in x over change in y. Flip it.")] : [])]),
      };
    }
    if (lv === 2) {
      const c = [r.nonzero(-3, 3), r.int(-6, 6), r.int(-8, 8)];
      const a = r.int(-3, 1), b = a + r.int(2, 4);
      const fa = evalPoly(c, a), fb = evalPoly(c, b);
      const ans = frac(fb - fa, b - a);
      return {
        prompt: `f(x) = ${poly(c)}. Find the average rate of change of f over the interval ${ms(a)} ≤ x ≤ ${ms(b)}.`,
        answer: num(ans),
        hints: [`Find f(${ms(a)}) and f(${ms(b)}).`, "Average rate of change = (change in f) ÷ (change in x)."],
        steps: [st("Evaluate the endpoints.", `f(${ms(a)}) = ${ms(fa)}, f(${ms(b)}) = ${ms(fb)}`), st("Divide.", `{${ms(fb)} − ${sn(fa)}/${ms(b)} − ${sn(a)}} = {${ms(fb - fa)}/${b - a}} = ${fracMark(ans)}`)],
        traps: traps(ans, [trap(fb - fa, `Divide by the change in x, ${b - a}.`), trap(frac(fb + fa, b - a), "Subtract the outputs; don't add them.")]),
      };
    }
    const kind = r.pick(["exp", "trip"]);
    if (kind === "exp") {
      const a0 = r.pick([50, 100, 200]), base = 2;
      const t1 = r.int(0, 2), t2 = t1 + r.int(2, 3);
      const v1 = a0 * base ** t1, v2 = a0 * base ** t2;
      const ans = frac(v2 - v1, t2 - t1);
      return {
        prompt: `The number of views of a video t days after posting is modeled by V(t) = ${a0}(2)^t. What is the average rate of change of V from day ${t1} to day ${t2}, in views per day?`,
        answer: num(ans),
        hints: [`Find V(${t1}) and V(${t2}).`, `Then (V(${t2}) − V(${t1})) ÷ (${t2} − ${t1}).`],
        steps: [st("Evaluate.", `V(${t1}) = ${a0}(2)^${t1} = ${v1}; V(${t2}) = ${a0}(2)^${t2} = ${v2}`), st("Divide.", `{${v2} − ${v1}/${t2} − ${t1}} = {${v2 - v1}/${t2 - t1}} = ${fracMark(ans)} views per day`)],
        traps: traps(ans, [trap(v2 - v1, `Divide by the number of days, ${t2 - t1}.`)]),
      };
    }
    const t1 = r.int(1, 3), t2 = t1 + r.int(2, 4);
    const sp = r.pick([45, 50, 55, 60, 65]);
    const d1 = r.int(20, 60), d2 = d1 + sp * (t2 - t1);
    return {
      prompt: `On a road trip, ${r.pick(NAMES)} has driven ${d1} miles after ${t1} hours and ${d2} miles after ${t2} hours. What is the average rate of change of distance over that time, in miles per hour?`,
      answer: num(sp),
      hints: ["Change in distance ÷ change in time.", `(${d2} − ${d1}) ÷ (${t2} − ${t1})`],
      steps: [st("Change in distance.", `${d2} − ${d1} = ${d2 - d1} miles`), st("Change in time.", `${t2} − ${t1} = ${t2 - t1} hours`), st("Rate.", `${d2 - d1} ÷ ${t2 - t1} = ${sp} miles per hour`)],
      traps: traps(frac(sp), [trap(frac(d2, t2), "That's the average since the start of the trip. Use the change between the two times."), trap(d2 - d1, "Divide by the change in time.")]),
    };
  },
};

// ---------- f(x) = g(x) from graphs and tables ----------

const intersections: Skill = {
  id: "m1.func.intersections",
  title: "Solve f(x) = g(x) with graphs and tables",
  topic: T,
  standards: ["NC.M1.A-REI.11"],
  prereqs: ["m1.func.key-features", "m1.sys.solve-graph"],
  lesson: {
    bigIdea: "The solutions of f(x) = g(x) are the x-coordinates of the points where the graphs of f and g intersect.",
    explain: [
      "To solve x^2 − 1 = x + 1, graph y = x^2 − 1 and y = x + 1. They meet at (−1, 0) and (2, 3), so the solutions are **x = −1 and x = 2**.",
      "Only the x-coordinates answer the equation. The y-values tell you what both sides equal there.",
      "With a table, look for an x where f and g give the same output, or where the one that was smaller becomes larger: the solution lies between those x-values. A graphing calculator's intersect tool finds it precisely.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 4, yMin: -3, yMax: 8, curves: [{ expr: "x^2-1" }, { expr: "x+1", color: 2 }], points: [{ x: -1, y: 0, label: "(−1, 0)" }, { x: 2, y: 3, label: "(2, 3)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why are the solutions of f(x) = g(x) the x-coordinates of the intersection points?", choices: ["At those x-values both functions give the same output, which is exactly what f(x) = g(x) says.", "Because intersections are always on the x-axis.", "Because the y-coordinates are always 0 there."], correct: 0, explain: "Same input, same output on both graphs." },
    { kind: "written", prompt: "A table shows f(3) = 10, g(3) = 12, f(4) = 15, g(4) = 13. Explain what you can conclude about solving f(x) = g(x).", keyIdeas: ["f is below g at x = 3 and above g at x = 4", "they switch order between 3 and 4", "so a solution lies between x = 3 and x = 4"], exemplar: "At x = 3, f is less than g, but at x = 4, f is greater than g. Since they switch places, the graphs cross somewhere between x = 3 and x = 4, so f(x) = g(x) has a solution in that interval." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const r1 = r.int(-4, 1), r2v = r1 + r.int(1, 5);
      const m = lv === 1 ? 0 : r.nonzero(-2, 2), c0 = r.int(-3, 4);
      const a = r.pick([1, -1]);
      // f(x) = g(x) + a(x − r1)(x − r2)
      const q = quadCoefs(a, r1, r2v);
      const fc = [q[0], q[1] + m, q[2] + c0];
      const g = (x: number) => m * x + c0;
      const ys = [g(r1), g(r2v), evalPoly(fc, (r1 + r2v) / 2)];
      const visual: Visual = { type: "plot", xMin: r1 - 3, xMax: r2v + 3, yMin: Math.floor(Math.min(...ys)) - 3, yMax: Math.ceil(Math.max(...ys)) + 3, curves: [{ expr: polyExpr(fc), label: "f" }, { expr: lineTyped(m, c0), color: 2, label: "g" }] };
      return {
        prompt: `The graphs of f(x) = ${poly(fc)} and g(x) = ${lineText(m, c0)} are shown. What are the solutions of f(x) = g(x)?`,
        visual,
        answer: { kind: "multi", fields: [{ value: frac(r1), pre: "x =" }, { value: frac(r2v), pre: "x =" }], anyOrder: [0, 1] },
        hints: ["Find where the two graphs cross.", "The solutions are the x-coordinates of the crossing points."],
        steps: [st("Intersection points.", `${pt(r1, g(r1))} and ${pt(r2v, g(r2v))}`), st("Solutions.", `x = ${ms(r1)} and x = ${ms(r2v)}`), st("Check one.", `f(${ms(r1)}) = ${ms(evalPoly(fc, r1))} and g(${ms(r1)}) = ${ms(g(r1))} ✓`)],
      };
    }
    const a0 = r.pick([1, 2, 3]), m = r.int(4, 9), c0 = r.int(5, 20);
    const xs = [0, 1, 2, 3, 4, 5, 6, 7];
    const fv = xs.map((x) => a0 * 2 ** x), gv = xs.map((x) => m * x + c0);
    let k = 1;
    while (k < xs.length && !(fv[k - 1] < gv[k - 1] && fv[k] > gv[k])) k++;
    if (k >= xs.length) k = xs.findIndex((_, i) => i > 0 && fv[i] >= gv[i]);
    const exactHit = fv[k] === gv[k];
    const right = exactHit ? `At x = ${k}` : `Between x = ${k - 1} and x = ${k}`;
    return {
      prompt: `The table shows f(x) = ${a0 === 1 ? "" : a0}(2)^x and g(x) = ${m}x + ${c0}. For x ≥ 0, where is the solution of f(x) = g(x)?`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...fv], ["g(x)", ...gv]] },
      answer: choice(r, right, [k - 2, k + 1, k + 2].filter((j) => j >= 1 && j < xs.length).map((j) => [`Between x = ${j - 1} and x = ${j}`, `Compare f and g at x = ${j - 1} and x = ${j}: which one is bigger at each?`] as [string, string]).concat(exactHit ? [[`Between x = ${k - 1} and x = ${k}`, `Look again at x = ${k}: the values are equal.`]] : [[`At x = ${k}`, `f(${k}) = ${fv[k]} and g(${k}) = ${gv[k]} aren't equal.`]])),
      hints: ["Compare the two rows column by column.", "Look for where f goes from less than g to greater than g."],
      steps: [st("Compare.", xs.slice(Math.max(0, k - 2), k + 2).map((x) => `x = ${x}: f = ${fv[x]}, g = ${gv[x]}`).join("; ")), st("Find the switch.", exactHit ? `They're equal at x = ${k}.` : `f < g at x = ${k - 1} and f > g at x = ${k}, so the graphs cross between them.`)],
    };
  },
};

// ---------- compare functions ----------

function rngTable(m: number, b: number, start: number) {
  const xs = [start, start + 1, start + 2, start + 3];
  return { xs, ys: xs.map((x) => m * x + b) };
}

const compare: Skill = {
  id: "m1.func.compare",
  title: "Compare functions in different forms",
  topic: T,
  standards: ["NC.M1.F-IF.9"],
  prereqs: ["m1.func.rate-of-change", "m1.func.key-features"],
  lesson: {
    bigIdea: "To compare functions given different ways (equation, table, graph, words), find the same feature for each one, then compare the numbers.",
    explain: [
      "f(x) = 3x + 2 and a table for g showing (0, 5), (1, 9), (2, 13). Slope of f is 3; g increases by 4 each step, so g has the **greater rate of change**. But f(0) = 2 < g(0) = 5, so g also starts higher.",
      "For quadratics, compare the vertex: f(x) = −(x − 1)^2 + 6 has maximum 6; a graph whose highest point is (−2, 4) has maximum 4. So f has the greater maximum.",
      "Linear vs. exponential: eventually the exponential wins, even if it starts smaller.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why must you find the same feature for both functions before comparing?", choices: ["Different representations show features differently; comparing slope to y-intercept wouldn't mean anything.", "Because tables are always more accurate.", "Because equations have bigger numbers."], correct: 0, explain: "Compare like with like: rate with rate, intercept with intercept." },
    { kind: "written", prompt: "f(x) = 2x + 10 and g is a table with g(0) = 1, g(1) = 2, g(2) = 4, g(3) = 8. Which is greater at x = 10? Explain.", keyIdeas: ["g doubles each step: g(x) = 2^x", "f(10) = 30", "g(10) = 1024, so g is greater"], exemplar: "f(10) = 2(10) + 10 = 30. The table doubles each step, so g(x) = 2^x and g(10) = 1024. Even though g starts smaller, its growth is exponential, so g is much greater at x = 10." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m1 = r.nonzero(-5, 6), b1 = r.int(-6, 8);
      let m2 = r.nonzero(-5, 6);
      if (m2 === m1) m2 += 1;
      let b2 = r.int(-6, 8);
      if (b2 === b1) b2 += 2;
      const { xs, ys } = rngTable(m2, b2, 0);
      const askRate = r.chance(0.5);
      const fBig = askRate ? m1 > m2 : b1 > b2;
      return {
        prompt: `f(x) = ${lineText(m1, b1)}. The table shows values of a linear function g. Which function has the greater ${askRate ? "rate of change" : "y-intercept"}?`,
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["g(x)", ...ys]] },
        answer: choice(r, fBig ? "f" : "g", [[fBig ? "g" : "f", askRate ? `Rates: f has ${ms(m1)}, g has ${ms(m2)}.` : `y-intercepts: f(0) = ${ms(b1)}, g(0) = ${ms(b2)}.`], ["They are equal", "Compute both and compare again."]], true),
        hints: [askRate ? "f's rate of change is its slope. For g, how much does the output change per step of 1 in x?" : "The y-intercept is the output at x = 0.", "Find the same feature for both, then compare."],
        steps: [st("f.", askRate ? `slope ${ms(m1)}` : `f(0) = ${ms(b1)}`), st("g.", askRate ? `outputs change by ${ms(m2)} per step: slope ${ms(m2)}` : `g(0) = ${ms(b2)} from the table`), st("Compare.", `${fBig ? "f" : "g"} is greater.`)],
      };
    }
    if (lv === 2) {
      const h1 = r.int(-3, 3), k1 = r.int(1, 9);
      const h2 = r.int(-3, 3);
      let k2 = r.int(1, 9);
      if (k2 === k1) k2 += 1;
      const visual: Visual = { type: "plot", xMin: h2 - 5, xMax: h2 + 5, yMin: -6, yMax: Math.max(k2, 0) + 3, curves: [{ expr: `-(x-(${h2}))^2+${k2}` }], points: [{ x: h2, y: k2 }] };
      const fBig = k1 > k2;
      return {
        prompt: `f(x) = −(x ${h1 < 0 ? "+" : "−"} ${Math.abs(h1)})^2 + ${k1}. The graph of g is shown. Which function has the greater maximum value, and what is it?`,
        visual,
        answer: choice(r, `${fBig ? "f" : "g"}, with maximum ${fBig ? k1 : k2}`, [[`${fBig ? "g" : "f"}, with maximum ${fBig ? k2 : k1}`, `Compare: f's maximum is ${k1}, g's is ${k2}.`], [`${h1 > h2 ? "f" : "g"}, with maximum ${ms(Math.max(h1, h2))}`, "The maximum VALUE is the y-coordinate of the vertex."], [`f, with maximum ${ms(-h1 * h1 + k1)}`, "That's f(0). The maximum is at the vertex."]].filter(([w]) => w !== `${fBig ? "f" : "g"}, with maximum ${fBig ? k1 : k2}`) as [string, string][]),
        hints: ["In vertex form −(x − h)^2 + k, the maximum value is k.", "For the graph, read the y-coordinate of the highest point."],
        steps: [st("f's vertex.", `(${f(h1)}, ${k1}): maximum ${k1}`), st("g's vertex.", `(${f(h2)}, ${k2}): maximum ${k2}`), st("Compare.", `${fBig ? "f" : "g"} has the greater maximum, ${Math.max(k1, k2)}.`)],
      };
    }
    const m = r.int(10, 30), b = r.int(20, 60), a0 = r.pick([1, 2, 3]);
    const X = r.pick([4, 5, 8, 10]);
    const fX = m * X + b, gX = a0 * 2 ** X;
    const xs = [0, 1, 2, 3];
    return {
      prompt: `Plan F gives a gamer f(x) = ${m}x + ${b} points after x levels. Plan G is shown in the table, doubling each level. Which plan gives more points at level ${X}, and how many?`,
      visual: { type: "table", headers: ["Level x", ...xs.map(String)], rows: [["g(x)", ...xs.map((x) => a0 * 2 ** x)]] },
      answer: num(Math.max(fX, gX)),
      hints: [`Find a rule for g: it starts at ${a0} and doubles, so g(x) = ${a0 === 1 ? "" : a0}(2)^x.`, `Compute f(${X}) and g(${X}) and take the larger.`],
      steps: [st("Rule for g.", `g(x) = ${a0 === 1 ? "" : a0}(2)^x`), st("Evaluate both.", `f(${X}) = ${m}(${X}) + ${b} = ${fX}; g(${X}) = ${a0}(2)^${X} = ${gX}`), st("Compare.", `${gX > fX ? "Plan G" : "Plan F"} gives more: ${Math.max(fX, gX)} points.`)],
      traps: traps(frac(Math.max(fX, gX)), [trap(Math.min(fX, gX), "That's the smaller plan."), trap(a0 * 2 * X, "Doubling each level means multiplying by 2 again and again: 2^x, not 2x.")]),
    };
  },
};

export default [isFunction, evaluate, notationContext, keyFeatures, domainRange, rateOfChange, intersections, compare];
