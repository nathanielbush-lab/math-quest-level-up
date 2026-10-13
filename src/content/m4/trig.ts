// Unit 3: Trig identities and non-right triangles (NC.M4.AF.2.1, NC.M4.AF.2.2).
import { choice, num, trap, traps } from "../helpers";
import { frac, type Frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { PEOPLE, dec, rnd, tolTraps } from "./util";

const T = "m4-trig";

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
const rad = (d: number) => (d * Math.PI) / 180;
const sinD = (d: number) => Math.sin(rad(d));
const cosD = (d: number) => Math.cos(rad(d));
const deg = (x: number) => (x * 180) / Math.PI;
const fracText = (f: Frac) => (f.d === 1 ? (f.n < 0 ? `−${-f.n}` : String(f.n)) : f.n < 0 ? `−{${-f.n}/${f.d}}` : `{${f.n}/${f.d}}`);

/** Triangle ABC for a geo visual: A at the origin, AB along the x-axis. */
function triangle(Adeg: number, b: number, c: number, labels: { a?: string; b?: string; c?: string; A?: string; B?: string; C?: string }): Visual {
  const C = { x: b * cosD(Adeg), y: b * sinD(Adeg) };
  return {
    type: "geo",
    points: { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C },
    polygons: [["A", "B", "C"]],
    segments: [
      ...(labels.a ? [{ from: "B", to: "C", label: labels.a }] : []),
      ...(labels.b ? [{ from: "A", to: "C", label: labels.b }] : []),
      ...(labels.c ? [{ from: "A", to: "B", label: labels.c }] : []),
    ],
    angles: [
      ...(labels.A ? [{ at: "A", from: "B", to: "C", label: labels.A }] : []),
      ...(labels.B ? [{ at: "B", from: "C", to: "A", label: labels.B }] : []),
      ...(labels.C ? [{ at: "C", from: "A", to: "B", label: labels.C }] : []),
    ],
    showLabels: true,
  };
}

const reciprocal: Skill = {
  id: "m4.trig.reciprocal",
  title: "Reciprocal trig functions",
  topic: T,
  standards: ["NC.M4.AF.2.1"],
  prereqs: [],
  lesson: {
    bigIdea: "csc θ = {1/sin θ}, sec θ = {1/cos θ} and cot θ = {1/tan θ}. Flip the ratio and you have the reciprocal function.",
    explain: [
      "In a right triangle with opposite 5, adjacent 12 and hypotenuse 13: sin θ = {5/13}, cos θ = {12/13}, tan θ = {5/12}.",
      "So csc θ = {13/5} (hyp over opp), sec θ = {13/12} (hyp over adj), and cot θ = {12/5} (adj over opp).",
      "Pairing tip: the \"co\" functions go together. **Sec**ant pairs with **cos**ine, and **cosec**ant pairs with **sin**e, which is the opposite of what the names suggest.",
    ],
    visual: { type: "geo", points: { A: { x: 0, y: 0 }, B: { x: 12, y: 0 }, C: { x: 12, y: 5 } }, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "B", label: "12" }, { from: "B", to: "C", label: "5" }, { from: "A", to: "C", label: "13" }], angles: [{ at: "A", from: "B", to: "C", label: "θ" }, { at: "B", from: "A", to: "C", right: true }] },
  },
  why: [
    { kind: "choice", prompt: "Why is sec θ not defined when cos θ = 0?", choices: ["sec θ = 1 ÷ cos θ, and you can't divide by 0.", "Because sec θ is always 0 there too.", "Because the angle doesn't exist."], correct: 0, explain: "A reciprocal of 0 is not defined." },
    { kind: "written", prompt: "If sin θ = 0.25, explain how to find csc θ and why it must be bigger than 1.", keyIdeas: ["csc θ = 1 ÷ sin θ", "1 ÷ 0.25 = 4", "the reciprocal of a number between 0 and 1 is greater than 1 (hypotenuse over a leg)"], exemplar: "csc θ is the reciprocal of sin θ, so csc θ = 1 ÷ 0.25 = 4. Since sin θ is a leg over the hypotenuse, it's less than 1, and flipping it gives hypotenuse over leg, which is more than 1." },
  ],
  generate(r, lv) {
    const [p, q, h] = r.pick(TRIPLES);
    const [opp, adj] = r.chance(0.5) ? [p, q] : [q, p];
    const vals: Record<string, Frac> = { sin: frac(opp, h), cos: frac(adj, h), tan: frac(opp, adj), csc: frac(h, opp), sec: frac(h, adj), cot: frac(adj, opp) };
    const pairOf: Record<string, string> = { csc: "sin", sec: "cos", cot: "tan" };
    if (lv === 1) {
      const fn = r.pick(["csc", "sec", "cot"]);
      const base = pairOf[fn];
      return {
        prompt: `${base} θ = ${fracText(vals[base])}. Find ${fn} θ.`,
        answer: num(vals[fn]),
        hints: [`${fn} is the reciprocal of ${base}.`, `${fn} θ = {1/${base} θ}: flip the fraction.`],
        steps: [st("Use the reciprocal identity.", `${fn} θ = {1/${base} θ}`), st("Flip the fraction.", `${fn} θ = ${fracText(vals[fn])}`)],
        traps: traps(vals[fn], [trap(vals[base], `That's ${base} θ itself. Take its reciprocal.`), trap(frac(-vals[base].n, vals[base].d), "Reciprocal means flip, not change the sign.")]),
      };
    }
    if (lv === 2) {
      const fn = r.pick(["csc", "sec", "cot"]);
      const words: Record<string, string> = { csc: "{hypotenuse/opposite}", sec: "{hypotenuse/adjacent}", cot: "{adjacent/opposite}" };
      return {
        prompt: `Use the triangle to find ${fn} θ.`,
        visual: { type: "geo", points: { A: { x: 0, y: 0 }, B: { x: adj, y: 0 }, C: { x: adj, y: opp } }, polygons: [["A", "B", "C"]], segments: [{ from: "A", to: "B", label: String(adj) }, { from: "B", to: "C", label: String(opp) }, { from: "A", to: "C", label: String(h) }], angles: [{ at: "A", from: "B", to: "C", label: "θ" }, { at: "B", from: "A", to: "C", right: true }] },
        answer: num(vals[fn]),
        hints: [`${fn} θ is the reciprocal of ${pairOf[fn]} θ.`, `${fn} θ = ${words[fn]}. From θ, the opposite side is ${opp}, the adjacent side is ${adj}, and the hypotenuse is ${h}.`],
        steps: [st("Label the sides from θ.", `Opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${h}.`), st(`Find ${pairOf[fn]} θ.`, `${pairOf[fn]} θ = ${fracText(vals[pairOf[fn]])}`), st("Take the reciprocal.", `${fn} θ = ${fracText(vals[fn])}`)],
        traps: traps(vals[fn], [trap(vals[pairOf[fn]], `That's ${pairOf[fn]} θ. Flip it to get ${fn} θ.`), trap(fn === "csc" ? vals.sec : vals.csc, "Check which side goes on the bottom: secant pairs with cosine and cosecant with sine.")]),
      };
    }
    const exprs: [string, Frac, string][] = [
      ["csc θ · tan θ", frac(h, adj), `csc θ · tan θ = {1/sin θ} · {sin θ/cos θ} = {1/cos θ} = sec θ = {${h}/${adj}}`],
      ["sec θ · cot θ", frac(h, opp), `sec θ · cot θ = {1/cos θ} · {cos θ/sin θ} = {1/sin θ} = csc θ = {${h}/${opp}}`],
      ["csc θ − cot θ", frac(h - adj, opp), `csc θ − cot θ = {${h}/${opp}} − {${adj}/${opp}} = {${h - adj}/${opp}}`],
      ["sec θ + tan θ", frac(h + opp, adj), `sec θ + tan θ = {${h}/${adj}} + {${opp}/${adj}} = {${h + opp}/${adj}}`],
    ];
    const [e, ans, work] = r.pick(exprs);
    return {
      prompt: `sin θ = ${fracText(vals.sin)} and cos θ = ${fracText(vals.cos)}. Find the exact value of ${e}.`,
      answer: num(ans),
      hints: ["Write every function in terms of sin θ and cos θ, or find each value first.", `csc θ = ${fracText(vals.csc)}, sec θ = ${fracText(vals.sec)}, tan θ = ${fracText(vals.tan)}, cot θ = ${fracText(vals.cot)}.`],
      steps: [st("Find the needed values.", `tan θ = {sin θ/cos θ} = ${fracText(vals.tan)}, cot θ = ${fracText(vals.cot)}, sec θ = ${fracText(vals.sec)}, csc θ = ${fracText(vals.csc)}`), st("Combine.", `${work}${work.endsWith(fracText(ans)) ? "" : ` = ${fracText(ans)}`}`)],
      traps: traps(ans, [trap(frac(ans.d, ans.n), "That's the reciprocal of the answer. Check which functions flip.")]),
    };
  },
};

