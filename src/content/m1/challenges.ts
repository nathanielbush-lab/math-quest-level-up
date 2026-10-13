// Boss-level challenges for NC Math 1: multi-part problems in context.
import { choice, expr, num, trap, traps, NAMES } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Challenge, Problem, Visual } from "../types";
import { f, fiveNum, pt, sortNums } from "./util";

// ---------- 1. Phone plan showdown (systems, inequalities) ----------

const phonePlans: Challenge = {
  id: "m1.ch.phone-plans",
  title: "Phone Plan Showdown",
  needs: ["m1.sys.context", "m1.sys.substitution", "m1.eq.inequality-context"],
  build(r) {
    const nm = r.pick(NAMES);
    const rA = r.pick([35, 40, 45]), fA = r.pick([0, 50]);
    const rB = rA - r.pick([5, 10]);
    const m0 = r.int(8, 16);
    const fB = fA + (rA - rB) * m0;
    const A = (m: number) => fA + rA * m, B = (m: number) => fB + rB * m;
    const long = m0 + r.int(6, 12);
    const budget = B(long) + rB * 2 + r.int(1, rB - 1);
    const parts: Problem[] = [
      {
        prompt: `Plan A costs ${fA ? `$${fA} up front plus ` : ""}$${rA} per month. What is the total cost of Plan A for 6 months?`,
        answer: num(A(6)),
        hints: [`Cost = ${fA ? `${fA} + ` : ""}${rA}m.`, "Substitute m = 6."],
        steps: [st("Write the cost.", `A(m) = ${fA ? `${fA} + ` : ""}${rA}m`), st("Substitute.", `A(6) = ${fA ? `${fA} + ` : ""}${rA}(6) = ${A(6)}`)],
        traps: fA > 0 ? traps(frac(A(6)), [trap(rA * 6, `Include the $${fA} up-front cost.`)]) : undefined,
      },
      {
        prompt: `Plan B costs $${fB} up front plus $${rB} per month. After how many months do the two plans cost the same?`,
        answer: num(m0),
        hints: [`Set ${fA ? `${fA} + ` : ""}${rA}m = ${fB} + ${rB}m.`, "Collect the m-terms on one side."],
        steps: [st("Set the costs equal.", `${fA ? `${fA} + ` : ""}${rA}m = ${fB} + ${rB}m`), st(`Subtract ${rB}m${fA ? ` and ${fA}` : ""}.`, `${rA - rB}m = ${fB - fA}`), st("Solve.", `m = ${m0} months`)],
        traps: traps(frac(m0), [trap(frac(fB - fA, rA + rB), "Subtract the monthly rates; don't add them.")]),
      },
      {
        prompt: `What do both plans cost at that break-even point?`,
        answer: num(A(m0)),
        hints: ["Substitute the break-even month into either plan.", "Both plans should give the same total."],
        steps: [st("Plan A.", `${fA ? `${fA} + ` : ""}${rA}(${m0}) = ${A(m0)}`), st("Plan B.", `${fB} + ${rB}(${m0}) = ${B(m0)} ✓`)],
      },
      {
        prompt: `${nm} plans to keep the phone for ${long} months. Which plan is cheaper, and by how much?`,
        answer: choice(r, `Plan B, by $${A(long) - B(long)}`, [[`Plan A, by $${A(long) - B(long)}`, `After the break-even point, the plan with the lower monthly rate wins.`], [`They cost the same`, `They only cost the same at ${m0} months.`], [`Plan B, by $${(rA - rB) * long}`, "Account for the different up-front costs too."]]),
        hints: [`Compute both plans at m = ${long}.`, "Subtract."],
        steps: [st("Plan A.", `${A(long)}`), st("Plan B.", `${B(long)}`), st("Compare.", `Plan B is cheaper by ${A(long)} − ${B(long)} = $${A(long) - B(long)}.`)],
      },
      {
        prompt: `${nm} can spend at most $${budget} in total on Plan B. What is the greatest whole number of months ${nm} can afford?`,
        answer: num(long + 2),
        hints: [`Solve ${fB} + ${rB}m ≤ ${budget}.`, "Round down to a whole number of months."],
        steps: [st("Inequality.", `${fB} + ${rB}m ≤ ${budget}`), st(`Subtract ${fB}, divide by ${rB}.`, `m ≤ ${f(Math.round(((budget - fB) / rB) * 100) / 100)}`), st("Round down.", `${long + 2} months (${long + 3} months would cost $${B(long + 3)}).`)],
        traps: traps(frac(long + 2), [trap(long + 3, `${long + 3} months would cost $${B(long + 3)}, over budget.`)]),
      },
    ];
    return { intro: `${nm} is choosing between two phone plans. Build models, find the break-even point, and decide.`, parts };
  },
};

