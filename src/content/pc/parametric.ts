// Unit 12: Parametric equations (PC.A.2.4, PC.F.7.1, PC.F.7.2).
import { choice, cst, expr, linear, ms, num, sn, trap } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { Skill } from "../types";
import { DEG, f1, round, shiftText, trapsTol } from "./util";

const T = "pc-parametric";
const pE = (n: number) => (n === 0 ? "" : n > 0 ? `+${n}` : `${n}`);

const eliminate: Skill = {
  id: "pc.parametric.eliminate",
  title: "Eliminate the parameter",
  topic: T,
  standards: ["PC.A.2.4"],
  prereqs: [],
  lesson: {
    bigIdea: "To turn x(t), y(t) into one equation in x and y, solve one equation for t and substitute into the other (or use an identity like cos^2t + sin^2t = 1).",
    explain: [
      "x = 2t + 1, y = 3t − 4. Solve the first for t: t = {x − 1/2}. Substitute: y = 3 · {x − 1/2} − 4 = {3/2}x − {11/2}. It's a line.",
      "x = t − 2, y = t^2: t = x + 2, so y = (x + 2)^2, a parabola.",
      "x = 3 cos t, y = 3 sin t: x^2 + y^2 = 9(cos^2t + sin^2t) = 9, a circle of radius 3. With different numbers, x = 4 cos t, y = 2 sin t gives {x^2/16} + {y^2/4} = 1, an ellipse.",
    ],
    visual: { type: "plot", xMin: -5, xMax: 5, yMin: -4, yMax: 4, curves: [{ expr: "2sqrt(1-x^2/16)", domain: [-4, 4] }, { expr: "-2sqrt(1-x^2/16)", domain: [-4, 4] }], points: [{ x: 4, y: 0, label: "t = 0" }, { x: 0, y: 2, label: "t = π/2" }] },
    tip: "The Cartesian equation shows the path's shape but loses the timing: which way it moves and how fast.",
  },
  why: [
    { kind: "choice", prompt: "Why does x = 5 cos t, y = 5 sin t trace a circle?", choices: ["x^2 + y^2 = 25(cos^2t + sin^2t) = 25 for every t, so every point is 5 from the origin.", "Because cosine and sine are periodic.", "Because x and y are equal.", "It traces a line."], correct: 0, explain: "The Pythagorean identity makes x^2 + y^2 constant, which is the equation of a circle of radius 5." },
    { kind: "written", prompt: "x = t^2 and y = t^2 + 3. Eliminating t gives y = x + 3. Explain why the path is only part of that line.", keyIdeas: ["x = t^2 is never negative", "so only points with x ≥ 0 occur", "the path is a ray starting at (0, 3)"], exemplar: "Since x = t^2, x can never be negative. So although every point satisfies y = x + 3, only the part with x ≥ 0 is traced: a ray starting at (0, 3)." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const a = r.pick([1, 2, 3, -1]), b = r.int(-5, 5), c = r.nonzero(-4, 4), d = r.int(-6, 6);
      // t = (x − b)/a, y = c(x − b)/a + d
      const m = frac(c, a);
      const mE = m.d === 1 ? String(m.n) : `(${m.n}/${m.d})`;
      const mT = m.d === 1 ? (m.n === 1 ? "" : m.n === -1 ? "−" : ms(m.n)) : `${m.n < 0 ? "−" : ""}{${Math.abs(m.n)}/${m.d}}`;
      return {
        prompt: `Eliminate the parameter: x = ${linear(a, b, "t")}, y = ${linear(c, d, "t")}. Write y in terms of x.`,
        answer: expr(`${mE}(x${pE(-b)})${pE(d)}`, { lhs: "y", display: `${mT}(${shiftText(b)})${cst(d)}` }),
        hints: ["Solve the x-equation for t.", `t = ${a === 1 ? shiftText(b) : `{${shiftText(b)}/${ms(a)}}`}. Substitute it into the y-equation.`],
        steps: [st("Solve for t.", `t = ${a === 1 ? shiftText(b) : `{${shiftText(b)}/${ms(a)}}`}`), st("Substitute into y.", `y = ${ms(c)} · ${a === 1 ? `(${shiftText(b)})` : `{${shiftText(b)}/${ms(a)}}`}${cst(d)}`), st("Simplify.", `y = ${mT}(${shiftText(b)})${cst(d)}`)],
      };
    }
    if (lv === 2) {
      const h = r.int(-4, 4), k = r.int(-5, 5), s = r.pick([1, 2]);
      // x = s·t + h, y = t^2 + k → t = (x − h)/s, y = (x − h)^2/s^2 + k
      const xT = `${s === 1 ? "t" : `${s}t`}${cst(h)}`;
      return {
        prompt: `Eliminate the parameter: x = ${xT}, y = t^2${cst(k)}. Write y in terms of x.`,
        answer: expr(`(x${pE(-h)})^2/${s * s}${pE(k)}`, { lhs: "y", display: s === 1 ? `(${shiftText(h)})^2${cst(k)}` : `{(${shiftText(h)})^2/${s * s}}${cst(k)}` }),
        hints: ["Solve the x-equation for t.", `t = ${s === 1 ? shiftText(h) : `{${shiftText(h)}/${s}}`}. Square it for t^2.`],
        steps: [st("Solve for t.", `t = ${s === 1 ? shiftText(h) : `{${shiftText(h)}/${s}}`}`), st("Substitute.", `y = ${s === 1 ? `(${shiftText(h)})^2` : `{(${shiftText(h)})^2/${s * s}}`}${cst(k)}`), st("Shape.", "A parabola.")],
      };
    }
    const h = r.int(-4, 4), k = r.int(-4, 4);
    const a = r.pick([2, 3, 4, 5]), b = r.pick([2, 3, 4, 5]);
    const term = (v: string, c: number, d: number) => `{${c === 0 ? `${v}^2` : `(${shiftText(c, v)})^2`}/${d}}`;
    const correct = `${term("x", h, a * a)} + ${term("y", k, b * b)} = 1`;
    return {
      prompt: `Eliminate the parameter: x = ${h === 0 ? "" : `${ms(h)} + `}${a} cos t, y = ${k === 0 ? "" : `${ms(k)} + `}${b} sin t.`,
      answer: choice(r, correct, [[`${term("x", h, a)} + ${term("y", k, b)} = 1`, `Square the coefficients: cos t = {x − h/${a}}, so cos^2t has ${a}^2 = ${a * a} on the bottom.`], [`${term("x", -h, a * a)} + ${term("y", -k, b * b)} = 1`, "Check the signs of the shifts: x − h where h is the added constant."], [`${term("x", h, a * a)} − ${term("y", k, b * b)} = 1`, "cos^2t + sin^2t = 1 is a sum, so the terms are added."]].filter((w) => w[0] !== correct) as [string, string][]),
      hints: [`Isolate the trig functions: cos t = {${shiftText(h)}/${a}}, sin t = {${shiftText(k, "y")}/${b}}.`, "Square both and add: cos^2t + sin^2t = 1."],
      steps: [st("Isolate cos t and sin t.", `cos t = {${shiftText(h)}/${a}}, sin t = {${shiftText(k, "y")}/${b}}`), st("Use cos^2t + sin^2t = 1.", correct), st("Shape.", a === b ? `A circle of radius ${a}.` : "An ellipse.")],
    };
  },
};

