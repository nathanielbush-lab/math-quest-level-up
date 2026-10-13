// Unit 4: Graphing lines, systems of equations and inequalities
// (NC.M1.A-CED.2, A-CED.3, A-CED.4, A-REI.5, A-REI.6, A-REI.10, A-REI.12).
import { choice, expr, ms, num, sn, term, trap, traps, NAMES } from "../helpers";
import { frac, lcm, type Frac } from "../../lib/rational";
import type { Rng } from "../../lib/rng";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { f, fracMark, fracText, lineText, lineTyped, pt, times, times2 } from "./util";

const T = "m1-systems";

/** "3x − 2y = 8" with zero/one coefficients handled. */
export function stdText(a: number, b: number, c: number): string {
  const xs = a === 0 ? "" : term(a, "x");
  const ys = b === 0 ? "" : xs ? `${b < 0 ? " − " : " + "}${Math.abs(b) === 1 ? "" : Math.abs(b)}y` : term(b, "y");
  return `${xs}${ys} = ${ms(c)}`;
}

const xy = (x: number, y: number): Answer => ({ kind: "multi", fields: [{ value: frac(x), pre: "x =" }, { value: frac(y), pre: "y =" }] });

function windowFor(xs: number[], ys: number[]) {
  return { xMin: Math.min(-2, ...xs) - 3, xMax: Math.max(2, ...xs) + 3, yMin: Math.min(-2, ...ys) - 3, yMax: Math.max(2, ...ys) + 3 };
}

// ---------- graphs of lines ----------

