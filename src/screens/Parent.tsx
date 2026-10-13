import { COURSE_BY_ID } from "../content/topics";
import { WeeklyReport } from "../components/WeeklyReport";
import { SyncSettings } from "../sync/SyncSettings";
import { FamilyIcon, Icon } from "../components/Icon";
import { askTutor } from "../grading/tutor";
import { makeRng } from "../lib/rng";
import { useRef, useState } from "react";
import { ORDERED, SKILL_BY_ID, SKILLS, TOPICS, skillsInTopic } from "../content";
import { grade as gradeIt, reviewPrompt } from "../grading/types";
import { setWrittenStatus } from "../engine/mastery";
import { DEFAULT_MODEL, LEVEL_NAMES, daysBetween, exportJson, newState, parseImport, today, type AppState, type Explanation } from "../engine/state";
import { monthFocus } from "../store";
import { LevelBadge, LevelBar, LevelLegend, fmtDate } from "../ui";
import { topicCounts } from "./Home";

type Tab = "overview" | "report" | "tracker" | "explanations" | "mistakes" | "settings";

export function Parent({ state, mutate, replace, onExit }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; replace: (s: AppState) => void; onExit: () => void }) {
  const [unlocked, setUnlocked] = useState(!state.settings.parentPin);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  if (!unlocked) {
    return (
      <div className="card" style={{ maxWidth: 380, margin: "40px auto" }}>
        <h2><Icon name="apple" size={26} /> Teacher corner</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (pin === state.settings.parentPin) setUnlocked(true); else setPin(""); }}>
          <div className="field">
            <label htmlFor="pin">PIN</label>
            <input id="pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          </div>
          <div className="row"><button className="btn primary">Open</button><button type="button" className="btn ghost" onClick={onExit}>Back</button></div>
        </form>
      </div>
    );
  }
  const pending = state.explanations.filter((e) => e.status === "pending").length;
  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <h1 className="grow" style={{ margin: 0 }}><Icon name="apple" size={30} /> Teacher corner</h1>
        <button className="btn" onClick={onExit}>← Back</button>
      </div>
      <div className="tabs">
        {(["overview", "report", "tracker", "explanations", "mistakes", "settings"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t === "explanations" && pending ? `Explanations (${pending})` : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview state={state} />}
      {tab === "tracker" && <Tracker state={state} />}
      {tab === "explanations" && <Explanations state={state} mutate={mutate} />}
      {tab === "mistakes" && <Mistakes state={state} />}
      {tab === "report" && <WeeklyReport state={state} mutate={mutate} />}
      {tab === "settings" && <SettingsTab state={state} mutate={mutate} replace={replace} />}
    </div>
  );
}

