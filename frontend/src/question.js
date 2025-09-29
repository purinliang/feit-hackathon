import { useMemo, useState } from "react";

// === Career Questionnaire (Multi-step, Dark UI) ===
// New structure per request:
// Steps: Basic Info → Personality (one-page Likert) → Skills & Preferences (merged; first question is free-text skills) → Summary
// - Progress bar + stepper
// - Validation per step

export default function App() {
  // 0..2 are form steps, 3 is summary
  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  // ---------- Form State ----------
  const [basic, setBasic] = useState({
    name: "",
    ageBand: "",
    edu: "",
    major: "",
    status: "",
    years: "",
    city: "",
    workAuth: "",
    weekly: "",
    links: "",
  });

  const personalityQuestions = [
    // E vs I
    {
      id: "E1",
      text: "I gain energy from interacting with many people.",
      dim: "E",
    },
    {
      id: "I1",
      text: "Long periods of working alone make me most productive.",
      dim: "I",
    },
    {
      id: "E2",
      text: "I can easily start conversations with strangers.",
      dim: "E",
    },
    // S vs N
    {
      id: "S1",
      text: "I rely more on known facts and details when deciding.",
      dim: "S",
    },
    {
      id: "N1",
      text: "I often think in terms of big-picture possibilities and trends.",
      dim: "N",
    },
    {
      id: "N2",
      text: "I can take action first and iterate when things are ambiguous.",
      dim: "N",
    },
    // T vs F
    {
      id: "T1",
      text: "I value logical consistency when debating an issue.",
      dim: "T",
    },
    { id: "F1", text: "I prioritize others' feelings and impact.", dim: "F" },
    { id: "T2", text: "When in doubt, I trust data over intuition.", dim: "T" },
    // J vs P
    { id: "J1", text: "I prefer clear plans and hitting deadlines.", dim: "J" },
    {
      id: "P1",
      text: "I enjoy adapting on the fly and seizing new opportunities.",
      dim: "P",
    },
    {
      id: "J2",
      text: "I like to finish things cleanly before starting something new.",
      dim: "J",
    },
  ];
  const [personality, setPersonality] = useState({}); // {E1:1..5, ...}

  // single free-text skills question (merged page comes before preferences)
  const [skillsText, setSkillsText] = useState("");

  const roleOptions = [
    "Backend",
    "Frontend",
    "Full Stack",
    "Data Science",
    "Data Analytics",
    "Algorithms/ML",
    "Product Manager",
    "UX/UI",
    "DevOps",
    "Security",
    "Research",
    "Consulting",
    "Entrepreneurship",
  ];

  const [prefs, setPrefs] = useState({
    roles: [],
    industries: [],
    stage: "",
    size: "",
    workMode: "",
    travel: "",
    flexibility: "",
    values: [],
    risk: "",
    path: "",
    salary: "",
    startTime: "",
    constraints: "",
    vision: "",
  });

  const industryOptions = [
    "Internet/Tech",
    "Finance",
    "Healthcare",
    "Education",
    "Government",
    "Manufacturing",
    "Retail",
    "Energy",
    "Transportation",
    "Research/Academia",
  ];

  const valueOptions = [
    "Compensation",
    "Learning & Growth",
    "Upward Mobility",
    "Stability",
    "Impact",
    "Work–Life Balance",
    "Team Culture",
  ];

  // ---------- Helpers ----------
  const steps = [
    "Basic Info",
    "Personality",
    "Skills & Preferences",
    "Summary",
  ];
  const progressPct = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  function next() {
    setError("");
    const msg = validate(step);
    if (msg) return setError(msg);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  function validate(s) {
    // return error string or ""
    if (s === 0) {
      if (!basic.name?.trim()) return "Please enter your name";
      if (!basic.ageBand) return "Please select your age band";
      if (!basic.edu) return "Please select your highest education";
      if (!basic.status) return "Please select your current status";
    }
    if (s === 1) {
      const unanswered = personalityQuestions.filter((q) => !personality[q.id]);
      if (unanswered.length)
        return `Please finish the personality test: ${unanswered.length} item(s) left`;
    }
    if (s === 2) {
      if (!skillsText.trim())
        return "Please list the skills you currently possess";
      if (!prefs.workMode) return "Please choose a work mode";
      if (!prefs.roles.length) return "Please choose at least one target role";
    }
    return "";
  }

  // MBTI summary
  const mbti = useMemo(() => {
    const dims = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const q of personalityQuestions) {
      const v = Number(personality[q.id] || 0); // 1..5
      dims[q.dim] += v;
    }
    const letter = (a, b) =>
      dims[a] === dims[b] ? "X" : dims[a] > dims[b] ? a : b;
    const code = `${letter("E", "I")}${letter("S", "N")}${letter(
      "T",
      "F"
    )}${letter("J", "P")}`;
    return { code, dims };
  }, [personality]);

  function resetAll() {
    setStep(0);
    setBasic({
      name: "",
      ageBand: "",
      edu: "",
      major: "",
      status: "",
      years: "",
      city: "",
      workAuth: "",
      weekly: "",
      links: "",
    });
    setPersonality({});
    setSkillsText("");
    setPrefs({
      roles: [],
      industries: [],
      stage: "",
      size: "",
      workMode: "",
      travel: "",
      flexibility: "",
      values: [],
      risk: "",
      path: "",
      salary: "",
      startTime: "",
      constraints: "",
      vision: "",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="max-w-4xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome to JobSeeker!
        </h1>
        <p className="text-zinc-300 mt-2">
          Fill in your basic info to generate your career tree.
        </p>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i <= step
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-700 text-zinc-300"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`${i === step ? "text-zinc-100" : "text-zinc-400"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-6 h-px bg-zinc-700 mx-2" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4 md:p-6 shadow-2xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {step === 0 && <SectionBasic basic={basic} setBasic={setBasic} />}

          {step === 1 && (
            <SectionPersonality
              questions={personalityQuestions}
              answers={personality}
              setAnswers={setPersonality}
            />
          )}

          {step === 2 && (
            <SectionSkillsPrefs
              skillsText={skillsText}
              setSkillsText={setSkillsText}
              prefs={prefs}
              setPrefs={setPrefs}
              roleOptions={roleOptions}
              industryOptions={industryOptions}
              valueOptions={valueOptions}
            />
          )}

          {step === 3 && (
            <SectionSummary
              basic={basic}
              mbti={mbti}
              skillsText={skillsText}
              prefs={prefs}
              onRestart={resetAll}
            />
          )}

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40"
              onClick={back}
              disabled={step === 0}
            >
              Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                onClick={next}
              >
                {step === TOTAL_STEPS - 2 ? "Generate Summary" : "Next"}
              </button>
            ) : (
              <button
                className="px-5 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600"
                onClick={resetAll}
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-10 text-xs text-zinc-500">
        * The personality part is an MBTI-style self-report for career
        exploration only; not an official assessment.
      </footer>
    </div>
  );
}

// ====== Sections ======
function SectionBasic({ basic, setBasic }) {
  const band = ["<18", "18–22", "23–27", "28–34", "35–44", "45+"];
  const edu = ["Associate", "Bachelor", "Master", "PhD", "Other"];
  const status = [
    "Studying",
    "Job Seeking",
    "Employed - Open to Change",
    "Freelancing",
    "Founding/Startup",
  ];
  const years = ["0", "<1", "1–2", "3–5", "6–9", "10+"];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">1) Basic Info</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name" required>
          <input
            className="input"
            placeholder="Your name"
            value={basic.name}
            onChange={(e) => setBasic({ ...basic, name: e.target.value })}
          />
        </Field>

        <Field label="Age Band" required>
          <Select
            value={basic.ageBand}
            onChange={(v) => setBasic({ ...basic, ageBand: v })}
            options={band}
          />
        </Field>

        <Field label="Highest Education" required>
          <Select
            value={basic.edu}
            onChange={(v) => setBasic({ ...basic, edu: v })}
            options={edu}
          />
        </Field>

        <Field label="Major / Field">
          <input
            className="input"
            placeholder="e.g., Computer Science / Design / Data Science"
            value={basic.major}
            onChange={(e) => setBasic({ ...basic, major: e.target.value })}
          />
        </Field>

        <Field label="Current Status" required>
          <Select
            value={basic.status}
            onChange={(v) => setBasic({ ...basic, status: v })}
            options={status}
          />
        </Field>

        <Field label="Total Work/Internship Years">
          <Select
            value={basic.years}
            onChange={(v) => setBasic({ ...basic, years: v })}
            options={years}
          />
        </Field>

        <Field label="Current City / Target City">
          <input
            className="input"
            placeholder="e.g., Melbourne / Sydney / Remote"
            value={basic.city}
            onChange={(e) => setBasic({ ...basic, city: e.target.value })}
          />
        </Field>

        <Field label="Work Authorization / Visa">
          <Select
            value={basic.workAuth}
            onChange={(v) => setBasic({ ...basic, workAuth: v })}
            options={[
              "Unrestricted",
              "Employer Sponsored",
              "Student Visa",
              "Other",
            ]}
          />
        </Field>

        <Field label="Weekly Availability">
          <Select
            value={basic.weekly}
            onChange={(v) => setBasic({ ...basic, weekly: v })}
            options={["<20h", "20–30h", "30–40h", "40h+"]}
          />
        </Field>

        <Field label="Portfolio/LinkedIn/GitHub (comma separated)">
          <input
            className="input"
            placeholder="https://…, https://…"
            value={basic.links}
            onChange={(e) => setBasic({ ...basic, links: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function SectionPersonality({ questions, answers, setAnswers }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">2) Personality (Likert 1–5)</h2>
      <p className="text-sm text-zinc-400">
        1 = Strongly Disagree · 5 = Strongly Agree
      </p>

      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-4"
          >
            <div className="font-medium mb-3">
              {idx + 1}. {q.text}
            </div>
            <Likert
              name={q.id}
              value={answers[q.id] || 0}
              onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionSkillsPrefs({
  skillsText,
  setSkillsText,
  prefs,
  setPrefs,
  roleOptions,
  industryOptions,
  valueOptions,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">3) Skills & Preferences</h2>

      {/* Skills free-text (goes first) */}
      <Field
        label="What skills do you currently possess? (comma separated)"
        required
      >
        <textarea
          className="input min-h-[84px]"
          placeholder="e.g., Python, React, SQL, Tableau, Docker, Public Speaking"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />
      </Field>

      {/* Preferences */}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Target Roles (multi-select)" required>
          <CheckboxGroup
            options={roleOptions}
            values={prefs.roles}
            onChange={(vals) => setPrefs({ ...prefs, roles: vals })}
          />
        </Field>

        <Field label="Target Industries (multi-select)">
          <CheckboxGroup
            options={industryOptions}
            values={prefs.industries}
            onChange={(vals) => setPrefs({ ...prefs, industries: vals })}
          />
        </Field>

        <Field label="Company Stage">
          <Select
            value={prefs.stage}
            onChange={(v) => setPrefs({ ...prefs, stage: v })}
            options={["Early-stage", "Growth", "Large/Established"]}
          />
        </Field>

        <Field label="Company Size">
          <Select
            value={prefs.size}
            onChange={(v) => setPrefs({ ...prefs, size: v })}
            options={["<50", "50–200", "200–1000", "1000+"]}
          />
        </Field>

        <Field label="Work Mode" required>
          <Select
            value={prefs.workMode}
            onChange={(v) => setPrefs({ ...prefs, workMode: v })}
            options={["Remote", "Hybrid", "On-site"]}
          />
        </Field>

        <Field label="Travel Willingness">
          <Select
            value={prefs.travel}
            onChange={(v) => setPrefs({ ...prefs, travel: v })}
            options={["0%", "0–10%", "10–30%", "30%+"]}
          />
        </Field>

        <Field label="Schedule Flexibility">
          <Select
            value={prefs.flexibility}
            onChange={(v) => setPrefs({ ...prefs, flexibility: v })}
            options={["Strict 9–5", "Some Flexibility", "Highly Flexible"]}
          />
        </Field>

        <Field label="What do you value most? (multi-select)">
          <CheckboxGroup
            options={valueOptions}
            values={prefs.values}
            onChange={(vals) => setPrefs({ ...prefs, values: vals })}
          />
        </Field>

        <Field label="Risk Appetite">
          <Select
            value={prefs.risk}
            onChange={(v) => setPrefs({ ...prefs, risk: v })}
            options={["Conservative", "Moderate", "Aggressive"]}
          />
        </Field>

        <Field label="Career Path Preference">
          <Select
            value={prefs.path}
            onChange={(v) => setPrefs({ ...prefs, path: v })}
            options={[
              "Individual Contributor",
              "People Manager",
              "IC → Manager",
              "Undecided",
            ]}
          />
        </Field>

        <Field label="Compensation Expectation (range)">
          <input
            className="input"
            placeholder="e.g., A$70k–90k"
            value={prefs.salary}
            onChange={(e) => setPrefs({ ...prefs, salary: e.target.value })}
          />
        </Field>

        <Field label="Target Start Time">
          <Select
            value={prefs.startTime}
            onChange={(v) => setPrefs({ ...prefs, startTime: v })}
            options={["ASAP", "1–3 months", "3–6 months", "6+ months"]}
          />
        </Field>

        <Field label="Constraints (optional)">
          <textarea
            className="input min-h-[84px]"
            placeholder="Family/visa/location/health/financial, etc."
            value={prefs.constraints}
            onChange={(e) =>
              setPrefs({ ...prefs, constraints: e.target.value })
            }
          />
        </Field>

        <Field label="3–5 Year Vision (optional)">
          <textarea
            className="input min-h-[84px]"
            placeholder="e.g., Become a senior IC in data science or transition to product management"
            value={prefs.vision}
            onChange={(e) => setPrefs({ ...prefs, vision: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function SectionSummary({ basic, mbti, skillsText, prefs, onRestart }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">4) Summary</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <SummaryCard title="Basic Info">
          <ul className="space-y-1 text-sm">
            <li>Name: {basic.name || "-"}</li>
            <li>Age Band: {basic.ageBand || "-"}</li>
            <li>Education: {basic.edu || "-"}</li>
            <li>Major/Field: {basic.major || "-"}</li>
            <li>Status: {basic.status || "-"}</li>
            <li>City: {basic.city || "-"}</li>
          </ul>
        </SummaryCard>

        <SummaryCard title="Personality (MBTI-style)">
          <div className="text-2xl font-bold tracking-wide mb-2">
            {mbti.code}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <DimBar label="E" value={mbti.dims.E} pair={mbti.dims.I} />
            <DimBar label="I" value={mbti.dims.I} pair={mbti.dims.E} />
            <DimBar label="S" value={mbti.dims.S} pair={mbti.dims.N} />
            <DimBar label="N" value={mbti.dims.N} pair={mbti.dims.S} />
            <DimBar label="T" value={mbti.dims.T} pair={mbti.dims.F} />
            <DimBar label="F" value={mbti.dims.F} pair={mbti.dims.T} />
            <DimBar label="J" value={mbti.dims.J} pair={mbti.dims.P} />
            <DimBar label="P" value={mbti.dims.P} pair={mbti.dims.J} />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            * Not an official assessment; for career exploration only.
          </p>
        </SummaryCard>

        <SummaryCard title="Skills (free text)">
          <div className="text-sm whitespace-pre-wrap">{skillsText || "-"}</div>
        </SummaryCard>

        <SummaryCard title="Preferences">
          <ul className="space-y-1 text-sm">
            <li>Target Roles: {fmtList(prefs.roles)}</li>
            <li>Target Industries: {fmtList(prefs.industries)}</li>
            <li>
              Stage/Size: {prefs.stage || "-"} / {prefs.size || "-"}
            </li>
            <li>
              Work Mode: {prefs.workMode || "-"}; Travel: {prefs.travel || "-"}
            </li>
            <li>Values: {fmtList(prefs.values)}</li>
            <li>
              Risk Appetite: {prefs.risk || "-"}; Path: {prefs.path || "-"}
            </li>
            <li>
              Compensation: {prefs.salary || "-"}; Start Time:{" "}
              {prefs.startTime || "-"}
            </li>
          </ul>
        </SummaryCard>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600"
          onClick={onRestart}
        >
          Start Over
        </button>
        <a
          className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Export (hook up JSON/PDF in real app)
        </a>
      </div>
    </div>
  );
}

// ====== Small Components ======
function Field({ label, required, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-zinc-300">
        {label} {required && <span className="text-red-400">*</span>}
      </div>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Please select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function CheckboxGroup({ options, values, onChange }) {
  const setVal = (opt) => {
    const set = new Set(values || []);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setVal(opt)}
          className={`px-3 py-1.5 rounded-full border text-sm ${
            values?.includes(opt)
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
              : "bg-zinc-900/40 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Likert({ name, value, onChange }) {
  const labels = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-2">
      {labels.map((n) => (
        <label
          key={n}
          className={`flex flex-col items-center px-2 py-1 rounded-md cursor-pointer ${
            value === n ? "bg-emerald-500/20" : "hover:bg-zinc-900/50"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            className="sr-only"
          />
          <span className="text-sm">{n}</span>
        </label>
      ))}
      <span className="ml-2 text-xs text-zinc-400">
        1 = Strongly Disagree · 5 = Strongly Agree
      </span>
    </div>
  );
}

function SummaryCard({ title, children }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-4">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function DimBar({ label, value, pair }) {
  const total = Math.max(1, value + pair);
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function fmtList(arr) {
  return arr?.length ? arr.join(", ") : "-";
}

// ====== Minimal base styles so it runs without Tailwind too ======
const base =
  typeof document !== "undefined" ? document.createElement("style") : null;
if (base) {
  base.innerHTML = `
    body{margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; background:#121212; color:#e5e7eb}
    .input{width:100%; background:#18181b; color:#e4e4e7; border:1px solid #3f3f46; border-radius:12px; padding:8px 12px;}
    .input:focus{outline:none; box-shadow:0 0 0 2px rgba(16,185,129,0.35)}
  `;
  document.head.appendChild(base);
}
