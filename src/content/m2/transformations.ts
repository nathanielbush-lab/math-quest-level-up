// Unit 1: Transformations and symmetry (rigid motions on the coordinate plane, function notation, symmetry).
import { choice, cst, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import type { Rng } from "../../lib/rng";
import { plane, pointAns, pt, randTriangle, PRIME, type P } from "./util";

const T = "m2-transformations";
const A1 = `A${PRIME}`, B1 = `B${PRIME}`, C1 = `C${PRIME}`;

/** A rigid motion (or other mapping) on the plane. */
interface Move {
  name: string;
  rule: string;
  fn: (p: P) => P;
}

const shiftText = (a: number, b: number) => {
  const h = a === 0 ? "" : `${Math.abs(a)} unit${Math.abs(a) === 1 ? "" : "s"} ${a > 0 ? "right" : "left"}`;
  const v = b === 0 ? "" : `${Math.abs(b)} unit${Math.abs(b) === 1 ? "" : "s"} ${b > 0 ? "up" : "down"}`;
  return [h, v].filter(Boolean).join(" and ");
};

const translate = (a: number, b: number): Move => ({ name: `translate ${shiftText(a, b)}`, rule: `(x, y) → (x${cst(a)}, y${cst(b)})`, fn: (p) => ({ x: p.x + a, y: p.y + b }) });
const MOVES: Record<string, Move> = {
  rx: { name: "reflect across the x-axis", rule: "(x, y) → (x, −y)", fn: (p) => ({ x: p.x, y: -p.y }) },
  ry: { name: "reflect across the y-axis", rule: "(x, y) → (−x, y)", fn: (p) => ({ x: -p.x, y: p.y }) },
  ryx: { name: "reflect across the line y = x", rule: "(x, y) → (y, x)", fn: (p) => ({ x: p.y, y: p.x }) },
  rynx: { name: "reflect across the line y = −x", rule: "(x, y) → (−y, −x)", fn: (p) => ({ x: -p.y, y: -p.x }) },
  r90: { name: "rotate 90° counterclockwise about the origin", rule: "(x, y) → (−y, x)", fn: (p) => ({ x: -p.y, y: p.x }) },
  r180: { name: "rotate 180° about the origin", rule: "(x, y) → (−x, −y)", fn: (p) => ({ x: -p.x, y: -p.y }) },
  r270: { name: "rotate 90° clockwise about the origin", rule: "(x, y) → (y, −x)", fn: (p) => ({ x: p.y, y: -p.x }) },
};

const fix = (p: P): P => ({ x: p.x + 0, y: p.y + 0 });
const same = (p: P, q: P) => p.x === q.x && p.y === q.y;

function triVisual(t: [P, P, P], extra: Record<string, P> = {}, polys: string[][] = [["A", "B", "C"]], lines: { from: P; to: P; label: string }[] = []) {
  return plane({ A: t[0], B: t[1], C: t[2], ...extra }, polys, lines);
}

// ---------- 1. Translations ----------
const translations: Skill = {
  id: "m2.trans.translate",
  title: "Translations on the coordinate plane",
  topic: T,
  standards: ["NC.M2.G-CO.2", "NC.M2.G-CO.5", "NC.M2.F-IF.2"],
  prereqs: [],
  lesson: {
    bigIdea: "A translation slides every point the same distance in the same direction: add the same number to every x and the same number to every y.",
    explain: [
      "The rule T(x, y) = (x + 4, y − 3) means “move 4 right and 3 down.” It is a function: you feed it a point and it gives back one image point.",
      "Worked example: A(−2, 1) under T(x, y) = (x + 4, y − 3) goes to A′(−2 + 4, 1 − 3) = **A′(2, −2)**. Do the same to every vertex to get the whole image.",
      "Working backward: if A(1, 5) maps to A′(−2, 7), then x changed by −3 and y changed by +2, so the rule is (x, y) → (x − 3, y + 2).",
    ],
    visual: plane({ A: { x: -2, y: 1 }, B: { x: 0, y: 3 }, C: { x: 1, y: 0 }, "A′": { x: 2, y: -2 }, "B′": { x: 4, y: 0 }, "C′": { x: 5, y: -3 } }, [["A", "B", "C"], ["A′", "B′", "C′"]]),
    tip: "Primes (A′, read “A prime”) name image points. The letter tells you which pre-image point it came from.",
  },
  why: [
    { kind: "choice", prompt: "Why is the image of a translation always congruent to the original figure?", choices: ["Every point moves the same distance in the same direction, so lengths and angles don't change.", "Because the image is always in a different quadrant.", "Because the coordinates get bigger.", "It isn't; translations make figures larger."], correct: 0, explain: "A translation is a rigid motion: it preserves distance and angle measure, so the image is congruent." },
    { kind: "written", prompt: "Explain how to find the translation rule if you know that P(3, −1) maps to P′(−1, 4).", keyIdeas: ["subtract to find the change in x: −1 − 3 = −4", "change in y: 4 − (−1) = 5", "rule (x, y) → (x − 4, y + 5)"], exemplar: "The x-coordinate went from 3 to −1, a change of −4, and the y-coordinate went from −1 to 4, a change of +5. A translation changes every point by the same amounts, so the rule is (x, y) → (x − 4, y + 5)." },
  ],
  generate(r, lv) {
    const t = randTriangle(r, -4, 4);
    const a = r.nonzero(-5, 5), b = r.nonzero(-5, 5);
    const names = ["A", "B", "C"];
    const k = lv === 3 ? 2 : r.int(0, 2);
    const v = t[k];
    const img = { x: v.x + a, y: v.y + b };
    const rule = `T(x, y) = (x${cst(a)}, y${cst(b)})`;
    let prompt: string;
    let extra: Record<string, P> = {};
    const hints: string[] = [];
    const steps: string[] = [];
    if (lv === 1) {
      prompt = `Triangle ABC is shown. Find the image of ${names[k]} under the translation ${rule}.`;
      hints.push(`Apply the rule to ${names[k]}${pt(v.x, v.y)}: replace x with ${ms(v.x)} and y with ${ms(v.y)}.`);
    } else if (lv === 2) {
      prompt = `Triangle ABC is translated ${shiftText(a, b)}. What are the coordinates of ${names[k]}${PRIME}?`;
      hints.push(`“${shiftText(a, b)}” means add ${ms(a)} to x and ${ms(b)} to y.`);
      steps.push(st("Write the rule.", `${rule}`));
    } else {
      extra = { [A1]: { x: t[0].x + a, y: t[0].y + b } };
      prompt = `A translation maps A${pt(t[0].x, t[0].y)} to A${PRIME}${pt(t[0].x + a, t[0].y + b)}. Where does it send C${pt(v.x, v.y)}?`;
      hints.push("Find how much x changed and how much y changed from A to A′. A translation changes every point by those same amounts.");
      steps.push(st("Find the change from A to A′.", `x: ${ms(t[0].x + a)} − ${t[0].x < 0 ? `(${ms(t[0].x)})` : t[0].x} = ${ms(a)}; y: ${ms(t[0].y + b)} − ${t[0].y < 0 ? `(${ms(t[0].y)})` : t[0].y} = ${ms(b)}.`));
      steps.push(st("Write the rule.", rule));
    }
    hints.push(`${names[k]}${PRIME} = (${ms(v.x)}${cst(a)}, ${ms(v.y)}${cst(b)}).`);
    steps.push(st(`Apply the rule to ${names[k]}${pt(v.x, v.y)}.`, `(${ms(v.x)}${cst(a)}, ${ms(v.y)}${cst(b)}) = ${pt(img.x, img.y)}`));
    steps.push(st("Answer.", `${names[k]}${PRIME}${pt(img.x, img.y)}`));
    return { prompt, visual: triVisual(t, extra), answer: pointAns(img.x, img.y), hints, steps };
  },
};

// ---------- 2. Reflections ----------
const reflections: Skill = {
  id: "m2.trans.reflect",
  title: "Reflections across axes and lines",
  topic: T,
  standards: ["NC.M2.G-CO.4", "NC.M2.G-CO.5", "NC.M2.F-IF.2"],
  prereqs: ["m2.trans.translate"],
  lesson: {
    bigIdea: "A reflection flips a figure over a line. Each point and its image are the same distance from the line, on opposite sides, and the line is the perpendicular bisector of the segment joining them.",
    explain: [
      "Rules to know: across the x-axis (x, y) → (x, −y); across the y-axis (x, y) → (−x, y); across y = x (x, y) → (y, x); across y = −x (x, y) → (−y, −x).",
      "For a line like x = 2, count distances. P(5, 1) is 3 units right of x = 2, so its image is 3 units left: **P′(−1, 1)**. In general, across x = k the image is (2k − x, y).",
      "Check: the midpoint of P(5, 1) and P′(−1, 1) is (2, 1), which is on the line x = 2. ✓",
    ],
    visual: plane({ P: { x: 5, y: 1 }, "P′": { x: -1, y: 1 } }, [], [{ from: { x: 2, y: -3 }, to: { x: 2, y: 5 }, label: "x = 2" }]),
  },
  why: [
    { kind: "choice", prompt: "P is reflected across line ℓ to get P′. What must be true about segment PP′?", choices: ["ℓ is its perpendicular bisector.", "It is parallel to ℓ.", "It has the same length as the distance from P to the origin.", "It always passes through the origin."], correct: 0, explain: "A reflection sends each point to the spot directly across the line at the same distance, so ℓ cuts PP′ in half at a right angle." },
    { kind: "written", prompt: "Explain why reflecting (x, y) across the y-axis gives (−x, y).", keyIdeas: ["the y-axis is the line x = 0", "the point keeps its height (y stays the same)", "it ends up the same distance on the other side, so x becomes its opposite"], exemplar: "Reflecting across the y-axis moves a point straight across horizontally, so its height y doesn't change. It ends up the same distance from the axis on the other side, so x becomes −x." },
  ],
  generate(r, lv) {
    const t = randTriangle(r, -4, 4);
    const names = ["A", "B", "C"];
    const k = r.int(0, 2);
    const v = t[k];
    let key: string;
    let mv: Move;
    let lines: { from: P; to: P; label: string }[];
    const hints: string[] = [];
    const steps: string[] = [];
    if (lv === 1) {
      key = r.pick(["rx", "ry"]);
      mv = MOVES[key];
      lines = [];
    } else if (lv === 2) {
      key = r.pick(["ryx", "rynx"]);
      mv = MOVES[key];
      lines = key === "ryx" ? [{ from: { x: -6, y: -6 }, to: { x: 6, y: 6 }, label: "y = x" }] : [{ from: { x: -6, y: 6 }, to: { x: 6, y: -6 }, label: "y = −x" }];
    } else {
      const vert = r.chance(0.5);
      let c = r.nonzero(-3, 3);
      if ((vert ? v.x : v.y) === c) c = c > 0 ? c - 4 : c + 4;
      key = vert ? "x=k" : "y=k";
      mv = vert
        ? { name: `reflect across the line x = ${ms(c)}`, rule: `(x, y) → (${ms(2 * c)} − x, y)`, fn: (p) => ({ x: 2 * c - p.x, y: p.y }) }
        : { name: `reflect across the line y = ${ms(c)}`, rule: `(x, y) → (x, ${ms(2 * c)} − y)`, fn: (p) => ({ x: p.x, y: 2 * c - p.y }) };
      lines = vert ? [{ from: { x: c, y: -7 }, to: { x: c, y: 7 }, label: `x = ${ms(c)}` }] : [{ from: { x: -7, y: c }, to: { x: 7, y: c }, label: `y = ${ms(c)}` }];
      const d = vert ? v.x - c : v.y - c;
      const img = fix(mv.fn(v));
      const dir = vert ? (d > 0 ? ["right of", "left of"] : ["left of", "right of"]) : d > 0 ? ["above", "below"] : ["below", "above"];
      hints.push(`How far is ${names[k]} from the line ${vert ? "x" : "y"} = ${ms(c)}? Its image is the same distance on the other side.`);
      hints.push(`${names[k]} is ${Math.abs(d)} unit${Math.abs(d) === 1 ? "" : "s"} ${dir[0]} the line, so ${names[k]}${PRIME} is ${Math.abs(d)} unit${Math.abs(d) === 1 ? "" : "s"} ${dir[1]} it. Only the ${vert ? "x" : "y"}-coordinate changes.`);
      steps.push(st("Measure the distance to the line.", `${names[k]}${pt(v.x, v.y)} has ${vert ? "x" : "y"} = ${ms(vert ? v.x : v.y)}, which is ${Math.abs(d)} ${dir[0]} the line ${vert ? "x" : "y"} = ${ms(c)}.`));
      steps.push(st("Go the same distance on the other side.", `${ms(c)} ${d > 0 ? "−" : "+"} ${Math.abs(d)} = ${ms(vert ? img.x : img.y)}. The ${vert ? "y" : "x"}-coordinate stays ${ms(vert ? v.y : v.x)}.`));
      steps.push(st("Check with the midpoint.", `The midpoint of ${names[k]} and ${names[k]}${PRIME} is ${pt((v.x + img.x) / 2, (v.y + img.y) / 2)}, which lies on the line. ✓`));
      steps.push(st("Answer.", `${names[k]}${PRIME}${pt(img.x, img.y)}`));
      return { prompt: `Triangle ABC is reflected across the line ${vert ? "x" : "y"} = ${ms(c)}. Find the coordinates of ${names[k]}${PRIME}.`, visual: triVisual(t, {}, [["A", "B", "C"]], lines), answer: pointAns(img.x, img.y), hints, steps };
    }
    const img = fix(mv.fn(v));
    const where = lv === 1 ? (key === "rx" ? "the x-axis" : "the y-axis") : key === "ryx" ? "the line y = x" : "the line y = −x";
    hints.push(lv === 1 ? `Reflecting across ${where} keeps one coordinate and changes the sign of the other. Which one stays the same?` : `Across ${where}, the coordinates ${key === "ryx" ? "swap places" : "swap places and both change sign"}.`);
    hints.push(`The rule is ${mv.rule}.`);
    steps.push(st("Use the reflection rule.", `Across ${where}: ${mv.rule}.`));
    steps.push(st(`Apply it to ${names[k]}${pt(v.x, v.y)}.`, `${names[k]}${PRIME} = ${pt(img.x, img.y)}`));
    steps.push(st("Check.", key === "rx" || key === "ry" ? `${names[k]} and ${names[k]}${PRIME} are the same distance from ${where}, on opposite sides. ✓` : `The midpoint ${pt((v.x + img.x) / 2, (v.y + img.y) / 2)} lies on ${where}. ✓`));
    return { prompt: `Triangle ABC is reflected across ${where}. Find the coordinates of ${names[k]}${PRIME}.`, visual: triVisual(t, {}, [["A", "B", "C"]], lines), answer: pointAns(img.x, img.y), hints, steps };
  },
};

// ---------- 3. Rotations ----------
const rotations: Skill = {
  id: "m2.trans.rotate",
  title: "Rotations about the origin",
  topic: T,
  standards: ["NC.M2.G-CO.5", "NC.M2.F-IF.2", "NC.M2.G-CO.4"],
  prereqs: ["m2.trans.reflect"],
  lesson: {
    bigIdea: "Rotations by multiples of 90° about the origin swap and/or negate the coordinates. Counterclockwise is the positive direction.",
    explain: [
      "90° counterclockwise: (x, y) → (−y, x). 180°: (x, y) → (−x, −y). 90° clockwise (the same as 270° counterclockwise): (x, y) → (y, −x).",
      "Worked example: rotate A(4, 1) 90° counterclockwise. Swap to (1, 4), then make the new first coordinate negative: **A′(−1, 4)**. A was in Quadrant I and A′ is in Quadrant II, which matches a quarter-turn to the left.",
      "Rotations keep each point the same distance from the center: OA = √17 and OA′ = √17.",
    ],
    visual: plane({ O: { x: 0, y: 0 }, A: { x: 4, y: 1 }, "A′": { x: -1, y: 4 } }, [["O", "A"], ["O", "A′"]]),
    tip: "Sanity check with quadrants: a 90° counterclockwise turn moves Quadrant I → II → III → IV → I.",
  },
  why: [
    { kind: "choice", prompt: "Why does a 180° rotation about the origin give the same result as reflecting across the x-axis and then the y-axis?", choices: ["Each reflection negates one coordinate, so together they send (x, y) to (−x, −y).", "Because any two reflections make a translation.", "They don't give the same result.", "Because 180 = 90 + 90 and each reflection is a 90° turn."], correct: 0, explain: "(x, y) → (x, −y) → (−x, −y), which is exactly the 180° rotation rule." },
    { kind: "written", prompt: "Explain why the rule for a 90° counterclockwise rotation about the origin is (x, y) → (−y, x), using the point (1, 0).", keyIdeas: ["(1, 0) is on the positive x-axis", "a quarter turn counterclockwise lands it on the positive y-axis at (0, 1)", "the rule gives (−0, 1) = (0, 1), matching"], exemplar: "The point (1, 0) sits on the positive x-axis. Turning it a quarter turn counterclockwise moves it to the positive y-axis, at (0, 1). The rule (−y, x) gives (−0, 1) = (0, 1), which matches. The same thinking for (0, 1) gives (−1, 0)." },
  ],
  generate(r, lv) {
    const t = randTriangle(r, -5, 5);
    const names = ["A", "B", "C"];
    const k = r.int(0, 2);
    const v = t[k];
    let key: string, words: string;
    if (lv === 1) { key = "r180"; words = "180° about the origin"; }
    else if (lv === 2) { key = r.pick(["r90", "r270"]); words = key === "r90" ? "90° counterclockwise about the origin" : "90° clockwise about the origin"; }
    else { const o = r.pick([["r270", "270° counterclockwise"], ["r90", "270° clockwise"], ["r90", "−270°"], ["r270", "−90°"]]); key = o[0]; words = `${o[1]} about the origin`; }
    const mv = MOVES[key];
    const img = fix(mv.fn(v));
    const hints: string[] = [];
    if (lv === 3) hints.push(`Turn ${words.split(" about")[0]} into a simpler turn: ${key === "r90" ? "it ends in the same place as 90° counterclockwise" : "it ends in the same place as 90° clockwise"}. (Negative angles mean clockwise.)`);
    else hints.push(lv === 1 ? "A half turn about the origin sends a point to the opposite quadrant: both coordinates change sign." : "For a quarter turn, the coordinates swap places, and one of them changes sign.");
    hints.push(`The rule is ${mv.rule}.`);
    const steps = [
      ...(lv === 3 ? [st("Simplify the angle.", `${words.split(" about")[0]} lands in the same place as ${key === "r90" ? "90° counterclockwise" : "90° clockwise"}.`)] : []),
      st("Use the rotation rule.", `${key === "r90" ? "90° counterclockwise" : key === "r180" ? "180°" : "90° clockwise"}: ${mv.rule}.`),
      st(`Apply it to ${names[k]}${pt(v.x, v.y)}.`, `${names[k]}${PRIME} = ${pt(img.x, img.y)}`),
      st("Check the distance from the origin.", `${names[k]}: √(${v.x * v.x} + ${v.y * v.y}) = √${v.x * v.x + v.y * v.y}; ${names[k]}${PRIME}: √(${img.x * img.x} + ${img.y * img.y}) = √${img.x * img.x + img.y * img.y}. Same, as it should be. ✓`),
    ];
    return { prompt: `Triangle ABC is rotated ${words}. Find the coordinates of ${names[k]}${PRIME}.`, visual: triVisual(t, { O: { x: 0, y: 0 } }), answer: pointAns(img.x, img.y), hints, steps };
  },
};

// ---------- 4. Transformations as functions ----------
const notation: Skill = {
  id: "m2.trans.notation",
  title: "Transformations as functions",
  topic: T,
  standards: ["NC.M2.F-IF.1", "NC.M2.F-IF.2"],
  prereqs: ["m2.trans.rotate"],
  lesson: {
    bigIdea: "A transformation is a function whose inputs are points of the plane (the pre-image) and whose outputs are points (the image). Each input point has exactly one output point.",
    explain: [
      "Writing R(x, y) = (−y, x) says: the input is the point (x, y), the output is (−y, x). So R(3, 2) = (−2, 3). The domain is the set of points you start with; the range is the set of image points.",
      "Read a rule to name the transformation: (x + 2, y − 1) is a translation; (x, −y) is a reflection across the x-axis; (−y, x) is a 90° counterclockwise rotation; (3x, 3y) is a dilation with scale factor 3.",
      "Going backward: if T(x, y) = (x − 4, y + 1) and T(P) = (2, 6), undo each part: P = (2 + 4, 6 − 1) = **(6, 5)**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a transformation count as a function?", choices: ["Each input point is sent to exactly one output point.", "Its graph passes the vertical line test.", "It always has an equation y = mx + b.", "Every output comes from two different inputs."], correct: 0, explain: "A function gives exactly one output for each input; a transformation gives exactly one image point for each pre-image point." },
    { kind: "written", prompt: "For T(x, y) = (x + 3, y − 2), explain what the domain and range are when T is applied to triangle ABC with A(0, 0), B(4, 0), C(0, 5).", keyIdeas: ["the domain is the set of points of triangle ABC (the pre-image)", "the range is the set of points of the image triangle", "the image has vertices (3, −2), (7, −2), (3, 3)"], exemplar: "The inputs are the points of triangle ABC, so that set is the domain. The outputs are the points of the image triangle A′B′C′, with vertices (3, −2), (7, −2) and (3, 3), so that set is the range." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const k = r.nonzero(-4, 4);
      const d = Math.abs(k) + 1;
      const opts: [string, string, Move["fn"]][] = [
        ["(x, y) → (−x, y)", "a reflection across the y-axis", MOVES.ry.fn],
        ["(x, y) → (x, −y)", "a reflection across the x-axis", MOVES.rx.fn],
        ["(x, y) → (−y, x)", "a rotation of 90° counterclockwise about the origin", MOVES.r90.fn],
        ["(x, y) → (y, −x)", "a rotation of 90° clockwise about the origin", MOVES.r270.fn],
        ["(x, y) → (−x, −y)", "a rotation of 180° about the origin", MOVES.r180.fn],
        ["(x, y) → (y, x)", "a reflection across the line y = x", MOVES.ryx.fn],
        [`(x, y) → (x${cst(k)}, y − 2)`, `a translation ${shiftText(k, -2)}`, (p) => ({ x: p.x + k, y: p.y - 2 })],
        [`(x, y) → (${d}x, ${d}y)`, `a dilation centered at the origin with scale factor ${d}`, (p) => ({ x: d * p.x, y: d * p.y })],
      ];
      const [rule, name, fn] = r.pick(opts);
      const im = fix(fn({ x: 2, y: 1 }));
      const picks = r.shuffle(opts.filter((o) => o[1] !== name)).slice(0, 3);
      return {
        prompt: `Which transformation does the rule T: ${rule} describe?`,
        answer: choice(r, name, picks.map((w) => { const wi = fix(w[2]({ x: 2, y: 1 })); return [w[1], `That move sends (2, 1) to ${pt(wi.x, wi.y)}, but this rule sends it to ${pt(im.x, im.y)}.`] as [string, string]; })),
        hints: ["Try a sample point such as (2, 1) and see where the rule sends it.", "Swapped coordinates mean a rotation or a reflection across y = x; one sign change with no swap means a reflection across an axis; adding means a translation; multiplying both coordinates means a dilation."],
        steps: [st("Test a point.", `The rule sends (2, 1) to ${pt(im.x, im.y)}.`), st("Name the move.", `${rule} is ${name}.`)],
      };
    }
    const keys = ["rx", "ry", "ryx", "rynx", "r90", "r180", "r270"];
    if (lv === 2) {
      const key = r.pick(keys);
      const mv = MOVES[key];
      const p = { x: r.nonzero(-7, 7), y: r.nonzero(-7, 7) };
      const img = fix(mv.fn(p));
      return {
        prompt: `The function R is defined by R${mv.rule.replace("(x, y) →", "(x, y) =")}. Find R${pt(p.x, p.y)}.`,
        answer: pointAns(img.x, img.y),
        hints: [`Replace x with ${ms(p.x)} and y with ${ms(p.y)} in the output ${mv.rule.split("→ ")[1]}.`, "Watch the signs: −y when y is negative gives a positive number."],
        steps: [st("Substitute.", `x = ${ms(p.x)}, y = ${ms(p.y)}.`), st("Evaluate the output.", `R${pt(p.x, p.y)} = ${pt(img.x, img.y)}`), st("Interpret.", `R is ${mv.name.replace(/^reflect/, "the reflection").replace(/^rotate/, "the rotation")}, so ${pt(p.x, p.y)} lands at ${pt(img.x, img.y)}.`)],
      };
    }
    // Level 3: find the pre-image.
    const a = r.nonzero(-6, 6), b = r.nonzero(-6, 6);
    const p = { x: r.int(-6, 6), y: r.int(-6, 6) };
    const useRot = r.chance(0.5);
    if (useRot) {
      const key = r.pick(["r90", "r270", "ryx", "rynx"]);
      const mv = MOVES[key];
      const img = fix(mv.fn(p));
      return {
        prompt: `R${mv.rule.replace("(x, y) →", "(x, y) =")}. If R(P) = ${pt(img.x, img.y)}, what is P?`,
        answer: pointAns(p.x, p.y),
        hints: ["You know the output, not the input. Set the rule's output equal to the given point.", `Solve ${mv.rule.split("→ ")[1]} = ${pt(img.x, img.y)} one coordinate at a time.`],
        steps: [st("Set up equations.", `${mv.rule.split("→ ")[1]} = ${pt(img.x, img.y)}`), st("Solve each coordinate.", `This gives x = ${ms(p.x)} and y = ${ms(p.y)}.`), st("Check.", `R${pt(p.x, p.y)} = ${pt(img.x, img.y)} ✓`)],
      };
    }
    const img = { x: p.x + a, y: p.y + b };
    return {
      prompt: `T(x, y) = (x${cst(a)}, y${cst(b)}). If T(P) = ${pt(img.x, img.y)}, what is P?`,
      answer: pointAns(p.x, p.y),
      hints: ["T(P) is the output. To find the input, undo what T does.", `Undo ${cst(a).trim()} on x and ${cst(b).trim()} on y.`],
      steps: [st("Set up equations.", `x${cst(a)} = ${ms(img.x)} and y${cst(b)} = ${ms(img.y)}`), st("Solve.", `x = ${ms(p.x)}, y = ${ms(p.y)}`), st("Check.", `T${pt(p.x, p.y)} = (${ms(p.x)}${cst(a)}, ${ms(p.y)}${cst(b)}) = ${pt(img.x, img.y)} ✓`)],
    };
  },
};

// ---------- 5. Rigid motions vs. dilations ----------
const rigid: Skill = {
  id: "m2.trans.rigid",
  title: "Rigid motions and what they preserve",
  topic: T,
  standards: ["NC.M2.G-CO.2", "NC.M2.G-CO.4"],
  prereqs: ["m2.trans.notation"],
  lesson: {
    bigIdea: "Rigid motions (translations, reflections, rotations) preserve distance and angle measure, so the image is congruent. A dilation preserves angles but multiplies lengths by the scale factor, so the image is similar.",
    explain: [
      "If AB = 5 and you reflect, rotate or translate, then A′B′ = 5. If you dilate by scale factor 3, then A′B′ = 15, but every angle stays the same.",
      "Some rules are neither. (x, y) → (2x, y) stretches only sideways. A segment from (0, 0) to (2, 3) has length √13, but its image from (0, 0) to (4, 3) has length **5**. Lengths change by different amounts in different directions, so shapes get distorted.",
      "To test a rule, check a segment's length before and after, using the distance formula d = √((x_2 − x_1)^2 + (y_2 − y_1)^2).",
    ],
  },
  why: [
    { kind: "choice", prompt: "A transformation sends every triangle to a congruent triangle. Which kind could it be?", choices: ["A rigid motion", "A dilation with scale factor 2", "A horizontal stretch (x, y) → (2x, y)", "Any transformation at all"], correct: 0, explain: "Only rigid motions preserve all distances; dilations and stretches change lengths." },
    { kind: "written", prompt: "Explain why a dilation with scale factor 2 is not a rigid motion, even though the image has the same shape.", keyIdeas: ["a rigid motion must preserve distance", "the dilation doubles every length", "angles are preserved, so the image is similar but not congruent"], exemplar: "Rigid motions keep every distance the same. A dilation by 2 doubles every length, so a 3-unit side becomes 6 units. The angles stay the same, so the image is similar to the original, but not congruent." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const k = r.int(2, 4);
      const a = r.nonzero(-5, 5);
      const opts: [string, string, string][] = [
        [`(x, y) → (x${cst(a)}, y + ${Math.abs(a) + 1})`, "rigid", "a translation"],
        ["(x, y) → (−y, x)", "rigid", "a rotation"],
        ["(x, y) → (x, −y)", "rigid", "a reflection"],
        [`(x, y) → (${k}x, ${k}y)`, "dilation", "a dilation"],
        [`(x, y) → ({x/${k}}, {y/${k}})`, "dilation", "a dilation"],
        [`(x, y) → (${k}x, y)`, "neither", "a horizontal stretch"],
        [`(x, y) → (x, ${k}y)`, "neither", "a vertical stretch"],
      ];
      const [rule, kind, what] = r.pick(opts);
      const texts = {
        rigid: "It preserves both distance and angle measure (a rigid motion).",
        dilation: "It preserves angle measure but not distance (a dilation).",
        neither: "It preserves neither all distances nor all angles.",
      };
      const fb = {
        rigid: "Check a segment: does its length change? Rigid motions keep lengths the same.",
        dilation: `Multiplying both coordinates by the same number scales every length by it, so distances change.`,
        neither: "Stretching in only one direction changes some lengths more than others, which also changes angles.",
      };
      return {
        prompt: `Which statement describes the transformation ${rule}?`,
        answer: choice(r, texts[kind as keyof typeof texts], (Object.keys(texts) as (keyof typeof texts)[]).filter((t) => t !== kind).map((t) => [texts[t], fb[kind as keyof typeof fb]] as [string, string])),
        hints: ["Is it a translation, reflection or rotation (rigid), or does it multiply coordinates?", "Multiplying BOTH coordinates by the same number is a dilation. Multiplying only one coordinate is a stretch."],
        steps: [st("Identify the transformation.", `${rule} is ${what}.`), st("Decide what it preserves.", texts[kind as keyof typeof texts])],
      };
    }
    if (lv === 2) {
      const [dx, dy, L] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]);
      const A = { x: r.int(-3, 1), y: r.int(-3, 1) };
      const B = { x: A.x + dx, y: A.y + dy };
      const dil = r.chance(0.6);
      const k = r.pick([2, 3, 4]);
      const what = dil ? `the dilation (x, y) → (${k}x, ${k}y)` : r.pick(["a rotation of 90° about the origin", "a reflection across the y-axis", "the translation (x, y) → (x − 6, y + 2)"]);
      const ans = dil ? k * L : L;
      return {
        prompt: `Segment AB has endpoints A${pt(A.x, A.y)} and B${pt(B.x, B.y)}. Find the length of A${PRIME}B${PRIME} after ${what}.`,
        visual: plane({ A, B }, [["A", "B"]]),
        answer: num(ans),
        hints: [`Find AB first with the distance formula: √((${ms(B.x)} − ${A.x < 0 ? `(${ms(A.x)})` : A.x})^2 + (${ms(B.y)} − ${A.y < 0 ? `(${ms(A.y)})` : A.y})^2).`, dil ? `A dilation multiplies every length by the scale factor ${k}.` : "Rotations, reflections and translations are rigid motions. What do they do to lengths?"],
        steps: [
          st("Find AB.", `AB = √(${dx}^2 + ${dy}^2) = √${dx * dx + dy * dy} = ${L}`),
          st(dil ? "A dilation scales lengths." : "Rigid motions preserve length.", dil ? `A′B′ = ${k} × ${L} = ${ans}` : `A′B′ = AB = ${L}`),
        ],
        traps: traps(frac(ans), dil ? [trap(L, `That's the original length. A dilation by ${k} multiplies lengths by ${k}.`), trap(dx * dy, "Use the distance formula, not the product of the horizontal and vertical changes.")] : [trap(dx + dy, `Distance isn't the sum of the changes: use √(${dx}^2 + ${dy}^2).`), trap(2 * L, "Rigid motions don't change length.")]),
      };
    }
    const [dx, dy, L, o2] = r.pick([[2, 3, 5, 13], [3, 8, 10, 73], [4, 6, 10, 52], [6, 5, 13, 61], [3, 2, 5, 13], [8, 3, 10, 73], [6, 4, 10, 52], [5, 6, 13, 61]]);
    const horiz = r.chance(0.5);
    // horiz: (2x, y) needs (2dx)^2 + dy^2 = L^2; vertical: (x, 2y) needs dx^2 + (2dy)^2 = L^2.
    const [ux, uy] = horiz ? (4 * dx * dx + dy * dy === L * L ? [dx, dy] : [dy, dx]) : (dx * dx + 4 * dy * dy === L * L ? [dx, dy] : [dy, dx]);
    const A = { x: r.int(-3, 0), y: r.int(-3, 0) };
    const B = { x: A.x + ux, y: A.y + uy };
    const f = (p: P) => (horiz ? { x: 2 * p.x, y: p.y } : { x: p.x, y: 2 * p.y });
    const A2 = f(A), B2 = f(B);
    return {
      prompt: `A${pt(A.x, A.y)} and B${pt(B.x, B.y)}, so AB = √${o2}. Apply the stretch S(x, y) = ${horiz ? "(2x, y)" : "(x, 2y)"}. Find A${PRIME}B${PRIME}.`,
      answer: num(L),
      hints: [`Find A′ = S(A) and B′ = S(B) first.`, `A′${pt(A2.x, A2.y)} and B′${pt(B2.x, B2.y)}. Now use the distance formula.`],
      steps: [
        st("Find the image points.", `A′ = ${pt(A2.x, A2.y)}, B′ = ${pt(B2.x, B2.y)}`),
        st("Use the distance formula.", `A′B′ = √(${Math.abs(B2.x - A2.x)}^2 + ${Math.abs(B2.y - A2.y)}^2) = √${L * L} = ${L}`),
        st("Interpret.", `The length went from √${o2} ≈ ${Math.sqrt(o2).toFixed(2)} to ${L}, which is not double, so this stretch is neither a rigid motion nor a dilation.`),
      ],
      traps: traps(frac(L), [trap(2 * Math.round(Math.sqrt(o2)), "Only one coordinate was doubled, so the length doesn't simply double. Find the image points first."), trap(Math.abs(B2.x - A2.x) + Math.abs(B2.y - A2.y), "Distance isn't the sum of the horizontal and vertical changes. Use the distance formula.")]),
    };
  },
};

