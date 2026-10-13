// Unit 4: Right-triangle trigonometry (Pythagorean theorem, trig ratios, solving right triangles, special right triangles).
import { choice, exact, num, radical, radText, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { DEG, fracPlain, fracText, r1, tolTraps } from "./util";

const T = "m2-trig";

/** Right triangle with the right angle at C, legs a = BC (vertical), b = AC (horizontal). Labels optional. */
export function rightTri(a: number, b: number, labels: { a?: string; b?: string; c?: string; A?: string; B?: string } = {}, names = ["A", "B", "C"]): Visual {
  const s = 8 / Math.max(a, b);
  const R = (v: number) => Math.round(v * 1000) / 1000;
  const [A, B, C] = names;
  const angles: { at: string; from: string; to: string; label?: string; right?: boolean }[] = [{ at: C, from: A, to: B, right: true }];
  if (labels.A) angles.push({ at: A, from: B, to: C, label: labels.A });
  if (labels.B) angles.push({ at: B, from: C, to: A, label: labels.B });
  const segments: { from: string; to: string; label?: string }[] = [];
  if (labels.a) segments.push({ from: B, to: C, label: labels.a });
  if (labels.b) segments.push({ from: C, to: A, label: labels.b });
  if (labels.c) segments.push({ from: A, to: B, label: labels.c });
  return { type: "geo", showLabels: true, points: { [A]: { x: R(b * s), y: 0 }, [B]: { x: 0, y: R(a * s) }, [C]: { x: 0, y: 0 } }, polygons: [[A, B, C]], angles, segments };
}

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

/** Exact square root as [typed, display]. */
function sqrtExact(n: number): [string, string] {
  const { a, b } = radical(n);
  if (b === 1) return [String(a), String(a)];
  return [`${a === 1 ? "" : a}sqrt(${b})`, radText(a, b)];
}

// ---------- 1. Pythagorean theorem ----------
const pythag: Skill = {
  id: "m2.trig.pythagorean",
  title: "The Pythagorean theorem, exact and in context",
  topic: T,
  standards: ["NC.M2.G-SRT.8", "NC.M2.G-SRT.4"],
  prereqs: ["m2.sim.right-triangle-similarity"],
  lesson: {
    bigIdea: "In a right triangle, a² + b² = c², where c is the hypotenuse (opposite the right angle). Leave answers as simplified radicals unless asked to round.",
    explain: [
      "Hypotenuse: legs 6 and 8 give c² = 36 + 64 = 100, so c = 10.",
      "Leg: hypotenuse 9 and leg 6 give b² = 81 − 36 = 45, so b = √45 = √(9 · 5) = **3√5** (about 6.7).",
      "In context, draw the right triangle first. A 13-ft ladder with its base 5 ft from a wall reaches √(169 − 25) = √144 = 12 ft up the wall.",
    ],
    visual: rightTri(6, 8, { a: "6", b: "8", c: "10" }),
  },
  why: [
    { kind: "choice", prompt: "Why must you subtract (not add) when finding a missing leg?", choices: ["The hypotenuse squared is the sum of the legs squared, so a leg squared is c² minus the other leg squared.", "Because legs are always shorter than 10.", "Because subtraction is the inverse of squaring.", "You always add in the Pythagorean theorem."], correct: 0, explain: "a² + b² = c² rearranges to b² = c² − a²." },
    { kind: "written", prompt: "A student says a triangle with sides 5, 7 and 9 is a right triangle. Explain how to check.", keyIdeas: ["the longest side would be the hypotenuse", "check whether 5² + 7² = 9²", "25 + 49 = 74 ≠ 81, so it is not a right triangle"], exemplar: "If it were a right triangle, the longest side, 9, would be the hypotenuse, so 5² + 7² would equal 9². But 25 + 49 = 74 and 9² = 81. They aren't equal, so it isn't a right triangle." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const [p, q, h] = r.pick(TRIPLES);
      const findHyp = r.chance(0.5);
      const ans = findHyp ? h : q;
      return {
        prompt: findHyp ? `A right triangle has legs ${p} and ${q}. Find the hypotenuse.` : `A right triangle has a leg of ${p} and a hypotenuse of ${h}. Find the other leg.`,
        visual: rightTri(p, q, findHyp ? { a: String(p), b: String(q), c: "?" } : { a: String(p), b: "?", c: String(h) }),
        answer: num(ans),
        hints: ["Use a² + b² = c², where c is the hypotenuse.", findHyp ? `c² = ${p}² + ${q}² = ${p * p} + ${q * q}.` : `b² = ${h}² − ${p}² = ${h * h} − ${p * p}.`],
        steps: findHyp
          ? [st("Write the theorem.", `${p}² + ${q}² = c²`), st("Square and add.", `${p * p} + ${q * q} = ${h * h}`), st("Take the square root.", `c = √${h * h} = ${h}`)]
          : [st("Write the theorem.", `${p}² + b² = ${h}²`), st("Subtract.", `b² = ${h * h} − ${p * p} = ${q * q}`), st("Take the square root.", `b = √${q * q} = ${q}`)],
        traps: traps(frac(ans), findHyp ? [trap(p + q, "Add the squares, not the sides."), trap(p * p + q * q, "That's c². Take the square root.")] : [trap(h - p, "Subtract the squares, not the sides."), trap(q * q, "That's b². Take the square root."), trap(Math.round(Math.sqrt(h * h + p * p) * 100) / 100, "The hypotenuse is the longest side, so subtract to find a leg.")]),
      };
    }
    let p: number, q: number, n: number, findHyp: boolean;
    for (;;) {
      p = r.int(2, 9); q = r.int(p + 1, 12);
      findHyp = r.chance(0.5);
      n = findHyp ? p * p + q * q : q * q - p * p;
      const { a, b } = radical(n);
      if (b !== 1 && a > 1) break;
      if (b !== 1 && lv === 2 && r.chance(0.3)) break;
    }
    const [typed, disp] = sqrtExact(n);
    const { a: ra, b: rb } = radical(n);
    if (lv === 2) {
      return {
        prompt: findHyp ? `A right triangle has legs ${p} and ${q}. Find the exact length of the hypotenuse in simplest radical form.` : `A right triangle has a leg of ${p} and a hypotenuse of ${q}. Find the exact length of the other leg in simplest radical form.`,
        visual: rightTri(findHyp ? p : p, findHyp ? q : Math.sqrt(n), findHyp ? { a: String(p), b: String(q), c: "?" } : { a: String(p), b: "?", c: String(q) }),
        answer: exact(typed, disp),
        hints: [findHyp ? `c² = ${p}² + ${q}² = ${n}.` : `b² = ${q}² − ${p}² = ${n}.`, ra > 1 ? `Simplify √${n}: look for a perfect-square factor. ${n} = ${ra * ra} · ${rb}.` : `${n} has no perfect-square factor, so √${n} is already simplest.`],
        steps: [
          st("Use the Pythagorean theorem.", findHyp ? `c² = ${p * p} + ${q * q} = ${n}` : `b² = ${q * q} − ${p * p} = ${n}`),
          st("Take the square root.", `√${n}`),
          ...(ra > 1 ? [st("Simplify.", `√${n} = √(${ra * ra} · ${rb}) = √${ra * ra} · √${rb} = ${disp}`)] : []),
          st("Answer.", `${disp} ≈ ${Math.sqrt(n).toFixed(2)}`),
        ],
      };
    }
    // Level 3: context, rounded to the nearest tenth.
    const ctx = r.pick(["ladder", "tv", "field", "ramp"]);
    let prompt: string, ans: number, steps: string[], vis: Visual;
    if (ctx === "ladder") {
      const L = r.int(14, 24), base = r.int(3, 7);
      ans = r1(Math.sqrt(L * L - base * base));
      prompt = `A ${L}-ft ladder leans against a wall with its base ${base} ft from the wall. How high up the wall does it reach? Round to the nearest tenth of a foot.`;
      steps = [st("Draw the triangle.", `The ladder is the hypotenuse (${L}); the ground distance (${base}) is a leg.`), st("Use the Pythagorean theorem.", `h² = ${L}² − ${base}² = ${L * L - base * base}`), st("Take the square root.", `h = √${L * L - base * base} ≈ ${ans} ft`)];
      vis = rightTri(Math.sqrt(L * L - base * base), base, { b: `${base} ft`, c: `${L} ft`, a: "h" });
    } else if (ctx === "tv") {
      const w = r.int(40, 60), h = r.int(22, 34);
      ans = r1(Math.sqrt(w * w + h * h));
      prompt = `A TV screen is ${w} in. wide and ${h} in. tall. TVs are sold by diagonal length. Find the diagonal to the nearest tenth of an inch.`;
      steps = [st("The diagonal is the hypotenuse.", `d² = ${w}² + ${h}² = ${w * w} + ${h * h} = ${w * w + h * h}`), st("Take the square root.", `d = √${w * w + h * h} ≈ ${ans} in.`)];
      vis = rightTri(h, w, { a: `${h} in.`, b: `${w} in.`, c: "d" });
    } else if (ctx === "field") {
      const w = r.int(40, 80), l = r.int(90, 120);
      ans = r1(Math.sqrt(w * w + l * l));
      prompt = `A soccer field is ${l} yd long and ${w} yd wide. How far is it diagonally from one corner to the opposite corner? Round to the nearest tenth of a yard.`;
      steps = [st("The diagonal is the hypotenuse.", `d² = ${l}² + ${w}² = ${l * l + w * w}`), st("Take the square root.", `d = √${l * l + w * w} ≈ ${ans} yd`)];
      vis = rightTri(w, l, { a: `${w} yd`, b: `${l} yd`, c: "d" });
    } else {
      const rise = r.int(2, 4), run = r.int(20, 40);
      ans = r1(Math.sqrt(rise * rise + run * run));
      prompt = `A wheelchair ramp rises ${rise} ft over a horizontal distance of ${run} ft. How long is the ramp surface? Round to the nearest tenth of a foot.`;
      steps = [st("The ramp surface is the hypotenuse.", `L² = ${rise}² + ${run}² = ${rise * rise + run * run}`), st("Take the square root.", `L = √${rise * rise + run * run} ≈ ${ans} ft`)];
      vis = rightTri(rise, run, { a: `${rise} ft`, b: `${run} ft`, c: "L" });
    }
    return {
      prompt,
      visual: vis,
      answer: num(ans, { tolerance: 0.1 }),
      hints: ["Sketch the right triangle and decide which length is the hypotenuse (the side across from the right angle).", ctx === "ladder" ? "You know the hypotenuse, so subtract squares to find the leg." : "You know both legs, so add their squares."],
      steps,
    };
  },
};

// ---------- 2. Trig ratios ----------
const ratios: Skill = {
  id: "m2.trig.ratios",
  title: "Sine, cosine and tangent ratios",
  topic: T,
  standards: ["NC.M2.G-SRT.6"],
  prereqs: ["m2.trig.pythagorean", "m2.sim.aa"],
  lesson: {
    bigIdea: "For an acute angle of a right triangle: sin = {opposite/hypotenuse}, cos = {adjacent/hypotenuse}, tan = {opposite/adjacent} (SOH CAH TOA). These ratios depend only on the angle.",
    explain: [
      "Opposite and adjacent depend on which angle you're standing at. The hypotenuse is always across from the right angle.",
      "Worked example: legs 5 (opposite A) and 12 (adjacent to A), hypotenuse 13. sin A = {5/13}, cos A = {12/13}, tan A = {5/12}.",
      "Why the ratios are well defined: any two right triangles with the same acute angle are similar (AA), so their side ratios are equal. A 10-24-26 triangle with the same angle gives sin A = {10/26} = {5/13} again.",
    ],
    visual: rightTri(5, 12, { a: "5", b: "12", c: "13" }),
    tip: "Notice sin A = cos B: the side opposite A is adjacent to B.",
  },
  why: [
    { kind: "choice", prompt: "Why is sin 30° the same in every right triangle with a 30° angle, no matter how big?", choices: ["All such triangles are similar (AA), so the ratio opposite/hypotenuse is the same.", "Because the hypotenuse is always 1.", "Because the sides are always 30 units.", "It isn't; it depends on the size."], correct: 0, explain: "Similar triangles have proportional sides, so every side ratio is the same." },
    { kind: "written", prompt: "In right triangle ABC with the right angle at C, explain why sin A = cos B.", keyIdeas: ["the side opposite A is BC", "BC is also the side adjacent to B", "both ratios are BC divided by the hypotenuse AB"], exemplar: "sin A is the side opposite A over the hypotenuse, which is BC/AB. cos B is the side adjacent to B over the hypotenuse, and the side next to B (that isn't the hypotenuse) is also BC. So both equal BC/AB." },
  ],
  generate(r, lv) {
    const [p, q, h] = r.pick(TRIPLES.slice(0, 4).concat([[6, 8, 10], [9, 40, 41]]));
    const [a, b] = r.chance(0.5) ? [p, q] : [q, p]; // a = BC (opposite A), b = AC
    const at = r.pick(["A", "B"]);
    const fn = r.pick(["sin", "cos", "tan"]);
    const opp = at === "A" ? a : b, adj = at === "A" ? b : a;
    const val = fn === "sin" ? frac(opp, h) : fn === "cos" ? frac(adj, h) : frac(opp, adj);
    const rule = fn === "sin" ? "opposite/hypotenuse" : fn === "cos" ? "adjacent/hypotenuse" : "opposite/adjacent";
    const trapList = () => traps(val, [
      trap(frac(adj, opp), "That's upside down. Check which side goes on top."),
      trap(frac(fn === "sin" ? adj : opp, h), `Check which side is opposite ${at} and which is adjacent to ${at}.`),
      trap(frac(fn === "tan" ? opp : adj, fn === "tan" ? h : adj === opp ? h : opp), "Check SOH CAH TOA: which two sides does this ratio use?"),
      trap(frac(h, fn === "cos" ? adj : opp), "The hypotenuse goes on the bottom of sin and cos."),
    ]);
    if (lv === 1) {
      return {
        prompt: `Find ${fn} ${at}. Give your answer as a fraction.`,
        visual: rightTri(a, b, { a: String(a), b: String(b), c: String(h) }),
        answer: num(val, { simplest: true }),
        hints: [`${fn} = ${rule}.`, `From ${at}, the opposite side is ${opp}, the adjacent side is ${adj}, and the hypotenuse is ${h}.`],
        steps: [st(`Name the sides from angle ${at}.`, `opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${h}`), st(`Use ${fn} = ${rule}.`, `${fn} ${at} = ${fracText(val.n, val.d)}`)],
        traps: trapList(),
      };
    }
    if (lv === 2) {
      const hide = r.pick(["a", "b", "c"] as const);
      const labels = { a: String(a), b: String(b), c: String(h) };
      labels[hide] = "?";
      return {
        prompt: `Find ${fn} ${at} as a fraction. (Find the missing side first.)`,
        visual: rightTri(a, b, labels),
        answer: num(val, { simplest: true }),
        hints: ["Use the Pythagorean theorem to find the missing side.", `The sides are ${a}, ${b} and ${h}. Now ${fn} = ${rule}.`],
        steps: [st("Find the missing side.", hide === "c" ? `c = √(${a}² + ${b}²) = ${h}` : `${hide === "a" ? "BC" : "AC"} = √(${h}² − ${hide === "a" ? b : a}²) = ${hide === "a" ? a : b}`), st(`Name the sides from angle ${at}.`, `opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${h}`), st(`Use ${fn} = ${rule}.`, `${fn} ${at} = ${fracText(val.n, val.d)}`)],
        traps: trapList(),
      };
    }
    // Level 3: given one ratio, find another.
    const given = r.pick(["sin", "cos", "tan"].filter((f) => f !== fn));
    const gval = given === "sin" ? frac(opp, h) : given === "cos" ? frac(adj, h) : frac(opp, adj);
    const other = r.chance(0.4);
    const ask = other ? (at === "A" ? "B" : "A") : at;
    const oo = ask === "A" ? a : b, aa2 = ask === "A" ? b : a;
    const v3 = fn === "sin" ? frac(oo, h) : fn === "cos" ? frac(aa2, h) : frac(oo, aa2);
    return {
      prompt: `In right triangle ABC with the right angle at C, ${given} ${at} = ${fracText(gval.n, gval.d)}. Find ${fn} ${ask}.`,
      answer: num(v3, { simplest: true }),
      hints: [`Draw the triangle and label two sides from ${given} ${at} = ${fracPlain(gval.n, gval.d)}. Use the Pythagorean theorem for the third side.`, `The sides are ${p}, ${q} and ${h} (scale doesn't matter, since only ratios count). Now find ${fn} ${ask} = ${rule}${ask !== at ? `, standing at ${ask}` : ""}.`],
      steps: [
        st(`Sketch using ${given} ${at}.`, `${given === "sin" ? `opposite ${at} = ${opp}, hypotenuse = ${h}` : given === "cos" ? `adjacent to ${at} = ${adj}, hypotenuse = ${h}` : `opposite ${at} = ${opp}, adjacent = ${adj}`}`),
        st("Find the third side.", `Using a² + b² = c², the sides are ${opp}, ${adj} and ${h}.`),
        st(`Find ${fn} ${ask}.`, `From ${ask}: opposite = ${oo}, adjacent = ${aa2}, hypotenuse = ${h}. ${fn} ${ask} = ${fracText(v3.n, v3.d)}`),
      ],
      traps: traps(v3, [trap(gval, `That's the given ratio, ${given} ${at}.`), trap(frac(v3.d, v3.n), "That's the reciprocal.")]),
    };
  },
};

// ---------- 3. Finding a side with trig ----------
const findSide: Skill = {
  id: "m2.trig.find-side",
  title: "Find a missing side with trig",
  topic: T,
  standards: ["NC.M2.G-SRT.8", "NC.M2.A-CED.1"],
  prereqs: ["m2.trig.ratios"],
  lesson: {
    bigIdea: "Pick the ratio that links the angle you know, the side you know and the side you want. Write the equation, then solve.",
    explain: [
      "Angle 35°, hypotenuse 20, want the side opposite: sin 35° = {x/20}, so x = 20 sin 35° ≈ 20(0.5736) ≈ **11.5**.",
      "Unknown on the bottom: angle 40°, opposite side 9, want the adjacent side: tan 40° = {9/x}, so x = {9/tan 40°} ≈ 10.7.",
      "Make sure your calculator is in degree mode. sin 35° should be about 0.57.",
    ],
    visual: rightTri(11.47, 16.38, { A: "35°", c: "20", a: "x" }),
  },
  why: [
    { kind: "choice", prompt: "You know angle A and the hypotenuse, and want the side adjacent to A. Why use cosine?", choices: ["Cosine is the ratio of the adjacent side to the hypotenuse, the two sides involved.", "Cosine is always the largest ratio.", "Because sine only works for opposite sides longer than 10.", "Tangent would work just as well."], correct: 0, explain: "Choose the ratio whose two sides are the one you know and the one you want." },
    { kind: "written", prompt: "Explain why x = 9 ÷ tan 40° and not 9 · tan 40° when tan 40° = 9/x.", keyIdeas: ["x is in the denominator", "multiply both sides by x: x tan 40° = 9", "divide by tan 40°: x = 9/tan 40°"], exemplar: "The unknown x is in the denominator. Multiplying both sides by x gives x · tan 40° = 9, and then dividing both sides by tan 40° gives x = 9 ÷ tan 40°." },
  ],
  generate(r, lv) {
    const A = r.int(20, 70);
    const known = r.pick(["c", "a", "b"] as const);
    const L = r.int(6, 30);
    // True sides for angle A: a = opposite, b = adjacent, c = hyp.
    let a: number, b: number, c: number;
    if (known === "c") { c = L; a = c * Math.sin(A * DEG); b = c * Math.cos(A * DEG); }
    else if (known === "a") { a = L; c = a / Math.sin(A * DEG); b = a / Math.tan(A * DEG); }
    else { b = L; a = b * Math.tan(A * DEG); c = b / Math.cos(A * DEG); }
    const opts = (["a", "b", "c"] as const).filter((s) => s !== known);
    let want = r.pick(opts);
    // Level 1: unknown in the numerator (known side is the denominator of the ratio used).
    if (lv === 1) want = known === "c" ? r.pick(["a", "b"] as const) : known === "b" ? "a" : "b";
    if (lv === 2 && known !== "c") want = known === "a" ? r.pick(["b", "c"] as const) : "c";
    const sides = { a, b, c };
    const nm = { a: "opposite", b: "adjacent", c: "hypotenuse" } as const;
    const pair = [known, want].sort().join("");
    const fn = pair === "ac" ? "sin" : pair === "bc" ? "cos" : "tan";
    const top = fn === "sin" ? "a" : fn === "tan" ? "a" : "b";
    const ratio = Math[fn](A * DEG);
    const unknownOnTop = top === want;
    const ans = r1(sides[want]);
    const useB = lv === 3 && r.chance(0.5);
    const angVal = useB ? 90 - A : A;
    const label: Record<string, string> = { a: "", b: "", c: "" };
    label[known] = String(L);
    label[want] = "x";
    // If the angle is given at B, swap the roles of the legs in the picture.
    // Angle B is 90° − A in the same picture, so the side labels don't change.
    const vis = rightTri(a, b, { a: label.a || undefined, b: label.b || undefined, c: label.c || undefined, ...(useB ? { B: `${angVal}°` } : { A: `${A}°` }) });
    const eq = unknownOnTop ? `${fn} ${A}° = {x/${L}}` : `${fn} ${A}° = {${L}/x}`;
    const work = unknownOnTop ? `x = ${L} · ${fn} ${A}° ≈ ${L}(${ratio.toFixed(4)}) ≈ ${ans}` : `x = {${L}/${fn} ${A}°} ≈ {${L}/${ratio.toFixed(4)}} ≈ ${ans}`;
    const wrongTop = unknownOnTop ? L / ratio : L * ratio;
    const sw = fn === "sin" ? Math.cos(A * DEG) : fn === "cos" ? Math.sin(A * DEG) : 1 / ratio;
    const swapped = unknownOnTop ? L * sw : L / sw;
    const radAns = unknownOnTop ? L * Math[fn](A) : L / Math[fn](A);
    return {
      prompt: `Find x. Round to the nearest tenth.`,
      visual: vis,
      answer: num(ans, { tolerance: 0.1 }),
      hints: [
        useB ? `The ${angVal}° angle is at B. You can work from B, or use the other acute angle, 90° − ${angVal}° = ${A}°, at A.` : `From the ${A}° angle, the known side is the ${nm[known]}${known === "c" ? "" : " side"} and x is the ${nm[want]}${want === "c" ? "" : " side"}.`,
        `${nm[known][0].toUpperCase() + nm[known].slice(1)} and ${nm[want]} go with ${fn.toUpperCase() === "SIN" ? "sine (SOH)" : fn === "cos" ? "cosine (CAH)" : "tangent (TOA)"}: ${eq}.`,
        unknownOnTop ? `Multiply both sides by ${L}.` : "x is in the denominator: multiply both sides by x, then divide by the trig value.",
      ],
      steps: [
        ...(useB ? [st("Use the other acute angle.", `m∠A = 90° − ${angVal}° = ${A}°`)] : []),
        st("Label the sides from the angle.", `${nm[known]} = ${L}, ${nm[want]} = x`),
        st("Choose the ratio.", eq),
        st("Solve.", work),
      ],
      traps: tolTraps(ans, 0.1, [trap(r1(wrongTop), unknownOnTop ? "You divided; x is on top, so multiply." : "x is in the denominator, so divide the side by the trig value."), ...(radAns > 0 ? [trap(r1(radAns), "Your calculator is in radian mode. Switch to degrees.")] : []), trap(r1(swapped), "Check which side is opposite and which is adjacent to the angle.")]),
    };
  },
};

// ---------- 4. Finding an angle ----------
const findAngle: Skill = {
  id: "m2.trig.find-angle",
  title: "Find a missing angle with inverse trig",
  topic: T,
  standards: ["NC.M2.G-SRT.8"],
  prereqs: ["m2.trig.find-side"],
  lesson: {
    bigIdea: "When you know two sides and want an angle, find the ratio, then use the inverse function: sin⁻¹, cos⁻¹ or tan⁻¹.",
    explain: [
      "Opposite 7 and adjacent 10: tan A = {7/10} = 0.7, so A = tan⁻¹(0.7) ≈ **35.0°**.",
      "sin⁻¹ undoes sin: it takes a ratio and gives back the angle. Check that the answer is between 0° and 90°.",
      "The other acute angle is 90° minus the first, because the angles add to 180° and one of them is 90°.",
    ],
    visual: rightTri(7, 10, { a: "7", b: "10", A: "?" }),
  },
  why: [
    { kind: "choice", prompt: "Why does tan⁻¹(1) = 45°?", choices: ["A right triangle with equal legs has two 45° angles, and tan 45° = leg/leg = 1.", "Because 1 × 45 = 45.", "Because tan⁻¹ means 1/tan.", "Because tan is always 1 at the hypotenuse."], correct: 0, explain: "An isosceles right triangle has tan of its acute angle equal to 1." },
    { kind: "written", prompt: "A student gets sin A = 1.25 from two sides of a right triangle. Explain what went wrong.", keyIdeas: ["sin is opposite over hypotenuse", "the hypotenuse is the longest side", "so sin must be less than 1; they probably divided by a leg instead of the hypotenuse"], exemplar: "Sine is opposite over hypotenuse, and the hypotenuse is always the longest side, so sine can't be more than 1. The student probably put the hypotenuse on top or used a leg in the denominator." },
  ],
  generate(r, lv) {
    const legs: [number, number] = [r.int(4, 20), r.int(4, 20)];
    let [a, b] = legs;
    if (a === b) b += 3;
    const c = Math.hypot(a, b);
    const cR = lv === 1 ? 0 : Math.round(c);
    const fn = lv === 1 ? "tan" : r.pick(["sin", "cos"]);
    // For sin/cos use a hypotenuse that is a whole number: rebuild the triangle from it.
    let opp = a, adj = b, hyp = c;
    if (fn !== "tan") {
      hyp = cR + r.int(1, 4);
      if (fn === "sin") { opp = a; adj = Math.sqrt(hyp * hyp - a * a); }
      else { adj = b > hyp - 1 ? hyp - 2 : b; opp = Math.sqrt(hyp * hyp - adj * adj); }
    }
    const ratio = fn === "tan" ? opp / adj : fn === "sin" ? opp / hyp : adj / hyp;
    const angle = (fn === "tan" ? Math.atan(ratio) : fn === "sin" ? Math.asin(ratio) : Math.acos(ratio)) / DEG;
    const atB = lv === 3;
    const ans = Math.round(atB ? 90 - angle : angle);
    const labels: { a?: string; b?: string; c?: string; A?: string; B?: string } = {};
    if (fn === "tan") { labels.a = String(opp); labels.b = String(adj); }
    if (fn === "sin") { labels.a = String(opp); labels.c = String(hyp); }
    if (fn === "cos") { labels.b = String(adj); labels.c = String(hyp); }
    if (atB) labels.B = "?"; else labels.A = "?";
    const n1 = fn === "cos" ? adj : opp, d1 = fn === "tan" ? adj : hyp;
    return {
      prompt: `Find m∠${atB ? "B" : "A"} to the nearest degree.`,
      visual: rightTri(opp, adj, labels),
      answer: num(ans, { tolerance: 0.6, unit: "°" }),
      hints: [
        atB ? "Work from angle A first (or label the sides from B directly)." : `From A, which sides do you know: opposite, adjacent or hypotenuse?`,
        `${fn} A = {${n1}/${d1}}, so m∠A = ${fn}⁻¹({${n1}/${d1}}).`,
        ...(atB ? ["Then m∠B = 90° − m∠A."] : []),
      ],
      steps: [
        st("Pick the ratio from angle A.", `${fn} A = {${n1}/${d1}} ≈ ${ratio.toFixed(4)}`),
        st("Use the inverse.", `m∠A = ${fn}⁻¹(${ratio.toFixed(4)}) ≈ ${angle.toFixed(1)}°`),
        ...(atB ? [st("Find the other acute angle.", `m∠B = 90° − ${angle.toFixed(1)}° ≈ ${(90 - angle).toFixed(1)}°`)] : []),
        st("Round.", `${ans}°`),
      ],
      traps: tolTraps(ans, 0.6, [trap(Math.round(atB ? angle : 90 - angle), atB ? "That's angle A. Angle B is the other acute angle." : "That's the other acute angle. Check which sides are opposite and adjacent to A."), trap(Math.round(ratio * 100) / 100, `That's the ratio. Use ${fn}⁻¹ to turn it into an angle.`)]),
    };
  },
};

// ---------- 5. Special right triangles ----------
const special: Skill = {
  id: "m2.trig.special",
  title: "Special right triangles (45-45-90 and 30-60-90)",
  topic: T,
  standards: ["NC.M2.G-SRT.12"],
  prereqs: ["m2.trig.pythagorean"],
  lesson: {
    bigIdea: "45-45-90: legs x, x and hypotenuse x√2. 30-60-90: short leg x, long leg x√3, hypotenuse 2x.",
    explain: [
      "45-45-90 comes from cutting a square along a diagonal: legs 5 and 5 give hypotenuse √(25 + 25) = **5√2**.",
      "30-60-90 comes from cutting an equilateral triangle in half: side 2x becomes the hypotenuse, half of it (x) is the short leg, and the height is √(4x² − x²) = **x√3**.",
      "Work from the short leg: long leg 9 means x√3 = 9, so x = {9/√3} = 3√3 and the hypotenuse is 6√3.",
    ],
    visual: rightTri(Math.sqrt(3), 1, { a: "x√3", b: "x", c: "2x", A: "60°", B: "30°" }),
    tip: "The shortest side is across from the smallest angle: the short leg is opposite 30°.",
  },
  why: [
    { kind: "choice", prompt: "Why is the hypotenuse of a 30-60-90 triangle exactly twice the short leg?", choices: ["The triangle is half of an equilateral triangle: the hypotenuse is a full side and the short leg is half a side.", "Because 60 is twice 30.", "Because sin 30° = 2.", "Because the long leg is √3."], correct: 0, explain: "Cutting an equilateral triangle by an altitude halves the base but keeps the slanted side whole." },
    { kind: "written", prompt: "Explain why the legs of a 45-45-90 triangle are equal and why the hypotenuse is leg · √2.", keyIdeas: ["two equal angles mean the opposite sides are equal (isosceles)", "by the Pythagorean theorem c² = x² + x² = 2x²", "so c = x√2"], exemplar: "The two 45° angles are equal, so the sides opposite them, the legs, are equal: call each x. Then c² = x² + x² = 2x², so c = √(2x²) = x√2." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const x = r.int(2, 12);
      const fromLeg = r.chance(0.6);
      if (fromLeg) {
        return {
          prompt: `A 45-45-90 triangle has legs of length ${x}. Find the exact length of the hypotenuse.`,
          visual: rightTri(1, 1, { a: String(x), b: String(x), c: "?", A: "45°", B: "45°" }),
          answer: exact(`${x}sqrt(2)`, `${x}√2`),
          hints: ["In a 45-45-90 triangle, hypotenuse = leg · √2.", `${x} · √2`],
          steps: [st("Use the 45-45-90 pattern.", "hypotenuse = leg · √2"), st("Substitute.", `${x}√2 ≈ ${(x * Math.SQRT2).toFixed(2)}`)],
        };
      }
      return {
        prompt: `A 45-45-90 triangle has a hypotenuse of ${x}√2. Find the length of a leg.`,
        visual: rightTri(1, 1, { a: "?", c: `${x}√2`, A: "45°", B: "45°" }),
        answer: num(x),
        hints: ["hypotenuse = leg · √2, so leg = hypotenuse ÷ √2.", `${x}√2 ÷ √2 = ?`],
        steps: [st("Use the 45-45-90 pattern.", "leg = hypotenuse ÷ √2"), st("Divide.", `${x}√2 ÷ √2 = ${x}`)],
        traps: traps(frac(x), [trap(2 * x, "Divide by √2; don't multiply by 2.")]),
      };
    }
    if (lv === 2) {
      const x = r.int(2, 12);
      const ask = r.pick(["long", "hyp"]);
      return {
        prompt: `In a 30-60-90 triangle the short leg is ${x}. Find the exact length of the ${ask === "long" ? "longer leg" : "hypotenuse"}.`,
        visual: rightTri(Math.sqrt(3), 1, { b: String(x), a: ask === "long" ? "?" : undefined, c: ask === "hyp" ? "?" : undefined, A: "60°", B: "30°" }),
        answer: ask === "long" ? exact(`${x}sqrt(3)`, `${x}√3`) : exact(String(2 * x)),
        hints: ["Short leg x, long leg x√3, hypotenuse 2x.", `Here x = ${x}.`],
        steps: [st("Use the 30-60-90 pattern.", "short leg x, long leg x√3, hypotenuse 2x"), st("Substitute x = " + x + ".", ask === "long" ? `long leg = ${x}√3 ≈ ${(x * Math.sqrt(3)).toFixed(2)}` : `hypotenuse = 2(${x}) = ${2 * x}`)],
      };
    }
    const kind = r.pick(["fromHyp", "fromLong", "45hyp"]);
    if (kind === "fromHyp") {
      const x = r.int(2, 10);
      return {
        prompt: `In a 30-60-90 triangle the hypotenuse is ${2 * x}. Find the exact length of the longer leg.`,
        visual: rightTri(Math.sqrt(3), 1, { c: String(2 * x), a: "?", A: "60°", B: "30°" }),
        answer: exact(`${x}sqrt(3)`, `${x}√3`),
        hints: ["Find the short leg first: it's half the hypotenuse.", `Short leg = ${x}. Long leg = short leg · √3.`],
        steps: [st("Short leg = half the hypotenuse.", `${2 * x} ÷ 2 = ${x}`), st("Long leg = short leg · √3.", `${x}√3`)],
      };
    }
    if (kind === "fromLong") {
      const x = r.int(2, 8);
      const long = 3 * x; // short = long/√3 = x√3
      return {
        prompt: `In a 30-60-90 triangle the longer leg is ${long}. Find the exact length of the hypotenuse.`,
        visual: rightTri(Math.sqrt(3), 1, { a: String(long), c: "?", A: "60°", B: "30°" }),
        answer: exact(`${2 * x}sqrt(3)`, `${2 * x}√3`),
        hints: [`Long leg = short leg · √3, so short leg = ${long} ÷ √3.`, `${long} ÷ √3 = {${long}√3/3} = ${x}√3. The hypotenuse is twice that.`],
        steps: [st("Find the short leg.", `x√3 = ${long}, so x = {${long}/√3} = {${long}√3/3} = ${x}√3`), st("Hypotenuse = 2x.", `2 · ${x}√3 = ${2 * x}√3`)],
      };
    }
    const k = 2 * r.int(1, 8);
    return {
      prompt: `A square has a diagonal of length ${k}. Find the exact side length.`,
      visual: { type: "geo", showLabels: false, points: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 4, y: 4 }, d: { x: 0, y: 4 } }, polygons: [["a", "b", "c", "d"]], segments: [{ from: "a", to: "c", label: String(k) }] },
      answer: exact(`${k / 2}sqrt(2)`, k / 2 === 1 ? "√2" : `${k / 2}√2`),
      hints: ["The diagonal splits the square into two 45-45-90 triangles; the diagonal is the hypotenuse.", `side = ${k} ÷ √2 = {${k}√2/2}.`],
      steps: [st("Use the 45-45-90 pattern.", `side · √2 = ${k}`), st("Solve and rationalize.", `side = {${k}/√2} = {${k}√2/2} = ${k / 2 === 1 ? "" : k / 2}√2`)],
    };
  },
};

