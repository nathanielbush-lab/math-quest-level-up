// Unit 5: Radicals, rational exponents, rational vs. irrational numbers, and the imaginary unit.
import { choice, exact, expr, num, radical, radText, trap, traps } from "../helpers";
import { frac, gcd } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { fracText } from "./util";

const T = "m2-radicals";
const SUP: Record<number, string> = { 2: "", 3: "∛", 4: "∜" };
const rootSym = (n: number) => (n === 2 ? "√" : SUP[n] ?? `${n}th root of `);

// ---------- 1. Rational exponents ----------
const BASES: { n: number; r: number }[] = [
  { n: 2, r: 4 }, { n: 2, r: 5 }, { n: 2, r: 9 }, { n: 2, r: 10 }, { n: 3, r: 2 }, { n: 3, r: 3 }, { n: 3, r: 4 }, { n: 3, r: 5 }, { n: 4, r: 2 }, { n: 4, r: 3 }, { n: 5, r: 2 },
];
const rationalExp: Skill = {
  id: "m2.rad.rational-exponents",
  title: "Rational exponents and radicals",
  topic: T,
  standards: ["NC.M2.N-RN.1", "NC.M2.N-RN.2"],
  prereqs: [],
  lesson: {
    bigIdea: "b^(1/n) means the nth root of b, and b^(m/n) means (the nth root of b)^m. The denominator is the root; the numerator is the power.",
    explain: [
      "Why: (b^(1/3))^3 = b^(1/3 · 3) = b^1 = b, so b^(1/3) must be the number whose cube is b: the cube root. That's how the exponent rules extend to fractions.",
      "Worked example: 8^(2/3) = (∛8)^2 = 2^2 = **4**. Take the root first so the numbers stay small.",
      "Negative exponents still mean reciprocal: 16^(−3/4) = {1/16^(3/4)} = {1/(∜16)^3} = {1/2^3} = {1/8}.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does 9^(1/2) equal √9?", choices: ["(9^(1/2))^2 = 9^1 = 9, so 9^(1/2) is a number whose square is 9.", "Because 1/2 of 9 is 4.5, which rounds to 3.", "Because exponents and roots are unrelated.", "Because 9 ÷ 2 = √9."], correct: 0, explain: "The power-of-a-power rule forces b^(1/2) to be the square root." },
    { kind: "written", prompt: "Explain how to evaluate 27^(4/3) without a calculator.", keyIdeas: ["the denominator 3 means cube root: ∛27 = 3", "the numerator 4 means raise to the 4th power", "3^4 = 81"], exemplar: "The 3 in the denominator means take the cube root: ∛27 = 3. The 4 in the numerator means raise that to the 4th power: 3^4 = 81. So 27^(4/3) = 81." },
  ],
  generate(r, lv) {
    const { n, r: root } = r.pick(BASES);
    let m = 1;
    const neg = lv === 3 && r.chance(0.6);
    if (lv >= 2) {
      const ms_ = [2, 3, n + 1].filter((v) => gcd(v, n) === 1 && root ** v <= (neg ? 128 : 1000));
      m = ms_.length ? r.pick(ms_) : 1;
    }
    const b = root ** n;
    const val = root ** m;
    const ans = neg ? frac(1, val) : frac(val);
    const e = `${neg ? "−" : ""}${m === 1 ? `1/${n}` : `${m}/${n}`}`;
    return {
      prompt: `Evaluate ${b}^(${e}).`,
      answer: num(ans, { simplest: true }),
      hints: [`The denominator ${n} means the ${n === 2 ? "square" : n === 3 ? "cube" : `${n}th`} root: ${rootSym(n)}${b} = ?`, m > 1 ? `Then raise the root to the power ${m}.${neg ? " The negative sign means take the reciprocal at the end." : ""}` : neg ? "The negative exponent means take the reciprocal." : `${root}^${n} = ${b}.`],
      steps: [
        st(`Take the ${n === 2 ? "square" : n === 3 ? "cube" : `${n}th`} root.`, `${rootSym(n)}${b} = ${root} (since ${root}^${n} = ${b})`),
        ...(m > 1 ? [st(`Raise to the power ${m}.`, `${root}^${m} = ${val}`)] : []),
        ...(neg ? [st("Negative exponent: take the reciprocal.", `${b}^(${e}) = {1/${val}}`)] : []),
      ],
      traps: traps(ans, [trap(frac(b * m, n), `${b}^(${e}) isn't ${b} × ${m}/${n}. The denominator is a root, not a divisor.`), trap(neg ? val : frac(1, val), neg ? "Don't forget the negative exponent: take the reciprocal." : "The exponent isn't negative, so no reciprocal."), ...(m > 1 ? [trap(root, `That's just the root. Now raise it to the power ${m}.`)] : [])]),
    };
  },
};

