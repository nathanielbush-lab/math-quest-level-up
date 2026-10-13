// NC Math 3: units in teaching order. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import functions from "./functions";
import explog from "./explog";

const topics: Topic[] = [
  { id: "m3-functions", course: "m3", unit: 1, strand: "algebra", family: "functions", title: "Functions and Inverses", standards: "NC.M3.F-BF.3–4, F-IF.2, F-IF.7", blurb: "Piecewise and absolute value functions, transformations, and inverse functions.", icon: "f⁻¹" },
  { id: "m3-explog", course: "m3", unit: 2, strand: "algebra", family: "functions", title: "Exponential and Logarithmic Functions", standards: "NC.M3.F-LE.3–4, F-BF.4a, A-SSE.3", blurb: "Build exponential models, rewrite rates, and use logarithms to solve for exponents.", icon: "log" },
];
const skills: Skill[] = [...functions, ...explog];

const content: CourseContent = { topics, skills };
export default content;