const pythagorean: Skill = {
  id: "m4.trig.pythagorean",
  title: "Pythagorean identities",
  topic: T,
  standards: ["NC.M4.AF.2.1"],
  prereqs: ["m4.trig.reciprocal"],
  lesson: {
    bigIdea: "sin²θ + cos²θ = 1 for every angle. Knowing one value and the quadrant gives you the other.",
    explain: [
      "On the unit circle, the point at angle θ is (cos θ, sin θ), and it's 1 unit from the origin. By the Pythagorean theorem, cos²θ + sin²θ = 1.",
      "Example: sin θ = {3/5} and θ is in Quadrant II. cos²θ = 1 − {9/25} = {16/25}, so cos θ = ±{4/5}. In Quadrant II, cosine (the x-coordinate) is negative: **cos θ = −{4/5}**.",
      "Divide sin²θ + cos²θ = 1 by cos²θ to get a second identity: tan²θ + 1 = sec²θ.",
    ],
    tip: "Signs by quadrant: I all positive, II only sin (and csc), III only tan (and cot), IV only cos (and sec).",
  },
  why: [
    { kind: "choice", prompt: "Why does 1 − sin²θ give cos²θ, but not tell you the sign of cos θ?", choices: ["Squaring hides the sign: (4/5)² and (−4/5)² are both 16/25, so you need the quadrant.", "Because cosine is never negative.", "Because the identity only works in Quadrant I."], correct: 0, explain: "The quadrant decides whether the x-coordinate is positive or negative." },
    { kind: "written", prompt: "Explain where tan²θ + 1 = sec²θ comes from.", keyIdeas: ["start with sin²θ + cos²θ = 1", "divide every term by cos²θ", "sin²/cos² = tan² and 1/cos² = sec²"], exemplar: "Start with sin²θ + cos²θ = 1 and divide every term by cos²θ. sin²θ/cos²θ is tan²θ, cos²θ/cos²θ is 1, and 1/cos²θ is sec²θ, so tan²θ + 1 = sec²θ." },
  ],
  generate(r, lv) {
    const [p, q, h] = r.pick(TRIPLES);
    const [a, b] = r.chance(0.5) ? [p, q] : [q, p];
    const Qn = lv === 1 ? 1 : r.pick([2, 3, 4]);
    const sSign = Qn <= 2 ? 1 : -1, cSign = Qn === 1 || Qn === 4 ? 1 : -1;
    const QN = ["I", "II", "III", "IV"][Qn - 1];
    if (lv === 3) {
      const tan = frac(sSign * a, cSign * b);
      const ask = r.pick(["sec", "cos"]);
      const sec = frac(cSign * h, b);
      const ans = ask === "sec" ? sec : frac(cSign * b, h);
      return {
        prompt: `tan θ = ${fracText(tan)} and θ is in Quadrant ${QN}. Find ${ask} θ.`,
        answer: num(ans),
        hints: ["Use tan²θ + 1 = sec²θ.", `sec²θ = ${fracText(frac(a * a, b * b))} + 1 = ${fracText(frac(h * h, b * b))}. In Quadrant ${QN}, cosine (and so secant) is ${cSign > 0 ? "positive" : "negative"}.`],
        steps: [
          st("Use the identity.", `sec²θ = tan²θ + 1 = {${a * a}/${b * b}} + {${b * b}/${b * b}} = {${h * h}/${b * b}}`),
          st("Take the square root.", `sec θ = ±{${h}/${b}}`),
          st("Choose the sign.", `In Quadrant ${QN}, cos θ is ${cSign > 0 ? "positive" : "negative"}, so sec θ = ${fracText(sec)}.`),
          ...(ask === "cos" ? [st("Take the reciprocal.", `cos θ = {1/sec θ} = ${fracText(ans)}`)] : []),
        ],
        traps: traps(ans, [trap(frac(-ans.n, ans.d), `Check the sign: in Quadrant ${QN}, cosine is ${cSign > 0 ? "positive" : "negative"}.`), trap(ask === "sec" ? frac(cSign * b, h) : sec, ask === "sec" ? "That's cos θ. Secant is its reciprocal." : "That's sec θ. Cosine is its reciprocal.")]),
      };
    }
    const giveSin = lv === 1 ? r.chance(0.5) : r.chance(0.5);
    const given = giveSin ? frac(sSign * a, h) : frac(cSign * b, h);
    const ans = giveSin ? frac(cSign * b, h) : frac(sSign * a, h);
    const [gN, aN] = giveSin ? ["sin", "cos"] : ["cos", "sin"];
    const gv = giveSin ? a : b, av = giveSin ? b : a;
    const ansSign = giveSin ? cSign : sSign;
    return {
      prompt: `${gN} θ = ${fracText(given)} and θ is in Quadrant ${QN}. Find ${aN} θ.`,
      answer: num(ans),
      hints: [`Use sin²θ + cos²θ = 1 to find ${aN}²θ.`, `${aN}²θ = 1 − {${gv * gv}/${h * h}} = {${av * av}/${h * h}}. ${lv === 1 ? "In Quadrant I, every trig value is positive." : `Which sign does ${aN} have in Quadrant ${QN}?`}`],
      steps: [
        st("Start from the identity.", `${aN}²θ = 1 − ${gN}²θ = 1 − (${fracText(given)})²`),
        st("Compute.", `1 − {${gv * gv}/${h * h}} = {${h * h - gv * gv}/${h * h}}`),
        st("Take the square root.", `${aN} θ = ±{${av}/${h}}`),
        st("Choose the sign.", `In Quadrant ${QN}, ${aN} θ is ${ansSign > 0 ? "positive" : "negative"}, so ${aN} θ = ${fracText(ans)}.`),
      ],
      traps: traps(ans, [trap(frac(-ans.n, ans.d), `Check the sign: in Quadrant ${QN}, ${aN} is ${ansSign > 0 ? "positive" : "negative"}.`), trap(frac(h - gv, h), "Square the fraction before subtracting from 1."), trap(frac(av * av, h * h), "Take the square root at the end.")]),
    };
  },
};

