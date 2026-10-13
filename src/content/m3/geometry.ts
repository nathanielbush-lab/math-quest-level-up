// Unit 8: Geometry and modeling: triangle centers, quadrilateral theorems, volume, cross-sections, density and design.
import { choice, cst, exact, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Problem, Skill } from "../types";
import { dn, trapsTol } from "./util";

const T = "m3-geometry";

const lin = (a: number, b: number) => `${a === 1 ? "" : a}x${cst(b)}`;

// ---------------------------------------------------------------------------
const CENTERS = {
  circum: "Circumcenter (where the perpendicular bisectors of the sides meet)",
  in: "Incenter (where the angle bisectors meet)",
  centroid: "Centroid (where the medians meet)",
  ortho: "Orthocenter (where the altitudes meet)",
};

const centers: Skill = {
  id: "m3.geo.centers",
  title: "Triangle centers",
  topic: T,
  standards: ["NC.M3.G-CO.10", "NC.M3.G-CO.14"],
  prereqs: [],
  lesson: {
    bigIdea: "Each triangle center comes from a set of three special lines, and each has a special property: the centroid is the balance point, the circumcenter is equidistant from the vertices, and the incenter is equidistant from the sides.",
    explain: [
      "**Centroid** (medians, vertex to midpoint of the opposite side): it sits {2/3} of the way along each median from the vertex. Its coordinates are the averages of the vertices' coordinates.",
      "**Circumcenter** (perpendicular bisectors): the center of the circle through all three vertices. In a right triangle it's the midpoint of the hypotenuse.",
      "**Incenter** (angle bisectors): the center of the circle that fits inside the triangle, touching all three sides.",
      "Example: A(0, 0), B(6, 0), C(3, 9) has centroid ({0 + 6 + 3/3}, {0 + 0 + 9/3}) = **(3, 3)**.",
    ],
    visual: { type: "geo", grid: true, points: { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 3, y: 9 }, G: { x: 3, y: 3 }, M: { x: 3, y: 0 } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "M", dashed: true }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "A town wants a cell tower the same distance from three villages. Why use the circumcenter of the triangle they form?", choices: ["Every point on a perpendicular bisector is equidistant from that side's endpoints, so the meeting point is equidistant from all three.", "Because it's always inside the triangle.", "Because it's the balance point."], correct: 0, explain: "The circumcenter lies on all three perpendicular bisectors, so it's the same distance from every vertex." },
    { kind: "written", prompt: "The median from A to BC has length 18. Explain how far the centroid is from A and from the midpoint of BC.", keyIdeas: ["the centroid divides each median in a 2 : 1 ratio", "2/3 of 18 = 12 from the vertex", "1/3 of 18 = 6 from the midpoint"], exemplar: "The centroid splits a median so the vertex part is twice the midpoint part. Of the 18 units, 2/3 (12 units) are between A and the centroid, and 1/3 (6 units) between the centroid and the midpoint of BC." },
  ],
  generate(r, lv): Problem {
    if (lv === 1) {
      const qs: [string, keyof typeof CENTERS][] = [
        ["is the same distance from all three vertices", "circum"],
        ["is the same distance from all three sides", "in"],
        ["is the triangle's balance point (center of mass)", "centroid"],
        ["is the center of the circle that passes through all three vertices", "circum"],
        ["is the center of the largest circle that fits inside the triangle", "in"],
        ["divides each median in a 2 : 1 ratio", "centroid"],
      ];
      const [q, key] = r.pick(qs);
      const fb: Record<string, string> = { circum: "The circumcenter is equidistant from the vertices.", in: "The incenter is equidistant from the sides.", centroid: "The centroid is the balance point, on the medians.", ortho: "The orthocenter comes from the altitudes; it has none of these distance properties in general." };
      return {
        prompt: `Which point of a triangle ${q}?`,
        answer: choice(r, CENTERS[key], (Object.keys(CENTERS) as (keyof typeof CENTERS)[]).filter((k) => k !== key).map((k) => [CENTERS[k], fb[k]] as [string, string]), true),
        hints: ["Think about what each set of lines guarantees: perpendicular bisectors → equal distances to endpoints; angle bisectors → equal distances to sides.", "Medians split the triangle's area evenly, which is why their meeting point balances."],
        steps: [st("Match the property to the lines.", `A point that ${q} is the ${CENTERS[key].split(" (")[0].toLowerCase()}.`), st("Answer.", CENTERS[key])],
      };
    }
    if (lv === 2) {
      const k = r.int(2, 12);
      const kind = r.int(0, 2);
      const vals = { AG: 2 * k, GM: k, AM: 3 * k };
      const [given, ask] = kind === 0 ? (["AM", "AG"] as const) : kind === 1 ? (["GM", "AG"] as const) : (["AG", "AM"] as const);
      const ans = vals[ask];
      return {
        prompt: `G is the centroid of triangle ABC, and AM is a median (M is the midpoint of BC). If ${given} = ${vals[given]}, find ${ask}.`,
        visual: { type: "geo", points: { A: { x: 1, y: 7 }, B: { x: -3, y: 0 }, C: { x: 7, y: 0 }, M: { x: 2, y: 0 }, G: { x: 5 / 3, y: 7 / 3 } }, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "G", label: given === "AG" ? String(vals.AG) : undefined }, { from: "G", to: "M", label: given === "GM" ? String(vals.GM) : undefined }], showLabels: true },
        answer: num(ans),
        hints: ["The centroid divides a median in a 2 : 1 ratio: AG = 2 · GM.", "So AG is 2/3 of the median and GM is 1/3."],
        steps: [
          st("Use the 2 : 1 ratio.", `AG : GM = 2 : 1, so AG = {2/3}AM and GM = {1/3}AM.`),
          st("Find the parts.", given === "AM" ? `AM = ${vals.AM}, so GM = ${k} and AG = ${2 * k}.` : given === "GM" ? `GM = ${k}, so AG = 2 · ${k} = ${2 * k}.` : `AG = ${2 * k}, so GM = ${k} and AM = ${3 * k}.`),
          st("Answer.", `${ask} = ${ans}`),
        ],
        traps: traps(frac(ans), [trap(given === "AM" ? (3 * k) / 2 : given === "GM" ? 3 * k : 4 * k, "Check the ratio: the vertex-to-centroid piece is twice the centroid-to-midpoint piece."), trap(vals[given] / 2, "The centroid isn't the midpoint of the median.")]),
      };
    }
    if (r.chance(0.5)) {
      for (;;) {
        const xs = [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)], ys = [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)];
        const sx = xs[0] + xs[1] + xs[2], sy = ys[0] + ys[1] + ys[2];
        const area2 = (xs[1] - xs[0]) * (ys[2] - ys[0]) - (xs[2] - xs[0]) * (ys[1] - ys[0]);
        if (sx % 3 || sy % 3 || Math.abs(area2) < 10) continue;
        const pts = ["A", "B", "C"].map((n, i) => `${n}(${ms(xs[i])}, ${ms(ys[i])})`).join(", ");
        return {
          prompt: `Find the centroid of the triangle with vertices ${pts}.`,
          visual: { type: "geo", grid: true, points: { A: { x: xs[0], y: ys[0] }, B: { x: xs[1], y: ys[1] }, C: { x: xs[2], y: ys[2] } }, polygons: [["A", "B", "C"]], showLabels: true },
          answer: { kind: "multi", fields: [{ value: frac(sx / 3), pre: "x =" }, { value: frac(sy / 3), pre: "y =" }] },
          hints: ["The centroid's coordinates are the averages of the vertices' coordinates.", `x = {${xs.map(ms).join(" + ")}/3}.`],
          steps: [st("Average the x-coordinates.", `{${ms(xs[0])} + ${xs.slice(1).map((v) => (v < 0 ? `(${ms(v)})` : v)).join(" + ")}/3} = {${sx}/3} = ${ms(sx / 3)}`), st("Average the y-coordinates.", `{${ms(ys[0])} + ${ys.slice(1).map((v) => (v < 0 ? `(${ms(v)})` : v)).join(" + ")}/3} = {${sy}/3} = ${ms(sy / 3)}`), st("Centroid.", `(${ms(sx / 3)}, ${ms(sy / 3)})`)],
        };
      }
    }
    const ax = r.int(-5, 1), ay = r.int(-5, 1);
    const w = 2 * r.int(2, 4), h = 2 * r.int(2, 4);
    const B = { x: ax + w, y: ay }, C = { x: ax, y: ay + h };
    return {
      prompt: `Right triangle ABC has its right angle at A(${ms(ax)}, ${ms(ay)}), with B(${ms(B.x)}, ${ms(B.y)}) and C(${ms(C.x)}, ${ms(C.y)}). Find its circumcenter.`,
      visual: { type: "geo", grid: true, points: { A: { x: ax, y: ay }, B, C }, polygons: [["A", "B", "C"]], angles: [{ at: "A", from: "B", to: "C", right: true }], showLabels: true },
      answer: { kind: "multi", fields: [{ value: frac(ax + w / 2), pre: "x =" }, { value: frac(ay + h / 2), pre: "y =" }] },
      hints: ["For a right triangle, the hypotenuse is a diameter of the circumscribed circle.", "So the circumcenter is the midpoint of hypotenuse BC."],
      steps: [st("Hypotenuse.", "BC is opposite the right angle, so it's a diameter of the circle through A, B and C."), st("Midpoint of BC.", `({${ms(B.x)} + ${C.x < 0 ? `(${ms(C.x)})` : C.x}/2}, {${ms(B.y)} + ${C.y < 0 ? `(${ms(C.y)})` : C.y}/2}) = (${ms(ax + w / 2)}, ${ms(ay + h / 2)})`), st("Check.", `It's ${dn(Math.hypot(w / 2, h / 2))} from each vertex.`)],
    };
  },
};