// ---------- 6. Trig in context ----------
const applications: Skill = {
  id: "m2.trig.applications",
  title: "Angles of elevation and depression",
  topic: T,
  standards: ["NC.M2.G-SRT.8", "NC.M2.A-SSE.1", "NC.M2.A-SSE.1a", "NC.M2.A-SSE.1b", "NC.M2.A-CED.1"],
  prereqs: ["m2.trig.find-side", "m2.trig.find-angle"],
  lesson: {
    bigIdea: "Angles of elevation (looking up) and depression (looking down) are measured from the horizontal. Draw the right triangle, label it, then use a trig ratio.",
    explain: [
      "From 50 m away, the angle of elevation to the top of a building is 32°. The height is opposite the angle and 50 m is adjacent: tan 32° = {h/50}, so h = 50 tan 32° ≈ **31.2 m**.",
      "Angle of depression from a lighthouse 40 m tall to a boat is 12°. By alternate interior angles it equals the angle of elevation from the boat, so tan 12° = {40/d} and d = {40/tan 12°} ≈ 188.2 m.",
      "Reading expressions: in d = {40/tan 12°}, the 40 is the height, tan 12° is opposite ÷ adjacent for the 12° angle, and d is the horizontal distance.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the angle of depression from the top of a cliff to a boat equal the angle of elevation from the boat to the cliff top?", choices: ["They are alternate interior angles between two horizontal (parallel) lines.", "Because both are 45°.", "Because they are complementary.", "They're only equal if the boat is close."], correct: 0, explain: "The horizontal line at the cliff top and the water level are parallel; the line of sight is a transversal." },
    { kind: "written", prompt: "A drone's height is modeled by h = 120 sin θ, where 120 m is the length of its tether. Explain what the expression means.", keyIdeas: ["120 is the hypotenuse (the tether)", "θ is the angle the tether makes with the ground", "sin θ is opposite over hypotenuse, so 120 sin θ is the opposite side, the height"], exemplar: "The tether is the hypotenuse, 120 m. θ is the angle between the tether and the ground. Since sin θ = height ÷ 120, multiplying 120 by sin θ gives the vertical side: the drone's height." },
  ],
  generate(r, lv) {
    const nm = r.pick(["Maya", "Kai", "Omar", "Zoe", "Eli", "Ruby"]);
    if (lv === 2) {
      const ang = r.int(20, 60), d = r.int(30, 120);
      const thing = r.pick(["a cell tower", "a water tower", "a building", "a stadium light"]);
      const correct = `tan ${ang}° = {h/${d}}`;
      return {
        prompt: `${nm} stands ${d} ft from the base of ${thing} and measures the angle of elevation to the top as ${ang}°. Which equation can be used to find the height h (ignore ${nm}'s eye height)?`,
        visual: rightTri(d * Math.tan(ang * DEG), d, { a: "h", b: `${d} ft`, A: `${ang}°` }),
        answer: choice(r, correct, [[`sin ${ang}° = {h/${d}}`, `${d} ft is along the ground, which is adjacent to the angle, not the hypotenuse.`], [`tan ${ang}° = {${d}/h}`, "Tangent is opposite over adjacent: h is opposite the angle."], [`cos ${ang}° = {h/${d}}`, "Cosine uses the adjacent side and the hypotenuse; h is opposite."]]),
        hints: ["Sketch: the height is a vertical leg, the ground distance is the horizontal leg, and the line of sight is the hypotenuse.", "From the angle, h is opposite and the ground distance is adjacent."],
        steps: [st("Label from the angle.", `opposite = h, adjacent = ${d}`), st("Opposite and adjacent use tangent.", correct), st("Solve if needed.", `h = ${d} tan ${ang}° ≈ ${r1(d * Math.tan(ang * DEG))} ft`)],
      };
    }
    if (lv === 1) {
      const ang = r.int(15, 65), d = r.int(20, 150);
      const h = r1(d * Math.tan(ang * DEG));
      const thing = r.pick(["a flagpole", "a tree", "a climbing wall", "a roller coaster drop"]);
      return {
        prompt: `From ${d} m away, the angle of elevation to the top of ${thing} is ${ang}°. How tall is it? Round to the nearest tenth of a meter.`,
        visual: rightTri(d * Math.tan(ang * DEG), d, { a: "h", b: `${d} m`, A: `${ang}°` }),
        answer: num(h, { tolerance: 0.1, unit: " m" }),
        hints: ["The height is opposite the angle; the distance along the ground is adjacent.", `tan ${ang}° = {h/${d}}`],
        steps: [st("Write the equation.", `tan ${ang}° = {h/${d}}`), st("Solve.", `h = ${d} tan ${ang}° ≈ ${d}(${Math.tan(ang * DEG).toFixed(4)}) ≈ ${h} m`)],
        traps: tolTraps(h, 0.1, [trap(r1(d * Math.sin(ang * DEG)), "The ground distance is adjacent, not the hypotenuse: use tangent."), trap(r1(d / Math.tan(ang * DEG)), "h is on top of the ratio: multiply by tan, don't divide."), ...(Math.tan(ang) > 0 ? [trap(r1(d * Math.tan(ang)), "Your calculator is in radian mode.")] : [])]),
      };
    }
    const kind = r.pick(["depression", "interpret"]);
    if (kind === "interpret") {
      const L = r.pick([60, 80, 100, 120]);
      const sym = r.pick(["sin", "cos"]);
      const correct = sym === "sin" ? "The kite's height above the ground" : "The horizontal distance from the person to the point under the kite";
      return {
        prompt: `A kite on a ${L}-ft string makes an angle θ with the ground. What does the expression ${L} ${sym} θ represent?`,
        visual: rightTri(L * Math.sin(50 * DEG), L * Math.cos(50 * DEG), { c: `${L} ft`, A: "θ" }),
        answer: choice(r, correct, [[sym === "sin" ? "The horizontal distance from the person to the point under the kite" : "The kite's height above the ground", `${sym === "sin" ? "Sine" : "Cosine"} uses the ${sym === "sin" ? "opposite" : "adjacent"} side.`], ["The length of the string", "The string is the hypotenuse, which is just " + L + "."], ["The angle the string makes with the ground", "θ is the angle; the expression is a length."]]),
        hints: [`The string is the hypotenuse. ${sym} θ = ${sym === "sin" ? "opposite" : "adjacent"} ÷ hypotenuse.`, `So ${L} ${sym} θ = the ${sym === "sin" ? "opposite" : "adjacent"} side.`],
        steps: [st("Write the ratio.", `${sym} θ = {${sym === "sin" ? "opposite" : "adjacent"}/${L}}`), st("Multiply by " + L + ".", `${L} ${sym} θ = the ${sym === "sin" ? "side opposite θ: the height" : "side adjacent to θ: the horizontal distance"}`)],
      };
    }
    const ang = r.int(8, 35), H = r.pick([25, 40, 55, 70, 90]);
    const d = r1(H / Math.tan(ang * DEG));
    const from = r.pick(["the top of a lighthouse", "a cliff", "a drone hovering"]);
    return {
      prompt: `From ${from} ${H} m above the water, the angle of depression to a boat is ${ang}°. How far is the boat from the point directly below? Round to the nearest tenth of a meter.`,
      visual: rightTri(H, H / Math.tan(ang * DEG), { a: `${H} m`, b: "d", A: `${ang}°` }),
      answer: num(d, { tolerance: 0.1, unit: " m" }),
      hints: ["The angle of depression equals the angle of elevation from the boat (alternate interior angles).", `From the boat: tan ${ang}° = {${H}/d}. d is in the denominator.`],
      steps: [st("Move the angle to the boat.", `Angle of elevation from the boat = ${ang}°`), st("Write the equation.", `tan ${ang}° = {${H}/d}`), st("Solve.", `d = {${H}/tan ${ang}°} ≈ {${H}/${Math.tan(ang * DEG).toFixed(4)}} ≈ ${d} m`)],
      traps: tolTraps(d, 0.1, [trap(r1(H * Math.tan(ang * DEG)), "d is in the denominator: divide by tan, don't multiply."), trap(r1(H / Math.sin(ang * DEG)), "That's the line-of-sight distance (the hypotenuse), not the distance along the water.")]),
    };
  },
};

const skills: Skill[] = [pythag, ratios, findSide, findAngle, special, applications];
export default skills;
