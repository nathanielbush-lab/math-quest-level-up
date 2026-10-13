// Unit 5: Radians and the unit circle (PC.F.2.1, PC.F.2.2, PC.F.3.3).
import { exact, ms, num, radical, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { DEG, QUAD, ang, angAns, angDeg, angInline, angText, angV, exAns, quadrant, refAng, trigEx, unitCircle, type Ang, type TrigFn } from "./util";

const T = "pc-unit-circle";

const SPECIAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => ang(k, 6)).concat([1, 3, 5, 7].map((k) => ang(k, 4)));
const sixths = (r: { pick: <U>(x: readonly U[]) => U }) => r.pick(SPECIAL);

const fr = (f: Frac) => (f.d === 1 ? ms(f.n) : `${f.n < 0 ? "−" : ""}{${Math.abs(f.n)}/${f.d}}`);
const sign = (fn: TrigFn, q: number) => {
  const base = fn === "sin" || fn === "csc" ? [1, 1, -1, -1] : fn === "cos" || fn === "sec" ? [1, -1, -1, 1] : [1, -1, 1, -1];
  return base[q - 1];
};
const posIn = (fn: TrigFn) => (fn === "sin" || fn === "csc" ? "Quadrants I and II (y > 0)" : fn === "cos" || fn === "sec" ? "Quadrants I and IV (x > 0)" : "Quadrants I and III (x and y have the same sign)");

const radians: Skill = {
  id: "pc.unitcircle.radians",
  title: "Radians, degrees and arc length",
  topic: T,
  standards: ["PC.F.2.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A radian is the angle that cuts off an arc as long as the radius. A full turn is 2π radians = 360°, so π radians = 180°.",
    explain: [
      "Degrees to radians: multiply by {π/180}. 150° = 150 · {π/180} = **{5π/6}**.",
      "Radians to degrees: multiply by {180/π}. {7π/4} = {7 · 180/4} = **315°**.",
      "Arc length: s = rθ with θ in radians. A 120° arc on a circle of radius 6: θ = {2π/3}, so s = 6 · {2π/3} = **4π**.",
    ],
    visual: { type: "geo", points: { O: { x: 0, y: 0 }, A: { x: 1, y: 0 }, B: { x: Math.cos(1), y: Math.sin(1) } }, circles: [{ center: "O", r: 1 }], segments: [{ from: "O", to: "A", label: "r" }, { from: "O", to: "B", label: "r" }], angles: [{ at: "O", from: "A", to: "B", label: "1 rad" }] },
    tip: "Memorize the anchors: π/6 = 30°, π/4 = 45°, π/3 = 60°, π/2 = 90°, π = 180°.",
  },
  why: [
    { kind: "choice", prompt: "Why is a full circle 2π radians?", choices: ["The circumference is 2πr, so the full arc is 2π radius-lengths long.", "Because π is about 3 and 2 · 3 = 6.", "Because 360 ÷ 180 = 2.", "It's a convention with no reason."], correct: 0, explain: "One radian is one radius of arc. The whole circumference is 2πr, which is 2π radii, so a full turn measures 2π radians." },
    { kind: "written", prompt: "Explain why the arc length formula s = rθ only works when θ is in radians.", keyIdeas: ["a radian is defined by arc length = radius", "θ radians means θ radius-lengths of arc", "with degrees you'd need to convert using π/180"], exemplar: "An angle of θ radians cuts off θ radius-lengths of arc, so the arc is r · θ. Degrees aren't measured in radius-lengths, so you'd have to multiply by π/180 first." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = sixths(r);
      // Occasionally go past a full turn.
      const a2 = r.chance(0.3) ? ang(a.n + 2 * a.d, a.d) : a;
      const deg = angDeg(a2);
      return {
        prompt: `Convert ${deg}${DEG} to radians. Give an exact answer in terms of π.`,
        answer: angAns(a2),
        hints: [`Multiply by {π/180}.`, `${deg} · {π/180} = {${deg}π/180}. Simplify the fraction.`],
        steps: [st("Multiply by π/180.", `${deg}${DEG} · {π/180} = {${deg}π/180}`), st("Simplify.", `= ${angText(a2)}`)],
      };
    }
    if (lv === 2) {
      const a = r.chance(0.8) ? sixths(r) : ang(r.pick([1, 5, 7, 11, 13]), 12);
      const neg = r.chance(0.2) ? -1 : 1;
      const A = ang(neg * a.n, a.d);
      const deg = angDeg(A);
      return {
        prompt: `Convert ${angText(A)} radians to degrees.`,
        answer: num(deg, { unit: DEG }),
        hints: ["Multiply by {180/π}. The π's cancel.", `${angText(A)} · {180/π} = {${A.n} · 180/${A.d}}.`],
        steps: [st("Multiply by 180/π.", `${angText(A)} · {180/π} = {${ms(A.n)} · 180/${A.d}}`), st("Simplify.", `= ${ms(deg)}${DEG}`)],
        traps: traps(frac(deg), [trap(frac(A.n * 180, A.d * 2), "π radians is 180°, not 360°."), trap(frac(A.n, A.d), "That's the multiple of π. Multiply by 180 to get degrees.")]),
      };
    }
    const rad = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
    const degs = r.pick([30, 45, 60, 90, 120, 135, 150, 210, 240, 270, 300]);
    const th = ang(degs, 180);
    const s = ang(th.n * rad, th.d);
    return {
      prompt: `A circle has radius ${rad} cm. Find the exact length of the arc cut off by a central angle of ${degs}${DEG}.`,
      answer: exact(s.n === 0 ? "0" : `${s.n}pi/${s.d}`, `${angText(s)} cm`),
      hints: ["Arc length s = rθ needs θ in radians.", `${degs}${DEG} = ${angText(th)} radians.`],
      steps: [st("Convert the angle.", `${degs}${DEG} = ${degs} · {π/180} = ${angText(th)}`), st("Use s = rθ.", `s = ${rad} · ${angText(th)} = ${angText(s)} cm`)],
    };
  },
};