// ---------------------------------------------------------------------------
const PARA = { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 8, y: 4 }, D: { x: 2, y: 4 }, E: { x: 4, y: 2 } };
const RECT = { A: { x: 0, y: 0 }, B: { x: 7, y: 0 }, C: { x: 7, y: 4 }, D: { x: 0, y: 4 }, E: { x: 3.5, y: 2 } };

const parallelogram: Skill = {
  id: "m3.geo.parallelogram",
  title: "Parallelogram theorems",
  topic: T,
  standards: ["NC.M3.G-CO.11", "NC.M3.G-CO.14"],
  prereqs: [],
  lesson: {
    bigIdea: "In a parallelogram, opposite sides are congruent, opposite angles are congruent, consecutive angles add to 180°, and the diagonals bisect each other. A parallelogram with congruent diagonals is a rectangle.",
    explain: [
      "Diagonals AC and BD of parallelogram ABCD meet at E, with AE = 2x + 3 and EC = 4x − 5. The diagonals bisect each other, so 2x + 3 = 4x − 5 and x = 4. Then AE = 11 and **AC = 22**.",
      "If ∠A = (3x + 10)° and ∠C = (5x − 30)°, opposite angles are equal: x = 20, so ∠A = 70°, and ∠B = 180° − 70° = **110°**.",
    ],
    visual: { type: "geo", points: PARA, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "E", label: "2x + 3" }, { from: "E", to: "C", label: "4x − 5" }, { from: "B", to: "D", dashed: true }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "Why do consecutive angles of a parallelogram add to 180°?", choices: ["They are same-side interior angles between parallel sides.", "Because all four angles are equal.", "Because the diagonals bisect each other."], correct: 0, explain: "AB ∥ DC, and AD is a transversal, so ∠A and ∠D are same-side interior angles, which are supplementary." },
    { kind: "written", prompt: "Explain how you could use the diagonals to show a parallelogram is a rectangle.", keyIdeas: ["measure or prove the diagonals are congruent", "a parallelogram with congruent diagonals is a rectangle", "congruent triangles (SSS) give equal consecutive angles that add to 180°, so each is 90°"], exemplar: "If the diagonals of a parallelogram are congruent, triangles ABD and BAC are congruent by SSS, so ∠A = ∠B. Since consecutive angles add to 180°, each is 90°, and the parallelogram is a rectangle." },
  ],
  generate(r, lv): Problem {
    for (;;) {
      const x = r.int(3, 12), a = r.int(2, 6), c = r.int(1, 5);
      if (a === c) continue;
      if (lv === 1) {
        const angA = r.int(40, 130);
        const b = angA - a * x, d = angA - c * x;
        if (b === 0 || d === 0) continue;
        const angB = 180 - angA;
        return {
          prompt: `In parallelogram ABCD, ∠A = (${lin(a, b)})° and ∠C = (${lin(c, d)})°. Find ∠B.`,
          visual: { type: "geo", points: PARA, polygons: [["A", "B", "C", "D"]], angles: [{ at: "A", from: "B", to: "D", label: `(${lin(a, b)})°` }, { at: "C", from: "D", to: "B", label: `(${lin(c, d)})°` }, { at: "B", from: "C", to: "A", label: "?" }], showLabels: true },
          answer: num(angB, { unit: "°" }),
          hints: ["Opposite angles of a parallelogram are congruent: ∠A = ∠C.", "Then use consecutive angles: ∠A + ∠B = 180°."],
          steps: [st("Opposite angles are equal.", `${lin(a, b)} = ${lin(c, d)}, so x = ${x}`), st("Find ∠A.", `${a}(${x})${cst(b)} = ${angA}°`), st("Consecutive angles are supplementary.", `∠B = 180° − ${angA}° = ${angB}°`)],
          traps: traps(frac(angB), [trap(angA, "That's ∠A. ∠B is next to it, so they add to 180°."), trap(x, `x = ${x}; use it to find the angles.`)]),
        };
      }
      if (lv === 2) {
        const AE = r.int(6, 25), b = AE - a * x, d = AE - c * x;
        if (b === 0 || d === 0) continue;
        return {
          prompt: `The diagonals of parallelogram ABCD meet at E. AE = ${lin(a, b)} and EC = ${lin(c, d)}. Find the length of diagonal AC.`,
          visual: { type: "geo", points: PARA, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "E", label: lin(a, b) }, { from: "E", to: "C", label: lin(c, d) }, { from: "B", to: "D", dashed: true }], showLabels: true },
          answer: num(2 * AE),
          hints: ["The diagonals of a parallelogram bisect each other, so AE = EC.", "Solve for x, then AC = AE + EC."],
          steps: [st("Diagonals bisect each other.", `${lin(a, b)} = ${lin(c, d)}, so x = ${x}`), st("Find AE.", `${a}(${x})${cst(b)} = ${AE}`), st("Find AC.", `AC = 2 · ${AE} = ${2 * AE}`)],
          traps: traps(frac(2 * AE), [trap(AE, "That's only AE, half of the diagonal."), trap(x, `x = ${x}; the question asks for AC.`)]),
        };
      }
      const AC = r.int(10, 40), b = AC - a * x, d = AC - c * x;
      if (b === 0 || d === 0 || AC % 2) continue;
      return {
        prompt: `ABCD is a rectangle with diagonals meeting at E. AC = ${lin(a, b)} and BD = ${lin(c, d)}. Find BE.`,
        visual: { type: "geo", points: RECT, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "C", dashed: true }, { from: "B", to: "D", dashed: true }], angles: [{ at: "A", from: "B", to: "D", right: true }], showLabels: true },
        answer: num(AC / 2),
        hints: ["A rectangle's diagonals are congruent: AC = BD.", "They also bisect each other, so BE is half of BD."],
        steps: [st("Congruent diagonals.", `${lin(a, b)} = ${lin(c, d)}, so x = ${x}`), st("Length of each diagonal.", `AC = BD = ${AC}`), st("Diagonals bisect each other.", `BE = {1/2} · ${AC} = ${AC / 2}`)],
        traps: traps(frac(AC / 2), [trap(AC, "That's the whole diagonal. E is its midpoint."), trap(x, `x = ${x}; the question asks for BE.`)]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
const apply: Skill = {
  id: "m3.geo.apply",
  title: "Use properties of figures to solve problems",
  topic: T,
  standards: ["NC.M3.G-CO.14", "NC.M3.G-CO.11"],
  prereqs: ["m3.geo.parallelogram"],
  lesson: {
    bigIdea: "Known theorems turn geometry questions into equations: a midsegment is half the third side, a rhombus has perpendicular diagonals that bisect each other, and special parallelograms are identified by their diagonals.",
    explain: [
      "**Midsegment:** the segment joining the midpoints of two sides of a triangle is parallel to the third side and half as long.",
      "**Rhombus:** with diagonals 10 and 24, the half-diagonals are 5 and 12 and meet at a right angle, so each side is √(5^2 + 12^2) = **13**.",
      "**Identifying parallelograms:** congruent diagonals → rectangle; perpendicular diagonals → rhombus; both → square.",
    ],
    visual: { type: "geo", points: { A: { x: 0, y: 5 }, B: { x: 12, y: 0 }, C: { x: 0, y: -5 }, D: { x: -12, y: 0 }, E: { x: 0, y: 0 } }, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "E", label: "5", dashed: true }, { from: "E", to: "B", label: "12", dashed: true }, { from: "A", to: "B", label: "13" }, { from: "C", to: "E", dashed: true }, { from: "D", to: "E", dashed: true }], angles: [{ at: "E", from: "B", to: "A", right: true }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "Why are the diagonals of a rhombus perpendicular?", choices: ["Each vertex on one diagonal is equidistant from the endpoints of the other, so that diagonal is a perpendicular bisector.", "Because a rhombus is a square.", "Because the diagonals are congruent."], correct: 0, explain: "All sides are equal, so A and C are each equidistant from B and D; the line through two such points is the perpendicular bisector of BD." },
    { kind: "written", prompt: "Explain why a parallelogram with perpendicular diagonals must be a rhombus.", keyIdeas: ["diagonals of a parallelogram bisect each other", "with right angles at the center, the four small triangles are congruent (SAS)", "so all four sides are congruent"], exemplar: "The diagonals bisect each other, so the four half-diagonals pair up equally. If they also meet at right angles, the four triangles around the center are congruent by SAS. Their hypotenuses are the sides, so all four sides are equal: a rhombus." },
  ],
  generate(r, lv): Problem {
    if (lv === 1) {
      for (;;) {
        const x = r.int(2, 10), a = r.int(1, 4), c = r.int(3, 9);
        if (c === 2 * a) continue;
        const DE = r.int(4, 20);
        const b = DE - a * x, d = 2 * DE - c * x;
        if (b === 0 || d === 0) continue;
        return {
          prompt: `D and E are the midpoints of AB and AC in triangle ABC. DE = ${lin(a, b)} and BC = ${lin(c, d)}. Find BC.`,
          visual: { type: "geo", points: { A: { x: 3, y: 6 }, B: { x: 0, y: 0 }, C: { x: 8, y: 0 }, D: { x: 1.5, y: 3 }, E: { x: 5.5, y: 3 } }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E", label: lin(a, b) }, { from: "B", to: "C", label: lin(c, d) }, { from: "A", to: "D", tick: 1 }, { from: "D", to: "B", tick: 1 }, { from: "A", to: "E", tick: 2 }, { from: "E", to: "C", tick: 2 }], showLabels: true },
          answer: num(2 * DE),
          hints: ["A midsegment is half the length of the third side: BC = 2 · DE.", `${lin(c, d)} = 2(${lin(a, b)}).`],
          steps: [st("Midsegment theorem.", `BC = 2 · DE, so ${lin(c, d)} = ${2 * a}x${cst(2 * b)}`), st("Solve.", `x = ${x}`), st("Find BC.", `${c}(${x})${cst(d)} = ${2 * DE}`)],
          traps: traps(frac(2 * DE), [trap(DE, "That's DE. BC is twice as long."), trap(x, `x = ${x}; the question asks for BC.`)]),
        };
      }
    }
    if (lv === 2) {
      const [p, q, s] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]] as [number, number, number][]);
      const askSide = r.chance(0.6);
      return askSide
        ? {
            prompt: `The diagonals of a rhombus are ${2 * p} cm and ${2 * q} cm long. Find the length of one side.`,
            visual: { type: "geo", points: { A: { x: 0, y: p }, B: { x: q, y: 0 }, C: { x: 0, y: -p }, D: { x: -q, y: 0 }, E: { x: 0, y: 0 } }, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "C", dashed: true, label: String(2 * p) }, { from: "B", to: "D", dashed: true, label: String(2 * q) }], showLabels: false },
            answer: num(s, { unit: " cm" }),
            hints: ["A rhombus's diagonals bisect each other at right angles.", `Each side is the hypotenuse of a right triangle with legs ${p} and ${q}.`],
            steps: [st("Half-diagonals.", `${2 * p} ÷ 2 = ${p} and ${2 * q} ÷ 2 = ${q}`), st("Right angle in the middle.", `side^2 = ${p}^2 + ${q}^2 = ${p * p + q * q}`), st("Side.", `√${s * s} = ${s} cm`)],
            traps: traps(frac(s), [trap(Math.round(Math.hypot(2 * p, 2 * q) * 100) / 100, "Use half of each diagonal; they bisect each other."), trap(p + q, "Use the Pythagorean theorem, not addition.")]),
          }
        : {
            prompt: `A rhombus has side length ${s} cm and one diagonal of ${2 * p} cm. How long is the other diagonal?`,
            visual: { type: "geo", points: { A: { x: 0, y: p }, B: { x: q, y: 0 }, C: { x: 0, y: -p }, D: { x: -q, y: 0 } }, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "C", dashed: true, label: String(2 * p) }, { from: "B", to: "D", dashed: true, label: "?" }, { from: "A", to: "B", label: String(s) }], showLabels: false },
            answer: num(2 * q, { unit: " cm" }),
            hints: ["The diagonals bisect each other at right angles, making four right triangles.", `Half of the unknown diagonal: √(${s}^2 − ${p}^2).`],
            steps: [st("Half of the known diagonal.", `${2 * p} ÷ 2 = ${p}`), st("Pythagorean theorem.", `half-diagonal = √(${s * s} − ${p * p}) = √${q * q} = ${q}`), st("Whole diagonal.", `2 · ${q} = ${2 * q} cm`)],
            traps: traps(frac(2 * q), [trap(q, "That's half of the diagonal."), ...(s > 2 * p ? [trap(Math.round(Math.sqrt(s * s - 4 * p * p) * 100) / 100, "Use half of the known diagonal in the right triangle.")] : [])]),
          };
    }
    const facts: [string, string][] = [
      ["its diagonals are congruent", "rect"],
      ["its diagonals are perpendicular", "rhom"],
      ["one of its angles is a right angle", "rect"],
      ["two consecutive sides are congruent", "rhom"],
      ["its diagonals are congruent and perpendicular", "square"],
      ["a diagonal bisects a pair of opposite angles", "rhom"],
    ];
    const [fact, key] = r.pick(facts);
    const names: Record<string, string> = { rect: "It must be a rectangle.", rhom: "It must be a rhombus.", square: "It must be a square.", none: "No special type can be concluded." };
    const fb: Record<string, string> = { rect: "Congruent diagonals or a right angle make a parallelogram a rectangle.", rhom: "Perpendicular diagonals, equal consecutive sides, or a diagonal bisecting angles make it a rhombus.", square: "You need both rectangle and rhombus properties for a square.", none: "This fact is enough to conclude something." };
    return {
      prompt: `ABCD is a parallelogram, and ${fact}. Which conclusion is justified?`,
      answer: choice(r, names[key], Object.keys(names).filter((k) => k !== key).map((k) => [names[k], fb[key]] as [string, string]), true),
      hints: ["Rectangles are the parallelograms with congruent diagonals (or a right angle).", "Rhombuses are the parallelograms with perpendicular diagonals (or two congruent consecutive sides)."],
      steps: [st("Match the property.", `A parallelogram where ${fact}: ${names[key].replace("It must be", "it is").replace(".", "")}.`), st("Answer.", names[key])],
    };
  },
};

