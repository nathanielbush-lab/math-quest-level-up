# Math Quest 🧭

An adaptive practice app that teaches middle school math (North Carolina Grades 6–8 standards), built from the *My Middle School Math Roadmap* (CMS Horizons readiness). It teaches each idea, practices it, steps back to simpler building blocks when a student is stuck, and brings skills back days later to make sure they stick.

Everything runs in the browser. There's no account and no server, and progress is saved on the computer being used (or synced through your own Google Sheet, see below).

## Using it

- **Hosted:** once GitHub Pages is on (see below), open the Pages URL on the MacBook or the Windows desktop.
- **Offline file:** `math-quest-offline.html` is the whole app in one file. Double-click it to open it in Chrome, Edge or Safari.

### First run
1. Enter the student's name.
2. **Find my starting point**: short adaptive checks, one topic at a time (about 4–8 questions each). They start mid-topic and move up or down, so the student skips what they already know. You can do a few topics a day, and skip any topic that's brand new.
3. Then **Start today's quest** each session.

The first time the student reaches the home page, a short guided tour shows them around (replay it with the ❓ button). The home page has five tabs:
- **Today:** what they did last time, today's quest as three steps (warm-up → learn → challenge) with one big start button, the weekly goal (🎯 dots), the next badge, screener practice (or the monthly checkpoint when it's due), and the mistake journal when there's something in it. The starting-point card can be put away with **Not now**.
- **My Map:** an illustrated trail through four lands (Warm-up Meadow, Whispering Woods for Grade 6, Riverlands for Grade 7, Summit Peaks for Grade 8) ending at Horizons Castle, which opens screener practice. Each topic is a stop whose ring fills as skills unlock, a star marks a finished topic, and the owl perches on "You are here". Beside every stop is a landmark with that topic's math hidden in it (a pizza picnic with 7/8 left, a lemonade stand with a unit price, a number-line fence, a seesaw equation, a tree with square roots, crossing ski lifts for systems, goat stairs for slope, and more); tap one to see the explanation. Animals wander the lands. A **Trail / List** switch shows the original list instead: every topic with its progress bar spelled out in words ("2 practicing · 1 exploring"), plus a **How to read a card** key: the card's stripe and icon show the kind of math, and the progress bar (in its own shaded box) uses the same level colors for every topic. Classic opens on the list.
- **Trophies:** earned badges, the next one, and every locked badge with how to earn it.
- **Missions:** the three stage challenges (a dot on the tab means one is ready to play).
- **Shop:** spend stars on avatars (cats included), color themes and streak freezes.

### A daily quest follows the roadmap's session shape
| Part | What happens |
|---|---|
| **Warm-up** (~5 min) | Spaced-review questions on skills due for a check, plus old mistakes with fresh numbers |
| **Learn** (15–20 min) | New idea → lesson with a visual model → worked example (step by step) → guided problem → practice. Moves to a second skill from the *shapes & data* strand ("explore alongside") |
| **Challenge** (~10 min) | An unfamiliar multi-step problem: estimate first, solve, check reasonableness. Sometimes followed by "explain it in your own words" |

### How the adaptivity works
- **Skill map:** 84 small skills grouped into the roadmap's 15 topics (plus a Grade 5 fractions warm-up). Each skill lists the skills it depends on, and a skill unlocks only when its prerequisites are solid.
- **Levels** match the roadmap: *Exploring → Practicing → Independent → Can explain & apply*.
  - **Practicing:** first correct answer without help.
  - **Ready to build on** (unlocks the next skills): a high mastery estimate *and* about 4 of the last 5 answers right without hints.
  - **Independent:** right again on a **later day** in a warm-up review ("a single successful example is not enough").
  - **Can explain & apply:** Independent, plus a "why does it work?" question, plus a written explanation marked *got it*, plus another retention check a few days later.
- **Stepping back:** if the student misses 3 of the last 4 on a skill, the app gives a quick check on its prerequisites. If one is shaky, it switches to that skill (lesson recap, easier problems) and returns once it's solid. If the prerequisites are fine, it re-teaches the current skill with an example and easier numbers.
- **Never on one mistake:** a single wrong answer never drops a level. A skill only goes back to *Practicing* after two review misses in a row.
- **Difficulty** within a skill rises after 3 right in a row and drops after 2 misses.
- **Spaced review:** checks at 1, 3, 7, 14, 30 and 60 days.
- **Help:** two tries per question, hints that go from a nudge to nearly the whole method, and feedback that names common mistakes (for example "you added the denominators").
- **Worked solutions:** after a miss, the full solution is revealed one step at a time ("Can you guess the next step?"), with a **Show all** button. Each step names the move ("Find a common denominator.") and then shows the work, the way a student would write it out.
- **Badges:** earning one pops up a celebration that says what was done to earn it. The Today tab shows the badge the student is closest to next, and the **Trophies** tab shows them all.
- **Unlimited practice:** problems are generated with fresh numbers every time, so answers can't be memorized.
- **I'm stuck tutor** (needs an API key): a Claude tutor next to the Hint button that asks one guiding question at a time about the problem's own numbers. It never gives or confirms the answer (every reply is checked, and a reply that leaks is replaced), stays on the math, and suggests talking to a trusted grown-up if something worrying comes up. There's a daily message limit, and using it counts as help.

