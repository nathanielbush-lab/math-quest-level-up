// Unit 1: Building functions: composition, inverses and piecewise models (NC.M4.AF.1, NC.M4.AF.4).
import { binom, binomExpr, choice, cst, expr, linear, money, ms, num, poly, polyExpr, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { PEOPLE, polyCompose, polyEval, polyMul } from "./util";

const T = "m4-functions";

/** Shows a polynomial with something substituted for x: polySub([2, −3, 1], "(−2)") → "2(−2)^2 − 3(−2) + 1". */
export function polySub(c: number[], inner: string): string {
  const deg = c.length - 1;
  let out = "";
  c.forEach((k, i) => {
    if (k === 0) return;
    const p = deg - i;
    const a = Math.abs(k);
    const body = p === 0 ? String(a) : `${a === 1 ? "" : a}${inner}${p > 1 ? `^${p}` : ""}`;
    out += out ? (k < 0 ? ` − ${body}` : ` + ${body}`) : k < 0 ? `−${body}` : body;
  });
  return out || "0";
}

/** "+3", "-3" or "" for building typed expressions. */
const cE = (c: number) => (c === 0 ? "" : c > 0 ? `+${c}` : `${c}`);

// ---------------------------------------------------------------------------

const composeEval: Skill = {
  id: "m4.fn.compose-eval",
  title: "Evaluate a composite function",
  topic: T,
  standards: ["NC.M4.AF.1.2"],
  prereqs: [],
  lesson: {
    bigIdea: "f(g(a)) means: find g(a) first, then use that output as the input of f. Work from the inside out.",
    explain: [
      "The notation (f ∘ g)(x) means f(g(x)). The function written closest to x acts first.",
      "Example: f(x) = x^2 + 1 and g(x) = 2x − 3. To find f(g(4)), start inside: g(4) = 2(4) − 3 = 5. Then f(5) = 5^2 + 1 = **26**.",
      "Order matters: g(f(4)) = g(17) = 2(17) − 3 = 31, which is a different number.",
    ],
    tip: "Write the inside value down before you move on. Most mistakes come from doing the outside function first.",
  },
  why: [
    { kind: "choice", prompt: "Why is f(g(2)) usually different from g(f(2))?", choices: ["Each order feeds a different number into the second function.", "They are always equal; it's just notation.", "Because f(g(2)) means f(2) × g(2)."], correct: 0, explain: "f(g(2)) puts g(2) into f, while g(f(2)) puts f(2) into g. Different inputs give different outputs." },
    { kind: "written", prompt: "A friend says (f ∘ g)(3) means multiply f(3) by g(3). Explain what it really means and how to compute it.", keyIdeas: ["∘ means composition, not multiplication", "find g(3) first", "use g(3) as the input to f"], exemplar: "The circle means composition. (f ∘ g)(3) = f(g(3)): first find g(3), then plug that output into f. Multiplying f(3) · g(3) is a different operation." },
  ],
  generate(r, lv) {
    const g = [r.nonzero(-3, 4), r.int(-5, 5)];
    const f = lv === 1 ? [r.nonzero(-4, 5), r.int(-6, 6)] : lv === 2 ? [r.pick([1, 2, -1]), 0, r.int(-6, 6)] : [r.pick([1, 2, -1]), r.nonzero(-4, 4), r.int(-5, 5)];
    const a = r.int(-3, 4);
    const fOuter = lv === 1 ? true : r.chance(0.5);
    const [outer, inner, oN, iN] = fOuter ? [f, g, "f", "g"] : [g, f, "g", "f"];
    const mid = polyEval(inner, a);
    const ans = polyEval(outer, mid);
    const notation = lv === 3 ? `(${oN} ∘ ${iN})(${ms(a)})` : `${oN}(${iN}(${ms(a)}))`;
    const swapped = polyEval(inner, polyEval(outer, a));
    return {
      prompt: `f(x) = ${poly(f)} and g(x) = ${poly(g)}. Find ${notation}.`,
      answer: num(ans),
      hints: [
        lv === 3 ? `(${oN} ∘ ${iN})(${ms(a)}) means ${oN}(${iN}(${ms(a)})). Start with the inside function, ${iN}.` : `Work from the inside out: find ${iN}(${ms(a)}) first.`,
        `${iN}(${ms(a)}) = ${mid}. Now find ${oN}(${ms(mid)}).`,
      ],
      steps: [
        ...(lv === 3 ? [st("Rewrite the notation.", `${notation} = ${oN}(${iN}(${ms(a)}))`)] : []),
        st(`Evaluate the inside function ${iN} at ${ms(a)}.`, `${iN}(${ms(a)}) = ${polySub(inner, `(${ms(a)})`)} = ${ms(mid)}`),
        st(`Use that output as the input of ${oN}.`, `${oN}(${ms(mid)}) = ${polySub(outer, `(${ms(mid)})`)} = ${ms(ans)}`),
        st("Answer.", `${notation} = ${ms(ans)}`),
      ],
      traps: traps(frac(ans), [
        trap(swapped, `That's ${iN}(${oN}(${ms(a)})): the functions were used in the wrong order. The inside one, ${iN}, goes first.`),
        trap(polyEval(f, a) * polyEval(g, a), "Composition isn't multiplication. Put the output of the inside function into the outside function."),
        trap(polyEval(outer, a), `That's just ${oN}(${ms(a)}). You still need to start with ${iN}(${ms(a)}).`),
      ]),
    };
  },
};

const composeAlgebra: Skill = {
  id: "m4.fn.compose-algebra",
  title: "Write a composite function",
  topic: T,
  standards: ["NC.M4.AF.1.1"],
  prereqs: ["m4.fn.compose-eval"],
  lesson: {
    bigIdea: "To write f(g(x)), replace every x in f with the whole expression g(x), in parentheses, then simplify.",
    explain: [
      "Let f(x) = x^2 − 3 and g(x) = 2x + 1. Then f(g(x)) = (2x + 1)^2 − 3.",
      "Expand: (2x + 1)^2 = 4x^2 + 4x + 1, so f(g(x)) = 4x^2 + 4x + 1 − 3 = **4x^2 + 4x − 2**.",
      "Check with a number: g(1) = 3 and f(3) = 6. The formula gives 4 + 4 − 2 = 6. ✓",
    ],
    tip: "Always put g(x) in parentheses when you substitute. Without them, 2x + 1 squared turns into 2x + 1^2 by mistake.",
  },
  why: [
    { kind: "choice", prompt: "Why do you need parentheses around g(x) when you substitute it into f?", choices: ["Everything f does to x must happen to the whole expression g(x).", "Parentheses are only for neatness.", "Because g(x) is always negative."], correct: 0, explain: "If f squares its input, it must square all of g(x), not just its last term." },
    { kind: "written", prompt: "Explain how you could check that your formula for f(g(x)) is right using a single number.", keyIdeas: ["pick a value of x", "compute g of it, then f of that result", "plug the same x into your formula and compare"], exemplar: "Pick x = 1. Find g(1), then put that into f. Then plug x = 1 into my simplified formula. If both give the same number, the formula is probably right (a wrong one would usually disagree)." },
  ],
  generate(r, lv) {
    let f: number[], g: number[];
    if (lv === 1) {
      f = [r.nonzero(-4, 5), r.int(-6, 6)];
      g = [r.nonzero(-3, 4), r.nonzero(-5, 5)];
    } else if (lv === 2) {
      if (r.chance(0.5)) { f = [1, 0, r.nonzero(-6, 6)]; g = [r.pick([1, 2, 3, -1, -2]), r.nonzero(-4, 4)]; }
      else { f = [r.nonzero(-3, 3), r.int(-5, 5)]; g = [1, r.int(-4, 4), r.nonzero(-5, 5)]; }
    } else {
      f = [r.pick([1, 2, -1]), r.nonzero(-4, 4), r.int(-5, 5)];
      g = [r.pick([1, 2, -1, 3]), r.nonzero(-3, 3)];
    }
    const res = polyCompose(f, g);
    const gIn = `(${poly(g)})`;
    const steps = [st("Replace each x in f with (g(x)).", `f(g(x)) = ${polySub(f, gIn)}`)];
    if (f.length === 3) {
      const sq = polyMul(g, g);
      steps.push(st("Square the inside expression.", `${gIn}^2 = ${gIn}${gIn} = ${poly(sq)}`));
      const parts: string[] = [`${f[0] === 1 ? "" : f[0] === -1 ? "−" : ms(f[0])}(${poly(sq)}) = ${poly(sq.map((c) => c * f[0]))}`];
      if (f[1] !== 0) parts.push(`${ms(f[1])}${gIn} = ${poly(g.map((c) => c * f[1]))}`);
      if (f[0] !== 1 || f[1] !== 0) steps.push(st("Distribute the coefficients.", parts.join(" and ")));
    } else {
      steps.push(st("Distribute.", `${ms(f[0])}${gIn} = ${poly(g.map((c) => c * f[0]))}`));
    }
    steps.push(st("Combine like terms.", `f(g(x)) = ${poly(res)}`));
    const x0 = 1;
    steps.push(st("Check with x = 1.", `g(1) = ${ms(polyEval(g, x0))} and f(${ms(polyEval(g, x0))}) = ${ms(polyEval(res, x0))}; the formula gives ${ms(polyEval(res, x0))} too. ✓`));
    return {
      prompt: `f(x) = ${poly(f)} and g(x) = ${poly(g)}. Write f(g(x)) in expanded form.`,
      answer: expr(polyExpr(res), { form: "expanded", lhs: "f(g(x))", display: poly(res) }),
      hints: [
        `Replace x in f with (${poly(g)}).`,
        `f(g(x)) = ${polySub(f, gIn)}. ${f.length === 3 ? "Square the parentheses first, then distribute and combine like terms." : "Distribute, then combine like terms."}`,
      ],
      steps,
    };
  },
};

const composeReps: Skill = {
  id: "m4.fn.compose-reps",
  title: "Composites from tables and graphs",
  topic: T,
  standards: ["NC.M4.AF.1.2"],
  prereqs: ["m4.fn.compose-eval"],
  lesson: {
    bigIdea: "You can compose functions given as tables or graphs: read the inside output, then look that value up as an input of the outside function.",
    explain: [
      "Table: to find f(g(2)), find x = 2 in the g row and read g(2). Then find that number in the x row and read f there.",
      "Graph: to find g(3) from a graph, go to x = 3, move up or down to the curve, and read the y-value. That y-value becomes the next input.",
      "Going backward: to solve f(g(x)) = 5, find which input of f gives 5, then which x makes g equal to that input.",
    ],
    visual: { type: "table", headers: ["x", "1", "2", "3", "4"], rows: [["f(x)", 3, 1, 4, 2], ["g(x)", 2, 4, 1, 3]], caption: "f(g(2)) = f(4) = 2" },
  },
  why: [
    { kind: "choice", prompt: "In a table, why do you look up g(2) before f?", choices: ["In f(g(2)), the input to f is g(2), so you need that value first.", "Because g comes before f in the alphabet.", "You can look them up in either order."], correct: 0, explain: "The inside function produces the input for the outside function." },
    { kind: "written", prompt: "Explain how to find f(g(1)) when g is shown as a graph and f is given as a formula.", keyIdeas: ["read g(1) from the graph at x = 1", "the y-value is the output g(1)", "substitute that value into the formula for f"], exemplar: "Go to x = 1 on the graph of g and read the y-coordinate of the point on the curve; that's g(1). Then put that number into the formula for f and compute." },
  ],
  generate(r, lv) {
    if (lv === 2) {
      const m = r.pick([-2, -1, 1, 2]), b = r.int(-3, 3);
      const f = r.chance(0.5) ? [r.nonzero(-3, 4), r.int(-5, 5)] : [1, 0, r.int(-5, 5)];
      const a = r.int(-3, 3);
      const ga = m * a + b, ans = polyEval(f, ga);
      const ys = [-4, 4].map((x) => m * x + b);
      const pts = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => ({ x, y: m * x + b }));
      const vis: Visual = { type: "plot", xMin: -5, xMax: 5, yMin: Math.min(...ys, 0) - 2, yMax: Math.max(...ys, 0) + 2, curves: [{ expr: linear(m, b).replace(/−/g, "-").replace(/\s/g, ""), label: "g" }], points: pts };
      return {
        prompt: `The graph of g is shown, and f(x) = ${poly(f)}. Find f(g(${ms(a)})).`,
        visual: vis,
        answer: num(ans),
        hints: [`Read g(${ms(a)}) from the graph: go to x = ${ms(a)} and find the height of the line.`, `g(${ms(a)}) = ${ms(ga)}. Now compute f(${ms(ga)}).`],
        steps: [
          st(`Read g(${ms(a)}) from the graph.`, `The point on the line at x = ${ms(a)} is (${ms(a)}, ${ms(ga)}), so g(${ms(a)}) = ${ms(ga)}.`),
          st(`Evaluate f at ${ms(ga)}.`, `f(${ms(ga)}) = ${polySub(f, `(${ms(ga)})`)} = ${ms(ans)}`),
        ],
        traps: traps(frac(ans), [trap(m * polyEval(f, a) + b, `That's g(f(${ms(a)})). Start with g, the inside function.`), trap(polyEval(f, a), `That's f(${ms(a)}). First replace ${ms(a)} with g(${ms(a)}).`)]),
      };
    }
    const xs = [1, 2, 3, 4, 5, 6];
    const fv = r.shuffle(xs), gv = r.shuffle(xs);
    const F = (x: number) => fv[x - 1], G = (x: number) => gv[x - 1];
    const vis: Visual = { type: "table", headers: ["x", ...xs.map(String)], rows: [["f(x)", ...fv], ["g(x)", ...gv]] };
    if (lv === 1) {
      const pool = xs.filter((x) => G(x) !== x && F(x) !== x);
      const a = r.pick(pool.length ? pool : xs);
      const outerF = r.chance(0.5);
      const [O, I, oN, iN] = outerF ? [F, G, "f", "g"] : [G, F, "g", "f"];
      const mid = I(a), ans = O(mid);
      return {
        prompt: `Use the table to find ${oN}(${iN}(${a})).`,
        visual: vis,
        answer: num(ans),
        hints: [`Find ${iN}(${a}) first: look in the ${iN}(x) row under x = ${a}.`, `${iN}(${a}) = ${mid}. Now find ${oN}(${mid}) in the ${oN}(x) row.`],
        steps: [st(`Read ${iN}(${a}).`, `Under x = ${a}, the ${iN}(x) row shows ${mid}.`), st(`Read ${oN}(${mid}).`, `Under x = ${mid}, the ${oN}(x) row shows ${ans}.`), st("Answer.", `${oN}(${iN}(${a})) = ${ans}`)],
        traps: traps(frac(ans), [trap(I(O(a)), `That's ${iN}(${oN}(${a})): the order is reversed.`), trap(O(a), `That's ${oN}(${a}). Use ${iN}(${a}) as the input instead.`)]),
      };
    }
    // Level 3: work backward.
    const target = r.pick(xs);
    const u = fv.indexOf(target) + 1; // f(u) = target
    const ans = gv.indexOf(u) + 1; // g(ans) = u
    return {
      prompt: `Use the table to find the value of x that makes f(g(x)) = ${target}.`,
      visual: vis,
      answer: num(ans),
      hints: [`Work backward from the outside: which input of f gives an output of ${target}?`, `f(${u}) = ${target}, so you need g(x) = ${u}. Which x gives g(x) = ${u}?`],
      steps: [
        st("Undo the outside function.", `In the f(x) row, ${target} appears under x = ${u}. So g(x) must equal ${u}.`),
        st("Undo the inside function.", `In the g(x) row, ${u} appears under x = ${ans}. So x = ${ans}.`),
        st("Check.", `g(${ans}) = ${u} and f(${u}) = ${target}. ✓`),
      ],
      traps: traps(frac(ans), [trap(u, `${u} is the value g(x) needs to equal, not x itself. Find the x with g(x) = ${u}.`), trap(F(G(target)), `That's f(g(${target})). The question asks which input makes the composite equal ${target}.`)]),
    };
  },
};

