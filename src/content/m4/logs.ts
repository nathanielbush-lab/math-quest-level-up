// Unit 2: Logarithmic functions: properties, equations, contexts and graphs (NC.M4.AF.3).
import { binom, binomExpr, choice, cst, fr, ms, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { PEOPLE, dec, rnd, tolTraps } from "./util";

const T = "m4-logs";

/** Display markup for log base b of arg: "log_2(8)", or "log(8)" for base 10. */
export const lg = (b: number, arg: string | number) => (b === 10 ? `log(${arg})` : `log_${b}(${arg})`);

const evaluate: Skill = {
  id: "m4.log.evaluate",
  title: "Evaluate logarithms",
  topic: T,
  standards: ["NC.M4.AF.3.1"],
  prereqs: [],
  lesson: {
    bigIdea: "log_b(x) is the exponent you put on b to get x. So log_b(x) = y means exactly the same thing as b^y = x.",
    explain: [
      "log_2(32) asks: 2 to what power is 32? Since 2^5 = 32, log_2(32) = **5**.",
      "Negative and fraction answers are normal: log_3({1/9}) = −2 because 3^−2 = {1/9}, and log_9(3) = {1/2} because 9^(1/2) = √9 = 3.",
      "log(x) with no base means base 10: log(1000) = 3 and log(0.01) = −2.",
    ],
    tip: "Read log_b(x) out loud as \"the power of b that gives x.\"",
  },
  why: [
    { kind: "choice", prompt: "Why is log_5(1) = 0 for any base, not just 5?", choices: ["Any nonzero base raised to the power 0 is 1.", "Because 1 is the smallest positive number.", "Because logs of small numbers are always 0."], correct: 0, explain: "b^0 = 1, so the exponent that gives 1 is always 0." },
    { kind: "written", prompt: "Explain why log_2(−8) has no real value.", keyIdeas: ["log_2(−8) asks for a power of 2 equal to −8", "2 raised to any real power is positive", "so no exponent works"], exemplar: "log_2(−8) is the exponent y with 2^y = −8. But 2 to any real power is always positive, so no real y works. The domain of a log is positive numbers only." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 4, 5, 10]);
      const k = r.int(2, b === 2 ? 6 : b === 10 ? 5 : b === 3 ? 5 : 4);
      const N = b ** k;
      return {
        prompt: `Evaluate ${lg(b, N)}.`,
        answer: num(k),
        hints: [`Ask: ${b} to what power equals ${N}?`, `Count the factors of ${b}: ${Array(k).fill(b).join(" × ")} = ${N}.`],
        steps: [st("Rewrite as an exponent question.", `${lg(b, N)} = y means ${b}^y = ${N}.`), st("Find the power.", `${b}^${k} = ${N}, so y = ${k}.`)],
        traps: traps(frac(k), [trap(N / b, `That's ${N} ÷ ${b}. A log gives an exponent, not a quotient.`)]),
      };
    }
    if (lv === 2) {
      const kind = r.pick(["recip", "root", "dec"]);
      if (kind === "recip") {
        const b = r.pick([2, 3, 4, 5]), k = r.int(1, b === 2 ? 5 : 3), N = b ** k;
        return {
          prompt: `Evaluate ${lg(b, fr(1, N))}.`,
          answer: num(-k),
          hints: [`{1/${N}} = {1/${b}^${k}}. A reciprocal means a negative exponent.`, `${b}^−${k} = {1/${N}}.`],
          steps: [st("Write the number as a power of the base.", `{1/${N}} = {1/${b}^${k}} = ${b}^−${k}`), st("Read off the exponent.", `${lg(b, fr(1, N))} = −${k}`)],
          traps: traps(frac(-k), [trap(k, "The input is less than 1, so the exponent must be negative."), trap(frac(1, k), "A reciprocal of a power is a negative exponent, not a fraction exponent.")]),
        };
      }
      if (kind === "root") {
        const n = r.pick([2, 3, 4, 5]), p = r.pick([2, 3].filter((q) => n ** q <= 125));
        const B = n ** p;
        return {
          prompt: `Evaluate ${lg(B, n)}.`,
          answer: num(frac(1, p)),
          hints: [`${n} is a root of ${B}: which root?`, `${p === 2 ? "√" : "∛"}${B} = ${n}, so ${B}^(1/${p}) = ${n}.`],
          steps: [st("Write the number as a power of the base.", `${n} = ${p === 2 ? "√" : "∛"}${B} = ${B}^(1/${p})`), st("Read off the exponent.", `${lg(B, n)} = {1/${p}}`)],
          traps: traps(frac(1, p), [trap(p, `${B}^${p} is much bigger than ${n}. You need a fraction exponent.`), trap(-p, "The input is bigger than 1, so the log is positive.")]),
        };
      }
      const k = r.int(1, 4);
      const N = Number((10 ** -k).toFixed(k));
      return {
        prompt: `Evaluate log(${N}).`,
        answer: num(-k),
        hints: ["log with no base means base 10.", `${N} = {1/${10 ** k}} = 10^−${k}.`],
        steps: [st("Write as a power of 10.", `${N} = {1/${10 ** k}} = 10^−${k}`), st("Read off the exponent.", `log(${N}) = −${k}`)],
        traps: traps(frac(-k), [trap(k, "The input is less than 1, so the log is negative."), trap(-(k + 1), `Count the decimal places: ${N} has ${k}.`)]),
      };
    }
    if (r.chance(0.5)) {
      const x = r.pick([2, 3, 4, 5, 6]), k = r.int(2, x <= 3 ? 4 : 3);
      const N = x ** k;
      return {
        prompt: `Solve for x: log_x(${N}) = ${k}.`,
        answer: num(x),
        hints: ["Rewrite the log equation in exponential form.", `log_x(${N}) = ${k} means x^${k} = ${N}.`],
        steps: [st("Rewrite in exponential form.", `x^${k} = ${N}`), st(`Take the ${k === 2 ? "square" : k === 3 ? "cube" : `${k}th`} root.`, `x = ${x} (bases of logs must be positive, so ignore negative roots)`), st("Check.", `${x}^${k} = ${N} ✓`)],
        traps: traps(frac(x), [trap(N / k, `That divides ${N} by ${k}. The equation says x^${k} = ${N}.`), ...(N ** k <= 1e6 ? [trap(N ** k, "That's backwards: x raised to the power gives the input, not the input raised to the power.")] : [])]),
      };
    }
    const b = r.pick([2, 3, 4, 5]), k = -r.int(1, b === 2 ? 4 : 2);
    const x = frac(1, b ** -k);
    return {
      prompt: `Solve for x: ${lg(b, "x")} = ${ms(k)}.`,
      answer: num(x),
      hints: ["Rewrite in exponential form: base^(answer) = input.", `x = ${b}^${ms(k)}.`],
      steps: [st("Rewrite in exponential form.", `x = ${b}^${ms(k)}`), st("A negative exponent means a reciprocal.", `x = {1/${b}^${-k}} = {1/${b ** -k}}`)],
      traps: traps(x, [trap(b * k, "The log is the exponent, so x = base^exponent, not base × exponent."), trap(-(b ** -k), "A negative exponent makes a reciprocal, not a negative number.")]),
    };
  },
};

