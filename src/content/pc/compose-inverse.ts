// Unit 1: Composition and inverse functions (PC.F.5.1–PC.F.5.7).
import { choice, cst, exact, expr, linear, ms, num, poly, polyExpr, sn, term, trap, traps, money } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { shiftExpr, shiftText } from "./util";

const T = "pc-compose-inverse";

// Polynomials stored lowest power first: [c0, c1, c2] = c0 + c1·x + c2·x².
const pAdd = (a: number[], b: number[]) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));
const pMul = (a: number[], b: number[]) => {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)));
  return out;
};
const pCompose = (f: number[], g: number[]) => {
  let out = [0], pow = [1];
  f.forEach((c, i) => {
    if (i > 0) pow = pMul(pow, g);
    out = pAdd(out, pow.map((x) => x * c));
  });
  return out;
};
const show = (p: number[]) => poly([...p].reverse());
const typed = (p: number[]) => polyExpr([...p].reverse());
const evalP = (p: number[], x: number) => p.reduce((s, c, i) => s + c * x ** i, 0);
/** "a(cx + d) + b" style substitution text: f with every x replaced by (inner). */
const subst = (f: number[], inner: string) => {
  const parts: string[] = [];
  for (let i = f.length - 1; i >= 0; i--) {
    const c = f[i];
    if (c === 0) continue;
    const a = Math.abs(c);
    const body = i === 0 ? String(a) : `${a === 1 ? "" : a}(${inner})${i > 1 ? `^${i}` : ""}`;
    parts.push(parts.length === 0 ? (c < 0 ? "−" : "") + body : (c < 0 ? " − " : " + ") + body);
  }
  return parts.join("");
};

const compose: Skill = {
  id: "pc.compinv.compose",
  title: "Compose two functions",
  topic: T,
  standards: ["PC.F.5.1"],
  prereqs: [],
  lesson: {
    bigIdea: "f(g(x)) means: run x through g first, then feed g's output into f. Algebraically, replace every x in f with the whole expression g(x).",
    explain: [
      "Think of each function as a machine. In f(g(x)) the inside machine g runs first; its output becomes the input of f. The notation (f ∘ g)(x) means the same thing.",
      "Example: f(x) = 3x − 1 and g(x) = x^2 + 2. Then f(g(x)) = 3(x^2 + 2) − 1 = **3x^2 + 5**.",
      "Order matters: g(f(x)) = (3x − 1)^2 + 2 = 9x^2 − 6x + 3, which is a different function.",
    ],
    tip: "Put the inside function in parentheses every time you substitute. Most errors come from dropping them, especially with squares.",
  },
  why: [
    { kind: "choice", prompt: "Why is f(g(x)) usually different from g(f(x))?", choices: ["The order of the operations changes: squaring then tripling is not the same as tripling then squaring.", "Because f and g have different letters.", "They are always equal; composition is commutative.", "Because you can only compose linear functions."], correct: 0, explain: "Composition applies one function's steps after the other's. Swapping the order changes which steps happen first, so the results usually differ." },
    { kind: "written", prompt: "Explain, in your own words, how to find f(g(x)) when f(x) = 2x + 5 and g(x) = x^2.", keyIdeas: ["g is applied first", "replace x in f with g(x) = x^2", "f(g(x)) = 2x^2 + 5"], exemplar: "f(g(x)) means do g first, so the input to f is x^2. I replace the x in 2x + 5 with x^2 and get 2x^2 + 5." },
  ],
  generate(r, lv) {
    let f: number[], g: number[];
    if (lv === 1) {
      f = [r.int(-6, 6), r.nonzero(-5, 5)];
      g = [r.int(-6, 6), r.nonzero(-4, 4)];
    } else if (lv === 2) {
      const lin = [r.nonzero(-5, 5), r.pick([2, 3, -2, 4])];
      const quad = [r.int(-5, 5), 0, r.pick([1, 1, 2, -1])];
      [f, g] = r.chance(0.5) ? [lin, quad] : [quad, lin];
    } else {
      f = [r.int(-4, 4), r.nonzero(-4, 4), r.pick([1, 2, -1])];
      g = [r.nonzero(-4, 4), r.pick([2, 3, -2])];
    }
    const order = r.chance(0.5);
    const [outer, inner, on, inn] = order ? [f, g, "f", "g"] : [g, f, "g", "f"];
    const res = pCompose(outer, inner);
    const subText = subst(outer, show(inner));
    return {
      prompt: `f(x) = ${show(f)} and g(x) = ${show(g)}. Find ${on}(${inn}(x)) and simplify.`,
      answer: expr(typed(res), { lhs: `${on}(${inn}(x))`, display: show(res) }),
      hints: [
        `${on}(${inn}(x)) means ${inn} goes first. Its output, ${show(inner)}, is the input to ${on}.`,
        `Replace every x in ${on}(x) = ${show(outer)} with (${show(inner)}).`,
        `You should get ${subText}. Now expand and combine like terms.`,
      ],
      steps: [
        st(`Start with the outside function ${on}.`, `${on}(x) = ${show(outer)}`),
        st(`Replace each x with ${inn}(x) = ${show(inner)}.`, `${on}(${inn}(x)) = ${subText}`),
        ...(outer.length === 3 ? [st("Square the binomial.", `(${show(inner)})^2 = ${show(pMul(inner, inner))}`)] : []),
        st("Distribute and combine like terms.", `${on}(${inn}(x)) = ${show(res)}`),
        st("Quick check with x = 1.", `${inn}(1) = ${ms(evalP(inner, 1))}, and ${on}(${ms(evalP(inner, 1))}) = ${ms(evalP(outer, evalP(inner, 1)))}. The answer at x = 1 gives ${ms(evalP(res, 1))} ✓`),
      ],
    };
  },
};

