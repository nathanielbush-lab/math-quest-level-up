import { eq, fmtFrac, parseNumber, toNum, type Frac } from "../lib/rational";
import type { Answer, Problem } from "../content/types";
import { ExprError, equivalent, evalExpr, isExpanded, isFactored, isVertexForm, normalizeInput, parseExpr, prettyExpr, usesDecimal } from "../lib/expr";

export type Verdict = "correct" | "wrong" | "almost" | "invalid";

export interface CheckResult {
  verdict: Verdict;
  message?: string;
}

export type Response =
  | { kind: "number"; text: string }
  | { kind: "multi"; texts: string[] }
  | { kind: "choice"; index: number }
  | { kind: "expr"; text: string }
  | { kind: "point"; x: number; y: number };

const UNREADABLE = "I couldn't read that as a number. Try something like 12, −3, 0.75, 3/4 or 1 1/2.";

function matches(value: Frac, target: Frac, tolerance?: number): boolean {
  if (tolerance !== undefined) return Math.abs(toNum(value) - toNum(target)) <= tolerance + 1e-9;
  return eq(value, target);
}

export function check(problem: Problem, response: Response): CheckResult {
  const a = problem.answer;
  switch (a.kind) {
    case "number": {
      if (response.kind !== "number") return { verdict: "invalid" };
      const p = parseNumber(response.text);
      if (!p) return { verdict: "invalid", message: UNREADABLE };
      if (matches(p.value, a.value, a.tolerance)) {
        if (a.simplest && p.typedFraction && !p.simplest) {
          return { verdict: "almost", message: "That's the right amount! Can you write it in simplest form?" };
        }
        return { verdict: "correct" };
      }
      const t = problem.traps?.find((tr) => matches(p.value, tr.value, a.tolerance));
      return { verdict: "wrong", message: t?.feedback };
    }
    case "multi": {
      if (response.kind !== "multi") return { verdict: "invalid" };
      const parsed = response.texts.map(parseNumber);
      if (parsed.some((p) => !p)) return { verdict: "invalid", message: UNREADABLE };
      const vals = parsed.map((p) => p!.value);
      const free = new Set(a.anyOrder ?? []);
      let ok = a.fields.every((f, i) => free.has(i) || matches(vals[i], f.value, f.tolerance));
      if (ok && free.size) {
        const want = [...free].map((i) => a.fields[i]);
        const got = [...free].map((i) => vals[i]);
        ok = want.every((f) => {
          const k = got.findIndex((g) => matches(g, f.value, f.tolerance));
          if (k < 0) return false;
          got.splice(k, 1);
          return true;
        });
      }
      return { verdict: ok ? "correct" : "wrong" };
    }
    case "choice": {
      if (response.kind !== "choice") return { verdict: "invalid" };
      if (response.index === a.correct) return { verdict: "correct" };
      return { verdict: "wrong", message: a.feedback?.[response.index] };
    }
    case "expr":
      if (response.kind !== "expr") return { verdict: "invalid" };
      return checkExpr(a, response.text);
    case "point": {
      if (response.kind !== "point") return { verdict: "invalid" };
      if (response.x === a.x && response.y === a.y) return { verdict: "correct" };
      if (response.x === a.y && response.y === a.x) return { verdict: "wrong", message: "Close! You swapped x and y. The x-coordinate (left/right) comes first." };
      return { verdict: "wrong" };
    }
  }
}

const FORM_NAMES = { factored: "factored form", expanded: "expanded (standard) form", vertex: "vertex form, a(x − h)^2 + k" } as const;

/** Strips a leading "y =" / "f(x) =" when the answer allows it. */
function stripLhs(text: string, lhs?: string): string {
  const t = normalizeInput(text);
  const k = t.indexOf("=");
  if (k < 0) return t;
  // Compare without spaces, underscores or subscript parentheses, so "an =", "a_n =" and "a_(n) =" all match "a_n".
  const squash = (x: string) => x.replace(/[\s_]+/g, "").replace(/\(([a-z0-9+\-]+)\)$/i, "$1");
  const left = squash(t.slice(0, k));
  const want = squash(lhs ?? "");
  if (lhs && left === want) return t.slice(k + 1);
  // "x = 5" for a one-variable value, or "y = …" when no lhs was set: accept a lone letter on the left.
  if (/^[a-zA-Z]$/.test(left) || (lhs && /^[a-zA-Z]\([a-zA-Z]\)$/.test(left))) return t.slice(k + 1);
  return t;
}

