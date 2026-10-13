// Unit 6: Trigonometric functions: radians, the unit circle, and sinusoidal graphs and models.
import { choice, exact, expr, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { dn, piPlain, piReduce, piText, piTyped, trapsTol, trigExact } from "./util";

const T = "m3-trig";
const HALF_PI = Math.PI / 2;

/** Unit circle figure with the terminal point of angle t (radians). */
function unitCircle(t: number): Visual {
  const x = Math.cos(t), y = Math.sin(t);
  const clean = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v);
  return {
    type: "geo",
    points: { O: { x: 0, y: 0 }, A: { x: 1, y: 0 }, P: { x: clean(x), y: clean(y) }, Q: { x: clean(x), y: 0 }, L: { x: -1, y: 0 }, U: { x: 0, y: 1 }, D: { x: 0, y: -1 } },
    circles: [{ center: "O", r: 1 }],
    segments: [{ from: "L", to: "A", dashed: true }, { from: "D", to: "U", dashed: true }, { from: "O", to: "P" }, ...(Math.abs(y) > 1e-9 && Math.abs(x) > 1e-9 ? [{ from: "P", to: "Q", dashed: true }] : [])],
  };
}

const QUAD = ["I", "II", "III", "IV"];
/** Quadrant (0..3) of a non-quadrantal angle n·π/d. */
function quadrantOf(n: number, d: number): number {
  let t = (n / d) % 2;
  if (t < 0) t += 2;
  return Math.floor(t / 0.5);
}

// ---------------------------------------------------------------------------
const radians: Skill = {
  id: "m3.trig.radians",
  title: "Radian measure",
  topic: T,
  standards: ["NC.M3.F-TF.1", "NC.M3.G-C.5"],
  prereqs: [],
  lesson: {
    bigIdea: "An angle's radian measure is the arc length it cuts off divided by the radius: θ = {s/r}. A full turn is 2π radians, so 180° = π radians.",
    explain: [
      "On a circle of radius 5 cm, an arc of 10 cm has central angle θ = {10/5} = **2 radians**, no matter how big the circle is drawn.",
      "Degrees to radians: multiply by {π/180}. 150° = 150 · {π/180} = **{5π/6}**.",
      "Radians to degrees: multiply by {180/π}. {3π/4} = {3/4} · 180° = **135°**.",
    ],
    visual: { type: "geo", points: { O: { x: 0, y: 0 }, A: { x: 5, y: 0 }, B: { x: 5 * Math.cos(2), y: 5 * Math.sin(2) } }, circles: [{ center: "O", r: 5 }], segments: [{ from: "O", to: "A", label: "r = 5" }, { from: "O", to: "B" }], angles: [{ at: "O", from: "A", to: "B", label: "2 rad" }], showLabels: false },
    tip: "Radians have no unit: arc length ÷ radius is cm ÷ cm, a pure number.",
  },
  why: [
    { kind: "choice", prompt: "Why is a full circle 2π radians?", choices: ["The whole circumference is 2πr, and 2πr ÷ r = 2π.", "Because π is about 3.14 and 2 · 3.14 is close to 360.", "It's a convention with no reason."], correct: 0, explain: "Radians measure arc length in units of the radius, and a full turn's arc is 2πr." },
    { kind: "written", prompt: "Two circles have radii 3 cm and 6 cm. On each, a central angle of 1.5 radians is drawn. Explain how the arc lengths compare.", keyIdeas: ["arc length s = rθ", "small circle: 3 · 1.5 = 4.5 cm; large: 6 · 1.5 = 9 cm", "the arc length is proportional to the radius; the angle is the same"], exemplar: "Since θ = s/r, the arc length is s = rθ. The 3 cm circle gives 4.5 cm and the 6 cm circle gives 9 cm. Doubling the radius doubles the arc, but the angle stays 1.5 radians." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const deg = r.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]);
      const a = piReduce(deg, 180);
      return {
        prompt: `Convert ${deg}° to radians. Give an exact answer in terms of π.`,
        answer: exact(piTyped(a.n, a.d), piText(a.n, a.d)),
        hints: ["Multiply by {π/180}.", `${deg} · {π/180} = {${deg}π/180}. Simplify the fraction.`],
        steps: [st("Multiply by π/180.", `${deg}° · {π/180} = {${deg}π/180}`), st("Simplify.", `{${deg}/180} = ${a.d === 1 ? a.n : `{${a.n}/${a.d}}`}, so ${deg}° = ${piText(a.n, a.d)}`)],
      };
    }
    if (lv === 2) {
      const d = r.pick([2, 3, 4, 6, 12]);
      let n = r.int(1, 2 * d);
      if (piReduce(n, d).d !== d) n = 1;
      const deg = (180 * n) / d;
      return {
        prompt: `Convert ${piText(n, d)} radians to degrees.`,
        answer: num(deg, { unit: "°" }),
        hints: ["Multiply by {180/π}. The π's cancel.", `${piText(n, d)} · {180/π} = {${n === 1 ? "" : n} · 180/${d}}.`],
        steps: [st("Multiply by 180/π.", `${piText(n, d)} · {180/π} = {${n === 1 ? "180" : `${n} · 180`}/${d}}`), st("Compute.", `= ${deg}°`)],
        traps: traps(frac(deg), [trap(frac(180 * d, n), "You flipped the fraction. Multiply by {180/π}, so the 180 multiplies the top."), trap(Math.round((n / d) * Math.PI * 100) / 100, "That's the radian measure as a decimal, not degrees.")]),
      };
    }
    const rad = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]);
    const theta = r.pick([0.5, 1.5, 2, 2.5, 3, 0.8, 1.2, 1.6]);
    const s = Math.round(rad * theta * 100) / 100;
    if (r.chance(0.5)) {
      return {
        prompt: `A central angle in a circle of radius ${rad} cm cuts off an arc of length ${dn(s)} cm. What is the angle's measure in radians?`,
        answer: num(theta, { unit: " radians" }),
        hints: ["Radian measure = arc length ÷ radius.", `θ = {${dn(s)}/${rad}}.`],
        steps: [st("Use θ = s/r.", `θ = {${dn(s)}/${rad}} = ${dn(theta)}`), st("Interpret.", `The arc is ${dn(theta)} radius-lengths long.`)],
        traps: traps(frac(Math.round(theta * 100), 100), [trap(Math.round((rad / s) * 100) / 100, "That's r ÷ s. Radians are arc length ÷ radius."), trap(Math.round(s * rad * 100) / 100, "Divide the arc length by the radius; don't multiply.")]),
      };
    }
    return {
      prompt: `A windshield wiper ${rad} inches long sweeps through an angle of ${dn(theta)} radians. How far does its tip travel along the arc?`,
      answer: num(s, { unit: " inches" }),
      hints: ["Arc length s = rθ (θ in radians).", `s = ${rad} · ${dn(theta)}.`],
      steps: [st("Use s = rθ.", `s = ${rad} · ${dn(theta)} = ${dn(s)} inches`)],
      traps: traps(frac(Math.round(s * 100), 100), [trap(Math.round((rad / theta) * 100) / 100, "Multiply the radius by the angle; don't divide."), trap(Math.round(((theta * Math.PI * rad) / 180) * 100) / 100, "θ is already in radians, so you don't need π/180.")]),
    };
  },
};