const reference: Skill = {
  id: "pc.unitcircle.reference",
  title: "Coterminal and reference angles",
  topic: T,
  standards: ["PC.F.2.1", "PC.F.2.2"],
  prereqs: ["pc.unitcircle.radians"],
  lesson: {
    bigIdea: "Coterminal angles differ by full turns (2π or 360°) and land in the same spot. The reference angle is the acute angle between the terminal side and the x-axis.",
    explain: [
      "Coterminal: {17π/6} − 2π = {5π/6}, so {17π/6} and {5π/6} end at the same point. For a negative angle, add 2π: −{π/4} + 2π = {7π/4}.",
      "Reference angle θ' by quadrant: QI θ' = θ; QII θ' = π − θ; QIII θ' = θ − π; QIV θ' = 2π − θ.",
      "Example: {7π/6} is in QIII, so θ' = {7π/6} − π = **{π/6}**.",
    ],
    visual: unitCircle(ang(7, 6), "7π/6"),
    tip: "The reference angle is always measured to the x-axis, never the y-axis.",
  },
  why: [
    { kind: "choice", prompt: "Why do coterminal angles have the same sine and cosine?", choices: ["They end at the same point on the unit circle, and sin and cos are that point's coordinates.", "Because they are equal angles.", "Because sine is always positive.", "They don't; only their tangents match."], correct: 0, explain: "Adding a full turn brings you back to the same terminal side, so the point (cos θ, sin θ) is identical." },
    { kind: "written", prompt: "Explain how to find the reference angle of 300° and why it's measured to the x-axis.", keyIdeas: ["300° is in Quadrant IV", "reference angle = 360° − 300° = 60°", "trig values only depend on the distances to the x-axis (the triangle formed with the x-axis)"], exemplar: "300° is in Quadrant IV, 60° short of a full turn, so its reference angle is 360° − 300° = 60°. We measure to the x-axis because dropping a perpendicular to the x-axis makes a right triangle with the same shape as the 60° triangle in Quadrant I." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const base = r.pick([20, 35, 50, 75, 110, 145, 160, 200, 230, 290, 315, 340]);
      const k = r.pick([-2, -1, 1, 2]);
      const deg = base + 360 * k;
      return {
        prompt: `Find the angle between 0${DEG} and 360${DEG} that is coterminal with ${ms(deg)}${DEG}.`,
        answer: num(base, { unit: DEG }),
        hints: [`${deg > 0 ? "Subtract" : "Add"} 360${DEG} until you land between 0${DEG} and 360${DEG}.`, `${ms(deg)} ${deg > 0 ? "−" : "+"} ${Math.abs(k) * 360} = ${base}.`],
        steps: [st(`${deg > 0 ? "Subtract" : "Add"} full turns.`, `${ms(deg)}${DEG} ${deg > 0 ? "−" : "+"} ${Math.abs(k)} · 360${DEG} = ${base}${DEG}`), st("Check the range.", `0 ≤ ${base} < 360 ✓`)],
        traps: traps(frac(base), [trap(360 - base, "Coterminal means same terminal side, not a reflection. Add or subtract full turns."), ...(deg < 0 ? [trap(-deg % 360, "Watch the sign: for a negative angle, add 360° until you land in range.")] : [])]),
      };
    }
    const a = SPECIAL.filter((x) => quadrant(x) !== 0 && quadrant(x) !== 1);
    const th = r.pick(a);
    const shown = lv === 2 ? th : ang(th.n + r.pick([-2, 2, -4]) * th.d, th.d);
    const ref = refAng(th);
    const q = quadrant(th);
    const how = q === 2 ? `π − ${angText(th)}` : q === 3 ? `${angText(th)} − π` : `2π − ${angText(th)}`;
    return {
      prompt: `Find the reference angle of ${angText(shown)}.`,
      visual: lv === 2 ? unitCircle(th, angInline(th)) : undefined,
      answer: angAns(ref),
      hints: [
        ...(lv === 3 ? [`First find a coterminal angle between 0 and 2π by adding or subtracting 2π. You should get ${angText(th)}.`] : []),
        `${angText(th)} is in ${QUAD[q]}.`,
        `In ${QUAD[q]}, the reference angle is ${q === 2 ? "π − θ" : q === 3 ? "θ − π" : "2π − θ"}.`,
      ],
      steps: [
        ...(lv === 3 ? [st("Find a coterminal angle in [0, 2π).", `${angText(shown)} ${shown.n > th.n ? "−" : "+"} ${Math.abs(shown.n - th.n) / th.d === 2 ? "2π" : "4π"} = ${angText(th)}`)] : []),
        st("Locate the quadrant.", `${angText(th)} is in ${QUAD[q]}.`),
        st("Measure to the x-axis.", `${how} = ${angText(ref)}`),
      ],
    };
  },
};

