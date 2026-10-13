// Unit 9: Conic sections (PC.F.4.8, PC.F.4.9).
import { choice, cst, expr, ms, num, sn, trap, traps } from "../helpers";
import { frac } from "../../lib/rational";
import { st } from "../steps";
import type { PlotCurve, Skill, Visual } from "../types";
import { shiftText } from "./util";

const T = "pc-conics";

/** "(x − 3)^2" or "x^2". */
const sq = (v: string, h: number) => (h === 0 ? `${v}^2` : `(${shiftText(h, v)})^2`);
const sqE = (v: string, h: number) => (h === 0 ? `${v}^2` : `(${v}${h > 0 ? "-" : "+"}${Math.abs(h)})^2`);
const pE = (n: number) => (n === 0 ? "" : n > 0 ? `+${n}` : `${n}`);

function ellipsePlot(h: number, k: number, a: number, b: number, extra: { points?: { x: number; y: number; label?: string }[] } = {}): Visual {
  const R = Math.max(a, b) + 2;
  const top = `${k}+${b}*sqrt(1-${sqE("x", h)}/${a * a})`, bot = `${k}-${b}*sqrt(1-${sqE("x", h)}/${a * a})`;
  return { type: "plot", xMin: h - R, xMax: h + R, yMin: k - R, yMax: k + R, curves: [{ expr: top, domain: [h - a, h + a] }, { expr: bot, domain: [h - a, h + a] }], points: extra.points };
}

function hyperbolaPlot(h: number, k: number, a: number, b: number, horiz: boolean, pts: { x: number; y: number; label?: string }[] = []): Visual {
  const R = Math.max(a, b) * 2 + 3;
  const curves: PlotCurve[] = [];
  if (horiz) {
    const f = (s: string) => `${k}${s}${b}*sqrt(${sqE("x", h)}/${a * a}-1)`;
    for (const s of ["+", "-"]) {
      curves.push({ expr: f(s), domain: [h - R, h - a] });
      curves.push({ expr: f(s), domain: [h + a, h + R] });
    }
  } else {
    // (y−k)²/a² − (x−h)²/b² = 1: y = k ± a√(1 + (x−h)²/b²)
    for (const s of ["+", "-"]) curves.push({ expr: `${k}${s}${a}*sqrt(1+${sqE("x", h)}/${b * b})` });
  }
  const m = horiz ? b / a : a / b;
  curves.push({ expr: `${m}*(x${pE(-h)})${pE(k)}`, dashed: true, color: 3 }, { expr: `${-m}*(x${pE(-h)})${pE(k)}`, dashed: true, color: 3 });
  return { type: "plot", xMin: h - R, xMax: h + R, yMin: k - R, yMax: k + R, curves, points: pts };
}

function fracTerm(v: string, h: number, d: number) {
  return `{${sq(v, h)}/${d}}`;
}

