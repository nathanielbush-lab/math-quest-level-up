// Unit 13: Recursive functions (PC.F.6.1, PC.F.6.2).
import { choice, cst, ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";

const T = "pc-recursive";

const recText = (r: number, d: number) => `${r === 1 ? "" : r === -1 ? "−" : `${ms(r)}`}f(n − 1)${cst(d)}`;
const run = (a: number, r: number, d: number, n: number) => { const out = [a]; for (let i = 1; i < n; i++) out.push(r * out[i - 1] + d); return out; };

const evaluate: Skill = {
  id: "pc.recursive.evaluate",
  title: "Evaluate a recursive function",
  topic: T,
  standards: ["PC.F.6.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A recursive function gives a starting value and a rule that builds each term from the one before it. To find a later term, apply the rule one step at a time.",
    explain: [
      "f(1) = 5 and f(n) = 2f(n − 1) − 3 for n ≥ 2.",
      "f(2) = 2(5) − 3 = 7, f(3) = 2(7) − 3 = 11, f(4) = 2(11) − 3 = **19**.",
      "Some rules use two earlier terms: f(n) = f(n − 1) + f(n − 2) (like the Fibonacci numbers) needs two starting values.",
    ],
    visual: { type: "table", headers: ["n", "1", "2", "3", "4"], rows: [["f(n)", 5, 7, 11, 19]] },
    tip: "Write each term on its own line; recursive problems punish skipped steps.",
  },
  why: [
    { kind: "choice", prompt: "Why does a recursive definition need a starting value like f(1) = 5?", choices: ["The rule only says how to get the next term from the previous one; without a first term there's nothing to build from.", "Because n starts at 1.", "It doesn't; the rule is enough.", "Because recursive functions are always increasing."], correct: 0, explain: "f(n) = 2f(n − 1) − 3 describes infinitely many sequences, one for each possible starting value." },
    { kind: "written", prompt: "Explain why computing f(50) from a recursive rule is slow, and what kind of formula would help.", keyIdeas: ["you must compute every earlier term first", "49 steps", "an explicit formula gives f(n) directly from n"], exemplar: "To get f(50) recursively, you need f(49), which needs f(48), and so on back to f(1): 49 separate steps. An explicit formula in terms of n would let you plug in 50 and get the answer directly." },
  ],
  generate(r, lv) {
    if (lv === 3 && r.chance(0.5)) {
      const a = r.int(1, 5), b = r.int(1, 6);
      const seq = [a, b];
      const k = r.int(5, 7);
      for (let i = 2; i < k; i++) seq.push(seq[i - 1] + seq[i - 2]);
      return {
        prompt: `f(1) = ${a}, f(2) = ${b} and f(n) = f(n − 1) + f(n − 2) for n ≥ 3. Find f(${k}).`,
        answer: num(seq[k - 1]),
        hints: ["Each term is the sum of the two terms before it.", `f(3) = ${b} + ${a} = ${seq[2]}. Keep going.`],
        steps: seq.slice(2).map((v, i) => st(`f(${i + 3}).`, `f(${i + 2}) + f(${i + 1}) = ${seq[i + 1]} + ${seq[i]} = ${v}`)),
        traps: traps(frac(seq[k - 1]), [trap(seq[k - 2], `That's f(${k - 1}). Go one more step.`)]),
      };
    }
    const a = r.int(-4, 8);
    const rr = lv === 1 ? 1 : r.pick([2, 3, -2, 2]);
    const d = lv === 1 ? r.nonzero(-6, 9) : r.int(-5, 5);
    const k = lv === 1 ? r.int(4, 6) : 4;
    const seq = run(a, rr, d, k);
    return {
      prompt: `f(1) = ${ms(a)} and f(n) = ${recText(rr, d)} for n ≥ 2. Find f(${k}).`,
      answer: num(seq[k - 1]),
      hints: [`Start with f(1) = ${ms(a)} and apply the rule to get f(2).`, `f(2) = ${rr === 1 ? "" : `${ms(rr)} · `}${sn(a)}${cst(d)} = ${ms(seq[1])}. Repeat until f(${k}).`],
      steps: seq.slice(1).map((v, i) => st(`f(${i + 2}).`, `${rr === 1 ? "" : `${ms(rr)} · `}${sn(seq[i])}${cst(d)} = ${ms(v)}`)),
      traps: traps(frac(seq[k - 1]), [trap(seq[k - 2], `That's f(${k - 1}). Apply the rule once more.`), trap(rr * seq[k - 1] + d, `That's f(${k + 1}): f(1) is the first term, so you need ${k - 1} steps.`)]),
    };
  },
};

const fromExplicit: Skill = {
  id: "pc.recursive.from-explicit",
  title: "Write a recursive rule from an explicit formula",
  topic: T,
  standards: ["PC.F.6.1"],
  prereqs: ["pc.recursive.evaluate"],
  lesson: {
    bigIdea: "Find the first term from the formula, then ask how each term relates to the one before: a constant difference gives f(n) = f(n − 1) + d; a constant ratio gives f(n) = r · f(n − 1).",
    explain: [
      "f(n) = 7 + 4(n − 1): f(1) = 7, and each step adds 4. Recursive: **f(1) = 7, f(n) = f(n − 1) + 4**.",
      "f(n) = 3 · 2^n: f(1) = 6, and each step multiplies by 2. Recursive: **f(1) = 6, f(n) = 2f(n − 1)**.",
      "f(n) = n^2: differences are 3, 5, 7, … which grow, so the rule involves n: f(n) = f(n − 1) + 2n − 1.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is the recursive rule for f(n) = 5 · 3^n multiplication by 3, not adding?", choices: ["f(n) ÷ f(n − 1) = 3^n ÷ 3^(n−1) = 3 for every n, so each term is 3 times the last.", "Because 5 + 3 = 8.", "Because the base is 5.", "It's adding 3."], correct: 0, explain: "Exponential formulas have a constant ratio between consecutive terms." },
    { kind: "written", prompt: "Explain how to check that f(1) = 2, f(n) = f(n − 1) + 5 matches the explicit formula f(n) = 5n − 3.", keyIdeas: ["5(1) − 3 = 2 matches f(1)", "consecutive explicit terms differ by 5", "so both rules generate the same sequence"], exemplar: "The explicit formula gives f(1) = 5 − 3 = 2, matching the start. Going from n − 1 to n increases 5n − 3 by 5, so each term is 5 more than the previous, exactly what the recursive rule says." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const c = r.int(-3, 4);
      const correct = "f(n) = f(n − 1) + 2n − 1";
      return {
        prompt: `f(n) = n^2${cst(c)}. Which recursive rule (with f(1) = ${1 + c}) matches it?`,
        answer: choice(r, correct, [["f(n) = f(n − 1) + 2", "The differences 3, 5, 7, … grow, so they can't all be 2."], ["f(n) = 2f(n − 1)", "The terms aren't doubling: check f(2) and f(3)."], ["f(n) = f(n − 1) + n", "Check: f(2) − f(1) = 3, but this rule adds 2."], ["f(n) = f(n − 1) + 2n + 1", "Check n = 2: f(2) − f(1) = 3, but 2(2) + 1 = 5."]]),
        hints: ["List the first few terms and their differences.", "f(n) − f(n − 1) = n^2 − (n − 1)^2. Expand it."],
        steps: [st("First terms.", `${[1, 2, 3, 4].map((n) => n * n + c).join(", ")}`), st("Difference.", "n^2 − (n − 1)^2 = n^2 − (n^2 − 2n + 1) = 2n − 1"), st("Rule.", `f(1) = ${1 + c}, ${correct}`)],
      };
    }
    if (lv === 1 || r.chance(0.4)) {
      const a = r.int(-6, 10), d = r.nonzero(-6, 7);
      const form = r.chance(0.5) ? `f(n) = ${ms(a)}${d < 0 ? " − " : " + "}${Math.abs(d)}(n − 1)` : `f(n) = ${ms(d)}n${cst(a - d)}`;
      return {
        prompt: `${form}. Write it recursively as f(n) = f(n − 1) + d: give f(1) and d.`,
        answer: { kind: "multi", fields: [{ value: frac(a), pre: "f(1) =" }, { value: frac(d), pre: "d =" }] },
        hints: ["Plug in n = 1 for the first term.", "Find f(2) − f(1): that's the amount added each time."],
        steps: [st("First term.", `f(1) = ${ms(a)}`), st("Common difference.", `f(2) = ${ms(a + d)}, so each step adds ${ms(d)}.`), st("Recursive rule.", `f(1) = ${ms(a)}, f(n) = ${recText(1, d)}`)],
      };
    }
    const c = r.pick([1, 2, 3, 5, -2]), b = r.pick([2, 3, 4, -2]);
    const a = c * b;
    return {
      prompt: `f(n) = ${c === 1 ? "" : c === -1 ? "−" : `${ms(c)} · `}${b < 0 ? `(${ms(b)})` : b}^n. Write it recursively as f(n) = r · f(n − 1): give f(1) and r.`,
      answer: { kind: "multi", fields: [{ value: frac(a), pre: "f(1) =" }, { value: frac(b), pre: "r =" }] },
      hints: [`f(1) = ${ms(c)} · ${sn(b)}^1.`, "Divide f(2) by f(1) to get the ratio."],
      steps: [st("First term.", `f(1) = ${ms(c)} · ${sn(b)} = ${ms(a)}`), st("Common ratio.", `f(2) = ${ms(a * b)}, and ${ms(a * b)} ÷ ${sn(a)} = ${ms(b)}.`), st("Recursive rule.", `f(1) = ${ms(a)}, f(n) = ${recText(b, 0)}`)],
    };
  },
};

const fromTable: Skill = {
  id: "pc.recursive.from-table",
  title: "Write a recursive rule from data",
  topic: T,
  standards: ["PC.F.6.2"],
  prereqs: ["pc.recursive.evaluate"],
  lesson: {
    bigIdea: "Look at how consecutive terms are related: constant differences → add d; constant ratios → multiply by r; neither → try f(n) = r · f(n − 1) + d and solve for r and d using two pairs of terms.",
    explain: [
      "3, 7, 11, 15: differences are all 4, so f(1) = 3, f(n) = f(n − 1) + 4.",
      "2, 6, 18, 54: ratios are all 3, so f(1) = 2, f(n) = 3f(n − 1).",
      "1, 4, 13, 40: neither. Try f(n) = r · f(n − 1) + d: 4 = r + d and 13 = 4r + d. Subtract: 9 = 3r, r = 3, d = 1. Check: 3(13) + 1 = 40 ✓.",
    ],
    visual: { type: "table", headers: ["n", "1", "2", "3", "4"], rows: [["f(n)", 1, 4, 13, 40]] },
  },
  why: [
    { kind: "choice", prompt: "For 1, 4, 13, 40, why do you need two equations to find r and d?", choices: ["There are two unknowns, so you need two independent facts about how terms connect.", "Because there are two rules.", "Because the sequence is arithmetic.", "One equation is always enough."], correct: 0, explain: "Each consecutive pair gives an equation like f(n) = r · f(n − 1) + d. Two unknowns need two equations." },
    { kind: "written", prompt: "A sequence is 5, 9, 17, 33. Explain how you know it is not arithmetic or geometric, and find a recursive rule.", keyIdeas: ["differences 4, 8, 16 aren't constant", "ratios 9/5, 17/9 aren't equal", "f(n) = 2f(n − 1) − 1 works", "check each term"], exemplar: "The differences are 4, 8, 16, not constant, so it isn't arithmetic; 9/5 and 17/9 aren't equal, so it isn't geometric. Try f(n) = r f(n − 1) + d: 9 = 5r + d and 17 = 9r + d give r = 2, d = −1. Check: 2(17) − 1 = 33 ✓. So f(1) = 5, f(n) = 2f(n − 1) − 1." },
  ],
  generate(r, lv) {
    const a = r.int(1, 6);
    const [rr, d] = lv === 1 ? [1, r.nonzero(-5, 8)] : lv === 2 ? [r.pick([2, 3, -2]), 0] : [r.pick([2, 3]), r.nonzero(-4, 4)];
    const seq = run(a, rr, d, 5);
    const table = { type: "table" as const, headers: ["n", "1", "2", "3", "4", "5"], rows: [["f(n)", ...seq]] };
    if (lv === 1) {
      return {
        prompt: "The table shows a sequence. Write it recursively as f(n) = f(n − 1) + d: give f(1) and d.",
        visual: table,
        answer: { kind: "multi", fields: [{ value: frac(a), pre: "f(1) =" }, { value: frac(d), pre: "d =" }] },
        hints: ["Subtract consecutive terms.", `${ms(seq[1])} − ${sn(seq[0])} = ${ms(d)}. Is it the same every time?`],
        steps: [st("Differences.", seq.slice(1).map((v, i) => `${ms(v)} − ${sn(seq[i])} = ${ms(d)}`).join("; ")), st("Rule.", `f(1) = ${a}, f(n) = ${recText(1, d)}`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: "The table shows a sequence. Write it recursively as f(n) = r · f(n − 1): give f(1) and r.",
        visual: table,
        answer: { kind: "multi", fields: [{ value: frac(a), pre: "f(1) =" }, { value: frac(rr), pre: "r =" }] },
        hints: ["The differences aren't constant. Try dividing consecutive terms.", `${ms(seq[1])} ÷ ${sn(seq[0])} = ${ms(rr)}.`],
        steps: [st("Ratios.", seq.slice(1).map((v, i) => `${ms(v)} ÷ ${sn(seq[i])} = ${ms(rr)}`).join("; ")), st("Rule.", `f(1) = ${a}, f(n) = ${recText(rr, 0)}`)],
      };
    }
    return {
      prompt: "The table shows a sequence that is neither arithmetic nor geometric. It follows f(n) = r · f(n − 1) + d. Find r and d.",
      visual: table,
      answer: { kind: "multi", fields: [{ value: frac(rr), pre: "r =" }, { value: frac(d), pre: "d =" }] },
      hints: [`Use two pairs: ${seq[1]} = ${seq[0]}r + d and ${seq[2]} = ${seq[1]}r + d.`, `Subtract the equations: ${seq[2] - seq[1]} = ${seq[1] - seq[0]}r.`],
      steps: [st("Two equations.", `${seq[1]} = ${seq[0]}r + d; ${seq[2]} = ${seq[1]}r + d`), st("Subtract.", `${seq[2] - seq[1]} = ${seq[1] - seq[0]}r, so r = ${rr}`), st("Find d.", `d = ${seq[1]} − ${rr} · ${sn(seq[0])} = ${ms(d)}`), st("Check.", `${rr} · ${sn(seq[3])}${cst(d)} = ${seq[4]} ✓`)],
    };
  },
};

const context: Skill = {
  id: "pc.recursive.context",
  title: "Recursive models in context",
  topic: T,
  standards: ["PC.F.6.1", "PC.F.6.2"],
  prereqs: ["pc.recursive.from-explicit"],
  lesson: {
    bigIdea: "Many real situations are naturally recursive: 'next = this much of now, plus a new amount.' Medicine levels, savings with deposits and loan balances all follow A(n) = r · A(n − 1) + d.",
    explain: [
      "A patient takes 200 mg every 6 hours, and 40% of the drug is still in the body when the next dose is taken. A(1) = 200, A(n) = 0.4A(n − 1) + 200.",
      "A(2) = 0.4(200) + 200 = 280 mg, A(3) = 0.4(280) + 200 = 312 mg. The level climbs toward a steady value where A = 0.4A + 200, A ≈ 333 mg.",
      "Savings: you have $500, earn 1% per month and deposit $50 monthly: B(n) = 1.01B(n − 1) + 50.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In A(n) = 0.4A(n − 1) + 200, why does the 0.4 multiply the previous amount instead of the new dose?", choices: ["40% of what was already in the body is left; the new 200 mg dose is added on top at full strength.", "Because 0.4 is the dose.", "Because the new dose decays immediately.", "It should multiply the 200."], correct: 0, explain: "Between doses, the old drug decays to 40%. The fresh dose hasn't had time to decay yet, so it's added in full." },
    { kind: "written", prompt: "For A(n) = 0.5A(n − 1) + 100 with A(1) = 100, explain why the amount levels off instead of growing forever.", keyIdeas: ["each step half of the current amount disappears", "the loss grows as the amount grows", "it levels off where the loss equals the dose: A = 0.5A + 100 → A = 200"], exemplar: "Each period the body clears half of whatever is there, so the bigger the amount, the more is lost. Eventually the amount lost (half of A) equals the 100 added. That happens when A = 0.5A + 100, so A = 200 mg, and the level stays near there." },
  ],
  generate(r, lv) {
    const med = r.chance(0.5);
    if (med) {
      const dose = r.pick([100, 200, 250, 400, 500]), keep = r.pick([0.2, 0.25, 0.4, 0.5]);
      if (lv === 1) {
        return {
          prompt: `A patient takes ${dose} mg of a medicine every 4 hours. By the time of each dose, ${keep * 100}% of the previous amount is still in the body. Which rule gives the amount A(n) right after the nth dose?`,
          answer: choice(r, `A(1) = ${dose}, A(n) = ${keep}A(n − 1) + ${dose}`, [[`A(1) = ${dose}, A(n) = ${keep}(A(n − 1) + ${dose})`, "The new dose is taken after the decay, so it isn't multiplied by the percent."], [`A(1) = ${dose}, A(n) = ${1 - keep}A(n − 1) + ${dose}`, `${keep * 100}% remains, so multiply by ${keep}, not ${Math.round((1 - keep) * 100) / 100}.`], [`A(1) = ${dose}, A(n) = A(n − 1) + ${dose}`, "Some of the medicine leaves the body between doses."]]),
          hints: ["Before the new dose, what's left of the previous amount?", `${keep * 100}% of A(n − 1) is ${keep}A(n − 1). Then add the new dose.`],
          steps: [st("What remains.", `${keep}A(n − 1)`), st("Add the new dose.", `A(n) = ${keep}A(n − 1) + ${dose}`), st("Start.", `A(1) = ${dose}`)],
        };
      }
      const k = lv === 2 ? 3 : 4;
      const seq = run(dose, keep, dose, k).map((v) => Math.round(v * 1000) / 1000);
      return {
        prompt: `A(1) = ${dose} and A(n) = ${keep}A(n − 1) + ${dose} gives the mg of medicine in a patient's body right after the nth dose. Find A(${k}).`,
        answer: num(seq[k - 1], { tolerance: 0.01, unit: " mg" }),
        hints: [`A(2) = ${keep}(${dose}) + ${dose}.`, "Keep applying the rule."],
        steps: seq.slice(1).map((v, i) => st(`A(${i + 2}).`, `${keep}(${seq[i]}) + ${dose} = ${v}`)),
        traps: traps(frac(Math.round(seq[k - 1] * 1000), 1000), [trap(dose * k, "Some of each dose leaves the body; you can't just add the doses."), trap(Math.round(seq[k - 2] * 1000) / 1000, `That's A(${k - 1}).`)]),
      };
    }
    const B0 = r.pick([200, 500, 1000]), dep = r.pick([25, 50, 100]), rate = r.pick([1, 2]);
    const g = 1 + rate / 100;
    if (lv === 1) {
      return {
        prompt: `You open a savings account with $${B0}. Each month it earns ${rate}% interest, and then you deposit $${dep}. Which rule gives the balance B(n) after n months (B(0) = ${B0})?`,
        answer: choice(r, `B(n) = ${g}B(n − 1) + ${dep}`, [[`B(n) = ${rate / 100}B(n − 1) + ${dep}`, `Earning ${rate}% means you keep all of it plus ${rate}%: multiply by ${g}.`], [`B(n) = ${g}(B(n − 1) + ${dep})`, "The deposit happens after the interest is added."], [`B(n) = B(n − 1) + ${dep}`, "Don't forget the interest."]]),
        hints: ["Interest multiplies the balance by (1 + rate).", "Then add the deposit."],
        steps: [st("Interest.", `${g}B(n − 1)`), st("Deposit.", `+ ${dep}`), st("Rule.", `B(n) = ${g}B(n − 1) + ${dep}`)],
      };
    }
    const k = lv === 2 ? 2 : 3;
    const seq = [B0];
    for (let i = 1; i <= k; i++) seq.push(Math.round((g * seq[i - 1] + dep) * 100) / 100);
    return {
      prompt: `B(0) = ${B0} and B(n) = ${g}B(n − 1) + ${dep} gives a savings balance after n months. Find B(${k}), to the nearest cent.`,
      answer: num(seq[k], { tolerance: 0.011, pre: "$" }),
      hints: [`B(1) = ${g}(${B0}) + ${dep}.`, "Apply the rule again, rounding to cents each month."],
      steps: seq.slice(1).map((v, i) => st(`B(${i + 1}).`, `${g}(${seq[i]}) + ${dep} = ${v.toFixed(2)}`)),
      traps: traps(frac(Math.round(seq[k] * 100), 100), [trap(B0 + k * dep, "You left out the interest."), trap(seq[k - 1], `That's B(${k - 1}).`)]),
    };
  },
};

export default [evaluate, fromExplicit, fromTable, context];
