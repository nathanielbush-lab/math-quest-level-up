// Unit 7: Circles: angle and segment relationships, arcs and sectors, and circle equations.
import { choice, cst, exact, ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { gcd } from "./util";

const T = "m3-circles";

const at = (r: number, deg: number) => ({ x: r * Math.cos((deg * Math.PI) / 180), y: r * Math.sin((deg * Math.PI) / 180) });

/** "(x − 3)^2" / "(x + 2)^2" / "x^2". */
const sq = (v: string, h: number) => (h === 0 ? `${v}^2` : `(${v} ${h > 0 ? "−" : "+"} ${Math.abs(h)})^2`);

/** Circle with central angle AOB and an inscribed angle ACB on the major arc. */
function inscribedFigure(c: number, centralLabel?: string, inscribedLabel?: string): Visual {
  const a0 = 200;
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, A: at(5, a0), B: at(5, a0 + c), C: at(5, a0 + c + (360 - c) / 2) },
    circles: [{ center: "O", r: 5 }],
    segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }, { from: "C", to: "A" }, { from: "C", to: "B" }],
    angles: [{ at: "O", from: "A", to: "B", label: centralLabel }, { at: "C", from: "A", to: "B", label: inscribedLabel }],
    showLabels: true,
  };
}

/** Two tangents from P touching the circle at A and B. */
function tangentFigure(labels: { PA?: string; PB?: string; OA?: string; OP?: string; angle?: string; central?: string }): Visual {
  const r = 3, d = 7;
  const phi = (Math.acos(r / d) * 180) / Math.PI;
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, P: { x: d, y: 0 }, A: at(r, phi), B: at(r, -phi) },
    circles: [{ center: "O", r }],
    segments: [
      { from: "P", to: "A", label: labels.PA }, { from: "P", to: "B", label: labels.PB },
      { from: "O", to: "A", label: labels.OA, dashed: true }, { from: "O", to: "B", dashed: true },
      ...(labels.OP ? [{ from: "O", to: "P", label: labels.OP, dashed: true }] : []),
    ],
    angles: [{ at: "A", from: "O", to: "P", right: true }, { at: "B", from: "O", to: "P", right: true }, ...(labels.angle ? [{ at: "P", from: "A", to: "B", label: labels.angle }] : []), ...(labels.central ? [{ at: "O", from: "A", to: "B", label: labels.central }] : [])],
    showLabels: true,
  };
}

