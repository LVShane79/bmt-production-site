"use client";

import { useEffect, useMemo, useState } from "react";

type FormState = Record<string, string>;

const initialState: FormState = {
  projectName: "",
  organization: "",
  contact: "",
  location: "",
  projectType: "",
  currentPhase: "",
  targetDate: "",
  objectives: "",
  spaces: "",
  users: "",
  systems: "",
  existingConditions: "",
  network: "",
  integrations: "",
  standards: "",
  preferredBrands: "",
  clientRequestedBrands: "",
  excludedBrands: "",
  budget: "",
  decisionProcess: "",
  stakeholders: "",
  risks: "",
  deliverables: "",
  support: "",
  notes: "",
};

const systemOptions = [
  "Audio reinforcement",
  "Video presentation",
  "Video conferencing",
  "Control systems",
  "AV-over-IP / networked AV",
  "Digital signage",
  "Room scheduling",
  "Broadcast / streaming",
  "Acoustics",
  "Structured cabling",
];

const summaryLabels: Record<string, string> = {
  projectName: "Project",
  organization: "Organization",
  contact: "Primary contact",
  location: "Location",
  projectType: "Project type",
  currentPhase: "Current phase",
  targetDate: "Target completion",
  objectives: "Business objectives and success criteria",
  spaces: "Spaces and quantities",
  users: "Users and workflows",
  systems: "Systems in scope",
  existingConditions: "Existing conditions",
  network: "Network and infrastructure",
  integrations: "Required integrations",
  standards: "Standards and preferences",
  preferredBrands: "Preferred manufacturers",
  clientRequestedBrands: "Client-requested or mandated manufacturers",
  excludedBrands: "Excluded manufacturers",
  budget: "Budget and procurement",
  decisionProcess: "Decision and approval process",
  stakeholders: "Stakeholders",
  risks: "Known risks and constraints",
  deliverables: "Expected deliverables",
  support: "Construction and commissioning support",
  notes: "Additional notes",
};

function TextField({ label, name, value, onChange, type = "text", placeholder }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="question-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function TextArea({ label, name, value, onChange, placeholder }: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="question-field question-wide">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} rows={4} />
    </label>
  );
}

