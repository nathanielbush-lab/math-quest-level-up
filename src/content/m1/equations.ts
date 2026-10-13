// Unit 2: Linear equations and inequalities (NC.M1.A-SSE.1, A-REI.1, A-REI.3, A-CED.1, A-CED.4).
import { binom, choice, cst, expr, money, ms, num, poly, sn, term, trap, traps, NAMES } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Answer, Skill } from "../types";
import { f } from "./util";

const T = "m1-equations";

/** "3x − 5" style display of ax + b. */
const lin = (a: number, b: number, v = "x") => (a === 0 ? ms(b) : `${term(a, v)}${cst(b)}`);

/** Worked steps for Ax + B = Cx + D (A ≠ C). */
function bothSidesSteps(A: number, B: number, C: number, D: number): string[] {
  const out: string[] = [];
  let a = A, b = B;
  if (C !== 0) {
    out.push(st(`${C > 0 ? "Subtract" : "Add"} ${term(Math.abs(C), "x")} on both sides to collect the x-terms on the left.`, `${lin(A - C, B)} = ${ms(D)}`));
    a = A - C;
  }
  if (b !== 0) out.push(st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `${term(a, "x")} = ${ms(D)}${cst(-b)} = ${ms(D - b)}`));
  if (a !== 1) out.push(st(`Divide both sides by ${ms(a)}.`, `x = ${ms(D - b)} ÷ ${sn(a)} = ${f((D - b) / a)}`));
  return out;
}

// ---------- parts of expressions ----------

const expressions: Skill = {
  id: "m1.eq.expressions",
  title: "Interpret parts of an expression",
  topic: T,
  standards: ["NC.M1.A-SSE.1", "NC.M1.A-SSE.1a", "NC.M1.A-SSE.1b"],
  prereqs: [],
  lesson: {
    bigIdea: "Every piece of an expression has a job: terms are added, factors are multiplied, and in a context each piece stands for a real quantity.",
    explain: [
      "In 4x^2 − 7x + 9 there are three **terms**. The **coefficient** of x is −7 (the sign belongs to it), and 9 is the **constant term**.",
      "In context, a coefficient is usually a rate and a constant is usually a starting amount. A tutor charging 30h + 15 dollars for h hours charges $30 per hour plus a one-time $15 fee.",
      "Bigger expressions are built from meaningful pieces. A 10 by 6 photo with a border x inches wide on every side has total area (10 + 2x)(6 + 2x): the factor 10 + 2x is the full length, since the border adds x on *both* ends.",
    ],
    tip: "Read a sign as part of the term after it: in 5 − 3x, the coefficient of x is −3.",
  },
  why: [
    { kind: "choice", prompt: "In C = 25m + 60 for a gym membership, why is 60 not multiplied by m?", choices: ["It's a one-time cost that doesn't depend on the number of months.", "Because 60 is larger than 25.", "Because constants are always the final cost."], correct: 0, explain: "Only quantities that repeat each month are multiplied by m." },
    { kind: "written", prompt: "A rectangle has length 2x + 3 and width x. Explain what x(2x + 3) represents and what each factor means.", keyIdeas: ["it is the area (length times width)", "x is the width", "2x + 3 is the length: 3 more than twice the width"], exemplar: "x(2x + 3) is the area of the rectangle, because area is width times length. The factor x is the width and 2x + 3 is the length, which is 3 more than twice the width." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.nonzero(-9, 9), b = r.nonzero(-12, 12), c = r.nonzero(-15, 15);
      const ask = r.pick(["x2", "x", "c", "terms"] as const);
      const val = ask === "x2" ? a : ask === "x" ? b : ask === "c" ? c : 3;
      const name = ask === "x2" ? "the coefficient of x^2" : ask === "x" ? "the coefficient of x" : ask === "c" ? "the constant term" : "the number of terms";
      return {
        prompt: `In the expression ${poly([a, b, c])}, what is ${name}?`,
        answer: num(val),
        hints: ["Terms are the pieces separated by + and − signs.", "Include the sign in front of a term as part of its coefficient."],
        steps: [st("List the terms with their signs.", `${term(a, "x^2")}, ${term(b, "x")}, ${ms(c)}`), st(`Pick out ${name}.`, `${ms(val)}`)],
        traps: traps(frac(val), [trap(-val, "Check the sign: the sign in front of a term belongs to its coefficient."), trap(2, "The exponent tells the power of x; the coefficient is the number multiplying it.")]),
      };
    }
    if (lv === 2) {
      const ctxs = [
        () => { const rate = r.pick([25, 30, 35, 45]), fee = r.pick([10, 15, 20, 40]); return { expr: `${rate}h + ${fee}`, desc: `A tutor charges ${rate}h + ${fee} dollars for h hours.`, rate, fee, rateMean: `The cost per hour of tutoring`, feeMean: "A one-time fee charged no matter how many hours", unitWrong: `The number of hours of tutoring` }; },
        () => { const rate = r.pick([3, 4, 6]), fee = r.pick([120, 150, 200]); return { expr: `${fee} − ${rate}d`, desc: `The amount of data left on a phone plan, in GB, is ${fee} − ${rate}d after d days.`, rate, fee, rateMean: "The number of GB used each day", feeMean: "The GB of data at the start of the month", unitWrong: "The number of days in the month" }; },
        () => { const rate = r.pick([12, 14, 15]), fee = r.pick([50, 80, 120]); return { expr: `${fee} + ${rate}w`, desc: `${r.pick(NAMES)}'s savings after w weeks are ${fee} + ${rate}w dollars.`, rate, fee, rateMean: "The amount saved each week", feeMean: "The amount saved before the first week", unitWrong: "The number of weeks saved" }; },
      ];
      const c = r.pick(ctxs)();
      const askRate = r.chance(0.5);
      const right = askRate ? c.rateMean : c.feeMean;
      return {
        prompt: `${c.desc} What does ${askRate ? c.rate : c.fee} represent?`,
        answer: choice(r, right, [[askRate ? c.feeMean : c.rateMean, askRate ? "That's the constant term, not the number multiplied by the variable." : "That's the coefficient of the variable: a rate."], [c.unitWrong, "The variable stands for that; the numbers describe how the total depends on it."], [`The total after ${askRate ? c.rate : c.fee} units`, "Neither number is a total by itself."]]),
        hints: ["A number multiplied by the variable changes the total each time the variable goes up by 1.", "A number by itself is the value when the variable is 0."],
        steps: [st("Identify the part.", askRate ? `${c.rate} multiplies the variable, so it is a rate.` : `${c.fee} stands alone, so it is the value when the variable is 0.`), st("Interpret it.", right + ".")],
      };
    }
    const tmpl = r.int(0, 3);
    if (tmpl === 0) {
      const L = r.pick([10, 12, 14, 16]), W = L - r.pick([4, 6]);
      return {
        prompt: `A ${L} ft by ${W} ft patio gets a border x ft wide on every side. Its total area is (${L} + 2x)(${W} + 2x). What does ${L} + 2x represent?`,
        answer: choice(r, "The total length of the patio with the border", [["The width of the border", "The border width is x."], ["The total area with the border", "That's the whole product, not one factor."], ["The length of the patio with the border on one end only", "The border is on both ends, which is why it's 2x."]]),
        hints: ["Area of a rectangle = length × width. Which factor is which?", "The border adds x to each end of the length."],
        steps: [st("Match the factors.", `(${L} + 2x) is a length and (${W} + 2x) is a width.`), st("Why 2x?", `The border adds x on the left and x on the right, so the full length is ${L} + 2x.`)],
      };
    }
    if (tmpl === 1) {
      const start = r.pick([200, 300, 450]), earn = r.pick([25, 30, 40]), spend = r.pick([10, 15, 18]);
      const nm = r.pick(NAMES);
      return {
        prompt: `${nm} has $${start}, earns $${earn} a week and spends $${spend} a week. After w weeks the balance is ${start} + ${earn}w − ${spend}w. What does ${earn}w − ${spend}w represent?`,
        answer: choice(r, `The total change in ${nm}'s balance after w weeks`, [["The money earned after w weeks", `That's ${earn}w alone.`], ["The balance after w weeks", `The balance includes the starting $${start}.`], ["The amount spent each week", `That's ${spend}.`]]),
        hints: [`${earn}w is money in and ${spend}w is money out.`, "Money in minus money out is the net change."],
        steps: [st("Read each piece.", `${earn}w = earned in w weeks; ${spend}w = spent in w weeks.`), st("Combine.", `${earn}w − ${spend}w = ${earn - spend}w, the net change after w weeks.`)],
      };
    }
    if (tmpl === 2) {
      const P = r.pick([4800, 12000, 25000]), g = r.pick([2, 3, 4]);
      return {
        prompt: `A town's population t years from now is modeled by ${P}(1.0${g})^t. What does ${P}(1.0${g}) represent?`,
        answer: choice(r, "The population one year from now", [["The population now", `That's ${P} by itself (t = 0).`], [`The yearly growth rate`, `The growth rate is ${g}%; ${P}(1.0${g}) is a population.`], ["The increase in population each year", "Exponential growth adds a different amount each year."]]),
        hints: [`What is t when the expression is ${P}(1.0${g})^1?`, "Each factor of 1.0" + g + " is one year of growth."],
        steps: [st("Match to t = 1.", `${P}(1.0${g})^1 = ${P}(1.0${g})`), st("Interpret.", "One year of growth applied to the current population: the population after 1 year.")],
      };
    }
    const coupon = r.pick([5, 10, 15]), tax = r.pick([5, 6, 7]);
    return {
      prompt: `A store takes $${coupon} off the price x of a jacket, then adds ${tax}% sales tax: 1.0${tax}(x − ${coupon}). What does x − ${coupon} represent?`,
      answer: choice(r, "The price after the coupon, before tax", [["The final price paid", `The final price also includes tax: that's the whole expression.`], ["The amount of tax", `Tax is 0.0${tax}(x − ${coupon}).`], ["The original price", "The original price is x."]]),
      hints: ["Work from the inside out, like the store does.", `First the $${coupon} comes off, then the tax multiplier 1.0${tax} is applied.`],
      steps: [st("Inside the parentheses.", `x − ${coupon}: the price after the $${coupon} coupon.`), st("Outside.", `Multiplying by 1.0${tax} adds ${tax}% tax to that amount.`)],
    };
  },
};

