// Unit 8: Quadratic expressions, equations and functions
// (NC.M1.A-APR.1, A-APR.3, A-SSE.1a, A-SSE.3, A-REI.1, A-REI.4, A-CED.1, F-IF.4, F-IF.7, F-IF.8a).
import { binom, binomExpr, choice, cst, expr, ms, num, poly, polyExpr, sn, term, trap, traps, NAMES } from "../helpers";
import { frac, gcd, type Frac } from "../../lib/rational";
import type { Rng } from "../../lib/rng";
import { st } from "../steps";
import type { Answer, Skill, Visual } from "../types";
import { article, f, fracMark, pt } from "./util";

const T = "m1-quadratics";

const abc = (a: number, b: number, c: number): Answer => ({ kind: "multi", fields: [{ value: frac(a), pre: "a =" }, { value: frac(b), pre: "b =" }, { value: frac(c), pre: "c =" }] });
const twoRoots = (p: Frac, q: Frac): Answer => ({ kind: "multi", fields: [{ value: p, pre: "x =" }, { value: q, pre: "x =" }], anyOrder: [0, 1] });
/** "(3x − 2)" for the factor with root n/d: (d x − n). */
const factorText = (n: number, d: number) => (d === 1 ? binom(n) : `(${d}x ${n > 0 ? "−" : "+"} ${Math.abs(n)})`);
const factorTyped = (n: number, d: number) => (d === 1 ? binomExpr(n) : `(${d}x${n > 0 ? "-" : "+"}${Math.abs(n)})`);
/** "a − b" / "a + b" joining two display polynomials. */
const joinP = (a: string, b: string) => (b.startsWith("−") ? `${a} − ${b.slice(1)}` : `${a} + ${b}`);
const C0Check = (p: number, q: number) => p === q;
const pq = (r: Rng, lo: number, hi: number) => { let p = r.nonzero(lo, hi), q = r.nonzero(lo, hi); if (p + q === 0) q += 1; if (q === 0) q = 1; return [p, q]; };

// ---------- add and subtract ----------

const addSubtract: Skill = {
  id: "m1.quad.add-subtract",
  title: "Add and subtract polynomials",
  topic: T,
  standards: ["NC.M1.A-APR.1", "NC.M1.A-SSE.1a"],
  prereqs: [],
  lesson: {
    bigIdea: "Combine like terms: x^2-terms with x^2-terms, x-terms with x-terms, constants with constants. When subtracting, distribute the minus sign to every term.",
    explain: [
      "(3x^2 + 2x − 5) + (x^2 − 6x + 4) = 4x^2 − 4x − 1.",
      "(3x^2 + 2x − 5) − (x^2 − 6x + 4): change every sign in the second polynomial and add: 3x^2 + 2x − 5 − x^2 + 6x − 4 = **2x^2 + 8x − 9**.",
      "Polynomials work like integers here: adding or subtracting two polynomials always gives another polynomial.",
    ],
    tip: "The most common mistake is subtracting only the first term of the second polynomial.",
  },
  why: [
    { kind: "choice", prompt: "Why can't 3x^2 and 2x be combined into 5x^3 or 5x^2?", choices: ["They aren't like terms: x^2 and x are different quantities, like apples and oranges.", "Because 3 and 2 are different.", "They can be combined into 5x^2."], correct: 0, explain: "Only terms with the same variable part combine." },
    { kind: "written", prompt: "Explain why subtracting (x^2 − 6x + 4) changes the −6x to +6x.", keyIdeas: ["subtracting a polynomial means subtracting each term", "−(−6x) = +6x", "the minus distributes like multiplying by −1"], exemplar: "Subtracting the whole polynomial means subtracting every term in it, which is the same as multiplying each term by −1. Subtracting −6x is adding 6x, so it becomes +6x." },
  ],
  generate(r, lv) {
    const P = [r.nonzero(-5, 6), r.int(-9, 9), r.int(-12, 12)];
    const Q = [r.nonzero(-5, 6), r.int(-9, 9), r.int(-12, 12)];
    const sub = lv >= 2;
    const res = P.map((p, i) => (sub ? p - Q[i] : p + Q[i]));
    if (lv < 3) {
      return {
        prompt: `Simplify (${poly(P)}) ${sub ? "−" : "+"} (${poly(Q)}). Write the result as ax^2 + bx + c and enter a, b and c.`,
        answer: abc(res[0], res[1], res[2]),
        hints: [sub ? "Distribute the minus sign: change the sign of every term in the second polynomial." : "Group like terms: x^2-terms, x-terms, constants.", "Combine each group."],
        steps: [
          ...(sub ? [st("Distribute the minus sign.", joinP(poly(P), poly(Q.map((q) => -q))))] : []),
          st("Combine x^2-terms.", `${ms(P[0])} ${sub ? "−" : "+"} ${sn(Q[0])} = ${ms(res[0])}`),
          st("Combine x-terms.", `${ms(P[1])} ${sub ? "−" : "+"} ${sn(Q[1])} = ${ms(res[1])}`),
          st("Combine constants.", `${ms(P[2])} ${sub ? "−" : "+"} ${sn(Q[2])} = ${ms(res[2])}`),
          st("Result.", poly(res)),
        ],
      };
    }
    const L = [r.nonzero(-6, 6), r.int(-9, 9)];
    const fin = [res[0], res[1] + L[0], res[2] + L[1]];
    return {
      prompt: `Simplify (${poly(P)}) − (${poly(Q)}) + (${poly(L)}). Write the result as ax^2 + bx + c and enter a, b and c.`,
      answer: abc(fin[0], fin[1], fin[2]),
      hints: ["Change every sign in the polynomial being subtracted.", "Then collect x^2-terms, x-terms and constants from all three."],
      steps: [st("Distribute the minus sign.", joinP(joinP(poly(P), poly(Q.map((q) => -q))), poly(L))), st("x^2-terms.", `${ms(P[0])} − ${sn(Q[0])} = ${ms(fin[0])}`), st("x-terms.", `${ms(P[1])} − ${sn(Q[1])} + ${sn(L[0])} = ${ms(fin[1])}`), st("Constants.", `${ms(P[2])} − ${sn(Q[2])} + ${sn(L[1])} = ${ms(fin[2])}`), st("Result.", poly(fin))],
    };
  },
};

