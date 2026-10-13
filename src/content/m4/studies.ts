// Unit 7: Statistical investigations: questions, sampling, bias, experiments, large data sets and media graphs (NC.M4.SP.1).
import { choice, num } from "../helpers";
import { st } from "../steps";
import type { Skill, Visual } from "../types";
import { PEOPLE, dec, rnd, tolTraps } from "./util";

const T = "m4-studies";

// ---------- Statistical questions ----------

const STAT_Q = [
  "How many hours of sleep do students at our school usually get on school nights?",
  "What is the typical price of a used gaming console listed online in our area this month?",
  "How long are the songs on this week's Top 100 chart?",
  "How much do teens in our county spend on streaming services each month?",
  "Do students who play a school sport have different GPAs than students who don't?",
  "How far do students at our school live from campus?",
  "How many minutes per day do juniors at our school spend on social media?",
];
const NONSTAT_Q = [
  "How many hours did Maya sleep last night?",
  "What is the list price of one specific phone model at one store today?",
  "How long is the song that is #1 on the chart this week?",
  "How many students are in Mr. Lee's first-period class?",
  "What time does our school day start?",
  "How tall is the tallest building in Charlotte?",
  "What was the final score of last Friday's football game?",
];
const POSED: { goal: string; good: string; bad: [string, string][] }[] = [
  { goal: "whether juniors at your school get enough sleep", good: "What is the typical number of hours of sleep that juniors at our school get on school nights?", bad: [["Do you get enough sleep?", "That's a survey question for one person, and \"enough\" is vague; it doesn't describe a population or a measurable variable."], ["How many hours did you sleep last night?", "That's one person's answer, not a question about a group with variability."], ["Is sleep important for teenagers?", "That's an opinion question; it doesn't name data you could collect."]] },
  { goal: "how much students use their phones during the school day", good: "How many minutes do students at our school use their phones during a typical school day?", bad: [["Do phones distract students?", "\"Distract\" isn't measured, and no population or variable is named."], ["How many minutes did I use my phone today?", "That's one value for one person: there's no variability to study."], ["Should phones be banned at school?", "That's an opinion or policy question, not a statistical one."]] },
  { goal: "whether a new energy drink affects reaction time", good: "Do people who drink the energy drink have faster average reaction times than people who drink water?", bad: [["Are energy drinks bad for you?", "\"Bad\" isn't a measurable variable, and there's no comparison."], ["What was my reaction time after drinking one?", "One person's single measurement can't show a difference between groups."], ["Do people like energy drinks?", "That asks about preference, not reaction time."]] },
];

const questions: Skill = {
  id: "m4.study.questions",
  title: "Pose statistical questions",
  topic: T,
  standards: ["NC.M4.SP.1.1"],
  prereqs: [],
  lesson: {
    bigIdea: "A statistical question expects variability in the answers and is answered with data from a group, not a single fact.",
    explain: [
      "\"How many hours did Maya sleep last night?\" has one answer. \"How many hours do students at our school usually sleep?\" expects many different answers, so it's statistical.",
      "A good investigative question names the **population** (students at our school), the **variable** (hours of sleep on school nights) and what you want to know about it (typical value, comparison, relationship).",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why is \"What time does school start?\" not a statistical question?", choices: ["It has one fixed answer with no variability.", "Because it's about school.", "Because times can't be data."], correct: 0, explain: "Statistics is about variability; a single fact doesn't vary." },
    { kind: "written", prompt: "Turn \"Do teens like music?\" into a good statistical question you could actually investigate.", keyIdeas: ["name a specific population", "name a measurable variable (like hours of music per week)", "the answers should vary"], exemplar: "\"How many hours per week do students at our high school spend listening to music?\" It names the population (students at our school), a measurable variable (hours per week), and the answers will vary from student to student." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const p = r.pick(POSED);
      return {
        prompt: `You want to investigate ${p.goal}. Which is the best statistical question to guide the investigation?`,
        answer: choice(r, p.good, p.bad),
        hints: ["A good statistical question names a population and a measurable variable.", "The answers to it should vary, and you should be able to collect data on it."],
        steps: [st("Check each option.", "Look for a named group, a measurable variable, and expected variability."), st("Answer.", p.good)],
      };
    }
    const wantStat = lv === 1;
    const correct = wantStat ? r.pick(STAT_Q) : r.pick(NONSTAT_Q);
    const wrong = r.shuffle(wantStat ? NONSTAT_Q : STAT_Q).slice(0, 3).map((q) => [q, wantStat ? "That has a single answer, so there's no variability to study." : "That expects many different answers from a group, so it IS statistical."] as [string, string]);
    return {
      prompt: wantStat ? "Which of these is a statistical question?" : "Which of these is NOT a statistical question?",
      answer: choice(r, correct, wrong),
      hints: ["Ask: would collecting data give many different answers?", "A question about a single person, event or fixed fact isn't statistical."],
      steps: [st("Test each question.", "Statistical questions anticipate variability in the data."), st("Answer.", `"${correct}" ${wantStat ? "anticipates many different answers" : "has one fixed answer"}.`)],
    };
  },
};