const composeModel: Skill = {
  id: "m4.fn.compose-model",
  title: "Composition in context",
  topic: T,
  standards: ["NC.M4.AF.1.1", "NC.M4.AF.1.2"],
  prereqs: ["m4.fn.compose-algebra"],
  lesson: {
    bigIdea: "When the output of one process becomes the input of another, the whole process is a composite function. The step that happens first goes inside.",
    explain: [
      "A store takes 20% off with S(x) = 0.8x, and a coupon takes $10 off with C(x) = x − 10.",
      "If the 20% comes off first, the final price is C(S(x)) = 0.8x − 10. If the coupon comes first, it's S(C(x)) = 0.8(x − 10) = 0.8x − 8.",
      "For a $60 hoodie: C(S(60)) = 48 − 10 = **$38**, but S(C(60)) = 0.8(50) = **$40**. The order changes the price.",
    ],
  },
  why: [
    { kind: "choice", prompt: "In C(S(x)), which discount is applied to the original price x?", choices: ["S, the inside function", "C, the outside function", "Both at the same time"], correct: 0, explain: "The inside function acts on x first; the outside function acts on its result." },
    { kind: "written", prompt: "A coupon takes $c off and a sale takes a percent off. Explain why taking the percent off last always saves you less than taking it first.", keyIdeas: ["percent off first shrinks the price before the full coupon comes off", "percent off last also shrinks the coupon's value", "the difference equals the percent times the coupon"], exemplar: "If the percent comes off last, it is applied to a price that already had the coupon removed, so the percent also shrinks the coupon. For 20% and a $10 coupon you lose 20% of $10 = $2 of savings." },
  ],
  generate(r, lv) {
    const p = r.pick([10, 20, 25, 30, 40]);
    const c = r.pick([5, 10, 15, 20]);
    const k = (100 - p) / 100;
    const x = r.pick([40, 60, 80, 100, 120]);
    const kx = ((100 - p) * x) / 100, kc = ((100 - p) * c) / 100, kxc = ((100 - p) * (x - c)) / 100;
    const item = r.pick(["pair of sneakers", "hoodie", "video game", "jacket", "pair of headphones"]);
    const fS = `S(x) = ${k}x`, fC = `C(x) = x − ${c}`;
    if (lv === 1) {
      const ans = kx - c;
      return {
        prompt: `A store's sale takes ${p}% off: ${fS}. ${r.pick(PEOPLE)} also has a $${c} coupon: ${fC}. The sale is applied first, then the coupon. Find C(S(${x})), the final price of a $${x} ${item}.`,
        answer: num(ans, { pre: "$" }),
        hints: [`Inside first: S(${x}) is the sale price.`, `S(${x}) = ${k} × ${x} = ${kx}. Now subtract the coupon: C(${kx}).`],
        steps: [st("Apply the sale (inside function).", `S(${x}) = ${k}(${x}) = ${money(kx)}`), st("Apply the coupon to that result.", `C(${kx}) = ${kx} − ${c} = ${money(ans)}`), st("Answer.", `C(S(${x})) = ${money(ans)}`)],
        traps: traps(frac(ans), [trap(kxc, "That's S(C(x)): the coupon was used first. Here the sale comes first."), ...(x - p - c > 0 ? [trap(x - p - c, `The sale is ${p}%, not $${p}.`)] : [])]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `A sale takes ${p}% off (${fS}) and a coupon takes $${c} off (${fC}). Which composite gives the final price if the **coupon is used first**, then the sale?`,
        answer: choice(r, `S(C(x)) = ${k}(x − ${c})`, [
          [`C(S(x)) = ${k}x − ${c}`, "In C(S(x)), S acts first, so the sale comes before the coupon."],
          [`S(x) · C(x) = ${k}x(x − ${c})`, "Multiplying the functions isn't composing them; the price would not even be in dollars."],
          [`S(x) − C(x) = ${k}x − x + ${c}`, "Subtracting the functions doesn't model doing one step after the other."],
        ]),
        hints: ["The step that happens first is the inside function.", `The coupon is first, so C(x) goes inside S.`],
        steps: [st("The first step goes inside.", `The coupon acts on x first: C(x) = x − ${c}.`), st("The sale acts on that result.", `S(C(x)) = ${k}(x − ${c}) = ${k}x − ${kc}`)],
      };
    }
    const diff = (p * c) / 100;
    return {
      prompt: `A sale takes ${p}% off (${fS}) and a coupon takes $${c} off (${fC}). How many dollars more do you pay for a $${x} ${item} if the coupon is used first instead of the sale first? (Compare S(C(${x})) and C(S(${x})).)`,
      answer: num(diff, { pre: "$" }),
      hints: ["Compute both composites at the same price.", `S(C(${x})) = ${k}(${x - c}) and C(S(${x})) = ${kx} − ${c}. Subtract.`],
      steps: [
        st("Coupon first.", `S(C(${x})) = ${k}(${x} − ${c}) = ${k}(${x - c}) = ${money(kxc)}`),
        st("Sale first.", `C(S(${x})) = ${k}(${x}) − ${c} = ${money(kx - c)}`),
        st("Subtract.", `${money(kxc)} − ${money(kx - c)} = ${money(diff)}`),
        st("Why it's always this amount.", `S(C(x)) − C(S(x)) = (${k}x − ${kc}) − (${k}x − ${c}) = ${c} − ${kc} = ${diff}, which is ${p}% of the $${c} coupon, for any price.`),
      ],
      traps: traps(frac(diff), [trap(c, "That's the whole coupon. Both orders use the coupon; the difference is only part of it."), trap(kc, `That's ${100 - p}% of the coupon. The difference is ${p}% of it.`)]),
    };
  },
};

const inverse: Skill = {
  id: "m4.fn.inverse",
  title: "Find and verify inverse functions",
  topic: T,
  standards: ["NC.M4.AF.1.1"],
  prereqs: ["m4.fn.compose-algebra"],
  lesson: {
    bigIdea: "An inverse undoes a function. Swap x and y and solve for y; then check that f(f^-1(x)) = x.",
    explain: [
      "Find the inverse of f(x) = 3x − 6. Write y = 3x − 6 and swap: x = 3y − 6. Solve: 3y = x + 6, so f^-1(x) = {x + 6/3}.",
      "Verify with composition: f(f^-1(x)) = 3({x + 6/3}) − 6 = x + 6 − 6 = x. ✓ Both orders of composition should give x.",
      "Some inverses need a restricted domain. f(x) = √(x − 2) + 1 only outputs y ≥ 1, so its inverse f^-1(x) = (x − 1)^2 + 2 only uses x ≥ 1.",
    ],
    visual: { type: "plot", xMin: -2, xMax: 8, yMin: -2, yMax: 8, curves: [{ expr: "sqrt(x-2)+1", label: "f", domain: [2, 8] }, { expr: "(x-1)^2+2", label: "f⁻¹", domain: [1, 3.4], color: 2 }, { expr: "x", dashed: true, color: 3, label: "y = x" }] },
    tip: "The graphs of a function and its inverse are mirror images across the line y = x.",
  },
  why: [
    { kind: "choice", prompt: "Why does f(f^-1(x)) = x show that two functions are inverses?", choices: ["Applying f^-1 and then f returns every input unchanged, so f undoes f^-1.", "Because any two functions compose to x.", "It only shows that they have the same graph."], correct: 0, explain: "Composing a function with its inverse in either order is the identity function." },
    { kind: "written", prompt: "Explain why f(x) = x^2 needs a restricted domain before it has an inverse function.", keyIdeas: ["two inputs give the same output (like 2 and −2 both give 4)", "the inverse would have to send 4 to two places", "restricting to x ≥ 0 makes it one-to-one"], exemplar: "x^2 sends both 3 and −3 to 9, so an inverse would have to send 9 back to two different numbers, and that isn't a function. If we only use x ≥ 0, each output comes from one input, so f^-1(x) = √x works." },
  ],
  generate(r, lv) {
    if (lv === 1 || (lv === 2 && r.chance(0.5))) {
      // f(x) = mx + b (level 1) or f(x) = (x + b)/m (level 2).
      const m = r.pick([2, 3, 4, 5, -2, -3]);
      const b = r.nonzero(-9, 9);
      if (lv === 1) {
        const val = `(x${cE(-b)})/(${m})`;
        const disp = m > 0 ? `{x${cst(-b)}/${m}}` : `{${ms(b)} − x/${-m}}`;
        return {
          prompt: `Find the inverse of f(x) = ${linear(m, b)}. Type f^-1(x).`,
          answer: expr(val, { lhs: "f^-1(x)", display: disp }),
          hints: ["Write y = f(x), then swap x and y.", `x = ${ms(m)}y${cst(b)}. Solve for y: ${b > 0 ? "subtract" : "add"} ${Math.abs(b)}, then divide by ${ms(m)}.`],
          steps: [
            st("Write y and swap x and y.", `y = ${linear(m, b)} becomes x = ${linear(m, b, "y")}`),
            st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `x${cst(-b)} = ${ms(m)}y`),
            st(`Divide by ${ms(m)}.`, `y = ${disp}, so f^-1(x) = ${disp}`),
            st("Verify with composition.", `f(f^-1(x)) = ${ms(m)}(${disp})${cst(b)} = (x${cst(-b)})${cst(b)} = x ✓`),
          ],
        };
      }
      const val = `${m}x${cE(-b)}`;
      return {
        prompt: `Find the inverse of f(x) = {x${cst(b)}/${m}}. Type f^-1(x).`,
        answer: expr(val, { lhs: "f^-1(x)", display: linear(m, -b) }),
        hints: ["Swap x and y in y = f(x).", `x = {y${cst(b)}/${m}}. Multiply both sides by ${ms(m)}, then ${b > 0 ? "subtract" : "add"} ${Math.abs(b)}.`],
        steps: [
          st("Write y and swap x and y.", `x = {y${cst(b)}/${m}}`),
          st(`Multiply both sides by ${ms(m)}.`, `${m}x = y${cst(b)}`),
          st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}.`, `y = ${linear(m, -b)}, so f^-1(x) = ${linear(m, -b)}`),
          st("Verify with composition.", `f(f^-1(x)) = {(${linear(m, -b)})${cst(b)}/${m}} = {${m}x/${m}} = x ✓`),
        ],
      };
    }
    if (lv === 2) {
      const a = r.pick([1, 2]);
      const b = r.nonzero(-8, 8);
      const fDisp = `${a === 1 ? "" : a === -1 ? "−" : a}x^3${cst(b)}`;
      const inner = a === 1 ? `x${cst(-b)}` : `{x${cst(-b)}/${a}}`;
      const val = a === 1 ? `cbrt(x${cE(-b)})` : `cbrt((x${cE(-b)})/(${a}))`;
      return {
        prompt: `Find the inverse of f(x) = ${fDisp}. Type f^-1(x) (write a cube root as cbrt( ) or as ( )^(1/3)).`,
        answer: expr(val, { lhs: "f^-1(x)", display: `∛(${inner})` }),
        hints: ["Swap x and y, then undo the operations in reverse order.", `x = ${fDisp.replace("x", "y")}. ${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)}${a !== 1 ? `, divide by ${ms(a)}` : ""}, then take the cube root.`],
        steps: [
          st("Write y and swap x and y.", `x = ${fDisp.replace("x", "y")}`),
          st("Isolate y^3.", `y^3 = ${inner}`),
          st("Take the cube root.", `f^-1(x) = ∛(${inner})`),
          st("Verify with composition.", `f(f^-1(x)) = ${a === 1 ? "" : a === -1 ? "−" : a}(∛(${inner}))^3${cst(b)} = ${a === 1 ? "" : a === -1 ? "−" : a}(${inner})${cst(b)} = x ✓`),
        ],
      };
    }
    const h = r.int(-4, 5), k = r.int(-4, 5);
    const fDisp = `√${binom(h).startsWith("(") ? binom(h) : `(${binom(h)})`}${cst(k)}`;
    const val = `${binomExpr(k)}^2${cE(h)}`;
    const disp = `${binom(k)}^2${cst(h)}`;
    return {
      prompt: `f(x) = ${fDisp} for x ≥ ${ms(h)}. Find f^-1(x). (Its domain is x ≥ ${ms(k)}, the range of f.)`,
      answer: expr(val, { lhs: "f^-1(x)", display: disp }),
      hints: ["Swap x and y, then isolate the square root.", `x${cst(-k)} = √(y${cst(-h)}). Square both sides, then solve for y.`],
      steps: [
        st("Write y and swap x and y.", `x = √(y${cst(-h)})${cst(k)}`),
        st("Isolate the square root.", `x${cst(-k)} = √(y${cst(-h)})`),
        st("Square both sides.", `${binom(k)}^2 = y${cst(-h)}`),
        st("Solve for y.", `f^-1(x) = ${disp}, for x ≥ ${ms(k)}`),
        st("Why the domain is restricted.", `f only outputs values ≥ ${ms(k)}, so the inverse only takes inputs x ≥ ${ms(k)}. That keeps f^-1 on one side of its vertex, so it's one-to-one.`),
        st("Verify with composition.", `f(f^-1(x)) = ${h === 0 ? "" : `√(${disp}${cst(-h)})${cst(k)} = `}√(${binom(k)}^2)${cst(k)} = (x${cst(-k)})${cst(k)} = x for x ≥ ${ms(k)} ✓`),
      ],
    };
  },
};