// ---------- 2. Exponent properties with rational exponents ----------
const expProps: Skill = {
  id: "m2.rad.exponent-properties",
  title: "Rewrite radicals and rational exponents",
  topic: T,
  standards: ["NC.M2.N-RN.2", "NC.M2.N-RN.1"],
  prereqs: ["m2.rad.rational-exponents"],
  lesson: {
    bigIdea: "Write roots as fractional exponents, then use the usual rules: add exponents when multiplying, subtract when dividing, multiply for a power of a power.",
    explain: [
      "∜(x^3) = x^(3/4), and √x = x^(1/2).",
      "Worked example: ∛(x^2) · √x = x^(2/3) · x^(1/2) = x^(2/3 + 1/2) = x^(4/6 + 3/6) = **x^(7/6)**.",
      "Power of a power: (x^(3/4))^2 = x^(6/4) = x^(3/2). Quotient: x^(5/3) ÷ x^(1/3) = x^(4/3).",
    ],
    tip: "Type fractional exponents with parentheses: x^(7/6).",
  },
  why: [
    { kind: "choice", prompt: "Why is √x · √x = x when x ≥ 0?", choices: ["x^(1/2) · x^(1/2) = x^(1/2 + 1/2) = x^1.", "Because √ and · cancel.", "Because x · x = x.", "It equals 2√x."], correct: 0, explain: "Adding the exponents ½ + ½ gives 1." },
    { kind: "written", prompt: "Explain why ∛(x^6) = x^2.", keyIdeas: ["∛(x^6) = (x^6)^(1/3)", "multiply exponents: 6 · 1/3 = 2", "check: (x^2)^3 = x^6"], exemplar: "The cube root is the 1/3 power, so ∛(x^6) = (x^6)^(1/3) = x^(6/3) = x^2. Check: (x^2)^3 = x^6, so x^2 really is the cube root." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const n = r.pick([3, 4, 5]);
      let m = r.int(2, n + 2);
      if (m % n === 0) m += 1;
      const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
      const d = g(m, n);
      const correct = `x^(${m / d}/${n / d})`;
      const rad = `${n === 3 ? "∛" : n === 4 ? "∜" : "⁵√"}(x^${m})`;
      return {
        prompt: `Which expression is equivalent to ${rad}?`,
        answer: choice(r, correct, [[m / d === 1 ? `x^${n / d}` : `x^(${n / d}/${m / d})`, "The root goes in the denominator, the power in the numerator."], [`x^${m * n}`, "A root is a fractional exponent; don't multiply."], [m - n < 0 ? `x^(−${n - m})` : `x^${m - n}`, "Subtracting isn't the rule. Use the power over the root."]]),
        hints: ["The index of the root becomes the denominator of the exponent.", `${rad} = x^(${m}/${n}).`],
        steps: [st("Rewrite the root as an exponent.", `${rad} = x^(${m}/${n})`), ...(d > 1 ? [st("Simplify the fraction.", `x^(${m / d}/${n / d})`)] : [])],
      };
    }
    // Products/quotients of powers.
    const pairs: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 6], [5, 6]];
    const [a1, b1] = r.pick(pairs), [a2, b2] = r.pick(pairs);
    const op = lv === 2 ? "mul" : r.pick(["div", "pow", "mulrad"]);
    let prompt: string, n: number, d: number, steps: string[];
    const R = (num_: number, den: number) => { const f = frac(num_, den); return [f.n, f.d]; };
    if (op === "mul") {
      [n, d] = R(a1 * b2 + a2 * b1, b1 * b2);
      prompt = `Simplify x^(${a1}/${b1}) · x^(${a2}/${b2}). Write your answer as a single power of x.`;
      steps = [st("Multiplying powers: add exponents.", `${a1}/${b1} + ${a2}/${b2} = ${a1 * b2}/${b1 * b2} + ${a2 * b1}/${b1 * b2} = ${fracText(n, d)}`), st("Answer.", `x^(${n}/${d})`.replace("/1)", ")"))];
    } else if (op === "div") {
      [n, d] = R(a1 * b2 - a2 * b1 + 2 * b1 * b2, b1 * b2);
      const top = frac(a1 + 2 * b1, b1);
      prompt = `Simplify x^(${top.n}/${top.d}) ÷ x^(${a2}/${b2}). Write your answer as a single power of x.`;
      steps = [st("Dividing powers: subtract exponents.", `${top.n}/${top.d} − ${a2}/${b2} = ${fracText(n, d)}`), st("Answer.", `x^(${n}/${d})`.replace("/1)", ")"))];
    } else if (op === "pow") {
      const k = r.int(2, 4);
      [n, d] = R(a1 * k, b1);
      prompt = `Simplify (x^(${a1}/${b1}))^${k}. Write your answer as a single power of x.`;
      steps = [st("Power of a power: multiply exponents.", `${a1}/${b1} · ${k} = ${fracText(n, d)}`), st("Answer.", `x^(${n}/${d})`.replace("/1)", ")"))];
    } else {
      const p = r.pick([2, 3]), q = p === 2 ? 3 : 2;
      const m = r.int(1, 2);
      [n, d] = R(m * q + p, p * q);
      prompt = `Write ${p === 2 ? "√" : "∛"}(x^${m}) · ${q === 2 ? "√x" : "∛x"} as a single power of x.`.replace("(x^1)", "x");
      steps = [st("Rewrite as exponents.", `x^(${m}/${p}) · x^(1/${q})`), st("Add the exponents.", `${m}/${p} + 1/${q} = ${m * q}/${p * q} + ${p}/${p * q} = ${fracText(n, d)}`), st("Answer.", `x^(${n}/${d})`)];
    }
    const value = d === 1 ? `x^${n}` : `x^(${n}/${d})`;
    return {
      prompt,
      answer: expr(value, { display: d === 1 ? `x^${n}` : `x^(${n}/${d})` }),
      hints: [op === "mul" || op === "mulrad" ? "When you multiply powers with the same base, add the exponents." : op === "div" ? "When you divide powers with the same base, subtract the exponents." : "For a power of a power, multiply the exponents.", "Use a common denominator to combine the fractions. Type the answer like x^(7/6)."],
      steps,
    };
  },
};

