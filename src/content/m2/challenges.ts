// Boss-level challenges for NC Math 2: multi-part, in-context problems that combine several skills.
import { choice, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Challenge, Problem } from "../types";
import { DEG, fracText, plane, pt, r1, tolTraps } from "./util";
import { rightTri } from "./trig";

// ---------- 1. Skate park ramp ----------
const skateRamp: Challenge = {
  id: "m2.ch.skate-ramp",
  title: "Design a skate ramp",
  needs: ["m2.trig.pythagorean", "m2.trig.find-angle", "m2.sim.similar-figures"],
  build(r) {
    const [rise, run, len] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
    const k = r.pick([2, 3]);
    const H = rise * k, D = run * k, L = len * k;
    const ang = Math.atan(H / D) / DEG;
    const angR = Math.round(ang);
    const mini = r.pick([2, 3]);
    const vis = rightTri(H, D, { a: `${H} ft`, b: `${D} ft`, c: "ramp" });
    const parts: Problem[] = [
      {
        prompt: `A skate ramp rises ${H} ft over a horizontal run of ${D} ft. How long is the ramp's surface?`,
        visual: vis,
        answer: num(L, { unit: " ft" }),
        hints: ["The surface is the hypotenuse of a right triangle.", `√(${H}^2 + ${D}^2)`],
        steps: [st("Pythagorean theorem.", `${H}^2 + ${D}^2 = ${H * H} + ${D * D} = ${L * L}`), st("Square root.", `√${L * L} = ${L} ft`)],
        traps: traps(frac(L), [trap(H + D, "Add the squares, not the sides.")]),
      },
      {
        prompt: "Park rules say a beginner ramp must be steeper than 20° but less steep than 45°. Find the ramp's angle with the ground to the nearest degree.",
        visual: rightTri(H, D, { a: `${H} ft`, b: `${D} ft`, c: "ramp", A: "θ" }),
        answer: num(angR, { tolerance: 0.6, unit: "°" }),
        hints: ["From the angle at the ground, the rise is opposite and the run is adjacent.", `θ = tan⁻¹({${H}/${D}})`],
        steps: [st("Tangent ratio.", `tan θ = {${H}/${D}}`), st("Inverse tangent.", `θ = tan⁻¹(${(H / D).toFixed(4)}) ≈ ${ang.toFixed(1)}° ≈ ${angR}°`), st("Check the rule.", angR > 20 && angR < 45 ? "It's between 20° and 45°, so it's allowed." : "It's outside 20°–45°, so it breaks the rule.")],
        traps: tolTraps(angR, 0.6, [trap(Math.round(90 - ang), "That's the angle at the top of the ramp, not at the ground.")]),
      },
      {
        prompt: `A mini ramp for little kids is similar to this one with scale factor {1/${mini}}. How tall is the mini ramp? (Give a fraction or decimal.)`,
        answer: num(frac(H, mini), { unit: " ft" }),
        hints: ["Similar figures: every length is multiplied by the scale factor.", `${H} × {1/${mini}}`],
        steps: [st("Scale the height.", `${H} × {1/${mini}} = ${fracText(H, mini)} ft`), st("The angle is unchanged.", `Similar triangles have equal angles, so the mini ramp is also about ${angR}°.`)],
        traps: traps(frac(H, mini), [trap(H * mini, "A scale factor of 1/" + mini + " shrinks lengths.")]),
      },
    ];
    return { intro: `You're on the design team for a new skate park. Check the main ramp's dimensions, its steepness, and a smaller copy for kids.`, parts };
  },
};

