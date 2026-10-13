// NC Math 2: units in teaching order (Open Up NC order: transformations and geometry first,
// then quadratics, variation and square-root functions, and probability). One file per unit.
import type { CourseContent, Skill, Topic } from "../types";
import challenges from "./challenges";
import transformations from "./transformations";
import congruence from "./congruence";
import similarity from "./similarity";
import trig from "./trig";
import radicals from "./radicals";
import quadFns from "./quadratic-functions";
import quadEqs from "./quadratic-equations";
import systems from "./systems";
import variation from "./variation";
import probability from "./probability";

const topics: Topic[] = [
  { id: "m2-transformations", course: "m2", unit: 1, strand: "geo-stats", family: "geometry", title: "Transformations & Symmetry", standards: "G-CO.2–5, F-IF.1–2", blurb: "Slide, flip and turn figures on the plane, write transformations as functions, and find symmetry.", icon: "transform" },
  { id: "m2-congruence", course: "m2", unit: 2, strand: "geo-stats", family: "geometry", title: "Congruence & Proof", standards: "G-CO.6–10", blurb: "Use rigid motions and SSS, SAS, ASA, AAS and HL to prove triangles congruent, and reason with angle and triangle theorems.", icon: "proof" },
  { id: "m2-similarity", course: "m2", unit: 3, strand: "geo-stats", family: "geometry", title: "Dilations & Similarity", standards: "G-SRT.1–4", blurb: "Dilate figures, use scale factors, prove triangles similar with AA, and split sides proportionally.", icon: "similar" },
  { id: "m2-trig", course: "m2", unit: 4, strand: "geo-stats", family: "trig", title: "Right-Triangle Trigonometry", standards: "G-SRT.6, 8, 12", blurb: "Use the Pythagorean theorem, SOH CAH TOA and special right triangles to solve real triangles.", icon: "triangle" },
  { id: "m2-radicals", course: "m2", unit: 5, strand: "algebra", family: "number", title: "Radicals, Exponents & i", standards: "N-RN.1–3, N-CN.1", blurb: "Connect roots to fractional exponents, simplify and combine radicals, sort rational from irrational, and meet i.", icon: "root" },
  { id: "m2-quadratic-functions", course: "m2", unit: 6, strand: "algebra", family: "functions", title: "Quadratic Functions", standards: "A-APR.1, A-SSE.3, F-IF.4, 7, 8, F-BF.1, 3", blurb: "Operate on polynomials, read parabolas, complete the square, find maximums, and transform graphs.", icon: "parabola" },
  { id: "m2-quadratic-equations", course: "m2", unit: 7, strand: "algebra", family: "algebra", title: "Solving Quadratic Equations", standards: "A-REI.1, 4, 4a, 4b, A-CED.1", blurb: "Solve any quadratic with square roots, completing the square or the formula, including non-real solutions.", icon: "equation" },
  { id: "m2-systems", course: "m2", unit: 8, strand: "algebra", family: "functions", title: "Systems & Comparing Functions", standards: "A-REI.7, A-CED.3, F-IF.9", blurb: "Find where lines meet parabolas, model situations with systems, and compare functions shown in different ways.", icon: "intersect" },
  { id: "m2-variation", course: "m2", unit: 9, strand: "algebra", family: "functions", title: "Square-Root & Inverse Variation", standards: "A-REI.2, 11, A-CED.1–2, F-IF.7, F-BF.1, 3", blurb: "Model with y = k/x and square roots, graph and shift them, and solve equations while catching extraneous answers.", icon: "curve" },
  { id: "m2-probability", course: "m2", unit: 10, strand: "geo-stats", family: "stats", title: "Probability", standards: "S-CP.1, 3–8, S-IC.2", blurb: "Work with events and two-way tables, conditional probability, independence, the addition and multiplication rules, and simulations.", icon: "dice" },
];
const skills: Skill[] = [...transformations, ...congruence, ...similarity, ...trig, ...radicals, ...quadFns, ...quadEqs, ...systems, ...variation, ...probability];

const content: CourseContent = { topics, skills, challenges };
export default content;