// ---------- 3. Simplify radicals ----------
const simplify: Skill = {
  id: "m2.rad.simplify",
  title: "Simplify radicals",
  topic: T,
  standards: ["NC.M2.N-RN.2"],
  prereqs: ["m2.rad.rational-exponents"],
  lesson: {
    bigIdea: "Pull out perfect-square factors: √(a²b) = a√b. For cube roots, pull out perfect cubes.",
    explain: [
      "√72: the largest perfect square factor of 72 is 36. √72 = √(36 · 2) = √36 · √2 = **6√2**.",
      "This works because √(ab) = √a · √b, which is the exponent rule (ab)^(1/2) = a^(1/2) b^(1/2).",
      "Cube roots: ∛54 = ∛(27 · 2) = **3∛2**.",
    ],
    tip: "If you use a smaller square (√72 = 2√18), keep going: 2√18 = 2 · 3√2 = 6√2.",
  },
  why: [
    { kind: "choice", prompt: "Why is √(36 · 2) = √36 · √2?", choices: ["(ab)^(1/2) = a^(1/2) · b^(1/2), the power-of-a-product rule.", "Because square roots can be split over addition too.", "Because 36 · 2 = 72.", "It isn't true."], correct: 0, explain: "Roots are powers, and a power of a product is the product of the powers." },
    { kind: "written", prompt: "Explain why √(9 + 16) is not equal to √9 + √16.", keyIdeas: ["√(9 + 16) = √25 = 5", "√9 + √16 = 3 + 4 = 7", "roots split over multiplication, not addition"], exemplar: "√(9 + 16) = √25 = 5, but √9 + √16 = 3 + 4 = 7. They aren't equal. Square roots can be split over multiplication, but not over addition." },
  ],
  generate(r, lv) {
    if (lv === 3 && r.chance(0.5)) {
      const a = r.int(2, 5), b = r.pick([2, 3, 4, 5, 6, 7]);
      const n = a ** 3 * b;
      return {
        prompt: `Simplify ∛${n}.`,
        answer: exact(`${a}cbrt(${b})`, `${a}∛${b}`),
        hints: ["Look for a perfect cube factor: 8, 27, 64, 125.", `${n} = ${a ** 3} · ${b}.`],
        steps: [st("Factor out a perfect cube.", `${n} = ${a ** 3} · ${b}`), st("Split the root.", `∛${n} = ∛${a ** 3} · ∛${b} = ${a}∛${b}`)],
      };
    }
    let a: number, b: number;
    do { a = r.int(2, lv === 1 ? 5 : 10); b = r.pick([2, 3, 5, 6, 7, 10, 11]); } while (a * a * b > (lv === 1 ? 100 : 600));
    const n = a * a * b;
    const coef = lv === 3 ? r.int(2, 4) : 1;
    const disp = `${coef * a}√${b}`;
    return {
      prompt: `Simplify ${coef > 1 ? coef : ""}√${n}.`,
      answer: exact(`${coef * a}sqrt(${b})`, disp),
      hints: ["Find the largest perfect square that divides " + n + ".", `${n} = ${a * a} · ${b}.`],
      steps: [st("Factor out the largest perfect square.", `${n} = ${a * a} · ${b}`), st("Split the root.", `√${n} = √${a * a} · √${b} = ${radText(a, b)}`), ...(coef > 1 ? [st("Multiply by the coefficient.", `${coef} · ${radText(a, b)} = ${disp}`)] : []), st("Check it's simplest.", `${b} has no perfect-square factor, so ${disp} is fully simplified.`)],
    };
  },
};