const evalReps: Skill = {
  id: "pc.compinv.eval-reps",
  title: "Evaluate composites from tables and graphs",
  topic: T,
  standards: ["PC.F.5.2"],
  prereqs: ["pc.compinv.compose"],
  lesson: {
    bigIdea: "To evaluate f(g(a)), work from the inside out: find g(a) first (from a table, graph or formula), then use that number as the input to f.",
    explain: [
      "Suppose the table says g(2) = 5 and f(5) = 1. Then f(g(2)) = f(5) = **1**.",
      "With a graph, g(2) is the y-value of the graph of g above x = 2. With a formula, substitute.",
      "(f ∘ g)(2) is another way to write f(g(2)).",
    ],
    visual: { type: "table", headers: ["x", "1", "2", "3", "4", "5"], rows: [["f(x)", 4, 3, 0, 2, 1], ["g(x)", 3, 5, 1, 4, 2]] },
    tip: "Write the middle value down: f(g(2)) = f(5) = 1. Skipping that line is where answers flip.",
  },
  why: [
    { kind: "choice", prompt: "To find f(g(3)) from a table, why do you look up g first?", choices: ["g is the inside function, so its output is the number f acts on.", "Because g comes after f in the alphabet.", "You look up f(3) first, then g of that.", "You multiply f(3) and g(3)."], correct: 0, explain: "In f(g(3)), the input 3 goes into g. Only after you know g(3) can you evaluate f." },
    { kind: "written", prompt: "A table shows g(1) = 4 and f(4) = −2. Explain how to find f(g(1)) and why it isn't the same as g(f(1)).", keyIdeas: ["evaluate g(1) = 4 first", "then f(4) = −2", "g(f(1)) uses f first, which is a different chain of lookups"], exemplar: "Start inside: g(1) = 4. Then f(g(1)) = f(4) = −2. For g(f(1)) you would look up f(1) first and then put that into g, which follows a different path through the table." },
  ],
  generate(r, lv) {
    const xs = [0, 1, 2, 3, 4, 5];
    const fv = xs.map(() => r.int(0, 5));
    const gv = xs.map(() => r.int(0, 5));
    const a = r.int(0, 5);
    const table = { type: "table" as const, headers: ["x", ...xs.map(String)], rows: [["f(x)", ...fv], ...(lv === 1 ? [["g(x)", ...gv]] : [])] };
    if (lv === 1) {
      const ga = gv[a], ans = fv[ga];
      return {
        prompt: `Use the table to find f(g(${a})).`,
        visual: table,
        answer: num(ans),
        hints: [`Work from the inside out. Find g(${a}) in the g row first.`, `g(${a}) = ${ga}. Now find f(${ga}) in the f row.`],
        steps: [st("Find the inside value.", `g(${a}) = ${ga}`), st("Use it as the input to f.", `f(g(${a})) = f(${ga}) = ${ans}`)],
        traps: traps(frac(ans), [trap(gv[fv[a]], `That's g(f(${a})): you used f first. In f(g(${a})), g is the inside function.`), trap(fv[a], `That's just f(${a}). Find g(${a}) first, then put that into f.`), trap(fv[a] * gv[a], "Composition isn't multiplication. Put the output of g into f.")]),
      };
    }
    if (lv === 2) {
      const m = r.pick([2, -1, 3, -2]);
      const target = r.int(0, 5);
      const b = target - m * a;
      const ans = fv[target];
      return {
        prompt: `g(x) = ${linear(m, b)}, and f is given by the table. Find (f ∘ g)(${a}).`,
        visual: table,
        answer: num(ans),
        hints: [`(f ∘ g)(${a}) means f(g(${a})). Start by evaluating g(${a}) with the formula.`, `g(${a}) = ${m === -1 ? "−" : ms(m) + " · "}${m === -1 ? a : sn(a)}${cst(b)} = ${target}. Now look up f(${target}).`],
        steps: [st("Rewrite the notation.", `(f ∘ g)(${a}) = f(g(${a}))`), st("Evaluate the inside function.", `g(${a}) = ${m === -1 ? "−" + a : `${ms(m)}(${a})`}${cst(b)} = ${target}`), st("Look up f at that value.", `f(${target}) = ${ans}`)],
        traps: traps(frac(ans), [trap(fv[a], `That's f(${a}). The input to f should be g(${a}) = ${target}.`), trap(m * fv[a] + b, `That's g(f(${a})): the order is reversed. In f ∘ g, g acts first.`)]),
      };
    }
    // Level 3: g from a graph, f from the table; find g(f(a)) and f(g(b)) and add.
    const h = r.pick([2, 3]), c = r.pick([0, 1]);
    const g = (x: number) => Math.abs(x - h) + c;
    const b = r.int(0, 5);
    const fa = fv[a], gfa = g(fa), gb = g(b), fgb = fv[gb];
    const ans = gfa + fgb;
    return {
      prompt: `f is given by the table and g(x) is shown in the graph. Find g(f(${a})) + f(g(${b})).`,
      visual: { type: "plot", xMin: -1, xMax: 6, yMin: -1, yMax: 6, curves: [{ expr: `abs(x-${h})${c ? "+" + c : ""}`, label: "g", domain: [0, 5] }], points: xs.map((x) => ({ x, y: g(x), label: `(${x}, ${g(x)})` })) },
      answer: num(ans),
      hints: [`Do each composite separately, inside first. For g(f(${a})), find f(${a}) in the table.`, `f(${a}) = ${fa}, so read g(${fa}) from the graph. For f(g(${b})), read g(${b}) from the graph first.`, `g(f(${a})) = ${gfa} and g(${b}) = ${gb}. Look up f(${gb}) and add.`],
      steps: [
        st(`First composite: inside is f(${a}).`, `From the table f(${a}) = ${fa}. From the graph g(${fa}) = ${gfa}. So g(f(${a})) = ${gfa}.`),
        st(`Second composite: inside is g(${b}).`, `From the graph g(${b}) = ${gb}. From the table f(${gb}) = ${fgb}. So f(g(${b})) = ${fgb}.`),
        st("Add.", `${gfa} + ${fgb} = ${ans}`),
      ],
      traps: traps(frac(ans), [trap(fv[g(a)] + g(fv[b]), "You reversed the order in both composites. In g(f(a)), f acts first.")]),
    };
  },
};

