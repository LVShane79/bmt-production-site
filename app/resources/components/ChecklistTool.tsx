"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackSiteEvent } from "../../lib/analytics";

export type ChecklistSection = {
  title: string;
  description: string;
  items: string[];
};

type Area = { id: string; name: string };
type AreaRecords<T> = Record<string, Record<string, T>>;

export default function ChecklistTool({ storageKey, title, sections, allowMultipleAreas = false }: {
  storageKey: string;
  title: string;
  sections: ChecklistSection[];
  allowMultipleAreas?: boolean;
}) {
  const allItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);
  const [areas, setAreas] = useState<Area[]>([{ id: "area-1", name: "Room 1" }]);
  const [activeAreaId, setActiveAreaId] = useState("area-1");
  const [checkedByArea, setCheckedByArea] = useState<AreaRecords<boolean>>({ "area-1": {} });
  const [notesByArea, setNotesByArea] = useState<AreaRecords<string>>({ "area-1": {} });
  const [excludedByArea, setExcludedByArea] = useState<AreaRecords<boolean>>({ "area-1": {} });
  const [project, setProject] = useState("");
  const [location, setLocation] = useState("");
  const hasLoadedSavedState = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          const savedAreas = Array.isArray(data.areas) && data.areas.length ? data.areas : [{ id: "area-1", name: data.location || "Room 1" }];
          setAreas(savedAreas);
          setActiveAreaId(data.activeAreaId && savedAreas.some((area: Area) => area.id === data.activeAreaId) ? data.activeAreaId : savedAreas[0].id);
          setCheckedByArea(data.checkedByArea || { [savedAreas[0].id]: data.checked || {} });
          setNotesByArea(data.notesByArea || { [savedAreas[0].id]: data.notes || {} });
          setExcludedByArea(data.excludedByArea || { [savedAreas[0].id]: {} });
          setProject(data.project || "");
          setLocation(data.location || "");
        }
      } catch {
        // Ignore malformed local data and start with a clean checklist.
      } finally {
        hasLoadedSavedState.current = true;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedSavedState.current) return;
    localStorage.setItem(storageKey, JSON.stringify({ areas, activeAreaId, checkedByArea, notesByArea, excludedByArea, project, location }));
  }, [areas, activeAreaId, checkedByArea, notesByArea, excludedByArea, project, location, storageKey]);

  const checked = checkedByArea[activeAreaId] || {};
  const notes = notesByArea[activeAreaId] || {};
  const excluded = excludedByArea[activeAreaId] || {};
  const includedItems = allItems.filter((item) => !excluded[item]);
  const completed = includedItems.filter((item) => checked[item]).length;
  const percent = includedItems.length ? Math.round((completed / includedItems.length) * 100) : 100;
  const activeArea = areas.find((area) => area.id === activeAreaId) || areas[0];
  const activeAreaName = activeArea.name.trim() || "Unnamed room";

  const selectArea = (id: string) => {
    setActiveAreaId(id);
    window.requestAnimationFrame(() => document.getElementById("active-room-survey")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const addArea = () => {
    const id = `area-${Date.now()}`;
    const nextArea = { id, name: `Room ${areas.length + 1}` };
    setAreas((current) => [...current, nextArea]);
    setCheckedByArea((current) => ({ ...current, [id]: {} }));
    setNotesByArea((current) => ({ ...current, [id]: {} }));
    setExcludedByArea((current) => ({ ...current, [id]: {} }));
    setActiveAreaId(id);
  };

  const deleteArea = () => {
    if (areas.length <= 1 || !confirm(`Delete ${activeArea.name} and all of its survey notes?`)) return;
    const remaining = areas.filter((area) => area.id !== activeAreaId);
    setAreas(remaining);
    setCheckedByArea((current) => { const next = { ...current }; delete next[activeAreaId]; return next; });
    setNotesByArea((current) => { const next = { ...current }; delete next[activeAreaId]; return next; });
    setExcludedByArea((current) => { const next = { ...current }; delete next[activeAreaId]; return next; });
    setActiveAreaId(remaining[0].id);
  };

  const reset = () => {
    if (!confirm("Clear this checklist?")) return;
    setAreas([{ id: "area-1", name: "Room 1" }]);
    setActiveAreaId("area-1");
    setCheckedByArea({ "area-1": {} });
    setNotesByArea({ "area-1": {} });
    setExcludedByArea({ "area-1": {} });
    setProject("");
    setLocation("");
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    const drawPageHeader = () => {
      doc.setTextColor(24, 32, 34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text(`BMT ${title}`, margin, 38);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`${project.trim() || "Untitled project"}${location.trim() ? ` · ${location.trim()}` : ""}`, margin, 54);
      doc.setDrawColor(0, 170, 168);
      doc.line(margin, 64, pageWidth - margin, 64);
      return 82;
    };

    const ensureSpace = (height: number) => {
      if (y + height <= pageHeight - 40) return;
      doc.addPage();
      y = drawPageHeader();
    };

    y = drawPageHeader();
    const exportedAreas = allowMultipleAreas ? areas : [{ id: activeAreaId, name: location.trim() || title }];
    exportedAreas.forEach((area, areaIndex) => {
      if (areaIndex > 0) {
        doc.addPage();
        y = drawPageHeader();
      }
      const areaChecked = checkedByArea[area.id] || {};
      const areaNotes = notesByArea[area.id] || {};
      const areaExcluded = excludedByArea[area.id] || {};
      const reportItems = allItems.filter((item) => !areaExcluded[item]);
      const areaComplete = reportItems.filter((item) => areaChecked[item]).length;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(area.name.trim() || `Room ${areaIndex + 1}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${areaComplete} of ${reportItems.length} included items complete`, pageWidth - margin, y, { align: "right" });
      y += 24;

      sections.forEach((section, sectionIndex) => {
        ensureSpace(52);
        doc.setFillColor(220, 232, 230);
        doc.rect(margin, y, contentWidth, 28, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${String(sectionIndex + 1).padStart(2, "0")}  ${section.title}`, margin + 8, y + 18);
        y += 36;

        section.items.filter((item) => !areaExcluded[item]).forEach((item) => {
          const note = areaNotes[item] || "";
          const itemLines = doc.splitTextToSize(item, contentWidth - 34);
          const noteLines = note ? doc.splitTextToSize(`Notes: ${note}`, contentWidth - 34) : [];
          const rowHeight = Math.max(26, itemLines.length * 10 + noteLines.length * 9 + 12);
          ensureSpace(rowHeight);
          doc.setDrawColor(205, 214, 212);
          doc.rect(margin, y, contentWidth, rowHeight);
          doc.setDrawColor(areaChecked[item] ? 0 : 97, areaChecked[item] ? 107 : 112, areaChecked[item] ? 103 : 117);
          doc.rect(margin + 8, y + 7, 8, 8);
          if (areaChecked[item]) {
            doc.line(margin + 9, y + 8, margin + 15, y + 14);
            doc.line(margin + 15, y + 8, margin + 9, y + 14);
          }
          doc.setTextColor(24, 32, 34);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.text(itemLines, margin + 25, y + 14);
          if (noteLines.length) {
            doc.setTextColor(97, 112, 117);
            doc.setFontSize(7.5);
            doc.text(noteLines, margin + 25, y + 14 + itemLines.length * 10);
          }
          y += rowHeight;
        });
        y += 14;
      });
    });
    const filename = `${(project.trim() || `BMT-${title}`).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.pdf`;
    trackSiteEvent("resource_export", {
      resource: storageKey,
      format: "pdf",
      completion: percent,
      area_count: allowMultipleAreas ? areas.length : 1,
    });
    doc.save(filename);
  };

  const downloadBlankWorksheet = async () => {
    const response = window.prompt("How many room worksheets would you like?", String(Math.max(areas.length, 1)));
    if (response === null) return;
    const roomCount = Number.parseInt(response.trim(), 10);
    if (!Number.isInteger(roomCount) || roomCount < 1 || roomCount > 50) {
      window.alert("Enter a room count from 1 to 50.");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;
    let currentRoom = 1;

    const drawBlankHeader = () => {
      doc.setTextColor(24, 32, 34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`BMT ${title} — Blank Field Worksheet`, margin, 34);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Room ${currentRoom} of ${roomCount}`, pageWidth - margin, 34, { align: "right" });
      doc.setDrawColor(0, 170, 168);
      doc.line(margin, 45, pageWidth - margin, 45);
      doc.setTextColor(24, 32, 34);
      doc.setFontSize(9);
      doc.text("Project:", margin, 65);
      doc.line(margin + 38, 67, margin + 250, 67);
      doc.text("Date:", margin + 270, 65);
      doc.line(margin + 300, 67, pageWidth - margin, 67);
      doc.text("Location:", margin, 84);
      doc.line(margin + 46, 86, margin + 250, 86);
      doc.text("Surveyor:", margin + 270, 84);
      doc.line(margin + 315, 86, pageWidth - margin, 86);
      doc.text("Room name / number:", margin, 103);
      doc.line(margin + 105, 105, pageWidth - margin, 105);
      return 122;
    };

    const ensureBlankSpace = (height: number) => {
      if (y + height <= pageHeight - 34) return;
      doc.addPage();
      y = drawBlankHeader();
    };

    for (let roomIndex = 0; roomIndex < roomCount; roomIndex += 1) {
      currentRoom = roomIndex + 1;
      if (roomIndex > 0) doc.addPage();
      y = drawBlankHeader();

      sections.forEach((section, sectionIndex) => {
        ensureBlankSpace(38);
        doc.setFillColor(220, 232, 230);
        doc.rect(margin, y, contentWidth, 24, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(`${String(sectionIndex + 1).padStart(2, "0")}  ${section.title}`, margin + 8, y + 16);
        y += 30;

        section.items.forEach((item) => {
          const itemLines = doc.splitTextToSize(item, contentWidth - 32);
          const rowHeight = Math.max(40, itemLines.length * 10 + 26);
          ensureBlankSpace(rowHeight);
          doc.setDrawColor(196, 207, 205);
          doc.rect(margin, y, contentWidth, rowHeight);
          doc.rect(margin + 8, y + 8, 9, 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.3);
          doc.setTextColor(24, 32, 34);
          doc.text(itemLines, margin + 25, y + 15);
          doc.setDrawColor(220, 225, 224);
          doc.line(margin + 25, y + rowHeight - 9, pageWidth - margin - 8, y + rowHeight - 9);
          y += rowHeight;
        });
        y += 10;
      });
    }

    const filename = `${(project.trim() || "BMT-Site-Survey").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-Blank-${roomCount}-Room${roomCount === 1 ? "" : "s"}.pdf`;
    trackSiteEvent("resource_export", {
      resource: storageKey,
      format: "blank_worksheet_pdf",
      area_count: roomCount,
    });
    doc.save(filename);
  };

  return (
    <div className="workflow-tool">
      <aside className="workflow-rail">
        <span>{allowMultipleAreas ? activeAreaName : "Progress"}</span>
        <strong>{percent}<small>%</small></strong>
        <div className="question-progress"><i style={{ width: `${percent}%` }} /></div>
        <p>{completed} of {includedItems.length} included items complete. Progress saves automatically on this device.</p>
        <button onClick={downloadPdf}>Download PDF</button>
        {allowMultipleAreas && <button onClick={downloadBlankWorksheet}>Print blank worksheet</button>}
        <button onClick={reset}>Reset checklist</button>
      </aside>
      <div>
        <section className="workflow-project">
          <label><span>Project</span><input value={project} onChange={(event) => setProject(event.target.value)} /></label>
          <label><span>Project location</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
        </section>
        {allowMultipleAreas && (
          <section className="area-manager">
            <div className="area-manager-heading">
              <div><span>Survey rooms</span><p>Each room keeps its own checklist and field notes.</p></div>
              <button onClick={addArea}>+ Add room</button>
            </div>
            <div className="area-tabs">
              {areas.map((area, index) => <button className={area.id === activeAreaId ? "active" : ""} onClick={() => selectArea(area.id)} key={area.id} title={area.name.trim() || `Room ${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span>{area.name.trim() || `Room ${index + 1}`}</button>)}
            </div>
            <div className="active-area-name">
              <label><span>Current room name or number</span><input value={activeArea.name} onChange={(event) => setAreas((current) => current.map((area) => area.id === activeAreaId ? { ...area, name: event.target.value } : area))} /></label>
              <button onClick={deleteArea} disabled={areas.length <= 1}>Delete room</button>
            </div>
          </section>
        )}
        {sections.map((section, sectionIndex) => (
          <section className="workflow-section" id={allowMultipleAreas && sectionIndex === 0 ? "active-room-survey" : undefined} key={section.title}>
            <div className="question-heading">
              <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
              <div><p>{allowMultipleAreas ? activeAreaName : title}</p><h2>{section.title}</h2><small>{section.description}</small></div>
            </div>
            <div className="workflow-items">
              {section.items.map((item) => (
                <article className={`${checked[item] ? "complete" : ""}${excluded[item] ? " excluded" : ""}`} key={item}>
                  <label>
                    <input type="checkbox" disabled={Boolean(excluded[item])} checked={Boolean(checked[item])} onChange={(event) => setCheckedByArea((current) => ({ ...current, [activeAreaId]: { ...(current[activeAreaId] || {}), [item]: event.target.checked } }))} />
                    <span>{item}</span>
                    <b>{excluded[item] ? "Excluded" : checked[item] ? "Complete" : "Open"}</b>
                  </label>
                  <label className="exclude-control"><input type="checkbox" checked={Boolean(excluded[item])} onChange={(event) => setExcludedByArea((current) => ({ ...current, [activeAreaId]: { ...(current[activeAreaId] || {}), [item]: event.target.checked } }))} /><span>Exclude from report</span></label>
                  <textarea rows={2} value={notes[item] || ""} onChange={(event) => setNotesByArea((current) => ({ ...current, [activeAreaId]: { ...(current[activeAreaId] || {}), [item]: event.target.value } }))} placeholder="Notes, measurements, deficiencies, or follow-up…" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
