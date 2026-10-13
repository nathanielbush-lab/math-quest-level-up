// Unit 6: Polynomials and quadratic functions (operations, key features, vertex form, completing the square,
// optimization in context, transformations, building quadratics).
import { binom, binomExpr, choice, expr, ms, num, poly, polyExpr, sn, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { fracText, pointAns, pt } from "./util";

const T = "m2-quadratic-functions";

export function pmul(a: number[], b: number[]): number[] {
  const out = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)));
  return out;
}
export function padd(a: number[], b: number[], sign = 1): number[] {
  const n = Math.max(a.length, b.length);
  const A = [...new Array(n - a.length).fill(0), ...a], B = [...new Array(n - b.length).fill(0), ...b];
  const out = A.map((x, i) => x + sign * B[i]);
  while (out.length > 1 && out[0] === 0) out.shift();
  return out;
}

/** Vertex form display a(x − h)^2 + k. */
export function vform(a: number, h: number, k: number): string {
  const A = a === 1 ? "" : a === -1 ? "−" : ms(a);
  const sq = h === 0 ? "x^2" : `${binom(h)}^2`;
  return `${A}${sq}${k === 0 ? "" : k < 0 ? ` − ${-k}` : ` + ${k}`}`;
}
/** Vertex form typed syntax. */
export function vexpr(a: number | Frac, h: number | Frac, k: number | Frac): string {
  const t = (v: number | Frac) => (typeof v === "number" ? String(v) : v.d === 1 ? String(v.n) : `${v.n}/${v.d}`);
  const av = typeof a === "number" ? frac(a) : a, hv = typeof h === "number" ? frac(h) : h, kv = typeof k === "number" ? frac(k) : k;
  const A = av.n === av.d ? "" : av.n === -av.d ? "-" : av.d === 1 ? t(av) : `(${t(av)})`;
  const hh = hv.n === 0 ? "x" : hv.n > 0 ? `(x-${t(hv)})` : `(x+${t(frac(-hv.n, hv.d))})`;
  const kk = kv.n === 0 ? "" : kv.n > 0 ? `+${t(kv)}` : `-${t(frac(-kv.n, kv.d))}`;
  return `${A}${hh}^2${kk}`;
}

function quadPlot(coefs: [number, number, number], pts: { x: number; y: number; label?: string }[] = [], extra: Partial<Extract<Visual, { type: "plot" }>> = {}): Visual {
  const [a, b, c] = coefs;
  const h = -b / (2 * a), k = a * h * h + b * h + c;
  const xs = [h - 5, h + 5];
  const f = (x: number) => a * x * x + b * x + c;
  const ys = [k, f(xs[0]), f(xs[1]), 0, ...pts.map((p) => p.y)];
  let yMin = Math.floor(Math.min(...ys) - 2), yMax = Math.ceil(Math.max(...ys) + 2);
  if (a > 0) yMax = Math.min(yMax, Math.ceil(k + 16)); else yMin = Math.max(yMin, Math.floor(k - 16));
  yMin = Math.min(yMin, -2); yMax = Math.max(yMax, 2);
  return { type: "plot", xMin: Math.floor(Math.min(h - 6, -1)), xMax: Math.ceil(Math.max(h + 6, 1)), yMin, yMax, curves: [{ expr: polyExpr([a, b, c]) }], points: pts, ...extra };
}

// ---------- 1. Polynomial operations ----------
const polyOps: Skill = {
  id: "m2.quad.poly-ops",
  title: "Add, subtract and multiply polynomials",
  topic: T,
  standards: ["NC.M2.A-APR.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Add and subtract polynomials by combining like terms. Multiply by distributing every term of one polynomial to every term of the other.",
    explain: [
      "Subtracting: (3x^2 − 2x + 5) − (x^2 + 4x − 1) = 3x^2 − 2x + 5 − x^2 − 4x + 1 = **2x^2 − 6x + 6**. The minus sign changes every sign in the second polynomial.",
      "Multiplying: (x + 2)(x^2 − 3x + 4) = x^3 − 3x^2 + 4x + 2x^2 − 6x + 8 = **x^3 − x^2 − 2x + 8**.",
      "Polynomials behave like integers: adding, subtracting or multiplying two polynomials always gives another polynomial (they are closed under these operations).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does (x + 3)^2 not equal x^2 + 9?", choices: ["(x + 3)(x + 3) also produces two middle terms, 3x + 3x = 6x.", "Because squaring only applies to x.", "It does equal x^2 + 9.", "Because 3^2 = 6."], correct: 0, explain: "Distribute fully: x^2 + 3x + 3x + 9 = x^2 + 6x + 9." },
    { kind: "written", prompt: "Explain why the product of two polynomials is always a polynomial.", keyIdeas: ["each product of terms is a number times a whole-number power of x", "multiplying powers adds whole-number exponents, which stay whole numbers", "adding those terms together gives a polynomial"], exemplar: "Each term times each term gives a coefficient times x to a whole-number power, because exponents add (like x^2 · x^3 = x^5). Adding all those terms still gives a sum of whole-number powers of x, which is a polynomial." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const p = [r.nonzero(-5, 6), r.int(-9, 9), r.int(-9, 9)], q = [r.nonzero(-5, 6), r.int(-9, 9), r.int(-9, 9)];
      const sub = r.chance(0.6);
      const res = padd(p, q, sub ? -1 : 1);
      return {
        prompt: `${sub ? "Subtract" : "Add"}: (${poly(p)}) ${sub ? "−" : "+"} (${poly(q)})`,
        answer: expr(polyExpr(res), { form: "expanded", display: poly(res) }),
        hints: [sub ? "Distribute the minus sign: change the sign of every term in the second polynomial." : "Combine like terms: x^2 with x^2, x with x, numbers with numbers.", `x^2 terms: ${p[0]} ${sub ? "−" : "+"} ${sn(q[0])}; x terms: ${p[1]} ${sub ? "−" : "+"} ${sn(q[1])}; constants: ${p[2]} ${sub ? "−" : "+"} ${sn(q[2])}.`],
        steps: [
          ...(sub ? [st("Distribute the minus sign.", `${poly(p)} ${poly(q.map((c) => -c)).startsWith("−") ? poly(q.map((c) => -c)).replace(/^−/, "− ") : "+ " + poly(q.map((c) => -c))}`)] : []),
          st("Combine like terms.", poly(res)),
        ],
      };
    }
    if (lv === 2) {
      const a = r.int(1, 4), b = r.nonzero(-7, 7), c = r.int(1, 3), d = r.nonzero(-7, 7);
      const res = pmul([a, b], [c, d]);
      const sq = r.chance(0.3);
      const B = sq ? [a, b] : [c, d];
      const out = sq ? pmul([a, b], [a, b]) : res;
      return {
        prompt: sq ? `Expand: (${poly([a, b])})^2` : `Multiply: (${poly([a, b])})(${poly([c, d])})`,
        answer: expr(polyExpr(out), { form: "expanded", display: poly(out) }),
        hints: [sq ? `Write it as (${poly([a, b])})(${poly([a, b])}) and distribute; don't just square each term.` : "Distribute each term of the first binomial to both terms of the second (FOIL).", `First: ${a * B[0]}x^2; outer + inner: ${a * B[1]}x + ${b * B[0]}x; last: ${b * B[1]}.`],
        steps: [st("Distribute.", `${term2(a * B[0], "x^2")} ${signed(a * B[1], "x")} ${signed(b * B[0], "x")} ${signed(b * B[1], "")}`), st("Combine like terms.", poly(out))],
      };
    }
    const a = r.nonzero(-5, 5), p = [1, r.int(-6, 6), r.nonzero(-9, 9)];
    const res = pmul([1, a], p);
    return {
      prompt: `Multiply: (${poly([1, a])})(${poly(p)})`,
      answer: expr(polyExpr(res), { form: "expanded", display: poly(res) }),
      hints: ["Multiply x by each term of the trinomial, then multiply " + ms(a) + " by each term.", `x(${poly(p)}) = ${poly([...p, 0])}; ${ms(a)}(${poly(p)}) = ${poly(p.map((c) => c * a))}.`],
      steps: [st("Distribute x.", poly([...p, 0])), st(`Distribute ${ms(a)}.`, poly(p.map((c) => c * a))), st("Combine like terms.", poly(res))],
    };
  },
};
function term2(c: number, v: string) {
  return c === 1 ? v : c === -1 ? `−${v}` : `${ms(c)}${v}`;
}
function signed(c: number, v: string) {
  const a = Math.abs(c);
  return `${c < 0 ? "−" : "+"} ${a === 1 && v ? "" : a}${v}`;
}

