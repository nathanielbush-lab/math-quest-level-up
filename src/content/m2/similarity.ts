// Unit 3: Dilations and similarity (dilation properties, similar triangles, AA, side splitter, right-triangle similarity).
import { choice, cst, ms, num, sn, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { fracPlain, fracText, plane, pointAns, pt, type P } from "./util";
import { triFromAngles, triFromSides } from "./congruence";

const T = "m2-similarity";
const fx = (f: Frac) => f.n / f.d;
const kText = (k: Frac) => (k.d === 1 ? String(k.n) : `{${k.n}/${k.d}}`);
const r3 = (p: P): P => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 });
const scaleTri = (t: P[], k: number, dx: number, dy = 0) => t.map((p) => r3({ x: p.x * k + dx, y: p.y * k + dy }));

// ---------- 1. Dilations on the coordinate plane ----------
const dilate: Skill = {
  id: "m2.sim.dilate",
  title: "Dilations on the coordinate plane",
  topic: T,
  standards: ["NC.M2.G-SRT.1", "NC.M2.G-SRT.1b", "NC.M2.G-SRT.1c", "NC.M2.F-IF.2"],
  prereqs: ["m2.trans.notation"],
  lesson: {
    bigIdea: "A dilation with center C and scale factor k sends each point P to P′ on ray CP with CP′ = k · CP. Centered at the origin, the rule is (x, y) → (kx, ky).",
    explain: [
      "At the origin: D(x, y) = (3x, 3y) sends A(2, −1) to **A′(6, −3)**. If k > 1 the figure grows; if 0 < k < 1 it shrinks.",
      "With another center, work with the vector from the center. Center C(1, 2), k = 2, P(4, 3): from C to P is (+3, +1). Double it: (+6, +2). Add to C: **P′(7, 4)**.",
      "Check: CP = √10 and CP′ = √40 = 2√10. Distances from the center are multiplied by k.",
    ],
    visual: plane({ C: { x: 1, y: 2 }, P: { x: 4, y: 3 }, "P′": { x: 7, y: 4 } }, [["C", "P′"]]),
  },
  why: [
    { kind: "choice", prompt: "Why does the image of a point lie on the ray from the center through the point?", choices: ["A dilation stretches the vector from the center by k without changing its direction.", "Because dilations are rotations.", "Because the image always lies on an axis.", "It only does when k is a whole number."], correct: 0, explain: "P′ = C + k(P − C): same direction from C, k times as far." },
    { kind: "written", prompt: "Explain why the center of a dilation never moves.", keyIdeas: ["the center is 0 units from itself", "k times 0 is still 0", "so its image is itself"], exemplar: "The image of a point is k times as far from the center as the point was. The center is 0 units from itself, and k · 0 = 0, so its image is still the center." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const k = r.pick([2, 3, 4]);
      const A = { x: r.nonzero(-4, 4), y: r.nonzero(-4, 4) };
      const img = { x: k * A.x, y: k * A.y };
      return {
        prompt: `Find the image of A${pt(A.x, A.y)} under a dilation centered at the origin with scale factor ${k}.`,
        visual: plane({ O: { x: 0, y: 0 }, A }, [["O", "A"]]),
        answer: pointAns(img.x, img.y),
        hints: ["Centered at the origin, a dilation multiplies both coordinates by the scale factor.", `(x, y) → (${k}x, ${k}y)`],
        steps: [st("Use the rule.", `(x, y) → (${k}x, ${k}y)`), st("Multiply.", `A′ = (${k} · ${sn(A.x)}, ${k} · ${sn(A.y)}) = ${pt(img.x, img.y)}`)],
      };
    }
    const k = lv === 2 ? frac(r.pick([2, 3])) : r.pick([frac(1, 2), frac(3, 2), frac(1, 3)]);
    const C = { x: r.int(-3, 3), y: r.int(-3, 3) };
    const step = k.d;
    let v = { x: step * r.nonzero(-2, 2), y: step * r.nonzero(-2, 2) };
    if (lv === 2) v = { x: r.nonzero(-3, 3), y: r.nonzero(-3, 3) };
    const A = { x: C.x + v.x, y: C.y + v.y };
    const kv = { x: (v.x * k.n) / k.d, y: (v.y * k.n) / k.d };
    const img = { x: C.x + kv.x, y: C.y + kv.y };
    return {
      prompt: `Find the image of A${pt(A.x, A.y)} under a dilation with center C${pt(C.x, C.y)} and scale factor ${kText(k)}.`,
      visual: plane({ C, A }, [["C", "A"]]),
      answer: pointAns(img.x, img.y),
      hints: ["Find how to get from the center C to A: the change in x and the change in y.", `From C to A is (${ms(v.x)}, ${ms(v.y)}). Multiply that by ${kText(k)}, then add the result to C.`],
      steps: [
        st("Go from C to A.", `(${ms(A.x)} − ${C.x < 0 ? `(${ms(C.x)})` : C.x}, ${ms(A.y)} − ${C.y < 0 ? `(${ms(C.y)})` : C.y}) = (${ms(v.x)}, ${ms(v.y)})`),
        st("Scale by k.", `${kText(k)} · (${ms(v.x)}, ${ms(v.y)}) = (${ms(kv.x)}, ${ms(kv.y)})`),
        st("Add to the center.", `A′ = (${ms(C.x)}${cst(kv.x)}, ${ms(C.y)}${cst(kv.y)}) = ${pt(img.x, img.y)}`),
        st("Check.", `A′ is on ray CA and ${kText(k)} times as far from C. ✓`),
      ],
    };
  },
};

