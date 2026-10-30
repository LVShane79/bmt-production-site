"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Recipient = { leadId: string; email: string; company: string; eligible: boolean; holdReasons: string[] };
type Attempt = { id: string; leadId: string; draftId?: string; draftVersion?: string; recipientEmail?: string; state: "claimed" | "pending" | "sent" | "failed" | "unknown"; providerMessageId?: string | null };
type SendStatus = { connected: boolean; sendEnabled: boolean; configured?: boolean; draft: { id: string; version: string; name: string; subject: string; body: string; state: string; recipients: Recipient[] }; attempts: Attempt[]; successfulBackup: { id: string; completedAt: string } | null };
type Context = { leadId: string; kind: "requested" | "invited"; evidence: string; source: string; observedAt: string; purpose: string };
type Snapshot = { draftId: string; messageVersion: string; from: string; recipients: Array<{ leadId: string; to: string; subject: string; body: string }> };
type Props = { draftId: string | null; messageVersion: string | null; editorDirty: boolean; editorCurrent: boolean; editorState: string };
const sender = "info@blackmountain.tech";
const states = ["claimed", "pending", "sent", "failed", "unknown"];
function isStatus(value: unknown): value is SendStatus {
  if (!value || typeof value !== "object") return false;
  const v = value as SendStatus, d = v.draft;
  return typeof v.connected === "boolean" && typeof v.sendEnabled === "boolean" && Boolean(d) &&
    [d.id, d.version, d.name, d.subject, d.body, d.state].every(x => typeof x === "string") &&
    Array.isArray(d.recipients) && d.recipients.length <= 10 && d.recipients.every(r => r && typeof r.leadId === "string" && typeof r.email === "string" && typeof r.company === "string" && typeof r.eligible === "boolean" && Array.isArray(r.holdReasons) && r.holdReasons.every(x => typeof x === "string")) &&
    new Set(d.recipients.map(r => r.leadId)).size === d.recipients.length &&
    Array.isArray(v.attempts) && v.attempts.every(a => a && typeof a.id === "string" && typeof a.leadId === "string" && (a.recipientEmail === undefined || typeof a.recipientEmail === "string") && (a.draftVersion === undefined || typeof a.draftVersion === "string") && (a.draftId === undefined || typeof a.draftId === "string") && states.includes(a.state));
}
function validSnapshot(snapshot: Snapshot | undefined, status: SendStatus, draftId: string, version: string) {
  return snapshot?.draftId === draftId && snapshot.messageVersion === version && snapshot.from === sender &&
    Array.isArray(snapshot.recipients) && snapshot.recipients.length === status.draft.recipients.length &&
    snapshot.recipients.every((r, i) => r.leadId === status.draft.recipients[i].leadId && r.to === status.draft.recipients[i].email && r.subject === status.draft.subject && r.body === status.draft.body);
}