// ---------------------------------------------------------------------------
const unitCircleSkill: Skill = {
  id: "m3.trig.unit-circle",
  title: "Sine and cosine on the unit circle",
  topic: T,
  standards: ["NC.M3.F-TF.2", "NC.M3.F-TF.2a", "NC.M3.F-IF.1"],
  prereqs: ["m3.trig.radians"],
  lesson: {
    bigIdea: "Go θ radians counterclockwise around the unit circle from (1, 0). The point you land on is (cos θ, sin θ): cosine is the x-coordinate and sine is the y-coordinate.",
    explain: [
      "Key first-quadrant points: θ = {π/6} → ({√3/2}, {1/2}); θ = {π/4} → ({√2/2}, {√2/2}); θ = {π/3} → ({1/2}, {√3/2}); θ = {π/2} → (0, 1).",
      "Other quadrants use the same numbers with signs. θ = {5π/6} has reference angle {π/6} and lies in Quadrant II (x negative, y positive): cos {5π/6} = −{√3/2}, sin {5π/6} = {1/2}.",
      "Because the point is on the circle x^2 + y^2 = 1, cos^2 θ + sin^2 θ = 1 for every θ.",
    ],
    visual: unitCircle((5 * Math.PI) / 6),
    tip: "The reference angle is the acute angle between the terminal side and the x-axis.",
  },
  why: [
    { kind: "choice", prompt: "Why is sin θ the y-coordinate of the point on the unit circle?", choices: ["In the right triangle under the point, sin θ = opposite/hypotenuse = y/1 = y.", "Because sine comes after cosine, like y after x.", "It's only true for θ < π/2."], correct: 0, explain: "With hypotenuse 1, the opposite side is the y-coordinate; this definition then extends to every angle." },
    { kind: "written", prompt: "Explain why cos(π) = −1 and sin(π) = 0.", keyIdeas: ["π radians is half a turn", "the point is (−1, 0)", "cosine is the x-coordinate, sine is the y-coordinate"], exemplar: "Going π radians is half a turn around the unit circle, from (1, 0) to (−1, 0). The x-coordinate is −1, so cos π = −1, and the y-coordinate is 0, so sin π = 0." },
  ],
  generate(r, lv) {
    let n: number, d: number;
    if (lv === 1) [n, d] = r.pick([[0, 1], [1, 6], [1, 4], [1, 3], [1, 2], [1, 1], [3, 2]] as [number, number][]);
    else {
      d = r.pick([6, 4, 3]);
      const options = Array.from({ length: 2 * d }, (_, i) => i).filter((i) => i % (d / (d === 6 ? 1 : 1)) !== 0 || true).filter((i) => piReduce(i, d).d === d);
      n = r.pick(options);
      if (lv === 3) n += r.pick([-2 * d, 2 * d]);
    }
    const t = (n / d) * Math.PI;
    const fn = r.pick(["sin", "cos"] as const);
    const v = fn === "sin" ? Math.sin(t) : Math.cos(t);
    const ex = trigExact(v);
    const cosE = trigExact(Math.cos(t)), sinE = trigExact(Math.sin(t));
    const angle = piText(n, d);
    const red = piReduce(n, d);
    let tm = (n / d) % 2;
    if (tm < 0) tm += 2;
    const co = lv === 3 ? piReduce(Math.round(tm * d), d) : red;
    return {
      prompt: `Find the exact value of ${fn}(${angle}). The terminal point P on the unit circle is shown.`,
      visual: unitCircle(t),
      answer: exact(ex.typed, ex.display),
      hints: [
        lv === 3 ? `Add or subtract 2π to find a coterminal angle between 0 and 2π: ${piText(co.n, co.d)}.` : `${fn === "sin" ? "Sine is the y-coordinate" : "Cosine is the x-coordinate"} of P.`,
        `P = (${cosE.display}, ${sinE.display}). ${fn === "sin" ? "Take the y-coordinate." : "Take the x-coordinate."}`,
      ],
      steps: [
        ...(lv === 3 ? [st("Find a coterminal angle.", `${angle} ${n < 0 ? "+" : "−"} 2π = ${piText(co.n, co.d)} (same terminal side)`)] : []),
        st("Locate the point.", `The terminal point for ${piText(co.n, co.d)} is P = (${cosE.display}, ${sinE.display}).`),
        st(fn === "sin" ? "Sine is the y-coordinate." : "Cosine is the x-coordinate.", `${fn}(${angle}) = ${ex.display}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const quadrant: Skill = {
  id: "m3.trig.quadrant",
  title: "Signs of sine and cosine by quadrant",
  topic: T,
  standards: ["NC.M3.F-TF.2a", "NC.M3.F-TF.2"],
  prereqs: ["m3.trig.unit-circle"],
  lesson: {
    bigIdea: "The signs of cos θ and sin θ are the signs of the x- and y-coordinates of the terminal point, so they depend on the quadrant.",
    explain: [
      "Quadrant I: both positive. Quadrant II: cos < 0, sin > 0. Quadrant III: both negative. Quadrant IV: cos > 0, sin < 0.",
      "If sin θ = −{3/5} and θ is in Quadrant IV, use x^2 + y^2 = 1: cos^2 θ = 1 − {9/25} = {16/25}, so cos θ = ±{4/5}.",
      "Quadrant IV has positive x, so **cos θ = {4/5}**.",
    ],
    visual: unitCircle(-Math.asin(0.6)),
  },
  why: [
    { kind: "choice", prompt: "Why is cos θ negative in Quadrant II?", choices: ["Points in Quadrant II have negative x-coordinates, and cos θ is the x-coordinate.", "Because Quadrant II is on top.", "Cosine is negative in every quadrant except I."], correct: 0, explain: "Quadrant II is left of the y-axis, where x < 0." },
    { kind: "written", prompt: "Explain why sin^2 θ + cos^2 θ = 1 for every angle θ.", keyIdeas: ["(cos θ, sin θ) is a point on the unit circle", "the unit circle is x^2 + y^2 = 1", "substitute x = cos θ, y = sin θ"], exemplar: "The point (cos θ, sin θ) is on the unit circle, whose equation is x^2 + y^2 = 1 (every point is 1 unit from the origin). Substituting gives cos^2 θ + sin^2 θ = 1." },
  ],
  generate(r, lv) {
    const sigText = (q: number) => `Quadrant ${QUAD[q]}: sin θ ${q < 2 ? ">" : "<"} 0 and cos θ ${q === 0 || q === 3 ? ">" : "<"} 0`;
    if (lv === 1) {
      const d = r.pick([6, 4, 3]);
      const opts = Array.from({ length: 2 * d }, (_, i) => i).filter((i) => i % (d / 2) !== 0 || d === 3).filter((i) => piReduce(i, d).d === d && i > 0);
      const n = r.pick(opts);
      const q = quadrantOf(n, d);
      return {
        prompt: `In which quadrant is the terminal side of θ = ${piText(n, d)}, and what are the signs of sin θ and cos θ?`,
        answer: choice(r, sigText(q), [0, 1, 2, 3].filter((k) => k !== q).map((k) => [sigText(k), "Compare the angle with π/2, π and 3π/2 to find the quadrant."] as [string, string]), true),
        hints: [`Compare ${piText(n, d)} with {π/2}, π and {3π/2}.`, `${piText(n, d)} ≈ ${dn((n / d) * 180, 0)}°.`],
        steps: [st("Locate the angle.", `${piText(n, d)} = ${dn((n / d) * 180, 0)}°, which is between ${q * 90}° and ${(q + 1) * 90}°: Quadrant ${QUAD[q]}.`), st("Signs.", `In Quadrant ${QUAD[q]}, x is ${q === 0 || q === 3 ? "positive" : "negative"} and y is ${q < 2 ? "positive" : "negative"}.`), st("Answer.", sigText(q))],
      };
    }
    if (lv === 2) {
      const q = r.int(0, 3);
      const sinS = q < 2 ? "positive" : "negative", cosS = q === 0 || q === 3 ? "positive" : "negative";
      return {
        prompt: `sin θ is ${sinS} and cos θ is ${cosS}. In which quadrant does θ's terminal side lie?`,
        answer: choice(r, `Quadrant ${QUAD[q]}`, [0, 1, 2, 3].filter((k) => k !== q).map((k) => [`Quadrant ${QUAD[k]}`, "Sine is the y-coordinate and cosine is the x-coordinate."] as [string, string]), true),
        hints: ["cos θ is the x-coordinate; sin θ is the y-coordinate.", `x ${cosS}, y ${sinS}: which quadrant is that?`],
        steps: [st("Translate to coordinates.", `x is ${cosS} and y is ${sinS}.`), st("Answer.", `Quadrant ${QUAD[q]}`)],
      };
    }
    const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as [number, number, number][]);
    const q = r.int(1, 3);
    const giveSin = r.chance(0.5);
    const [gv, ov] = r.chance(0.5) ? [a, b] : [b, a];
    const sinSign = q < 2 ? 1 : -1, cosSign = q === 3 ? 1 : -1;
    const given = frac(gv * (giveSin ? sinSign : cosSign), c);
    const ans = frac(ov * (giveSin ? cosSign : sinSign), c);
    const gT = `${given.n < 0 ? "−" : ""}{${Math.abs(given.n)}/${c}}`;
    const want = giveSin ? "cos" : "sin";
    return {
      prompt: `${giveSin ? "sin" : "cos"} θ = ${gT} and θ is in Quadrant ${QUAD[q]}. Find ${want} θ.`,
      answer: num(ans),
      hints: ["Use sin^2 θ + cos^2 θ = 1.", `${want}^2 θ = 1 − ({${gv}/${c}})^2 = {${c * c - gv * gv}/${c * c}}. Choose the sign from the quadrant.`],
      steps: [
        st("Pythagorean identity.", `${want}^2 θ = 1 − ({${gv}/${c}})^2 = {${c * c}/${c * c}} − {${gv * gv}/${c * c}} = {${ov * ov}/${c * c}}`),
        st("Square root.", `${want} θ = ±{${ov}/${c}}`),
        st("Sign from the quadrant.", `In Quadrant ${QUAD[q]}, ${want} θ is ${(giveSin ? cosSign : sinSign) > 0 ? "positive" : "negative"}, so ${want} θ = ${ans.n < 0 ? "−" : ""}{${ov}/${c}}.`),
      ],
      traps: traps(ans, [trap(frac(-ans.n, ans.d), `Check the sign: in Quadrant ${QUAD[q]}, ${want} θ is ${(giveSin ? cosSign : sinSign) > 0 ? "positive" : "negative"}.`), trap(frac(ov * ov, c * c), "That's the square. Take the square root.")]),
    };
  },
};