// ---------- 2. Properties of dilations ----------
const dilationProps: Skill = {
  id: "m2.sim.dilation-properties",
  title: "Properties of dilations",
  topic: T,
  standards: ["NC.M2.G-SRT.1", "NC.M2.G-SRT.1a", "NC.M2.G-SRT.1b", "NC.M2.G-SRT.1c", "NC.M2.G-SRT.1d", "NC.M2.G-CO.2"],
  prereqs: ["m2.sim.dilate"],
  lesson: {
    bigIdea: "A dilation with scale factor k multiplies every length by k and keeps every angle. A line through the center maps to itself; any other line maps to a parallel line.",
    explain: [
      "Lengths: if AB = 6 and k = 2.5, then A′B′ = 15. Distances from the center scale the same way: OA = 4 means OA′ = 10.",
      "Finding k: k = {image length/original length}. If OA = 6 and OA′ = 4, then k = {4/6} = {2/3}, so the figure shrank.",
      "Angles: ∠A′B′C′ has the same measure as ∠ABC. That's why a dilated figure has the same shape.",
    ],
    visual: { type: "geo", showLabels: true, points: { O: { x: 0, y: 0 }, A: { x: 2, y: 2 }, B: { x: 3, y: 0.5 }, "A′": { x: 5, y: 5 }, "B′": { x: 7.5, y: 1.25 } }, segments: [{ from: "O", to: "A′", dashed: true }, { from: "O", to: "B′", dashed: true }, { from: "A", to: "B" }, { from: "A′", to: "B′" }] },
  },
  why: [
    { kind: "choice", prompt: "Line ℓ does not pass through the center of a dilation. What is true about its image ℓ′?", choices: ["ℓ′ is parallel to ℓ.", "ℓ′ is perpendicular to ℓ.", "ℓ′ is the same line as ℓ.", "ℓ′ passes through the center."], correct: 0, explain: "Every point moves along a ray from the center by the same factor, so the slope of the line is unchanged; a line through the center would map to itself." },
    { kind: "written", prompt: "A dilation has scale factor k = 1/2. Explain what happens to a triangle's side lengths, angles and perimeter.", keyIdeas: ["each side length is halved", "angle measures stay the same", "the perimeter is also halved (sum of halved sides)"], exemplar: "Every side becomes half as long, because a dilation multiplies lengths by k. The angles don't change, so the shape stays the same. The perimeter is the sum of the sides, so it is halved too." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const k = r.pick([frac(2), frac(3), frac(1, 2), frac(5, 2), frac(3, 4)]);
      const AB = k.d * r.int(2, 9);
      const ans = (AB * k.n) / k.d;
      return {
        prompt: `Segment AB is ${AB} cm long. Find the length of its image A′B′ after a dilation with scale factor ${kText(k)}.`,
        answer: num(ans, { unit: " cm" }),
        hints: ["A dilation multiplies every length by the scale factor.", `A′B′ = ${kText(k)} × ${AB}.`],
        steps: [st("Multiply by the scale factor.", `A′B′ = ${kText(k)} × ${AB} = ${ans} cm`)],
        traps: traps(frac(ans), [trap(AB, "That's the original length. Multiply by the scale factor."), trap(AB + fx(k), "Dilations multiply lengths; they don't add to them."), trap((AB * k.d) / k.n, "You divided by the scale factor instead of multiplying.")]),
      };
    }
    if (lv === 2) {
      const type = r.pick(["through", "parallel", "angle", "perp"]);
      const k = r.pick([2, 3, 4]);
      if (type === "angle") {
        const a = r.int(25, 140);
        return {
          prompt: `∠ABC measures ${a}°. Triangle ABC is dilated by a scale factor of ${k}. What is m∠A′B′C′?`,
          answer: num(a, { unit: "°" }),
          hints: ["Dilations change size, not shape.", "Which measures does a dilation multiply by k: lengths, angles, or both?"],
          steps: [st("Dilations preserve angle measure.", `m∠A′B′C′ = m∠ABC = ${a}°`)],
          traps: traps(frac(a), [trap(a * k, "Only lengths are multiplied by k. Angles stay the same.")]),
        };
      }
      const m = r.nonzero(-3, 3), b = r.nonzero(-4, 4);
      const lineText = `y = ${m === 1 ? "" : m === -1 ? "−" : ms(m)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
      const img = `y = ${m === 1 ? "" : m === -1 ? "−" : ms(m)}x ${b < 0 ? "−" : "+"} ${Math.abs(b * k)}`;
      const throughLine = `y = ${m === 1 ? "" : m === -1 ? "−" : ms(m)}x`;
      if (type === "through") {
        return {
          prompt: `The line ${throughLine} is dilated by scale factor ${k} centered at the origin. What is the image?`,
          answer: choice(r, `The same line, ${throughLine}`, [[`y = ${ms(m * k)}x`, "Multiplying both coordinates by k keeps the ratio y/x, so the slope doesn't change."], [`A parallel line, ${throughLine} + ${k}`, "The line passes through the center, which doesn't move."], [`A perpendicular line`, "Dilations keep angles and directions, so the line can't turn."]]),
          hints: ["Does the line pass through the center of the dilation?", "Points on a line through the center slide along that same line."],
          steps: [st("Check the center.", `${throughLine} passes through (0, 0), the center.`), st("Conclude.", "Each point moves along the ray from the center, which lies on the line itself, so the image is the same line.")],
        };
      }
      return {
        prompt: `The line ${lineText} is dilated by scale factor ${k} centered at the origin. What is its image?`,
        answer: choice(r, img, [[lineText, "The line doesn't pass through the center, so it moves. Try the y-intercept point."], [`y = ${ms(m * k)}x ${b < 0 ? "−" : "+"} ${Math.abs(b * k)}`, "Slope is rise over run; both are multiplied by k, so the slope stays the same."], [`y = ${ms(m * k)}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, "The slope doesn't change, but the intercept does."]]),
        hints: ["A line not through the center maps to a parallel line, so the slope stays the same.", `The y-intercept (0, ${ms(b)}) maps to (0, ${ms(b * k)}).`],
        steps: [st("Slope is preserved.", `The image is parallel, so its slope is ${ms(m)}.`), st("Dilate a point on the line.", `(0, ${ms(b)}) → (0, ${ms(b * k)})`), st("Write the image.", img)],
      };
    }
    // Level 3: find k from center distances, then use it.
    const [oa, oa2] = r.pick([[4, 10], [6, 4], [3, 12], [8, 6], [10, 4], [6, 15]]);
    const k = frac(oa2, oa);
    const given = k.n * k.d * r.int(1, 4);
    const askOriginal = r.chance(0.5);
    const val = askOriginal ? (given * k.d) / k.n : (given * k.n) / k.d;
    return {
      prompt: askOriginal
        ? `A dilation with center O maps A to A′ and B to B′. OA = ${oa}, OA′ = ${oa2} and A′B′ = ${given}. Find AB.`
        : `A dilation with center O maps A to A′ and B to B′. OA = ${oa}, OA′ = ${oa2} and AB = ${given}. Find A′B′.`,
      visual: { type: "geo", showLabels: true, points: { O: { x: 0, y: 0 }, A: { x: oa, y: 0 }, "A′": { x: oa2, y: 0 }, B: { x: oa * 0.6, y: oa * 0.7 }, "B′": { x: oa2 * 0.6, y: oa2 * 0.7 } }, segments: [{ from: "O", to: oa > oa2 ? "A" : "A′" }, { from: "O", to: oa > oa2 ? "B" : "B′", dashed: true }, { from: "A", to: "B" }, { from: "A′", to: "B′" }] },
      answer: num(val),
      hints: [`The scale factor is k = OA′ ÷ OA = ${oa2} ÷ ${oa}.`, askOriginal ? `A′B′ = k · AB, so AB = A′B′ ÷ k.` : "A′B′ = k · AB."],
      steps: [
        st("Find the scale factor.", `k = {${oa2}/${oa}} = ${fracText(k.n, k.d)}`),
        st(askOriginal ? "Undo the scale factor." : "Scale the segment.", askOriginal ? `AB = ${given} ÷ ${fracText(k.n, k.d)} = ${val}` : `A′B′ = ${fracText(k.n, k.d)} × ${given} = ${val}`),
      ],
      traps: traps(frac(val), [trap(askOriginal ? (given * k.n) / k.d : (given * k.d) / k.n, askOriginal ? "You multiplied by k. AB is the pre-image, so divide." : "You divided by k. The image is k times the original."), trap(given + oa2 - oa, "Dilations multiply lengths; they don't add the same amount.")]),
    };
  },
};