const write: Skill = {
  id: "pc.parametric.write",
  title: "Write parametric equations for motion",
  topic: T,
  standards: ["PC.F.7.1"],
  prereqs: ["pc.parametric.eliminate"],
  lesson: {
    bigIdea: "Parametric equations give position as a function of time: x(t) = x_0 + v_x t and y(t) = y_0 + v_y t for steady motion; for a thrown object, y(t) = −16t^2 + v_0 sin θ · t + h_0 (feet) and x(t) = v_0 cos θ · t.",
    explain: [
      "A drone starts at (2, 10) and moves ⟨3, −1⟩ meters each second: x(t) = 2 + 3t, y(t) = 10 − t.",
      "From A(1, 4) to B(13, −2) in 6 seconds: each second it moves {12/6} = 2 right and {−6/6} = −1 up, so x(t) = 1 + 2t, y(t) = 4 − t.",
      "A ball is hit at 80 ft/s at 30° from 3 ft up: x(t) = 80 cos 30° · t, y(t) = −16t^2 + 80 sin 30° · t + 3. The −16t^2 is gravity (half of 32 ft/s^2).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why does the horizontal position of a thrown ball use cos θ while the vertical uses sin θ?", choices: ["The launch velocity splits into a horizontal component v cos θ (adjacent) and a vertical component v sin θ (opposite).", "Because cosine is for x and sine is for y in every problem.", "Because gravity acts horizontally.", "It's the other way around."], correct: 0, explain: "The velocity vector at angle θ has components ⟨v cos θ, v sin θ⟩. Gravity then only changes the vertical part." },
    { kind: "written", prompt: "Explain why the y-equation for a ball has a −16t^2 term but the x-equation doesn't.", keyIdeas: ["gravity pulls only downward", "it changes vertical velocity, not horizontal", "−16t^2 is ½ · (−32 ft/s²) · t^2", "horizontally (ignoring air) speed stays constant"], exemplar: "Gravity acts straight down, so it only changes the vertical motion; that's the −16t^2 term (half of −32 ft/s² times t^2). Nothing pushes the ball sideways, so (ignoring air resistance) the horizontal speed stays constant and x(t) is just v cos θ · t." },
  ],
  generate(r, lv) {
    if (lv < 3) {
      const x0 = r.int(-5, 5), y0 = r.int(-5, 8);
      const vx = r.nonzero(-4, 5), vy = r.nonzero(-4, 4);
      const askX = r.chance(0.5);
      if (lv === 1) {
        const v0 = askX ? x0 : y0, vv = askX ? vx : vy;
        return {
          prompt: `A drone starts at (${ms(x0)}, ${ms(y0)}) and moves ${vec(vx, vy)} meters each second. Write ${askX ? "x(t)" : "y(t)"}, its ${askX ? "x" : "y"}-coordinate after t seconds.`,
          answer: expr(`${v0}+${vv}t`.replace("+-", "-"), { vars: ["t"], lhs: askX ? "x(t)" : "y(t)", display: `${ms(v0)} ${vv < 0 ? "−" : "+"} ${Math.abs(vv) === 1 ? "" : Math.abs(vv)}t` }),
          hints: [`Start value plus rate times time.`, `${askX ? "x" : "y"} starts at ${ms(v0)} and changes by ${ms(vv)} each second.`],
          steps: [st("Start.", `${askX ? "x" : "y"}(0) = ${ms(v0)}`), st("Rate.", `${ms(vv)} per second`), st("Equation.", `${askX ? "x" : "y"}(t) = ${ms(v0)} ${vv < 0 ? "−" : "+"} ${Math.abs(vv) === 1 ? "" : Math.abs(vv)}t`)],
        };
      }
      const Tt = r.int(2, 5);
      const x1 = x0 + vx * Tt, y1 = y0 + vy * Tt;
      const v0 = askX ? x0 : y0, vv = askX ? vx : vy, d = askX ? x1 - x0 : y1 - y0;
      return {
        prompt: `A robot moves in a straight line at a steady speed from A(${ms(x0)}, ${ms(y0)}) to B(${ms(x1)}, ${ms(y1)}) in ${Tt} seconds. Write ${askX ? "x(t)" : "y(t)"} for 0 ≤ t ≤ ${Tt}.`,
        answer: expr(`${v0}+${vv}t`.replace("+-", "-"), { vars: ["t"], lhs: askX ? "x(t)" : "y(t)", display: `${ms(v0)} ${vv < 0 ? "−" : "+"} ${Math.abs(vv) === 1 ? "" : Math.abs(vv)}t` }),
        hints: [`Change in ${askX ? "x" : "y"}: ${ms(askX ? x1 : y1)} − ${sn(v0)} = ${ms(d)} over ${Tt} seconds.`, `Rate = {${ms(d)}/${Tt}} = ${ms(vv)} per second.`],
        steps: [st("Change.", `${ms(askX ? x1 : y1)} − ${sn(v0)} = ${ms(d)}`), st("Rate.", `{${ms(d)}/${Tt}} = ${ms(vv)} per second`), st("Equation.", `${askX ? "x" : "y"}(t) = ${ms(v0)} ${vv < 0 ? "−" : "+"} ${Math.abs(vv) === 1 ? "" : Math.abs(vv)}t`)],
      };
    }
    const v = r.pick([40, 50, 60, 80, 90]), th = r.pick([25, 30, 35, 40, 45, 50, 60]), h = r.int(2, 6);
    const correct = `x = ${v} cos ${th}° · t, y = −16t^2 + ${v} sin ${th}° · t + ${h}`;
    return {
      prompt: `A softball leaves the bat at ${v} ft/s at an angle of ${th}${DEG}, ${h} ft above the ground. Which parametric equations model its position (in feet) t seconds later?`,
      answer: choice(r, correct, [[`x = ${v} sin ${th}° · t, y = −16t^2 + ${v} cos ${th}° · t + ${h}`, "Horizontal uses cos θ (adjacent), vertical uses sin θ (opposite)."], [`x = ${v} cos ${th}° · t, y = −32t^2 + ${v} sin ${th}° · t + ${h}`, "In feet, gravity's term is −16t^2 (half of 32)."], [`x = ${v} cos ${th}° · t + ${h}, y = −16t^2 + ${v} sin ${th}° · t`, "The starting height belongs in the y-equation."], [`x = ${v}t, y = −16t^2 + ${v}t + ${h}`, "The launch speed must be split into components with the angle."]]),
      hints: ["Split the launch velocity: horizontal v cos θ, vertical v sin θ.", "Gravity adds −16t^2 to the height (in feet), and the starting height is added to y."],
      steps: [st("Horizontal.", `x = ${v} cos ${th}° · t (no gravity sideways)`), st("Vertical.", `y = −16t^2 + ${v} sin ${th}° · t + ${h}`)],
    };
  },
};
const vec = (a: number, b: number) => `⟨${ms(a)}, ${ms(b)}⟩`;

