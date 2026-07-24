"use client";

import { useEffect, useState } from "react";

const parties = ["Owner", "AV consultant / designer", "AV integrator", "IT", "Electrical", "Architect", "GC", "Manufacturer / vendor", "Other"];
const phases = [
  { key: "design", label: "Design / specify" },
  { key: "procure", label: "Procure / furnish" },
  { key: "install", label: "Install / configure" },
  { key: "commission", label: "Commission / accept" },
];
const workstreams = [
  "Overall AV system",
  "Displays, projectors, screens, and mounts",
  "Loudspeakers and amplification",
  "Microphones, DSP, and audio processing",
  "Cameras and video-conferencing systems",
  "AV control system and user interfaces",
  "AV racks, accessories, and thermal management",
  "AV structured cabling and terminations",
  "Network switches, optics, and licenses",
  "VLANs, addressing, QoS, multicast, and security",
  "Lighting-control interfaces",
  "Drapes, shades, motors, and control interfaces",
  "Acoustic treatment",
  "Furniture and millwork integration",
  "Branch power, grounding, and receptacles",
  "Conduits, sleeves, trays, and floor boxes",
  "Blocking, backing, and structural supports",
  "System monitoring and remote support",
  "Training, documentation, and closeout",
];

export default function ResponsibilityMatrix() {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [project, setProject] = useState("");
  const [customWorkstreams, setCustomWorkstreams] = useState<string[]>([]);
  const [newWorkstream, setNewWorkstream] = useState("");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("bmt-responsibility-matrix-v2") || "{}");
      setAssignments(data.assignments || {});
      setNotes(data.notes || {});
      setProject(data.project || "");
      setCustomWorkstreams(data.customWorkstreams || []);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("bmt-responsibility-matrix-v2", JSON.stringify({ assignments, notes, project, customWorkstreams }));
  }, [assignments, notes, project, customWorkstreams]);

  const assignmentKey = (workstream: string, phase: string) => `${workstream}|${phase}`;
  const allWorkstreams = [...workstreams, ...customWorkstreams];
  const assigned = allWorkstreams.reduce((total, workstream) => total + phases.filter((phase) => assignments[assignmentKey(workstream, phase.key)]).length, 0);
  const totalAssignments = allWorkstreams.length * phases.length;

  const addWorkstream = () => {
    const name = newWorkstream.trim();
    if (!name || allWorkstreams.some((workstream) => workstream.toLowerCase() === name.toLowerCase())) return;
    setCustomWorkstreams((current) => [...current, name]);
    setNewWorkstream("");
  };

  const removeWorkstream = (workstream: string) => {
    if (!confirm(`Remove the custom row “${workstream}”?`)) return;
    setCustomWorkstreams((current) => current.filter((item) => item !== workstream));
    setAssignments((current) => {
      const next = { ...current };
      phases.forEach((phase) => delete next[assignmentKey(workstream, phase.key)]);
      return next;
    });
    setNotes((current) => { const next = { ...current }; delete next[workstream]; return next; });
  };

  const resetForm = () => {
    if (!confirm("Reset the entire responsibility matrix, including all assignments, notes, and custom rows?")) return;
    setAssignments({});
    setNotes({});
    setProject("");
    setCustomWorkstreams([]);
    setNewWorkstream("");
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 34;
    const columns = [margin, 180, 300, 420, 540, 660];
    const widths = [146, 120, 120, 120, 120, pageWidth - margin - 660];

    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("BMT AV Scope Responsibility Matrix", margin, 34);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(project.trim() || "Untitled project", margin, 51);
      const labels = ["AV workstream", ...phases.map((phase) => phase.label), "Notes / boundaries"];
      doc.setFillColor(24, 32, 34);
      doc.rect(margin, 64, pageWidth - margin * 2, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      labels.forEach((label, index) => doc.text(label.toUpperCase(), columns[index] + 5, 80));
      doc.setTextColor(24, 32, 34);
      return 89;
    };

    let y = drawHeader();
    allWorkstreams.forEach((workstream) => {
      const values = [
        workstream,
        ...phases.map((phase) => assignments[assignmentKey(workstream, phase.key)] || "Unassigned"),
        notes[workstream] || "",
      ];
      const wrapped = values.map((value, index) => doc.splitTextToSize(value, widths[index] - 10));
      const rowHeight = Math.max(28, Math.max(...wrapped.map((lines) => lines.length)) * 9 + 10);
      if (y + rowHeight > doc.internal.pageSize.getHeight() - 28) {
        doc.addPage();
        y = drawHeader();
      }
      doc.setDrawColor(200, 210, 208);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      wrapped.forEach((lines, index) => {
        doc.rect(columns[index], y, widths[index], rowHeight);
        doc.text(lines, columns[index] + 5, y + 11);
      });
      y += rowHeight;
    });
    const filename = `${(project.trim() || "BMT-AV-Responsibility-Matrix").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="matrix-shell">
      <div className="matrix-toolbar">
        <label><span>Project</span><input value={project} onChange={(event) => setProject(event.target.value)} /></label>
        <p><strong>{assigned}</strong> of {totalAssignments} phase assignments complete</p>
        <div className="matrix-toolbar-actions"><button onClick={downloadPdf}>Download PDF</button><button className="matrix-reset" onClick={resetForm}>Reset form</button></div>
      </div>
      <div className="matrix-guidance">
        <span>How to use this matrix</span>
        <p>Assign each phase separately. Leave a phase unassigned when it does not apply, and use the notes column to define handoffs, exclusions, owner-furnished equipment, or split responsibilities.</p>
      </div>
      <div className="matrix-table-wrap">
        <table className="matrix-table matrix-phase-table">
          <thead><tr><th>AV workstream</th>{phases.map((phase) => <th key={phase.key}>{phase.label}</th>)}<th>Notes / boundaries</th></tr></thead>
          <tbody>{allWorkstreams.map((workstream) => <tr className={customWorkstreams.includes(workstream) ? "custom-matrix-row" : ""} key={workstream}>
            <th className="matrix-workstream"><span>{workstream}</span>{customWorkstreams.includes(workstream) && <button aria-label={`Delete custom row ${workstream}`} onClick={() => removeWorkstream(workstream)}>Delete custom row</button>}</th>
            {phases.map((phase) => {
              const key = assignmentKey(workstream, phase.key);
              return <td key={phase.key}><select aria-label={`${workstream}: ${phase.label}`} value={assignments[key] || ""} onChange={(event) => setAssignments((current) => ({ ...current, [key]: event.target.value }))}><option value="">Unassigned</option>{parties.map((party) => <option key={party}>{party}</option>)}</select></td>;
            })}
            <td><input aria-label={`${workstream}: notes`} value={notes[workstream] || ""} onChange={(event) => setNotes((current) => ({ ...current, [workstream]: event.target.value }))} placeholder="Handoffs, exclusions, split scope…" /></td>
          </tr>)}</tbody>
        </table>
      </div>
      <section className="custom-row-adder">
        <div><span>Add a custom workstream</span><p>Use custom rows for project-specific systems, trades, owner-furnished equipment, or unusual scope boundaries.</p></div>
        <div><input value={newWorkstream} onChange={(event) => setNewWorkstream(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addWorkstream(); }} placeholder="Example: Broadcast studio equipment" /><button onClick={addWorkstream} disabled={!newWorkstream.trim()}>+ Add row</button></div>
      </section>
    </div>
  );
}
