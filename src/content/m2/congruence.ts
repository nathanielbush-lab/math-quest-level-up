// Unit 2: Congruence and proof (rigid motions, corresponding parts, criteria, angle and triangle theorems).
import { choice, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Problem, Skill, Visual } from "../types";
import type { Rng } from "../../lib/rng";
import { DEG, PRIME, type P } from "./util";
import { MOVES } from "./transformations";

const T = "m2-congruence";

/** Triangle with A at the origin, B on the x-axis, angles A and B in degrees, AB = c. */
export function triFromAngles(a: number, b: number, c = 6): [P, P, P] {
  const C = 180 - a - b;
  const bLen = (c * Math.sin(b * DEG)) / Math.sin(C * DEG);
  const r3 = (x: number) => Math.round(x * 1000) / 1000;
  return [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: r3(bLen * Math.cos(a * DEG)), y: r3(bLen * Math.sin(a * DEG)) }];
}

/** Triangle from three side lengths a = BC, b = CA, c = AB. */
export function triFromSides(a: number, b: number, c: number): [P, P, P] {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(b * b - x * x);
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  return [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: r3(x), y: r3(y) }];
}

function angleAt(p: P, q: P, s: P): number {
  const a1 = Math.atan2(q.y - p.y, q.x - p.x), a2 = Math.atan2(s.y - p.y, s.x - p.x);
  let d = Math.abs(a1 - a2) / DEG;
  if (d > 180) d = 360 - d;
  return d;
}

/** Mirror image of a triangle, placed to the right. */
function mirrorRight(t: P[], gap = 3): P[] {
  const maxX = Math.max(...t.map((p) => p.x)), minX = Math.min(...t.map((p) => p.x));
  const shift = maxX + gap + maxX - minX + minX;
  return t.map((p) => ({ x: Math.round((shift - p.x) * 1000) / 1000, y: p.y }));
}

/** Rotate a triangle 180° and place it to the right. */
function turnRight(t: P[], gap = 3): P[] {
  const maxX = Math.max(...t.map((p) => p.x));
  const maxY = Math.max(...t.map((p) => p.y));
  return t.map((p) => ({ x: Math.round((maxX + gap + (maxX - p.x)) * 1000) / 1000 + 0, y: Math.round((maxY - p.y) * 1000) / 1000 + 0 }));
}

const LETTERS = ["DEF", "PQR", "RST", "JKL", "XYZ", "MNO"];