export default function QuestionnaireForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bmt-project-questionnaire");
      if (saved) setForm({ ...initialState, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("bmt-project-questionnaire", JSON.stringify(form));
  }, [form]);

  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const answered = useMemo(() => Object.values(form).filter((value) => value.trim()).length, [form]);
  const completion = Math.round((answered / Object.keys(initialState).length) * 100);

  const summary = useMemo(() => {
    const lines = ["BMT AV PROJECT QUESTIONNAIRE", ""];
    Object.entries(summaryLabels).forEach(([key, label]) => {
      if (form[key]?.trim()) lines.push(`${label}\n${form[key].trim()}\n`);
    });
    return lines.join("\n");
  }, [form]);

  const toggleSystem = (system: string) => {
    const selected = form.systems ? form.systems.split("|") : [];
    update("systems", selected.includes(system) ? selected.filter((item) => item !== system).join("|") : [...selected, system].join("|"));
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary.replaceAll("|", ", "));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const clearForm = () => {
    if (window.confirm("Clear every answer in this questionnaire?")) setForm(initialState);
  };

  return (
    <div className="questionnaire-shell">
      <aside className="questionnaire-rail">
        <span>Questionnaire progress</span>
        <strong>{completion}<small>%</small></strong>
        <div className="question-progress"><i style={{ width: `${completion}%` }} /></div>
        <p>Your answers save automatically on this device.</p>
        <nav aria-label="Questionnaire sections">
          <a href="#project-context">01 · Project context</a>
          <a href="#needs">02 · Needs and spaces</a>
          <a href="#technology">03 · Technology</a>
          <a href="#delivery">04 · Delivery</a>
          <a href="#summary">05 · Summary</a>
        </nav>
      </aside>

      <div className="questionnaire-form">
        <section className="question-section" id="project-context">
          <div className="question-heading"><span>01</span><div><p>Project context</p><h2>Start with the assignment.</h2></div></div>
          <div className="question-grid">
            <TextField label="Project name" name="projectName" value={form.projectName} onChange={update} />
            <TextField label="Organization / client" name="organization" value={form.organization} onChange={update} />
            <TextField label="Primary contact" name="contact" value={form.contact} onChange={update} placeholder="Name, role, email" />
            <TextField label="Project location" name="location" value={form.location} onChange={update} />
            <TextField label="Project type" name="projectType" value={form.projectType} onChange={update} placeholder="New construction, renovation, refresh…" />
            <TextField label="Current project phase" name="currentPhase" value={form.currentPhase} onChange={update} placeholder="Programming, SD, DD, construction…" />
            <TextField label="Target completion" name="targetDate" value={form.targetDate} onChange={update} type="date" />
          </div>
        </section>

        <section className="question-section" id="needs">
          <div className="question-heading"><span>02</span><div><p>Needs and spaces</p><h2>Define what success looks like.</h2></div></div>
          <div className="question-grid">
            <TextArea label="What business or operational problem should this project solve?" name="objectives" value={form.objectives} onChange={update} placeholder="Describe the desired outcome and how success will be measured." />
            <TextArea label="What spaces are included, and how many of each?" name="spaces" value={form.spaces} onChange={update} placeholder="Conference rooms, training rooms, divisible spaces, public areas…" />
            <TextArea label="Who will use the systems, and what must they be able to do?" name="users" value={form.users} onChange={update} placeholder="Typical users, support staff, accessibility needs, critical workflows…" />
          </div>
        </section>

        <section className="question-section" id="technology">
          <div className="question-heading"><span>03</span><div><p>Technology and infrastructure</p><h2>Establish the system boundaries.</h2></div></div>
          <fieldset className="system-picker">
            <legend>Systems that may be in scope</legend>
            {systemOptions.map((system) => (
              <label key={system}>
                <input type="checkbox" checked={form.systems.split("|").includes(system)} onChange={() => toggleSystem(system)} />
                <span>{system}</span>
              </label>
            ))}
          </fieldset>
          <div className="question-grid">
            <TextArea label="Existing systems and conditions" name="existingConditions" value={form.existingConditions} onChange={update} placeholder="What will remain, be removed, or be reused?" />
            <TextArea label="Network, power, pathways, and cabling" name="network" value={form.network} onChange={update} placeholder="Available infrastructure, IT ownership, switch standards, VLANs, rack locations…" />
            <TextArea label="Required integrations" name="integrations" value={form.integrations} onChange={update} placeholder="UC platforms, calendaring, control, lighting, shades, security, BMS…" />
            <TextArea label="Standards and preferences" name="standards" value={form.standards} onChange={update} placeholder="Approved manufacturers, enterprise standards, support constraints…" />
          </div>
          <div className="brand-preferences">
            <div className="brand-preferences-heading">
              <span>Manufacturer direction</span>
              <p>Separate preferences from requirements so the project team knows where substitutions are possible.</p>
            </div>
            <div className="question-grid">
              <TextArea label="Preferred manufacturers" name="preferredBrands" value={form.preferredBrands} onChange={update} placeholder="Brands the design team or organization prefers, plus the reason where helpful." />
              <TextArea label="Client-requested or mandated manufacturers" name="clientRequestedBrands" value={form.clientRequestedBrands} onChange={update} placeholder="Required brands, product families, contractual standards, or owner-furnished equipment." />
              <TextArea label="Excluded manufacturers" name="excludedBrands" value={form.excludedBrands} onChange={update} placeholder="Brands that should not be used, including support, security, compatibility, or procurement reasons." />
            </div>
          </div>
        </section>

        <section className="question-section" id="delivery">
          <div className="question-heading"><span>04</span><div><p>Delivery and constraints</p><h2>Clarify constraints before they affect delivery.</h2></div></div>
          <div className="question-grid">
            <TextArea label="Budget and procurement approach" name="budget" value={form.budget} onChange={update} placeholder="Budget range, funding status, alternates, procurement rules…" />
            <TextArea label="Decision and approval process" name="decisionProcess" value={form.decisionProcess} onChange={update} placeholder="Who decides, what requires approval, and when?" />
            <TextArea label="Key stakeholders" name="stakeholders" value={form.stakeholders} onChange={update} placeholder="Client, IT, facilities, architect, GC, consultants, operations…" />
            <TextArea label="Known risks and constraints" name="risks" value={form.risks} onChange={update} placeholder="Schedule, access, long-lead items, security, occupied spaces…" />
            <TextArea label="Expected engineering deliverables" name="deliverables" value={form.deliverables} onChange={update} placeholder="Narrative, drawings, specifications, BOM, network schedules, as-builts…" />
            <TextArea label="Construction, commissioning, and turnover support" name="support" value={form.support} onChange={update} placeholder="Submittals, RFIs, site visits, testing, training, closeout…" />
            <TextArea label="Anything else the project team should know?" name="notes" value={form.notes} onChange={update} />
          </div>
        </section>

        <section className="question-summary" id="summary">
          <div>
            <p>05 · Project brief</p>
            <h2>Turn the conversation into a starting point.</h2>
            <span>Only answered questions appear in the summary.</span>
          </div>
          <pre>{summary.replaceAll("|", ", ")}</pre>
          <div className="summary-actions">
            <button className="button button-dark" onClick={copySummary}>{copied ? "Summary copied ✓" : "Copy summary"}</button>
            <button className="button button-outline" onClick={() => window.print()}>Print / save PDF</button>
            <button className="clear-questionnaire" onClick={clearForm}>Clear questionnaire</button>
          </div>
        </section>
      </div>
    </div>
  );
}
