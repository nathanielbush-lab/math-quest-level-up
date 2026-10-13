// Unit 8: Law of Sines and Law of Cosines (PC.F.3.2).
import { ms, num, trap } from "../helpers";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { DEG, f1, rad, degOf, round, trapsTol, triangleFig } from "./util";

const T = "pc-triangles";
const TOL = 0.1;
const ans1 = (v: number, unit = "") => num(round(v, 1), { tolerance: TOL, unit });
const sinD = (d: number) => Math.sin(rad(d));
const cosD = (d: number) => Math.cos(rad(d));

/** SAS figure: sides p (CB) and q (CA) around angle C. */
function sasFig(p: number, q: number, C: number, pl: string, ql: string, opp: string): Visual {
  return { type: "geo", showLabels: true, points: { C: { x: 0, y: 0 }, B: { x: p, y: 0 }, A: { x: q * cosD(C), y: q * sinD(C) } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "B", label: pl }, { from: "C", to: "A", label: ql }, { from: "A", to: "B", label: opp }], angles: [{ at: "C", from: "B", to: "A", label: `${C}°` }] };
}

/** Coordinates-based figure from three sides (a opposite A, etc.). */
function figSSS(a: number, b: number, c: number, labels: Parameters<typeof triangleFig>[3]): Visual {
  const A = degOf(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  return triangleFig(b, c, A, labels);
}

const sinesSide: Skill = {
  id: "pc.triangles.sines-side",
  title: "Law of Sines: find a side",
  topic: T,
  standards: ["PC.F.3.2"],
  prereqs: [],
  lesson: {
    bigIdea: "In any triangle, each side divided by the sine of its opposite angle gives the same number: {a/sin A} = {b/sin B} = {c/sin C}.",
    explain: [
      "Use it when you know an angle and its opposite side, plus one more angle or side (AAS or ASA).",
      "A = 40°, B = 75°, a = 12. Find b: {b/sin 75°} = {12/sin 40°}, so b = {12 sin 75°/sin 40°} ≈ **18.0**.",
      "For ASA (two angles and the side between them), first find the third angle: the angles add to 180°.",
    ],
    visual: triangleFig(18.03, 16.94, 40, { A: "40°", B: "75°", a: "12", b: "b" }),
    tip: "Make sure your calculator is in degree mode for these problems.",
  },
  why: [
    { kind: "choice", prompt: "Why does the Law of Sines need a side AND its opposite angle?", choices: ["That pair gives the common ratio a/sin A; without a complete pair, every ratio has an unknown.", "Because sines only work for opposite angles.", "It doesn't; any two sides are enough.", "Because the triangle must be right."], correct: 0, explain: "The law says all three ratios are equal. You need one ratio you can compute to set up an equation for the unknown." },
    { kind: "written", prompt: "Explain where the Law of Sines comes from, using the height h drawn from C to side c.", keyIdeas: ["h = b sin A from one right triangle", "h = a sin B from the other", "so b sin A = a sin B", "divide to get a/sin A = b/sin B"], exemplar: "The height from C splits the triangle into two right triangles. In one, h = b sin A; in the other, h = a sin B. Both equal h, so b sin A = a sin B, which rearranges to a/sin A = b/sin B." },
  ],
  generate(r, lv) {
    const A = r.int(30, 80), B = r.int(35, Math.min(110, 150 - A)), C = 180 - A - B;
    const ratio = lv === 3 ? r.int(8, 24) / sinD(C) : r.int(6, 20) / sinD(A);
    const a = ratio * sinD(A), c = ratio * sinD(C);
    if (lv < 3) {
      const aa = Math.round(a);
      const bb = (aa * sinD(B)) / sinD(A);
      const cc = (aa * sinD(C)) / sinD(A);
      return {
        prompt: `In triangle ABC, A = ${A}${DEG}, B = ${B}${DEG} and a = ${aa}. Find b to the nearest tenth.`,
        visual: triangleFig(bb, cc, A, { A: `${A}°`, B: `${B}°`, a: String(aa), b: "b" }),
        answer: ans1(bb),
        hints: ["You know A and its opposite side a: that's a complete pair for the Law of Sines.", `{b/sin ${B}°} = {${aa}/sin ${A}°}. Multiply both sides by sin ${B}°.`],
        steps: [st("Set up the Law of Sines.", `{b/sin ${B}°} = {${aa}/sin ${A}°}`), st("Solve for b.", `b = {${aa} sin ${B}°/sin ${A}°} = {${aa}(${sinD(B).toFixed(4)})/${sinD(A).toFixed(4)}} ≈ ${f1(bb)}`)],
        traps: trapsTol(round(bb, 1), TOL, [trap(round((aa * sinD(A)) / sinD(B), 1), "The fraction is upside down: b = a · sin B ÷ sin A."), trap(round((aa * Math.sin(B)) / Math.sin(A), 1), "Your calculator is in radian mode. Switch to degrees.")]),
      };
    }
    const cc = Math.round(c);
    const aa = (cc * sinD(A)) / sinD(C);
    return {
      prompt: `In triangle ABC, A = ${A}${DEG}, B = ${B}${DEG} and the side between them is c = ${cc}. Find a to the nearest tenth.`,
      visual: triangleFig((cc * sinD(B)) / sinD(C), cc, A, { A: `${A}°`, B: `${B}°`, c: String(cc), a: "a" }),
      answer: ans1(aa),
      hints: ["You don't know an angle with its opposite side yet. Find angle C first.", `C = 180° − ${A}° − ${B}° = ${C}°, and c = ${cc} is opposite it.`, `{a/sin ${A}°} = {${cc}/sin ${C}°}.`],
      steps: [st("Third angle.", `C = 180° − ${A}° − ${B}° = ${C}°`), st("Law of Sines.", `{a/sin ${A}°} = {${cc}/sin ${C}°}`), st("Solve.", `a = {${cc} sin ${A}°/sin ${C}°} ≈ ${f1(aa)}`)],
      traps: trapsTol(round(aa, 1), TOL, [trap(round((cc * sinD(A)) / sinD(B), 1), "c is opposite C, not B. Find C first."), trap(round((cc * sinD(C)) / sinD(A), 1), "The fraction is upside down.")]),
    };
  },
};

const sinesAngle: Skill = {
  id: "pc.triangles.sines-angle",
  title: "Law of Sines: find an angle (and the ambiguous case)",
  topic: T,
  standards: ["PC.F.3.2"],
  prereqs: ["pc.triangles.sines-side"],
  lesson: {
    bigIdea: "To find an angle, solve {sin B/b} = {sin A/a} for sin B and use inverse sine. With SSA, watch out: there may be two triangles, one, or none.",
    explain: [
      "a = 10, b = 7, A = 50°: sin B = {7 sin 50°/10} ≈ 0.536, so B ≈ **32.4°**. Since a > b, B must be smaller than A, so there's only one triangle.",
      "The ambiguous case: if a < b, the obtuse angle 180° − B might also work. With A = 30°, b = 10: the height is h = 10 sin 30° = 5.",
      "a < 5: side a can't reach, **no triangle**. 5 < a < 10: a can swing to two spots, **two triangles**. a ≥ 10: **one triangle**.",
    ],
    tip: "sin B = 1.2 has no solution: that's how the algebra tells you no triangle exists.",
  },
  why: [
    { kind: "choice", prompt: "Why can SSA give two different triangles?", choices: ["sin B = k has two solutions between 0° and 180° (B and 180° − B), and both may fit with angle A.", "Because the Law of Sines is approximate.", "Because any three measurements give two triangles.", "It can't; SSA always gives one triangle."], correct: 0, explain: "Sine is positive in Quadrants I and II, so an acute B and its supplement have the same sine. If A + (180° − B) < 180°, the obtuse one also makes a triangle." },
    { kind: "written", prompt: "A = 30°, b = 12 and a = 4. Explain why no triangle exists.", keyIdeas: ["height h = b sin A = 6", "side a = 4 is shorter than the height", "it can't reach the other side; sin B = 1.5 > 1"], exemplar: "The distance from C to the line along side c is h = 12 sin 30° = 6. Side a is only 4, so it can't reach that line. The Law of Sines confirms it: sin B = 12 sin 30° ÷ 4 = 1.5, which is impossible." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const A = r.int(35, 110), b = r.int(5, 14);
      const a = b + r.int(2, 8);
      const sB = (b * sinD(A)) / a;
      const B = degOf(Math.asin(sB));
      const C = 180 - A - B;
      const c = (a * sinD(C)) / sinD(A);
      return {
        prompt: `In triangle ABC, a = ${a}, b = ${b} and A = ${A}${DEG}. Find angle B to the nearest tenth of a degree.`,
        visual: triangleFig(b, c, A, { A: `${A}°`, a: String(a), b: String(b), B: "B" }),
        answer: ans1(B, DEG),
        hints: [`{sin B/${b}} = {sin ${A}°/${a}}.`, `sin B = {${b} sin ${A}°/${a}} ≈ ${sB.toFixed(4)}. Use inverse sine.`],
        steps: [st("Law of Sines.", `{sin B/${b}} = {sin ${A}°/${a}}`), st("Solve for sin B.", `sin B = {${b} sin ${A}°/${a}} ≈ ${sB.toFixed(4)}`), st("Inverse sine.", `B ≈ ${f1(B)}°`), st("Only one triangle?", `a > b, so B < A and the obtuse option 180° − B won't fit. One triangle.`)],
        traps: trapsTol(round(B, 1), TOL, [trap(round(180 - B, 1), "That obtuse angle plus A would be more than 180°."), trap(round(degOf(Math.asin(b / a)), 1), "Remember to multiply by sin A.")]),
      };
    }
    const A = r.pick([25, 30, 35, 40, 45]), b = r.int(8, 16);
    const h = b * sinD(A);
    const kind = r.pick([0, 1, 2]);
    const a = kind === 0 ? Math.max(1, Math.ceil(h) - 1 - r.int(0, 1)) : kind === 2 ? r.int(Math.ceil(h + 0.2), b - 1) : b + r.int(1, 4);
    const count = a < h - 1e-9 ? 0 : a < b ? 2 : 1;
    return {
      prompt: `In triangle ABC, A = ${A}${DEG}, b = ${b} and a = ${a}. How many different triangles are possible?`,
      answer: num(count),
      hints: [`Find the height h = b sin A = ${b} sin ${A}° ≈ ${h.toFixed(2)}.`, "Compare a with h and with b: a < h → none; h < a < b → two; a ≥ b → one."],
      steps: [
        st("Height.", `h = ${b} sin ${A}° ≈ ${h.toFixed(2)}`),
        st("Compare.", count === 0 ? `a = ${a} < h, so side a can't reach: sin B = {${b} sin ${A}°/${a}} ≈ ${((b * sinD(A)) / a).toFixed(2)} > 1.` : count === 2 ? `h < a = ${a} < b = ${b}: side a can meet the base at two points (B acute or obtuse).` : `a = ${a} ≥ b = ${b}: only one position works.`),
        st("Number of triangles.", String(count)),
      ],
      traps: [trap(count === 2 ? 1 : 2, count === 2 ? "Check the obtuse option 180° − B: it also fits." : "The second (obtuse) option doesn't fit here.")].filter((t) => t.value.n !== count),
    };
  },
};

const cosinesSide: Skill = {
  id: "pc.triangles.cosines-side",
  title: "Law of Cosines: find a side",
  topic: T,
  standards: ["PC.F.3.2"],
  prereqs: [],
  lesson: {
    bigIdea: "For two sides and the angle between them (SAS): c^2 = a^2 + b^2 − 2ab cos C. It's the Pythagorean Theorem with a correction term.",
    explain: [
      "a = 8, b = 11, C = 52°: c^2 = 64 + 121 − 2(8)(11) cos 52° ≈ 185 − 108.35 = 76.65, so c ≈ **8.8**.",
      "When C = 90°, cos C = 0 and the formula becomes c^2 = a^2 + b^2. When C is obtuse, cos C < 0 and c gets longer than the Pythagorean value.",
    ],
    visual: sasFig(8, 11, 52, "8", "11", "c"),
    tip: "Compute 2ab cos C as one number before subtracting; don't subtract 2ab first.",
  },
  why: [
    { kind: "choice", prompt: "Why is the Law of Cosines needed for SAS instead of the Law of Sines?", choices: ["With SAS you don't know any angle together with its opposite side, so no sine ratio can be computed.", "Because the Law of Sines only works for right triangles.", "Because cosine is more accurate.", "Either law works directly."], correct: 0, explain: "The known angle is between the known sides, so its opposite side is the unknown. The Law of Sines needs a complete side–angle pair." },
    { kind: "written", prompt: "Explain what happens to c^2 = a^2 + b^2 − 2ab cos C when C = 90°, and why that makes sense.", keyIdeas: ["cos 90° = 0", "the formula becomes c^2 = a^2 + b^2", "that's the Pythagorean Theorem for a right triangle"], exemplar: "cos 90° is 0, so the last term disappears and we get c^2 = a^2 + b^2, which is the Pythagorean Theorem. That makes sense because C = 90° makes it a right triangle with hypotenuse c." },
  ],
  generate(r, lv) {
    const a = r.int(4, 20), b = r.int(4, 20);
    const C = lv === 1 ? r.int(35, 85) : lv === 2 ? r.int(20, 150) : r.int(95, 160);
    const c2 = a * a + b * b - 2 * a * b * cosD(C);
    const c = Math.sqrt(c2);
    const vis = sasFig(a, b, C, String(a), String(b), "c");
    return {
      prompt: `In triangle ABC, a = ${a}, b = ${b} and C = ${C}${DEG}. Find c to the nearest tenth.`,
      visual: vis,
      answer: ans1(c),
      hints: ["Two sides and the included angle: use the Law of Cosines.", `c^2 = ${a}^2 + ${b}^2 − 2(${a})(${b}) cos ${C}°.`, `2(${a})(${b}) cos ${C}° ≈ ${ms((2 * a * b * cosD(C)).toFixed(2))}. Subtract it from ${a * a + b * b}, then take the square root.`],
      steps: [
        st("Law of Cosines.", `c^2 = ${a}^2 + ${b}^2 − 2(${a})(${b}) cos ${C}°`),
        st("Compute.", `c^2 = ${a * a + b * b} − ${(2 * a * b * cosD(C)).toFixed(2).replace("-", "(−") + (cosD(C) < 0 ? ")" : "")} ≈ ${c2.toFixed(2)}`),
        st("Square root.", `c ≈ ${f1(c)}`),
      ],
      traps: trapsTol(round(c, 1), TOL, [trap(round(Math.sqrt(a * a + b * b), 1), "That ignores the −2ab cos C term (it's only right for a 90° angle)."), trap(round(Math.sqrt(Math.abs(a * a + b * b - 2 * a * b * Math.cos(C))), 1), "Radian mode! Switch your calculator to degrees."), trap(round(c2, 1), "That's c². Take the square root.")]),
    };
  },
};

const NICE: [number, number, number, number][] = [[3, 5, 7, 120], [7, 8, 13, 120], [5, 8, 7, 60], [3, 8, 7, 60], [8, 5, 7, 60], [8, 15, 13, 60], [16, 10, 14, 60]];

const cosinesAngle: Skill = {
  id: "pc.triangles.cosines-angle",
  title: "Law of Cosines: find an angle",
  topic: T,
  standards: ["PC.F.3.2"],
  prereqs: ["pc.triangles.cosines-side"],
  lesson: {
    bigIdea: "With all three sides (SSS), solve the Law of Cosines for the cosine: cos C = {a^2 + b^2 − c^2/2ab}.",
    explain: [
      "Sides 5, 7, 8. Angle opposite 7: cos θ = {5^2 + 8^2 − 7^2/2(5)(8)} = {40/80} = {1/2}, so θ = **60°**.",
      "A negative cosine means an obtuse angle, and inverse cosine handles that correctly (unlike inverse sine).",
      "Find the largest angle (opposite the longest side) first; then the other two are acute and the Law of Sines is safe.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is it safer to use the Law of Cosines than the Law of Sines to find an obtuse angle?", choices: ["cos is negative for obtuse angles, so arccos gives the right angle; arcsin always returns an acute angle.", "The Law of Sines can't find angles.", "Because cosine is larger than sine.", "Both give the same result every time."], correct: 0, explain: "sin 120° = sin 60°, so arcsin can't tell them apart. cos 120° = −1/2 ≠ cos 60°, so arccos picks the correct one." },
    { kind: "written", prompt: "Sides 4, 5 and 10 are given. Explain what the Law of Cosines tells you when you try to find the largest angle.", keyIdeas: ["cos θ = (16 + 25 − 100)/(40) = −59/40", "that's less than −1", "no angle has that cosine, so no triangle exists (4 + 5 < 10)"], exemplar: "cos θ = (4^2 + 5^2 − 10^2)/(2 · 4 · 5) = −59/40 ≈ −1.48. Cosine can't be less than −1, so there's no such angle. That matches the triangle inequality: 4 + 5 is less than 10, so the sides can't form a triangle." },
  ],
  generate(r, lv) {
    let a: number, b: number, c: number;
    if (lv === 1) {
      // [side, side, opposite side, angle]
      [a, b, c] = r.pick(NICE);
    } else {
      a = r.int(4, 15); b = r.int(4, 15);
      const lo = lv === 3 ? Math.floor(Math.sqrt(a * a + b * b)) + 1 : Math.max(Math.abs(a - b) + 2, Math.max(a, b) - 2);
      c = r.int(Math.min(lo, a + b - 2), a + b - 2);
    }
    const cosC = (a * a + b * b - c * c) / (2 * a * b);
    const C = degOf(Math.acos(cosC));
    return {
      prompt: `A triangle has sides a = ${a}, b = ${b} and c = ${c}. Find angle C (opposite side c) to the nearest tenth of a degree.`,
      visual: figSSS(a, b, c, { a: String(a), b: String(b), c: String(c), C: "C" }),
      answer: ans1(C, DEG),
      hints: [`cos C = {a^2 + b^2 − c^2/2ab}.`, `cos C = {${a * a} + ${b * b} − ${c * c}/2(${a})(${b})} = {${ms(a * a + b * b - c * c)}/${2 * a * b}}. Then use inverse cosine.`],
      steps: [st("Law of Cosines solved for cos C.", `cos C = {${a}^2 + ${b}^2 − ${c}^2/2(${a})(${b})}`), st("Compute.", `cos C = {${ms(a * a + b * b - c * c)}/${2 * a * b}} ≈ ${ms(cosC.toFixed(4))}`), st("Inverse cosine.", `C ≈ ${f1(C)}°${cosC < 0 ? " (obtuse, since cos C < 0)" : ""}`)],
      traps: trapsTol(round(C, 1), TOL, [trap(round(180 - C, 1), "Check the sign of cos C: negative means obtuse, positive means acute."), trap(round(degOf(Math.acos(Math.max(-1, Math.min(1, (c * c - a * a - b * b) / (2 * a * b))))), 1), "The c² term is subtracted: a² + b² − c² on top.")]),
    };
  },
};

const apply: Skill = {
  id: "pc.triangles.apply",
  title: "Solve real-world triangles",
  topic: T,
  standards: ["PC.F.3.2"],
  prereqs: ["pc.triangles.sines-side", "pc.triangles.cosines-side"],
  lesson: {
    bigIdea: "Sketch the situation, label what you know, then choose: a known angle with its opposite side → Law of Sines; SAS or SSS → Law of Cosines.",
    explain: [
      "Two boats leave a dock at the same time. One goes 12 km on one heading, the other 9 km on a heading 70° away. They're c^2 = 12^2 + 9^2 − 2(12)(9) cos 70° ≈ 151.1, so about **12.3 km** apart (SAS → cosines).",
      "Two friends 200 m apart see a drone at angles of 50° and 70° from the line between them. The angle at the drone is 180° − 50° − 70° = 60°. The distance from the first friend is opposite the 70° angle: d = {200 sin 70°/sin 60°} ≈ **217.0 m** (ASA → sines).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Two hikers start at the same point and walk 3 mi and 5 mi along paths 110° apart. Why is the Law of Cosines the right tool for the distance between them?", choices: ["You know two sides and the angle between them (SAS).", "Because the triangle is a right triangle.", "Because you know an angle and its opposite side.", "The Law of Sines is the right tool."], correct: 0, explain: "The 110° angle is between the two known sides, which is exactly SAS." },
    { kind: "written", prompt: "Surveyors want the distance across a lake from A to B. Describe measurements they could take from a point C on shore and how they'd compute AB.", keyIdeas: ["measure CA and CB", "measure angle ACB", "use the Law of Cosines: AB² = CA² + CB² − 2·CA·CB·cos C"], exemplar: "Stand at a point C where both A and B are visible. Measure the distances CA and CB along the ground and the angle at C between them. Then AB^2 = CA^2 + CB^2 − 2(CA)(CB)cos C gives the distance across the lake." },
  ],
  generate(r, lv) {
    const kind = lv === 1 ? "boats" : lv === 2 ? r.pick(["lake", "boats"]) : "drone";
    if (kind === "boats" || kind === "lake") {
      const p = r.int(5, 20), q = r.int(5, 20), C = r.int(30, 140);
      const d = Math.sqrt(p * p + q * q - 2 * p * q * cosD(C));
      const boats = kind === "boats";
      const prompt = boats
        ? `Two boats leave a dock at the same time. One travels ${p} km in a straight line and the other travels ${q} km along a path that makes a ${C}${DEG} angle with the first. How far apart are they, to the nearest tenth of a km?`
        : `To find the width AB of a pond, a surveyor stands at C and measures CA = ${p * 10} m, CB = ${q * 10} m and angle ACB = ${C}${DEG}. Find AB to the nearest tenth of a meter.`;
      const s = boats ? 1 : 10;
      const vis: Visual = { type: "geo", showLabels: true, points: { C: { x: 0, y: 0 }, A: { x: p, y: 0 }, B: { x: q * cosD(C), y: q * sinD(C) } }, polygons: [["A", "B", "C"]], segments: [{ from: "C", to: "A", label: String(p * s) }, { from: "C", to: "B", label: String(q * s) }, { from: "A", to: "B", label: "?" }], angles: [{ at: "C", from: "A", to: "B", label: `${C}°` }] };
      const D = d * s;
      return {
        prompt,
        visual: vis,
        answer: ans1(D, boats ? " km" : " m"),
        hints: ["Sketch it: the two known lengths meet at the known angle. That's SAS.", `Use the Law of Cosines: x^2 = ${p * s}^2 + ${q * s}^2 − 2(${p * s})(${q * s}) cos ${C}°.`],
        steps: [st("Choose the law.", "Two sides and the included angle: Law of Cosines."), st("Substitute.", `x^2 = ${(p * s) ** 2} + ${(q * s) ** 2} − ${2 * p * q * s * s} cos ${C}° ≈ ${(D * D).toFixed(1)}`), st("Square root.", `x ≈ ${f1(D)} ${boats ? "km" : "m"}`)],
        traps: trapsTol(round(D, 1), TOL, [trap(round(Math.sqrt((p * s) ** 2 + (q * s) ** 2), 1), "That treats the angle as 90°."), trap(round(p * s + q * s, 1), boats ? "The boats aren't going in opposite directions; use the angle." : "AB isn't the sum of the two distances; use the angle at C.")]),
      };
    }
    const L = r.pick([100, 150, 200, 250, 300]);
    const al = r.int(35, 70), be = r.int(40, 75);
    const top = 180 - al - be;
    const d = (L * sinD(be)) / sinD(top);
    const vis: Visual = { type: "geo", showLabels: true, points: { P: { x: 0, y: 0 }, Q: { x: L, y: 0 }, D: { x: d * cosD(al), y: d * sinD(al) } }, polygons: [["P", "Q", "D"]], segments: [{ from: "P", to: "Q", label: `${L} m` }, { from: "P", to: "D", label: "?" }], angles: [{ at: "P", from: "Q", to: "D", label: `${al}°` }, { at: "Q", from: "D", to: "P", label: `${be}°` }] };
    return {
      prompt: `Two friends at P and Q stand ${L} m apart. They spot a drone D. The angle at P between Q and the drone is ${al}${DEG}, and the angle at Q between P and the drone is ${be}${DEG}. How far is the drone from P, to the nearest tenth of a meter?`,
      visual: vis,
      answer: ans1(d, " m"),
      hints: [`First find the angle at the drone: 180° − ${al}° − ${be}°.`, `PD is opposite the ${be}° angle at Q; the ${L} m side is opposite the angle at D.`],
      steps: [st("Angle at D.", `180° − ${al}° − ${be}° = ${top}°`), st("Law of Sines.", `{PD/sin ${be}°} = {${L}/sin ${top}°}`), st("Solve.", `PD = {${L} sin ${be}°/sin ${top}°} ≈ ${f1(d)} m`)],
      traps: trapsTol(round(d, 1), TOL, [trap(round((L * sinD(al)) / sinD(top), 1), `That's QD. PD is opposite the angle at Q (${be}°).`), trap(round((L * sinD(be)) / sinD(al), 1), "Use the angle at the drone for the known side's ratio.")]),
    };
  },
};

export default [sinesSide, sinesAngle, cosinesSide, cosinesAngle, apply];