const identify: Skill = {
  id: "pc.conics.identify",
  title: "Identify a conic section",
  topic: T,
  standards: ["PC.F.4.8"],
  prereqs: [],
  lesson: {
    bigIdea: "Look at the squared terms: only one squared → parabola; both squared and added → circle (same denominators) or ellipse (different); both squared and subtracted → hyperbola.",
    explain: [
      "{(x − 2)^2/9} + {(y + 1)^2/4} = 1: both squared, added, different denominators → **ellipse**.",
      "{x^2/16} − {y^2/9} = 1: subtracted → **hyperbola**. y = 3(x − 1)^2 + 2: only x squared → **parabola**.",
      "In general form Ax^2 + Cy^2 + Dx + Ey + F = 0: A = C → circle; A, C same sign → ellipse; opposite signs → hyperbola; one of them 0 → parabola.",
    ],
    tip: "A circle is a special ellipse where both radii are equal.",
  },
  why: [
    { kind: "choice", prompt: "Why does a minus sign between x^2 and y^2 make a hyperbola?", choices: ["x^2 and y^2 can both grow without bound while their difference stays fixed, so the curve opens outward forever.", "Because hyperbolas are upside-down ellipses.", "Because the minus makes the graph a parabola.", "A minus sign means there's no graph."], correct: 0, explain: "With a sum fixed at 1, neither term can get large, so the curve is closed (ellipse). With a difference fixed, both can get huge together, giving the open branches of a hyperbola." },
    { kind: "written", prompt: "Explain why 4x^2 + 4y^2 − 8x + 16y − 5 = 0 is a circle and not just any ellipse.", keyIdeas: ["x^2 and y^2 have the same coefficient (4)", "after dividing by 4 and completing the square, both have the same denominator", "so the 'radii' in both directions are equal"], exemplar: "The x^2 and y^2 terms have the same positive coefficient, 4. Dividing by 4 and completing the square gives (x − 1)^2 + (y + 2)^2 = r^2, which stretches equally in every direction. That's a circle." },
  ],
  generate(r, lv) {
    const kind = r.pick(["Circle", "Ellipse", "Parabola", "Hyperbola"] as const);
    const h = r.int(-5, 5), k = r.int(-5, 5);
    let eq = "";
    const p = r.pick([4, 9, 16, 25]), q = r.pick([4, 9, 16, 25, 36].filter((x) => x !== p));
    if (lv < 3) {
      if (kind === "Circle") eq = lv === 1 ? `${sq("x", h)} + ${sq("y", k)} = ${p}` : `{${sq("x", h)}/${p}} + {${sq("y", k)}/${p}} = 1`;
      if (kind === "Ellipse") eq = `{${sq("x", h)}/${p}} + {${sq("y", k)}/${q}} = 1`;
      if (kind === "Hyperbola") eq = lv === 1 || r.chance(0.5) ? `{${sq("x", h)}/${p}} − {${sq("y", k)}/${q}} = 1` : `{${sq("y", k)}/${p}} − {${sq("x", h)}/${q}} = 1`;
      if (kind === "Parabola") eq = lv === 1 ? `y = ${r.pick(["2", "3", "−"])}${sq("x", h)}${cst(k)}` : `x = ${r.pick(["", "−", "2"])}${sq("y", k)}${cst(h)}`;
    } else {
      const A = r.pick([1, 2, 3, 4, 9]);
      const C = kind === "Circle" ? A : kind === "Ellipse" ? A + r.pick([1, 3, 5]) : kind === "Hyperbola" ? -r.pick([1, 4, 9]) : 0;
      const D = r.int(-8, 8), E = r.nonzero(-8, 8), F = r.int(-20, 20);
      const t = (c: number, v: string, first = false) => (c === 0 ? "" : `${first ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 && v ? "" : Math.abs(c)}${v}`);
      const swap = kind === "Parabola" && r.chance(0.5);
      eq = swap
        ? `${t(A, "y^2", true)}${t(D, "y")}${t(E || 1, "x")}${t(F, "")} = 0`
        : `${t(A, "x^2", true)}${t(C, "y^2")}${t(D, "x")}${t(E, "y")}${t(F, "")} = 0`;
    }
    const why = kind === "Circle" ? "Both variables are squared and added with equal coefficients (or equal denominators)." : kind === "Ellipse" ? "Both variables are squared and added, with different coefficients (denominators)." : kind === "Hyperbola" ? "Both variables are squared, with opposite signs." : "Only one variable is squared.";
    return {
      prompt: `What type of conic section is ${eq}?`,
      answer: choice(r, kind, [["Circle", "Check whether the squared terms have equal coefficients and the same sign."], ["Ellipse", "An ellipse needs both squared terms added with different coefficients."], ["Parabola", "A parabola has only one squared variable."], ["Hyperbola", "A hyperbola needs the squared terms to have opposite signs."]].filter((w) => w[0] !== kind) as [string, string][], true),
      hints: ["Which variables are squared?", "If both are squared, are the terms added or subtracted? Are their coefficients equal?"],
      steps: [st("Look at the squared terms.", why), st("Conclusion.", kind)],
    };
  },
};