function fnVal(fn: TrigFn, a: Ang) {
  return trigEx(fn, a);
}

const exactValues: Skill = {
  id: "pc.unitcircle.exact",
  title: "Exact sine, cosine and tangent values",
  topic: T,
  standards: ["PC.F.2.1"],
  prereqs: ["pc.unitcircle.reference"],
  lesson: {
    bigIdea: "On the unit circle, the point at angle θ is (cos θ, sin θ), and tan θ = {sin θ/cos θ}. Use the reference angle for the size and the quadrant for the sign.",
    explain: [
      "Quadrant I values: sin {π/6} = {1/2}, sin {π/4} = {√2/2}, sin {π/3} = {√3/2}; cosines are the same list in reverse.",
      "Example: sin {5π/4}. Reference angle {π/4}, so the size is {√2/2}. In Quadrant III, y < 0. So sin {5π/4} = **−{√2/2}**.",
      "Example: tan {2π/3} = {sin/cos} = {√3/2} ÷ (−{1/2}) = **−√3**.",
    ],
    visual: unitCircle(ang(5, 4), "5π/4"),
    tip: "All Students Take Calculus: in QI All are positive, QII Sine, QIII Tangent, QIV Cosine.",
  },
  why: [
    { kind: "choice", prompt: "Why is cos {2π/3} negative?", choices: ["{2π/3} is in Quadrant II, where points on the unit circle have negative x-coordinates.", "Because 2π/3 is bigger than 1.", "Because every angle bigger than π/2 has a negative cosine.", "Because sin {2π/3} is positive."], correct: 0, explain: "cos θ is the x-coordinate of the point on the unit circle, and Quadrant II points are left of the y-axis." },
    { kind: "written", prompt: "Explain how to find sin {11π/6} exactly without a calculator.", keyIdeas: ["11π/6 is in Quadrant IV", "reference angle π/6", "sin(π/6) = 1/2", "sine is negative in Quadrant IV, so −1/2"], exemplar: "{11π/6} is just short of 2π, in Quadrant IV, with reference angle {π/6}. sin {π/6} = {1/2}, and in Quadrant IV the y-coordinate is negative, so sin {11π/6} = −{1/2}." },
  ],
  generate(r, lv) {
    const fns: TrigFn[] = lv === 1 ? ["sin", "cos"] : ["sin", "cos", "tan"];
    let fn: TrigFn = r.pick(fns), th = sixths(r);
    if (lv === 1) th = r.pick(SPECIAL.filter((x) => angV(x) < Math.PI));
    let val = fnVal(fn, th);
    if (!val) { fn = "sin"; val = fnVal(fn, th)!; }
    const shown = lv === 3 ? ang(th.n + r.pick([-2, 2]) * th.d, th.d) : th;
    const q = quadrant(th), ref = refAng(th);
    const refVal = fnVal(fn, ref)!;
    const angStr = lv === 1 ? `${angDeg(th)}${DEG}` : angText(shown);
    const ans = exAns(val);
    const tr = val.q ? traps(val.q, [trap(frac(-val.q.n, val.q.d), q ? `Right size, wrong sign. In ${QUAD[q]}, ${fn} is ${sign(fn, q) > 0 ? "positive" : "negative"}.` : "Right size, wrong sign. Check which way the point is from the origin."), ...(fn !== "tan" && fnVal(fn === "sin" ? "cos" : "sin", th)?.q ? [trap(fnVal(fn === "sin" ? "cos" : "sin", th)!.q!, `That's ${fn === "sin" ? "cos" : "sin"}. ${fn === "sin" ? "Sine is the y-coordinate." : "Cosine is the x-coordinate."}`)] : [])]) : undefined;
    if (q === 0) {
      const pt = `(${trigEx("cos", th)!.text}, ${trigEx("sin", th)!.text})`;
      return {
        prompt: `Find the exact value of ${fn}(${angStr}).`,
        visual: lv === 3 ? undefined : unitCircle(th, lv === 1 ? `${angDeg(th)}°` : angInline(th)),
        answer: ans,
        hints: [...(lv === 3 ? [`${angText(shown)} is coterminal with ${angText(th)}.`] : []), "This angle lands on an axis. Which point of the unit circle is it?", `The point is ${pt}. sin is the y-coordinate, cos is the x-coordinate, tan = y/x.`],
        steps: [...(lv === 3 ? [st("Find a coterminal angle.", `${angText(shown)} → ${angText(th)}`)] : []), st("Locate the point.", `The terminal side is on an axis, at the point ${pt}.`), st("Read the value.", `${fn}(${angStr}) = ${val.text}`)],
        traps: tr,
      };
    }
    return {
      prompt: `Find the exact value of ${fn}(${angStr}).`,
      visual: lv === 3 ? undefined : unitCircle(th, lv === 1 ? `${angDeg(th)}°` : angInline(th)),
      answer: ans,
      hints: [
        ...(lv === 3 ? [`${angText(shown)} is coterminal with ${angText(th)} (add or subtract 2π).`] : []),
        `The reference angle is ${lv === 1 ? `${angDeg(ref)}${DEG}` : angText(ref)}, so the size of the answer is ${refVal.text.replace("−", "")}.`,
        `${fn} is positive in ${posIn(fn)}. This angle is in ${QUAD[q]}.`,
      ],
      steps: [
        ...(lv === 3 ? [st("Find a coterminal angle.", `${angText(shown)} → ${angText(th)}`)] : []),
        st("Quadrant and reference angle.", `${lv === 1 ? `${angDeg(th)}${DEG}` : angText(th)} is in ${QUAD[q]}; reference angle ${lv === 1 ? `${angDeg(ref)}${DEG}` : angText(ref)}.`),
        st("Size from the reference angle.", `${fn}(${lv === 1 ? `${angDeg(ref)}${DEG}` : angText(ref)}) = ${refVal.text}`),
        st("Sign from the quadrant.", `${fn} is ${sign(fn, q) > 0 ? "positive" : "negative"} in ${QUAD[q]}, so ${fn}(${angStr}) = ${val.text}.`),
      ],
      traps: tr,
    };
  },
};