interface Ident { e: string; ans: string; work: string[]; extra?: string[] }
const IDENT: Record<1 | 2 | 3, Ident[]> = {
  1: [
    { e: "sin θ · csc θ", ans: "1", work: ["csc θ = {1/sin θ}", "sin θ · {1/sin θ} = 1"] },
    { e: "cos θ · tan θ", ans: "sin θ", work: ["tan θ = {sin θ/cos θ}", "cos θ · {sin θ/cos θ} = sin θ"] },
    { e: "cot θ · sin θ", ans: "cos θ", work: ["cot θ = {cos θ/sin θ}", "{cos θ/sin θ} · sin θ = cos θ"] },
    { e: "1 − cos²θ", ans: "sin²θ", work: ["sin²θ + cos²θ = 1", "Subtract cos²θ: 1 − cos²θ = sin²θ"] },
    { e: "1 − sin²θ", ans: "cos²θ", work: ["sin²θ + cos²θ = 1", "Subtract sin²θ: 1 − sin²θ = cos²θ"] },
    { e: "cos θ · sec θ", ans: "1", work: ["sec θ = {1/cos θ}", "cos θ · {1/cos θ} = 1"] },
  ],
  2: [
    { e: "sec²θ − 1", ans: "tan²θ", work: ["tan²θ + 1 = sec²θ", "Subtract 1: sec²θ − 1 = tan²θ"] },
    { e: "(1 − sin²θ) ÷ cos θ", ans: "cos θ", work: ["1 − sin²θ = cos²θ", "cos²θ ÷ cos θ = cos θ"] },
    { e: "tan θ ÷ sec θ", ans: "sin θ", work: ["tan θ ÷ sec θ = {sin θ/cos θ} · cos θ", "= sin θ"] },
    { e: "csc θ · tan θ", ans: "sec θ", work: ["{1/sin θ} · {sin θ/cos θ} = {1/cos θ}", "= sec θ"] },
    { e: "(1 + tan²θ) · cos²θ", ans: "1", work: ["1 + tan²θ = sec²θ = {1/cos²θ}", "{1/cos²θ} · cos²θ = 1"] },
    { e: "csc²θ − cot²θ", ans: "1", work: ["Divide sin²θ + cos²θ = 1 by sin²θ: 1 + cot²θ = csc²θ", "So csc²θ − cot²θ = 1"] },
  ],
  3: [
    { e: "(sec²θ − 1) ÷ sec²θ", ans: "sin²θ", work: ["sec²θ − 1 = tan²θ", "tan²θ ÷ sec²θ = {sin²θ/cos²θ} · cos²θ = sin²θ"] },
    { e: "sec θ − sin θ · tan θ", ans: "cos θ", work: ["= {1/cos θ} − {sin²θ/cos θ} = {1 − sin²θ/cos θ}", "= {cos²θ/cos θ} = cos θ"] },
    { e: "(sin θ + cos θ)² − 2sin θ cos θ", ans: "1", work: ["Expand: sin²θ + 2sin θ cos θ + cos²θ − 2sin θ cos θ", "= sin²θ + cos²θ = 1"] },
    { e: "sin θ · (csc θ − sin θ)", ans: "cos²θ", work: ["Distribute: sin θ csc θ − sin²θ = 1 − sin²θ", "= cos²θ"] },
    { e: "cot θ ÷ csc θ", ans: "cos θ", work: ["{cos θ/sin θ} ÷ {1/sin θ} = {cos θ/sin θ} · sin θ", "= cos θ"] },
    { e: "tan θ · cot θ + tan²θ", ans: "sec²θ", work: ["tan θ · cot θ = 1", "1 + tan²θ = sec²θ"] },
  ],
};
const POOL = ["1", "sin θ", "cos θ", "tan θ", "sec θ", "csc θ", "cot θ", "sin²θ", "cos²θ", "tan²θ", "sec²θ"];