// ---------- multiply linear expressions ----------

const multiply: Skill = {
  id: "m1.quad.multiply",
  title: "Multiply linear expressions",
  topic: T,
  standards: ["NC.M1.A-APR.1"],
  prereqs: ["m1.quad.add-subtract"],
  lesson: {
    bigIdea: "Multiply every term in the first factor by every term in the second (distribute twice), then combine like terms.",
    explain: [
      "(x + 3)(x − 5) = x·x + x·(−5) + 3·x + 3·(−5) = x^2 − 5x + 3x − 15 = **x^2 − 2x − 15**.",
      "(2x − 1)(3x + 4) = 6x^2 + 8x − 3x − 4 = **6x^2 + 5x − 4**.",
      "Squares: (x + 4)^2 = (x + 4)(x + 4) = x^2 + 8x + 16, not x^2 + 16. The middle term comes from the two \"cross\" products.",
    ],
    tip: "Type your answer expanded, like 6x^2+5x-4.",
  },
  why: [
    { kind: "choice", prompt: "Why is (x + 4)^2 not equal to x^2 + 16?", choices: ["Squaring means (x + 4)(x + 4), which also produces two 4x terms: 8x.", "Because 4^2 is 8.", "It is equal."], correct: 0, explain: "Try x = 1: (5)^2 = 25 but 1 + 16 = 17." },
    { kind: "written", prompt: "Use an area model to explain why (x + 2)(x + 3) = x^2 + 5x + 6.", keyIdeas: ["a rectangle with sides x + 2 and x + 3", "split into x^2, 3x, 2x and 6", "add the pieces: x^2 + 5x + 6"], exemplar: "Draw a rectangle x + 2 by x + 3 and split it into four pieces: an x by x square (x^2), an x by 3 piece (3x), a 2 by x piece (2x) and a 2 by 3 piece (6). The total area is x^2 + 3x + 2x + 6 = x^2 + 5x + 6." },
  ],
  generate(r, lv) {
    let a = 1, b: number, c = 1, d: number;
    if (lv === 1) { b = r.nonzero(-9, 9); d = r.nonzero(-9, 9); }
    else if (lv === 2) { a = r.pick([2, 3, 4, -2]); c = r.pick([1, 2, 3, 5]); b = r.nonzero(-7, 7); d = r.nonzero(-7, 7); }
    else {
      const kind = r.pick(["square", "dos"]);
      a = r.pick([1, 2, 3]); b = r.nonzero(-6, 6);
      c = a; d = kind === "square" ? b : -b;
    }
    const res = [a * c, a * d + b * c, b * d];
    const f1 = `(${term(a, "x")}${cst(b)})`, f2 = `(${term(c, "x")}${cst(d)})`;
    const shown = lv === 3 && d === b ? `${f1}^2` : `${f1}${f2}`;
    return {
      prompt: `Multiply and simplify: ${shown}`,
      answer: expr(polyExpr(res), { form: "expanded", display: poly(res) }),
      hints: [`Multiply each term of ${f1} by each term of ${f2}.`, `You should get four products: ${term(a * c, "x^2")}, ${term(a * d, "x")}, ${term(b * c, "x")} and ${ms(b * d)}.`],
      steps: [
        ...(lv === 3 && d === b ? [st("Write the square as a product.", `${f1}${f1}`)] : []),
        st("Distribute.", `${term(a, "x")} · ${term(c, "x")} = ${term(a * c, "x^2")}; ${term(a, "x")} · ${sn(d)} = ${term(a * d, "x")}; ${sn(b)} · ${term(c, "x")} = ${term(b * c, "x")}; ${sn(b)} · ${sn(d)} = ${ms(b * d)}`),
        st("Combine the x-terms.", `${term(a * d, "x")} ${b * c < 0 ? "−" : "+"} ${term(Math.abs(b * c), "x")} = ${res[1] === 0 ? "0" : term(res[1], "x")}`),
        st("Result.", poly(res)),
      ],
    };
  },
};

// ---------- factoring ----------

