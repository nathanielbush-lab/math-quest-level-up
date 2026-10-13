// Unit 5: Modeling with functions: solving f(x) = g(x), combining functions, systems, and justifying steps.
import { choice, cst, expr, linear, money, ms, num, poly, polyExpr, sn } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { dn, evalPoly, fromRoots, linT, trapsTol } from "./util";

const T = "m3-modeling";

// ---------------------------------------------------------------------------
const intersect: Skill = {
  id: "m3.model.intersect",
  title: "Solve f(x) = g(x) with graphs",
  topic: T,
  standards: ["NC.M3.A-REI.11", "NC.M3.F-IF.9"],
  prereqs: [],
  lesson: {
    bigIdea: "The solutions of f(x) = g(x) are the x-coordinates of the points where the graphs of y = f(x) and y = g(x) meet.",
    explain: [
      "To solve 2^x = x + 1, graph y = 2^x and y = x + 1. They meet at (0, 1) and (1, 2).",
      "So the solutions are **x = 0 and x = 1**. Check: 2^0 = 1 = 0 + 1 ✓ and 2^1 = 2 = 1 + 1 ✓.",
      "This works for any mix of function types, even when algebra can't solve the equation. On a graphing calculator, use the intersect feature; the x-value is the solution, not the y-value.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 3, yMin: -2, yMax: 6, curves: [{ expr: "2^x", label: "y = 2^x" }, { expr: "x+1", label: "y = x + 1", color: 2 }], points: [{ x: 0, y: 1, label: "(0, 1)" }, { x: 1, y: 2, label: "(1, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why are the x-coordinates of the intersection points the solutions of f(x) = g(x)?", choices: ["At those x-values both graphs have the same height, so f(x) and g(x) are equal.", "Because the graphs cross the x-axis there.", "Because the y-coordinates are the same as the x-coordinates."], correct: 0, explain: "An intersection point (a, b) is on both graphs, so f(a) = b = g(a)." },
    { kind: "written", prompt: "Explain how you could use a graph to decide how many solutions x^3 = 4x has.", keyIdeas: ["graph y = x^3 and y = 4x", "count the intersection points", "they meet 3 times (x = −2, 0, 2), so 3 solutions"], exemplar: "Graph y = x^3 and y = 4x on the same axes. Each point where they meet is a solution. They cross three times, at x = −2, 0 and 2, so the equation has three solutions." },
  ],
  generate(r, lv) {
    let fT: string, fD: string, gT: string, gD: string, sols: number[];
    let fx: (x: number) => number;
    if (lv === 1) {
      const c0 = r.int(-4, 2);
      let x1 = r.int(-3, 3), x2 = r.int(-3, 3);
      while (x2 === x1) x2 = r.int(-3, 3);
      const m = x1 + x2, b = c0 - x1 * x2;
      fT = polyExpr([1, 0, c0]); fD = poly([1, 0, c0]);
      gT = linT(m, b); gD = linear(m, b);
      sols = [x1, x2];
      fx = (x) => x * x + c0;
    } else if (lv === 2) {
      const [x1, x2] = r.pick([[0, 1], [1, 2], [2, 3], [0, 2], [1, 3], [-1, 1]] as [number, number][]);
      const k = r.int(-2, 1);
      const m = (2 ** x2 - 2 ** x1) / (x2 - x1);
      const b = 2 ** x1 + k - m * x1;
      fT = `2^x${k ? (k > 0 ? `+${k}` : `${k}`) : ""}`; fD = `2^x${cst(k)}`;
      gT = `${m}x${b >= 0 ? "+" : ""}${b}`; gD = linear(m, b);
      sols = [x1, x2];
      fx = (x) => 2 ** x + k;
    } else {
      const roots = r.shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 3).sort((a, b) => a - b);
      const m = r.int(-2, 2), d = r.int(-3, 3);
      const c = fromRoots(roots);
      c[2] += m;
      c[3] += d;
      fT = polyExpr(c); fD = poly(c);
      gT = linT(m, d); gD = linear(m, d);
      sols = roots;
      fx = (x) => evalPoly(c, x);
    }
    const ys = sols.map(fx);
    const lo = Math.min(...sols) - 2, hi = Math.max(...sols) + 2;
    const yMin = Math.floor(Math.min(...ys, 0) - 4), yMax = Math.ceil(Math.max(...ys, 0) + 5);
    return {
      prompt: `The graphs of f(x) = ${fD} and g(x) = ${gD} are shown. Use them to solve f(x) = g(x).`,
      visual: { type: "plot", xMin: lo, xMax: hi, yMin, yMax, yStep: yMax - yMin > 24 ? 4 : yMax - yMin > 12 ? 2 : 1, curves: [{ expr: fT, label: "f" }, { expr: gT, label: "g", color: 2 }], points: sols.map((x, i) => ({ x, y: ys[i] })) },
      answer: { kind: "multi", fields: sols.map((x) => ({ value: frac(x), pre: "x =" })), anyOrder: sols.map((_, i) => i) },
      hints: ["Find where the two graphs meet.", `Read the x-coordinate of each intersection point. There are ${sols.length}.`],
      steps: [
        st("Find the intersection points.", sols.map((x, i) => `(${ms(x)}, ${dn(ys[i])})`).join(", ")),
        st("Check each one algebraically.", sols.map((x, i) => `f(${ms(x)}) = ${dn(ys[i])} and g(${ms(x)}) = ${dn(ys[i])}`).join("; ")),
        st("Solutions.", `x = ${sols.map(ms).join(", ")}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const tableApprox: Skill = {
  id: "m3.model.table-approx",
  title: "Approximate solutions with tables",
  topic: T,
  standards: ["NC.M3.A-REI.11", "NC.M3.F-LE.3"],
  prereqs: ["m3.model.intersect"],
  lesson: {
    bigIdea: "When f(x) − g(x) changes sign between two x-values, the graphs cross in between, so f(x) = g(x) has a solution there. Zoom in with a finer table to approximate it.",
    explain: [
      "Solve 1.5^x = x + 4. A table: at x = 4, 1.5^4 ≈ 5.06 < 8; at x = 5, 7.59 < 9; at x = 6, 11.39 > 10.",
      "f went from below g to above g between x = 5 and x = 6, so a solution lies **between 5 and 6**.",
      "A table with steps of 0.1 (or the intersect tool) narrows it down: x ≈ 5.7.",
    ],
  },
  why: [
    { kind: "choice", prompt: "f(3) − g(3) = −2 and f(4) − g(4) = 5. Why must f(x) = g(x) have a solution between 3 and 4 (for continuous f and g)?", choices: ["f − g goes from negative to positive, so it must pass through 0 in between.", "Because 3 and 4 are close together.", "Because −2 + 5 = 3."], correct: 0, explain: "A continuous function can't jump over 0, so f − g = 0 somewhere between 3 and 4." },
    { kind: "written", prompt: "Explain how to use a table to approximate a solution of 2^x = 10 − x to the nearest tenth.", keyIdeas: ["compare both sides at whole numbers to find where the order flips (between 2 and 3)", "make a new table with steps of 0.1 in that interval", "pick the x where the two sides are closest"], exemplar: "At x = 2, 2^x = 4 < 8, and at x = 3, 2^x = 8 > 7, so the solution is between 2 and 3. Then I'd table x = 2.1, 2.2, … 2.9 and find where 2^x passes 10 − x, choosing the tenth where the two sides are closest." },
  ],
  generate(r, lv) {
    for (;;) {
      const b = r.pick([1.5, 2, 1.8]), a = r.pick([1, 2, 3]);
      const m = r.int(1, 5), d = r.int(2, 12);
      const f = (x: number) => a * b ** x, g = (x: number) => m * x + d;
      const xs = [0, 1, 2, 3, 4, 5, 6];
      const diffs = xs.map((x) => f(x) - g(x));
      if (diffs.some((v) => Math.abs(v) < 0.05)) continue;
      const changes = xs.slice(0, -1).filter((_, i) => Math.sign(diffs[i]) !== Math.sign(diffs[i + 1]));
      if (changes.length !== 1) continue;
      const k = changes[0];
      let lo = k, hi = k + 1;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (Math.sign(f(mid) - g(mid)) === Math.sign(diffs[k])) lo = mid; else hi = mid;
      }
      const root = (lo + hi) / 2;
      const fD = `${a === 1 ? "" : `${a} · `}${b}^x`, gD = linear(m, d);
      if (lv < 3) {
        const opt = (j: number) => `Between x = ${j} and x = ${j + 1}`;
        const others = [k - 1, k + 1, k + 2, k - 2].filter((j) => j >= 0 && j <= 5).slice(0, 3);
        return {
          prompt: `The table shows values of f(x) = ${fD} and g(x) = ${gD}. Between which two consecutive whole numbers is a solution of f(x) = g(x)?`,
          visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...xs.map((x) => dn(f(x)))], ["g(x)", ...xs.map((x) => dn(g(x)))]] },
          answer: choice(r, opt(k), others.map((j) => [opt(j), "Look for where f switches from being below g to above it (or the other way)."] as [string, string]), true),
          hints: ["Compare f(x) and g(x) in each column. Which one is bigger?", "The solution is where the bigger one switches."],
          steps: [
            st(`At x = ${k}.`, `f = ${dn(f(k))}, g = ${dn(g(k))}: ${diffs[k] < 0 ? "f < g" : "f > g"}`),
            st(`At x = ${k + 1}.`, `f = ${dn(f(k + 1))}, g = ${dn(g(k + 1))}: ${diffs[k + 1] < 0 ? "f < g" : "f > g"}`),
            st("The order switches, so the graphs cross in between.", `A solution lies between x = ${k} and x = ${k + 1} (about ${dn(root, 1)}).`),
          ],
        };
      }
      const ans = Math.round(root * 10) / 10;
      return {
        prompt: `Use a table or the intersect feature on your calculator to solve ${fD} = ${gD} for x > 0. Round to the nearest tenth.`,
        answer: num(ans, { tolerance: 0.05 }),
        hints: [`Start with whole numbers: the sides switch order between x = ${k} and x = ${k + 1}.`, `Now try tenths: ${k}.1, ${k}.2, … and find where they switch.`],
        steps: [
          st("Whole numbers.", `x = ${k}: ${dn(f(k))} vs ${dn(g(k))}; x = ${k + 1}: ${dn(f(k + 1))} vs ${dn(g(k + 1))}. They switch order.`),
          st("Zoom in.", `x = ${dn(Math.floor(root * 10) / 10, 1)}: ${dn(f(Math.floor(root * 10) / 10))} vs ${dn(g(Math.floor(root * 10) / 10))}; x = ${dn(Math.ceil(root * 10) / 10, 1)}: ${dn(f(Math.ceil(root * 10) / 10))} vs ${dn(g(Math.ceil(root * 10) / 10))}.`),
          st("Answer.", `The graphs cross at x ≈ ${dn(root, 3)}, so x ≈ ${dn(ans, 1)}.`),
        ],
        traps: trapsTol(ans, 0.05, [[Math.round(g(root) * 10) / 10, "That's the y-value where they meet. The solution is the x-value."]]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const combine: Skill = {
  id: "m3.model.combine",
  title: "Combine functions to model a situation",
  topic: T,
  standards: ["NC.M3.F-BF.1", "NC.M3.F-BF.1b", "NC.M3.A-SSE.1b", "NC.M3.A-CED.2"],
  prereqs: [],
  lesson: {
    bigIdea: "Build a new model by adding, subtracting, multiplying or dividing simpler functions: profit = revenue − cost, revenue = price × quantity, average cost = total cost ÷ number made.",
    explain: [
      "A club sells hoodies for $30 each. Making them costs C(x) = 400 + 12x dollars for x hoodies. Revenue is R(x) = 30x.",
      "Profit P(x) = R(x) − C(x) = 30x − (400 + 12x) = **18x − 400**. The club breaks even when 18x = 400, at about 23 hoodies.",
      "If the price drops as they sell more, say price = 40 − 0.1x, then R(x) = x(40 − 0.1x), and P(x) = −0.1x^2 + 28x − 400 is quadratic.",
    ],
    tip: "Put the whole cost in parentheses when you subtract it.",
  },
  why: [
    { kind: "choice", prompt: "Why is P(x) = 30x − 400 + 12x wrong for the profit when C(x) = 400 + 12x?", choices: ["The whole cost is subtracted, so it should be 30x − 400 − 12x.", "Because profit is revenue plus cost.", "It is correct."], correct: 0, explain: "R(x) − C(x) = 30x − (400 + 12x); the minus applies to both parts of the cost." },
    { kind: "written", prompt: "C(x) = 500 + 4x is the cost to make x phone cases. Explain what A(x) = C(x)/x represents and why it decreases as x grows.", keyIdeas: ["A(x) is the average cost per case", "A(x) = 500/x + 4", "the fixed $500 is spread over more cases, so the average falls toward $4"], exemplar: "A(x) is the total cost divided by the number of cases, so it's the average cost per case. A(x) = 500/x + 4: as x grows, the $500 setup is shared by more cases, so the average gets closer to $4." },
  ],
  generate(r, lv) {
    const item = r.pick(["hoodies", "phone cases", "custom sneakers", "concert posters", "smoothies"]);
    const F = r.pick([200, 300, 400, 500, 600, 800]);
    const v = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
    if (lv === 1) {
      const p = v + r.pick([5, 6, 8, 10, 12, 15]);
      return {
        prompt: `A student business sells ${item} for $${p} each. The cost to make x of them is C(x) = ${F} + ${v}x dollars. Write the profit function P(x).`,
        answer: expr(`${p - v}x-${F}`, { lhs: "P(x)", display: `${p - v}x − ${F}` }),
        hints: ["Profit = revenue − cost.", `Revenue is R(x) = ${p}x. Subtract all of C(x): ${p}x − (${F} + ${v}x).`],
        steps: [
          st("Revenue.", `R(x) = ${p}x`),
          st("Profit = revenue − cost.", `P(x) = ${p}x − (${F} + ${v}x)`),
          st("Simplify.", `P(x) = ${p}x − ${F} − ${v}x = ${p - v}x − ${F}`),
        ],
      };
    }
    if (lv === 2) {
      const a = r.pick([30, 40, 50, 60]), bq = r.pick([0.1, 0.2, 0.5]);
      const P = [-bq, a - v, -F];
      return {
        prompt: `When a business sells x ${item}, the price per item is (${a} − ${bq}x) dollars, so revenue is R(x) = x(${a} − ${bq}x). Costs are C(x) = ${F} + ${v}x. Write the profit function P(x) in standard form.`,
        answer: expr(polyExpr(P), { lhs: "P(x)", display: poly(P) }),
        hints: [`P(x) = R(x) − C(x) = x(${a} − ${bq}x) − (${F} + ${v}x).`, `Distribute: ${a}x − ${bq}x^2 − ${F} − ${v}x. Combine like terms.`],
        steps: [
          st("Profit = revenue − cost.", `P(x) = x(${a} − ${bq}x) − (${F} + ${v}x)`),
          st("Distribute.", `${a}x − ${bq}x^2 − ${F} − ${v}x`),
          st("Combine and order by power.", poly(P)),
        ],
      };
    }
    const w = r.pick([0.01, 0.02, 0.05]);
    const display = `{${F} + ${v}x + ${w}x²/x}`;
    return {
      prompt: `The cost to make x ${item} is C(x) = ${F} + ${v}x + ${w}x^2 dollars. Write A(x), the average cost per item, and simplify it to a sum of three terms.`,
      answer: expr(`${F}/x+${v}+${w}x`, { lhs: "A(x)", display: `{${F}/x} + ${v} + ${w}x` }),
      hints: ["Average cost = total cost ÷ number of items.", `A(x) = ${display}. Divide each term by x.`],
      steps: [
        st("Average = total ÷ count.", `A(x) = ${display}`),
        st("Divide each term by x.", `A(x) = {${F}/x} + ${v} + ${w}x`),
        st("Interpret.", `{${F}/x} is the setup cost shared per item, ${v} is the base cost per item, and ${w}x grows as production gets harder to scale.`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const writeSystem: Skill = {
  id: "m3.model.write-system",
  title: "Write systems to model situations",
  topic: T,
  standards: ["NC.M3.A-CED.3", "NC.M3.A-CED.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Name the unknowns, then turn each condition into its own equation or inequality. “At most” means ≤, “at least” means ≥.",
    explain: [
      "A booth sells phone cases (x) for $12 and pop sockets (y) for $5. They can make at most 40 items and want at least $300 in sales.",
      "Item limit: **x + y ≤ 40**. Sales goal: **12x + 5y ≥ 300**. Also x ≥ 0 and y ≥ 0.",
      "Not every system is linear: a rectangle with area 48 and perimeter 28 gives lw = 48 and 2l + 2w = 28.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does “at least $300 in sales” become 12x + 5y ≥ 300?", choices: ["Sales can be 300 or more, so the expression is greater than or equal to 300.", "Because sales must be less than 300.", "“At least” means exactly."], correct: 0, explain: "“At least 300” includes 300 and everything above it." },
    { kind: "written", prompt: "A system models tickets: x + y = 250 and 8x + 12y = 2560. Explain what each equation means if x is student tickets at $8 and y is adult tickets at $12.", keyIdeas: ["x + y = 250: 250 tickets sold in total", "8x + 12y = 2560: total money collected is $2560", "a solution tells how many of each type were sold"], exemplar: "The first equation says 250 tickets were sold altogether. The second says the $8 student tickets plus the $12 adult tickets brought in $2560. The solution (x, y) is the number of each type sold." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const s = r.pick([5, 6, 8, 10]), a = s + r.pick([4, 6, 7, 10]);
      const x = r.int(60, 200), y = r.int(40, 150);
      const N = x + y, R = s * x + a * y;
      const correct = `x + y = ${N} and ${s}x + ${a}y = ${R}`;
      return {
        prompt: `A school play sold ${N} tickets and collected $${R}. Student tickets (x) cost $${s} and adult tickets (y) cost $${a}. Which system models this?`,
        answer: choice(r, correct, [
          [`x + y = ${R} and ${s}x + ${a}y = ${N}`, "The ticket count and the money are swapped."],
          [`x + y = ${N} and ${a}x + ${s}y = ${R}`, `x is student tickets, so it goes with $${s}.`],
          [`${s}x + ${a}y = ${N} and x + y = ${R}`, "Count the tickets in one equation and the dollars in the other."],
        ]),
        hints: ["One equation counts tickets; the other counts dollars.", `Dollars from student tickets: ${s}x.`],
        steps: [st("Count the tickets.", `x + y = ${N}`), st("Count the money.", `${s}x + ${a}y = ${R}`), st("System.", correct)],
      };
    }
    if (lv === 2) {
      const h1 = r.pick([2, 3]), h2 = 1, H = r.pick([30, 36, 40, 45]);
      const p1 = r.pick([12, 15, 18]), p2 = r.pick([4, 5, 6]), P = r.pick([240, 300, 360]);
      const correct = `${h1}x + y ≤ ${H} and ${p1}x + ${p2}y ≥ ${P}`;
      return {
        prompt: `${r.pick(["Ava", "Kai", "Ruby", "Diego"])} makes beaded bracelets (x) and keychains (y) to sell. A bracelet takes ${h1} hours and a keychain takes ${h2} hour, with at most ${H} hours available. Bracelets sell for $${p1} and keychains for $${p2}, and the goal is to earn at least $${P}. Which system models this?`,
        answer: choice(r, correct, [
          [`${h1}x + y ≥ ${H} and ${p1}x + ${p2}y ≤ ${P}`, "“At most” means ≤ and “at least” means ≥."],
          [`${h1}x + y ≤ ${H} and ${p1}x + ${p2}y ≤ ${P}`, "Earning “at least” the goal means ≥."],
          [`x + y ≤ ${H} and ${p1}x + ${p2}y ≥ ${P}`, `Each bracelet uses ${h1} hours, not 1.`],
        ]),
        hints: ["Write one inequality for time and one for money.", `Time used: ${h1}x + y hours. “At most ${H}” means ≤ ${H}.`],
        steps: [st("Time constraint.", `${h1}x + y ≤ ${H}`), st("Money goal.", `${p1}x + ${p2}y ≥ ${P}`), st("System.", correct)],
      };
    }
    const l = r.int(5, 12), w = r.int(2, l - 1);
    const A = l * w, Pm = 2 * (l + w);
    const correct = `lw = ${A} and 2l + 2w = ${Pm}`;
    return {
      prompt: `A rectangular dog run must have an area of ${A} square feet and use exactly ${Pm} feet of fencing around it. Which system models the length l and width w?`,
      answer: choice(r, correct, [
        [`lw = ${Pm} and 2l + 2w = ${A}`, "Area is length × width; fencing goes around the perimeter."],
        [`lw = ${A} and l + w = ${Pm}`, "The fence goes around all four sides: 2l + 2w."],
        [`2l + 2w = ${A} and l + w = ${Pm / 2}`, "These both describe the perimeter. Area needs l × w."],
      ]),
      hints: ["Area of a rectangle: l × w. Perimeter: 2l + 2w.", "Which number is the area and which is the fence length?"],
      steps: [st("Area.", `lw = ${A}`), st("Perimeter (fencing).", `2l + 2w = ${Pm}`), st("Check a solution.", `l = ${l}, w = ${w}: ${l} · ${w} = ${A} ✓ and 2(${l}) + 2(${w}) = ${Pm} ✓`)],
    };
  },
};

// ---------------------------------------------------------------------------
const justify: Skill = {
  id: "m3.model.justify",
  title: "Justify steps and find errors",
  topic: T,
  standards: ["NC.M3.A-REI.1", "NC.M3.A-REI.2"],
  prereqs: ["m3.model.intersect"],
  lesson: {
    bigIdea: "Every step in solving an equation should be justified by a property (do the same thing to both sides, distribute, take a log of both sides…). Steps like squaring both sides or multiplying by a variable can add extraneous solutions, so check at the end.",
    explain: [
      "Solve 3 · 2^x + 5 = 53. Subtract 5 from both sides (subtraction property of equality): 3 · 2^x = 48. Divide both sides by 3 (division property): 2^x = 16. Rewrite 16 as 2^4: x = 4.",
      "Solve √(x + 7) = x + 1. Square both sides: x + 7 = x^2 + 2x + 1, so x^2 + x − 6 = 0 and x = 2 or x = −3.",
      "Check: √9 = 3 = 2 + 1 ✓, but √4 = 2 ≠ −3 + 1 = −2 ✗. So x = −3 is **extraneous** and the only solution is x = 2.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can squaring both sides create an extraneous solution?", choices: ["Different numbers like 2 and −2 have the same square, so a false equation can become true after squaring.", "Because squaring makes numbers bigger.", "It can't; squaring is reversible."], correct: 0, explain: "2 ≠ −2, but 2^2 = (−2)^2. Squaring hides the sign, so check answers in the original." },
    { kind: "written", prompt: "Explain why dividing both sides of x^2 = 5x by x is not a valid step.", keyIdeas: ["you can't divide by 0", "x might be 0", "doing it loses the solution x = 0; instead factor x(x − 5) = 0"], exemplar: "Dividing by x only works if x isn't 0, but x = 0 is actually a solution. Dividing loses it and leaves only x = 5. It's better to write x^2 − 5x = 0 and factor: x(x − 5) = 0, so x = 0 or x = 5." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.pick([2, 3, 4, 5]), b = r.pick([2, 3]), n = r.int(2, 4), k = r.int(2, 9);
      const c = a * b ** n + k;
      const steps = [
        `Step 1: ${a} · ${b}^x = ${a * b ** n}`,
        `Step 2: ${b}^x = ${b ** n}`,
        `Step 3: x = ${n}`,
      ];
      const which = r.int(1, 2);
      const props: Record<number, string> = { 1: "Subtraction property of equality", 2: "Division property of equality" };
      const correct = props[which];
      return {
        prompt: `${r.pick(["Leo", "Nora", "Omar", "Mei"])} solved ${a} · ${b}^x + ${k} = ${c}: ${steps.join("; ")}. Which property justifies Step ${which}?`,
        answer: choice(r, correct, [
          [props[which === 1 ? 2 : 1], `Look at what changed in Step ${which}: was something subtracted or divided?`],
          ["Distributive property", "Nothing was distributed: no parentheses were multiplied out."],
          ["Multiplication property of equality", "Neither side was multiplied by a number."],
        ], true),
        hints: [`Compare the equation before and after Step ${which}.`, which === 1 ? `${k} was removed from both sides.` : `Both sides were divided by ${a}.`],
        steps: [
          st("Step 1.", `Subtract ${k} from both sides: subtraction property of equality.`),
          st("Step 2.", `Divide both sides by ${a}: division property of equality.`),
          st("Step 3.", `${b ** n} = ${b}^${n}, so x = ${n}.`),
          st("Answer.", correct),
        ],
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const a = r.pick([2, 3, 4, 5]), b = r.pick([2, 3]), n = r.int(2, 5);
        const c = a * b ** n;
        const errAt = r.int(1, 3);
        const s1 = errAt === 1 ? `${a * b}^x = ${c}` : `${b}^x = ${b ** n}`;
        const s2 = errAt === 2 ? `x = log(${b ** n}) − log(${b})` : `x · log(${b}) = log(${b ** n})`;
        const s3 = errAt === 3 ? `x = log(${b ** n}) · log(${b})` : `x = {log(${b ** n})/log(${b})} = ${n}`;
        const fixes: Record<number, string> = {
          1: `Step 1 multiplies ${a} into the base. The exponent applies only to ${b}, so divide by ${a}: ${b}^x = ${b ** n}.`,
          2: `Step 2 should take log of both sides and bring the exponent down: x · log(${b}) = log(${b ** n}).`,
          3: `Step 3 should divide by log(${b}), not multiply: x = {log(${b ** n})/log(${b})} = ${n}.`,
        };
        const errSteps = errAt === 1 ? [s1, `x · log(${a * b}) = log(${c})`, `x = {log(${c})/log(${a * b})}`] : [s1, s2, s3];
        return {
          prompt: `Find the first incorrect step in this solution of ${a} · ${b}^x = ${c}. Step 1: ${errSteps[0]}. Step 2: ${errSteps[1]}. Step 3: ${errSteps[2]}.`,
          answer: choice(r, `Step ${errAt}`, [1, 2, 3].filter((k) => k !== errAt).map((k) => [`Step ${k}`, `Check the earlier steps: the first mistake is in Step ${errAt}.`] as [string, string]).concat([["There is no error", fixes[errAt]]]), true),
          hints: ["Check each step against the one before it. What operation was done to both sides?", `In ${a} · ${b}^x, the exponent belongs only to ${b}.`],
          steps: [
            st("Correct solution.", `${b}^x = ${b ** n}; x · log(${b}) = log(${b ** n}); x = {log(${b ** n})/log(${b})} = ${n}`),
            st(`The error is in Step ${errAt}.`, fixes[errAt]),
          ],
        };
      }
      const p = r.int(1, 6);
      let c = r.int(-6, 9);
      if (c === p) c += 1;
      const ans = 2 * p - c;
      const errAt = r.int(1, 3);
      const s1 = errAt === 1 ? `x = ${c} + 2` : `x = ${c} + 2(x − ${p})`;
      const s2 = errAt === 2 ? `x = ${c} + 2x − ${p}` : `x = ${c} + 2x − ${2 * p}`;
      const s3 = errAt === 3 ? `x = ${ms(c - 2 * p)}` : `x = ${ms(ans)}`;
      const fixes: Record<number, string> = {
        1: `Every term must be multiplied by (x − ${p}), including the 2: x = ${c} + 2(x − ${p}).`,
        2: `Distribute to both terms: 2(x − ${p}) = 2x − ${2 * p}.`,
        3: `From −x = ${ms(c - 2 * p)}, dividing by −1 gives x = ${ms(ans)}.`,
      };
      return {
        prompt: `Find the first incorrect step in this solution of {x/x − ${p}} = {${ms(c)}/x − ${p}} + 2. Step 1: ${s1}. Step 2: ${s2}. Step 3: ${s3}.`,
        answer: choice(r, `Step ${errAt}`, [1, 2, 3].filter((k) => k !== errAt).map((k) => [`Step ${k}`, `The first mistake is in Step ${errAt}.`] as [string, string]).concat([["There is no error", fixes[errAt]]]), true),
        hints: [`Step 1 should multiply every term by (x − ${p}).`, "Check the distribution and the signs in each later step."],
        steps: [
          st("Correct solution.", `x = ${ms(c)} + 2(x − ${p}); x = ${ms(c)} + 2x − ${2 * p}; −x = ${ms(c - 2 * p)}; x = ${ms(ans)} (and ${ms(ans)} ≠ ${p}, so it isn't extraneous).`),
          st(`The error is in Step ${errAt}.`, fixes[errAt]),
        ],
      };
    }
    // Level 3: √(x + a) = x − b with one extraneous root.
    for (;;) {
      const r1 = r.int(1, 8), r2 = r.int(-6, 4);
      if ((r1 + r2) % 2 === 0 || r2 >= r1) continue;
      const b = (r1 + r2 - 1) / 2;
      if (!(r1 > b && r2 < b)) continue;
      const a = b * b - r1 * r2;
      if (r2 + a < 0 || a === 0) continue;
      const lhs = `√(x ${a > 0 ? "+" : "−"} ${Math.abs(a)})`;
      const rhs = b === 0 ? "x" : `x ${b > 0 ? "−" : "+"} ${Math.abs(b)}`;
      const correct = `x = ${ms(r1)} only; x = ${ms(r2)} is extraneous`;
      return {
        prompt: `${r.pick(["Zoe", "Eli", "Lily", "Theo"])} squared both sides of ${lhs} = ${rhs} and got x = ${ms(r1)} or x = ${ms(r2)}. Which statement is true?`,
        answer: choice(r, correct, [
          [`x = ${ms(r2)} only; x = ${ms(r1)} is extraneous`, `Substitute both: x = ${ms(r1)} works, x = ${ms(r2)} gives a negative right side.`],
          [`Both x = ${ms(r1)} and x = ${ms(r2)} are solutions`, "Squaring can add a fake solution. Check each one in the original equation."],
          ["Neither is a solution", `x = ${ms(r1)} does work: check it.`],
        ]),
        hints: ["Substitute each value into the ORIGINAL equation.", "A square root is never negative, so the right side must be ≥ 0."],
        steps: [
          st(`Check x = ${ms(r1)}.`, `√(${ms(r1 + a)}) = ${Math.sqrt(r1 + a)} and ${ms(r1)}${cst(-b)} = ${ms(r1 - b)} ✓`),
          st(`Check x = ${ms(r2)}.`, `√(${ms(r2 + a)}) = ${Math.sqrt(r2 + a)} but ${ms(r2)}${cst(-b)} = ${ms(r2 - b)} ✗`),
          st("Conclusion.", correct),
        ],
      };
    }
  },
};

// Keep a reference to helpers used only in some branches.
void sn;
void money;

const skills: Skill[] = [intersect, tableApprox, combine, writeSystem, justify];
export default skills;