// ---------- Piecewise ----------

interface Piece { disp: string; typed: string; f: (x: number) => number }

const linPiece = (m: number, b: number): Piece => ({ disp: linear(m, b), typed: linear(m, b).replace(/−/g, "-").replace(/\s/g, ""), f: (x) => m * x + b });

const piecewiseEval: Skill = {
  id: "m4.fn.piecewise-eval",
  title: "Evaluate piecewise functions",
  topic: T,
  standards: ["NC.M4.AF.4.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A piecewise function uses different rules on different intervals. First decide which interval the input is in, then use only that rule.",
    explain: [
      "f(x) = 2x + 1 when x < 3, and x^2 − 4 when x ≥ 3.",
      "f(1): 1 < 3, so use 2x + 1: f(1) = 3. f(3): 3 ≥ 3, so use x^2 − 4: f(3) = **5**. At the boundary, read the inequality signs carefully.",
    ],
    visual: { type: "table", headers: ["Rule", "Interval"], rows: [["2x + 1", "x < 3"], ["x^2 − 4", "x ≥ 3"]] },
  },
  why: [
    { kind: "choice", prompt: "Why can't a piecewise function have one rule for x ≤ 2 and another for x ≥ 2?", choices: ["x = 2 would have two outputs, so it wouldn't be a function.", "Because 2 is not allowed as an input.", "It can; the rules just get averaged."], correct: 0, explain: "Each input must have exactly one output, so the intervals can't overlap." },
    { kind: "written", prompt: "Explain how you decide which rule to use when evaluating a piecewise function at a boundary value.", keyIdeas: ["look at the inequality signs", "the interval with ≤ or ≥ includes the boundary", "use only that piece's rule"], exemplar: "At a boundary I check which interval includes that number, meaning the one with ≤ or ≥ (not < or >). Then I plug the value into that piece's rule only." },
  ],
  generate(r, lv) {
    const c1 = r.int(-2, 2);
    const p1 = linPiece(r.nonzero(-3, 3), r.int(-5, 5));
    if (lv === 1) {
      const p2 = linPiece(r.nonzero(-3, 3), r.int(-5, 5));
      const leftIncl = r.chance(0.5);
      const a = r.pick([c1, c1 - r.int(1, 3), c1 + r.int(1, 3)]);
      const useLeft = leftIncl ? a <= c1 : a < c1;
      const ans = (useLeft ? p1 : p2).f(a);
      const i1 = leftIncl ? `x ≤ ${ms(c1)}` : `x < ${ms(c1)}`, i2 = leftIncl ? `x > ${ms(c1)}` : `x ≥ ${ms(c1)}`;
      return {
        prompt: `f(x) = ${p1.disp} for ${i1}, and ${p2.disp} for ${i2}. Find f(${ms(a)}).`,
        visual: { type: "table", headers: ["Rule", "Interval"], rows: [[p1.disp, i1], [p2.disp, i2]] },
        answer: num(ans),
        hints: [`Which interval contains x = ${ms(a)}?`, `${ms(a)} fits ${useLeft ? i1 : i2}, so use ${useLeft ? p1.disp : p2.disp}.`],
        steps: [st("Pick the interval.", `x = ${ms(a)} satisfies ${useLeft ? i1 : i2}.`), st("Use that rule.", `f(${ms(a)}) = ${(useLeft ? p1 : p2).disp.replace(/x/g, `(${ms(a)})`)} = ${ms(ans)}`)],
        traps: traps(frac(ans), [trap((useLeft ? p2 : p1).f(a), "That's the other piece's rule. Check which interval contains the input.")]),
      };
    }
    const c2 = c1 + r.int(2, 4);
    const q = r.int(-4, 4), s = r.pick([1, -1]);
    const p2: Piece = { disp: `${s < 0 ? "−" : ""}x^2${cst(q)}`, typed: "", f: (x) => s * x * x + q };
    const cv = r.int(-6, 9);
    const p3: Piece = r.chance(0.5) ? linPiece(r.nonzero(-3, 3), r.int(-5, 5)) : { disp: ms(cv), typed: String(cv), f: () => cv };
    const ints = [`x < ${ms(c1)}`, `${ms(c1)} ≤ x ≤ ${ms(c2)}`, `x > ${ms(c2)}`];
    const pieces = [p1, p2, p3];
    const which = (x: number) => (x < c1 ? 0 : x <= c2 ? 1 : 2);
    const cands = [c1 - r.int(1, 3), c1, r.int(c1, c2), c2, c2 + r.int(1, 3)];
    const showRule = (i: number, x: number) => (pieces[i].disp.includes("x") ? pieces[i].disp.replace(/x/g, `(${ms(x)})`) : pieces[i].disp);
    const vis: Visual = { type: "table", headers: ["Rule", "Interval"], rows: pieces.map((p, i) => [p.disp, ints[i]]) };
    const desc = `f(x) = ${p1.disp} for ${ints[0]}; ${p2.disp} for ${ints[1]}; ${p3.disp} for ${ints[2]}.`;
    if (lv === 2) {
      const a = r.pick(cands);
      const i = which(a), ans = pieces[i].f(a);
      const wrong = pieces.map((p) => p.f(a)).filter((_, j) => j !== i);
      return {
        prompt: `${desc} Find f(${ms(a)}).`,
        visual: vis,
        answer: num(ans),
        hints: [`Which interval contains ${ms(a)}? Watch the ≤ and < signs.`, `${ms(a)} is in ${ints[i]}, so use ${pieces[i].disp}.`],
        steps: [st("Pick the interval.", `x = ${ms(a)} is in ${ints[i]}.`), st("Use that rule.", `f(${ms(a)}) = ${showRule(i, a)} = ${ms(ans)}`)],
        traps: traps(frac(ans), wrong.map((w) => trap(w, "That comes from a different piece. Check which interval contains the input."))),
      };
    }
    const a = r.pick([c1, c2]), b = r.pick([c1 - 1, c2 + 1, c1 + 1]);
    const ia = which(a), ib = which(b);
    const fa = pieces[ia].f(a), fb = pieces[ib].f(b);
    const ans = fa - fb;
    return {
      prompt: `${desc} Find f(${ms(a)}) − f(${ms(b)}).`,
      visual: vis,
      answer: num(ans),
      hints: ["Evaluate each value separately, choosing the right piece for each input.", `f(${ms(a)}) uses ${pieces[ia].disp} and f(${ms(b)}) uses ${pieces[ib].disp}.`],
      steps: [
        st(`Evaluate f(${ms(a)}).`, `${ms(a)} is in ${ints[ia]}: f(${ms(a)}) = ${showRule(ia, a)} = ${ms(fa)}`),
        st(`Evaluate f(${ms(b)}).`, `${ms(b)} is in ${ints[ib]}: f(${ms(b)}) = ${showRule(ib, b)} = ${ms(fb)}`),
        st("Subtract.", `${ms(fa)} − ${sn(fb)} = ${ms(ans)}`),
      ],
      traps: traps(frac(ans), [trap(pieces[ia === 1 ? (a === c1 ? 0 : 2) : 1].f(a) - fb, `Check the boundary: ${ms(a)} belongs to ${ints[ia]} because of the ≤ sign.`), trap(fa + fb, "The question asks for the difference, not the sum.")]),
    };
  },
};