const solve: Skill = {
  id: "pc.parametric.solve",
  title: "Use parametric models to answer questions",
  topic: T,
  standards: ["PC.F.7.2"],
  prereqs: ["pc.parametric.write"],
  lesson: {
    bigIdea: "To answer 'when' questions, solve the equation for the coordinate you care about; to answer 'where', plug that time into the other equation. A graphing calculator in parametric mode shows the whole path.",
    explain: [
      "A ball: x(t) = 30t, y(t) = −16t^2 + 44t + 12. When does it land? Solve −16t^2 + 44t + 12 = 0: −4(4t + 1)(t − 3) = 0, so **t = 3 s** (t = −{1/4} doesn't make sense).",
      "Where does it land? x(3) = 30 · 3 = **90 ft** from the batter.",
      "Highest point: the vertex of y(t) at t = {−44/2(−16)} = 1.375 s, where y ≈ 42.25 ft.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 100, yMin: 0, yMax: 50, xStep: 10, yStep: 10, curves: [{ expr: "-16(x/30)^2+44(x/30)+12", domain: [0, 90] }], points: [{ x: 90, y: 0, label: "lands, t = 3" }, { x: 41.25, y: 42.25, label: "top" }] },
  },
  why: [
    { kind: "choice", prompt: "To find where a ball lands, why do you solve y(t) = 0 first instead of x(t) = 0?", choices: ["Landing means height 0, so the time comes from the y-equation; then x at that time gives the distance.", "Because x(t) = 0 at landing.", "Because y is easier.", "Either one gives the landing time."], correct: 0, explain: "The ball lands when its height is zero. x(t) = 0 only at the start." },
    { kind: "written", prompt: "Explain why the quadratic for landing time often has a negative solution and why you reject it.", keyIdeas: ["the parabola for height crosses zero twice", "the negative time is before the ball was hit", "the model only applies for t ≥ 0"], exemplar: "The height equation is a downward parabola, so it can equal zero twice. One crossing is at a negative time, which would be before the ball was even hit, so it doesn't describe anything real. Only t ≥ 0 counts." },
  ],
  generate(r, lv) {
    // y = −16(t − R)(t + s) = −16t^2 + 16(R − s)t + 16Rs, with s = 1/4 or 1/2.
    const R = r.int(2, 5), s = r.pick([0.25, 0.5]);
    const b = 16 * (R - s), h = 16 * R * s;
    const vx = r.pick([20, 25, 30, 40, 45]);
    const yT = `−16t^2 + ${b}t + ${h}`;
    const model = `x(t) = ${vx}t, y(t) = ${yT}`;
    if (lv === 1) {
      const t = r.int(1, R - 1) + r.pick([0, 0.5]);
      const X = vx * t, Y = -16 * t * t + b * t + h;
      return {
        prompt: `A ball's position in feet after t seconds is ${model}. Where is the ball at t = ${t}?`,
        answer: { kind: "multi", fields: [{ value: frac(X), pre: "(" }, { value: frac(Y), pre: ",", post: ")" }] },
        hints: [`Plug t = ${t} into both equations.`, `y(${t}) = −16(${t})^2 + ${b}(${t}) + ${h}.`],
        steps: [st("x.", `x(${t}) = ${vx} · ${t} = ${X}`), st("y.", `y(${t}) = −16(${t * t}) + ${b * t} + ${h} = ${Y}`), st("Position.", `(${X}, ${Y})`)],
      };
    }
    if (lv === 2) {
      return {
        prompt: `A ball's position in feet after t seconds is ${model}. After how many seconds does it hit the ground?`,
        visual: { type: "plot", xMin: 0, xMax: vx * R + 10, yMin: 0, yMax: h + (b * b) / 64 + 10, curves: [{ expr: `-16(x/${vx})^2+${b}(x/${vx})+${h}`, domain: [0, vx * R] }] },
        answer: num(R, { tolerance: 0.05, unit: " s" }),
        hints: ["Hitting the ground means y(t) = 0.", `Solve ${yT} = 0 (factor out −${s === 0.25 ? 4 : 8} or use the quadratic formula). Reject the negative time.`],
        steps: [st("Set height to 0.", `${yT} = 0`), st("Solve.", `t = ${R} or t = −${s} (quadratic formula or factoring)`), st("Keep the positive time.", `t = ${R} s`)],
        traps: trapsTol(R, 0.05, [trap(-s, "Negative time is before the ball was hit."), trap((R - s) / 2, "That's when it reaches its highest point.")]),
      };
    }
    const askMax = r.chance(0.5);
    const tv = (R - s) / 2, ymax = -16 * tv * tv + b * tv + h;
    if (askMax) {
      return {
        prompt: `A ball's position in feet after t seconds is ${model}. What is its maximum height, to the nearest tenth of a foot?`,
        answer: num(round(ymax, 1), { tolerance: 0.1, unit: " ft" }),
        hints: ["The maximum of y(t) = at^2 + bt + c is at t = −{b/2a}.", `t = −{${b}/2(−16)} = ${tv}. Plug it into y(t).`],
        steps: [st("Time of the peak.", `t = {${b}/32} = ${tv} s`), st("Height.", `y(${tv}) = −16(${tv})^2 + ${b}(${tv}) + ${h} ≈ ${f1(ymax)} ft`)],
        traps: trapsTol(round(ymax, 1), 0.1, [trap(tv, "That's the time of the peak, not the height."), trap(h, "That's the starting height.")]),
      };
    }
    return {
      prompt: `A ball's position in feet after t seconds is ${model}. How far does it travel horizontally before it hits the ground?`,
      answer: num(vx * R, { tolerance: 0.5, unit: " ft" }),
      hints: ["First find when y(t) = 0.", `It lands at t = ${R}. Now evaluate x(${R}).`],
      steps: [st("Landing time.", `${yT} = 0 → t = ${R} (reject t = −${s})`), st("Horizontal distance.", `x(${R}) = ${vx} · ${R} = ${vx * R} ft`)],
      traps: trapsTol(vx * R, 0.5, [trap(R, "That's the landing time. Plug it into x(t)."), trap(round(vx * tv, 1), "That's where it is at its peak, not where it lands.")]),
    };
  },
};

export default [eliminate, write, solve];