// ---------- Sampling methods ----------

const METHODS: Record<string, string> = {
  srs: "Simple random sample",
  stratified: "Stratified random sample",
  cluster: "Cluster sample",
  systematic: "Systematic sample",
  convenience: "Convenience sample",
  voluntary: "Voluntary response sample",
};
const POPS = [
  { pop: "the 1,600 students at a high school", groups: "grade (9–12)", cluster: "8 of the 64 homerooms", line: "students entering the cafeteria", list: "the school roster" },
  { pop: "the 2,400 residents of an apartment complex", groups: "building (A through F)", cluster: "5 of the 40 floors", line: "residents walking through the main lobby", list: "the leasing office's list of residents" },
  { pop: "the 900 employees of a theme park", groups: "department (rides, food, games, maintenance)", cluster: "6 of the 30 work crews", line: "employees clocking in at the gate", list: "the payroll list" },
  { pop: "the 5,000 members of a gym chain", groups: "membership level (basic, plus, premium)", cluster: "3 of the 15 gym locations", line: "members checking in at the front desk", list: "the membership database" },
];
function sampleScene(method: string, P: (typeof POPS)[number], name: string): string {
  switch (method) {
    case "srs": return `${name} numbers everyone on ${P.list} and uses a random number generator to choose 100 of them.`;
    case "stratified": return `${name} separates ${P.pop} by ${P.groups} and randomly selects 25 people from each group.`;
    case "cluster": return `${name} randomly selects ${P.cluster} and surveys every person in them.`;
    case "systematic": return `${name} picks a random number from 1 to 15, then surveys that person and every 15th person among the ${P.line}.`;
    case "convenience": return `${name} surveys the first 60 ${P.line} one morning.`;
    default: return `${name} posts an online link and uses the responses from whoever chooses to answer.`;
  }
}

const sampling: Skill = {
  id: "m4.study.sampling",
  title: "Sampling methods",
  topic: T,
  standards: ["NC.M4.SP.1.2"],
  prereqs: ["m4.study.questions"],
  lesson: {
    bigIdea: "How you choose a sample decides whether it represents the population. Random methods avoid favoritism; convenience and voluntary samples usually don't.",
    explain: [
      "**Simple random sample (SRS):** every group of n people is equally likely (number everyone, use a random number generator). **Stratified:** split into similar groups (strata) and take an SRS from each, which guarantees every group is represented.",
      "**Cluster:** randomly pick whole groups (clusters, like homerooms) and survey everyone in them; quick and cheap. **Systematic:** random start, then every kth person.",
      "**Convenience** (whoever is easy to reach) and **voluntary response** (people choose to answer) are not random and are often biased.",
    ],
    tip: "Strata are groups that are different from each other (grades). Clusters are groups that each look like a mini-population (homerooms).",
  },
  why: [
    { kind: "choice", prompt: "Why might a principal choose a stratified sample by grade instead of a simple random sample?", choices: ["It guarantees each grade is represented, which matters if opinions differ by grade.", "It's always cheaper than any other method.", "It avoids using random numbers."], correct: 0, explain: "An SRS could, by chance, include very few seniors." },
    { kind: "written", prompt: "Explain why surveying people who walk by a gym's front desk at 6 a.m. might not represent all members.", keyIdeas: ["it's a convenience sample", "early-morning members may differ (schedules, habits) from others", "so results can be biased"], exemplar: "It's a convenience sample. People at the gym at 6 a.m. may have different schedules, workout habits or opinions than members who come at night or rarely, so the results could be biased." },
  ],
  generate(r, lv) {
    const P = r.pick(POPS), name = r.pick(PEOPLE);
    if (lv === 3) {
      const goals: [string, string, [string, string][]][] = [
        [`wants to make sure every ${P.groups.split(" (")[0]} is represented in a survey of ${P.pop}`, "stratified", [["cluster", "Randomly chosen clusters could miss some groups entirely."], ["convenience", "Easy-to-reach people may all come from one group."], ["systematic", "Every kth person doesn't guarantee each group appears."]]],
        [`needs a quick, low-cost random sample of ${P.pop} and can easily reach whole groups at once`, "cluster", [["stratified", "Stratifying means reaching individuals in every group, which is more work."], ["voluntary", "Volunteers aren't a random sample."], ["srs", "An SRS is random but means tracking down scattered individuals."]]],
        [`wants every possible sample of 100 people from ${P.pop} to be equally likely`, "srs", [["stratified", "Stratifying forces a fixed number from each group, so some samples are impossible."], ["systematic", "Systematic samples only include people k apart in the list."], ["cluster", "Clusters keep groups together, so many samples are impossible."]]],
      ];
      const [goal, ans, wrong] = r.pick(goals);
      return {
        prompt: `${name} ${goal}. Which sampling method fits best?`,
        answer: choice(r, METHODS[ans], wrong.map(([m, f]) => [METHODS[m], f] as [string, string])),
        hints: ["Think about what each method guarantees.", "Stratified guarantees each group; cluster is fast; SRS makes every sample equally likely."],
        steps: [st("Match the goal to the method.", `${METHODS[ans]}: ${ans === "stratified" ? "an SRS within each group guarantees every group appears." : ans === "cluster" ? "randomly pick whole groups and survey everyone in them." : "number everyone and pick at random."}`)],
      };
    }
    const pool = lv === 1 ? ["srs", "stratified", "cluster", "convenience"] : ["srs", "stratified", "cluster", "systematic", "convenience", "voluntary"];
    const m = r.pick(pool);
    const others = r.shuffle(Object.keys(METHODS).filter((k) => k !== m)).slice(0, 3);
    const desc: Record<string, string> = {
      srs: "everyone had an equal chance, chosen individually at random",
      stratified: "the population was split into groups and a random sample was taken from each group",
      cluster: "whole groups were chosen at random and everyone in them was surveyed",
      systematic: "a random start, then every kth person",
      convenience: "the people were simply the easiest to reach",
      voluntary: "people chose for themselves whether to respond",
    };
    return {
      prompt: `To study ${P.pop}: ${sampleScene(m, P, name)} What kind of sample is this?`,
      answer: choice(r, METHODS[m], others.map((o) => [METHODS[o], `In a ${METHODS[o].toLowerCase()}, ${desc[o]}.`] as [string, string])),
      hints: ["Was chance used? If so, was it used on individuals, on groups, or within groups?", "Within every group → stratified. Whole groups → cluster. Every kth → systematic."],
      steps: [st("How were people chosen?", desc[m][0].toUpperCase() + desc[m].slice(1) + "."), st("Answer.", METHODS[m])],
    };
  },
};

