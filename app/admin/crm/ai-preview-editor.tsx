"use client";
import { useEffect, useRef, useState } from "react";

type Draft = { id: string; name: string; updated_version: string; lead_ids: string[] };
type Preview = { campaignNames: string[]; subject: string; body: string };

/** Explicit owner save only. Generation and editing never write a draft. */
export function AiPreviewEditor({ draft, preview, onSaved }: { draft: Draft; preview: Preview; onSaved: (saved: Draft) => void }) {
  const [name, setName] = useState(preview.campaignNames[0] ?? "");
  const [subject, setSubject] = useState(preview.subject);
  const [body, setBody] = useState(preview.body);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function save() {
    if (pending.current || !name.trim() || !subject.trim() || !body.trim()) return;
    pending.current = true;
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/crm/campaign-drafts", {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: draft.id, updatedVersion: draft.updated_version, name, subject, body, state: "draft", leadIds: draft.lead_ids }),
      });
      const saved = await response.json().catch(() => null);
      if (!mounted.current) return;
      if (!response.ok) {
        setNotice(response.status === 409 ? "This draft or its recipients changed. Reload the draft before saving; your edits have not been saved." : "Could not confirm the save. Reload the draft before trying again; no automatic retry was made.");
        return;
      }
      if (saved?.id !== draft.id || typeof saved?.updated_version !== "string" || !Array.isArray(saved?.lead_ids)) {
        setNotice("The save response could not be verified. Reload the draft before trying again; no automatic retry was made.");
        return;
      }
      onSaved(saved);
    } catch {
      if (mounted.current) setNotice("Could not confirm the save. Reload the draft before trying again; no automatic retry was made.");
    } finally {
      pending.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  return <fieldset disabled={saving}>
    <label>Campaign name<input value={name} onChange={event => setName(event.target.value)} maxLength={120}/></label>
    <p className="quiet">Name suggestions: {preview.campaignNames.join(" · ")}</p>
    <label>Suggested subject<input value={subject} onChange={event => setSubject(event.target.value)} maxLength={240}/></label>
    <label>Suggested body<textarea value={body} onChange={event => setBody(event.target.value)} maxLength={8000}/></label>
    <p className="quiet">Edits remain local until you explicitly save. Saving updates this internal draft only; it does not approve, attach evidence, or send anything.</p>
    <button type="button" disabled={saving || !name.trim() || !subject.trim() || !body.trim()} onClick={() => void save()}>Save reviewed suggestion as internal draft</button>
    {saving && <p role="status">Saving internal draft…</p>}
    {notice && <p role="alert">{notice}</p>}
  </fieldset>;
}