// ---------- multi-step equations ----------

const multiStep: Skill = {
  id: "m1.eq.multi-step",
  title: "Solve multi-step equations",
  topic: T,
  standards: ["NC.M1.A-REI.3", "NC.M1.A-REI.1"],
  prereqs: [],
  lesson: {
    bigIdea: "Simplify each side, collect the variable on one side, then undo operations in reverse order, always doing the same thing to both sides.",
    explain: [
      "To solve 3(x − 2) + 4 = 19: subtract 4 from both sides (3(x − 2) = 15), divide by 3 (x − 2 = 5), then add 2: **x = 7**.",
      "When x is on both sides, move one x-term first. For 7x − 5 = 3x + 11, subtract 3x from both sides: 4x − 5 = 11. Then 4x = 16, so **x = 4**.",
      "Check by substituting into the original equation: 7(4) − 5 = 23 and 3(4) + 11 = 23. ✓",
    ],
    tip: "Write each step on its own line. Most mistakes happen when two steps are squeezed into one.",
  },
  why: [
    { kind: "choice", prompt: "Why must you do the same thing to both sides of an equation?", choices: ["So both sides stay equal and the solution doesn't change.", "Because it makes the numbers smaller.", "You only need to change the side with the variable."], correct: 0, explain: "An equation is a balance: changing only one side breaks the equality." },
    { kind: "written", prompt: "Explain how you could check that x = 7 is the solution of 3(x − 2) + 4 = 19 without solving it again.", keyIdeas: ["substitute 7 for x", "evaluate the left side", "it equals 19, so the equation is true"], exemplar: "Put 7 in for x: 3(7 − 2) + 4 = 3 · 5 + 4 = 19. The left side equals the right side, so x = 7 makes the equation true." },
  ],
  generate(r, lv) {
    const x = r.nonzero(-8, 10);
    if (lv === 1) {
      const a = r.int(2, 6), h = r.nonzero(-6, 6), c = r.nonzero(-9, 9);
      const rhs = a * (x - h) + c, inner = rhs - c;
      return {
        prompt: `Solve for x: ${a}${binom(h)}${cst(c)} = ${ms(rhs)}`,
        answer: num(x),
        hints: [`Start by undoing the ${c > 0 ? "+" : "−"} ${Math.abs(c)}: ${c > 0 ? "subtract" : "add"} ${Math.abs(c)} on both sides.`, `That leaves ${a}${binom(h)} = ${ms(inner)}. Divide both sides by ${a}, then undo the ${h > 0 ? "−" : "+"} ${Math.abs(h)}.`],
        steps: [
          st(`${c > 0 ? "Subtract" : "Add"} ${Math.abs(c)} on both sides.`, `${a}${binom(h)} = ${ms(inner)}`),
          st(`Divide both sides by ${a}.`, `${binom(h).replace(/[()]/g, "")} = ${ms(inner / a)}`),
          st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)} on both sides.`, `x = ${ms(x)}`),
          st("Check.", `${a}(${ms(x)}${cst(-h)})${cst(c)} = ${a} · ${sn(x - h)}${cst(c)} = ${ms(rhs)} ✓`),
        ],
        traps: traps(frac(x), [trap((rhs + c) / a + h, `It looks like you ${c > 0 ? "added" : "subtracted"} ${Math.abs(c)} instead of undoing it.`), trap(inner / a - h, `Check the last step: to undo x ${h > 0 ? "−" : "+"} ${Math.abs(h)}, ${h > 0 ? "add" : "subtract"} ${Math.abs(h)}.`)]),
      };
    }
    if (lv === 2) {
      const A = r.nonzero(-6, 9);
      let C = r.nonzero(-6, 9);
      if (C === A) C = A - r.int(1, 4);
      if (C === 0) C = A + 1;
      const B = r.nonzero(-12, 12);
      const D = (A - C) * x + B;
      return {
        prompt: `Solve for x: ${lin(A, B)} = ${lin(C, D)}`,
        answer: num(x),
        hints: [`Get the x-terms on one side: ${C > 0 ? "subtract" : "add"} ${term(Math.abs(C), "x")} on both sides.`, `You should get ${lin(A - C, B)} = ${ms(D)}. Now it's a two-step equation.`],
        steps: [...bothSidesSteps(A, B, C, D), st("Check.", `Left: ${ms(A)} · ${sn(x)}${cst(B)} = ${ms(A * x + B)}. Right: ${ms(C)} · ${sn(x)}${cst(D)} = ${ms(C * x + D)}. ✓`)],
        traps: traps(frac(x), [...(A + C !== 0 ? [trap(frac(D - B, A + C), `When you move ${term(C, "x")} to the left, subtract it: the coefficient becomes ${A} − ${sn(C)} = ${ms(A - C)}.`)] : []), trap(frac(D + B, A - C), `To move ${ms(B)} to the right side, do the opposite operation.`)]),
      };
    }
    const a = r.int(2, 5), p = r.nonzero(-5, 5), b = r.nonzero(-9, 9);
    let c = r.int(2, 6) * r.sign();
    if (c === a) c = -a;
    const q = r.nonzero(-5, 5);
    const lhs = a * (x + p) + b;
    const d = lhs - c * (x + q);
    const A = a, B = a * p + b, C = c, D = c * q + d;
    return {
      prompt: `Solve for x: ${a}${binom(-p)}${cst(b)} = ${c}${binom(-q)}${cst(d)}`,
      answer: num(x),
      hints: ["Distribute on both sides first.", `Simplify each side: ${lin(A, B)} = ${lin(C, D)}.`, "Then collect the x-terms on one side and the numbers on the other."],
      steps: [
        st("Distribute on both sides.", `${term(a, "x")}${cst(a * p)}${cst(b)} = ${term(c, "x")}${cst(c * q)}${cst(d)}`),
        st("Combine like terms on each side.", `${lin(A, B)} = ${lin(C, D)}`),
        ...bothSidesSteps(A, B, C, D),
        st("Check.", `Both sides equal ${ms(lhs)} when x = ${ms(x)}. ✓`),
      ],
      traps: traps(frac(x), [trap(frac(q + d - p - b, A - C), "Distribute to every term inside the parentheses: the number outside multiplies both x and the constant.")]),
    };
  },
};