// ---------- 1. Congruence through rigid motions ----------
const rigidCongruence: Skill = {
  id: "m2.cong.rigid-motions",
  title: "Congruence through rigid motions",
  topic: T,
  standards: ["NC.M2.G-CO.6", "NC.M2.G-CO.2"],
  prereqs: ["m2.trans.sequence"],
  lesson: {
    bigIdea: "Two figures are congruent exactly when a rigid motion (or a sequence of them) maps one onto the other.",
    explain: [
      "To show triangle ABC ≅ triangle DEF, find rigid motions that carry A to D, B to E and C to F. If such a sequence exists, the figures are congruent.",
      "If the side lengths don't match (say AB = 4 but DE = 8), no rigid motion can work, because rigid motions never change length. Those triangles might be similar, but they are not congruent.",
      "Worked example: A(1, 1), B(4, 1), C(1, 3) and D(−1, 1), E(−4, 1), F(−1, 3). Each x-coordinate changed sign and y stayed the same, so a reflection across the y-axis maps ABC onto DEF: **they are congruent**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does a rigid motion that maps ABC onto DEF prove the triangles are congruent?", choices: ["Rigid motions preserve every length and angle, so all corresponding parts match.", "Because the triangles end up in the same quadrant.", "Because rigid motions only move one vertex.", "It proves they are similar, not congruent."], correct: 0, explain: "Congruent means same size and shape; rigid motions keep size and shape." },
    { kind: "written", prompt: "Triangle ABC has AB = 5 and triangle PQR has PQ = 10, with all angles matching. Explain why no sequence of rigid motions maps ABC onto PQR.", keyIdeas: ["rigid motions preserve length", "AB would have to land on a segment of length 5", "PQ is 10, so the triangles are not congruent (they are similar)"], exemplar: "Every rigid motion keeps lengths the same, so the image of AB would still be 5 units long. PQ is 10 units, so AB can never land on it. The triangles have the same shape but different sizes: similar, not congruent." },
  ],
  generate(r, lv) {
    const base: [P, P, P] = r.pick([
      [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
      [{ x: 1, y: 2 }, { x: 5, y: 1 }, { x: 2, y: 4 }],
      [{ x: 2, y: 1 }, { x: 5, y: 2 }, { x: 1, y: 4 }],
      [{ x: 1, y: 1 }, { x: 3, y: 4 }, { x: 5, y: 2 }],
    ]);
    const [sx, sy] = [r.sign(), r.sign()];
    const t = base.map((p) => ({ x: p.x * sx, y: p.y * sy }));
    const opts: { key: string; text: string; fn: (p: P) => P }[] = [
      { key: "rx", text: "A reflection across the x-axis", fn: MOVES.rx.fn },
      { key: "ry", text: "A reflection across the y-axis", fn: MOVES.ry.fn },
      { key: "r90", text: "A rotation of 90° counterclockwise about the origin", fn: MOVES.r90.fn },
      { key: "r180", text: "A rotation of 180° about the origin", fn: MOVES.r180.fn },
      { key: "r270", text: "A rotation of 90° clockwise about the origin", fn: MOVES.r270.fn },
    ];
    const a = r.nonzero(-3, 3), b = r.nonzero(-5, -2);
    opts.push({ key: "tr", text: `A translation by (x, y) → (x${a > 0 ? " + " + a : " − " + -a}, y − ${-b})`, fn: (p) => ({ x: p.x + a, y: p.y + b }) });
    const pool = lv === 1 ? ["rx", "ry", "tr"] : ["r90", "r180", "r270", "rx", "ry"];
    let correct = r.pick(pool);
    const notCong = lv === 3 && r.chance(0.35);
    let img: P[];
    const noneText = "None: the triangles are not congruent";
    if (notCong) {
      img = t.map((p) => ({ x: -2 * p.x, y: 2 * p.y }));
      correct = "none";
    } else img = t.map((p) => { const q = opts.find((o) => o.key === correct)!.fn(p); return { x: q.x + 0, y: q.y + 0 }; });
    const vis: Visual = { type: "geo", grid: true, showLabels: true, points: { A: t[0], B: t[1], C: t[2], D: img[0], E: img[1], F: img[2] }, polygons: [["A", "B", "C"], ["D", "E", "F"]] };
    const corrText = correct === "none" ? noneText : opts.find((o) => o.key === correct)!.text;
    const wrongs = opts.filter((o) => o.key !== correct).filter((o) => !t.every((p, i) => { const q = o.fn(p); return q.x === img[i].x && q.y === img[i].y; }));
    const wrong: [string, string][] = r.shuffle(wrongs).slice(0, 3).map((o) => { const k = t.findIndex((p, i) => { const z = o.fn(p); return z.x !== img[i].x || z.y !== img[i].y; }); const z = o.fn(t[k]); return [o.text, `That sends ${"ABC"[k]}(${ms(t[k].x)}, ${ms(t[k].y)}) to (${ms(z.x + 0)}, ${ms(z.y + 0)}), not to ${"DEF"[k]}.`] as [string, string]; });
    if (lv === 3 && correct !== "none") wrong.push([noneText, "Check the side lengths: they match, so a rigid motion can work. Look for it."]);
    const AB = Math.hypot(t[1].x - t[0].x, t[1].y - t[0].y), DE = Math.hypot(img[1].x - img[0].x, img[1].y - img[0].y);
    return {
      prompt: `Which single transformation maps triangle ABC onto triangle DEF (A → D, B → E, C → F)?${lv === 3 ? " If none exists, say so." : ""}`,
      visual: vis,
      answer: choice(r, corrText, wrong),
      hints: ["Compare A with D: how did the coordinates change? Then check B with E.", correct === "none" ? "Before looking for a motion, compare a pair of side lengths, like AB and DE." : "Swapped coordinates point to a 90° rotation; one sign change points to a reflection across an axis; both signs changed means 180°."],
      steps: correct === "none"
        ? [st("Compare corresponding sides.", `AB = ${AB.toFixed(2)} but DE = ${DE.toFixed(2)}.`), st("Conclude.", "Rigid motions preserve length, so no rigid motion maps ABC onto DEF. The triangles are not congruent (DEF is twice as large).")]
        : [st("Compare A and D.", `A(${ms(t[0].x)}, ${ms(t[0].y)}) → D(${ms(img[0].x)}, ${ms(img[0].y)})`), st("Check another vertex.", `B(${ms(t[1].x)}, ${ms(t[1].y)}) → E(${ms(img[1].x)}, ${ms(img[1].y)})`), st("Name the rigid motion.", `${corrText}. Since a rigid motion maps ABC onto DEF, ΔABC ≅ ΔDEF.`)],
    };
  },
};

// ---------- 2. Corresponding parts ----------
const corresponding: Skill = {
  id: "m2.cong.corresponding",
  title: "Corresponding parts of congruent triangles",
  topic: T,
  standards: ["NC.M2.G-CO.7"],
  prereqs: ["m2.cong.rigid-motions"],
  lesson: {
    bigIdea: "In a congruence statement the order of the letters tells you which parts match: ΔABC ≅ ΔRTS means A ↔ R, B ↔ T, C ↔ S.",
    explain: [
      "Corresponding sides come from corresponding pairs of letters. In ΔABC ≅ ΔRTS: AB ↔ RT, BC ↔ TS, AC ↔ RS. Corresponding angles: ∠A ≅ ∠R, ∠B ≅ ∠T, ∠C ≅ ∠S.",
      "Worked example: ΔABC ≅ ΔRTS, with BC = 9 and ∠C = 40°. Then **TS = 9** and **∠S = 40°**, no matter how the triangles are drawn on the page.",
      "And it works both ways: if all three pairs of sides and all three pairs of angles match, the triangles are congruent.",
    ],
    tip: "Don't match by how the triangles look on the page. Match by letter position in the congruence statement.",
  },
  why: [
    { kind: "choice", prompt: "ΔABC ≅ ΔDEF. Why must ∠B ≅ ∠E?", choices: ["B and E are in the same position in the statement, so a rigid motion sends B to E and keeps the angle.", "Because B and E are both the second letter of the alphabet in each name.", "Because all angles in congruent triangles are equal.", "It isn't necessarily true."], correct: 0, explain: "The rigid motion maps each vertex to its partner; angle measures are preserved." },
    { kind: "written", prompt: "ΔJKL ≅ ΔXYZ. Explain how you find which side of ΔXYZ is congruent to KL.", keyIdeas: ["K is the 2nd letter and corresponds to Y", "L is the 3rd letter and corresponds to Z", "so KL ≅ YZ"], exemplar: "Match letters by position. K is second in JKL, so it matches Y, the second letter of XYZ. L is third, so it matches Z. That means KL corresponds to YZ, so KL ≅ YZ." },
  ],
  generate(r, lv) {
    const other = r.pick(LETTERS);
    const perm = r.shuffle([0, 1, 2]);
    // The second triangle's vertex for A, B, C is other[perm[i]].
    const name2 = [other[perm[0]], other[perm[1]], other[perm[2]]];
    const stmt = `ΔABC ≅ Δ${name2.join("")}`;
    const sides: [number, number, number] = r.pick([[7, 8, 9], [5, 7, 8], [6, 8, 9], [9, 10, 12], [7, 9, 11], [8, 10, 11]]);
    const [aL, bL, cL] = r.shuffle(sides); // BC, CA, AB
    const t = triFromSides(aL, bL, cL);
    const t2 = mirrorRight(t);
    const pts: Record<string, P> = { A: t[0], B: t[1], C: t[2] };
    name2.forEach((n, i) => (pts[n] = t2[i]));
    const sideNames: [string, string, number][] = [["B", "C", aL], ["C", "A", bL], ["A", "B", cL]];
    const idx = (v: string) => "ABC".indexOf(v);
    if (lv === 1) {
      const [p, q, len] = r.pick(sideNames);
      const ask = `${name2[idx(p)]}${name2[idx(q)]}`;
      const wrongVals = sideNames.filter((s) => s[2] !== len).map((s) => s[2]);
      return {
        prompt: `${stmt}. Using the side lengths shown, find ${ask}.`,
        visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"], name2], segments: sideNames.map(([u, v, L]) => ({ from: u, to: v, label: String(L) })) },
        answer: num(len),
        hints: [`Match letters by position in ${stmt}: A ↔ ${name2[0]}, B ↔ ${name2[1]}, C ↔ ${name2[2]}.`, `${ask} matches side ${p}${q} of triangle ABC.`],
        steps: [st("Write the correspondence.", `A ↔ ${name2[0]}, B ↔ ${name2[1]}, C ↔ ${name2[2]}`), st("Find the matching side.", `${ask} ↔ ${p}${q}`), st("Corresponding parts are congruent.", `${ask} = ${p}${q} = ${len}`)],
        traps: traps(frac(len), wrongVals.map((v) => trap(v, `That's a different side. Match letters by position: ${ask} ↔ ${p}${q}.`))),
      };
    }
    if (lv === 2) {
      const angA = r.int(40, 75), angB = r.int(40, 75);
      const angC = 180 - angA - angB;
      const ta = triFromAngles(angA, angB, 7);
      const tb = mirrorRight(ta);
      const pts2: Record<string, P> = { A: ta[0], B: ta[1], C: ta[2] };
      name2.forEach((n, i) => (pts2[n] = tb[i]));
      const askI = r.int(0, 2);
      const angs = [angA, angB, angC];
      const shown = [0, 1, 2].filter((i) => i !== askI);
      const ask = name2[askI];
      const ans = angs[askI];
      return {
        prompt: `${stmt}. Find m∠${ask}.`,
        visual: { type: "geo", showLabels: true, points: pts2, polygons: [["A", "B", "C"], name2], angles: shown.map((i) => ({ at: "ABC"[i], from: "ABC"[(i + 1) % 3], to: "ABC"[(i + 2) % 3], label: `${angs[i]}°` })) },
        answer: num(ans, { unit: "°" }),
        hints: [`∠${ask} corresponds to ∠${"ABC"[askI]}.`, `Find m∠${"ABC"[askI]} using the triangle angle sum: the three angles add to 180°.`],
        steps: [st("Find the matching angle.", `${ask} is in position ${askI + 1} of Δ${name2.join("")}, so ∠${ask} ↔ ∠${"ABC"[askI]}.`), st("Use the angle sum in ΔABC.", `m∠${"ABC"[askI]} = 180° − ${angs[shown[0]]}° − ${angs[shown[1]]}° = ${ans}°`), st("Corresponding angles are congruent.", `m∠${ask} = ${ans}°`)],
        traps: traps(frac(ans), shown.map((i) => trap(angs[i], `That angle belongs to ∠${"ABC"[i]}, which matches ∠${name2[i]}, not ∠${ask}.`))),
      };
    }
    const [p, q] = r.pick(sideNames);
    const ask = `${name2[idx(p)]}${name2[idx(q)]}`;
    const x = r.int(3, 9);
    const m1 = r.int(2, 4), m2 = m1 + r.int(1, 3);
    let c1 = r.int(-5, 9);
    if (c1 === 0) c1 = 4;
    const L = m1 * x + c1;
    const c2 = L - m2 * x;
    const e1 = `${m1}x${c1 < 0 ? " − " + -c1 : c1 > 0 ? " + " + c1 : ""}`;
    const e2 = `${m2}x${c2 < 0 ? " − " + -c2 : c2 > 0 ? " + " + c2 : ""}`;
    return {
      prompt: `${stmt}, with ${p}${q} = ${e1} and ${ask} = ${e2}. Find the length of ${p}${q}.`,
      visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"], name2] },
      answer: num(L),
      hints: [`${p}${q} and ${ask} are corresponding sides, so they are equal: ${e1} = ${e2}.`, `Solve for x, then put x back into ${e1}.`],
      steps: [
        st("Corresponding sides are congruent.", `${e1} = ${e2}`),
        st("Solve for x.", `${ms(c1 - c2)} = ${m2 - m1 === 1 ? "" : m2 - m1}x, so x = ${x}`),
        st("Find the length.", `${p}${q} = ${m1}(${x})${c1 < 0 ? " − " + -c1 : c1 > 0 ? " + " + c1 : ""} = ${L}`),
      ],
      traps: traps(frac(L), [trap(x, `x = ${x}, but the question asks for the length ${p}${q}. Substitute x back in.`)]),
    };
  },
};

// ---------- 3. Congruence criteria ----------
type Crit = "SSS" | "SAS" | "ASA" | "AAS" | "HL" | "none";
const CRIT_TEXT: Record<Crit, string> = { SSS: "SSS", SAS: "SAS", ASA: "ASA", AAS: "AAS", HL: "HL", none: "Not enough information" };
const CRIT_WHY: Record<Crit, string> = {
  SSS: "All three pairs of sides are marked congruent.",
  SAS: "Two pairs of sides and the angle between them (the included angle) match.",
  ASA: "Two pairs of angles and the side between them (the included side) match.",
  AAS: "Two pairs of angles and a side that is not between them match.",
  HL: "They are right triangles with congruent hypotenuses and one pair of congruent legs.",
  none: "The marked parts don't fit any criterion. SSA (two sides and a non-included angle) and AAA don't guarantee congruence.",
};

const CRIT_NEED: Record<Crit, string> = {
  SSS: "three pairs of congruent sides",
  SAS: "two pairs of sides and the angle between them",
  ASA: "two pairs of angles and the side between them",
  AAS: "two pairs of angles and a side that is not between them",
  HL: "right triangles with congruent hypotenuses and one pair of congruent legs",
  none: "",
};

const criteria: Skill = {
  id: "m2.cong.criteria",
  title: "Triangle congruence criteria",
  topic: T,
  standards: ["NC.M2.G-CO.8", "NC.M2.G-CO.7"],
  prereqs: ["m2.cong.corresponding"],
  lesson: {
    bigIdea: "You don't need all six pairs of parts. SSS, SAS, ASA, AAS and (for right triangles) HL each guarantee congruence. SSA and AAA do not.",
    explain: [
      "Tick marks show congruent sides; matching angle labels show congruent angles. “Included” means between: in SAS the angle is formed by the two sides; in ASA the side joins the two angles.",
      "Why SAS works: if AB ≅ DE, AC ≅ DF and ∠A ≅ ∠D, a rigid motion can put A on D and the rays of ∠A on the rays of ∠D. The sides have the same lengths, so B lands on E and C lands on F.",
      "Worked example: two triangles share side BD, with AB ≅ CB and AD ≅ CD marked. BD ≅ BD (the reflexive property), so all three pairs of sides match: **SSS**.",
      "AAA fails: a small and a large equilateral triangle have the same angles. SSA fails because the third side can swing to two different positions.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why isn't AAA a congruence criterion?", choices: ["Triangles with the same angles can have different sizes.", "Because the angles in a triangle always add to 180°, so three angles is too much information.", "Because you can't measure angles exactly.", "AAA is a criterion; it's the same as ASA."], correct: 0, explain: "Matching angles guarantee the same shape (similar), but not the same size." },
    { kind: "written", prompt: "Explain why HL works for right triangles even though it looks like SSA.", keyIdeas: ["the right angles are congruent", "with the hypotenuse and a leg known, the Pythagorean theorem fixes the other leg", "so all three sides match and SSS applies"], exemplar: "In right triangles the congruent angle is the right angle. If the hypotenuses and one pair of legs match, the Pythagorean theorem gives the third side: it must be the same in both triangles. Then all three pairs of sides match, so the triangles are congruent by SSS." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const target = r.pick(["SAS", "ASA", "AAS"] as const);
      const angA = r.int(40, 70), angB = r.int(45, 75);
      const t = triFromAngles(angA, angB, 7);
      const t2 = mirrorRight(t);
      const pts = { A: t[0], B: t[1], C: t[2], D: t2[0], E: t2[1], F: t2[2] };
      // Given: AB ≅ DE and ∠A ≅ ∠D.
      const options: Record<string, string> = { "AC ≅ DF": "SAS", "BC ≅ EF": "SSA (not a criterion)", "∠B ≅ ∠E": "ASA", "∠C ≅ ∠F": "AAS" };
      const correct = Object.keys(options).find((k) => options[k] === target)!;
      return {
        prompt: `In the figure, AB ≅ DE and ∠A ≅ ∠D. Which additional fact would prove ΔABC ≅ ΔDEF by ${target}?`,
        visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"], ["D", "E", "F"]], segments: [{ from: "A", to: "B", tick: 1 }, { from: "D", to: "E", tick: 1 }], angles: [{ at: "A", from: "B", to: "C", label: `${angA}°` }, { at: "D", from: "E", to: "F", label: `${angA}°` }] },
        answer: choice(r, correct, Object.keys(options).filter((k) => k !== correct).map((k) => [k, `With ${k}, the parts would be ${options[k]}, not ${target}.`] as [string, string])),
        hints: [`Spell out ${target}: which parts are sides and which are angles, and in what order?`, target === "SAS" ? "The angle must be between the two sides. ∠A is between AB and AC." : target === "ASA" ? "The side must be between the two angles. AB is between ∠A and ∠B." : "AAS uses two angles and a side that is NOT between them. AB is between ∠A and ∠B, so the second angle must be ∠C."],
        steps: [st(`What ${target} needs.`, CRIT_WHY[target as Crit]), st("Match it to the figure.", `Given AB ≅ DE and ∠A ≅ ∠D, adding ${correct} gives ${target}.`)],
      };
    }
    let crit: Crit;
    let vis: Visual;
    let note = "";
    if (lv === 1) {
      crit = r.pick(["SSS", "SAS", "ASA", "AAS", "HL", "none"] as Crit[]);
      const right = crit === "HL";
      const angA = right ? r.int(30, 60) : r.int(40, 70);
      const angB = right ? 90 - angA : r.int(45, 75);
      // For HL the right angle is at C.
      const t = triFromAngles(angA, angB, 7);
      const t2 = crit === "none" && r.chance(0.5) ? mirrorRight(t.map((p) => ({ x: p.x * 1.5, y: p.y * 1.5 }))) : mirrorRight(t);
      const aaa = crit === "none" && Math.abs(t2[0].x - t2[1].x) > 8;
      const pts = { A: t[0], B: t[1], C: t[2], D: t2[0], E: t2[1], F: t2[2] };
      const segs: { from: string; to: string; tick?: 1 | 2 | 3 }[] = [];
      const angs: { at: string; from: string; to: string; label?: string; right?: boolean }[] = [];
      const angC = 180 - angA - angB;
      const side = (u: string, v: string, w: string, x: string, k: 1 | 2 | 3) => segs.push({ from: u, to: v, tick: k }, { from: w, to: x, tick: k });
      const ang = (u: string, f: string, tt: string, w: string, f2: string, t2_: string, label: string) => angs.push({ at: u, from: f, to: tt, label }, { at: w, from: f2, to: t2_, label });
      if (crit === "SSS") { side("A", "B", "D", "E", 1); side("B", "C", "E", "F", 2); side("A", "C", "D", "F", 3); }
      if (crit === "SAS") { side("A", "B", "D", "E", 1); side("A", "C", "D", "F", 2); ang("A", "B", "C", "D", "E", "F", `${angA}°`); }
      if (crit === "ASA") { side("A", "B", "D", "E", 1); ang("A", "B", "C", "D", "E", "F", `${angA}°`); ang("B", "A", "C", "E", "D", "F", `${angB}°`); }
      if (crit === "AAS") { side("B", "C", "E", "F", 1); ang("A", "B", "C", "D", "E", "F", `${angA}°`); ang("B", "A", "C", "E", "D", "F", `${angB}°`); }
      if (crit === "HL") { side("A", "B", "D", "E", 1); side("A", "C", "D", "F", 2); angs.push({ at: "C", from: "A", to: "B", right: true }, { at: "F", from: "D", to: "E", right: true }); }
      if (crit === "none") {
        if (aaa) { ang("A", "B", "C", "D", "E", "F", `${angA}°`); ang("B", "A", "C", "E", "D", "F", `${angB}°`); ang("C", "A", "B", "F", "D", "E", `${angC}°`); note = "AAA"; }
        else { side("A", "B", "D", "E", 1); side("B", "C", "E", "F", 2); ang("A", "B", "C", "D", "E", "F", `${angA}°`); note = "SSA"; }
      }
      vis = { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"], ["D", "E", "F"]], segments: segs, angles: angs };
    } else {
      const shape = r.pick(["kite", "bowtie"]);
      if (shape === "kite") {
        crit = r.pick(["SSS", "SAS", "ASA"] as Crit[]);
        const pts = { A: { x: -3, y: 1 }, B: { x: 0, y: 5 }, C: { x: 3, y: 1 }, D: { x: 0, y: -1 } };
        const segs: { from: string; to: string; tick?: 1 | 2 | 3 }[] = [{ from: "B", to: "D" }];
        const angs: { at: string; from: string; to: string; label?: string }[] = [];
        if (crit === "SSS") segs.push({ from: "A", to: "B", tick: 1 }, { from: "C", to: "B", tick: 1 }, { from: "A", to: "D", tick: 2 }, { from: "C", to: "D", tick: 2 });
        if (crit === "SAS") { segs.push({ from: "A", to: "B", tick: 1 }, { from: "C", to: "B", tick: 1 }); angs.push({ at: "B", from: "A", to: "D", label: "1" }, { at: "B", from: "D", to: "C", label: "2" }); note = "∠1 ≅ ∠2. "; }
        if (crit === "ASA") { angs.push({ at: "B", from: "A", to: "D", label: "1" }, { at: "B", from: "D", to: "C", label: "2" }, { at: "D", from: "B", to: "A", label: "3" }, { at: "D", from: "C", to: "B", label: "4" }); note = "∠1 ≅ ∠2 and ∠3 ≅ ∠4. "; }
        vis = { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C", "D"]], segments: segs, angles: angs };
        note += "The two triangles share side BD.";
        return finishCrit(r, crit, vis, "ΔABD ≅ ΔCBD", note, true);
      }
      crit = r.pick(["SAS", "ASA"] as Crit[]);
      const pts = { A: { x: -4, y: 2 }, B: { x: -3, y: -3 }, M: { x: 0, y: 0 }, D: { x: 4, y: -2 }, C: { x: 3, y: 3 } };
      const segs: { from: string; to: string; tick?: 1 | 2 | 3 }[] = [{ from: "A", to: "D" }, { from: "B", to: "C" }];
      const angs: { at: string; from: string; to: string; label?: string }[] = [];
      if (crit === "SAS") { segs.push({ from: "A", to: "M", tick: 1 }, { from: "M", to: "D", tick: 1 }, { from: "B", to: "M", tick: 2 }, { from: "M", to: "C", tick: 2 }); note = "Segments AD and BC cross at M."; }
      else { segs.push({ from: "A", to: "M", tick: 1 }, { from: "M", to: "D", tick: 1 }); angs.push({ at: "A", from: "M", to: "B", label: "1" }, { at: "D", from: "M", to: "C", label: "2" }); note = "∠1 ≅ ∠2. Segments AD and BC cross at M."; }
      vis = { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "M"], ["D", "C", "M"]], segments: segs, angles: angs };
      return finishCrit(r, crit, vis, "ΔAMB ≅ ΔDMC", note, false);
    }
    return finishCrit(r, crit, vis, "ΔABC ≅ ΔDEF", "", false, note);
  },
};

function finishCrit(r: Rng, crit: Crit, vis: Visual, stmt: string, note: string, shared: boolean, kind = "") {
  const all: Crit[] = ["SSS", "SAS", "ASA", "AAS", "HL", "none"];
  const fb = (c: Crit) => (c === "none" ? "There is enough marked to use a criterion. Look again at which parts match, including shared sides or vertical angles." : c === "HL" ? "HL only applies to right triangles." : `${c} needs ${CRIT_NEED[c]}. That's not what is marked.`);
  const extra = stmt === "ΔAMB ≅ ΔDMC" ? "∠AMB ≅ ∠DMC because they are vertical angles." : shared ? "BD ≅ BD by the reflexive property (a shared side counts for both triangles)." : "";
  return {
    prompt: `Which criterion, if any, proves ${stmt}? ${note}`.trim(),
    visual: vis,
    answer: choice(r, CRIT_TEXT[crit], all.filter((c) => c !== crit).map((c) => [CRIT_TEXT[c], fb(c)] as [string, string]), true),
    hints: ["List the congruent parts you can see: tick marks are sides, matching labels are angles.", extra || "Check the order: is each marked angle between the marked sides (or each marked side between the marked angles)?"],
    steps: [
      ...(extra ? [st("Don't forget the hidden pair.", extra)] : []),
      st("List the congruent parts.", kind === "SSA" ? "Two pairs of sides and an angle that is not between them." : kind === "AAA" ? "Three pairs of angles, but no sides." : CRIT_WHY[crit]),
      st("Name the criterion.", crit === "none" ? `That's ${kind}, which does not guarantee congruence. Not enough information.` : `${crit}, so ${stmt}.`),
    ],
  };
}

// ---------- 4. Parallel lines and transversals ----------
type Pos = "UR" | "UL" | "LL" | "LR";
const posVal = (p: Pos, th: number) => (p === "UR" || p === "LL" ? th : 180 - th);
const PAIRS: { a: [0 | 1, Pos]; b: [0 | 1, Pos]; rel: string; equal: boolean }[] = [
  { a: [0, "UR"], b: [1, "UR"], rel: "corresponding angles", equal: true },
  { a: [0, "LL"], b: [1, "LL"], rel: "corresponding angles", equal: true },
  { a: [0, "UL"], b: [1, "UL"], rel: "corresponding angles", equal: true },
  { a: [0, "UL"], b: [1, "LR"], rel: "alternate interior angles", equal: true },
  { a: [0, "UR"], b: [1, "LL"], rel: "alternate interior angles", equal: true },
  { a: [0, "LL"], b: [1, "UR"], rel: "alternate exterior angles", equal: true },
  { a: [0, "UR"], b: [1, "LR"], rel: "same-side interior angles", equal: false },
  { a: [0, "UL"], b: [1, "LL"], rel: "same-side interior angles", equal: false },
  { a: [1, "UR"], b: [1, "LL"], rel: "vertical angles", equal: true },
  { a: [0, "UR"], b: [0, "UL"], rel: "a linear pair", equal: false },
];

function transversal(th: number, labels: [string, string], at: [Pos, Pos], which: [0 | 1, 0 | 1]): Visual {
  const dx = 3 / Math.tan(th * DEG);
  const X = { x: -dx / 2, y: 0 }, Y = { x: dx / 2, y: 3 };
  const u = { x: Math.cos(th * DEG), y: Math.sin(th * DEG) };
  const pts: Record<string, P> = {
    L1: { x: -6, y: 0 }, R1: { x: 6, y: 0 }, L2: { x: -6, y: 3 }, R2: { x: 6, y: 3 },
    X, Y, T1: { x: X.x - 2 * u.x, y: X.y - 2 * u.y }, T2: { x: Y.x + 2 * u.x, y: Y.y + 2 * u.y },
  };
  for (const k of Object.keys(pts)) pts[k] = { x: Math.round(pts[k].x * 1000) / 1000, y: Math.round(pts[k].y * 1000) / 1000 };
  const rays = (i: 0 | 1, p: Pos): [string, string] => {
    const right = i === 0 ? "R1" : "R2", left = i === 0 ? "L1" : "L2";
    const up = i === 0 ? "Y" : "T2", down = i === 0 ? "T1" : "X";
    return p === "UR" ? [right, up] : p === "UL" ? [up, left] : p === "LL" ? [left, down] : [down, right];
  };
  const angles = [0, 1].map((k) => { const i = which[k]; const [f, t] = rays(i, at[k]); return { at: i === 0 ? "X" : "Y", from: f, to: t, label: labels[k] }; });
  return { type: "geo", points: pts, segments: [{ from: "L1", to: "R1" }, { from: "L2", to: "R2" }, { from: "T1", to: "T2" }], angles, showLabels: false };
}

const parallelAngles: Skill = {
  id: "m2.cong.parallel-lines",
  title: "Angles formed by parallel lines",
  topic: T,
  standards: ["NC.M2.G-CO.9"],
  prereqs: [],
  lesson: {
    bigIdea: "When a transversal crosses two parallel lines, corresponding, alternate interior and alternate exterior angles are congruent; same-side interior angles are supplementary.",
    explain: [
      "Vertical angles (across an X) are always congruent, and a linear pair (side by side on a line) adds to 180°. Those two facts work for any crossing lines.",
      "If the lines are parallel, a translation along the transversal slides one crossing onto the other, so the four angles at the top match the four at the bottom (corresponding angles).",
      "Worked example: alternate interior angles measure (3x + 10)° and (5x − 30)°. They are congruent, so 3x + 10 = 5x − 30, giving 40 = 2x and x = 20. Each angle is **70°**.",
    ],
    visual: transversal(65, ["(3x + 10)°", "(5x − 30)°"], ["UL", "LR"], [0, 1]),
  },
  why: [
    { kind: "choice", prompt: "Why are same-side interior angles supplementary (not congruent) when the lines are parallel?", choices: ["One of them is congruent to an angle that forms a linear pair with the other, so they add to 180°.", "Because they are on the same side, they must be equal.", "Because they are vertical angles.", "They are only supplementary when the transversal is perpendicular."], correct: 0, explain: "Replace one angle by its alternate interior partner: that partner and the other angle form a linear pair." },
    { kind: "written", prompt: "Explain why vertical angles are congruent, using linear pairs.", keyIdeas: ["∠1 and ∠2 form a linear pair, so ∠1 + ∠2 = 180°", "∠2 and ∠3 also form a linear pair, so ∠2 + ∠3 = 180°", "so ∠1 = ∠3 (both equal 180° − ∠2)"], exemplar: "Say ∠1 and ∠3 are vertical angles and ∠2 is next to both. ∠1 + ∠2 = 180° and ∠2 + ∠3 = 180° because each pair forms a straight line. Both ∠1 and ∠3 equal 180° − ∠2, so they are congruent." },
  ],
  generate(r, lv) {
    const pair = r.pick(lv === 1 ? PAIRS : PAIRS.filter((p) => p.rel !== "vertical angles" && p.rel !== "a linear pair"));
    let th = r.int(40, 75);
    const v1 = posVal(pair.a[1], th), v2 = posVal(pair.b[1], th);
    if (lv === 1) {
      const vis = transversal(th, [`${v1}°`, "x°"], [pair.a[1], pair.b[1]], [pair.a[0], pair.b[0]]);
      return {
        prompt: `The two horizontal lines are parallel. Find x.`,
        visual: vis,
        answer: num(v2),
        hints: ["Name the relationship between the two marked angles.", `They are ${pair.rel}, so they are ${pair.equal ? "congruent" : "supplementary (they add to 180°)"}.`],
        steps: [st("Identify the angle pair.", `The angles are ${pair.rel}.`), st(pair.equal ? "They are congruent." : "They are supplementary.", pair.equal ? `x = ${v1}` : `x = 180 − ${v1} = ${v2}`)],
        traps: traps(frac(v2), [trap(pair.equal ? 180 - v1 : v1, pair.equal ? `These angles are ${pair.rel}, which are congruent, not supplementary.` : `${pair.rel[0].toUpperCase() + pair.rel.slice(1)} add to 180°, they aren't equal.`), ...(v1 < 90 ? [trap(90 - v1, "Parallel-line angles are congruent or add to 180°, not 90°.")] : [])]),
      };
    }
    // Build expressions with a whole-number solution.
    let x: number, a1: number, b1: number, a2: number, b2: number;
    for (;;) {
      x = r.int(8, 25);
      a1 = r.int(2, 5); a2 = r.int(2, 6);
      if (pair.equal && a1 === a2) continue;
      b1 = v1 - a1 * x;
      b2 = v2 - a2 * x;
      if (Math.abs(b1) <= 60 && Math.abs(b2) <= 60 && b1 !== 0 && b2 !== 0) break;
      th = r.int(40, 75);
    }
    const ex = (a: number, b: number) => `(${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)})°`;
    const e1 = ex(a1, b1), e2 = ex(a2, b2);
    const vis = transversal(th, [e1, e2], [pair.a[1], pair.b[1]], [pair.a[0], pair.b[0]]);
    const askAngle = lv === 3;
    const eq = pair.equal ? `${a1}x ${b1 < 0 ? "−" : "+"} ${Math.abs(b1)} = ${a2}x ${b2 < 0 ? "−" : "+"} ${Math.abs(b2)}` : `${a1}x ${b1 < 0 ? "−" : "+"} ${Math.abs(b1)} + ${a2}x ${b2 < 0 ? "−" : "+"} ${Math.abs(b2)} = 180`;
    const ans = askAngle ? v1 : x;
    return {
      prompt: `The two horizontal lines are parallel. ${askAngle ? `Find the measure of the angle labeled ${e1}.` : "Find x."}`,
      visual: vis,
      answer: num(ans, askAngle ? { unit: "°" } : {}),
      hints: [`What is the relationship between the angles? They are ${pair.rel}.`, `So ${pair.equal ? "set the expressions equal" : "the expressions add to 180"}: ${eq}.`, ...(askAngle ? [`After finding x, substitute it into ${e1}.`] : [])],
      steps: [
        st("Identify the angle pair.", `${pair.rel[0].toUpperCase() + pair.rel.slice(1)}, so they are ${pair.equal ? "congruent" : "supplementary"}.`),
        st("Write an equation.", eq),
        st("Solve.", pair.equal ? `${a1 - a2 > 0 ? `${a1 - a2 === 1 ? "" : a1 - a2}x = ${b2 - b1}` : `${ms(b1 - b2)} = ${a2 - a1 === 1 ? "" : a2 - a1}x`}, so x = ${x}` : `${a1 + a2}x ${b1 + b2 < 0 ? "−" : "+"} ${Math.abs(b1 + b2)} = 180, so ${a1 + a2}x = ${180 - b1 - b2} and x = ${x}`),
        st("Check.", `${e1.replace("x", `(${x})`)} = ${v1}° and ${e2.replace("x", `(${x})`)} = ${v2}°${pair.equal ? "" : `; ${v1} + ${v2} = 180`} ✓`),
      ],
      traps: askAngle ? traps(frac(v1), [trap(x, `x = ${x}; now substitute it to find the angle.`), trap(v2 === v1 ? 180 - v1 : v2, "That's the other angle.")]) : traps(frac(x), [trap(v1, "That's the angle measure. The question asks for x.")]),
    };
  },
};

// ---------- 5. Bisector theorems ----------
const bisectors: Skill = {
  id: "m2.cong.bisectors",
  title: "Perpendicular and angle bisector theorems",
  topic: T,
  standards: ["NC.M2.G-CO.9"],
  prereqs: ["m2.trans.reflect"],
  lesson: {
    bigIdea: "Any point on the perpendicular bisector of AB is the same distance from A and B. Any point on an angle bisector is the same distance from the two sides of the angle.",
    explain: [
      "Perpendicular bisector: if line ℓ is perpendicular to AB at its midpoint M and P is on ℓ, then **PA = PB**. Reason: reflecting across ℓ swaps A and B and keeps P fixed, so PA maps to PB.",
      "Angle bisector: if ray BD bisects ∠ABC and P is on it, the perpendicular distances from P to BA and to BC are equal.",
      "Worked example: P is on the perpendicular bisector of AB, PA = 2x + 5 and PB = 4x − 9. Then 2x + 5 = 4x − 9, so x = 7 and **PA = 19**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is every point on the perpendicular bisector of AB equidistant from A and B?", choices: ["Reflecting across the bisector swaps A and B but keeps the point fixed, so the two distances match.", "Because the point is the midpoint of AB.", "Because all points are equidistant from A and B.", "Because the bisector is parallel to AB."], correct: 0, explain: "A reflection is a rigid motion, so it preserves the distance from P to A, which becomes the distance from P to B." },
    { kind: "written", prompt: "P is the same distance from A as from B. Explain where P must lie and why.", keyIdeas: ["P lies on the perpendicular bisector of AB (the converse)", "triangles PMA and PMB are congruent by SSS, where M is the midpoint", "so ∠PMA = ∠PMB, which forms a linear pair, so each is 90°"], exemplar: "P must be on the perpendicular bisector of AB. If M is the midpoint, then PA = PB, MA = MB and PM is shared, so triangles PMA and PMB are congruent by SSS. That makes ∠PMA ≅ ∠PMB, and since they form a straight line, each is 90°. So PM is the perpendicular bisector." },
  ],
  generate(r, lv): Problem {
    const angle = lv === 3 && r.chance(0.5);
    if (angle) {
      const x = r.int(3, 9);
      const a1 = r.int(2, 4), a2 = a1 + r.int(1, 3);
      let d = r.int(8, 20);
      if (d === a1 * x || d === a2 * x) d += 1;
      const b2 = d - a2 * x;
      const D = d;
      const k1 = d - a1 * x;
      const e1 = `${a1}x ${k1 < 0 ? "−" : "+"} ${Math.abs(k1)}`, e2 = `${a2}x ${b2 < 0 ? "−" : "+"} ${Math.abs(b2)}`;
      const B = { x: 0, y: 0 }, A = { x: 8, y: 0 }, C = { x: 8 * Math.cos(70 * DEG), y: 8 * Math.sin(70 * DEG) };
      const Pp = { x: 5 * Math.cos(35 * DEG), y: 5 * Math.sin(35 * DEG) };
      const E = { x: Pp.x, y: 0 };
      const proj = (Pp.x * Math.cos(70 * DEG) + Pp.y * Math.sin(70 * DEG));
      const F = { x: proj * Math.cos(70 * DEG), y: proj * Math.sin(70 * DEG) };
      const R3 = (p: P) => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 });
      return {
        prompt: `Ray BP bisects ∠ABC. The distance from P to side BA is ${e1}, and the distance from P to side BC is ${e2}. Find the distance from P to BA.`,
        visual: { type: "geo", showLabels: true, points: { A: R3(A), B, C: R3(C), P: R3(Pp), E: R3(E), F: R3(F) }, segments: [{ from: "B", to: "A" }, { from: "B", to: "C" }, { from: "B", to: "P" }, { from: "P", to: "E", label: e1 }, { from: "P", to: "F", label: e2 }], angles: [{ at: "E", from: "P", to: "A", right: true }, { at: "F", from: "P", to: "B", right: true }] },
        answer: num(D),
        hints: ["A point on an angle bisector is the same distance from both sides of the angle.", `Set ${e1} = ${e2} and solve for x. Then substitute.`],
        steps: [st("Use the angle bisector theorem.", `PE = PF, so ${e1} = ${e2}.`), st("Solve for x.", `x = ${x}`), st("Find the distance.", `${a1}(${x}) ${k1 < 0 ? "−" : "+"} ${Math.abs(k1)} = ${D}`)],
        traps: traps(frac(D), [trap(x, "That's x. Substitute it back to find the distance.")]),
      };
    }
    const half = r.int(3, 9);
    const A = { x: -half, y: 0 }, B = { x: half, y: 0 }, M = { x: 0, y: 0 };
    const h = r.pick([4, 5, 6, 8]);
    const Pp = { x: 0, y: h };
    if (lv === 1) {
      const pa = Math.hypot(half, h);
      const askAB = r.chance(0.5);
      if (askAB) {
        return {
          prompt: `Line PM is the perpendicular bisector of AB. AM = ${half}. Find AB.`,
          visual: { type: "geo", showLabels: true, points: { A, B, M, P: Pp }, segments: [{ from: "A", to: "B" }, { from: "P", to: "M" }, { from: "A", to: "M", tick: 1, label: String(half) }, { from: "M", to: "B", tick: 1 }], angles: [{ at: "M", from: "B", to: "P", right: true }] },
          answer: num(2 * half),
          hints: ["A bisector cuts the segment into two equal halves.", `MB = AM = ${half}.`],
          steps: [st("M is the midpoint.", `AM = MB = ${half}`), st("Add.", `AB = ${half} + ${half} = ${2 * half}`)],
          traps: traps(frac(2 * half), [trap(half, "That's only half of AB.")]),
        };
      }
      const L = Number(pa.toFixed(1));
      return {
        prompt: `Line PM is the perpendicular bisector of AB, and PA = ${L}. Find PB.`,
        visual: { type: "geo", showLabels: true, points: { A, B, M, P: Pp }, segments: [{ from: "A", to: "B" }, { from: "P", to: "M" }, { from: "P", to: "A", label: String(L) }, { from: "P", to: "B" }, { from: "A", to: "M", tick: 1 }, { from: "M", to: "B", tick: 1 }], angles: [{ at: "M", from: "B", to: "P", right: true }] },
        answer: num(L),
        hints: ["P is on the perpendicular bisector of AB. What does that tell you about its distances to A and B?", "Points on the perpendicular bisector are equidistant from the endpoints."],
        steps: [st("Use the perpendicular bisector theorem.", "P is on the perpendicular bisector, so PA = PB."), st("Answer.", `PB = ${L}`)],
        traps: traps(frac(L), [trap(half, "AM is half of AB. The question asks for PB."), trap(2 * half, "That's AB, not PB.")]),
      };
    }
    let x: number, a1: number, a2: number, k1: number, k2: number, L: number;
    for (;;) {
      x = r.int(2, 9);
      a1 = r.int(2, 5); a2 = r.int(2, 7);
      if (a1 === a2) continue;
      L = r.int(10, 30);
      k1 = L - a1 * x; k2 = L - a2 * x;
      if (k1 !== 0 && k2 !== 0 && Math.abs(k1) < 25 && Math.abs(k2) < 25) break;
    }
    const e1 = `${a1}x ${k1 < 0 ? "−" : "+"} ${Math.abs(k1)}`, e2 = `${a2}x ${k2 < 0 ? "−" : "+"} ${Math.abs(k2)}`;
    return {
      prompt: `P lies on the perpendicular bisector of AB. PA = ${e1} and PB = ${e2}. Find PA.`,
      visual: { type: "geo", showLabels: true, points: { A, B, M, P: Pp }, segments: [{ from: "A", to: "B" }, { from: "P", to: "M" }, { from: "P", to: "A", label: e1 }, { from: "P", to: "B", label: e2 }, { from: "A", to: "M", tick: 1 }, { from: "M", to: "B", tick: 1 }], angles: [{ at: "M", from: "B", to: "P", right: true }] },
      answer: num(L),
      hints: ["Points on a perpendicular bisector are equidistant from the endpoints, so PA = PB.", `Solve ${e1} = ${e2}, then substitute x into ${e1}.`],
      steps: [st("Use the perpendicular bisector theorem.", `PA = PB, so ${e1} = ${e2}.`), st("Solve for x.", `${a1 > a2 ? `${a1 - a2 === 1 ? "" : a1 - a2}x = ${k2 - k1}` : `${k1 - k2} = ${a2 - a1 === 1 ? "" : a2 - a1}x`}, so x = ${x}`), st("Find PA.", `PA = ${a1}(${x}) ${k1 < 0 ? "−" : "+"} ${Math.abs(k1)} = ${L}`), st("Check.", `PB = ${a2}(${x}) ${k2 < 0 ? "−" : "+"} ${Math.abs(k2)} = ${L} ✓`)],
      traps: traps(frac(L), [trap(x, "That's x. Substitute it to find PA.")]),
    };
  },
};

