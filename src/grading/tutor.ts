// The "I'm stuck" tutor: prompt building, the answer-leak guard and usage counting.
// Kept free of the Anthropic SDK so it can load with the app; the SDK part is imported lazily from ./tutor-claude.

import type { Problem, Visual } from "../content/types";
import { answerText } from "../engine/check";
import type { TutorChat } from "../engine/state";
import { prettyExpr } from "../lib/expr";
import { toNum, type Frac } from "../lib/rational";

export interface TutorTurn {
  role: "student" | "tutor";
  text: string;
}

/** Most messages a student can send about one problem. */
export const MAX_PER_PROBLEM = 8;
/** Chats kept in the saved state (oldest dropped first). */
export const MAX_CHATS = 300;
/** Shown instead of a reply that gave the answer away twice. */
export const SAFE_FALLBACK = "Let's take it one step at a time: what's the first thing you'd do?";
export const ERROR_TEXT = "I couldn't reach the tutor right now. Try a hint, or ask again in a minute.";

export const TUTOR_SYSTEM = `You are a patient, respectful math tutor inside a practice app. Your student is a high-school student (about 14–18 years old) working on North Carolina high-school math: NC Math 1, NC Math 2, NC Math 3, NC Math 4 or Pre-Calculus. They pressed "I'm stuck" on one practice problem. Your job is to help them get unstuck so THEY can solve it, not to solve it for them.

How to reply:
- Be Socratic. Each reply gives ONE small next step or asks ONE focused guiding question, never a whole method at once.
- Always talk about THIS problem and its actual numbers and expressions, not a general lesson.
- At most 60 words. Be clear and direct. Use correct math vocabulary, and briefly define a term if the student seems unsure of it.
- Be respectful and matter-of-fact, the way a good tutor talks to a high-school student: no baby talk, no gushing. Treat a mistake as useful information about where to look next, never as something to feel bad about.
- Speak to the student as "you".

Never give the answer away:
- NEVER state the final answer before the student does, and never do the final computation, simplification or factoring for them. Leave the last step for the student.
- Don't confirm or deny an answer the student just types or guesses without showing how they got it (like "(x + 2)(x − 3)" or "is it 24?"), even if it's correct. You're here to help them understand, so ask how they got it, or say "Try it and check!" and help them check it themselves (for example by substituting a value, expanding, graphing or estimating).
- For a multiple-choice problem, never be the first to say which choice is correct, and never rule choices in or out for them.
- If they ask you straight out for the answer, say briefly that working it out themselves is how the skill sticks (and it's what the EOC will ask them to do), then offer a smaller step.

When the student gets there:
- Confirm when it's clear the student understands: they say the correct answer AND have shown in their own messages how they got it (they explained their reasoning, or wrote out their work, like "two numbers that multiply to −6 and add to −1 are 2 and −3" or "I subtracted 5 from both sides"), or they correctly answered a single step you set up for them, like "What is 12 − 5?". Then they have done the work, so don't keep quizzing them. Tell them plainly that they're right, note what they did well in a few words, and tell them to enter their answer (or click their choice) and press Check.
- If they only typed the answer out of nowhere, don't confirm it yet: ask a quick "How did you get that?" first.
- When you ask for one small step (like "What is 6 × 6?" or "What do you get when you expand (x + 2)(x − 3)?") and they get it right, just accept it: say so briefly and help them see the next step. Don't ask them to justify a simple computation. If that step gives the final answer, tell them they've got it and to enter it.
- If they reach a correct answer by a different but valid method, that counts too.
- Only confirm an answer the student has said themselves. If their answer is close but not quite right (a sign slip, a missing unit, not fully simplified, or the wrong form), say what's right and point to the one thing to fix.

Using what you know:
- The first message includes the problem, a description of any picture or graph, what kind of answer is needed, the hints they have already seen, and their wrong answers so far. Don't repeat a hint they have already seen word for word; build on it.
- If a wrong answer shows a likely misconception (for example writing (x + 3)^2 as x^2 + 9, dropping a negative sign when distributing, mixing up slope and y-intercept, or using sine where cosine belongs), point to it with a question.
- The correct answer and worked solution are marked for you only. Use them to guide your questions, and to recognize when the student has got it right. Never reveal or quote them.

Formatting:
- Plain text only: no headings, lists, tables, LaTeX or links.
- You may write a fraction as {3/4}, bold a key word with **double stars**, write powers like x^2 or 2^(x+1), subscripts like a_1, and roots as √(2x). Use × for times (or 3x for 3 times x), ÷ for divide, − for minus, and π and θ as symbols.

Staying safe and on topic:
- Only help with this math problem. If the student goes off topic, briefly bring them back to the problem.
- If they share personal information (like a full name, address, school, phone number or social media handle), don't repeat it; remind them not to share that here and return to the math.
- If they say something worrying or unsafe (for example that they are hurt, scared, being treated badly or thinking about hurting themselves), respond with care, encourage them to talk to a teacher, parent, school counselor or another trusted adult right away (in the US they can also call or text 988, any time), and don't continue as if nothing was said.`;