// ---------- justify steps ----------

const PROPS = {
  dist: "Distributive property",
  combine: "Combining like terms",
  sub: "Subtraction property of equality",
  add: "Addition property of equality",
  div: "Division property of equality",
  mult: "Multiplication property of equality",
  comm: "Commutative property of addition",
};

const justify: Skill = {
  id: "m1.eq.justify",
  title: "Justify the steps of a solution",
  topic: T,
  standards: ["NC.M1.A-REI.1"],
  prereqs: ["m1.eq.multi-step"],
  lesson: {
    bigIdea: "Each step of solving an equation is allowed by a property: rewriting one side (distributive property, combining like terms) or doing the same thing to both sides (properties of equality).",
    explain: [
      "Rewriting a side without changing its value: the **distributive property** turns 3(x + 2) into 3x + 6, and **combining like terms** turns 3x + 6 − 4 into 3x + 2.",
      "Changing both sides the same way: the **addition, subtraction, multiplication and division properties of equality** say that if a = b, then a + c = b + c, a − c = b − c, and so on.",
      "Worked example: 3(x + 2) − 4 = 17 → 3x + 6 − 4 = 17 (distributive) → 3x + 2 = 17 (combine like terms) → 3x = 15 (subtraction property of equality) → x = 5 (division property of equality).",
    ],
    tip: "Ask: did this step change *both* sides? If yes, it's a property of equality. If only one side was rewritten, it's distributive, commutative, or combining like terms.",
  },
  why: [
    { kind: "choice", prompt: "Going from 2x + 9 = 15 to 2x = 6, why is it the subtraction property of equality and not combining like terms?", choices: ["9 was subtracted from both sides; nothing on one side was merged.", "Because 9 and 15 are like terms on the same side.", "Combining like terms always changes both sides."], correct: 0, explain: "The properties of equality name operations done to both sides." },
    { kind: "written", prompt: "Explain why dividing both sides of 4x = 20 by 4 gives an equation with the same solution.", keyIdeas: ["both sides are equal numbers", "dividing equal numbers by the same nonzero number keeps them equal", "so any x that works before still works after (and vice versa)"], exemplar: "If 4x and 20 are equal, then dividing both by the same nonzero number gives equal results, so x = 5 is true exactly when 4x = 20 is true. The division property of equality keeps the solution the same." },
  ],
  generate(r, lv) {
    const a = r.int(2, 6), x = r.nonzero(-6, 8);
    let p = r.nonzero(-5, 6), c = r.nonzero(-9, 9);
    if (a * p + c === 0) c += 1;
    if (c === 0) c = 2;
    const K = a * p + c, d = a * x + K;
    const eq0 = `${a}(x${cst(p)})${cst(c)} = ${ms(d)}`;
    const lines = [
      { eq: `${term(a, "x")}${cst(a * p)}${cst(c)} = ${ms(d)}`, prop: PROPS.dist },
      { eq: `${lin(a, K)} = ${ms(d)}`, prop: PROPS.combine },
      { eq: `${term(a, "x")} = ${ms(d - K)}`, prop: K > 0 ? PROPS.sub : PROPS.add },
      { eq: `x = ${ms(x)}`, prop: PROPS.div },
    ];
    const rows = [["Given", eq0], ...lines.map((l, i) => [`Step ${i + 1}`, l.eq])];
    if (lv < 3) {
      const k = lv === 1 ? r.pick([2, 3]) : r.int(0, 3);
      const right = lines[k].prop;
      const wrong = Object.values(PROPS).filter((pr) => pr !== right).slice(0, 6);
      return {
        prompt: `A student solved ${eq0} as shown. Which property justifies Step ${k + 1}?`,
        visual: { type: "table", headers: ["", "Equation"], rows },
        answer: choice(r, right, r.shuffle(wrong).slice(0, 3).map((w) => [w, "Compare Step " + (k + 1) + " with the line before it: what exactly changed?"] as [string, string])),
        hints: [`Compare Step ${k + 1} with the line just before it.`, "Did the step change both sides, or just rewrite one side?"],
        steps: [st("Compare the lines.", `${k === 0 ? eq0 : lines[k - 1].eq} → ${lines[k].eq}`), st("Name the property.", k === 0 ? `${a} was multiplied by each term in the parentheses: ${right}.` : k === 1 ? `${ms(a * p)}${cst(c)} became ${ms(K)} on the left side only: ${right}.` : k === 2 ? `${Math.abs(K)} was ${K > 0 ? "subtracted from" : "added to"} both sides: ${right}.` : `Both sides were divided by ${a}: ${right}.`)],
      };
    }
    // Level 3: find the first error.
    const errStep = r.int(0, 3);
    const bad = [...lines.map((l) => l.eq)];
    if (errStep === 0) {
      bad[0] = `${term(a, "x")}${cst(p)}${cst(c)} = ${ms(d)}`;
      const K2 = p + c;
      bad[1] = `${lin(a, K2)} = ${ms(d)}`;
      bad[2] = `${term(a, "x")} = ${ms(d - K2)}`;
      bad[3] = `x = ${f((d - K2) / a)}`;
    } else if (errStep === 1) {
      const K2 = a * p - c;
      bad[1] = `${lin(a, K2)} = ${ms(d)}`;
      bad[2] = `${term(a, "x")} = ${ms(d - K2)}`;
      bad[3] = `x = ${f((d - K2) / a)}`;
    } else if (errStep === 2) {
      bad[2] = `${term(a, "x")} = ${ms(d + K)}`;
      bad[3] = `x = ${f((d + K) / a)}`;
    } else {
      bad[3] = `x = ${ms(d - K - a)}`;
    }
    const why = [
      `Step 1: ${a} must multiply both terms in the parentheses, giving ${ms(a * p)}, not ${ms(p)}.`,
      `Step 2: ${ms(a * p)}${cst(c)} = ${ms(K)}, not ${ms(a * p - c)}.`,
      `Step 3: to remove ${ms(K)} from the left, ${K > 0 ? "subtract" : "add"} ${Math.abs(K)} on both sides, giving ${ms(d - K)}.`,
      `Step 4: undo multiplying by ${a} by dividing by ${a}, not subtracting it.`,
    ];
    return {
      prompt: `A student solved ${eq0} as shown. In which step did the student make the first error?`,
      visual: { type: "table", headers: ["", "Equation"], rows: [["Given", eq0], ...bad.map((e, i) => [`Step ${i + 1}`, e])] },
      answer: choice(r, `Step ${errStep + 1}`, [0, 1, 2, 3].filter((i) => i !== errStep).map((i) => [`Step ${i + 1}`, i < errStep ? `Step ${i + 1} is correct. Keep checking.` : "An earlier step already has an error."] as [string, string]), true),
      hints: ["Check each step against the line before it, in order.", "For each step ask: is the new line equal to the old one, or was the same operation done to both sides?"],
      steps: [st("Correct solution.", lines.map((l) => l.eq).join(" → ")), st("First error.", why[errStep])],
    };
  },
};