// ---------- 6. Triangle angle theorems ----------
const triangleAngles: Skill = {
  id: "m2.cong.triangle-angles",
  title: "Triangle angle sum and exterior angles",
  topic: T,
  standards: ["NC.M2.G-CO.10"],
  prereqs: ["m2.cong.parallel-lines"],
  lesson: {
    bigIdea: "The angles of a triangle add to 180°. An exterior angle equals the sum of the two remote (non-adjacent) interior angles.",
    explain: [
      "Why 180°: draw a line through one vertex parallel to the opposite side. Alternate interior angles copy the other two angles up to that vertex, where all three sit side by side on a straight line.",
      "Exterior angle: extend side BC past C to point X. ∠ACX and ∠ACB form a linear pair, and ∠A + ∠B + ∠ACB = 180°, so **∠ACX = ∠A + ∠B**.",
      "Worked example: ∠A = 48° and ∠B = 67°. Then ∠C = 180° − 48° − 67° = 65°, and the exterior angle at C is 48° + 67° = **115°**.",
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 2.5, y: 4 }, B: { x: 0, y: 0 }, C: { x: 6, y: 0 }, X: { x: 9, y: 0 } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "X", dashed: true }], angles: [{ at: "C", from: "X", to: "A", label: "exterior" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does an exterior angle equal the sum of the two remote interior angles?", choices: ["Both the exterior angle and the two remote angles combine with the same interior angle to make 180°.", "Because exterior angles are always obtuse.", "Because the exterior angle is vertical to the interior angle.", "Because all three interior angles are equal."], correct: 0, explain: "Exterior + adjacent interior = 180° and remote1 + remote2 + adjacent interior = 180°, so exterior = remote1 + remote2." },
    { kind: "written", prompt: "Explain why a triangle can't have two obtuse angles.", keyIdeas: ["an obtuse angle is more than 90°", "two of them would add to more than 180°", "but all three angles must add to exactly 180°"], exemplar: "An obtuse angle is more than 90°, so two obtuse angles would already add to more than 180°. The three angles of a triangle add to exactly 180°, so there's no room: a triangle can have at most one obtuse angle." },
  ],
  generate(r, lv) {
    const A = r.int(35, 80), B = r.int(35, 80);
    const C = 180 - A - B;
    const t = triFromAngles(B, C, 7); // B at origin, C on axis, A apex.
    const pts = { B: t[0], C: t[1], A: t[2], X: { x: t[1].x + 3, y: 0 } };
    if (lv === 1) {
      return {
        prompt: `In triangle ABC, m∠A = ${A}° and m∠B = ${B}°. Find m∠C.`,
        visual: { type: "geo", showLabels: true, points: { A: pts.A, B: pts.B, C: pts.C }, polygons: [["A", "B", "C"]], angles: [{ at: "A", from: "B", to: "C", label: `${A}°` }, { at: "B", from: "C", to: "A", label: `${B}°` }, { at: "C", from: "A", to: "B", label: "?" }] },
        answer: num(C, { unit: "°" }),
        hints: ["The three angles of a triangle add to 180°.", `m∠C = 180° − ${A}° − ${B}°.`],
        steps: [st("Use the triangle angle sum.", `${A}° + ${B}° + m∠C = 180°`), st("Solve.", `m∠C = 180° − ${A + B}° = ${C}°`)],
        traps: traps(frac(C), [trap(360 - A - B, "Triangles add to 180°, not 360°."), trap(A + B, "That's the exterior angle at C, not the interior angle.")]),
      };
    }
    if (lv === 2) {
      const ext = A + B;
      const askRemote = r.chance(0.5);
      return askRemote
        ? {
            prompt: `The exterior angle at C measures ${ext}° and m∠A = ${A}°. Find m∠B.`,
            visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "X", dashed: true }], angles: [{ at: "C", from: "X", to: "A", label: `${ext}°` }, { at: "A", from: "B", to: "C", label: `${A}°` }, { at: "B", from: "C", to: "A", label: "?" }] },
            answer: num(B, { unit: "°" }),
            hints: ["The exterior angle equals the sum of the two remote interior angles: ∠A and ∠B.", `${ext}° = ${A}° + m∠B.`],
            steps: [st("Use the exterior angle theorem.", `m∠A + m∠B = ${ext}°`), st("Solve.", `m∠B = ${ext}° − ${A}° = ${B}°`)],
            traps: traps(frac(B), [trap(180 - ext, "That's ∠ACB, the interior angle next to the exterior angle."), trap(180 - A - ext, "The exterior angle isn't part of the triangle's 180°.")]),
          }
        : {
            prompt: `In triangle ABC, m∠A = ${A}° and m∠B = ${B}°. Side BC is extended to X. Find m∠ACX.`,
            visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "X", dashed: true }], angles: [{ at: "C", from: "X", to: "A", label: "?" }, { at: "A", from: "B", to: "C", label: `${A}°` }, { at: "B", from: "C", to: "A", label: `${B}°` }] },
            answer: num(ext, { unit: "°" }),
            hints: ["∠ACX is an exterior angle of the triangle.", "An exterior angle equals the sum of the two remote interior angles."],
            steps: [st("Use the exterior angle theorem.", `m∠ACX = m∠A + m∠B`), st("Add.", `${A}° + ${B}° = ${ext}°`)],
            traps: traps(frac(ext), [trap(C, "That's the interior angle at C. The exterior angle is its supplement.")]),
          };
    }
    // Level 3: algebra.
    let x: number, p: number, q: number, s: number, c1: number, c2: number, c3: number;
    for (;;) {
      x = r.int(10, 30); p = r.int(1, 3); q = r.int(2, 4); s = r.int(1, 3);
      c1 = r.int(-15, 20); c2 = r.int(-15, 20);
      c3 = 180 - (p + q + s) * x - c1 - c2;
      const angs = [p * x + c1, q * x + c2, s * x + c3];
      if (angs.every((a) => a >= 20 && a <= 120) && Math.abs(c3) <= 40) break;
    }
    const angs = [p * x + c1, q * x + c2, s * x + c3];
    const ex = (a: number, c: number) => `${a === 1 ? "" : a}x${c === 0 ? "" : c < 0 ? " − " + -c : " + " + c}`;
    const es = [ex(p, c1), ex(q, c2), ex(s, c3)];
    const big = Math.max(...angs);
    const t3 = triFromAngles(angs[1], angs[2], 7);
    return {
      prompt: `The angles of triangle ABC measure m∠A = (${es[0]})°, m∠B = (${es[1]})° and m∠C = (${es[2]})°. Find the measure of the largest angle.`,
      visual: { type: "geo", showLabels: true, points: { B: t3[0], C: t3[1], A: t3[2] }, polygons: [["A", "B", "C"]], angles: [{ at: "A", from: "B", to: "C", label: `(${es[0]})°` }, { at: "B", from: "C", to: "A", label: `(${es[1]})°` }, { at: "C", from: "A", to: "B", label: `(${es[2]})°` }] },
      answer: num(big, { unit: "°" }),
      hints: ["Add the three expressions and set the total equal to 180.", `${p + q + s}x ${c1 + c2 + c3 < 0 ? "−" : "+"} ${Math.abs(c1 + c2 + c3)} = 180. Solve for x, then evaluate each angle.`],
      steps: [
        st("Use the angle sum.", `(${es[0]}) + (${es[1]}) + (${es[2]}) = 180`),
        st("Combine like terms.", `${p + q + s}x ${c1 + c2 + c3 < 0 ? "−" : "+"} ${Math.abs(c1 + c2 + c3)} = 180`),
        st("Solve.", `${p + q + s}x = ${180 - c1 - c2 - c3}, so x = ${x}`),
        st("Evaluate each angle.", `∠A = ${angs[0]}°, ∠B = ${angs[1]}°, ∠C = ${angs[2]}° (check: they add to 180°)`),
        st("Pick the largest.", `${big}°`),
      ],
      traps: traps(frac(big), [trap(x, "That's x. Substitute it to find the angles."), trap(Math.min(...angs), "That's the smallest angle.")]),
    };
  },
};