// ---------- Bias ----------

const BIAS: { scene: string; type: string; effect: string }[] = [
  { scene: "A city surveys residents about a new bus line by calling landline phone numbers only.", type: "Undercoverage", effect: "Younger residents, who rarely have landlines and ride buses more, are left out." },
  { scene: "A school emails a 40-question survey to all 1,500 families; only 210 respond.", type: "Nonresponse", effect: "The 86% who didn't respond may have different views from those who did." },
  { scene: "A survey asks, \"Don't you agree that the unfair new phone policy should be dropped?\"", type: "Response bias (wording)", effect: "The loaded word \"unfair\" pushes people toward agreeing." },
  { scene: "A radio host asks listeners to text in whether they support a new stadium.", type: "Voluntary response", effect: "People with strong opinions are the ones who bother to text." },
  { scene: "A teacher asks students, face to face, whether they cheated on homework this year.", type: "Response bias (sensitive question)", effect: "Students may not answer honestly about cheating in person." },
  { scene: "A survey about online gaming habits is posted only on a gaming forum.", type: "Undercoverage", effect: "People who don't use the forum, including non-gamers, have no chance to be included." },
  { scene: "A gym mails a satisfaction survey to members; mostly members who are angry about a fee increase send it back.", type: "Nonresponse", effect: "Satisfied members who didn't respond are missing, so satisfaction looks lower than it is." },
];
const BIAS_TYPES = ["Undercoverage", "Nonresponse", "Response bias (wording)", "Voluntary response", "Response bias (sensitive question)"];

const bias: Skill = {
  id: "m4.study.bias",
  title: "Spot bias in surveys",
  topic: T,
  standards: ["NC.M4.SP.1.2"],
  prereqs: ["m4.study.sampling"],
  lesson: {
    bigIdea: "Bias is a systematic tilt in results. A bigger sample doesn't fix it; a better design does.",
    explain: [
      "**Undercoverage:** part of the population can't be chosen (landline-only phone surveys). **Nonresponse:** people chosen don't answer, and they differ from those who do.",
      "**Voluntary response:** people choose to participate, usually those with strong opinions. **Response bias:** the question's wording or the setting pushes people toward certain answers or dishonesty.",
    ],
    tip: "Ask two questions: who was left out, and would the answers be honest and unpushed?",
  },
  why: [
    { kind: "choice", prompt: "A voluntary online poll gets 50,000 responses. Why isn't that enough to trust it?", choices: ["Bias comes from who chose to respond; more biased responses are still biased.", "50,000 is too small for any poll.", "Online polls are always accurate if they're big."], correct: 0, explain: "Sample size reduces random error, not bias." },
    { kind: "written", prompt: "Rewrite the question \"Don't you agree that the cafeteria food is terrible?\" so it isn't biased, and explain the change.", keyIdeas: ["remove loaded words like 'terrible' and leading phrases like 'don't you agree'", "neutral wording such as a rating scale", "so responses reflect real opinions"], exemplar: "\"How would you rate the cafeteria food: poor, fair, good or excellent?\" The original leads people toward agreeing and uses the loaded word \"terrible.\" A neutral rating question lets people give their real opinion." },
  ],
  generate(r, lv) {
    const b = r.pick(BIAS);
    if (lv < 3) {
      const wrong = r.shuffle(BIAS_TYPES.filter((t) => t !== b.type && !(t.startsWith("Response") && b.type.startsWith("Response")))).slice(0, 3);
      return {
        prompt: `${b.scene} Which kind of bias is the biggest concern?`,
        answer: choice(r, b.type, wrong),
        hints: ["Who might be left out, who chose to answer, and is the question worded or asked in a way that pushes answers?", b.type.startsWith("Response") ? "Focus on how the question is asked." : "Focus on who ends up in the data."],
        steps: [st("Identify the problem.", b.effect), st("Name it.", b.type)],
      };
    }
    const effects = BIAS.filter((x) => x !== b).map((x) => x.effect);
    return {
      prompt: `${b.scene} Which statement best explains how this design could bias the results?`,
      answer: choice(r, b.effect, r.shuffle(effects).slice(0, 2).concat(["The sample is too small to be useful."]).map((e) => [e, e.includes("too small") ? "Bias is about who is in the sample and how they answer, not just size." : "That describes a different study."] as [string, string])),
      hints: ["Think about who is missing or how the answers could be pushed.", `This is ${b.type.toLowerCase()}.`],
      steps: [st("Type of bias.", b.type), st("Effect.", b.effect)],
    };
  },
};

