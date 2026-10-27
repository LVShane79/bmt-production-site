import type { Lead } from "./crm";

export const campaignStates = ["draft", "review_ready"] as const;
export type CampaignState = (typeof campaignStates)[number];
export const maxCampaignRecipients = 10;
export const campaignSenderAlias = "info@blackmountain.tech";
export type CampaignDraftInput = { name:string; subject:string; body:string; state:CampaignState; leadIds:string[] };

const text = (value:unknown, maximum:number) => typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
export function validateCampaignDraft(value:unknown): CampaignDraftInput | null {
  if (!value || typeof value !== "object") return null;
  const record=value as Record<string,unknown>;
  if (!text(record.name,120) || !text(record.subject,240) || !text(record.body,8000) || !campaignStates.includes(record.state as CampaignState) || !Array.isArray(record.leadIds)) return null;
  const leadIds=record.leadIds;
  if (!leadIds.length || leadIds.length > maxCampaignRecipients || leadIds.some(id=>typeof id!=="string" || !id) || new Set(leadIds).size !== leadIds.length) return null;
  return {name:(record.name as string).trim(),subject:(record.subject as string).trim(),body:record.body as string,state:record.state as CampaignState,leadIds:[...leadIds] as string[]};
}

/** A saved draft is never send-ready: only clear, non-suppressed leads may be selected. */
export function campaignRecipientIds(input:CampaignDraftInput, leads:Lead[]) {
  const byId=new Map(leads.map(lead=>[lead.id,lead]));
  const selected=input.leadIds.map(id=>byId.get(id));
  if (selected.length !== input.leadIds.length || !selected.every((lead): lead is Lead => lead !== undefined && Boolean(lead.email) && lead.historyState === "clear" && !["Bounced","Opted out"].includes(lead.status) && lead.nextStep !== "Monitor for reply; no further automated outreach")) return null;
  const emails=selected.map(lead=>lead.email!.trim().toLowerCase());
  return new Set(emails).size === emails.length ? input.leadIds : null;
}