// ---------- 7. Isosceles triangles and midsegments ----------
const isoMid: Skill = {
  id: "m2.cong.isosceles-midsegment",
  title: "Isosceles triangles and midsegments",
  topic: T,
  standards: ["NC.M2.G-CO.10"],
  prereqs: ["m2.cong.triangle-angles"],
  lesson: {
    bigIdea: "The base angles of an isosceles triangle are congruent. A midsegment (joining the midpoints of two sides) is parallel to the third side and half as long.",
    explain: [
      "Isosceles: if AB ≅ AC, then ∠B ≅ ∠C. With a vertex angle of 40°, each base angle is (180° − 40°) ÷ 2 = **70°**.",
      "Midsegment: if D is the midpoint of AB and E is the midpoint of AC, then DE ∥ BC and DE = ½BC. If BC = 18, then DE = 9.",
      "With algebra: DE = 2x + 1 and BC = 5x − 4 means 2(2x + 1) = 5x − 4, so 4x + 2 = 5x − 4 and x = 6. Then DE = 13 and BC = 26.",
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 3, y: 5 }, B: { x: 0, y: 0 }, C: { x: 8, y: 0 }, D: { x: 1.5, y: 2.5 }, E: { x: 5.5, y: 2.5 } }, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E" }, { from: "A", to: "D", tick: 1 }, { from: "D", to: "B", tick: 1 }, { from: "A", to: "E", tick: 2 }, { from: "E", to: "C", tick: 2 }] },
  },
  why: [
    { kind: "choice", prompt: "Why are the base angles of an isosceles triangle congruent?", choices: ["The line from the vertex to the midpoint of the base splits it into two triangles congruent by SSS, so the base angles are corresponding parts.", "Because all angles in a triangle are equal.", "Because the base is the longest side.", "Because the vertex angle is always 90°."], correct: 0, explain: "AB ≅ AC, BM ≅ CM and AM is shared, so ΔABM ≅ ΔACM and ∠B ≅ ∠C." },
    { kind: "written", prompt: "Explain why a midsegment is half as long as the third side, using a dilation.", keyIdeas: ["a dilation centered at A with scale factor ½ sends B to D and C to E", "dilations multiply lengths by the scale factor", "so DE = ½ BC (and DE ∥ BC because dilations send lines to parallel lines)"], exemplar: "Dilate triangle ABC from A with scale factor ½. B goes halfway to A, which is D, and C goes to E. A dilation multiplies every length by ½, so DE = ½BC, and it sends BC to a parallel segment, so DE ∥ BC." },
  ],
  generate(r, lv) {
    const mode = lv === 1 ? "iso" : lv === 2 ? r.pick(["iso2", "mid"]) : r.pick(["midx", "isox"]);
    if (mode === "iso" || mode === "iso2") {
      const base = r.int(25, 80);
      const vert = 180 - 2 * base;
      const t = triFromAngles(base, base, 7);
      const pts = { B: t[0], C: t[1], A: t[2] };
      const givenVert = mode === "iso";
      return {
        prompt: givenVert ? `In triangle ABC, AB = AC and the vertex angle ∠A measures ${vert}°. Find m∠B.` : `In triangle ABC, AB = AC and base angle ∠B measures ${base}°. Find m∠A.`,
        visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "B", tick: 1 }, { from: "A", to: "C", tick: 1 }], angles: givenVert ? [{ at: "A", from: "B", to: "C", label: `${vert}°` }, { at: "B", from: "C", to: "A", label: "?" }] : [{ at: "B", from: "C", to: "A", label: `${base}°` }, { at: "A", from: "B", to: "C", label: "?" }] },
        answer: num(givenVert ? base : vert, { unit: "°" }),
        hints: ["The angles opposite the congruent sides (the base angles ∠B and ∠C) are congruent.", givenVert ? `The base angles share what's left: (180° − ${vert}°) ÷ 2.` : `∠C is also ${base}°. Subtract both from 180°.`],
        steps: givenVert
          ? [st("Base angles are congruent.", "m∠B = m∠C"), st("Use the angle sum.", `2 · m∠B = 180° − ${vert}° = ${180 - vert}°`), st("Divide.", `m∠B = ${base}°`)]
          : [st("Base angles are congruent.", `m∠C = m∠B = ${base}°`), st("Use the angle sum.", `m∠A = 180° − 2(${base}°) = ${vert}°`)],
        traps: givenVert ? traps(frac(base), [trap(180 - vert, "Two base angles share that amount; divide by 2."), trap(vert, "∠B is a base angle, not the vertex angle.")]) : traps(frac(vert), [trap(180 - base, "Subtract BOTH base angles from 180°."), trap(base, "∠A is the vertex angle; it isn't congruent to the base angles here.")]),
      };
    }
    const angB = r.int(50, 75), angC = r.int(45, 70);
    const t = triFromAngles(angB, angC, 8);
    const [B, C, A] = t;
    const mid = (p: P, q: P) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
    const pts = { A, B, C, D: mid(A, B), E: mid(A, C) };
    const segs = [{ from: "D", to: "E" }, { from: "A", to: "D", tick: 1 as const }, { from: "D", to: "B", tick: 1 as const }, { from: "A", to: "E", tick: 2 as const }, { from: "E", to: "C", tick: 2 as const }];
    if (mode === "mid") {
      const bc = 2 * r.int(5, 18);
      const askDE = r.chance(0.5);
      const ans = askDE ? bc / 2 : bc;
      return {
        prompt: askDE ? `D and E are the midpoints of AB and AC. BC = ${bc}. Find DE.` : `D and E are the midpoints of AB and AC. DE = ${bc / 2}. Find BC.`,
        visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"]], segments: [...segs.slice(0, 1).map((s) => ({ ...s, label: askDE ? "?" : String(bc / 2) })), ...segs.slice(1), { from: "B", to: "C", label: askDE ? String(bc) : "?" }] },
        answer: num(ans),
        hints: ["DE is a midsegment: it joins the midpoints of two sides.", "A midsegment is half as long as the third side."],
        steps: [st("Use the midsegment theorem.", "DE = ½ BC"), st("Compute.", askDE ? `DE = ½(${bc}) = ${bc / 2}` : `BC = 2(${bc / 2}) = ${bc}`)],
        traps: traps(frac(ans), [trap(askDE ? bc * 2 : bc / 4, askDE ? "The midsegment is half the third side, not double." : "BC is double the midsegment, not half.")]),
      };
    }
    if (mode === "midx") {
      let x: number, a: number, b: number, c: number, d: number;
      for (;;) {
        x = r.int(3, 10); a = r.int(1, 4); c = r.int(2, 7);
        if (c === 2 * a) continue;
        b = r.int(-6, 9);
        d = 2 * (a * x + b) - c * x;
        if (a * x + b > 2 && Math.abs(d) <= 25 && d !== 0) break;
      }
      const de = a * x + b, bc = 2 * de;
      const e1 = `${a === 1 ? "" : a}x${b === 0 ? "" : b < 0 ? " − " + -b : " + " + b}`, e2 = `${c}x ${d < 0 ? "−" : "+"} ${Math.abs(d)}`;
      return {
        prompt: `D and E are midpoints of AB and AC. DE = ${e1} and BC = ${e2}. Find BC.`,
        visual: { type: "geo", showLabels: true, points: pts, polygons: [["A", "B", "C"]], segments: [{ from: "D", to: "E", label: e1 }, ...segs.slice(1), { from: "B", to: "C", label: e2 }] },
        answer: num(bc),
        hints: ["The midsegment is half the third side, so BC = 2 · DE.", `2(${e1}) = ${e2}. Solve for x, then evaluate BC.`],
        steps: [st("Use the midsegment theorem.", `BC = 2 · DE, so ${e2} = 2(${e1})`), st("Distribute and solve.", `${c}x ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${2 * a}x ${2 * b < 0 ? "−" : "+"} ${Math.abs(2 * b)}, so x = ${x}`), st("Evaluate BC.", `BC = ${c}(${x}) ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${bc}`), st("Check.", `DE = ${de}, which is half of ${bc} ✓`)],
        traps: traps(frac(bc), [trap(de, "That's DE. The question asks for BC."), trap(x, "That's x. Substitute it into the expression for BC.")]),
      };
    }
    // isox: base angles as expressions.
    let x: number, a: number, b: number, c: number, d: number;
    for (;;) {
      x = r.int(5, 20); a = r.int(2, 5); c = r.int(1, 4);
      if (a === c) continue;
      const base = r.int(30, 75);
      b = base - a * x; d = base - c * x;
      if (b !== 0 && d !== 0 && Math.abs(b) <= 40 && Math.abs(d) <= 40) break;
    }
    const base = a * x + b, vert = 180 - 2 * base;
    const tt = triFromAngles(base, base, 7);
    const e1 = `${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, e2 = `${c === 1 ? "" : c}x ${d < 0 ? "−" : "+"} ${Math.abs(d)}`;
    return {
      prompt: `In triangle ABC, AB = AC, m∠B = (${e1})° and m∠C = (${e2})°. Find m∠A.`,
      visual: { type: "geo", showLabels: true, points: { B: tt[0], C: tt[1], A: tt[2] }, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "B", tick: 1 }, { from: "A", to: "C", tick: 1 }], angles: [{ at: "B", from: "C", to: "A", label: `(${e1})°` }, { at: "C", from: "A", to: "B", label: `(${e2})°` }] },
      answer: num(vert, { unit: "°" }),
      hints: ["The base angles of an isosceles triangle are congruent, so set the expressions equal.", "Find x, then each base angle, then subtract both from 180°."],
      steps: [st("Base angles are congruent.", `${e1} = ${e2}`), st("Solve.", `x = ${x}`), st("Find a base angle.", `m∠B = ${a}(${x}) ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${base}°`), st("Use the angle sum.", `m∠A = 180° − 2(${base}°) = ${vert}°`)],
      traps: traps(frac(vert), [trap(base, "That's a base angle. ∠A is the vertex angle."), trap(x, "That's x, not an angle measure."), trap(180 - base, "Subtract BOTH base angles.")]),
    };
  },
};

// ---------- 8. Two-column proofs ----------
interface ProofT {
  given: string;
  prove: string;
  rows: [string, string][];
  visual: Visual;
  decoys: string[];
}
const PROOFS: ProofT[] = [
  {
    given: "M is the midpoint of AB and of CD.",
    prove: "ΔAMC ≅ ΔBMD",
    rows: [
      ["M is the midpoint of AB and CD", "Given"],
      ["AM ≅ BM and CM ≅ DM", "Definition of midpoint"],
      ["∠AMC ≅ ∠BMD", "Vertical angles are congruent"],
      ["ΔAMC ≅ ΔBMD", "SAS"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: -4, y: 2 }, B: { x: 4, y: -2 }, C: { x: -3, y: -3 }, D: { x: 3, y: 3 }, M: { x: 0, y: 0 } }, polygons: [["A", "M", "C"], ["B", "M", "D"]], segments: [{ from: "A", to: "B" }, { from: "C", to: "D" }] },
    decoys: ["AM ≅ CM and BM ≅ DM", "∠AMC ≅ ∠AMD", "∠MAC ≅ ∠MDB", "AC ≅ CD"],
  },
  {
    given: "AB ≅ CB and BD bisects ∠ABC.",
    prove: "ΔABD ≅ ΔCBD",
    rows: [
      ["AB ≅ CB", "Given"],
      ["BD bisects ∠ABC", "Given"],
      ["∠ABD ≅ ∠CBD", "Definition of angle bisector"],
      ["BD ≅ BD", "Reflexive property"],
      ["ΔABD ≅ ΔCBD", "SAS"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: -3, y: 0 }, B: { x: 0, y: 5 }, C: { x: 3, y: 0 }, D: { x: 0, y: 0 } }, polygons: [["A", "B", "C"]], segments: [{ from: "B", to: "D" }, { from: "A", to: "B", tick: 1 }, { from: "C", to: "B", tick: 1 }] },
    decoys: ["AD ≅ BD", "∠BAD ≅ ∠ABD", "∠ABD ≅ ∠BDC", "AB ≅ AD"],
  },
  {
    given: "AB ∥ DC and AB ≅ DC.",
    prove: "ΔABC ≅ ΔCDA",
    rows: [
      ["AB ∥ DC", "Given"],
      ["∠BAC ≅ ∠DCA", "Alternate interior angles are congruent"],
      ["AB ≅ CD", "Given"],
      ["AC ≅ CA", "Reflexive property"],
      ["ΔABC ≅ ΔCDA", "SAS"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 8, y: 4 }, D: { x: 2, y: 4 } }, polygons: [["A", "B", "C", "D"]], segments: [{ from: "A", to: "C" }] },
    decoys: ["∠BAC ≅ ∠BCA", "∠ABC ≅ ∠DCA", "AB ≅ AC", "AD ≅ AC"],
  },
  {
    given: "AB ≅ AC and M is the midpoint of BC.",
    prove: "∠B ≅ ∠C",
    rows: [
      ["AB ≅ AC", "Given"],
      ["M is the midpoint of BC", "Given"],
      ["BM ≅ CM", "Definition of midpoint"],
      ["AM ≅ AM", "Reflexive property"],
      ["ΔABM ≅ ΔACM", "SSS"],
      ["∠B ≅ ∠C", "Corresponding parts of congruent triangles are congruent (CPCTC)"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 0, y: 5 }, B: { x: -3, y: 0 }, C: { x: 3, y: 0 }, M: { x: 0, y: 0 } }, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "M" }] },
    decoys: ["AB ≅ BC", "∠BAM ≅ ∠B", "AB ≅ AM", "BM ≅ AM"],
  },
  {
    given: "∠A ≅ ∠D, ∠B ≅ ∠E, and BC ≅ EF.",
    prove: "AC ≅ DF",
    rows: [
      ["∠A ≅ ∠D and ∠B ≅ ∠E", "Given"],
      ["BC ≅ EF", "Given"],
      ["ΔABC ≅ ΔDEF", "AAS"],
      ["AC ≅ DF", "Corresponding parts of congruent triangles are congruent (CPCTC)"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 0, y: 0 }, B: { x: 6, y: 0 }, C: { x: 2, y: 4 }, D: { x: 9, y: 0 }, E: { x: 15, y: 0 }, F: { x: 11, y: 4 } }, polygons: [["A", "B", "C"], ["D", "E", "F"]] },
    decoys: ["ΔABC ≅ ΔEDF", "ΔABC ≅ ΔDFE", "ΔACB ≅ ΔDEF", "AC ≅ EF"],
  },
  {
    given: "Line ℓ through B is parallel to AC, making ∠1 (left of B) and ∠2 (right of B) with sides BA and BC.",
    prove: "m∠A + m∠ABC + m∠C = 180°",
    rows: [
      ["ℓ ∥ AC", "Given"],
      ["∠1 ≅ ∠A and ∠2 ≅ ∠C", "Alternate interior angles are congruent"],
      ["m∠1 + m∠ABC + m∠2 = 180°", "Angles that form a straight line add to 180°"],
      ["m∠A + m∠ABC + m∠C = 180°", "Substitution"],
    ],
    visual: { type: "geo", showLabels: true, points: { A: { x: 0, y: 0 }, C: { x: 8, y: 0 }, B: { x: 3, y: 4 }, P: { x: -1, y: 4 }, Q: { x: 7, y: 4 } }, polygons: [["A", "B", "C"]], segments: [{ from: "P", to: "Q" }], angles: [{ at: "B", from: "P", to: "A", label: "1" }, { at: "B", from: "C", to: "Q", label: "2" }] },
    decoys: ["∠1 ≅ ∠C and ∠2 ≅ ∠A", "∠1 ≅ ∠2", "m∠1 + m∠2 = 90°", "m∠A + m∠C = 180°"],
  },
];
const REASONS = ["Given", "Definition of midpoint", "Vertical angles are congruent", "SAS", "SSS", "ASA", "AAS", "Reflexive property", "Definition of angle bisector", "Alternate interior angles are congruent", "Corresponding angles are congruent", "Corresponding parts of congruent triangles are congruent (CPCTC)", "Angles that form a straight line add to 180°", "Substitution", "Linear pairs are supplementary"];

const proofSteps: Skill = {
  id: "m2.cong.proofs",
  title: "Reasoning in two-column proofs",
  topic: T,
  standards: ["NC.M2.G-CO.8", "NC.M2.G-CO.9", "NC.M2.G-CO.10"],
  prereqs: ["m2.cong.criteria", "m2.cong.parallel-lines"],
  lesson: {
    bigIdea: "A proof is a chain of statements, each justified by a given fact, a definition, a postulate or a theorem already proved.",
    explain: [
      "Common reasons: Given; definition of midpoint (splits a segment into two congruent parts); definition of angle bisector; reflexive property (a segment is congruent to itself, like a shared side); vertical angles are congruent; alternate interior angles are congruent (parallel lines); a congruence criterion (SSS, SAS, ASA, AAS, HL); CPCTC.",
      "Worked example. Given: M is the midpoint of AB and CD. Prove: ΔAMC ≅ ΔBMD. (1) M is the midpoint of AB and CD: Given. (2) AM ≅ BM, CM ≅ DM: definition of midpoint. (3) ∠AMC ≅ ∠BMD: vertical angles. (4) ΔAMC ≅ ΔBMD: **SAS** (the angle is between the two sides).",
      "CPCTC comes after the triangles are proved congruent; it's how you get to a single pair of sides or angles.",
    ],
    visual: PROOFS[0].visual,
  },
  why: [
    { kind: "choice", prompt: "In a proof, why can't you use CPCTC before proving two triangles congruent?", choices: ["CPCTC says parts of congruent triangles match, so you must first know the triangles are congruent.", "CPCTC only works for right triangles.", "You can use it anytime the triangles look the same.", "CPCTC is the same as SAS."], correct: 0, explain: "Using it first would assume what you're trying to prove." },
    { kind: "written", prompt: "Two triangles share side XY. Explain why you can write XY ≅ XY in a proof and what reason you give.", keyIdeas: ["the side belongs to both triangles", "any segment is congruent to itself", "the reason is the reflexive property"], exemplar: "The shared side is part of both triangles, so it gives a pair of congruent sides for free. Any segment is congruent to itself, and the reason is the reflexive property of congruence." },
  ],
  generate(r, lv) {
    const pf = r.pick(PROOFS);
    const askStatement = lv === 3;
    // Level 1: ask about a non-final step; level 2: the final or criterion step.
    const finalIdx = pf.rows.findIndex((row) => ["SAS", "SSS", "ASA", "AAS"].includes(row[1]));
    let k: number;
    if (lv === 1) {
      const cands = pf.rows.map((_, i) => i).filter((i) => pf.rows[i][1] !== "Given" && i !== finalIdx);
      k = r.pick(cands.length ? cands : [pf.rows.length - 1]);
    } else if (lv === 2) k = finalIdx >= 0 ? finalIdx : pf.rows.length - 1;
    else {
      const cands = pf.rows.map((_, i) => i).filter((i) => pf.rows[i][1] !== "Given" && i < pf.rows.length - 1);
      k = r.pick(cands);
    }
    const table = pf.rows.map((row, i) => (i === k ? (askStatement ? ["?", row[1]] : [row[0], "?"]) : row));
    if (askStatement) {
      const correct = pf.rows[k][0];
      const wrong = r.shuffle(pf.decoys).slice(0, 3).map((x) => [x, `“${pf.rows[k][1]}” doesn't give you that statement here. Check it against the figure and the earlier steps.`] as [string, string]);
      return {
        prompt: `Given: ${pf.given} Prove: ${pf.prove}. Which statement belongs in step ${k + 1}?`,
        visual: { type: "table", headers: ["Step", "Statement", "Reason"], rows: table.map((row, i) => [i + 1, row[0], row[1]]) },
        answer: choice(r, correct, wrong),
        hints: [`Read the reason for step ${k + 1}: “${pf.rows[k][1]}.” What statement does that reason justify here?`, "Look at the figure and the steps before and after it. The statement should lead toward what you are proving."],
        steps: [st(`Step ${k + 1}.`, `${correct} (${pf.rows[k][1]})`), st("Whole proof.", pf.rows.map((x, i) => `(${i + 1}) ${x[0]}: ${x[1]}`).join("; "))],
      };
    }
    const correct = pf.rows[k][1];
    const wrong = r.shuffle(REASONS.filter((x) => x !== correct)).slice(0, 3).map((x) => [x, x === "Given" ? "That fact isn't stated in the Given; it has to be justified." : `“${x}” doesn't justify “${pf.rows[k][0]}.”`] as [string, string]);
    return {
      prompt: `Given: ${pf.given} Prove: ${pf.prove}. Which reason justifies step ${k + 1}, “${pf.rows[k][0]}”?`,
      visual: { type: "table", headers: ["Step", "Statement", "Reason"], rows: table.map((row, i) => [i + 1, row[0], row[1]]) },
      answer: choice(r, correct, wrong),
      hints: [`What fact or theorem lets you say “${pf.rows[k][0]}”? Look at what earlier steps give you.`, ["SAS", "SSS", "ASA", "AAS"].includes(correct) ? "List the three pairs of parts proved congruent so far, in order around the triangle." : "Is it a definition (midpoint, bisector), a property (reflexive), or a theorem (vertical angles, parallel lines, CPCTC)?"],
      steps: [st(`Step ${k + 1}.`, `${pf.rows[k][0]}: ${correct}.`), st("Whole proof.", pf.rows.map((x, i) => `(${i + 1}) ${x[0]}: ${x[1]}`).join("; "))],
    };
  },
};

const skills: Skill[] = [rigidCongruence, corresponding, criteria, parallelAngles, bisectors, triangleAngles, isoMid, proofSteps];
export default skills;
export { angleAt, turnRight, PRIME };