const simplify: Skill = {
  id: "m4.trig.simplify",
  title: "Rewrite trig expressions with identities",
  topic: T,
  standards: ["NC.M4.AF.2.1"],
  prereqs: ["m4.trig.pythagorean"],
  lesson: {
    bigIdea: "To simplify, rewrite everything in sines and cosines, then look for sin²θ + cos²θ = 1 (or 1 + tan²θ = sec²θ).",
    explain: [
      "The toolkit: tan θ = {sin θ/cos θ}, cot θ = {cos θ/sin θ}, sec θ = {1/cos θ}, csc θ = {1/sin θ}, and sin²θ + cos²θ = 1.",
      "Example: sec θ − sin θ · tan θ = {1/cos θ} − {sin²θ/cos θ} = {1 − sin²θ/cos θ} = {cos²θ/cos θ} = **cos θ**.",
    ],
    tip: "If you get stuck, test your answer with θ = 30°: both expressions should give the same number.",
  },
  why: [
    { kind: "choice", prompt: "Why is converting to sines and cosines a good first step?", choices: ["Every trig function can be written with sin and cos, so terms become easier to combine and cancel.", "Because sine and cosine are always equal.", "It isn't allowed to use tangent in identities."], correct: 0, explain: "A common language makes common denominators and cancellation visible." },
    { kind: "written", prompt: "Explain how you could check that cos θ · tan θ = sin θ using θ = 30°.", keyIdeas: ["cos 30° = √3/2 and tan 30° = 1/√3 (or √3/3)", "the product is 1/2", "sin 30° = 1/2, so both sides match"], exemplar: "cos 30° = √3/2 and tan 30° = 1/√3. Their product is 1/2. sin 30° is also 1/2, so the identity checks out for this angle (one check doesn't prove it, but a mismatch would disprove it)." },
  ],
  generate(r, lv) {
    const it = r.pick(IDENT[lv]);
    const wrong = r.shuffle(POOL.filter((p) => p !== it.ans)).slice(0, 3);
    return {
      prompt: `Simplify: ${it.e}`,
      answer: choice(r, it.ans, wrong),
      hints: ["Rewrite tan, cot, sec and csc in terms of sin and cos.", `Start with: ${it.work[0]}.`],
      steps: [...it.work.map((w, i) => st(i === 0 ? "Rewrite." : "Simplify.", w)), st("Answer.", `${it.e} = ${it.ans}`)],
    };
  },
};

