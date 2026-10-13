// Units and skills for this course. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import composeInverse from "./compose-inverse";
import transformations from "./transformations";

const topics: Topic[] = [
  { id: "pc-compose-inverse", course: "pc", unit: 1, strand: "algebra", family: "functions", title: "Composition & Inverses", standards: "PC.F.5.1–F.5.7", blurb: "Chain functions together, take them apart, and undo them.", icon: "∘" },
  { id: "pc-transformations", course: "pc", unit: 2, strand: "algebra", family: "functions", title: "Transformations & Piecewise Functions", standards: "PC.F.4.7, PC.F.5.2", blurb: "Shift, stretch and flip power functions, and read functions built from pieces.", icon: "↔" },
];
const skills: Skill[] = [...composeInverse, ...transformations];

const content: CourseContent = { topics, skills };
export default content;
