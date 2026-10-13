// Boss-level challenges for Pre-Calculus: multi-part problems in context.
import { choice, expr, num, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Challenge } from "../types";
import { f1, f2, rad, round, trapsTol } from "./util";

const ferris: Challenge = {
  id: "pc.ch.ferris",
  title: "Ride the Wheel",
  needs: ["pc.triggraphs.build", "pc.triggraphs.context-solve"],
  build(r) {
    const R = r.pick([20, 25, 30, 40]), hub = R + r.pick([3, 4, 5]), k = r.pick([3, 6, 9, 12]);
    const P = 2 * k;
    const model = `h(t) = −${R} cos({πt/${k}}) + ${hub}`;
    const t1 = k / 3;
    return {
      intro: `A Ferris wheel is ${2 * R} m across, its center is ${hub} m above the ground, and it turns once every ${P} minutes. You board at the bottom. Your goal: plan the best moment for a photo from the top third of the ride.`,
      parts: [
        {
          prompt: "Write h(t), your height in meters t minutes after boarding.",
          answer: expr(`-${R}cos(pi t/${k})+${hub}`, { vars: ["t"], lhs: "h(t)", display: model.slice(7) }),
          hints: [`Amplitude ${R}, midline ${hub}, period ${P}.`, `B = {2π/${P}} = {π/${k}}; start at the bottom, so use −cos.`],
          steps: [st("Features.", `A = ${R}, D = ${hub}, B = {π/${k}}`), st("Start at the bottom.", model)],
        },
        {
          prompt: `${model}. How high are you after ${t1} minute${t1 === 1 ? "" : "s"}?`,
          answer: num(hub - R / 2, { unit: " m" }),
          hints: [`cos({π · ${t1}/${k}}) = cos({π/3}) = {1/2}.`],
          steps: [st("Substitute.", `h(${t1}) = −${R} · {1/2} + ${hub} = ${hub - R / 2} m`)],
          traps: traps(frac(hub - R / 2), [trap(hub + R / 2, "cos(π/3) = 1/2 is positive, and the model has −cos.")]),
        },
        {
          prompt: `${model}. When do you first reach ${hub + R / 2} m (the top third of the ride)?`,
          answer: num((2 * k) / 3, { tolerance: 0.05, unit: " min" }),
          hints: [`Solve −${R} cos({πt/${k}}) + ${hub} = ${hub + R / 2}: cos({πt/${k}}) = −{1/2}.`, `{πt/${k}} = {2π/3}.`],
          steps: [st("Isolate cosine.", `cos({πt/${k}}) = −{1/2}`), st("Inverse cosine.", `{πt/${k}} = {2π/3}`), st("Solve.", `t = ${(2 * k) / 3} min`)],
          traps: trapsTol((2 * k) / 3, 0.05, [trap(k / 3, "That's when you're at the lower height; check the sign of the cosine.")]),
        },
        {
          prompt: `How many minutes of each turn do you spend above ${hub + R / 2} m?`,
          answer: num((2 * k) / 3, { tolerance: 0.05, unit: " min" }),
          hints: [`You reach ${hub + R / 2} m at t = ${(2 * k) / 3} and come back down to it at t = ${P} − ${(2 * k) / 3}.`],
          steps: [st("Crossings.", `t = ${(2 * k) / 3} and t = ${P - (2 * k) / 3}`), st("Time above.", `${P - (2 * k) / 3} − ${(2 * k) / 3} = ${(2 * k) / 3} min, one third of the ride`)],
        },
      ],
    };
  },
};