const factorTrinomial: Skill = {
  id: "m1.quad.factor-trinomial",
  title: "Factor x² + bx + c",
  topic: T,
  standards: ["NC.M1.A-SSE.3"],
  prereqs: ["m1.quad.multiply"],
  lesson: {
    bigIdea: "To factor x^2 + bx + c, find two numbers that multiply to c and add to b.",
    explain: [
      "x^2 + 7x + 12: which two numbers multiply to 12 and add to 7? 3 and 4. So x^2 + 7x + 12 = **(x + 3)(x + 4)**.",
      "Signs matter: x^2 − x − 12 needs numbers that multiply to −12 and add to −1: −4 and 3, so (x − 4)(x + 3).",
      "Always check for a greatest common factor first: 2x^2 + 14x + 24 = 2(x^2 + 7x + 12) = 2(x + 3)(x + 4).",
      "Check by multiplying back: (x + 3)(x + 4) = x^2 + 4x + 3x + 12 = x^2 + 7x + 12. ✓",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do the two numbers have to add to b?", choices: ["When you multiply (x + p)(x + q), the middle term is px + qx = (p + q)x.", "Because the constant is always the sum.", "They don't have to; only the product matters."], correct: 0, explain: "The x-terms from the 'outer' and 'inner' products combine into (p + q)x." },
    { kind: "written", prompt: "Explain how factoring x^2 + 5x + 6 helps you solve x^2 + 5x + 6 = 0.", keyIdeas: ["it factors to (x + 2)(x + 3)", "if a product is zero, one factor must be zero", "so x = −2 or x = −3"], exemplar: "x^2 + 5x + 6 = (x + 2)(x + 3). If two numbers multiply to 0, one of them is 0, so x + 2 = 0 or x + 3 = 0. That gives x = −2 or x = −3." },
  ],
  generate(r, lv) {
    let [p, q] = pq(r, -9, 9);
    if (lv === 1) { p = Math.abs(p); q = Math.abs(q); }
    const g = lv === 3 ? r.pick([2, 3, -1, 5]) : 1;
    const coefs = [g, g * (p + q), g * p * q];
    const fact = `${g === 1 ? "" : g === -1 ? "−" : g}${binom(-p)}${binom(-q)}`;
    const factTyped = `${g === 1 ? "" : g === -1 ? "-" : g}${binomExpr(-p)}${binomExpr(-q)}`;
    return {
      prompt: `Factor completely: ${poly(coefs)}`,
      answer: expr(factTyped, { form: "factored", display: fact }),
      hints: [...(g !== 1 ? [`First factor out the common factor ${ms(g)}.`] : []), `Find two numbers that multiply to ${ms(p * q)} and add to ${ms(p + q)}.`, `They are ${ms(p)} and ${ms(q)}.`].slice(0, 3),
      steps: [
        ...(g !== 1 ? [st("Factor out the GCF.", `${ms(g)}(${poly([1, p + q, p * q])})`)] : []),
        st("Two numbers with product c and sum b.", `${ms(p)} · ${sn(q)} = ${ms(p * q)} and ${ms(p)} + ${sn(q)} = ${ms(p + q)}`),
        st("Write the factors.", fact),
        st("Check by multiplying.", `${binom(-p)}${binom(-q)} = x^2 ${term(q, "x", false).trim()} ${term(p, "x", false).trim()}${cst(p * q)} = ${poly([1, p + q, p * q])} ✓`),
      ],
    };
  },
};

const factorAdvanced: Skill = {
  id: "m1.quad.factor-ax2",
  title: "Factor ax² + bx + c and special forms",
  topic: T,
  standards: ["NC.M1.A-SSE.3"],
  prereqs: ["m1.quad.factor-trinomial"],
  lesson: {
    bigIdea: "For ax^2 + bx + c, find two numbers that multiply to a·c and add to b, split the middle term, and factor by grouping. Watch for differences of squares: a^2 − b^2 = (a − b)(a + b).",
    explain: [
      "6x^2 + 7x − 3: a·c = −18. Numbers with product −18 and sum 7: 9 and −2. Split: 6x^2 + 9x − 2x − 3 = 3x(2x + 3) − 1(2x + 3) = **(3x − 1)(2x + 3)**.",
      "Difference of squares: 9x^2 − 25 = (3x)^2 − 5^2 = **(3x − 5)(3x + 5)**. There's no middle term because the cross products cancel.",
      "GCF first: 4x^2 − 36 = 4(x^2 − 9) = 4(x − 3)(x + 3).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does x^2 − 49 factor even though it has no x-term?", choices: ["(x − 7)(x + 7) gives −7x + 7x = 0, so the middle terms cancel.", "Because 49 is odd.", "It doesn't factor."], correct: 0, explain: "Difference of squares: the cross terms are opposites." },
    { kind: "written", prompt: "Explain why x^2 + 49 cannot be factored into (x + p)(x + q) with real numbers p and q.", keyIdeas: ["need p·q = 49 and p + q = 0", "so q = −p and p·q = −p^2, which is never positive", "no real numbers work"], exemplar: "We'd need p + q = 0 (no x-term) and p·q = 49. But q = −p makes p·q = −p^2, which is zero or negative, never 49. So no real p and q work." },
  ],
  generate(r, lv) {
    if ((lv === 2 && r.chance(0.5)) || (lv === 1 && r.chance(0.3))) {
      const k = r.pick([1, 2, 3, 4, 5]), m = r.int(1, 9), g = lv === 2 ? r.pick([1, 2, 3]) : 1;
      const coefs = [g * k * k, 0, -g * m * m];
      const fact = `${g === 1 ? "" : g}(${term(k, "x")} − ${m})(${term(k, "x")} + ${m})`;
      return {
        prompt: `Factor completely: ${poly(coefs)}`,
        answer: expr(`${g === 1 ? "" : g}(${k === 1 ? "" : k}x-${m})(${k === 1 ? "" : k}x+${m})`, { form: "factored", display: fact }),
        hints: [...(g > 1 ? [`Factor out ${g} first.`] : []), `This is a difference of squares: (${term(k, "x")})^2 − ${m}^2.`, "a^2 − b^2 = (a − b)(a + b)."],
        steps: [...(g > 1 ? [st("GCF.", `${g}(${poly([k * k, 0, -m * m])})`)] : []), st("Recognize squares.", `${term(k * k, "x^2")} = (${term(k, "x")})^2 and ${m * m} = ${m}^2`), st("Factor.", fact)],
      };
    }
    // (d1 x − n1)(d2 x − n2) with d1·d2 = a > 1
    const d1 = r.pick([2, 3, 5]), d2 = lv === 1 ? 1 : r.pick([1, 2, 3]);
    let n1 = r.nonzero(-5, 5), n2 = r.nonzero(-7, 7);
    if (gcd(n1, d1) !== 1) n1 = n1 > 0 ? n1 + 1 : n1 - 1;
    if (gcd(n1, d1) !== 1) n1 = 1;
    if (gcd(n2, d2) !== 1) n2 = n2 > 0 ? n2 + 1 : n2 - 1;
    if (gcd(n2, d2) !== 1) n2 = -1;
    if (n1 * d2 === n2 * d1) n2 = -n2;
    const g = lv === 3 ? r.pick([2, 3]) : 1;
    const coefs = [g * d1 * d2, -g * (d1 * n2 + d2 * n1), g * n1 * n2];
    const fact = `${g === 1 ? "" : g}${factorText(n1, d1)}${factorText(n2, d2)}`;
    const ac = coefs[0] / g * (coefs[2] / g);
    const s1 = -d1 * n2, s2 = -d2 * n1;
    return {
      prompt: `Factor completely: ${poly(coefs)}`,
      answer: expr(`${g === 1 ? "" : g}${factorTyped(n1, d1)}${factorTyped(n2, d2)}`, { form: "factored", display: fact }),
      hints: [...(g > 1 ? [`Factor out the GCF, ${g}, first.`] : []), `Find two numbers that multiply to a·c = ${ms(ac)} and add to b = ${ms(coefs[1] / g)}.`, `Use ${ms(s1)} and ${ms(s2)} to split the middle term, then factor by grouping.`].slice(0, 3),
      steps: [
        ...(g > 1 ? [st("Factor out the GCF.", `${g}(${poly(coefs.map((c) => c / g))})`)] : []),
        st("Find the pair.", `a·c = ${ms(ac)}; ${ms(s1)} · ${sn(s2)} = ${ms(ac)} and ${ms(s1)} + ${sn(s2)} = ${ms(s1 + s2)}`),
        st("Factor.", fact),
        st("Check.", `Multiply back: ${fact} = ${poly(coefs)} ✓`),
      ],
    };
  },
};

// ---------- solve by factoring ----------

const solveFactoring: Skill = {
  id: "m1.quad.solve-factoring",
  title: "Solve quadratics by factoring",
  topic: T,
  standards: ["NC.M1.A-REI.4", "NC.M1.A-APR.3", "NC.M1.A-REI.1"],
  prereqs: ["m1.quad.factor-trinomial"],
  lesson: {
    bigIdea: "Get 0 on one side, factor, then use the zero product property: if A·B = 0, then A = 0 or B = 0.",
    explain: [
      "x^2 − 3x = 10 → x^2 − 3x − 10 = 0 → (x − 5)(x + 2) = 0 → x − 5 = 0 or x + 2 = 0 → **x = 5 or x = −2**.",
      "With a leading coefficient: 2x^2 + x − 6 = 0 → (2x − 3)(x + 2) = 0 → x = {3/2} or x = −2.",
      "The solutions are also the zeros of y = x^2 − 3x − 10: where its graph crosses the x-axis.",
    ],
    tip: "The zero product property only works when one side is 0. (x − 5)(x + 2) = 8 does NOT mean x − 5 = 8.",
  },
  why: [
    { kind: "choice", prompt: "Why must one side equal 0 before using the factors?", choices: ["Only a product of 0 forces a factor to be 0; a product of 8 could come from many pairs.", "Because zero is easier to write.", "It doesn't need to be 0."], correct: 0, explain: "2 × 4 = 8, 1 × 8 = 8, 0.5 × 16 = 8… no single factor is pinned down." },
    { kind: "written", prompt: "Explain how the solutions of x^2 − x − 6 = 0 relate to the graph of y = x^2 − x − 6.", keyIdeas: ["solutions are x = 3 and x = −2", "those are the x-intercepts (zeros) of the graph", "at those x-values, y = 0"], exemplar: "Solving gives (x − 3)(x + 2) = 0, so x = 3 or x = −2. Those are the x-values where y = 0, which are exactly where the graph crosses the x-axis: its zeros." },
  ],
  generate(r, lv) {
    let [p, q] = pq(r, -8, 8);
    let d = 1;
    if (C0Check(p, q)) q += 1;
    if (lv === 3) { d = r.pick([2, 3]); if (gcd(p, d) !== 1) p = p + 1 === 0 ? 1 : p + 1; if (gcd(p, d) !== 1) p = 1; }
    // (d x − p)(x − q) = 0 → roots p/d and q
    if (p === q * d) q = q + 1 === 0 ? 2 : q + 1;
    const C = [d, -(p + d * q), p * q];
    const left = lv === 2 ? `${poly([C[0], C[1], 0])}` : poly(C);
    const right = lv === 2 ? ms(-C[2]) : "0";
    const r1 = frac(p, d), r2 = frac(q);
    const fact = `${factorText(p, d)}${binom(q)}`;
    return {
      prompt: `Solve: ${left} = ${right}`,
      answer: twoRoots(r1, r2),
      hints: [lv === 2 ? `Move ${ms(-C[2])} to the left so the equation equals 0.` : "Factor the left side.", lv === 3 ? `Look for two numbers that multiply to ${ms(C[0] * C[2])} and add to ${ms(C[1])}.` : `Find two numbers that multiply to ${ms(C[2])} and add to ${ms(C[1])}.`, "Set each factor equal to 0."],
      steps: [
        ...(lv === 2 ? [st("Get 0 on one side.", `${poly(C)} = 0`)] : []),
        st("Factor.", `${fact} = 0`),
        st("Zero product property.", `${factorText(p, d).slice(1, -1)} = 0 or ${binom(q).slice(1, -1)} = 0`),
        st("Solve each.", `x = ${fracMark(r1)} or x = ${ms(q)}`),
      ],
    };
  },
};

// ---------- square roots ----------

const squareRoots: Skill = {
  id: "m1.quad.square-roots",
  title: "Solve by taking square roots",
  topic: T,
  standards: ["NC.M1.A-REI.4"],
  prereqs: [],
  lesson: {
    bigIdea: "When the equation is (something)^2 = k, isolate the square and take the square root of both sides, remembering the ± (both the positive and negative root).",
    explain: [
      "3x^2 − 5 = 70 → 3x^2 = 75 → x^2 = 25 → **x = ±5** (5 or −5).",
      "(x − 4)^2 = 9 → x − 4 = ±3 → x = 4 + 3 = 7 or x = 4 − 3 = 1.",
      "If the square equals a negative number, there's no real solution: no real number squared is negative.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does x^2 = 25 have two solutions?", choices: ["Both 5 · 5 and (−5)(−5) equal 25.", "Because 25 is odd.", "It has only one solution, 5."], correct: 0, explain: "Squaring hides the sign." },
    { kind: "written", prompt: "Explain why x^2 + 9 = 0 has no real solutions.", keyIdeas: ["x^2 = −9", "the square of any real number is zero or positive", "so no real x works"], exemplar: "Subtracting 9 gives x^2 = −9. Any real number squared is 0 or positive, never negative, so there is no real solution." },
  ],
  generate(r, lv) {
    const s = r.int(1, 10);
    if (lv === 1) {
      const a = r.pick([1, 1, 2, 3]), c = r.int(-20, 20);
      const rhs = a * s * s + c;
      return {
        prompt: `Solve: ${term(a, "x^2")}${cst(c)} = ${rhs}`,
        answer: twoRoots(frac(s), frac(-s)),
        hints: [c === 0 && a === 1 ? "x^2 is already alone." : `Isolate x^2: ${[c !== 0 ? `${c > 0 ? "subtract" : "add"} ${Math.abs(c)}` : "", a !== 1 ? `divide by ${a}` : ""].filter(Boolean).join(", then ")}.`, "Take the square root of both sides. Don't forget the negative root."],
        steps: [st("Isolate x^2.", `x^2 = ${s * s}`), st("Square root of both sides.", `x = ±√${s * s} = ±${s}`)],
      };
    }
    const h = r.nonzero(-6, 6), a = lv === 3 ? r.pick([2, 3, 4]) : 1, k = lv === 3 ? r.int(-12, 12) : 0;
    const rhs = a * s * s + k;
    const shown = `${a === 1 ? "" : a}${binom(h)}^2${cst(k)} = ${rhs}`;
    return {
      prompt: `Solve: ${shown}`,
      answer: twoRoots(frac(h + s), frac(h - s)),
      hints: [lv === 3 ? `Isolate the square: ${k !== 0 ? `${k > 0 ? "subtract" : "add"} ${Math.abs(k)}, then ` : ""}divide by ${a}.` : "Take the square root of both sides.", `${binom(h)} = ±${s}. Then solve both equations.`],
      steps: [...(lv === 3 ? [st("Isolate the square.", `${binom(h)}^2 = ${s * s}`)] : []), st("Square root of both sides.", `x ${h > 0 ? "−" : "+"} ${Math.abs(h)} = ±${s}`), st("Solve both.", `x = ${ms(h)} + ${s} = ${ms(h + s)} or x = ${ms(h)} − ${s} = ${ms(h - s)}`)],
    };
  },
};

// ---------- zeros, factors and graphs ----------

const zerosFactors: Skill = {
  id: "m1.quad.zeros-factors",
  title: "Zeros, factors and x-intercepts",
  topic: T,
  standards: ["NC.M1.A-APR.3", "NC.M1.F-IF.8a"],
  prereqs: ["m1.quad.solve-factoring"],
  lesson: {
    bigIdea: "If (x − r) is a factor of a quadratic, then r is a zero of the function, a solution of f(x) = 0, and an x-intercept of its graph: four ways to say the same thing.",
    explain: [
      "f(x) = (x − 2)(x + 5): the zeros are 2 and −5, so the graph crosses the x-axis at (2, 0) and (−5, 0).",
      "Going backward: a parabola with x-intercepts −1 and 4 has factors (x + 1) and (x − 4), so f(x) = a(x + 1)(x − 4). Use another point to find a. If it passes through (0, −8): −8 = a(1)(−4), so a = 2.",
      "Rewriting standard form in factored form reveals the zeros: x^2 − 2x − 15 = (x − 5)(x + 3), zeros 5 and −3.",
    ],
    visual: { type: "plot", xMin: -7, xMax: 4, yMin: -14, yMax: 6, curves: [{ expr: "(x-2)(x+5)" }], points: [{ x: 2, y: 0, label: "(2, 0)" }, { x: -5, y: 0, label: "(−5, 0)" }] },
    tip: "The sign flips: the factor (x + 5) gives the zero −5.",
  },
  why: [
    { kind: "choice", prompt: "Why does the factor (x + 5) give the zero x = −5?", choices: ["x + 5 = 0 when x = −5, which makes the whole product 0.", "Because zeros are always negative.", "It gives the zero x = 5."], correct: 0, explain: "A zero is an input that makes the output 0." },
    { kind: "written", prompt: "Two different quadratics both have zeros 1 and 6. Explain how that's possible.", keyIdeas: ["both have factors (x − 1)(x − 6)", "they can have different leading coefficients a", "a stretches or flips the graph but keeps the x-intercepts"], exemplar: "Any function a(x − 1)(x − 6) has zeros 1 and 6. Different values of a, like 1, −2 or 3, stretch or flip the parabola, but it still crosses the x-axis at 1 and 6." },
  ],
  generate(r, lv) {
    const [p0, q0] = pq(r, -6, 6);
    const p = Math.min(p0, q0), q = Math.max(p0, q0) === p ? p + 2 : Math.max(p0, q0);
    if (lv === 1) {
      const fname = r.pick(["f", "g", "h"]);
      return {
        prompt: `What are the zeros of ${fname}(x) = ${binom(p)}${binom(q)}?`,
        answer: twoRoots(frac(p), frac(q)),
        hints: ["A zero makes the function equal 0.", "Set each factor equal to 0 and solve."],
        steps: [st("Set each factor to 0.", `${binom(p).slice(1, -1)} = 0 or ${binom(q).slice(1, -1)} = 0`), st("Zeros.", `x = ${ms(p)} and x = ${ms(q)}`)],
      };
    }
    if (lv === 2) {
      const a = r.pick([1, -1]);
      const c = [a, -a * (p + q), a * p * q];
      const ys = [c[2], -a * ((q - p) / 2) ** 2];
      const visual: Visual = { type: "plot", xMin: p - 3, xMax: q + 3, yMin: Math.floor(Math.min(0, ...ys)) - 3, yMax: Math.ceil(Math.max(0, ...ys)) + 3, curves: [{ expr: polyExpr(c) }] };
      const pre = a < 0 ? "−" : "";
      const right = `f(x) = ${pre}${binom(p)}${binom(q)}`;
      return {
        prompt: "Which function could have the graph shown?",
        visual,
        answer: choice(r, right, [[`f(x) = ${pre}${binom(-p)}${binom(-q)}`, "The signs in the factors are opposite to the zeros: x-intercept r gives the factor (x − r)."], [`f(x) = ${a < 0 ? "" : "−"}${binom(p)}${binom(q)}`, a < 0 ? "This parabola opens down, so the leading coefficient is negative." : "This parabola opens up, so the leading coefficient is positive."], [`f(x) = ${pre}(x ${p * q > 0 ? "+" : "−"} ${Math.abs(p * q)})(x + 1)`, "Read the x-intercepts from the graph and use them as zeros."]]),
        hints: ["Read the x-intercepts from the graph.", "An x-intercept at r means a factor (x − r). Then check whether the parabola opens up or down."],
        steps: [st("x-intercepts.", `x = ${ms(p)} and x = ${ms(q)}`), st("Factors.", `${binom(p)} and ${binom(q)}`), st("Direction.", a < 0 ? "Opens down: negative leading coefficient." : "Opens up: positive leading coefficient."), st("Function.", right)],
      };
    }
    const a = r.pick([2, 3, -1, -2, 4]);
    const y0 = a * p * q;
    const disp = `${a === 1 ? "" : a === -1 ? "−" : ms(a)}${binom(p)}${binom(q)}`;
    return {
      prompt: `A parabola has x-intercepts ${ms(p)} and ${ms(q)} and passes through (0, ${ms(y0)}). Write its equation in factored form, f(x) = a(x − r)(x − s).`,
      visual: { type: "plot", xMin: Math.min(p, 0) - 3, xMax: Math.max(q, 0) + 3, yMin: Math.min(0, y0, -a * ((q - p) / 2) ** 2) - 3, yMax: Math.max(0, y0, -a * ((q - p) / 2) ** 2) + 3, points: [{ x: p, y: 0 }, { x: q, y: 0 }, { x: 0, y: y0, label: pt(0, y0) }] },
      answer: expr(`${a === 1 ? "" : a === -1 ? "-" : a}${binomExpr(p)}${binomExpr(q)}`, { form: "factored", lhs: "f(x)", display: disp }),
      hints: [`The zeros give the factors: f(x) = a${binom(p)}${binom(q)}.`, `Substitute (0, ${ms(y0)}) to find a: ${ms(y0)} = a(${ms(-p)})(${ms(-q)}).`],
      steps: [st("Factors from the zeros.", `f(x) = a${binom(p)}${binom(q)}`), st("Use the point.", `${ms(y0)} = a(0 ${p > 0 ? "−" : "+"} ${Math.abs(p)})(0 ${q > 0 ? "−" : "+"} ${Math.abs(q)}) = ${ms(p * q)}a, so a = ${ms(a)}`), st("Equation.", `f(x) = ${disp}`)],
    };
  },
};

// ---------- graph features: vertex, axis, max/min ----------

const graphFeatures: Skill = {
  id: "m1.quad.graph-features",
  title: "Vertex and axis of symmetry",
  topic: T,
  standards: ["NC.M1.F-IF.7", "NC.M1.F-IF.8a", "NC.M1.F-IF.4"],
  prereqs: ["m1.quad.zeros-factors", "m1.func.key-features"],
  lesson: {
    bigIdea: "A parabola is symmetric: its vertex lies on the axis of symmetry, halfway between the zeros. In standard form ax^2 + bx + c, the axis is x = −{b/2a}.",
    explain: [
      "f(x) = (x − 1)(x − 7): zeros 1 and 7, so the axis is x = {1 + 7/2} = 4. The vertex is (4, f(4)) = (4, (3)(−3)) = **(4, −9)**, a minimum since the parabola opens up.",
      "f(x) = −2x^2 + 12x − 10: axis x = −{12/2(−2)} = 3. f(3) = −18 + 36 − 10 = 8, so the vertex is (3, 8), a maximum (a < 0).",
      "a > 0: opens up, vertex is a minimum. a < 0: opens down, vertex is a maximum.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 9, yMin: -11, yMax: 8, curves: [{ expr: "(x-1)(x-7)" }], vlines: [{ x: 4, dashed: true, label: "x = 4" }], points: [{ x: 4, y: -9, label: "(4, −9)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why is the vertex's x-coordinate halfway between the zeros?", choices: ["The parabola is symmetric about its axis, so the zeros are equally far from it on each side.", "Because the vertex is always at x = 0.", "Because the zeros add to zero."], correct: 0, explain: "Mirror images across the axis of symmetry." },
    { kind: "written", prompt: "Explain how the sign of a in f(x) = ax^2 + bx + c tells you whether the vertex is a maximum or a minimum.", keyIdeas: ["a > 0 opens up, so the vertex is the lowest point (minimum)", "a < 0 opens down, so the vertex is the highest point (maximum)", "for large |x|, ax^2 dominates"], exemplar: "When a > 0, ax^2 becomes large and positive as x moves away from the vertex, so the parabola opens up and the vertex is a minimum. When a < 0, it opens down and the vertex is a maximum." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const [p0, q0] = pq(r, -7, 7);
      let p = Math.min(p0, q0), q = Math.max(p0, q0);
      if ((p + q) % 2 !== 0) q += 1;
      if (p === q) q += 2;
      const a = lv === 1 ? 1 : r.pick([1, -1, 2, -2]);
      const h = (p + q) / 2, k = a * (h - p) * (h - q);
      const disp = `${a === 1 ? "" : a === -1 ? "−" : ms(a)}${binom(p)}${binom(q)}`;
      return {
        prompt: `Find the vertex of f(x) = ${disp}.`,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "x =" }, { value: frac(k), pre: "y =" }] },
        hints: [`The zeros are ${ms(p)} and ${ms(q)}. The vertex's x-coordinate is halfway between them.`, `Then substitute that x into f to get the y-coordinate.`],
        steps: [st("Zeros.", `x = ${ms(p)} and x = ${ms(q)}`), st("Axis of symmetry.", `x = {${ms(p)} + ${sn(q)}/2} = ${ms(h)}`), st("Evaluate.", `f(${ms(h)}) = ${a === 1 ? "" : `${ms(a)}·`}(${ms(h - p)})(${ms(h - q)}) = ${ms(k)}`), st("Vertex.", `${pt(h, k)}, a ${a > 0 ? "minimum" : "maximum"}`)],
      };
    }
    const a = r.pick([1, -1, 2, -2, 3]), h = r.int(-4, 4), k = r.int(-9, 9);
    const c = [a, -2 * a * h, a * h * h + k];
    const askVal = r.chance(0.5);
    if (!askVal) {
      return {
        prompt: `What is the axis of symmetry of f(x) = ${poly(c)}?`,
        answer: expr(String(h), { vars: [], lhs: "x", display: ms(h) }),
        hints: ["Use x = −{b/2a}.", `Here a = ${ms(a)} and b = ${ms(c[1])}.`],
        steps: [st("Formula.", `x = −{b/2a} = −{${ms(c[1])}/2(${ms(a)})} = ${ms(h)}`), st("Axis.", `x = ${ms(h)}`)],
      };
    }
    return {
      prompt: `Find the ${a > 0 ? "minimum" : "maximum"} value of f(x) = ${poly(c)}.`,
      answer: num(k),
      hints: [`The ${a > 0 ? "minimum" : "maximum"} is at the vertex. Its x-coordinate is −{b/2a}.`, "Substitute that x into f to get the value."],
      steps: [st("Axis.", `x = −{${ms(c[1])}/2(${ms(a)})} = ${ms(h)}`), st("Evaluate.", `f(${ms(h)}) = ${ms(a)}(${ms(h)})^2 ${c[1] < 0 ? "−" : "+"} ${Math.abs(c[1])}(${ms(h)}) ${c[2] < 0 ? "−" : "+"} ${Math.abs(c[2])} = ${ms(k)}`), st("Answer.", `The ${a > 0 ? "minimum" : "maximum"} value is ${ms(k)}, at x = ${ms(h)}.`)],
      traps: traps(frac(k), [trap(h, `That's where the ${a > 0 ? "minimum" : "maximum"} occurs. The value is f(${ms(h)}).`), trap(c[2], "That's the y-intercept, f(0).")]),
    };
  },
};