// ---------------------------------------------------------------------------
const graph: Skill = {
  id: "m3.trig.graph",
  title: "Graphs of sine and cosine",
  topic: T,
  standards: ["NC.M3.F-TF.2b", "NC.M3.F-IF.4", "NC.M3.F-IF.1"],
  prereqs: ["m3.trig.unit-circle"],
  lesson: {
    bigIdea: "Unwrapping the unit circle gives the graphs: y = sin x plots the y-coordinate and y = cos x the x-coordinate as the angle x increases. Both repeat every 2π (they're periodic).",
    explain: [
      "y = sin x starts at 0, peaks at 1 when x = {π/2}, returns to 0 at π, bottoms out at −1 at {3π/2}, and is back to 0 at 2π. Then it repeats.",
      "y = cos x is the same wave shifted: it starts at its maximum, 1, when x = 0.",
      "Periodicity: sin(x + 2π) = sin x for every x. So if sin(0.5) ≈ 0.479, then sin(0.5 + 2π) ≈ 0.479 as well.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5, xStep: HALF_PI, yStep: 0.5, curves: [{ expr: "sin(x)", label: "sin x" }, { expr: "cos(x)", label: "cos x", color: 2, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why does the graph of y = sin x repeat every 2π?", choices: ["After 2π radians you're back at the same point on the unit circle, so the y-coordinate repeats.", "Because the graph is drawn that way.", "It repeats every π."], correct: 0, explain: "Angles that differ by a full turn have the same terminal point." },
    { kind: "written", prompt: "Explain why −1 ≤ sin x ≤ 1 for every x.", keyIdeas: ["sin x is the y-coordinate of a point on the unit circle", "the unit circle has radius 1", "y-coordinates on it go from −1 to 1"], exemplar: "sin x is the y-coordinate of a point on the unit circle. The circle has radius 1, so its points range from y = −1 at the bottom to y = 1 at the top. That's why sine never goes outside −1 to 1." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const cases = [
        { f: "cos", q: "reach its minimum value", n: 1, d: 1 },
        { f: "sin", q: "reach its maximum value", n: 1, d: 2 },
        { f: "sin", q: "reach its minimum value", n: 3, d: 2 },
        { f: "cos", q: "first equal 0", n: 1, d: 2 },
        { f: "cos", q: "equal 0 for the second time", n: 3, d: 2 },
      ];
      const c = r.pick(cases);
      const opts = [[1, 2], [1, 1], [3, 2], [2, 1]].filter(([n, d]) => !(n === c.n && d === c.d));
      return {
        prompt: `Using the graph of y = ${c.f} x on 0 ≤ x ≤ 2π, at what x-value does it ${c.q}?`,
        visual: { type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5, xStep: HALF_PI, yStep: 0.5, curves: [{ expr: `${c.f}(x)` }] },
        answer: choice(r, `x = ${piPlain(c.n, c.d)}`, opts.map(([n, d]) => [`x = ${piPlain(n, d)}`, `Check the graph at x = ${piPlain(n, d)}: ${c.f}(${piPlain(n, d)}) = ${trigExact(c.f === "sin" ? Math.sin((n / d) * Math.PI) : Math.cos((n / d) * Math.PI)).plain}.`] as [string, string]), true),
        hints: [`Read the graph, or think of the unit circle: ${c.f} x is the ${c.f === "sin" ? "y" : "x"}-coordinate.`, `Where on the unit circle is the ${c.f === "sin" ? "y" : "x"}-coordinate ${c.q.includes("max") ? "1" : c.q.includes("min") ? "−1" : "0"}?`],
        steps: [st("Read the graph.", `y = ${c.f} x ${c.q.replace("reach", "reaches").replace("first equal", "first equals").replace("equal 0 for", "equals 0 for")} at x = ${piPlain(c.n, c.d)}.`), st("Check on the unit circle.", `${c.f}(${piPlain(c.n, c.d)}) = ${trigExact(c.f === "sin" ? Math.sin((c.n / c.d) * Math.PI) : Math.cos((c.n / c.d) * Math.PI)).plain}`)],
      };
    }
    if (lv === 2) {
      const f = r.pick(["sin", "cos"]);
      const c = r.pick([0.5, -0.5, 1, -1, 0, 0.8, -0.3, 1.5]);
      const xs: number[] = [];
      for (let k = 0; k < 4000; k++) {
        const x = (2 * Math.PI * k) / 4000;
        const y = f === "sin" ? Math.sin(x) : Math.cos(x);
        const x2 = (2 * Math.PI * (k + 1)) / 4000;
        const y2 = f === "sin" ? Math.sin(x2) : Math.cos(x2);
        if (Math.abs(y - c) < 1e-12 || (y - c) * (y2 - c) < 0) xs.push(x);
      }
      let count: number;
      if (Math.abs(c) > 1) count = 0;
      else if (c === 1) count = 1;
      else if (c === -1) count = 1;
      else if (c === 0) count = 2;
      else count = 2;
      return {
        prompt: `How many solutions does ${f} x = ${ms(c)} have on 0 ≤ x < 2π? Use the graph.`,
        visual: { type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -2, yMax: 2, xStep: HALF_PI, yStep: 0.5, curves: [{ expr: `${f}(x)` }, { expr: String(c), color: 2, dashed: true, label: `y = ${ms(c)}` }] },
        answer: num(count),
        hints: [`Count where the horizontal line y = ${ms(c)} meets the curve between 0 and 2π (not including 2π).`, Math.abs(c) > 1 ? `${f} x is always between −1 and 1.` : Math.abs(c) === 1 ? "The line just touches the top or bottom of one wave." : "In one full period, a level strictly between −1 and 1 is crossed twice."],
        steps: [st("Count intersections.", `The line y = ${ms(c)} meets y = ${f} x ${count === 0 ? "nowhere" : `${count} time${count === 1 ? "" : "s"}`} on 0 ≤ x < 2π${xs.length && count ? ` (near x ≈ ${xs.slice(0, count).map((x) => dn(x)).join(" and ")})` : ""}.`), st("Answer.", `${count} solution${count === 1 ? "" : "s"}`)],
        traps: traps(frac(count), [trap(count === 2 ? 1 : 2, Math.abs(c) === 1 ? "The line touches the curve only once per period." : "Look at the whole interval from 0 to 2π.")]),
      };
    }
    const a = r.pick([0.3, 0.5, 0.7, 0.9, 1.1, 1.3]);
    const f = r.pick(["sin", "cos"]);
    const v = f === "sin" ? Math.sin(a) : Math.cos(a);
    const ans = Math.round((a + 2 * Math.PI) * 100) / 100;
    return {
      prompt: `${f}(${a}) ≈ ${dn(v, 3)}. Using the period of ${f}, what is the smallest x greater than 2π with ${f} x = ${f}(${a})? Round to the nearest hundredth.`,
      answer: num(ans, { tolerance: 0.01 }),
      hints: [`${f} repeats every 2π: ${f}(x + 2π) = ${f} x.`, `Add 2π ≈ 6.28 to ${a}.`],
      steps: [st("Use periodicity.", `${f}(${a} + 2π) = ${f}(${a})`), st("Compute.", `${a} + 2π ≈ ${a} + 6.2832 = ${dn(ans)}`), st("Check it's the smallest.", `On (2π, 4π) the graph repeats the 0 to 2π cycle, and x = ${a} was the first value with this output, so ${dn(ans)} is the first one after 2π.`)],
      traps: trapsTol(ans, 0.01, [[a + Math.PI, "The period of sine and cosine is 2π, not π."], [a + 360, "Work in radians: add 2π, not 360."]]),
    };
  },
};