// ---------- Experiments ----------

const STUDIES = [
  { scene: "Researchers randomly assign 120 volunteers to drink either a caffeinated or a decaf soda, then time how fast they react to a light.", kind: "experiment", expl: "type of soda (caffeinated or decaf)", resp: "reaction time" },
  { scene: "A student surveys 200 classmates about how many hours they game per week and their GPA.", kind: "observational study", expl: "hours of gaming per week", resp: "GPA" },
  { scene: "A coach randomly assigns 40 runners to a new stretching routine or their usual warm-up and records each runner's 400 m time.", kind: "experiment", expl: "warm-up routine", resp: "400 m time" },
  { scene: "Doctors review the records of 5,000 patients and compare heart health for people who did and didn't report drinking coffee.", kind: "observational study", expl: "coffee drinking", resp: "heart health" },
  { scene: "A teacher randomly assigns half of her 60 students to use flashcards and half to use a practice app, then compares quiz scores.", kind: "experiment", expl: "study method (flashcards or app)", resp: "quiz score" },
  { scene: "A researcher records how many minutes 300 teens spend on social media and their self-reported sleep quality.", kind: "observational study", expl: "minutes on social media", resp: "sleep quality" },
];
const DESIGN_Q: [string, string, [string, string][]][] = [
  ["Why is random assignment important in an experiment?", "It makes the groups similar in every way except the treatment, so differences in the response can be blamed on the treatment.", [["It guarantees the sample represents the whole population.", "That's random sampling. Random assignment is about making the groups comparable."], ["It makes the experiment cheaper.", "Random assignment is about fair comparison, not cost."], ["It lets researchers choose the healthiest people for the treatment.", "That would bias the comparison; random assignment prevents it."]]],
  ["Why do experiments often give the control group a placebo?", "So both groups believe they're treated, which separates the treatment's effect from the placebo effect.", [["Because the control group doesn't need to be measured.", "The control group is measured just like the treatment group."], ["To make the control group's results worse.", "A placebo isn't meant to change results; it controls for expectations."], ["Because placebos are cheaper than real treatments.", "Cost isn't the reason."]]],
  ["An observational study finds that teens who sleep more have higher GPAs. Why can't we conclude that more sleep causes higher GPAs?", "Other variables (confounders) like study habits or stress could affect both sleep and GPA.", [["Because the sample was too large.", "Size isn't the issue; the design can't rule out other explanations."], ["Because GPA can't be measured accurately.", "GPA is measurable; the problem is lurking variables."], ["We can conclude it, since the pattern is strong.", "A strong association still isn't evidence of causation without random assignment."]]],
  ["What is the purpose of a double-blind design?", "Neither the subjects nor the people measuring the response know who got which treatment, so expectations can't bias the results.", [["Only the researchers know who got the treatment, so they can pick who improves.", "That would let researcher bias in."], ["The subjects are randomly sampled from two populations.", "That's about sampling, not blinding."], ["The experiment is repeated twice.", "That's replication, not blinding."]]],
];