const caffeine: Challenge = {
  id: "pc.ch.caffeine",
  title: "Caffeine Countdown",
  needs: ["pc.explog.model", "pc.explog.context", "pc.recursive.context"],
  build(r) {
    const D = r.pick([160, 200, 240, 320]), h = r.pick([4, 5, 6]);
    const tLog = h * Math.log2(D / 50);
    return {
      intro: `An energy drink has ${D} mg of caffeine, and caffeine's half-life in your body is about ${h} hours. You're deciding whether a drink after practice will wreck your sleep.`,
      parts: [
        {
          prompt: "Write C(t), the mg of caffeine left t hours after you finish the drink.",
          answer: expr(`${D}(1/2)^(t/${h})`, { vars: ["t"], lhs: "C(t)", display: `${D}({1/2})^(t/${h})` }),
          hints: [`Start at ${D}; multiply by {1/2} every ${h} hours.`],
          steps: [st("Model.", `C(t) = ${D}({1/2})^(t/${h})`)],
        },
        {
          prompt: `How many hours until only ${D / 8} mg remain?`,
          answer: num(3 * h, { unit: " h" }),
          hints: [`${D / 8} is {1/8} of ${D}: that's three halvings.`],
          steps: [st("Halvings.", `${D} → ${D / 2} → ${D / 4} → ${D / 8}: 3 half-lives`), st("Time.", `3 × ${h} = ${3 * h} hours`)],
          traps: traps(frac(3 * h), [trap(3, "That's the number of half-lives. Each one is " + h + " hours.")]),
        },
        {
          prompt: "Sleep researchers suggest being under 50 mg at bedtime. How many hours after the drink is that? Round to the nearest tenth.",
          answer: num(round(tLog, 1), { tolerance: 0.1, unit: " h" }),
          hints: [`Solve ${D}({1/2})^(t/${h}) = 50: ({1/2})^(t/${h}) = {50/${D}}.`, `t/${h} = log_2({${D}/50}).`],
          steps: [st("Divide.", `({1/2})^(t/${h}) = {50/${D}}`), st("Take logs.", `t/${h} = log_2(${D / 50}) ≈ ${f2(Math.log2(D / 50))}`), st("Solve.", `t ≈ ${f1(tLog)} hours`)],
          traps: trapsTol(round(tLog, 1), 0.1, [trap(round(Math.log2(D / 50), 1), `That's the number of half-lives; multiply by ${h}.`)]),
        },
        {
          prompt: `Suppose you drink one of these every ${h} hours (bad idea). Right after each drink the caffeine is A(n) = 0.5A(n − 1) + ${D}, with A(1) = ${D}. Find A(3).`,
          answer: num(D + D / 2 + D / 4, { unit: " mg" }),
          hints: [`A(2) = 0.5(${D}) + ${D} = ${1.5 * D}.`],
          steps: [st("A(2).", `0.5(${D}) + ${D} = ${1.5 * D}`), st("A(3).", `0.5(${1.5 * D}) + ${D} = ${1.75 * D} mg`)],
          traps: traps(frac(1.75 * D), [trap(3 * D, "Half of the old caffeine is gone by the next drink.")]),
        },
      ],
    };
  },
};

