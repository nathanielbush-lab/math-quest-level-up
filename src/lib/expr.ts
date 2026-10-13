// A small, safe math-expression reader for typed algebra answers ("(x+2)(x-3)", "3√2", "2^(x+1)").
// Two expressions count as the same answer when they agree at many sample values of their variables.

export type Node =
  | { t: "num"; v: number; decimal: boolean }
  | { t: "var"; name: string }
  | { t: "const"; name: "pi" | "e" }
  | { t: "neg"; a: Node }
  | { t: "add"; a: Node; b: Node }
  | { t: "sub"; a: Node; b: Node }
  | { t: "mul"; a: Node; b: Node }
  | { t: "div"; a: Node; b: Node }
  | { t: "pow"; a: Node; b: Node }
  | { t: "fn"; name: string; a: Node; base?: Node };

const FUNCS = ["sqrt", "cbrt", "abs", "sin", "cos", "tan", "ln", "log", "exp"];

type Tok = { k: "num"; v: number; decimal: boolean } | { k: "id"; v: string } | { k: "op"; v: string };

export class ExprError extends Error {}

/** Turns typed math into a standard form: true minus signs, ×, ÷, superscripts, √. */
export function normalizeInput(s: string): string {
  return s
    .replace(/[−–—]/g, "-")
    .replace(/[×·∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\*\*/g, "^")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/∛/g, "cbrt")
    .replace(/[\[{]/g, "(")
    .replace(/[\]}]/g, ")")
    .trim();
}

function tokenize(src: string): Tok[] {
  const s = normalizeInput(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const text = s.slice(i, j);
      if ((text.match(/\./g) ?? []).length > 1 || text === ".") throw new ExprError(`I couldn't read the number “${text}”.`);
      out.push({ k: "num", v: Number(text), decimal: text.includes(".") });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      const fn = FUNCS.find((f) => s.startsWith(f, i)) ?? (s.startsWith("pi", i) ? "pi" : undefined);
      if (fn) { out.push({ k: "id", v: fn }); i += fn.length; continue; }
      out.push({ k: "id", v: c });
      i++;
      continue;
    }
    if ("+-*/^()|_,".includes(c)) { out.push({ k: "op", v: c }); i++; continue; }
    throw new ExprError(`I don't know what “${c}” means here.`);
  }
  return out;
}

class Parser {
  i = 0;
  absDepth = 0;
  constructor(private toks: Tok[], private vars: Set<string>) {}
  peek(): Tok | undefined { return this.toks[this.i]; }
  isOp(v: string) { const t = this.peek(); return t?.k === "op" && t.v === v; }
  eat(v: string) {
    if (!this.isOp(v)) throw new ExprError(v === ")" ? "A parenthesis is missing a partner." : `Expected “${v}”.`);
    this.i++;
  }
  parse(): Node {
    if (!this.toks.length) throw new ExprError("Type an answer first.");
    const n = this.sum();
    if (this.i < this.toks.length) {
      const t = this.toks[this.i];
      throw new ExprError(t.k === "op" && t.v === ")" ? "There's an extra closing parenthesis." : "Part of that didn't make sense to me. Check for a missing operation sign.");
    }
    return n;
  }
  sum(): Node {
    let n = this.product();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.toks[this.i++] as { v: string }).v;
      const b = this.product();
      n = op === "+" ? { t: "add", a: n, b } : { t: "sub", a: n, b };
    }
    return n;
  }
  startsPrimary(): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.k === "num" || t.k === "id") return true;
    if (t.k === "op" && t.v === "(") return true;
    if (t.k === "op" && t.v === "|") return this.absDepth === 0;
    return false;
  }
  product(): Node {
    let n = this.unary();
    for (;;) {
      if (this.isOp("*") || this.isOp("/")) {
        const op = (this.toks[this.i++] as { v: string }).v;
        const b = this.unary();
        n = op === "*" ? { t: "mul", a: n, b } : { t: "div", a: n, b };
      } else if (this.startsPrimary()) {
        n = { t: "mul", a: n, b: this.power() };
      } else break;
    }
    return n;
  }
  unary(): Node {
    if (this.isOp("-")) { this.i++; return { t: "neg", a: this.unary() }; }
    if (this.isOp("+")) { this.i++; return this.unary(); }
    return this.power();
  }
  power(): Node {
    const base = this.primary();
    if (this.isOp("^")) {
      this.i++;
      return { t: "pow", a: base, b: this.unary() };
    }
    return base;
  }
  primary(): Node {
    const t = this.peek();
    if (!t) throw new ExprError("Something is missing at the end.");
    if (t.k === "num") { this.i++; return { t: "num", v: t.v, decimal: t.decimal }; }
    if (t.k === "op" && t.v === "(") {
      this.i++;
      const n = this.sum();
      this.eat(")");
      return n;
    }
    if (t.k === "op" && t.v === "|") {
      this.i++;
      this.absDepth++;
      const n = this.sum();
      this.absDepth--;
      this.eat("|");
      return { t: "fn", name: "abs", a: n };
    }
    if (t.k === "id") {
      this.i++;
      if (t.v === "pi") return { t: "const", name: "pi" };
      if (FUNCS.includes(t.v)) {
        let base: Node | undefined;
        if (t.v === "log" && this.isOp("_")) {
          this.i++;
          base = this.primary();
        }
        // sqrt(x), sqrt x, sin x, and powers like sin^2 x are not supported; parentheses are clearest.
        const a = this.isOp("(") ? this.primary() : this.power();
        return { t: "fn", name: t.v, a, base };
      }
      if (t.v === "e" && !this.vars.has("e")) return { t: "const", name: "e" };
      if (!this.vars.has(t.v)) throw new ExprError(this.vars.size ? `“${t.v}” isn't a variable in this problem. Use ${[...this.vars].join(", ")}.` : `This answer is a number, so “${t.v}” doesn't belong.`);
      return { t: "var", name: t.v };
    }
    throw new ExprError(t.v === ")" ? "There's an extra closing parenthesis." : `“${t.v}” needs something before or after it.`);
  }
}