const domain: Skill = {
  id: "pc.compinv.domain",
  title: "Domain of a composite function",
  topic: T,
  standards: ["PC.F.5.3"],
  prereqs: ["pc.compinv.compose"],
  lesson: {
    bigIdea: "x is in the domain of f(g(x)) when x is allowed in g AND g(x) is allowed in f.",
    explain: [
      "Two checks: (1) can g accept x? (2) can f accept the output g(x)?",
      "Example: f(x) = √x and g(x) = x − 4. Then f(g(x)) = √(x − 4). The square root needs x − 4 ≥ 0, so the domain is **x ≥ 4**, or [4, ∞).",
      "Example: f(x) = {1/x − 2} and g(x) = √x. g needs x ≥ 0. f can't accept 2, so √x ≠ 2, meaning x ≠ 4. Domain: [0, 4) ∪ (4, ∞).",
    ],
    tip: "Don't only look at the simplified formula. A restriction from the inside function can disappear when you simplify, but it still counts.",
  },
  why: [
    { kind: "choice", prompt: "f(x) = x^2 and g(x) = √x. The formula f(g(x)) simplifies to x. Why is the domain of f(g(x)) only x ≥ 0?", choices: ["x must first be a legal input of g, and √x needs x ≥ 0.", "Because x^2 is always positive.", "The domain is all real numbers since the formula is just x.", "Because f has a restricted domain."], correct: 0, explain: "The composite can only use inputs that make it through g. Negative numbers never get past √x, even though the simplified formula looks unrestricted." },
    { kind: "written", prompt: "Explain why x = 4 is not in the domain of f(g(x)) when f(x) = 1/x and g(x) = x − 4.", keyIdeas: ["g(4) = 0", "0 is not allowed as an input of f because 1/0 is not defined", "so 4 must be excluded"], exemplar: "g(4) = 4 − 4 = 0, and f can't take 0 because you can't divide by zero. Since 4 makes the inside output a forbidden input for f, 4 is not in the domain of the composite." },
  ],
  generate(r, lv) {
    const type = lv === 3 ? "nested" : r.pick(["sqrt", "recip"]);
    if (type === "nested") {
      const a = r.int(1, 5);
      const sq = a * a;
      return {
        prompt: `f(x) = {1/x − ${a}} and g(x) = √x. What is the domain of f(g(x))?`,
        answer: choice(r, `[0, ${sq}) ∪ (${sq}, ∞)`, [[`[0, ∞)`, `Check f too: f can't accept ${a}, and √x = ${a} when x = ${sq}.`], [`[0, ${a}) ∪ (${a}, ∞)`, `The problem is when √x = ${a}, which happens at x = ${sq}, not x = ${a}.`], [`All real numbers except ${sq}`, "g = √x needs x ≥ 0, so negative inputs are out too."], [`(${a}, ∞)`, `Values between 0 and ${sq} work fine; only ${sq} is a problem (plus negatives).`]]),
        hints: ["Check two things: which x can go into g, and which outputs of g can go into f.", `g(x) = √x needs x ≥ 0. f can't take ${a} (it would divide by zero).`, `Solve √x = ${a} to find the x you must remove.`],
        steps: [
          st("Write the composite.", `f(g(x)) = {1/√x − ${a}}`),
          st("Inputs allowed in g.", "√x needs x ≥ 0."),
          st("Outputs that f can't accept.", `f(x) = {1/x − ${a}} is not defined at x = ${a}, so we need √x ≠ ${a}, which means x ≠ ${sq}.`),
          st("Combine.", `x ≥ 0 and x ≠ ${sq}: [0, ${sq}) ∪ (${sq}, ∞)`),
        ],
      };
    }
    const t = r.int(-6, 6);
    const m = lv === 1 ? 1 : r.pick([2, 3, -2, -1, 4]);
    const b = -m * t;
    const gText = linear(m, b);
    if (type === "sqrt") {
      const right = m > 0;
      const correct = right ? `[${ms(t)}, ∞)` : `(−∞, ${ms(t)}]`;
      return {
        prompt: `f(x) = √x and g(x) = ${gText}. What is the domain of f(g(x))?`,
        answer: choice(r, correct, [[right ? `(${ms(t)}, ∞)` : `(−∞, ${ms(t)})`, `√0 = 0 is fine, so x = ${ms(t)} is included. Use a bracket.`], [right ? `(−∞, ${ms(t)}]` : `[${ms(t)}, ∞)`, m < 0 ? "Dividing by a negative flips the inequality." : "Check the direction: the inside must be ≥ 0."], [`[${ms(-t)}, ∞)`, `Solve ${gText} ≥ 0 carefully; the sign of the boundary is off.`], ["All real numbers", "A square root can't take negative inputs."]]),
        hints: [`f(g(x)) = √(${gText}). A square root needs its inside to be ≥ 0.`, `Solve ${gText} ≥ 0.${m < 0 ? " Remember to flip the inequality when you divide by a negative." : ""}`],
        steps: [
          st("Write the composite.", `f(g(x)) = √(${gText})`),
          st("The inside of the square root must be ≥ 0.", `${gText} ≥ 0`),
          st("Solve.", m === 1 ? `x ≥ ${ms(t)}` : `${term(m, "x")} ≥ ${ms(-b)}, so x ${m > 0 ? "≥" : "≤"} ${ms(t)}${m < 0 ? " (flip: dividing by a negative)" : ""}`),
          st("Write in interval notation.", correct),
        ],
      };
    }
    return {
      prompt: `f(x) = {1/x} and g(x) = ${gText}. What is the domain of f(g(x))?`,
      answer: choice(r, `All real numbers except ${ms(t)}`, [[`All real numbers except ${ms(-t)}`, `Solve ${gText} = 0 again; check the sign.`], [`(${ms(t)}, ∞)`, `Numbers less than ${ms(t)} work too; only ${ms(t)} makes the bottom zero.`], ["All real numbers", `At x = ${ms(t)}, g(x) = 0 and f can't divide by zero.`], ["All real numbers except 0", `0 is the forbidden input of f, but the question is which x makes g(x) = 0.`]]),
      hints: [`f(g(x)) = {1/${gText}}. Which x makes the bottom zero?`, `Solve ${gText} = 0.`],
      steps: [st("Write the composite.", `f(g(x)) = {1/${gText}}`), st("The denominator can't be 0.", `${gText} = 0 when x = ${ms(t)}.`), st("Domain.", `All real numbers except ${ms(t)}.`)],
    };
  },
};