// ---------- 2. Key features from a graph ----------
const features: Skill = {
  id: "m2.quad.features",
  title: "Key features of a quadratic graph",
  topic: T,
  standards: ["NC.M2.F-IF.7", "NC.M2.F-IF.4"],
  prereqs: ["m2.quad.poly-ops"],
  lesson: {
    bigIdea: "A parabola has a vertex (its max or min), an axis of symmetry through the vertex, and up to two x-intercepts (zeros) that are mirror images across the axis.",
    explain: [
      "For y = x^2 − 2x − 8 (shown): the zeros are x = −2 and x = 4. The axis of symmetry is halfway between them, x = 1, and the vertex is (1, −9), a minimum because the parabola opens up.",
      "Intervals: it decreases for x < 1 and increases for x > 1. The domain is all real numbers; the range is y ≥ −9.",
      "Symmetry: points at equal distances from the axis have equal heights, so f(−1) = f(3).",
    ],
    visual: quadPlot([1, -2, -8], [{ x: 1, y: -9, label: "(1, −9)" }, { x: -2, y: 0 }, { x: 4, y: 0 }]),
  },
  why: [
    { kind: "choice", prompt: "Why is the axis of symmetry exactly halfway between the two zeros?", choices: ["The zeros are mirror images across the axis, so the axis is at their midpoint.", "Because the vertex is always at x = 0.", "Because the y-intercept is on the axis.", "It isn't always halfway."], correct: 0, explain: "Reflecting across the axis swaps the zeros, so they're the same distance from it." },
    { kind: "written", prompt: "A parabola opens downward with vertex (3, 5). Describe its range and where it increases and decreases.", keyIdeas: ["the vertex is a maximum, so the range is y ≤ 5", "it increases for x < 3", "it decreases for x > 3"], exemplar: "Opening downward means the vertex (3, 5) is the highest point, so the range is y ≤ 5. Moving left to right, the graph rises until x = 3 and falls after, so it increases for x < 3 and decreases for x > 3." },
  ],
  generate(r, lv) {
    const a = lv === 1 ? r.pick([1, -1]) : r.pick([1, -1, 1, -1, 2, -2]);
    let r1 = r.int(-6, 4), r2: number;
    do { r2 = r1 + 2 * r.int(1, 4); } while (r2 > 7);
    const h = (r1 + r2) / 2, k = -a * ((r2 - r1) / 2) ** 2;
    if (Math.abs(k) > 18) { r1 = h - 1; r2 = h + 1; }
    const kk = -a * ((r2 - r1) / 2) ** 2;
    const coefs = pmul([a, -a * r1], [1, -r2]) as [number, number, number];
    const vis = quadPlot(coefs);
    const opens = a > 0 ? "up" : "down";
    if (lv === 1) {
      return {
        prompt: "Find the vertex of the parabola shown.",
        visual: vis,
        answer: pointAns(h, kk),
        hints: ["The vertex is the turning point: the lowest point if it opens up, the highest if it opens down.", `It's halfway between the x-intercepts ${ms(r1)} and ${ms(r2)}.`],
        steps: [st("Find the axis from the zeros.", `x = {${ms(r1)} + ${sn(r2)}/2} = ${ms(h)}`), st("Read the height there.", `The turning point is ${pt(h, kk)}, a ${a > 0 ? "minimum" : "maximum"}.`)],
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        return {
          prompt: "Find the zeros (x-intercepts) of the function graphed.",
          visual: vis,
          answer: { kind: "multi", fields: [{ value: frac(r1), pre: "x =" }, { value: frac(r2), pre: "x =" }], anyOrder: [0, 1] },
          hints: ["Zeros are where the graph crosses the x-axis (y = 0).", "There are two crossings; read the x-coordinate of each."],
          steps: [st("Find where y = 0.", `The graph crosses the x-axis at x = ${ms(r1)} and x = ${ms(r2)}.`), st("Check with symmetry.", `They are equally far from the axis x = ${ms(h)}. ✓`)],
        };
      }
      const xk = h + r.pick([-3, -2, 2, 3]);
      const mirror = 2 * h - xk;
      const yv = coefs[0] * xk * xk + coefs[1] * xk + coefs[2];
      return {
        prompt: `The parabola has its vertex at ${pt(h, kk)} and passes through ${pt(xk, yv)}. Use symmetry to find the x-coordinate of the other point on the parabola with y = ${ms(yv)}.`,
        visual: quadPlot(coefs, [{ x: h, y: kk, label: pt(h, kk) }, { x: xk, y: yv, label: pt(xk, yv) }]),
        answer: num(mirror),
        hints: [`The axis of symmetry is x = ${ms(h)}.`, `${pt(xk, yv)} is ${Math.abs(xk - h)} units ${xk > h ? "right" : "left"} of the axis. Go the same distance on the other side.`],
        steps: [st("Find the distance to the axis.", `|${ms(xk)} − ${sn(h)}| = ${Math.abs(xk - h)}`), st("Reflect.", `${ms(h)} ${xk > h ? "−" : "+"} ${Math.abs(xk - h)} = ${ms(mirror)}`)],
        traps: traps(frac(mirror), [trap(-xk, "Reflect across the axis of symmetry x = " + ms(h) + ", not the y-axis.")]),
      };
    }
    const ask = r.pick(["inc", "range"]);
    if (ask === "range") {
      const correct = a > 0 ? `y ≥ ${ms(kk)}` : `y ≤ ${ms(kk)}`;
      return {
        prompt: "What is the range of the function graphed?",
        visual: vis,
        answer: choice(r, correct, [[a > 0 ? `y ≤ ${ms(kk)}` : `y ≥ ${ms(kk)}`, `The parabola opens ${opens}, so the vertex is a ${a > 0 ? "minimum" : "maximum"}.`], ["All real numbers", "That's the domain. The y-values stop at the vertex."], [a > 0 ? `x ≥ ${ms(h)}` : `x ≤ ${ms(h)}`, "Range describes y-values, not x-values."]]),
        hints: ["Range = all the y-values the graph reaches.", `The vertex ${pt(h, kk)} is the ${a > 0 ? "lowest" : "highest"} point.`],
        steps: [st("Find the extreme value.", `Vertex ${pt(h, kk)}, a ${a > 0 ? "minimum" : "maximum"}`), st("Write the range.", correct)],
      };
    }
    const correct = a > 0 ? `x > ${ms(h)}` : `x < ${ms(h)}`;
    return {
      prompt: "Over which interval is the function graphed increasing?",
      visual: vis,
      answer: choice(r, correct, [[a > 0 ? `x < ${ms(h)}` : `x > ${ms(h)}`, "Read left to right: increasing means the graph goes up."], [`${ms(r1)} < x < ${ms(r2)}`, "That's where the graph is " + (a > 0 ? "below" : "above") + " the x-axis, not where it rises."], [a > 0 ? `y > ${ms(kk)}` : `y < ${ms(kk)}`, "Intervals of increase are written with x-values."]]),
      hints: ["Increasing means the y-values go up as you move to the right.", `The graph changes direction at the vertex, x = ${ms(h)}.`],
      steps: [st("Find the turning point.", `x = ${ms(h)}`), st("Read left to right.", `The parabola opens ${opens}, so it rises ${a > 0 ? "to the right" : "to the left"} of the vertex: ${correct}.`)],
    };
  },
};