// ---------------------------------------------------------------------------
const volume: Skill = {
  id: "m3.geo.volume",
  title: "Volume of solids",
  topic: T,
  standards: ["NC.M3.G-GMD.3", "NC.M3.G-MG.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Prisms and cylinders: V = Bh (base area × height). Pyramids and cones: V = {1/3}Bh. Spheres: V = {4/3}πr^3.",
    explain: [
      "Cylinder, r = 3, h = 10: V = π(3)^2(10) = **90π** ≈ 282.7.",
      "Cone with the same base and height: V = {1/3} · 90π = **30π**. A cone holds exactly a third of the matching cylinder.",
      "Sphere, r = 6: V = {4/3}π(6)^3 = {4/3} · 216π = **288π**.",
    ],
    visual: { type: "shape", shape: "cone", labels: { r: "3", h: "10" } },
    tip: "Use the radius, not the diameter. Halve a diameter first.",
  },
  why: [
    { kind: "choice", prompt: "Why does a cone's volume formula have a 1/3?", choices: ["A cone fills exactly one-third of the cylinder with the same base and height (like a pyramid and its prism).", "Because a cone has 3 parts.", "Because the slant height is longer."], correct: 0, explain: "Cavalieri's principle and the pyramid–prism comparison both give a factor of 1/3." },
    { kind: "written", prompt: "A recipe calls for a cylindrical cake pan 8 inches across and 2 inches deep. Explain how to find its volume and why you can't use 8 as the radius.", keyIdeas: ["8 inches across is the diameter", "radius is 4", "V = π · 4^2 · 2 = 32π ≈ 100.5 cubic inches"], exemplar: "8 inches across is the diameter, so the radius is 4. Then V = πr^2h = π · 16 · 2 = 32π, about 100.5 cubic inches. Using 8 would give four times too much." },
  ],
  generate(r, lv): Problem {
    if (lv === 1) {
      const cone = r.chance(0.5);
      for (;;) {
        const rad = r.int(2, 9), h = r.int(3, 15);
        if (cone && (rad * rad * h) % 3) continue;
        const k = cone ? (rad * rad * h) / 3 : rad * rad * h;
        const useD = r.chance(0.3);
        return {
          prompt: `Find the exact volume of a ${cone ? "cone" : "cylinder"} with ${useD ? `diameter ${2 * rad}` : `radius ${rad}`} cm and height ${h} cm. Give your answer in terms of π.`,
          visual: { type: "shape", shape: cone ? "cone" : "cylinder", labels: { r: useD ? undefined : `${rad} cm`, h: `${h} cm`, d: useD ? `${2 * rad} cm` : undefined } },
          answer: exact(`${k}pi`, `${k}π`),
          hints: [`${cone ? "V = {1/3}πr^2h" : "V = πr^2h"}${useD ? `. The radius is half the diameter: ${rad}.` : "."}`, `π · ${rad}^2 · ${h} = ${rad * rad * h}π${cone ? ", then divide by 3" : ""}.`],
          steps: [...(useD ? [st("Radius.", `${2 * rad} ÷ 2 = ${rad} cm`)] : []), st("Formula.", cone ? "V = {1/3}πr^2h" : "V = πr^2h"), st("Substitute.", `${cone ? "{1/3} · " : ""}π · ${rad * rad} · ${h} = ${k}π cm^3`)],
        };
      }
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const rad = r.pick([1, 2, 3, 4, 5, 6, 9]);
        const n = 4 * rad ** 3;
        const k = frac(n, 3);
        return {
          prompt: `Find the exact volume of a sphere with radius ${rad} in. Give your answer in terms of π.`,
          visual: { type: "shape", shape: "sphere", labels: { r: `${rad} in` } },
          answer: exact(k.d === 1 ? `${k.n}pi` : `${k.n}pi/${k.d}`, k.d === 1 ? `${k.n}π` : `{${k.n}π/${k.d}}`),
          hints: ["V = {4/3}πr^3.", `${rad}^3 = ${rad ** 3}. Multiply by {4/3}.`],
          steps: [st("Formula.", "V = {4/3}πr^3"), st("Substitute.", `{4/3}π · ${rad ** 3} = {${n}π/3}${k.d === 1 ? ` = ${k.n}π` : ""} in^3`)],
        };
      }
      for (;;) {
        const s = r.int(3, 12), h = r.int(4, 15);
        if ((s * s * h) % 3) continue;
        const V = (s * s * h) / 3;
        return {
          prompt: `A square pyramid has base edge ${s} m and height ${h} m. Find its volume.`,
          answer: num(V, { unit: " m^3" }),
          hints: ["V = {1/3}Bh, where B is the area of the base.", `B = ${s}^2 = ${s * s}.`],
          steps: [st("Base area.", `B = ${s}^2 = ${s * s} m^2`), st("Volume.", `V = {1/3} · ${s * s} · ${h} = ${V} m^3`)],
          traps: traps(frac(V), [trap(s * s * h, "Pyramids have a factor of {1/3}."), trap((s * h) / 3, "The base area is s^2, not s.")]),
        };
      }
    }
    if (r.chance(0.5)) {
      const rad = r.pick([3, 6]), h = r.int(5, 20);
      const cyl = rad * rad * h, hemi = (2 * rad ** 3) / 3;
      const k = cyl + hemi;
      return {
        prompt: `A grain silo is a cylinder with radius ${rad} m and height ${h} m, topped by a hemisphere with the same radius. Find its exact volume in terms of π.`,
        answer: exact(`${k}pi`, `${k}π`),
        hints: ["Add the cylinder's volume to half of a sphere's volume.", `Cylinder: π · ${rad}^2 · ${h} = ${cyl}π. Hemisphere: {1/2} · {4/3}π · ${rad}^3 = ${hemi}π.`],
        steps: [st("Cylinder.", `π · ${rad * rad} · ${h} = ${cyl}π`), st("Hemisphere.", `{2/3}π · ${rad ** 3} = ${hemi}π`), st("Total.", `${cyl}π + ${hemi}π = ${k}π m^3`)],
      };
    }
    const rad = r.int(2, 6), h = r.int(3, 12);
    const k = rad * rad * h;
    return {
      prompt: `A cylindrical can holds ${k}π cm^3 and has radius ${rad} cm. How tall is it?`,
      visual: { type: "shape", shape: "cylinder", labels: { r: `${rad} cm`, h: "?" } },
      answer: num(h, { unit: " cm" }),
      hints: ["V = πr^2h. Substitute what you know and solve for h.", `${k}π = π · ${rad * rad} · h.`],
      steps: [st("Set up.", `${k}π = π · ${rad}^2 · h`), st("Divide both sides by " + `${rad * rad}π.`, `h = {${k}/${rad * rad}} = ${h} cm`)],
      traps: traps(frac(h), [trap(frac(k, rad), "Divide by r^2, not r."), trap(frac(k, 2 * rad), "The base area is πr^2.")]),
    };
  },
};