// ---------- 2. Launch day (quadratics) ----------

const launch: Challenge = {
  id: "m1.ch.launch",
  title: "Launch Day",
  needs: ["m1.quad.context", "m1.quad.solve-factoring", "m1.quad.graph-features"],
  build(r) {
    const land = r.int(3, 6), s = r.int(1, 2);
    const b = 16 * (land - s), c = 16 * land * s;
    const h = (t: number) => -16 * t * t + b * t + c;
    const tPeak = (land - s) / 2, hPeak = h(tPeak);
    const club = r.pick(["robotics club", "physics class", "engineering team"]);
    const visual: Visual = { type: "plot", xMin: 0, xMax: land + 0.5, yMin: 0, yMax: Math.ceil(hPeak / 20) * 20 + 20, xStep: 1, yStep: 20, curves: [{ expr: `-16x^2+${b}x+${c}`, domain: [0, land] }] };
    const parts: Problem[] = [
      {
        prompt: `A ${club} launches a model rocket from a ${c}-foot platform. Its height is h(t) = −16t^2 + ${b}t + ${c} feet after t seconds. What is h(0), and what does it mean?`,
        visual,
        answer: choice(r, `${c}: the launch height`, [[`${b}: the launch height`, "h(0) is the constant term."], [`0: the rocket starts on the ground`, `Substitute t = 0: h(0) = ${c}.`], [`${c}: the maximum height`, "The maximum comes later, at the vertex."]]),
        hints: ["Substitute t = 0.", "At t = 0 the rocket hasn't moved yet."],
        steps: [st("Substitute.", `h(0) = ${c}`), st("Meaning.", "The rocket starts on the platform, " + c + " feet up.")],
      },
      {
        prompt: "After how many seconds does the rocket hit the ground?",
        answer: num(land),
        hints: ["Solve h(t) = 0.", `Factor out −16: −16(t^2 − ${land - s}t − ${land * s}) = 0.`],
        steps: [st("Factor.", `−16(t − ${land})(t + ${s}) = 0`), st("Solve and interpret.", `t = ${land} or t = −${s}; time can't be negative, so ${land} seconds.`)],
        traps: traps(frac(land), [trap(-s, "Negative time is before the launch.")]),
      },
      {
        prompt: "At what time does the rocket reach its maximum height?",
        answer: num(frac(land - s, 2)),
        hints: ["The vertex is halfway between the zeros.", `The zeros are t = ${land} and t = −${s}.`],
        steps: [st("Axis of symmetry.", `t = {${land} + (−${s})/2} = ${f(tPeak)} seconds`)],
      },
      {
        prompt: "What is the maximum height, in feet?",
        answer: num(hPeak),
        hints: [`Substitute t = ${f(tPeak)} into h(t).`],
        steps: [st("Evaluate.", `h(${f(tPeak)}) = −16(${f(tPeak)})^2 + ${b}(${f(tPeak)}) + ${c} = ${f(hPeak)} feet`)],
        traps: traps(frac(hPeak), [trap(c, "That's the starting height.")]),
      },
      {
        prompt: "Over what interval of time is the rocket's height increasing?",
        answer: choice(r, `0 < t < ${f(tPeak)}`, [[`${f(tPeak)} < t < ${land}`, "That's when it's falling."], [`0 < t < ${land}`, "It rises only until the vertex."], [`${c} < h < ${f(hPeak)}`, "Describe the interval with t-values."]]),
        hints: ["The height rises until the vertex, then falls."],
        steps: [st("Rising.", `From launch until the peak at t = ${f(tPeak)}.`)],
      },
    ];
    return { intro: "Model a rocket launch with a quadratic function.", parts };
  },
};

// ---------- 3. Going viral (exponential vs linear) ----------

