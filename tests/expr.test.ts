import { describe, expect, it } from "vitest";
import { equivalent, evaluate, isExpanded, isFactored, isVertexForm, parseExpr, prettyExpr, usesDecimal } from "../src/lib/expr";

const eqv = (a: string, b: string, vars = ["x"]) => equivalent(parseExpr(a, vars), parseExpr(b, vars), vars);

describe("expression reader", () => {
  it("reads typical typed answers", () => {
    expect(evaluate("2x+3", { x: 4 })).toBe(11);
    expect(evaluate("3(x-1)^2", { x: 3 })).toBe(12);
    expect(evaluate("-x^2", { x: 3 })).toBe(-9);
    expect(evaluate("2^-1")).toBe(0.5);
    expect(evaluate("√16")).toBe(4);
    expect(evaluate("3√2")).toBeCloseTo(4.2426, 4);
    expect(evaluate("sqrt(2)*sqrt(8)")).toBeCloseTo(4, 9);
    expect(evaluate("|x-5|", { x: 2 })).toBe(3);
    expect(evaluate("2|x|+1", { x: -3 })).toBe(7);
    expect(evaluate("x²+1", { x: 2 })).toBe(5);
    expect(evaluate("2π")).toBeCloseTo(6.2832, 4);
    expect(evaluate("log_2(8)")).toBeCloseTo(3, 9);
    expect(evaluate("ln(e^2)")).toBeCloseTo(2, 9);
    expect(evaluate("(−8)^(1/3)")).toBeCloseTo(-2, 9);
    expect(evaluate("x(x+1)", { x: 3 })).toBe(12);
    expect(evaluate("(x+1)(x-1)", { x: 3 })).toBe(8);
    expect(evaluate("xy", { x: 2, y: 5 })).toBe(10);
    expect(evaluate("1/2x", { x: 4 })).toBe(2);
  });
  it("gives friendly errors", () => {
    expect(() => parseExpr("2x+", ["x"])).toThrow();
    expect(() => parseExpr("(x+1", ["x"])).toThrow(/parenthesis/);
    expect(() => parseExpr("2y", ["x"])).toThrow(/isn't a variable/);
    expect(() => parseExpr("", ["x"])).toThrow();
  });
  it("compares expressions by value", () => {
    expect(eqv("(x+2)(x+3)", "x^2+5x+6")).toBe(true);
    expect(eqv("(x+2)(x+3)", "x^2+6x+5")).toBe(false);
    expect(eqv("2(x-1)", "2x-2")).toBe(true);
    expect(eqv("sqrt(x^2)", "|x|")).toBe(true);
    expect(eqv("x/x", "1")).toBe(true);
    expect(eqv("3√2", "√18", [])).toBe(true);
    expect(eqv("4.24", "√18", [])).toBe(false);
    expect(eqv("a^2-b^2", "(a-b)(a+b)", ["a", "b"])).toBe(true);
  });
  it("checks forms", () => {
    expect(isFactored(parseExpr("(x+2)(x+3)"))).toBe(true);
    expect(isFactored(parseExpr("2(x-1)(x+4)"))).toBe(true);
    expect(isFactored(parseExpr("x^2+5x+6"))).toBe(false);
    expect(isFactored(parseExpr("-(x-1)^2"))).toBe(true);
    expect(isExpanded(parseExpr("x^2+5x+6"))).toBe(true);
    expect(isExpanded(parseExpr("x(x+5)+6"))).toBe(false);
    expect(isExpanded(parseExpr("(x+1)^2"))).toBe(false);
    expect(isExpanded(parseExpr("3x^2-2x"))).toBe(true);
    expect(isVertexForm(parseExpr("2(x-3)^2+1"))).toBe(true);
    expect(isVertexForm(parseExpr("-(x+1)^2-4"))).toBe(true);
    expect(isVertexForm(parseExpr("2x^2-12x+19"))).toBe(false);
    expect(usesDecimal(parseExpr("4.24", []))).toBe(true);
    expect(usesDecimal(parseExpr("3√2", []))).toBe(false);
  });
  it("pretty-prints for display", () => {
    expect(prettyExpr("x^2+5*x-6")).toBe("x^2 + 5x − 6");
    expect(prettyExpr("3*sqrt(2)")).toBe("3√(2)");
    expect(prettyExpr("(x+1)*(x-2)")).toBe("(x + 1)(x − 2)");
  });
});