const RETRY_NOTE = `

IMPORTANT: Your previous draft gave away the final answer (or confirmed a guess). Write a new reply that does NOT contain the final answer, the final expression, the result of the last computation, or which choice is correct. Ask one guiding question about the next small step instead. If the student gave the right answer without showing how they got it, ask them how they got it, without saying whether it's right.`;

// ---------- Describing the problem ----------

const MINUS = (s: string) => s.replace(/-(?=\d)/g, "−");
const n = (x: number) => MINUS(String(x));

/** A short text version of the picture shown with a problem, so the tutor knows what the student sees. */
export function describeVisual(v: Visual): string {
  switch (v.type) {
    case "numberline": {
      const parts = [`A number line from ${n(v.min)} to ${n(v.max)} with tick marks every ${n(v.step)}.`];
      if (v.points?.length) parts.push(`Points marked: ${v.points.map((p) => (p.label ? `${p.label} at ${n(p.v)}` : n(p.v))).join("; ")}.`);
      if (v.jumps?.length) parts.push(`Jump arrows: ${v.jumps.map((j) => `from ${n(j.from)} to ${n(j.to)}${j.label ? ` (labeled "${j.label}")` : ""}`).join("; ")}.`);
      if (v.ray) parts.push(`An inequality graph: ${v.ray.closed ? "a closed (filled) circle" : "an open circle"} at ${n(v.ray.at)} with the ray shaded to the ${v.ray.dir}.`);
      return parts.join(" ");
    }
    case "plot": {
      const parts = [`A graph with x from ${n(v.xMin)} to ${n(v.xMax)} and y from ${n(v.yMin)} to ${n(v.yMax)}.`];
      if (v.curves?.length) {
        const curves = v.curves.map((c) => {
          const dom = c.domain ? ` for ${n(c.domain[0])} ≤ x ≤ ${n(c.domain[1])}` : "";
          return `${c.label ? c.label + ": " : ""}y = ${prettyExpr(c.expr)}${dom}${c.dashed ? " (dashed)" : ""}${c.shade ? `, shaded ${c.shade}` : ""}`;
        });
        parts.push(`Graphed: ${curves.join("; ")}.`);
      }
      if (v.points?.length) parts.push(`Points: ${v.points.map((p) => `${p.label ? p.label + " " : ""}(${n(p.x)}, ${n(p.y)})${p.open ? " (open circle)" : ""}`).join("; ")}.`);
      if (v.vlines?.length) parts.push(`Vertical lines: ${v.vlines.map((l) => `x = ${n(l.x)}${l.dashed ? " (dashed)" : ""}${l.label ? ` labeled "${l.label}"` : ""}`).join("; ")}.`);
      if (v.hlines?.length) parts.push(`Horizontal lines: ${v.hlines.map((l) => `y = ${n(l.y)}${l.dashed ? " (dashed)" : ""}${l.label ? ` labeled "${l.label}"` : ""}`).join("; ")}.`);
      return parts.join(" ");
    }
    case "geo": {
      const parts = [`A geometry figure${v.grid ? " on a grid" : ""}${v.showLabels === false ? " (the point names are not shown to the student)" : ""}.`];
      parts.push(`Point positions${v.grid ? "" : " (for your picture of the layout; not shown to the student)"}: ${Object.entries(v.points).map(([k, p]) => `${k} (${n(p.x)}, ${n(p.y)})`).join(", ")}.`);
      if (v.polygons?.length) parts.push(`Shapes: ${v.polygons.map((pg) => pg.join("")).join(", ")}.`);
      if (v.segments?.length) parts.push(`Segments: ${v.segments.map((s) => `${s.from}${s.to}${s.label ? ` labeled "${s.label}"` : ""}${s.dashed ? " (dashed)" : ""}${s.tick ? ` with ${s.tick} tick mark${s.tick > 1 ? "s" : ""}` : ""}`).join("; ")}.`);
      if (v.circles?.length) parts.push(`Circles: ${v.circles.map((c) => `centered at ${c.center}`).join("; ")}.`);
      if (v.angles?.length) parts.push(`Angles marked: ${v.angles.map((a) => `angle ${a.from}${a.at}${a.to}${a.right ? " (right angle)" : ""}${a.label ? ` labeled "${a.label}"` : ""}`).join("; ")}.`);
      return parts.join(" ");
    }
    case "histogram":
      return `A histogram${v.xLabel ? ` of ${v.xLabel}` : ""}${v.yLabel ? ` (bar height: ${v.yLabel})` : ""}. Bars: ${v.bins.map((b) => `${n(b.from)} to ${n(b.to)}: ${n(b.count)}`).join("; ")}.`;
    case "normal": {
      const shade =
        v.shadeFrom !== undefined && v.shadeTo !== undefined
          ? `, shaded between ${n(v.shadeFrom)} and ${n(v.shadeTo)}`
          : v.shadeFrom !== undefined
            ? `, shaded to the right of ${n(v.shadeFrom)}`
            : v.shadeTo !== undefined
              ? `, shaded to the left of ${n(v.shadeTo)}`
              : "";
      return `A normal curve${v.label ? ` of ${v.label}` : ""} with mean ${n(v.mean)} and standard deviation ${n(v.sd)}${shade}.`;
    }
    case "fractionbars":
      return `Fraction bars: ${v.bars.map((b, i) => `${b.label ? `"${b.label}"` : `bar ${i + 1}`} has ${b.parts} equal parts with ${b.shaded} shaded`).join("; ")}.`;
    case "grid": {
      const parts = [`A coordinate grid from ${n(v.min)} to ${n(v.max)} on both axes.`];
      if (v.points?.length) parts.push(`Points: ${v.points.map((p) => `${p.label ? p.label + " " : ""}(${n(p.x)}, ${n(p.y)})`).join("; ")}.`);
      if (v.polygon?.length) parts.push(`A shape with corners at ${v.polygon.map((p) => `(${n(p.x)}, ${n(p.y)})`).join(", ")}.`);
      if (v.lines?.length) parts.push(`Lines drawn: ${v.lines.map((l) => `${l.label ? l.label + ": " : ""}y = ${n(l.m)}x + ${n(l.b)}`).join("; ")}.`);
      return parts.join(" ");
    }
    case "table": {
      const rows = v.rows.map((r) => r.map((c) => (typeof c === "number" ? n(c) : c)).join(" | "));
      return `A table${v.caption ? ` ("${v.caption}")` : ""}. Columns: ${v.headers.join(" | ")}. Rows: ${rows.join(" ; ")}.`;
    }
    case "dotplot":
      return `A dot plot${v.label ? ` of ${v.label}` : ""} on a scale from ${n(v.min)} to ${n(v.max)}, with one dot for each value: ${v.values.map(n).join(", ")}.`;
    case "scatter":
      return `A scatter plot with "${v.xLabel}" across and "${v.yLabel}" up. Points: ${v.points.map((p) => `(${n(p.x)}, ${n(p.y)})`).join(", ")}.${v.line ? ` A trend line y = ${n(v.line.m)}x + ${n(v.line.b)} is drawn.` : ""}`;
    case "tape":
      return `A tape diagram. ${v.rows.map((r) => `${r.label}: ${r.segments.map((s) => `[${s.text || "blank"}${s.shade ? ", shaded" : ""}, size ${s.size}]`).join(" ")}`).join(". ")}.`;
    case "boxplot":
      return `A box plot on a scale from ${n(v.scaleMin)} to ${n(v.scaleMax)}: minimum ${n(v.min)}, first quartile ${n(v.q1)}, median ${n(v.median)}, third quartile ${n(v.q3)}, maximum ${n(v.max)}.`;
    case "dicesim":
      return `A simulator button that rolls two dice ${v.rolls} times and shows a bar chart of the sums; the problem is about getting a sum of ${v.target}.`;
    case "shape": {
      const labels = Object.entries(v.labels).filter(([, val]) => val !== undefined && val !== "").map(([k, val]) => `${k} = ${val}`);
      return `A picture of a ${v.shape === "righttriangle" ? "right triangle" : v.shape === "angles" ? "set of angles" : v.shape}${labels.length ? ` labeled ${labels.join(", ")}` : ""}.`;
    }
  }
}

