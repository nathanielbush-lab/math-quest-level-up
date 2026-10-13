// Unit 11: Vectors (PC.N.3.1, PC.N.3.2).
import { ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { DEG, degOf, f1, f2, rad, round, trapsTol } from "./util";

const T = "pc-vectors";
const vec = (a: number | string, b: number | string) => `⟨${typeof a === "number" ? ms(a) : a}, ${typeof b === "number" ? ms(b) : b}⟩`;
const vecAns = (a: number, b: number, tol?: number): Answer => ({ kind: "multi", fields: [{ value: frac(tol ? round(a, 1) : a), pre: "⟨", tolerance: tol }, { value: frac(tol ? round(b, 1) : b), pre: ",", post: "⟩", tolerance: tol }] });
const dirAngle = (x: number, y: number) => { const d = degOf(Math.atan2(y, x)); return d < 0 ? d + 360 : d; };

function arrows(list: { name: string; x: number; y: number; dashed?: boolean }[], from = { x: 0, y: 0 }): Visual {
  const points: Record<string, { x: number; y: number }> = { O: from };
  list.forEach((v) => (points[v.name] = { x: from.x + v.x, y: from.y + v.y }));
  return { type: "geo", grid: true, points, segments: list.map((v) => ({ from: "O", to: v.name, label: v.name, dashed: v.dashed })) };
}

const TRIPLES: [number, number, number][] = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17]];

