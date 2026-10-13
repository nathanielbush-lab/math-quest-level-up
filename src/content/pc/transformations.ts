// Unit 2: Power-function transformations and piecewise functions (PC.F.4.7, PC.F.5.2).
import { choice, cst, expr, ms, num, sn, trap, traps } from "../helpers";
import { frac, fmtNum, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill } from "../types";
import { shiftExpr, shiftText } from "./util";

const T = "pc-transformations";

interface Parent {
  name: string;
  /** Display of a·f(inner). */
  d: (a: number, inner: string) => string;
  /** Typed a·f(inner). */
  e: (a: number, inner: string) => string;
  f: (x: number) => number;
  /** Key points (x, y) on the parent graph. */
  pts: [number, number][];
  /** Smallest allowed horizontal shift (so square-root answers can be checked). */
  hMax: number;
}

const coefD = (a: number) => (a === 1 ? "" : a === -1 ? "−" : a === 0.5 ? "{1/2}" : a === -0.5 ? "−{1/2}" : ms(a));
const aTxt = (a: number) => (a === 0.5 ? "1/2" : a === -0.5 ? "−1/2" : ms(a));
const coefE = (a: number) => (a === 1 ? "" : a === -1 ? "-" : `${fmtNum(a)}*`);
const wrap = (s: string) => (s === "x" ? "x" : `(${s})`);

const PARENTS: Parent[] = [
  { name: "x^2", d: (a, i) => `${coefD(a)}${wrap(i)}^2`, e: (a, i) => `${coefE(a)}${wrap(i)}^2`, f: (x) => x * x, pts: [[1, 1], [2, 4], [-1, 1], [-2, 4]], hMax: 9 },
  { name: "x^3", d: (a, i) => `${coefD(a)}${wrap(i)}^3`, e: (a, i) => `${coefE(a)}${wrap(i)}^3`, f: (x) => x ** 3, pts: [[1, 1], [2, 8], [-1, -1], [-2, -8]], hMax: 9 },
  { name: "√x", d: (a, i) => `${coefD(a)}√${wrap(i)}`, e: (a, i) => `${coefE(a)}sqrt(${i})`, f: Math.sqrt, pts: [[1, 1], [4, 2], [9, 3]], hMax: 1 },
  { name: "|x|", d: (a, i) => `${coefD(a)}|${i}|`, e: (a, i) => `${coefE(a)}abs(${i})`, f: Math.abs, pts: [[1, 1], [-3, 3], [2, 2]], hMax: 9 },
  { name: "∛x", d: (a, i) => `${coefD(a)}∛${wrap(i)}`, e: (a, i) => `${coefE(a)}cbrt(${i})`, f: Math.cbrt, pts: [[1, 1], [8, 2], [-8, -2], [-1, -1]], hMax: 9 },
];

