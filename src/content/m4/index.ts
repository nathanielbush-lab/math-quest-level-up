// Units and skills for NC Math 4. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import functions from "./functions";
import logs from "./logs";
import trig from "./trig";
import sinusoids from "./sinusoids";
import regression from "./regression";

const topics: Topic[] = [
  { id: "m4-functions", course: "m4", unit: 1, strand: "algebra", family: "functions", title: "Composition, Inverses & Piecewise", standards: "NC.M4.AF.1, AF.4", blurb: "Chain functions together, undo them, and build rules that change partway.", icon: "fn" },
  { id: "m4-logs", course: "m4", unit: 2, strand: "algebra", family: "functions", title: "Logarithmic Functions", standards: "NC.M4.AF.3", blurb: "Use log properties to solve equations, read log scales, and graph log functions.", icon: "log" },
  { id: "m4-trig", course: "m4", unit: 3, strand: "geo-stats", family: "trig", title: "Trig Identities & Any Triangle", standards: "NC.M4.AF.2.1–2.2", blurb: "Rewrite with identities and solve any triangle with the Laws of Sines and Cosines.", icon: "tri" },
  { id: "m4-sinusoids", course: "m4", unit: 4, strand: "algebra", family: "trig", title: "Sinusoidal Models", standards: "NC.M4.AF.2.3", blurb: "Amplitude, period, shifts and midlines of waves, tides and Ferris wheels.", icon: "wave" },
  { id: "m4-regression", course: "m4", unit: 5, strand: "geo-stats", family: "stats", title: "Regression & Residuals", standards: "NC.M4.AF.5", blurb: "Pick, use and judge nonlinear models with residuals.", icon: "fit" },
];
const skills: Skill[] = [...functions, ...logs, ...trig, ...sinusoids, ...regression];

const content: CourseContent = { topics, skills };
export default content;
