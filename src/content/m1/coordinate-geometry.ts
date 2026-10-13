// Unit 3: Coordinate geometry (NC.M1.G-GPE.4, G-GPE.5, G-GPE.6).
import { choice, exact, expr, ms, num, radical, radText, sn, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, fracMark, fracText, lineText, lineTyped, pt } from "./util";

const T = "m1-coord-geometry";

type P = { x: number; y: number };
const geoOf = (pts: Record<string, P>, extra: Partial<Extract<Visual, { type: "geo" }>> = {}): Visual => ({ type: "geo", points: pts, showLabels: true, grid: true, ...extra });

/** √n in simplest form for display. */
const rootText = (n: number) => { const { a, b } = radical(n); return radText(a, b); };
const rootTyped = (n: number) => { const { a, b } = radical(n); return b === 1 ? String(a) : `${a === 1 ? "" : a}sqrt(${b})`; };
const d2 = (p: P, q: P) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
const slopeOf = (p: P, q: P): Frac | null => (p.x === q.x ? null : frac(q.y - p.y, q.x - p.x));
const slopeStr = (m: Frac | null) => (m === null ? "vertical (no slope)" : fracText(m));
const par = (t: string) => (t.startsWith("−") ? `(${t})` : t);

// ---------- slope ----------

const slope: Skill = {
  id: "m1.coord.slope",
  title: "Slope between two points",
  topic: T,
  standards: ["NC.M1.G-GPE.5", "NC.M1.F-IF.6"],
  prereqs: [],
  lesson: {
    bigIdea: "Slope is rise over run: the change in y divided by the change in x between any two points on a line.",
    explain: [
      "For (x_1, y_1) and (x_2, y_2): m = {y_2 − y_1/x_2 − x_1}. Subtract in the same order on top and bottom.",
      "Worked example: (−1, 4) and (3, −2). m = {−2 − 4/3 − (−1)} = {−6/4} = −{3/2}. The line falls 3 units for every 2 units to the right.",
      "A horizontal line has slope 0 (no rise). A vertical line has undefined slope (no run, and you can't divide by 0).",
    ],
    visual: { type: "plot", xMin: -3, xMax: 5, yMin: -4, yMax: 6, curves: [{ expr: "-1.5x+2.5" }], points: [{ x: -1, y: 4, label: "(−1, 4)" }, { x: 3, y: -2, label: "(3, −2)" }] },
    tip: "Positive slope goes up to the right; negative slope goes down to the right. Use that to check your sign.",
  },
  why: [
    { kind: "choice", prompt: "Why does it not matter which point you call (x_1, y_1)?", choices: ["Swapping the points flips the sign of both the top and the bottom, so the fraction is the same.", "Because slope is always positive.", "It does matter: always start with the point on the left."], correct: 0, explain: "{a/b} = {−a/−b}." },
    { kind: "written", prompt: "Explain why a vertical line has an undefined slope.", keyIdeas: ["all points have the same x-coordinate", "the change in x (run) is 0", "dividing by zero is undefined"], exemplar: "Every point on a vertical line has the same x-value, so the run, x_2 − x_1, is 0. Slope would be rise ÷ 0, and division by zero is undefined." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const m = frac(r.nonzero(-4, 4), r.pick([2, 3]));
      const x1 = r.int(-5, 2), dx = m.d * r.int(1, 2);
      const y1 = r.int(-5, 5), x2 = x1 + dx, y2 = y1 + (m.n * dx) / m.d;
      const askFirst = r.chance(0.5);
      const known = askFirst ? `(${ms(x1)}, k) and ${pt(x2, y2)}` : `${pt(x1, y1)} and (${ms(x2)}, k)`;
      const ans = askFirst ? y1 : y2;
      return {
        prompt: `The line through ${known} has slope ${fracMark(m)}. Find k.`,
        answer: num(ans),
        hints: ["Write the slope formula with k in it and set it equal to the slope.", `The run is ${x2} − ${sn(x1)} = ${dx}. Rise = slope × run.`],
        steps: [st("Find the run.", `${ms(x2)} − ${sn(x1)} = ${dx}`), st("Rise = slope × run.", `${fracMark(m)} × ${dx} = ${ms((m.n * dx) / m.d)}`), st(askFirst ? "Go back from the second point." : "Go up from the first point.", askFirst ? `k = ${ms(y2)} − ${sn((m.n * dx) / m.d)} = ${ms(y1)}` : `k = ${ms(y1)} + ${sn((m.n * dx) / m.d)} = ${ms(y2)}`)],
        traps: traps(frac(ans), [trap(askFirst ? y2 + (m.n * dx) / m.d : y1 - (m.n * dx) / m.d, "Check the direction: the slope's sign tells you whether y goes up or down as x increases.")]),
      };
    }
    const m = lv === 1 ? frac(r.nonzero(-4, 4)) : frac(r.nonzero(-5, 5), r.pick([2, 3, 4, 5]));
    const k = lv === 1 ? r.int(1, 3) : 1;
    const run = m.d * k * (lv === 1 ? 1 : r.int(1, 2));
    const x1 = r.int(-6, 2), y1 = r.int(-6, 6), x2 = x1 + run, y2 = y1 + (m.n * run) / m.d;
    const ys = [y1, y2];
    const visual: Visual = { type: "plot", xMin: Math.min(x1, 0) - 2, xMax: Math.max(x2, 0) + 2, yMin: Math.min(...ys, 0) - 2, yMax: Math.max(...ys, 0) + 2, points: [{ x: x1, y: y1, label: pt(x1, y1) }, { x: x2, y: y2, label: pt(x2, y2) }] };
    const rise = y2 - y1;
    return {
      prompt: `Find the slope of the line through ${pt(x1, y1)} and ${pt(x2, y2)}.`,
      visual,
      answer: num(m),
      hints: ["Slope = (change in y) ÷ (change in x).", `Rise: ${ms(y2)} − ${sn(y1)}. Run: ${ms(x2)} − ${sn(x1)}.`],
      steps: [st("Find the rise.", `${ms(y2)} − ${sn(y1)} = ${ms(rise)}`), st("Find the run.", `${ms(x2)} − ${sn(x1)} = ${run}`), st("Divide.", `m = {${ms(rise)}/${run}} = ${fracMark(m)}`)],
      traps: traps(m, [...(rise !== 0 ? [trap(frac(run, rise), "That's run over rise. Slope is rise (change in y) over run (change in x).")] : []), trap(frac(-rise, run), "Check the sign: subtract the coordinates in the same order on top and bottom."), trap(frac(y2 + y1, x2 - x1), "Subtract the y-values; don't add them.")]),
    };
  },
};