### Stars, weekly goal and streaks
- Stars come from answers, challenges, missions, explanations and tests, and are spent in the **Shop**.
- **Weekly goal:** quests per week (Monday–Sunday, set in Settings; 4 by default). Meeting it gives a 50-star bonus once a week.
- **Streak freezes 🧊:** each one covers a missed day. One is earned free for every 7 days in a row, and they can be bought in the shop. At most 2 at a time.

### Screener practice and monthly checkpoints
- **Screener practice:** a quick (12 questions, 15 minutes) or full (30 questions, 45 minutes) mixed test across the Grade 6–8 topics, in a typical test format: one question per screen, no hints, flag-and-come-back, optional timer, calculator only if allowed in Settings. Results show a readiness band, strongest and weakest topics, and a review of each missed question with its worked solution. **The real screener's format isn't public, so this is a best guess at a typical format, not a copy of it.**
- **Monthly checkpoint:** one question from each of the 16 topics, offered every 28 days, compared with the last checkpoint so growth is visible.
- Tests don't change mastery levels (they aren't practice), but missed questions go into the mistake journal.

### Stage challenges
The three stage challenges from the roadmap unlock as the student reaches the relevant skills: **plan a small party** (Grade 6), **design a board game** (Grade 7, with a dice simulator) and **compare bike-rental plans** (Grade 8, with graphing).

## Teacher corner (🍎 Teacher button, optional PIN)
- **Report:** a weekly report (Monday–Sunday, up to 8 weeks back): quests vs the goal, time, first-try accuracy, hints and tutor use, new levels and pace, a table by skill, "worth a closer look" items with suggestions, wins, tests, explanations and tutor chats. Printable, with an optional Claude-written summary that sends only aggregated numbers.
- **Overview:** time and sessions this week, skills ready, pace toward your target date, this month's roadmap focus, and skills that are currently tricky.
- **Tracker:** the roadmap's progress tracker filled in with dates for each level and the next recheck. Printable.
- **Explanations:** written explanations, with Claude's feedback if grading is on. Mark them *Got it* or *Needs revision* yourself, or **Copy pending for a Claude chat** to paste them into claude.ai.
- **Mistakes:** what was missed, the student's answer and the right answer, grouped by skill.
- **Settings:** the app's **Look** (three skins: *Playful & bright* with a purple owl, *Storybook* with warm paper and an owl in a scarf, or *Classic*, the original look; each has a dark mode, and shop color themes work in all of them), **Light or dark** (Light, Dark, or Match this computer, the default), session length, weekly goal, an on-screen calculator on/off switch (set it to match the screener once you know the rules), read-aloud, target date, the Claude API key, the tutor switch and daily limit, sync, and backup.

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
4. Paste the web app URL into Math Quest. On every other computer, choose **I have a sync code** and paste the sync code shown on the first computer.

After that, progress saves to the Sheet a few seconds after changes and loads the newest copy when the app opens. It keeps working offline and catches up later. If two computers both changed progress before syncing, the more recent copy wins and the other is kept as a backup on that computer (Settings → Backups). The API key is never synced. Treat the sync code like a password.

### Backup file
**Teacher corner → Settings → Download progress file** saves everything to a file; **Load progress file** restores it (the app warns if the file is older than what's there). Without sync, this is also how to move progress between computers. The API key isn't included.

### Help us tune the app (usage review)
Every answered question is logged on the computer (skill, right or wrong, tries, hints, time, tutor use; no free text). After a week or two of real use, download the progress file and share it in a Claude chat with the request to review how the app is working: where the student struggles, whether difficulty, hints and pacing fit, and what to change. The file contains the student's name and answers, so share it only where you're comfortable.

## Hosting on GitHub Pages
The workflow in `.github/workflows/deploy.yml` tests, builds and deploys on every push to `main`. To turn it on: repository **Settings → Pages → Source: GitHub Actions**. On a free GitHub plan, Pages needs a public repository. The repo contains no personal information; progress never leaves the student's computer (unless you set up sync to your own Google Sheet). If you'd rather keep the repo private, use the offline file.

## Development
```bash
npm install
npm run dev          # local dev server
npm test             # ~390 tests: every generator checked on 750 problems, engine rules, tests, shop, tutor guard, report, sync
npm run build        # static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Code map:
- `src/content/skills/*.ts`: skills by grade and topic. Each skill has a lesson, a problem generator with hints, steps and common-mistake feedback, and "why" questions. Standards codes are tagged, so the map can be updated when the revised NC standards take effect (2028–29).
- `src/content/challenges.ts`: end-of-session challenges and the three stage missions.
- `src/engine/`: mastery model, session planner (review / learn / challenge, step-back), placement check, answer checking, saving, export and import.
- `src/grading/`: Claude calls (explanation grading, the tutor, the report summary). The SDK loads only when needed.
- `src/sync/`: Google Sheets sync (the Apps Script source is generated in `sync.ts`).
- `src/screens/`, `src/components/`: the user interface.

Examples and problems were written for this app. They are not official CMS screening items and don't predict the screener's format or weighting.