function Overview({ state }: { state: AppState }) {
  const day = today();
  const recent = state.sessions.filter((s) => daysBetween(s.date, day) < 7);
  const minutes = recent.reduce((a, s) => a + s.minutes, 0);
  const answered = recent.reduce((a, s) => a + s.answered, 0);
  const correct = recent.reduce((a, s) => a + s.correct, 0);
  const byLevel = [0, 0, 0, 0, 0];
  for (const s of SKILLS) byLevel[state.skills[s.id]?.level ?? 0]++;
  const ready = SKILLS.filter((s) => state.skills[s.id]?.ready).length;
  const daysLeft = daysBetween(day, state.settings.targetDate);
  const remaining = SKILLS.length - ready;
  const month = monthFocus();
  const struggling = ORDERED.filter((s) => {
    const r = state.skills[s.id]?.recent.slice(-6) ?? [];
    return r.length >= 4 && r.filter((a) => !a.ok).length >= 3;
  });
  return (
    <div>
      <div className="grid2">
        <div className="card tight"><div className="muted small">Last 7 days</div><h2 style={{ margin: 0 }}>{recent.length} sessions · {minutes} min</h2><div className="small muted">{answered} questions, {answered ? Math.round((correct / answered) * 100) : 0}% right first try without hints</div></div>
        <div className="card tight"><div className="muted small">Skills ready to build on</div><h2 style={{ margin: 0 }}>{ready} of {SKILLS.length}</h2><div className="small muted">{byLevel[3] + byLevel[4]} Independent or better · streak {state.streak.count} day{state.streak.count === 1 ? "" : "s"}</div></div>
        <div className="card tight"><div className="muted small">Pace toward {fmtDate(state.settings.targetDate)}</div><h2 style={{ margin: 0 }}>{daysLeft > 0 ? `${daysLeft} days left` : "Target date reached"}</h2><div className="small muted">{daysLeft > 0 && remaining > 0 ? `About ${Math.ceil(remaining / Math.max(1, daysLeft / 7))} new skills per week would cover everything. Depth matters more than coverage.` : "Focus on review and retention."}</div></div>
      </div>
      <div className="card">
        <strong>{month.title}</strong>
        <p className="small muted">{month.text}</p>
        <p className="small muted" style={{ margin: 0 }}>Suggested rhythm from the roadmap: 5 min review, 15–20 min learning and practice, 10 min on an unfamiliar problem; about four sessions a week, adjusted to the student's attention and enjoyment.</p>
      </div>
      {struggling.length > 0 && (
        <div className="card">
          <strong>Currently tricky</strong>
          <p className="small muted">The app steps back to building blocks automatically when it sees repeated misses. These might benefit from a chat or a drawing together:</p>
          <ul>{struggling.slice(0, 6).map((s) => <li key={s.id}>{s.title}</li>)}</ul>
        </div>
      )}
      <div className="card">
        <div className="row"><strong className="grow">Topics</strong><LevelLegend /></div>
        {TOPICS.map((t) => {
          const c = topicCounts(state, t.id);
          return (
            <div key={t.id} className="row" style={{ marginTop: 10 }}>
              <span style={{ width: 28 }} className={`fam-${t.family} fam-ink`}><FamilyIcon family={t.family} /></span>
              <span style={{ width: 260 }} className="small">{COURSE_BY_ID[t.course].short} U{t.unit} · {t.title}</span>
              <div className="grow"><LevelBar counts={c.counts} total={c.total} /></div>
              <span className="small muted" style={{ width: 60, textAlign: "right" }}>{c.ready}/{c.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tracker({ state }: { state: AppState }) {
  return (
    <div>
      <div className="card tight row">
        <span className="grow small muted">The roadmap's progress tracker, filled in automatically. “Ready to move ahead” = solves independently, explains why, and gets it right again days later.</span>
        <button className="btn" onClick={() => window.print()}>🖨️ Print</button>
      </div>
      {TOPICS.map((t) => (
        <div key={t.id} className="card tight">
          <strong>{t.title}</strong> <span className="small muted">{t.standards}</span>
          <div style={{ overflowX: "auto" }}>
            <table className="data" style={{ marginTop: 8 }}>
              <thead><tr><th>Skill</th><th>Now</th><th>Exploring</th><th>Practicing</th><th>Independent</th><th>Explain &amp; apply</th><th>Recheck</th><th>Right</th></tr></thead>
              <tbody>
                {skillsInTopic(t.id).map((s) => {
                  const ss = state.skills[s.id];
                  return (
                    <tr key={s.id}>
                      <td>{s.title}</td>
                      <td><LevelBadge level={ss?.level ?? 0} /></td>
                      <td>{fmtDate(ss?.dates.exploring)}</td>
                      <td>{fmtDate(ss?.dates.practicing)}{ss?.placed ? " (check)" : ""}</td>
                      <td>{fmtDate(ss?.dates.independent)}</td>
                      <td>{fmtDate(ss?.dates.explain)}</td>
                      <td>{fmtDate(ss?.nextReview)}</td>
                      <td>{ss?.attempts ? `${ss.correct}/${ss.attempts}` : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Explanations({ state, mutate }: { state: AppState; mutate: (fn: (s: AppState) => void) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const list = [...state.explanations].reverse();
  const pending = list.filter((e) => e.status === "pending");
  const setStatus = (e: Explanation, status: "pass" | "revise", by: "claude" | "parent", feedback?: string, note?: string, improve?: string) =>
    mutate((s) => {
      const x = s.explanations.find((y) => y.id === e.id);
      if (!x) return;
      x.status = status;
      x.gradedBy = by;
      if (feedback) x.feedback = feedback;
      if (note) x.parentNote = note;
      if (improve) x.howToImprove = improve;
      setWrittenStatus(s, e.skillId, status);
    });
  const grade = async (e: Explanation) => {
    if (!state.settings.apiKey) return;
    setBusy(e.id);
    setMsg(null);
    const out = await gradeIt(state.settings.apiKey, state.settings.model, { skillTitle: SKILL_BY_ID[e.skillId].title, prompt: e.prompt, keyIdeas: e.keyIdeas, exemplar: e.exemplar, response: e.response, previous: e.rounds?.slice(0, -1) });
    if (out.grade) setStatus(e, out.grade.verdict === "got_it" ? "pass" : "revise", "claude", out.grade.feedbackForStudent, out.grade.noteForParent, out.grade.howToImprove);
    else setMsg(out.error ?? "Couldn't grade it.");
    setBusy(null);
  };
  const copy = async () => {
    const text = reviewPrompt(pending.map((e) => ({ id: e.id, date: e.date, skillTitle: SKILL_BY_ID[e.skillId].title, prompt: e.prompt, keyIdeas: e.keyIdeas, exemplar: e.exemplar, response: e.response, previous: e.rounds?.slice(0, -1) })));
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied! Paste it into a Claude chat, then mark each one below.");
    } catch {
      setMsg("Couldn't copy automatically. Select the text below and copy it.");
      setShowText(text);
    }
  };
  const [showText, setShowText] = useState<string | null>(null);
  return (
    <div>
      <div className="card tight">
        <p className="small" style={{ marginTop: 0 }}>Written explanations are part of the top level, “Can explain and apply”. {state.settings.apiKey ? "Claude grades them automatically when the student submits; you can re-grade or override any of them." : "Add an API key in Settings to have Claude grade them automatically, or copy them into a Claude chat."}</p>
        <div className="row">
          <button className="btn" disabled={!pending.length} onClick={copy}>📋 Copy {pending.length} pending for a Claude chat</button>
        </div>
        {msg && <div className="feedback info">{msg}</div>}
        {showText && <textarea readOnly value={showText} />}
      </div>
      {!list.length && <p className="muted">No explanations yet. They appear once the student is solid on a skill (at the end of a daily run).</p>}
      {list.map((e) => (
        <div key={e.id} className="card tight">
          <div className="row">
            <strong className="grow">{SKILL_BY_ID[e.skillId]?.title}</strong>
            <span className="chip">{e.status === "pending" ? "⏳ Pending" : e.status === "pass" ? "✅ Got it" : "✏️ Revise"}{e.gradedBy ? ` · ${e.gradedBy === "parent" ? "teacher" : "Claude"}` : ""}</span>
            <span className="small muted">{fmtDate(e.date)}</span>
          </div>
          <p className="small muted" style={{ margin: "6px 0" }}>{e.prompt}</p>
          {e.rounds && e.rounds.length > 1 && (
            <details className="small">
              <summary>Revised {e.rounds.length - 1} time{e.rounds.length > 2 ? "s" : ""} with Claude's feedback: see every draft</summary>
              {e.rounds.slice(0, -1).map((r, i) => (
                <div key={i} style={{ margin: "6px 0" }}>
                  <blockquote className="draft"><span className="muted">Draft {i + 1} · {r.verdict === "got_it" ? "got it" : r.verdict === "almost" ? "almost" : "not yet"}</span><br />{r.response}</blockquote>
                  <div><strong>Feedback:</strong> {r.feedback}{r.guidingQuestion ? <> <em>{r.guidingQuestion}</em></> : null}</div>
                </div>
              ))}
            </details>
          )}
          <blockquote className="draft">{e.rounds && e.rounds.length > 1 && <><span className="small muted">Final draft</span><br /></>}{e.response}</blockquote>
          {e.feedback && <p className="small"><strong>Feedback to the student:</strong> {e.feedback}</p>}
          {e.howToImprove && <p className="small"><strong>How to make it stronger:</strong> {e.howToImprove}</p>}
          {e.modelExplanation && <p className="small"><strong>Model explanation shown to the student:</strong> {e.modelExplanation}</p>}
          {e.parentNote && <p className="small"><strong>Note for you:</strong> {e.parentNote}</p>}
          <details className="small"><summary>What a strong answer includes</summary><ul>{e.keyIdeas.map((k) => <li key={k}>{k}</li>)}</ul><p><em>Example:</em> {e.exemplar}</p></details>
          <div className="row" style={{ marginTop: 8 }}>
            {state.settings.apiKey && <button className="btn" disabled={busy === e.id} onClick={() => grade(e)}>{busy === e.id ? "Grading…" : "🤖 Grade with Claude"}</button>}
            <button className="btn good" onClick={() => setStatus(e, "pass", "parent")}>✅ Got it</button>
            <button className="btn ghost" onClick={() => setStatus(e, "revise", "parent")}>✏️ Needs revision</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Mistakes({ state }: { state: AppState }) {
  const by = new Map<string, typeof state.mistakes>();
  for (const m of state.mistakes) by.set(m.skillId, [...(by.get(m.skillId) ?? []), m]);
  const rows = [...by.entries()].sort((a, b) => b[1].length - a[1].length);
  return (
    <div>
      <p className="muted small">Questions the student missed or needed help with. Open ones come back in warm-ups and the mistake journal with fresh numbers.</p>
      {!rows.length && <p className="muted">Nothing here yet.</p>}
      {rows.map(([skillId, list]) => (
        <div key={skillId} className="card tight">
          <div className="row">
            <strong className="grow">{SKILL_BY_ID[skillId]?.title}</strong>
            <span className="small muted">{list.filter((m) => !m.resolved).length} open · {list.length} total</span>
          </div>
          <table className="data" style={{ marginTop: 6 }}>
            <thead><tr><th>Date</th><th>Question</th><th>Their answer</th><th>Correct</th><th></th></tr></thead>
            <tbody>
              {list.slice(-4).reverse().map((m) => (
                <tr key={m.id}><td>{fmtDate(m.date)}</td><td>{m.prompt.replace(/\{([^{}/]+)\/([^{}]+)\}/g, "$1/$2")}</td><td>{m.given}</td><td>{m.correct}</td><td>{m.resolved ? "✓ fixed" : ""}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ state, mutate, replace }: { state: AppState; mutate: (fn: (s: AppState) => void) => void; replace: (s: AppState) => void }) {
  const st = state.settings;
  const set = <K extends keyof AppState["settings"]>(k: K, v: AppState["settings"][K]) => mutate((s) => { s.settings[k] = v; });
  const [keyDraft, setKeyDraft] = useState(st.apiKey ?? "");
  const [test, setTest] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportJson(state)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `level-up-progress-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = async (f: File) => {
    try {
      const incoming = parseImport(await f.text());
      const older = incoming.updatedAt < state.updatedAt;
      if (!confirm(`Load progress saved ${new Date(incoming.updatedAt).toLocaleString()}?${older ? "\n\nHeads up: this file is OLDER than the progress on this computer." : ""}\n\nThis replaces the progress on this computer.`)) return;
      incoming.settings.apiKey = st.apiKey; // keep this computer's key
      replace(incoming);
      setImportMsg("Progress loaded ✓");
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };
  const testKey = async () => {
    setTest("Testing…");
    const out = await gradeIt(keyDraft.trim(), st.model, { skillTitle: "Test", prompt: "Why is 1/2 equal to 2/4?", keyIdeas: ["same amount", "multiply top and bottom by 2"], exemplar: "Cutting each half into two pieces gives 2 of 4 pieces, the same amount.", response: "if you cut each half in half you get 4 pieces and 2 of them are the same amount as one half" });
    setTest(out.grade ? `✓ Works! Test grade: ${out.grade.verdict.replace("_", " ")}` : out.error ?? "Didn't work.");
  };
  const [tutorTest, setTutorTest] = useState<string | null>(null);
  const testTutor = async () => {
    setTutorTest("Asking the tutor…");
    const problem = SKILL_BY_ID["g5.equiv"].generate(makeRng(7), 1);
    const reply = await askTutor({ apiKey: (keyDraft.trim() || st.apiKey) ?? "", model: st.model, problem, wrongAnswers: [], hintsShown: 0, turns: [{ role: "student", text: "I don't know how to start" }] });
    setTutorTest(reply.error ? `✗ ${reply.detail ?? reply.error}` : `✓ The tutor works. It said: “${reply.text}”`);
  };
  return (
    <div>
      <div className="card">
        <h3>Look</h3>
        <p className="small muted" style={{ margin: 0 }}>Two skins for the whole app. Same screens, different style. Accent colors from the shop work in both.</p>
        <div className="skin-pick" role="radiogroup" aria-label="Look">
          {([
            ["studio", "Studio", "Clean and minimal. Follows the light or dark setting below."],
            ["night", "Night Run", "Dark game look with lime accents. Always dark."],
          ] as const).map(([id, name, blurb]) => (
            <button key={id} type="button" role="radio" aria-checked={(st.skin ?? "studio") === id} className={`skin-option ${(st.skin ?? "studio") === id ? "on" : ""}`} onClick={() => set("skin", id)}>
              <div className={`sample sample-${id}`}>
                <span style={{ fontSize: "1.3rem", fontWeight: 700 }}>Aa</span>
                <span className="fake-btn">Start</span>
              </div>
              <div className="label">{name}{(st.skin ?? "studio") === id ? " ✓" : ""}<div className="small muted" style={{ fontWeight: 500 }}>{blurb}</div></div>
            </button>
          ))}
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <span className="small" style={{ fontWeight: 800 }}>Light or dark{st.skin === "night" ? " (Studio only: Night Run is always dark)" : ""}</span>
          <div className="appearance-pick" role="radiogroup" aria-label="Light or dark">
            {([
              ["light", "Light"],
              ["dark", "Dark"],
              ["auto", "Match this computer"],
            ] as const).map(([id, name]) => (
              <button key={id} type="button" role="radio" aria-checked={(st.appearance ?? "auto") === id} className={(st.appearance ?? "auto") === id ? "on" : ""} onClick={() => set("appearance", id)}>{name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Learner</h3>
        <div className="field"><label htmlFor="n">Name</label><input id="n" type="text" value={st.studentName} onChange={(e) => set("studentName", e.target.value)} /></div>
        <div className="field"><label htmlFor="t">Course end or EOC date (for pacing)</label><input id="t" type="date" value={st.targetDate} onChange={(e) => set("targetDate", e.target.value)} /></div>
        <div className="field"><label htmlFor="len">Session length</label>
          <select id="len" value={st.sessionLength} onChange={(e) => set("sessionLength", e.target.value as "short" | "standard")}>
            <option value="standard">Standard (~30 min: 5 review + 15–20 learn + challenge)</option>
            <option value="short">Short (~15–20 min)</option>
          </select>
        </div>
        <label className="row"><input type="checkbox" checked={st.calculator} onChange={(e) => set("calculator", e.target.checked)} /> Allow an on-screen calculator (turn off to match a no-calculator test)</label>
        <label className="row" style={{ marginTop: 8 }}><input type="checkbox" checked={st.readAloud} onChange={(e) => set("readAloud", e.target.checked)} /> Show “read aloud” buttons</label>
        <div className="field" style={{ marginTop: 12 }}><label htmlFor="goal">Weekly goal (daily runs per week, Monday–Sunday)</label>
          <select id="goal" value={st.weeklyGoal} onChange={(e) => set("weeklyGoal", Number(e.target.value))}>
            {[2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} runs a week{n === 4 ? " (suggested)" : ""}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginTop: 12 }}><label htmlFor="pin2">Teacher PIN (optional, keeps this corner private)</label><input id="pin2" type="password" inputMode="numeric" value={st.parentPin ?? ""} onChange={(e) => set("parentPin", e.target.value || undefined)} /></div>
      </div>

      <div className="card">
        <h3>Claude: explanation grading and the “I'm stuck” tutor</h3>
        <p className="small muted">Uses your Anthropic API key from <strong>platform.claude.com</strong>. It's stored only in this browser and only sent to Anthropic. Each grade costs a tiny fraction of a cent with Haiku. Tip: create a separate key with a low monthly spend limit, since anyone using this browser could find it.</p>
        <div className="field"><label htmlFor="k">API key</label><input id="k" type="password" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-…" autoComplete="off" /></div>
        <div className="field"><label htmlFor="m">Model</label>
          <select id="m" value={st.model} onChange={(e) => set("model", e.target.value)}>
            <option value={DEFAULT_MODEL}>Claude Haiku 5.5 (recommended: fast and inexpensive)</option>
            <option value="claude-sonnet-5-5">Claude Sonnet 5.5 (more thorough, costs more)</option>
          </select>
        </div>
        <div className="row">
          <button className="btn primary" onClick={() => set("apiKey", keyDraft.trim() || undefined)}>Save key</button>
          <button className="btn" disabled={!keyDraft.trim()} onClick={testKey}>Test it</button>
          <button className="btn" disabled={!keyDraft.trim() && !st.apiKey} onClick={testTutor}>Test the tutor</button>
          {st.apiKey && <button className="btn ghost" onClick={() => { setKeyDraft(""); set("apiKey", undefined); }}>Remove key</button>}
          {st.apiKey && <span className="small muted">✓ key saved</span>}
        </div>
        {test && <div className="feedback info">{test}</div>}
        {tutorTest && <div className="feedback info">{tutorTest}</div>}
        <label className="row" style={{ marginTop: 12 }}><input type="checkbox" checked={st.tutorEnabled} onChange={(e) => set("tutorEnabled", e.target.checked)} /> Show the “I'm stuck” button (a Claude tutor that asks guiding questions and never gives the answer)</label>
        <div className="field" style={{ marginTop: 8 }}><label htmlFor="tl">Tutor messages per day (keeps cost predictable; about 0.1¢ each with Haiku)</label>
          <input id="tl" type="number" min={0} max={100} value={st.tutorDailyLimit} onChange={(e) => set("tutorDailyLimit", Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
        </div>
      </div>

      <SyncSettings state={state} replace={replace} />

      <div className="card">
        <h3>Backup file</h3>
        <p className="small muted">Progress is saved automatically in this browser on this computer. With sync (above) you don't need to move files, but a downloaded file is still a good backup, and it's what to send for a review of how the app is working. Without sync, to use another computer click <strong>Download progress file</strong> here, move the file over (email it to yourself, a USB stick, or a shared folder), then open Level Up on the other computer and use <strong>Load progress file</strong>. Do the same in reverse when switching back; the newest file wins. It's also a good weekly backup.</p>
        <div className="row">
          <button className="btn primary" onClick={download}>⬇️ Download progress file</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>⬆️ Load progress file</button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        </div>
        {importMsg && <div className="feedback info">{importMsg}</div>}
        <p className="small muted" style={{ marginBottom: 0 }}>Last saved: {new Date(state.updatedAt).toLocaleString()}</p>
      </div>

      <div className="card">
        <h3>Start over</h3>
        <p className="small muted">Erases all progress on this computer (download a backup first).</p>
        <button className="btn ghost" onClick={() => { if (prompt('Type "reset" to erase all progress') === "reset") { const fresh = newState(); fresh.settings = { ...st }; replace(fresh); } }}>Reset progress…</button>
      </div>
      <p className="small muted">Levels: {LEVEL_NAMES.slice(1).join(" → ")}</p>
    </div>
  );
}
