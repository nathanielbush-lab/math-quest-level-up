// Units and skills for NC Math 1, in the CMS teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import oneVarStats from "./stats-one-variable";
import equations from "./equations";
import coordGeometry from "./coordinate-geometry";
import systems from "./systems";
import twoVarStats from "./stats-two-variable";
import functions from "./functions";
import linExp from "./linear-exponential";
import quadratics from "./quadratics";
import sequences from "./sequences";
import challenges from "./challenges";

const topics: Topic[] = [
  { id: "m1-one-var-stats", course: "m1", unit: 1, strand: "geo-stats", family: "stats", title: "One-Variable Statistics", standards: "NC.M1.S-ID.1–3", blurb: "Histograms, box plots, center, spread and outliers.", icon: "chart" },
  { id: "m1-equations", course: "m1", unit: 2, strand: "algebra", family: "algebra", title: "Linear Equations & Inequalities", standards: "NC.M1.A-SSE.1, A-REI.1–3, A-CED.1, 4", blurb: "Read expressions, solve and justify equations and inequalities, and rearrange formulas.", icon: "scale" },
  { id: "m1-coord-geometry", course: "m1", unit: 3, strand: "geo-stats", family: "geometry", title: "Coordinate Geometry", standards: "NC.M1.G-GPE.4–6", blurb: "Slope, distance and midpoints; parallel and perpendicular lines; measuring and classifying figures on the plane.", icon: "grid" },
  { id: "m1-systems", course: "m1", unit: 4, strand: "algebra", family: "algebra", title: "Lines & Systems", standards: "NC.M1.A-CED.2–4, A-REI.5, 6, 10, 12", blurb: "Graph lines, solve systems by graphing, substitution and elimination, and graph inequalities.", icon: "cross" },
  { id: "m1-two-var-stats", course: "m1", unit: 5, strand: "geo-stats", family: "stats", title: "Two-Variable Statistics", standards: "NC.M1.S-ID.6–9", blurb: "Scatter plots, regression lines, residuals, correlation and causation.", icon: "scatter" },
  { id: "m1-functions", course: "m1", unit: 6, strand: "algebra", family: "functions", title: "Functions", standards: "NC.M1.F-IF.1, 2, 4–7, 9, A-REI.11", blurb: "Function notation, key features, domain and range, rates of change, and comparing functions.", icon: "function" },
  { id: "m1-lin-exp", course: "m1", unit: 7, strand: "algebra", family: "functions", title: "Linear & Exponential Functions", standards: "NC.M1.N-RN.2, F-LE.1, 3, 5, F-IF.8b, F-BF.1", blurb: "Exponent rules, building and comparing linear and exponential models, growth and decay.", icon: "growth" },
  { id: "m1-quadratics", course: "m1", unit: 8, strand: "algebra", family: "algebra", title: "Quadratic Functions & Equations", standards: "NC.M1.A-APR.1, 3, A-SSE.3, A-REI.4, F-IF.8a", blurb: "Polynomial arithmetic, factoring, solving quadratics, and reading parabolas.", icon: "parabola" },
  { id: "m1-sequences", course: "m1", unit: 9, strand: "algebra", family: "functions", title: "Sequences & Building Functions", standards: "NC.M1.F-IF.3, F-BF.1, 1a, 1b, 2", blurb: "Arithmetic and geometric sequences, recursive and explicit rules, and combining functions.", icon: "sequence" },
];
const skills: Skill[] = [...oneVarStats, ...equations, ...coordGeometry, ...systems, ...twoVarStats, ...functions, ...linExp, ...quadratics, ...sequences];

const content: CourseContent = { topics, skills, challenges };
export default content;