const rescue: Challenge = {
  id: "pc.ch.rescue",
  title: "Search and Rescue",
  needs: ["pc.triangles.cosines-side", "pc.triangles.cosines-angle", "pc.vectors.resultant"],
  build(r) {
    const p = r.int(12, 30), q = r.int(12, 30), C = r.int(40, 130);
    const d = Math.sqrt(p * p + q * q - 2 * p * q * Math.cos(rad(C)));
    const angA = (Math.acos((p * p + d * d - q * q) / (2 * p * d)) * 180) / Math.PI;
    const s = r.pick([120, 140, 150, 160]), w = r.pick([20, 25, 30]);
    const g = Math.hypot(s, w);
    return {
      intro: `Two boats leave a harbor together. The Kestrel travels ${p} km; the Osprey travels ${q} km on a course ${C}° away from the Kestrel's. Then the Osprey radios for help.`,
      parts: [
        {
          prompt: "How far apart are the boats? Round to the nearest tenth of a km.",
          answer: num(round(d, 1), { tolerance: 0.1, unit: " km" }),
          hints: ["Two sides and the angle between them: Law of Cosines.", `d^2 = ${p}^2 + ${q}^2 − 2(${p})(${q}) cos ${C}°.`],
          steps: [st("Law of Cosines.", `d^2 = ${p * p} + ${q * q} − ${2 * p * q} cos ${C}° ≈ ${(d * d).toFixed(1)}`), st("Square root.", `d ≈ ${f1(d)} km`)],
          traps: trapsTol(round(d, 1), 0.1, [trap(round(Math.hypot(p, q), 1), `The angle is ${C}°, not 90°.`)]),
        },
        {
          prompt: `At the Kestrel, what is the angle between the line back to the harbor and the line to the Osprey? Round to the nearest tenth of a degree. (Use the distance from the last part, about ${f1(d)} km.)`,
          answer: num(round(angA, 1), { tolerance: 0.3, unit: "°" }),
          hints: ["Now you know all three sides: SSS.", `cos K = {${p}^2 + d^2 − ${q}^2/2(${p})(d)}.`],
          steps: [st("Law of Cosines for the angle.", `cos K = {${p * p} + ${(d * d).toFixed(1)} − ${q * q}/2(${p})(${f1(d)})} ≈ ${((p * p + d * d - q * q) / (2 * p * d)).toFixed(4)}`), st("Inverse cosine.", `K ≈ ${f1(angA)}°`)],
        },
        {
          prompt: `A rescue helicopter heads straight toward the Osprey at ${s} km/h, but a crosswind pushes it sideways at ${w} km/h (at a right angle to its heading). What is its actual ground speed, to the nearest tenth?`,
          answer: num(round(g, 1), { tolerance: 0.1, unit: " km/h" }),
          hints: [`Velocities ⟨0, ${s}⟩ and ⟨${w}, 0⟩ add to ⟨${w}, ${s}⟩.`],
          steps: [st("Resultant.", `√(${s}^2 + ${w}^2) ≈ ${f1(g)} km/h`)],
          traps: trapsTol(round(g, 1), 0.1, [trap(s + w, "Perpendicular velocities don't add directly.")]),
        },
        {
          prompt: "Which law was the right first tool for finding the distance between the boats, and why?",
          answer: choice(r, "Law of Cosines, because we knew two sides and the angle between them (SAS)", [["Law of Sines, because we knew two angles", "We only knew one angle (at the harbor)."], ["Pythagorean Theorem, because boats travel at right angles", `The courses were ${C}° apart, not 90°.`], ["Law of Sines, because we knew an angle and its opposite side", "The side opposite the harbor angle was the unknown distance."]]),
          hints: ["What did you know: sides, angles, and which angle sits between which sides?"],
          steps: [st("Known.", `Two sides (${p} and ${q}) and the included angle (${C}°): SAS → Law of Cosines.`)],
        },
      ],
    };
  },
};

const launch: Challenge = {
  id: "pc.ch.launch",
  title: "Launch Day",
  needs: ["pc.parametric.solve", "pc.parametric.eliminate"],
  build(r) {
    const R = r.int(3, 5), s = r.pick([0.25, 0.5]);
    const b = 16 * (R - s), h = 16 * R * s, vx = r.pick([30, 40, 50]);
    const tv = (R - s) / 2, ymax = -16 * tv * tv + b * tv + h;
    return {
      intro: `For the science fair, your team launches a water rocket off a ${h}-ft platform. Its position in feet after t seconds is x(t) = ${vx}t, y(t) = −16t^2 + ${b}t + ${h}.`,
      parts: [
        {
          prompt: "How many seconds is the rocket in the air?",
          answer: num(R, { tolerance: 0.05, unit: " s" }),
          hints: ["Solve y(t) = 0 and keep the positive solution."],
          steps: [st("Solve.", `−16t^2 + ${b}t + ${h} = 0 → t = ${R} or t = −${s}`), st("Keep the positive time.", `${R} s`)],
          traps: trapsTol(R, 0.05, [trap(tv, "That's when it's highest, not when it lands.")]),
        },
        {
          prompt: "How far from the platform does it land (horizontally)?",
          answer: num(vx * R, { tolerance: 0.5, unit: " ft" }),
          hints: [`x(${R}) = ${vx} · ${R}.`],
          steps: [st("Plug in the landing time.", `x(${R}) = ${vx * R} ft`)],
        },
        {
          prompt: "What is its maximum height? Round to the nearest tenth of a foot.",
          answer: num(round(ymax, 1), { tolerance: 0.1, unit: " ft" }),
          hints: [`Peak at t = {${b}/32} = ${tv}.`],
          steps: [st("Time of the peak.", `t = ${tv}`), st("Height.", `y(${tv}) ≈ ${f1(ymax)} ft`)],
        },
        {
          prompt: "Eliminate the parameter to write the rocket's path as y in terms of x.",
          answer: expr(`-16(x/${vx})^2+${b}(x/${vx})+${h}`, { lhs: "y", display: `−16({x/${vx}})^2 + ${b}({x/${vx}}) + ${h}` }),
          hints: [`t = {x/${vx}}. Substitute into y(t).`],
          steps: [st("Solve for t.", `t = {x/${vx}}`), st("Substitute.", `y = −16({x/${vx}})^2 + ${b}({x/${vx}}) + ${h}`)],
        },
      ],
    };
  },
};