const viral: Challenge = {
  id: "m1.ch.viral",
  title: "Going Viral",
  needs: ["m1.linexp.build-exp", "m1.linexp.exp-vs-linear", "m1.linexp.growth-decay"],
  build(r) {
    const nm = r.pick(NAMES);
    const a0 = r.pick([20, 25, 40, 50]);
    const k = r.pick([150, 200, 250]), b0 = r.pick([500, 800, 1000]);
    const A = (w: number) => a0 * 2 ** w, B = (w: number) => b0 + k * w;
    let cross = 1;
    for (let w = 40; w >= 0; w--) if (A(w) <= B(w)) { cross = w + 1; break; }
    const parts: Problem[] = [
      {
        prompt: `${nm}'s new account starts with ${a0} followers and the number doubles every week. Write a function A(w) for the followers after w weeks. Use x for w.`,
        answer: expr(`${a0}(2)^x`, { lhs: "A(x)", display: `${a0}(2)^x` }),
        hints: ["Starting value a, factor b each week: a·b^x.", "Doubling means b = 2."],
        steps: [st("Identify.", `a = ${a0}, b = 2`), st("Function.", `A(x) = ${a0}(2)^x`)],
      },
      {
        prompt: "By what percent does the follower count grow each week?",
        answer: num(100, { unit: "%" }),
        hints: ["The weekly factor is b = 2.", "Growth rate = b − 1, as a percent."],
        steps: [st("Rate.", "2 − 1 = 1 = 100% per week")],
        traps: traps(frac(100), [trap(200, "b = 2 means the new count is 200% of the old one, which is a 100% increase."), trap(2, "Write the rate as a percent.")]),
      },
      {
        prompt: `How many followers does ${nm} have after 6 weeks?`,
        answer: num(A(6)),
        hints: [`A(6) = ${a0}(2)^6.`],
        steps: [st("Evaluate.", `${a0} × 64 = ${A(6)}`)],
        traps: traps(frac(A(6)), [trap(a0 * 12, "2^6 is 2 multiplied by itself 6 times, not 2 × 6.")]),
      },
      {
        prompt: `A rival account has ${b0} followers and gains ${k} per week. What is the first whole week w when ${nm}'s account has more followers than the rival?`,
        visual: { type: "table", headers: ["Week", ...[cross - 2, cross - 1, cross, cross + 1].filter((w) => w >= 0).map(String)], rows: [[nm, ...[cross - 2, cross - 1, cross, cross + 1].filter((w) => w >= 0).map(A)], ["Rival", ...[cross - 2, cross - 1, cross, cross + 1].filter((w) => w >= 0).map(B)]] },
        answer: num(cross),
        hints: ["Compare the two rows of the table.", "Find the first week where the exponential value is larger."],
        steps: [st("Compare.", `Week ${cross - 1}: ${A(cross - 1)} vs ${B(cross - 1)}; week ${cross}: ${A(cross)} vs ${B(cross)}`), st("Answer.", `Week ${cross}.`)],
        traps: traps(frac(cross), [trap(cross - 1, `In week ${cross - 1}, ${nm} still has fewer followers.`)]),
      },
      {
        prompt: "Why does the doubling account eventually pass the rival no matter how big the rival's head start is?",
        answer: choice(r, "Doubling adds more each week as the count grows, while the rival always adds the same amount", [["The rival's account is linear, so it eventually decreases", `The rival keeps gaining ${k} each week; it never decreases.`], ["Exponential functions always start higher", `${nm}'s account started lower.`], ["It doesn't: a big enough head start keeps the rival ahead forever", "Exponential growth eventually beats any linear growth."]]),
        hints: ["Compare how much each account gains per week as time goes on."],
        steps: [st("Key idea.", "An increasing exponential function eventually exceeds any linear function.")],
      },
    ];
    return { intro: `${nm} is growing a new account. Compare exponential and linear growth.`, parts };
  },
};

// ---------- 4. Data detective (one-variable statistics) ----------

