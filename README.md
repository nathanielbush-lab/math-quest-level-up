# Math Quest: Level Up

An adaptive practice app for North Carolina high-school math: **NC Math 1, Math 2, Math 3, Math 4 and Pre-Calculus**, aligned to the NC Standard Course of Study. It's the high-school sequel to [Math Quest](https://github.com/nathanielbush-lab/math-quest), restyled for teenagers. It teaches each skill, practices it with fresh numbers every time, steps back to building blocks when a student is stuck, brings skills back days later so they stick, and gives practice tests in the format of the state End-of-Course (EOC) tests for Math 1 and Math 3.

Everything runs in the browser. There's no account and no server, and progress is saved on the device being used (or synced through your own Google Sheet, see below).

## Using it

- **Hosted:** the GitHub Pages URL for this repository (see *Hosting* below).
- **Offline file:** `level-up-offline.html` is the whole app in one file. Double-click it to open it in Chrome, Edge or Safari.

### First run
1. Enter the student's name.
2. Pick a course with the **Math 1 · Math 2 · Math 3 · Math 4 · Pre-Calc** switch. New learning comes from that course; reviews keep every course's skills fresh. Switching never loses progress.
3. **Skip what you already know**: short adaptive checks, one unit at a time, so practice starts where the student is.
4. Then **Start run** each session.

### Home
- **Today:** a player card (name, rank, XP toward the next rank), the course switch, **Today's run** (warm-up → main quest → boss level) with one start button and the weekly goal, EOC readiness (or the monthly checkpoint when it's due), the skip-ahead card, Mistake replay, and the next badge.
- **Units:** every unit of the chosen course with its progress bar, plus a key that explains the colors.
- **Badges:** earned badges and how to earn the rest (including one per unit and one per course).
- **Shop:** spend XP on avatars (math symbols and more), accent colors and streak freezes.

### A daily run
| Part | What happens |
|---|---|
| **Warm-up** (~5 min) | Spaced-review questions on skills due for a check, plus old mistakes with fresh numbers |
| **Main quest** (15–20 min) | New skill → lesson with a worked example and a graph or figure → guided problem → practice. Pairs an algebra/functions skill with a geometry/statistics skill |
| **Boss level** (~10 min) | A multi-step problem in context. Sometimes followed by "explain it in your own words" |

### Answers
Students type numbers (12, −3, 0.75, 3/4), choose from options, click points, or **type expressions**: `(x+2)(x-3)`, `2x^2-3x+1`, `3sqrt(2)`, `y = 2x + 1`. Expressions are checked by **mathematical equivalence**, so any correct form counts unless the question asks for a specific one (factored, expanded/standard, vertex form, or an exact value with √ or π). A "reads as" preview shows how the typing was understood, and symbol keys help on phones.

### How the adaptivity works
- **Skill map:** 334 skills in 53 units: Math 1 (9 units, 69 skills), Math 2 (10 units, 65), Math 3 (9 units, 66), Math 4 (12 units, 66) and Pre-Calculus (13 units, 68), plus 28 boss-level challenges. Every skill is tagged with its NC standard codes, and every standard in each course is covered. Each skill lists the skills it depends on, and a skill unlocks only when its prerequisites are solid.
- **Levels:** *Exploring → Practicing → Independent → Can explain & apply*. Independent means right again on a **later day**; *Can explain & apply* adds a "why does it work?" question and a written explanation.
- **Stepping back:** after repeated misses, the app checks the skill's prerequisites, switches to a shaky one if needed, and comes back once it's solid.
- **Never on one mistake:** a single wrong answer never drops a level.
- **Spaced review:** checks at 1, 3, 7, 14, 30 and 60 days.
- **Help:** two tries per question, hints from a nudge to nearly the whole method, feedback that names common mistakes, and step-by-step worked solutions.
- **I'm stuck tutor** (needs an API key): a Claude tutor that asks one guiding question at a time and never gives away the answer.

### XP, ranks, weekly goal and streaks
- XP comes from answers, boss levels, explanations and tests. **Ranks** (Rookie → Apprentice → Solver → Analyst → … → Legend) use all XP ever earned, so spending XP in the shop never lowers a rank.
- **Weekly goal:** runs per week (Monday–Sunday; 4 by default), with a bonus once a week.
- **Streak freezes:** each covers a missed day; one is earned free every 7 days in a row, and more can be bought (at most 2 at a time).

### EOC practice and monthly checkpoints
- **EOC practice** for **NC Math 1** and **NC Math 3** (Math 2 practices toward Math 1; Math 4 and Pre-Calc toward Math 3). Questions are weighted by the state test specifications' domains (Math 1: Number & Algebra ~38%, Functions ~34%, Statistics ~18%, Geometry ~10%; Math 3: Algebra ~34%, Functions ~34%, Geometry ~22%, Statistics ~10%). **Full practice** is 50 questions (the real test's length); **quick practice** is 20. Math 1 practice opens with a calculator-off section like the real test, and a graphing calculator link (Desmos) is available on the rest. One question per screen, no hints, flag-and-come-back, optional timer; results show strongest and weakest units and every missed question with its worked solution. **This is practice in the EOC's format, not real EOC items.**
- **Monthly checkpoint:** one question from each unit of the current course, every 28 days, compared with the last one.
- Tests don't change mastery levels, but missed questions go into Mistake replay.