const graphLine: Skill = {
  id: "m1.sys.graph-line",
  title: "Lines: equations and graphs",
  topic: T,
  standards: ["NC.M1.A-CED.2", "NC.M1.A-REI.10"],
  prereqs: ["m1.coord.slope"],
  lesson: {
    bigIdea: "The graph of an equation is every point whose coordinates make the equation true. For y = mx + b, the line crosses the y-axis at b and has slope m.",
    explain: [
      "To read an equation from a graph: find where the line crosses the y-axis (that's b), then count rise over run between two clear grid points (that's m).",
      "Worked example: a line crosses the y-axis at (0, −3) and also passes through (2, 1). Rise 4, run 2, so m = 2 and the line is **y = 2x − 3**.",
      "A point is on the line exactly when it makes the equation true. Is (4, 5) on y = 2x − 3? 2(4) − 3 = 5. Yes. Is (1, 1)? 2(1) − 3 = −1 ≠ 1. No.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 6, yMin: -6, yMax: 8, curves: [{ expr: "2x-3" }], points: [{ x: 0, y: -3, label: "(0, −3)" }, { x: 2, y: 1, label: "(2, 1)" }] },
  },
  why: [
    { kind: "choice", prompt: "The point (3, 7) is on the graph of an equation. What does that tell you?", choices: ["x = 3, y = 7 is a solution: it makes the equation true.", "The slope is {7/3}.", "The line crosses the y-axis at 7."], correct: 0, explain: "A graph is the set of all solutions." },
    { kind: "written", prompt: "Explain how you can tell from a graph whether (2, 4) is a solution of the equation it shows.", keyIdeas: ["find x = 2, y = 4 on the grid", "if the point is on the line, it's a solution", "if it's off the line, it isn't"], exemplar: "Locate (2, 4) on the grid. The graph is made of exactly the points that solve the equation, so if (2, 4) sits on the line it's a solution, and if it's off the line it isn't." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const m = lv === 1 ? frac(r.nonzero(-3, 3)) : frac(r.nonzero(-3, 3), r.pick([2, 3]));
      const b = r.int(-5, 5);
      const x2 = m.d * (r.chance(0.5) ? 1 : 2) * (r.chance(0.5) ? 1 : -1);
      const y2 = (m.n * x2) / m.d + b;
      const visual: Visual = { type: "plot", ...windowFor([x2], [b, y2]), curves: [{ expr: lineTyped(m, b) }], points: [{ x: 0, y: b }, { x: x2, y: y2 }] };
      return {
        prompt: "Write the equation of the line shown in slope-intercept form, y = mx + b.",
        visual,
        answer: expr(lineTyped(m, b), { lhs: "y", display: lineText(m, b) }),
        hints: ["Where does the line cross the y-axis? That's b.", `Count rise over run between (0, ${ms(b)}) and ${pt(x2, y2)}.`],
        steps: [st("Find b.", `The line crosses the y-axis at (0, ${ms(b)}), so b = ${ms(b)}.`), st("Find the slope.", `From (0, ${ms(b)}) to ${pt(x2, y2)}: rise ${ms(y2 - b)}, run ${ms(x2)}, so m = ${fracMark(m)}.`), st("Write the equation.", `y = ${lineText(m, b)}`)],
      };
    }
    const a = r.nonzero(-4, 4), bb = r.nonzero(-4, 4);
    const x0 = r.int(-4, 4), y0 = r.int(-4, 4);
    const c = a * x0 + bb * y0;
    const near = (dx: number, dy: number) => ({ x: x0 + dx, y: y0 + dy });
    const fakes = [near(1, 0), near(0, 1), near(-1, 1), { x: y0, y: x0 }].filter((p) => a * p.x + bb * p.y !== c);
    const m = frac(-a, bb), yInt = frac(c, bb);
    const visual: Visual = { type: "plot", xMin: -8, xMax: 8, yMin: -8, yMax: 8, curves: [{ expr: `(${c}-(${a})x)/(${bb})` }] };
    return {
      prompt: `The graph of ${stdText(a, bb, c)} is shown. Which point is a solution of the equation?`,
      visual,
      answer: choice(r, pt(x0, y0), fakes.slice(0, 3).map((p) => [pt(p.x, p.y), `Substitute: ${times2(a, p.x, bb, p.y)} = ${ms(a * p.x + bb * p.y)}, not ${ms(c)}. The point is off the line.`] as [string, string])),
      hints: ["A point is a solution if it makes the equation true, which is the same as being on the line.", "Substitute each point's x and y into the equation."],
      steps: [st("Test the point.", `${times2(a, x0, bb, y0)} = ${ms(c)} ✓`), st("Connect to the graph.", `${pt(x0, y0)} lies on the line; the line is ${m.n === 0 ? "horizontal" : `y = ${lineText(m, yInt)}`}.`)],
    };
  },
};

// ---------- standard form ----------

const standardForm: Skill = {
  id: "m1.sys.standard-form",
  title: "Standard form and intercepts",
  topic: T,
  standards: ["NC.M1.A-CED.2", "NC.M1.A-CED.4"],
  prereqs: ["m1.sys.graph-line", "m1.eq.literal"],
  lesson: {
    bigIdea: "In Ax + By = C, set y = 0 to find the x-intercept and x = 0 to find the y-intercept; solve for y to get slope-intercept form.",
    explain: [
      "For 3x + 4y = 24: x-intercept: 3x = 24, x = 8. y-intercept: 4y = 24, y = 6. Plot (8, 0) and (0, 6) and connect.",
      "To get slope-intercept form: 4y = −3x + 24, so **y = −{3/4}x + 6**.",
      "Standard form is natural for \"two kinds of things, fixed total\" contexts: $3 shirts and $4 hats with $24 to spend. The x-intercept is how many shirts you could buy with no hats.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 10, yMin: -2, yMax: 8, curves: [{ expr: "-0.75x+6" }], points: [{ x: 8, y: 0, label: "(8, 0)" }, { x: 0, y: 6, label: "(0, 6)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why do you set y = 0 to find the x-intercept?", choices: ["Every point on the x-axis has y-coordinate 0.", "Because x-intercepts are always 0.", "To find the slope."], correct: 0, explain: "The x-intercept is where the graph meets the x-axis, where y = 0." },
    { kind: "written", prompt: "For 5x + 2y = 40 where x is the number of $5 movie rentals and y the number of $2 song downloads, explain what the y-intercept means.", keyIdeas: ["set x = 0 to get y = 20", "it means 20 songs and no movies", "that's how many songs $40 buys"], exemplar: "Setting x = 0 gives 2y = 40, so y = 20. The y-intercept (0, 20) means spending all $40 on songs and none on movies buys 20 songs." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const xi = r.nonzero(-8, 8), yi = r.nonzero(-8, 8);
      // A x + B y = C with intercepts xi, yi: A = C/xi, B = C/yi.
      const C = lcm(Math.abs(xi), Math.abs(yi)) * r.pick([1, 1, 2]);
      const A = C / xi, B = C / yi;
      return {
        prompt: `Find the x- and y-intercepts of ${stdText(A, B, C)}.`,
        answer: { kind: "multi", fields: [{ value: frac(xi), pre: "x-intercept: x =" }, { value: frac(yi), pre: "y-intercept: y =" }] },
        hints: ["At the x-intercept, y = 0.", "At the y-intercept, x = 0."],
        steps: [st("x-intercept: set y = 0.", A === 1 ? `x = ${ms(xi)}` : `${term(A, "x")} = ${ms(C)}, so x = ${ms(xi)}`), st("y-intercept: set x = 0.", B === 1 ? `y = ${ms(yi)}` : `${term(B, "y")} = ${ms(C)}, so y = ${ms(yi)}`)],
      };
    }
    if (lv === 2) {
      const A = r.nonzero(-6, 6), B = r.pick([2, 3, 4, 5, -2, -3]);
      const C = B * r.int(-5, 5);
      const m = frac(-A, B), b = frac(C, B);
      return {
        prompt: `Rewrite ${stdText(A, B, C)} in slope-intercept form.`,
        answer: expr(lineTyped(m, b), { lhs: "y", display: lineText(m, b) }),
        hints: [`Move the x-term to the right side: ${A > 0 ? "subtract" : "add"} ${term(Math.abs(A), "x")}.`, `Divide every term by ${ms(B)}.`],
        steps: [st(`${A > 0 ? "Subtract" : "Add"} ${term(Math.abs(A), "x")} on both sides.`, `${term(B, "y")} = ${term(-A, "x")}${C === 0 ? "" : C > 0 ? ` + ${C}` : ` − ${-C}`}`), st(`Divide every term by ${ms(B)}.`, `y = ${lineText(m, b)}`)],
      };
    }
    const items = r.pick([["shirts", "hats"], ["movie tickets", "snack combos"], ["notebooks", "pens"]]);
    const pa = r.pick([4, 5, 6, 8]), pb = r.pick([2, 3, 4, 10]);
    const total = lcm(pa, pb) * r.int(2, 4);
    const ask = r.pick(["xint", "given"] as const);
    if (ask === "xint") {
      const xi = total / pa;
      return {
        prompt: `A club spends $${total} on ${items[0]} at $${pa} each and ${items[1]} at $${pb} each: ${pa}x + ${pb}y = ${total}. What is the x-intercept, and what does it mean?`,
        answer: choice(r, `${xi}: the club buys ${xi} ${items[0]} and no ${items[1]}`, [[`${total / pb}: the club buys ${total / pb} ${items[1]} and no ${items[0]}`, "That's the y-intercept (x = 0)."], [`${xi}: the club buys ${xi} of each item`, "At the x-intercept, y = 0: none of the second item."], [`${pa}: the price of one of the ${items[0]}`, "The intercept comes from solving with y = 0."]]),
        hints: ["Set y = 0.", `Solve ${pa}x = ${total}.`],
        steps: [st("Set y = 0.", `${pa}x = ${total}, x = ${xi}`), st("Interpret.", `Spending all $${total} on ${items[0]} buys ${xi} of them, with no ${items[1]}.`)],
      };
    }
    let x = r.int(1, Math.floor(total / pa) - 1);
    while ((total - pa * x) % pb !== 0) x = (x % (Math.floor(total / pa) - 1)) + 1;
    const y = (total - pa * x) / pb;
    return {
      prompt: `A club spends exactly $${total} on ${items[0]} at $${pa} each and ${items[1]} at $${pb} each: ${pa}x + ${pb}y = ${total}. If it buys ${x} ${items[0]}, how many ${items[1]} does it buy?`,
      answer: num(y),
      hints: [`Substitute x = ${x}.`, `Solve ${pa}(${x}) + ${pb}y = ${total} for y.`],
      steps: [st("Substitute.", `${pa}(${x}) + ${pb}y = ${total} → ${pa * x} + ${pb}y = ${total}`), st(`Subtract ${pa * x}.`, `${pb}y = ${total - pa * x}`), st(`Divide by ${pb}.`, `y = ${y} ${items[1]}`)],
      traps: traps(frac(y), [trap(total / pb, `Account for the ${x} ${items[0]} first.`), trap(total - pa * x, `Divide by the price, $${pb}.`)]),
    };
  },
};

// ---------- solving systems by graphing and tables ----------

const solveGraph: Skill = {
  id: "m1.sys.solve-graph",
  title: "Solve systems with graphs and tables",
  topic: T,
  standards: ["NC.M1.A-REI.6"],
  prereqs: ["m1.sys.graph-line"],
  lesson: {
    bigIdea: "The solution of a system is the point that's on both lines: where the graphs cross, or where the two table rows give the same y for the same x.",
    explain: [
      "Graph y = x + 1 and y = −2x + 7. They cross at (2, 3). Check: 2 + 1 = 3 and −4 + 7 = 3. ✓",
      "In a table, look for the x-value where both functions give the same output.",
      "Parallel lines never cross: **no solution**. If the two equations describe the same line: **infinitely many solutions**.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 6, yMin: -2, yMax: 8, curves: [{ expr: "x+1" }, { expr: "-2x+7", color: 2 }], points: [{ x: 2, y: 3, label: "(2, 3)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the intersection point the solution of the system?", choices: ["It's the only point on both graphs, so it makes both equations true.", "Because it has the largest y-value.", "Because lines always cross at the origin."], correct: 0, explain: "Each graph is the set of solutions to its own equation; the system needs both." },
    { kind: "written", prompt: "Explain why the system y = 2x + 1 and y = 2x − 3 has no solution.", keyIdeas: ["both lines have slope 2", "different y-intercepts", "parallel lines never intersect, so no point satisfies both"], exemplar: "Both lines have slope 2, so they're parallel, but they cross the y-axis at different places (1 and −3). Parallel lines never meet, so no point is on both: no solution." },
  ],
  generate(r, lv) {
    const x0 = r.int(-4, 4), y0 = r.int(-4, 4);
    const m1 = r.nonzero(-3, 3);
    let m2 = r.nonzero(-3, 3);
    if (m2 === m1) m2 = -m1 === m1 ? m1 + 1 : -m1;
    const b1 = y0 - m1 * x0, b2 = y0 - m2 * x0;
    if (lv < 3) {
      const visual: Visual = { type: "plot", xMin: -7, xMax: 7, yMin: -7, yMax: 7, curves: [{ expr: lineTyped(m1, b1), label: lv === 1 ? `y = ${lineText(m1, b1)}` : undefined }, { expr: lineTyped(m2, b2), color: 2, label: lv === 1 ? `y = ${lineText(m2, b2)}` : undefined }] };
      return {
        prompt: lv === 1 ? `Use the graph to solve the system y = ${lineText(m1, b1)} and y = ${lineText(m2, b2)}.` : "The graph shows a system of two linear equations. What is the solution?",
        visual,
        answer: xy(x0, y0),
        hints: ["The solution is where the two lines cross.", "Read the x-coordinate, then the y-coordinate, of the crossing point."],
        steps: [st("Find the intersection.", `The lines cross at ${pt(x0, y0)}.`), st("Check in both equations.", `${times(m1, x0)}${b1 === 0 ? "" : b1 > 0 ? ` + ${b1}` : ` − ${-b1}`} = ${ms(y0)} and ${times(m2, x0)}${b2 === 0 ? "" : b2 > 0 ? ` + ${b2}` : ` − ${-b2}`} = ${ms(y0)} ✓`)],
      };
    }
    const start = x0 - r.int(0, 4);
    const xs = [0, 1, 2, 3, 4].map((i) => start + i);
    const plans = r.pick([["Plan A", "Plan B"], ["f(x)", "g(x)"]]);
    return {
      prompt: `The table shows values of two linear functions. For which x are they equal, and what is that common value?`,
      visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [[plans[0], ...xs.map((x) => m1 * x + b1)], [plans[1], ...xs.map((x) => m2 * x + b2)]] },
      answer: xy(x0, y0),
      hints: ["Look down each column for the x where both rows show the same number.", "That x and that shared y are the solution."],
      steps: [st("Compare the rows column by column.", xs.map((x) => `x = ${ms(x)}: ${ms(m1 * x + b1)} vs ${ms(m2 * x + b2)}`).join("; ")), st("Read the match.", `At x = ${ms(x0)} both are ${ms(y0)}: the solution is ${pt(x0, y0)}.`)],
    };
  },
};

// ---------- substitution ----------

const substitution: Skill = {
  id: "m1.sys.substitution",
  title: "Solve systems by substitution",
  topic: T,
  standards: ["NC.M1.A-REI.6"],
  prereqs: ["m1.sys.solve-graph", "m1.eq.multi-step"],
  lesson: {
    bigIdea: "If one equation tells you what y (or x) equals, replace it in the other equation, solve the one-variable equation, then substitute back.",
    explain: [
      "Solve y = 2x − 1 and 3x + 2y = 12. Replace y: 3x + 2(2x − 1) = 12 → 7x − 2 = 12 → x = 2.",
      "Substitute back: y = 2(2) − 1 = 3. Solution **(2, 3)**. Check in the other equation: 3(2) + 2(3) = 12. ✓",
      "If both equations start with \"y =\", set the right sides equal to each other.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can you replace y with 2x − 1 in the second equation?", choices: ["At the solution, y really does equal 2x − 1, so they're interchangeable.", "Because the equations are the same.", "Because y is always 2x − 1 for every line."], correct: 0, explain: "The solution must satisfy the first equation, so y and 2x − 1 are equal there." },
    { kind: "written", prompt: "A student solved a system by substitution and got x = 4, then stopped. Explain what's missing and why it matters.", keyIdeas: ["the solution is an ordered pair", "substitute x = 4 back to find y", "a system's solution needs both values"], exemplar: "The solution of a system is a point (x, y), so the student still needs y. Substituting x = 4 into either equation gives y; then the answer is (4, y), and it should be checked in both equations." },
  ],
  generate(r, lv) {
    const x0 = r.int(-6, 6), y0 = r.int(-6, 6);
    if (lv === 1) {
      const m1 = r.nonzero(-4, 5);
      let m2 = r.nonzero(-4, 5);
      if (m2 === m1) m2 = m1 + 2;
      const b1 = y0 - m1 * x0, b2 = y0 - m2 * x0;
      return {
        prompt: `Solve the system: y = ${lineText(m1, b1)} and y = ${lineText(m2, b2)}`,
        answer: xy(x0, y0),
        hints: ["Both equations say what y equals, so set the right sides equal.", `Solve ${lineText(m1, b1)} = ${lineText(m2, b2)} for x, then find y.`],
        steps: [st("Set the expressions equal.", `${lineText(m1, b1)} = ${lineText(m2, b2)}`), st("Collect x-terms and constants.", `${term(m1 - m2, "x")} = ${ms(b2 - b1)}, so x = ${ms(x0)}`), st("Find y.", `y = ${times(m1, x0)}${b1 === 0 ? "" : b1 > 0 ? ` + ${b1}` : ` − ${-b1}`} = ${ms(y0)}`), st("Solution.", pt(x0, y0))],
      };
    }
    if (lv === 2) {
      const m = r.nonzero(-3, 4), b = y0 - m * x0;
      let A = r.nonzero(-5, 5);
      const B = r.nonzero(-4, 4);
      while (A === 0 || A + B * m === 0) A += 1;
      const C = A * x0 + B * y0;
      return {
        prompt: `Solve the system: y = ${lineText(m, b)} and ${stdText(A, B, C)}`,
        answer: xy(x0, y0),
        hints: [`Replace y in the second equation with (${lineText(m, b)}).`, `${term(A, "x")} ${B < 0 ? "−" : "+"} ${Math.abs(B) === 1 ? "" : Math.abs(B)}(${lineText(m, b)}) = ${ms(C)}. Distribute and solve for x.`],
        steps: [st("Substitute.", `${term(A, "x")} ${B < 0 ? "−" : "+"} ${Math.abs(B)}(${lineText(m, b)}) = ${ms(C)}`), st("Distribute.", `${term(A, "x")}${B * m < 0 ? " − " : " + "}${Math.abs(B * m)}x${B * b === 0 ? "" : B * b < 0 ? ` − ${-B * b}` : ` + ${B * b}`} = ${ms(C)}`), st("Combine and solve.", `${term(A + B * m, "x")} = ${ms(C - B * b)}, so x = ${ms(x0)}`), st("Find y.", `y = ${times(m, x0)}${b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`} = ${ms(y0)}`), st("Solution.", pt(x0, y0))],
        traps: [],
      };
    }
    const p = r.nonzero(-3, 3), q = x0 - p * y0;
    let A = r.nonzero(-4, 4);
    const B = r.nonzero(-5, 5);
    while (A === 0 || A * p + B === 0) A += 1;
    const C = A * x0 + B * y0;
    return {
      prompt: `Solve the system: ${stdText(1, -p, q)} and ${stdText(A, B, C)}`,
      answer: xy(x0, y0),
      hints: [`Solve the first equation for x: x = ${p === 1 ? "" : p === -1 ? "−" : ms(p)}y${q === 0 ? "" : q > 0 ? ` + ${q}` : ` − ${-q}`}.`, "Substitute that into the second equation and solve for y. Then find x."],
      steps: [
        st("Solve the first equation for x.", `x = ${term(p, "y")}${q === 0 ? "" : q > 0 ? ` + ${q}` : ` − ${-q}`}`),
        st("Substitute into the second.", `${A === 1 ? "" : A === -1 ? "−" : ms(A)}(${term(p, "y")}${q === 0 ? "" : q > 0 ? ` + ${q}` : ` − ${-q}`}) ${B < 0 ? "−" : "+"} ${term(Math.abs(B), "y")} = ${ms(C)}`),
        st("Simplify and solve.", `${term(A * p + B, "y")}${A * q === 0 ? "" : A * q > 0 ? ` + ${A * q}` : ` − ${-A * q}`} = ${ms(C)}, so y = ${ms(y0)}`),
        st("Find x.", `x = ${times(p, y0)}${q === 0 ? "" : q > 0 ? ` + ${q}` : ` − ${-q}`} = ${ms(x0)}`),
        st("Solution.", pt(x0, y0)),
      ],
    };
  },
};

// ---------- elimination ----------

function elimSystem(r: Rng, lv: number) {
  const x0 = r.int(-5, 6), y0 = r.int(-5, 6);
  let a1 = r.nonzero(-5, 5), b1 = r.nonzero(-5, 5), a2: number, b2: number;
  if (lv === 1) { a2 = r.nonzero(-5, 5); b2 = -b1; if (a2 === -a1) a2 = a2 + 1 || 2; }
  else if (lv === 2) { const k = r.pick([2, 3, -2, -3]); a2 = r.nonzero(-6, 6); b2 = k * b1; if (a2 === k * a1) a2 += 1; if (a2 === 0) a2 = 1; }
  else {
    do {
      a1 = r.pick([2, 3, 4, 5]) * r.sign(); b1 = r.pick([2, 3, 5]) * r.sign();
      a2 = r.pick([3, 4, 5, 6, 7]) * r.sign(); b2 = r.pick([2, 3, 4, 7]) * r.sign();
    } while (a1 * b2 === a2 * b1 || Math.abs(a2) % Math.abs(a1) === 0 || Math.abs(a1) % Math.abs(a2) === 0);
  }
  return { x0, y0, a1, b1, a2, b2, c1: a1 * x0 + b1 * y0, c2: a2 * x0 + b2 * y0 };
}

const elimination: Skill = {
  id: "m1.sys.elimination",
  title: "Solve systems by elimination",
  topic: T,
  standards: ["NC.M1.A-REI.5", "NC.M1.A-REI.6"],
  prereqs: ["m1.sys.substitution"],
  lesson: {
    bigIdea: "Add (or subtract) the equations so one variable cancels. Multiply an equation by a number first if the coefficients don't already match.",
    explain: [
      "3x + 2y = 16 and 5x − 2y = 0: the y-terms are opposites, so add the equations: 8x = 16, x = 2. Then 3(2) + 2y = 16 gives y = 5. Solution **(2, 5)**.",
      "2x + 3y = 12 and x − y = 1: multiply the second equation by 3 to get 3x − 3y = 3, then add: 5x = 15, x = 3, and y = 2.",
      "Multiplying a whole equation by a nonzero number doesn't change its solutions, and adding two true equations gives another true equation. That's why the new system has the same solution.",
    ],
    tip: "Multiply EVERY term, including the constant on the right side.",
  },
  why: [
    { kind: "choice", prompt: "Why does adding two equations of a system keep the same solution?", choices: ["At the solution both equations are true, and adding equal amounts to equal amounts gives equal results.", "Because the variables cancel.", "Because adding makes the numbers bigger."], correct: 0, explain: "If a = b and c = d, then a + c = b + d." },
    { kind: "written", prompt: "Explain why you can multiply 2x − y = 4 by 3 before adding it to another equation without changing the system's solution.", keyIdeas: ["3(2x − y) = 3(4) is true exactly when 2x − y = 4 is true", "multiplying both sides by a nonzero number gives an equivalent equation", "so the same (x, y) pairs work"], exemplar: "Multiplying both sides by 3 gives 6x − 3y = 12, which is true for exactly the same (x, y) pairs as 2x − y = 4, because you can always divide by 3 to get back. So the system's solution doesn't change." },
  ],
  generate(r, lv) {
    const s = elimSystem(r, lv);
    const { x0, y0, a1, b1, a2, b2, c1, c2 } = s;
    const sysText = `${stdText(a1, b1, c1)} and ${stdText(a2, b2, c2)}`;
    let steps: string[];
    if (lv === 1) {
      steps = [st("The y-terms are opposites. Add the equations.", `${term(a1 + a2, "x")} = ${ms(c1 + c2)}`), st("Solve for x.", `x = ${ms(x0)}`), st("Substitute into the first equation.", `${times(a1, x0)} ${b1 < 0 ? "−" : "+"} ${term(Math.abs(b1), "y")} = ${ms(c1)} → ${term(b1, "y")} = ${ms(c1 - a1 * x0)} → y = ${ms(y0)}`)];
    } else if (lv === 2) {
      const k = b2 / b1;
      steps = [st(`Multiply the first equation by ${ms(-k)} so the y-terms are opposites.`, stdText(-k * a1, -k * b1, -k * c1)), st("Add it to the second equation.", `${term(a2 - k * a1, "x")} = ${ms(c2 - k * c1)}, so x = ${ms(x0)}`), st("Substitute into the first equation.", `${times(a1, x0)} ${b1 < 0 ? "−" : "+"} ${term(Math.abs(b1), "y")} = ${ms(c1)} → y = ${ms(y0)}`)];
    } else {
      const L = lcm(Math.abs(a1), Math.abs(a2));
      const k1 = L / a1, k2 = -L / a2;
      steps = [st("Make the x-coefficients opposites.", `Multiply the first equation by ${ms(k1)}: ${stdText(k1 * a1, k1 * b1, k1 * c1)}. Multiply the second by ${ms(k2)}: ${stdText(k2 * a2, k2 * b2, k2 * c2)}.`), st("Add.", `${term(k1 * b1 + k2 * b2, "y")} = ${ms(k1 * c1 + k2 * c2)}, so y = ${ms(y0)}`), st("Substitute into the first equation.", `${term(a1, "x")} ${b1 < 0 ? "−" : "+"} ${times(Math.abs(b1), y0)} = ${ms(c1)} → ${term(a1, "x")} = ${ms(c1 - b1 * y0)} → x = ${ms(x0)}`)];
    }
    steps.push(st("Check in the second equation.", `${times2(a2, x0, b2, y0)} = ${ms(c2)} ✓`));
    return {
      prompt: `Solve by elimination: ${sysText}`,
      answer: xy(x0, y0),
      hints: [lv === 1 ? "Look at the y-coefficients. What happens if you add the equations?" : lv === 2 ? `Multiply the first equation so its y-term is the opposite of ${term(b2, "y")}.` : "Multiply each equation by a number so the x-coefficients become opposites (use their least common multiple).", "Once one variable cancels, solve for the other, then substitute back."],
      steps,
    };
  },
};

// ---------- equivalent systems ----------

const equivalent: Skill = {
  id: "m1.sys.equivalent",
  title: "Equivalent systems",
  topic: T,
  standards: ["NC.M1.A-REI.5"],
  prereqs: ["m1.sys.elimination"],
  lesson: {
    bigIdea: "Replacing one equation with the sum of it and a multiple of the other gives a new system with exactly the same solutions.",
    explain: [
      "System: x + 2y = 7 and 3x − y = 7. Multiply the first equation by −3 (−3x − 6y = −21) and add it to the second: −7y = −14.",
      "The system x + 2y = 7 and −7y = −14 is **equivalent**: it has the same solution, (3, 2). Elimination is just a chain of equivalent systems that get simpler each time.",
      "Common errors that break equivalence: multiplying only some terms of an equation, or adding the left sides without adding the right sides.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Which change to a system could change its solution?", choices: ["Multiplying only the left side of an equation by 2", "Multiplying both sides of an equation by 2", "Adding the two equations and keeping one original"], correct: 0, explain: "Changing just one side breaks the equation." },
    { kind: "written", prompt: "Explain why the solution of the original system also solves the new equation formed by adding 2 times equation 1 to equation 2.", keyIdeas: ["at the solution, both original equations are true", "2 times a true equation is true", "the sum of two true equations is true"], exemplar: "At the solution, equation 1 is true, so 2 times it is true too. Equation 2 is also true. Adding equal things to equal things keeps them equal, so the new equation is true at the same point." },
  ],
  generate(r, lv) {
    const x0 = r.int(-4, 5), y0 = r.int(-4, 5);
    const a1 = r.pick([1, 2, -1]), b1 = r.nonzero(-4, 4), a2 = r.nonzero(-5, 5);
    let b2 = r.nonzero(-5, 5);
    while (b2 === 0 || a1 * b2 === a2 * b1) b2 += 1;
    const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
    const k = lv === 1 ? r.pick([2, 3]) : r.pick([2, 3, -2, -3, 4]);
    const e1 = stdText(a1, b1, c1), e2 = stdText(a2, b2, c2);
    const good = `${e1} and ${stdText(a2 + k * a1, b2 + k * b1, c2 + k * c1)}`;
    const wrong: [string, string][] = [
      [`${e1} and ${stdText(a2 + k * a1, b2 + k * b1, c2 + c1)}`, `The constant ${ms(c1)} must be multiplied by ${ms(k)} too.`],
      [`${e1} and ${stdText(a2 + k * a1, b2 + b1, c2 + k * c1)}`, `Every term of the first equation must be multiplied by ${ms(k)}, including the y-term.`],
      [`${stdText(k * a1, k * b1, c1)} and ${e2}`, "Multiplying only the left side of an equation changes its solutions."],
    ];
    if (lv === 3) {
      return {
        prompt: `The system ${e1} and ${e2} has solution ${pt(x0, y0)}. Which system also has the solution ${pt(x0, y0)}?`,
        answer: choice(r, good, wrong.slice(0, 2).concat([[`${e1} and ${stdText(a2 + k * a1, b2 + k * b1, c2 - k * c1)}`, "You added the left sides but subtracted on the right. Do the same operation to both sides."]])),
        hints: ["A new system is equivalent if it's built by multiplying a whole equation by a number and adding it to the other.", `Test ${pt(x0, y0)} in each option's second equation.`],
        steps: [st(`Multiply the first equation by ${ms(k)}.`, stdText(k * a1, k * b1, k * c1)), st("Add it to the second equation.", stdText(a2 + k * a1, b2 + k * b1, c2 + k * c1)), st("Check.", `${times2(a2 + k * a1, x0, b2 + k * b1, y0)} = ${ms(c2 + k * c1)} ✓`)],
      };
    }
    return {
      prompt: `Which system is produced by replacing the second equation of ${e1} and ${e2} with the sum of that equation and ${ms(k)} times the first equation?`,
      answer: choice(r, good, wrong),
      hints: [`Multiply every term of the first equation, including the constant, by ${ms(k)}.`, "Add the result to the second equation term by term."],
      steps: [st(`Multiply the first equation by ${ms(k)}.`, stdText(k * a1, k * b1, k * c1)), st("Add to the second equation.", `(${ms(a2)} + ${sn(k * a1)})x + (${ms(b2)} + ${sn(k * b1)})y = ${ms(c2)} + ${sn(k * c1)} → ${stdText(a2 + k * a1, b2 + k * b1, c2 + k * c1)}`), st("Keep the first equation.", good)],
    };
  },
};

// ---------- systems in context ----------

const CONTEXTS = [
  { a: "adult tickets", b: "student tickets", pa: [12, 15, 18], pb: [6, 8, 9], where: "A school play sold", unit: "$" },
  { a: "hot dogs", b: "pretzels", pa: [4, 5], pb: [2, 3], where: "The snack bar sold", unit: "$" },
  { a: "6-point questions", b: "4-point questions", pa: [6], pb: [4], where: "A test has", unit: "pts" },
  { a: "large T-shirts", b: "small T-shirts", pa: [14, 16], pb: [9, 10], where: "A band sold", unit: "$" },
];

const context: Skill = {
  id: "m1.sys.context",
  title: "Model with systems of equations",
  topic: T,
  standards: ["NC.M1.A-CED.3", "NC.M1.A-REI.6"],
  prereqs: ["m1.sys.substitution", "m1.sys.elimination"],
  lesson: {
    bigIdea: "Two unknowns need two equations: usually one counts items and one counts value (money, points).",
    explain: [
      "A play sold 200 tickets: adults $12, students $8, total $2,000. Let a = adult, s = student tickets. Count: **a + s = 200**. Money: **12a + 8s = 2000**.",
      "Solve: from the first, s = 200 − a. Then 12a + 8(200 − a) = 2000 → 4a + 1600 = 2000 → a = 100, s = 100.",
      "Check in the story: 100 + 100 = 200 tickets and 12(100) + 8(100) = $2,000. ✓",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a + s = 200 not use the prices?", choices: ["It counts tickets; every ticket counts as 1 no matter its price.", "Because prices are only in the second equation by accident.", "Because prices don't matter in this problem."], correct: 0, explain: "One equation counts items, the other counts dollars." },
    { kind: "written", prompt: "A student solves a ticket problem and gets a = 85.5. Explain why that signals an error.", keyIdeas: ["tickets come in whole numbers", "a fractional count is impossible in this context", "recheck the equations or arithmetic"], exemplar: "You can't sell half a ticket, so a = 85.5 can't be right in this context. The student should check that the equations match the story and redo the arithmetic." },
  ],
  generate(r, lv) {
    const c = r.pick(CONTEXTS);
    const pa = r.pick(c.pa), pb = r.pick(c.pb);
    const na = r.int(lv === 1 ? 5 : 12, lv === 1 ? 30 : 90), nb = r.int(lv === 1 ? 5 : 12, lv === 1 ? 30 : 90);
    const N = na + nb, V = pa * na + pb * nb;
    const money = c.unit === "$";
    const totalText = money ? `$${V.toLocaleString("en-US")}` : `${V} points`;
    const story = c.unit === "pts" ? `${c.where} ${N} questions worth a total of ${V} points: some are ${c.a} and the rest are ${c.b}.` : `${c.where} ${N} items for ${totalText}: ${c.a} at $${pa} each and ${c.b} at $${pb} each.`;
    if (lv === 1) {
      return {
        prompt: `${story} Which system models the situation, if x = number of ${c.a} and y = number of ${c.b}?`,
        answer: choice(r, `x + y = ${N} and ${pa}x + ${pb}y = ${V}`, [[`x + y = ${V} and ${pa}x + ${pb}y = ${N}`, "The count and the total value are swapped."], [`x + y = ${N} and ${pb}x + ${pa}y = ${V}`, `x counts ${c.a}, so it gets their value, ${pa}.`], [`${pa}x + y = ${N} and x + ${pb}y = ${V}`, "One equation counts items (each counts 1); the other adds up value."]]),
        hints: ["One equation counts the items.", "The other adds up the value: (value of each) × (how many)."],
        steps: [st("Count equation.", `x + y = ${N}`), st("Value equation.", `${pa}x + ${pb}y = ${V}`)],
      };
    }
    return {
      prompt: `${story} How many of each were there?`,
      answer: { kind: "multi", fields: [{ value: frac(na), pre: `${c.a}:` }, { value: frac(nb), pre: `${c.b}:` }] },
      hints: [`Let x = ${c.a} and y = ${c.b}: x + y = ${N} and ${pa}x + ${pb}y = ${V}.`, `Substitute y = ${N} − x into the second equation.`],
      steps: [
        st("Write the system.", `x + y = ${N} and ${pa}x + ${pb}y = ${V}`),
        st("Substitute y = " + N + " − x.", `${pa}x + ${pb}(${N} − x) = ${V} → ${pa - pb}x + ${pb * N} = ${V}`),
        st("Solve for x.", `${pa - pb}x = ${V - pb * N}, x = ${na}`),
        st("Find y.", `y = ${N} − ${na} = ${nb}`),
        st("Check.", `${na} + ${nb} = ${N} and ${pa}(${na}) + ${pb}(${nb}) = ${V} ✓`),
      ],
    };
  },
};

// ---------- linear inequalities in two variables ----------

const OPS = ["<", ">", "≤", "≥"] as const;

const inequalityGraph: Skill = {
  id: "m1.sys.inequality-graph",
  title: "Graph linear inequalities",
  topic: T,
  standards: ["NC.M1.A-REI.12"],
  prereqs: ["m1.sys.graph-line"],
  lesson: {
    bigIdea: "The solutions of y > mx + b form a half-plane: shade above the boundary line. Use a dashed line for < or > and a solid line for ≤ or ≥.",
    explain: [
      "Graph y ≤ −x + 3: draw the line y = −x + 3 **solid** (points on it count), then shade **below** it.",
      "Test point check: (0, 0) gives 0 ≤ 3, true, and (0, 0) is in the shaded region. ✓",
      "If the inequality is in standard form, solve for y first, and remember to flip the sign if you divide by a negative.",
    ],
    visual: { type: "plot", xMin: -5, xMax: 6, yMin: -5, yMax: 7, curves: [{ expr: "-x+3", shade: "below" }], points: [{ x: 0, y: 0, label: "(0, 0)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the boundary line dashed for y > 2x + 1?", choices: ["Points on the line make y = 2x + 1, which doesn't satisfy \"greater than\".", "Because the slope is positive.", "Dashed lines mean the line is steeper."], correct: 0, explain: "Strict inequalities exclude the boundary." },
    { kind: "written", prompt: "Explain how a test point tells you which side of the boundary to shade.", keyIdeas: ["pick a point not on the line, often (0, 0)", "substitute it into the inequality", "if true, shade its side; if false, shade the other side"], exemplar: "Pick a point that's not on the line, like (0, 0), and substitute it. If the inequality is true, every point on that side is a solution, so shade that side; if it's false, shade the other side." },
  ],
  generate(r, lv) {
    const m = lv === 1 ? frac(r.nonzero(-3, 3)) : frac(r.nonzero(-3, 3), r.pick([1, 2]));
    const b = r.int(-4, 4);
    const op = r.pick(OPS);
    const above = op === ">" || op === "≥", strict = op === "<" || op === ">";
    const visual: Visual = { type: "plot", xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ expr: lineTyped(m, b), dashed: strict, shade: above ? "above" : "below" }] };
    const rhs = lineText(m, b);
    if (lv < 3) {
      const ineq = (o: string, mm: Frac = m, bb = b) => `y ${o} ${lineText(mm, bb)}`;
      const wrong: [string, string][] = OPS.filter((o) => o !== op).map((o) => [ineq(o), (o === "<" || o === ">") !== strict ? (strict ? "The line is dashed, so the boundary is not included: use < or >." : "The line is solid, so the boundary is included: use ≤ or ≥.") : "Check the shading: above the line means y is greater."]);
      if (lv === 2) wrong.push([ineq(op, frac(-m.n, m.d)), "Check the slope's sign: does the line rise or fall to the right?"]);
      return {
        prompt: "Which inequality is shown in the graph?",
        visual,
        answer: choice(r, ineq(op), wrong.slice(0, lv === 1 ? 3 : 4)),
        hints: ["Find the boundary line's equation from its y-intercept and slope.", "Dashed means < or >; solid means ≤ or ≥. Shading above means y is greater than the line."],
        steps: [st("Boundary line.", `y-intercept ${ms(b)}, slope ${fracText(m)}: y = ${rhs}`), st("Solid or dashed?", strict ? "Dashed: the line is not included, so < or >." : "Solid: the line is included, so ≤ or ≥."), st("Which side?", above ? `Shaded above: y ${op} ${rhs}` : `Shaded below: y ${op} ${rhs}`)],
      };
    }
    const val = (p: { x: number; y: number }) => p.y - (m.n * p.x) / m.d - b;
    const ok = (p: { x: number; y: number }) => { const v = val(p); return op === ">" ? v > 0 : op === "≥" ? v >= 0 : op === "<" ? v < 0 : v <= 0; };
    const cands: { x: number; y: number }[] = [];
    for (let i = 0; i < 60 && cands.length < 12; i++) { const p = { x: r.int(-5, 5), y: r.int(-5, 5) }; if (!cands.some((q) => q.x === p.x && q.y === p.y)) cands.push(p); }
    // Put a boundary point in the mix for the twist.
    const bx = m.d * r.int(-2, 2), by = (m.n * bx) / m.d + b;
    if (Math.abs(by) <= 6) cands.unshift({ x: bx, y: by });
    const good = cands.find(ok) ?? { x: 0, y: above ? 6 + Math.abs(b) : -6 - Math.abs(b) };
    const bads = cands.filter((p) => !ok(p)).slice(0, 3);
    for (let x = -4; bads.length < 3 && x <= 4; x += 3) {
      const p = { x, y: Math.round((m.n * x) / m.d + b) + (above ? -2 : 2) };
      if (!ok(p) && !bads.some((q) => q.x === p.x && q.y === p.y)) bads.push(p);
    }
    return {
      prompt: `Which point is a solution of y ${op} ${rhs}?`,
      visual,
      answer: choice(r, pt(good.x, good.y), bads.map((p) => [pt(p.x, p.y), val(p) === 0 ? `That point is on the ${strict ? "dashed" : "solid"} boundary, and ${strict ? "a strict inequality leaves the boundary out" : "it IS included"}.` : `Substitute: ${ms(p.y)} ${op} ${f((m.n * p.x) / m.d + b)} is false.`] as [string, string])),
      hints: ["Substitute each point into the inequality.", "Or look at the graph: solutions are in the shaded region (and on the line only if it's solid)."],
      steps: [st("Test the point.", `x = ${ms(good.x)}: ${rhs.replace(/x/g, `(${ms(good.x)})`)} = ${f((m.n * good.x) / m.d + b)}, and ${ms(good.y)} ${op} ${f((m.n * good.x) / m.d + b)} is true.`), st("On the graph.", val(good) === 0 ? "It lies on the solid boundary, which is included." : "It lies in the shaded region.")],
    };
  },
};

const inequalitySystem: Skill = {
  id: "m1.sys.inequality-system",
  title: "Systems of inequalities",
  topic: T,
  standards: ["NC.M1.A-REI.12", "NC.M1.A-CED.3"],
  prereqs: ["m1.sys.inequality-graph", "m1.sys.context"],
  lesson: {
    bigIdea: "The solution of a system of inequalities is the overlap of the shaded half-planes: points that satisfy every inequality at once.",
    explain: [
      "Kai can work at most 20 hours a week (x + y ≤ 20) and needs at least $240: tutoring pays $15/hr (y hours) and the store pays $10/hr (x hours), so 10x + 15y ≥ 240.",
      "(10, 10) works: 20 ≤ 20 and 250 ≥ 240. (16, 4) doesn't: 16 + 4 = 20 is fine, but 160 + 60 = 220 < 240.",
      "In context, x and y usually can't be negative, which adds x ≥ 0 and y ≥ 0 to the system.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 26, yMin: 0, yMax: 26, xStep: 2, yStep: 2, curves: [{ expr: "20-x", shade: "below", label: "x + y ≤ 20" }, { expr: "16-(2/3)x", shade: "above", color: 2, label: "10x + 15y ≥ 240" }], points: [{ x: 10, y: 10, label: "(10, 10)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why must a solution of the system be in the region where the shadings overlap?", choices: ["It has to satisfy both inequalities, and each shading shows one inequality's solutions.", "Because overlapping regions are always larger.", "It only has to be in one of the shaded regions."], correct: 0, explain: "A system requires all conditions at once." },
    { kind: "written", prompt: "In a budget problem, x is the number of shirts and y the number of hats. Explain why (2.5, 3) might satisfy the inequalities but still not make sense.", keyIdeas: ["you can't buy half a shirt", "the context needs whole numbers", "only whole-number points in the region are realistic"], exemplar: "Even if (2.5, 3) is inside the region, you can't buy 2.5 shirts. In this context only whole-number points in the overlap make sense." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      let m1 = 1, b1 = 0, m2 = -1, b2 = 0, op1 = "≥", op2 = "≤";
      let goods: { x: number; y: number }[] = [], onlyOne: { x: number; y: number }[] = [];
      const in1 = (p: { x: number; y: number }) => (op1 === "≥" ? p.y >= m1 * p.x + b1 : p.y > m1 * p.x + b1);
      const in2 = (p: { x: number; y: number }) => (op2 === "≤" ? p.y <= m2 * p.x + b2 : p.y < m2 * p.x + b2);
      for (let tries = 0; tries < 50; tries++) {
        m1 = r.nonzero(-2, 2); b1 = r.int(-2, 3); m2 = -m1; b2 = r.int(-3, 2);
        op1 = r.pick(["≥", ">"]); op2 = r.pick(["≤", "<"]);
        const pts: { x: number; y: number }[] = [];
        for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) pts.push({ x, y });
        goods = pts.filter((p) => in1(p) && in2(p) && p.y !== m1 * p.x + b1 && p.y !== m2 * p.x + b2);
        onlyOne = pts.filter((p) => in1(p) !== in2(p));
        if (goods.length && onlyOne.length >= 3) break;
      }
      const good = r.pick(goods);
      const wrong = r.shuffle(onlyOne).slice(0, 3);
      const sys = `y ${op1} ${lineText(m1, b1)} and y ${op2} ${lineText(m2, b2)}`;
      return {
        prompt: `The graph shows the system ${sys}. Which point is a solution of the system?`,
        visual: { type: "plot", xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ expr: lineTyped(m1, b1), dashed: op1 === ">", shade: "above" }, { expr: lineTyped(m2, b2), dashed: op2 === "<", shade: "below", color: 2 }] },
        answer: choice(r, pt(good.x, good.y), wrong.map((p) => [pt(p.x, p.y), `That point satisfies only the ${in1(p) ? "first" : "second"} inequality. It must be in the overlap.`] as [string, string])),
        hints: ["A solution has to be in the region where both shadings overlap.", "Check the point in each inequality."],
        steps: [st("First inequality.", `${ms(good.y)} ${op1} ${ms(m1 * good.x + b1)} ✓`), st("Second inequality.", `${ms(good.y)} ${op2} ${ms(m2 * good.x + b2)} ✓`), st("Conclusion.", `${pt(good.x, good.y)} is in the overlap of the two shaded regions.`)],
      };
    }
    const nm = r.pick(NAMES);
    const ctx = r.pick([
      { x: "hours at the store", y: "hours tutoring", px: 10, py: 15, cap: 20, need: 240, capText: "can work at most", needText: "needs to earn at least" },
      { x: "small pizzas", y: "large pizzas", px: 8, py: 12, cap: 12, need: 96, capText: "", needText: "" },
    ]);
    if (ctx.x === "small pizzas") {
      // pizzas: at least 10 pizzas, budget at most $112
      const budget = r.pick([112, 120, 132]), minCount = r.pick([10, 11, 12]);
      const okP = (p: { x: number; y: number }) => p.x + p.y >= minCount && 8 * p.x + 12 * p.y <= budget;
      const cand: { x: number; y: number }[] = [];
      for (let x = 0; x <= 16; x++) for (let y = 0; y <= 12; y++) cand.push({ x, y });
      const good = r.pick(cand.filter(okP));
      const bad1 = r.pick(cand.filter((p) => p.x + p.y < minCount && 8 * p.x + 12 * p.y <= budget));
      const bad2 = r.pick(cand.filter((p) => p.x + p.y >= minCount && 8 * p.x + 12 * p.y > budget && p.x + p.y <= minCount + 3));
      const bad3 = r.pick(cand.filter((p) => !okP(p) && p.x + p.y >= minCount - 2 && p !== bad1 && p !== bad2));
      if (lv === 3) {
        return {
          prompt: `${nm} is ordering pizzas for a party: small pizzas cost $8 and large pizzas cost $12. ${nm} needs at least ${minCount} pizzas and can spend at most $${budget}. With x small and y large pizzas, which system models this?`,
          answer: choice(r, `x + y ≥ ${minCount} and 8x + 12y ≤ ${budget}`, [[`x + y ≤ ${minCount} and 8x + 12y ≥ ${budget}`, "\"At least\" means ≥ and \"at most\" means ≤."], [`x + y ≥ ${budget} and 8x + 12y ≤ ${minCount}`, "The count and the cost are swapped."], [`8x + 12y ≥ ${minCount} and x + y ≤ ${budget}`, "x + y counts pizzas; 8x + 12y is the cost."]]),
          hints: ["One inequality counts pizzas, the other adds up the cost.", "\"At least\" → ≥, \"at most\" → ≤."],
          steps: [st("Count.", `at least ${minCount} pizzas: x + y ≥ ${minCount}`), st("Cost.", `at most $${budget}: 8x + 12y ≤ ${budget}`)],
        };
      }
      return {
        prompt: `Small pizzas cost $8 and large pizzas cost $12. ${nm} needs at least ${minCount} pizzas and can spend at most $${budget}: x + y ≥ ${minCount} and 8x + 12y ≤ ${budget}. Which order works (x small, y large)?`,
        visual: { type: "plot", xMin: 0, xMax: 16, yMin: 0, yMax: 12, xStep: 2, yStep: 2, curves: [{ expr: `${minCount}-x`, shade: "above", label: `x + y ≥ ${minCount}` }, { expr: `(${budget}-8x)/12`, shade: "below", color: 2, label: `8x + 12y ≤ ${budget}` }] },
        answer: choice(r, `${good.x} small, ${good.y} large`, [[`${bad1.x} small, ${bad1.y} large`, `That's only ${bad1.x + bad1.y} pizzas.`], [`${bad2.x} small, ${bad2.y} large`, `That costs $${8 * bad2.x + 12 * bad2.y}, over budget.`], [`${bad3.x} small, ${bad3.y} large`, bad3.x + bad3.y < minCount ? `That's only ${bad3.x + bad3.y} pizzas.` : `That costs $${8 * bad3.x + 12 * bad3.y}, over budget.`]]),
        hints: ["Check both conditions: enough pizzas AND within budget.", "Count = x + y. Cost = 8x + 12y."],
        steps: [st("Count.", `${good.x} + ${good.y} = ${good.x + good.y} ≥ ${minCount} ✓`), st("Cost.", `8(${good.x}) + 12(${good.y}) = ${8 * good.x + 12 * good.y} ≤ ${budget} ✓`)],
      };
    }
    const okW = (p: { x: number; y: number }) => p.x + p.y <= 20 && 10 * p.x + 15 * p.y >= 240;
    const cand: { x: number; y: number }[] = [];
    for (let x = 0; x <= 20; x += 2) for (let y = 0; y <= 20; y += 2) cand.push({ x, y });
    const good = r.pick(cand.filter(okW));
    const bad1 = r.pick(cand.filter((p) => p.x + p.y > 20 && 10 * p.x + 15 * p.y >= 240 && p.x + p.y <= 24));
    const bad2 = r.pick(cand.filter((p) => p.x + p.y <= 20 && 10 * p.x + 15 * p.y < 240 && p.x + p.y >= 16));
    if (lv === 3) {
      return {
        prompt: `${nm} works x hours at a store ($10/hr) and y hours tutoring ($15/hr). ${nm} can work at most 20 hours a week and needs to earn at least $240. Which system models this?`,
        answer: choice(r, "x + y ≤ 20 and 10x + 15y ≥ 240", [["x + y ≥ 20 and 10x + 15y ≤ 240", "\"At most\" means ≤ and \"at least\" means ≥."], ["10x + 15y ≤ 20 and x + y ≥ 240", "x + y counts hours; 10x + 15y counts dollars."], ["x + y ≤ 20 and 15x + 10y ≥ 240", "x is store hours at $10."]]),
        hints: ["One inequality limits hours; the other is about money.", "\"At most\" → ≤, \"at least\" → ≥."],
        steps: [st("Hours.", "x + y ≤ 20"), st("Money.", "10x + 15y ≥ 240")],
      };
    }
    return {
      prompt: `${nm} works x hours at a store ($10/hr) and y hours tutoring ($15/hr), with x + y ≤ 20 and 10x + 15y ≥ 240. Which schedule works?`,
      visual: { type: "plot", xMin: 0, xMax: 26, yMin: 0, yMax: 22, xStep: 2, yStep: 2, curves: [{ expr: "20-x", shade: "below", label: "x + y ≤ 20" }, { expr: "16-(2/3)x", shade: "above", color: 2, label: "10x + 15y ≥ 240" }] },
      answer: choice(r, `${good.x} store hours, ${good.y} tutoring hours`, [[`${bad1.x} store hours, ${bad1.y} tutoring hours`, `That's ${bad1.x + bad1.y} hours, more than 20.`], [`${bad2.x} store hours, ${bad2.y} tutoring hours`, `That earns only $${10 * bad2.x + 15 * bad2.y}.`]]),
      hints: ["Check both conditions.", "Hours: x + y. Pay: 10x + 15y."],
      steps: [st("Hours.", `${good.x} + ${good.y} = ${good.x + good.y} ≤ 20 ✓`), st("Pay.", `10(${good.x}) + 15(${good.y}) = ${10 * good.x + 15 * good.y} ≥ 240 ✓`)],
    };
  },
};

export default [graphLine, standardForm, solveGraph, substitution, elimination, equivalent, context, inequalityGraph, inequalitySystem];