// ---------- special solutions ----------

const special: Skill = {
  id: "m1.eq.special",
  title: "One, none or infinitely many solutions",
  topic: T,
  standards: ["NC.M1.A-REI.3"],
  prereqs: ["m1.eq.multi-step"],
  lesson: {
    bigIdea: "After simplifying both sides, different x-coefficients mean one solution; the same coefficient and different constants mean no solution; identical sides mean infinitely many.",
    explain: [
      "2(x + 3) = 2x + 6 simplifies to 2x + 6 = 2x + 6. Every x works: **infinitely many solutions**.",
      "2(x + 3) = 2x + 1 simplifies to 2x + 6 = 2x + 1. Subtracting 2x leaves 6 = 1, which is never true: **no solution**.",
      "2(x + 3) = 5x simplifies to 2x + 6 = 5x, so 6 = 3x and x = 2: **exactly one solution**.",
    ],
    tip: "Compare the x-coefficients first. Only if they match do you need to look at the constants.",
  },
  why: [
    { kind: "choice", prompt: "Solving an equation leads to 0 = 7. What does that mean?", choices: ["No value of x makes the equation true.", "The solution is x = 7.", "The solution is x = 0."], correct: 0, explain: "The x-terms canceled and left a false statement, so nothing works." },
    { kind: "written", prompt: "Explain why 4x + 1 = 4x + 9 has no solution, using the idea of two lines or two machines.", keyIdeas: ["both sides grow by 4 for each 1 increase in x", "the right side always stays 8 more", "they can never be equal"], exemplar: "Both sides go up by 4 every time x goes up by 1, but the right side starts 8 higher. It stays 8 higher forever, so the two sides are never equal: no solution. (As lines, they're parallel.)" },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const a = r.int(2, 5), p = r.nonzero(-6, 6), b = r.nonzero(-4, 4);
      let D = r.nonzero(-12, 12);
      if (D === a * p) D += 1;
      const k = a + b;
      return {
        prompt: `For what value of k does the equation ${a}${binom(-p)}${b > 0 ? " + " : " − "}${term(Math.abs(b), "x")} = kx${cst(D)} have no solution?`,
        answer: num(k),
        hints: ["Simplify the left side completely.", "No solution happens when the x-coefficients match but the constants don't."],
        steps: [st("Simplify the left side.", `${term(a, "x")}${cst(a * p)}${b > 0 ? " + " : " − "}${term(Math.abs(b), "x")} = ${lin(k, a * p)}`), st("Match the x-coefficients.", `${lin(k, a * p)} = kx${cst(D)} has no solution when k = ${ms(k)}, because then the constants ${ms(a * p)} and ${ms(D)} differ.`)],
        traps: traps(frac(k), [trap(a, `Don't forget the ${term(b, "x")} on the left: combine it with ${term(a, "x")}.`), trap(D, "k is the coefficient of x, not the constant.")]),
      };
    }
    const kind = r.pick(["one", "none", "many"] as const);
    let L: number, R: number, l0: number, r0: number, shown: string;
    if (lv === 1) {
      const a = r.nonzero(-6, 6), b = r.nonzero(-9, 9);
      L = a; l0 = b;
      R = kind === "one" ? a + r.nonzero(-3, 3) || a + 1 : a;
      r0 = kind === "none" ? b + r.nonzero(-6, 6) : kind === "many" ? b : r.int(-9, 9);
      if (R === 0) R = a + 2;
      shown = `${lin(L, l0)} = ${lin(R, r0)}`;
    } else {
      const a = r.int(2, 5), p = r.nonzero(-5, 5), b = r.nonzero(-3, 3);
      L = a + b; l0 = a * p;
      if (L === 0) { L = a; }
      const bb = L - a;
      R = kind === "one" ? L + r.nonzero(-3, 3) : L;
      if (R === 0) R = L + 1;
      r0 = kind === "none" ? l0 + r.nonzero(-7, 7) : kind === "many" ? l0 : r.int(-9, 9);
      const left = bb === 0 ? `${a}${binom(-p)}` : `${a}${binom(-p)}${bb > 0 ? " + " : " − "}${term(Math.abs(bb), "x")}`;
      shown = `${left} = ${lin(R, r0)}`;
    }
    const names = { one: "Exactly one solution", none: "No solution", many: "Infinitely many solutions" };
    const simp = `${lin(L, l0)} = ${lin(R, r0)}`;
    return {
      prompt: `How many solutions does ${shown} have?`,
      answer: choice(r, names[kind], (Object.keys(names) as (keyof typeof names)[]).filter((k) => k !== kind).map((k) => [names[k], k === "one" ? "Check the x-coefficients after simplifying: do they match?" : k === "none" ? "The sides aren't the same line with different starts. Compare again." : "The two sides aren't identical after simplifying."] as [string, string]), true),
      hints: ["Simplify both sides completely.", "Compare the coefficients of x. If they're equal, compare the constants."],
      steps: [st("Simplify both sides.", simp), kind === "one" ? st("Different x-coefficients.", `${ms(L)} ≠ ${ms(R)}, so exactly one x makes the sides equal (x = ${fracShow(r0 - l0, L - R)}).`) : st(`Same x-coefficient (${ms(L)}).`, `Subtract ${term(L, "x")} from both sides: ${ms(l0)} = ${ms(r0)}, which is ${kind === "none" ? "never true → no solution" : "always true → infinitely many solutions"}.`)],
    };
  },
};