## Teacher corner (Teacher button, optional PIN)
- **Report:** a weekly report (up to 8 weeks back): runs vs the goal, time, first-try accuracy, hints and tutor use, new levels, a table by skill, items worth a closer look, wins, tests, explanations and tutor chats. Printable, with an optional Claude-written summary that sends only aggregated numbers.
- **Overview, Tracker, Explanations, Mistakes:** progress by unit, dated levels per skill, written explanations to review, and missed questions.
- **Settings:** **Look** (two skins: *Studio*, clean and minimal, which follows **Light / Dark / Match this computer**; and *Night Run*, a dark game look that's always dark; shop accent colors work in both), course end or EOC date for pacing, session length, weekly goal, read-aloud, the Claude API key, the tutor switch and daily limit, sync, and backup.

### Claude features (optional)
Paste an Anthropic API key (from platform.claude.com) in **Settings**. Written explanations are then graded by **Claude Haiku 5.5** (well under a cent each), and the **I'm stuck** tutor is turned on (about a tenth of a cent per message, with a daily limit). Use **Test it** to confirm the key works.
- **Revision rounds:** if an explanation isn't there yet, Claude says what's missing and asks one guiding question, and the student revises. It stops as soon as the explanation is good, and after at most 3 rounds. At the end the student sees how to make it even stronger and a model explanation, or can stop early with **I'm done, show me**. The Teacher corner keeps every draft and the feedback on it.
- The key is stored only in this browser and sent only to Anthropic.
- Create a separate key with a low monthly spend limit, because anyone using the browser could find it.
- Without a key, explanations wait for you in the Teacher corner.

### Sync across computers (Google Sheets)
**Teacher corner → Settings → Sync across computers** walks you through it (about 5 minutes, once):
1. Make a new Google Sheet in your own Google account (sheets.new).
2. **Extensions → Apps Script**, paste the script the app shows you (it contains a random secret), and save.
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Authorize it. Google warns that the app isn't verified because it's your own script; choose **Advanced → Go to … (unsafe) → Allow**. The script can only see that one spreadsheet.
4. Paste the web app URL into Level Up. On every other computer, choose **I have a sync code** and paste the sync code shown on the first computer.

After that, progress saves to the Sheet a few seconds after changes and loads the newest copy when the app opens. It keeps working offline and catches up later. If two computers both changed progress before syncing, the more recent copy wins and the other is kept as a backup on that computer (Settings → Backups). The API key is never synced. Treat the sync code like a password.

### Backup file
**Teacher corner → Settings → Download progress file** saves everything to a file; **Load progress file** restores it (the app warns if the file is older than what's there). Without sync, this is also how to move progress between computers. The API key isn't included.

### Help us tune the app (usage review)
Every answered question is logged on the computer (skill, right or wrong, tries, hints, time, tutor use; no free text). After a week or two of real use, download the progress file and share it in a Claude chat with the request to review how the app is working: where the student struggles, whether difficulty, hints and pacing fit, and what to change. The file contains the student's name and answers, so share it only where you're comfortable.

Level Up stores its progress separately from Math Quest (different storage keys), so both apps can be used in the same browser.

## Hosting on GitHub Pages
The workflow in `.github/workflows/deploy.yml` tests, builds and deploys on every push to `main`. To turn it on: repository **Settings → Pages → Source: GitHub Actions**. Pages needs a public repository on a free plan. Progress never leaves the student's device (unless you set up sync to your own Google Sheet).

## Development
```bash
npm install
npm run dev          # local dev server
npm test             # every generator checked on 750 problems, plus engine, tests, shop, tutor guard, report, sync
npm run build        # static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Code map:
- `src/content/<course>/`: one folder per course (`m1`, `m2`, `m3`, `m4`, `pc`), one file per unit, plus boss-level challenges. `CONTENT_GUIDE.md` explains how to write skills. Standards codes are tagged on every skill, so the map can be updated when NC's new math standards take effect (2028–29).
- `docs/nc-standards.md`: the standards list, EOC test facts and pacing notes the content is built from (with sources and open questions).
- `src/lib/expr.ts`: the expression reader used for typed answers and function graphs.
- `src/engine/`: mastery model, session planner, placement check, answer checking, EOC practice and checkpoints, ranks, saving and import.
- `src/grading/`: Claude calls (explanation grading, the tutor, the report summary).
- `src/sync/`: Google Sheets sync.
- `src/screens/`, `src/components/`: the user interface.

Problems were written for this app. They are not released EOC items and don't predict the real test's questions.