const FORM_NAMES = { factored: "factored form", expanded: "expanded (standard) form", vertex: "vertex form, a(x − h)^2 + k" } as const;

function answerFormat(problem: Problem): string {
  const a = problem.answer;
  switch (a.kind) {
    case "number":
      return `The student types one number${a.pre ? ` after "${a.pre}"` : ""}${a.unit ? ` (unit: ${a.unit})` : ""}. Fractions like 3/4 and mixed numbers like 1 1/2 are allowed${a.simplest ? "; fractions must be in simplest form" : ""}.`;
    case "multi":
      return `The student fills in boxes: ${a.fields.map((f) => `${f.pre ?? ""} [box] ${f.post ?? ""}`.trim()).join("  ")}.`;
    case "choice":
      return `Multiple choice. The student clicks one of these:\n${a.choices.map((c, i) => `${i + 1}) ${c}`).join("\n")}`;
    case "expr": {
      const what = a.vars.length ? `an expression in ${a.vars.join(", ")}` : "an exact value (no variables)";
      const around = `${a.pre ? ` after "${a.pre}"` : ""}${a.post ? ` before "${a.post}"` : ""}`;
      const lhs = a.lhs ? ` They may start with "${a.lhs} =".` : "";
      const form = a.form ? ` It must be in ${FORM_NAMES[a.form]}; an equivalent answer in another form is marked "almost".` : "";
      const exact = !a.vars.length && a.exact !== false ? " A decimal approximation is marked \"almost\"; the exact value (with √ or π) is expected." : "";
      return `The student types ${what}${around}, using ^ for powers, sqrt( ) for square roots and pi for π. Any equivalent expression is accepted.${lhs}${form}${exact}`;
    }
    case "point":
      return `The student clicks a point on a coordinate grid from ${n(a.min)} to ${n(a.max)}.`;
  }
}