/** All writes below are explicit human actions; mounting only reads status. */
export function HumanSendPanel(props: Props) {
  const { draftId, messageVersion, editorDirty, editorCurrent, editorState } = props;
  const [status, setStatus] = useState<SendStatus | null>(null);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [review, setReview] = useState<{ reviewId: string; snapshot: Snapshot } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [readError, setReadError] = useState(false);
  const [sendAttempted, setSendAttempted] = useState(false);
  const pending = useRef(false), active = useRef(true), sequence = useRef(0), consumed = useRef(false);
  const contextKey = JSON.stringify([draftId, messageVersion, editorDirty, editorCurrent, editorState]);
  const latestContext = useRef(contextKey);
  useLayoutEffect(() => { latestContext.current = contextKey; }, [contextKey]);
  const canPrepare = Boolean(draftId && messageVersion && !editorDirty && editorCurrent && editorState === "review_ready");
  const currentStatus = status?.draft.id === draftId && status?.draft.version === messageVersion;
  const eligible = Boolean(canPrepare && currentStatus && status?.draft.state === "review_ready" && status.draft.recipients.length && status.draft.recipients.every(r => r.eligible));
  const connectionReady = Boolean(status?.connected && status.sendEnabled);
  const alreadyAttempted = Boolean(sendAttempted || status?.attempts.some(a => ((!a.draftId || a.draftId === draftId) && (!a.draftVersion || a.draftVersion === messageVersion)) || ["claimed", "pending", "unknown"].includes(a.state)));
  const backupReady = Boolean(status?.successfulBackup?.id);
  const completeContexts = contexts.length === status?.draft.recipients.length && contexts.every(c => c.evidence.trim().length >= 10 && c.source.trim().length >= 3 && Boolean(c.observedAt) && c.purpose.trim().length >= 5);

  async function refresh() {
    if (!draftId || pending.current) return;
    const ticket = ++sequence.current, key = contextKey;
    pending.current = true; setBusy(true); setReadError(false); setReview(null); setConfirmed(false);
    try {
      const response = await fetch(`/api/admin/crm/send?draftId=${encodeURIComponent(draftId)}`, { cache: "no-store" });
      const value: unknown = await response.json();
      if (!active.current || ticket !== sequence.current || latestContext.current !== key) return;
      if (!response.ok || !isStatus(value) || value.draft.id !== draftId) throw new Error("Status unavailable");
      setStatus(value);
      setContexts(previous => value.draft.recipients.map(r => previous.find(c => c.leadId === r.leadId) ?? { leadId: r.leadId, kind: "requested", evidence: "", source: "", observedAt: "", purpose: "" }));
      if (value.draft.version !== messageVersion) setNotice("The saved draft changed. Reload its latest version before review or sending.");
    } catch { if (active.current && ticket === sequence.current && latestContext.current === key) { setStatus(null); setReadError(true); setNotice("Send status could not be verified. No send was requested by this refresh."); } }
    finally { if (ticket === sequence.current) { pending.current = false; if (active.current) setBusy(false); } }
  }
  useEffect(() => {
    const activeRef = active, sequenceRef = sequence, pendingRef = pending;
    activeRef.current = true;
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => { activeRef.current = false; sequenceRef.current++; pendingRef.current = false; window.clearTimeout(timer); };
    // Each editor identity is mounted with a fresh key by the workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeContext(index: number, field: "kind" | "evidence" | "source" | "observedAt" | "purpose", value: string) {
    setReview(null); setConfirmed(false);
    setContexts(items => items.map((item, i) => i === index ? { ...item, [field]: value } as Context : item));
  }
  async function prepareReview() {
    if (pending.current || !eligible || !completeContexts || !backupReady || !status || alreadyAttempted) return;
    pending.current = true; setBusy(true); setNotice(""); setReview(null); setConfirmed(false);
    const ticket = ++sequence.current, key = contextKey;
    try {
      const response = await fetch("/api/admin/crm/send/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftId, messageVersion, backupRunId: status.successfulBackup!.id, contexts, confirmation: true }) });
      const value = await response.json();
      if (!active.current || ticket !== sequence.current || latestContext.current !== key) return;
      if (!response.ok || typeof value.reviewId !== "string" || !validSnapshot(value.snapshot, status, draftId!, messageVersion!)) throw new Error("Review not verified");
      setReview(value); setNotice("Review recorded. No email has been sent. Check the exact messages below before pressing Send.");
    } catch { if (active.current && ticket === sequence.current && latestContext.current === key) setNotice("The review could not be confirmed. Refresh and review again; no Send action was requested."); }
    finally { if (ticket === sequence.current) { pending.current = false; if (active.current) setBusy(false); } }
  }
  async function send() {
    if (pending.current || consumed.current || !status || !validSnapshot(review?.snapshot, status, draftId!, messageVersion!) || !eligible || !connectionReady || alreadyAttempted || !review || !confirmed) return;
    if (!window.confirm(`Send ${review.snapshot.recipients.length} individually addressed email(s) from ${sender} now? This is an external action, not an internal draft save.`)) return;
    pending.current = true; consumed.current = true; setSendAttempted(true); setBusy(true); setNotice("Sending the explicitly reviewed messages once. Do not repeat this action.");
    const ticket = ++sequence.current, key = contextKey;
    try {
      const response = await fetch("/api/admin/crm/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewId: review.reviewId, confirmation: true }) });
      const value = await response.json();
      if (!active.current || ticket !== sequence.current || latestContext.current !== key) return;
      if (response.ok && value.blocked === true && value.stopped === true && Array.isArray(value.attempts) && value.attempts.length === 0) {
        consumed.current = false; setSendAttempted(false); setStatus(null); setReview(null); setConfirmed(false);
        setNotice("Sending stopped before any provider send in this action. Refresh status and review holds; an unconfirmed claim stays blocked. Nothing will be retried automatically.");
        return;
      }
      if (!response.ok || !Array.isArray(value.attempts) || !value.attempts.length || value.attempts.length > status.draft.recipients.length || !value.attempts.every((a: Attempt) => a && typeof a.id === "string" && status.draft.recipients.some(r => r.leadId === a.leadId) && states.includes(a.state))) throw new Error("Send outcome not verified");
      setStatus(previous => previous ? { ...previous, attempts: [...previous.attempts.filter(old => !value.attempts.some((a: Attempt) => a.id === old.id)), ...value.attempts] } : previous);
      setNotice(value.stopped ? "Sending stopped after the listed attempts. Remaining recipients were not attempted in this action. Review each status; nothing will be retried automatically." : "Send attempt recorded. Review each recipient’s status below. Sent means Gmail accepted the message, not delivery.");
    } catch { if (active.current && ticket === sequence.current && latestContext.current === key) setNotice("Send outcome is unknown. Do not resend. Refresh status and reconcile provider receipts before any separately reviewed recovery."); }
    finally { if (ticket === sequence.current) { pending.current = false; if (active.current) setBusy(false); } }
  }
  async function connect() {
    if (pending.current || !status?.configured || status.connected) return;
    pending.current = true; setBusy(true);
    const ticket = ++sequence.current, key = contextKey;
    try {
      const response = await fetch("/api/admin/crm/gmail/connect", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      const value = await response.json();
      if (!active.current || ticket !== sequence.current || latestContext.current !== key) return;
      if (!response.ok || typeof value.authorizationUrl !== "string") throw new Error("Connection unavailable");
      const url = new URL(value.authorizationUrl);
      if (url.protocol !== "https:" || url.hostname !== "accounts.google.com" || url.username || url.password) throw new Error("Invalid connection URL");
      window.location.assign(url.href);
    } catch { if (active.current && ticket === sequence.current && latestContext.current === key) setNotice("Gmail connection could not be started. No email was sent."); }
    finally { if (ticket === sequence.current) { pending.current = false; if (active.current) setBusy(false); } }
  }
  async function reconcile(attemptId: string) {
    if (pending.current || !status?.connected) return;
    pending.current = true; setBusy(true);
    const ticket = ++sequence.current, key = contextKey;
    try {
      const response = await fetch("/api/admin/crm/send/reconcile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId, confirmation: true }) });
      const value = await response.json();
      if (!active.current || ticket !== sequence.current || latestContext.current !== key) return;
      if (!response.ok || !value.attempt || value.attempt.id !== attemptId || !states.includes(value.attempt.state)) throw new Error("Reconciliation unavailable");
      setStatus(previous => previous ? { ...previous, attempts: previous.attempts.map(a => a.id === attemptId ? { ...a, ...value.attempt } : a) } : previous);
      setNotice(value.attempt.state === "sent" ? "A matching Gmail sent receipt was found. Delivery is not confirmed." : "No conclusive matching receipt was found. Outcome remains unknown; nothing was resent.");
    } catch { if (active.current && ticket === sequence.current && latestContext.current === key) setNotice("Receipt reconciliation could not be confirmed. Nothing was resent; keep the outcome unknown."); }
    finally { if (ticket === sequence.current) { pending.current = false; if (active.current) setBusy(false); } }
  }

  return <section className="crm-card human-send-panel" aria-label="Human-reviewed email sending">
    <p className="card-kicker">Human review & Send</p><h2>Review every recipient before sending</h2>
    <p>Saving or generating a draft never sends it. Send is a separate, explicit action with no automated follow-ups.</p>
    {!canPrepare && <p role="status">Save a current, unchanged draft as “Ready for owner review,” then load it here. Your unsaved edits will not be sent or discarded.</p>}
    {!status?.connected && <p>Gmail is not connected for this CRM. Connect Gmail requires a separate owner-authorized app connection; existing assistant or contact-form credentials are not used.</p>}
    {status?.connected && !status.sendEnabled && <p>Gmail is connected, but the Send kill switch is off. Receipt checks can still be available.</p>}
    {!status?.connected && <button type="button" disabled={!status?.configured || busy} onClick={() => void connect()}>{status?.configured ? "Connect Gmail" : "Connect Gmail — setup required"}</button>}
    <button type="button" disabled={!draftId || busy} onClick={() => void refresh()}>Refresh send status</button>
    {readError && <p role="alert">Sending is blocked until status can be verified.</p>}
    {status && <><p>Fixed From: {sender} · Saved version: {status.draft.version}</p>
      {status.draft.recipients.map((recipient, index) => <fieldset key={recipient.leadId} disabled={busy || !eligible || alreadyAttempted}>
        <legend>{recipient.company} — {recipient.email}</legend>
        {!recipient.eligible && <p role="alert">Held: {recipient.holdReasons.join("; ") || "recipient is not eligible"}</p>}
        <label>Contact context<select value={contexts[index]?.kind ?? "requested"} onChange={e => changeContext(index, "kind", e.target.value)}><option value="requested">Recipient requested this information</option><option value="invited">Recipient invited this relevant business inquiry</option></select></label>
        <label>Request or invitation evidence<textarea value={contexts[index]?.evidence ?? ""} onChange={e => changeContext(index, "evidence", e.target.value)} maxLength={2000} placeholder="Record the actual request or invitation, source/date and how it covers this recipient."/></label>
        <label>Source URL or reference<input value={contexts[index]?.source ?? ""} onChange={e => changeContext(index, "source", e.target.value)} maxLength={2000} placeholder="Exact source URL, message reference or dated conversation record"/></label>
        <label>Request or invitation date<input type="date" max={new Date().toISOString().slice(0, 10)} value={contexts[index]?.observedAt ?? ""} onChange={e => changeContext(index, "observedAt", e.target.value)}/></label>
        <label>Intended message purpose<textarea value={contexts[index]?.purpose ?? ""} onChange={e => changeContext(index, "purpose", e.target.value)} maxLength={1000} placeholder="Explain how this exact message fits that request or invitation."/></label>
      </fieldset>)}
      <p>{status.successfulBackup ? `Verified pre-campaign backup: ${status.successfulBackup.id} · completed ${status.successfulBackup.completedAt}` : "Sending requires a successful pre-campaign backup started after this saved draft version. No verified backup is available; review and Send remain blocked."}</p>
      <p>A public address, company research, or your click is not proof of recipient consent. Record the real context; this review does not override provider policy or recipient holds.</p>
      <button type="button" disabled={busy || !eligible || !completeContexts || !backupReady || alreadyAttempted} onClick={() => void prepareReview()}>Record context and review exact messages</button>
    </>}
    {review && <section aria-label="Exact messages to send"><h3>Final message review</h3>{review.snapshot.recipients.map(r => <article key={r.leadId}><p>From: {review.snapshot.from}<br/>To: {r.to}</p><h4>{r.subject}</h4><pre style={{ whiteSpace: "pre-wrap" }}>{r.body}</pre></article>)}<label><input type="checkbox" checked={confirmed} disabled={busy || alreadyAttempted || !eligible} onChange={e => setConfirmed(e.target.checked)}/>I reviewed every exact recipient and message above, and the recorded request or invitation supports this purpose.</label></section>}
    <button type="button" disabled={busy || !eligible || !connectionReady || alreadyAttempted || !review || !confirmed} onClick={() => void send()}>Send</button>
    {busy && <p role="status">Working…</p>}{notice && <p role="status">{notice}</p>}
    {status?.attempts.map(attempt => <article key={attempt.id}><p>Draft: {attempt.draftId ?? draftId} · version: {attempt.draftVersion ?? messageVersion} {(attempt.draftId && attempt.draftId !== draftId) || (attempt.draftVersion && attempt.draftVersion !== messageVersion) ? "(historical — not this editor version)" : "(current saved version)"}</p><strong>{attempt.recipientEmail ?? status.draft.recipients.find(r => r.leadId === attempt.leadId)?.email ?? "Prior reviewed recipient"}: {attempt.state === "sent" ? "Sent — Gmail accepted; delivery unconfirmed" : attempt.state === "failed" ? "Failed — not automatically retried" : "Unknown / pending — do not resend"}</strong>{["unknown", "claimed", "pending"].includes(attempt.state) && <button type="button" disabled={busy || !status.connected} onClick={() => void reconcile(attempt.id)}>Check provider receipt</button>}</article>)}
  </section>;
}