// ---------- 2. Water-balloon launch ----------
const balloon: Challenge = {
  id: "m2.ch.balloon-launch",
  title: "Water-balloon launcher",
  needs: ["m2.quad.max-min-context", "m2.qeq.model", "m2.sys.model"],
  build(r) {
    const tLand = r.int(3, 5), t0 = 1;
    // h = −16(t − tLand)(t + t0) = −16t^2 + 16(tLand − t0)t + 16 tLand t0
    const b = 16 * (tLand - t0), c = 16 * tLand * t0;
    const tMax = b / 32, hMax = c + (b * b) / 64;
    const m = r.pick([8, 16, 24]);
    // Balloon and a drone rising h = m t + c meet when −16t^2 + bt = mt → t = (b − m)/16
    const tMeet = (b - m) / 16;
    const parts: Problem[] = [
      {
        prompt: `The balloon's height is h(t) = −16t^2 + ${b}t + ${c} feet after t seconds. When does it reach its highest point, and how high is it?`,
        visual: { type: "plot", xMin: 0, xMax: tLand + 1, yMin: 0, yMax: Math.ceil((hMax + 20) / 20) * 20, curves: [{ expr: `-16x^2+${b}x+${c}`, domain: [0, tLand], label: "h(t)" }] },
        answer: { kind: "multi", fields: [{ value: frac(tMax), pre: "t =", post: " s" }, { value: frac(hMax), pre: "height =", post: " ft" }] },
        hints: ["The vertex is at t = −b ÷ (2a).", `t = ${b} ÷ 32 = ${tMax}. Substitute into h(t).`],
        steps: [st("Vertex time.", `t = {−${b}/2(−16)} = ${tMax} s`), st("Maximum height.", `h(${tMax}) = ${hMax} ft`)],
      },
      {
        prompt: "When does the balloon hit the ground?",
        answer: num(tLand, { unit: " s" }),
        hints: ["Set h(t) = 0 and factor out −16.", `−16(t^2 − ${b / 16}t − ${c / 16}) = 0`],
        steps: [st("Set h = 0.", `−16t^2 + ${b}t + ${c} = 0`), st("Factor.", `−16(t − ${tLand})(t + 1) = 0`), st("Keep the positive time.", `t = ${tLand} s`)],
        traps: traps(frac(tLand), [trap(-1, "Time after launch can't be negative."), trap(tMax, "That's when it's highest, not when it lands.")]),
      },
      {
        prompt: `A camera drone starts at the same ${c}-ft roof and rises at ${m} ft/s: d(t) = ${m}t + ${c}. At what time after launch are the balloon and the drone at the same height again?`,
        answer: num(frac(b - m, 16), { unit: " s" }),
        hints: [`Set −16t^2 + ${b}t + ${c} = ${m}t + ${c}.`, `−16t^2 + ${b - m}t = 0, so −16t(t − ${fracText(b - m, 16)}) = 0.`],
        steps: [st("Set the heights equal.", `−16t^2 + ${b}t + ${c} = ${m}t + ${c}`), st("Simplify.", `−16t^2 + ${b - m}t = 0`), st("Factor.", `−16t(t − ${fracText(b - m, 16)}) = 0`), st("Interpret.", `t = 0 is the launch; they match again at t = ${tMeet} s.`)],
      },
    ];
    return { intro: `Your club's water-balloon launcher fires balloons from ${String(c).startsWith("8") ? "an" : "a"} ${c}-ft roof. Analyze one launch.`, parts };
  },
};