// ---------- 4. Operations with radicals ----------
const operations: Skill = {
  id: "m2.rad.operations",
  title: "Add, subtract and multiply radicals",
  topic: T,
  standards: ["NC.M2.N-RN.2"],
  prereqs: ["m2.rad.simplify"],
  lesson: {
    bigIdea: "Add or subtract like radicals (same radicand) like like terms. Multiply radicals by multiplying the outside numbers and the inside numbers.",
    explain: [
      "√12 + √27 = 2√3 + 3√3 = **5√3**. Simplify first; then the radicands match.",
      "2√3 · 4√6 = (2 · 4)√(3 · 6) = 8√18 = 8 · 3√2 = **24√2**.",
      "Binomials work like FOIL: (2 + √3)(2 − √3) = 4 − 2√3 + 2√3 − 3 = **1**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can't √2 + √3 be combined into one radical?", choices: ["They aren't like terms: different radicands, like 2x + 3y.", "Because √2 + √3 = √5.", "They can: √2 + √3 = 2√5.", "Because both are irrational."], correct: 0, explain: "Only radicals with the same radicand combine, just like only like terms combine." },
    { kind: "written", prompt: "Explain why (3 + √5)(3 − √5) is a whole number.", keyIdeas: ["it's a difference of squares: 3² − (√5)²", "the middle terms −3√5 and +3√5 cancel", "9 − 5 = 4"], exemplar: "Multiplying out gives 9 − 3√5 + 3√5 − 5. The two radical terms cancel, leaving 9 − 5 = 4. It's the difference-of-squares pattern a² − b²." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 5, 6, 7]);
      const p = r.int(1, 4);
      const sub = r.chance(0.4);
      let q = r.int(1, 5);
      if (sub && q === p) q = p + 1;
      const n1 = p * p * b, n2 = q * q * b;
      const tot = sub ? p - q : p + q;
      const disp = tot === 1 ? `√${b}` : tot === -1 ? `−√${b}` : `${tot < 0 ? "−" : ""}${Math.abs(tot)}√${b}`;
      return {
        prompt: `Simplify √${n1} ${sub ? "−" : "+"} √${n2}.`,
        answer: exact(`${tot}sqrt(${b})`, disp),
        hints: ["Simplify each radical first.", `√${n1} = ${radText(p, b)} and √${n2} = ${radText(q, b)}. Now combine like terms.`],
        steps: [st("Simplify each radical.", `√${n1} = ${radText(p, b)}, √${n2} = ${radText(q, b)}`), st("Combine like radicals.", `${p} ${sub ? "−" : "+"} ${q} = ${tot}, so the answer is ${disp}`)],
      };
    }
    if (lv === 2) {
      const a = r.int(2, 5), c = r.int(2, 5);
      const [x, y] = r.pick([[2, 6], [3, 6], [2, 10], [3, 15], [5, 10], [6, 10], [2, 8], [3, 12], [5, 15], [7, 14]]);
      const { a: o, b: i } = radical(x * y);
      const coef = a * c * o;
      const disp = i === 1 ? String(coef) : `${coef}√${i}`;
      return {
        prompt: `Multiply and simplify: ${a}√${x} · ${c}√${y}.`,
        answer: exact(i === 1 ? String(coef) : `${coef}sqrt(${i})`, disp),
        hints: ["Multiply the outside numbers together and the numbers under the roots together.", `${a * c}√${x * y}. Now simplify √${x * y}.`],
        steps: [st("Multiply outside and inside.", `${a} · ${c} = ${a * c}; √${x} · √${y} = √${x * y}`), st("Simplify the radical.", `√${x * y} = ${radText(o, i)}`), st("Multiply.", `${a * c} · ${radText(o, i)} = ${disp}`)],
      };
    }
    const kind = r.pick(["conj", "square"]);
    const a = r.int(1, 6), b = r.pick([2, 3, 5, 7]);
    if (kind === "conj") {
      const v = a * a - b;
      return {
        prompt: `Multiply: (${a} + √${b})(${a} − √${b}).`,
        answer: exact(String(v)),
        hints: ["FOIL, or use (p + q)(p − q) = p² − q².", `${a}² − (√${b})² = ${a * a} − ${b}.`],
        steps: [st("Multiply out.", `${a * a} − ${a}√${b} + ${a}√${b} − ${b}`), st("The radical terms cancel.", `${a * a} − ${b} = ${v}`)],
      };
    }
    const c0 = a * a + b, c1 = 2 * a;
    return {
      prompt: `Expand and simplify: (${a} + √${b})².`,
      answer: exact(`${c0}+${c1}sqrt(${b})`, `${c0} + ${c1}√${b}`),
      hints: ["(p + q)² = p² + 2pq + q². Don't just square each term.", `${a}² + 2(${a})(√${b}) + (√${b})².`],
      steps: [st("Use (p + q)² = p² + 2pq + q².", `${a * a} + ${c1}√${b} + ${b}`), st("Combine the whole numbers.", `${c0} + ${c1}√${b}`)],
    };
  },
};

