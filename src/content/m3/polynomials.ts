// Unit 3: Polynomial functions.
import { choice, cst, expr, ms, num, poly, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill } from "../types";
import { evalPoly, factoredT, factoredText, fromRoots, mulPoly } from "./util";

const T = "m3-polynomials";

/** Distinct nonzero integers in a range. */
function distinct(r: { int(a: number, b: number): number }, n: number, lo: number, hi: number, nonzero = true): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = r.int(lo, hi);
    if ((nonzero && v === 0) || out.includes(v)) continue;
    out.push(v);
  }
  return out;
}

/** y-window that shows a polynomial on [x0, x1] (clamped so huge values don't flatten it). */
function window(c: number[], x0: number, x1: number, extra: number[] = []) {
  let lo = 0, hi = 0;
  for (let k = 0; k <= 60; k++) {
    const y = evalPoly(c, x0 + ((x1 - x0) * k) / 60);
    lo = Math.min(lo, y);
    hi = Math.max(hi, y);
  }
  for (const y of extra) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
  lo = Math.max(lo, -40);
  hi = Math.min(hi, 40);
  const pad = Math.max(2, (hi - lo) * 0.1);
  const span = hi - lo + 2 * pad;
  return { yMin: Math.floor(lo - pad), yMax: Math.ceil(hi + pad), yStep: span > 60 ? 10 : span > 30 ? 5 : span > 14 ? 2 : 1 };
}

// ---------------------------------------------------------------------------
const END: Record<string, string> = {
  uu: "As x → −∞, f(x) → ∞; as x → ∞, f(x) → ∞",
  du: "As x → −∞, f(x) → −∞; as x → ∞, f(x) → ∞",
  ud: "As x → −∞, f(x) → ∞; as x → ∞, f(x) → −∞",
  dd: "As x → −∞, f(x) → −∞; as x → ∞, f(x) → −∞",
};