/** Reads an expression. `vars` are the letters allowed (e.g. ["x"]). Throws ExprError with a friendly message. */
export function parseExpr(src: string, vars: string[] = ["x"]): Node {
  return new Parser(tokenize(src), new Set(vars)).parse();
}

export function evalExpr(n: Node, env: Record<string, number>): number {
  switch (n.t) {
    case "num": return n.v;
    case "var": return env[n.name] ?? NaN;
    case "const": return n.name === "pi" ? Math.PI : Math.E;
    case "neg": return -evalExpr(n.a, env);
    case "add": return evalExpr(n.a, env) + evalExpr(n.b, env);
    case "sub": return evalExpr(n.a, env) - evalExpr(n.b, env);
    case "mul": return evalExpr(n.a, env) * evalExpr(n.b, env);
    case "div": return evalExpr(n.a, env) / evalExpr(n.b, env);
    case "pow": {
      const a = evalExpr(n.a, env), b = evalExpr(n.b, env);
      // Odd roots of negatives: (−8)^(1/3) = −2.
      if (a < 0 && !Number.isInteger(b)) {
        const inv = 1 / b;
        if (Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-a, b);
      }
      return Math.pow(a, b);
    }
    case "fn": {
      const a = evalExpr(n.a, env);
      switch (n.name) {
        case "sqrt": return Math.sqrt(a);
        case "cbrt": return Math.cbrt(a);
        case "abs": return Math.abs(a);
        case "sin": return Math.sin(a);
        case "cos": return Math.cos(a);
        case "tan": return Math.tan(a);
        case "ln": return Math.log(a);
        case "exp": return Math.exp(a);
        case "log": return n.base ? Math.log(a) / Math.log(evalExpr(n.base, env)) : Math.log10(a);
      }
      return NaN;
    }
  }
}

/** Evaluates expression text at the given variable values (NaN if it can't be read). */
export function evaluate(src: string, env: Record<string, number> = {}): number {
  try {
    return evalExpr(parseExpr(src, Object.keys(env)), env);
  } catch {
    return NaN;
  }
}

const close = (a: number, b: number, rel = 1e-7) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/** Deterministic sample values, avoiding small integers where many expressions are special. */
const SAMPLES = [0.37, -1.29, 2.71, -2.43, 1.618, 3.14, -0.81, 0.93, 4.2, -3.57, 1.07, 2.2];

