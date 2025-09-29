import React, { useMemo, useState } from "react";
import {
  Box, Button, Stepper, Step, StepLabel, Typography, Container, Paper, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio,
  List, ListItem, ListItemText, Divider, LinearProgress
} from '@mui/material';

const TOTAL_STEPS = 4;
const steps = ["Basic Info", "Personality", "Skills & Preferences", "Summary"];

const personalityQuestions = [
  { id: "E1", text: "I gain energy from interacting with many people.", dim: "E" },
  { id: "I1", text: "Long periods of working alone make me most productive.", dim: "I" },
  { id: "E2", text: "I can easily start conversations with strangers.", dim: "E" },
  { id: "S1", text: "I rely more on known facts and details when deciding.", dim: "S" },
  { id: "N1", text: "I often think in terms of big-picture possibilities and trends.", dim: "N" },
  { id: "N2", text: "I can take action first and iterate when things are ambiguous.", dim: "N" },
  { id: "T1", text: "I value logical consistency when debating an issue.", dim: "T" },
  { id: "F1", text: "I prioritize others' feelings and impact.", dim: "F" },
  { id: "T2", text: "When in doubt, I trust data over intuition.", dim: "T" },
  { id: "J1", text: "I prefer clear plans and hitting deadlines.", dim: "J" },
  { id: "P1", text: "I enjoy adapting on the fly and seizing new opportunities.", dim: "P" },
  { id: "J2", text: "I like to finish things cleanly before starting something new.", dim: "J" },
];

const roleOptions = ["Backend", "Frontend", "Full Stack", "Data Science", "Data Analytics", "Algorithms/ML", "Product Manager", "UX/UI", "DevOps", "Security", "Research", "Consulting", "Entrepreneurship"];
const industryOptions = ["Internet/Tech", "Finance", "Healthcare", "Education", "Government", "Manufacturing", "Retail", "Energy", "Transportation", "Research/Academia"];
const valueOptions = ["Compensation", "Learning & Growth", "Upward Mobility", "Stability", "Impact", "Work–Life Balance", "Team Culture"];

// A mapping from common user inputs to the actual skill IDs in GraphData.jsx
const skillNameToIdMap = {
  'html/css': 'html_css', 'html': 'html_css', 'css': 'html_css',
  'javascript': 'javascript', 'js': 'javascript',
  'typescript': 'typescript', 'ts': 'typescript',
  'react': 'react', 'react.js': 'react',
  'node.js': 'nodejs', 'node': 'nodejs',
  'express': 'express', 'express.js': 'express',
  'python': 'python',
  'fastapi': 'fastapi',
  'pandas': 'pandas',
  'numpy': 'numpy',
  'sql': 'sql',
  'docker': 'docker'
};

export default function SurveyPage({ onComplete, setLearnedSkillIds }) {
  // 0..2 are form steps, 3 is summary
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  // ---------- Form State ----------
  const [basic, setBasic] = useState({ name: "", ageBand: "", edu: "", major: "", status: "", years: "", city: "", workAuth: "", weekly: "", links: "" });
  const [personality, setPersonality] = useState({});
  const [skillsText, setSkillsText] = useState("");
  const [prefs, setPrefs] = useState({ roles: [], industries: [], stage: "", size: "", workMode: "", travel: "", flexibility: "", values: [], risk: "", path: "", salary: "", startTime: "", constraints: "", vision: "" });

  // ---------- Helpers ----------
  function next() {
    setError("");
    const msg = validate(step);
    if (msg) return setError(msg);

    // When moving to summary, parse skills and update parent state
    if (step === TOTAL_STEPS - 2) {
      const userSkills = skillsText.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      setLearnedSkillIds(prev => {
        const newSet = new Set(prev);
        userSkills.forEach(name => {
          const skillId = skillNameToIdMap[name] || name; // Use map, or fallback to name itself
          newSet.add(skillId);
        });
        return newSet;
      });
    }

    const nextStep = Math.min(step + 1, TOTAL_STEPS - 1);
    setStep(nextStep);
  }

  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  function validate(s) {
    // if (s === 0) {
    //   if (!basic.name?.trim()) return "Please enter your name";
    //   if (!basic.ageBand) return "Please select your age band";
    //   if (!basic.edu) return "Please select your highest education";
    //   if (!basic.status) return "Please select your current status";
    // }
    // if (s === 1) {
    //   const unanswered = personalityQuestions.filter((q) => !personality[q.id]);
    //   if (unanswered.length)
    //     return `Please finish the personality test: ${unanswered.length} item(s) left`;
    // }
    // if (s === 2) {
    //   if (!skillsText.trim())
    //     return "Please list the skills you currently possess";
    //   if (!prefs.workMode) return "Please choose a work mode";
    //   if (!prefs.roles.length) return "Please choose at least one target role";
    // }
    // Removed all validation for easier testing and demoing.
    // You can add validation logic back here if needed.
    return "";
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'left', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Career Path Questionnaire
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Fill in your basic info to generate your career tree.
        </Typography>
      </Box>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4, minHeight: 400 }}>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {step === 0 && <SectionBasic basic={basic} setBasic={setBasic} />}
        {step === 1 && <SectionPersonality answers={personality} setAnswers={setPersonality} />}
        {step === 2 && <SectionSkillsPrefs skillsText={skillsText} setSkillsText={setSkillsText} prefs={prefs} setPrefs={setPrefs} />}
        {step === 3 && <SectionSummary basic={basic} personality={personality} skillsText={skillsText} prefs={prefs} />}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={back} disabled={step === 0}>
            Back
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button variant="contained" onClick={next}>
              {step === TOTAL_STEPS - 2 ? "Generate Summary" : "Next"}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={onComplete}>
              View My Career Graph
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