const model: Skill = {
  id: "pc.compinv.model",
  title: "Model with composition",
  topic: T,
  standards: ["PC.F.5.4"],
  prereqs: ["pc.compinv.compose"],
  lesson: {
    bigIdea: "When the output of one process is the input to another, the whole chain is a composite function.",
    explain: [
      "A road trip: G(m) = {m/30} gallons used for m miles, and C(G) = 3.5G dollars for G gallons. The cost of m miles is C(G(m)) = 3.5 · {m/30}.",
      "For 240 miles: G(240) = 8 gallons, and C(8) = **$28**.",
      "Always ask: which quantity comes first? That function goes on the inside.",
    ],
    tip: "Match units: the output units of the inside function must be the input units of the outside one.",
  },
  why: [
    { kind: "choice", prompt: "A store takes 20% off with D(x) = 0.8x, then subtracts a $10 coupon with C(x) = x − 10. Why is the final price C(D(x)) and not D(C(x))?", choices: ["The discount happens first, so D is the inside function.", "Because C comes before D in the alphabet.", "The two orders always give the same price.", "Because the coupon is bigger than the discount."], correct: 0, explain: "The inside function is the step that happens first. C(D(x)) applies the discount and then the coupon." },
    { kind: "written", prompt: "A ripple's radius is r(t) = 3t cm after t seconds, and a circle's area is A(r) = πr^2. Explain what A(r(t)) represents and find it.", keyIdeas: ["r(t) gives the radius at time t", "A of that radius gives the area at time t", "A(r(t)) = π(3t)^2 = 9πt^2"], exemplar: "r(t) turns time into a radius, and A turns a radius into an area. So A(r(t)) gives the area of the ripple t seconds after it starts: π(3t)^2 = 9πt^2 square centimeters." },
  ],
  generate(r, lv) {
    const kind = lv === 1 ? r.pick(["gas", "money"]) : lv === 2 ? r.pick(["ripple", "shop"]) : r.pick(["ripple-expr", "shop-order"]);
    if (kind === "gas") {
      const mpg = r.pick([25, 30, 32, 40]);
      const price = r.pick([3, 3.5, 4]);
      const gal = r.int(4, 12);
      const miles = gal * mpg;
      const cost = gal * price;
      return {
        prompt: `A car uses G(m) = {m/${mpg}} gallons of gas to drive m miles. Gas costs C(g) = ${price}g dollars for g gallons. Find C(G(${miles})), the cost of a ${miles}-mile trip.`,
        answer: num(cost, { pre: "$" }),
        hints: ["Inside first: how many gallons does the trip use?", `G(${miles}) = ${miles} ÷ ${mpg} = ${gal} gallons. Now find the cost of ${gal} gallons.`],
        steps: [st("Evaluate the inside function.", `G(${miles}) = {${miles}/${mpg}} = ${gal} gallons`), st("Put that into C.", `C(${gal}) = ${price} · ${gal} = ${money(cost)}`)],
        traps: traps(frac(cost), [trap(miles * price, "That treats miles as gallons. Convert miles to gallons with G first."), trap(gal, "That's the number of gallons. Now find what they cost.")]),
      };
    }
    if (kind === "money") {
      const rate = r.pick([0.9, 0.8, 0.75]);
      const yen = r.pick([150, 160, 120]);
      const d = r.pick([40, 60, 80, 100, 120]);
      const e = Math.round(d * rate * 100) / 100, y = Math.round(e * yen);
      return {
        prompt: `On a trip, E(d) = ${rate}d converts d dollars to euros and Y(e) = ${yen}e converts e euros to yen. Find Y(E(${d})).`,
        answer: num(y, { unit: " yen" }),
        hints: ["Inside first: how many euros is the dollar amount?", `E(${d}) = ${rate} · ${d} = ${e} euros. Now convert to yen.`],
        steps: [st("Dollars to euros.", `E(${d}) = ${rate} · ${d} = ${e}`), st("Euros to yen.", `Y(${e}) = ${yen} · ${e} = ${y}`), st("Meaning.", `${d} dollars is worth ${y} yen.`)],
        traps: traps(frac(y), [trap(d * yen, "That skips the euro step. The yen function takes euros as its input.")]),
      };
    }
    if (kind === "ripple" || kind === "ripple-expr") {
      const v = r.int(2, 6);
      if (kind === "ripple-expr") {
        return {
          prompt: `A pebble makes a circular ripple whose radius is r(t) = ${v}t cm after t seconds. The area of a circle is A(r) = πr^2. Write A(r(t)), the ripple's area as a function of time.`,
          answer: expr(`${v * v}pi t^2`, { vars: ["t"], lhs: "A(r(t))", display: `${v * v}πt^2` }),
          hints: ["Replace r in A(r) = πr^2 with r(t).", `A(r(t)) = π(${v}t)^2. Square both the ${v} and the t.`],
          steps: [st("Substitute the radius function.", `A(r(t)) = π(${v}t)^2`), st("Square.", `(${v}t)^2 = ${v * v}t^2, so A(r(t)) = ${v * v}πt^2 square centimeters.`)],
        };
      }
      const t = r.int(2, 5);
      const R = v * t;
      return {
        prompt: `A ripple's radius is r(t) = ${v}t cm after t seconds, and A(r) = πr^2. Find A(r(${t})) exactly (in terms of π).`,
        answer: exact(`${R * R}pi`, `${R * R}π`),
        hints: [`Inside first: r(${t}) = ${v} · ${t}.`, `The radius is ${R} cm. Now A(${R}) = π · ${R}^2.`],
        steps: [st("Find the radius.", `r(${t}) = ${v} · ${t} = ${R} cm`), st("Find the area.", `A(${R}) = π · ${R}^2 = ${R * R}π cm^2`)],
      };
    }
    const p = r.pick([10, 20, 25, 30]);
    const c = r.pick([5, 10, 15, 20]);
    const x = r.pick([60, 80, 100, 120, 140]);
    const keep = 1 - p / 100;
    const cd = keep * x - c, dc = keep * (x - c);
    if (kind === "shop") {
      return {
        prompt: `Sneakers cost $${x}. D(x) = ${keep}x takes ${p}% off and C(x) = x − ${c} applies a $${c} coupon. The register computes C(D(${x})). What is the final price?`,
        answer: num(cd, { pre: "$" }),
        hints: ["Inside first: apply the discount D.", `D(${x}) = ${keep} · ${x} = ${keep * x}. Now subtract the coupon.`],
        steps: [st("Discount first.", `D(${x}) = ${keep} · ${x} = ${money(keep * x)}`), st("Then the coupon.", `C(${keep * x}) = ${keep * x} − ${c} = ${money(cd)}`)],
        traps: traps(frac(Math.round(cd * 100), 100), [trap(Math.round(dc * 100) / 100, "That's D(C(x)): coupon first, then discount. The register does the discount first."), trap(keep * x, "You stopped after the discount. Apply the coupon too.")]),
      };
    }
    const diff = (p / 100) * c;
    return {
      prompt: `Sneakers cost $${x}. D(x) = ${keep}x takes ${p}% off and C(x) = x − ${c} subtracts a $${c} coupon. How many dollars cheaper is C(D(x)) than D(C(x))?`,
      answer: num(diff, { pre: "$" }),
      hints: ["Find both prices: C(D(x)) does the discount first; D(C(x)) does the coupon first.", `C(D(${x})) = ${keep}(${x}) − ${c}. D(C(${x})) = ${keep}(${x} − ${c}).`],
      steps: [
        st("Discount, then coupon.", `C(D(${x})) = ${keep} · ${x} − ${c} = ${money(cd)}`),
        st("Coupon, then discount.", `D(C(${x})) = ${keep} · (${x} − ${c}) = ${keep} · ${x - c} = ${money(dc)}`),
        st("Compare.", `${money(dc)} − ${money(cd)} = ${money(diff)}. Taking the coupon last saves the full $${c}; taking it first only saves ${100 - p}% of it.`),
      ],
      traps: traps(frac(Math.round(diff * 100), 100), [trap(c, "The coupon is $" + c + ", but the difference between the two orders is only the part of it the discount would shrink."), trap(0, "The orders don't give the same price. Compute both.")]),
    };
  },
};