// ---------- distance ----------

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];

const distance: Skill = {
  id: "m1.coord.distance",
  title: "Distance between two points",
  topic: T,
  standards: ["NC.M1.G-GPE.4"],
  prereqs: [],
  lesson: {
    bigIdea: "The distance between two points is the hypotenuse of a right triangle whose legs are the horizontal and vertical changes: d = √((x_2 − x_1)^2 + (y_2 − y_1)^2).",
    explain: [
      "Draw the right triangle: its legs are the run and the rise. The Pythagorean theorem gives the slanted side.",
      "Worked example: A(1, 2) and B(7, 10). Run = 6, rise = 8. d = √(6^2 + 8^2) = √(36 + 64) = √100 = **10**.",
      "If the result isn't a perfect square, simplify the radical: √(4 + 16) = √20 = 2√5 ≈ 4.47.",
    ],
    visual: { type: "geo", points: { A: { x: 1, y: 2 }, B: { x: 7, y: 10 }, C: { x: 7, y: 2 } }, segments: [{ from: "A", to: "B", label: "d" }, { from: "A", to: "C", label: "6", dashed: true }, { from: "C", to: "B", label: "8", dashed: true }], angles: [{ at: "C", from: "A", to: "B", right: true }], showLabels: true, grid: true },
  },
  why: [
    { kind: "choice", prompt: "Why does the distance formula square the differences?", choices: ["It comes from the Pythagorean theorem, a^2 + b^2 = c^2, using the run and rise as legs.", "To make the answer an integer.", "Because distance is measured in square units."], correct: 0, explain: "The segment is the hypotenuse of a right triangle." },
    { kind: "written", prompt: "Explain why the distance from (2, 3) to (2, 9) is just 6 without the formula.", keyIdeas: ["the x-coordinates are equal", "the segment is vertical", "the distance is the difference of the y-values"], exemplar: "Both points have x = 2, so the segment is vertical. Its length is just how far apart the y-values are: 9 − 3 = 6. The formula agrees: √(0 + 36) = 6." },
  ],
  generate(r, lv) {
    let dx: number, dy: number;
    if (lv === 1) { const t = r.pick(TRIPLES.slice(0, 2)); [dx, dy] = r.chance(0.5) ? [t[0], t[1]] : [t[1], t[0]]; }
    else if (lv === 2) { const t = r.pick(TRIPLES); [dx, dy] = r.chance(0.5) ? [t[0], t[1]] : [t[1], t[0]]; }
    else { dx = r.int(1, 6); dy = r.int(1, 6); while (Number.isInteger(Math.sqrt(dx * dx + dy * dy))) dy++; }
    const A = { x: r.int(-6, 3), y: r.int(-6, 3) };
    const B = { x: A.x + dx * r.sign(), y: A.y + dy * r.sign() };
    const s2 = dx * dx + dy * dy;
    const C = { x: B.x, y: A.y };
    const visual = geoOf({ A, B, C }, { segments: [{ from: "A", to: "B" }, { from: "A", to: "C", dashed: true }, { from: "C", to: "B", dashed: true }], angles: [{ at: "C", from: "A", to: "B", right: true }] });
    const isInt = Number.isInteger(Math.sqrt(s2));
    return {
      prompt: `Find the distance between A${pt(A.x, A.y)} and B${pt(B.x, B.y)}.${isInt ? "" : " Give an exact answer in simplest radical form."}`,
      visual,
      answer: isInt ? num(Math.sqrt(s2)) : exact(rootTyped(s2), rootText(s2)),
      hints: ["Find the horizontal change and the vertical change between the points.", `Use the Pythagorean theorem: d^2 = ${dx}^2 + ${dy}^2.`, ...(isInt ? [] : ["Simplify the square root by pulling out a perfect-square factor."])],
      steps: [st("Horizontal change.", `|${ms(B.x)} − ${sn(A.x)}| = ${dx}`), st("Vertical change.", `|${ms(B.y)} − ${sn(A.y)}| = ${dy}`), st("Pythagorean theorem.", `d = √(${dx}^2 + ${dy}^2) = √(${dx * dx} + ${dy * dy}) = √${s2}`), st(isInt ? "Evaluate." : "Simplify.", isInt ? `d = ${Math.sqrt(s2)}` : `d = ${rootText(s2)} ≈ ${f(Math.round(Math.sqrt(s2) * 100) / 100)}`)],
      traps: isInt ? traps(frac(Math.sqrt(s2)), [trap(dx + dy, "Adding the legs isn't the distance. Square them, add, then take the square root."), trap(s2, "That's d^2. Take the square root.")]) : undefined,
    };
  },
};