function fracShow(n: number, d: number): string {
  const q = frac(n, d);
  return q.d === 1 ? ms(q.n) : `${q.n < 0 ? "−" : ""}{${Math.abs(q.n)}/${q.d}}`;
}

// ---------- write and solve ----------

const writeSolve: Skill = {
  id: "m1.eq.write-solve",
  title: "Write and solve equations in context",
  topic: T,
  standards: ["NC.M1.A-CED.1", "NC.M1.A-REI.3"],
  prereqs: ["m1.eq.multi-step"],
  lesson: {
    bigIdea: "Name the unknown, translate each piece of the story into an expression, set the two equal quantities equal, then solve and check the answer makes sense.",
    explain: [
      "Example: a gym charges $40 to join plus $25 a month. Leo has paid $215 in all. Let m = months: **40 + 25m = 215**, so 25m = 175 and m = 7 months.",
      "When two options cost the same, set their expressions equal. Plan A: 20 + 8x. Plan B: 50 + 5x. 20 + 8x = 50 + 5x gives 3x = 30, x = 10.",
      "Always answer the question with units, and check that the answer fits the context (a number of months can't be negative or a fraction of a person).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why do you set the two plan costs equal to find when they cost the same?", choices: ["\"Cost the same\" means the two expressions have equal values for that x.", "Because equations always need two plans.", "To find which plan is cheaper overall."], correct: 0, explain: "An equation states that two quantities are equal; that's exactly the condition." },
    { kind: "written", prompt: "A student solves an equation for the number of tickets and gets 12.5. Explain what they should do and why.", keyIdeas: ["tickets must be whole numbers", "12.5 isn't a possible number of tickets", "recheck the equation or interpret (round as the context requires)"], exemplar: "You can't buy half a ticket, so 12.5 isn't a real answer. The student should check the equation and arithmetic. If it's right, the context decides: for example, if they can't spend more than the budget, they can buy at most 12." },
  ],
  generate(r, lv) {
    const nm = r.pick(NAMES);
    if (lv === 1) {
      const fee = r.pick([25, 30, 40, 50]), rate = r.pick([15, 20, 25, 35]), m = r.int(3, 12);
      const total = fee + rate * m;
      if (r.chance(0.5)) {
        return {
          prompt: `A gym charges $${fee} to join plus $${rate} per month. ${nm} has paid $${total} in all. How many months has ${nm} been a member?`,
          answer: num(m),
          hints: [`Let m be the number of months. Write the total cost: ${fee} + ${rate}m.`, `Solve ${fee} + ${rate}m = ${total}.`],
          steps: [st("Write the equation.", `${fee} + ${rate}m = ${total}`), st(`Subtract ${fee}.`, `${rate}m = ${total - fee}`), st(`Divide by ${rate}.`, `m = ${m} months`), st("Check.", `${fee} + ${rate} · ${m} = ${total} ✓`)],
          traps: traps(frac(m), [trap(total / rate, `Subtract the $${fee} joining fee before dividing.`), trap((total + fee) / rate, `Subtract the $${fee} fee; don't add it.`)]),
        };
      }
      return {
        prompt: `A gym charges $${fee} to join plus $${rate} per month. ${nm} has paid $${total} in all. Which equation can be used to find m, the number of months?`,
        answer: choice(r, `${fee} + ${rate}m = ${total}`, [[`${rate} + ${fee}m = ${total}`, "The fee is paid once; the monthly rate multiplies m."], [`${fee + rate}m = ${total}`, "The joining fee isn't paid every month."], [`${fee}m + ${rate}m = ${total}`, "Only the monthly cost repeats."]]),
        hints: ["Which cost happens once, and which happens every month?", "Total = one-time cost + (monthly cost) × (number of months)."],
        steps: [st("One-time cost.", `$${fee}`), st("Monthly cost.", `${rate}m`), st("Total.", `${fee} + ${rate}m = ${total}`)],
      };
    }
    if (lv === 2) {
      const fA = r.pick([10, 20, 30]), rA = r.int(7, 12), x = r.int(4, 15);
      const rB = rA - r.int(2, 5);
      const fB = fA + (rA - rB) * x;
      const item = r.pick([["streaming service", "months"], ["bowling alley", "games"], ["car rental", "days"]]);
      return {
        prompt: `Two ${item[0]} options: Option A costs $${fA} plus $${rA} per ${item[1].slice(0, -1)}. Option B costs $${fB} plus $${rB} per ${item[1].slice(0, -1)}. For how many ${item[1]} do the options cost the same?`,
        answer: num(x),
        hints: [`Write each cost: ${fA} + ${rA}x and ${fB} + ${rB}x.`, "Set them equal and get the x-terms on one side."],
        steps: [st("Write the equation.", `${fA} + ${rA}x = ${fB} + ${rB}x`), st(`Subtract ${rB}x from both sides.`, `${fA} + ${rA - rB}x = ${fB}`), st(`Subtract ${fA}.`, `${rA - rB}x = ${fB - fA}`), st(`Divide by ${rA - rB}.`, `x = ${x} ${item[1]}`), st("Check.", `A: ${fA + rA * x}, B: ${fB + rB * x}. ✓`)],
        traps: traps(frac(x), [trap(frac(fB - fA, rA + rB), "Subtract the rates, don't add them: move one x-term to the other side."), trap(fB - fA, `Divide by the difference in rates, ${rA - rB}.`)]),
      };
    }
    if (r.chance(0.5)) {
      const w = r.int(4, 15), extra = r.int(1, 6), mult = r.pick([2, 3]);
      const L = mult * w + extra, P = 2 * (L + w);
      return {
        prompt: `A rectangular dog run's length is ${extra} ft more than ${mult === 2 ? "twice" : "three times"} its width. The perimeter is ${P} ft. What is the width?`,
        answer: num(w, { unit: " ft" }),
        hints: [`Let w = width. Then length = ${mult}w + ${extra}.`, `Perimeter = 2(length) + 2(width): 2(${mult}w + ${extra}) + 2w = ${P}.`],
        steps: [st("Write the equation.", `2(${mult}w + ${extra}) + 2w = ${P}`), st("Distribute and combine.", `${2 * mult}w + ${2 * extra} + 2w = ${2 * mult + 2}w + ${2 * extra} = ${P}`), st(`Subtract ${2 * extra}.`, `${2 * mult + 2}w = ${P - 2 * extra}`), st(`Divide by ${2 * mult + 2}.`, `w = ${w} ft`), st("Check.", `Length ${L}, width ${w}: 2(${L}) + 2(${w}) = ${P} ✓`)],
        traps: traps(frac(w), [trap(L, "That's the length. The question asks for the width."), trap(frac(P - extra, mult + 1), "Perimeter counts each side twice: use 2(length) + 2(width).")]),
      };
    }
    const n0 = r.int(5, 40) * 2, k = r.pick([3, 4]);
    const S = k * n0 + 2 * (k * (k - 1)) / 2;
    return {
      prompt: `The sum of ${k} consecutive even integers is ${S}. What is the smallest of them?`,
      answer: num(n0),
      hints: [`Call the smallest n. The others are n + 2${k === 4 ? ", n + 4 and n + 6" : " and n + 4"}.`, `Add them: ${k}n + ${(k * (k - 1))} = ${S}.`],
      steps: [st("Write the equation.", `n + (n + 2) + (n + 4)${k === 4 ? " + (n + 6)" : ""} = ${S}`), st("Combine like terms.", `${k}n + ${k * (k - 1)} = ${S}`), st(`Subtract ${k * (k - 1)} and divide by ${k}.`, `${k}n = ${S - k * (k - 1)}, n = ${n0}`), st("Check.", `${Array.from({ length: k }, (_, i) => n0 + 2 * i).join(" + ")} = ${S} ✓`)],
      traps: traps(frac(n0), [trap(frac(S, k), "That's the average, the middle of the list. The smallest is below it."), trap(n0 + 2 * (k - 1), "That's the largest. The question asks for the smallest.")]),
    };
  },
};