// ---------------------------------------------------------------------------
const features: Skill = {
  id: "m3.trig.features",
  title: "Amplitude, period and midline",
  topic: T,
  standards: ["NC.M3.F-TF.5", "NC.M3.F-IF.7", "NC.M3.F-BF.3"],
  prereqs: ["m3.trig.graph"],
  lesson: {
    bigIdea: "In f(x) = a·sin(bx) + h: |a| is the amplitude (half the height of the wave), y = h is the midline, and the period is {2π/b}.",
    explain: [
      "f(x) = 3 sin(2x) + 1: amplitude 3, midline y = 1, so the wave runs from 1 − 3 = −2 up to 1 + 3 = 4.",
      "Period: {2π/2} = π. The wave fits a full cycle into π instead of 2π, so it's squeezed horizontally.",
      "If a is negative, the wave is flipped (it starts by going down), but the amplitude is still |a|.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -3, yMax: 5, xStep: HALF_PI, curves: [{ expr: "3sin(2x)+1" }], hlines: [{ y: 1, dashed: true, label: "midline y = 1" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the period of sin(2x) equal to π?", choices: ["2x runs through a full 2π when x goes from 0 to π.", "Because 2 · π = 2π.", "The period is always 2π."], correct: 0, explain: "The inside, 2x, completes one cycle twice as fast, so x only needs to go half as far." },
    { kind: "written", prompt: "Explain how to find the maximum and minimum values of g(x) = −4 cos(x) + 7.", keyIdeas: ["cos x ranges from −1 to 1", "so −4 cos x ranges from −4 to 4", "max 7 + 4 = 11 and min 7 − 4 = 3"], exemplar: "cos x is between −1 and 1, so −4 cos x is between −4 and 4. Adding 7 shifts that to between 3 and 11. The maximum is 11 and the minimum is 3: midline 7, amplitude 4." },
  ],
  generate(r, lv) {
    const fn = r.pick(["sin", "cos"]);
    if (lv === 1) {
      const a = r.pick([2, 3, 4, 5, -2, -3, 0.5]), b = r.pick([1, 2, 3]), h = r.int(-5, 6);
      const aD = a === 0.5 ? "{1/2}" : a === -1 ? "−" : ms(a);
      return {
        prompt: `f(x) = ${aD} ${fn}(${b === 1 ? "" : b}x)${h ? (h > 0 ? ` + ${h}` : ` − ${-h}`) : ""}. Find the amplitude and the midline y = k.`,
        answer: { kind: "multi", fields: [{ value: frac(Math.abs(a) * 2, 2), pre: "amplitude:" }, { value: frac(h), pre: "midline: y =" }] },
        hints: ["The amplitude is |a|, the number multiplying the sine or cosine (ignore its sign).", "The midline is the number added at the end."],
        steps: [st("Amplitude.", `|${ms(a)}| = ${dn(Math.abs(a))}`), st("Midline.", `y = ${ms(h)}`)],
      };
    }
    if (lv === 2) {
      const a = r.pick([2, 3, 4, -2]), b = r.pick([2, 3, 4, 6, 0.5]), h = r.int(-4, 4);
      const per = b === 0.5 ? { n: 4, d: 1 } : piReduce(2, b);
      return {
        prompt: `What is the period of f(x) = ${ms(a)} ${fn}(${b === 0.5 ? "{1/2}" : b}x)${h ? (h > 0 ? ` + ${h}` : ` − ${-h}`) : ""}? Give an exact answer in terms of π.`,
        answer: exact(piTyped(per.n, per.d), piText(per.n, per.d)),
        hints: ["Period = {2π/b}, where b multiplies x inside the function.", `b = ${b === 0.5 ? "{1/2}" : b}, so the period is 2π ÷ ${b === 0.5 ? "{1/2}" : b}.`],
        steps: [st("Use period = 2π/b.", `{2π/${b === 0.5 ? "1/2" : b}} = ${piText(per.n, per.d)}`), st("Interpret.", `The graph completes one full cycle every ${piText(per.n, per.d)} units.`)],
      };
    }
    if (r.chance(0.5)) {
      const k = r.pick([2, 3, 4, 6, 12]);
      const a = r.int(2, 9), h = r.int(5, 20);
      const per = 2 * k;
      return {
        prompt: `The temperature in a greenhouse is modeled by T(t) = ${a} ${fn}({π/${k}}t) + ${h} (°C), with t in hours. What is the period of this model, in hours?`,
        answer: num(per, { unit: " hours" }),
        hints: ["Period = {2π/b}.", `Here b = {π/${k}}, so the period is 2π ÷ {π/${k}} = 2π · {${k}/π}.`],
        steps: [st("Use period = 2π/b.", `2π ÷ {π/${k}} = 2π · {${k}/π} = ${per}`), st("Interpret.", `The temperature pattern repeats every ${per} hours.`)],
        traps: traps(frac(per), [trap(k, `Period is 2π ÷ b, which is 2 · ${k}, not ${k}.`), trap(Math.round(((2 * Math.PI) / (Math.PI / k)) * Math.PI * 100) / 100, "The π's cancel; the period is a whole number of hours.")]),
      };
    }
    const a = r.pick([-2, -3, -4, -5, 3, 6]), h = r.int(-3, 8);
    return {
      prompt: `Find the maximum and minimum values of g(x) = ${ms(a)} ${fn}(x)${h ? (h > 0 ? ` + ${h}` : ` − ${-h}`) : ""}.`,
      answer: { kind: "multi", fields: [{ value: frac(h + Math.abs(a)), pre: "max:" }, { value: frac(h - Math.abs(a)), pre: "min:" }] },
      hints: [`${fn} x is between −1 and 1, so ${ms(a)} ${fn} x is between ${ms(-Math.abs(a))} and ${Math.abs(a)}.`, `Now add ${ms(h)}.`],
      steps: [st("Midline and amplitude.", `Midline y = ${ms(h)}, amplitude |${ms(a)}| = ${Math.abs(a)}.`), st("Max and min.", `${ms(h)} + ${Math.abs(a)} = ${ms(h + Math.abs(a))}; ${ms(h)} − ${Math.abs(a)} = ${ms(h - Math.abs(a))}`)],
    };
  },
};