// ---------- 6. Symmetry ----------
const SHAPES = [
  { name: "rectangle that is not a square", lines: 2, rot: 180 },
  { name: "square", lines: 4, rot: 90 },
  { name: "rhombus that is not a square", lines: 2, rot: 180 },
  { name: "parallelogram that is not a rectangle or rhombus", lines: 0, rot: 180 },
  { name: "isosceles trapezoid", lines: 1, rot: 0 },
  { name: "isosceles triangle that is not equilateral", lines: 1, rot: 0 },
  { name: "kite that is not a rhombus", lines: 1, rot: 0 },
  { name: "scalene triangle", lines: 0, rot: 0 },
];
const an = (w: string) => `${/^[aeiou]/i.test(w) ? "an" : "a"} ${w}`;
const POLY_NAME: Record<number, string> = { 3: "equilateral triangle", 4: "square", 5: "regular pentagon", 6: "regular hexagon", 8: "regular octagon", 9: "regular nonagon", 10: "regular decagon", 12: "regular dodecagon (12 sides)" };

function regularPolygon(n: number) {
  const pts: Record<string, P> = {};
  const names: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (2 * Math.PI * i) / n;
    const key = String.fromCharCode(65 + i);
    pts[key] = { x: Math.round(4 * Math.cos(a) * 1000) / 1000, y: Math.round(4 * Math.sin(a) * 1000) / 1000 };
    names.push(key);
  }
  return { type: "geo" as const, points: pts, polygons: [names], showLabels: false };
}