// ---------------------------------------------------------------------------
const crossSection: Skill = {
  id: "m3.geo.cross-section",
  title: "Cross-sections and solids of rotation",
  topic: T,
  standards: ["NC.M3.G-GMD.4", "NC.M3.G-GMD.3"],
  prereqs: ["m3.geo.volume"],
  lesson: {
    bigIdea: "Slicing a solid with a plane gives a 2-D cross-section. Spinning a 2-D shape around a line sweeps out a 3-D solid.",
    explain: [
      "Slice a cylinder parallel to its base: a **circle**. Slice it vertically through its axis: a **rectangle**.",
      "Slice a cone through its vertex, perpendicular to the base: a **triangle**. Slice a sphere anywhere: a **circle**.",
      "Rotate a rectangle around one side: a **cylinder**. Rotate a right triangle around a leg: a **cone** (the other leg becomes the radius). Rotate a semicircle around its diameter: a **sphere**.",
    ],
    visual: { type: "shape", shape: "cylinder", labels: { r: "r", h: "h" } },
  },
  why: [
    { kind: "choice", prompt: "Why does rotating a right triangle about one leg make a cone?", choices: ["The leg on the axis becomes the height, the other leg sweeps out a circular base, and the hypotenuse sweeps out the slanted side.", "Because triangles have three sides.", "It makes a cylinder."], correct: 0, explain: "Every point of the triangle traces a circle around the axis; together they fill a cone." },
    { kind: "written", prompt: "Explain what cross-sections you get by slicing a cube with planes parallel to one face, and why.", keyIdeas: ["every slice parallel to a face is congruent to that face", "so each cross-section is a square", "the same size as the faces"], exemplar: "A plane parallel to a face cuts through the four edges that connect that face to the opposite face, at the same height. The four cut points form a square the same size as the face, so every such cross-section is a congruent square." },
  ],
  generate(r, lv): Problem {
    if (lv < 3) {
      const items: [string, string, string[]][] = lv === 1
        ? [
            ["a cylinder is sliced parallel to its base", "Circle", ["Rectangle", "Triangle", "Ellipse with flat sides"]],
            ["a cylinder is sliced perpendicular to its base, through its axis", "Rectangle", ["Circle", "Triangle", "Trapezoid"]],
            ["a cone is sliced parallel to its base", "Circle", ["Triangle", "Rectangle", "Square"]],
            ["a cone is sliced perpendicular to its base, through its vertex", "Triangle", ["Circle", "Rectangle", "Trapezoid"]],
            ["a sphere is sliced by any plane", "Circle", ["Square", "Triangle", "Rectangle"]],
            ["a square pyramid is sliced parallel to its base", "Square", ["Triangle", "Rectangle that isn't a square", "Circle"]],
            ["a rectangular prism is sliced parallel to its base", "Rectangle congruent to the base", ["Triangle", "Circle", "Pentagon"]],
          ]
        : [
            ["a rectangle is rotated around one of its sides", "Cylinder", ["Cone", "Sphere", "Rectangular prism"]],
            ["a right triangle is rotated around one of its legs", "Cone", ["Cylinder", "Pyramid", "Sphere"]],
            ["a semicircle is rotated around its diameter", "Sphere", ["Cylinder", "Cone", "Hemisphere"]],
            ["a right triangle is rotated around its hypotenuse", "Two cones joined at their bases", ["One cone", "Cylinder", "Sphere"]],
            ["a circle is rotated around a line in its plane that doesn't touch it", "A donut shape (torus)", ["Sphere", "Cylinder", "Cone"]],
          ];
      const [desc, ans, wrong] = r.pick(items);
      return {
        prompt: lv === 1 ? `What shape is the cross-section when ${desc}?` : `What solid is formed when ${desc}?`,
        answer: choice(r, ans, wrong.map((w) => [w, lv === 1 ? "Picture the cut face: what outline does the plane trace on the solid?" : "Picture each point of the shape tracing a circle around the line."] as [string, string])),
        hints: lv === 1 ? ["Imagine the knife's path through the solid.", "A cut parallel to a base copies the base's shape."] : ["Imagine spinning the shape quickly around the line.", "The side on the line stays put; everything else sweeps out circles."],
        steps: [st(lv === 1 ? "Picture the slice." : "Picture the rotation.", `When ${desc}, you get: ${ans.toLowerCase()}.`)],
      };
    }
    if (r.chance(0.5)) {
      for (;;) {
        const a = r.int(3, 12), b = r.int(2, 8);
        if ((b * b * a) % 3) continue;
        const k = (b * b * a) / 3;
        return {
          prompt: `A right triangle with legs ${a} cm and ${b} cm is rotated around the ${a} cm leg. Find the exact volume of the solid formed.`,
          answer: exact(`${k}pi`, `${k}π`),
          hints: [`Rotating around a leg makes a cone. The ${a} cm leg is the height; the ${b} cm leg becomes the radius.`, `V = {1/3}π(${b})^2(${a}).`],
          steps: [st("Identify the solid.", `A cone with height ${a} cm and radius ${b} cm.`), st("Volume.", `{1/3}π · ${b * b} · ${a} = ${k}π cm^3`)],
        };
      }
    }
    const w = r.int(2, 7), h = r.pick([3, 4, 5, 6, 8, 9, 10, 12].filter((v) => v !== w));
    return {
      prompt: `A rectangle ${w} in wide and ${h} in tall is rotated around its ${h} in side. Find the exact volume of the solid formed.`,
      answer: exact(`${w * w * h}pi`, `${w * w * h}π`),
      hints: ["Rotating a rectangle around a side makes a cylinder.", `The side on the axis (${h}) is the height; the other side (${w}) is the radius.`],
      steps: [st("Identify the solid.", `A cylinder with radius ${w} in and height ${h} in.`), st("Volume.", `π · ${w}^2 · ${h} = ${w * w * h}π in^3`)],
    };
  },
};