const endBehavior: Skill = {
  id: "m3.poly.end-behavior",
  title: "End behavior of polynomials",
  topic: T,
  standards: ["NC.M3.F-IF.7", "NC.M3.F-IF.4", "NC.M3.A-SSE.1a"],
  prereqs: [],
  lesson: {
    bigIdea: "For large |x|, a polynomial acts like its leading term a·x^n. The degree n (even or odd) and the sign of a decide where the ends of the graph go.",
    explain: [
      "**Even degree:** both ends go the same way: up if a > 0, down if a < 0 (like x^2 or −x^2).",
      "**Odd degree:** the ends go opposite ways: down-left and up-right if a > 0 (like x^3), up-left and down-right if a < 0.",
      "Example: f(x) = −2x^3 + 5x^2 + x − 4 has leading term −2x^3 (odd, negative), so as x → −∞, f(x) → ∞, and as x → ∞, f(x) → −∞. For a factored form like (3 − x)(x + 1)^2, multiply the x-parts: (−x)(x)^2 = −x^3.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 4, yMin: -12, yMax: 12, yStep: 4, curves: [{ expr: "-2x^3+5x^2+x-4" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does the leading term decide end behavior?", choices: ["For large |x|, the highest power is so much bigger than the other terms that they barely matter.", "Because it is written first.", "Because it has the biggest coefficient."], correct: 0, explain: "At x = 100, x^3 is a million while 5x^2 is only 50,000. The top power dominates." },
    { kind: "written", prompt: "Explain how to find the end behavior of f(x) = (2 − x)(x + 3)^2 without multiplying it out.", keyIdeas: ["the leading term comes from multiplying the x-terms of each factor", "(−x)(x)^2 = −x^3", "odd degree with negative leading coefficient: up on the left, down on the right"], exemplar: "The highest power comes from the x-part of each factor: (−x) · (x)^2 = −x^3. That's odd degree with a negative coefficient, so the graph goes up as x → −∞ and down as x → ∞." },
  ],
  generate(r, lv) {
    const n = r.int(2, 5);
    const a = r.pick([1, 2, 3, -1, -2, -3]);
    const left = a * (n % 2 ? -1 : 1) > 0 ? "u" : "d", right = a > 0 ? "u" : "d";
    const key = left + right;
    let shown: string;
    let lead: string;
    if (lv < 3) {
      const coefs = [a, ...Array.from({ length: n }, () => r.int(-9, 9))];
      if (coefs[1] === 0) coefs[1] = r.nonzero(-9, 9);
      lead = `${a === 1 ? "" : a === -1 ? "−" : ms(a)}x^${n}`;
      if (lv === 1) shown = poly(coefs);
      else {
        // Write the terms out of order.
        const terms = coefs.map((c, i) => [c, n - i] as [number, number]).filter(([c]) => c !== 0);
        const order = r.shuffle(terms);
        if (order[0][1] === n) order.push(order.shift()!);
        shown = order.map(([c, p], i) => {
          const body = `${Math.abs(c) === 1 && p > 0 ? "" : Math.abs(c)}${p === 0 ? "" : p === 1 ? "x" : `x^${p}`}`;
          return i === 0 ? `${c < 0 ? "−" : ""}${body}` : ` ${c < 0 ? "−" : "+"} ${body}`;
        }).join("");
      }
    } else {
      const roots = distinct(r, 3, -4, 4, false).filter((x) => x !== 0).slice(0, 2);
      if (roots.length < 2) roots.push(5);
      const m = [1, 2];
      const flip = r.chance(0.6);
      let k = r.int(1, 5);
      while (roots.includes(k)) k++;
      const c = Math.abs(a);
      // n here is 1 + 1 + 2 = 4 or with flip (k − x)
      const deg = 1 + m[0] + m[1];
      const sgn = flip ? -1 : 1;
      const realA = (a > 0 ? 1 : -1) * c * sgn;
      const l2 = realA * (deg % 2 ? -1 : 1) > 0 ? "u" : "d", r2 = realA > 0 ? "u" : "d";
      const first = flip ? `(${k} − x)` : `(x ${k > 0 ? "−" : "+"} ${k})`;
      shown = `${a < 0 ? (c === 1 ? "−" : `−${c}`) : c === 1 ? "" : c}${first}${factoredText(1, [[roots[0], m[0]], [roots[1], m[1]]])}`;
      lead = `${realA === 1 ? "" : realA === -1 ? "−" : ms(realA)}x^${deg}`;
      const keyLv3 = l2 + r2;
      return {
        prompt: `Describe the end behavior of f(x) = ${shown}.`,
        answer: choice(r, END[keyLv3], Object.keys(END).filter((x) => x !== keyLv3).map((x) => [END[x], "Find the leading term by multiplying the x-parts of each factor."] as [string, string])),
        hints: ["Multiply just the x-terms of the factors (and the number in front) to get the leading term.", `${flip ? `Careful: (${k} − x) contributes −x, not x.` : "Each (x ± c) contributes x."} The leading term is ${lead}.`],
        steps: [
          st("Find the leading term.", `${a < 0 ? (c === 1 ? "−1" : `−${c}`) : c} · (${flip ? "−x" : "x"}) · (x) · (x)^2 = ${lead}`),
          st("Degree and sign.", `Degree ${deg} is ${deg % 2 ? "odd" : "even"}; the leading coefficient is ${realA > 0 ? "positive" : "negative"}.`),
          st("End behavior.", END[keyLv3] + "."),
        ],
      };
    }
    return {
      prompt: `Describe the end behavior of f(x) = ${shown}.`,
      answer: choice(r, END[key], Object.keys(END).filter((x) => x !== key).map((x) => [END[x], x[0] === x[1] && n % 2 ? "An odd-degree polynomial's ends go in opposite directions." : x[0] !== x[1] && n % 2 === 0 ? "An even-degree polynomial's ends go the same direction." : "Check the sign of the leading coefficient."] as [string, string])),
      hints: [lv === 2 ? "The leading term has the highest power of x, wherever it's written." : "Look at the leading term only.", `The leading term is ${lead}: degree ${n} (${n % 2 ? "odd" : "even"}), coefficient ${a > 0 ? "positive" : "negative"}.`],
      steps: [
        st("Find the leading term.", lead),
        st("Degree.", `${n} is ${n % 2 ? "odd, so the ends go in opposite directions" : "even, so both ends go the same direction"}.`),
        st("Sign.", `The coefficient ${ms(a)} is ${a > 0 ? "positive, so the right end goes up" : "negative, so the right end goes down"}.`),
        st("End behavior.", END[key] + "."),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const zeros: Skill = {
  id: "m3.poly.zeros",
  title: "Zeros and multiplicity",
  topic: T,
  standards: ["NC.M3.A-APR.3", "NC.M3.F-IF.7", "NC.M3.F-IF.4"],
  prereqs: ["m3.poly.end-behavior"],
  lesson: {
    bigIdea: "Each factor (x − r) gives a zero at x = r. If the factor appears an odd number of times the graph crosses the x-axis there; an even number of times, it touches and turns around.",
    explain: [
      "f(x) = (x + 2)(x − 1)^2: zeros at x = −2 and x = 1.",
      "(x + 2) appears once (multiplicity 1), so the graph **crosses** at x = −2. (x − 1) appears twice (multiplicity 2), so the graph **touches** the axis at x = 1 and bounces back.",
      "The y-intercept is f(0) = (2)(−1)^2 = 2, and since the leading term is x^3, the graph rises to the right.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 3, yMin: -6, yMax: 8, curves: [{ expr: "(x+2)(x-1)^2" }], points: [{ x: -2, y: 0, label: "crosses" }, { x: 1, y: 0, label: "touches" }, { x: 0, y: 2, label: "(0, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does the graph of (x − 3)^2 · g(x) touch, but not cross, the x-axis at x = 3 (when g(3) ≠ 0)?", choices: ["(x − 3)^2 is never negative, so the sign of f doesn't change as x passes 3.", "Because 2 is an even number of zeros.", "Squared factors have no zeros."], correct: 0, explain: "Near x = 3, the sign of f is the sign of g, on both sides, so f stays on one side of the axis." },
    { kind: "written", prompt: "Explain how the factors of f(x) = x(x − 4)(x + 1) connect to the solutions of f(x) = 0 and the graph.", keyIdeas: ["a product is 0 when a factor is 0", "solutions are x = 0, 4, −1", "these are the x-intercepts of the graph"], exemplar: "f(x) = 0 when one of the factors is 0: x = 0, x − 4 = 0, or x + 1 = 0. So the solutions are 0, 4 and −1, and those are exactly where the graph meets the x-axis." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const rs = distinct(r, 3, -6, 6, false);
      const a = r.pick([1, 2, -1, 3]);
      const shown = factoredText(a, rs.map((x) => [x, 1] as [number, number]));
      return {
        prompt: `What are the zeros of f(x) = ${shown}?`,
        answer: { kind: "multi", fields: rs.map((x) => ({ value: frac(x), pre: "x =" })), anyOrder: [0, 1, 2] },
        hints: ["Set each factor equal to 0.", `For example, ${factoredText(1, [[rs[0], 1]])} = 0 gives x = ${ms(rs[0])}.`],
        steps: [st("Set each factor to 0.", rs.map((x) => `${factoredText(1, [[x, 1]])} = 0 → x = ${ms(x)}`).join("; ")), st("Zeros.", rs.map(ms).join(", "))],
      };
    }
    if (lv === 2) {
      const [d, s1, s2] = distinct(r, 3, -5, 5);
      const three = r.chance(0.5);
      const fs: [number, number][] = three ? [[s1, 1], [d, 2], [s2, 1]] : [[d, 2], [s1, 1]];
      const shown = factoredText(r.pick([1, -1, 2]), r.shuffle(fs));
      return {
        prompt: `At which zero does the graph of f(x) = ${shown} touch the x-axis and turn around, instead of crossing it?`,
        answer: num(d, { pre: "x = " }),
        hints: ["Look at the exponent (multiplicity) on each factor.", "An even multiplicity means touch-and-turn; odd means cross."],
        steps: [
          st("Multiplicities.", fs.map(([x, m]) => `x = ${ms(x)}: multiplicity ${m}`).join("; ")),
          st("Even multiplicity touches.", `Only x = ${ms(d)} has an even multiplicity (2), so the graph touches there.`),
        ],
        traps: traps(frac(d), [trap(-d, `Check the sign: ${factoredText(1, [[d, 1]])} = 0 when x = ${ms(d)}.`), trap(s1, `x = ${ms(s1)} has multiplicity 1, so the graph crosses there.`)]),
      };
    }
    const [p, q] = distinct(r, 2, -3, 3);
    const a = r.pick([1, -1, 0.5, -0.5]);
    const c = mulPoly(mulPoly([a], fromRoots([p, p])), fromRoots([q]));
    const x0 = Math.min(p, q) - 2.5, x1 = Math.max(p, q) + 2.5;
    const w = window(c, x0, x1);
    const aT = a === 0.5 ? "0.5" : a === -0.5 ? "-0.5" : String(a);
    const fmt = (aa: number, f: [number, number][]) => `f(x) = ${aa === 0.5 ? "{1/2}" : aa === -0.5 ? "−{1/2}" : aa === 1 ? "" : "−"}${factoredText(1, f)}`;
    const correct = fmt(a, [[p, 2], [q, 1]]);
    return {
      prompt: "Which equation could match the graph shown?",
      visual: { type: "plot", xMin: Math.floor(x0), xMax: Math.ceil(x1), ...w, curves: [{ expr: `${aT}*(x-${p})^2*(x-${q})`.replace(/--/g, "+") }] },
      answer: choice(r, correct, [
        [fmt(a, [[p, 1], [q, 2]]), "Check where the graph touches (even multiplicity) and where it crosses."],
        [fmt(-a, [[p, 2], [q, 1]]), "Check the end behavior: the sign of the leading coefficient is wrong."],
        [fmt(a, [[-p, 2], [-q, 1]]), "A zero at x = r comes from the factor (x − r), so the signs are reversed."],
      ]),
      hints: ["Find the x-intercepts. Where does the graph cross, and where does it touch and turn?", "Then check the right end: rising means a positive leading coefficient."],
      steps: [
        st("Zeros.", `The graph touches at x = ${ms(p)} (so (${factoredText(1, [[p, 1]]).replace(/[()]/g, "")})^2) and crosses at x = ${ms(q)} (so ${factoredText(1, [[q, 1]])}).`),
        st("End behavior.", `As x → ∞ the graph goes ${a > 0 ? "up" : "down"}, so the leading coefficient is ${a > 0 ? "positive" : "negative"}.`),
        st("Answer.", correct),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const write: Skill = {
  id: "m3.poly.write",
  title: "Write a polynomial from its zeros",
  topic: T,
  standards: ["NC.M3.F-BF.1a", "NC.M3.A-APR.3", "NC.M3.A-CED.2"],
  prereqs: ["m3.poly.zeros"],
  lesson: {
    bigIdea: "Zeros give the factors; one more point gives the leading coefficient a in f(x) = a(x − r_1)(x − r_2)….",
    explain: [
      "Zeros −2, 1 and 3, with y-intercept 12: f(x) = a(x + 2)(x − 1)(x − 3).",
      "Use the point (0, 12): 12 = a(2)(−1)(−3) = 6a, so a = 2. **f(x) = 2(x + 2)(x − 1)(x − 3)**.",
      "On a graph, a zero where the curve touches and turns gets a squared factor.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why isn't f(x) = (x + 2)(x − 1)(x − 3) the only polynomial with zeros −2, 1 and 3?", choices: ["Multiplying by any nonzero number a keeps the same zeros but stretches the graph.", "Because the zeros could be in any order.", "It is the only one."], correct: 0, explain: "a · 0 = 0, so every a(x + 2)(x − 1)(x − 3) has the same zeros. A point pins down a." },
    { kind: "written", prompt: "A cubic has zeros at x = 0 and x = 5 only, and its graph touches the x-axis at x = 5. Explain how to write its factors.", keyIdeas: ["zero at 0 gives a factor x", "touching at 5 means even multiplicity: (x − 5)^2", "degree 3 total: f(x) = a·x(x − 5)^2"], exemplar: "The zero at 0 gives the factor x. Touching at x = 5 means that zero has even multiplicity, so (x − 5)^2. Together that's degree 3: f(x) = a·x(x − 5)^2, with a found from another point." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const rs = distinct(r, 3, -5, 5, false);
      const fs = rs.map((x) => [x, 1] as [number, number]);
      return {
        prompt: `Write a cubic function with leading coefficient 1 whose zeros are ${rs.map(ms).join(", ")}.`,
        answer: expr(factoredT(1, fs), { lhs: "f(x)", display: factoredText(1, fs) }),
        hints: ["A zero at x = r comes from a factor (x − r).", `So the factors are ${fs.map((f) => factoredText(1, [f])).join(", ")}.`],
        steps: [st("Write a factor for each zero.", fs.map((f) => `x = ${ms(f[0])} → ${factoredText(1, [f])}`).join("; ")), st("Multiply them.", `f(x) = ${factoredText(1, fs)}`)],
      };
    }
    if (lv === 2) {
      const rs = distinct(r, 3, -4, 4);
      const a = r.pick([2, 3, -1, -2, 4]);
      const prod = rs.reduce((p, x) => p * -x, 1);
      const yi = a * prod;
      const fs = rs.map((x) => [x, 1] as [number, number]);
      return {
        prompt: `A cubic function has zeros ${rs.map(ms).join(", ")} and y-intercept ${ms(yi)}. Write the function.`,
        answer: expr(factoredT(a, fs), { lhs: "f(x)", display: factoredText(a, fs) }),
        hints: [`Start with f(x) = a${factoredText(1, fs)}.`, `Substitute (0, ${ms(yi)}): ${ms(yi)} = a · ${rs.map((x) => sn(-x)).join(" · ")} = ${ms(prod)}a.`],
        steps: [
          st("Factors from the zeros.", `f(x) = a${factoredText(1, fs)}`),
          st("Use the y-intercept.", `f(0) = a · ${rs.map((x) => sn(-x)).join(" · ")} = ${ms(prod)}a = ${ms(yi)}`),
          st("Solve for a.", `a = ${ms(yi)} ÷ ${sn(prod)} = ${ms(a)}`),
          st("Answer.", `f(x) = ${factoredText(a, fs)}`),
        ],
      };
    }
    const [p, q] = distinct(r, 2, -3, 3);
    const a = r.pick([1, -1, 2, -2]);
    const fs: [number, number][] = [[p, 2], [q, 1]];
    const c = fromRoots([p, p, q], a);
    const yi = evalPoly(c, 0);
    const x0 = Math.min(p, q, 0) - 2, x1 = Math.max(p, q, 0) + 2;
    const w = window(c, x0, x1, [yi]);
    return {
      prompt: "Write an equation for the cubic function graphed below. The labeled points are on the graph.",
      visual: { type: "plot", xMin: x0, xMax: x1, ...w, curves: [{ expr: factoredT(a, fs) }], points: [{ x: p, y: 0, label: `(${ms(p)}, 0)` }, { x: q, y: 0, label: `(${ms(q)}, 0)` }, { x: 0, y: yi, label: `(0, ${ms(yi)})` }] },
      answer: expr(factoredT(a, fs), { lhs: "f(x)", display: factoredText(a, fs) }),
      hints: [`The graph touches the axis at x = ${ms(p)} (a squared factor) and crosses at x = ${ms(q)}.`, `f(x) = a${factoredText(1, fs)}. Use (0, ${ms(yi)}) to find a.`],
      steps: [
        st("Factors.", `Touch at x = ${ms(p)} → ${factoredText(1, [[p, 2]])}; cross at x = ${ms(q)} → ${factoredText(1, [[q, 1]])}.`),
        st("Use the y-intercept.", `f(0) = a · ${sn(-p)}^2 · ${sn(-q)} = ${ms(p * p * -q)}a = ${ms(yi)}`),
        st("Solve for a.", `a = ${ms(a)}`),
        st("Answer.", `f(x) = ${factoredText(a, fs)}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const factor: Skill = {
  id: "m3.poly.factor",
  title: "Factor polynomials using structure",
  topic: T,
  standards: ["NC.M3.A-SSE.2", "NC.M3.A-APR.3"],
  prereqs: [],
  lesson: {
    bigIdea: "Look for structure: a common factor first, then grouping, special patterns (difference of squares or cubes), or a quadratic in disguise.",
    explain: [
      "**Grouping:** x^3 + 2x^2 − 9x − 18 = x^2(x + 2) − 9(x + 2) = (x + 2)(x^2 − 9) = **(x + 2)(x − 3)(x + 3)**.",
      "**Cubes:** a^3 − b^3 = (a − b)(a^2 + ab + b^2) and a^3 + b^3 = (a + b)(a^2 − ab + b^2). So x^3 − 27 = (x − 3)(x^2 + 3x + 9).",
      "**Quadratic form:** x^4 − 13x^2 + 36: let u = x^2 to get u^2 − 13u + 36 = (u − 4)(u − 9). Then (x^2 − 4)(x^2 − 9) = (x − 2)(x + 2)(x − 3)(x + 3).",
    ],
    tip: "Always check whether a factor can be factored again. x^2 − 9 can; x^2 + 9 can't (over the real numbers).",
  },
  why: [
    { kind: "choice", prompt: "Why does grouping work on x^3 + 2x^2 − 9x − 18?", choices: ["Both pairs share the factor (x + 2) after you take out x^2 and −9.", "Because every cubic can be grouped.", "Because the coefficients add to zero."], correct: 0, explain: "x^2(x + 2) − 9(x + 2) has the common factor (x + 2), which you can pull out like any common factor." },
    { kind: "written", prompt: "Explain why x^4 − 16 factors as (x^2 + 4)(x − 2)(x + 2).", keyIdeas: ["x^4 − 16 is a difference of squares: (x^2)^2 − 4^2", "so (x^2 − 4)(x^2 + 4)", "x^2 − 4 is another difference of squares: (x − 2)(x + 2)"], exemplar: "x^4 = (x^2)^2 and 16 = 4^2, so x^4 − 16 = (x^2 − 4)(x^2 + 4). The first factor is a difference of squares again, (x − 2)(x + 2). x^2 + 4 is a sum of squares and doesn't factor over the reals." },
  ],
  generate(r, lv) {
    const fin = (shown: string, typed: string, display: string, hints: string[], steps: string[]) => ({
      prompt: `Factor completely: ${shown}`,
      answer: expr(typed, { form: "factored", display }) as Answer,
      hints,
      steps,
    });
    if (lv === 1) {
      const c = r.pick([2, 3, 4, 5, -2, -3]);
      const [p, q] = distinct(r, 2, -6, 6);
      const tri = fromRoots([p, q]);
      const coefs = [...tri.map((t) => t * c), 0];
      const display = `${c === -1 ? "−" : ms(c)}x${factoredText(1, [[p, 1], [q, 1]])}`;
      return fin(poly(coefs), `${c}x${factoredT(1, [[p, 1], [q, 1]])}`, display,
        [`Every term has a factor of ${ms(c)}x. Take it out first.`, `${ms(c)}x(${poly(tri)}). Now factor the trinomial: two numbers that multiply to ${ms(tri[2])} and add to ${ms(tri[1])}.`],
        [st("Take out the GCF.", `${poly(coefs)} = ${ms(c)}x(${poly(tri)})`), st("Factor the trinomial.", `${poly(tri)} = ${factoredText(1, [[p, 1], [q, 1]])}`), st("Answer.", display)]);
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const a = r.nonzero(-5, 5), b = r.int(2, 5);
        // (x + a)(x^2 − b^2) = x^3 + a x^2 − b^2 x − a b^2
        const coefs = [1, a, -b * b, -a * b * b];
        const display = `${factoredText(1, [[-a, 1]])}${factoredText(1, [[b, 1], [-b, 1]])}`;
        return fin(poly(coefs), `${factoredT(1, [[-a, 1]])}*${factoredT(1, [[b, 1], [-b, 1]])}`, display,
          ["Group the first two terms and the last two terms.", `x^2${factoredText(1, [[-a, 1]])} − ${b * b}${factoredText(1, [[-a, 1]])}. Pull out the common binomial, then look for a difference of squares.`],
          [
            st("Group.", `(x^3${cst(a)}x^2) + (−${b * b}x${cst(-a * b * b)}) = x^2${factoredText(1, [[-a, 1]])} − ${b * b}${factoredText(1, [[-a, 1]])}`),
            st("Factor out the common binomial.", `${factoredText(1, [[-a, 1]])}(x^2 − ${b * b})`),
            st("Difference of squares.", `x^2 − ${b * b} = (x − ${b})(x + ${b})`),
            st("Answer.", display),
          ]);
      }
      const b = r.int(1, 5), plus = r.chance(0.5);
      const shown = `x^3 ${plus ? "+" : "−"} ${b ** 3}`;
      const quad = `x^2 ${plus ? "−" : "+"} ${b === 1 ? "" : b}x + ${b * b}`;
      const display = `(x ${plus ? "+" : "−"} ${b})(${quad})`;
      return fin(shown, `(x${plus ? "+" : "-"}${b})(x^2${plus ? "-" : "+"}${b}x+${b * b})`, display,
        [`${b ** 3} = ${b}^3, so this is a ${plus ? "sum" : "difference"} of cubes.`, `a^3 ${plus ? "+" : "−"} b^3 = (a ${plus ? "+" : "−"} b)(a^2 ${plus ? "−" : "+"} ab + b^2) with a = x, b = ${b}.`],
        [st("Recognize the pattern.", `${shown} = x^3 ${plus ? "+" : "−"} ${b}^3`), st("Apply the formula.", `(x ${plus ? "+" : "−"} ${b})(x^2 ${plus ? "−" : "+"} ${b}x + ${b * b})`), st("Check the quadratic.", `x^2 ${plus ? "−" : "+"} ${b}x + ${b * b} has discriminant ${b * b} − ${4 * b * b} < 0, so it doesn't factor further.`), st("Answer.", display)]);
    }
    if (r.chance(0.6)) {
      const [p, q] = distinct(r, 2, 1, 5);
      const coefs = [1, 0, -(p * p + q * q), 0, p * p * q * q];
      const display = `(x − ${p})(x + ${p})(x − ${q})(x + ${q})`;
      return fin(poly(coefs), `(x-${p})(x+${p})(x-${q})(x+${q})`, display,
        ["This is a quadratic in x^2. Let u = x^2.", `u^2 − ${p * p + q * q}u + ${p * p * q * q} = (u − ${p * p})(u − ${q * q}). Then each factor is a difference of squares.`],
        [st("Substitute u = x^2.", `u^2 − ${p * p + q * q}u + ${p * p * q * q}`), st("Factor the quadratic.", `(u − ${p * p})(u − ${q * q}) = (x^2 − ${p * p})(x^2 − ${q * q})`), st("Difference of squares twice.", display)]);
    }
    const b = r.pick([1, 2, 3]);
    const B = b * b;
    const display = `(x^2 + ${B})(x − ${b})(x + ${b})`;
    return fin(`x^4 − ${B * B}`, `(x^2+${B})(x-${b})(x+${b})`, display,
      [`x^4 = (x^2)^2 and ${B * B} = ${B}^2: a difference of squares.`, `(x^2 − ${B})(x^2 + ${B}). One of these factors again.`],
      [st("Difference of squares.", `x^4 − ${B * B} = (x^2 − ${B})(x^2 + ${B})`), st("Factor again.", `x^2 − ${B} = (x − ${b})(x + ${b}); x^2 + ${B} doesn't factor over the reals.`), st("Answer.", display)]);
  },
};

// ---------------------------------------------------------------------------
const solve: Skill = {
  id: "m3.poly.solve",
  title: "Solve polynomial equations",
  topic: T,
  standards: ["NC.M3.A-CED.1", "NC.M3.A-REI.1", "NC.M3.A-APR.3", "NC.M3.A-SSE.2"],
  prereqs: ["m3.poly.factor"],
  lesson: {
    bigIdea: "Get 0 on one side, factor completely, and set each factor equal to 0 (the zero product property).",
    explain: [
      "Solve x^3 − 3x^2 − 4x + 12 = 0. Group: x^2(x − 3) − 4(x − 3) = (x − 3)(x^2 − 4) = (x − 3)(x − 2)(x + 2).",
      "Each factor can be 0: **x = 3, x = 2, x = −2**. Those are also the x-intercepts of y = x^3 − 3x^2 − 4x + 12.",
      "Never divide both sides by x: in x^3 = 9x you'd lose the solution x = 0. Instead write x^3 − 9x = 0, so x(x − 3)(x + 3) = 0.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 5, yMin: -10, yMax: 20, yStep: 5, curves: [{ expr: "x^3-3x^2-4x+12" }], points: [{ x: -2, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  },
  why: [
    { kind: "choice", prompt: "Why must one side be 0 before you use the factors?", choices: ["Only a product equal to 0 forces one factor to be 0; a product equal to 6 could come from many factor values.", "Because 0 is easier to write.", "It doesn't need to be."], correct: 0, explain: "The zero product property only works for 0." },
    { kind: "written", prompt: "Jay solved x^3 = 16x by dividing both sides by x and got x = ±4. Explain what he missed.", keyIdeas: ["dividing by x assumes x ≠ 0", "x = 0 is also a solution", "rewrite as x^3 − 16x = 0 = x(x − 4)(x + 4)"], exemplar: "Dividing by x only works if x isn't 0, and x = 0 actually works: 0 = 0. Writing x^3 − 16x = 0 and factoring x(x − 4)(x + 4) = 0 gives all three solutions: 0, 4 and −4." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const c = r.pick([2, 3, -2, 4]);
      const [p, q] = distinct(r, 2, -7, 7);
      return {
        prompt: `Solve ${ms(c)}x${factoredText(1, [[p, 1], [q, 1]])} = 0. Give all three solutions.`,
        answer: { kind: "multi", fields: [0, p, q].map((v) => ({ value: frac(v), pre: "x =" })), anyOrder: [0, 1, 2] },
        hints: ["A product is 0 only when one of its factors is 0.", `Set x = 0, ${factoredText(1, [[p, 1]])} = 0 and ${factoredText(1, [[q, 1]])} = 0.`],
        steps: [st("Zero product property.", `x = 0, or ${factoredText(1, [[p, 1]])} = 0, or ${factoredText(1, [[q, 1]])} = 0.`), st("Solve each.", `x = 0, x = ${ms(p)}, x = ${ms(q)}`)],
      };
    }
    if (lv === 2) {
      const a = r.nonzero(-6, 6), b = r.int(1, 6);
      if (Math.abs(a) === b) return solve.generate(r, lv);
      const coefs = [1, a, -b * b, -a * b * b];
      return {
        prompt: `Solve ${poly(coefs)} = 0. Give all three solutions.`,
        answer: { kind: "multi", fields: [-a, b, -b].map((v) => ({ value: frac(v), pre: "x =" })), anyOrder: [0, 1, 2] },
        hints: ["Factor by grouping: pair the first two terms and the last two.", `x^2${factoredText(1, [[-a, 1]])} − ${b * b}${factoredText(1, [[-a, 1]])} = ${factoredText(1, [[-a, 1]])}(x^2 − ${b * b}).`],
        steps: [
          st("Group.", `x^2${factoredText(1, [[-a, 1]])} − ${b * b}${factoredText(1, [[-a, 1]])} = 0`),
          st("Factor.", `${factoredText(1, [[-a, 1]])}(x − ${b})(x + ${b}) = 0`),
          st("Solve each factor.", `x = ${ms(-a)}, x = ${b}, x = −${b}`),
        ],
      };
    }
    const [p, q] = distinct(r, 2, 1, 5);
    const coefs = [1, 0, -(p * p + q * q), 0, p * p * q * q];
    return {
      prompt: `Solve ${poly(coefs)} = 0. Give all four solutions.`,
      answer: { kind: "multi", fields: [p, -p, q, -q].map((v) => ({ value: frac(v), pre: "x =" })), anyOrder: [0, 1, 2, 3] },
      hints: ["Treat it as a quadratic in x^2: let u = x^2.", `(u − ${p * p})(u − ${q * q}) = 0, so x^2 = ${p * p} or x^2 = ${q * q}.`],
      steps: [
        st("Substitute u = x^2.", `u^2 − ${p * p + q * q}u + ${p * p * q * q} = 0`),
        st("Factor.", `(u − ${p * p})(u − ${q * q}) = 0, so x^2 = ${p * p} or x^2 = ${q * q}`),
        st("Take square roots (both signs).", `x = ±${p} or x = ±${q}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const remainder: Skill = {
  id: "m3.poly.remainder",
  title: "The Remainder Theorem",
  topic: T,
  standards: ["NC.M3.A-APR.2"],
  prereqs: [],
  lesson: {
    bigIdea: "When p(x) is divided by (x − a), the remainder is p(a). So (x − a) is a factor exactly when p(a) = 0.",
    explain: [
      "p(x) = x^3 − 4x^2 + x + 6 divided by (x − 2): the remainder is p(2) = 8 − 16 + 2 + 6 = **0**, so (x − 2) is a factor.",
      "Divided by (x + 1), which is (x − (−1)): the remainder is p(−1) = −1 − 4 − 1 + 6 = **0** too, so (x + 1) is also a factor.",
      "Why it works: p(x) = (x − a)q(x) + r. Put in x = a: p(a) = 0 · q(a) + r = r.",
    ],
  },
  why: [
    { kind: "choice", prompt: "To find the remainder of p(x) ÷ (x + 3), which value do you substitute?", choices: ["x = −3, because x + 3 = x − (−3).", "x = 3", "x = 0"], correct: 0, explain: "The theorem uses (x − a). Here a = −3." },
    { kind: "written", prompt: "Explain why p(x) = (x − a) · q(x) + r shows that the remainder equals p(a).", keyIdeas: ["substitute x = a", "x − a becomes 0, so the first product is 0", "what's left is r, so p(a) = r"], exemplar: "Substitute x = a into p(x) = (x − a)q(x) + r. The factor (x − a) becomes 0, which wipes out (x − a)q(a). All that's left is r, so p(a) = r." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const a = lv === 1 ? r.int(1, 3) : r.int(-3, -1);
      const deg = lv === 1 ? 3 : r.pick([3, 4]);
      const coefs = [r.pick([1, 2, -1]), ...Array.from({ length: deg }, () => r.int(-6, 6))];
      const rem = evalPoly(coefs, a);
      const work = coefs.map((c, i) => `${i ? (c < 0 ? " − " : " + ") : c < 0 ? "−" : ""}${Math.abs(c)}${deg - i > 0 ? `(${ms(a)})${deg - i > 1 ? `^${deg - i}` : ""}` : ""}`).join("");
      const divisor = a > 0 ? `(x − ${a})` : `(x + ${-a})`;
      return {
        prompt: `What is the remainder when p(x) = ${poly(coefs)} is divided by ${divisor}?`,
        answer: num(rem),
        hints: [`By the Remainder Theorem, the remainder is p(${ms(a)}).`, a < 0 ? `Substitute x = ${ms(a)}, using parentheses around the negative.` : `Substitute x = ${a} into every term.`],
        steps: [
          st("Use the Remainder Theorem.", `${divisor} = (x − ${sn(a)}), so the remainder is p(${ms(a)}).`),
          st("Substitute.", `p(${ms(a)}) = ${work}`),
          st("Simplify.", `p(${ms(a)}) = ${ms(rem)}`),
        ],
        traps: traps(frac(rem), [trap(evalPoly(coefs, -a), `That's p(${ms(-a)}). For ${divisor}, use x = ${ms(a)}.`), trap(coefs[coefs.length - 1], "The constant term is p(0), not the remainder for this divisor.")]),
      };
    }
    const a = r.nonzero(-3, 3), c1 = r.int(-6, 6), k = r.nonzero(-5, 5);
    const c0 = -(a ** 3 + k * a * a + c1 * a);
    const shown = `x^3 + kx^2${c1 ? (c1 > 0 ? ` + ${c1 === 1 ? "" : c1}x` : ` − ${c1 === -1 ? "" : -c1}x`) : ""}${cst(c0)}`;
    const divisor = a > 0 ? `(x − ${a})` : `(x + ${-a})`;
    const known = a ** 3 + c1 * a + c0;
    return {
      prompt: `For what value of k is ${divisor} a factor of p(x) = ${shown}?`,
      answer: num(k, { pre: "k = " }),
      hints: [`${divisor} is a factor exactly when p(${ms(a)}) = 0.`, `p(${ms(a)}) = ${ms(a ** 3)} + ${a * a}k${cst(c1 * a)}${cst(c0)}. Set it equal to 0.`],
      steps: [
        st("Factor means remainder 0.", `Set p(${ms(a)}) = 0.`),
        st("Substitute.", `(${ms(a)})^3 + k(${ms(a)})^2${c1 ? ` ${c1 * a < 0 ? "−" : "+"} ${Math.abs(c1 * a)}` : ""}${cst(c0)} = 0, so ${a * a}k ${known < 0 ? "−" : "+"} ${Math.abs(known)} = 0`),
        st("Solve.", `${a * a}k = ${ms(-known)}, so k = ${ms(k)}`),
      ],
      traps: traps(frac(k), [trap(-k, "Check your signs when moving the constant to the other side.")]),
    };
  },
};

// ---------------------------------------------------------------------------
const divide: Skill = {
  id: "m3.poly.divide",
  title: "Divide polynomials",
  topic: T,
  standards: ["NC.M3.A-APR.6", "NC.M3.A-APR.2"],
  prereqs: ["m3.poly.remainder"],
  lesson: {
    bigIdea: "Dividing p(x) by (x − a) gives p(x) = (x − a)q(x) + r, which you can write as {p(x)/x − a} = q(x) + {r/x − a}. Synthetic division does it quickly.",
    explain: [
      "Divide 2x^3 − 3x^2 − 5x + 7 by (x − 2). Write the coefficients 2, −3, −5, 7 and use a = 2.",
      "Bring down 2. Multiply by 2 and add: −3 + 4 = 1. Multiply by 2 and add: −5 + 2 = −3. Multiply by 2 and add: 7 − 6 = 1.",
      "The last number is the remainder; the others are the quotient's coefficients (one degree lower): **q(x) = 2x^2 + x − 3, remainder 1**. So {2x³ − 3x² − 5x + 7/x − 2} = 2x^2 + x − 3 + {1/x − 2}.",
    ],
    visual: { type: "table", headers: ["2 |", "2", "−3", "−5", "7"], rows: [["", "", "4", "2", "−6"], ["", "2", "1", "−3", "1"]], caption: "Synthetic division by (x − 2)" },
    tip: "If a power is missing, write a 0 for its coefficient.",
  },
  why: [
    { kind: "choice", prompt: "In synthetic division by (x − 2), why do you multiply by +2 (not −2)?", choices: ["Synthetic division uses the zero of the divisor, x = 2, which builds in the subtraction step of long division.", "Because you always multiply by a positive number.", "You should multiply by −2."], correct: 0, explain: "Long division subtracts (−2)·term; synthetic division adds 2·term instead, which is the same thing." },
    { kind: "written", prompt: "After dividing p(x) by (x − 3), you get a remainder of 0. Explain what that tells you about p(3) and about the graph of p.", keyIdeas: ["remainder 0 means (x − 3) is a factor", "by the Remainder Theorem p(3) = 0", "so the graph crosses or touches the x-axis at x = 3"], exemplar: "A remainder of 0 means p(x) = (x − 3)q(x), so (x − 3) is a factor and p(3) = 0. That makes x = 3 a zero: the graph meets the x-axis at (3, 0)." },
  ],
  generate(r, lv) {
    const a = r.nonzero(-3, 3);
    const q2 = lv === 1 ? 1 : r.pick([2, 3, -2]);
    const q1 = lv === 3 ? a * q2 : r.int(-5, 5);
    const q0 = r.int(-6, 6);
    const rem = lv === 1 ? 0 : r.nonzero(-7, 7);
    const p = [q2, q1 - a * q2, q0 - a * q1, -a * q0 + rem];
    const divisor = a > 0 ? `(x − ${a})` : `(x + ${-a})`;
    const missing = p[1] === 0;
    const rowCoefs = p.map(ms).join(", ");
    const m1 = q2 * a, m2 = q1 * a, m3 = q0 * a;
    return {
      prompt: `Divide ${poly(p)} by ${divisor}. Enter the quotient q(x) and the remainder.`,
      answer: { kind: "multi", fields: [{ value: frac(q2), pre: "q(x) =", post: "x^2" }, { value: frac(q1), pre: "+", post: "x" }, { value: frac(q0), pre: "+" }, { value: frac(rem), pre: "remainder" }] },
      hints: [`Use synthetic division with ${ms(a)} and the coefficients ${rowCoefs}${missing ? " (the 0 holds the place of the missing x^2 term)" : ""}.`, `Bring down ${ms(q2)}; multiply by ${ms(a)} and add to the next coefficient: ${ms(p[1])} + ${sn(m1)} = ${ms(q1)}.`],
      steps: [
        st("Set up.", `Zero of the divisor: ${ms(a)}. Coefficients: ${rowCoefs}.`),
        st("Bring down the first coefficient.", ms(q2)),
        st("Multiply and add.", `${ms(q2)} · ${sn(a)} = ${ms(m1)}; ${ms(p[1])} + ${sn(m1)} = ${ms(q1)}`),
        st("Multiply and add.", `${ms(q1)} · ${sn(a)} = ${ms(m2)}; ${ms(p[2])} + ${sn(m2)} = ${ms(q0)}`),
        st("Multiply and add.", `${ms(q0)} · ${sn(a)} = ${ms(m3)}; ${ms(p[3])} + ${sn(m3)} = ${ms(rem)} (remainder)`),
        st("Read the answer.", `q(x) = ${poly([q2, q1, q0])}, remainder ${ms(rem)}${rem ? `, so {p(x)/${divisor.replace(/[()]/g, "")}} = ${poly([q2, q1, q0])} + {${ms(rem)}/${divisor.replace(/[()]/g, "")}}` : ` (so ${divisor} is a factor)`}`),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const fta: Skill = {
  id: "m3.poly.fta",
  title: "The Fundamental Theorem of Algebra",
  topic: T,
  standards: ["NC.M3.N-CN.9", "NC.M3.A-APR.3"],
  prereqs: ["m3.poly.zeros"],
  lesson: {
    bigIdea: "A polynomial equation of degree n has exactly n solutions in the complex numbers, counting repeated ones. Non-real solutions come in conjugate pairs a ± bi.",
    explain: [
      "x^3 − 2x^2 + 9x − 18 = 0 has degree 3, so 3 solutions. Group: x^2(x − 2) + 9(x − 2) = (x − 2)(x^2 + 9).",
      "x − 2 = 0 gives x = 2 (real). x^2 + 9 = 0 gives x^2 = −9, so x = ±3i (non-real, a conjugate pair). **1 real, 2 non-real.**",
      "On the graph, only real solutions show up as x-intercepts: y = x^3 − 2x^2 + 9x − 18 crosses the x-axis once, at x = 2.",
    ],
    visual: { type: "plot", xMin: -3, xMax: 4, yMin: -40, yMax: 20, yStep: 10, curves: [{ expr: "x^3-2x^2+9x-18" }], points: [{ x: 2, y: 0, label: "(2, 0)" }] },
    tip: "i = √−1, so √−9 = 3i.",
  },
  why: [
    { kind: "choice", prompt: "Can a cubic equation with real coefficients have exactly 2 non-real solutions and 1 real one?", choices: ["Yes. 3 solutions total, and the non-real ones form one conjugate pair.", "No, it must have 3 real solutions.", "No, non-real solutions come in groups of three."], correct: 0, explain: "Degree 3 means 3 solutions; non-real ones pair up as a ± bi, leaving 1 real." },
    { kind: "written", prompt: "The graph of a degree-4 polynomial crosses the x-axis at exactly 2 points (both with multiplicity 1). Explain how many non-real solutions the equation has.", keyIdeas: ["degree 4 means 4 solutions counting multiplicity", "2 are real (the x-intercepts)", "the other 2 must be non-real (a conjugate pair)"], exemplar: "By the Fundamental Theorem of Algebra there are 4 solutions in all. The two x-intercepts account for 2 real solutions, so the remaining 2 are non-real, and they form a conjugate pair." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const n = r.int(3, 7);
      const terms: [number, number][] = [[r.pick([1, 2, -3, 4, -1, 5]), n]];
      const k = r.int(1, Math.min(3, n));
      const used = new Set([n]);
      for (let i = 0; i < k; i++) {
        let p = r.int(0, n - 1);
        while (used.has(p)) p = (p + 1) % n;
        used.add(p);
        terms.push([r.nonzero(-9, 9), p]);
      }
      const order = r.shuffle(terms);
      const shown = order.map(([c, p], i) => {
        const body = `${Math.abs(c) === 1 && p > 0 ? "" : Math.abs(c)}${p === 0 ? "" : p === 1 ? "x" : `x^${p}`}`;
        return i === 0 ? `${c < 0 ? "−" : ""}${body}` : ` ${c < 0 ? "−" : "+"} ${body}`;
      }).join("");
      const biggestC = Math.max(...terms.map(([c]) => Math.abs(c)));
      return {
        prompt: `How many solutions does ${shown} = 0 have in the complex numbers (counting repeated solutions)?`,
        answer: num(n),
        hints: ["The Fundamental Theorem of Algebra: the number of complex solutions equals the degree.", "The degree is the highest power of x, wherever it appears."],
        steps: [st("Find the degree.", `The highest power is x^${n}.`), st("Apply the theorem.", `A degree-${n} equation has exactly ${n} complex solutions.`)],
        traps: traps(frac(n), [trap(terms.length, "That's the number of terms. The number of solutions is the degree."), trap(biggestC, "That's a coefficient. Look at the exponents.")]),
      };
    }
    if (lv === 2) {
      const kind = r.int(0, 2);
      let shown: string, real: number, nonreal: number, why: string;
      if (kind === 0) {
        const a = r.nonzero(-6, 6), c = r.int(1, 9);
        shown = `${factoredText(1, [[a, 1]])}(x^2 + ${c})`;
        real = 1; nonreal = 2; why = `x = ${ms(a)} is real; x^2 = −${c} gives x = ±${c === 1 || c === 4 || c === 9 ? Math.sqrt(c) === 1 ? "" : Math.sqrt(c) : `√${c}`}i`;
      } else if (kind === 1) {
        const b = r.int(1, 4), c = r.int(1, 4);
        shown = `(x^2 − ${b * b})(x^2 + ${c * c})`;
        real = 2; nonreal = 2; why = `x^2 = ${b * b} gives x = ±${b} (real); x^2 = −${c * c} gives x = ±${c === 1 ? "" : c}i`;
      } else {
        const [p, q] = distinct(r, 2, -5, 5);
        const c = r.int(1, 5);
        shown = `x${factoredText(1, [[p, 1], [q, 1]])}(x^2 + ${c * c})`;
        real = 3; nonreal = 2; why = `x = 0, ${ms(p)}, ${ms(q)} are real; x^2 = −${c * c} gives x = ±${c === 1 ? "" : c}i`;
      }
      return {
        prompt: `How many real and how many non-real solutions does ${shown} = 0 have?`,
        answer: { kind: "multi", fields: [{ value: frac(real), pre: "real:" }, { value: frac(nonreal), pre: "non-real:" }] },
        hints: ["Set each factor equal to 0 and solve.", "x^2 + (a positive number) = 0 has no real solutions: it gives two imaginary ones."],
        steps: [st("Solve each factor.", why + "."), st("Count.", `${real} real and ${nonreal} non-real, ${real + nonreal} in all (the degree).`)],
      };
    }
    const a = r.nonzero(-6, 6), c = r.int(1, 6);
    const coefs = [1, -a, c * c, -a * c * c];
    const ci = c === 1 ? "i" : `${c}i`;
    const correct = `x = ${ms(a)} and x = ±${ci}`;
    return {
      prompt: `Solve ${poly(coefs)} = 0 over the complex numbers.`,
      answer: choice(r, correct, [
        [`x = ${ms(a)} and x = ±${c}`, `x^2 = −${c * c} has no real solutions; √(−${c * c}) = ${ci}.`],
        [`x = ${ms(-a)} and x = ±${ci}`, `Check the sign: the factor is ${factoredText(1, [[a, 1]])}.`],
        [`x = ${ms(a)} only`, "A cubic has 3 solutions in the complex numbers. Don't drop the non-real ones."],
      ]),
      hints: ["Factor by grouping.", `x^2${factoredText(1, [[a, 1]])} + ${c * c}${factoredText(1, [[a, 1]])} = ${factoredText(1, [[a, 1]])}(x^2 + ${c * c}).`],
      steps: [
        st("Group.", `x^2${factoredText(1, [[a, 1]])} + ${c * c}${factoredText(1, [[a, 1]])} = 0`),
        st("Factor.", `${factoredText(1, [[a, 1]])}(x^2 + ${c * c}) = 0`),
        st("Solve.", `x = ${ms(a)}, or x^2 = −${c * c} so x = ±√(−${c * c}) = ±${ci}`),
        st("Check the count.", "Degree 3, three solutions: one real and a conjugate pair."),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
const inequality: Skill = {
  id: "m3.poly.inequality",
  title: "Polynomial inequalities",
  topic: T,
  standards: ["NC.M3.A-CED.1", "NC.M3.A-REI.11"],
  prereqs: ["m3.poly.zeros"],
  lesson: {
    bigIdea: "A polynomial can only change sign at its zeros. Mark the zeros on a number line, find the sign on each interval, and keep the intervals that match the inequality.",
    explain: [
      "Solve (x + 2)(x − 1)(x − 4) > 0. Zeros: −2, 1, 4. The leading term is x^3, so the sign far right is +, and it flips at each single zero.",
      "Signs: x < −2: −; −2 < x < 1: +; 1 < x < 4: −; x > 4: +. We want > 0: **−2 < x < 1 or x > 4**.",
      "On the graph, these are the x-values where the curve is above the x-axis. For ≥, include the zeros themselves.",
    ],
    visual: { type: "plot", xMin: -4, xMax: 6, yMin: -15, yMax: 25, yStep: 5, curves: [{ expr: "(x+2)(x-1)(x-4)" }], points: [{ x: -2, y: 0, label: "−2" }, { x: 1, y: 0, label: "1" }, { x: 4, y: 0, label: "4" }] },
  },
  why: [
    { kind: "choice", prompt: "Why can the sign of a polynomial only change at a zero?", choices: ["Its graph is unbroken, so to go from above the axis to below it must pass through y = 0.", "Because zeros are integers.", "Polynomials never change sign."], correct: 0, explain: "Polynomials are continuous: no jumps, so a sign change needs a zero in between." },
    { kind: "written", prompt: "Explain how the graph of y = (x − 1)(x − 5) helps you solve (x − 1)(x − 5) ≤ 0.", keyIdeas: ["the graph is an upward parabola with zeros 1 and 5", "it is at or below the x-axis between the zeros", "solution 1 ≤ x ≤ 5 (zeros included because of ≤)"], exemplar: "The graph is a parabola opening up that crosses the x-axis at 1 and 5. It's below the axis between them and on it at 1 and 5, so (x − 1)(x − 5) ≤ 0 for 1 ≤ x ≤ 5." },
  ],
  generate(r, lv) {
    const n = lv === 1 ? 2 : 3;
    const roots = distinct(r, n, -5, 5, false).sort((x, y) => x - y);
    const lead = lv === 3 ? -1 : 1;
    const op = r.pick(["<", "≤", ">", "≥"] as const);
    const wantPos = op === ">" || op === "≥";
    const incl = op === "≤" || op === "≥";
    // Sign on each of the n + 1 intervals, from the right.
    const signs = Array.from({ length: n + 1 }, (_, i) => lead * ((n - i) % 2 ? -1 : 1));
    const describe = (pos: boolean, inc: boolean) => {
      const parts: string[] = [];
      const lt = inc ? "≤" : "<", gt = inc ? "≥" : ">";
      for (let i = 0; i <= n; i++) {
        if ((signs[i] > 0) !== pos) continue;
        if (i === 0) parts.push(`x ${lt} ${ms(roots[0])}`);
        else if (i === n) parts.push(`x ${gt} ${ms(roots[n - 1])}`);
        else parts.push(`${ms(roots[i - 1])} ${lt} x ${lt} ${ms(roots[i])}`);
      }
      return parts.join(" or ");
    };
    const factors = roots.map((x) => [x, 1] as [number, number]);
    const pos = roots.filter((x) => x > 0);
    const fr = pos.length ? r.pick(pos) : roots[n - 1];
    const flipped = fr === 0 ? "(−x)" : `(${ms(fr)} − x)`;
    const shown = lv === 3 ? `${flipped}${factoredText(1, factors.filter(([x]) => x !== fr))}` : factoredText(1, factors);
    const correct = describe(wantPos, incl);
    const c = fromRoots(roots, lead);
    const visual = lv === 1 ? { type: "plot" as const, xMin: roots[0] - 3, xMax: roots[n - 1] + 3, ...window(c, roots[0] - 3, roots[n - 1] + 3), curves: [{ expr: factoredT(lead, factors) }] } : undefined;
    return {
      prompt: `Solve ${shown} ${op} 0.${lv === 1 ? " The graph of y = " + shown + " is shown." : ""}`,
      visual,
      answer: choice(r, correct, [
        [describe(!wantPos, incl), `That's where the expression is ${wantPos ? "negative" : "positive"}. Check the sign on each interval again.`],
        [describe(wantPos, !incl), incl ? "The inequality includes “equal to”, so the zeros belong in the solution." : "The zeros make the expression equal 0, which doesn't satisfy a strict inequality."],
        [describe(!wantPos, !incl), "Check both the signs and whether the zeros are included."],
      ]),
      hints: [
        `The zeros are ${roots.map(ms).join(", ")}. They split the number line into ${n + 1} intervals.`,
        lv === 3 ? `Careful: ${flipped} = −${factoredText(1, [[fr, 1]])}, so the leading coefficient is negative and the sign far right is −.` : `Test a number in each interval, or use the fact that the sign far right is + and flips at each zero.`,
      ],
      steps: [
        st("Zeros.", roots.map(ms).join(", ")),
        st("Sign on each interval (left to right).", signs.map((s, i) => `${i === 0 ? `x < ${ms(roots[0])}` : i === n ? `x > ${ms(roots[n - 1])}` : `${ms(roots[i - 1])} < x < ${ms(roots[i])}`}: ${s > 0 ? "+" : "−"}`).join("; ")),
        st(`Keep the ${wantPos ? "positive" : "negative"} intervals${incl ? " and include the zeros" : ""}.`, correct),
      ],
    };
  },
};

const skills: Skill[] = [endBehavior, zeros, write, factor, solve, remainder, divide, fta, inequality];
export default skills;