const circle: Skill = {
  id: "pc.conics.circle",
  title: "Circles: center and radius",
  topic: T,
  standards: ["PC.F.4.9"],
  prereqs: ["pc.conics.identify"],
  lesson: {
    bigIdea: "(x − h)^2 + (y − k)^2 = r^2 is a circle with center (h, k) and radius r. From general form, complete the square in x and in y.",
    explain: [
      "x^2 + y^2 − 6x + 4y − 12 = 0. Group: (x^2 − 6x) + (y^2 + 4y) = 12.",
      "Complete each square: add 9 and 4 to both sides: (x − 3)^2 + (y + 2)^2 = 25.",
      "Center **(3, −2)**, radius **5**.",
    ],
    visual: { type: "geo", grid: true, points: { C: { x: 3, y: -2 }, P: { x: 8, y: -2 } }, circles: [{ center: "C", r: 5 }], segments: [{ from: "C", to: "P", label: "5" }], showLabels: true },
    tip: "The signs flip: (x − 3) means h = 3, (y + 2) means k = −2.",
  },
  why: [
    { kind: "choice", prompt: "Why does (x − h)^2 + (y − k)^2 = r^2 describe a circle?", choices: ["It says the distance from (x, y) to (h, k) is r, which is the definition of a circle.", "Because it has two squares.", "Because circles always have h = k.", "It describes an ellipse."], correct: 0, explain: "By the distance formula, √((x − h)^2 + (y − k)^2) is the distance to (h, k). Setting it equal to r gives all points r away from the center." },
    { kind: "written", prompt: "When completing the square for x^2 − 10x, explain what number you add and why you must add it to both sides.", keyIdeas: ["half of −10 is −5, squared is 25", "x^2 − 10x + 25 = (x − 5)^2", "adding to both sides keeps the equation balanced"], exemplar: "Take half of −10 to get −5 and square it: 25. Then x^2 − 10x + 25 = (x − 5)^2. Since I added 25 to the left side, I add 25 to the right side too so the equation stays true." },
  ],
  generate(r, lv) {
    const h = r.int(-6, 6), k = r.int(-6, 6), rad = r.int(1, 9);
    const m = lv === 3 ? r.pick([2, 3]) : 1;
    const D = -2 * h, E = -2 * k, F = h * h + k * k - rad * rad;
    const t = (c: number, v: string, first = false) => (c === 0 ? "" : `${first ? (c < 0 ? "−" : "") : c < 0 ? " − " : " + "}${Math.abs(c) === 1 && v ? "" : Math.abs(c)}${v}`);
    const eq = lv === 1 ? `${sq("x", h)} + ${sq("y", k)} = ${rad * rad}` : `${t(m, "x^2", true)}${t(m, "y^2")}${t(m * D, "x")}${t(m * E, "y")}${t(m * F, "")} = 0`;
    return {
      prompt: `Find the center and radius of the circle ${eq}.`,
      answer: { kind: "multi", fields: [{ value: frac(h), pre: "center (" }, { value: frac(k), pre: ",", post: ")" }, { value: frac(rad), pre: "radius" }] },
      hints: lv === 1
        ? ["Compare with (x − h)^2 + (y − k)^2 = r^2. Watch the signs.", `r^2 = ${rad * rad}, so r = √${rad * rad}.`]
        : [...(m > 1 ? [`Divide every term by ${m} first.`] : []), "Group the x-terms and y-terms, and move the constant to the right.", `Complete the square: add (${D}/2)^2 = ${h * h} and (${E}/2)^2 = ${k * k} to both sides.`],
      steps: lv === 1
        ? [st("Read the center (signs flip).", `(${ms(h)}, ${ms(k)})`), st("Radius.", `r = √${rad * rad} = ${rad}`)]
        : [
            ...(m > 1 ? [st(`Divide by ${m}.`, `${t(1, "x^2", true)}${t(1, "y^2")}${t(D, "x")}${t(E, "y")}${t(F, "")} = 0`)] : []),
            st("Group and move the constant.", `(x^2${t(D, "x")}) + (y^2${t(E, "y")}) = ${ms(-F)}`),
            st("Complete the squares.", `(x^2${t(D, "x")} + ${h * h}) + (y^2${t(E, "y")} + ${k * k}) = ${ms(-F)} + ${h * h} + ${k * k} = ${rad * rad}`),
            st("Factor.", `${sq("x", h)} + ${sq("y", k)} = ${rad * rad}`),
            st("Read off.", `Center (${ms(h)}, ${ms(k)}), radius ${rad}`),
          ],
    };
  },
};

const PAIRS: [number, number, number][] = [[5, 3, 4], [5, 4, 3], [13, 12, 5], [13, 5, 12], [10, 6, 8], [10, 8, 6], [17, 15, 8], [17, 8, 15]];