function describe(a: number, h: number, k: number): string {
  const parts: string[] = [];
  if (a < 0) parts.push("reflect over the x-axis");
  const s = Math.abs(a);
  if (s > 1) parts.push(`stretch vertically by a factor of ${s}`);
  if (s < 1) parts.push("compress vertically by a factor of 1/2");
  if (h) parts.push(`shift ${h > 0 ? "right" : "left"} ${Math.abs(h)}`);
  if (k) parts.push(`shift ${k > 0 ? "up" : "down"} ${Math.abs(k)}`);
  const t = parts.length > 1 ? parts.slice(0, -1).join(", ") + ", then " + parts[parts.length - 1] : parts[0];
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function pickTransform(r: { int: (a: number, b: number) => number; pick: <T>(x: readonly T[]) => T; nonzero: (a: number, b: number) => number }, lv: number, p: Parent) {
  const a = lv === 1 ? r.pick([1, -1]) : lv === 2 ? r.pick([2, -1, 3, -2]) : r.pick([-2, 0.5, -3, 3, -0.5]);
  let h = r.nonzero(-5, 5);
  if (h > p.hMax) h = -h;
  const k = lv === 1 && a === 1 ? r.nonzero(-6, 6) : r.int(-6, 6);
  return { a, h, k };
}

const eqText = (p: Parent, a: number, h: number, k: number) => `${p.d(a, shiftText(h))}${cst(k)}`;
const eqExpr = (p: Parent, a: number, h: number, k: number) => `${p.e(a, shiftExpr(h))}${k ? (k > 0 ? "+" + k : String(k)) : ""}`;

const describeSkill: Skill = {
  id: "pc.transform.describe",
  title: "Describe transformations of power functions",
  topic: T,
  standards: ["PC.F.4.7"],
  prereqs: [],
  lesson: {
    bigIdea: "In y = a·f(x − h) + k: a stretches (and flips if negative) vertically, h shifts right, k shifts up.",
    explain: [
      "Changes **outside** the function act on y and do what they look like: + 3 moves the graph up 3, a factor of 2 doubles every height, a negative sign flips it over the x-axis.",
      "Changes **inside** act on x and do the opposite of what they look like: f(x − 4) moves the graph **right** 4, and f(x + 4) moves it left 4.",
      "Example: y = −2(x + 1)^3 + 5 starts from y = x^3, reflects over the x-axis, stretches vertically by 2, shifts left 1 and up 5. The center point (0, 0) moves to (−1, 5).",
    ],
    visual: { type: "plot", xMin: -5, xMax: 4, yMin: -6, yMax: 10, curves: [{ expr: "x^3", dashed: true, color: 3, label: "y = x³" }, { expr: "-2(x+1)^3+5", label: "y = −2(x + 1)³ + 5" }], points: [{ x: -1, y: 5, label: "(−1, 5)" }] },
    tip: "To check a horizontal shift, ask what x makes the inside zero. For (x + 1), that's x = −1, so the center moved to x = −1.",
  },
  why: [
    { kind: "choice", prompt: "Why does y = (x − 3)^2 sit 3 units to the RIGHT of y = x^2, even though it has a minus sign?", choices: ["You need x to be 3 larger to get the same inside value, so every point happens 3 units later.", "Because minus always means right.", "It actually moves left 3.", "Because the vertex moves down 3."], correct: 0, explain: "The inside x − 3 equals 0 when x = 3, so the vertex that used to be at x = 0 is now at x = 3." },
    { kind: "written", prompt: "Explain the difference between y = 2√x and y = √x + 2.", keyIdeas: ["2√x multiplies every output by 2 (vertical stretch)", "√x + 2 adds 2 to every output (shift up)", "the starting point (0, 0) stays for 2√x but moves to (0, 2) for √x + 2"], exemplar: "y = 2√x doubles every height, so the graph is stretched but still starts at (0, 0). y = √x + 2 adds 2 to every height, so the same shape moves up and starts at (0, 2)." },
  ],
  generate(r, lv) {
    const p = r.pick(PARENTS);
    const { a, h, k } = pickTransform(r, lv, p);
    const right = describe(a, h, k);
    const wrong1 = describe(a, -h, k);
    const wrong2 = describe(a, h, -k || 0);
    const wrong3 = describe(-a, h, k);
    const wrong4 = describe(a, -h, -k);
    const xr = Math.max(Math.abs(h) + 4, 6);
    return {
      prompt: `How is the graph of y = ${eqText(p, a, h, k)} obtained from the graph of y = ${p.name}?`,
      visual: lv === 1 ? { type: "plot", xMin: -xr, xMax: xr, yMin: -10, yMax: 10, curves: [{ expr: p.e(1, "x"), dashed: true, color: 3, label: `y = ${p.name}` }, { expr: eqExpr(p, a, h, k), label: "new graph" }] } : undefined,
      answer: choice(r, right, [[wrong1, `Inside the function the shift goes the opposite way: (${shiftText(h)}) moves the graph ${h > 0 ? "right" : "left"}.`], [wrong2, "Check the vertical shift: the number added outside moves the graph in the direction of its sign."], [wrong3, a < 0 ? "The negative sign in front reflects the graph over the x-axis." : "There is no negative sign in front, so no reflection."], [wrong4, "Both shifts are backwards. Inside: opposite direction. Outside: same direction."]]),
      hints: ["Read the outside of the function first: the number in front and the number added at the end.", `Inside, (${shiftText(h)}) shifts the graph ${h > 0 ? "right" : "left"} ${Math.abs(h)}: whatever makes the inside zero is the new center.`],
      steps: [
        st("Number in front.", a === 1 ? "a = 1: no stretch or reflection." : `a = ${aTxt(a)}: ${a < 0 ? "reflect over the x-axis" : ""}${a < 0 && Math.abs(a) !== 1 ? " and " : ""}${Math.abs(a) > 1 ? `stretch vertically by ${Math.abs(a)}` : Math.abs(a) < 1 ? "compress vertically by 1/2" : ""}.`),
        st("Inside the function.", `${shiftText(h)} = 0 when x = ${ms(h)}, so shift ${h > 0 ? "right" : "left"} ${Math.abs(h)}.`),
        st("Added at the end.", k ? `${cst(k).trim()} shifts ${k > 0 ? "up" : "down"} ${Math.abs(k)}.` : "Nothing added: no vertical shift."),
        st("Together.", right),
      ],
    };
  },
};

const writeSkill: Skill = {
  id: "pc.transform.write",
  title: "Write the equation of a transformed graph",
  topic: T,
  standards: ["PC.F.4.7"],
  prereqs: ["pc.transform.describe"],
  lesson: {
    bigIdea: "Build y = a·f(x − h) + k from a description: reflections and stretches go in a, horizontal shifts go inside (opposite sign), vertical shifts go outside.",
    explain: [
      "Start with y = √x. Reflect over the x-axis and stretch by 3: y = −3√x. Shift left 2: replace x with x + 2, giving y = −3√(x + 2). Shift down 4: **y = −3√(x + 2) − 4**.",
      "Check with the key point (0, 0) of √x: it should end up 2 left and 4 down, at (−2, −4). Plug in x = −2: −3√0 − 4 = −4 ✓.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 8, yMin: -12, yMax: 4, curves: [{ expr: "sqrt(x)", dashed: true, color: 3, label: "y = √x" }, { expr: "-3sqrt(x+2)-4", label: "y = −3√(x + 2) − 4" }], points: [{ x: -2, y: -4, label: "(−2, −4)" }] },
  },
  why: [
    { kind: "choice", prompt: "To shift y = x^3 left 5, why do you write (x + 5)^3 and not (x − 5)^3?", choices: ["The graph's center moves to where the inside equals zero, and x + 5 = 0 at x = −5.", "Because left is always positive.", "Both shift left.", "Because the cube flips signs."], correct: 0, explain: "The center of x^3 is where the input is 0. For (x + 5)^3 that's x = −5, which is 5 to the left." },
    { kind: "written", prompt: "Ruby wrote y = 2(x^2 + 3) for 'stretch y = x^2 by 2, then shift up 3'. Explain her mistake and fix it.", keyIdeas: ["2(x^2 + 3) = 2x^2 + 6 shifts up 6", "the shift should happen after the stretch", "correct: y = 2x^2 + 3"], exemplar: "Her equation multiplies the 3 by 2 too, so it actually shifts the graph up 6. Stretch first to get 2x^2, then add 3: y = 2x^2 + 3." },
  ],
  generate(r, lv) {
    const p = r.pick(PARENTS);
    const { a, h, k } = pickTransform(r, lv, p);
    return {
      prompt: `Start with y = ${p.name}. ${describe(a, h, k)}. Write the equation of the new graph.`,
      answer: expr(eqExpr(p, a, h, k), { lhs: "y", display: eqText(p, a, h, k) }),
      hints: ["Reflections and vertical stretches go in front as a multiplier a.", `Shifting ${h > 0 ? "right" : "left"} ${Math.abs(h)} goes inside as (${shiftText(h)}).`, k ? `Shifting ${k > 0 ? "up" : "down"} ${Math.abs(k)} means ${k > 0 ? "adding" : "subtracting"} ${Math.abs(k)} at the end.` : "There's no vertical shift."],
      steps: [
        st("Multiplier in front.", `a = ${aTxt(a)}`),
        st("Horizontal shift goes inside, with the opposite sign.", `${h > 0 ? "Right" : "Left"} ${Math.abs(h)}: replace x with ${shiftText(h)}.`),
        st("Vertical shift goes outside.", k ? `${k > 0 ? "Up" : "Down"} ${Math.abs(k)}: ${k > 0 ? "add" : "subtract"} ${Math.abs(k)}.` : "None."),
        st("Equation.", `y = ${eqText(p, a, h, k)}`),
      ],
    };
  },
};

const pointsSkill: Skill = {
  id: "pc.transform.points",
  title: "Track a point through a transformation",
  topic: T,
  standards: ["PC.F.4.7"],
  prereqs: ["pc.transform.describe"],
  lesson: {
    bigIdea: "If (p, q) is on y = f(x), then on y = a·f(b(x − h)) + k it moves to ({p/b} + h, aq + k).",
    explain: [
      "Outside changes act on y: multiply the y-coordinate by a, then add k.",
      "Inside changes act on x in reverse: divide the x-coordinate by b, then add h.",
      "Example: (4, 2) is on y = √x. On y = 3√(x − 1) + 5 it becomes (4 + 1, 3 · 2 + 5) = **(5, 11)**. Check: 3√(5 − 1) + 5 = 3 · 2 + 5 = 11 ✓.",
    ],
  },
  why: [
    { kind: "choice", prompt: "(2, 8) is on y = x^3. Why is (1, 8) on y = (2x)^3?", choices: ["At x = 1 the inside is 2x = 2, the same input that gave 8 before.", "Because you multiply the x-coordinate by 2.", "Because the graph stretches vertically.", "It isn't; (4, 8) is."], correct: 0, explain: "Inside changes undo themselves: you need half the x to feed the same value into the cube, so x-coordinates are divided by 2." },
    { kind: "written", prompt: "Explain how to find where the point (−1, 1) on y = x^2 goes on the graph of y = −(x + 4)^2 + 3.", keyIdeas: ["x-coordinate: shift left 4 to −5", "y-coordinate: multiply by −1 then add 3", "new point (−5, 2)", "check by substituting"], exemplar: "The inside (x + 4) shifts left 4, so −1 becomes −5. The outside multiplies y by −1 and adds 3, so 1 becomes −1 + 3 = 2. The new point is (−5, 2), and −(−5 + 4)^2 + 3 = −1 + 3 = 2 checks." },
  ],
  generate(r, lv) {
    const fs = ["f", "g"];
    const fn = r.pick(fs);
    const p = r.int(-4, 6), q = r.int(-5, 6);
    const a = lv === 1 ? 1 : r.pick([2, -1, 3, -2]);
    const h = r.nonzero(-5, 5), k = r.int(-6, 6);
    const b = lv === 3 ? r.pick([2, -1, 0.5]) : 1;
    const pp = b === 2 && p % 2 !== 0 ? p + 1 : p;
    const X: Frac = frac(pp / b + h), Y = frac(a * q + k);
    const inner = b === 1 ? shiftText(h) : b === -1 ? `−(${shiftText(h)})` : b === 2 ? `2(${shiftText(h)})` : `{1/2}(${shiftText(h)})`;
    const ans: Answer = { kind: "multi", fields: [{ value: X, pre: "x =" }, { value: Y, pre: "y =" }] };
    return {
      prompt: `The point (${ms(pp)}, ${ms(q)}) is on the graph of y = ${fn}(x). What point must be on the graph of y = ${a === 1 ? "" : a === -1 ? "−" : ms(a)}${fn}(${inner})${cst(k)}?`,
      answer: ans,
      hints: [
        `The y-coordinate is changed by the outside: ${[a !== 1 ? `multiply by ${ms(a)}` : "", k ? `${k > 0 ? "add" : "subtract"} ${Math.abs(k)}` : ""].filter(Boolean).join(", then ") || "nothing changes it"}.`,
        `The x-coordinate is changed by the inside, in reverse: ${b !== 1 ? `divide by ${b === 0.5 ? "1/2 (double it)" : ms(b)}, then ` : ""}${h > 0 ? "add" : "subtract"} ${Math.abs(h)}.`,
        `Check: at your new x, the inside ${inner} should equal ${ms(pp)}.`,
      ],
      steps: [
        st("New y-coordinate.", `${a === 1 ? "" : `${ms(a)} · ${sn(q)}`}${a === 1 ? ms(q) : ""}${cst(k)} = ${ms(a * q + k)}`),
        st("New x-coordinate.", b === 1 ? `${ms(pp)} + ${sn(h)} = ${ms(pp + h)}` : `Solve ${inner} = ${ms(pp)}: ${shiftText(h)} = ${ms(pp / b)}, so x = ${ms(pp / b)} + ${sn(h)} = ${ms(pp / b + h)}`),
        st("Point.", `(${ms(pp / b + h)}, ${ms(a * q + k)})`),
      ],
    };
  },
};

interface Piece { d: string; e: string; f: (x: number) => number }
function randPiece(r: { int: (a: number, b: number) => number; pick: <T>(x: readonly T[]) => T; nonzero: (a: number, b: number) => number }, c: number, side: "left" | "right"): Piece {
  const kind = r.pick(side === "left" ? ["lin", "quad", "exp"] : ["lin", "quad", "sqrt"]);
  if (kind === "lin") {
    const m = r.nonzero(-3, 3), b = r.int(-4, 4);
    return { d: `${m === 1 ? "" : m === -1 ? "−" : ms(m)}x${cst(b)}`, e: `${m}x${b >= 0 ? "+" + b : b}`, f: (x) => m * x + b };
  }
  if (kind === "quad") {
    const k = r.int(-4, 3);
    return { d: `x^2${cst(k)}`, e: `x^2${k > 0 ? "+" + k : k < 0 ? k : ""}`, f: (x) => x * x + k };
  }
  if (kind === "exp") {
    const k = r.int(-3, 2);
    return { d: `2^x${cst(k)}`, e: `2^x${k > 0 ? "+" + k : k < 0 ? k : ""}`, f: (x) => 2 ** x + k };
  }
  const k = r.int(-2, 3);
  return { d: `√(${shiftText(c)})${cst(k)}`, e: `sqrt(${shiftExpr(c)})${k >= 0 ? "+" + k : k}`, f: (x) => Math.sqrt(x - c) + k };
}

const piecewise: Skill = {
  id: "pc.transform.piecewise",
  title: "Evaluate and read piecewise functions",
  topic: T,
  standards: ["PC.F.4.7", "PC.F.5.2"],
  prereqs: ["pc.transform.describe"],
  lesson: {
    bigIdea: "A piecewise function uses different rules on different intervals. To evaluate, first find which interval the input is in, then use only that rule.",
    explain: [
      "f(x) = x^2 − 1 if x < 2, and f(x) = 3x − 4 if x ≥ 2.",
      "f(1): 1 < 2, so use the first rule: 1 − 1 = 0. f(2): 2 ≥ 2, so use the second rule: 6 − 4 = **2**. The boundary goes with the ≥ piece.",
      "On a graph, a filled dot means the endpoint is included; an open dot means it isn't.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 5, yMin: -2, yMax: 9, curves: [{ expr: "x^2-1", domain: [-3, 2] }, { expr: "3x-4", domain: [2, 5] }], points: [{ x: 2, y: 3, open: true }, { x: 2, y: 2, label: "(2, 2)" }] },
    tip: "Check the boundary carefully: < and ≥ decide which piece owns that exact x-value.",
  },
  why: [
    { kind: "choice", prompt: "For f(x) = x + 1 if x < 3 and 2x if x ≥ 3, why is f(3) = 6 and not 4?", choices: ["3 satisfies x ≥ 3, so only the second rule applies at x = 3.", "You average the two rules at the boundary.", "Because the larger answer always wins.", "Both rules apply, so f(3) has two values."], correct: 0, explain: "Each input belongs to exactly one interval. The condition x ≥ 3 includes 3, so f(3) = 2 · 3 = 6. That's what makes it a function." },
    { kind: "written", prompt: "Explain what open and closed dots at the same x-value on a piecewise graph tell you.", keyIdeas: ["closed dot: that point is on the graph", "open dot: the piece approaches it but doesn't include it", "the function's value at that x is the closed dot"], exemplar: "The closed dot is the actual value of the function at that x. The open dot shows where the other piece would end, but that point isn't included. So f at that x equals the y-value of the closed dot." },
  ],
  generate(r, lv) {
    const c = r.int(-1, 2);
    const L = randPiece(r, c, "left"), R = randPiece(r, c, "right");
    const strictLeft = r.pick([true, false]);
    const leftCond = strictLeft ? `x < ${ms(c)}` : `x ≤ ${ms(c)}`, rightCond = strictLeft ? `x ≥ ${ms(c)}` : `x > ${ms(c)}`;
    const f = (x: number) => (x < c || (x === c && !strictLeft) ? L.f(x) : R.f(x));
    const def = `f(x) = ${L.d} if ${leftCond}; f(x) = ${R.d} if ${rightCond}`;
    if (lv < 3) {
      const x0 = lv === 1 ? r.pick([c - 2, c + 2, c + 3, c - 1]) : c;
      // keep √ inputs perfect squares
      const xIn = R.e.startsWith("sqrt") && x0 > c ? c + r.pick([1, 4]) : x0;
      const ans = f(xIn);
      const other = xIn < c || (xIn === c && !strictLeft) ? R.f(xIn) : L.f(xIn);
      const usesLeft = xIn < c || (xIn === c && !strictLeft);
      return {
        prompt: `${def}. Find f(${ms(xIn)}).`,
        answer: num(frac(ans)),
        hints: [`Which condition does x = ${ms(xIn)} satisfy: ${leftCond} or ${rightCond}?`, `x = ${ms(xIn)} fits ${usesLeft ? leftCond : rightCond}, so use ${usesLeft ? L.d : R.d}.`],
        steps: [st("Pick the piece.", `${ms(xIn)} satisfies ${usesLeft ? leftCond : rightCond}${xIn === c ? " (the boundary belongs to this piece)" : ""}.`), st("Evaluate that rule only.", `f(${ms(xIn)}) = ${(usesLeft ? L.d : R.d).replace(/x/g, `(${ms(xIn)})`)} = ${ms(ans)}`)],
        traps: Number.isFinite(other) ? traps(frac(ans), [trap(frac(other), `That's the other piece. ${ms(xIn)} satisfies ${usesLeft ? leftCond : rightCond}.`)]) : [],
      };
    }
    // Level 3: read from a graph.
    const xa = c - r.int(1, 2), xb = c;
    const va = f(xa), vb = f(xb);
    const ans = va + vb;
    const ys = [L.f(c - 3), L.f(c), R.f(c), R.f(c + 4), L.f(c - 1)].filter(Number.isFinite);
    const lo = Math.floor(Math.min(...ys)) - 2, hi = Math.ceil(Math.max(...ys)) + 2;
    const lc = L.f(c), rc = R.f(c);
    return {
      prompt: "The graph of a piecewise function f is shown. Find f(" + ms(xa) + ") + f(" + ms(xb) + ").",
      visual: { type: "plot", xMin: c - 4, xMax: c + 5, yMin: lo, yMax: hi, curves: [{ expr: L.e, domain: [c - 4, c] }, { expr: R.e, domain: [c, c + 5] }], points: [{ x: c, y: lc, open: strictLeft, label: strictLeft ? undefined : `(${ms(c)}, ${ms(lc)})` }, { x: c, y: rc, open: !strictLeft, label: strictLeft ? `(${ms(c)}, ${ms(rc)})` : undefined }, { x: xa, y: va, label: `(${ms(xa)}, ${ms(va)})` }] },
      answer: num(frac(ans)),
      hints: [`f(${ms(xa)}) is the height of the graph above x = ${ms(xa)}.`, `At x = ${ms(c)} there are two endpoints. Use the filled (closed) dot.`],
      steps: [st(`Read f(${ms(xa)}).`, `f(${ms(xa)}) = ${ms(va)}`), st(`Read f(${ms(c)}) at the closed dot.`, `f(${ms(c)}) = ${ms(vb)} (the open dot at height ${ms(strictLeft ? lc : rc)} is not part of the graph)`), st("Add.", `${ms(va)} + ${sn(vb)} = ${ms(ans)}`)],
      traps: traps(frac(ans), [trap(frac(va + (strictLeft ? lc : rc)), "At the boundary you used the open dot. The function's value is at the filled dot.")]),
    };
  },
};

export default [describeSkill, writeSkill, pointsSkill, piecewise];