// ---------------------------------------------------------------------------
const density: Skill = {
  id: "m3.geo.density",
  title: "Density and modeling with geometry",
  topic: T,
  standards: ["NC.M3.G-MG.1", "NC.M3.G-GMD.3"],
  prereqs: ["m3.geo.volume"],
  lesson: {
    bigIdea: "Density is an amount per unit of area or volume. Model the object with a shape, find its area or volume, then multiply or divide.",
    explain: [
      "**Population density:** a town of 18,000 people covering a 4 mi by 3 mi rectangle has {18000/12} = **1,500 people per square mile**.",
      "**Mass from density:** an aluminum rod is a cylinder with r = 1 cm and h = 20 cm, and aluminum is 2.7 g/cm^3. V = π(1)^2(20) ≈ 62.83 cm^3, so the mass is 2.7 · 62.83 ≈ **169.6 g**.",
      "**Capacity:** 1 cubic foot holds about 7.48 gallons, so a tank's gallons = volume in ft^3 × 7.48.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Two towns have the same population, but Town A covers twice the area of Town B. How do their population densities compare?", choices: ["Town A's density is half of Town B's.", "They're equal, since the populations are equal.", "Town A's density is twice Town B's."], correct: 0, explain: "Density = population ÷ area, so doubling the area halves the density." },
    { kind: "written", prompt: "Explain how you would estimate the mass of a gold coin that is 2 mm thick with a 20 mm diameter, given that gold's density is 0.0193 g/mm^3.", keyIdeas: ["model the coin as a cylinder", "radius 10 mm, height 2 mm: V = π · 100 · 2 ≈ 628 mm^3", "mass = density × volume ≈ 12.1 g"], exemplar: "A coin is basically a short cylinder with radius 10 mm and height 2 mm, so V = π · 10^2 · 2 ≈ 628.3 mm^3. Multiply by the density: 628.3 × 0.0193 ≈ 12.1 grams." },
  ],
  generate(r, lv): Problem {
    if (lv === 1) {
      const l = r.int(2, 9), w = r.int(2, 8), d = r.pick([800, 1200, 1500, 2400, 3000, 450]);
      const pop = l * w * d;
      return {
        prompt: `A town has ${pop.toLocaleString("en-US")} residents and covers a rectangular region ${l} mi long and ${w} mi wide. What is its population density, in people per square mile?`,
        answer: num(d, { unit: " people per square mile" }),
        hints: ["Density = population ÷ area.", `Area = ${l} · ${w} = ${l * w} mi^2.`],
        steps: [st("Area.", `${l} · ${w} = ${l * w} mi^2`), st("Density.", `{${pop}/${l * w}} = ${d} people per mi^2`)],
        traps: traps(frac(d), [trap(Math.round((pop / (2 * (l + w))) * 100) / 100, "Divide by the area, not the perimeter.")]),
      };
    }
    if (lv === 2) {
      const mats: [string, number][] = [["aluminum", 2.7], ["steel", 7.85], ["copper", 8.96], ["oak wood", 0.75]];
      const [mat, rho] = r.pick(mats);
      const rad = r.pick([1, 1.5, 2, 2.5, 3]), h = r.int(5, 30);
      const V = Math.PI * rad * rad * h;
      const ans = Math.round(rho * V * 10) / 10;
      return {
        prompt: `A solid ${mat} rod is a cylinder with radius ${rad} cm and length ${h} cm. ${mat[0].toUpperCase() + mat.slice(1)} has a density of ${rho} g/cm^3. Find the rod's mass to the nearest tenth of a gram.`,
        visual: { type: "shape", shape: "cylinder", labels: { r: `${rad} cm`, h: `${h} cm` } },
        answer: num(ans, { tolerance: 0.15, unit: " g" }),
        hints: ["Mass = density × volume.", `V = π · ${rad}^2 · ${h} ≈ ${dn(V)} cm^3.`],
        steps: [st("Volume.", `V = π · ${rad * rad} · ${h} ≈ ${dn(V)} cm^3`), st("Mass.", `${rho} · ${dn(V)} ≈ ${dn(ans, 1)} g`)],
        traps: trapsTol(ans, 0.15, [[V / rho, "Multiply by the density; don't divide."], [rho * Math.PI * 2 * rad * rad * h, "Use the radius, not the diameter."]]),
      };
    }
    const rad = r.pick([3, 4, 5, 6, 8]);
    const sphere = r.chance(0.5);
    const h = r.int(6, 15);
    const V = sphere ? (4 / 3) * Math.PI * rad ** 3 : Math.PI * rad * rad * h;
    const gal = Math.round(V * 7.48);
    return {
      prompt: sphere
        ? `A spherical water tank has a radius of ${rad} ft. One cubic foot holds about 7.48 gallons. To the nearest gallon, how many gallons does the tank hold?`
        : `A water tank is a cylinder ${2 * rad} ft across and ${h} ft tall. One cubic foot holds about 7.48 gallons. To the nearest gallon, how many gallons does it hold?`,
      answer: num(gal, { tolerance: 1, unit: " gallons" }),
      hints: [sphere ? "V = {4/3}πr^3." : `V = πr^2h, with r = ${rad} (half of ${2 * rad}).`, "Then multiply the cubic feet by 7.48."],
      steps: [st("Volume.", sphere ? `{4/3}π · ${rad ** 3} ≈ ${dn(V)} ft^3` : `π · ${rad * rad} · ${h} ≈ ${dn(V)} ft^3`), st("Convert to gallons.", `${dn(V)} × 7.48 ≈ ${gal.toLocaleString("en-US")} gallons`)],
      traps: trapsTol(gal, 1, [[Math.round(V), "That's the volume in cubic feet. Convert to gallons."], [Math.round(sphere ? 4 * Math.PI * rad ** 3 * 7.48 : Math.PI * 4 * rad * rad * h * 7.48), sphere ? "Don't forget the {1/3} in {4/3}." : "Use the radius, not the diameter."]]),
    };
  },
};

