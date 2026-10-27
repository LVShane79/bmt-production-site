import type { Lead, LeadStatus } from "./crm";

export type OutreachEvent = { id: string; leadId: string; occurredAt: string | null; eventType: string; detail: unknown };
export type CampaignMarker = { id: string; importedAt: string; sourceChecksum: string };
export type CrmDashboardData = { leads: Lead[]; events: OutreachEvent[]; campaigns: CampaignMarker[] };
export type DashboardEvent = { id: string; leadId: string; company: string; date: string; kind: "recorded" | "due" | "history"; title: string; detail: string };

const suppressed = new Set<LeadStatus>(["Bounced", "Opted out"]);
const date = (value: string | null) => value ? value.slice(0, 10) : null;
const eventDetail = (value: unknown) => {
  if (!value || typeof value !== "object") return "Imported historical record";
  const record = value as Record<string, unknown>;
  return typeof record.note === "string" ? record.note.slice(0, 180) : "Imported historical record";
};

export function isSuppressed(lead: Lead) { return suppressed.has(lead.status); }

export function buildCrmDashboard(data: CrmDashboardData) {
  const { leads, events, campaigns } = data;
  const count = (status: LeadStatus) => leads.filter((lead) => lead.status === status).length;
  const protectedHistory = leads.filter((lead) => lead.historyState !== "clear").length;
  const scheduledFollowUps = leads.filter((lead) => Boolean(lead.followUp) && !isSuppressed(lead));
  const firstContacts = leads.filter((lead) => Boolean(lead.firstContact));
  const dueQueue = [...scheduledFollowUps].sort((a, b) => (a.followUp ?? "").localeCompare(b.followUp ?? ""));
  const onDeck = leads.filter((lead) => !isSuppressed(lead) && !lead.firstContact).sort((a, b) => b.score - a.score);
  const byId = new Map(leads.map((lead) => [lead.id, lead]));
  const timeline: DashboardEvent[] = [
    ...firstContacts.map((lead) => ({ id: `first-${lead.id}`, leadId: lead.id, company: lead.company, date: lead.firstContact!, kind: "recorded" as const, title: "First contact recorded", detail: "Preserved source contact date" })),
    ...scheduledFollowUps.map((lead) => ({ id: `due-${lead.id}`, leadId: lead.id, company: lead.company, date: lead.followUp!, kind: "due" as const, title: "Follow-up due", detail: lead.historyState === "clear" ? "Scheduled review date" : "Review history before outreach" })),
    ...events.filter((event) => date(event.occurredAt)).map((event) => ({ id: `history-${event.id}`, leadId: event.leadId, company: byId.get(event.leadId)?.company ?? "Imported record", date: date(event.occurredAt)!, kind: "history" as const, title: event.eventType.replaceAll(/[_-]/g, " "), detail: eventDetail(event.detail) })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return {
    metrics: { total: leads.length, contacted: count("Contacted"), replied: count("Replied"), bounced: count("Bounced"), optedOut: count("Opted out"), research: count("Research"), protectedHistory, firstContacts: firstContacts.length, scheduledFollowUps: scheduledFollowUps.length, campaignMarkers: campaigns.length },
    statusRows: ["Research", "Ready", "Contacted", "Replied", "Qualified", "Proposal", "Won", "Lost", "Bounced", "Opted out"].map((status) => ({ status, count: count(status as LeadStatus) })).filter((row) => row.count),
    dueQueue,
    onDeck,
    timeline,
    campaigns: [...campaigns].sort((a, b) => b.importedAt.localeCompare(a.importedAt)),
  };
}
