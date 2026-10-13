// Units and skills for NC Math 1, in the CMS teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import oneVarStats from "./stats-one-variable";
import equations from "./equations";
import coordGeometry from "./coordinate-geometry";
import systems from "./systems";

const topics: Topic[] = [
  { id: "m1-one-var-stats", course: "m1", unit: 1, strand: "geo-stats", family: "stats", title: "One-Variable Statistics", standards: "NC.M1.S-ID.1–3", blurb: "Histograms, box plots, center, spread and outliers.", icon: "chart" },
  { id: "m1-equations", course: "m1", unit: 2, strand: "algebra", family: "algebra", title: "Linear Equations & Inequalities", standards: "NC.M1.A-SSE.1, A-REI.1–3, A-CED.1, 4", blurb: "Read expressions, solve and justify equations and inequalities, and rearrange formulas.", icon: "scale" },
  { id: "m1-coord-geometry", course: "m1", unit: 3, strand: "geo-stats", family: "geometry", title: "Coordinate Geometry", standards: "NC.M1.G-GPE.4–6", blurb: "Slope, distance and midpoints; parallel and perpendicular lines; measuring and classifying figures on the plane.", icon: "grid" },
  { id: "m1-systems", course: "m1", unit: 4, strand: "algebra", family: "algebra", title: "Lines & Systems", standards: "NC.M1.A-CED.2–4, A-REI.5, 6, 10, 12", blurb: "Graph lines, solve systems by graphing, substitution and elimination, and graph inequalities.", icon: "cross" },
];
const skills: Skill[] = [...oneVarStats, ...equations, ...coordGeometry, ...systems];

const content: CourseContent = { topics, skills };
export default content;