const six: Skill = {
  id: "pc.unitcircle.six",
  title: "Secant, cosecant and cotangent",
  topic: T,
  standards: ["PC.F.2.1", "PC.F.1.2"],
  prereqs: ["pc.unitcircle.exact"],
  lesson: {
    bigIdea: "The other three trig functions are reciprocals: csc θ = {1/sin θ}, sec θ = {1/cos θ}, cot θ = {1/tan θ} = {cos θ/sin θ}.",
    explain: [
      "sec {2π/3}: cos {2π/3} = −{1/2}, so sec {2π/3} = 1 ÷ (−{1/2}) = **−2**.",
      "csc {π/4}: sin {π/4} = {√2/2}, so csc {π/4} = {2/√2} = **√2** (rationalize).",
      "Each reciprocal has the same sign as its partner, and doesn't exist where the partner is 0 (sec at {π/2}, csc and cot at 0 and π).",
    ],
    tip: "Rationalize: {2/√3} = {2√3/3}.",
  },
  why: [
    { kind: "choice", prompt: "Why does sec(π/2) not exist?", choices: ["cos(π/2) = 0, and you can't divide 1 by 0.", "Because π/2 is not on the unit circle.", "Because secant is only defined for acute angles.", "It equals 0."], correct: 0, explain: "sec θ = 1/cos θ, and the x-coordinate at π/2 is 0." },
    { kind: "written", prompt: "Explain why csc θ and sin θ always have the same sign.", keyIdeas: ["csc θ = 1/sin θ", "1 divided by a positive is positive, by a negative is negative"], exemplar: "csc θ is 1 divided by sin θ. Dividing 1 by a positive number gives a positive number and by a negative gives a negative, so they always share a sign." },
  ],
  generate(r, lv) {
    const fn: TrigFn = r.pick(["csc", "sec", "cot"]);
    const partner: TrigFn = fn === "csc" ? "sin" : fn === "sec" ? "cos" : "tan";
    let th = lv === 1 ? r.pick(SPECIAL.filter((x) => quadrant(x) === 1)) : sixths(r);
    while (!trigEx(fn, th) || !trigEx(partner, th)) th = sixths(r);
    const val = trigEx(fn, th)!;
    const pv = trigEx(partner, th)!;
    const shown = lv === 3 ? ang(th.n - 2 * th.d, th.d) : th;
    return {
      prompt: `Find the exact value of ${fn}(${angText(shown)}).`,
      answer: exAns(val),
      hints: [`${fn} θ = {1/${partner} θ}.`, `${partner}(${angText(th)}) = ${pv.text}. Flip it${pv.q ? "" : " and rationalize"}.`],
      steps: [
        ...(lv === 3 ? [st("Coterminal angle.", `${angText(shown)} + 2π = ${angText(th)}`)] : []),
        st("Find the partner function.", `${partner}(${angText(th)}) = ${pv.text}`),
        st("Take the reciprocal.", `${fn}(${angText(th)}) = 1 ÷ ${pv.v < 0 ? `(${pv.text})` : pv.text} = ${val.text}${pv.q ? "" : " (after rationalizing)"}`),
      ],
      traps: val.q ? traps(val.q, [trap(pv.q ?? frac(0), `That's ${partner}. ${fn} is its reciprocal.`), trap(frac(-val.q.n, val.q.d), "Reciprocals keep the sign of the original value.")]) : undefined,
    };
  },
};