const dish: Challenge = {
  id: "pc.ch.dish",
  title: "Build a Satellite Dish",
  needs: ["pc.conics.parabola", "pc.conics.identify"],
  build(r) {
    const [W, D, p] = r.pick([[24, 4, 9], [32, 4, 16], [20, 5, 5], [24, 3, 12], [40, 5, 20]] as const);
    return {
      intro: `Your robotics club is building a parabolic Wi-Fi booster dish ${W} cm across and ${D} cm deep. The receiver must sit at the focus. Put the vertex of the dish at the origin, opening up.`,
      parts: [
        {
          prompt: `The rim passes through (${W / 2}, ${D}). The dish has the form x^2 = 4py. Find p, the distance from the vertex to the receiver, in cm.`,
          answer: num(p, { unit: " cm" }),
          hints: [`Substitute the rim point: ${W / 2}^2 = 4p · ${D}.`],
          steps: [st("Substitute.", `${(W / 2) ** 2} = ${4 * D}p`), st("Solve.", `p = ${p} cm`)],
          traps: traps(frac(p), [trap(4 * p, "That's 4p. Divide by 4.")]),
        },
        {
          prompt: "Write the equation of the dish's cross-section in the form y = ax^2.",
          answer: expr(`x^2/${4 * p}`, { lhs: "y", display: `{x^2/${4 * p}}` }),
          hints: [`x^2 = 4py with p = ${p}, so y = {x^2/${4 * p}}.`],
          steps: [st("Solve for y.", `y = {x^2/${4 * p}}`)],
        },
        {
          prompt: `If you made the dish twice as wide (${2 * W} cm) but kept the same depth, how far from the vertex would the receiver go?`,
          answer: num(4 * p, { unit: " cm" }),
          hints: [`Rim point (${W}, ${D}): ${W}^2 = 4p · ${D}.`, "Doubling x multiplies x^2 by 4."],
          steps: [st("Substitute.", `${W * W} = ${4 * D}p`), st("Solve.", `p = ${4 * p} cm: four times as far`)],
          traps: traps(frac(4 * p), [trap(2 * p, "x is squared, so doubling the width multiplies p by 4, not 2.")]),
        },
        {
          prompt: "A side view of the receiver's signal cone has the equation {x^2/9} − {y^2/16} = 1. What shape is that?",
          answer: choice(r, "Hyperbola", [["Ellipse", "The squared terms are subtracted."], ["Parabola", "Both variables are squared."], ["Circle", "The terms are subtracted and have different denominators."]], true),
          hints: ["Both variables are squared. Added or subtracted?"],
          steps: [st("Squared terms with opposite signs.", "Hyperbola")],
        },
      ],
    };
  },
};

export default [ferris, caffeine, rescue, launch, dish];