// ====== Section Components (MUI Version) ======

function SectionBasic({ basic, setBasic }) {
  const handleChange = (e) => setBasic({ ...basic, [e.target.name]: e.target.value });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>1) Basic Info</Typography>
      <TextField fullWidth label="Name" name="name" value={basic.name} onChange={handleChange} variant="outlined" />
      <MuiSelect label="Age Band" name="ageBand" value={basic.ageBand} onChange={handleChange} options={["<18", "18–22", "23–27", "28–34", "35–44", "45+"]} />
      <MuiSelect label="Highest Education" name="edu" value={basic.edu} onChange={handleChange} options={["Associate", "Bachelor", "Master", "PhD", "Other"]} />
      <TextField fullWidth label="Major / Field" name="major" value={basic.major} onChange={handleChange} placeholder="e.g., Computer Science" variant="outlined" />
      <MuiSelect label="Current Status" name="status" value={basic.status} onChange={handleChange} options={["Studying", "Job Seeking", "Employed - Open to Change", "Freelancing", "Founding/Startup"]} />
      <MuiSelect label="Work/Internship Years" name="years" value={basic.years} onChange={handleChange} options={["0", "<1", "1–2", "3–5", "6–9", "10+"]} />
    </Box>
  );
}

function SectionPersonality({ answers, setAnswers }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>2) Personality</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>1 = Strongly Disagree · 5 = Strongly Agree</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {personalityQuestions.map((q) => (
          <Box key={q.id} sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1, textAlign: 'left' }}>
            <Typography gutterBottom>{q.text}</Typography>
            <RadioGroup row name={q.id} value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
              {[1, 2, 3, 4, 5].map(n => <FormControlLabel key={n} value={String(n)} control={<Radio />} label={String(n)} />)}
            </RadioGroup>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SectionSkillsPrefs({ skillsText, setSkillsText, prefs, setPrefs }) {
  const handleCheckboxChange = (group, option) => {
    const currentValues = prefs[group] || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(item => item !== option)
      : [...currentValues, option];
    setPrefs({ ...prefs, [group]: newValues });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>3) Skills & Preferences</Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="What skills do you currently possess? (comma separated)"
        value={skillsText}
        onChange={(e) => setSkillsText(e.target.value)}
        placeholder="e.g., python, react, sql, docker"
        variant="outlined"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <FormControl component="fieldset" fullWidth>
          <Typography component="legend" variant="body1" sx={{ mb: 1 }}>Target Roles (multi-select)</Typography>
          <FormGroup>
            {roleOptions.map(opt => <FormControlLabel key={opt} control={<Checkbox checked={prefs.roles.includes(opt)} onChange={() => handleCheckboxChange('roles', opt)} />} label={opt} />)}
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset" fullWidth>
          <Typography component="legend" variant="body1" sx={{ mb: 1 }}>Target Industries (multi-select)</Typography>
          <FormGroup>
            {industryOptions.map(opt => <FormControlLabel key={opt} control={<Checkbox checked={prefs.industries.includes(opt)} onChange={() => handleCheckboxChange('industries', opt)} />} label={opt} />)}
          </FormGroup>
        </FormControl>

        <MuiSelect label="Work Mode" name="workMode" value={prefs.workMode} onChange={(e) => setPrefs({ ...prefs, workMode: e.target.value })} options={["Remote", "Hybrid", "On-site"]} />
      </Box>
    </Box>
  );
}

function SectionSummary({ basic, personality, skillsText, prefs }) {
  const mbti = useMemo(() => {
    const dims = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const q of personalityQuestions) {
      const v = Number(personality[q.id] || 0);
      dims[q.dim] += v;
    }
    const letter = (a, b) => dims[a] === dims[b] ? "X" : dims[a] > dims[b] ? a : b;
    return `${letter("E", "I")}${letter("S", "N")}${letter("T", "F")}${letter("J", "P")}`;
  }, [personality]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>4) Summary</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom align="left" sx={{ lineHeight: 1.5 }}>Basic Info</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Name:</strong> {basic.name || "-"}</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Education:</strong> {basic.edu || "-"}</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Status:</strong> {basic.status || "-"}</Typography>
        </Box>

        <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom align="left" sx={{ lineHeight: 1.5 }}>Personality (MBTI-style)</Typography>
          <Typography variant="h4" align="left" sx={{ lineHeight: 1.7 }}>{mbti}</Typography>
        </Box>

        <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom align="left" sx={{ lineHeight: 1.5 }}>Skills & Preferences</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Skills:</strong> {skillsText || "-"}</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Target Roles:</strong> {prefs.roles.join(', ') || "-"}</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Target Industries:</strong> {prefs.industries.join(', ') || "-"}</Typography>
          <Typography align="left" sx={{ lineHeight: 1.7 }}><strong>Work Mode:</strong> {prefs.workMode || "-"}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ====== Small Helper Components ======

function MuiSelect({ label, name, value, onChange, options }) {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} name={name} value={value} onChange={onChange} sx={{ textAlign: 'left' }}>
        {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