const symmetry: Skill = {
  id: "m2.trans.symmetry",
  title: "Reflection and rotation symmetry",
  topic: T,
  standards: ["NC.M2.G-CO.3"],
  prereqs: ["m2.trans.rotate"],
  lesson: {
    bigIdea: "A figure has symmetry when a rigid motion maps it exactly onto itself. A regular polygon with n sides has n lines of symmetry and rotation symmetry in steps of 360° ÷ n.",
    explain: [
      "Line (reflection) symmetry: you can fold the figure along a line so the halves match. Rotation symmetry: a turn of less than 360° about the center lands the figure on itself.",
      "Worked example, regular hexagon: 6 lines of symmetry (3 through opposite vertices, 3 through midpoints of opposite sides). Smallest turn: 360° ÷ 6 = **60°**, so 60°, 120°, 180°, 240° and 300° all work.",
      "Not every quadrilateral is so lucky: a rectangle has 2 lines and 180° rotation symmetry; a general parallelogram has 180° rotation symmetry but no lines of symmetry.",
    ],
    visual: regularPolygon(6),
  },
  why: [
    { kind: "choice", prompt: "Why is the smallest rotation that maps a regular n-gon onto itself 360° ÷ n?", choices: ["The n vertices are equally spaced around the center, so each turn moves every vertex to the next one.", "Because each interior angle is 360° ÷ n.", "Because it has n lines of symmetry and each is 360° apart.", "Because a polygon's angles add to 360°."], correct: 0, explain: "The vertices divide the full 360° around the center into n equal central angles." },
    { kind: "written", prompt: "Explain why a rectangle that is not a square has only 2 lines of symmetry, not 4.", keyIdeas: ["lines through midpoints of opposite sides work", "a diagonal fold does not match the halves because adjacent sides have different lengths", "so only the 2 midpoint lines are symmetry lines"], exemplar: "Folding along the line through the midpoints of the long sides, or of the short sides, matches the halves. Folding along a diagonal would put a long side on top of a short side, so it doesn't match. That leaves only 2 lines." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const s = r.pick(SHAPES);
      const ask = r.chance(0.5) ? "lines" : "rot";
      if (ask === "lines") {
        return {
          prompt: `How many lines of symmetry does ${an(s.name)} have?`,
          answer: num(s.lines),
          hints: ["Imagine folding the shape so the two halves land exactly on each other.", "Check the lines through midpoints of sides, and the lines through vertices (such as diagonals)."],
          steps: [st("Test each possible fold.", `${cap(an(s.name))} has ${s.lines} line${s.lines === 1 ? "" : "s"} of symmetry.`), st("Why.", s.lines === 0 ? "No fold makes the halves match." : s.lines === 4 ? "Both diagonals and both midpoint lines work because all sides are equal and all angles are 90°." : s.lines === 2 ? (s.name.startsWith("rhombus") ? "Both diagonals work; the midpoint lines don't, because the angles aren't 90°." : "Both midpoint lines work; the diagonals don't, because adjacent sides differ.") : "Only the line through the middle of the shape (between the equal sides) works.")],
          traps: traps(frac(s.lines), [trap(4, "Four lines only happens for a square. Test the diagonals carefully."), trap(2, "Test both kinds of folds; one of them may not work.")]),
        };
      }
      const correct = s.rot ? `${s.rot}° (and its multiples less than 360°)` : "No turn less than 360° works";
      return {
        prompt: `What is the smallest rotation (more than 0°) about its center that maps ${an(s.name)} onto itself?`,
        answer: choice(r, correct, ["90° (and its multiples less than 360°)", "180° (and its multiples less than 360°)", "120° (and its multiples less than 360°)", "No turn less than 360° works"].filter((c) => c !== correct).map((c) => [c, "Picture the shape turning about its center. Where do the vertices land?"] as [string, string])),
        hints: ["Picture turning the shape about its center. When does it first look exactly the same?", "A half turn (180°) swaps opposite vertices. That works only if opposite sides and angles match."],
        steps: [st("Turn the shape.", s.rot ? `${cap(an(s.name))} first lands on itself after ${s.rot}°.` : `${cap(an(s.name))} only lands on itself after a full 360° turn, so it has no rotation symmetry.`)],
      };
    }
    const n = r.pick([3, 5, 6, 8, 9, 10, 12]);
    const name = POLY_NAME[n];
    if (lv === 1) {
      return {
        prompt: `How many lines of symmetry does the ${name} shown have?`,
        visual: regularPolygon(n),
        answer: num(n),
        hints: ["Draw lines through each vertex and the center. Where does each line come out on the other side?", `A regular polygon has one line of symmetry for each side: ${n} sides.`],
        steps: [st("Count the symmetry lines.", n % 2 === 0 ? `${n / 2} lines join opposite vertices and ${n / 2} lines join midpoints of opposite sides: ${n} in all.` : `Each of the ${n} lines goes from a vertex to the midpoint of the opposite side: ${n} in all.`)],
        traps: traps(frac(n), [trap(n / 2, "That only counts the lines through vertices (or only through midpoints). Count both kinds."), trap(2 * n, "Each line passes through two points of the polygon, so don't count it twice.")]),
      };
    }
    const which = r.chance(0.5);
    const step = 360 / n;
    if (which) {
      return {
        prompt: `What is the smallest angle of rotation (in degrees) about its center that maps a ${name} onto itself?`,
        visual: regularPolygon(n),
        answer: num(step, { unit: "°" }),
        hints: ["The vertices are equally spaced around the center.", `Split the full turn of 360° into ${n} equal parts.`],
        steps: [st("Divide the full turn by the number of vertices.", `360° ÷ ${n} = ${step}°`), st("Interpret.", `Each ${step}° turn moves every vertex to the next one.`)],
        traps: traps(frac(step), [trap(180 * (n - 2) / n, "That's the interior angle of the polygon. Rotation symmetry uses the central angle, 360° ÷ n."), trap(180 / n, "A full turn is 360°, not 180°.")]),
      };
    }
    const m = r.int(2, n - 1);
    return {
      prompt: `A ${name} is rotated about its center. How many different rotations between 0° and 360° (not counting 0° or 360°) map it onto itself?`,
      visual: regularPolygon(n),
      answer: num(n - 1),
      hints: [`The smallest turn is 360° ÷ ${n} = ${step}°.`, `List the multiples of ${step}° that are less than 360°.`],
      steps: [st("Find the smallest turn.", `360° ÷ ${n} = ${step}°`), st("List its multiples below 360°.", `${Array.from({ length: n - 1 }, (_, i) => `${(i + 1) * step}°`).join(", ")}`), st("Count them.", `${n - 1} rotations. (For example, ${m * step}° moves each vertex ${m} places.)`)],
      traps: traps(frac(n - 1), [trap(n, "360° itself was not supposed to be counted."), trap(n + 1, "Don't count 0° or 360°.")]),
    };
  },
};