const experiments: Skill = {
  id: "m4.study.experiments",
  title: "Design comparative experiments",
  topic: T,
  standards: ["NC.M4.SP.1.2"],
  prereqs: ["m4.study.sampling"],
  lesson: {
    bigIdea: "In an experiment the researcher assigns treatments; in an observational study they just record what happens. Only a randomized experiment can show cause and effect.",
    explain: [
      "Parts of an experiment: the **explanatory variable** (what you change), the **treatments** (its values), the **response variable** (what you measure), and a **control group** for comparison.",
      "**Random assignment** makes the groups alike except for the treatment. **Blinding** keeps expectations from affecting results. **Replication** (enough subjects) lets you see real differences through the noise.",
      "Observational studies can show associations, but lurking (confounding) variables might explain them.",
    ],
  },
  why: [
    { kind: "choice", prompt: "Why can a randomized experiment show causation when an observational study can't?", choices: ["Random assignment balances other variables across groups, so the treatment is the main difference.", "Experiments always use bigger samples.", "Observational studies don't collect data."], correct: 0, explain: "Without random assignment, confounders could cause the difference." },
    { kind: "written", prompt: "Design a simple experiment to test whether listening to music while studying affects quiz scores. Name the treatments, the response, and how you'd assign them.", keyIdeas: ["treatments: music vs. no music (control)", "response: quiz score", "randomly assign volunteers to the two groups; same material and quiz for both"], exemplar: "Get 60 volunteers and randomly assign 30 to study with music and 30 to study in silence (control), using the same material and time. Then give everyone the same quiz. The response is the quiz score; compare the group averages." },
  ],
  generate(r, lv) {
    if (lv === 3) {
      const [q, ans, wrong] = r.pick(DESIGN_Q);
      return {
        prompt: q,
        answer: choice(r, ans, wrong),
        hints: ["Think about what could make the two groups different besides the treatment.", "Random assignment, control groups and blinding all exist to make a fair comparison."],
        steps: [st("Key idea.", ans)],
      };
    }
    const s = r.pick(STUDIES);
    if (lv === 1) {
      const other = s.kind === "experiment" ? "observational study" : "experiment";
      return {
        prompt: `${s.scene} Is this an experiment or an observational study?`,
        answer: choice(r, s.kind === "experiment" ? "Experiment: the researchers assigned the treatments." : "Observational study: the researchers only recorded existing behavior.", [
          [s.kind === "experiment" ? "Observational study: the researchers only recorded existing behavior." : "Experiment: the researchers assigned the treatments.", s.kind === "experiment" ? "The treatments were randomly assigned, so it's an experiment." : `Nobody was assigned to a ${s.expl}; it was just recorded.`],
          [`Neither: it's a census.`, "A census measures the whole population; this study uses a sample."],
          [`Both: it's an ${other} and a survey.`, "Ask one question: did the researchers impose a treatment?"],
        ]),
        hints: ["Did the researchers impose a treatment on the subjects?", "Assigned treatments → experiment. Just observing or asking → observational study."],
        steps: [st("Ask: was a treatment imposed?", s.kind === "experiment" ? `Yes: subjects were assigned a ${s.expl}.` : `No: the ${s.expl} was just recorded.`), st("Answer.", s.kind)],
      };
    }
    const askResp = r.chance(0.5);
    const correct = askResp ? s.resp : s.expl;
    const others = STUDIES.filter((x) => x !== s).flatMap((x) => [x.resp, x.expl]);
    return {
      prompt: `${s.scene} What is the ${askResp ? "response" : "explanatory"} variable?`,
      answer: choice(r, correct, [[askResp ? s.expl : s.resp, askResp ? "That's the explanatory variable (what differs between groups)." : "That's the response variable (what's measured)."], ...r.shuffle(others).slice(0, 2).map((o) => [o, "That variable isn't part of this study."] as [string, string])]),
      hints: ["The explanatory variable is what's changed or compared; the response is what's measured as the outcome.", `Here the outcome being measured is ${s.resp}.`],
      steps: [st("Explanatory variable.", s.expl), st("Response variable.", s.resp)],
    };
  },
};

// ---------- Large data sets ----------

const COLS = [
  { name: "grade", type: "categorical", sample: ["10", "12", "9", "11"] },
  { name: "screen time (min/day)", type: "quantitative", sample: ["312", "145", "480", "220"] },
  { name: "phone brand", type: "categorical", sample: ["A", "B", "A", "C"] },
  { name: "commute (miles)", type: "quantitative", sample: ["3.2", "0.8", "11.5", "5.0"] },
  { name: "zip code", type: "categorical", sample: ["27601", "27610", "27601", "27519"] },
  { name: "hours of sleep", type: "quantitative", sample: ["7.5", "6", "8", "5.5"] },
  { name: "plays a sport (Y/N)", type: "categorical", sample: ["Y", "N", "N", "Y"] },
];
const DISPLAY_Q: [string, string, [string, string][]][] = [
  ["compare screen time (min/day) across the four grades", "Side-by-side box plots of screen time, one for each grade, with medians and IQRs", [["A pie chart of grade", "A pie chart shows one categorical variable; it can't compare a quantitative variable across groups."], ["A scatterplot of grade vs. screen time", "Grade is categorical, so a scatterplot doesn't make sense."], ["A two-way table of grade and phone brand", "That doesn't involve screen time at all."]]],
  ["see whether commute distance is related to hours of sleep", "A scatterplot of commute (miles) vs. hours of sleep, with the correlation r", [["Side-by-side box plots of commute distance by zip code", "That doesn't involve sleep."], ["A bar chart of the mean hours of sleep", "One bar can't show a relationship between two quantitative variables."], ["A two-way table of commute and sleep", "Two-way tables are for two categorical variables."]]],
  ["see whether playing a sport is related to phone brand", "A two-way table of sport (Y/N) by phone brand, with conditional percentages", [["A scatterplot of sport vs. phone brand", "Both are categorical, so there are no numbers to plot."], ["A histogram of phone brand", "Histograms are for quantitative data."], ["The mean and standard deviation of phone brand", "You can't average a categorical variable."]]],
  ["describe the distribution of hours of sleep for all 260 students", "A histogram of hours of sleep, with the median and IQR (or mean and SD if roughly symmetric)", [["A pie chart of hours of sleep", "Pie charts are for categories, not a quantitative variable with many values."], ["A two-way table of hours of sleep", "Two-way tables need two categorical variables."], ["The most common zip code", "That's a different variable."]]],
];