const SUMS: [number, number, number, number][] = [[10, 4, 25, 2], [10, 5, 20, 2], [10, 8, 125, 3], [10, 2, 50, 2], [10, 40, 25, 3], [6, 4, 9, 2], [6, 3, 12, 2], [6, 2, 108, 3], [12, 3, 48, 2], [12, 8, 18, 2], [15, 3, 75, 2], [15, 5, 45, 2], [20, 8, 50, 2]];

const properties: Skill = {
  id: "m4.log.properties",
  title: "Use properties of logarithms",
  topic: T,
  standards: ["NC.M4.AF.3.1"],
  prereqs: ["m4.log.evaluate"],
  lesson: {
    bigIdea: "Logs turn multiplication into addition: log(MN) = log M + log N, log({M/N}) = log M − log N, and log(M^p) = p·log M.",
    explain: [
      "These come straight from exponent rules: multiplying powers adds exponents, and logs *are* exponents.",
      "Example: log(4) + log(25) = log(4 × 25) = log(100) = **2**, even though neither log(4) nor log(25) is a whole number.",
      "Example: 2log_3(6) − log_3(4) = log_3(6^2) − log_3(4) = log_3({36/4}) = log_3(9) = **2**.",
    ],
    tip: "There's no rule for log(M + N). log(2 + 8) is NOT log 2 + log 8.",
  },
  why: [
    { kind: "choice", prompt: "Why does log_b(MN) = log_b(M) + log_b(N)?", choices: ["If M = b^x and N = b^y, then MN = b^(x + y), and logs are those exponents.", "Because logs distribute over multiplication like numbers do.", "It only works for base 10."], correct: 0, explain: "Multiplying powers of the same base adds exponents; logs record exponents." },
    { kind: "written", prompt: "A classmate writes log(x + 5) = log x + log 5. Explain the mistake, using numbers to show it.", keyIdeas: ["the product rule is for log of a product, not a sum", "a counterexample like x = 5", "log 10 = 1 but log 5 + log 5 = log 25 ≈ 1.4"], exemplar: "The rule is log(5x) = log 5 + log x, for a product. For a sum it fails: with x = 5, log(5 + 5) = log 10 = 1, but log 5 + log 5 = log 25 ≈ 1.40." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      if (r.chance(0.5)) {
        const [b, m, n, k] = r.pick(SUMS);
        return {
          prompt: `Evaluate without a calculator: ${lg(b, m)} + ${lg(b, n)}`,
          answer: num(k),
          hints: ["Use the product rule to combine the logs into one.", `${lg(b, m)} + ${lg(b, n)} = ${lg(b, `${m} × ${n}`)} = ${lg(b, m * n)}.`],
          steps: [st("Product rule.", `${lg(b, m)} + ${lg(b, n)} = ${lg(b, m * n)}`), st("Evaluate.", `${b}^${k} = ${m * n}, so the answer is ${k}.`)],
          traps: traps(frac(k), [trap(m + n, "Combine the logs first; adding the inputs isn't a log rule.")]),
        };
      }
      const b = r.pick([2, 3, 5, 10]), k = r.int(1, b === 10 ? 2 : 3);
      const n = r.pick([3, 6, 7, 12, 15].filter((q) => q % b !== 0));
      const m = n * b ** k;
      return {
        prompt: `Evaluate without a calculator: ${lg(b, m)} − ${lg(b, n)}`,
        answer: num(k),
        hints: ["Use the quotient rule to combine into a single log.", `${lg(b, m)} − ${lg(b, n)} = ${lg(b, fr(m, n))}.`],
        steps: [st("Quotient rule.", `${lg(b, m)} − ${lg(b, n)} = ${lg(b, `${m} ÷ ${n}`)} = ${lg(b, b ** k)}`), st("Evaluate.", `${b}^${k} = ${b ** k}, so the answer is ${k}.`)],
        traps: traps(frac(k), [trap(b ** k, `${b ** k} is the input of the combined log. The log itself is the exponent.`), trap(m - n, "The quotient rule divides the inputs; it doesn't subtract them.")]),
      };
    }
    if (lv === 2) {
      if (r.chance(0.5)) {
        const v = r.pick(["x", "a"]);
        const p = r.int(2, 4), q = r.int(2, 3);
        const ans = `${p}log(${v}) + log(y) − ${q}log(z)`;
        return {
          prompt: `Which expression is equivalent to log({${v}^${p}y/z^${q}})?`,
          answer: choice(r, ans, [
            [`${p}log(${v}) · log(y) − ${q}log(z)`, "The product rule turns multiplication into addition, not multiplication of logs."],
            [`log(${p}${v}) + log(y) − log(${q}z)`, `The power rule moves the exponent in front: log(${v}^${p}) = ${p}log(${v}).`],
            [`${p}log(${v}) + log(y) + ${q}log(z)`, "Dividing by z^q subtracts its log."],
            [`{${p}log(${v}) + log(y)/${q}log(z)}`, "The quotient rule subtracts logs; it doesn't divide them."],
          ]),
          hints: ["Split the fraction with the quotient rule, then the product with the product rule.", "Finish with the power rule: exponents move to the front."],
          steps: [st("Quotient rule.", `log({${v}^${p}y/z^${q}}) = log(${v}^${p}y) − log(z^${q})`), st("Product rule.", `= log(${v}^${p}) + log(y) − log(z^${q})`), st("Power rule.", `= ${ans}`)],
        };
      }
      const b = r.pick([2, 3, 10]);
      const s = r.pick([3, 5, 7].filter((q) => q !== b));
      const a = b === 10 ? 2 : r.pick([2, 3]);
      const M = b * s, N = s ** a;
      return {
        prompt: `Evaluate without a calculator: ${a}${lg(b, M)} − ${lg(b, N)}`,
        answer: num(a),
        hints: [`Power rule first: ${a}${lg(b, M)} = ${lg(b, `${M}^${a}`)}.`, `Then the quotient rule: ${lg(b, `${M}^${a}`)} − ${lg(b, N)} = ${lg(b, fr(M ** a, N))}.`],
        steps: [st("Power rule.", `${a}${lg(b, M)} = ${lg(b, `${M}^${a}`)} = ${lg(b, M ** a)}`), st("Quotient rule.", `${lg(b, M ** a)} − ${lg(b, N)} = ${lg(b, fr(M ** a, N))} = ${lg(b, b ** a)}`), st("Evaluate.", `${b}^${a} = ${b ** a}, so the answer is ${a}.`)],
        traps: traps(frac(a), [trap(b ** a, `${b ** a} is the input of the final log; the log is the exponent.`)]),
      };
    }
    const base = r.pick([5, 7]);
    const A = rnd(Math.log(2) / Math.log(base), 4), B = rnd(Math.log(3) / Math.log(base), 4);
    const [i, j, label] = r.pick([[1, 1, "6"], [2, 1, "12"], [1, 2, "18"], [3, 1, "24"], [-1, 1, "1.5"], [2, 2, "36"], [-1, 2, "4.5"], [1, 3, "54"]] as [number, number, string][]);
    const ans = rnd(i * A + j * B, 4);
    const fact = `${label} = ${[i > 0 ? (i === 1 ? "2" : `2^${i}`) : "", j === 1 ? "3" : `3^${j}`].filter(Boolean).join(" × ")}${i < 0 ? " ÷ 2" : ""}`;
    const combo = `${i === 1 ? "" : i === -1 ? "−" : i}${lg(base, 2)} + ${j === 1 ? "" : j}${lg(base, 3)}`.replace("+ −", "− ");
    return {
      prompt: `Use ${lg(base, 2)} ≈ ${A} and ${lg(base, 3)} ≈ ${B} to estimate ${lg(base, label)}. Round to four decimal places.`,
      answer: num(ans, { tolerance: 0.0015 }),
      hints: [`Write ${label} using only 2s and 3s.`, `${fact}, so ${lg(base, label)} = ${combo}.`],
      steps: [st("Factor the input.", fact), st("Use the product, quotient and power rules.", `${lg(base, label)} = ${combo}`), st("Substitute.", `${ms(i)}(${A}) + ${j}(${B}) = ${dec(ans)}`)],
      traps: tolTraps(ans, 0.0015, [[A * B, "The product rule adds logs; it doesn't multiply them."], [i * B + j * A, "Check which power goes with log 2 and which with log 3."]]),
    };
  },
};