// ---------- 3. Logo transformations ----------
const logo: Challenge = {
  id: "m2.ch.logo-design",
  title: "Logo designer",
  needs: ["m2.trans.sequence", "m2.cong.rigid-motions", "m2.sim.dilate", "m2.trans.symmetry"],
  build(r) {
    const A = { x: 1, y: 1 }, B = { x: r.int(4, 5), y: 1 }, C = { x: 1, y: r.int(3, 4) };
    const a = r.nonzero(-3, 3), b = r.nonzero(-3, 3);
    const rot = (p: { x: number; y: number }) => ({ x: -p.y, y: p.x });
    const B2 = rot(B), B3 = { x: B2.x + a, y: B2.y + b };
    const k = r.pick([2, 3]);
    const AB = B.x - A.x;
    const n = r.pick([5, 6, 8]);
    const parts: Problem[] = [
      {
        prompt: `The logo's triangle has A${pt(A.x, A.y)}, B${pt(B.x, B.y)}, C${pt(C.x, C.y)}. It's rotated 90° counterclockwise about the origin, then translated (x, y) → (x ${a > 0 ? "+" : "−"} ${Math.abs(a)}, y ${b > 0 ? "+" : "−"} ${Math.abs(b)}). Where does B end up?`,
        visual: plane({ A, B, C, O: { x: 0, y: 0 } }, [["A", "B", "C"]]),
        answer: { kind: "multi", fields: [{ value: frac(B3.x), pre: "x =" }, { value: frac(B3.y), pre: "y =" }] },
        hints: ["Rotate first: (x, y) → (−y, x).", `B′ = ${pt(B2.x, B2.y)}. Now translate.`],
        steps: [st("Rotate.", `B${pt(B.x, B.y)} → ${pt(B2.x, B2.y)}`), st("Translate.", `→ ${pt(B3.x, B3.y)}`)],
      },
      {
        prompt: "Is the moved triangle congruent to the original?",
        answer: choice(r, "Yes: rotations and translations are rigid motions, so lengths and angles are preserved.", [["No: the triangle moved to a new place.", "Position doesn't matter for congruence; size and shape do."], ["Only if the translation is 0.", "Translations are rigid motions too."]]),
        hints: ["What do rigid motions preserve?"],
        steps: [st("Rigid motions preserve distance and angle.", "A sequence of them maps the triangle onto a congruent copy.")],
      },
      {
        prompt: `For a poster, the original triangle is dilated from the origin by a scale factor of ${k}. AB is ${AB} units. How long is A′B′?`,
        answer: num(k * AB),
        hints: ["A dilation multiplies every length by the scale factor."],
        steps: [st("Multiply.", `${k} × ${AB} = ${k * AB}`)],
        traps: traps(frac(k * AB), [trap(AB, "Dilations change lengths by the scale factor.")]),
      },
      {
        prompt: `The logo sits inside a regular ${n === 5 ? "pentagon" : n === 6 ? "hexagon" : "octagon"} badge. What's the smallest rotation (in degrees) that maps the badge onto itself?`,
        answer: num(360 / n, { unit: "°" }),
        hints: ["Divide 360° by the number of sides."],
        steps: [st("Central angle.", `360° ÷ ${n} = ${360 / n}°`)],
        traps: traps(frac(360 / n), [trap((180 * (n - 2)) / n, "That's the interior angle, not the rotation angle.")]),
      },
    ];
    return { intro: "You're designing a logo for a student startup: move it, resize it, and fit it in a badge.", parts };
  },
};