const dataDetective: Challenge = {
  id: "m1.ch.data-detective",
  title: "Data Detective",
  needs: ["m1.stat1.five-number", "m1.stat1.outliers", "m1.stat1.shape-center"],
  build(r) {
    const base = r.int(10, 20);
    const core = sortNums(Array.from({ length: 10 }, () => base + r.int(0, 12)));
    const s0 = fiveNum(core);
    const out = Math.ceil(s0.q3 + 1.5 * Math.max(s0.q3 - s0.q1, 3)) + r.int(15, 30);
    const data = [...core, out];
    const s = fiveNum(data);
    const iqr = s.q3 - s.q1;
    const up = s.q3 + 1.5 * iqr;
    const parts: Problem[] = [
      {
        prompt: `Weekly hours that 11 students spent gaming: ${r.shuffle(data).join(", ")}. What is the median?`,
        answer: num(frac(Math.round(s.median * 2), 2)),
        hints: ["Sort the data.", "With 11 values the median is the 6th."],
        steps: [st("Sort.", s.sorted.join(", ")), st("Median.", `6th value: ${f(s.median)}`)],
      },
      {
        prompt: "What is the interquartile range (IQR)?",
        answer: num(frac(Math.round(iqr * 2), 2)),
        hints: ["Q1 is the median of the lower 5 values; Q3 of the upper 5.", "IQR = Q3 − Q1."],
        steps: [st("Quartiles.", `Q1 = ${f(s.q1)}, Q3 = ${f(s.q3)}`), st("IQR.", `${f(s.q3)} − ${f(s.q1)} = ${f(iqr)}`)],
        traps: traps(frac(Math.round(iqr * 2), 2), [trap(s.max - s.min, "That's the range.")]),
      },
      {
        prompt: "What is the upper fence, Q3 + 1.5 × IQR?",
        answer: num(frac(Math.round(up * 4), 4)),
        hints: [`1.5 × ${f(iqr)} = ${f(1.5 * iqr)}.`, "Add it to Q3."],
        steps: [st("Fence.", `${f(s.q3)} + 1.5(${f(iqr)}) = ${f(up)}`)],
      },
      {
        prompt: `Is ${out} an outlier?`,
        answer: choice(r, `Yes, because ${out} > ${f(up)}`, [[`No, because ${out} is part of the data`, "Outliers are data values; the question is whether it's unusually far out."], [`No, because ${out} is less than twice the median`, "Outliers are judged with the fences, Q1 − 1.5·IQR and Q3 + 1.5·IQR."], [`Yes, because ${out} is the maximum`, "The maximum isn't automatically an outlier; compare it with the fence."]]),
        hints: ["Compare the value with the upper fence."],
        steps: [st("Compare.", `${out} > ${f(up)}, so it's an outlier.`)],
      },
      {
        prompt: "Which pair of statistics best describes the center and spread of this data?",
        answer: choice(r, "Median and IQR", [["Mean and standard deviation", "The outlier pulls the mean and inflates the standard deviation."], ["Mean and range", "Both are strongly affected by the outlier."], ["Median and range", "The range depends on the outlier."]]),
        hints: ["Which statistics resist outliers?"],
        steps: [st("Choose.", "With an outlier, use the median (center) and IQR (spread).")],
      },
    ];
    return { intro: "Summarize a data set, test for an outlier, and choose the right statistics.", parts };
  },
};

// ---------- 5. Skate park design (coordinate geometry) ----------

const parkDesign: Challenge = {
  id: "m1.ch.park-design",
  title: "Skate Park Design",
  needs: ["m1.coord.distance", "m1.coord.midpoint", "m1.coord.classify", "m1.coord.perimeter-area"],
  build(r) {
    const [ux, uy] = r.pick([[3, 4], [4, 3], [6, 8], [8, 6]]);
    const k = r.pick([2, 3]);
    const A = { x: r.int(-4, 0), y: r.int(-6, -2) };
    const B = { x: A.x + ux, y: A.y + uy };
    const C = { x: B.x - k * uy, y: B.y + k * ux };
    const D = { x: A.x - k * uy, y: A.y + k * ux };
    const ab = Math.sqrt(ux * ux + uy * uy), bc = k * ab;
    const M = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
    const visual: Visual = { type: "geo", points: { A, B, C, D }, polygons: [["A", "B", "C", "D"]], showLabels: true, grid: true };
    const parts: Problem[] = [
      {
        prompt: `A skate park is planned with corners A${pt(A.x, A.y)}, B${pt(B.x, B.y)}, C${pt(C.x, C.y)} and D${pt(D.x, D.y)} (units: meters). How long is side AB?`,
        visual,
        answer: num(ab),
        hints: ["Use the distance formula.", `√(${ux}^2 + ${uy}^2)`],
        steps: [st("Distance.", `√(${ux}^2 + ${uy}^2) = √${ux * ux + uy * uy} = ${ab}`)],
        traps: traps(frac(ab), [trap(ux + uy, "Square the legs, add, then take the square root.")]),
      },
      {
        prompt: "How long is side BC?",
        answer: num(bc),
        hints: ["Use the distance formula again."],
        steps: [st("Distance.", `√(${k * uy}^2 + ${k * ux}^2) = ${bc}`)],
      },
      {
        prompt: "What is the most specific name for ABCD?",
        answer: choice(r, "Rectangle", [["Square", `The sides are ${ab} and ${bc}, not all equal.`], ["Rhombus", "The sides aren't all equal."], ["Trapezoid", "Both pairs of opposite sides are parallel."]]),
        hints: ["Compare the slopes of AB and BC.", "Compare the side lengths."],
        steps: [st("Slopes.", `AB: ${uy}/${ux}; BC: −${ux}/${uy}. Product −1, so the corners are right angles.`), st("Sides.", `${ab} ≠ ${bc}, so it's a rectangle, not a square.`)],
      },
      {
        prompt: "What is the area of the park, in square meters?",
        answer: num(ab * bc),
        hints: ["Area of a rectangle = length × width."],
        steps: [st("Multiply.", `${ab} × ${bc} = ${ab * bc}`)],
        traps: traps(frac(ab * bc), [trap(2 * (ab + bc), "That's the perimeter.")]),
      },
      {
        prompt: "A light pole goes at the midpoint of diagonal AC. Where is it?",
        answer: { kind: "multi", fields: [{ value: frac(A.x + C.x, 2), pre: "x =" }, { value: frac(A.y + C.y, 2), pre: "y =" }] },
        hints: ["Average the x-coordinates of A and C, then the y-coordinates."],
        steps: [st("Midpoint.", `(${f(M.x)}, ${f(M.y)})`)],
      },
    ];
    return { intro: "Use coordinates to measure and classify a skate park layout.", parts };
  },
};