// ---------- inequalities ----------

const flip: Record<string, string> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };

const inequalities: Skill = {
  id: "m1.eq.inequalities",
  title: "Solve linear inequalities",
  topic: T,
  standards: ["NC.M1.A-REI.3"],
  prereqs: ["m1.eq.multi-step"],
  lesson: {
    bigIdea: "Solve an inequality like an equation, except that multiplying or dividing both sides by a negative number reverses the inequality sign.",
    explain: [
      "3x − 4 > 11: add 4 to get 3x > 15, divide by 3: **x > 5**.",
      "−2x + 7 ≤ 1: subtract 7 to get −2x ≤ −6. Dividing by −2 flips the sign: **x ≥ 3**.",
      "Why flip? 2 < 5, but −2 > −5. Multiplying by a negative reverses the order of numbers on the number line.",
      "On a number line, < and > use an open circle; ≤ and ≥ use a closed (filled) circle.",
    ],
    visual: { type: "numberline", min: -2, max: 8, step: 1, ray: { at: 3, dir: "right", closed: true } },
    tip: "Check with a test value: pick a number in your answer and make sure it works in the original inequality.",
  },
  why: [
    { kind: "choice", prompt: "Why does dividing by −2 reverse the inequality sign?", choices: ["Multiplying or dividing by a negative reverses the order of numbers on the number line.", "Because −2 is less than zero, so you subtract instead.", "It doesn't; only multiplying flips the sign."], correct: 0, explain: "For example 4 < 6 but −2 > −3 after dividing by −2." },
    { kind: "written", prompt: "Explain how you could check that x ≥ 3 is the correct solution of −2x + 7 ≤ 1.", keyIdeas: ["test a value in the solution, like 4: −1 ≤ 1 is true", "test a value outside, like 0: 7 ≤ 1 is false", "test the boundary 3: 1 ≤ 1 is true, so it's included"], exemplar: "Try x = 4: −8 + 7 = −1 ≤ 1, true. Try x = 0: 7 ≤ 1, false. Try x = 3: 1 ≤ 1, true, so 3 is included. The values that work are x ≥ 3." },
  ],
  generate(r, lv) {
    const op = r.pick(["<", ">", "≤", "≥"]);
    const B = r.int(-8, 8);
    let A: number, b: number, C = 0, D: number;
    if (lv === 1) { A = r.int(2, 7); b = r.nonzero(-9, 9); D = A * B + b; }
    else if (lv === 2) { A = -r.int(2, 7); b = r.nonzero(-9, 9); D = A * B + b; }
    else { A = r.nonzero(-6, 6); C = r.nonzero(-6, 6); if (C === A) C = A + r.pick([-2, 2]); if (C === 0) C = A - 3; b = r.nonzero(-9, 9); D = (A - C) * B + b; }
    const a = A - C;
    const finalOp = a < 0 ? flip[op] : op;
    const ansText = `x ${finalOp} ${ms(B)}`;
    const shown = lv === 3 ? `${lin(A, b)} ${op} ${lin(C, D)}` : `${lin(A, b)} ${op} ${ms(D)}`;
    const steps: string[] = [];
    if (C !== 0) steps.push(st(`${C > 0 ? "Subtract" : "Add"} ${term(Math.abs(C), "x")} on both sides.`, `${lin(a, b)} ${op} ${ms(D)}`));
    steps.push(st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `${term(a, "x")} ${op} ${ms(D - b)}`));
    steps.push(st(`Divide both sides by ${ms(a)}.`, a < 0 ? `Dividing by a negative flips the sign: x ${finalOp} ${ms(B)}` : `x ${finalOp} ${ms(B)}`));
    const tv = B + (finalOp === ">" || finalOp === "≥" ? 1 : -1);
    steps.push(st("Check with a test value.", `Try x = ${ms(tv)}: left side ${ms(A * tv + b)}, right side ${ms(C * tv + D)}, and ${ms(A * tv + b)} ${op} ${ms(C * tv + D)} is true. ✓`));
    const strictSwap: Record<string, string> = { "<": "≤", "≤": "<", ">": "≥", "≥": ">" };
    return {
      prompt: `Solve: ${shown}`,
      answer: choice(r, ansText, [
        [`x ${flip[finalOp]} ${ms(B)}`, a < 0 ? "You divided by a negative number, so the sign must flip." : "You only flip the sign when multiplying or dividing by a negative."],
        [`x ${strictSwap[finalOp]} ${ms(B)}`, "Keep the same kind of sign: an \"or equal to\" sign stays \"or equal to\"."],
        [`x ${finalOp} ${ms(-B)}`, "Check the sign of the boundary value."],
        ...(Number.isInteger((D + b) / a) ? [[`x ${finalOp} ${f((D + b) / a)}`, `To undo ${b > 0 ? "+" : "−"} ${Math.abs(b)}, do the opposite.`] as [string, string]] : []),
      ]),
      hints: [C !== 0 ? "Collect the x-terms on one side first." : `Undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)} first.`, a < 0 ? "You'll divide by a negative number. What happens to the sign?" : "Then divide by the coefficient of x."],
      steps,
    };
  },
};

