import type { Lead, LeadStatus } from "./crm";

export type OutreachEvent = { id: string; leadId: string; occurredAt: string | null; eventType: string; detail: unknown };
export type CampaignMarker = { id: string; importedAt: string; sourceChecksum: string };
export type CrmDashboardData = { leads: Lead[]; events: OutreachEvent[]; campaigns: CampaignMarker[] };
export type DashboardEvent = { id: string; leadId: string; company: string; date: string; kind: "recorded" | "due" | "history"; title: string; detail: string };

const suppressed = new Set<LeadStatus>(["Bounced", "Opted out"]);
export type OutreachStage = "initial" | "first_followup" | "final_followup";
export type OutreachEvidence = { id:string; leadId:string; date:string; stage:OutreachStage; confidence:"explicit"|"inferred"; source:"notes"|"record" };
const iso = /\b(20\d{2}-\d{2}-\d{2})\b/;
const stage = (line:string):OutreachStage|null => /first\s*follow[ -]?up|follow[ -]?up\s*1/i.test(line) ? "first_followup" : /final\s*follow[ -]?up/i.test(line) ? "final_followup" : /personalized outreach|initial outreach/i.test(line) ? "initial" : null;
const positive = (line:string) => /\bsent\b/i.test(line) && !/\bunsent\b|not\s+sent|scheduled|due|draft/i.test(line);
export function reconstructOutreach(lead:Lead):OutreachEvidence[] { const snapshot=lead.legacySnapshot as Record<string,unknown>; const notes=typeof snapshot?.notes==="string"?snapshot.notes:""; const seen=new Set<string>(); const found:OutreachEvidence[]=[]; for(const line of notes.replaceAll("\\n","\n").split(/\r?\n/)){const date=line.match(iso)?.[1], kind=stage(line); if(!date||!kind||!positive(line))continue;const key=`${lead.id}:${date}:${kind}`;if(!seen.has(key)){seen.add(key);found.push({id:key,leadId:lead.id,date,stage:kind,confidence:"explicit",source:"notes"});}} const imported=Object.prototype.hasOwnProperty.call(snapshot,"status")||Object.prototype.hasOwnProperty.call(snapshot,"firstContact"); const sourceStatus=imported?snapshot.status:lead.status; const sourceDate=imported?snapshot.firstContact:lead.firstContact; if(typeof sourceDate==="string"&& !found.some(x=>x.stage==="initial"&&x.date===sourceDate)&&["Contacted","Bounced"].includes(String(sourceStatus))){found.push({id:`${lead.id}:${sourceDate}:initial:record`,leadId:lead.id,date:sourceDate,stage:"initial",confidence:"inferred",source:"record"});} return found; }
const date = (value: string | null) => value ? value.slice(0, 10) : null;
const eventDetail = (value: unknown) => {
  if (!value || typeof value !== "object") return "Imported historical record";
  const record = value as Record<string, unknown>;
  return typeof record.note === "string" ? record.note.slice(0, 180) : "Imported historical record";
};

export function isSuppressed(lead: Lead) { return suppressed.has(lead.status); }
export function hasCompletedSequence(lead: Lead) { return lead.nextStep === "Monitor for reply; no further automated outreach"; }
export function isAutomatedEmailEligible(lead: Lead) { return !isSuppressed(lead) && !hasCompletedSequence(lead) && lead.historyState === "clear"; }
export function isCallable(lead: Lead) { return !isSuppressed(lead) && Boolean(lead.phone) && !["Do not call", "Wrong number", "Spoke — no current need"].includes(lead.response ?? ""); }

export function buildCrmDashboard(data: CrmDashboardData) {
  const { leads, events, campaigns } = data;
  const count = (status: LeadStatus) => leads.filter((lead) => lead.status === status).length;
  const protectedHistory = leads.filter((lead) => lead.historyState !== "clear").length;
  const scheduledFollowUps = leads.filter((lead) => Boolean(lead.followUp) && !isSuppressed(lead));
  const firstContacts = leads.filter((lead) => Boolean(lead.firstContact));
  const dueQueue = [...scheduledFollowUps].sort((a, b) => (a.followUp ?? "").localeCompare(b.followUp ?? ""));
  const onDeck = leads.filter((lead) => !isSuppressed(lead) && !lead.firstContact).sort((a, b) => b.score - a.score);
  const byId = new Map(leads.map((lead) => [lead.id, lead]));
  const reconstructed = leads.flatMap(reconstructOutreach);
  const timeline: DashboardEvent[] = [
    ...firstContacts.map((lead) => ({ id: `first-${lead.id}`, leadId: lead.id, company: lead.company, date: lead.firstContact!, kind: "recorded" as const, title: "First contact recorded", detail: "Preserved source contact date" })),
    ...scheduledFollowUps.map((lead) => ({ id: `due-${lead.id}`, leadId: lead.id, company: lead.company, date: lead.followUp!, kind: "due" as const, title: "Follow-up due", detail: lead.historyState === "clear" ? "Scheduled review date" : "Review history before outreach" })),
    ...events.filter((event) => date(event.occurredAt)).map((event) => ({ id: `history-${event.id}`, leadId: event.leadId, company: byId.get(event.leadId)?.company ?? "Imported record", date: date(event.occurredAt)!, kind: "history" as const, title: event.eventType.replaceAll(/[_-]/g, " "), detail: eventDetail(event.detail) })),
    ...reconstructed.map((event) => ({ id:event.id, leadId:event.leadId, company:byId.get(event.leadId)?.company ?? "Imported record", date:event.date, kind:"history" as const, title:event.stage === "initial" ? "Initial outreach recorded" : event.stage === "first_followup" ? "First follow-up recorded" : "Final follow-up recorded", detail:event.confidence === "explicit" ? "Explicit legacy note" : "Recorded status/contact date (inferred)" })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return {
    metrics: { total: leads.length, contacted: count("Contacted"), replied: count("Replied"), bounced: count("Bounced"), optedOut: count("Opted out"), research: count("Research"), protectedHistory, firstContacts: firstContacts.length, scheduledFollowUps: scheduledFollowUps.length, campaignMarkers: campaigns.length, reconstructedOutreach: reconstructed.length },
    statusRows: ["Research", "Ready", "Contacted", "Replied", "Qualified", "Proposal", "Won", "Lost", "Bounced", "Opted out"].map((status) => ({ status, count: count(status as LeadStatus) })).filter((row) => row.count),
    dueQueue,
    onDeck,
    timeline,
    campaigns: [...campaigns].sort((a, b) => b.importedAt.localeCompare(a.importedAt)),
  };
}