// ---------- midpoint ----------

const midpoint: Skill = {
  id: "m1.coord.midpoint",
  title: "Midpoints and missing endpoints",
  topic: T,
  standards: ["NC.M1.G-GPE.6"],
  prereqs: [],
  lesson: {
    bigIdea: "The midpoint averages the coordinates: M = ({x_1 + x_2/2}, {y_1 + y_2/2}).",
    explain: [
      "Worked example: the midpoint of (−2, 5) and (6, 1) is ({−2 + 6/2}, {5 + 1/2}) = **(2, 3)**.",
      "Missing endpoint: if M(2, 3) is the midpoint and one end is A(−2, 5), the other end is just as far past M. From A to M is +4 in x and −2 in y, so B = (2 + 4, 3 − 2) = **(6, 1)**.",
      "Shortcut for the missing endpoint: B = 2M − A, one coordinate at a time.",
    ],
    visual: { type: "geo", points: { A: { x: -2, y: 5 }, M: { x: 2, y: 3 }, B: { x: 6, y: 1 } }, segments: [{ from: "A", to: "M", tick: 1 }, { from: "M", to: "B", tick: 1 }], showLabels: true, grid: true },
  },
  why: [
    { kind: "choice", prompt: "Why is the midpoint found by averaging the coordinates?", choices: ["The point halfway between two numbers is their average, in each direction.", "Because you add the points.", "Because the midpoint is always at the origin."], correct: 0, explain: "Halfway between 2 and 8 is 5 = (2 + 8) ÷ 2, and the same holds for y." },
    { kind: "written", prompt: "A student says the other endpoint is found by averaging the known endpoint and the midpoint. Explain the mistake.", keyIdeas: ["averaging gives a point halfway between A and M", "that's a quarter of the way along the segment", "the other endpoint is as far beyond M as A is before it"], exemplar: "Averaging A and M gives the point halfway between them, which is only a quarter of the way along AB. The missing endpoint B must be as far past M as A is before M, so B = M + (M − A)." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const A = { x: r.int(-8, 4), y: r.int(-8, 4) };
      const B = { x: A.x + 2 * r.int(1, 5) * r.sign(), y: A.y + 2 * r.int(1, 5) * r.sign() };
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const lim = Math.max(10, ...[A.x, A.y, B.x, B.y].map(Math.abs));
      return {
        prompt: `Plot the midpoint of the segment from A${pt(A.x, A.y)} to B${pt(B.x, B.y)}.`,
        answer: { kind: "point", x: M.x, y: M.y, min: -lim, max: lim, extraPoints: [{ ...A, label: "A" }, { ...B, label: "B" }] },
        hints: ["Average the x-coordinates.", "Then average the y-coordinates."],
        steps: [st("Average the x-coordinates.", `{${ms(A.x)} + ${sn(B.x)}/2} = ${ms(M.x)}`), st("Average the y-coordinates.", `{${ms(A.y)} + ${sn(B.y)}/2} = ${ms(M.y)}`), st("Midpoint.", pt(M.x, M.y))],
      };
    }
    if (lv === 2) {
      const A = { x: r.int(-9, 5), y: r.int(-9, 5) };
      const B = { x: A.x + r.int(1, 11) * r.sign(), y: A.y + r.int(1, 11) * r.sign() };
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      return {
        prompt: `Find the midpoint of the segment with endpoints ${pt(A.x, A.y)} and ${pt(B.x, B.y)}.`,
        answer: { kind: "multi", fields: [{ value: frac(A.x + B.x, 2), pre: "x =" }, { value: frac(A.y + B.y, 2), pre: "y =" }] },
        hints: ["Midpoint = (average of x's, average of y's).", `x: (${ms(A.x)} + ${sn(B.x)}) ÷ 2. y: (${ms(A.y)} + ${sn(B.y)}) ÷ 2.`],
        steps: [st("Average the x-coordinates.", `{${ms(A.x)} + ${sn(B.x)}/2} = {${ms(A.x + B.x)}/2} = ${f(M.x)}`), st("Average the y-coordinates.", `{${ms(A.y)} + ${sn(B.y)}/2} = {${ms(A.y + B.y)}/2} = ${f(M.y)}`), st("Midpoint.", pt(M.x, M.y))],
      };
    }
    const A = { x: r.int(-8, 6), y: r.int(-8, 6) };
    const M = { x: A.x + r.int(1, 6) * r.sign(), y: A.y + r.int(1, 6) * r.sign() };
    const B = { x: 2 * M.x - A.x, y: 2 * M.y - A.y };
    return {
      prompt: `M${pt(M.x, M.y)} is the midpoint of segment AB, and A is ${pt(A.x, A.y)}. Find the coordinates of B.`,
      visual: geoOf({ A, M }, { segments: [{ from: "A", to: "M", tick: 1 }] }),
      answer: { kind: "multi", fields: [{ value: frac(B.x), pre: "x =" }, { value: frac(B.y), pre: "y =" }] },
      hints: ["How far is it from A to M in x? In y?", "B is the same distance past M in the same direction."],
      steps: [st("From A to M.", `x changes by ${ms(M.x)} − ${sn(A.x)} = ${ms(M.x - A.x)}; y changes by ${ms(M.y)} − ${sn(A.y)} = ${ms(M.y - A.y)}.`), st("Repeat from M.", `B = (${ms(M.x)} + ${sn(M.x - A.x)}, ${ms(M.y)} + ${sn(M.y - A.y)}) = ${pt(B.x, B.y)}`), st("Check.", `Midpoint of ${pt(A.x, A.y)} and ${pt(B.x, B.y)}: (${f((A.x + B.x) / 2)}, ${f((A.y + B.y) / 2)}) ✓`)],
    };
  },
};

