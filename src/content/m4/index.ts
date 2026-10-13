// Units and skills for NC Math 4. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import functions from "./functions";

const topics: Topic[] = [
  { id: "m4-functions", course: "m4", unit: 1, strand: "algebra", family: "functions", title: "Composition, Inverses & Piecewise", standards: "NC.M4.AF.1, AF.4", blurb: "Chain functions together, undo them, and build rules that change partway.", icon: "fn" },
];
const skills: Skill[] = [...functions];

const content: CourseContent = { topics, skills };
export default content;