// ---------------------------------------------------------------------------
const design: Skill = {
  id: "m3.geo.design",
  title: "Design and optimization problems",
  topic: T,
  standards: ["NC.M3.G-MG.1", "NC.M3.F-BF.1", "NC.M3.F-IF.4"],
  prereqs: ["m3.geo.volume", "m3.poly.end-behavior"],
  lesson: {
    bigIdea: "Write the quantity you care about (volume, material, cost) as a function of one dimension, decide which values make sense, then use a table or graph to find the best value.",
    explain: [
      "An open box is made from a 12 in by 16 in sheet by cutting x-inch squares from each corner and folding up the sides.",
      "The box is x tall, 16 − 2x long and 12 − 2x wide: **V(x) = x(16 − 2x)(12 − 2x)**. The cut must satisfy 0 < x < 6, since the width 12 − 2x has to stay positive.",
      "A table shows V(1) = 140, V(2) = 192, V(3) = 180: the best whole-inch cut is 2 in. A graphing calculator finds the exact maximum near x ≈ 2.26.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 6, yMin: 0, yMax: 220, xStep: 1, yStep: 40, curves: [{ expr: "x(16-2x)(12-2x)", domain: [0, 6] }], points: [{ x: 2.26, y: 194.07, label: "max ≈ (2.26, 194)" }] },
  },
  why: [
    { kind: "choice", prompt: "For V(x) = x(16 − 2x)(12 − 2x), why isn't x = 7 a sensible cut size?", choices: ["12 − 2(7) is negative: you can't cut 7-inch squares from both sides of a 12-inch width.", "Because 7 is odd.", "It is sensible; V(7) is just negative."], correct: 0, explain: "The width 12 − 2x must be positive, so x < 6." },
    { kind: "written", prompt: "A can must hold 355 cm^3. Explain why a very tall, thin can and a very short, wide can both use a lot of aluminum.", keyIdeas: ["surface area S = 2πr^2 + 2πrh", "tall thin: small r forces a huge h, so the side area is large", "short wide: large r makes the top and bottom (2πr^2) large; the best can is in between"], exemplar: "With fixed volume, a tiny radius forces a huge height, so the side (2πrh) needs lots of metal. A huge radius makes the top and bottom (2πr^2) enormous. The material is smallest somewhere in between, which you can find from a graph of S(r)." },
  ],
  generate(r, lv): Problem {
    const W = r.pick([10, 12, 14, 16]), L = W + r.pick([2, 4, 6, 8]);
    const V = (x: number) => x * (L - 2 * x) * (W - 2 * x);
    if (lv === 1) {
      const x = r.int(1, W / 2 - 1);
      const ans = V(x);
      return {
        prompt: `An open box is made from a ${W} in by ${L} in sheet of cardboard by cutting ${x}-inch squares from each corner and folding up the sides. Its volume is V(x) = x(${L} − 2x)(${W} − 2x). Find the volume.`,
        answer: num(ans, { unit: " in^3" }),
        hints: [`Substitute x = ${x}.`, `The box is ${x} by ${L - 2 * x} by ${W - 2 * x}.`],
        steps: [st("Dimensions.", `height ${x}, length ${L} − ${2 * x} = ${L - 2 * x}, width ${W} − ${2 * x} = ${W - 2 * x}`), st("Volume.", `${x} · ${L - 2 * x} · ${W - 2 * x} = ${ans} in^3`)],
        traps: traps(frac(ans), [trap(x * (L - x) * (W - x), "A square is cut from both ends of each side, so subtract 2x."), trap(L * W * x, "The base shrinks after cutting the corners.")]),
      };
    }
    if (lv === 2) {
      const xs = Array.from({ length: W / 2 - 1 }, (_, i) => i + 1);
      const vs = xs.map(V);
      const best = xs[vs.indexOf(Math.max(...vs))];
      return {
        prompt: `An open box is made from a ${W} in by ${L} in sheet by cutting x-inch squares from the corners: V(x) = x(${L} − 2x)(${W} − 2x). Using the table, which whole-number cut size gives the largest volume?`,
        visual: { type: "table", headers: ["x (in)", ...xs.map(String)], rows: [["V(x) (in^3)", ...vs]] },
        answer: num(best, { unit: " in" }),
        hints: ["Find the largest value in the V(x) row.", "Read the cut size above it."],
        steps: [st("Compare volumes.", xs.map((x, i) => `V(${x}) = ${vs[i]}`).join(", ")), st("Largest.", `V(${best}) = ${Math.max(...vs)}, so cut ${best}-inch squares.`)],
        traps: traps(frac(best), [trap(Math.max(...vs), "That's the volume. The question asks for the cut size x.")]),
      };
    }
    const Vc = r.pick([250, 355, 400, 500, 750, 1000]);
    const rOpt = Math.cbrt(Vc / (2 * Math.PI));
    const ans = Math.round(rOpt * 10) / 10;
    return {
      prompt: `A cylindrical can must hold ${Vc} cm^3. Its surface area is S(r) = 2πr^2 + {${2 * Vc}/r}. Use a graph or table on your calculator to find the radius that uses the least material, to the nearest tenth of a centimeter.`,
      answer: num(ans, { tolerance: 0.05, unit: " cm" }),
      hints: ["Graph y = 2πx^2 + " + `${2 * Vc}/x for x > 0 and find the minimum.`, `Check values near r = ${dn(Math.floor(rOpt))} to ${dn(Math.floor(rOpt) + 1)}.`],
      steps: [
        st("Where S comes from.", `h = {${Vc}/πr^2}, so S = 2πr^2 + 2πrh = 2πr^2 + {${2 * Vc}/r}.`),
        st("Minimize.", `The graph's lowest point is at r ≈ ${dn(rOpt, 3)} (S ≈ ${dn(2 * Math.PI * rOpt * rOpt + (2 * Vc) / rOpt, 1)} cm^2).`),
        st("Answer.", `r ≈ ${dn(ans, 1)} cm`),
      ],
      traps: trapsTol(ans, 0.05, [[Math.round(Math.sqrt(Vc / Math.PI) * 10) / 10, "That radius makes the height 1 cm. Find the minimum of S(r) instead."]]),
    };
  },
};

const skills: Skill[] = [centers, parallelogram, apply, volume, crossSection, density, design];
export default skills;