const lawSines: Skill = {
  id: "m4.trig.law-sines",
  title: "Law of Sines",
  topic: T,
  standards: ["NC.M4.AF.2.2"],
  prereqs: [],
  lesson: {
    bigIdea: "In any triangle, {a/sin A} = {b/sin B} = {c/sin C}: each side over the sine of its opposite angle gives the same ratio.",
    explain: [
      "Use it when you know a side and its opposite angle, plus one more side or angle (AAS, ASA, or SSA).",
      "Example: A = 40°, B = 65°, a = 12. Then {b/sin 65°} = {12/sin 40°}, so b = {12 sin 65°/sin 40°} ≈ {12(0.9063)/0.6428} ≈ **16.9**.",
      "For ASA (two angles and the side between them), find the third angle first: the angles add to 180°.",
    ],
    visual: { type: "geo", points: { A: { x: 0, y: 0 }, B: { x: 17.3, y: 0 }, C: { x: 12.96, y: 10.87 } }, polygons: [["A", "B", "C"]], segments: [{ from: "B", to: "C", label: "a = 12" }, { from: "A", to: "C", label: "b = ?" }], angles: [{ at: "A", from: "B", to: "C", label: "40°" }, { at: "B", from: "C", to: "A", label: "65°" }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "Why can't you use the Law of Sines when you know only three sides (SSS)?", choices: ["Every ratio needs a known angle with its opposite side, and SSS gives no angles.", "Because the Law of Sines only works for right triangles.", "You can; just divide the sides."], correct: 0, explain: "With SSS, start with the Law of Cosines to find an angle." },
    { kind: "written", prompt: "Explain why the largest side of a triangle is always opposite the largest angle, using the Law of Sines.", keyIdeas: ["a = (common ratio) × sin A", "for angles between 0° and 180° in a triangle, a larger angle has a larger sine (for the angles involved)", "so the larger angle goes with the longer side"], exemplar: "Each side equals the same constant times the sine of its opposite angle. In a triangle, the bigger angle has the bigger sine (an obtuse angle is still bigger than the sines of the two small angles), so it's paired with the longer side." },
  ],
  generate(r, lv) {
    const A = r.int(30, 75), B = r.int(35, 80);
    const C = 180 - A - B;
    if (lv === 1) {
      const a = r.int(8, 25);
      const b = (a * sinD(B)) / sinD(A), c = (a * sinD(C)) / sinD(A);
      const ans = rnd(b, 1);
      return {
        prompt: `In triangle ABC, A = ${A}°, B = ${B}° and a = ${a}. Find b to the nearest tenth.`,
        visual: triangle(A, b, c, { a: `a = ${a}`, b: "b = ?", A: `${A}°`, B: `${B}°` }),
        answer: num(ans, { tolerance: 0.1 }),
        hints: ["You know angle A and its opposite side a. Set up {b/sin B} = {a/sin A}.", `b = {${a} sin ${B}°/sin ${A}°}.`],
        steps: [st("Set up the Law of Sines.", `{b/sin ${B}°} = {${a}/sin ${A}°}`), st("Solve for b.", `b = {${a} sin ${B}°/sin ${A}°} ≈ {${a}(${dec(sinD(B))})/${dec(sinD(A))}}`), st("Compute.", `b ≈ ${dec(ans, 1)}`)],
        traps: tolTraps(ans, 0.1, [[(a * sinD(A)) / sinD(B), "The ratio is flipped: b goes with sin B, a with sin A."], [(a * B) / A, "Use the sines of the angles, not the angles themselves."]]),
      };
    }
    if (lv === 2) {
      const c = r.int(10, 30);
      const a = (c * sinD(A)) / sinD(C), b = (c * sinD(B)) / sinD(C);
      const ans = rnd(a, 1);
      return {
        prompt: `In triangle ABC, A = ${A}°, B = ${B}° and the side between them is c = ${c}. Find a to the nearest tenth.`,
        visual: triangle(A, b, c, { c: `c = ${c}`, a: "a = ?", A: `${A}°`, B: `${B}°` }),
        answer: num(ans, { tolerance: 0.1 }),
        hints: ["You need an angle opposite a known side. Which angle is opposite c?", `C = 180° − ${A}° − ${B}° = ${C}°. Then {a/sin ${A}°} = {${c}/sin ${C}°}.`],
        steps: [st("Find the third angle.", `C = 180° − ${A}° − ${B}° = ${C}°`), st("Set up the Law of Sines.", `{a/sin ${A}°} = {${c}/sin ${C}°}`), st("Solve.", `a = {${c} sin ${A}°/sin ${C}°} ≈ {${c}(${dec(sinD(A))})/${dec(sinD(C))}} ≈ ${dec(ans, 1)}`)],
        traps: tolTraps(ans, 0.1, [[(c * sinD(A)) / sinD(B), `c is opposite angle C, not angle B. Find C = ${C}° first.`], [(c * sinD(B)) / sinD(C), "That's side b, which is opposite angle B."]]),
      };
    }
    // SSA with a > b, so only one triangle.
    const a = r.int(14, 28);
    const b = Math.min(a - r.int(3, 6), Math.floor(a * 0.9));
    const Bang = deg(Math.asin((b * sinD(A)) / a));
    const Cang = 180 - A - Bang;
    const c = (a * sinD(Cang)) / sinD(A);
    const ans = rnd(Bang, 1);
    return {
      prompt: `In triangle ABC, A = ${A}°, a = ${a} and b = ${b}. Find angle B to the nearest tenth of a degree.`,
      visual: triangle(A, b, c, { a: `a = ${a}`, b: `b = ${b}`, A: `${A}°`, B: "?" }),
      answer: num(ans, { tolerance: 0.15, unit: "°" }),
      hints: ["Set up {sin B/b} = {sin A/a}.", `sin B = {${b} sin ${A}°/${a}}; then use inverse sine.`],
      steps: [
        st("Set up the Law of Sines.", `{sin B/${b}} = {sin ${A}°/${a}}`),
        st("Solve for sin B.", `sin B = {${b} sin ${A}°/${a}} ≈ ${dec((b * sinD(A)) / a)}`),
        st("Use inverse sine.", `B ≈ sin^−1(${dec((b * sinD(A)) / a)}) ≈ ${dec(ans, 1)}°`),
        st("Check for a second triangle.", `The other option would be 180° − ${dec(ans, 1)}° = ${dec(180 - ans, 1)}°, but then A + B > 180°, so there is only one triangle. (Also b < a means B < A.)`),
      ],
      traps: tolTraps(ans, 0.15, [[180 - ans, "That angle plus A is more than 180°, so it can't be in the triangle."], [Cang, "That's angle C. Angle B is opposite side b."]]),
    };
  },
};

const lawCosines: Skill = {
  id: "m4.trig.law-cosines",
  title: "Law of Cosines",
  topic: T,
  standards: ["NC.M4.AF.2.2"],
  prereqs: ["m4.trig.law-sines"],
  lesson: {
    bigIdea: "c² = a² + b² − 2ab·cos C. It's the Pythagorean theorem with a correction term for angles that aren't 90°.",
    explain: [
      "Use it for SAS (two sides and the angle between them) to find the third side, or for SSS to find an angle.",
      "SAS example: a = 8, b = 11, C = 52°. c² = 64 + 121 − 2(8)(11)cos 52° ≈ 185 − 108.35 = 76.65, so c ≈ **8.8**.",
      "SSS example: to find C, rearrange: cos C = {a² + b² − c²/2ab}, then use inverse cosine.",
    ],
    tip: "When C = 90°, cos C = 0 and the formula becomes c² = a² + b².",
  },
  why: [
    { kind: "choice", prompt: "When angle C is obtuse, why is c² bigger than a² + b²?", choices: ["cos C is negative, so −2ab cos C adds to a² + b².", "Because obtuse triangles have longer sides in general.", "It isn't; c² is always smaller."], correct: 0, explain: "A negative cosine flips the subtraction into an addition." },
    { kind: "written", prompt: "Explain why the Law of Cosines works for right triangles too.", keyIdeas: ["when C = 90°, cos C = 0", "the term 2ab cos C becomes 0", "it reduces to the Pythagorean theorem"], exemplar: "If C = 90°, cos 90° = 0, so the −2ab cos C term disappears and c² = a² + b², which is exactly the Pythagorean theorem." },
  ],
  generate(r, lv) {
    if (lv <= 2) {
      const a = r.int(5, 20), b = r.int(5, 20), C = r.int(25, 130);
      const c = Math.sqrt(a * a + b * b - 2 * a * b * cosD(C));
      const ans = rnd(c, 1);
      const Aang = deg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
      const name = r.pick(PEOPLE);
      const prompt = lv === 1
        ? `In triangle ABC, a = ${a}, b = ${b} and C = ${C}°. Find c to the nearest tenth.`
        : r.pick([
            `${name} and a friend leave the same trailhead. ${name} hikes ${a} km on one path, the friend hikes ${b} km on another, and the paths split at an angle of ${C}°. How far apart are they, to the nearest tenth of a km?`,
            `A drone flies ${a} m from its launch point, and a second drone flies ${b} m from the same point. The angle between their flight paths is ${C}°. How far apart are the drones, to the nearest tenth of a meter?`,
          ]);
      return {
        prompt,
        visual: triangle(Aang, b, c, { a: String(a), b: String(b), c: "?", C: `${C}°` }),
        answer: num(ans, { tolerance: 0.1 }),
        hints: ["You know two sides and the angle between them (SAS): use the Law of Cosines.", `c² = ${a}² + ${b}² − 2(${a})(${b})cos ${C}°.`],
        steps: [
          st("Write the Law of Cosines.", `c² = ${a}² + ${b}² − 2(${a})(${b})cos ${C}°`),
          st("Compute each part.", `${a * a} + ${b * b} − ${2 * a * b}(${dec(cosD(C))}) ≈ ${dec(a * a + b * b)} ${cosD(C) >= 0 ? "−" : "+"} ${dec(Math.abs(2 * a * b * cosD(C)), 2)} = ${dec(c * c, 2)}`),
          st("Take the square root.", `c ≈ √${dec(c * c, 2)} ≈ ${dec(ans, 1)}`),
        ],
        traps: tolTraps(ans, 0.1, [
          [Math.sqrt(a * a + b * b), "That's the Pythagorean theorem; the angle isn't 90°, so include −2ab cos C."],
          [Math.sqrt(Math.abs(a * a + b * b - a * b * cosD(C))), "Don't forget the 2 in 2ab cos C."],
          [Math.sqrt(a * a + b * b + 2 * a * b * cosD(C)), "The formula subtracts 2ab cos C."],
          [c * c, "Take the square root at the end."],
        ]),
      };
    }
    let a = r.int(6, 18), b = r.int(6, 18), c = r.int(6, 20);
    while (c >= a + b - 1 || a >= b + c - 1 || b >= a + c - 1) { a = r.int(6, 18); b = r.int(6, 18); c = r.int(6, 20); }
    const cosC = (a * a + b * b - c * c) / (2 * a * b);
    const C = deg(Math.acos(cosC));
    const ans = rnd(C, 1);
    const Aang = deg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    return {
      prompt: `A triangle has sides a = ${a}, b = ${b} and c = ${c}. Find angle C (opposite side c) to the nearest tenth of a degree.`,
      visual: triangle(Aang, b, c, { a: String(a), b: String(b), c: String(c), C: "?" }),
      answer: num(ans, { tolerance: 0.15, unit: "°" }),
      hints: ["With three sides (SSS), use the Law of Cosines solved for the angle.", `cos C = {${a}² + ${b}² − ${c}²/2(${a})(${b})}.`],
      steps: [
        st("Rearrange the Law of Cosines.", `cos C = {a² + b² − c²/2ab}`),
        st("Substitute.", `cos C = {${a * a} + ${b * b} − ${c * c}/${2 * a * b}} = {${a * a + b * b - c * c}/${2 * a * b}} ≈ ${dec(cosC)}`),
        st("Use inverse cosine.", `C ≈ cos^−1(${dec(cosC)}) ≈ ${dec(ans, 1)}°`),
      ],
      traps: tolTraps(ans, 0.15, [[Math.abs((a * a + b * b - c * c) / (a * b)) <= 1 ? deg(Math.acos((a * a + b * b - c * c) / (a * b))) : NaN, "The denominator is 2ab."], [deg(Math.acos(Math.max(-1, Math.min(1, (c * c - a * a - b * b) / (2 * a * b))))), "The numerator is a² + b² − c² (the side opposite C is subtracted)."]]),
    };
  },
};

const navigation: Skill = {
  id: "m4.trig.solve-triangles",
  title: "Choose and apply the right law",
  topic: T,
  standards: ["NC.M4.AF.2.2"],
  prereqs: ["m4.trig.law-cosines"],
  lesson: {
    bigIdea: "Know a side with its opposite angle? Law of Sines. Know SAS or SSS? Law of Cosines. In real problems, sketch the triangle first and figure out which angle you actually know.",
    explain: [
      "AAS, ASA, SSA → Law of Sines. SAS, SSS → Law of Cosines.",
      "A boat goes 10 km east, then turns 35° to its left and goes 6 km. The angle *inside* the triangle at the turn is 180° − 35° = 145°, not 35°.",
      "Distance from start: d² = 10² + 6² − 2(10)(6)cos 145° ≈ 136 + 98.3 = 234.3, so d ≈ **15.3 km**.",
    ],
    visual: { type: "geo", points: { S: { x: 0, y: 0 }, T: { x: 10, y: 0 }, E: { x: 14.91, y: 3.44 } }, polygons: [["S", "T", "E"]], segments: [{ from: "S", to: "T", label: "10 km" }, { from: "T", to: "E", label: "6 km" }, { from: "S", to: "E", label: "d", dashed: true }], angles: [{ at: "T", from: "S", to: "E", label: "145°" }], showLabels: true },
  },
  why: [
    { kind: "choice", prompt: "A boat turns 40° off its course. Why is the triangle's angle at the turn 140°?", choices: ["The turn angle and the interior angle together make a straight line, 180°.", "Because turning always doubles the angle.", "Because the angles of a triangle add to 140°."], correct: 0, explain: "The original path extended and the new path form a 40° angle; the interior angle is its supplement." },
    { kind: "written", prompt: "You know two sides of a triangle and an angle that is NOT between them. Explain which law to use and why.", keyIdeas: ["that's SSA", "one known angle is opposite a known side", "so the Law of Sines applies (watch for the ambiguous case)"], exemplar: "That's SSA. The known angle is opposite one of the known sides, so I have a complete side-angle pair and can use the Law of Sines to find another angle. I should check whether a second triangle is possible." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const cases: [string, string, string][] = [
        ["two sides and the angle between them (SAS)", "Law of Cosines", "No angle has its opposite side known, so the Law of Sines can't start."],
        ["all three sides (SSS)", "Law of Cosines", "There's no known angle yet, so the Law of Sines has nothing to pair."],
        ["two angles and a side opposite one of them (AAS)", "Law of Sines", "You already have a side with its opposite angle; that's what the Law of Sines needs."],
        ["two angles and the side between them (ASA)", "Law of Sines", "Find the third angle (180° minus the other two), then the known side has its opposite angle."],
        ["two sides and an angle opposite one of them (SSA)", "Law of Sines", "The known angle is opposite a known side, so you have a complete pair."],
      ];
      const [given, law] = r.pick(cases);
      return {
        prompt: `You know ${given} of a triangle. Which law should you use first to find a missing part?`,
        answer: choice(r, law, [[law === "Law of Sines" ? "Law of Cosines" : "Law of Sines", r.pick(cases.filter((c) => c[1] === law))[2]], ["Pythagorean theorem", "That only works for right triangles."], ["Neither; there isn't enough information", "Three parts including at least one side are enough to solve a triangle."]], true),
        hints: ["The Law of Sines needs a side together with its opposite angle.", "If you don't have a matching side-angle pair, start with the Law of Cosines."],
        steps: [st("Look for a side-angle pair.", law === "Law of Sines" ? "You have (or can quickly get) an angle with its opposite side." : "No known angle is opposite a known side."), st("Answer.", law)],
      };
    }
    const d1 = r.int(6, 20), d2 = r.int(4, 15), turn = r.pick([25, 30, 35, 40, 50, 55, 60, 70]);
    const inside = 180 - turn;
    const d = Math.sqrt(d1 * d1 + d2 * d2 - 2 * d1 * d2 * cosD(inside));
    const boat = r.pick(["A fishing boat", "A kayaker", "A search-and-rescue boat", "A ferry"]);
    const ex = { x: d1 + d2 * cosD(turn), y: d2 * sinD(turn) };
    const vis: Visual = { type: "geo", points: { S: { x: 0, y: 0 }, T: { x: d1, y: 0 }, E: ex }, polygons: [["S", "T", "E"]], segments: [{ from: "S", to: "T", label: `${d1} km` }, { from: "T", to: "E", label: `${d2} km` }, { from: "S", to: "E", dashed: true, label: lv === 2 ? "?" : undefined }], angles: lv === 3 ? [{ at: "S", from: "T", to: "E", label: "?" }] : [], showLabels: true };
    const intro = `${boat} travels ${d1} km from port S to point T, then turns ${turn}° to the left and travels ${d2} km to point E.`;
    if (lv === 2) {
      const ans = rnd(d, 1);
      return {
        prompt: `${intro} How far is E from port S? Round to the nearest tenth of a km.`,
        visual: vis,
        answer: num(ans, { tolerance: 0.1, unit: " km" }),
        hints: [`The angle inside the triangle at T is not ${turn}°. It's 180° − ${turn}°.`, `SAS with angle ${inside}° at T: d² = ${d1}² + ${d2}² − 2(${d1})(${d2})cos ${inside}°.`],
        steps: [
          st("Find the interior angle at T.", `180° − ${turn}° = ${inside}°`),
          st("Use the Law of Cosines (SAS).", `d² = ${d1 * d1} + ${d2 * d2} − ${2 * d1 * d2}cos ${inside}° ≈ ${dec(d1 * d1 + d2 * d2)} + ${dec(-2 * d1 * d2 * cosD(inside), 2)} = ${dec(d * d, 2)}`),
          st("Take the square root.", `d ≈ ${dec(ans, 1)} km`),
        ],
        traps: tolTraps(ans, 0.1, [[Math.sqrt(d1 * d1 + d2 * d2 - 2 * d1 * d2 * cosD(turn)), `${turn}° is the turn, not the angle inside the triangle. Use 180° − ${turn}°.`], [d1 + d2, "That's the total distance traveled, not the straight-line distance back to port."], [Math.sqrt(d1 * d1 + d2 * d2), "The angle at T isn't 90°."]]),
      };
    }
    const S = deg(Math.asin((d2 * sinD(inside)) / d));
    const ans = rnd(S, 1);
    return {
      prompt: `${intro} By what angle should the boat's path back to port differ from its first leg? Find angle S (at the port, between SE and ST) to the nearest tenth of a degree.`,
      visual: vis,
      answer: num(ans, { tolerance: 0.2, unit: "°" }),
      hints: [`First find SE with the Law of Cosines, using the interior angle 180° − ${turn}° = ${inside}° at T.`, `SE ≈ ${dec(d, 2)} km. Now the Law of Sines: {sin S/${d2}} = {sin ${inside}°/${dec(d, 2)}}.`],
      steps: [
        st("Interior angle at T.", `180° − ${turn}° = ${inside}°`),
        st("Law of Cosines for SE.", `SE² = ${d1}² + ${d2}² − 2(${d1})(${d2})cos ${inside}° ≈ ${dec(d * d, 2)}, so SE ≈ ${dec(d, 2)} km`),
        st("Law of Sines for angle S.", `sin S = {${d2} sin ${inside}°/${dec(d, 2)}} ≈ ${dec((d2 * sinD(inside)) / d)}`),
        st("Inverse sine.", `S ≈ ${dec(ans, 1)}° (acute, since the largest angle is the ${inside}° at T)`),
      ],
      traps: tolTraps(ans, 0.2, [[turn, "The return angle isn't the same as the turn angle."], [180 - inside - S, "That's the angle at E. Angle S is opposite the side TE."]]),
    };
  },
};

export default [reciprocal, pythagorean, simplify, lawSines, lawCosines, navigation] satisfies Skill[];