// ---------- 4. School survey ----------
const survey: Challenge = {
  id: "m2.ch.school-survey",
  title: "The school survey",
  needs: ["m2.prob.two-way-tables", "m2.prob.conditional", "m2.prob.independence", "m2.prob.multiplication-rule"],
  build(r) {
    // Independent or not, with clean numbers.
    const indep = r.chance(0.5);
    const g9 = 10 * r.int(4, 8), g10 = 10 * r.int(4, 8);
    const p = r.pick([3, 4, 5, 6, 7]); // tenths that prefer streaming in 9th
    const s9 = (g9 * p) / 10;
    const s10 = indep ? (g10 * p) / 10 : (g10 * (p + r.pick([-2, 2]))) / 10;
    const N = g9 + g10, S = s9 + s10;
    const table = { type: "table" as const, caption: "Favorite way to unwind", headers: ["", "Streaming", "Gaming", "Total"], rows: [["9th grade", s9, g9 - s9, g9], ["10th grade", s10, g10 - s10, g10], ["Total", S, N - S, N]] };
    const parts: Problem[] = [
      {
        prompt: "What is the probability that a randomly chosen surveyed student prefers streaming?",
        visual: table,
        answer: num(frac(S, N)),
        hints: ["Use the Streaming column total over the grand total."],
        steps: [st("Marginal probability.", `{${S}/${N}} = ${fracText(S, N)}`)],
      },
      {
        prompt: "Find P(streaming | 10th grade).",
        visual: table,
        answer: num(frac(s10, g10)),
        hints: ["Given 10th grade: use only the 10th-grade row."],
        steps: [st("Conditional probability.", `{${s10}/${g10}} = ${fracText(s10, g10)}`)],
        traps: traps(frac(s10, g10), [trap(frac(s10, S), "That's P(10th grade | streaming), the reverse condition.")]),
      },
      {
        prompt: "Are “prefers streaming” and “is in 10th grade” independent?",
        visual: table,
        answer: choice(r, indep ? "Yes, because P(streaming | 10th) = P(streaming)" : "No, because P(streaming | 10th) ≠ P(streaming)", [[indep ? "No, because P(streaming | 10th) ≠ P(streaming)" : "Yes, because P(streaming | 10th) = P(streaming)", `Compare ${fracText(s10, g10)} with ${fracText(S, N)}.`]], true),
        hints: ["Compare your answers to the first two parts."],
        steps: [st("Compare.", `P(streaming | 10th) = ${fracText(s10, g10)}, P(streaming) = ${fracText(S, N)}: ${indep ? "equal, independent" : "different, not independent"}.`)],
      },
      {
        prompt: "Two different 9th graders from the survey are picked at random for a follow-up interview. What's the probability both prefer streaming?",
        visual: table,
        answer: num(frac(s9 * (s9 - 1), g9 * (g9 - 1))),
        hints: ["Without replacement: the second pick has one fewer streamer and one fewer 9th grader.", `{${s9}/${g9}} · {${s9 - 1}/${g9 - 1}}`],
        steps: [st("Multiplication rule.", `{${s9}/${g9}} · {${s9 - 1}/${g9 - 1}} = ${fracText(s9 * (s9 - 1), g9 * (g9 - 1))}`)],
        traps: traps(frac(s9 * (s9 - 1), g9 * (g9 - 1)), [trap(frac(s9 * s9, g9 * g9), "That's with replacement; the same student can't be picked twice.")]),
      },
    ];
    return { intro: `The student council surveyed ${N} students about how they unwind. Dig into the results.`, parts };
  },
};

// ---------- 5. Group trip ----------
const groupTrip: Challenge = {
  id: "m2.ch.group-trip",
  title: "Plan the group trip",
  needs: ["m2.var.inverse-model", "m2.sys.model", "m2.var.sqrt-equations"],
  build(r) {
    const n = r.int(4, 8), fee = r.pick([15, 20, 25]), per = r.pick([2, 4, 5]);
    const total = n * (fee + per * n);
    const nA = n + r.pick([-2, -1, 1, 2]);
    const H = r.pick([64, 144, 256]);
    const parts: Problem[] = [
      {
        prompt: `A cabin costs $${total} total, split equally among n friends: c = {${total}/n}. What does each person pay if ${nA} friends go? (Round to the nearest cent if needed.)`,
        answer: num(Math.round((total / nA) * 100) / 100, { tolerance: 0.01, unit: " dollars" }),
        hints: ["Divide the total by the number of friends."],
        steps: [st("Divide.", `${total} ÷ ${nA} ≈ ${(total / nA).toFixed(2)}`)],
      },
      {
        prompt: `A second cabin charges each person $${fee} plus $${per} for every person in the group: c = ${fee} + ${per}n. For how many friends do the two cabins cost the same per person?`,
        answer: num(n),
        hints: [`Set {${total}/n} = ${fee} + ${per}n and multiply both sides by n.`, `${per}n^2 + ${fee}n − ${total} = 0`],
        steps: [st("Set equal and clear the fraction.", `${total} = ${fee}n + ${per}n^2`), st("Solve.", `${per}n^2 + ${fee}n − ${total} = 0 gives n = ${n} (the other root is negative)`), st("Check.", `${total} ÷ ${n} = ${total / n} = ${fee} + ${per}(${n}) ✓`)],
      },
      {
        prompt: `At the cabin there's a cliff-jump pool. A jump from h feet lasts t = {√h/4} seconds. Someone's jump lasts ${Math.sqrt(H) / 4} s. How high was the jump?`,
        answer: num(H, { unit: " ft" }),
        hints: [`Multiply both sides by 4: √h = ${Math.sqrt(H)}.`, "Square both sides."],
        steps: [st("Isolate the root.", `√h = ${Math.sqrt(H)}`), st("Square.", `h = ${H} ft`), st("Check.", `{√${H}/4} = ${Math.sqrt(H) / 4} ✓`)],
        traps: traps(frac(H), [trap(Math.sqrt(H), "That's √h. Square it.")]),
      },
    ];
    return { intro: "Your friend group is planning a weekend trip. Compare costs and check out the cliff-jump pool.", parts };
  },
};