// ---------- quadratics in context ----------

const context: Skill = {
  id: "m1.quad.context",
  title: "Quadratics in context",
  topic: T,
  standards: ["NC.M1.A-CED.1", "NC.M1.F-IF.4", "NC.M1.A-REI.4"],
  prereqs: ["m1.quad.solve-factoring", "m1.quad.graph-features"],
  lesson: {
    bigIdea: "Projectile heights and areas lead to quadratic equations. Solve by factoring, then keep only the answers that make sense in the context.",
    explain: [
      "A ball's height is h(t) = −16t^2 + 32t + 48 feet. It hits the ground when h(t) = 0: −16(t^2 − 2t − 3) = −16(t − 3)(t + 1) = 0, so t = 3 or t = −1. Time can't be negative, so it lands at **t = 3 seconds**.",
      "Its maximum height is at the vertex, halfway between the zeros: t = 1, h(1) = −16 + 32 + 48 = **64 feet**.",
      "Area: a rectangle is 4 m longer than it is wide and has area 60 m^2: w(w + 4) = 60 → w^2 + 4w − 60 = 0 → (w + 10)(w − 6) = 0 → w = 6 m.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 3.5, yMin: 0, yMax: 70, xStep: 0.5, yStep: 10, curves: [{ expr: "-16x^2+32x+48", domain: [0, 3] }], points: [{ x: 1, y: 64, label: "(1, 64)" }, { x: 3, y: 0, label: "(3, 0)" }] },
  },
  why: [
    { kind: "choice", prompt: "Solving h(t) = 0 gives t = 3 and t = −1. Why is only t = 3 the answer?", choices: ["The ball is thrown at t = 0, so a negative time is before the throw and doesn't fit the context.", "Because −1 is smaller.", "Both are correct landing times."], correct: 0, explain: "The model only describes the flight, t ≥ 0." },
    { kind: "written", prompt: "In h(t) = −16t^2 + 32t + 48, explain what 48 means and why the coefficient of t^2 is negative.", keyIdeas: ["48 is the starting height h(0)", "gravity pulls the ball down", "a negative leading coefficient makes the parabola open down, giving a maximum"], exemplar: "h(0) = 48, so the ball starts 48 feet up. The −16t^2 is gravity pulling it back down; because it's negative, the parabola opens down, so the height rises to a maximum and then falls." },
  ],
  generate(r, lv) {
    if (lv === 3 && r.chance(0.5)) {
      const w = r.int(3, 12), d = r.int(2, 7);
      const A = w * (w + d);
      const thing = r.pick(["garden", "poster", "phone screen protector sheet", "patio"]);
      return {
        prompt: `A rectangular ${thing} is ${d} units longer than it is wide, and its area is ${A} square units. What is its width?`,
        answer: num(w),
        hints: [`Let w = width. Then length = w + ${d}, so w(w + ${d}) = ${A}.`, `Rewrite as w^2 + ${d}w − ${A} = 0 and factor.`],
        steps: [st("Write the equation.", `w(w + ${d}) = ${A} → w^2 + ${d}w − ${A} = 0`), st("Factor.", `(w − ${w})(w + ${w + d}) = 0`), st("Solve and interpret.", `w = ${w} or w = −${w + d}. A width can't be negative, so w = ${w}.`), st("Check.", `${w} × ${w + d} = ${A} ✓`)],
        traps: traps(frac(w), [trap(w + d, "That's the length. The question asks for the width."), trap(-(w + d), "A width can't be negative: reject that solution.")]),
      };
    }
    const land = r.int(2, 6), s = r.int(1, Math.min(3, land - 1));
    // h(t) = −16(t − land)(t + s) = −16t^2 + 16(land − s)t + 16·land·s
    const b = 16 * (land - s), c = 16 * land * s;
    const nm = r.pick(NAMES);
    const peakT = frac(land - s, 2), peakH = -16 * ((land - s) / 2 - land) * ((land - s) / 2 + s);
    const ask = lv === 1 ? "land" : lv === 2 ? r.pick(["land", "max"]) : "max";
    const prompt0 = `${nm} launches a water balloon straight up from the roof of ${article(String(c))} ${c}-foot building. Its height after t seconds is h(t) = −16t^2 + ${b}t + ${c}.`;
    if (ask === "land") return {
      prompt: `${prompt0} After how many seconds does it hit the ground?`,
      answer: num(land),
      hints: ["The balloon hits the ground when h(t) = 0.", `Factor out −16: −16(t^2 − ${land - s}t − ${land * s}) = 0.`],
      steps: [st("Set h(t) = 0.", `−16t^2 + ${b}t + ${c} = 0`), st("Factor.", `−16(t − ${land})(t + ${s}) = 0`), st("Solve and interpret.", `t = ${land} or t = −${s}. Time can't be negative, so t = ${land} seconds.`)],
      traps: traps(frac(land), [trap(-s, "Time after the launch can't be negative. Reject that solution."), trap(peakT, "That's when it reaches its highest point, not when it lands.")]),
    };
    return {
      prompt: `${prompt0} What is its maximum height, in feet?`,
      answer: num(peakH),
      hints: ["The maximum is at the vertex. Its t-value is halfway between the zeros, or t = −{b/2a}.", `t = −{${b}/2(−16)} = ${fracMark(peakT)}. Now find h at that time.`],
      steps: [st("Time of the maximum.", `t = −{${b}/2(−16)} = ${fracMark(peakT)} second${peakT.n === 1 && peakT.d === 1 ? "" : "s"}`), st("Height then.", `h(${f((land - s) / 2)}) = −16(${f((land - s) / 2)})^2 + ${b}(${f((land - s) / 2)}) + ${c} = ${f(peakH)} feet`)],
      traps: traps(frac(peakH), [trap(c, "That's the starting height, h(0). It goes higher before falling."), trap(peakT, "That's the time of the maximum. The question asks for the height.")]),
    };
  },
};

export default [addSubtract, multiply, factorTrinomial, factorAdvanced, solveFactoring, squareRoots, zerosFactors, graphFeatures, context];