const magnitude: Skill = {
  id: "pc.vectors.magnitude",
  title: "Components, magnitude and direction",
  topic: T,
  standards: ["PC.N.3.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A vector has a size (magnitude) and a direction. From P to Q its components are ⟨x_2 − x_1, y_2 − y_1⟩, its magnitude is √(a^2 + b^2), and its direction angle θ satisfies tan θ = {b/a}.",
    explain: [
      "From P(1, 2) to Q(−3, 5): v = ⟨−3 − 1, 5 − 2⟩ = ⟨−4, 3⟩.",
      "|v| = √((−4)^2 + 3^2) = √25 = **5**.",
      "Direction: tan^-1({3/−4}) ≈ −36.9°, but ⟨−4, 3⟩ points into Quadrant II, so add 180°: θ ≈ **143.1°**.",
    ],
    visual: arrows([{ name: "v", x: -4, y: 3 }]),
    tip: "Calculators give tan^-1 answers between −90° and 90°. If the x-component is negative, add 180°; if the angle comes out negative with x > 0, add 360°.",
  },
  why: [
    { kind: "choice", prompt: "Why is the magnitude of ⟨a, b⟩ equal to √(a^2 + b^2)?", choices: ["The components are the legs of a right triangle and the vector is the hypotenuse.", "Because magnitude is the sum a + b.", "Because a^2 + b^2 is always a perfect square.", "Because the vector starts at the origin."], correct: 0, explain: "Moving a horizontally and b vertically makes a right triangle; the Pythagorean Theorem gives the length of the arrow." },
    { kind: "written", prompt: "Explain why ⟨3, 4⟩ and ⟨−3, −4⟩ have the same magnitude but different directions.", keyIdeas: ["both have magnitude √(9 + 16) = 5", "one points into Quadrant I, the other into Quadrant III", "they point in opposite directions (angles differ by 180°)"], exemplar: "Squaring removes the signs, so both have magnitude √(9 + 16) = 5. But ⟨3, 4⟩ points up and right (about 53°) while ⟨−3, −4⟩ points down and left (about 233°): the same length in opposite directions." },
  ],
  generate(r, lv) {
    const [p, q, h] = r.pick(TRIPLES);
    const sx = r.sign(), sy = r.sign();
    const a = lv === 3 ? r.nonzero(-9, 9) : sx * p, b = lv === 3 ? r.nonzero(-9, 9) : sy * q;
    const x1 = r.int(-5, 5), y1 = r.int(-5, 5), x2 = x1 + a, y2 = y1 + b;
    if (lv === 1) {
      return {
        prompt: `Find the component form of the vector from P(${ms(x1)}, ${ms(y1)}) to Q(${ms(x2)}, ${ms(y2)}).`,
        answer: vecAns(a, b),
        hints: ["Subtract the starting point from the ending point: ⟨x_2 − x_1, y_2 − y_1⟩.", `⟨${ms(x2)} − ${sn(x1)}, ${ms(y2)} − ${sn(y1)}⟩`],
        steps: [st("Terminal minus initial.", `⟨${ms(x2)} − ${sn(x1)}, ${ms(y2)} − ${sn(y1)}⟩ = ${vec(a, b)}`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `Find the magnitude of the vector from P(${ms(x1)}, ${ms(y1)}) to Q(${ms(x2)}, ${ms(y2)}).`,
        answer: num(h),
        hints: [`The components are ${vec(a, b)}.`, `|v| = √(${sn(a)}^2 + ${sn(b)}^2).`],
        steps: [st("Components.", vec(a, b)), st("Magnitude.", `√(${a * a} + ${b * b}) = √${h * h} = ${h}`)],
        traps: traps(frac(h), [trap(Math.abs(a) + Math.abs(b), "Magnitude isn't the sum of the components. Use the Pythagorean Theorem."), trap(h * h, "Take the square root.")]),
      };
    }
    const th = dirAngle(a, b);
    const naive = degOf(Math.atan(b / a));
    return {
      prompt: `Find the direction angle of v = ${vec(a, b)}, measured counterclockwise from the positive x-axis (0${DEG} ≤ θ < 360${DEG}). Round to the nearest tenth of a degree.`,
      visual: arrows([{ name: "v", x: a, y: b }]),
      answer: num(round(th, 1), { tolerance: 0.1, unit: DEG }),
      hints: [`tan^-1({${ms(b)}/${ms(a)}}) ≈ ${f1(naive)}°.`, `v points into Quadrant ${a > 0 ? (b > 0 ? "I" : "IV") : b > 0 ? "II" : "III"}. ${a < 0 ? "Add 180°." : b < 0 ? "Add 360°." : "No adjustment needed."}`],
      steps: [st("Reference calculation.", `tan^-1({${ms(b)}/${ms(a)}}) ≈ ${f1(naive)}°`), st("Adjust for the quadrant.", a < 0 ? `x < 0: ${f1(naive)}° + 180° = ${f1(th)}°` : b < 0 ? `x > 0, y < 0: ${f1(naive)}° + 360° = ${f1(th)}°` : "Quadrant I: no change."), st("Direction.", `θ ≈ ${f1(th)}°`)],
      traps: trapsTol(round(th, 1), 0.1, [trap(round(naive, 1), "That's the calculator's raw tan⁻¹ value. Adjust for the quadrant."), trap(round(naive + 180, 1), "Only add 180° when the x-component is negative.")]),
    };
  },
};

const components: Skill = {
  id: "pc.vectors.components",
  title: "Components from magnitude and direction",
  topic: T,
  standards: ["PC.N.3.1"],
  prereqs: ["pc.vectors.magnitude"],
  lesson: {
    bigIdea: "A vector with magnitude |v| and direction angle θ has components ⟨|v| cos θ, |v| sin θ⟩.",
    explain: [
      "A soccer ball is kicked at 20 m/s at 35° above the ground. Horizontal: 20 cos 35° ≈ 16.4 m/s. Vertical: 20 sin 35° ≈ 11.5 m/s. So v ≈ ⟨16.4, 11.5⟩.",
      "Angles past 90° handle the signs for you: 10 at 150° is ⟨10 cos 150°, 10 sin 150°⟩ ≈ ⟨−8.7, 5⟩.",
    ],
    visual: { type: "geo", showLabels: true, points: { O: { x: 0, y: 0 }, A: { x: 16.4, y: 0 }, V: { x: 16.4, y: 11.5 } }, segments: [{ from: "O", to: "V", label: "20" }, { from: "O", to: "A", label: "20 cos 35°", dashed: true }, { from: "A", to: "V", label: "20 sin 35°", dashed: true }], angles: [{ at: "O", from: "A", to: "V", label: "35°" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the horizontal component |v| cos θ?", choices: ["In the right triangle formed by the vector, the horizontal leg is adjacent to θ and the hypotenuse is |v|.", "Because cosine is always horizontal.", "Because cos θ is bigger than sin θ.", "It's |v| sin θ."], correct: 0, explain: "cos θ = adjacent/hypotenuse, so the adjacent (horizontal) leg is |v| cos θ." },
    { kind: "written", prompt: "A drone flies 50 m at a direction angle of 210°. Explain why both of its components are negative.", keyIdeas: ["210° points into Quadrant III", "cos 210° and sin 210° are both negative", "the drone moves left and down relative to the start"], exemplar: "210° is in Quadrant III, where cosine and sine are both negative. So 50 cos 210° and 50 sin 210° are negative: the drone ends up to the left of and below where it started." },
  ],
  generate(r, lv) {
    const m = r.pick([10, 12, 15, 20, 25, 30, 40]);
    const th = lv === 1 ? r.int(10, 80) : r.pick([r.int(100, 170), r.int(190, 260), r.int(280, 350)]);
    const x = m * Math.cos(rad(th)), y = m * Math.sin(rad(th));
    const ctx = lv === 3 ? `A hockey puck slides at ${m} ft/s in the direction ${th}${DEG} (counterclockwise from east).` : `v has magnitude ${m} and direction angle ${th}${DEG}.`;
    return {
      prompt: `${ctx} Find the component form${lv === 3 ? " of its velocity" : ""}, rounding each component to the nearest tenth.`,
      answer: vecAns(x, y, 0.1),
      hints: ["v = ⟨|v| cos θ, |v| sin θ⟩. Make sure your calculator is in degrees.", `x = ${m} cos ${th}° and y = ${m} sin ${th}°.`],
      steps: [st("Horizontal component.", `${m} cos ${th}° ≈ ${f2(x)}`), st("Vertical component.", `${m} sin ${th}° ≈ ${f2(y)}`), st("Component form.", `≈ ${vec(f1(x), f1(y))}`)],
    };
  },
};

const add: Skill = {
  id: "pc.vectors.add",
  title: "Add, subtract and scale vectors",
  topic: T,
  standards: ["PC.N.3.2"],
  prereqs: ["pc.vectors.magnitude"],
  lesson: {
    bigIdea: "Add vectors by adding components; geometrically, put them tip to tail. Subtracting adds the opposite. A scalar stretches the vector (and reverses it if negative).",
    explain: [
      "u = ⟨2, 5⟩, v = ⟨4, −1⟩: u + v = ⟨6, 4⟩. Draw u, then start v at u's tip: the arrow from the start to the end is u + v.",
      "u − v = u + (−v) = ⟨2 − 4, 5 − (−1)⟩ = ⟨−2, 6⟩.",
      "3u − 2v = ⟨6, 15⟩ − ⟨8, −2⟩ = ⟨−2, 17⟩.",
    ],
    visual: { type: "geo", grid: true, points: { O: { x: 0, y: 0 }, U: { x: 2, y: 5 }, S: { x: 6, y: 4 } }, segments: [{ from: "O", to: "U", label: "u" }, { from: "U", to: "S", label: "v" }, { from: "O", to: "S", label: "u + v", dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why does adding components give the same result as placing vectors tip to tail?", choices: ["Tip to tail means doing one displacement then the other, and the total horizontal and vertical moves just add.", "Because vectors always start at the origin.", "It doesn't; the results differ.", "Because addition is commutative."], correct: 0, explain: "Following u then v moves you u_1 + v_1 horizontally and u_2 + v_2 vertically, which is the component sum." },
    { kind: "written", prompt: "Explain what the vector −2u looks like compared with u.", keyIdeas: ["twice as long", "points in the opposite direction", "each component is multiplied by −2"], exemplar: "−2u has each component multiplied by −2, so it's twice as long as u and points the opposite way." },
  ],
  generate(r, lv) {
    const u = [r.int(-6, 6), r.int(-6, 6)], v = [r.int(-6, 6), r.int(-6, 6)];
    const [k, m] = lv === 1 ? [1, 1] : lv === 2 ? [1, -1] : [r.pick([2, 3, -2]), r.pick([-3, -2, 2, 3])];
    const res = [k * u[0] + m * v[0], k * u[1] + m * v[1]];
    const name = `${k === 1 ? "" : ms(k)}u ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}v`;
    return {
      prompt: `u = ${vec(u[0], u[1])} and v = ${vec(v[0], v[1])}. Find ${name}.`,
      visual: lv < 3 ? arrows([{ name: "u", x: u[0], y: u[1] }, { name: "v", x: v[0], y: v[1] }]) : undefined,
      answer: vecAns(res[0], res[1]),
      hints: ["Work one component at a time.", `x: ${k === 1 ? "" : `${ms(k)} · `}${sn(u[0])} ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : `${Math.abs(m)} · `}${sn(v[0])}.`],
      steps: [
        ...(k !== 1 || Math.abs(m) !== 1 ? [st("Scale.", `${k === 1 ? "u" : `${ms(k)}u`} = ${vec(k * u[0], k * u[1])}, ${Math.abs(m) === 1 ? "v" : `${Math.abs(m)}v`} = ${vec(Math.abs(m) * v[0], Math.abs(m) * v[1])}`)] : []),
        st("x-component.", `${ms(k * u[0])} ${m < 0 ? "−" : "+"} ${sn(Math.abs(m) * v[0])} = ${ms(res[0])}`),
        st("y-component.", `${ms(k * u[1])} ${m < 0 ? "−" : "+"} ${sn(Math.abs(m) * v[1])} = ${ms(res[1])}`),
        st("Result.", vec(res[0], res[1])),
      ],
    };
  },
};

const resultant: Skill = {
  id: "pc.vectors.resultant",
  title: "Resultant vectors in context",
  topic: T,
  standards: ["PC.N.3.2", "PC.N.3.1"],
  prereqs: ["pc.vectors.components", "pc.vectors.add"],
  lesson: {
    bigIdea: "When several pushes or velocities act together, the actual result is their vector sum. Break each into components, add, then find the magnitude and direction.",
    explain: [
      "A plane heads north at 300 mph and the wind blows east at 40 mph. Ground velocity ⟨40, 300⟩. Ground speed √(40^2 + 300^2) ≈ **302.7 mph**.",
      "Two ropes pull a crate: 80 N at 20° and 60 N at 110°. Components: 80⟨cos 20°, sin 20°⟩ + 60⟨cos 110°, sin 110°⟩ ≈ ⟨75.2, 27.4⟩ + ⟨−20.5, 56.4⟩ = ⟨54.7, 83.7⟩, so the resultant is about 100 N.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why isn't the plane's ground speed simply 300 + 40 = 340 mph?", choices: ["The wind is perpendicular to the heading, so the velocities add as vectors (Pythagorean Theorem), not as plain numbers.", "Because wind slows planes down.", "Because the plane speeds up to 340.", "It is 340 mph."], correct: 0, explain: "Speeds only add directly when they point the same way. At a right angle, the result is the hypotenuse √(300^2 + 40^2)." },
    { kind: "written", prompt: "A swimmer heads straight across a river at 2 m/s while the current flows downstream at 1.5 m/s. Explain how to find how fast the swimmer actually moves and why they land downstream.", keyIdeas: ["velocity is ⟨1.5, 2⟩ (downstream, across)", "speed √(1.5^2 + 2^2) = 2.5 m/s", "the current adds a sideways component, so the path angles downstream"], exemplar: "Add the vectors: across 2 m/s and downstream 1.5 m/s give ⟨1.5, 2⟩. The speed is √(2.25 + 4) = 2.5 m/s. Because of the downstream component, the swimmer drifts with the current and lands downstream of the starting point." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const s = r.pick([250, 300, 400, 450, 500]), w = r.pick([20, 30, 40, 50, 60]);
      const g = Math.sqrt(s * s + w * w);
      return {
        prompt: `A plane heads due north at ${s} mph. A wind blows due east at ${w} mph. What is the plane's ground speed, to the nearest tenth of a mph?`,
        visual: { type: "geo", showLabels: true, points: { O: { x: 0, y: 0 }, N: { x: 0, y: s / 50 }, R: { x: w / 10, y: s / 50 } }, segments: [{ from: "O", to: "N", label: `${s}` }, { from: "N", to: "R", label: `${w}` }, { from: "O", to: "R", label: "ground", dashed: true }] },
        answer: num(round(g, 1), { tolerance: 0.1, unit: " mph" }),
        hints: [`Velocity vectors: ⟨0, ${s}⟩ and ⟨${w}, 0⟩. Add them.`, `Resultant ⟨${w}, ${s}⟩. Its magnitude is √(${w}^2 + ${s}^2).`],
        steps: [st("Add the vectors.", `⟨0, ${s}⟩ + ⟨${w}, 0⟩ = ⟨${w}, ${s}⟩`), st("Magnitude.", `√(${w * w} + ${s * s}) ≈ ${f1(g)} mph`)],
        traps: trapsTol(round(g, 1), 0.1, [trap(s + w, "The velocities are perpendicular, so they don't add directly."), trap(s - w, "The wind is sideways, not a headwind.")]),
      };
    }
    const F1 = r.pick([40, 50, 60, 80, 100]), F2 = r.pick([30, 45, 60, 75]);
    const a1 = r.int(0, 40), a2 = a1 + r.int(50, 120);
    const x = F1 * Math.cos(rad(a1)) + F2 * Math.cos(rad(a2)), y = F1 * Math.sin(rad(a1)) + F2 * Math.sin(rad(a2));
    const mag = Math.hypot(x, y), dir = dirAngle(x, y);
    const base = `Two people pull a sled with ropes: ${F1} N at ${a1}${DEG} and ${F2} N at ${a2}${DEG} (angles counterclockwise from east).`;
    const vis: Visual = { type: "geo", showLabels: false, points: { O: { x: 0, y: 0 }, A: { x: F1 * Math.cos(rad(a1)), y: F1 * Math.sin(rad(a1)) }, B: { x: F2 * Math.cos(rad(a2)), y: F2 * Math.sin(rad(a2)) }, S: { x, y } }, segments: [{ from: "O", to: "A", label: `${F1} N` }, { from: "O", to: "B", label: `${F2} N` }, { from: "O", to: "S", label: "resultant", dashed: true }] };
    const compSteps = [
      st("Components of each force.", `${F1}⟨cos ${a1}°, sin ${a1}°⟩ ≈ ${vec(f2(F1 * Math.cos(rad(a1))), f2(F1 * Math.sin(rad(a1))))}; ${F2}⟨cos ${a2}°, sin ${a2}°⟩ ≈ ${vec(f2(F2 * Math.cos(rad(a2))), f2(F2 * Math.sin(rad(a2))))}`),
      st("Add.", `resultant ≈ ${vec(f2(x), f2(y))}`),
    ];
    if (lv === 2) {
      return {
        prompt: `${base} Find the magnitude of the resultant force, to the nearest tenth of a newton.`,
        visual: vis,
        answer: num(round(mag, 1), { tolerance: 0.15, unit: " N" }),
        hints: ["Break each force into components with ⟨F cos θ, F sin θ⟩.", "Add the components, then use √(x^2 + y^2)."],
        steps: [...compSteps, st("Magnitude.", `√(${f2(x)}^2 + ${f2(y)}^2) ≈ ${f1(mag)} N`)],
        traps: trapsTol(round(mag, 1), 0.15, [trap(F1 + F2, "Forces at different angles don't add as plain numbers.")]),
      };
    }
    return {
      prompt: `${base} Find the direction angle of the resultant, to the nearest tenth of a degree.`,
      visual: vis,
      answer: num(round(dir, 1), { tolerance: 0.15, unit: DEG }),
      hints: ["Add the components first.", `Then θ = tan^-1(y/x), adjusted for the quadrant of the resultant.`],
      steps: [...compSteps, st("Direction.", `tan^-1({${f2(y)}/${f2(x)}}) → θ ≈ ${f1(dir)}°${x < 0 ? " (x < 0, so 180° was added)" : ""}`)],
      traps: trapsTol(round(dir, 1), 0.15, [trap(round((a1 + a2) / 2, 1), "Averaging the angles only works when the forces are equal.")]),
    };
  },
};

export default [magnitude, components, add, resultant];