// ---------------------------------------------------------------------------
const inscribed: Skill = {
  id: "m3.circ.inscribed",
  title: "Central and inscribed angles",
  topic: T,
  standards: ["NC.M3.G-C.2", "NC.M3.G-CO.14"],
  prereqs: [],
  lesson: {
    bigIdea: "A central angle equals its intercepted arc. An inscribed angle (vertex on the circle) is half its intercepted arc, so it's half the central angle that cuts off the same arc.",
    explain: [
      "In the figure, central angle ∠AOB = 110°, so arc AB = 110°. Inscribed angle ∠ACB intercepts the same arc, so ∠ACB = {1/2} · 110° = **55°**.",
      "Two consequences: an angle inscribed in a semicircle is 90° (half of 180°), and opposite angles of a quadrilateral inscribed in a circle add to 180°.",
    ],
    visual: inscribedFigure(110, "110°", "55°"),
  },
  why: [
    { kind: "choice", prompt: "Why is any angle inscribed in a semicircle a right angle?", choices: ["It intercepts a 180° arc, and an inscribed angle is half its arc.", "Because the diameter is the longest chord.", "Only if the triangle is isosceles."], correct: 0, explain: "½ · 180° = 90°." },
    { kind: "written", prompt: "ABCD is inscribed in a circle. Explain why ∠A + ∠C = 180°.", keyIdeas: ["∠A and ∠C are inscribed angles", "they intercept the two arcs that together make the whole circle (360°)", "half of 360° is 180°"], exemplar: "∠A intercepts arc BCD and ∠C intercepts arc BAD. Together those arcs are the whole circle, 360°. Each inscribed angle is half its arc, so ∠A + ∠C = ½ · 360° = 180°." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const c = 2 * r.int(20, 80);
      return {
        prompt: `In circle O, central angle ∠AOB = ${c}°. Find the inscribed angle ∠ACB.`,
        visual: inscribedFigure(c, `${c}°`, "?"),
        answer: num(c / 2, { unit: "°" }),
        hints: ["Both angles intercept arc AB.", "An inscribed angle is half the central angle on the same arc."],
        steps: [st("Arc AB.", `A central angle equals its arc: arc AB = ${c}°.`), st("Inscribed angle.", `∠ACB = {1/2} · ${c}° = ${c / 2}°`)],
        traps: traps(frac(c / 2), [trap(c, "That's the central angle. An inscribed angle is half of it."), trap(2 * c, "Halve the arc; don't double it.")]),
      };
    }
    if (lv === 2) {
      const x = r.int(20, 80);
      return {
        prompt: `Inscribed angle ∠ACB = ${x}°. What is the measure of arc AB (the arc inside the angle)?`,
        visual: inscribedFigure(2 * x, undefined, `${x}°`),
        answer: num(2 * x, { unit: "°" }),
        hints: ["An inscribed angle is half its intercepted arc.", `So the arc is twice ${x}°.`],
        steps: [st("Inscribed angle theorem.", `∠ACB = {1/2} · arc AB`), st("Solve.", `arc AB = 2 · ${x}° = ${2 * x}°`)],
        traps: traps(frac(2 * x), [trap(x / 2, "Double the inscribed angle to get the arc."), trap(360 - 2 * x, "That's the other arc, the one outside the angle.")]),
      };
    }
    if (r.chance(0.5)) {
      // Cyclic quadrilateral: ∠A = (p x + q), ∠C = (s x + u), sum 180.
      for (;;) {
        const x = r.int(8, 30), p = r.int(2, 5), s = r.int(1, 4);
        const A = r.int(50, 130);
        const q = A - p * x, u = 180 - A - s * x;
        if (q === 0 || u === 0) continue;
        const Pts = { O: { x: 0, y: 0 }, A: at(5, 160), B: at(5, 70), C: at(5, -20), D: at(5, 230) };
        return {
          prompt: `Quadrilateral ABCD is inscribed in a circle. ∠A = (${p}x${cst(q)})° and ∠C = (${s === 1 ? "" : s}x${cst(u)})°. Find the measure of ∠A.`,
          visual: { type: "geo", points: Pts, circles: [{ center: "O", r: 5 }], polygons: [["A", "B", "C", "D"]], angles: [{ at: "A", from: "D", to: "B", label: `(${p}x${cst(q)})°` }, { at: "C", from: "B", to: "D", label: `(${s === 1 ? "" : s}x${cst(u)})°` }], showLabels: true },
          answer: num(A, { unit: "°" }),
          hints: ["Opposite angles of an inscribed quadrilateral are supplementary (add to 180°).", `(${p}x${cst(q)}) + (${s === 1 ? "" : s}x${cst(u)}) = 180.`],
          steps: [
            st("Opposite angles add to 180°.", `${p}x${cst(q)} + ${s === 1 ? "" : s}x${cst(u)} = 180`),
            st("Solve.", `${p + s}x${cst(q + u)} = 180, so ${p + s}x = ${180 - q - u} and x = ${x}`),
            st("Find ∠A.", `${p}(${x})${cst(q)} = ${A}°`),
          ],
          traps: traps(frac(A), [trap(x, `x = ${x}, but the question asks for ∠A.`), trap(180 - A, "That's ∠C.")]),
        };
      }
    }
    for (;;) {
      const x = r.int(6, 20), p = r.int(2, 4), s = r.int(1, 3);
      const A = r.int(25, 65);
      const q = A - p * x, u = 90 - A - s * x;
      if (q === 0 || u === 0) continue;
      return {
        prompt: `AB is a diameter of the circle and C is on the circle. ∠A = (${p}x${cst(q)})° and ∠B = (${s === 1 ? "" : s}x${cst(u)})°. Find ∠A.`,
        visual: { type: "geo", points: { O: { x: 0, y: 0 }, A: at(5, 180), B: at(5, 0), C: at(5, 180 - 2 * A) }, circles: [{ center: "O", r: 5 }], polygons: [["A", "B", "C"]], angles: [{ at: "C", from: "A", to: "B", right: true }], showLabels: true },
        answer: num(A, { unit: "°" }),
        hints: ["An angle inscribed in a semicircle is 90°, so ∠C = 90°.", `Then ∠A + ∠B = 90°: (${p}x${cst(q)}) + (${s === 1 ? "" : s}x${cst(u)}) = 90.`],
        steps: [
          st("∠C intercepts a semicircle.", "∠C = ½ · 180° = 90°, so ∠A + ∠B = 90°."),
          st("Solve.", `${p + s}x${cst(q + u)} = 90, so x = ${x}`),
          st("Find ∠A.", `${p}(${x})${cst(q)} = ${A}°`),
        ],
        traps: traps(frac(A), [trap(x, `x = ${x}, but the question asks for ∠A.`), trap(90 - A, "That's ∠B.")]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const tangent: Skill = {
  id: "m3.circ.tangent",
  title: "Tangents and circumscribed angles",
  topic: T,
  standards: ["NC.M3.G-C.2", "NC.M3.G-CO.14"],
  prereqs: [],
  lesson: {
    bigIdea: "A tangent line is perpendicular to the radius at the point of tangency. Two tangent segments from the same outside point are congruent, and the angle between them plus the central angle makes 180°.",
    explain: [
      "Radius OA = 5 and tangent segment PA = 12. Since ∠OAP = 90°, OP = √(5^2 + 12^2) = **13**.",
      "From P, both tangent segments are equal: PA = PB. If PA = 3x + 2 and PB = 5x − 6, then x = 4 and PA = 14.",
      "In quadrilateral OAPB, the angles at A and B are 90°, so ∠APB + ∠AOB = 180°. A central angle of 130° means a circumscribed angle of **50°**.",
    ],
    visual: tangentFigure({ PA: "12", OA: "5", OP: "13" }),
  },
  why: [
    { kind: "choice", prompt: "Why are the two tangent segments from P to a circle congruent?", choices: ["Triangles OAP and OBP are congruent right triangles (same hypotenuse OP, equal radii).", "Because P is in the middle.", "They aren't always congruent."], correct: 0, explain: "HL congruence: hypotenuse OP is shared and OA = OB are radii." },
    { kind: "written", prompt: "Explain why the circumscribed angle ∠APB and the central angle ∠AOB add to 180°.", keyIdeas: ["OAPB is a quadrilateral, so its angles add to 360°", "∠OAP and ∠OBP are 90° (tangent ⟂ radius)", "360° − 180° = 180° left for ∠APB + ∠AOB"], exemplar: "The four angles of quadrilateral OAPB add to 360°. The angles at A and B are both 90° because a tangent is perpendicular to the radius. That uses 180°, so ∠APB + ∠AOB = 180°." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      for (;;) {
        const x = r.int(3, 12), a = r.int(2, 6), c = r.int(2, 7);
        if (a === c) continue;
        const L = r.int(15, 40);
        const b = L - a * x, d = L - c * x;
        if (b === 0 || d === 0) continue;
        return {
          prompt: `PA and PB are tangent to the circle at A and B. PA = ${a}x${cst(b)} and PB = ${c}x${cst(d)}. Find PA.`,
          visual: tangentFigure({ PA: `${a}x${cst(b)}`, PB: `${c}x${cst(d)}` }),
          answer: num(L),
          hints: ["Tangent segments from the same outside point are congruent.", `Set ${a}x${cst(b)} = ${c}x${cst(d)} and solve for x.`],
          steps: [
            st("Tangent segments are congruent.", `${a}x${cst(b)} = ${c}x${cst(d)}`),
            st("Solve.", `${a - c === 1 ? "" : a - c === -1 ? "−" : ms(a - c)}x = ${ms(d - b)}, so x = ${x}`),
            st("Find PA.", `${a}(${x})${cst(b)} = ${L}`),
          ],
          traps: traps(frac(L), [trap(x, `x = ${x}, but the question asks for the length PA.`)]),
        };
      }
    }
    if (lv === 2) {
      const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]] as [number, number, number][]);
      const askHyp = r.chance(0.5);
      return askHyp
        ? {
            prompt: `PA is tangent to circle O at A. The radius is ${a} and PA = ${b}. Find OP.`,
            visual: tangentFigure({ OA: String(a), PA: String(b), OP: "?" }),
            answer: num(c),
            hints: ["A tangent is perpendicular to the radius at the point of tangency, so triangle OAP has a right angle at A.", `OP is the hypotenuse: OP^2 = ${a}^2 + ${b}^2.`],
            steps: [st("Right angle at A.", "Tangent ⟂ radius, so ∠OAP = 90°."), st("Pythagorean theorem.", `OP^2 = ${a * a} + ${b * b} = ${c * c}`), st("Square root.", `OP = ${c}`)],
            traps: traps(frac(c), [trap(a + b, "Use the Pythagorean theorem, not addition."), trap(c * c, "Take the square root.")]),
          }
        : {
            prompt: `PA is tangent to circle O at A. The radius is ${a} and OP = ${c}. Find the length of the tangent segment PA.`,
            visual: tangentFigure({ OA: String(a), PA: "?", OP: String(c) }),
            answer: num(b),
            hints: ["Triangle OAP has a right angle at A, with hypotenuse OP.", `PA^2 = ${c}^2 − ${a}^2.`],
            steps: [st("Right angle at A.", "Tangent ⟂ radius, so OP is the hypotenuse."), st("Pythagorean theorem.", `PA^2 = ${c * c} − ${a * a} = ${b * b}`), st("Square root.", `PA = ${b}`)],
            traps: traps(frac(b), [trap(c - a, "Subtract the squares, then take the square root."), trap(Math.round(Math.sqrt(a * a + c * c) * 100) / 100, "OP is the hypotenuse, so subtract.")]),
          };
    }
    const central = r.int(50, 150);
    const askP = r.chance(0.5);
    const ans = askP ? 180 - central : central;
    return {
      prompt: askP
        ? `PA and PB are tangent to circle O. Central angle ∠AOB = ${central}°. Find the circumscribed angle ∠APB.`
        : `PA and PB are tangent to circle O, and ∠APB = ${180 - central}°. Find the measure of minor arc AB.`,
      visual: tangentFigure(askP ? { central: `${central}°`, angle: "?" } : { angle: `${180 - central}°`, central: "?" }),
      answer: num(ans, { unit: "°" }),
      hints: ["The radii meet the tangents at 90° angles.", "In quadrilateral OAPB, ∠APB + ∠AOB = 360° − 90° − 90° = 180°."],
      steps: [
        st("Right angles at A and B.", "Tangent ⟂ radius."),
        st("Angle sum of OAPB.", "∠APB + ∠AOB = 180°"),
        st("Solve.", askP ? `∠APB = 180° − ${central}° = ${180 - central}°` : `∠AOB = 180° − ${180 - central}° = ${central}°, and minor arc AB equals the central angle: ${central}°`),
      ],
      traps: traps(frac(ans), [trap(askP ? central / 2 : 2 * (180 - central), "That treats it like an inscribed angle. Use the right angles in quadrilateral OAPB."), trap(360 - ans, "Check which arc or angle is asked for.")]),
    };
  },
};

// ---------------------------------------------------------------------------
function chordFigure(labels: Record<string, string | undefined>): Visual {
  const A = at(5, 165), B = at(5, -15), C = at(5, 70), D = at(5, 240);
  // Intersection of AB and CD.
  const den = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
  const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / den;
  const E = { x: A.x + t * (B.x - A.x), y: A.y + t * (B.y - A.y) };
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, A, B, C, D, E },
    circles: [{ center: "O", r: 5 }],
    segments: [{ from: "A", to: "E", label: labels.AE }, { from: "E", to: "B", label: labels.EB }, { from: "C", to: "E", label: labels.CE }, { from: "E", to: "D", label: labels.ED }],
    angles: labels.angle ? [{ at: "E", from: "A", to: "C", label: labels.angle }] : [],
    showLabels: true,
  };
}