/** Do the two expressions agree everywhere they're both defined (checked at sample points)? */
export function equivalent(a: Node, b: Node, vars: string[]): boolean {
  if (!vars.length) {
    const x = evalExpr(a, {}), y = evalExpr(b, {});
    return Number.isFinite(x) && Number.isFinite(y) && close(x, y, 1e-9);
  }
  let agree = 0;
  for (let k = 0; k < SAMPLES.length; k++) {
    const env: Record<string, number> = {};
    vars.forEach((v, j) => { env[v] = SAMPLES[(k + j * 5) % SAMPLES.length] * (j % 2 ? -1 : 1) + j * 0.11; });
    const x = evalExpr(a, env), y = evalExpr(b, env);
    const fx = Number.isFinite(x), fy = Number.isFinite(y);
    if (!fx && !fy) continue;
    if (fx !== fy) return false;
    if (!close(x, y)) return false;
    agree++;
  }
  return agree >= 4;
}

// ---------- Form checks ----------

const hasVar = (n: Node): boolean => {
  switch (n.t) {
    case "var": return true;
    case "num": case "const": return false;
    case "neg": return hasVar(n.a);
    case "fn": return hasVar(n.a) || (n.base ? hasVar(n.base) : false);
    default: return hasVar(n.a) || hasVar(n.b);
  }
};
const isSum = (n: Node) => n.t === "add" || n.t === "sub";

function factorsOf(n: Node): Node[] {
  if (n.t === "neg") return factorsOf(n.a);
  if (n.t === "mul") return [...factorsOf(n.a), ...factorsOf(n.b)];
  return [n];
}

/** A product (or power) at the top level, with at least one factor holding the variable. */
export function isFactored(n: Node): boolean {
  if (isSum(n)) return false;
  const fs = factorsOf(n);
  const withVar = fs.filter(hasVar);
  if (!withVar.length) return true;
  if (fs.length === 1) return n.t === "pow" || (n.t === "neg" && n.a.t === "pow") || !isSum(fs[0]);
  return true;
}

/** No parentheses left to multiply out: no (sum)·something and no (sum)^n. */
export function isExpanded(n: Node): boolean {
  switch (n.t) {
    case "num": case "var": case "const": return true;
    case "neg": return isExpanded(n.a) && !isSum(n.a);
    case "add": case "sub": return isExpanded(n.a) && isExpanded(n.b);
    case "mul": return !(isSum(n.a) && hasVar(n.a)) && !(isSum(n.b) && hasVar(n.b)) && !(isSum(n.a) || isSum(n.b)) && isExpanded(n.a) && isExpanded(n.b);
    case "div": return isExpanded(n.a) && isExpanded(n.b);
    case "pow": return !(isSum(n.a) && hasVar(n.a)) && isExpanded(n.a);
    case "fn": return true;
  }
}

/** Vertex form a(x − h)² + k: the variable appears only inside one squared binomial. */
export function isVertexForm(n: Node, v = "x"): boolean {
  const squares: Node[] = [];
  const walk = (m: Node, insideSquare: boolean): boolean => {
    if (m.t === "pow" && isSum(m.a) && m.b.t === "num" && m.b.v === 2 && hasVar(m.a)) {
      squares.push(m);
      return true;
    }
    if (m.t === "var") return insideSquare || m.name !== v;
    if (m.t === "num" || m.t === "const") return true;
    if (m.t === "neg") return walk(m.a, insideSquare);
    if (m.t === "fn") return walk(m.a, insideSquare);
    return walk(m.a, insideSquare) && walk(m.b, insideSquare);
  };
  return walk(n, false) && squares.length === 1;
}

/** Did the student type a decimal (rather than an exact value like √2 or π)? */
export function usesDecimal(n: Node): boolean {
  switch (n.t) {
    case "num": return n.decimal;
    case "var": case "const": return false;
    case "neg": return usesDecimal(n.a);
    case "fn": return usesDecimal(n.a);
    default: return usesDecimal(n.a) || usesDecimal(n.b);
  }
}

/** Display markup for MathText: x^2 → superscript, sqrt( → √(, pi → π, implied multiplication. */
export function prettyExpr(src: string): string {
  return normalizeInput(src)
    .replace(/\s+/g, "")
    .replace(/sqrt/g, "√")
    .replace(/cbrt/g, "∛")
    .replace(/pi/g, "π")
    .replace(/(\d)\*(?=[a-zA-Zπ√(])/g, "$1")
    .replace(/\)\*\(/g, ")(")
    .replace(/\*/g, "·")
    .replace(/\^\(([^()]+)\)/g, "^($1)")
    .replace(/(?<=[^\s(^])([+\-=<>])(?=\S)/g, " $1 ")
    .replace(/^-/, "−")
    .replace(/ - /g, " − ")
    .replace(/\(-/g, "(−")
    .replace(/\^-/g, "^−");
}