function productPairs(): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  for (const b of [2, 3, 10]) for (let k = 1; b ** k <= 1000; k++) {
    const P = b ** k;
    for (let x = 1; x * x < P; x++) if (P % x === 0 && P / x - x > 0) out.push([b, k, x, P / x - x]);
  }
  return out.filter((p) => p[3] <= 60);
}
const PAIRS = productPairs();

const solve: Skill = {
  id: "m4.log.solve",
  title: "Solve logarithmic equations",
  topic: T,
  standards: ["NC.M4.AF.3.1"],
  prereqs: ["m4.log.properties"],
  lesson: {
    bigIdea: "Isolate the log, rewrite in exponential form, and solve. Then check: a log's input must be positive, so some algebra answers are extraneous.",
    explain: [
      "log_2(x + 3) = 5 means x + 3 = 2^5 = 32, so **x = 29**.",
      "With two logs, combine first: log_2(x) + log_2(x + 2) = 3 becomes log_2(x(x + 2)) = 3, so x^2 + 2x = 8, x^2 + 2x − 8 = 0, (x + 4)(x − 2) = 0.",
      "x = −4 would make log_2(−4) undefined, so it's extraneous. The only solution is **x = 2**.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why must you check solutions of log equations in the original equation?", choices: ["Combining logs can create solutions that make an original log's input zero or negative.", "Because log equations never have solutions.", "Calculators round logs, so answers are always slightly off."], correct: 0, explain: "log(x) + log(x + 2) only makes sense when both inputs are positive; the combined equation forgets that." },
    { kind: "written", prompt: "Explain how rewriting log_3(x) = 4 in exponential form solves the equation.", keyIdeas: ["log_3(x) = 4 means 3^4 = x", "the log is the exponent", "x = 81"], exemplar: "log_3(x) = 4 says the exponent on 3 that gives x is 4. So 3^4 = x, and x = 81." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const b = r.pick([2, 3, 5, 10]), k = r.int(1, b === 10 ? 3 : b === 5 ? 3 : 4);
      const c = r.nonzero(-9, 9);
      const ans = b ** k - c;
      return {
        prompt: `Solve for x: ${lg(b, `x${cst(c)}`)} = ${k}.`,
        answer: num(ans),
        hints: ["Rewrite in exponential form: the base to the power of the right side equals the input.", `x${cst(c)} = ${b}^${k} = ${b ** k}.`],
        steps: [st("Rewrite in exponential form.", `x${cst(c)} = ${b}^${k}`), st("Evaluate the power.", `x${cst(c)} = ${b ** k}`), st(`${c > 0 ? "Subtract" : "Add"} ${Math.abs(c)}.`, `x = ${ms(ans)}`), st("Check.", `${lg(b, b ** k)} = ${k} ✓`)],
        traps: traps(frac(ans), [trap(b * k - c, `${b}^${k} means ${Array(k).fill(b).join(" × ")}, not ${b} × ${k}.`), trap(b ** k + c, `Undo the ${c > 0 ? "+" : "−"} ${Math.abs(c)} with the opposite operation.`), trap(k ** b - c, `The base is ${b}, so it's ${b}^${k}, not ${k}^${b}.`)]),
      };
    }
    if (lv === 2) {
      const b = r.pick([2, 3, 10]), k = r.int(1, b === 10 ? 2 : 4);
      const a = r.int(2, 4), d = r.int(-6, 6);
      const e = a * k + d;
      const c = r.nonzero(-6, 6);
      const ans = b ** k + c;
      return {
        prompt: `Solve for x: ${a}${lg(b, `x${cst(-c)}`)}${cst(d)} = ${ms(e)}.`,
        answer: num(ans),
        hints: ["Isolate the log first, just like isolating x.", `${a}${lg(b, `x${cst(-c)}`)} = ${ms(a * k)}, so ${lg(b, `x${cst(-c)}`)} = ${k}.`],
        steps: [
          ...(d ? [st(`${d > 0 ? "Subtract" : "Add"} ${Math.abs(d)}.`, `${a}${lg(b, `x${cst(-c)}`)} = ${ms(a * k)}`)] : []),
          st(`Divide by ${a}.`, `${lg(b, `x${cst(-c)}`)} = ${k}`),
          st("Rewrite in exponential form.", `x${cst(-c)} = ${b}^${k} = ${b ** k}`),
          st("Solve.", `x = ${ms(ans)}`),
        ],
        traps: traps(frac(ans), [trap(b ** (e - d) + c, `Divide by ${a} before rewriting in exponential form.`), trap(b ** k - c, `Undo the ${-c > 0 ? "+" : "−"} ${Math.abs(c)} with the opposite operation.`)]),
      };
    }
    const [b, k, x, c] = r.pick(PAIRS);
    const P = b ** k;
    const neg = -(x + c);
    return {
      prompt: `Solve for x: ${lg(b, "x")} + ${lg(b, `x + ${c}`)} = ${k}. Enter only valid solutions.`,
      answer: num(x),
      hints: [`Combine with the product rule: ${lg(b, `x(x + ${c})`)} = ${k}.`, `So x(x + ${c}) = ${P}: solve x^2 + ${c}x − ${P} = 0, then check each root in the original logs.`],
      steps: [
        st("Product rule.", `${lg(b, `x(x + ${c})`)} = ${k}`),
        st("Exponential form.", `x(x + ${c}) = ${b}^${k} = ${P}`),
        st("Set the quadratic to zero.", `x^2 + ${c}x − ${P} = 0`),
        st("Factor.", `(x − ${x})(x + ${x + c}) = 0, so x = ${x} or x = ${ms(neg)}`),
        st("Check for extraneous roots.", `x = ${ms(neg)} gives ${lg(b, ms(neg))}, which is undefined. Reject it.`),
        st("Answer.", `x = ${x}`),
      ],
      traps: traps(frac(x), [trap(neg, `${ms(neg)} is extraneous: the log of a negative number is undefined.`), trap(P - c, "Combine the two logs into one with the product rule before rewriting.")]),
    };
  },
};

