export type SavedCampaignDraft = {
  id: string; name: string; subject: string; body: string;
  state: "draft" | "review_ready" | "approved" | "archived"; lead_ids: string[]; updated_version: string;
};
export type DraftListStatus = "idle" | "loading" | "ready" | "error";

/** Version identity is separate from local content: refreshing never replaces edits. */
export function campaignDraftFreshness(id: string | null, version: string | null, drafts: SavedCampaignDraft[], status: DraftListStatus) {
  if (status !== "ready") return "unverified";
  if (!id) return "current";
  const saved = drafts.find(draft => draft.id === id);
  if (!saved) return "missing";
  if (saved.state === "approved" || saved.state === "archived") return "locked";
  return saved.updated_version === version ? "current" : "changed";
}

export function campaignDraftFingerprint(draft: Pick<SavedCampaignDraft, "name" | "subject" | "body" | "state" | "lead_ids">) {
  return JSON.stringify([draft.name, draft.subject, draft.body, draft.state, draft.lead_ids]);
}

/** A malformed or failed refresh must not make a cached list look current. */
export function isCampaignDraftList(value: unknown): value is SavedCampaignDraft[] {
  return Array.isArray(value) && value.every(draft => draft && typeof draft === "object" &&
    [draft.id, draft.name, draft.subject, draft.body, draft.updated_version].every(value => typeof value === "string") &&
    ["draft", "review_ready", "approved", "archived"].includes(draft.state) &&
    Array.isArray(draft.lead_ids) && draft.lead_ids.every((id: unknown) => typeof id === "string"));
}