// ---------------------------------------------------------------------------
const model: Skill = {
  id: "m3.trig.model",
  title: "Model periodic situations",
  topic: T,
  standards: ["NC.M3.F-TF.5", "NC.M3.F-IF.4", "NC.M3.F-BF.1"],
  prereqs: ["m3.trig.features"],
  lesson: {
    bigIdea: "For a repeating situation, find the midline (the middle value), the amplitude (half the distance from top to bottom) and the period, then build h(t) = a·sin(bt) + k with b = {2π/period}.",
    explain: [
      "A Ferris wheel is 40 m across, its center is 25 m high, and it turns once every 8 minutes. You board at the height of the center, moving up.",
      "Midline k = 25, amplitude a = 20 (the radius), period 8, so b = {2π/8} = {π/4}.",
      "**h(t) = 20 sin({π/4}t) + 25**. Highest point 45 m (at t = 2), lowest 5 m (at t = 6).",
    ],
    visual: { type: "plot", xMin: 0, xMax: 16, yMin: 0, yMax: 50, xStep: 2, yStep: 10, curves: [{ expr: "20sin(pi/4*x)+25" }], hlines: [{ y: 25, dashed: true, label: "midline" }] },
    tip: "sin starts at the midline going up; cos starts at the maximum.",
  },
  why: [
    { kind: "choice", prompt: "Tides go from a low of 2 ft to a high of 10 ft. Why is the amplitude 4 ft and not 8 ft?", choices: ["Amplitude is the distance from the midline (6 ft) to the top, which is half of 10 − 2.", "Because 10 − 2 = 8 is too big.", "It is 8 ft."], correct: 0, explain: "The wave goes 4 ft above and 4 ft below the midline." },
    { kind: "written", prompt: "A Ferris wheel takes 10 minutes per turn. Explain why the model uses b = π/5.", keyIdeas: ["the period is 10 minutes", "period = 2π/b", "b = 2π/10 = π/5"], exemplar: "The ride repeats every 10 minutes, so the period is 10. Since period = 2π/b, b = 2π/10 = π/5." },
  ],
  generate(r, lv) {
    const D = r.pick([30, 40, 50, 60, 80]), p = r.pick([2, 3, 5]);
    const A = D / 2, C = A + p;
    const Tm = r.pick([4, 6, 8, 10, 12, 20]);
    const b = piReduce(2, Tm);
    const intro = `A Ferris wheel has a diameter of ${D} m, and its lowest point is ${p} m above the ground. It turns once every ${Tm} minutes, and you board at the height of its center, moving up.`;
    if (lv === 1) {
      const q = r.pick(["max", "min", "mid"] as const);
      const ans = q === "max" ? C + A : q === "min" ? p : C;
      const ask = q === "max" ? "What is your maximum height?" : q === "min" ? "What is your minimum height?" : "What is the midline (the height of the center)?";
      return {
        prompt: `${intro.replace(", and you board at the height of its center, moving up", "")} ${ask}`,
        answer: num(ans, { unit: " m" }),
        hints: [`The radius is ${D} ÷ 2 = ${A} m.`, `The center is ${A} m above the lowest point: ${p} + ${A} = ${C} m.`],
        steps: [st("Radius (amplitude).", `${D} ÷ 2 = ${A} m`), st("Center (midline).", `${p} + ${A} = ${C} m`), st("Answer.", q === "max" ? `Top: ${C} + ${A} = ${C + A} m` : q === "min" ? `Bottom: ${p} m` : `Midline: ${C} m`)],
        traps: traps(frac(ans), [trap(q === "max" ? D : q === "min" ? 0 : A, q === "max" ? `Add the ${p} m gap below the wheel.` : q === "min" ? `The bottom of the wheel is ${p} m above the ground.` : "That's the radius. The midline is a height above the ground.")]),
      };
    }
    if (lv === 2) {
      const bT = `${b.n === 1 ? "" : b.n}pi/${b.d}`;
      return {
        prompt: `${intro} Write h(t), your height in meters after t minutes, in the form a·sin(bt) + k.`,
        answer: expr(`${A}sin(${bT}*t)+${C}`, { vars: ["t"], lhs: "h(t)", display: `${A} sin(${piText(b.n, b.d)}t) + ${C}` }),
        hints: [`Amplitude = radius = ${A}; midline = ${C}.`, `b = {2π/period} = {2π/${Tm}} = ${piText(b.n, b.d)}. Starting at the midline going up means sine.`],
        steps: [
          st("Amplitude.", `a = ${D} ÷ 2 = ${A}`),
          st("Midline.", `k = ${p} + ${A} = ${C}`),
          st("b from the period.", `b = {2π/${Tm}} = ${piText(b.n, b.d)}`),
          st("Write the model.", `h(t) = ${A} sin(${piText(b.n, b.d)}t) + ${C}`),
        ],
      };
    }
    if (r.chance(0.5)) {
      const k = r.pick([1, 2, 4, 5]);
      const t = (Tm * k) / 12;
      const v = A * Math.sin((2 * Math.PI * t) / Tm) + C;
      const ans = Math.round(v * 100) / 100;
      return {
        prompt: `${intro} The model is h(t) = ${A} sin(${piText(b.n, b.d)}t) + ${C}. How high are you after ${dn(t)} minutes? Round to the nearest hundredth.`,
        answer: num(ans, { tolerance: 0.01, unit: " m" }),
        hints: [`Substitute t = ${dn(t)}. Make sure your calculator is in radian mode.`, `${piText(b.n, b.d)} · ${dn(t)} = ${piText(k, 6)}, and sin(${piText(k, 6)}) = ${trigExact(Math.sin((k * Math.PI) / 6)).display}.`],
        steps: [
          st("Substitute.", `h(${dn(t)}) = ${A} sin(${piText(b.n, b.d)} · ${dn(t)}) + ${C} = ${A} sin(${piText(k, 6)}) + ${C}`),
          st("Evaluate.", `${A} · ${trigExact(Math.sin((k * Math.PI) / 6)).display} + ${C} ≈ ${dn(ans)} m`),
        ],
        traps: trapsTol(ans, 0.01, [[A * Math.sin((2 * Math.PI * t) / Tm * (Math.PI / 180)) + C, "Your calculator is in degree mode. Switch to radians."], [A + C, "That's the maximum height, reached a quarter of the way around."]]),
      };
    }
    const lo = r.int(1, 4), hi = lo + 2 * r.int(2, 5);
    const amp = (hi - lo) / 2, mid = (hi + lo) / 2;
    const t = r.pick([1, 2, 4, 5]);
    const v = amp * Math.sin((Math.PI * t) / 6) + mid;
    const ans = Math.round(v * 100) / 100;
    return {
      prompt: `At a harbor, the water depth goes between a low of ${lo} ft and a high of ${hi} ft, with 12 hours from one high tide to the next. At t = 0 the depth is at its midline and rising, so d(t) = ${amp} sin({π/6}t) + ${mid}. What is the depth at t = ${t} hours? Round to the nearest hundredth.`,
      answer: num(ans, { tolerance: 0.01, unit: " ft" }),
      hints: [`Substitute t = ${t}: d(${t}) = ${amp} sin({${t}π/6}) + ${mid}.`, `sin(${piText(t, 6)}) = ${trigExact(Math.sin((t * Math.PI) / 6)).display}.`],
      steps: [
        st("Check the model.", `Amplitude ({${hi} − ${lo}/2}) = ${amp}, midline ({${hi} + ${lo}/2}) = ${mid}, period 12 so b = {2π/12} = {π/6}.`),
        st("Substitute.", `d(${t}) = ${amp} sin(${piText(t, 6)}) + ${mid} = ${amp} · ${trigExact(Math.sin((t * Math.PI) / 6)).display} + ${mid}`),
        st("Evaluate.", `≈ ${dn(ans)} ft`),
      ],
      traps: trapsTol(ans, 0.01, [[amp * Math.sin((t * Math.PI) / 6 * (Math.PI / 180)) + mid, "Your calculator is in degree mode. Switch to radians."]]),
    };
  },
};