/** The background for the first message: everything the tutor needs to know about this problem. */
export function tutorContext(problem: Problem, wrongAnswers: string[], hintsShown: number): string {
  const hints = problem.hints.slice(0, hintsShown);
  const correct = problem.answer.kind === "choice" ? `choice ${problem.answer.correct + 1}) ${answerText(problem.answer)}` : answerText(problem.answer);
  return [
    `<problem>\n${problem.prompt}\n</problem>`,
    problem.visual ? `<picture_shown_with_the_problem>\n${describeVisual(problem.visual)}\n</picture_shown_with_the_problem>` : "",
    `<answer_format>\n${answerFormat(problem)}\n</answer_format>`,
    `<hints_already_shown>\n${hints.length ? hints.map((h, i) => `${i + 1}. ${h}`).join("\n") : "none"}\n</hints_already_shown>`,
    `<student_wrong_answers>\n${wrongAnswers.length ? wrongAnswers.join("\n") : "none yet"}\n</student_wrong_answers>`,
    `<for_the_tutor_only_never_reveal>\nCorrect answer: ${correct}\nWorked solution:\n${problem.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n</for_the_tutor_only_never_reveal>`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

/** The conversation as alternating user/assistant messages, with the problem background in the first one. */
export function buildMessages(context: string, turns: TutorTurn[]): ApiMessage[] {
  const out: ApiMessage[] = [];
  turns.forEach((t, i) => {
    const role = t.role === "student" ? "user" : "assistant";
    const content = i === 0 && role === "user" ? `${context}\n\n<student_message>\n${t.text}\n</student_message>` : t.text;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  });
  return out;
}

// ---------- Leak guard ----------

/** Lowercase plain text with markup removed and minus signs, thousands separators and spacing made uniform. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\{([^{}/]+)\/([^{}]+)\}/g, "$1/$2")
    .replace(/\*\*/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/(\d),(?=\d{3}\b)/g, "$1")
    .replace(/(\d)\s*[x*]\s*(?=10\b)/g, "$1×")
    .replace(/\s+/g, " ")
    .trim();
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Ways the student or tutor might write this exact value. */
function numberForms(v: Frac, tolerance?: number): string[] {
  const x = toNum(v);
  const forms = new Set<string>();
  const sign = x < 0 ? "-" : "";
  const an = Math.abs(v.n);
  if (v.d === 1) forms.add(String(v.n));
  else {
    forms.add(`${sign}${an}/${v.d}`);
    if (an > v.d) forms.add(`${sign}${Math.trunc(an / v.d)} ${an % v.d}/${v.d}`);
  }
  let d = v.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d === 1 || tolerance !== undefined) {
    forms.add(String(Number(x.toFixed(6))));
    forms.add(x.toFixed(2));
    if (tolerance !== undefined) {
      forms.add(String(Number(x.toFixed(2))));
      forms.add(String(Number(x.toFixed(1))));
    }
  }
  // A decimal like 0.5 is also written .5
  for (const f of [...forms]) if (/^-?0\.\d/.test(f)) forms.add(f.replace("0.", "."));
  return [...forms];
}

const NUM_TOKEN = /-?\d+(?:\.\d+)?(?:\s\d+\/\d+|\/\d+)?|-?\.\d+/g;