/** Points for θ and a related angle on the unit circle. */
function twoPoint(t1: number, t2: number): Visual {
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, X: { x: 1, y: 0 }, P: { x: Math.cos(t1), y: Math.sin(t1) }, Q: { x: Math.cos(t2), y: Math.sin(t2) }, L: { x: -1.25, y: 0 }, R: { x: 1.25, y: 0 }, D: { x: 0, y: -1.25 }, U: { x: 0, y: 1.25 } },
    circles: [{ center: "O", r: 1 }],
    segments: [{ from: "L", to: "R", dashed: true }, { from: "D", to: "U", dashed: true }, { from: "O", to: "P", label: "P" }, { from: "O", to: "Q", dashed: true, label: "Q" }],
    angles: [{ at: "O", from: "X", to: "P", label: "θ" }],
  };
}

const TRIPLES: [number, number, number][] = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25]];

const symmetry: Skill = {
  id: "pc.unitcircle.symmetry",
  title: "Symmetry and periodicity on the unit circle",
  topic: T,
  standards: ["PC.F.2.2"],
  prereqs: ["pc.unitcircle.exact"],
  lesson: {
    bigIdea: "Reflections of the unit circle explain the trig identities: adding 2π returns to the same point, −θ reflects over the x-axis, π − θ reflects over the y-axis, and π + θ goes to the opposite point.",
    explain: [
      "Periodicity: sin(θ + 2π) = sin θ and cos(θ + 2π) = cos θ, because a full turn lands on the same point. That's why the graphs repeat every 2π.",
      "Even/odd: the point for −θ is (cos θ, −sin θ), so cos(−θ) = cos θ and sin(−θ) = −sin θ.",
      "Supplements: the point for π − θ is (−cos θ, sin θ). Opposite: the point for π + θ is (−cos θ, −sin θ), so tan(π + θ) = tan θ: tangent repeats every π.",
      "Example: if sin θ = {3/5} and cos θ = {4/5}, then sin(π + θ) = −{3/5} and cos(π − θ) = −{4/5}.",
    ],
    visual: twoPoint(0.64, Math.PI - 0.64),
  },
  why: [
    { kind: "choice", prompt: "Why is the period of tangent π instead of 2π?", choices: ["The points for θ and θ + π are opposite, so both coordinates flip sign and their ratio y/x stays the same.", "Because tangent is half of sine.", "Because tan θ = cos θ / sin θ.", "It's 2π like sine."], correct: 0, explain: "(−x, −y) gives (−y)/(−x) = y/x. Half a turn already repeats tangent's values." },
    { kind: "written", prompt: "Use the unit circle to explain why cos(−θ) = cos θ.", keyIdeas: ["−θ is the reflection of θ over the x-axis", "reflecting over the x-axis keeps the x-coordinate", "cosine is the x-coordinate"], exemplar: "Measuring θ clockwise instead of counterclockwise reflects the point over the x-axis. That changes the sign of y but keeps x the same, and cos is the x-coordinate, so cos(−θ) = cos θ." },
  ],
  generate(r, lv) {
    const [a, b, c] = r.pick(TRIPLES);
    const s = frac(b, c), co = frac(a, c), tn = frac(b, a);
    type Q = { expr: string; v: Frac; how: string; t2: (t: number) => number };
    const neg = (f: Frac) => frac(-f.n, f.d);
    const L1: Q[] = [
      { expr: "sin(θ + 2π)", v: s, how: "Adding 2π is a full turn: same point, so sin(θ + 2π) = sin θ.", t2: (t) => t },
      { expr: "cos(−θ)", v: co, how: "−θ reflects the point over the x-axis; x stays the same, so cos(−θ) = cos θ.", t2: (t) => -t },
      { expr: "sin(−θ)", v: neg(s), how: "−θ reflects over the x-axis; y changes sign, so sin(−θ) = −sin θ.", t2: (t) => -t },
      { expr: "cos(θ − 2π)", v: co, how: "Subtracting a full turn lands on the same point.", t2: (t) => t },
    ];
    const L2: Q[] = [
      { expr: "sin(π − θ)", v: s, how: "π − θ reflects over the y-axis; y stays the same.", t2: (t) => Math.PI - t },
      { expr: "cos(π − θ)", v: neg(co), how: "π − θ reflects over the y-axis; x changes sign.", t2: (t) => Math.PI - t },
      { expr: "sin(π + θ)", v: neg(s), how: "π + θ is the opposite point; both coordinates change sign.", t2: (t) => Math.PI + t },
      { expr: "cos(π + θ)", v: neg(co), how: "π + θ is the opposite point; both coordinates change sign.", t2: (t) => Math.PI + t },
    ];
    const L3: Q[] = [
      { expr: "tan(π + θ)", v: tn, how: "The opposite point flips both signs, so y/x is unchanged: tan has period π.", t2: (t) => Math.PI + t },
      { expr: "tan(−θ)", v: neg(tn), how: "−θ flips the sign of y only, so y/x changes sign.", t2: (t) => -t },
      { expr: "cos(2π − θ)", v: co, how: "2π − θ is coterminal with −θ, which keeps x.", t2: (t) => -t },
      { expr: "sin(θ + 3π)", v: neg(s), how: "θ + 3π = (θ + π) + 2π: the opposite point, so y changes sign.", t2: (t) => Math.PI + t },
      { expr: "tan(π − θ)", v: neg(tn), how: "π − θ flips the sign of x only, so y/x changes sign.", t2: (t) => Math.PI - t },
    ];
    const q = r.pick(lv === 1 ? L1 : lv === 2 ? L2 : L3);
    const t = Math.atan2(b, a);
    const given = `sin θ = ${fr(s)} and cos θ = ${fr(co)}`;
    return {
      prompt: `θ is an angle in Quadrant I with ${given}. Find ${q.expr}.`,
      visual: twoPoint(t, q.t2(t)),
      answer: num(q.v, { simplest: true }),
      hints: ["Picture the point P for θ and the point Q for the new angle on the unit circle (shown).", "Is Q a reflection of P over an axis, the opposite point, or the same point? Which coordinates change sign?", q.expr.startsWith("tan") ? "tan = y/x: check both signs." : "Same size; decide the sign."],
      steps: [st("Relate the angles.", q.how), st("Answer.", `${q.expr} = ${fr(q.v)}`)],
      traps: traps(q.v, [trap(neg(q.v), "Right size, wrong sign. Check which coordinate flips."), trap(q.expr.startsWith("sin") ? co : s, q.expr.startsWith("sin") ? "Sine is the y-coordinate, not x." : "Cosine is the x-coordinate, not y.")]),
    };
  },
};