// ---------- parallel and perpendicular slopes ----------

function standardForm(m: Frac, b: Frac): string {
  // y = (p/q)x + b  →  −p x + q y = q b, scaled to integers with a positive x-coefficient.
  let A = -m.n * b.d, B = m.d * b.d, C = b.n * m.d;
  if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
  const xPart = A === 0 ? "" : `${A === 1 ? "" : A}x`;
  const yPart = B === 0 ? "" : `${xPart ? (B < 0 ? " − " : " + ") : B < 0 ? "−" : ""}${Math.abs(B) === 1 ? "" : Math.abs(B)}y`;
  return `${xPart}${yPart} = ${ms(C)}`;
}

const parallelPerp: Skill = {
  id: "m1.coord.parallel-perp",
  title: "Parallel and perpendicular slopes",
  topic: T,
  standards: ["NC.M1.G-GPE.5"],
  prereqs: ["m1.coord.slope"],
  lesson: {
    bigIdea: "Parallel lines have equal slopes. Perpendicular lines have slopes that are opposite reciprocals: their product is −1.",
    explain: [
      "y = {2/3}x + 1 and y = {2/3}x − 4 are **parallel**: same slope, different intercepts.",
      "The opposite reciprocal of {2/3} is −{3/2}: flip the fraction and change the sign. y = −{3/2}x + 5 is **perpendicular** to y = {2/3}x + 1. Check: {2/3} × (−{3/2}) = −1.",
      "If a line is in standard form, Ax + By = C, solve for y first or use slope = −{A/B}.",
    ],
    visual: { type: "plot", xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ expr: "(2/3)x+1", label: "y = (2/3)x + 1" }, { expr: "(-3/2)x+1", color: 2, label: "y = −(3/2)x + 1" }] },
    tip: "Just a reciprocal (no sign change) or just a sign change (no flip) is NOT perpendicular.",
  },
  why: [
    { kind: "choice", prompt: "Why must parallel lines have the same slope?", choices: ["If the slopes differed, one line would rise faster and they would eventually cross.", "Because parallel lines have the same y-intercept.", "Because their slopes multiply to −1."], correct: 0, explain: "Equal steepness keeps the gap between the lines constant." },
    { kind: "written", prompt: "Line p has slope 4. Explain why a line perpendicular to p has slope −{1/4}, using rise and run.", keyIdeas: ["p goes up 4 for every 1 to the right", "rotating the slope triangle 90° swaps rise and run and changes a direction", "so the new line goes down 1 for every 4 to the right: slope −1/4"], exemplar: "Line p rises 4 for each 1 unit right. Turning that slope triangle 90° swaps the rise and run and reverses one direction, so the perpendicular line falls 1 for every 4 units right. That's a slope of −1/4, the opposite reciprocal." },
  ],
  generate(r, lv) {
    const m1 = frac(r.nonzero(-5, 5), r.pick([1, 2, 3, 4]));
    const kind = r.pick(["parallel", "perpendicular", "neither"] as const);
    let m2: Frac;
    if (kind === "parallel") m2 = m1;
    else if (kind === "perpendicular") m2 = frac(-m1.d, m1.n);
    else m2 = r.chance(0.5) && Math.abs(m1.n) !== m1.d ? frac(m1.d, m1.n) : frac(-m1.n, m1.d);
    if (kind === "neither" && (m2.n * m1.d === m1.n * m2.d || m2.n * m1.n === -m1.d * m2.d)) m2 = frac(m1.n + m1.d, m1.d);
    const b1n = r.int(-6, 6);
    const b1 = frac(b1n), b2 = frac(kind === "parallel" ? b1n + r.nonzero(-5, 5) : r.int(-6, 6));
    let show1: string, show2: string;
    if (lv === 1) { show1 = `y = ${lineText(m1, b1)}`; show2 = `y = ${lineText(m2, b2)}`; }
    else if (lv === 2) { show1 = `y = ${lineText(m1, b1)}`; show2 = standardForm(m2, b2); }
    else { show1 = standardForm(m1, b1); show2 = standardForm(m2, b2); }
    const names = { parallel: "Parallel", perpendicular: "Perpendicular", neither: "Neither" };
    const product = frac(m1.n * m2.n, m1.d * m2.d);
    return {
      prompt: `Are the lines ${show1} and ${show2} parallel, perpendicular, or neither?`,
      answer: choice(r, names[kind], (["parallel", "perpendicular", "neither"] as const).filter((k) => k !== kind).map((k) => [names[k], k === "parallel" ? "Parallel lines need exactly equal slopes." : k === "perpendicular" ? "Perpendicular slopes multiply to −1: flip AND change the sign." : "Compare the slopes again."] as [string, string]), true),
      hints: [lv === 1 ? "Read each slope: the coefficient of x." : "Rewrite any standard-form line as y = mx + b to read its slope.", "Equal slopes → parallel. Product of −1 → perpendicular."],
      steps: [st("Slope of the first line.", fracText(m1)), st("Slope of the second line.", fracText(m2)), st("Compare.", kind === "parallel" ? "The slopes are equal (and the lines are different), so they're parallel." : `Product of slopes: ${fracText(m1)} × ${par(fracText(m2))} = ${fracText(product)}. ${kind === "perpendicular" ? "That's −1, so they're perpendicular." : "Not equal and not −1, so neither."}`)],
    };
  },
};