function tokenValue(tok: string): number {
  const t = tok.trim();
  const mixed = t.match(/^(-?)(\d+)\s(\d+)\/(\d+)$/);
  if (mixed) return (mixed[1] ? -1 : 1) * (Number(mixed[2]) + Number(mixed[3]) / Number(mixed[4]));
  const f = t.match(/^(-?\d+)\/(\d+)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  return Number(t);
}

/** Whether a number with this value is written in the text (e.g. the answer already appears in the problem). */
function containsValue(text: string, value: number, tolerance = 1e-9): boolean {
  return (normalize(text).match(NUM_TOKEN) ?? []).some((t) => Math.abs(tokenValue(t) - value) <= tolerance);
}

// A number that stands on its own: not part of a longer number, a fraction, a variable term or a longer expression.
const AFTER = String.raw`(?![\d/]|[.,]\d)(?![a-z(])(?!\s*[-+×*÷/^]\s*[\d(a-z])`;
const BEFORE = String.raw`(?<![\d./-])`;
const STRONG_LEAD = String.raw`(?:(?:the |your |final |correct |right )*(?:answer|solution)(?: is| =|:| would be| will be| should be| must be|'s)|(?:correct|right) answer(?: is)?|it should be|it must be)\s*(?:about |exactly |just |probably |definitely |really )?`;
const WEAK_LEAD = String.raw`(?:=|≈|\bis|\bequals|\bmakes|\bgives(?: you)?|\byou get|\byou'll get|\bcomes out to|\b(?:the )?same as|\bworks out to|\bthat's|\bit's|\bso)\s*(?:about |exactly |just )?`;
const CONFIRM_AFTER = String.raw`\s*(?:is|was|would be|'s)\s+(?:the\s+)?(?:right|correct|exactly right|the answer|the correct answer|the right answer|right one|correct one|greatest|largest|biggest|smallest|least|best|better buy|best buy)\b`;
const AFFIRM = /^\s*(?:yes|yep|yeah|yay|correct|right|exactly|perfect|you got it|you're right|that's right|that's correct|that is right|that is correct|great job|well done|nice work)\b/;

function numberLeak(reply: string, forms: string[], inProblem: boolean): boolean {
  const all = forms.flatMap((f) => (f.startsWith("-") ? [f, `-$${f.slice(1)}`] : [f]));
  const body = all.map((f) => esc(f).replace(/ /g, "\\s")).join("|");
  const money = String.raw`\$?\s?`;
  const val = String.raw`${BEFORE}${money}(?:${body})${AFTER}`;
  // "The answer is y = −2": an optional "y =" / "f(x) =" / "x =" between the lead and the number.
  const lhs = String.raw`(?:[a-z](?:\([a-z]\))?\s*=\s*)?`;
  if (new RegExp(`${STRONG_LEAD}${lhs}${val}`).test(reply)) return true;
  if (new RegExp(`${BEFORE}${money}(?:${body})(?![\\d/]|[.,]\\d)\\s*(?:%|[a-z]+)?${CONFIRM_AFTER}`).test(reply)) return true;
  if (!inProblem && new RegExp(`${WEAK_LEAD}\\s*${val}`).test(reply)) return true;
  return false;
}

/** Whether a student message says the correct answer (for the answer kinds that can be typed in chat). */
export function statesAnswer(text: string, problem: Problem): boolean {
  const m = normalize(text);
  if (!m) return false;
  const promptText = problem.prompt + (problem.visual ? "\n" + describeVisual(problem.visual) : "");
  const numberSaid = (value: number, forms: string[], tol = 1e-9) => {
    if (!containsValue(m, value, tol)) return false;
    // When the answer is also a number in the problem, just repeating the problem's numbers doesn't count.
    if (!containsValue(promptText, value, tol)) return true;
    const onlyNumber = (m.match(NUM_TOKEN) ?? []).length === 1 && m.replace(NUM_TOKEN, "").replace(/[^a-z]/g, "").length <= 8;
    return onlyNumber || numberLeak(m, forms, false);
  };
  const a = problem.answer;
  switch (a.kind) {
    case "number":
      return numberSaid(toNum(a.value), numberForms(a.value, a.tolerance), a.tolerance ?? 1e-9);
    case "point":
      return m.replace(/\s/g, "").includes(`(${a.x},${a.y})`);
    case "multi":
      return m.replace(/\s/g, "").includes(normalize(answerText(a)).replace(/\s/g, ""));
    case "choice": {
      const text = normalize(a.choices[a.correct]).replace(/[.!]+$/, "");
      return new RegExp(`^\\D*\\b${a.correct + 1}\\b\\D*$`).test(m) || (text.length > 2 && m.includes(text));
    }
    case "expr": {
      const forms = exprForms(a);
      const numeric = forms.filter((f) => /^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(f));
      if (numeric.length) return numberSaid(tokenValue(numeric[0]), numeric);
      return forms.map(exprPattern).some((re) => new RegExp(re).test(mathCanon(text)));
    }
  }
}

const OPERATION = /[=×÷+*^√]|\d\s*(?:x|-)\s*\d|\b(?:times|plus|minus|divided|multipl\w*|add(?:ed|ing)?|subtract\w*|divid\w*|equals|cancel\w*|undo|both sides|factor\w*|expand\w*|distribut\w*|substitut\w*|plug\w*|solv\w*|squar\w*|sqrt|root|isolat\w*|simplif\w*|combin\w*)\b/;
const WHY = /\b(?:because|since|so|means)\b/;
const GROUPING = /\b(?:of|each|rows?|groups?|per)\b/;

/** Whether a student message shows some working or reasoning ("6 × 6", "I subtracted 5", "because when one goes up…"). */
export function showsThinking(text: string): boolean {
  const m = normalize(text);
  const numbers = (m.match(NUM_TOKEN) ?? []).length;
  const words = m.split(" ").length;
  if (numbers > 0 && (OPERATION.test(m) || WHY.test(m))) return true;
  if (numbers >= 2 && GROUPING.test(m)) return true;
  // A word answer ("Hours studied and test score") can be explained without numbers.
  return WHY.test(m) && words >= 6;
}

/** Whether a tutor message asks the student to do one computation ("What is 12 − 5?", "What do you get when you expand (x + 2)(x − 3)?"). */
function asksForStep(text: string): boolean {
  const m = normalize(text);
  return m.includes("?") && /\d/.test(m) && OPERATION.test(m);
}

/** A guess with no thinking shown: "is it 36?", "maybe 36", "36 or 24?". */
export function isBareGuess(text: string): boolean {
  const m = normalize(text);
  if (/\d\s+or\s+-?\$?\d/.test(m)) return true;
  if (showsThinking(m)) return false;
  return /\?\s*$/.test(m) || /^(?:is it|maybe|i guess|guess|what about|how about)\b/.test(m);
}

/** The student's message with the answer itself taken out, so typing "3x + 6" or "(x+2)(x-3)" doesn't count as working. */
function withoutAnswer(text: string, problem: Problem): string {
  const a = problem.answer;
  if (a.kind === "expr") {
    let t = mathCanon(text);
    for (const re of exprForms(a).map(exprPattern)) t = t.replace(new RegExp(re, "g"), " ");
    return t;
  }
  const answer = a.kind === "choice" ? a.choices[a.correct] : a.kind === "multi" ? answerText(a) : "";
  if (!answer || !/[^\w\s]/.test(answer)) return text;
  return normalize(text).replace(new RegExp([...normalize(answer).replace(/\s/g, "")].map(esc).join("\\s*"), "g"), " ");
}

/**
 * Whether the student has reached the correct answer themselves and shown they understand it. The latest
 * student message that states the answer counts when it's a correct reply to a single step the tutor just set
 * up ("What is 12 − 5?" → "7"), or when the student has shown working in the chat and it isn't a bare guess
 * (or a later message explains it). Then the tutor may say they're right.
 */
export function studentWorkedItOut(problem: Problem, turns: TutorTurn[]): boolean {
  let last = -1;
  turns.forEach((t, i) => {
    if (t.role === "student" && statesAnswer(t.text, problem)) last = i;
  });
  if (last < 0) return false;
  const said = turns[last].text;
  const thinking = (t: string) => showsThinking(withoutAnswer(t, problem));
  // The answer to a computation the tutor just asked for, as long as it isn't a list of guesses.
  const prev = turns[last - 1];
  if (prev?.role === "tutor" && asksForStep(prev.text) && !/\d\s+or\s+-?\$?\d/.test(normalize(said))) return true;
  const student = turns.filter((t) => t.role === "student").map((t) => t.text);
  if (!student.some(thinking)) return false;
  const later = turns.slice(last + 1).filter((t) => t.role === "student").map((t) => t.text);
  return !isBareGuess(said) || later.some(thinking);
}

/**
 * Whether a tutor reply gives away the final answer: states it after "=" / "answer is" / "that's",
 * confirms it ("36 is right"), names the correct multiple-choice option as the answer, or says "yes"
 * to a bare correct guess in the student's last message. Numbers that already appear in the problem only
 * count when they're called the answer outright. Once the student has worked the answer out themselves
 * (see studentWorkedItOut), saying they're right isn't a give-away. `chat` is the conversation so far (plain
 * strings are taken as student messages).
 */
export function revealsAnswer(reply: string, problem: Problem, chat: string | (string | TutorTurn)[] = []): boolean {
  const turns = (typeof chat === "string" ? [chat] : chat)
    .map((t): TutorTurn => (typeof t === "string" ? { role: "student", text: t } : t))
    .filter((t) => t.text.trim());
  if (studentWorkedItOut(problem, turns)) return false;
  const lastStudentMessage = [...turns].reverse().find((t) => t.role === "student")?.text ?? "";
  const r = normalize(reply);
  const promptText = problem.prompt + (problem.visual ? "\n" + describeVisual(problem.visual) : "");
  const a = problem.answer;
  switch (a.kind) {
    case "number": {
      const forms = numberForms(a.value, a.tolerance);
      const inProblem = containsValue(promptText, toNum(a.value), a.tolerance ?? 1e-9);
      if (numberLeak(r, forms, inProblem)) return true;
      return guessConfirmed(r, lastStudentMessage, (s) => containsValue(s, toNum(a.value), a.tolerance ?? 1e-9));
    }
    case "point": {
      const pt = `(${a.x},${a.y})`;
      const flat = r.replace(/\s/g, "");
      const inProblem = normalize(promptText).replace(/\s/g, "").includes(pt);
      if (!inProblem && flat.includes(pt)) return true;
      if (new RegExp(`${STRONG_LEAD}\\(\\s*${a.x}\\s*,\\s*${a.y}\\s*\\)`).test(r)) return true;
      return guessConfirmed(r, lastStudentMessage, (s) => normalize(s).replace(/\s/g, "").includes(pt));
    }
    case "multi": {
      const full = normalize(answerText(a)).replace(/\s/g, "");
      const flat = r.replace(/\s/g, "");
      const inProblem = normalize(promptText).replace(/\s/g, "").includes(full);
      if (!inProblem && flat.includes(full)) return true;
      const first = numberForms(a.fields[0].value, a.fields[0].tolerance);
      if (a.fields.length === 1 && numberLeak(r, first, true)) return true;
      if (new RegExp(`${STRONG_LEAD}${esc(normalize(answerText(a)))}`).test(r)) return true;
      return guessConfirmed(r, lastStudentMessage, (s) => normalize(s).replace(/\s/g, "").includes(full));
    }
    case "choice": {
      const k = a.correct + 1;
      const text = normalize(a.choices[a.correct]).replace(/[.!]+$/, "");
      const label = String.raw`(?:choice|option|number|answer|button|#)\s*#?\s*${k}\b`;
      const pickLead = String.raw`(?:answer|correct one|right one|correct choice|right choice|best choice|best answer|correct option|right option|pick|choose|go with|click|select)\b`;
      if (new RegExp(`${pickLead}[^.!?]{0,25}?${label}`).test(r)) return true;
      if (new RegExp(`${label}${CONFIRM_AFTER}`).test(r)) return true;
      if (text.length > 0) {
        const t = esc(text);
        if (new RegExp(`${pickLead}[^.!?]{0,25}?["“']?${t}`).test(r)) return true;
        if (new RegExp(`${t}["”']?${CONFIRM_AFTER}`).test(r)) return true;
      }
      // A choice with math in it ("4 : 8", "3x + 6") is given away just by writing it, unless the problem shows it too.
      if (/\d/.test(text) && /[^\d.\/\s-]/.test(text) && !normalize(promptText).includes(text) && new RegExp(`(?<![\\w.])${esc(text)}(?![\\w])`).test(r)) return true;
      if (text.length > 3 && new RegExp(`\\w\\s+(?:is|are|would be|=)\\s+(?:the\\s+)?["“']?${esc(text)}`).test(r)) return true;
      // A numeric choice like "12" can also be given away by doing the last computation.
      const asNum = text.match(/^-?\d+(?:\.\d+)?(?:\/\d+)?$/) ? tokenValue(text) : NaN;
      if (!Number.isNaN(asNum) && numberLeak(r, [text], containsValue(promptText, asNum))) return true;
      return guessConfirmed(r, lastStudentMessage, (s) => {
        const m = normalize(s);
        const saysNumber = new RegExp(`^\\D*\\b${k}\\b\\D*$`).test(m);
        return saysNumber || (text.length > 2 && m.includes(text));
      });
    }
    case "expr": {
      const reply = mathCanon(r);
      const prompt = mathCanon(promptText);
      const forms = exprForms(a);
      const res = forms.map(exprPattern);
      // An optional "y =" / "f(x) =" between "the answer is" and the expression.
      const lhs = String.raw`(?:[a-z](?:\([a-z]\))?\s*=\s*)?`;
      if (res.some((re) => new RegExp(`${STRONG_LEAD}${lhs}${re}`).test(reply))) return true;
      const numeric = forms.filter((f) => /^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(f));
      if (numeric.length) {
        // A plain number ("x = 5") is checked like a number answer, so "subtract 5" isn't flagged.
        const value = tokenValue(numeric[0]);
        if (numberLeak(reply, numeric, containsValue(promptText, value))) return true;
        return guessConfirmed(r, lastStudentMessage, (s) => containsValue(s, value));
      }
      const anyIn = (text: string) => res.some((re) => new RegExp(re).test(text));
      if (!anyIn(prompt) && anyIn(reply)) return true;
      return guessConfirmed(r, lastStudentMessage, (s) => anyIn(mathCanon(s)));
    }
  }
}

/** Math text in one spelling: √ → sqrt, π → pi, ² → ^2, implied multiplication, √(2) → sqrt2. Keeps the spacing. */
function mathCanon(text: string): string {
  return normalize(text)
    .replace(/[×·∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√/g, "sqrt")
    .replace(/∛/g, "cbrt")
    .replace(/π/g, "pi")
    .replace(/[[{]/g, "(")
    .replace(/[\]}]/g, ")")
    .replace(/\s*\*\s*(?=[a-z(])/g, "")
    .replace(/(sqrt|cbrt)\s*\(\s*([a-z0-9.]+)\s*\)/g, "$1$2");
}

/** The ways the answer expression is likely to be written, without spaces (with and without the "y =", pre and post text). */
function exprForms(a: Extract<Problem["answer"], { kind: "expr" }>): string[] {
  const raw = [a.display, prettyExpr(a.value), a.value, answerText(a)];
  const forms = new Set<string>();
  for (const f of raw) if (f) forms.add(mathCanon(f).replace(/\s+/g, ""));
  forms.delete("");
  return [...forms];
}

/** A regex source matching one compact form in spaced text, standing on its own (not part of a longer expression). */
function exprPattern(form: string): string {
  const body = [...form].map(esc).join(String.raw`\s*`);
  const before = String.raw`(?<![a-z0-9._^])(?<![a-z0-9)]\s*[-+*/^]\s*)`;
  const after = String.raw`(?![a-z0-9(_^]|\.\d)(?!\s*[-+*/^]\s*[a-z0-9(])`;
  return `${before}${body}${after}`;
}

function guessConfirmed(reply: string, lastStudent: string, guessedRight: (s: string) => boolean): boolean {
  if (!lastStudent.trim() || !guessedRight(lastStudent)) return false;
  return AFFIRM.test(reply);
}

// ---------- Usage ----------

/** Messages the student sent to the tutor on this day (chats are dated when they start). */
export function tutorUsedToday(chats: TutorChat[], day: string): number {
  let count = 0;
  for (const c of chats) if (c.date === day) for (const m of c.messages) if (m.role === "student") count++;
  return count;
}

// ---------- Asking Claude ----------

export interface TutorRequest {
  apiKey: string;
  model: string;
  problem: Problem;
  wrongAnswers: string[];
  hintsShown: number;
  /** The conversation so far, ending with the student's new message. */
  turns: TutorTurn[];
}

export interface TutorReply {
  text: string;
  /** How many drafts were thrown away for giving the answer away (0–2). */
  leaks: number;
  error?: string;
  /** The underlying reason, shown to grown-ups under "Details". */
  detail?: string;
}

/** Gets the tutor's next reply, re-asking once if it gives the answer away. Loads the SDK on first use; never throws. */
export async function askTutor(req: TutorRequest): Promise<TutorReply> {
  let mod: typeof import("./tutor-claude");
  try {
    mod = await import("./tutor-claude");
  } catch {
    return { text: "", leaks: 0, error: ERROR_TEXT, detail: "The tutor's code couldn't load (offline, or the app was just updated: reload the page)." };
  }
  const messages = buildMessages(tutorContext(req.problem, req.wrongAnswers, req.hintsShown), req.turns);
  let leaks = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    let text: string;
    try {
      text = (await mod.tutorReply(req.apiKey, req.model, attempt ? TUTOR_SYSTEM + RETRY_NOTE : TUTOR_SYSTEM, messages)).trim();
    } catch (e) {
      const detail = mod.errorDetail(e);
      console.error("Tutor call failed:", detail);
      return { text: "", leaks, error: mod.describeTutorError(e), detail };
    }
    if (text && !revealsAnswer(text, req.problem, req.turns)) return { text, leaks };
    leaks++;
  }
  return { text: SAFE_FALLBACK, leaks };
}