const chords: Skill = {
  id: "m3.circ.chords",
  title: "Chords, secants and tangents",
  topic: T,
  standards: ["NC.M3.G-C.2"],
  prereqs: ["m3.circ.inscribed"],
  lesson: {
    bigIdea: "When two chords cross inside a circle, the products of their pieces are equal: AE · EB = CE · ED. The angle where they cross is half the sum of the two arcs it and its vertical angle intercept.",
    explain: [
      "Chords AB and CD meet at E with AE = 4, EB = 6 and CE = 3. Then 4 · 6 = 3 · ED, so **ED = 8**.",
      "If arc AC = 100° and arc BD = 60°, then ∠AEC = {1/2}(100° + 60°) = **80°**.",
      "From a point P outside the circle: for two secants, (outside piece) · (whole secant) is the same for both; for a tangent PT and a secant, PT^2 = (outside piece) · (whole secant).",
    ],
    visual: chordFigure({ AE: "4", EB: "6", CE: "3", ED: "?" }),
    tip: "Figures in these problems are not drawn to scale. Trust the given numbers.",
  },
  why: [
    { kind: "choice", prompt: "Why does AE · EB = CE · ED for chords crossing at E?", choices: ["Triangles AEC and DEB are similar (equal inscribed angles), so their sides are proportional.", "Because all chords are the same length.", "It only works when the chords are diameters."], correct: 0, explain: "∠A = ∠D and ∠C = ∠B (same arcs), so AE/DE = CE/BE, which rearranges to AE · EB = CE · ED." },
    { kind: "written", prompt: "A tangent PT and a secant through P meet the circle; the secant's outside piece is 4 and the whole secant is 9. Explain how to find PT.", keyIdeas: ["tangent-secant theorem: PT^2 = outside · whole", "PT^2 = 4 · 9 = 36", "PT = 6"], exemplar: "The tangent-secant relationship says PT^2 equals the outside part of the secant times the whole secant. That's 4 · 9 = 36, so PT = 6." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      for (;;) {
        const a = r.int(2, 12), b = r.int(2, 12), c = r.int(2, 12);
        if ((a * b) % c !== 0 || c === a || c === b) continue;
        const d = (a * b) / c;
        if (d > 30) continue;
        return {
          prompt: `Chords AB and CD intersect at E. AE = ${a}, EB = ${b} and CE = ${c}. Find ED. (Not drawn to scale.)`,
          visual: chordFigure({ AE: String(a), EB: String(b), CE: String(c), ED: "?" }),
          answer: num(d),
          hints: ["Intersecting chords: the products of the pieces are equal.", `${a} · ${b} = ${c} · ED.`],
          steps: [st("Set up.", `AE · EB = CE · ED, so ${a} · ${b} = ${c} · ED`), st("Solve.", `${a * b} = ${c} · ED, so ED = ${d}`)],
          traps: traps(frac(d), [trap(a + b - c, "Pieces of crossing chords multiply; they don't add."), trap(frac(a * c, b), "Pair the pieces of the same chord: AE with EB, CE with ED.")]),
        };
      }
    }
    if (lv === 2) {
      const ac = r.int(30, 140), bd = r.int(20, 120);
      if ((ac + bd) % 2) return chords.generate(r, lv);
      const ans = (ac + bd) / 2;
      return {
        prompt: `Chords AB and CD intersect at E inside the circle. Arc AC = ${ac}° and arc BD = ${bd}°. Find ∠AEC. (Not drawn to scale.)`,
        visual: chordFigure({ angle: "?" }),
        answer: num(ans, { unit: "°" }),
        hints: ["An angle formed by two chords inside a circle is half the sum of the intercepted arcs.", `∠AEC = {1/2}(${ac}° + ${bd}°).`],
        steps: [st("Chord-chord angle.", `∠AEC = {1/2}(arc AC + arc BD)`), st("Compute.", `{1/2}(${ac} + ${bd}) = {1/2}(${ac + bd}) = ${ans}°`)],
        traps: traps(frac(ans), [trap(ac + bd, "Take half of the sum."), trap(Math.abs(ac - bd) / 2, "Half the difference is for angles outside the circle. Inside, use half the sum.")]),
      };
    }
    for (;;) {
      const PT = r.int(4, 15), out = r.int(2, 9);
      if ((PT * PT) % out !== 0) continue;
      const whole = (PT * PT) / out, inside = whole - out;
      if (inside <= 0 || whole > 60) continue;
      const askT = r.chance(0.5);
      // Secant along y = 2 from P(9, 2); tangent point from P computed exactly.
      const P = { x: 9, y: 2 };
      const A = { x: Math.sqrt(21), y: 2 }, B = { x: -Math.sqrt(21), y: 2 };
      const dP = Math.hypot(P.x, P.y), base = Math.atan2(P.y, P.x) + Math.acos(5 / dP);
      const T2 = { x: 5 * Math.cos(base), y: 5 * Math.sin(base) };
      return {
        prompt: askT
          ? `From point P outside a circle, tangent PT touches the circle at T, and a secant meets the circle at A and B with PA = ${out} (outside) and AB = ${inside}. Find PT. (Not drawn to scale.)`
          : `From point P outside a circle, tangent PT = ${PT}, and a secant meets the circle first at A and then at B, with PA = ${out}. Find AB. (Not drawn to scale.)`,
        visual: { type: "geo", points: { O: { x: 0, y: 0 }, P, T: T2, A, B }, circles: [{ center: "O", r: 5 }], segments: [{ from: "P", to: "T", label: askT ? "?" : String(PT) }, { from: "P", to: "A", label: String(out) }, { from: "A", to: "B", label: askT ? String(inside) : "?" }], showLabels: true },
        answer: num(askT ? PT : inside),
        hints: ["Tangent-secant: PT^2 = (outside piece) · (whole secant).", askT ? `The whole secant is PB = ${out} + ${inside} = ${whole}.` : `${PT}^2 = ${out} · PB, so PB = ${whole}. AB is PB minus the outside piece.`],
        steps: askT
          ? [st("Whole secant.", `PB = ${out} + ${inside} = ${whole}`), st("Tangent-secant theorem.", `PT^2 = ${out} · ${whole} = ${PT * PT}`), st("Square root.", `PT = ${PT}`)]
          : [st("Tangent-secant theorem.", `${PT}^2 = ${out} · PB, so ${PT * PT} = ${out} · PB`), st("Whole secant.", `PB = ${whole}`), st("Inside piece.", `AB = ${whole} − ${out} = ${inside}`)],
        traps: askT
          ? traps(frac(PT), [trap(PT * PT, "Take the square root."), trap(Math.round(Math.sqrt(out * inside) * 100) / 100, "Multiply the outside piece by the WHOLE secant, not the inside piece.")])
          : traps(frac(inside), [trap(whole, "That's the whole secant PB. Subtract the outside piece."), trap(frac(PT * PT - out * out, out), "Use PT^2 = PA · PB with PB the whole secant.")]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const arcSector: Skill = {
  id: "m3.circ.arc-sector",
  title: "Arc length and sector area",
  topic: T,
  standards: ["NC.M3.G-C.5", "NC.M3.F-TF.1"],
  prereqs: [],
  lesson: {
    bigIdea: "An arc or sector is a fraction of the whole circle: {θ/360} of the circumference or area. In radians, arc length s = rθ and sector area A = {1/2}r^2θ.",
    explain: [
      "Radius 9, central angle 120°: the fraction is {120/360} = {1/3}. Arc length = {1/3} · 2π(9) = **6π**. Sector area = {1/3} · π(9)^2 = **27π**.",
      "In radians: 120° = {2π/3}, so s = 9 · {2π/3} = 6π and A = {1/2} · 81 · {2π/3} = 27π. Same answers.",
      "Arc length is proportional to the radius: for a fixed angle, doubling r doubles the arc. That's why radian measure s/r doesn't depend on the circle's size.",
    ],
    visual: { type: "geo", points: { O: { x: 0, y: 0 }, A: at(9, 0), B: at(9, 120) }, circles: [{ center: "O", r: 9 }], segments: [{ from: "O", to: "A", label: "9" }, { from: "O", to: "B" }], angles: [{ at: "O", from: "A", to: "B", label: "120°" }], showLabels: false },
  },
  why: [
    { kind: "choice", prompt: "Why do you multiply the circumference by θ/360 to find an arc length?", choices: ["The arc is that fraction of the full 360° turn, so it's that fraction of the whole circumference.", "Because 360 is the circumference.", "To convert to radians."], correct: 0, explain: "A 90° arc is a quarter of the circle, so it's a quarter of the circumference." },
    { kind: "written", prompt: "A sprinkler sprays a sector with radius 10 m and angle 72°. Explain how to find the area it waters.", keyIdeas: ["72/360 = 1/5 of the circle", "whole circle area is π · 10^2 = 100π", "the sector is 1/5 of that: 20π ≈ 62.8 m^2"], exemplar: "72° is 72/360 = 1/5 of a full turn. The whole circle has area π · 10^2 = 100π m^2, so the sector is 1/5 of that, 20π, about 62.8 m^2." },
  ],
  generate(r, lv) {
    const fig = (deg: number, rl: string, al: string): Visual => ({ type: "geo", points: { O: { x: 0, y: 0 }, A: at(5, 0), B: at(5, deg) }, circles: [{ center: "O", r: 5 }], segments: [{ from: "O", to: "A", label: rl }, { from: "O", to: "B" }], angles: [{ at: "O", from: "A", to: "B", label: al }], showLabels: false });
    if (lv < 3) {
      for (;;) {
        const deg = r.pick([30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 210, 240, 270, 300]);
        const rad = r.int(2, 18);
        const area = lv === 2;
        const kNum = area ? deg * rad * rad : 2 * deg * rad;
        if (kNum % 360 !== 0) continue;
        const k = kNum / 360;
        const g = gcd(deg, 360);
        const fr = `{${deg / g}/${360 / g}}`;
        return {
          prompt: area
            ? `Find the area of a sector with radius ${rad} cm and central angle ${deg}°. Give an exact answer in terms of π.`
            : `Find the length of an arc with central angle ${deg}° in a circle of radius ${rad} cm. Give an exact answer in terms of π.`,
          visual: fig(deg, `${rad} cm`, `${deg}°`),
          answer: exact(`${k}pi`, `${k === 1 ? "" : k}π`),
          hints: [`The fraction of the circle is {${deg}/360} = ${fr}.`, area ? `Whole area: π(${rad})^2 = ${rad * rad}π. Take ${fr} of it.` : `Whole circumference: 2π(${rad}) = ${2 * rad}π. Take ${fr} of it.`],
          steps: [
            st("Fraction of the circle.", `{${deg}/360} = ${fr}`),
            st(area ? "Whole area." : "Whole circumference.", area ? `π · ${rad}^2 = ${rad * rad}π` : `2π · ${rad} = ${2 * rad}π`),
            st("Take the fraction.", `${fr} · ${area ? rad * rad : 2 * rad}π = ${k}π cm${area ? "^2" : ""}`),
          ],
        };
      }
    }
    if (r.chance(0.5)) {
      const rad = r.pick([2, 4, 6, 8, 10]), th = r.pick([0.5, 1.5, 2, 2.5, 3]);
      const A = 0.5 * rad * rad * th;
      return {
        prompt: `A slice of a circular pizza has radius ${rad} in and a central angle of ${th} radians. What is its area?`,
        visual: fig((th * 180) / Math.PI, `${rad} in`, `${th} rad`),
        answer: num(A, { unit: " in^2" }),
        hints: ["For an angle in radians, sector area = {1/2}r^2θ.", `{1/2} · ${rad}^2 · ${th}.`],
        steps: [st("Formula (radians).", "A = {1/2}r^2θ"), st("Substitute.", `{1/2} · ${rad * rad} · ${th} = ${A} in^2`)],
        traps: traps(frac(A * 100, 100), [trap(rad * rad * th, "Don't forget the {1/2}."), trap(rad * th, "That's the arc length, not the area.")]),
      };
    }
    for (;;) {
      const rad = r.pick([6, 9, 10, 12, 15, 18, 20]), k = r.int(1, 2 * rad - 1);
      const deg = (180 * k) / rad;
      if (!Number.isInteger(deg)) continue;
      return {
        prompt: `An arc of a circle with radius ${rad} ft has length ${k === 1 ? "" : k}π ft. What is the central angle, in degrees?`,
        visual: fig(deg, `${rad} ft`, "?"),
        answer: num(deg, { unit: "°" }),
        hints: [`The whole circumference is 2π(${rad}) = ${2 * rad}π.`, `The arc is {${k}π/${2 * rad}π} of the circle. Multiply that fraction by 360°.`],
        steps: [st("Fraction of the circle.", `{${k}π/${2 * rad}π} = {${k}/${2 * rad}}`), st("Angle.", `{${k}/${2 * rad}} · 360° = ${deg}°`)],
        traps: traps(frac(deg), [trap(frac(k, rad), "That's the angle in units of π radians. Convert to degrees."), trap((360 * k) / rad, "The circumference is 2πr, so divide by 2 · " + rad + ".")]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const completeSquare: Skill = {
  id: "m3.circ.complete-square",
  title: "Center and radius from a circle's equation",
  topic: T,
  standards: ["NC.M3.G-GPE.1"],
  prereqs: ["m3.circ.equation"],
  lesson: {
    bigIdea: "Rewrite x^2 + y^2 + Dx + Ey + F = 0 as (x − h)^2 + (y − k)^2 = r^2 by completing the square in x and in y.",
    explain: [
      "x^2 + y^2 − 6x + 4y − 12 = 0. Group: (x^2 − 6x) + (y^2 + 4y) = 12.",
      "Add (half the coefficient)^2 to both sides: (x^2 − 6x + 9) + (y^2 + 4y + 4) = 12 + 9 + 4.",
      "So (x − 3)^2 + (y + 2)^2 = 25: **center (3, −2), radius 5**.",
    ],
    tip: "Whatever you add on the left, add on the right too.",
  },
  why: [
    { kind: "choice", prompt: "Why do you add 9 to complete the square for x^2 − 6x?", choices: ["(−6 ÷ 2)^2 = 9, and x^2 − 6x + 9 = (x − 3)^2.", "Because 9 is a perfect square.", "To make the right side 25."], correct: 0, explain: "Half of −6 is −3, and (x − 3)^2 = x^2 − 6x + 9." },
    { kind: "written", prompt: "Explain how you'd know x^2 + y^2 + 4x + 13 = 0 is not a real circle.", keyIdeas: ["complete the square: (x + 2)^2 + y^2 = −9", "a sum of squares can't be negative", "r^2 = −9 is impossible, so no points"], exemplar: "Completing the square gives (x^2 + 4x + 4) + y^2 = −13 + 4, so (x + 2)^2 + y^2 = −9. A sum of squares is never negative, so no point satisfies it; r^2 can't be −9." },
  ],
  generate(r, lv) {
    const h = r.nonzero(-7, 7), k = r.nonzero(-7, 7), rad = r.int(1, 9);
    const fields = { kind: "multi" as const, fields: [{ value: frac(h), pre: "center x =" }, { value: frac(k), pre: "center y =" }, { value: frac(rad), pre: "radius =" }] };
    if (lv === 1) {
      return {
        prompt: `Find the center (h, k) and the radius of the circle ${sq("x", h)} + ${sq("y", k)} = ${rad * rad}.`,
        answer: fields,
        hints: ["Compare with (x − h)^2 + (y − k)^2 = r^2.", `Watch the signs: ${sq("x", h)} means h = ${ms(h)}. And r^2 = ${rad * rad}.`],
        steps: [st("Center.", `(x − h) with h = ${ms(h)} and (y − k) with k = ${ms(k)}: center (${ms(h)}, ${ms(k)})`), st("Radius.", `r^2 = ${rad * rad}, so r = ${rad}`)],
      };
    }
    const m = lv === 3 ? r.pick([2, 3]) : 1;
    const D = -2 * h, E = -2 * k, F = h * h + k * k - rad * rad;
    const term = (c: number, v: string, first = false) => (c === 0 ? "" : `${c < 0 ? (first ? "−" : " − ") : first ? "" : " + "}${Math.abs(c) === 1 ? "" : Math.abs(c)}${v}`);
    const lead = m === 1 ? "x^2 + y^2" : `${m}x^2 + ${m}y^2`;
    const eq = `${lead}${term(m * D, "x")}${term(m * E, "y")}${F ? (m * F > 0 ? ` + ${m * F}` : ` − ${-m * F}`) : ""} = 0`;
    const hx = D / 2, hy = E / 2;
    return {
      prompt: `Find the center and radius of the circle ${eq}.`,
      answer: fields,
      hints: [
        m > 1 ? `First divide every term by ${m}.` : "Group the x-terms and the y-terms, and move the constant to the right side.",
        `Complete each square: add (${ms(D)} ÷ 2)^2 = ${hx * hx} for x and (${ms(E)} ÷ 2)^2 = ${hy * hy} for y, on both sides.`,
      ],
      steps: [
        ...(m > 1 ? [st(`Divide by ${m}.`, `x^2 + y^2${term(D, "x")}${term(E, "y")}${cst(F)} = 0`)] : []),
        st("Group and move the constant.", `(x^2${term(D, "x")}) + (y^2${term(E, "y")}) = ${ms(-F)}`),
        st("Complete the squares.", `(x^2${term(D, "x")} + ${hx * hx}) + (y^2${term(E, "y")} + ${hy * hy}) = ${ms(-F)} + ${hx * hx} + ${hy * hy}`),
        st("Factor.", `${sq("x", h)} + ${sq("y", k)} = ${rad * rad}`),
        st("Read it off.", `Center (${ms(h)}, ${ms(k)}), radius √${rad * rad} = ${rad}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const equation: Skill = {
  id: "m3.circ.equation",
  title: "Write the equation of a circle",
  topic: T,
  standards: ["NC.M3.G-GPE.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A point (x, y) is on the circle with center (h, k) and radius r exactly when its distance to the center is r. By the Pythagorean theorem: (x − h)^2 + (y − k)^2 = r^2.",
    explain: [
      "Derivation: the horizontal distance from (h, k) to (x, y) is x − h and the vertical distance is y − k. They form a right triangle with hypotenuse r, so (x − h)^2 + (y − k)^2 = r^2.",
      "Center (2, −1) through (5, 3): r^2 = (5 − 2)^2 + (3 + 1)^2 = 9 + 16 = 25. Equation: **(x − 2)^2 + (y + 1)^2 = 25**.",
      "If you're given a diameter's endpoints, the center is their midpoint and the radius is half the diameter.",
    ],
    visual: { type: "geo", grid: true, points: { C: { x: 2, y: -1 }, P: { x: 5, y: 3 }, Q: { x: 5, y: -1 } }, circles: [{ center: "C", r: 5 }], segments: [{ from: "C", to: "P", label: "r = 5" }, { from: "C", to: "Q", label: "3", dashed: true }, { from: "Q", to: "P", label: "4", dashed: true }], angles: [{ at: "Q", from: "C", to: "P", right: true }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "Why is the circle equation built from the Pythagorean theorem?", choices: ["The radius is the hypotenuse of a right triangle whose legs are the horizontal and vertical distances to the center.", "Because circles have right angles.", "It isn't; it's from the area formula."], correct: 0, explain: "Every point on the circle is distance r from the center, and the distance formula comes from a² + b² = c²." },
    { kind: "written", prompt: "Explain how to decide whether (1, 7) is on, inside or outside the circle (x − 4)^2 + (y − 3)^2 = 25.", keyIdeas: ["substitute the point: (1 − 4)^2 + (7 − 3)^2", "9 + 16 = 25", "equals r^2, so it's on the circle (less would be inside, more outside)"], exemplar: "Plug in the point: (1 − 4)^2 + (7 − 3)^2 = 9 + 16 = 25. That equals r^2, so (1, 7) is exactly 5 from the center and lies on the circle. A smaller result would mean inside, and a larger one outside." },
  ],
  generate(r, lv) {
    const h = r.nonzero(-6, 6), k = r.nonzero(-6, 6);
    if (lv === 1) {
      const rad = r.int(2, 9);
      const eq = (a: number, b: number, rr: string) => `${sq("x", a)} + ${sq("y", b)} = ${rr}`;
      const correct = eq(h, k, String(rad * rad));
      return {
        prompt: `Which is the equation of the circle with center (${ms(h)}, ${ms(k)}) and radius ${rad}?`,
        answer: choice(r, correct, [
          [eq(-h, -k, String(rad * rad)), "Signs: the center (h, k) appears as (x − h) and (y − k)."],
          [eq(h, k, String(rad)), "The right side is r^2, not r."],
          [eq(-h, -k, String(rad)), "Check both the signs and the right side (r^2)."],
        ]),
        hints: ["Use (x − h)^2 + (y − k)^2 = r^2.", `h = ${ms(h)}, so x − h = x − ${sn(h)}.`],
        steps: [st("Substitute.", `(x − ${sn(h)})^2 + (y − ${sn(k)})^2 = ${rad}^2`), st("Simplify.", correct)],
      };
    }
    if (lv === 2) {
      const dx = r.nonzero(-6, 6), dy = r.nonzero(-6, 6);
      const px = h + dx, py = k + dy;
      const r2 = dx * dx + dy * dy;
      return {
        prompt: `A circle has center (${ms(h)}, ${ms(k)}) and passes through (${ms(px)}, ${ms(py)}). Its equation is ${sq("x", h)} + ${sq("y", k)} = r^2. Find r^2.`,
        answer: num(r2, { pre: "r^2 = " }),
        hints: ["r is the distance from the center to the point.", `r^2 = (${ms(px)} − ${sn(h)})^2 + (${ms(py)} − ${sn(k)})^2.`],
        steps: [st("Horizontal and vertical distances.", `${ms(px)} − ${sn(h)} = ${ms(dx)}; ${ms(py)} − ${sn(k)} = ${ms(dy)}`), st("Pythagorean theorem.", `r^2 = ${sn(dx)}^2 + ${sn(dy)}^2 = ${dx * dx} + ${dy * dy} = ${r2}`)],
        traps: traps(frac(r2), [trap((dx + dy) * (dx + dy), "Square each distance separately, then add."), trap(Math.abs(dx) + Math.abs(dy), "Square the distances before adding.")]),
      };
    }
    const dx = r.nonzero(-5, 5), dy = r.nonzero(-5, 5);
    const x1 = h - dx, y1 = k - dy, x2 = h + dx, y2 = k + dy;
    const r2 = dx * dx + dy * dy;
    return {
      prompt: `The endpoints of a diameter are (${ms(x1)}, ${ms(y1)}) and (${ms(x2)}, ${ms(y2)}). Find the center (h, k) and r^2 for the equation (x − h)^2 + (y − k)^2 = r^2.`,
      answer: { kind: "multi", fields: [{ value: frac(h), pre: "h =" }, { value: frac(k), pre: "k =" }, { value: frac(r2), pre: "r^2 =" }] },
      hints: ["The center is the midpoint of the diameter.", `Center (${ms(h)}, ${ms(k)}). r^2 is the squared distance from the center to either endpoint.`],
      steps: [
        st("Midpoint.", `({${ms(x1)} + ${sn(x2)}/2}, {${ms(y1)} + ${sn(y2)}/2}) = (${ms(h)}, ${ms(k)})`),
        st("Radius squared.", `(${ms(x2)} − ${sn(h)})^2 + (${ms(y2)} − ${sn(k)})^2 = ${dx * dx} + ${dy * dy} = ${r2}`),
        st("Equation.", `${sq("x", h)} + ${sq("y", k)} = ${r2}`),
      ],
    };
  },
};

const skills: Skill[] = [inscribed, tangent, chords, arcSector, equation, completeSquare];
export default skills;