// ---------- 5. Rational and irrational numbers ----------
const rationalIrrational: Skill = {
  id: "m2.rad.rational-irrational",
  title: "Rational and irrational numbers",
  topic: T,
  standards: ["NC.M2.N-RN.3"],
  prereqs: ["m2.rad.simplify"],
  lesson: {
    bigIdea: "Rationals are closed under +, −, × and ÷ (except by 0). A rational plus an irrational is irrational, and a nonzero rational times an irrational is irrational.",
    explain: [
      "Rational: can be written as {a/b} with integers a, b (b ≠ 0). So 0.75, −3, {2/7}, √49 = 7 and 0.333… are rational. √2, √10, π are irrational.",
      "Why 3 + √2 is irrational: suppose 3 + √2 = r, a rational number. Then √2 = r − 3, which is rational minus rational, so it's rational. But √2 isn't rational: contradiction.",
      "Two irrationals can make a rational: √2 · √2 = 2 and √2 + (−√2) = 0. That's why the rules only cover rational-with-irrational.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the product of two rational numbers always rational?", choices: ["{a/b} · {c/d} = {ac/bd}, and ac and bd are integers with bd ≠ 0.", "Because multiplying makes numbers bigger.", "Because all decimals are rational.", "It isn't always rational."], correct: 0, explain: "Integers are closed under multiplication, so the result is again a fraction of integers." },
    { kind: "written", prompt: "Explain why 5√3 is irrational.", keyIdeas: ["suppose 5√3 = r is rational", "then √3 = r/5, a rational divided by a nonzero rational, so rational", "but √3 is irrational: contradiction"], exemplar: "Suppose 5√3 were a rational number r. Then √3 = r ÷ 5, and a rational number divided by 5 is still rational. But √3 is irrational, so that's impossible. So 5√3 must be irrational." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const ratl = ["√64", "0.125", "−{7/3}", "√{9/16}", "0.4444… (repeating)", "−12", "∛27"];
      const irr = ["√12", "π", "√7", "2 + √5", "∛10", "0.1010010001… (pattern never repeats)"];
      const isRat = r.chance(0.5);
      const x = r.pick(isRat ? ratl : irr);
      return {
        prompt: `Is ${x} rational or irrational?`,
        answer: choice(r, isRat ? "Rational" : "Irrational", [[isRat ? "Irrational" : "Rational", isRat ? "It can be written as a fraction of integers." : "It can't be written as a fraction of integers."]], true),
        hints: ["Can it be written as a fraction of two integers?", "Perfect squares (and cubes) under a root give integers; repeating decimals are fractions."],
        steps: [st("Test it.", isRat ? `${x} can be written as a fraction of integers, so it is rational.` : `${x} has no exact fraction form (its decimal never ends or repeats), so it is irrational.`)],
      };
    }
    if (lv === 2) {
      const cases: [string, string, string][] = [
        ["3 + √2", "Irrational", "rational + irrational is irrational"],
        ["{1/2} + {3/4}", "Rational", "rational + rational is rational"],
        ["4√7", "Irrational", "nonzero rational × irrational is irrational"],
        ["√3 · √12", "Rational", "√3 · √12 = √36 = 6"],
        ["0 · π", "Rational", "0 times anything is 0, which is rational"],
        ["√5 − 2", "Irrational", "irrational − rational is irrational"],
        ["(√2)^2 + 1", "Rational", "(√2)² = 2, so it's 3"],
        ["π + 1", "Irrational", "irrational + rational is irrational"],
        ["{√8/√2}", "Rational", "√8 ÷ √2 = √4 = 2"],
        ["0.6 × √10", "Irrational", "nonzero rational × irrational is irrational"],
      ];
      const [x, ans, why] = r.pick(cases);
      return {
        prompt: `Is ${x} rational or irrational?`,
        answer: choice(r, ans, [[ans === "Rational" ? "Irrational" : "Rational", ans === "Rational" ? `Simplify first: ${why}.` : `Remember: ${why}.`]], true),
        hints: ["Simplify if you can. Then decide which rule applies: rational with rational, or rational with irrational.", "Rational + irrational is irrational; nonzero rational × irrational is irrational. Two irrationals can give either."],
        steps: [st("Apply the rule.", `${x}: ${why}, so it is ${ans.toLowerCase()}.`)],
      };
    }
    const qs: [string, string, [string, string][]][] = [
      ["Which pair of irrational numbers has a rational sum?", "√5 and −√5", [["√5 and √5", "√5 + √5 = 2√5, which is irrational."], ["π and √2", "That sum is irrational."], ["√2 and √3", "√2 + √3 is irrational."]]],
      ["Which pair of irrational numbers has a rational product?", "√2 and √8", [["√2 and √3", "√2 · √3 = √6, which is irrational."], ["π and 2π", "2π² is irrational."], ["√3 and √6", "√18 = 3√2 is irrational."]]],
      ["Which statement is always true?", "The sum of a rational number and an irrational number is irrational.", [["The sum of two irrational numbers is irrational.", "√2 + (−√2) = 0 is rational."], ["The product of two irrational numbers is irrational.", "√2 · √2 = 2 is rational."], ["The product of a rational and an irrational number is irrational.", "Not when the rational number is 0."]]],
      ["Maya claims 7 + √3 is rational because 7 is rational. Which reasoning shows she is wrong?", "If 7 + √3 = r were rational, then √3 = r − 7 would be rational, which is false.", [["7 + √3 ≈ 8.73, and decimals are irrational.", "Many decimals, like 0.5, are rational. A rounded decimal doesn't prove anything."], ["7 is odd, so the sum is irrational.", "Odd or even has nothing to do with it."], ["Any sum with a square root is irrational.", "√4 + 1 = 3 is rational."]]],
    ];
    const [q, c, w] = r.pick(qs);
    return {
      prompt: q,
      answer: choice(r, c, w),
      hints: ["Test each option with actual numbers.", "Look for an example where irrational parts cancel or multiply to a perfect square."],
      steps: [st("Check the answer.", c), st("Why the others fail.", w.map((x) => x[1]).join(" "))],
    };
  },
};