const piecewiseGraph: Skill = {
  id: "m4.fn.piecewise-graph",
  title: "Match piecewise graphs and rules",
  topic: T,
  standards: ["NC.M4.AF.4.1"],
  prereqs: ["m4.fn.piecewise-eval"],
  lesson: {
    bigIdea: "Each piece of the graph is part of a familiar function. Open circles mean the endpoint is not included (< or >); closed dots mean it is (≤ or ≥).",
    explain: [
      "Read one piece at a time: find its slope and intercept (lines), vertex (parabolas) or starting point (square roots).",
      "At the break point, the closed dot tells you which piece owns that x-value. In the graph below, f(x) = x + 3 for x < 1 (open circle at (1, 4)) and −2x + 3 for x ≥ 1 (closed dot at (1, 1)).",
    ],
    visual: { type: "plot", xMin: -4, xMax: 5, yMin: -6, yMax: 6, curves: [{ expr: "x+3", domain: [-4, 1] }, { expr: "-2x+3", domain: [1, 5] }], points: [{ x: 1, y: 4, open: true }, { x: 1, y: 1 }] },
  },
  why: [
    { kind: "choice", prompt: "On a piecewise graph, what does an open circle at the end of a piece mean?", choices: ["That point is not part of that piece, so the inequality is strict (< or >).", "The function is not defined everywhere near there.", "The point is included (≤ or ≥)."], correct: 0, explain: "Open means excluded; a closed dot shows which piece includes the boundary value." },
    { kind: "written", prompt: "How can you tell from a graph whether f(2) uses the left piece or the right piece when both pieces end at x = 2?", keyIdeas: ["look for the closed dot at x = 2", "the piece with the closed dot includes x = 2", "the other piece has an open circle there"], exemplar: "I look at x = 2. One piece ends in a filled dot and the other in an open circle. f(2) is the y-value of the filled dot, so that piece's interval uses ≤ or ≥ at 2." },
  ],
  generate(r, lv) {
    const c = r.int(-2, 2);
    const m1 = r.nonzero(-2, 2), b1 = r.int(-3, 3);
    const left = linPiece(m1, b1);
    let right: Piece;
    if (lv === 1) {
      let m2 = r.nonzero(-3, 3), b2 = r.int(-4, 4);
      if (m2 === m1) m2 = -m2;
      if (m2 * c + b2 === m1 * c + b1) b2 += 2;
      right = linPiece(m2, b2);
    } else if (lv === 3) {
      const k = left.f(c) + r.pick([-3, -2, 2, 3]);
      right = r.chance(0.5)
        ? { disp: `√${binom(c).startsWith("(") ? binom(c) : `(${binom(c)})`}${cst(k)}`, typed: `sqrt(${binomExpr(c)})${cE(k)}`, f: (x) => Math.sqrt(x - c) + k }
        : { disp: `2^(${binom(c).replace(/[()]/g, "")})${cst(k)}`, typed: `2^(${binomExpr(c).replace(/[()]/g, "")})${cE(k)}`, f: (x) => 2 ** (x - c) + k };
    } else {
      const k = left.f(c) + r.pick([-3, -2, 2, 3]);
      right = r.chance(0.5)
        ? { disp: `${binom(c)}^2${cst(k)}`, typed: `${binomExpr(c)}^2${cE(k)}`, f: (x) => (x - c) ** 2 + k }
        : { disp: `−${binom(c)}^2${cst(k)}`, typed: `-${binomExpr(c)}^2${cE(k)}`, f: (x) => -((x - c) ** 2) + k };
    }
    const leftIncl = r.chance(0.5);
    const xMin = c - 5, xMax = c + 5;
    const sample: number[] = [];
    for (let x = xMin; x <= xMax; x += 0.5) sample.push(x <= c ? left.f(x) : Math.min(right.f(x), 12));
    sample.push(left.f(c), right.f(c));
    const yMin = Math.max(Math.floor(Math.min(...sample)) - 1, -12), yMax = Math.min(Math.ceil(Math.max(...sample)) + 1, 12);
    const vis: Visual = {
      type: "plot", xMin, xMax, yMin: Math.min(yMin, -1), yMax: Math.max(yMax, 1),
      curves: [{ expr: left.typed, domain: [xMin, c] }, { expr: right.typed, domain: [c, xMax] }],
      points: [{ x: c, y: left.f(c), open: !leftIncl }, { x: c, y: right.f(c), open: leftIncl }],
    };
    const C = ms(c);
    const rule = (a: Piece, ia: string, b: Piece, ib: string) => `${a.disp} if ${ia};  ${b.disp} if ${ib}`;
    const L = leftIncl ? `x ≤ ${C}` : `x < ${C}`, R = leftIncl ? `x > ${C}` : `x ≥ ${C}`;
    const Lw = leftIncl ? `x < ${C}` : `x ≤ ${C}`, Rw = leftIncl ? `x ≥ ${C}` : `x > ${C}`;
    const wrongLeft = linPiece(-m1, b1);
    const correct = rule(left, L, right, R);
    const ans = choice(r, correct, [
      [rule(left, Lw, right, Rw), "Check the dots at the break: the closed dot shows which piece includes that x-value."],
      [rule(right, L, left, R), "The pieces are on the wrong sides. Which rule matches the graph to the left of the break?"],
      [rule(wrongLeft, L, right, R), `Check the slope of the left piece: it ${m1 > 0 ? "rises" : "falls"} from left to right.`],
    ]);
    return {
      prompt: `Which rule matches the piecewise function graphed below?`,
      visual: vis,
      answer: ans,
      hints: [
        `Look at the left piece first: is it a line? Find its slope and y-intercept.`,
        `At x = ${C}, the closed dot is on the ${leftIncl ? "left" : "right"} piece, so that piece uses ${leftIncl ? "≤" : "≥"}.`,
        lv === 2 ? `The right piece is a parabola with vertex (${C}, ${ms(right.f(c))}).` : lv === 3 ? `The right piece starts at (${C}, ${ms(right.f(c))}) and passes through (${ms(c + 1)}, ${ms(right.f(c + 1))}). Is it a square root or an exponential curve?` : `The right piece passes through (${C}, ${ms(right.f(c))}) and (${ms(c + 1)}, ${ms(right.f(c + 1))}).`,
      ],
      steps: [
        st("Left piece.", `It's a line with slope ${ms(m1)} through (${C}, ${ms(left.f(c))}): ${left.disp}.`),
        st("Right piece.", lv === 1 ? `A line through (${C}, ${ms(right.f(c))}) and (${ms(c + 1)}, ${ms(right.f(c + 1))}): ${right.disp}.` : lv === 3 ? `${right.disp.startsWith("√") ? "A square-root curve" : "An exponential curve (it doubles its distance above the asymptote each step)"} starting at (${C}, ${ms(right.f(c))}) through (${ms(c + 1)}, ${ms(right.f(c + 1))})${right.disp.startsWith("√") ? ` and (${ms(c + 4)}, ${ms(right.f(c + 4))})` : ""}: ${right.disp}.` : `A parabola opening ${right.f(c + 1) > right.f(c) ? "up" : "down"} with vertex (${C}, ${ms(right.f(c))}): ${right.disp}.`),
        st("The break point.", `The closed dot at x = ${C} is on the ${leftIncl ? "left" : "right"} piece, so the left interval is ${L} and the right is ${R}.`),
        st("Answer.", `f(x) = ${correct}`),
      ],
    };
  },
};