const parallelPerpLine: Skill = {
  id: "m1.coord.parallel-perp-line",
  title: "Write a parallel or perpendicular line",
  topic: T,
  standards: ["NC.M1.G-GPE.5"],
  prereqs: ["m1.coord.parallel-perp"],
  lesson: {
    bigIdea: "Get the new slope (same for parallel, opposite reciprocal for perpendicular), then use the given point to find b.",
    explain: [
      "Write the line through (4, 1) perpendicular to y = 2x − 3. The perpendicular slope is −{1/2}.",
      "Substitute the point into y = −{1/2}x + b: 1 = −{1/2}(4) + b, so 1 = −2 + b and b = 3. The line is **y = −{1/2}x + 3**.",
      "For a parallel line, keep the slope and do the same substitution.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 8, yMin: -4, yMax: 6, curves: [{ expr: "2x-3", label: "y = 2x − 3" }, { expr: "-0.5x+3", color: 2 }], points: [{ x: 4, y: 1, label: "(4, 1)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why do you substitute the given point into y = mx + b?", choices: ["The point is on the new line, so its coordinates must make the equation true; that lets you solve for b.", "To find the slope.", "To check whether the lines are parallel."], correct: 0, explain: "Every point on a line satisfies its equation." },
    { kind: "written", prompt: "How many lines are parallel to y = 3x + 1 and pass through (0, 1)? Explain.", keyIdeas: ["a parallel line needs slope 3", "through (0, 1) means b = 1", "that gives y = 3x + 1 itself, which is the same line, so no different parallel line exists"], exemplar: "A parallel line would need slope 3, and passing through (0, 1) forces b = 1. That's y = 3x + 1, the original line. A line isn't parallel to itself in this sense, so there's no separate parallel line through that point: (0, 1) is already on the line." },
  ],
  generate(r, lv) {
    const perp = lv === 1 ? false : lv === 2 ? true : r.chance(0.6);
    const m = lv === 1 ? frac(r.nonzero(-4, 4)) : frac(r.nonzero(-4, 4), r.pick([1, 2, 3]));
    const b = frac(r.int(-5, 5));
    const m2 = perp ? frac(-m.d, m.n) : m;
    const x0 = m2.d * r.int(-3, 3) || m2.d;
    const b2 = r.int(-6, 6);
    const y0 = (m2.n * x0) / m2.d + b2;
    const given = lv === 3 ? standardForm(m, b) : `y = ${lineText(m, b)}`;
    const ys = [y0, b2, b.n];
    const visual: Visual = { type: "plot", xMin: Math.min(x0, 0) - 4, xMax: Math.max(x0, 0) + 4, yMin: Math.min(...ys) - 4, yMax: Math.max(...ys) + 4, curves: [{ expr: lineTyped(m, b), label: given }], points: [{ x: x0, y: y0, label: pt(x0, y0) }] };
    return {
      prompt: `Write the equation of the line through ${pt(x0, y0)} that is ${perp ? "perpendicular" : "parallel"} to ${given}.`,
      visual,
      answer: expr(lineTyped(m2, b2), { lhs: "y", display: lineText(m2, b2) }),
      hints: [lv === 3 ? "Solve the given equation for y to find its slope." : `The given slope is ${fracText(m)}.`, perp ? "Perpendicular: flip the slope and change its sign." : "Parallel: use the same slope.", `Substitute ${pt(x0, y0)} into y = mx + b and solve for b.`],
      steps: [
        ...(lv === 3 ? [st("Find the given slope.", `${given} → y = ${lineText(m, b)}, slope ${fracText(m)}`)] : []),
        st("New slope.", perp ? `Opposite reciprocal of ${fracText(m)}: ${fracText(m2)}` : `Same slope: ${fracText(m2)}`),
        st("Substitute the point.", `${ms(y0)} = ${fracMark(m2)}(${ms(x0)}) + b → ${ms(y0)} = ${f((m2.n * x0) / m2.d)} + b → b = ${ms(b2)}`),
        st("Write the equation.", `y = ${lineText(m2, b2)}`),
      ],
    };
  },
};

// ---------- perimeter and area ----------

const perimeterArea: Skill = {
  id: "m1.coord.perimeter-area",
  title: "Perimeter and area from coordinates",
  topic: T,
  standards: ["NC.M1.G-GPE.4"],
  prereqs: ["m1.coord.distance"],
  lesson: {
    bigIdea: "Use the distance formula for side lengths, then the usual perimeter and area formulas.",
    explain: [
      "Horizontal and vertical sides are easy: just subtract coordinates. Slanted sides need the distance formula.",
      "Worked example: triangle A(−2, 1), B(6, 1), C(3, 7). The base AB is horizontal with length 8. The height is the vertical distance from C to that base: 7 − 1 = 6. Area = {1/2}(8)(6) = **24**.",
      "For a tilted rectangle, find two adjacent side lengths with the distance formula and multiply.",
    ],
    visual: { type: "geo", points: { A: { x: -2, y: 1 }, B: { x: 6, y: 1 }, C: { x: 3, y: 7 }, H: { x: 3, y: 1 } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "H", dashed: true, label: "6" }], showLabels: true, grid: true },
  },
  why: [
    { kind: "choice", prompt: "To find the area of a triangle with a horizontal base, why is the height a vertical distance?", choices: ["The height must be perpendicular to the base, and vertical is perpendicular to horizontal.", "Because the height is always the longest side.", "Because the height is a side of the triangle."], correct: 0, explain: "Height is measured at a right angle to the base." },
    { kind: "written", prompt: "Explain how you'd find the perimeter of a triangle given only the coordinates of its vertices.", keyIdeas: ["find each side length", "use the distance formula (or subtract for horizontal/vertical sides)", "add the three lengths"], exemplar: "Find the length of each of the three sides using the distance formula (or just subtracting coordinates for horizontal or vertical sides), then add the three lengths." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const A = { x: r.int(-7, 1), y: r.int(-7, 1) };
      const w = r.int(3, 9), h = r.int(2, 8);
      const B = { x: A.x + w, y: A.y }, C = { x: A.x + w, y: A.y + h }, D = { x: A.x, y: A.y + h };
      const askArea = r.chance(0.5);
      const ans = askArea ? w * h : 2 * (w + h);
      return {
        prompt: `Rectangle ABCD has vertices A${pt(A.x, A.y)}, B${pt(B.x, B.y)}, C${pt(C.x, C.y)} and D${pt(D.x, D.y)}. Find its ${askArea ? "area" : "perimeter"}.`,
        visual: geoOf({ A, B, C, D }, { polygons: [["A", "B", "C", "D"]] }),
        answer: num(ans),
        hints: ["AB is horizontal and BC is vertical: subtract coordinates to get their lengths.", askArea ? "Area = length × width." : "Perimeter = 2(length + width)."],
        steps: [st("Length of AB.", `${ms(B.x)} − ${sn(A.x)} = ${w}`), st("Length of BC.", `${ms(C.y)} − ${sn(B.y)} = ${h}`), st(askArea ? "Area." : "Perimeter.", askArea ? `${w} × ${h} = ${ans}` : `2(${w} + ${h}) = ${ans}`)],
        traps: traps(frac(ans), [trap(askArea ? 2 * (w + h) : w * h, askArea ? "That's the perimeter. Area is length × width." : "That's the area. Perimeter adds all four sides."), trap(w + h, "That's only two sides.")]),
      };
    }
    if (lv === 2) {
      const A = { x: r.int(-8, 0), y: r.int(-6, 2) };
      const base = r.int(2, 6) * 2, h = r.int(3, 9) * r.sign();
      const B = { x: A.x + base, y: A.y };
      const C = { x: A.x + r.int(-2, base + 2), y: A.y + h };
      const area = (base * Math.abs(h)) / 2;
      const H = { x: C.x, y: A.y };
      return {
        prompt: `Find the area of the triangle with vertices A${pt(A.x, A.y)}, B${pt(B.x, B.y)} and C${pt(C.x, C.y)}.`,
        visual: geoOf({ A, B, C, H }, { polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "H", dashed: true }] }),
        answer: num(area),
        hints: ["AB is horizontal. Use it as the base.", "The height is the vertical distance from C to the line through A and B.", "Area = {1/2} × base × height."],
        steps: [st("Base AB.", `${ms(B.x)} − ${sn(A.x)} = ${base}`), st("Height.", `|${ms(C.y)} − ${sn(A.y)}| = ${Math.abs(h)}`), st("Area.", `{1/2}(${base})(${Math.abs(h)}) = ${f(area)}`)],
        traps: traps(frac(area), [trap(base * Math.abs(h), "Don't forget the {1/2} in the triangle area formula.")]),
      };
    }
    const t = r.pick([[3, 4], [4, 3], [1, 2], [2, 1], [1, 3], [3, 1]]);
    const k = r.pick([2, 3]);
    const u = { x: t[0], y: t[1] }, v = { x: -k * t[1], y: k * t[0] };
    const A = { x: r.int(-4, 2), y: r.int(-6, -2) };
    const B = { x: A.x + u.x, y: A.y + u.y }, C = { x: B.x + v.x, y: B.y + v.y }, D = { x: A.x + v.x, y: A.y + v.y };
    const s1 = u.x ** 2 + u.y ** 2, s2 = v.x ** 2 + v.y ** 2;
    const area = Math.sqrt(s1 * s2);
    return {
      prompt: `ABCD is a rectangle with A${pt(A.x, A.y)}, B${pt(B.x, B.y)}, C${pt(C.x, C.y)} and D${pt(D.x, D.y)}. Find its area.`,
      visual: geoOf({ A, B, C, D }, { polygons: [["A", "B", "C", "D"]] }),
      answer: num(area),
      hints: ["The sides are slanted, so use the distance formula for AB and BC.", `AB = √(${u.x}^2 + ${u.y}^2). BC = √(${sn(v.x)}^2 + ${v.y}^2).`, "Area = AB × BC. Simplify the radicals before multiplying."],
      steps: [st("Length of AB.", `√(${u.x}^2 + ${u.y}^2) = √${s1}${rootText(s1) === `√${s1}` ? "" : ` = ${rootText(s1)}`}`), st("Length of BC.", `√(${sn(v.x)}^2 + ${v.y}^2) = √${s2}${rootText(s2) === `√${s2}` ? "" : ` = ${rootText(s2)}`}`), st("Multiply.", `${rootText(s1)} × ${rootText(s2)} = √${s1 * s2} = ${area}`)],
      traps: traps(frac(area), [trap(s1 + s2, "Multiply the two side lengths; don't add their squares.")]),
    };
  },
};

