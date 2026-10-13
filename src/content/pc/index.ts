// Units and skills for this course. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import composeInverse from "./compose-inverse";
import transformations from "./transformations";
import rational from "./rational";

const topics: Topic[] = [
  { id: "pc-compose-inverse", course: "pc", unit: 1, strand: "algebra", family: "functions", title: "Composition & Inverses", standards: "PC.F.5.1–F.5.7", blurb: "Chain functions together, take them apart, and undo them.", icon: "∘" },
  { id: "pc-transformations", course: "pc", unit: 2, strand: "algebra", family: "functions", title: "Transformations & Piecewise Functions", standards: "PC.F.4.7, PC.F.5.2", blurb: "Shift, stretch and flip power functions, and read functions built from pieces.", icon: "↔" },
  { id: "pc-rational", course: "pc", unit: 3, strand: "algebra", family: "functions", title: "Polynomial & Rational Functions", standards: "PC.F.4.5–F.4.6, PC.A.1.1–A.1.2", blurb: "Asymptotes, holes, sign charts and the best possible box.", icon: "÷" },
];
const skills: Skill[] = [...composeInverse, ...transformations, ...rational];

const content: CourseContent = { topics, skills };
export default content;