// ---------- 7. Sequences of transformations ----------
function pickMoves(r: Rng): Move[] {
  const keys = ["rx", "ry", "r90", "r180", "r270", "ryx"];
  const k1 = r.pick(keys);
  const a = r.nonzero(-4, 4), b = r.nonzero(-4, 4);
  return [MOVES[k1], translate(a, b)];
}
const apply = (ms_: Move[], p: P) => fix(ms_.reduce((q, m) => m.fn(q), p));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const sequences: Skill = {
  id: "m2.trans.sequence",
  title: "Sequences of rigid motions",
  topic: T,
  standards: ["NC.M2.G-CO.5", "NC.M2.G-CO.6"],
  prereqs: ["m2.trans.rotate"],
  lesson: {
    bigIdea: "To apply a sequence of transformations, do them one at a time, in order, feeding each image into the next move. The order usually matters.",
    explain: [
      "Worked example: P(2, 3). Reflect across the x-axis: (2, −3). Then translate (x, y) → (x − 5, y + 1): **P″(−3, −2)**. (Two primes mean two moves.)",
      "Swap the order and you get a different point: translate first to (−3, 4), then reflect to (−3, −4).",
      "To find a sequence that maps one figure onto another, first match the orientation (is it flipped? turned?), then slide it into place.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the order of a reflection and a translation usually matter?", choices: ["The reflection acts on wherever the figure is when it's applied, so starting from a different spot gives a different image.", "Reflections can't be combined with translations.", "Translations change the shape, so they must come first.", "It never matters."], correct: 0, explain: "Reflecting across the x-axis sends y to −y. If the figure has already been moved up, it lands further down." },
    { kind: "written", prompt: "Triangle ABC is mapped to triangle A″B″C″ by a rotation followed by a translation. Explain why the two triangles must be congruent.", keyIdeas: ["rotations and translations are rigid motions", "rigid motions preserve side lengths and angle measures", "a sequence of rigid motions is still a rigid motion, so the triangles are congruent"], exemplar: "Both the rotation and the translation are rigid motions, so each one keeps every side length and angle the same. Doing one after the other still keeps them the same, so A″B″C″ has the same sides and angles as ABC. That means the triangles are congruent." },
  ],
  generate(r, lv) {
    const t = randTriangle(r, -4, 4);
    const seq = pickMoves(r);
    const names = ["A", "B", "C"];
    if (lv < 3) {
      const k = r.int(0, 2);
      const v = t[k];
      const mid = fix(seq[0].fn(v));
      const end = fix(seq[1].fn(mid));
      return {
        prompt: `Find ${names[k]}″ when triangle ABC is mapped by this sequence: first ${seq[0].name}, then ${seq[1].name}.`,
        visual: triVisual(t),
        answer: pointAns(end.x, end.y),
        hints: [`Do the first move on ${names[k]}${pt(v.x, v.y)} only. ${cap(seq[0].name)}: ${seq[0].rule}.`, `After the first move, ${names[k]}${PRIME} = ${pt(mid.x, mid.y)}. Now ${seq[1].name}: ${seq[1].rule}.`],
        steps: [st(`First move: ${seq[0].name}.`, `${names[k]}${pt(v.x, v.y)} → ${names[k]}${PRIME}${pt(mid.x, mid.y)}`), st(`Second move: ${seq[1].name}.`, `${names[k]}${PRIME}${pt(mid.x, mid.y)} → ${names[k]}″${pt(end.x, end.y)}`), st("Answer.", `${names[k]}″${pt(end.x, end.y)}`)],
      };
    }
    const img = t.map((p) => apply(seq, p)) as [P, P, P];
    const key0 = Object.keys(MOVES).find((k) => MOVES[k] === seq[0])!;
    const tr = seq[1];
    const shiftA = img[0].x - apply([seq[0]], t[0]).x, shiftB = img[0].y - apply([seq[0]], t[0]).y;
    const cands: Move[][] = [];
    for (const k of ["rx", "ry", "r90", "r180", "r270", "ryx"]) if (k !== key0) {
      const m0 = MOVES[k];
      const p0 = m0.fn(t[0]);
      cands.push([m0, translate(img[0].x - p0.x, img[0].y - p0.y)]);
    }
    cands.push([tr, seq[0]]);
    cands.push([seq[0], translate(-shiftA, shiftB)]);
    cands.push([seq[0], translate(shiftA, -shiftB)]);
    const desc = (m: Move[]) => `${cap(m[0].name)}, then ${m[1].name}`;
    const wrong: [string, string][] = [];
    for (const c of r.shuffle(cands)) {
      if (c.some((m) => m.name.endsWith("translate ") || m.name === "translate ")) continue;
      const im = t.map((p) => apply(c, p));
      if (im.every((p, i) => same(p, img[i]))) continue;
      if (wrong.length < 3) wrong.push([desc(c), "Apply this sequence to one vertex and compare it with the image shown: it lands somewhere else."]);
    }
    return {
      prompt: `Which sequence of rigid motions maps triangle ABC onto triangle A″B″C″ (with A → A″, B → B″, C → C″)?`,
      visual: plane({ A: t[0], B: t[1], C: t[2], "A″": img[0], "B″": img[1], "C″": img[2] }, [["A", "B", "C"], ["A″", "B″", "C″"]]),
      answer: choice(r, desc(seq), wrong),
      hints: ["Test each option on one vertex, say A. Only the right sequence sends A to A″ (and B to B″).", `Look at orientation first: compare the direction from A to B with the direction from A″ to B″. That tells you which flip or turn happened.`],
      steps: [
        st(`Test: ${seq[0].name}.`, `A${pt(t[0].x, t[0].y)} → ${pt(apply([seq[0]], t[0]).x, apply([seq[0]], t[0]).y)}`),
        st(`Then ${tr.name}.`, `→ ${pt(img[0].x, img[0].y)} = A″ ✓`),
        st("Check another vertex.", `B${pt(t[1].x, t[1].y)} → ${pt(img[1].x, img[1].y)} = B″ ✓`),
        st("Answer.", desc(seq)),
      ],
    };
  },
};

const skills: Skill[] = [translations, reflections, rotations, notation, rigid, symmetry, sequences];
export default skills;

// Exposed for challenges.
export { MOVES, translate, apply };
export type { Move };
