// Unit 8: Systems with quadratics and comparing functions (linear-quadratic systems, modeling, comparing representations).
import { choice, ms, num, poly, polyExpr, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { pt } from "./util";

const T = "m2-systems";

const lin = (m: number, k: number) => `${m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : `${ms(m)}x`}${m === 0 ? ms(k) : k === 0 ? "" : k < 0 ? ` − ${-k}` : ` + ${k}`}`;
const linE = (m: number, k: number) => `${m}*x+${k}`.replace("+-", "-");

/** Build y = a x^2 + bx + c and y = mx + k meeting at x = r1, r2. */
function makeSystem(a: number, m: number, k: number, r1: number, r2: number) {
  // a x^2 + bx + c − (mx + k) = a(x − r1)(x − r2)
  const B = -a * (r1 + r2), C = a * r1 * r2;
  const b = B + m, c = C + k;
  return { a, b, c, m, k, y1: m * r1 + k, y2: m * r2 + k };
}

function sysPlot(s: { a: number; b: number; c: number; m: number; k: number }, pts: { x: number; y: number; label?: string }[]): Visual {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const h = -s.b / (2 * s.a), kv = s.a * h * h + s.b * h + s.c;
  const xMin = Math.floor(Math.min(...xs, h) - 3), xMax = Math.ceil(Math.max(...xs, h) + 3);
  const yMin = Math.floor(Math.min(...ys, kv, 0) - 3), yMax = Math.ceil(Math.max(...ys, kv, 0) + 3);
  return { type: "plot", xMin, xMax, yMin, yMax, curves: [{ expr: polyExpr([s.a, s.b, s.c]), label: "parabola" }, { expr: linE(s.m, s.k), label: "line", color: 2 }], points: pts };
}

// ---------- 1. Solve algebraically ----------
const algebra: Skill = {
  id: "m2.sys.linear-quadratic",
  title: "Solve linear-quadratic systems algebraically",
  topic: T,
  standards: ["NC.M2.A-REI.7"],
  prereqs: ["m2.qeq.formula"],
  lesson: {
    bigIdea: "To solve y = (quadratic) and y = (linear), set the two expressions equal, solve the quadratic, then find each y from the linear equation.",
    explain: [
      "y = x^2 − 2x − 1 and y = x + 3. Set equal: x^2 − 2x − 1 = x + 3, so x^2 − 3x − 4 = 0 and (x − 4)(x + 1) = 0.",
      "x = 4 gives y = 7; x = −1 gives y = 2. The solutions are **(−1, 2) and (4, 7)**, the two points where the line crosses the parabola.",
      "A line can meet a parabola 0, 1 or 2 times. One solution means the line is tangent (it just touches).",
    ],
    visual: { type: "plot", xMin: -3, xMax: 6, yMin: -3, yMax: 10, curves: [{ expr: "x^2-2x-1" }, { expr: "x+3", color: 2 }], points: [{ x: -1, y: 2, label: "(−1, 2)" }, { x: 4, y: 7, label: "(4, 7)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why do you set the two expressions for y equal to each other?", choices: ["At a solution, both equations have the same x and the same y.", "Because the parabola and the line are the same.", "To make the x^2 disappear.", "Because y is always 0."], correct: 0, explain: "A solution is a point on both graphs, so the y-values match at that x." },
    { kind: "written", prompt: "Explain why a line and a parabola can't intersect in three points.", keyIdeas: ["setting them equal gives a quadratic equation", "a quadratic equation has at most two real solutions", "so at most two intersection points"], exemplar: "Setting the line equal to the parabola gives a quadratic equation in x. A quadratic has at most two real solutions, so there are at most two x-values where they meet, which means at most two intersection points." },
  ],
  generate(r, lv) {
    const a = lv === 3 ? r.pick([-1, 2, -2]) : 1;
    const r1 = r.int(-5, 2), r2 = r1 + r.int(1, 6);
    const m = r.int(-3, 3), k = r.int(-5, 5);
    const s = makeSystem(a, m, k, r1, r2);
    const quad = poly([s.a, s.b, s.c]);
    const diff = [a, s.b - m, s.c - k];
    const ans: Answer = lv === 1
      ? { kind: "multi", fields: [{ value: frac(r1), pre: "x =" }, { value: frac(r2), pre: "x =" }], anyOrder: [0, 1] }
      : { kind: "multi", fields: [{ value: frac(r1), pre: "left point: (" , post: "," }, { value: frac(s.y1), post: ")" }, { value: frac(r2), pre: "right point: (", post: "," }, { value: frac(s.y2), post: ")" }] };
    return {
      prompt: lv === 1 ? `Find the x-values of the solutions of the system y = ${quad} and y = ${lin(m, k)}.` : `Solve the system y = ${quad} and y = ${lin(m, k)}. Enter the solution with the smaller x first.`,
      answer: ans,
      hints: [`Set the expressions equal: ${quad} = ${lin(m, k)}.`, `Move everything to one side: ${poly(diff)} = 0. Factor${a !== 1 ? ` (take out ${ms(a)} first)` : ""}.`, ...(lv > 1 ? ["Substitute each x into the linear equation to get y."] : [])],
      steps: [
        st("Set the expressions equal.", `${quad} = ${lin(m, k)}`),
        st("Write in standard form.", `${poly(diff)} = 0`),
        st("Factor.", `${a === 1 ? "" : a === -1 ? "−" : ms(a)}(x ${r1 > 0 ? "−" : "+"} ${Math.abs(r1)})(x ${r2 > 0 ? "−" : "+"} ${Math.abs(r2)}) = 0`.replace("(x + 0)", "x").replace("(x − 0)", "x")),
        st("Solve for x.", `x = ${ms(r1)} or x = ${ms(r2)}`),
        ...(lv > 1 ? [st("Find y from the line.", `x = ${ms(r1)}: y = ${ms(s.y1)}; x = ${ms(r2)}: y = ${ms(s.y2)}`), st("Solutions.", `${pt(r1, s.y1)} and ${pt(r2, s.y2)}`)] : []),
      ],
    };
  },
};

// ---------- 2. Systems from graphs ----------
const graphs: Skill = {
  id: "m2.sys.graphs",
  title: "Systems on a graph",
  topic: T,
  standards: ["NC.M2.A-REI.7", "NC.M2.A-REI.11"],
  prereqs: ["m2.sys.linear-quadratic"],
  lesson: {
    bigIdea: "The solutions of a system are the points where the graphs intersect. Reading them off a graph and checking them in both equations go together.",
    explain: [
      "If a line crosses a parabola at (1, 3) and (−2, 0), the system has two solutions. Check (1, 3) in both equations to be sure the reading is exact.",
      "No intersection means no real solution; a single touching point means one solution.",
      "When the crossings aren't on grid lines, a graphing calculator's intersect tool approximates them.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why should you check a point read from a graph in both equations?", choices: ["Graph readings can be off; substituting confirms the point is exactly on both graphs.", "Because graphs are always wrong.", "Only the linear equation matters.", "It's not necessary."], correct: 0, explain: "A point is a solution only if it makes both equations true." },
    { kind: "written", prompt: "The line y = 2 and the parabola y = x^2 + 3 are graphed. Explain how many solutions the system has, using both the graph and algebra.", keyIdeas: ["the parabola's lowest point is (0, 3), above y = 2", "so the graphs never meet", "algebra: x^2 + 3 = 2 gives x^2 = −1, no real solution"], exemplar: "The parabola y = x^2 + 3 has its lowest point at (0, 3), which is above the line y = 2, so they never cross. Algebraically, x^2 + 3 = 2 means x^2 = −1, which has no real solution. Zero solutions." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const n = r.pick([0, 1, 2]);
      const h = r.int(-2, 2), v = r.int(-3, 1);
      const a = r.pick([1, -1]);
      const s = { a, b: -2 * a * h, c: a * h * h + v, m: 0, k: 0 };
      // Horizontal line at different heights relative to the vertex.
      s.k = n === 1 ? v : n === 2 ? v + a * 4 : v - a * 3;
      const pts = n === 1 ? [{ x: h, y: v }] : n === 2 ? [{ x: h - 2, y: s.k }, { x: h + 2, y: s.k }] : [];
      const correct = n === 0 ? "No solutions" : n === 1 ? "One solution" : "Two solutions";
      return {
        prompt: "How many solutions does the system graphed have?",
        visual: sysPlot(s, pts.length ? pts : [{ x: h, y: v }]),
        answer: choice(r, correct, ["No solutions", "One solution", "Two solutions"].filter((c) => c !== correct).map((c) => [c, "Count the points where the line and the parabola meet."] as [string, string]), true),
        hints: ["Solutions are intersection points of the two graphs.", "Count how many times the line touches or crosses the parabola."],
        steps: [st("Count intersections.", `The line ${n === 0 ? "misses the parabola" : n === 1 ? "touches the parabola at its vertex only" : "crosses the parabola twice"}.`), st("Answer.", correct)],
      };
    }
    const r1 = r.int(-4, 1), r2 = r1 + r.int(2, 5);
    const m = r.nonzero(-2, 2), k = r.int(-3, 3);
    const s = makeSystem(lv === 3 ? -1 : 1, m, k, r1, r2);
    if (lv === 2) {
      const correct = `${pt(r1, s.y1)} and ${pt(r2, s.y2)}`;
      return {
        prompt: `The graphs of y = ${poly([s.a, s.b, s.c])} and y = ${lin(m, k)} are shown. What are the solutions of the system?`,
        visual: sysPlot(s, [{ x: r1, y: s.y1 }, { x: r2, y: s.y2 }]),
        answer: choice(r, correct, [[`${pt(s.y1, r1)} and ${pt(s.y2, r2)}`, "Points are (x, y): x first."], [`x = ${ms(r1)} and x = ${ms(r2)} only`, "A solution of a system is a point (x, y)."], [`${pt(r1, 0)} and ${pt(r2, 0)}`, "Those are on the x-axis. The solutions are where the two graphs meet."]]),
        hints: ["Find the points where the line meets the parabola.", `Check one in both equations: at x = ${ms(r1)}, the line gives y = ${ms(s.y1)}.`],
        steps: [st("Read the intersections.", correct), st("Check in both equations.", `x = ${ms(r1)}: ${poly([s.a, s.b, s.c]).replace(/x/g, `(${ms(r1)})`)} = ${ms(s.y1)} and ${lin(m, k).replace(/x/g, `(${ms(r1)})`)} = ${ms(s.y1)} ✓`)],
      };
    }
    // Level 3: context.
    const t1 = r.int(1, 2), t2 = t1 + r.int(2, 3);
    // Ball path h = −(t − t1)(t − t2) + (line) ; line: ramp h = H·t/… keep simple: ramp h = t.
    const sys = makeSystem(-1, 1, 0, t1, t2);
    return {
      prompt: `A ball's path is y = ${poly([sys.a, sys.b, sys.c])} and a ramp follows y = x (x and y in meters, x ≥ 0). The ball is launched from the ramp and lands back on it. Where does it land?`,
      visual: { ...sysPlot(sys, [{ x: t1, y: sys.y1 }, { x: t2, y: sys.y2 }]), xMin: 0 } as Visual,
      answer: { kind: "multi", fields: [{ value: frac(t2), pre: "(", post: "," }, { value: frac(sys.y2), post: ")" }] },
      hints: ["The ball is on the ramp where the two graphs meet. Set the expressions equal.", "There are two meeting points: the launch point and the landing point. Landing is the one farther along."],
      steps: [st("Set equal.", `${poly([sys.a, sys.b, sys.c])} = x`), st("Standard form.", `${poly([-1, t1 + t2, -t1 * t2])} = 0, so (x − ${t1})(x − ${t2}) = 0`), st("Interpret.", `x = ${t1} is the launch point, so it lands at x = ${t2}: ${pt(t2, sys.y2)}.`)],
    };
  },
};

// ---------- 3. Writing systems in context ----------
const modelSys: Skill = {
  id: "m2.sys.model",
  title: "Write systems to model situations",
  topic: T,
  standards: ["NC.M2.A-CED.3", "NC.M2.A-REI.7"],
  prereqs: ["m2.sys.linear-quadratic"],
  lesson: {
    bigIdea: "Give each quantity a variable, write one equation for each relationship, and solve the system. The relationships can be linear, quadratic, square-root or inverse variation.",
    explain: [
      "A stunt drone climbs along h = 6t + 10 while a ball thrown up follows h = −16t^2 + 40t + 10. They're at the same height when 6t + 10 = −16t^2 + 40t + 10: 16t^2 − 34t = 0, so t = 0 or t = 2.125 s.",
      "Inverse variation: splitting a $240 rental among n friends costs c = {240/n} each. If another option is c = 20 + 5n, the costs match when {240/n} = 20 + 5n, which gives n = 4 friends ($60 each).",
      "Always say what each solution means in the situation, and throw out ones that don't make sense (negative times or people).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does c = 240/n model splitting a $240 cost among n people?", choices: ["Each person pays the total divided by the number of people, so cost per person times n is always 240.", "Because the cost goes up by 240 per person.", "Because 240 is the cost when n = 0.", "Because c and n add to 240."], correct: 0, explain: "c · n = 240 is the inverse-variation relationship." },
    { kind: "written", prompt: "A rocket's height is h = −5t^2 + 40t and a balloon's height is h = 15t. Explain what the solutions of the system tell you.", keyIdeas: ["the solutions are times when the heights are equal", "−5t^2 + 40t = 15t gives t = 0 or t = 5", "they start together at t = 0 and are at the same height again at t = 5 (75 m)"], exemplar: "A solution is a time when both are at the same height. Setting −5t^2 + 40t = 15t gives −5t^2 + 25t = 0, so t = 0 or t = 5. They start together on the ground, and at 5 seconds they're both at 75 m." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const total = r.pick([180, 240, 300, 360]), fee = r.pick([10, 15, 20]), per = r.pick([4, 5, 6]);
      const correct = `c = {${total}/n} and c = ${fee} + ${per}n`;
      return {
        prompt: `A group of n friends can split a $${total} cabin rental equally, or each pay a $${fee} booking fee plus $${per} per person in the group (c = cost per person). Which system models the cost per person c?`,
        answer: choice(r, correct, [[`c = ${total}n and c = ${fee} + ${per}n`, "Splitting a total divides by the number of people."], [`c = {${total}/n} and c = ${fee}n + ${per}`, "The fee is the fixed part; $" + per + " is multiplied by n."], [`c = ${total} − n and c = ${fee} + ${per}n`, "Equal shares mean division, not subtraction."]]),
        hints: ["Splitting a fixed total equally among n people: each pays total ÷ n.", `The second option starts at $${fee} and adds $${per} for each person: a linear expression.`],
        steps: [st("Option 1 (inverse variation).", `c = {${total}/n}`), st("Option 2 (linear).", `c = ${fee} + ${per}n`), st("System.", correct)],
      };
    }
    if (lv === 2) {
      // Rocket vs balloon: −a t^2 + b t = m t → t = (b − m)/a
      const a = r.pick([5, 16]), T1 = r.int(2, 6), m = r.pick([10, 12, 15, 20]);
      const b = m + a * T1;
      const hh = m * T1;
      const unit = a === 5 ? "m" : "ft";
      return {
        prompt: `A model rocket's height is h = −${a}t^2 + ${b}t and a drone rises along h = ${m}t (${unit}, t in seconds). Both start at ground level at t = 0. At what time t > 0 are they at the same height?`,
        answer: num(T1, { unit: " s" }),
        hints: [`Set them equal: −${a}t^2 + ${b}t = ${m}t.`, `−${a}t^2 + ${b - m}t = 0, so −${a}t(t − ${T1}) = 0.`],
        steps: [st("Write the equation.", `−${a}t^2 + ${b}t = ${m}t`), st("Standard form.", `−${a}t^2 + ${b - m}t = 0`), st("Factor.", `−${a}t(t − ${T1}) = 0, so t = 0 or t = ${T1}`), st("Interpret.", `t = 0 is the start; they meet again at t = ${T1} s, at ${hh} ${unit}.`)],
        traps: traps(frac(T1), [trap(hh, "That's the height where they meet; the question asks for the time."), trap(0, "That's the start. Find the other time.")]),
      };
    }
    // Level 3: inverse variation vs linear — solve.
    const n = r.int(3, 8), fee = r.pick([10, 15, 20, 25]), per = r.pick([2, 4, 5]);
    const total = n * (fee + per * n);
    return {
      prompt: `Splitting a $${total} party-bus rental among n friends costs {${total}/n} dollars each. A different company charges each person $${fee} plus $${per} for every person in the group: c = ${fee} + ${per}n. For how many friends do the two options cost the same?`,
      answer: num(n),
      hints: [`Set {${total}/n} = ${fee} + ${per}n and multiply both sides by n.`, `${total} = ${fee}n + ${per}n^2, so ${per}n^2 + ${fee}n − ${total} = 0. Solve and keep the positive answer.`],
      steps: [st("Set the costs equal.", `{${total}/n} = ${fee} + ${per}n`), st("Multiply both sides by n (n ≠ 0).", `${total} = ${fee}n + ${per}n^2`), st("Standard form.", `${per}n^2 + ${fee}n − ${total} = 0`), st("Solve.", `n = ${n} (the other solution, ${ms(-total / (per * n))}, is negative)`), st("Check.", `${total} ÷ ${n} = ${total / n} and ${fee} + ${per}(${n}) = ${fee + per * n} ✓`)],
      traps: traps(frac(n), [trap(total / n, "That's the cost per person. The question asks for the number of friends.")]),
    };
  },
};

// ---------- 4. Comparing functions ----------
const compare: Skill = {
  id: "m2.sys.compare-functions",
  title: "Compare functions in different representations",
  topic: T,
  standards: ["NC.M2.F-IF.9", "NC.M2.F-IF.4"],
  prereqs: ["m2.quad.features"],
  lesson: {
    bigIdea: "To compare functions given as an equation, a table, a graph or a description, find the same feature for each one (maximum, intercept, rate of change) and compare the numbers.",
    explain: [
      "f(x) = −(x − 2)^2 + 7 has maximum 7. A table for g shows outputs 1, 4, 5, 4, 1: its maximum is 5. So **f has the greater maximum**.",
      "Average rate of change from x = a to x = b is {f(b) − f(a)/b − a}, for any kind of function: linear, quadratic, square root or inverse variation.",
      "A linear function's rate of change is the same on every interval; a quadratic's isn't.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can you compare a function given by a table with one given by an equation?", choices: ["Both give outputs for inputs, so you can compute the same feature (like the max or a rate of change) for each.", "You can't; they must be in the same form.", "Because tables are always linear.", "Because equations are always bigger."], correct: 0, explain: "A function is the input-output relationship, not its representation." },
    { kind: "written", prompt: "f(x) = 3x + 1 and g is a parabola with vertex (2, 9) opening down. Explain which has a greater value at x = 5 and how you know without graphing.", keyIdeas: ["f(5) = 16", "g has a maximum of 9", "so g(5) ≤ 9 < 16, and f is greater"], exemplar: "f(5) = 3(5) + 1 = 16. Since g opens down with vertex (2, 9), its largest value anywhere is 9, so g(5) is at most 9. So f(5) is greater." },
  ],
  generate(r, lv) {
    const h = r.int(-2, 3), k = r.int(2, 10), a = r.pick([-1, -2]);
    const fText = `${a === -1 ? "−" : "−2"}(x ${h > 0 ? "−" : "+"} ${Math.abs(h)})^2 + ${k}`.replace("(x + 0)", "x").replace("(x − 0)", "x");
    if (lv === 1) {
      const gh = r.int(-1, 4), gk = k + r.pick([-3, -2, -1, 1, 2, 3]);
      const xs = [gh - 2, gh - 1, gh, gh + 1, gh + 2];
      const gv = xs.map((x) => gk - (x - gh) * (x - gh));
      const greater = gk > k ? "g" : "f";
      return {
        prompt: `f(x) = ${fText}. The table shows values of a quadratic function g. Which function has the greater maximum value?`,
        visual: { type: "table", headers: ["x", ...xs.map(String)], rows: [["g(x)", ...gv]] },
        answer: choice(r, greater === "f" ? `f, with maximum ${k}` : `g, with maximum ${gk}`, [[greater === "f" ? `g, with maximum ${gk}` : `f, with maximum ${k}`, `Compare: f's max is ${k} (from vertex form) and g's is ${gk} (the peak of the table).`], [`They have the same maximum`, `${k} ≠ ${gk}.`], [`f, with maximum ${ms(h)}`, `${ms(h)} is the x-coordinate of f's vertex, not its maximum value.`]]),
        hints: [`In vertex form, f's maximum is the k-value: ${k}.`, "In the table, g's values rise then fall symmetrically; the middle value is the maximum."],
        steps: [st("Maximum of f.", `vertex (${ms(h)}, ${k}), so max ${k}`), st("Maximum of g.", `table peaks at x = ${ms(gh)} with g = ${gk}`), st("Compare.", `${greater} has the greater maximum.`)],
      };
    }
    if (lv === 2) {
      // Average rate of change: linear given by description vs quadratic equation.
      const p = r.int(0, 2), q = p + r.int(1, 3);
      const fq = (x: number) => a * (x - h) * (x - h) + k;
      const rf = frac(fq(q) - fq(p), q - p);
      const ans = rf.n / rf.d;
      let m = r.int(-6, 6);
      if (m === ans) m += 1;
      const correct = ans > m ? `f: its average rate of change is ${ms(ans)}` : `g: its rate of change is ${ms(m)}`;
      return {
        prompt: `f(x) = ${fText}. A linear function g increases by ${ms(m)} for every 1-unit increase in x. From x = ${p} to x = ${q}, which function has the greater average rate of change?`,
        answer: choice(r, correct, [[ans > m ? `g: its rate of change is ${ms(m)}` : `f: its average rate of change is ${ms(ans)}`, `f's rate on this interval is ${ms(ans)} and g's is ${ms(m)}. Compare them.`], ["They are equal", `${ms(ans)} ≠ ${ms(m)}.`], [`f: its average rate of change is ${ms(fq(q) - fq(p))}`, "Divide the change in f by the change in x."]].filter((w) => w[0] !== correct) as [string, string][]),
        hints: [`Average rate of change of f = {f(${q}) − f(${p})/${q} − ${p}}.`, `f(${p}) = ${ms(fq(p))} and f(${q}) = ${ms(fq(q))}. g's rate is ${ms(m)} on every interval.`],
        steps: [st("Evaluate f at both ends.", `f(${p}) = ${ms(fq(p))}, f(${q}) = ${ms(fq(q))}`), st("Average rate of change of f.", `{${ms(fq(q))} − ${fq(p) < 0 ? `(${ms(fq(p))})` : fq(p)}/${q} − ${p}} = ${ms(ans)}`), st("Compare with g.", `g's rate is ${ms(m)}. ${ms(Math.max(ans, m))} is greater, so the answer is ${ans > m ? "f" : "g"}.`)],
      };
    }
    // Level 3: which grows faster on an interval / greater y-intercept across representations.
    const s = r.int(1, 3);
    const lineB = r.int(-2, 6);
    const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: s * x + lineB }));
    const fy0 = a * h * h + k;
    const greater = fy0 > lineB ? "f" : fy0 < lineB ? "the line" : "equal";
    const correct = greater === "equal" ? "They have the same y-intercept" : greater === "f" ? `f (y-intercept ${ms(fy0)})` : `The graphed line (y-intercept ${ms(lineB)})`;
    return {
      prompt: `f(x) = ${fText}. A linear function is graphed. Which has the greater y-intercept?`,
      visual: { type: "plot", xMin: -1, xMax: 5, yMin: Math.min(-2, lineB - 2), yMax: s * 4 + lineB + 2, curves: [{ expr: `${s}*x+${lineB}`.replace("+-", "-"), color: 2 }], points: pts.slice(0, 3) },
      answer: choice(r, correct, [[`f (y-intercept ${ms(k)})`, `${k} is the maximum of f, not f(0). Evaluate f(0).`], [`The graphed line (y-intercept ${ms(lineB)})`, `Compare with f(0) = ${ms(fy0)}.`], [`f (y-intercept ${ms(fy0)})`, `The line crosses the y-axis at ${ms(lineB)}.`], ["They have the same y-intercept", `f(0) = ${ms(fy0)} and the line's is ${ms(lineB)}.`]].filter((w) => w[0] !== correct) as [string, string][]),
      hints: ["The y-intercept is the output when x = 0.", `f(0) = ${a === -1 ? "−" : "−2"}(0 ${h > 0 ? "−" : "+"} ${Math.abs(h)})^2 + ${k}. Read the line's y-intercept from the graph.`],
      steps: [st("Evaluate f(0).", `f(0) = ${ms(a * h * h)} + ${k} = ${ms(fy0)}`), st("Read the line.", `It crosses the y-axis at ${ms(lineB)}.`), st("Compare.", correct)],
    };
  },
};

const skills: Skill[] = [algebra, graphs, modelSys, compare];
export default skills;