const expContext: Skill = {
  id: "m4.log.exp-context",
  title: "Solve exponential models with logs",
  topic: T,
  standards: ["NC.M4.AF.3.2"],
  prereqs: ["m4.log.solve"],
  lesson: {
    bigIdea: "To find *when* an exponential model reaches a value, isolate the power and take a log of both sides; the exponent comes down in front.",
    explain: [
      "$500 grows at 6% a year: A = 500(1.06)^t. When does it reach $800?",
      "Divide: (1.06)^t = 1.6. Take log of both sides: t·log(1.06) = log(1.6). So t = {log(1.6)/log(1.06)} ≈ **8.07 years**.",
      "For continuous growth A = Pe^(rt), use ln instead: e^(rt) = {A/P} gives rt = ln({A/P}).",
    ],
    visual: { type: "plot", xMin: 0, xMax: 14, yMin: 0, yMax: 1200, xStep: 2, yStep: 200, curves: [{ expr: "500(1.06)^x", label: "A = 500(1.06)^t" }], hlines: [{ y: 800, dashed: true, label: "800" }], vlines: [{ x: 8.07, dashed: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why do you divide by 500 before taking logs in 500(1.06)^t = 800?", choices: ["The exponent applies only to 1.06, so isolate (1.06)^t first.", "Because log(500) is undefined.", "It's optional; the answer is the same either way."], correct: 0, explain: "log(500 · 1.06^t) = log 500 + t·log 1.06; dividing first keeps it simple. Skipping it and treating 500 as part of the power gives a wrong answer." },
    { kind: "written", prompt: "Explain why taking the log of both sides helps solve 2^t = 20.", keyIdeas: ["the variable is in the exponent", "log(2^t) = t·log 2 by the power rule", "then divide: t = log 20 ÷ log 2"], exemplar: "The unknown is an exponent, so ordinary algebra can't reach it. Logs bring exponents down: log(2^t) = t·log 2. Then t·log 2 = log 20 and t = log 20 ÷ log 2 ≈ 4.32." },
  ],
  generate(r, lv) {
    const name = r.pick(PEOPLE);
    let P: number, rate: number, target: number, prompt: string, cont = false, unit: string, decay = false;
    if (lv === 1) {
      P = r.pick([200, 300, 400, 500, 800]); rate = r.pick([3, 4, 5, 6, 8, 10]); target = P * r.pick([1.5, 2, 2.5, 3]);
      unit = "";
      prompt = `Solve ${P}(${1 + rate / 100})^t = ${target} for t. Round to the nearest hundredth.`;
    } else if (lv === 2) {
      const ctx = r.int(0, 2);
      if (ctx === 0) {
        P = r.pick([500, 800, 1000, 1500]); rate = r.pick([4, 5, 6, 7]); target = P * r.pick([1.5, 2, 3]); unit = "years";
        prompt = `${name} invests $${P} at ${rate}% interest compounded yearly: A = ${P}(${1 + rate / 100})^t. How many years until it's worth $${target}? Round to the nearest hundredth.`;
      } else if (ctx === 1) {
        P = r.pick([1200, 2500, 4000]); rate = r.pick([8, 10, 12, 15]); target = P * r.pick([2, 5, 10]); unit = "weeks";
        prompt = `${name}'s channel has ${P} followers and grows ${rate}% per week: F = ${P}(${1 + rate / 100})^w. After how many weeks will it reach ${target} followers? Round to the nearest hundredth.`;
      } else {
        decay = true;
        P = r.pick([200, 400, 500]); rate = r.pick([10, 15, 20, 25]); target = P * r.pick([0.5, 0.25, 0.1]); unit = "hours";
        prompt = `A ${P}-mg dose of medicine leaves the body at ${rate}% per hour: M = ${P}(${(100 - rate) / 100})^h. After how many hours is ${target} mg left? Round to the nearest hundredth.`;
      }
    } else {
      cont = true;
      P = r.pick([1000, 2000, 5000]); rate = r.pick([3, 4, 5, 6]); target = P * r.pick([1.5, 2, 3]); unit = "years";
      prompt = `$${P} is invested at ${rate}% compounded continuously: A = ${P}e^(${rate / 100}t). How many years until it reaches $${target}? Round to the nearest hundredth.`;
    }
    const g = decay ? (100 - rate) / 100 : 1 + rate / 100;
    const ratio = target / P;
    const t = cont ? Math.log(ratio) / (rate / 100) : Math.log(ratio) / Math.log(g);
    const ans = rnd(t, 2);
    const L = cont ? "ln" : "log";
    return {
      prompt,
      answer: num(ans, { tolerance: 0.011 }),
      hints: [
        `Divide both sides by ${P} first.`,
        cont ? `e^(${rate / 100}t) = ${dec(ratio)}. Take ln of both sides: ${rate / 100}t = ln(${dec(ratio)}).` : `(${g})^t = ${dec(ratio)}. Take log of both sides: t·log(${g}) = log(${dec(ratio)}).`,
      ],
      steps: [
        st(`Divide by ${P}.`, cont ? `e^(${rate / 100}t) = {${target}/${P}} = ${dec(ratio)}` : `(${g})^t = {${target}/${P}} = ${dec(ratio)}`),
        st(`Take ${L} of both sides.`, cont ? `${rate / 100}t = ln(${dec(ratio)})` : `t · log(${g}) = log(${dec(ratio)})`),
        st("Solve for t.", cont ? `t = {ln(${dec(ratio)})/${rate / 100}} ≈ {${dec(Math.log(ratio), 4)}/${rate / 100}} ≈ ${dec(ans, 2)}` : `t = {log(${dec(ratio)})/log(${g})} ≈ {${dec(Math.log10(ratio), 4)}/${dec(Math.log10(g), 4)}} ≈ ${dec(ans, 2)}`),
        st("Answer.", `About ${dec(ans, 2)}${unit ? ` ${unit}` : ""}.`),
      ],
      traps: tolTraps(ans, 0.011, [
        [cont ? Math.log(target) / (rate / 100) : Math.log(target) / Math.log(g), `Divide by ${P} before taking the log.`],
        [Math.abs(ratio - 1) / (rate / 100), "That treats the growth as linear. Exponential growth compounds, so use logs."],
        [cont ? Math.log10(ratio) / (rate / 100) : Math.log(ratio) / Math.log(rate / 100), cont ? "With base e, use ln, not log." : `The growth factor is ${g}, not ${rate / 100}.`],
      ]),
    };
  },
};

const scales: Skill = {
  id: "m4.log.scales",
  title: "Logarithmic scales: pH, decibels, earthquakes",
  topic: T,
  standards: ["NC.M4.AF.3.2"],
  prereqs: ["m4.log.evaluate"],
  lesson: {
    bigIdea: "On a log scale, adding 1 means multiplying by 10. pH, decibels and earthquake magnitudes all work this way.",
    explain: [
      "pH = −log[H^+]. Lemon juice with [H^+] = 10^−2 has pH 2. Water at pH 7 has 10^−7, so lemon juice is 10^(7 − 2) = **100,000 times** more acidic.",
      "Decibels: L = 10·log({I/I_0}). Every +10 dB means 10 times the intensity, so 90 dB is 10^3 = 1000 times as intense as 60 dB.",
      "Earthquakes: each +1 in magnitude is 10 times the shaking amplitude. A magnitude 6 is 10^2 = 100 times a magnitude 4.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do scientists use log scales for sound and acidity?", choices: ["The quantities range over many powers of 10, and logs squeeze them into small, readable numbers.", "Logs make the measurements more accurate.", "Because sound is always measured in base 2."], correct: 0, explain: "Sound intensities span about 10^12 to 1; logs turn that into 0 to 120 dB." },
    { kind: "written", prompt: "A song is turned up from 70 dB to 80 dB. A friend says it's only about 14% louder. Explain what actually happened to the intensity.", keyIdeas: ["decibels are logarithmic", "+10 dB means the intensity is multiplied by 10", "so the intensity is 10 times as great"], exemplar: "Decibels use L = 10 log(I/I_0), so adding 10 dB adds 1 to the log, which multiplies the intensity by 10. The sound is 10 times as intense, not 14% more." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      if (r.chance(0.5)) {
        const k = r.int(2, 12);
        const thing = r.pick(["a soft drink", "a cleaning solution", "a pool sample", "black coffee", "a soil sample"]);
        return {
          prompt: `pH = −log[H^+]. ${thing[0].toUpperCase() + thing.slice(1)} has [H^+] = 10^−${k} moles per liter. What is its pH?`,
          answer: num(k),
          hints: ["log(10^n) = n.", `log(10^−${k}) = −${k}; now apply the negative sign in front.`],
          steps: [st("Take the log.", `log(10^−${k}) = −${k}`), st("Apply the negative.", `pH = −(−${k}) = ${k}`)],
          traps: traps(frac(k), [trap(-k, "The formula has a negative sign in front of the log.")]),
        };
      }
      const a = r.int(2, 5), b = a + r.int(2, 4);
      return {
        prompt: `A soda has pH ${a} and tomato juice has pH ${b}. How many times greater is the soda's hydrogen-ion concentration [H^+]?`,
        answer: num(10 ** (b - a)),
        hints: ["Each 1 unit lower in pH means 10 times more [H^+].", `The pH values differ by ${b - a}.`],
        steps: [st("Write each concentration.", `Soda: 10^−${a}. Tomato juice: 10^−${b}.`), st("Divide.", `{10^−${a}/10^−${b}} = 10^(${b} − ${a}) = 10^${b - a} = ${(10 ** (b - a)).toLocaleString("en-US")}`)],
        traps: traps(frac(10 ** (b - a)), [trap(b - a, "pH is a log scale, so a difference of 1 means a factor of 10."), trap(10 * (b - a), `That's 10 × ${b - a}. It should be 10^${b - a}.`)]),
      };
    }
    if (lv === 2) {
      const k = r.int(1, 5);
      if (r.chance(0.5)) {
        const quiet = r.pick([40, 50, 60, 70]);
        return {
          prompt: `Sound level is L = 10·log({I/I_0}) decibels. A ${r.pick(["concert", "leaf blower", "subway train", "stadium crowd"])} is ${(10 ** k).toLocaleString("en-US")} times as intense as a ${quiet}-dB conversation. What is its sound level in dB?`,
          answer: num(quiet + 10 * k),
          hints: [`Multiplying the intensity by ${(10 ** k).toLocaleString("en-US")} adds 10·log(${10 ** k}) dB.`, `10·log(10^${k}) = 10 × ${k} = ${10 * k} dB.`],
          steps: [st("Extra decibels.", `10·log(${10 ** k}) = 10 × ${k} = ${10 * k}`), st("Add to the original level.", `${quiet} + ${10 * k} = ${quiet + 10 * k} dB`)],
          traps: traps(frac(quiet + 10 * k), [trap(10 * k, `That's the increase. Add it to ${quiet} dB.`), trap(quiet + k, `Multiply the log by 10: each factor of 10 adds 10 dB.`), trap(quiet * 10 ** k, "Decibels are logarithmic: multiplying intensity adds decibels.")]),
        };
      }
      const lo = r.pick([30, 40, 50, 60]);
      return {
        prompt: `Sound level is L = 10·log({I/I_0}) decibels. How many times as intense is a ${lo + 10 * k}-dB sound as a ${lo}-dB sound?`,
        answer: num(10 ** k),
        hints: ["Every 10 dB is a factor of 10 in intensity.", `The difference is ${10 * k} dB = ${k} groups of 10 dB.`],
        steps: [st("Difference in level.", `${lo + 10 * k} − ${lo} = ${10 * k} dB`), st("Convert to a log difference.", `${10 * k} ÷ 10 = ${k}, so the intensities differ by a factor of 10^${k}.`), st("Answer.", `10^${k} = ${(10 ** k).toLocaleString("en-US")} times as intense`)],
        traps: traps(frac(10 ** k), [trap(10 * k, "Decibels aren't proportional to intensity; each 10 dB multiplies it by 10."), trap(k, `That's the exponent. The factor is 10^${k}.`)]),
      };
    }
    if (r.chance(0.5)) {
      const m1 = r.int(30, 55) / 10, d = r.pick([0.5, 1.5, 2.5, 1.3, 0.7, 1.8]);
      const m2 = rnd(m1 + d, 1);
      const ans = rnd(10 ** d, 1);
      return {
        prompt: `Earthquake magnitude M = log({A/A_0}), where A is the shaking amplitude. How many times greater is the amplitude of a magnitude ${m2} quake than a magnitude ${m1} quake? Round to the nearest tenth.`,
        answer: num(ans, { tolerance: 0.15 }),
        hints: ["A difference in magnitude is a difference in log(A).", `The magnitudes differ by ${d}, so the amplitude ratio is 10^${d}.`],
        steps: [st("Subtract the magnitudes.", `${m2} − ${m1} = ${d}`), st("Undo the log.", `{A_1/A_2} = 10^${d} ≈ ${dec(ans, 1)}`)],
        traps: tolTraps(ans, 0.15, [[d * 10, `That's 10 × ${d}. The ratio is 10^${d}.`], [d, "That's the log of the ratio. Raise 10 to that power."]]),
      };
    }
    const a = r.pick([2, 3, 4, 5, 6, 8]), k = r.int(3, 9);
    const ph = rnd(k - Math.log10(a), 2);
    return {
      prompt: `pH = −log[H^+]. A sample has [H^+] = ${a} × 10^−${k}. Find its pH, rounded to the nearest hundredth.`,
      answer: num(ph, { tolerance: 0.011 }),
      hints: [`Use the product rule: log(${a} × 10^−${k}) = log ${a} + log(10^−${k}).`, `log ${a} ≈ ${dec(Math.log10(a), 4)} and log(10^−${k}) = −${k}.`],
      steps: [st("Product rule.", `log(${a} × 10^−${k}) = log ${a} − ${k} ≈ ${dec(Math.log10(a), 4)} − ${k} = ${dec(Math.log10(a) - k, 4)}`), st("Apply the negative.", `pH ≈ ${dec(ph, 2)}`), st("Sense check.", `${a} × 10^−${k} is between 10^−${k} and 10^−${k - 1}, so the pH is between ${k - 1} and ${k}. ✓`)],
      traps: tolTraps(ph, 0.011, [[k + Math.log10(a), "log of a product is a sum: log a + log 10^−k = log a − k. Then negate."], [-ph, "Remember the negative sign in the pH formula."]]),
    };
  },
};

const features: Skill = {
  id: "m4.log.features",
  title: "Key features of log graphs",
  topic: T,
  standards: ["NC.M4.AF.3.3"],
  prereqs: ["m4.log.evaluate"],
  lesson: {
    bigIdea: "y = log_b(x − h) + k has a vertical asymptote at x = h, domain x > h, range all real numbers, and passes through (h + 1, k) and (h + b, k + 1).",
    explain: [
      "The parent y = log_2(x) passes through (1, 0) and (2, 1), with the y-axis (x = 0) as a vertical asymptote. It's the reflection of y = 2^x over y = x.",
      "y = log_2(x − 3) + 1 shifts that right 3 and up 1: asymptote x = 3, domain x > 3, key points (4, 1) and (5, 2).",
      "x-intercept: set y = 0. log_2(x − 3) + 1 = 0 gives log_2(x − 3) = −1, so x − 3 = {1/2} and **x = 3.5**.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 12, yMin: -4, yMax: 5, curves: [{ expr: "log_2(x-3)+1", domain: [3.02, 12] }], vlines: [{ x: 3, dashed: true, label: "x = 3" }], points: [{ x: 4, y: 1, label: "(4, 1)" }, { x: 5, y: 2, label: "(5, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does y = log_2(x − 3) have a vertical asymptote at x = 3?", choices: ["As x gets close to 3, the input x − 3 gets close to 0, and log of a tiny positive number heads to −∞.", "Because log_2(3) = 0.", "Because the graph crosses the x-axis at 3."], correct: 0, explain: "log(input) → −∞ as the input → 0 from the right." },
    { kind: "written", prompt: "Explain how the graphs of y = 3^x and y = log_3(x) are related, and how that explains the log's domain.", keyIdeas: ["they are inverse functions", "reflections across y = x", "the exponential's range (y > 0) becomes the log's domain (x > 0)"], exemplar: "log_3(x) is the inverse of 3^x, so its graph is the reflection of 3^x across y = x. 3^x only outputs positive numbers, so after swapping x and y, log_3(x) only accepts positive inputs." },
  ],
  generate(r, lv) {
    const b = r.pick([2, 3, 10].slice(0, lv === 3 ? 2 : 3));
    const h = r.int(-4, 4), k = r.int(-3, 3);
    const inside = binom(h).replace(/[()]/g, "");
    const fx = `y = ${lg(b, inside)}${cst(k)}`;
    if (lv === 1) {
      return {
        prompt: `What is the domain of ${fx}?`,
        answer: choice(r, `x > ${ms(h)}`, [[`x > ${ms(-h)}`, `Set the input positive: ${inside} > 0.`], [`x ≥ ${ms(h)}`, `At x = ${ms(h)} the input is 0, and log(0) is undefined.`], ["all real numbers", "Logs only take positive inputs."], [`x > ${ms(k)}`, "The vertical shift doesn't affect the domain."]]),
        hints: ["The input of a log must be positive.", `Solve ${inside} > 0.`],
        steps: [st("Set the input positive.", `${inside} > 0`), st("Solve.", `x > ${ms(h)}`), st("Connection to the graph.", `The vertical asymptote is x = ${ms(h)}; the graph lives only to its right.`)],
      };
    }
    if (lv === 2) {
      const kk = -r.int(1, b === 10 ? 2 : 3);
      const ans = h + b ** -kk;
      const f2 = `y = ${lg(b, inside)}${cst(kk)}`;
      return {
        prompt: `Find the x-intercept of ${f2}.`,
        answer: num(ans, { pre: "x =" }),
        hints: ["Set y = 0 and isolate the log.", `${lg(b, inside)} = ${-kk}, so ${inside} = ${b}^${-kk}.`],
        steps: [st("Set y = 0.", `${lg(b, inside)}${cst(kk)} = 0`), st("Isolate the log.", `${lg(b, inside)} = ${-kk}`), st("Exponential form.", `${inside} = ${b}^${-kk} = ${b ** -kk}`), st("Solve.", `x = ${ms(ans)}`)],
        traps: traps(frac(ans), [trap(h + 1, `x = ${ms(h + 1)} is where the log part is 0, but the graph is shifted ${kk < 0 ? "down" : "up"}.`), trap(-h + b ** -kk, `The shift inside is to the ${h >= 0 ? "right" : "left"}: ${inside} = ${b ** -kk}.`), trap(h + b * -kk, `${b}^${-kk} is not ${b} × ${-kk}.`)]),
      };
    }
    const typed = `log_${b}(${binomExpr(h).replace(/[()]/g, "")})${k === 0 ? "" : k > 0 ? `+${k}` : k}`;
    const yLo = Math.min(k - 4, -2), yHi = Math.max(k + 4, 2);
    const other = b === 2 ? 3 : 2;
    const insideW = binom(-h).replace(/[()]/g, "");
    return {
      prompt: "Which equation matches the graph?",
      visual: { type: "plot", xMin: Math.min(h - 2, -2), xMax: h + 12, yMin: yLo, yMax: yHi, curves: [{ expr: typed, domain: [h + 0.02, h + 12] }], vlines: [{ x: h, dashed: true }], points: [{ x: h + 1, y: k }, { x: h + b, y: k + 1 }] },
      answer: choice(r, fx, [
        [`y = ${lg(b, insideW)}${cst(k)}`, `The asymptote is at x = ${ms(h)}, so the input is ${inside}.`],
        [`y = ${lg(b, inside)}${cst(-k)}`, `The point (${ms(h + 1)}, ${ms(k)}) shows the vertical shift is ${ms(k)}.`],
        [`y = ${lg(other, inside)}${cst(k)}`, `From (${ms(h + 1)}, ${ms(k)}), the graph rises 1 when x moves ${b} to the right, so the base is ${b}.`],
      ].filter((w) => w[0] !== fx) as [string, string][]),
      hints: ["The dashed line is the vertical asymptote x = h.", `The point one unit right of the asymptote, (${ms(h + 1)}, ${ms(k)}), gives k. Then see how far right you go to rise 1.`],
      steps: [st("Asymptote.", `x = ${ms(h)}, so the input is ${inside}.`), st("Vertical shift.", `At x = ${ms(h + 1)} the input is 1 and log(1) = 0, so y = k = ${ms(k)}.`), st("Base.", `The graph reaches y = ${ms(k + 1)} at x = ${ms(h + b)}, which is ${b} units right of the asymptote, so b = ${b}.`), st("Equation.", fx)],
    };
  },
};

export default [evaluate, properties, solve, expContext, scales, features] satisfies Skill[];