// ---------------------------------------------------------------------------
const identify: Skill = {
  id: "m3.trig.identify",
  title: "Match a sinusoidal graph to its equation",
  topic: T,
  standards: ["NC.M3.F-IF.7", "NC.M3.F-TF.5", "NC.M3.F-TF.2b"],
  prereqs: ["m3.trig.features"],
  lesson: {
    bigIdea: "Read four things from the graph: the midline (middle height), the amplitude (top minus midline), the period (length of one cycle) and the starting point (midline going up → sin; at the top → cos).",
    explain: [
      "A wave goes between y = −1 and y = 5: midline y = 2, amplitude 3.",
      "It starts at its maximum when x = 0 and completes a cycle at x = π: cosine, with period π, so b = {2π/π} = 2.",
      "Equation: **y = 3 cos(2x) + 2**.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 2 * Math.PI, yMin: -2, yMax: 6, xStep: HALF_PI, curves: [{ expr: "3cos(2x)+2" }], hlines: [{ y: 2, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "A graph starts at its midline at x = 0 and goes down. Which kind of equation fits?", choices: ["y = −a sin(bx) + k (a reflected sine)", "y = a cos(bx) + k", "y = a sin(bx) + k with a > 0"], correct: 0, explain: "sin starts at the midline going up; reflecting it makes it go down first." },
    { kind: "written", prompt: "Explain how to find b from a graph whose cycles repeat every 4π.", keyIdeas: ["the period is 4π", "period = 2π/b", "b = 2π/4π = 1/2"], exemplar: "One full cycle takes 4π, so the period is 4π. Since period = 2π/b, b = 2π ÷ 4π = 1/2." },
  ],
  generate(r, lv) {
    const fn = r.pick(["sin", "cos"]);
    const a = lv === 1 ? r.pick([1, 2, 3]) : r.pick([2, 3, -2, 4]);
    const b = lv === 1 ? 1 : lv === 2 ? r.pick([2, 0.5]) : r.pick([2, 3, 0.5]);
    const h = lv === 1 ? r.int(-2, 2) : r.int(-3, 3);
    const bD = (bb: number) => (bb === 1 ? "" : bb === 0.5 ? "{1/2}" : String(bb));
    const bT = (bb: number) => (bb === 1 ? "" : bb === 0.5 ? "0.5" : String(bb));
    const eq = (aa: number, f: string, bb: number, hh: number) => `y = ${aa === 1 ? "" : aa === -1 ? "−" : ms(aa)} ${f}(${bD(bb)}x)${hh ? (hh > 0 ? ` + ${hh}` : ` − ${-hh}`) : ""}`.replace("y =  ", "y = ");
    const correct = eq(a, fn, b, h);
    const otherF = fn === "sin" ? "cos" : "sin";
    const wrongB = b === 2 ? 0.5 : b === 0.5 ? 2 : b === 3 ? 1 : 2;
    const wrongs: [string, string][] = [
      [eq(a, otherF, b, h), fn === "sin" ? "At x = 0 the graph is on its midline, so it's a sine." : "At x = 0 the graph is at a maximum or minimum, so it's a cosine."],
      [eq(a, fn, wrongB, h), "Check the period: measure one full cycle and use b = 2π ÷ period."],
      [h !== 0 ? eq(a, fn, b, -h) : eq(a, fn, b, 2), "Check the midline: the middle height of the wave."],
      [eq(a === 2 ? 3 : 2 * Math.sign(a), fn, b, h), "Check the amplitude: the distance from the midline to the top."],
    ];
    const xMax = b === 0.5 ? 4 * Math.PI : 2 * Math.PI;
    const per = b === 0.5 ? "4π" : b === 1 ? "2π" : piPlain(2, b);
    return {
      prompt: "Which equation matches the graph?",
      visual: { type: "plot", xMin: 0, xMax, yMin: h - Math.abs(a) - 1, yMax: h + Math.abs(a) + 1, xStep: b === 0.5 ? Math.PI : HALF_PI, curves: [{ expr: `${a}${fn}(${bT(b)}x)+${h}`.replace("+-", "-") }] },
      answer: choice(r, correct, r.shuffle(wrongs).slice(0, 3)),
      hints: ["Find the midline (halfway between the highest and lowest points) and the amplitude.", `Then measure one cycle for the period, and see whether the graph starts on the midline (sin) or at a peak/valley (cos).`],
      steps: [
        st("Midline and amplitude.", `The wave runs from ${ms(h - Math.abs(a))} to ${ms(h + Math.abs(a))}: midline y = ${ms(h)}, amplitude ${Math.abs(a)}.`),
        st("Period.", `One cycle takes ${per}, so b = 2π ÷ ${per} = ${bD(b) || "1"}.`),
        st("Starting point.", fn === "sin" ? `At x = 0 the graph is on the midline heading ${a > 0 ? "up" : "down"}: ${a > 0 ? "sine" : "a reflected sine"}.` : `At x = 0 the graph is at its ${a > 0 ? "maximum" : "minimum"}: ${a > 0 ? "cosine" : "a reflected cosine"}.`),
        st("Answer.", correct),
      ],
    };
  },
};

const skills: Skill[] = [radians, unitCircleSkill, quadrant, graph, features, model, identify];
export default skills;