const piecewiseModel: Skill = {
  id: "m4.fn.piecewise-model",
  title: "Piecewise models in context",
  topic: T,
  standards: ["NC.M4.AF.4.2"],
  prereqs: ["m4.fn.piecewise-eval"],
  lesson: {
    bigIdea: "When a rate changes after a threshold (overtime, data overages, tiered prices), model it with a piecewise function.",
    explain: [
      "A phone plan costs $40 a month and includes 10 GB. Each extra GB costs $5. For g ≤ 10 the cost is just 40. For g > 10, you pay 40 plus 5 for each GB over 10: 40 + 5(g − 10).",
      "So C(g) = 40 for 0 ≤ g ≤ 10, and 40 + 5(g − 10) for g > 10. Using 13 GB costs 40 + 5(3) = **$55**.",
      "Notice the second piece uses (g − 10), the amount *over* the threshold, not all g gigabytes.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 20, yMin: 0, yMax: 100, xStep: 2, yStep: 10, curves: [{ expr: "40", domain: [0, 10] }, { expr: "40+5(x-10)", domain: [10, 20] }] },
  },
  why: [
    { kind: "choice", prompt: "In C(g) = 40 + 5(g − 10) for g > 10, why is it (g − 10) and not g?", choices: ["Only the gigabytes over 10 cost extra; the first 10 are covered by the $40.", "To make the cost smaller.", "Because the slope is 10."], correct: 0, explain: "g − 10 counts the overage." },
    { kind: "written", prompt: "Explain why the two pieces of a phone-plan model like this should meet at the threshold.", keyIdeas: ["using exactly the threshold costs the base price", "a tiny bit more should cost only a tiny bit more", "both pieces give the same value at the threshold, so there's no jump"], exemplar: "At exactly 10 GB both rules give $40. Going a little past 10 GB adds a small overage charge, so the cost shouldn't suddenly jump. The pieces meet at (10, 40), which makes the graph continuous." },
  ],
  generate(r, lv) {
    const overtime = r.chance(0.5);
    const name = r.pick(PEOPLE);
    if (overtime) {
      const w = r.pick([12, 14, 16, 18, 20]);
      const ot = 1.5 * w;
      const h = 40 + r.int(2, 12);
      const pay = 40 * w + ot * (h - 40);
      const intro = `${name} earns $${w} an hour for the first 40 hours of a week and time-and-a-half ($${ot} an hour) for each hour over 40.`;
      const model = `P(h) = ${w}h for 0 ≤ h ≤ 40; ${40 * w} + ${ot}(h − 40) for h > 40`;
      if (lv === 1) {
        return {
          prompt: `${intro} How much does ${name} earn for ${h} hours?`,
          answer: num(pay, { pre: "$" }),
          hints: ["Split the hours into regular (first 40) and overtime.", `Regular: 40 × $${w}. Overtime: ${h - 40} × $${ot}.`],
          steps: [st("Regular pay.", `40 × ${w} = ${money(40 * w)}`), st("Overtime pay.", `${h - 40} × ${ot} = ${money(ot * (h - 40))}`), st("Total.", `${money(40 * w)} + ${money(ot * (h - 40))} = ${money(pay)}`)],
          traps: traps(frac(pay), [trap(ot * h, "Time-and-a-half only applies to the hours over 40."), trap(w * h, "The hours over 40 are paid at the higher rate."), trap(40 * w + ot * h, "Overtime pay is for the hours over 40 only, not all hours.")]),
        };
      }
      if (lv === 2) {
        return {
          prompt: `${intro} Which piecewise function gives ${name}'s weekly pay P(h) for h hours?`,
          answer: choice(r, model, [
            [`P(h) = ${w}h for 0 ≤ h ≤ 40; ${ot}h for h > 40`, "That pays time-and-a-half on every hour once you pass 40, not just the extra hours."],
            [`P(h) = ${w}h for 0 ≤ h ≤ 40; ${40 * w} + ${ot}h for h > 40`, "The overtime part should count hours over 40: (h − 40)."],
            [`P(h) = ${w}h for 0 ≤ h ≤ 40; ${40 * w} + ${w}(h − 40) for h > 40`, `Overtime hours are paid $${ot}, not $${w}.`],
          ]),
          hints: ["Up to 40 hours, pay is the hourly rate times h.", `After 40 hours, it's the pay for 40 hours ($${40 * w}) plus $${ot} for each hour over 40.`],
          steps: [st("First piece.", `0 ≤ h ≤ 40: P(h) = ${w}h`), st("Second piece.", `h > 40: 40 hours earn ${money(40 * w)}, and the (h − 40) extra hours earn ${ot} each: ${40 * w} + ${ot}(h − 40).`)],
        };
      }
      return {
        prompt: `${intro} One week ${name} earned ${money(pay)}. How many hours did ${name} work?`,
        answer: num(h),
        hints: [`${money(pay)} is more than ${money(40 * w)} (40 hours of pay), so ${name} worked overtime.`, `Solve ${40 * w} + ${ot}(h − 40) = ${pay}.`],
        steps: [st("Decide which piece applies.", `40 hours pays ${money(40 * w)} < ${money(pay)}, so use the overtime piece.`), st("Subtract the regular pay.", `${pay} − ${40 * w} = ${pay - 40 * w}`), st("Divide by the overtime rate.", `${pay - 40 * w} ÷ ${ot} = ${h - 40} overtime hours`), st("Add the regular hours.", `40 + ${h - 40} = ${h} hours`)],
        traps: traps(frac(h), [trap(h - 40, "That's only the overtime hours. Add the first 40."), trap(pay / w, `Not every hour was paid $${w}.`)]),
      };
    }
    const base = r.pick([30, 35, 40, 45]), cap = r.pick([5, 8, 10, 15]), k = r.pick([5, 8, 10]);
    const g = cap + r.int(2, 6);
    const bill = base + k * (g - cap);
    const intro = `A phone plan costs $${base} a month and includes ${cap} GB of data. Each extra GB costs $${k}.`;
    const model = `C(g) = ${base} for 0 ≤ g ≤ ${cap}; ${base} + ${k}(g − ${cap}) for g > ${cap}`;
    const vis: Visual = { type: "plot", xMin: 0, xMax: cap + 10, yMin: 0, yMax: base + k * 10 + 10, xStep: cap + 10 > 20 ? 5 : 2, yStep: 10, curves: [{ expr: String(base), domain: [0, cap] }, { expr: `${base}+${k}(x-${cap})`, domain: [cap, cap + 10] }] };
    if (lv === 1) {
      return {
        prompt: `${intro} What is the bill for a month with ${g} GB of data?`,
        visual: vis,
        answer: num(bill, { pre: "$" }),
        hints: [`How many GB are over the ${cap} GB limit?`, `${g} − ${cap} = ${g - cap} extra GB at $${k} each, plus the $${base} base.`],
        steps: [st("Find the overage.", `${g} − ${cap} = ${g - cap} GB`), st("Overage charge.", `${g - cap} × ${k} = ${money(k * (g - cap))}`), st("Total.", `${base} + ${k * (g - cap)} = ${money(bill)}`)],
        traps: traps(frac(bill), [trap(base + k * g, `Only the GB over ${cap} cost extra.`), trap(k * (g - cap), `Don't forget the $${base} base price.`)]),
      };
    }
    if (lv === 2) {
      return {
        prompt: `${intro} Which piecewise function models the monthly cost C for g GB?`,
        answer: choice(r, model, [
          [`C(g) = ${base} for 0 ≤ g ≤ ${cap}; ${base} + ${k}g for g > ${cap}`, `That charges $${k} for every GB, including the ${cap} that are already included.`],
          [`C(g) = ${base} + ${k}g for all g ≥ 0`, `The first ${cap} GB are included in the $${base}.`],
          [`C(g) = ${base} for 0 ≤ g ≤ ${cap}; ${k}(g − ${cap}) for g > ${cap}`, `The $${base} base price still applies after you pass ${cap} GB.`],
        ]),
        hints: [`Up to ${cap} GB the cost doesn't change.`, `Over ${cap} GB, add $${k} for each GB over: (g − ${cap}).`],
        steps: [st("First piece.", `0 ≤ g ≤ ${cap}: C(g) = ${base}`), st("Second piece.", `g > ${cap}: C(g) = ${base} + ${k}(g − ${cap})`), st("Check the break.", `At g = ${cap} both give ${base}, so the graph doesn't jump.`)],
      };
    }
    return {
      prompt: `${intro} One month's bill was ${money(bill)}. How many GB were used?`,
      visual: vis,
      answer: num(g, { unit: " GB" }),
      hints: [`The bill is over $${base}, so use the second piece.`, `Solve ${base} + ${k}(g − ${cap}) = ${bill}.`],
      steps: [st("Subtract the base.", `${bill} − ${base} = ${bill - base}`), st("Divide by the overage rate.", `${bill - base} ÷ ${k} = ${g - cap} GB over`), st("Add the included data.", `${cap} + ${g - cap} = ${g} GB`)],
      traps: traps(frac(g), [trap(g - cap, `That's only the overage. Add the ${cap} included GB.`), trap(bill / k, "The first part of the bill is the base price, not overage.")]),
    };
  },
};

export default [composeEval, composeAlgebra, composeReps, composeModel, inverse, piecewiseEval, piecewiseGraph, piecewiseModel] satisfies Skill[];
