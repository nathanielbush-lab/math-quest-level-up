// NC Math 3: units in teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import functions from "./functions";
import explog from "./explog";
import polynomials from "./polynomials";
import rational from "./rational";
import modeling from "./modeling";
import trig from "./trig";

const topics: Topic[] = [
  { id: "m3-functions", course: "m3", unit: 1, strand: "algebra", family: "functions", title: "Functions and Inverses", standards: "NC.M3.F-BF.3–4, F-IF.2, F-IF.7", blurb: "Piecewise and absolute value functions, transformations, and inverse functions.", icon: "f⁻¹" },
  { id: "m3-explog", course: "m3", unit: 2, strand: "algebra", family: "functions", title: "Exponential and Logarithmic Functions", standards: "NC.M3.F-LE.3–4, F-BF.4a, A-SSE.3", blurb: "Build exponential models, rewrite rates, and use logarithms to solve for exponents.", icon: "log" },
  { id: "m3-polynomials", course: "m3", unit: 3, strand: "algebra", family: "algebra", title: "Polynomial Functions", standards: "NC.M3.A-APR.2–3, A-APR.6, N-CN.9", blurb: "Graphs, zeros, factoring, division, and the Fundamental Theorem of Algebra.", icon: "x³" },
  { id: "m3-rational", course: "m3", unit: 4, strand: "algebra", family: "algebra", title: "Rational Functions", standards: "NC.M3.A-APR.6–7, A-REI.2, F-IF.7", blurb: "Rational expressions, asymptotes and holes, and equations with extraneous solutions.", icon: "1/x" },
  { id: "m3-modeling", course: "m3", unit: 5, strand: "algebra", family: "functions", title: "Modeling with Equations and Systems", standards: "NC.M3.A-REI.1, A-REI.11, A-CED.3, F-BF.1b", blurb: "Solve f(x) = g(x) with graphs and tables, combine functions, write systems, and justify each step.", icon: "∩" },
  { id: "m3-trig", course: "m3", unit: 6, strand: "algebra", family: "trig", title: "Trigonometric Functions", standards: "NC.M3.F-TF.1–5, F-IF.1", blurb: "Radians, the unit circle, and sine and cosine graphs that model repeating patterns.", icon: "∿" },
];
const skills: Skill[] = [...functions, ...explog, ...polynomials, ...rational, ...modeling, ...trig];

const content: CourseContent = { topics, skills };
export default content;