// ---------- 6. The imaginary unit ----------
const imaginary: Skill = {
  id: "m2.rad.imaginary",
  title: "The imaginary unit i",
  topic: T,
  standards: ["NC.M2.N-CN.1"],
  prereqs: ["m2.rad.simplify"],
  lesson: {
    bigIdea: "i is defined by i² = −1, so √(−1) = i. Square roots of negatives become multiples of i, and complex numbers have the form a + bi.",
    explain: [
      "√(−36) = √36 · √(−1) = **6i**. √(−50) = √25 · √2 · i = **5i√2** (often written 5√2 i).",
      "Powers of i cycle every four: i^1 = i, i^2 = −1, i^3 = −i, i^4 = 1, then it repeats. For i^23, divide 23 by 4: remainder 3, so i^23 = −i.",
      "In a + bi, a is the real part and b is the imaginary part. 3 − 4i has real part 3 and imaginary part −4.",
    ],
    tip: "Type i as a letter: 6i, 5sqrt(2)i.",
  },
  why: [
    { kind: "choice", prompt: "Why is √(−4) · √(−9) equal to −6, not 6?", choices: ["√(−4) = 2i and √(−9) = 3i, so the product is 6i² = −6.", "Because negatives always multiply to negatives.", "Because √(−4) · √(−9) = √36 = 6.", "It is 6."], correct: 0, explain: "The rule √a · √b = √(ab) only works when a and b aren't both negative; rewrite with i first." },
    { kind: "written", prompt: "Explain how to simplify i^30.", keyIdeas: ["powers of i repeat every 4", "30 ÷ 4 has remainder 2", "so i^30 = i^2 = −1"], exemplar: "Powers of i repeat in a cycle of 4: i, −1, −i, 1. Since i^4 = 1, i^28 = 1, and i^30 = i^28 · i^2 = 1 · (−1) = −1. (30 ÷ 4 leaves remainder 2.)" },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.int(2, 12);
      return {
        prompt: `Simplify √(−${a * a}). Type i for the imaginary unit.`,
        answer: expr(`${a}i`, { vars: ["i"], display: `${a}i` }),
        hints: ["√(−n) = √n · √(−1) = i√n.", `√${a * a} = ${a}.`],
        steps: [st("Split off √(−1).", `√(−${a * a}) = √${a * a} · √(−1)`), st("Use √(−1) = i.", `${a}i`)],
      };
    }
    if (lv === 2) {
      const a = r.int(2, 6), b = r.pick([2, 3, 5, 6, 7]);
      const n = a * a * b;
      return {
        prompt: `Simplify √(−${n}). Type i for the imaginary unit and sqrt( ) for roots.`,
        answer: expr(`${a}sqrt(${b})i`, { vars: ["i"], display: `${a}i√${b}` }),
        hints: ["Take out √(−1) = i, then simplify the radical.", `${n} = ${a * a} · ${b}.`],
        steps: [st("Split.", `√(−${n}) = i · √${n}`), st("Simplify the radical.", `√${n} = ${a}√${b}`), st("Answer.", `${a}i√${b} (or ${a}√${b} i)`)],
      };
    }
    if (r.chance(0.5)) {
      const k = r.int(5, 60);
      const vals = ["1", "i", "−1", "−i"];
      const ans = vals[k % 4];
      return {
        prompt: `Simplify i^${k}.`,
        answer: choice(r, ans, vals.filter((v) => v !== ans).map((v) => [v, `Divide ${k} by 4 and use the remainder: ${k} = 4 · ${Math.floor(k / 4)} + ${k % 4}.`] as [string, string]), true),
        hints: ["Powers of i repeat every 4: i, −1, −i, 1.", `${k} ÷ 4 leaves remainder ${k % 4}.`],
        steps: [st("Divide the exponent by 4.", `${k} = 4 · ${Math.floor(k / 4)} + ${k % 4}`), st("Use i^4 = 1.", `i^${k} = (i^4)^${Math.floor(k / 4)} · i^${k % 4} = i^${k % 4} = ${ans}`)],
      };
    }
    const a = r.int(2, 7), b = r.int(2, 7);
    const v = -a * b;
    return {
      prompt: `Simplify √(−${a * a}) · √(−${b * b}).`,
      answer: num(v),
      hints: ["Rewrite each root with i before multiplying.", `${a}i · ${b}i = ${a * b}i². What is i²?`],
      steps: [st("Rewrite with i.", `√(−${a * a}) = ${a}i and √(−${b * b}) = ${b}i`), st("Multiply.", `${a}i · ${b}i = ${a * b}i²`), st("Use i² = −1.", `${a * b}(−1) = ${v}`)],
      traps: traps(frac(v), [trap(a * b, "√a · √b = √(ab) doesn't work when both are negative. Rewrite with i first: you get i² = −1.")]),
    };
  },
};

const skills: Skill[] = [rationalExp, expProps, simplify, operations, rationalIrrational, imaginary];
export default skills;