function checkExpr(a: Extract<Answer, { kind: "expr" }>, text: string): CheckResult {
  let got, want;
  try {
    want = parseExpr(a.value, a.vars);
  } catch {
    return { verdict: "invalid", message: "This question's answer couldn't be read." };
  }
  try {
    got = parseExpr(stripLhs(text, a.lhs), a.vars);
  } catch (e) {
    return { verdict: "invalid", message: e instanceof ExprError ? e.message : "I couldn't read that. Use ^ for powers and sqrt( ) for square roots." };
  }
  if (!equivalent(got, want, a.vars)) {
    if (!a.vars.length && usesDecimal(got)) {
      const x = evalOrNaN(got), y = evalOrNaN(want);
      if (Math.abs(x - y) <= 0.01 * Math.max(1, Math.abs(y))) return { verdict: a.exact === false ? "correct" : "almost", message: a.exact === false ? undefined : "That's the right value as a decimal. Can you give the exact answer (with √ or π)?" };
    }
    return { verdict: "wrong" };
  }
  if (a.form === "factored" && !isFactored(got)) return { verdict: "almost", message: `That's equal to the answer, but the question asks for ${FORM_NAMES.factored}.` };
  if (a.form === "expanded" && !isExpanded(got)) return { verdict: "almost", message: `That's equal to the answer, but multiply it out into ${FORM_NAMES.expanded}.` };
  if (a.form === "vertex" && !isVertexForm(got, a.vars[0] ?? "x")) return { verdict: "almost", message: `That's equal to the answer, but write it in ${FORM_NAMES.vertex}.` };
  if (!a.vars.length && a.exact !== false && usesDecimal(got) && !usesDecimal(want)) return { verdict: "almost", message: "That's the right value as a decimal. Can you give the exact answer (with √ or π)?" };
  return { verdict: "correct" };
}

function evalOrNaN(n: ReturnType<typeof parseExpr>): number {
  return evalExpr(n, {});
}

/** The right answer as plain text, for showing after a miss and for tests. */
export function answerText(a: Answer): string {
  switch (a.kind) {
    case "number": {
      const v = fmtNum(a.value, a.tolerance, a.simplest);
      if (a.pre === "$") {
        const m = Number.isInteger(toNum(a.value)) ? v : Math.abs(toNum(a.value)).toFixed(2);
        return toNum(a.value) < 0 ? `−$${m.replace("-", "")}` : `$${m}`;
      }
      return `${a.pre ?? ""}${v.replace(/^-/, "−")}${a.unit ?? ""}`;
    }
    case "multi":
      return a.fields
        .map((f) => {
          let v = fmtNum(f.value, f.tolerance).replace(/^-/, "−");
          let pre = f.pre ?? "";
          if (pre === "+" && v.startsWith("−")) {
            pre = "−";
            v = v.slice(1);
          }
          const sep = !pre || pre.endsWith("(") || pre.endsWith("^") ? "" : " ";
          return `${pre}${sep}${v}${f.post ?? ""}`;
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    case "choice":
      return a.choices[a.correct];
    case "expr":
      return `${a.lhs ? `${a.lhs} = ` : ""}${a.pre ?? ""}${a.display ?? prettyExpr(a.value)}${a.post ?? ""}`;
    case "point":
      return `(${a.x}, ${a.y})`.replace(/-/g, "−");
  }
}

/** Fractions stay fractions when simplest form was asked for; otherwise terminating values show as decimals. */
function fmtNum(v: Frac, tolerance?: number, preferFraction = false): string {
  if (tolerance !== undefined || v.d === 1) return String(Number(toNum(v).toFixed(4)));
  let d = v.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d === 1 && !preferFraction) return String(Number(toNum(v).toFixed(6)));
  // High school writes improper fractions (4/3), not mixed numbers (1 1/3).
  return fmtFrac(v, false);
}

/** A response that should always be marked correct (used by tests). */
export function canonicalResponse(a: Answer): Response {
  switch (a.kind) {
    case "number":
      return { kind: "number", text: fmtFrac(a.value) };
    case "multi":
      return { kind: "multi", texts: a.fields.map((f) => fmtFrac(f.value)) };
    case "choice":
      return { kind: "choice", index: a.correct };
    case "expr":
      return { kind: "expr", text: a.value };
    case "point":
      return { kind: "point", x: a.x, y: a.y };
  }
}