// ---------- inequalities in context ----------

const inequalityContext: Skill = {
  id: "m1.eq.inequality-context",
  title: "Write and solve inequalities in context",
  topic: T,
  standards: ["NC.M1.A-CED.1", "NC.M1.A-REI.3"],
  prereqs: ["m1.eq.inequalities"],
  lesson: {
    bigIdea: "\"At most\" and \"no more than\" mean ≤; \"at least\" and \"no less than\" mean ≥. Solve, then round in the direction the context allows.",
    explain: [
      "Kai has $60 for a concert: $18 for parking plus $7.50 per snack. 18 + 7.5s ≤ 60 gives s ≤ 5.6. Kai can't buy 0.6 of a snack, and 6 would go over budget, so the most is **5 snacks**.",
      "Priya needs at least $400 and has $85 saved. She earns $14 an hour: 85 + 14h ≥ 400 gives h ≥ 22.5. 22 hours isn't enough, so she needs **23 hours**.",
      "So for a maximum, round down; for a minimum, round up. The answer has to actually satisfy the inequality.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Solving a budget inequality gives t ≤ 8.75 tickets. Why is the answer 8 and not 9?", choices: ["9 tickets would cost more than the budget; 8 is the largest whole number that works.", "You always round down.", "Because 8.75 rounds to 8."], correct: 0, explain: "8.75 rounds to 9 normally, but 9 breaks the inequality." },
    { kind: "written", prompt: "Explain the difference between \"at least 20\" and \"at most 20\" and give the inequality for each.", keyIdeas: ["at least 20 means 20 or more: x ≥ 20", "at most 20 means 20 or less: x ≤ 20", "both include 20"], exemplar: "\"At least 20\" means 20 is the minimum, so x ≥ 20. \"At most 20\" means 20 is the maximum, so x ≤ 20. Both include 20 itself." },
  ],
  generate(r, lv) {
    const nm = r.pick(NAMES);
    if (lv === 1) {
      const fixed = r.pick([6, 8, 10, 12, 15]), price = r.pick([2.5, 3.5, 4.5, 7.5, 6]);
      const budget = fixed + price * r.int(4, 10) + r.pick([0, 1, 2]);
      const exact = (budget - fixed) / price;
      const ans = Math.floor(exact + 1e-9);
      return {
        prompt: `${nm} has ${money(budget)} to spend at a fair. Entry costs ${money(fixed)} and each ride ticket costs ${money(price)}. What is the greatest number of ride tickets ${nm} can buy?`,
        answer: num(ans),
        hints: [`Write it: ${fixed} + ${f(price)}t ≤ ${f(budget)}.`, "Solve for t, then think about whole tickets."],
        steps: [st("Write the inequality.", `${fixed} + ${f(price)}t ≤ ${f(budget)}`), st(`Subtract ${fixed}.`, `${f(price)}t ≤ ${f(budget - fixed)}`), st(`Divide by ${f(price)}.`, `t ≤ ${f(Math.round(exact * 100) / 100)}`), st("Interpret.", exact === ans ? `Exactly ${ans} tickets fit the budget.` : `t must be a whole number at most ${f(Math.round(exact * 100) / 100)}, so ${ans} tickets.`)],
        traps: traps(frac(ans), [trap(Math.floor(budget / price), `Subtract the ${money(fixed)} entry fee first.`), trap(ans + 1, `${ans + 1} tickets would cost ${money(fixed + price * (ans + 1))}, over the budget. Round down.`)]),
      };
    }
    if (lv === 2) {
      const goal = r.pick([300, 400, 500, 650]), saved = r.pick([45, 60, 85, 120]), rate = r.pick([11, 12, 13, 14, 15]);
      const exact = (goal - saved) / rate;
      const ans = Math.ceil(exact - 1e-9);
      return {
        prompt: `${nm} wants at least $${goal} for a used bike. ${nm} has $${saved} saved and earns $${rate} per hour. What is the fewest whole hours ${nm} must work?`,
        answer: num(ans),
        hints: [`Write it: ${saved} + ${rate}h ≥ ${goal}.`, "Solve for h. If it isn't whole, which way must you round so the goal is reached?"],
        steps: [st("Write the inequality.", `${saved} + ${rate}h ≥ ${goal}`), st(`Subtract ${saved}.`, `${rate}h ≥ ${goal - saved}`), st(`Divide by ${rate}.`, `h ≥ ${f(Math.round(exact * 100) / 100)}`), st("Interpret.", exact === ans ? `${ans} hours exactly.` : `${ans - 1} hours only gives $${saved + rate * (ans - 1)}, not enough. So ${ans} hours.`)],
        traps: traps(frac(ans), [trap(ans - 1, `${ans - 1} hours gives only $${saved + rate * (ans - 1)}. Round up for an "at least" goal.`), trap(Math.ceil(goal / rate), `Subtract the $${saved} already saved first.`)]),
      };
    }
    const fA = r.pick([20, 25, 30]), rA = r.pick([0.15, 0.2, 0.25]);
    const rB = rA - r.pick([0.05, 0.1]);
    const fB = fA + r.pick([10, 15, 20, 30]);
    const cross = (fB - fA) / (rA - rB);
    const ans = Math.floor(cross + 1e-9) + 1;
    const crossR = Math.round(cross * 100) / 100;
    return {
      prompt: `Plan A costs $${fA} a month plus $${rA.toFixed(2)} per minute of calls. Plan B costs $${fB} a month plus $${rB.toFixed(2)} per minute. What is the fewest whole minutes for which Plan B is cheaper?`,
      answer: num(ans),
      hints: ["Plan B is cheaper when its cost is less than Plan A's.", `Solve ${fB} + ${f(rB)}m < ${fA} + ${f(rA)}m.`],
      steps: [st("Write the inequality.", `${fB} + ${f(rB)}m < ${fA} + ${f(rA)}m`), st(`Subtract ${f(rB)}m and ${fA} from both sides.`, `${fB - fA} < ${f(Math.round((rA - rB) * 100) / 100)}m`), st(`Divide by ${f(Math.round((rA - rB) * 100) / 100)}.`, `m > ${f(crossR)}`), st("Interpret.", `At exactly ${f(crossR)} minutes they cost the same, so B is cheaper starting at ${ans} minutes.`)],
      traps: traps(frac(ans), [trap(Math.floor(cross + 1e-9), `At ${Math.floor(cross + 1e-9)} minutes Plan B is not cheaper yet. Find the first whole number past ${f(crossR)}.`), trap(frac(Math.round((fB - fA) / (rA + rB) * 100), 100), "Subtract the per-minute rates; don't add them.")]),
    };
  },
};

// ---------- literal equations ----------