// ---------- 6. Road trip regression (two-variable statistics) ----------

const roadTrip: Challenge = {
  id: "m1.ch.road-trip",
  title: "Road Trip Regression",
  needs: ["m1.stat2.regression", "m1.stat2.residuals", "m1.stat2.interpret"],
  build(r) {
    const m = r.pick([-0.03, -0.04, -0.05]), b = r.pick([14.2, 15.5, 16.8]);
    const mph = r.pick([55, 60, 65, 70]);
    const pred = Math.round((m * mph + b) * 100) / 100;
    const res = r.pick([-0.4, -0.3, 0.2, 0.5]);
    const actual = Math.round((pred + res) * 100) / 100;
    const parts: Problem[] = [
      {
        prompt: `For a car, speed x (mph) and fuel efficiency y (km per liter) follow the regression line ŷ = ${f(m)}x + ${f(b)}. Predict the efficiency at ${mph} mph.`,
        answer: num(frac(Math.round(pred * 100), 100), { tolerance: 0.01 }),
        hints: [`Substitute x = ${mph}.`],
        steps: [st("Substitute.", `ŷ = ${f(m)}(${mph}) + ${f(b)} = ${f(pred)}`)],
      },
      {
        prompt: `The car actually got ${f(actual)} km/L at ${mph} mph. What is the residual?`,
        answer: num(frac(Math.round(res * 10), 10), { tolerance: 0.01 }),
        hints: ["Residual = actual − predicted."],
        steps: [st("Subtract.", `${f(actual)} − ${f(pred)} = ${f(res)}`)],
      },
      {
        prompt: `What does the slope ${f(m)} mean?`,
        answer: choice(r, `Efficiency is predicted to drop about ${f(-m)} km/L for each 1 mph increase in speed`, [[`Efficiency drops ${f(-m)} km/L in total`, "Slope is a rate per mph."], [`Efficiency is ${f(b)} km/L at 0 mph`, "That's the intercept, and 0 mph is outside the data anyway."], ["Driving faster causes efficiency to drop exactly that much", "A regression slope describes a predicted average change, not an exact cause."]]),
        hints: ["Slope = predicted change in y per 1-unit increase in x."],
        steps: [st("Interpret.", `${f(m)} km/L per mph.`)],
      },
      {
        prompt: "The data covered speeds from 40 to 75 mph. Should you trust a prediction at 120 mph?",
        answer: choice(r, "No: 120 mph is far outside the data, so it's extrapolation", [["Yes: the line works for every speed", "A model only reflects the data it came from."], ["Yes: 120 is inside the data", "The data went up to 75 mph."]]),
        hints: ["Compare 120 with the range of the data."],
        steps: [st("Extrapolation.", "120 mph is far beyond 75 mph, so the prediction is unreliable.")],
      },
    ];
    return { intro: "Use a regression model for a car's fuel efficiency.", parts };
  },
};

export default [phonePlans, launch, viral, dataDetective, parkDesign, roadTrip];