// ---------- 3. Similar figures ----------
const TRIS: [number, number, number][] = [[4, 5, 6], [5, 6, 8], [6, 8, 9], [4, 6, 7], [6, 7, 10], [8, 9, 12], [5, 7, 8]];
const similarSides: Skill = {
  id: "m2.sim.similar-figures",
  title: "Similar triangles: scale factor and missing sides",
  topic: T,
  standards: ["NC.M2.G-SRT.2", "NC.M2.G-SRT.2a", "NC.M2.G-SRT.2b", "NC.M2.A-CED.1"],
  prereqs: ["m2.sim.dilation-properties"],
  lesson: {
    bigIdea: "Similar figures are related by a dilation (plus rigid motions). Corresponding angles are congruent and corresponding sides are proportional.",
    explain: [
      "ΔABC ~ ΔDEF means A ↔ D, B ↔ E, C ↔ F and {DE/AB} = {EF/BC} = {DF/AC} = k, the scale factor.",
      "Worked example: AB = 6, BC = 8, DE = 9. The scale factor is {9/6} = 1.5, so EF = 1.5 × 8 = **12**.",
      "Shadows: at the same time of day, the sun's rays make the same angle everywhere, so a person and a tree with their shadows form similar right triangles.",
    ],
  },
  why: [
    { kind: "choice", prompt: "ΔABC ~ ΔDEF with scale factor 3. Why is DE ÷ AB the same as EF ÷ BC?", choices: ["Every length of ΔABC was multiplied by the same scale factor, 3.", "Because DE and EF are equal.", "Because the triangles are congruent.", "It isn't; only the angles match."], correct: 0, explain: "The dilation that relates them multiplies every length by 3." },
    { kind: "written", prompt: "A 6-ft person casts a 4-ft shadow while a flagpole casts a 20-ft shadow. Explain how to find the flagpole's height and why it works.", keyIdeas: ["the sun's rays hit at the same angle, so the triangles are similar (AA, both have right angles)", "corresponding sides are proportional: 6/4 = h/20", "h = 30 ft"], exemplar: "The person and the pole both stand straight up, and the sun's rays come in at the same angle, so the two right triangles are similar by AA. Heights and shadows are proportional: 6/4 = h/20. The shadow is 5 times as long, so the pole is 5 × 6 = 30 ft." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const h = r.pick([5, 6]);
      const s = r.pick([2, 3, 4, 8]);
      const mult = r.int(3, 9);
      const S = s * mult;
      const H = h * mult;
      const who = r.pick(["a light pole", "a tree", "a basketball hoop pole", "a cell tower"]);
      const nm = r.pick(["Diego", "Ava", "Priya", "Leo"]);
      return {
        prompt: `${nm} is ${h} ft tall and casts ${s === 8 ? "an" : "a"} ${s}-ft shadow. At the same time, ${who} casts a ${S}-ft shadow. How tall is ${who.replace(/^an? /, "the ")}?`,
        visual: { type: "geo", showLabels: false, points: { a: { x: 0, y: 0 }, b: { x: s, y: 0 }, c: { x: 0, y: h }, d: { x: s + 4, y: 0 }, e: { x: s + 4 + S, y: 0 }, f: { x: s + 4, y: H } }, polygons: [["a", "b", "c"], ["d", "e", "f"]], segments: [{ from: "a", to: "b", label: `${s} ft` }, { from: "a", to: "c", label: `${h} ft` }, { from: "d", to: "e", label: `${S} ft` }, { from: "d", to: "f", label: "?" }], angles: [{ at: "a", from: "b", to: "c", right: true }, { at: "d", from: "e", to: "f", right: true }] },
        answer: num(H, { unit: " ft" }),
        hints: ["The two right triangles are similar (same sun angle), so height ÷ shadow is the same for both.", `{${h}/${s}} = {h/${S}}. Or notice the shadow is ${mult} times as long.`],
        steps: [st("Set up a proportion.", `{${h}/${s}} = {h/${S}}`), st("Find the scale factor.", `${S} ÷ ${s} = ${mult}`), st("Scale the height.", `h = ${mult} × ${h} = ${H} ft`)],
        traps: traps(frac(H), [trap(frac(s * S, h), "Match heights with heights and shadows with shadows: h/shadow is the same for both."), trap(h + S - s, "Similar figures are related by multiplying, not adding.")]),
      };
    }
    const tri = r.pick(TRIS);
    const k = lv === 1 ? frac(r.pick([2, 3])) : r.pick([frac(3, 2), frac(5, 2), frac(2, 3), frac(4, 3)]);
    const sides = tri.map((x) => x * k.d); // ABC sides: BC, CA, AB
    const [a, b, c] = r.shuffle(sides);
    const img = [a, b, c].map((x) => (x * k.n) / k.d);
    const t1 = triFromSides(a, b, c);
    const scale = Math.max(a, b, c);
    const t1n = t1.map((p) => r3({ x: (p.x * 6) / scale, y: (p.y * 6) / scale }));
    const t2 = scaleTri(t1n, fx(k), 6 + 2);
    const pts = { A: t1n[0], B: t1n[1], C: t1n[2], D: t2[0], E: t2[1], F: t2[2] };
    // Given: all three sides of ABC and one side of DEF; ask another side of DEF.
    const names = [["B", "C", "E", "F"], ["C", "A", "F", "D"], ["A", "B", "D", "E"]];
    const gi = r.int(0, 2);
    let ai = r.int(0, 2);
    if (ai === gi) ai = (gi + 1) % 3;
    const orig = [a, b, c];
    const gN = names[gi], aN = names[ai];
    return {
      prompt: `ΔABC ~ ΔDEF. Find ${aN[2]}${aN[3]}.`,
      visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"], ["D", "E", "F"]], segments: [{ from: "B", to: "C", label: String(a) }, { from: "C", to: "A", label: String(b) }, { from: "A", to: "B", label: String(c) }, { from: gN[2], to: gN[3], label: String(img[gi]) }, { from: aN[2], to: aN[3], label: "?" }] },
      answer: num(img[ai]),
      hints: [`${gN[2]}${gN[3]} corresponds to ${gN[0]}${gN[1]}. Use that pair to find the scale factor.`, `k = {${img[gi]}/${orig[gi]}} = ${fracText(k.n, k.d)}. Multiply ${aN[0]}${aN[1]} = ${orig[ai]} by k.`],
      steps: [
        st("Find the scale factor from a known pair.", `k = {${gN[2]}${gN[3]}/${gN[0]}${gN[1]}} = {${img[gi]}/${orig[gi]}} = ${fracText(k.n, k.d)}`),
        st("Multiply the corresponding side.", `${aN[2]}${aN[3]} = ${fracText(k.n, k.d)} × ${orig[ai]} = ${img[ai]}`),
        st("Check with a proportion.", `{${img[ai]}/${orig[ai]}} = {${img[gi]}/${orig[gi]}} ✓`),
      ],
      traps: traps(frac(img[ai]), [trap(frac(orig[ai] * k.d, k.n), "You divided by the scale factor. DEF is the image, so multiply."), trap(orig[ai] + img[gi] - orig[gi], "Similar sides are proportional (multiply), not a constant difference (add).")]),
    };
  },
};

