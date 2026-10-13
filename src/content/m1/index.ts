// Units and skills for NC Math 1, in the CMS teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import oneVarStats from "./stats-one-variable";
import equations from "./equations";

const topics: Topic[] = [
  { id: "m1-one-var-stats", course: "m1", unit: 1, strand: "geo-stats", family: "stats", title: "One-Variable Statistics", standards: "NC.M1.S-ID.1–3", blurb: "Histograms, box plots, center, spread and outliers.", icon: "chart" },
  { id: "m1-equations", course: "m1", unit: 2, strand: "algebra", family: "algebra", title: "Linear Equations & Inequalities", standards: "NC.M1.A-SSE.1, A-REI.1–3, A-CED.1, 4", blurb: "Read expressions, solve and justify equations and inequalities, and rearrange formulas.", icon: "scale" },
];
const skills: Skill[] = [...oneVarStats, ...equations];

const content: CourseContent = { topics, skills };
export default content;