const ellipse: Skill = {
  id: "pc.conics.ellipse",
  title: "Ellipses: axes, vertices and foci",
  topic: T,
  standards: ["PC.F.4.9"],
  prereqs: ["pc.conics.circle"],
  lesson: {
    bigIdea: "{(x − h)^2/a^2} + {(y − k)^2/b^2} = 1: center (h, k), stretches a horizontally and b vertically. The foci sit on the long (major) axis, c units from the center, with c^2 = (big)^2 − (small)^2.",
    explain: [
      "{(x − 1)^2/25} + {(y + 2)^2/9} = 1: center (1, −2). a = 5 across, b = 3 up and down. Major axis is horizontal, length 2 · 5 = **10**; minor axis length 6.",
      "Vertices: (1 ± 5, −2) = (−4, −2) and (6, −2). Foci: c^2 = 25 − 9 = 16, c = 4, so (−3, −2) and **(5, −2)**.",
      "Every point on the ellipse has distances to the two foci that add up to the major-axis length, 10.",
    ],
    visual: ellipsePlot(1, -2, 5, 3, { points: [{ x: -3, y: -2, label: "F₁" }, { x: 5, y: -2, label: "F₂" }, { x: 1, y: -2, label: "(1, −2)" }] }),
  },
  why: [
    { kind: "choice", prompt: "Why is c^2 = a^2 − b^2 for an ellipse (with a > b)?", choices: ["At the top of the minor axis, the distances to the foci are both a (they sum to 2a), giving a right triangle with legs b and c and hypotenuse a.", "Because ellipses are just stretched circles with c = 0.", "Because c is the average of a and b.", "It's c^2 = a^2 + b^2."], correct: 0, explain: "The top point (h, k + b) is equally far from both foci, and those distances add to 2a, so each is a. The right triangle with legs b and c then gives a^2 = b^2 + c^2." },
    { kind: "written", prompt: "Explain how to tell from the equation whether an ellipse's major axis is horizontal or vertical.", keyIdeas: ["compare the denominators", "the larger denominator is under the direction of the major axis", "under x → horizontal, under y → vertical"], exemplar: "Look at the denominators. The bigger one tells which direction the ellipse stretches farthest. If it's under the (x − h)^2 term, the major axis is horizontal; if it's under (y − k)^2, it's vertical." },
  ],
  generate(r, lv) {
    const [A, B, C] = r.pick(PAIRS);
    const h = r.int(-5, 5), k = r.int(-5, 5);
    const vert = lv === 3 && r.chance(0.6);
    const ax = vert ? B : A, ay = vert ? A : B; // semi-axes in x and y
    const eq = `${fracTerm("x", h, ax * ax)} + ${fracTerm("y", k, ay * ay)} = 1`;
    const vis = ellipsePlot(h, k, ax, ay);
    if (lv === 1) {
      return {
        prompt: `For the ellipse ${eq}, find the lengths of the major and minor axes.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(2 * A), pre: "major axis" }, { value: frac(2 * B), pre: "minor axis" }] },
        hints: [`The semi-axes are √${ax * ax} = ${ax} (horizontal) and √${ay * ay} = ${ay} (vertical).`, "Each axis is twice its semi-axis. The longer one is the major axis."],
        steps: [st("Semi-axes.", `√${ax * ax} = ${ax}, √${ay * ay} = ${ay}`), st("Axis lengths.", `major = 2 · ${A} = ${2 * A}, minor = 2 · ${B} = ${2 * B}`)],
        traps: undefined,
      };
    }
    const fx = vert ? h : h + C, fy = vert ? k + C : k;
    return {
      prompt: `Find the coordinates of the focus of ${eq} with the larger ${vert ? "y" : "x"}-coordinate.`,
      visual: vis,
      answer: { kind: "multi", fields: [{ value: frac(fx), pre: "(" }, { value: frac(fy), pre: ",", post: ")" }] },
      hints: [`Center (${ms(h)}, ${ms(k)}). The major axis is ${vert ? "vertical" : "horizontal"} because the larger denominator is under ${vert ? "y" : "x"}.`, `c^2 = ${A * A} − ${B * B} = ${C * C}.`, `Move c = ${C} from the center along the major axis.`],
      steps: [
        st("Center and major axis.", `(${ms(h)}, ${ms(k)}); major axis ${vert ? "vertical" : "horizontal"} (${A * A} > ${B * B}).`),
        st("Find c.", `c^2 = ${A * A} − ${B * B} = ${C * C}, c = ${C}`),
        st("Focus.", `(${ms(h)}${vert ? "" : ` + ${C}`}, ${ms(k)}${vert ? ` + ${C}` : ""}) = (${ms(fx)}, ${ms(fy)})`),
      ],
    };
  },
};

const HTRIPLES: [number, number, number][] = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17]];

const hyperbola: Skill = {
  id: "pc.conics.hyperbola",
  title: "Hyperbolas: vertices, foci and asymptotes",
  topic: T,
  standards: ["PC.F.4.9"],
  prereqs: ["pc.conics.ellipse"],
  lesson: {
    bigIdea: "{(x − h)^2/a^2} − {(y − k)^2/b^2} = 1 opens left and right from center (h, k). Vertices are a from the center, foci are c from the center with c^2 = a^2 + b^2, and the asymptotes have slopes ±{b/a}.",
    explain: [
      "{(x − 2)^2/9} − {(y + 1)^2/16} = 1: center (2, −1), a = 3, b = 4. Vertices (−1, −1) and (5, −1).",
      "c^2 = 9 + 16 = 25, c = 5: foci (−3, −1) and (7, −1).",
      "Asymptotes: y + 1 = ±{4/3}(x − 2). If the y-term comes first, the hyperbola opens up and down and the slopes are ±{a/b} (rise over run still uses the y-number on top).",
    ],
    visual: hyperbolaPlot(2, -1, 3, 4, true, [{ x: -1, y: -1, label: "(−1, −1)" }, { x: 5, y: -1, label: "(5, −1)" }]),
    tip: "Ellipse: c^2 = big − small. Hyperbola: c^2 = a^2 + b^2. The foci of a hyperbola are always beyond the vertices.",
  },
  why: [
    { kind: "choice", prompt: "Why does a hyperbola have asymptotes with slope ±b/a?", choices: ["For large |x|, the 1 in the equation is tiny compared with the squared terms, so (x−h)^2/a^2 ≈ (y−k)^2/b^2, which gives y − k ≈ ±(b/a)(x − h).", "Because the foci are on those lines.", "Because b/a is the eccentricity.", "Asymptotes come from setting x = 0."], correct: 0, explain: "Far from the center the equation behaves like (x−h)^2/a^2 − (y−k)^2/b^2 = 0, which factors into the two lines y − k = ±(b/a)(x − h)." },
    { kind: "written", prompt: "Compare how c is found for an ellipse and for a hyperbola, and explain why the foci of a hyperbola are farther from the center than its vertices.", keyIdeas: ["ellipse: c^2 = a^2 − b^2 (big minus small)", "hyperbola: c^2 = a^2 + b^2", "so for a hyperbola c > a: foci beyond the vertices"], exemplar: "For an ellipse, c^2 is the larger square minus the smaller, so the foci are inside. For a hyperbola, c^2 = a^2 + b^2, which is bigger than a^2, so c > a and the foci lie outside the vertices, inside each branch's curve." },
  ],
  generate(r, lv) {
    const trip = r.pick(HTRIPLES);
    const [a, b, c] = trip;
    const h = r.int(-4, 4), k = r.int(-4, 4);
    const horiz = lv < 3 || r.chance(0.5);
    const eq = horiz ? `${fracTerm("x", h, a * a)} − ${fracTerm("y", k, b * b)} = 1` : `${fracTerm("y", k, a * a)} − ${fracTerm("x", h, b * b)} = 1`;
    const vis = hyperbolaPlot(h, k, a, b, horiz);
    if (lv === 1) {
      const vx = horiz ? h + a : h, vy = horiz ? k : k + a;
      return {
        prompt: `Find the vertex of ${eq} with the larger x-coordinate.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(vx), pre: "(" }, { value: frac(vy), pre: ",", post: ")" }] },
        hints: [`Center (${ms(h)}, ${ms(k)}). The x-term is positive, so it opens left and right.`, `a = √${a * a} = ${a}. Move ${a} right from the center.`],
        steps: [st("Center.", `(${ms(h)}, ${ms(k)})`), st("a.", `a = ${a}`), st("Vertex.", `(${ms(h)} + ${a}, ${ms(k)}) = (${ms(vx)}, ${ms(vy)})`)],
      };
    }
    if (lv === 2) {
      const fx = h + c;
      return {
        prompt: `Find the focus of ${eq} with the larger x-coordinate.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(fx), pre: "(" }, { value: frac(k), pre: ",", post: ")" }] },
        hints: [`For a hyperbola, c^2 = a^2 + b^2 = ${a * a} + ${b * b}.`, `c = ${c}. Move ${c} right from the center (${ms(h)}, ${ms(k)}).`],
        steps: [st("Find c.", `c^2 = ${a * a} + ${b * b} = ${c * c}, so c = ${c}`), st("Focus.", `(${ms(h)} + ${c}, ${ms(k)}) = (${ms(fx)}, ${ms(k)})`)],
      };
    }
    const m = frac(horiz ? b : a, horiz ? a : b);
    const mText = m.d === 1 ? String(m.n) : `{${m.n}/${m.d}}`;
    const mE = m.d === 1 ? String(m.n) : `(${m.n}/${m.d})`;
    return {
      prompt: `Write the equation of the asymptote with positive slope for the hyperbola ${eq}.`,
      visual: vis,
      answer: expr(`${mE}(x${pE(-h)})${pE(k)}`, { lhs: "y", display: `${mText}(${shiftText(h)})${cst(k)}` }),
      hints: [`Center (${ms(h)}, ${ms(k)}). The asymptotes pass through the center.`, horiz ? `Opens left/right: slope = ±{b/a} = ±{${b}/${a}}.` : `Opens up/down: slope = ±{a/b} = ±{${a}/${b}} (the number under y over the number under x, after square roots).`],
      steps: [st("Center.", `(${ms(h)}, ${ms(k)})`), st("Slope.", `rise over run = {√${horiz ? b * b : a * a}/√${horiz ? a * a : b * b}} = ${mText}`), st("Point-slope form.", `y${cst(-k)} = ${mText}(${shiftText(h)}), so y = ${mText}(${shiftText(h)})${cst(k)}`)],
    };
  },
};

const parabola: Skill = {
  id: "pc.conics.parabola",
  title: "Parabolas: focus and directrix",
  topic: T,
  standards: ["PC.F.4.9"],
  prereqs: ["pc.conics.identify"],
  lesson: {
    bigIdea: "(x − h)^2 = 4p(y − k) has vertex (h, k). The focus is p units from the vertex inside the curve, and the directrix is the line p units on the other side.",
    explain: [
      "(x − 1)^2 = 8(y + 2): 4p = 8 so p = 2. Vertex (1, −2), opens up. Focus **(1, 0)**, directrix **y = −4**.",
      "(y − k)^2 = 4p(x − h) opens right (p > 0) or left (p < 0); its directrix is a vertical line x = h − p.",
      "Every point on a parabola is the same distance from the focus and from the directrix. That's why satellite dishes put the receiver at the focus.",
    ],
    visual: { type: "plot", xMin: -6, xMax: 8, yMin: -6, yMax: 8, curves: [{ expr: "(x-1)^2/8-2" }], hlines: [{ y: -4, dashed: true, label: "y = −4" }], points: [{ x: 1, y: 0, label: "focus (1, 0)" }, { x: 1, y: -2, label: "(1, −2)" }] },
  },
  why: [
    { kind: "choice", prompt: "Why does a satellite dish shaped like a parabola collect signals at its focus?", choices: ["Rays coming in parallel to the axis reflect off a parabola straight to the focus.", "Because the focus is the lowest point.", "Because the directrix blocks the signal.", "It doesn't; they collect at the vertex."], correct: 0, explain: "The reflection property of a parabola sends every incoming ray parallel to its axis through the focus, so the receiver goes there." },
    { kind: "written", prompt: "For x^2 = 12y, explain how to find the focus and directrix, and check that the point (6, 3) is equally far from both.", keyIdeas: ["4p = 12, p = 3", "focus (0, 3), directrix y = −3", "distance from (6, 3) to the focus is 6", "distance to the directrix is 3 − (−3) = 6"], exemplar: "4p = 12, so p = 3: the focus is (0, 3) and the directrix is y = −3. The point (6, 3) is 6 units from the focus (same y, x differs by 6) and 3 − (−3) = 6 units above the directrix. Equal, as expected." },
  ],
  generate(r, lv) {
    const h = r.int(-5, 5), k = r.int(-5, 5);
    const p = r.pick([1, 2, 3, -1, -2, 0.5, -3]);
    const vertical = lv !== 2 || r.chance(0.5);
    const fourP = 4 * p;
    const eq = vertical ? `${sq("x", h)} = ${ms(fourP)}${k === 0 ? "y" : `(${shiftText(k, "y")})`}` : `${sq("y", k)} = ${ms(fourP)}${h === 0 ? "x" : `(${shiftText(h)})`}`;
    const vis: Visual = vertical
      ? { type: "plot", xMin: h - 8, xMax: h + 8, yMin: k - 8, yMax: k + 8, curves: [{ expr: `${sqE("x", h)}/${fourP}${pE(k)}` }] }
      : { type: "plot", xMin: h - 8, xMax: h + 8, yMin: k - 8, yMax: k + 8, curves: [{ expr: `${k}+sqrt(${fourP}*(x${pE(-h)}))` }, { expr: `${k}-sqrt(${fourP}*(x${pE(-h)}))` }] };
    if (lv === 1) {
      return {
        prompt: `Find the focus of the parabola ${eq}.`,
        visual: vis,
        answer: { kind: "multi", fields: [{ value: frac(h), pre: "(" }, { value: frac(k + p), pre: ",", post: ")" }] },
        hints: [`Vertex (${ms(h)}, ${ms(k)}). 4p = ${ms(fourP)}, so p = ${ms(p)}.`, `It opens ${p > 0 ? "up" : "down"}. The focus is ${Math.abs(p)} ${p > 0 ? "above" : "below"} the vertex.`],
        steps: [st("Vertex.", `(${ms(h)}, ${ms(k)})`), st("Find p.", `4p = ${ms(fourP)}, p = ${ms(p)}`), st("Focus.", `(${ms(h)}, ${ms(k)} + ${sn(p)}) = (${ms(h)}, ${ms(k + p)})`)],
      };
    }
    if (lv === 2) {
      const dir = vertical ? k - p : h - p;
      return {
        prompt: `Find the directrix of the parabola ${eq}.`,
        visual: vis,
        answer: num(dir, { pre: vertical ? "y = " : "x = " }),
        hints: [`Vertex (${ms(h)}, ${ms(k)}), p = {${ms(fourP)}/4} = ${ms(p)}.`, `The directrix is on the opposite side of the vertex from the focus: ${vertical ? "y" : "x"} = ${ms(vertical ? k : h)} − ${sn(p)}.`],
        steps: [st("Vertex and p.", `(${ms(h)}, ${ms(k)}), p = ${ms(p)}`), st("Opens.", vertical ? (p > 0 ? "up" : "down") : p > 0 ? "right" : "left"), st("Directrix.", `${vertical ? "y" : "x"} = ${ms(vertical ? k : h)} − ${sn(p)} = ${ms(dir)}`)],
        traps: traps(frac(dir), [trap(vertical ? k + p : h + p, "That's where the focus is. The directrix is on the other side of the vertex."), trap(vertical ? k - fourP : h - fourP, "Use p, not 4p.")]),
      };
    }
    // Level 3: from focus and directrix, write y = (1/(4p))(x − h)^2 + k.
    const fy = k + p, dy = k - p;
    const cE = `(1/${fourP})`;
    const cT = fourP === 1 ? "" : fourP === -1 ? "−" : fourP < 0 ? `−{1/${-fourP}}` : `{1/${fourP}}`;
    return {
      prompt: `A parabola has focus (${ms(h)}, ${ms(fy)}) and directrix y = ${ms(dy)}. Write its equation in the form y = a(x − h)^2 + k.`,
      answer: expr(`${cE}${sqE("x", h)}${pE(k)}`, { lhs: "y", display: `${cT}${sq("x", h)}${cst(k)}` }),
      hints: ["The vertex is halfway between the focus and the directrix.", `Vertex (${ms(h)}, ${ms(k)}), and p = distance from vertex to focus = ${ms(p)} (negative if the focus is below).`, `a = {1/4p} = {1/${ms(fourP)}}.`],
      steps: [st("Vertex: halfway between focus and directrix.", `(${ms(h)}, {${ms(fy)} + ${sn(dy)}/2}) = (${ms(h)}, ${ms(k)})`), st("p.", `p = ${ms(fy)} − ${sn(k)} = ${ms(p)}`), st("a = 1/(4p).", `a = {1/${ms(fourP)}}`), st("Equation.", `y = ${cT}${sq("x", h)}${cst(k)}`)],
    };
  },
};

export default [identify, circle, ellipse, hyperbola, parabola];
