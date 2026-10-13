// Unit 9: Sequences and building functions (NC.M1.F-IF.3, F-BF.1a, F-BF.1b, F-BF.2).
import { choice, expr, ms, num, poly, polyExpr, sn, trap, traps, NAMES } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { f, fracMark, lineText, lineTyped, ordinal } from "./util";

const T = "m1-sequences";

/** Explicit arithmetic rule a_n = a1 + (n − 1)d as dn + (a1 − d). */
const arithRule = (a1: number, d: number) => ({ typed: lineTyped(d, a1 - d, "n"), shown: lineText(d, a1 - d, "n") });
const seqList = (xs: number[]) => `${xs.map(f).join(", ")}, …`;

// ---------- arithmetic ----------

const arithmetic: Skill = {
  id: "m1.seq.arithmetic",
  title: "Arithmetic sequences",
  topic: T,
  standards: ["NC.M1.F-IF.3", "NC.M1.F-BF.1a"],
  prereqs: ["m1.linexp.build-linear"],
  lesson: {
    bigIdea: "An arithmetic sequence adds the same common difference d each term: a_n = a_1 + (n − 1)d. It's a linear function whose inputs are the term numbers 1, 2, 3, …",
    explain: [
      "7, 11, 15, 19, …: a_1 = 7, d = 4. The 20th term is a_20 = 7 + 19(4) = **83**.",
      "Simplify the rule: a_n = 7 + 4(n − 1) = 4n + 3. Compare with y = mx + b: slope 4, and the \"term 0\" value 3.",
      "Why n − 1? To get from a_1 to a_n you add d only (n − 1) times: to reach the 20th term you take 19 steps.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 6, yMin: 0, yMax: 30, xStep: 1, yStep: 5, points: [{ x: 1, y: 7 }, { x: 2, y: 11 }, { x: 3, y: 15 }, { x: 4, y: 19 }, { x: 5, y: 23 }] },
    tip: "The graph of a sequence is separate dots, not a connected line: there's no 2.5th term.",
  },
  why: [
    { kind: "choice", prompt: "Why is the formula a_1 + (n − 1)d and not a_1 + nd?", choices: ["From the 1st term to the nth term there are only n − 1 jumps of d.", "Because d is always 1.", "It is a_1 + nd."], correct: 0, explain: "Term 1 has had 0 jumps, term 2 has had 1, and so on." },
    { kind: "written", prompt: "Explain why an arithmetic sequence is a linear function.", keyIdeas: ["each step in n adds the same amount d", "constant rate of change is what makes a function linear", "a_n = dn + (a_1 − d) has the form mx + b"], exemplar: "Each time n goes up by 1, the term goes up by the same amount d. A constant rate of change is exactly what makes a function linear, and the rule simplifies to a_n = dn + (a_1 − d), which looks like y = mx + b with inputs restricted to whole numbers." },
  ],
  generate(r, lv) {
    const a1 = r.int(-10, 20), d = r.nonzero(-7, 9);
    const terms = [0, 1, 2, 3].map((i) => a1 + i * d);
    if (lv === 1) {
      const n = r.int(10, 40);
      const an = a1 + (n - 1) * d;
      return {
        prompt: `Find the ${ordinal(n)} term of the arithmetic sequence ${seqList(terms)}`,
        answer: num(an),
        hints: [`The common difference is ${ms(terms[1])} − ${sn(terms[0])} = ${ms(d)}.`, `a_${n} = a_1 + (${n} − 1)d.`],
        steps: [st("First term and difference.", `a_1 = ${ms(a1)}, d = ${ms(d)}`), st("Formula.", `a_${n} = ${ms(a1)} + (${n} − 1)(${ms(d)})`), st("Evaluate.", `${ms(a1)} + ${n - 1} · ${sn(d)} = ${ms(an)}`)],
        traps: traps(frac(an), [trap(a1 + n * d, `Use n − 1 = ${n - 1} jumps, not ${n}.`), trap(n * d, "Start from the first term, then add the jumps.")]),
      };
    }
    if (lv === 2) {
      const rule = arithRule(a1, d);
      return {
        prompt: `Write an explicit formula for the nth term of the arithmetic sequence ${seqList(terms)}`,
        answer: expr(rule.typed, { vars: ["n"], lhs: "a_n", display: rule.shown }),
        hints: [`a_1 = ${ms(a1)} and d = ${ms(d)}.`, `Write a_n = ${ms(a1)} + (n − 1)(${ms(d)}) and simplify.`],
        steps: [st("First term and difference.", `a_1 = ${ms(a1)}, d = ${ms(d)}`), st("Formula.", `a_n = ${ms(a1)} + ${sn(d)}(n − 1)`), st("Simplify.", `a_n = ${rule.shown}`), st("Check.", `n = 2: ${ms(d * 2 + a1 - d)} = ${ms(terms[1])} ✓`)],
      };
    }
    const nm = r.pick(NAMES);
    const i = r.int(3, 6), j = i + r.int(3, 6);
    const ai = a1 + (i - 1) * d, aj = a1 + (j - 1) * d;
    const n = r.int(20, 40);
    const an = a1 + (n - 1) * d;
    if (r.chance(0.5)) {
      return {
        prompt: `In an arithmetic sequence, a_${i} = ${ms(ai)} and a_${j} = ${ms(aj)}. Find a_${n}.`,
        answer: num(an),
        hints: [`From term ${i} to term ${j} is ${j - i} jumps of d.`, `d = (${ms(aj)} − ${sn(ai)}) ÷ ${j - i} = ${ms(d)}. Then go from a_${i} to a_${n}.`],
        steps: [st("Common difference.", `d = {${ms(aj)} − ${sn(ai)}/${j} − ${i}} = {${ms(aj - ai)}/${j - i}} = ${ms(d)}`), st(`From a_${i} to a_${n}.`, `${n - i} more jumps: a_${n} = ${ms(ai)} + ${n - i}(${ms(d)}) = ${ms(an)}`)],
        traps: traps(frac(an), [trap(ai + n * d, `From term ${i}, only ${n - i} jumps are needed.`)]),
      };
    }
    const first = r.int(12, 24), add = r.int(2, 4), rows = r.int(15, 30);
    const last = first + (rows - 1) * add;
    return {
      prompt: `An arena section has ${first} seats in row 1, and each row has ${add} more seats than the row in front of it. ${nm}'s ticket is in row ${rows}. How many seats are in that row?`,
      answer: num(last),
      hints: [`This is arithmetic with a_1 = ${first} and d = ${add}.`, `Row ${rows} is ${rows - 1} rows after row 1.`],
      steps: [st("Identify.", `a_1 = ${first}, d = ${add}`), st("Formula.", `a_${rows} = ${first} + (${rows} − 1)(${add}) = ${first} + ${(rows - 1) * add} = ${last}`)],
      traps: traps(frac(last), [trap(first + rows * add, `Row ${rows} is only ${rows - 1} rows past row 1.`)]),
    };
  },
};

// ---------- geometric ----------

const geometric: Skill = {
  id: "m1.seq.geometric",
  title: "Geometric sequences",
  topic: T,
  standards: ["NC.M1.F-IF.3", "NC.M1.F-BF.1a"],
  prereqs: ["m1.linexp.build-exp"],
  lesson: {
    bigIdea: "A geometric sequence multiplies by the same common ratio r each term: a_n = a_1 · r^(n − 1). It's an exponential function on the term numbers.",
    explain: [
      "3, 6, 12, 24, …: a_1 = 3, r = 2. a_8 = 3 · 2^7 = 3 · 128 = **384**.",
      "Ratios can be fractions: 96, 48, 24, … has r = {1/2}, so a_6 = 96({1/2})^5 = 3.",
      "Find r by dividing a term by the one before it: r = {a_2/a_1}.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is a geometric sequence an exponential function?", choices: ["Each step multiplies by the same factor r, so the nth term is a_1 times a power of r.", "Because its terms are large.", "Because it adds the same amount each time."], correct: 0, explain: "Constant ratio ↔ exponential." },
    { kind: "written", prompt: "A ball is dropped from 64 feet and each bounce reaches half the previous height. Explain how to find the height of the 5th bounce.", keyIdeas: ["geometric with first bounce 32 and r = 1/2 (or start 64 and multiply by 1/2 five times)", "multiply by 1/2 for each bounce", "5th bounce: 64(1/2)^5 = 2 feet"], exemplar: "Each bounce is half the one before, so multiply by 1/2 for each bounce. After 5 bounces the height is 64({1/2})^5 = 64 ÷ 32 = 2 feet." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a1 = r.int(1, 6) * r.sign(), rr = r.pick([2, 3, -2]);
      const n = r.int(5, 7);
      const terms = [0, 1, 2, 3].map((i) => a1 * rr ** i);
      const an = a1 * rr ** (n - 1);
      return {
        prompt: `Find the ${ordinal(n)} term of the geometric sequence ${seqList(terms)}`,
        answer: num(an),
        hints: [`The common ratio is ${ms(terms[1])} ÷ ${sn(terms[0])} = ${ms(rr)}.`, `a_${n} = a_1 · r^(${n} − 1).`],
        steps: [st("First term and ratio.", `a_1 = ${ms(a1)}, r = ${ms(rr)}`), st("Formula.", `a_${n} = ${ms(a1)} · (${ms(rr)})^${n - 1}`), st("Evaluate.", `(${ms(rr)})^${n - 1} = ${ms(rr ** (n - 1))}, × ${sn(a1)} = ${ms(an)}`)],
        traps: traps(frac(an), [trap(a1 * rr ** n, `Use the exponent n − 1 = ${n - 1}.`), trap(a1 + (n - 1) * rr, "This is geometric: multiply by r each step, don't add it.")]),
      };
    }
    if (lv === 2) {
      const a1 = r.int(2, 8), rr = r.pick([2, 3, 4, 5]);
      const terms = [0, 1, 2, 3].map((i) => a1 * rr ** i);
      return {
        prompt: `Write an explicit formula for the nth term of the geometric sequence ${seqList(terms)}`,
        answer: expr(`${a1}(${rr})^(n-1)`, { vars: ["n"], lhs: "a_n", display: `${a1}(${rr})^(n − 1)` }),
        hints: [`a_1 = ${a1}. Divide consecutive terms to find r.`, "a_n = a_1 · r^(n − 1)."],
        steps: [st("First term and ratio.", `a_1 = ${a1}, r = ${a1 * rr} ÷ ${a1} = ${rr}`), st("Formula.", `a_n = ${a1}(${rr})^(n − 1)`), st("Check.", `n = 3: ${a1}(${rr})^2 = ${terms[2]} ✓`)],
      };
    }
    const k = r.int(3, 5), rd = r.pick([2, 3]), rn = rd === 2 ? 1 : 2;
    const h0 = rd ** k * r.pick([1, 2, 3]);
    const ans = frac(h0 * rn ** k, rd ** k);
    const nm = r.pick(NAMES);
    return {
      prompt: `${nm} drops a ball from ${h0} feet. Each bounce reaches ${rn === 1 ? "half" : "two-thirds"} of the previous height. How high does it rise on the ${ordinal(k)} bounce?`,
      answer: num(ans, { unit: " ft" }),
      hints: [`Each bounce multiplies the height by ${fracMark(frac(rn, rd))}.`, `After ${k} bounces: ${h0}(${fracMark(frac(rn, rd))})^${k}.`],
      steps: [st("Ratio.", `r = ${fracMark(frac(rn, rd))}`), st(`Multiply ${k} times.`, `${h0}(${fracMark(frac(rn, rd))})^${k} = ${h0} · {${rn ** k}/${rd ** k}} = ${fracMark(ans)} ft`)],
      traps: traps(ans, [trap(frac(h0 * rn ** (k - 1), rd ** (k - 1)), `That's the ${ordinal(k - 1)} bounce. The drop isn't a bounce: the 1st bounce is already multiplied once.`)]),
    };
  },
};

// ---------- recursive and explicit ----------

const recursive: Skill = {
  id: "m1.seq.recursive",
  title: "Recursive and explicit formulas",
  topic: T,
  standards: ["NC.M1.F-BF.2", "NC.M1.F-IF.3"],
  prereqs: ["m1.seq.arithmetic", "m1.seq.geometric"],
  lesson: {
    bigIdea: "A recursive formula says how to get each term from the one before (plus a starting term). An explicit formula gives any term directly from n.",
    explain: [
      "Arithmetic: a_1 = 5, a_n = a_(n−1) + 3 (add 3 each time) ↔ a_n = 5 + 3(n − 1) = 3n + 2.",
      "Geometric: a_1 = 2, a_n = 4·a_(n−1) (multiply by 4 each time) ↔ a_n = 2(4)^(n − 1).",
      "Recursive is great for the next term; explicit is better for the 100th term.",
    ],
    tip: "A recursive formula must include the first term, or it doesn't tell you where to start.",
  },
  why: [
    { kind: "choice", prompt: "Why does a recursive formula need a starting value like a_1 = 5?", choices: ["\"Add 3 to the previous term\" describes many sequences; the first term picks one.", "Because recursive formulas only work for n = 1.", "It doesn't need one."], correct: 0, explain: "5, 8, 11, … and 0, 3, 6, … both add 3." },
    { kind: "written", prompt: "Explain why finding a_100 is easier with an explicit formula than with a recursive one.", keyIdeas: ["recursive needs every term before it (99 steps)", "explicit lets you substitute n = 100 directly", "one calculation instead of many"], exemplar: "With the recursive formula you'd have to compute a_2, a_3, … all the way to a_99 first. The explicit formula lets you plug in n = 100 and get the answer in one step." },
  ],
  generate(r, lv) {
    const geo = r.chance(0.5);
    const a1 = geo ? r.int(1, 5) : r.int(-8, 15);
    const d = geo ? r.pick([2, 3]) : r.nonzero(-6, 8);
    const recText = geo ? `a_1 = ${ms(a1)}, a_n = ${d}·a_(n−1)` : `a_1 = ${ms(a1)}, a_n = a_(n−1) ${d < 0 ? "−" : "+"} ${Math.abs(d)}`;
    if (lv === 1) {
      const k = r.int(4, 6);
      const seq = [a1];
      for (let i = 1; i < k; i++) seq.push(geo ? seq[i - 1] * d : seq[i - 1] + d);
      return {
        prompt: `A sequence is defined by ${recText} for n ≥ 2. Find a_${k}.`,
        answer: num(seq[k - 1]),
        hints: ["Start from a_1 and apply the rule to get a_2, then a_3, and so on.", geo ? `Multiply by ${d} each time.` : `${d < 0 ? "Subtract" : "Add"} ${Math.abs(d)} each time.`],
        steps: [st("Apply the rule term by term.", seq.map((v, i) => `a_${i + 1} = ${ms(v)}`).join(", "))],
        traps: traps(frac(seq[k - 1]), [trap(seq[k - 2], `That's a_${k - 1}. One more step.`), ...(k < 8 ? [trap(geo ? seq[k - 1] * d : seq[k - 1] + d, `That's a_${k + 1}. Count again: a_1 is the first term.`)] : [])]),
      };
    }
    const expText = geo ? `a_n = ${a1 === 1 ? "" : a1}(${d})^(n − 1)` : `a_n = ${lineText(d, a1 - d, "n")}`;
    if (lv === 2) {
      const wrong: [string, string][] = geo
        ? [[`a_1 = ${a1 * d}, a_n = ${d}·a_(n−1)`, `Check a_1: substitute n = 1 into the explicit formula.`], [`a_1 = ${ms(a1)}, a_n = a_(n−1) + ${d}`, "Each term is multiplied by the ratio, not added to it."], [`a_1 = ${ms(a1)}, a_n = ${a1}·a_(n−1)`, `The ratio is ${d}, not the first term.`]]
        : [[`a_1 = ${ms(a1 + d)}, a_n = a_(n−1) ${d < 0 ? "−" : "+"} ${Math.abs(d)}`, "Check a_1: substitute n = 1 into the explicit formula."], [`a_1 = ${ms(a1)}, a_n = ${d}·a_(n−1)`, "The terms go up by the same amount, so add, don't multiply."], [`a_1 = ${ms(a1)}, a_n = a_(n−1) ${a1 - d < 0 ? "−" : "+"} ${Math.abs(a1 - d)}`, `The amount added each time is the coefficient of n, ${ms(d)}.`]];
      return {
        prompt: `Which recursive formula describes the same sequence as ${expText}?`,
        answer: choice(r, recText, wrong),
        hints: ["Find a_1 by substituting n = 1.", geo ? "Find the ratio: what is each term multiplied by?" : "Find the common difference: the coefficient of n."],
        steps: [st("First term.", `a_1 = ${ms(a1)}`), st(geo ? "Ratio." : "Difference.", geo ? `r = ${d}` : `d = ${ms(d)}`), st("Recursive formula.", recText)],
      };
    }
    return {
      prompt: `A sequence is defined by ${recText} for n ≥ 2. Write an explicit formula for a_n.`,
      answer: geo ? expr(`${a1}(${d})^(n-1)`, { vars: ["n"], lhs: "a_n", display: `${a1}(${d})^(n − 1)` }) : expr(lineTyped(d, a1 - d, "n"), { vars: ["n"], lhs: "a_n", display: lineText(d, a1 - d, "n") }),
      hints: [geo ? "Multiplying by the same number each time: geometric." : "Adding the same number each time: arithmetic.", geo ? "a_n = a_1 · r^(n − 1)." : "a_n = a_1 + (n − 1)d, then simplify."],
      steps: [st("Type.", geo ? `Geometric, a_1 = ${a1}, r = ${d}` : `Arithmetic, a_1 = ${ms(a1)}, d = ${ms(d)}`), st("Explicit formula.", geo ? `a_n = ${a1}(${d})^(n − 1)` : `a_n = ${ms(a1)} + ${sn(d)}(n − 1) = ${lineText(d, a1 - d, "n")}`)],
    };
  },
};

// ---------- identify ----------

const identify: Skill = {
  id: "m1.seq.identify",
  title: "Arithmetic, geometric, or neither?",
  topic: T,
  standards: ["NC.M1.F-IF.3"],
  prereqs: ["m1.seq.arithmetic", "m1.seq.geometric"],
  lesson: {
    bigIdea: "Check consecutive differences (constant → arithmetic, a linear function) and ratios (constant → geometric, an exponential function).",
    explain: [
      "2, 9, 16, 23: differences all 7 → arithmetic. Graph: dots on a line.",
      "2, 6, 18, 54: ratios all 3 → geometric. Graph: dots on an exponential curve.",
      "1, 4, 9, 16: differences 3, 5, 7 and ratios 4, 2.25, … aren't constant → neither (these are squares, a quadratic pattern).",
    ],
  },
  why: [
    { kind: "choice", prompt: "A sequence's graph is a set of dots lying on a straight line. What kind of sequence is it?", choices: ["Arithmetic: equal steps in n give equal changes in the terms.", "Geometric", "Neither"], correct: 0, explain: "Constant difference = constant slope." },
    { kind: "written", prompt: "Can a sequence be both arithmetic and geometric? Explain with an example.", keyIdeas: ["a constant sequence like 5, 5, 5, …", "difference 0 and ratio 1", "so yes, but only when it's constant (nonzero)"], exemplar: "Yes: 5, 5, 5, 5, … has a common difference of 0 and a common ratio of 1. Any other sequence can't have both, because adding the same amount and multiplying by the same factor give different patterns." },
  ],
  generate(r, lv) {
    const kind = r.pick(["arith", "geo", "neither"] as const);
    let seq: number[];
    const a = r.int(2, 9);
    if (kind === "arith") { const d = r.nonzero(-6, 9); seq = [0, 1, 2, 3, 4].map((i) => a + i * d); }
    else if (kind === "geo") { const q = r.pick([2, 3, -2]); seq = [0, 1, 2, 3, 4].map((i) => a * q ** i); }
    else { seq = r.chance(0.5) ? [1, 2, 3, 4, 5].map((i) => i * i + a) : [0, 1, 2, 3, 4].map((i) => a + (i * (i + 1)) / 2); }
    if (lv < 3) {
      const names = { arith: lv === 1 ? "Arithmetic" : "Arithmetic, so it's a linear function of n", geo: lv === 1 ? "Geometric" : "Geometric, so it's an exponential function of n", neither: "Neither" };
      const diffs = seq.slice(1).map((v, i) => v - seq[i]);
      return {
        prompt: `Is the sequence ${seqList(seq)} arithmetic, geometric, or neither?`,
        answer: choice(r, names[kind], (Object.keys(names) as (keyof typeof names)[]).filter((k) => k !== kind).map((k) => [names[k], k === "arith" ? `Differences: ${diffs.map(ms).join(", ")}.` : k === "geo" ? "Check the ratios: divide each term by the one before." : "Check the differences and the ratios: one of them is constant."] as [string, string]), true),
        hints: ["Subtract consecutive terms. Are the differences equal?", "Divide consecutive terms. Are the ratios equal?"],
        steps: [st("Differences.", diffs.map(ms).join(", ")), st("Conclude.", kind === "arith" ? `Constant difference ${ms(diffs[0])}: arithmetic.` : kind === "geo" ? `Constant ratio ${ms(seq[1] / seq[0])}: geometric.` : "No constant difference or ratio: neither.")],
      };
    }
    const shownKind = r.pick(["arith", "geo"] as const);
    const pts = shownKind === "arith" ? [1, 2, 3, 4, 5].map((n) => ({ x: n, y: 3 * n + 1 })) : [1, 2, 3, 4, 5].map((n) => ({ x: n, y: 2 ** n }));
    const visual: Visual = { type: "plot", xMin: 0, xMax: 6, yMin: 0, yMax: shownKind === "arith" ? 20 : 36, xStep: 1, yStep: shownKind === "arith" ? 2 : 4, points: pts };
    const right = shownKind === "arith" ? "An arithmetic sequence: the points lie on a line" : "A geometric sequence: the points follow an exponential curve";
    return {
      prompt: "The graph shows the first five terms of a sequence (n on the horizontal axis). What kind of sequence is it?",
      visual,
      answer: choice(r, right, [[shownKind === "arith" ? "A geometric sequence: the points follow an exponential curve" : "An arithmetic sequence: the points lie on a line", "Look at how the heights change: by equal amounts or by equal factors?"], ["A continuous linear function, because the points can be connected", "A sequence only has whole-number terms, so its graph is separate dots."]]),
      hints: ["Read the five heights.", "Do they go up by the same amount (arithmetic) or by the same factor (geometric)?"],
      steps: [st("Heights.", pts.map((p) => p.y).join(", ")), st("Pattern.", shownKind === "arith" ? "+3 each time: arithmetic (linear)." : "×2 each time: geometric (exponential).")],
    };
  },
};

// ---------- combining functions ----------

const combine: Skill = {
  id: "m1.seq.combine",
  title: "Combine functions",
  topic: T,
  standards: ["NC.M1.F-BF.1b", "NC.M1.F-BF.1", "NC.M1.A-APR.1"],
  prereqs: ["m1.quad.multiply", "m1.func.evaluate"],
  lesson: {
    bigIdea: "New functions can be built by adding, subtracting or multiplying functions: (f + g)(x) = f(x) + g(x), and (f·g)(x) = f(x) · g(x).",
    explain: [
      "Profit = revenue − cost. If R(x) = 25x and C(x) = 8x + 300, then P(x) = R(x) − C(x) = 25x − (8x + 300) = **17x − 300**.",
      "Revenue = price × quantity. If a $10 ticket price goes up $1 for each step x, and 200 − 10x tickets sell, then R(x) = (10 + x)(200 − 10x) = −10x^2 + 100x + 2000.",
      "Adding a linear and an exponential function keeps both pieces: f(x) = 2^x and g(x) = 3x give (f + g)(x) = 2^x + 3x.",
    ],
    tip: "When subtracting a function, put it in parentheses so the minus sign reaches every term.",
  },
  why: [
    { kind: "choice", prompt: "Why is profit P(x) = R(x) − C(x)?", choices: ["Profit is the money taken in minus the money spent, for the same number of items x.", "Because cost is always larger.", "Because you multiply revenue by cost."], correct: 0, explain: "Same input x, combine outputs." },
    { kind: "written", prompt: "Explain why multiplying two linear functions gives a quadratic function.", keyIdeas: ["each linear factor has an x-term", "x times x gives x^2", "the product has degree 2: a quadratic"], exemplar: "Each linear function has an x-term. When you multiply them, the two x-terms multiply to make an x^2 term, so the product has degree 2, which is a quadratic function." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m1 = r.nonzero(-6, 8), b1 = r.int(-9, 9), m2 = r.nonzero(-6, 8), b2 = r.int(-9, 9);
      const sub = r.chance(0.5);
      const m = sub ? m1 - m2 : m1 + m2, b = sub ? b1 - b2 : b1 + b2;
      return {
        prompt: `f(x) = ${lineText(m1, b1)} and g(x) = ${lineText(m2, b2)}. Write ${sub ? "f(x) − g(x)" : "f(x) + g(x)"} in simplest form.`,
        answer: expr(m === 0 ? String(b) : lineTyped(m, b), { form: "expanded", display: m === 0 ? ms(b) : lineText(m, b) }),
        hints: [sub ? "Put g(x) in parentheses and distribute the minus sign." : "Add like terms.", "Combine the x-terms, then the constants."],
        steps: [st("Write it out.", `(${lineText(m1, b1)}) ${sub ? "−" : "+"} (${lineText(m2, b2)})`), st("Combine.", `x-terms: ${ms(m1)} ${sub ? "−" : "+"} ${sn(m2)} = ${ms(m)}; constants: ${ms(b1)} ${sub ? "−" : "+"} ${sn(b2)} = ${ms(b)}`), st("Result.", m === 0 ? ms(b) : lineText(m, b))],
      };
    }
    if (lv === 2) {
      const a = r.nonzero(-4, 4), b = r.nonzero(-7, 7), c = r.nonzero(-4, 4), d = r.nonzero(-7, 7);
      const res = [a * c, a * d + b * c, b * d];
      return {
        prompt: `f(x) = ${lineText(a, b)} and g(x) = ${lineText(c, d)}. Write f(x) · g(x) in standard form.`,
        answer: expr(polyExpr(res), { form: "expanded", display: poly(res) }),
        hints: ["Multiply each term of f(x) by each term of g(x).", "Combine the two x-terms."],
        steps: [st("Multiply.", `(${lineText(a, b)})(${lineText(c, d)})`), st("Four products.", `${ms(a * c)}x^2, ${ms(a * d)}x, ${ms(b * c)}x, ${ms(b * d)}`), st("Result.", poly(res))],
      };
    }
    if (r.chance(0.5)) {
      const p0 = r.pick([8, 10, 12, 15]), q0 = r.pick([200, 240, 300]), k = r.pick([5, 10]);
      // R(x) = (p0 + x)(q0 − kx)
      const res = [-k, q0 - k * p0, p0 * q0];
      return {
        prompt: `A school dance charges $${p0} per ticket and expects ${q0} students. For each $1 increase in price (x), ${k} fewer students buy tickets. Write the revenue R(x) = (price)(number of tickets) in standard form.`,
        answer: expr(polyExpr(res), { form: "expanded", display: poly(res) }),
        hints: [`Price: ${p0} + x. Tickets: ${q0} − ${k}x.`, `Multiply (${p0} + x)(${q0} − ${k}x) and combine like terms.`],
        steps: [st("Price and quantity.", `p(x) = ${p0} + x, q(x) = ${q0} − ${k}x`), st("Multiply.", `${p0 * q0} − ${p0 * k}x + ${q0}x − ${k}x^2`), st("Standard form.", `R(x) = ${poly(res)}`)],
      };
    }
    const price = r.pick([18, 22, 25, 30]), cost = r.pick([6, 8, 10]), fixed = r.pick([150, 240, 400]);
    const nm = r.pick(NAMES);
    return {
      prompt: `${nm} sells custom phone cases for $${price} each. Materials cost $${cost} per case plus $${fixed} for a printer rental. Write the profit P(x) = R(x) − C(x) for x cases.`,
      answer: expr(`${price - cost}x-${fixed}`, { form: "expanded", lhs: "P(x)", display: `${price - cost}x − ${fixed}` }),
      hints: [`Revenue R(x) = ${price}x. Cost C(x) = ${cost}x + ${fixed}.`, "Subtract the whole cost function: distribute the minus sign."],
      steps: [st("Revenue and cost.", `R(x) = ${price}x; C(x) = ${cost}x + ${fixed}`), st("Subtract.", `P(x) = ${price}x − (${cost}x + ${fixed}) = ${price}x − ${cost}x − ${fixed}`), st("Simplify.", `P(x) = ${price - cost}x − ${fixed}`)],
    };
  },
};

export default [arithmetic, geometric, recursive, identify, combine];