const largeData: Skill = {
  id: "m4.study.large-data",
  title: "Organize large data sets",
  topic: T,
  standards: ["NC.M4.SP.1.3"],
  prereqs: ["m4.study.questions"],
  lesson: {
    bigIdea: "With a big data set (hundreds of rows and several variables), first sort out each variable's type, then pick summaries and displays that match the question.",
    explain: [
      "**Categorical** variables put individuals in groups (grade, brand, zip code, Y/N). **Quantitative** variables are measured numbers you can average (minutes, miles, hours). A zip code is a number but categorical: averaging zip codes is meaningless.",
      "One quantitative variable: histogram, mean/SD or median/IQR. Quantitative across groups: side-by-side box plots. Two quantitative: scatterplot and correlation. Two categorical: two-way table with conditional percentages.",
      "Technology (a spreadsheet, CODAP or Desmos) makes it practical to sort, filter and graph 250 rows at once.",
    ],
    visual: { type: "table", headers: ["student", "grade", "screen time (min/day)", "phone brand", "hours of sleep"], rows: [[1, 10, 312, "A", 7.5], [2, 12, 145, "B", 6], [3, 9, 480, "A", 8], ["…", "…", "…", "…", "…"], [260, 11, 220, "C", 5.5]], caption: "First rows of a 260-student data set" },
  },
  why: [
    { kind: "choice", prompt: "Why is zip code a categorical variable even though it's written with digits?", choices: ["It labels a place; arithmetic like averaging zip codes has no meaning.", "Because it has five digits.", "It's quantitative because it's a number."], correct: 0, explain: "Ask whether math on the values makes sense." },
    { kind: "written", prompt: "In a two-way table of 260 students, 52 of the 80 athletes and 70 of the 180 non-athletes sleep 8+ hours. Explain why you should compare percentages instead of counts.", keyIdeas: ["the groups have different sizes", "70 > 52 but 70 out of 180 is a smaller share", "65% of athletes vs. about 38.9% of non-athletes"], exemplar: "The groups are different sizes, so counts mislead: 70 is more than 52, but 70 of 180 is only about 38.9%, while 52 of 80 is 65%. Conditional percentages compare the groups fairly." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const wantCat = r.chance(0.5);
      const pick = r.pick(COLS.filter((c) => c.type === (wantCat ? "categorical" : "quantitative")));
      const others = r.shuffle(COLS.filter((c) => c.type !== pick.type)).slice(0, 3);
      const shown = r.shuffle([pick, ...others]);
      return {
        prompt: `A data set of 260 students has the variables shown (first 4 rows). Which variable is ${wantCat ? "categorical" : "quantitative"}?`,
        visual: { type: "table", headers: shown.map((c) => c.name), rows: [0, 1, 2, 3].map((i) => shown.map((c) => c.sample[i])), caption: "First 4 of 260 rows" },
        answer: choice(r, pick.name, others.map((o) => [o.name, `${o.name} is ${o.type}: ${o.type === "categorical" ? "it puts students in groups" : "it's a measured amount you could average"}.`] as [string, string])),
        hints: ["Would it make sense to average the values?", "If averaging makes sense, it's quantitative; if the values are labels or groups, it's categorical."],
        steps: [st("Test each variable.", "Categorical = groups/labels (even if written as numbers). Quantitative = measured amounts."), st("Answer.", `${pick.name} is ${pick.type}.`)],
      };
    }
    if (lv === 2) {
      const [goal, ans, wrong] = r.pick(DISPLAY_Q);
      return {
        prompt: `Using a 260-student data set with variables grade, screen time (min/day), phone brand, commute (miles), zip code, hours of sleep and plays a sport (Y/N), you want to ${goal}. Which summary is most appropriate?`,
        answer: choice(r, ans, wrong),
        hints: ["Identify each variable in the question as categorical or quantitative.", "1 quantitative → histogram; quantitative by groups → box plots; 2 quantitative → scatterplot; 2 categorical → two-way table."],
        steps: [st("Variable types.", "Decide whether each variable involved is categorical or quantitative."), st("Match the display.", ans)],
      };
    }
    const athletes = r.int(70, 120), non = r.int(130, 200);
    const aYes = r.int(Math.round(athletes * 0.4), Math.round(athletes * 0.75)), nYes = r.int(Math.round(non * 0.25), Math.round(non * 0.55));
    const askAth = r.chance(0.5);
    const [num_, den] = askAth ? [aYes, athletes] : [nYes, non];
    const ans = rnd((num_ / den) * 100, 1);
    const total = athletes + non;
    return {
      prompt: `A survey of ${total} students produced the two-way table. What percent of ${askAth ? "athletes" : "non-athletes"} sleep at least 8 hours on school nights? Round to the nearest tenth of a percent.`,
      visual: { type: "table", headers: ["", "8+ hours", "under 8 hours", "total"], rows: [["athlete", aYes, athletes - aYes, athletes], ["non-athlete", nYes, non - nYes, non], ["total", aYes + nYes, total - aYes - nYes, total]] },
      answer: num(ans, { tolerance: 0.05, unit: "%" }),
      hints: [`Condition on the ${askAth ? "athlete" : "non-athlete"} row: use its total as the denominator.`, `${num_} out of ${den}.`],
      steps: [st("Pick the row.", `${askAth ? "Athletes" : "Non-athletes"}: ${num_} of ${den} sleep 8+ hours.`), st("Divide.", `{${num_}/${den}} ≈ ${dec(num_ / den, 4)}`), st("Convert to a percent.", `≈ ${dec(ans, 1)}%`)],
      traps: tolTraps(ans, 0.05, [[rnd((num_ / total) * 100, 1), `That divides by all ${total} students. The question is only about ${askAth ? "athletes" : "non-athletes"}.`], [rnd((num_ / (aYes + nYes)) * 100, 1), "That's the percent of 8+ hour sleepers who are in this group; the question conditions on the group."]]),
    };
  },
};

