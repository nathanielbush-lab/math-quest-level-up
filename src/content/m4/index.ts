// Units and skills for NC Math 4. Each unit lives in its own file in this folder.
import type { CourseContent, Skill, Topic } from "../types";
import functions from "./functions";
import logs from "./logs";
import trig from "./trig";
import sinusoids from "./sinusoids";
import regression from "./regression";
import number from "./number";
import studies from "./studies";
import distributions from "./distributions";
import normal from "./normal";
import sampling from "./sampling";

const topics: Topic[] = [
  { id: "m4-functions", course: "m4", unit: 1, strand: "algebra", family: "functions", title: "Composition, Inverses & Piecewise", standards: "NC.M4.AF.1, AF.4", blurb: "Chain functions together, undo them, and build rules that change partway.", icon: "fn" },
  { id: "m4-logs", course: "m4", unit: 2, strand: "algebra", family: "functions", title: "Logarithmic Functions", standards: "NC.M4.AF.3", blurb: "Use log properties to solve equations, read log scales, and graph log functions.", icon: "log" },
  { id: "m4-trig", course: "m4", unit: 3, strand: "geo-stats", family: "trig", title: "Trig Identities & Any Triangle", standards: "NC.M4.AF.2.1–2.2", blurb: "Rewrite with identities and solve any triangle with the Laws of Sines and Cosines.", icon: "tri" },
  { id: "m4-sinusoids", course: "m4", unit: 4, strand: "algebra", family: "trig", title: "Sinusoidal Models", standards: "NC.M4.AF.2.3", blurb: "Amplitude, period, shifts and midlines of waves, tides and Ferris wheels.", icon: "wave" },
  { id: "m4-regression", course: "m4", unit: 5, strand: "geo-stats", family: "stats", title: "Regression & Residuals", standards: "NC.M4.AF.5", blurb: "Pick, use and judge nonlinear models with residuals.", icon: "fit" },
  { id: "m4-number", course: "m4", unit: 6, strand: "algebra", family: "number", title: "Complex Numbers, Matrices & Vectors", standards: "NC.M4.N.1–N.2", blurb: "Compute with complex numbers, matrices and vectors.", icon: "i" },
  { id: "m4-studies", course: "m4", unit: 7, strand: "geo-stats", family: "stats", title: "Statistical Studies", standards: "NC.M4.SP.1", blurb: "Ask good questions, sample and experiment fairly, and read data and graphs critically.", icon: "survey" },
  { id: "m4-distributions", course: "m4", unit: 8, strand: "geo-stats", family: "stats", title: "Probability Distributions", standards: "NC.M4.SP.3.1–3.2", blurb: "Expected value for decisions and the binomial distribution.", icon: "dice" },
  { id: "m4-normal", course: "m4", unit: 9, strand: "geo-stats", family: "stats", title: "Normal Distributions", standards: "NC.M4.SP.3.4", blurb: "Use the bell curve, z-scores and percentiles to find probabilities.", icon: "bell" },
  { id: "m4-sampling", course: "m4", unit: 10, strand: "geo-stats", family: "stats", title: "Sampling Distributions", standards: "NC.M4.SP.2.1, SP.3.3", blurb: "Simulate samples and see how sample proportions and means behave.", icon: "sample" },
];
const skills: Skill[] = [...functions, ...logs, ...trig, ...sinusoids, ...regression, ...number, ...studies, ...distributions, ...normal, ...sampling];

const content: CourseContent = { topics, skills };
export default content;