// ---------- 4. AA similarity ----------
const SETS = [["A", "B", "C", "D", "E"], ["P", "Q", "R", "S", "T"], ["J", "K", "L", "M", "N"]];
const aa: Skill = {
  id: "m2.sim.aa",
  title: "Proving triangles similar with AA",
  topic: T,
  standards: ["NC.M2.G-SRT.3", "NC.M2.G-SRT.2b", "NC.M2.G-SRT.4"],
  prereqs: ["m2.sim.similar-figures"],
  lesson: {
    bigIdea: "If two angles of one triangle are congruent to two angles of another, the triangles are similar (AA). The third angles then match automatically.",
    explain: [
      "Why AA works: dilate ΔABC so that AB matches DE in length. Now the copy and ΔDEF have a congruent side between two congruent angles, so they are congruent by ASA. A dilation followed by a rigid motion maps ΔABC to ΔDEF: similar.",
      "Parallel lines make AA easy. If DE ∥ BC inside ΔABC, then ∠ADE ≅ ∠ABC (corresponding angles) and ∠A is shared, so **ΔADE ~ ΔABC**.",
      "Bowtie: if AB ∥ DE and segments AE and BD cross at C, the vertical angles at C and a pair of alternate interior angles give ΔABC ~ ΔEDC.",
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 2, y: 6 }, B: { x: 0, y: 0 }, C: { x: 8, y: 0 }, D: { x: 1, y: 3 }, E: { x: 5, y: 3 } }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E" }] },
  },
  why: [
    { kind: "choice", prompt: "Why are two pairs of congruent angles enough to make triangles similar?", choices: ["The third pair must also match, since each triangle's angles add to 180°.", "Because two angles determine the side lengths exactly.", "Because any two triangles are similar.", "It isn't enough; you need SSS."], correct: 0, explain: "With two angles matching, the third is 180° minus the same sum, so all three match." },
    { kind: "written", prompt: "In ΔABC, D is on AB and E is on AC with DE ∥ BC. Explain why ΔADE ~ ΔABC.", keyIdeas: ["∠A is in both triangles (shared)", "∠ADE ≅ ∠ABC because they are corresponding angles for parallel lines", "two pairs of congruent angles, so the triangles are similar by AA"], exemplar: "Both triangles contain ∠A. Since DE ∥ BC and AB is a transversal, ∠ADE and ∠ABC are corresponding angles, so they're congruent. Two pairs of angles match, so ΔADE ~ ΔABC by AA." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(35, 75), b = r.int(35, 75), c = 180 - a - b;
      const sim = r.chance(0.6);
      const c2 = sim ? c : c + r.pick([-12, -8, 8, 12]);
      const e2 = 180 - a - c2;
      const t1 = triFromAngles(a, b, 5);
      const t2 = scaleTri(triFromAngles(a, e2, 5), 1.4, 7);
      return {
        prompt: `In ΔABC, m∠A = ${a}° and m∠B = ${b}°. In ΔDEF, m∠D = ${a}° and m∠F = ${c2}°. Are the triangles similar?`,
        visual: { type: "geo", showLabels: true, points: { A: t1[0], B: t1[1], C: t1[2], D: t2[0], E: t2[1], F: t2[2] }, polygons: [["A", "B", "C"], ["D", "E", "F"]], angles: [{ at: "A", from: "B", to: "C", label: `${a}°` }, { at: "B", from: "C", to: "A", label: `${b}°` }, { at: "D", from: "E", to: "F", label: `${a}°` }, { at: "F", from: "D", to: "E", label: `${c2}°` }] },
        answer: choice(r, sim ? "Yes, by AA (ΔABC ~ ΔDEF)" : "No, the angles don't all match", [
          ...(sim ? [["No, the angles don't all match", `Find the missing angles: m∠C = ${c}° and m∠E = ${e2}°. They match.`] as [string, string]] : [["Yes, by AA (ΔABC ~ ΔDEF)", `Find the third angles: m∠C = ${c}° but m∠F = ${c2}°.`] as [string, string]]),
          ["Yes, by SSS", "No side lengths are given."],
          ["You can't tell without side lengths", "Angles alone are enough to decide similarity (AA)."],
        ]),
        hints: ["Find the missing angle in each triangle (angles add to 180°).", "Compare all three angles. If two pairs match, the triangles are similar by AA."],
        steps: [st("Find the third angles.", `m∠C = 180° − ${a}° − ${b}° = ${c}°; m∠E = 180° − ${a}° − ${c2}° = ${e2}°`), st("Compare.", sim ? `Angles ${a}°, ${b}°, ${c}° in both triangles: similar by AA.` : `ΔABC has ${a}°, ${b}°, ${c}° but ΔDEF has ${a}°, ${e2}°, ${c2}°. Not similar.`)],
      };
    }
    const L = r.pick(SETS);
    if (lv === 2) {
      const [A, B, C, D, E] = L;
      const correct = `Δ${A}${D}${E} ~ Δ${A}${B}${C}`;
      return {
        prompt: `In the figure, ${D}${E} ∥ ${B}${C}. Which similarity statement is correct?`,
        visual: { type: "geo", showLabels: true, points: { [A]: { x: 2, y: 6 }, [B]: { x: 0, y: 0 }, [C]: { x: 8, y: 0 }, [D]: { x: 1, y: 3 }, [E]: { x: 5, y: 3 } }, polygons: [[A, B, C]], segments: [{ from: D, to: E }] },
        answer: choice(r, correct, [[`Δ${A}${D}${E} ~ Δ${A}${C}${B}`, `${D} is on side ${A}${B}, so it matches ${B}, not ${C}.`], [`Δ${A}${E}${D} ~ Δ${A}${B}${C}`, `Order matters: ${E} matches ${C}, so it must be in the third position.`], [`Δ${D}${A}${E} ~ Δ${A}${B}${C}`, `${A} is the shared angle; it must match itself.`]]),
        hints: [`∠${A} belongs to both triangles. Which angle of the small triangle matches ∠${B}?`, `Because ${D}${E} ∥ ${B}${C}, ∠${A}${D}${E} ≅ ∠${A}${B}${C} (corresponding angles). So ${D} ↔ ${B} and ${E} ↔ ${C}.`],
        steps: [st("Shared angle.", `∠${A} ≅ ∠${A}`), st("Corresponding angles.", `${D}${E} ∥ ${B}${C}, so ∠${A}${D}${E} ≅ ∠${A}${B}${C} and ∠${A}${E}${D} ≅ ∠${A}${C}${B}.`), st("Write the statement in matching order.", `${correct} by AA`)],
      };
    }
    // Level 3: bowtie with lengths.
    const [A, B, C, D, E] = L;
    const k = r.pick([frac(2), frac(3, 2), frac(5, 2), frac(3)]);
    const ac = 2 * r.int(2, 5), ab = 2 * r.int(3, 6);
    const ce = (ac * k.n) / k.d, de = (ab * k.n) / k.d;
    // Draw to scale: C at the origin, A on the left, B so that AB = ab; then E = −k·A and D = −k·B.
    const kk = fx(k);
    const Ap = { x: -ac, y: 0 }, phi = 110 * (Math.PI / 180);
    const Bp = { x: Ap.x + ab * Math.cos(phi), y: Ap.y + ab * Math.sin(phi) };
    const pts: Record<string, { x: number; y: number }> = { [A]: Ap, [B]: r3(Bp), [C]: { x: 0, y: 0 } };
    pts[E] = r3({ x: -kk * Ap.x, y: 0 });
    pts[D] = r3({ x: -kk * Bp.x, y: -kk * Bp.y });
    return {
      prompt: `${A}${B} ∥ ${D}${E}, and segments ${A}${E} and ${B}${D} cross at ${C}. ${A}${C} = ${ac}, ${C}${E} = ${ce} and ${A}${B} = ${ab}. Find ${D}${E}.`,
      visual: { type: "geo", showLabels: true, points: pts, polygons: [[A, B, C], [E, D, C]], segments: [{ from: A, to: C, label: String(ac) }, { from: C, to: E, label: String(ce) }, { from: A, to: B, label: String(ab) }, { from: D, to: E, label: "?" }] },
      answer: num(de),
      hints: [`Δ${A}${B}${C} ~ Δ${E}${D}${C} by AA: vertical angles at ${C}, and alternate interior angles ∠${A} ≅ ∠${E}.`, `${C}${E} corresponds to ${A}${C}, so the scale factor is {${ce}/${ac}}.`],
      steps: [
        st("Show the triangles are similar.", `∠${A}${C}${B} ≅ ∠${E}${C}${D} (vertical angles) and ∠${B}${A}${C} ≅ ∠${D}${E}${C} (alternate interior angles, since ${A}${B} ∥ ${D}${E}). So Δ${A}${B}${C} ~ Δ${E}${D}${C} by AA.`),
        st("Find the scale factor.", `k = {${C}${E}/${A}${C}} = {${ce}/${ac}} = ${fracText(k.n, k.d)}`),
        st("Find the matching side.", `${D}${E} = ${fracText(k.n, k.d)} × ${A}${B} = ${fracText(k.n, k.d)} × ${ab} = ${de}`),
      ],
      traps: traps(frac(de), [trap(frac(ab * k.d, k.n), "The bigger triangle is on the side with the longer segment; multiply, don't divide."), trap(ab + ce - ac, "Use a ratio, not a difference.")]),
    };
  },
};