// ---------- 6. Measure the tower ----------
const tower: Challenge = {
  id: "m2.ch.measure-tower",
  title: "Measure the radio tower",
  needs: ["m2.sim.similar-figures", "m2.trig.applications", "m2.trig.special"],
  build(r) {
    const h = r.pick([5, 6]), s = r.pick([3, 4]), mult = r.int(10, 20);
    const S = s * mult, H = h * mult;
    const sun = Math.atan(h / s) / DEG;
    const d = r.int(40, 90);
    const hyp = r1(Math.hypot(H, d));
    const parts: Problem[] = [
      {
        prompt: `You're ${h} ft tall and cast a ${s}-ft shadow. The radio tower's shadow is ${S} ft. How tall is the tower?`,
        answer: num(H, { unit: " ft" }),
        hints: ["Same sun angle: the triangles are similar.", `{${h}/${s}} = {H/${S}}`],
        steps: [st("Proportion.", `{${h}/${s}} = {H/${S}}`), st("Solve.", `H = ${S} × {${h}/${s}} = ${H} ft`)],
        traps: traps(frac(H), [trap(frac(s * S, h), "Match heights to heights and shadows to shadows.")]),
      },
      {
        prompt: "What is the angle of elevation of the sun, to the nearest degree?",
        visual: rightTri(h, s, { a: `${h} ft`, b: `${s} ft`, A: "θ" }),
        answer: num(Math.round(sun), { tolerance: 0.6, unit: "°" }),
        hints: ["tan θ = height ÷ shadow."],
        steps: [st("Inverse tangent.", `θ = tan⁻¹({${h}/${s}}) ≈ ${sun.toFixed(1)}°`)],
        traps: tolTraps(Math.round(sun), 0.6, [trap(Math.round(90 - sun), "That's the angle at the top of your head, not the sun's elevation.")]),
      },
      {
        prompt: `A drone hovers at the top of the tower. You walk to a spot ${d} ft from the tower's base. How far is the drone from you in a straight line? Round to the nearest tenth.`,
        answer: num(hyp, { tolerance: 0.1, unit: " ft" }),
        hints: ["The tower and the ground make a right angle; the line of sight is the hypotenuse.", `√(${H}^2 + ${d}^2)`],
        steps: [st("Pythagorean theorem.", `√(${H * H} + ${d * d}) = √${H * H + d * d} ≈ ${hyp} ft`)],
      },
      {
        prompt: `A guy wire runs from the tower top to the ground at a 45° angle. How far from the base is it anchored?`,
        answer: num(H, { unit: " ft" }),
        hints: ["A 45-45-90 triangle has equal legs."],
        steps: [st("45-45-90 triangle.", `The legs are equal, so the anchor is ${H} ft from the base.`)],
        traps: traps(frac(H), [trap(r1(H * Math.SQRT2), "That's the wire's length (the hypotenuse).")]),
      },
    ];
    return { intro: "Your physics class needs the height of the radio tower behind the school, without climbing it.", parts };
  },
};

const challenges: Challenge[] = [skateRamp, balloon, logo, survey, groupTrip, tower];
export default challenges;