// ---------- 3. Vertex form ----------
const vertexForm: Skill = {
  id: "m2.quad.vertex-form",
  title: "Vertex form of a quadratic",
  topic: T,
  standards: ["NC.M2.F-IF.7", "NC.M2.A-CED.2", "NC.M2.A-APR.1"],
  prereqs: ["m2.quad.features"],
  lesson: {
    bigIdea: "In f(x) = a(x − h)^2 + k, the vertex is (h, k), the axis is x = h, and a tells the direction (up if a > 0) and stretch.",
    explain: [
      "f(x) = −2(x − 3)^2 + 5: vertex (3, 5), a maximum because a = −2 < 0. Careful with the sign: (x − 3) means h = +3, and (x + 3) means h = −3.",
      "To get standard form, expand: −2(x^2 − 6x + 9) + 5 = −2x^2 + 12x − 18 + 5 = **−2x^2 + 12x − 13**. The y-intercept is −13.",
      "Zeros from vertex form: solve a(x − h)^2 + k = 0. For (x − 1)^2 − 9 = 0: (x − 1)^2 = 9, so x − 1 = ±3, x = 4 or x = −2.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is (h, k) the vertex of a(x − h)^2 + k when a > 0?", choices: ["(x − h)^2 is never negative and equals 0 only at x = h, so the smallest output is k there.", "Because h and k are the zeros.", "Because a is positive.", "Because the y-intercept is k."], correct: 0, explain: "The squared part is 0 at x = h and positive everywhere else, so the minimum value k occurs at x = h." },
    { kind: "written", prompt: "Explain why the vertex of f(x) = (x + 4)^2 − 1 is (−4, −1) and not (4, −1).", keyIdeas: ["vertex form is a(x − h)^2 + k", "x + 4 = x − (−4), so h = −4", "check: f(−4) = 0 − 1 = −1"], exemplar: "Vertex form uses x − h. Writing x + 4 as x − (−4) shows h = −4. Check: f(−4) = (0)^2 − 1 = −1, the smallest value, so the vertex is (−4, −1)." },
  ],
  generate(r, lv) {
    const a = lv === 1 ? r.pick([1, -1, 2, -3]) : r.pick([1, -1, 2, -2, 3]);
    const h = r.nonzero(-6, 6), k = r.int(-9, 9);
    const std = padd(pmul([a], pmul([1, -h], [1, -h])), [k]);
    if (lv === 1) {
      return {
        prompt: `Find the vertex of f(x) = ${vform(a, h, k)}.`,
        answer: pointAns(h, k),
        hints: ["Match it to a(x − h)^2 + k.", `${binom(h)} = (x − ${sn(h)}), so h = ${ms(h)}.`],
        steps: [st("Match to vertex form.", `a = ${ms(a)}, h = ${ms(h)}, k = ${ms(k)}`), st("Vertex.", `${pt(h, k)}, a ${a > 0 ? "minimum" : "maximum"}`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `Write f(x) = ${vform(a, h, k)} in standard form ax^2 + bx + c.`,
        answer: expr(polyExpr(std), { form: "expanded", lhs: "f(x)", display: poly(std) }),
        hints: [`Square the binomial first: ${binom(h)}^2 = ${poly([1, -2 * h, h * h])}.`, `Then multiply by ${ms(a)} and add ${ms(k)}.`],
        steps: [st("Square the binomial.", `${binom(h)}^2 = ${poly([1, -2 * h, h * h])}`), ...(a !== 1 ? [st(`Multiply by ${ms(a)}.`, poly([a, -2 * a * h, a * h * h]))] : []), st(`${k < 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, poly(std))],
      };
    }
    // Zeros from vertex form.
    const aa = r.pick([1, -1, 2, -2]);
    const d = r.int(1, 5);
    const kk = -aa * d * d;
    return {
      prompt: `Find the zeros of f(x) = ${vform(aa, h, kk)}.`,
      answer: { kind: "multi", fields: [{ value: frac(h - d), pre: "x =" }, { value: frac(h + d), pre: "x =" }], anyOrder: [0, 1] },
      hints: [`Set f(x) = 0 and isolate the square: ${aa === 1 ? "" : aa === -1 ? "−" : ms(aa)}${binom(h)}^2 = ${ms(-kk)}.`, `${binom(h)}^2 = ${d * d}, so x − ${sn(h)} = ±${d}.`],
      steps: [st("Set equal to 0.", `${vform(aa, h, kk)} = 0`), st("Isolate the square.", `${binom(h)}^2 = ${d * d}`), st("Take square roots (both signs).", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±${d}`), st("Solve.", `x = ${ms(h)} ± ${d}: x = ${ms(h - d)} or x = ${ms(h + d)}`)],
    };
  },
};

// ---------- 4. Completing the square ----------
const completeSquare: Skill = {
  id: "m2.quad.complete-square",
  title: "Complete the square to find vertex form",
  topic: T,
  standards: ["NC.M2.A-SSE.3", "NC.M2.F-IF.8"],
  prereqs: ["m2.quad.vertex-form"],
  lesson: {
    bigIdea: "x^2 + bx becomes a perfect square when you add ({b/2})^2. Add and subtract it to rewrite ax^2 + bx + c as a(x − h)^2 + k, which shows the max or min.",
    explain: [
      "x^2 + 6x + 2: half of 6 is 3 and 3^2 = 9. So x^2 + 6x + 2 = (x^2 + 6x + 9) − 9 + 2 = **(x + 3)^2 − 7**. Minimum value −7 at x = −3.",
      "With a ≠ 1, factor a out of the x-terms first: 2x^2 − 12x + 5 = 2(x^2 − 6x) + 5 = 2(x^2 − 6x + 9) − 18 + 5 = **2(x − 3)^2 − 13**. You added 9 inside, which is really 2 · 9 = 18, so subtract 18.",
      "Why it works: (x + 3)^2 = x^2 + 6x + 9, a square with side x + 3. The x^2 + 6x part is that square missing its 3-by-3 corner.",
    ],
    visual: { type: "tape", rows: [{ label: "x^2 + 6x + 9", segments: [{ text: "x^2", size: 4 }, { text: "3x", size: 2 }, { text: "3x", size: 2 }, { text: "9", size: 1, shade: true }] }] },
  },
  why: [
    { kind: "choice", prompt: "Why do you add (b/2)^2 when completing the square on x^2 + bx?", choices: ["(x + b/2)^2 = x^2 + bx + (b/2)^2, so that's the missing constant.", "Because b^2 is always positive.", "To make the equation balanced with zero.", "Because the vertex is at b/2."], correct: 0, explain: "Squaring the binomial x + b/2 produces exactly bx as the middle term." },
    { kind: "written", prompt: "When completing the square on 3x^2 + 12x + 1 = 3(x^2 + 4x + 4) + 1 − ?, explain what number replaces ? and why.", keyIdeas: ["4 was added inside the parentheses", "it is multiplied by the 3 outside, so 12 was really added", "subtract 12 to keep the expression equal: 3(x + 2)^2 − 11"], exemplar: "Adding 4 inside the parentheses actually adds 3 · 4 = 12 to the expression, because everything inside is multiplied by 3. To keep it equal, subtract 12: 3(x + 2)^2 + 1 − 12 = 3(x + 2)^2 − 11." },
  ],
  generate(r, lv) {
    if (lv === 2 && r.chance(0.5)) {
      const h = r.nonzero(-7, 7), k = r.int(-15, 15);
      const coefs = [1, -2 * h, h * h + k];
      const askMin = r.chance(0.5);
      return {
        prompt: `Complete the square to find the ${askMin ? "minimum value" : "x-value where the minimum occurs"} of f(x) = ${poly(coefs)}.`,
        answer: num(askMin ? k : h),
        hints: [`Half of ${ms(-2 * h)} is ${ms(-h)}; square it to get ${h * h}.`, `f(x) = (x^2 ${-2 * h < 0 ? "−" : "+"} ${Math.abs(2 * h)}x + ${h * h}) − ${h * h} ${coefs[2] < 0 ? "−" : "+"} ${Math.abs(coefs[2])} = ${vform(1, h, k)}.`],
        steps: [st("Take half of b and square it.", `(${ms(-2 * h)} ÷ 2)^2 = ${h * h}`), st("Add and subtract it.", `f(x) = (x^2 ${-2 * h < 0 ? "−" : "+"} ${Math.abs(2 * h)}x + ${h * h}) − ${h * h}${cstS(coefs[2])}`), st("Write vertex form.", `f(x) = ${vform(1, h, k)}`), st("Read the minimum.", `The minimum value is ${ms(k)}, at x = ${ms(h)}.`)],
        traps: traps(frac(askMin ? k : h), askMin ? [trap(coefs[2], "That's the y-intercept, not the minimum."), trap(h, "That's where the minimum occurs; the question asks for the value.")] : [trap(-h, `Careful with the sign: (x ${h > 0 ? "−" : "+"} ${Math.abs(h)})^2 is zero at x = ${ms(h)}.`), trap(k, "That's the minimum value; the question asks for the x-value.")]),
      };
    }
    let a = 1, h: Frac, k: Frac;
    if (lv === 3) {
      a = r.pick([2, 3, -1, -2]);
      h = frac(r.nonzero(-5, 5));
      k = frac(r.int(-12, 12));
    } else if (lv === 2) {
      h = frac(r.pick([-5, -3, -1, 1, 3, 5]), 2);
      k = frac(4 * r.int(-5, 5) + r.pick([1, -1, 3]), 4);
    } else {
      h = frac(r.nonzero(-6, 6));
      k = frac(r.int(-12, 12));
    }
    const hv = h.n / h.d, kv = k.n / k.d;
    const b = -2 * a * hv, c = a * hv * hv + kv;
    const cF = frac(Math.round(c * 4), 4);
    const cText = cF.d === 1 ? cstS(cF.n) : ` ${cF.n < 0 ? "−" : "+"} {${Math.abs(cF.n)}/${cF.d}}`;
    const std = `${poly([a, b, 0])}${cText}`;
    const value = vexpr(a, h, k);
    const hsq = frac(h.n * h.n, h.d * h.d);
    const hText = fracText(h.n, h.d), hsqText = fracText(hsq.n, hsq.d);
    const vdisp = `${a === 1 ? "" : a === -1 ? "−" : a}(x ${h.n > 0 ? "−" : "+"} ${fracText(Math.abs(h.n), h.d)})^2 ${k.n < 0 ? "−" : "+"} ${fracText(Math.abs(k.n), k.d)}`.replace(/ \+ 0$/, "");
    return {
      prompt: `Write f(x) = ${std} in vertex form by completing the square.`,
      answer: expr(value, { form: "vertex", lhs: "f(x)", display: vdisp }),
      hints: [
        a !== 1 ? `Factor ${ms(a)} out of the x-terms first: ${ms(a)}(x^2 ${b / a < 0 ? "−" : "+"} ${Math.abs(b / a)}x)${cText}.` : `Take half of ${ms(b)}${h.d === 1 ? "" : ` (that's ${fracText(-h.n, h.d)})`} and square it.`,
        `(${a !== 1 ? `${ms(b / a)}` : ms(b)} ÷ 2)^2 = ${hsqText}. Add it inside the square and subtract ${a !== 1 ? `${ms(a)} · ${hsqText}` : "it"} outside.`,
        `The vertex is (${hText}, ${fracText(k.n, k.d)}).`,
      ],
      steps: [
        ...(a !== 1 ? [st(`Factor ${ms(a)} out of the x-terms.`, `${ms(a)}(x^2 ${b / a < 0 ? "−" : "+"} ${Math.abs(b / a)}x)${cText}`)] : []),
        st("Find the number that completes the square.", `(${ms(b / a)} ÷ 2)^2 = (${fracText(-h.n, h.d)})^2 = ${hsqText}`),
        st("Add it inside and balance outside.", `${a === 1 ? "" : ms(a)}(x^2 ${b / a < 0 ? "−" : "+"} ${Math.abs(b / a)}x + ${hsqText})${cText} − ${a === 1 ? hsqText : `${sn(a)} · ${hsqText}`}`),
        st("Write the square and combine constants.", `f(x) = ${vdisp}`),
        st("Read the vertex.", `Vertex (${hText}, ${fracText(k.n, k.d)}), a ${a > 0 ? "minimum" : "maximum"}.`),
      ],
    };
  },
};
function cstS(c: number) {
  return c === 0 ? "" : c < 0 ? ` − ${-c}` : ` + ${c}`;
}

// ---------- 5. Maximum and minimum in context ----------
const maxMin: Skill = {
  id: "m2.quad.max-min-context",
  title: "Maximums and minimums in context",
  topic: T,
  standards: ["NC.M2.F-IF.8", "NC.M2.F-IF.4", "NC.M2.A-SSE.1", "NC.M2.A-SSE.1a", "NC.M2.A-SSE.1b", "NC.M2.A-CED.2"],
  prereqs: ["m2.quad.complete-square"],
  lesson: {
    bigIdea: "In a quadratic model, the vertex answers “when is it biggest (or smallest)?” and “how big?”. The parts of the formula have meanings too.",
    explain: [
      "A ball's height is h(t) = −16t^2 + 48t + 6 feet after t seconds. The 6 is the starting height (t = 0), 48 is the starting upward speed in ft/s, and −16 comes from gravity.",
      "Vertex: t = {−b/2a} = {−48/2(−16)} = 1.5 s. Height then: h(1.5) = −16(2.25) + 72 + 6 = **42 ft**, the maximum.",
      "Completing the square shows the same thing: h(t) = −16(t − 1.5)^2 + 42.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 3.5, yMin: 0, yMax: 50, xStep: 0.5, yStep: 10, curves: [{ expr: "-16x^2+48x+6", domain: [0, 3.1], label: "h(t)" }], points: [{ x: 1.5, y: 42, label: "(1.5, 42)" }] },
  },
  why: [
    { kind: "choice", prompt: "In h(t) = −16t^2 + 64t + 5, what does the 5 tell you?", choices: ["The height when t = 0, when the ball is launched.", "The maximum height.", "The time when the ball lands.", "The speed of the ball."], correct: 0, explain: "At t = 0, the t-terms are 0, so h(0) = 5." },
    { kind: "written", prompt: "A store's revenue is R(p) = p(200 − 10p) dollars at a price of p dollars. Explain what 200 − 10p means and how to find the price that maximizes revenue.", keyIdeas: ["200 − 10p is the number of items sold at price p (sales drop 10 for each $1 increase)", "revenue = price × number sold", "the max is at the vertex, halfway between the zeros p = 0 and p = 20, so p = $10"], exemplar: "200 − 10p is how many items sell at price p: every $1 increase loses 10 sales. Revenue is price times number sold. The zeros are p = 0 and p = 20, so the vertex is halfway, at p = 10. A $10 price maximizes revenue: R(10) = 10 · 100 = $1000." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const v = r.pick([32, 48, 64, 80]), h0 = r.int(2, 30);
      const part = r.pick(["h0", "v", "a"]);
      const correct = part === "h0" ? "The height of the ball when it is launched" : part === "v" ? "The ball's initial upward speed (feet per second)" : "The effect of gravity pulling the ball down";
      const label = part === "h0" ? String(h0) : part === "v" ? String(v) : "−16";
      return {
        prompt: `A ball is thrown upward. Its height in feet after t seconds is h(t) = −16t^2 + ${v}t + ${h0}. What does ${label} represent?`,
        answer: choice(r, correct, [["The height of the ball when it is launched", "That's the constant term, the value of h(0)."], ["The ball's initial upward speed (feet per second)", "That's the coefficient of t."], ["The effect of gravity pulling the ball down", "That's the coefficient of t^2."], ["The maximum height of the ball", "The maximum comes from the vertex, not from a single coefficient."]].filter((w) => w[0] !== correct) as [string, string][]),
        hints: ["Try t = 0: which terms disappear?", "The t^2 coefficient (−16 in feet) is gravity; the t coefficient is the launch speed; the constant is the launch height."],
        steps: [st("Identify the part.", `${label} is the ${part === "h0" ? "constant term: h(0) = " + h0 : part === "v" ? "coefficient of t" : "coefficient of t^2"}.`), st("Interpret.", correct + ".")],
      };
    }
    if (lv === 2) {
      const v = r.pick([32, 48, 64, 80, 96]), h0 = r.int(0, 40);
      const tMax = v / 32, hMax = h0 + (v * v) / 64;
      return {
        prompt: `A ball's height is h(t) = −16t^2 + ${v}t${h0 ? ` + ${h0}` : ""} feet after t seconds. When does it reach its maximum height, and what is that height?`,
        visual: { type: "plot", xMin: 0, xMax: Math.ceil(2 * tMax + 1), yMin: 0, yMax: Math.ceil((hMax + 10) / 10) * 10, curves: [{ expr: `-16x^2+${v}x+${h0}`, domain: [0, 2 * tMax + 0.3], label: "h(t)" }] },
        answer: { kind: "multi", fields: [{ value: frac(tMax), pre: "t =", post: " s" }, { value: frac(hMax), pre: "max height =", post: " ft" }] },
        hints: ["The maximum is at the vertex: t = −b ÷ (2a).", `t = −${v} ÷ (2 · −16) = ${tMax}. Substitute that into h(t).`],
        steps: [st("Find the time of the vertex.", `t = {−${v}/2(−16)} = ${tMax} s`), st("Evaluate h at that time.", `h(${tMax}) = −16(${tMax})^2 + ${v}(${tMax})${h0 ? ` + ${h0}` : ""} = ${-16 * tMax * tMax} + ${v * tMax}${h0 ? ` + ${h0}` : ""} = ${hMax}`), st("Answer.", `Maximum height ${hMax} ft at t = ${tMax} s.`)],
      };
    }
    const base = r.pick([120, 160, 200, 240, 300]), drop = r.pick([2, 4, 5, 10]);
    const pz = base / drop;
    const pBest = pz / 2;
    const item = r.pick(["concert tickets", "phone cases", "smoothies", "custom T-shirts"]);
    const rev = pBest * (base - drop * pBest);
    return {
      prompt: `A shop selling ${item} models its revenue as R(p) = p(${base} − ${drop}p) dollars when the price is p dollars. What price maximizes revenue, and what is the maximum revenue?`,
      answer: { kind: "multi", fields: [{ value: frac(pBest), pre: "price = $" }, { value: frac(rev), pre: "revenue = $" }] },
      hints: [`The zeros are p = 0 and p = ${pz} (when ${base} − ${drop}p = 0).`, `The vertex is halfway between the zeros: p = ${pBest}. Then find R(${pBest}).`],
      steps: [st("Find the zeros.", `p = 0 or ${base} − ${drop}p = 0, so p = ${pz}`), st("The vertex is halfway between.", `p = {0 + ${pz}/2} = ${pBest}`), st("Find the revenue.", `R(${pBest}) = ${pBest}(${base} − ${drop * pBest}) = ${pBest} · ${base - drop * pBest} = ${rev}`), st("Interpret.", `Charging $${pBest} gives the most revenue, $${rev}.`)],
    };
  },
};

// ---------- 6. Transformations of functions ----------
const transform: Skill = {
  id: "m2.quad.transform",
  title: "Transformations: k·f(x), f(x) + k, f(x + k)",
  topic: T,
  standards: ["NC.M2.F-BF.3"],
  prereqs: ["m2.quad.vertex-form"],
  lesson: {
    bigIdea: "f(x) + k shifts the graph up k; f(x + k) shifts it left k (the opposite of what it looks like); k·f(x) stretches it vertically by k, and a negative k also reflects it over the x-axis.",
    explain: [
      "Start with f(x) = x^2. g(x) = f(x − 3) + 2 = (x − 3)^2 + 2 moves the vertex from (0, 0) to (3, 2): right 3, up 2.",
      "Why f(x − 3) moves right: g(3) = f(0), so the output f had at 0 now happens at 3. Everything happens 3 units later.",
      "k·f(x): g(x) = 3x^2 multiplies every height by 3 (narrower). g(x) = −{1/2}x^2 flips it upside down and squashes it. The same rules work for linear, square-root and inverse-variation functions.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 7, yMin: -2, yMax: 10, curves: [{ expr: "x^2", label: "f", dashed: true }, { expr: "(x-3)^2+2", label: "g", color: 2 }] },
  },
  why: [
    { kind: "choice", prompt: "Why does f(x + 4) shift the graph LEFT 4?", choices: ["The new function reaches each output 4 units earlier: g(−4) = f(0).", "Because +4 always means right.", "Because adding inside changes the y-values.", "It shifts it up 4."], correct: 0, explain: "Whatever f did at x = 0, g does at x = −4." },
    { kind: "written", prompt: "Describe how the graph of g(x) = −2(x + 1)^2 − 3 relates to f(x) = x^2.", keyIdeas: ["shift left 1 (x + 1)", "vertical stretch by 2 and reflection over the x-axis (−2)", "shift down 3; vertex (−1, −3), opening down"], exemplar: "Starting from y = x^2: the x + 1 shifts it left 1, the −2 stretches it vertically by 2 and flips it so it opens down, and the −3 shifts it down 3. The vertex moves from (0, 0) to (−1, −3)." },
  ],
  generate(r, lv) {
    const fam = r.pick([
      { f: "x^2", name: "f(x) = x^2" },
      { f: "|x|", name: "f(x) = |x|" },
      { f: "x", name: "f(x) = x" },
    ]);
    if (lv === 1) {
      const k = r.nonzero(-5, 5);
      const inside = r.chance(0.5);
      const g = inside ? `f(x ${k > 0 ? "+" : "−"} ${Math.abs(k)})` : `f(x) ${k > 0 ? "+" : "−"} ${Math.abs(k)}`;
      const correct = inside ? `Shift ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "left" : "right"}` : `Shift ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "up" : "down"}`;
      const opts = ["left", "right", "up", "down"].map((d) => `Shift ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${d}`);
      return {
        prompt: `How does the graph of g(x) = ${g} compare with the graph of y = f(x)?`,
        answer: choice(r, correct, opts.filter((o) => o !== correct).map((o) => [o, inside ? "A change inside f( ) moves the graph horizontally, opposite to the sign." : "A change outside f( ) moves the graph vertically, in the direction of the sign."] as [string, string])),
        hints: ["Is the number added inside the parentheses (to x) or outside (to the output)?", inside ? "Inside changes are horizontal and work backward: x + k moves left." : "Outside changes are vertical: + moves up, − moves down."],
        steps: [st("Locate the change.", inside ? "The number is added to the input x." : "The number is added to the output f(x)."), st("Describe it.", correct)],
      };
    }
    if (lv === 2) {
      const h = r.nonzero(-5, 5), k = r.nonzero(-6, 6), a = r.pick([1, -1, 2, 3, -2]);
      const desc = `${a < 0 ? "reflected over the x-axis, " : ""}${Math.abs(a) !== 1 ? `vertically stretched by a factor of ${Math.abs(a)}, ` : ""}shifted ${Math.abs(h)} unit${Math.abs(h) === 1 ? "" : "s"} ${h > 0 ? "right" : "left"} and ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "up" : "down"}`;
      const value = vexpr(a, h, k);
      return {
        prompt: `The graph of f(x) = x^2 is ${desc}. Write the equation of the new function g(x).`,
        answer: expr(value, { lhs: "g(x)", display: vform(a, h, k) }),
        hints: [`Right ${Math.abs(h)} means replace x with (x ${h > 0 ? "−" : "+"} ${Math.abs(h)}). Up/down adds to the output.`, `Put it together as a(x − h)^2 + k with a = ${ms(a)}, h = ${ms(h)}, k = ${ms(k)}.`],
        steps: [st("Horizontal shift.", `x^2 → ${binom(h)}^2`), ...(a !== 1 ? [st("Stretch/reflect.", `multiply by ${ms(a)}: ${vform(a, h, 0)}`)] : []), st("Vertical shift.", `g(x) = ${vform(a, h, k)}`)],
      };
    }
    // Level 3: identify k from graphs.
    const kind = r.pick(["stretch", "shift"]);
    if (kind === "stretch") {
      const k = r.pick([2, 3, -1, -2, 0.5]);
      const kText = k === 0.5 ? "1/2" : String(k);
      return {
        prompt: `The graph shows f(x) = ${fam.f === "x" ? "x" : fam.f} (dashed) and g(x) = k · f(x). Find k.`,
        visual: { type: "plot", xMin: -4, xMax: 4, yMin: -8, yMax: 8, curves: [{ expr: fam.f, dashed: true, label: "f" }, { expr: `${kText === "1/2" ? "0.5" : k}*${fam.f === "|x|" ? "abs(x)" : fam.f === "x^2" ? "x^2" : "x"}`, color: 2, label: "g" }], points: [{ x: 2, y: (fam.f === "x^2" ? 4 : 2) * k, label: pt(2, (fam.f === "x^2" ? 4 : 2) * k) }, { x: 2, y: fam.f === "x^2" ? 4 : 2, label: pt(2, fam.f === "x^2" ? 4 : 2) }] },
        answer: num(k),
        hints: ["Compare the heights of f and g at the same x-value.", `At x = 2: f(2) = ${fam.f === "x^2" ? 4 : 2} and g(2) = ${ms((fam.f === "x^2" ? 4 : 2) * k)}. k = g(2) ÷ f(2).`],
        steps: [st("Compare outputs at x = 2.", `f(2) = ${fam.f === "x^2" ? 4 : 2}, g(2) = ${ms((fam.f === "x^2" ? 4 : 2) * k)}`), st("Divide.", `k = ${ms((fam.f === "x^2" ? 4 : 2) * k)} ÷ ${fam.f === "x^2" ? 4 : 2} = ${ms(k)}`)],
        traps: traps(frac(k), [trap((fam.f === "x^2" ? 4 : 2) * k - (fam.f === "x^2" ? 4 : 2), "k·f(x) multiplies the heights; it doesn't add to them. Divide g by f.")]),
      };
    }
    const fx2 = r.pick([[1, -2, 0], [1, 0, -3], [-1, 4, 0], [1, 2, -1]]);
    const shift = r.nonzero(-4, 4);
    const x0 = r.int(-2, 3);
    const inner = x0 - shift;
    const val = fx2[0] * inner * inner + fx2[1] * inner + fx2[2];
    return {
      prompt: `f(x) = ${poly(fx2)} and g(x) = f(x ${shift > 0 ? "−" : "+"} ${Math.abs(shift)}). Find g(${ms(x0)}).`,
      answer: num(val),
      hints: [`g(${ms(x0)}) = f(${ms(x0)} ${shift > 0 ? "−" : "+"} ${Math.abs(shift)}) = f(${ms(inner)}).`, `Evaluate ${poly(fx2)} at x = ${ms(inner)}.`],
      steps: [st("Substitute into the inside first.", `g(${ms(x0)}) = f(${ms(x0)} ${shift > 0 ? "−" : "+"} ${Math.abs(shift)}) = f(${ms(inner)})`), st("Evaluate f.", `f(${ms(inner)}) = ${val}`)],
      traps: traps(frac(val), [trap(fx2[0] * x0 * x0 + fx2[1] * x0 + fx2[2] - shift, "The shift is inside f, so change the input, not the output."), trap(fx2[0] * (x0 + shift) ** 2 + fx2[1] * (x0 + shift) + fx2[2], `f(x − h) means use x − h as the input: ${ms(x0)} ${shift > 0 ? "−" : "+"} ${Math.abs(shift)}.`)]),
    };
  },
};

// ---------- 7. Build a quadratic ----------
const build: Skill = {
  id: "m2.quad.build",
  title: "Write a quadratic from a graph or points",
  topic: T,
  standards: ["NC.M2.F-BF.1", "NC.M2.A-CED.2"],
  prereqs: ["m2.quad.vertex-form", "m2.quad.transform"],
  lesson: {
    bigIdea: "Know the vertex? Use y = a(x − h)^2 + k. Know the zeros? Use y = a(x − r)(x − s). Either way, use one more point to find a.",
    explain: [
      "Vertex (2, −3) through (4, 5): y = a(x − 2)^2 − 3. Substitute: 5 = a(2)^2 − 3, so 8 = 4a and a = 2. **y = 2(x − 2)^2 − 3**.",
      "Zeros −1 and 5 through (0, −10): y = a(x + 1)(x − 5). Substitute (0, −10): −10 = a(1)(−5), so a = 2. **y = 2(x + 1)(x − 5)**.",
      "Always check with a third point if one is visible.",
    ],
    visual: quadPlot([2, -8, 5], [{ x: 2, y: -3, label: "(2, −3)" }, { x: 4, y: 5, label: "(4, 5)" }]),
  },
  why: [
    { kind: "choice", prompt: "Why do you need a point other than the vertex to find a?", choices: ["Every parabola with that vertex passes through it, whatever a is; another point pins down the stretch.", "Because the vertex doesn't satisfy the equation.", "You don't; a is always 1.", "Because a is the y-intercept."], correct: 0, explain: "At the vertex, a(0)^2 = 0, so the vertex tells you nothing about a." },
    { kind: "written", prompt: "Explain why y = a(x − 3)(x + 2) has zeros at 3 and −2.", keyIdeas: ["at x = 3 the factor x − 3 is 0", "at x = −2 the factor x + 2 is 0", "a product with a zero factor is 0 (zero product property)"], exemplar: "When x = 3, the factor (x − 3) is 0, so the whole product is 0. When x = −2, the factor (x + 2) is 0, so again y = 0. Those are the zeros." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const a = lv === 1 ? r.pick([1, -1]) : r.pick([2, -2, 3, -1, 1, -3]);
      const h = r.nonzero(-4, 4), k = r.int(-6, 6);
      const dx = r.pick([1, 2, -1, -2]);
      const px = h + dx, py = a * dx * dx + k;
      const coefs = padd(pmul([a], pmul([1, -h], [1, -h])), [k]) as [number, number, number];
      return {
        prompt: `Write an equation in vertex form for the parabola with vertex ${pt(h, k)} that passes through ${pt(px, py)}.`,
        visual: quadPlot(coefs, [{ x: h, y: k, label: pt(h, k) }, { x: px, y: py, label: pt(px, py) }]),
        answer: expr(vexpr(a, h, k), { lhs: "y", form: "vertex", display: vform(a, h, k) }),
        hints: [`Start with y = a${binom(h)}^2${cstS(k)}.`, `Substitute ${pt(px, py)}: ${ms(py)} = a(${ms(px)} ${h >= 0 ? "−" : "+"} ${Math.abs(h)})^2${cstS(k)}. Solve for a.`],
        steps: [st("Use vertex form.", `y = a${binom(h)}^2${cstS(k)}`), st("Substitute the point.", `${ms(py)} = a(${ms(dx)})^2${cstS(k)} = ${dx * dx}a${cstS(k)}`), st("Solve for a.", `${dx * dx}a = ${py - k}, so a = ${ms(a)}`), st("Write the equation.", `y = ${vform(a, h, k)}`)],
      };
    }
    const p = r.int(-5, 2), q = p + r.int(2, 7);
    const a = r.pick([1, -1, 2, -2, 3]);
    const coefs = pmul([a], pmul([1, -p], [1, -q])) as [number, number, number];
    const yint = coefs[2];
    const usePt = yint === 0 ? { x: q + 1, y: a * (q + 1 - p) * 1 } : { x: 0, y: yint };
    const fact = `${a === 1 ? "" : a === -1 ? "−" : ms(a)}${binom(p)}${binom(q)}`;
    return {
      prompt: `A parabola has zeros at x = ${ms(p)} and x = ${ms(q)} and passes through ${pt(usePt.x, usePt.y)}. Write its equation in factored form.`,
      visual: quadPlot(coefs, [{ x: p, y: 0 }, { x: q, y: 0 }, { x: usePt.x, y: usePt.y, label: pt(usePt.x, usePt.y) }]),
      answer: expr(`${a === 1 ? "" : a === -1 ? "-" : a}${binomExpr(p)}${binomExpr(q)}`, { lhs: "y", form: "factored", display: fact }),
      hints: [`Start with y = a${binom(p)}${binom(q)}.`, `Substitute ${pt(usePt.x, usePt.y)} and solve for a.`],
      steps: [st("Use factored form.", `y = a${binom(p)}${binom(q)}`), st("Substitute the point.", `${ms(usePt.y)} = a(${ms(usePt.x - p)})(${ms(usePt.x - q)}) = ${ms((usePt.x - p) * (usePt.x - q))}a`), st("Solve for a.", `a = ${ms(a)}`), st("Write the equation.", `y = ${fact}`)],
    };
  },
};

const skills: Skill[] = [polyOps, features, vertexForm, completeSquare, maxMin, transform, build];
export default skills;
export { quadPlot };
