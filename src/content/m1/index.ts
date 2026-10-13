// Units and skills for NC Math 1, in the CMS teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import oneVarStats from "./stats-one-variable";

const topics: Topic[] = [
  { id: "m1-one-var-stats", course: "m1", unit: 1, strand: "geo-stats", family: "stats", title: "One-Variable Statistics", standards: "NC.M1.S-ID.1–3", blurb: "Histograms, box plots, center, spread and outliers.", icon: "chart" },
];
const skills: Skill[] = [...oneVarStats];

const content: CourseContent = { topics, skills };
export default content;