// ---------- 5. Side splitter ----------
const sideSplitter: Skill = {
  id: "m2.sim.side-splitter",
  title: "The side-splitter theorem",
  topic: T,
  standards: ["NC.M2.G-SRT.4"],
  prereqs: ["m2.sim.aa"],
  lesson: {
    bigIdea: "A line parallel to one side of a triangle divides the other two sides proportionally: if DE ∥ BC, then {AD/DB} = {AE/EC}. The converse is true too.",
    explain: [
      "Why: ΔADE ~ ΔABC by AA, so {AB/AD} = {AC/AE}. Subtract 1 from both sides: {AB − AD/AD} = {AC − AE/AE}, which is {DB/AD} = {EC/AE}.",
      "Worked example: AD = 6, DB = 4, AE = 9. Then {6/4} = {9/EC}, so 6 · EC = 36 and **EC = 6**.",
      "Converse: if {AD/DB} = {AE/EC}, then DE ∥ BC. If the ratios differ, the segment is not parallel.",
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 3, y: 7.5 }, B: { x: 0, y: 0 }, C: { x: 9, y: 0 }, D: { x: 1.2, y: 3 }, E: { x: 6.6, y: 3 } }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E" }, { from: "A", to: "D", label: "6" }, { from: "D", to: "B", label: "4" }, { from: "A", to: "E", label: "9" }, { from: "E", to: "C", label: "?" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is it wrong to write {AD/AB} = {AE/EC}?", choices: ["It compares a part to a whole on one side and a part to a part on the other.", "Because AB is longer than EC.", "It's actually correct.", "Because proportions can't use whole sides."], correct: 0, explain: "Use part/part on both sides ({AD/DB} = {AE/EC}) or part/whole on both ({AD/AB} = {AE/AC})." },
    { kind: "written", prompt: "D is on AB and E is on AC with AD = 4, DB = 6, AE = 5, EC = 8. Is DE ∥ BC? Explain.", keyIdeas: ["compare AD/DB and AE/EC", "4/6 = 0.667 but 5/8 = 0.625", "the ratios are not equal, so by the converse of the side-splitter theorem DE is not parallel to BC"], exemplar: "Compare the ratios: AD/DB = 4/6 ≈ 0.667 and AE/EC = 5/8 = 0.625. They aren't equal, so the sides are not divided proportionally, and DE is not parallel to BC." },
  ],
  generate(r, lv) {
    const m = r.int(2, 5);
    const n = r.pick([2, 3, 4, 5].filter((v) => v !== m));
    const p = r.int(2, 4), q = r.int(2, 4);
    const AD = p * m, DB = p * n, AE = q * m, EC = q * n;
    const t = m / (m + n);
    const A = { x: 3, y: 7.5 }, B = { x: 0, y: 0 }, C = { x: 9, y: 0 };
    const D = r3({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t }), E = r3({ x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t });
    const vis = (labels: [string, string, string, string], ePt: P = E): Visual => ({ type: "geo", showLabels: true, points: { A, B, C, D, E: ePt }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E" }, { from: "A", to: "D", label: labels[0] }, { from: "D", to: "B", label: labels[1] }, { from: "A", to: "E", label: labels[2] }, { from: "E", to: "C", label: labels[3] }] });
    if (lv === 1 || (lv === 2 && r.chance(0.5))) {
      const ask = lv === 1 ? 3 : r.pick([0, 2]);
      const vals = [AD, DB, AE, EC];
      const labels = vals.map((v, i) => (i === ask ? "?" : String(v))) as [string, string, string, string];
      const nm = ["AD", "DB", "AE", "EC"][ask];
      const ans = vals[ask];
      const eq = `{AD/DB} = {AE/EC}`;
      const sub = `{${labels[0] === "?" ? "x" : AD}/${labels[1] === "?" ? "x" : DB}} = {${labels[2] === "?" ? "x" : AE}/${labels[3] === "?" ? "x" : EC}}`;
      return {
        prompt: `In ΔABC, DE ∥ BC. Find ${nm}.`,
        visual: vis(labels),
        answer: num(ans),
        hints: ["A segment parallel to one side splits the other two sides proportionally.", `Set up ${eq} and fill in the numbers: ${sub}.`],
        steps: [st("Write the side-splitter proportion.", eq), st("Substitute.", sub), st("Cross-multiply and solve.", `${nm} = ${ans}`), st("Check.", `{${AD}/${DB}} = ${fracText(AD, DB)} and {${AE}/${EC}} = ${fracText(AE, EC)} ✓`)],
        traps: traps(frac(ans), [trap(ask === 3 ? (AE * AD) / DB : ask === 0 ? (DB * EC) / AE : (EC * DB) / AD, "Check that you matched part-to-part on both sides: AD with AE (top pieces) and DB with EC (bottom pieces)."), trap(ask === 3 ? AE + DB - AD : ask === 0 ? AE - EC + DB : AD + EC - DB, "The pieces are proportional, not equal differences.")]),
      };
    }
    if (lv === 2) {
      // Find BC from DE.
      const DE = q * m;
      const BC = (DE * (m + n)) / m;
      return {
        prompt: `In ΔABC, DE ∥ BC, AD = ${AD}, DB = ${DB} and DE = ${DE}. Find BC.`,
        visual: { type: "geo", showLabels: true, points: { A, B, C, D, E }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E", label: String(DE) }, { from: "A", to: "D", label: String(AD) }, { from: "D", to: "B", label: String(DB) }, { from: "B", to: "C", label: "?" }] },
        answer: num(BC),
        hints: ["ΔADE ~ ΔABC, so compare the whole side AB with AD (not DB).", `{BC/DE} = {AB/AD} = {${AD + DB}/${AD}}.`],
        steps: [st("Use similar triangles.", "ΔADE ~ ΔABC (AA), so {BC/DE} = {AB/AD}"), st("Find AB.", `AB = ${AD} + ${DB} = ${AD + DB}`), st("Solve.", `BC = ${DE} × {${AD + DB}/${AD}} = ${BC}`)],
        traps: traps(frac(BC), [trap((DE * DB) / AD, "DE and BC belong to the small and large triangles. Compare AB (whole side) with AD, not DB with AD.")]),
      };
    }
    // Level 3: converse.
    const parallel = r.chance(0.5);
    const EC2 = parallel ? EC : EC + r.pick([-1, 1]) * (q > 2 ? 1 : 2);
    const e2 = EC2 === EC ? E : r3({ x: A.x + (C.x - A.x) * (AE / (AE + EC2)), y: A.y + (C.y - A.y) * (AE / (AE + EC2)) });
    const yes = "Yes, because {AD/DB} = {AE/EC}";
    const no = "No, because {AD/DB} ≠ {AE/EC}";
    return {
      prompt: `In ΔABC, AD = ${AD}, DB = ${DB}, AE = ${AE} and EC = ${EC2}. Is DE parallel to BC?`,
      visual: vis([String(AD), String(DB), String(AE), String(EC2)], e2),
      answer: choice(r, parallel ? yes : no, [[parallel ? no : yes, `Compare the two ratios as fractions: ${AD}/${DB} = ${fracPlain(AD, DB)} and ${AE}/${EC2} = ${fracPlain(AE, EC2)}.`], ["Yes, because DB > AD", "Parallel depends on the ratios, not which piece is longer."], ["You can't tell without measuring angles", "The converse of the side-splitter theorem only needs the ratios."]]),
      hints: ["By the converse of the side-splitter theorem, DE ∥ BC exactly when the sides are split proportionally.", `Simplify {${AD}/${DB}} and {${AE}/${EC2}} and compare.`],
      steps: [st("Compute the ratios.", `{AD/DB} = {${AD}/${DB}} = ${fracText(AD, DB)}; {AE/EC} = {${AE}/${EC2}} = ${fracText(AE, EC2)}`), st("Compare.", parallel ? "They are equal, so DE ∥ BC." : "They are not equal, so DE is not parallel to BC.")],
    };
  },
};

// ---------- 6. Similarity in right triangles and the Pythagorean theorem ----------
const ALT: { p: number; q: number }[] = [{ p: 9, q: 16 }, { p: 16, q: 9 }, { p: 4, q: 9 }, { p: 2, q: 8 }, { p: 1, q: 4 }, { p: 4, q: 16 }, { p: 3, q: 12 }, { p: 18, q: 32 }, { p: 8, q: 18 }, { p: 1, q: 9 }];
const rightSim: Skill = {
  id: "m2.sim.right-triangle-similarity",
  title: "Altitude to the hypotenuse and the Pythagorean theorem",
  topic: T,
  standards: ["NC.M2.G-SRT.4"],
  prereqs: ["m2.sim.aa"],
  lesson: {
    bigIdea: "The altitude to the hypotenuse of a right triangle splits it into two smaller triangles, both similar to the original. Their proportions prove the Pythagorean theorem.",
    explain: [
      "Right triangle ABC (right angle at C), altitude CD to hypotenuse AB, with AD = p and DB = q. All three triangles are similar by AA (each has a right angle and shares an angle with another).",
      "From ΔACD ~ ΔCBD: {p/h} = {h/q}, so **h² = pq**. From ΔACD ~ ΔABC: {p/b} = {b/c}, so b² = pc. Likewise a² = qc.",
      "Add: a² + b² = qc + pc = (p + q)c = c · c = c². That's a proof of the Pythagorean theorem using similarity.",
      "Worked example: p = 9, q = 16. h = √(9 · 16) = 12, and the leg next to p is √(9 · 25) = 15.",
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 0, y: 0 }, B: { x: 25, y: 0 }, C: { x: 9, y: 12 }, D: { x: 9, y: 0 } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "D", label: "h" }, { from: "A", to: "D", label: "p" }, { from: "D", to: "B", label: "q" }], angles: [{ at: "C", from: "A", to: "B", right: true }, { at: "D", from: "B", to: "C", right: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why is ΔACD similar to ΔABC when CD is the altitude to hypotenuse AB?", choices: ["Both have a right angle and they share ∠A, so they're similar by AA.", "Because they share side AC, they're congruent.", "Because CD bisects ∠C.", "Because D is the midpoint of AB."], correct: 0, explain: "∠ADC and ∠ACB are both right angles and ∠A is common." },
    { kind: "written", prompt: "Using b² = pc and a² = qc, explain how they prove a² + b² = c².", keyIdeas: ["add the two equations: a² + b² = qc + pc", "factor: (p + q)c", "p + q = c, the whole hypotenuse, so the sum is c²"], exemplar: "Adding gives a² + b² = qc + pc = (p + q)c. The two pieces p and q make up the whole hypotenuse, so p + q = c. That means a² + b² = c · c = c²." },
  ],
  generate(r, lv) {
    const { p, q } = r.pick(ALT);
    const c = p + q;
    const h = Math.sqrt(p * q);
    const legB = Math.sqrt(p * c), legA = Math.sqrt(q * c);
    const sc = 10 / c;
    const A = { x: 0, y: 0 }, B = { x: 10, y: 0 }, D = { x: p * sc, y: 0 }, C = r3({ x: p * sc, y: h * sc });
    const isInt = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
    if (lv === 1 && isInt(h)) {
      return {
        prompt: `In right triangle ABC, CD is the altitude to the hypotenuse. AD = ${p} and DB = ${q}. Find CD.`,
        visual: { type: "geo", showLabels: true, points: { A, B, C, D }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "D", label: "?" }, { from: "A", to: "D", label: String(p) }, { from: "D", to: "B", label: String(q) }], angles: [{ at: "C", from: "A", to: "B", right: true }, { at: "D", from: "B", to: "C", right: true }] },
        answer: num(h),
        hints: ["ΔACD ~ ΔCBD, so {AD/CD} = {CD/DB}.", `CD² = AD · DB = ${p} · ${q}.`],
        steps: [st("Use the similar triangles.", "{AD/CD} = {CD/DB}, so CD² = AD · DB"), st("Substitute.", `CD² = ${p} · ${q} = ${p * q}`), st("Take the square root.", `CD = ${h}`)],
        traps: traps(frac(h), [trap(p * q, "That's CD². Take the square root."), trap((p + q) / 2, "The altitude is the geometric mean √(pq), not the average.")]),
      };
    }
    if (lv <= 2 && (isInt(legB) || isInt(legA))) {
      const useB = isInt(legB);
      const seg = useB ? p : q, leg = useB ? legB : legA;
      const legName = useB ? "AC" : "BC", segName = useB ? "AD" : "DB";
      return {
        prompt: `In right triangle ABC, CD is the altitude to hypotenuse AB. AD = ${p} and DB = ${q}. Find ${legName}.`,
        visual: { type: "geo", showLabels: true, points: { A, B, C, D }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "D" }, { from: "A", to: "D", label: String(p) }, { from: "D", to: "B", label: String(q) }, { from: useB ? "A" : "B", to: "C", label: "?" }], angles: [{ at: "C", from: "A", to: "B", right: true }, { at: "D", from: "B", to: "C", right: true }] },
        answer: num(leg),
        hints: [`The small triangle that contains ${legName} is similar to ΔABC, so {${segName}/${legName}} = {${legName}/AB}.`, `${legName}² = ${segName} · AB = ${seg} · ${c}.`],
        steps: [st("Find the hypotenuse.", `AB = ${p} + ${q} = ${c}`), st("Use the similar triangles.", `{${segName}/${legName}} = {${legName}/AB}, so ${legName}² = ${seg} · ${c} = ${seg * c}`), st("Take the square root.", `${legName} = ${leg}`)],
        traps: traps(frac(leg), [trap(seg * c, `That's ${legName}². Take the square root.`), trap(h, "That's the altitude CD, not the leg.")]),
      };
    }
    // Level 3 (or fallback): given a leg and the hypotenuse, find the segment next to the leg.
    const [a3, b3, c3] = r.pick([[15, 20, 25], [6, 8, 10], [12, 16, 20], [9, 12, 15], [30, 40, 50], [18, 24, 30]]);
    const pp = (b3 * b3) / c3;
    const sc3 = 10 / c3;
    const C3 = r3({ x: pp * sc3, y: ((a3 * b3) / c3) * sc3 });
    const D3 = r3({ x: pp * sc3, y: 0 });
    return {
      prompt: `Right triangle ABC has its right angle at C, AC = ${b3} and AB = ${c3}. CD is the altitude to AB. Find AD.`,
      visual: { type: "geo", showLabels: true, points: { A, B, C: C3, D: D3 }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "D" }, { from: "A", to: "C", label: String(b3) }, { from: "A", to: "B", label: String(c3) }, { from: "A", to: "D", label: "?" }], angles: [{ at: "C", from: "A", to: "B", right: true }, { at: "D", from: "B", to: "C", right: true }] },
      answer: num(pp),
      hints: ["ΔACD ~ ΔABC (they share ∠A and each has a right angle).", `Match sides: {AD/AC} = {AC/AB}, so AD = AC² ÷ AB.`],
      steps: [st("Set up the proportion.", "{AD/AC} = {AC/AB}"), st("Substitute.", `{AD/${b3}} = {${b3}/${c3}}`), st("Solve.", `AD = {${b3 * b3}/${c3}} = ${pp}`), st("Check with the other piece.", `DB = ${c3} − ${pp} = ${+(c3 - pp).toFixed(4)}, and BC² = DB · AB = ${+((c3 - pp) * c3).toFixed(4)} = ${a3}² ✓ (BC = ${a3})`)],
      traps: traps(frac(pp), [trap(+(c3 - pp).toFixed(4), "That's DB, the piece next to the other leg."), trap(a3, "That's the other leg, BC.")]),
    };
  },
};

const skills: Skill[] = [dilate, dilationProps, similarSides, aa, sideSplitter, rightSim];
export default skills;