interface Formula { show: string; solveFor: string; ans: string; vars: string[]; display: string; steps: string[] }

const FORMULAS: Formula[][] = [
  [],
  [
    { show: "d = rt", solveFor: "t", ans: "d/r", vars: ["d", "r"], display: "{d/r}", steps: [st("Divide both sides by r.", "{d/r} = t")] },
    { show: "P = 2l + 2w", solveFor: "w", ans: "(P-2l)/2", vars: ["P", "l"], display: "{P − 2l/2}", steps: [st("Subtract 2l from both sides.", "P − 2l = 2w"), st("Divide both sides by 2.", "w = {P − 2l/2}")] },
    { show: "A = {1/2}bh", solveFor: "h", ans: "2A/b", vars: ["A", "b"], display: "{2A/b}", steps: [st("Multiply both sides by 2.", "2A = bh"), st("Divide both sides by b.", "h = {2A/b}")] },
    { show: "y = mx + b", solveFor: "x", ans: "(y-b)/m", vars: ["y", "m", "b"], display: "{y − b/m}", steps: [st("Subtract b from both sides.", "y − b = mx"), st("Divide both sides by m.", "x = {y − b/m}")] },
    { show: "V = lwh", solveFor: "w", ans: "V/(lh)", vars: ["V", "l", "h"], display: "{V/lh}", steps: [st("Divide both sides by l and by h.", "w = {V/lh}")] },
    { show: "I = Prt", solveFor: "t", ans: "I/(Pr)", vars: ["I", "P", "r"], display: "{I/Pr}", steps: [st("Divide both sides by Pr.", "t = {I/Pr}")] },
  ],
  [
    { show: "C = {5/9}(F − 32)", solveFor: "F", ans: "9C/5+32", vars: ["C"], display: "{9/5}C + 32", steps: [st("Multiply both sides by {9/5}.", "{9/5}C = F − 32"), st("Add 32 to both sides.", "F = {9/5}C + 32")] },
    { show: "A = P + Prt", solveFor: "P", ans: "A/(1+rt)", vars: ["A", "r", "t"], display: "{A/1 + rt}", steps: [st("Factor out P on the right.", "A = P(1 + rt)"), st("Divide both sides by (1 + rt).", "P = {A/1 + rt}")] },
    { show: "S = 180(n − 2)", solveFor: "n", ans: "S/180+2", vars: ["S"], display: "{S/180} + 2", steps: [st("Divide both sides by 180.", "{S/180} = n − 2"), st("Add 2 to both sides.", "n = {S/180} + 2")] },
    { show: "ax + by = c", solveFor: "y", ans: "(c-ax)/b", vars: ["a", "b", "c", "x"], display: "{c − ax/b}", steps: [st("Subtract ax from both sides.", "by = c − ax"), st("Divide both sides by b.", "y = {c − ax/b}")] },
    { show: "A = {1/2}h(a + b)", solveFor: "h", ans: "2A/(a+b)", vars: ["A", "a", "b"], display: "{2A/a + b}", steps: [st("Multiply both sides by 2.", "2A = h(a + b)"), st("Divide both sides by (a + b).", "h = {2A/a + b}")] },
  ],
];

const literal: Skill = {
  id: "m1.eq.literal",
  title: "Solve formulas for a variable",
  topic: T,
  standards: ["NC.M1.A-CED.4"],
  prereqs: ["m1.eq.multi-step"],
  lesson: {
    bigIdea: "A formula is an equation with several letters. To solve for one letter, undo everything around it, treating the other letters like numbers.",
    explain: [
      "Solve P = 2l + 2w for w. Subtract 2l from both sides: P − 2l = 2w. Divide by 2: **w = {P − 2l/2}**.",
      "Solve 3x + 2y = 12 for y: subtract 3x to get 2y = 12 − 3x, then divide every term by 2: **y = −{3/2}x + 6**. This is how you turn standard form into slope-intercept form.",
      "The steps are the same ones you'd use if the other letters were numbers. Try it: if P = 30 and l = 9, then w = (30 − 18) ÷ 2 = 6.",
    ],
    tip: "Type fractions with parentheses: (P − 2l)/2, not P − 2l/2.",
  },
  why: [
    { kind: "choice", prompt: "To solve d = rt for t, why do you divide by r?", choices: ["t is multiplied by r, and division undoes multiplication.", "Because r is on the right side.", "Because d is the biggest letter."], correct: 0, explain: "Same as solving 60 = 5t: divide both sides by 5." },
    { kind: "written", prompt: "Explain why solving a formula for a variable can be useful, using A = lw as an example.", keyIdeas: ["rewrite w = A/l", "then you can find the width directly for many areas and lengths", "it saves solving a new equation every time"], exemplar: "If you need the width of many rectangles with known area and length, solving A = lw once to get w = A/l lets you plug in the numbers directly instead of solving a new equation each time." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.nonzero(-6, 6), b = r.pick([2, 3, 4, 5, -2, -3, -4]);
      const c = b * r.int(-5, 5) || b * 2;
      const m = frac(-a, b), k = frac(c, b);
      const mText = m.d === 1 ? (m.n === 1 ? "" : m.n === -1 ? "−" : ms(m.n)) : `${m.n < 0 ? "−" : ""}{${Math.abs(m.n)}/${m.d}}`;
      const kText = k.n === 0 ? "" : k.n > 0 ? ` + ${k.n}` : ` − ${-k.n}`;
      const disp = `${mText}x${kText}`;
      const ansTyped = `${m.n}/${m.d}*x+${k.n}`.replace("+-", "-");
      return {
        prompt: `Solve ${term(a, "x")} ${b > 0 ? "+" : "−"} ${term(Math.abs(b), "y")} = ${ms(c)} for y.`,
        answer: expr(ansTyped, { lhs: "y", display: disp }),
        hints: [`Move the x-term: ${a > 0 ? "subtract" : "add"} ${term(Math.abs(a), "x")} on both sides.`, `Then divide every term by ${ms(b)}.`],
        steps: [st(`${a > 0 ? "Subtract" : "Add"} ${term(Math.abs(a), "x")} on both sides.`, `${term(b, "y")} = ${ms(c)}${a > 0 ? " − " : " + "}${term(Math.abs(a), "x")}`), st(`Divide every term by ${ms(b)}.`, `y = ${disp}`)],
      };
    }
    const fm = r.pick(FORMULAS[lv - 1]);
    const ans: Answer = expr(fm.ans, { vars: fm.vars, lhs: fm.solveFor, display: fm.display });
    return {
      prompt: `Solve ${fm.show} for ${fm.solveFor}.`,
      answer: ans,
      hints: [`What is happening to ${fm.solveFor}? Undo those operations in reverse order.`, "Treat the other letters as if they were numbers. Use parentheses when you type a fraction."],
      steps: [...fm.steps, st("Check with numbers.", "Pick values for the other letters, compute, and substitute back into the original formula.")],
    };
  },
};

export default [expressions, multiStep, justify, special, writeSolve, inequalities, inequalityContext, literal];