// ---------- Media graphs ----------

const media: Skill = {
  id: "m4.study.media",
  title: "Read graphs in the media",
  topic: T,
  standards: ["NC.M4.SP.1.4"],
  prereqs: ["m4.study.large-data"],
  lesson: {
    bigIdea: "Graphs in news and science articles can be unusual or misleading. Read the axes, the scale and what is actually being plotted before trusting your first impression.",
    explain: [
      "**Truncated axes:** a y-axis starting at 96 instead of 0 can make a change from 97 to 99 look huge. Compute the actual percent change: (99 − 97) ÷ 97 ≈ 2.1%.",
      "**Unequal bins:** in a histogram with bins of different widths, compare *density* (count ÷ width), not raw bar heights.",
      "**Cumulative graphs:** a cumulative percent graph (ogive) shows the percent of values *at or below* each x. The percent between two values is the difference of their heights.",
    ],
    visual: { type: "plot", xMin: 0, xMax: 60, yMin: 0, yMax: 100, xStep: 10, yStep: 10, curves: [{ expr: "1.5x", domain: [0, 20] }, { expr: "30+2.5(x-20)", domain: [20, 40] }, { expr: "80+(x-40)", domain: [40, 60] }], points: [{ x: 20, y: 30 }, { x: 40, y: 80 }, { x: 60, y: 100 }] },
  },
  why: [
    { kind: "choice", prompt: "Why does a y-axis that starts at 96 exaggerate a change from 97 to 99?", choices: ["The bars' heights above 96 are 1 and 3, so one looks 3 times as big even though the values differ by about 2%.", "Because 99 is more than double 97.", "It doesn't exaggerate anything; axes can start anywhere without effect."], correct: 0, explain: "Visual size compares the parts above the baseline, not the full values." },
    { kind: "written", prompt: "A histogram has a bar for ages 20–40 with 60 people and a bar for ages 40–45 with 30 people. Explain why the 40–45 group is actually more concentrated.", keyIdeas: ["the bins have different widths (20 years vs 5 years)", "density = count ÷ width", "60/20 = 3 per year vs 30/5 = 6 per year"], exemplar: "The 20–40 bin is 20 years wide but 40–45 is only 5. Per year of age, that's 60 ÷ 20 = 3 people versus 30 ÷ 5 = 6 people, so the 40–45 group is twice as concentrated even though its count is smaller." },
  ],
  generate(r, lv) {
    if (lv === 1) {
      const v0 = r.int(90, 96), v1 = rnd(v0 + r.int(10, 30) / 10, 1);
      const thing = r.pick(["percent of homes with internet access", "average daily phone battery health (%)", "graduation rate (%)", "percent of games won by a team over 5 seasons"]);
      const ans = rnd(((v1 - v0) / v0) * 100, 1);
      const vis: Visual = { type: "plot", xMin: 0, xMax: 5, yMin: v0 - 0.5, yMax: v1 + 0.5, xStep: 1, yStep: 0.5, curves: [{ expr: `${v0}+${rnd((v1 - v0) / 5, 3)}x` }], points: [{ x: 0, y: v0, label: String(v0) }, { x: 5, y: v1, label: String(v1) }] };
      return {
        prompt: `A news graph shows the ${thing} rising sharply over 5 years. Notice where the y-axis starts. By what percent did the value actually increase from year 0 to year 5? Round to the nearest tenth of a percent.`,
        visual: vis,
        answer: num(ans, { tolerance: 0.05, unit: "%" }),
        hints: ["The y-axis doesn't start at 0, so the line looks much steeper than the change really is.", `Percent change = (new − old) ÷ old = (${v1} − ${v0}) ÷ ${v0}.`],
        steps: [st("Read the values.", `Year 0: ${v0}. Year 5: ${v1}.`), st("Percent change.", `{${v1} − ${v0}/${v0}} = {${dec(v1 - v0, 1)}/${v0}} ≈ ${dec((v1 - v0) / v0, 4)} ≈ ${dec(ans, 1)}%`), st("Why the graph misleads.", `The axis starts near ${v0 - 0.5}, so a ${dec(ans, 1)}% increase fills the whole picture.`)],
        traps: tolTraps(ans, 0.05, [[rnd(v1 - v0, 1), "That's the change in percentage points. The question asks for the percent increase relative to the starting value."]]),
      };
    }
    if (lv === 2) {
      const edges = r.pick([[13, 18, 25, 35, 45, 65], [10, 20, 25, 30, 40, 60], [0, 5, 10, 20, 30, 50]]);
      const widths = edges.slice(1).map((e, i) => e - edges[i]);
      const dens = widths.map(() => r.int(2, 9));
      let best = dens.indexOf(Math.max(...dens));
      dens.forEach((d, i) => { if (i !== best && d === dens[best]) dens[i] = d - 1; });
      best = dens.indexOf(Math.max(...dens));
      const counts = widths.map((w, i) => w * dens[i]);
      const bins = widths.map((w, i) => ({ from: edges[i], to: edges[i + 1], count: counts[i] }));
      const label = (i: number) => `${edges[i]}–${edges[i + 1]}`;
      const tallest = counts.indexOf(Math.max(...counts));
      return {
        prompt: `A report on ages of people at a music festival uses a histogram with unequal bins; each bar's height is its count. Which age group has the most people per year of age?`,
        visual: { type: "histogram", bins, xLabel: "age (years)", yLabel: "number of people" },
        answer: choice(r, label(best), widths.map((_, i) => i).filter((i) => i !== best).map((i) => [label(i), i === tallest ? "That bar is tallest, but it's also wide. Divide the count by the width." : `That group has ${counts[i]} ÷ ${widths[i]} = ${dens[i]} people per year.`] as [string, string])),
        hints: ["Wide bins collect more people just because they cover more ages.", "Compute count ÷ width for each bin."],
        steps: [st("Density for each bin.", widths.map((w, i) => `${label(i)}: ${counts[i]} ÷ ${w} = ${dens[i]}`).join("; ")), st("Largest density.", `${label(best)} with ${dens[best]} people per year of age.`)],
      };
    }
    const xs = [0, 10, 20, 30, 40, 50];
    const steps_ = [0, ...[r.int(5, 12), r.int(15, 25), r.int(25, 35), r.int(15, 25)].map((v) => v)];
    const cum = steps_.reduce<number[]>((acc, v, i) => (i === 0 ? [0] : [...acc, acc[acc.length - 1] + v]), []);
    cum.push(100);
    const N = r.pick([200, 400, 500, 800]);
    const i1 = r.int(1, 3), i2 = i1 + r.int(1, 5 - i1);
    const ans = ((cum[i2] - cum[i1]) / 100) * N;
    const curves = xs.slice(1).map((x, i) => {
      const m = (cum[i + 1] - cum[i]) / 10;
      return { expr: `${cum[i]}+${m}(x-${xs[i]})`, domain: [xs[i], x] as [number, number] };
    });
    return {
      prompt: `A sports site shows this cumulative percent graph of points scored per game by ${N} players in a league. About how many players scored between ${xs[i1]} and ${xs[i2]} points?`,
      visual: { type: "plot", xMin: 0, xMax: 50, yMin: 0, yMax: 100, xStep: 10, yStep: 10, curves, points: xs.map((x, i) => ({ x, y: cum[i], label: `${cum[i]}%` })) },
      answer: num(ans),
      hints: ["Each point shows the percent of players at or below that score.", `${cum[i2]}% scored at most ${xs[i2]} and ${cum[i1]}% scored at most ${xs[i1]}. Subtract, then take that percent of ${N}.`],
      steps: [st("Read the graph.", `At ${xs[i1]} points: ${cum[i1]}%. At ${xs[i2]} points: ${cum[i2]}%.`), st("Percent between.", `${cum[i2]}% − ${cum[i1]}% = ${cum[i2] - cum[i1]}%`), st("Convert to players.", `${cum[i2] - cum[i1]}% of ${N} = ${dec(ans)} players`)],
      traps: tolTraps(ans, 0, [[(cum[i2] / 100) * N, `That's everyone at or below ${xs[i2]}. Subtract those at or below ${xs[i1]}.`], [cum[i2] - cum[i1], `That's the percent. Convert it to a number of players out of ${N}.`]]),
    };
  },
};

export default [questions, sampling, bias, experiments, largeData, media] satisfies Skill[];