const decompose: Skill = {
  id: "pc.compinv.decompose",
  title: "Decompose a composite function",
  topic: T,
  standards: ["PC.F.5.5"],
  prereqs: ["pc.compinv.compose"],
  lesson: {
    bigIdea: "To write h(x) as f(g(x)), find the inside piece g (often the part in parentheses, under a root, or in an exponent) and the outside operation f done to it.",
    explain: [
      "h(x) = (4x − 1)^5: the inside is g(x) = 4x − 1 and the outside raises to the 5th power, f(x) = x^5.",
      "h(x) = {6/x^2 + 1}: inside g(x) = x^2 + 1, outside f(x) = {6/x}.",
      "Check by composing: f(g(x)) = {6/x^2 + 1} = h(x). ✓ There can be more than one correct decomposition; the natural one is usually the most useful.",
    ],
    tip: "Ask: if I were computing h(5) on a calculator, what would I compute first? That's g.",
  },
  why: [
    { kind: "choice", prompt: "Why is f(x) = x^3, g(x) = 2x + 1 a correct decomposition of h(x) = (2x + 1)^3, while f(x) = 2x + 1, g(x) = x^3 is not?", choices: ["Composing the second pair gives 2x^3 + 1, which is not h(x).", "Because f must always be the simpler function.", "Both pairs are correct.", "Because g must be linear."], correct: 0, explain: "f(g(x)) with f = 2x + 1 and g = x^3 is 2x^3 + 1. Order matters: the inside function must be the step done first." },
    { kind: "written", prompt: "Explain how you would decompose h(x) = √(x^2 + 9) into f(g(x)).", keyIdeas: ["the first thing computed is x^2 + 9", "so g(x) = x^2 + 9", "the last step is the square root, so f(x) = √x", "check f(g(x)) = h(x)"], exemplar: "To compute h, you first find x^2 + 9 and then take its square root. So the inside is g(x) = x^2 + 9 and the outside is f(x) = √x. Checking: f(g(x)) = √(x^2 + 9) = h(x)." },
  ],
  generate(r, lv) {
    const a = r.pick([2, 3, 4, 5, -2]), b = r.nonzero(-7, 7), n = r.pick([3, 4, 5]), k = r.pick([2, 3, 6, 8]);
    const lin = linear(a, b), linE = `${a}x${b > 0 ? "+" : "-"}${Math.abs(b)}`;
    const sq = b > 0 ? b : -b + 1;
    const T3 = [
      { h: `(${lin})^${n}`, f: `x^${n}`, fE: `x^${n}`, g: lin, gE: linE },
      { h: `√(x^2 + ${sq})`, f: "√x", fE: "sqrt(x)", g: `x^2 + ${sq}`, gE: `x^2+${sq}` },
      { h: `{${k}/(${lin})^2}`, f: `{${k}/x^2}`, fE: `${k}/x^2`, g: lin, gE: linE },
      { h: `2^(${lin})`, f: "2^x", fE: "2^x", g: lin, gE: linE },
      { h: `(x^2 + ${sq})^2 − 3(x^2 + ${sq})`, f: "x^2 − 3x", fE: "x^2-3x", g: `x^2 + ${sq}`, gE: `x^2+${sq}` },
    ];
    const t = r.pick(lv === 1 ? T3.slice(0, 4) : T3);
    if (lv === 1) {
      return {
        prompt: `h(x) = ${t.h}. If h(x) = f(g(x)) with f(x) = ${t.f}, what is g(x)?`,
        answer: expr(t.gE, { lhs: "g(x)", display: t.g }),
        hints: ["g is the inside function: the part f acts on.", `f(x) = ${t.f}. What expression is sitting where x would be?`],
        steps: [st("Compare h with f.", `f does "${t.f}" to its input; in h that input is ${t.g}.`), st("So the inside function is", `g(x) = ${t.g}`), st("Check.", `f(g(x)) = ${t.h} = h(x) ✓`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `h(x) = ${t.h}. If h(x) = f(g(x)) with g(x) = ${t.g}, what is f(x)?`,
        answer: expr(t.fE, { lhs: "f(x)", display: t.f }),
        hints: [`Replace every ${t.g} in h with a single x.`, "Whatever operation is left over is f."],
        steps: [st("Spot the inside function in h.", `h(x) = ${t.h}, and ${t.g} = g(x).`), st("Replace g(x) with x.", `f(x) = ${t.f}`), st("Check.", `f(g(x)) = ${t.h} ✓`)],
      };
    }
    return {
      prompt: `Which pair gives h(x) = ${t.h} as f(g(x))?`,
      answer: choice(r, `f(x) = ${t.f}, g(x) = ${t.g}`, [[`f(x) = ${t.g}, g(x) = ${t.f}`, "That's the right two pieces in the wrong order. Compose them and see what you get."], [`f(x) = ${t.h}, g(x) = x`, "That works technically but doesn't decompose anything. Choose the pair that splits h into two steps."], [`f(x) = x, g(x) = ${t.f}`, "f(g(x)) would just be g(x), which isn't h(x)."]]),
      hints: ["The inside function g is the first thing you'd compute.", "Test a pair by composing: replace x in f with g(x)."],
      steps: [st("Find the first step in computing h.", `First compute ${t.g}: that's g(x).`), st("Find what is done to it.", `Then apply ${t.f} to the result: f(x) = ${t.f}.`), st("Check.", `f(g(x)) = ${t.h} ✓`)],
    };
  },
};

const inverse: Skill = {
  id: "pc.compinv.inverse",
  title: "Find an inverse function algebraically",
  topic: T,
  standards: ["PC.F.5.6"],
  prereqs: [],
  lesson: {
    bigIdea: "An inverse undoes the function. To find it: write y = f(x), swap x and y, and solve for y.",
    explain: [
      "f(x) = 3x − 7. Write y = 3x − 7, swap: x = 3y − 7. Solve: 3y = x + 7, so **f^-1(x) = {x + 7/3}**.",
      "The inverse does the opposite steps in the opposite order: f multiplies by 3 then subtracts 7; f^-1 adds 7 then divides by 3.",
      "Rational example: f(x) = {x + 2/x − 1}. Swap: x = {y + 2/y − 1}. Multiply: xy − x = y + 2. Collect y: xy − y = x + 2, so y(x − 1) = x + 2 and f^-1(x) = {x + 2/x − 1}. (This one is its own inverse!)",
    ],
    visual: { type: "plot", xMin: -4, xMax: 8, yMin: -4, yMax: 8, curves: [{ expr: "2x-3", label: "f" }, { expr: "(x+3)/2", label: "f⁻¹", color: 2 }, { expr: "x", dashed: true, color: 3, label: "y = x" }] },
    tip: "f^-1(x) is not {1/f(x)}. The −1 means inverse function, not reciprocal.",
  },
  why: [
    { kind: "choice", prompt: "Why does swapping x and y produce the inverse?", choices: ["The inverse sends each output of f back to its input, so inputs and outputs trade places.", "Because x and y are interchangeable in every equation.", "Swapping reflects the graph over the x-axis.", "It gives the reciprocal of f."], correct: 0, explain: "If f takes a to b, f^-1 takes b to a. Swapping x and y records exactly that switch, which is why the graph reflects over y = x." },
    { kind: "written", prompt: "Explain why the graph of an inverse function is the reflection of f over the line y = x.", keyIdeas: ["if (a, b) is on f then (b, a) is on f^-1", "swapping coordinates reflects a point over y = x", "so every point reflects"], exemplar: "Every point (a, b) on f becomes (b, a) on the inverse, because the inverse sends b back to a. Swapping the coordinates of a point reflects it across y = x, so the whole graph is reflected." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const m = r.pick([2, 3, 4, 5, -2, -3]), b = r.nonzero(-9, 9);
      const top = `x ${b > 0 ? "−" : "+"} ${Math.abs(b)}`;
      const invText = m > 0 ? `{${top}/${m}}` : `−{${top}/${-m}}`;
      return {
        prompt: `Find the inverse of f(x) = ${linear(m, b)}.`,
        answer: expr(`(x${b > 0 ? "-" : "+"}${Math.abs(b)})/(${m})`, { lhs: "f^-1(x)", display: invText }),
        hints: [`Write y = ${linear(m, b)} and swap x and y.`, `x = ${linear(m, b, "y")}. Now solve for y: undo the ${b > 0 ? "+" : "−"} ${Math.abs(b)}, then divide by ${ms(m)}.`],
        steps: [
          st("Write y = f(x).", `y = ${linear(m, b)}`),
          st("Swap x and y.", `x = ${linear(m, b, "y")}`),
          st(`${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.`, `${top} = ${ms(m)}y`),
          st(`Divide by ${ms(m)}.`, `f^-1(x) = ${invText}`),
          st("Check with a number.", `f(0) = ${ms(b)}, and f^-1(${ms(b)}) = {${ms(b)} ${b > 0 ? "−" : "+"} ${Math.abs(b)}/${sn(m)}} = 0 ✓`),
        ],
      };
    }
    if (lv === 2) {
      const h = r.nonzero(-5, 5);
      let k = r.int(-8, 8);
      if (r.chance(0.5)) {
        return {
          prompt: `Find the inverse of f(x) = (${shiftText(h)})^3${cst(k)}.`,
          answer: expr(`cbrt(${shiftExpr(k)})${h > 0 ? "+" : "-"}${Math.abs(h)}`, { lhs: "f^-1(x)", display: `∛(${shiftText(k)}) ${h > 0 ? "+" : "−"} ${Math.abs(h)}` }),
          hints: ["Swap x and y, then undo the operations in reverse order.", `x = (${shiftText(h, "y")})^3${cst(k)}. ${k ? `First ${k > 0 ? "subtract" : "add"} ${Math.abs(k)}, then` : "Now"} take the cube root.`],
          steps: [
            st("Swap x and y.", `x = (${shiftText(h, "y")})^3${cst(k)}`),
            ...(k ? [st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${shiftText(k)} = (${shiftText(h, "y")})^3`)] : []),
            st("Take the cube root of both sides.", `∛(${shiftText(k)}) = ${shiftText(h, "y")}`),
            st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = ∛(${shiftText(k)}) ${h > 0 ? "+" : "−"} ${Math.abs(h)}`),
          ],
        };
      }
      const base = r.pick([2, 3]);
      // Keep the inverse's domain (x > k) wide enough to be checked at sample points.
      if (k > 1) k = 1 - k;
      return {
        prompt: `Find the inverse of f(x) = ${base}^(${shiftText(h)})${cst(k)}.`,
        answer: expr(`log_${base}(${shiftExpr(k)})${h > 0 ? "+" : "-"}${Math.abs(h)}`, { lhs: "f^-1(x)", display: `log_${base}(${shiftText(k)}) ${h > 0 ? "+" : "−"} ${Math.abs(h)}` }),
        hints: ["Swap x and y. To undo an exponential, use a logarithm with the same base.", `x${cst(-k)} = ${base}^(${shiftText(h, "y")}), so ${shiftText(h, "y")} = log_${base}(${shiftText(k)}).`],
        steps: [
          st("Swap x and y.", `x = ${base}^(${shiftText(h, "y")})${cst(k)}`),
          ...(k ? [st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${shiftText(k)} = ${base}^(${shiftText(h, "y")})`)] : []),
          st(`Rewrite in log form (base ${base}).`, `log_${base}(${shiftText(k)}) = ${shiftText(h, "y")}`),
          st(`${h > 0 ? "Add" : "Subtract"} ${Math.abs(h)}.`, `f^-1(x) = log_${base}(${shiftText(k)}) ${h > 0 ? "+" : "−"} ${Math.abs(h)}`),
        ],
      };
    }
    const p = r.pick([1, 2, 3, -1]), b = r.nonzero(-4, 4);
    let a = r.nonzero(-6, 6);
    if (a === -p * b) a += 1; // otherwise f would be constant
    const fTop = linear(p, a), num_ = `${linear(b, a)}`;
    return {
      prompt: `Find the inverse of f(x) = {${fTop}/${shiftText(b)}}.`,
      answer: expr(`(${b}x${a > 0 ? "+" : "-"}${Math.abs(a)})/(x${p > 0 ? "-" : "+"}${Math.abs(p)})`, { lhs: "f^-1(x)", display: `{${num_}/${shiftText(p)}}` }),
      hints: ["Swap x and y, then multiply both sides by the denominator.", `x(${shiftText(b, "y")}) = ${linear(p, a, "y")}. Get every y-term on one side.`, `Factor out y: y(x ${p > 0 ? "−" : "+"} ${Math.abs(p)}) = ${num_}.`],
      steps: [
        st("Swap x and y.", `x = {${linear(p, a, "y")}/${shiftText(b, "y")}}`),
        st("Clear the fraction.", `xy ${b > 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x = ${linear(p, a, "y")}`),
        st("Collect the y-terms on the left and everything else on the right.", `xy ${p > 0 ? "−" : "+"} ${Math.abs(p) === 1 ? "" : Math.abs(p)}y = ${num_}`),
        st("Factor out y and divide.", `y(${shiftText(p)}) = ${num_}, so f^-1(x) = {${num_}/${shiftText(p)}}`),
      ],
    };
  },
};

const restrict: Skill = {
  id: "pc.compinv.restrict",
  title: "Restrict the domain to find an inverse",
  topic: T,
  standards: ["PC.F.5.6"],
  prereqs: ["pc.compinv.inverse"],
  lesson: {
    bigIdea: "A function has an inverse only if it is one-to-one (passes the horizontal line test). A parabola isn't, so keep just one side of its vertex.",
    explain: [
      "f(x) = (x − 2)^2 + 1 gives the same output for x = 1 and x = 3, so it has no inverse on all real numbers.",
      "Restrict to x ≥ 2 (the right half). Swap: x = (y − 2)^2 + 1, so (y − 2)^2 = x − 1 and y − 2 = ±√(x − 1). On the right half y ≥ 2, so take +: **f^-1(x) = 2 + √(x − 1)**.",
      "Graphically, the inverse is the reflection of the kept half over y = x. Domain and range trade places: the inverse has domain x ≥ 1 and range y ≥ 2.",
    ],
    visual: { type: "plot", xMin: -1, xMax: 8, yMin: -1, yMax: 8, curves: [{ expr: "(x-2)^2+1", domain: [2, 4.6], label: "f, x ≥ 2" }, { expr: "2+sqrt(x-1)", domain: [1, 8], color: 2, label: "f⁻¹" }, { expr: "x", dashed: true, color: 3 }], points: [{ x: 2, y: 1, label: "(2, 1)" }, { x: 1, y: 2, label: "(1, 2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why must you restrict f(x) = x^2 before finding an inverse?", choices: ["Two inputs (like 3 and −3) give the same output, so the inverse wouldn't know which to return.", "Because x^2 has no domain.", "Because the inverse of x^2 is 1/x^2.", "You don't; √x is the inverse on all real numbers."], correct: 0, explain: "An inverse must send each output back to exactly one input. Keeping only x ≥ 0 makes x^2 one-to-one, and then √x undoes it." },
    { kind: "written", prompt: "f(x) = (x + 1)^2 restricted to x ≤ −1. Explain why its inverse uses −√x and not +√x.", keyIdeas: ["the inverse's outputs are f's inputs", "those inputs are ≤ −1", "so y + 1 ≤ 0 and we need the negative root", "f^-1(x) = −1 − √x"], exemplar: "The outputs of the inverse are the inputs of f, which are all ≤ −1. Solving x = (y + 1)^2 gives y + 1 = ±√x, and since y + 1 ≤ 0 we must take the negative root: f^-1(x) = −1 − √x." },
  ],
  generate(r, lv) {
    const h = r.int(-3, 4), k = r.int(-4, 1);
    const fText = `(${shiftText(h)})^2${cst(k)}`;
    const fE = `(${shiftExpr(h)})^2${k ? (k > 0 ? "+" + k : String(k)) : ""}`;
    if (lv === 1) {
      return {
        prompt: `f(x) = ${fText} is not one-to-one. Which domain restriction makes it one-to-one and keeps all of its outputs?`,
        visual: { type: "plot", xMin: h - 4, xMax: h + 4, yMin: k - 2, yMax: k + 9, curves: [{ expr: fE, label: "f" }], points: [{ x: h, y: k, label: `(${ms(h)}, ${ms(k)})` }] },
        answer: choice(r, `x ≥ ${ms(h)}`, [[h === 0 ? "x ≥ 1" : "x ≥ 0", `Cut at the vertex, x = ${ms(h)}. Otherwise part of the graph is still two-to-one or outputs are lost.`], [`x ≥ ${ms(k)}`, `${ms(k)} is the y-coordinate of the vertex. Restrict x at the vertex's x-coordinate.`], ["All real numbers", "A horizontal line above the vertex hits the parabola twice."], [`x ≥ ${ms(h + 2)}`, "That's one-to-one, but it throws away outputs between the vertex and that point."]]),
        hints: ["A parabola turns around at its vertex. Where is this one's vertex?", `The vertex is (${ms(h)}, ${ms(k)}). Keep one side of x = ${ms(h)}.`],
        steps: [st("Find the vertex.", `f(x) = ${fText} has vertex (${ms(h)}, ${ms(k)}).`), st("Keep one half.", `On x ≥ ${ms(h)} the graph only rises, so every horizontal line hits it at most once.`), st("All outputs kept?", `Yes: the range is still y ≥ ${ms(k)}.`)],
      };
    }
    const left = lv === 3;
    const ans = `${h}${left ? "-" : "+"}sqrt(${shiftExpr(k)})`;
    const disp = `${h === 0 ? (left ? "−" : "") : `${ms(h)} ${left ? "−" : "+"} `}√(${shiftText(k)})`;
    return {
      prompt: `Find the inverse of f(x) = ${fText} for x ${left ? "≤" : "≥"} ${ms(h)}.`,
      visual: { type: "plot", xMin: Math.min(h, k) - 4, xMax: Math.max(h, k) + 7, yMin: Math.min(h, k) - 4, yMax: Math.max(h, k) + 7, curves: [{ expr: fE, domain: left ? [h - 3, h] : [h, h + 3], label: "f" }, { expr: "x", dashed: true, color: 3, label: "y = x" }], points: [{ x: h, y: k, label: `(${ms(h)}, ${ms(k)})` }] },
      answer: expr(ans, { lhs: "f^-1(x)", display: disp }),
      hints: [`Swap x and y: x = (${shiftText(h, "y")})^2${cst(k)}. Solve for y.`, `You'll get ${shiftText(h, "y")} = ±√(${shiftText(k)}). Which sign?`, `The inverse's outputs are f's inputs, which are ${left ? "≤" : "≥"} ${ms(h)}. So ${shiftText(h, "y")} is ${left ? "≤" : "≥"} 0.`],
      steps: [
        st("Swap x and y.", `x = (${shiftText(h, "y")})^2${cst(k)}`),
        ...(k ? [st(`${k > 0 ? "Subtract" : "Add"} ${Math.abs(k)}.`, `${shiftText(k)} = (${shiftText(h, "y")})^2`)] : []),
        st("Take square roots.", `${shiftText(h, "y")} = ±√(${shiftText(k)})`),
        st("Choose the sign.", `The inverse must return values ${left ? "≤" : "≥"} ${ms(h)} (the original inputs), so use the ${left ? "negative" : "positive"} root.`),
        st("Solve for y.", `f^-1(x) = ${disp}, for x ≥ ${ms(k)}.`),
      ],
    };
  },
};

const verify: Skill = {
  id: "pc.compinv.verify",
  title: "Verify inverses by composition",
  topic: T,
  standards: ["PC.F.5.7"],
  prereqs: ["pc.compinv.compose", "pc.compinv.inverse"],
  lesson: {
    bigIdea: "f and g are inverses exactly when f(g(x)) = x and g(f(x)) = x: each one undoes the other.",
    explain: [
      "f(x) = 4x + 3 and g(x) = {x − 3/4}. Then f(g(x)) = 4 · {x − 3/4} + 3 = x − 3 + 3 = x, and g(f(x)) = {4x + 3 − 3/4} = x. They are inverses.",
      "If either composite gives anything other than x, they are not inverses. For example, with h(x) = {x + 3/4}: f(h(x)) = x + 3 + 3 = x + 6.",
      "A quick numeric test: if f(2) = 11 then an inverse must send 11 back to 2.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does f(g(x)) = x show that f undoes g?", choices: ["Whatever g does to x, applying f afterward returns exactly x.", "Because the formulas look alike.", "Because f and g have the same slope.", "It shows f and g are the same function."], correct: 0, explain: "If running g and then f gets you back where you started for every x, f has undone g." },
    { kind: "written", prompt: "Kai says g(x) = {x/2} + 5 is the inverse of f(x) = 2x − 10. Explain how to check, and decide if he's right.", keyIdeas: ["compute f(g(x))", "2(x/2 + 5) − 10 = x", "also g(f(x)) = (2x − 10)/2 + 5 = x", "both give x, so he's right"], exemplar: "Compose: f(g(x)) = 2({x/2} + 5) − 10 = x + 10 − 10 = x, and g(f(x)) = {2x − 10/2} + 5 = x − 5 + 5 = x. Both composites give x, so Kai is right." },
  ],
  generate(r, lv) {
    const m = r.pick([2, 3, 4, 5]), b = r.nonzero(-8, 8);
    const kind = r.pick(["true", "plus", "minusfirst"] as const);
    // g candidates: true inverse (x − b)/m; mistake (x + b)/m; mistake x/m − b.
    const gText = kind === "true" ? `{x ${b > 0 ? "−" : "+"} ${Math.abs(b)}/${m}}` : kind === "plus" ? `{x ${b > 0 ? "+" : "−"} ${Math.abs(b)}/${m}}` : `{x/${m}}${cst(-b)}`;
    const gNum = (x: number) => (kind === "true" ? (x - b) / m : kind === "plus" ? (x + b) / m : x / m - b);
    const fg = kind === "true" ? 0 : kind === "plus" ? 2 * b : b - m * b; // f(g(x)) = x + fg
    const fgText = fg === 0 ? "x" : linear(1, fg);
    if (lv === 1) {
      const a = m * r.int(-3, 4) + (kind === "true" ? b : kind === "plus" ? -b : 0);
      const ga = gNum(a), ans = m * ga + b;
      return {
        prompt: `f(x) = ${linear(m, b)} and g(x) = ${gText}. Find f(g(${ms(a)})). (If f and g were inverses, what would you expect?)`,
        answer: num(ans),
        hints: [`Inside first: g(${ms(a)}).`, `g(${ms(a)}) = ${ms(ga)}. Now f(${ms(ga)}) = ${m} · ${sn(ga)}${cst(b)}.`],
        steps: [st("Evaluate g.", `g(${ms(a)}) = ${ms(ga)}`), st("Evaluate f at that value.", `f(${ms(ga)}) = ${m} · ${sn(ga)}${cst(b)} = ${ms(ans)}`), st("Interpret.", ans === a ? `We got back ${ms(a)}, which is what inverses do.` : `We did not get back ${ms(a)}, so f and g are not inverses.`)],
        traps: traps(frac(ans), [trap(a, `That's what inverses would give. Compute it: g(${ms(a)}) = ${ms(ga)} first.`)]),
      };
    }
    if (lv === 2) {
      const yes = kind === "true";
      return {
        prompt: `f(x) = ${linear(m, b)} and g(x) = ${gText}. Compute f(g(x)). Are f and g inverses?`,
        answer: choice(r, yes ? "Yes: f(g(x)) = x" : `No: f(g(x)) = ${fgText}`, [
          ...(yes ? [[`No: f(g(x)) = ${linear(1, 2 * b)}`, "Recompute carefully: the constants cancel."] as [string, string]] : [["Yes: f(g(x)) = x", `Multiply out ${m} · g(x) carefully; the constants don't cancel.`] as [string, string]]),
          [`No: f(g(x)) = ${m}x${cst(b)}`, "That's just f(x). Replace x in f with all of g(x)."],
          ["Yes: both are linear", "Being linear isn't enough. Compose them."],
        ]),
        hints: [`Replace x in f with g(x): f(g(x)) = ${m}(${gText})${cst(b)}.`, `Distribute the ${m}, then combine the constants.`],
        steps: [st("Substitute g into f.", `f(g(x)) = ${m} · ${gText}${cst(b)}`), st("Simplify.", `f(g(x)) = ${fgText}`), st("Decide.", yes ? "It equals x (and g(f(x)) = x too), so they are inverses." : `It isn't x, so g does not undo f. The true inverse is {x ${b > 0 ? "−" : "+"} ${Math.abs(b)}/${m}}.`)],
      };
    }
    // Level 3: cubic pair.
    const k = r.nonzero(-6, 6);
    const good = r.chance(0.5);
    const g3 = good ? `∛(${shiftText(-k)})` : `∛x ${k > 0 ? "+" : "−"} ${Math.abs(k)}`;
    return {
      prompt: `f(x) = x^3${cst(-k)} and g(x) = ${g3}. Are f and g inverses?`,
      answer: choice(r, good ? "Yes: f(g(x)) = x and g(f(x)) = x" : `No: f(g(x)) = (∛x ${k > 0 ? "+" : "−"} ${Math.abs(k)})^3${cst(-k)}, which is not x`, [
        good ? [`No: f(g(x)) = x${cst(-2 * k)}`, "Cube the cube root first: (∛(stuff))^3 = stuff."] : ["Yes: f(g(x)) = x and g(f(x)) = x", `(∛x ${k > 0 ? "+" : "−"} ${Math.abs(k)})^3 is not x ${k > 0 ? "+" : "−"} ${Math.abs(k)}; you can't cube term by term.`],
        ["Yes: a cube root always undoes a cube", "Only if it undoes the whole function, including the constant. Compose to check."],
        ["No: cube roots can't be inverses of cubes", "x^3 and ∛x are inverses; the question is about the constant."],
      ]),
      hints: ["Compute f(g(x)) by replacing x in f with g(x).", "Remember: (∛A)^3 = A, but (∛x + c)^3 is not x + c^3."],
      steps: good
        ? [st("Compose.", `f(g(x)) = (∛(${shiftText(-k)}))^3${cst(-k)} = ${shiftText(-k)}${cst(-k)} = x`), st("Other order.", `g(f(x)) = ∛(x^3${cst(-k)}${cst(k)}) = ∛(x^3) = x`), st("Decide.", "Both are x, so they are inverses.")]
        : [st("Compose.", `f(g(x)) = (∛x ${k > 0 ? "+" : "−"} ${Math.abs(k)})^3${cst(-k)}`), st("Test a value.", `At x = 8: g(8) = 2${cst(k)} = ${ms(2 + k)}, and f(${ms(2 + k)}) = ${ms((2 + k) ** 3 - k)}, not 8.`), st("Decide.", `Not inverses. The true inverse is ∛(${shiftText(-k)}).`)],
    };
  },
};

export default [compose, evalReps, domain, model, decompose, inverse, restrict, verify];