// ---------- classify figures ----------

const classify: Skill = {
  id: "m1.coord.classify",
  title: "Classify figures with coordinates",
  topic: T,
  standards: ["NC.M1.G-GPE.4", "NC.M1.G-GPE.5"],
  prereqs: ["m1.coord.distance", "m1.coord.parallel-perp"],
  lesson: {
    bigIdea: "Slopes tell you about parallel and perpendicular sides; distances tell you about equal sides. Together they classify a shape.",
    explain: [
      "**Parallelogram:** both pairs of opposite sides parallel (equal slopes). **Rectangle:** a parallelogram with perpendicular sides. **Rhombus:** a parallelogram with all sides equal. **Square:** both. **Trapezoid:** exactly one pair of parallel sides.",
      "Triangles: **right** if two sides are perpendicular (slopes multiply to −1); **isosceles** if two sides are equal; **scalene** if no sides are equal.",
      "Worked example: A(0, 0), B(4, 2), C(3, 4), D(−1, 2). Slopes: AB = {1/2}, BC = −2, CD = {1/2}, DA = −2. Opposite sides are parallel and {1/2} × (−2) = −1, so the angles are right: a rectangle. AB = √20 and BC = √5 aren't equal, so it is not a square.",
    ],
    visual: { type: "geo", points: { A: { x: 0, y: 0 }, B: { x: 4, y: 2 }, C: { x: 3, y: 4 }, D: { x: -1, y: 2 } }, polygons: [["A", "B", "C", "D"]], showLabels: true, grid: true },
    tip: "Pick the most specific name: a square is also a rectangle and a rhombus, but \"square\" says the most.",
  },
  why: [
    { kind: "choice", prompt: "Why isn't checking that all four sides are equal enough to prove a quadrilateral is a square?", choices: ["A rhombus has four equal sides but its angles need not be right angles.", "Because squares have unequal sides.", "It is enough."], correct: 0, explain: "You also need a right angle (perpendicular slopes)." },
    { kind: "written", prompt: "Explain how to use slopes to show that triangle ABC is a right triangle.", keyIdeas: ["find the slopes of the three sides", "check whether any two slopes multiply to −1", "perpendicular sides form a right angle"], exemplar: "Find the slope of each side. If two of the slopes multiply to −1 (or one is horizontal and the other vertical), those sides are perpendicular, so the angle between them is a right angle and the triangle is right." },
  ],
  generate(r, lv) {
    const A = { x: r.int(-5, 0), y: r.int(-5, 0) };
    if (lv === 1) {
      const kind = r.pick(["Right isosceles", "Right scalene", "Isosceles, not right", "Scalene, not right"]);
      let B: P, C: P;
      const a = r.int(1, 4), b = r.int(0, 3);
      if (kind === "Right isosceles") { B = { x: A.x + a, y: A.y + b }; C = { x: A.x - b, y: A.y + a }; }
      else if (kind === "Right scalene") { B = { x: A.x + a, y: A.y + b }; C = { x: A.x - 2 * b, y: A.y + 2 * a }; }
      else if (kind === "Isosceles, not right") { const c = r.int(2, 4); B = { x: A.x + 2 * c, y: A.y }; C = { x: A.x + c, y: A.y + r.pick([c + 2, c + 3, Math.max(1, c - 1)]) }; if (C.y - A.y === c) C.y += 1; }
      else { B = { x: A.x + r.int(4, 6), y: A.y + 1 }; C = { x: A.x + 1, y: A.y + r.int(4, 6) }; if (d2(A, B) === d2(A, C)) C.y += 1; }
      const sides = { AB: d2(A, B), BC: d2(B, C), CA: d2(C, A) };
      const dots = [
        (B.x - A.x) * (C.x - A.x) + (B.y - A.y) * (C.y - A.y),
        (A.x - B.x) * (C.x - B.x) + (A.y - B.y) * (C.y - B.y),
        (A.x - C.x) * (B.x - C.x) + (A.y - C.y) * (B.y - C.y),
      ];
      const isRight = dots.some((d) => d === 0);
      const vals = Object.values(sides);
      const isIso = new Set(vals).size < 3;
      const truth = `${isRight ? "Right" : ""}${isRight ? (isIso ? " isosceles" : " scalene") : isIso ? "Isosceles, not right" : "Scalene, not right"}`;
      return {
        prompt: `Triangle ABC has vertices A${pt(A.x, A.y)}, B${pt(B.x, B.y)} and C${pt(C.x, C.y)}. Which best describes it?`,
        visual: geoOf({ A, B, C }, { polygons: [["A", "B", "C"]] }),
        answer: choice(r, truth, ["Right isosceles", "Right scalene", "Isosceles, not right", "Scalene, not right"].filter((k) => k !== truth).map((k) => [k, k.startsWith("Right") ? "Check the slopes: no two sides multiply to −1." : "Check the slopes: two sides are perpendicular, or compare the side lengths again."] as [string, string]), true),
        hints: ["Find the three side lengths (squared lengths are fine for comparing).", "Find the slopes of the sides. Do any two multiply to −1?"],
        steps: [st("Squared side lengths.", `AB^2 = ${sides.AB}, BC^2 = ${sides.BC}, CA^2 = ${sides.CA}`), st("Slopes.", `AB: ${slopeStr(slopeOf(A, B))}, BC: ${slopeStr(slopeOf(B, C))}, CA: ${slopeStr(slopeOf(C, A))}`), st("Classify.", `${isRight ? "Two sides are perpendicular, so it's a right triangle" : "No two sides are perpendicular"}; ${isIso ? "two sides are equal (isosceles)" : "no sides are equal (scalene)"}.`)],
      };
    }
    const kinds = lv === 2 ? ["Rectangle", "Square", "Parallelogram", "Trapezoid"] : ["Rectangle", "Square", "Rhombus", "Parallelogram", "Trapezoid"];
    const kind = r.pick(kinds);
    let u: P, v: P, B: P, C: P, D: P;
    const a = r.int(1, 4), b = r.int(1, 3);
    if (kind === "Square") { u = { x: a, y: b }; v = { x: -b, y: a }; }
    else if (kind === "Rectangle") { u = { x: a, y: b }; v = { x: -2 * b, y: 2 * a }; if (r.chance(0.5)) { u = { x: a + 1, y: 0 }; v = { x: 0, y: a + 3 }; } }
    else if (kind === "Rhombus") { const pr = r.pick([[[3, 4], [5, 0]], [[4, 3], [0, 5]], [[2, 1], [1, 2]], [[3, 4], [4, 3]], [[4, -3], [0, 5]]]); u = { x: pr[0][0], y: pr[0][1] }; v = { x: pr[1][0], y: pr[1][1] }; }
    else { u = { x: a + 2, y: 0 }; v = { x: b, y: r.int(2, 4) }; if (u.x ** 2 === v.x ** 2 + v.y ** 2) v.y += 1; }
    if (kind === "Trapezoid") { B = { x: A.x + 2 * u.x, y: A.y + 2 * u.y }; D = { x: A.x + v.x, y: A.y + v.y }; C = { x: D.x + u.x, y: D.y + u.y }; }
    else { B = { x: A.x + u.x, y: A.y + u.y }; C = { x: B.x + v.x, y: B.y + v.y }; D = { x: A.x + v.x, y: A.y + v.y }; }
    const sl = [slopeOf(A, B), slopeOf(B, C), slopeOf(C, D), slopeOf(D, A)].map(slopeStr);
    const ln = [d2(A, B), d2(B, C), d2(C, D), d2(D, A)].map((x) => rootText(x));
    const fb: Record<string, string> = {
      Rectangle: "A rectangle needs perpendicular adjacent sides (slopes multiplying to −1).",
      Square: "A square needs perpendicular sides AND four equal sides.",
      Rhombus: "A rhombus needs four equal side lengths.",
      Parallelogram: "A parallelogram needs both pairs of opposite sides parallel.",
      Trapezoid: "A trapezoid has exactly one pair of parallel sides.",
    };
    const reason: Record<string, string> = {
      Square: "Opposite sides are parallel, adjacent slopes multiply to −1, and all sides are equal: a square.",
      Rectangle: "Opposite sides are parallel and adjacent sides are perpendicular, but the sides aren't all equal: a rectangle.",
      Rhombus: "Opposite sides are parallel and all four sides are equal, but adjacent sides aren't perpendicular: a rhombus.",
      Parallelogram: "Both pairs of opposite sides are parallel, but there are no right angles and the sides aren't all equal: a parallelogram.",
      Trapezoid: "AB and CD are parallel but BC and DA are not: exactly one pair of parallel sides makes a trapezoid.",
    };
    return {
      prompt: `Quadrilateral ABCD has vertices A${pt(A.x, A.y)}, B${pt(B.x, B.y)}, C${pt(C.x, C.y)} and D${pt(D.x, D.y)}. What is the most specific name for it?`,
      visual: geoOf({ A, B, C, D }, { polygons: [["A", "B", "C", "D"]] }),
      answer: choice(r, kind, ["Rectangle", "Square", "Rhombus", "Parallelogram", "Trapezoid"].filter((k) => k !== kind).slice(0, 4).map((k) => [k, fb[k]] as [string, string]), true),
      hints: ["Find the slope of each side. Which sides are parallel? Are any perpendicular?", "Find the side lengths. Are they all equal?"],
      steps: [st("Slopes of AB, BC, CD, DA.", sl.join(", ")), st("Lengths of AB, BC, CD, DA.", ln.join(", ")), st("Classify.", reason[kind])],
    };
  },
};

export default [slope, distance, midpoint, parallelPerp, parallelPerpLine, perimeterArea, classify];