/** Exact a√b/c answer. */
function radAns(sgn: number, n: number, den: number): { answer: Answer; text: string } {
  const { a, b } = radical(n);
  const f = frac(a, den);
  if (b === 1) { const v = frac(sgn * a, den); return { answer: num(v), text: fr(v) }; }
  const coef = f.n === 1 ? "" : String(f.n);
  const top = `${coef}√${b}`;
  const text = `${sgn < 0 ? "−" : ""}${f.d === 1 ? top : `{${top}/${f.d}}`}`;
  const typed = `${sgn < 0 ? "-" : ""}${coef}sqrt(${b})${f.d === 1 ? "" : "/" + f.d}`;
  return { answer: exact(typed, text), text };
}

const pythag: Skill = {
  id: "pc.unitcircle.pythag",
  title: "Use sin²θ + cos²θ = 1 to find trig values",
  topic: T,
  standards: ["PC.F.3.3"],
  prereqs: ["pc.unitcircle.exact"],
  lesson: {
    bigIdea: "Every point on the unit circle satisfies x^2 + y^2 = 1, so sin^2θ + cos^2θ = 1. Knowing one value and the quadrant gives all the others.",
    explain: [
      "sin θ = −{3/5} with θ in Quadrant III. Then cos^2θ = 1 − {9/25} = {16/25}, so cos θ = ±{4/5}. In QIII x < 0: **cos θ = −{4/5}**.",
      "Then tan θ = {sin θ/cos θ} = {−3/5} ÷ {−4/5} = {3/4}.",
      "Non-triangle numbers work too: cos θ = {1/3} in QIV gives sin^2θ = {8/9}, so sin θ = −{2√2/3}.",
    ],
    tip: "The square root gives ±. The quadrant decides the sign; never skip that step.",
  },
  why: [
    { kind: "choice", prompt: "Why is sin^2θ + cos^2θ = 1 true for every angle?", choices: ["(cos θ, sin θ) is on the unit circle, whose equation is x^2 + y^2 = 1.", "Because sin θ + cos θ = 1.", "It's only true for acute angles.", "Because sin and cos are always less than 1."], correct: 0, explain: "The identity is the circle's equation written with x = cos θ and y = sin θ, so it holds for any angle." },
    { kind: "written", prompt: "If cos θ = {5/13}, explain why you need more information to know sin θ.", keyIdeas: ["sin^2θ = 1 − 25/169 = 144/169", "sin θ = ±12/13", "θ could be in Quadrant I or IV", "the quadrant decides the sign"], exemplar: "From the identity, sin^2θ = 1 − {25/169} = {144/169}, so sin θ = {12/13} or −{12/13}. A positive cosine happens in both Quadrant I and Quadrant IV, so without the quadrant you can't tell which sign is right." },
  ],
  generate(r, lv) {
    const giveSin = r.chance(0.5);
    const gfn = giveSin ? "sin" : "cos", ofn = giveSin ? "cos" : "sin";
    if (lv < 3) {
      const [a, b, c] = r.pick(TRIPLES);
      const q = r.int(2, 4);
      const sx = sign("cos", q), sy = sign("sin", q);
      const sinv = frac(sy * b, c), cosv = frac(sx * a, c);
      const given = giveSin ? sinv : cosv, other = giveSin ? cosv : sinv;
      const tanv = frac(sy * b * sx, a);
      const wantTan = lv === 2;
      const ans = wantTan ? tanv : other;
      const otherSq = giveSin ? a * a : b * b;
      return {
        prompt: `${gfn} θ = ${fr(given)} and θ is in ${QUAD[q]}. Find ${wantTan ? "tan θ" : `${ofn} θ`}.`,
        answer: num(ans, { simplest: true }),
        hints: [`Use sin^2θ + cos^2θ = 1: ${ofn}^2θ = 1 − (${fr(given)})^2.`, `${ofn}^2θ = {${otherSq}/${c * c}}, so ${ofn} θ = ±{${Math.sqrt(otherSq)}/${c}}. In ${QUAD[q]}, ${ofn} is ${sign(ofn as TrigFn, q) > 0 ? "positive" : "negative"}.`, ...(wantTan ? ["tan θ = {sin θ/cos θ}."] : [])],
        steps: [
          st("Pythagorean identity.", `${ofn}^2θ = 1 − {${given.n * given.n}/${c * c}} = {${otherSq}/${c * c}}`),
          st("Square root.", `${ofn} θ = ±{${Math.sqrt(otherSq)}/${c}}`),
          st("Choose the sign.", `In ${QUAD[q]}, ${ofn} θ ${sign(ofn as TrigFn, q) > 0 ? ">" : "<"} 0, so ${ofn} θ = ${fr(other)}.`),
          ...(wantTan ? [st("Divide.", `tan θ = {sin θ/cos θ} = ${fr(sinv)} ÷ ${fr(cosv).replace(/^−/, "(−") + (cosv.n < 0 ? ")" : "")} = ${fr(tanv)}`)] : []),
        ],
        traps: traps(ans, [trap(frac(-ans.n, ans.d), `The size is right but check the sign in ${QUAD[q]}.`), ...(wantTan ? [trap(frac(sx * a * sy, b), "tan θ = sin θ ÷ cos θ, not cos θ ÷ sin θ.")] : [trap(given, "That's the value you were given. Use the identity to find the other one.")])]),
      };
    }
    const [p, c] = r.pick([[1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5], [3, 7], [2, 7]] as const);
    const q = r.int(1, 4) === 1 ? 2 : r.int(2, 4);
    const gs = sign(gfn as TrigFn, q), os = sign(ofn as TrigFn, q);
    const given = frac(gs * p, c);
    const ra = radAns(os, c * c - p * p, c);
    return {
      prompt: `${gfn} θ = ${fr(given)} and θ is in ${QUAD[q]}. Find the exact value of ${ofn} θ.`,
      answer: ra.answer,
      hints: [`${ofn}^2θ = 1 − (${fr(given)})^2 = {${c * c - p * p}/${c * c}}.`, `Take the square root and simplify the radical. In ${QUAD[q]}, ${ofn} is ${os > 0 ? "positive" : "negative"}.`],
      steps: [
        st("Pythagorean identity.", `${ofn}^2θ = 1 − {${p * p}/${c * c}} = {${c * c - p * p}/${c * c}}`),
        st("Square root.", `${ofn} θ = ±{√${c * c - p * p}/${c}}`),
        st("Simplify and choose the sign.", `${QUAD[q]}: ${ofn} θ = ${ra.text}`),
      ],
    };
  },
};

export default [radians, reference, exactValues, six, symmetry, pythag];
