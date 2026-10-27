import assert from "node:assert/strict";
import test from "node:test";
import { buildCrmDashboard, hasCompletedSequence, isAutomatedEmailEligible, isCallable, isSuppressed, reconstructOutreach } from "../app/lib/crm-dashboard.ts";
import { normalizeCrmTimestamp } from "../app/lib/crm.ts";

const lead = (overrides = {}) => ({ id: "one", rank: null, company: "Example Co", market: "Denver", website: "https://example.test", email: "ops@example.test", phone: null, tier: "A", score: 12, fit: null, angle: null, status: "Contacted", firstContact: "2026-09-24", followUp: "2026-10-01", response: null, nextStep: "Review", legacySnapshot: {}, editableNotes: null, historyState: "clear", updatedAt: "2026-10-01T00:00:00Z", ...overrides });

test("dashboard separates recorded contact dates from scheduled review dates", () => {
  const model = buildCrmDashboard({ leads: [lead()], events: [], campaigns: [] });
  assert.equal(model.metrics.firstContacts, 1);
  assert.equal(model.metrics.scheduledFollowUps, 1);
  assert.deepEqual(model.timeline.map((event) => [event.kind, event.title]), [["due", "Follow-up due"], ["recorded", "First contact recorded"], ["history", "Initial outreach recorded"]]);
  assert.equal(model.timeline[0].detail, "Scheduled review date");
});

test("unknown history stays review-only and suppressed contacts never enter the follow-up queue", () => {
  const review = lead({ id: "review", company: "Unknown history", historyState: "review" });
  const bounced = lead({ id: "bounce", company: "Bounced", status: "Bounced", historyState: "protected" });
  const optedOut = lead({ id: "optout", company: "Opted out", status: "Opted out", historyState: "protected" });
  const model = buildCrmDashboard({ leads: [review, bounced, optedOut], events: [], campaigns: [] });
  assert.equal(model.metrics.protectedHistory, 3);
  assert.deepEqual(model.dueQueue.map((item) => item.id), ["review"]);
  assert.equal(isSuppressed(bounced), true);
  assert.equal(isSuppressed(optedOut), true);
  assert.match(model.timeline[0].detail, /Review history before outreach/);
});

test("dashboard retains actual campaign markers and immutable history events", () => {
  const model = buildCrmDashboard({ leads: [lead()], events: [{ id: "history-1", leadId: "one", occurredAt: "2026-09-25T12:00:00Z", eventType: "confirmed_send", detail: { note: "Source-preserved event" } }], campaigns: [{ id: "2026-09-24-confirmed", importedAt: "2026-10-27T00:00:00Z", sourceChecksum: "abc" }, { id: "2026-09-24-confirmed-v2", importedAt: "2026-10-27T00:01:00Z", sourceChecksum: "def" }] });
  assert.equal(model.metrics.campaignMarkers, 2);
  assert.deepEqual(model.campaigns.map((item) => item.id), ["2026-09-24-confirmed-v2", "2026-09-24-confirmed"]);
  assert.ok(model.timeline.some((item) => item.title === "confirmed send" && item.detail === "Source-preserved event"));
});

test("outreach reconstruction deduplicates legacy note observations without treating due dates as sends", () => {
  const result = reconstructOutreach(lead({ id:"legacy", firstContact:"2026-09-10", legacySnapshot:{ notes:"2026-09-10 — Initial outreach confirmed sent\\n2026-09-10: Initial outreach confirmed sent\n2026-09-17 — First follow-up confirmed sent\n2026-09-30 — Follow-up due" } }));
  assert.deepEqual(result.map((item) => [item.date,item.stage,item.confidence]), [["2026-09-10","initial","explicit"],["2026-09-17","first_followup","explicit"]]);
});
test("channel eligibility holds completed email sequences without turning them into call DNC", () => {
 const done=lead({nextStep:"Monitor for reply; no further automated outreach",historyState:"clear",phone:"555"}); assert.equal(hasCompletedSequence(done),true); assert.equal(isAutomatedEmailEligible(done),false); assert.equal(isCallable(done),true); assert.equal(isCallable(lead({phone:"555",response:"Do not call"})),false);
});
test("imported history survives mutable status changes and rejects unsent note forms", () => {
 const result=reconstructOutreach(lead({status:"Qualified",firstContact:null,legacySnapshot:{status:"Contacted",firstContact:"2026-09-10",notes:"2026-09-10 — Initial outreach unsent\n2026-09-11 — Initial outreach not sent\n2026-09-12 — Initial outreach draft\n2026-09-13 — Initial outreach scheduled\n2026-09-14 — Initial outreach due"}}));
 assert.deepEqual(result.map((item)=>[item.date,item.stage,item.confidence]),[["2026-09-10","initial","inferred"]]);
});
test("database Date values retain ISO timestamps", () => {
 assert.equal(normalizeCrmTimestamp(new Date("2026-09-24T12:34:56.000Z")),"2026-09-24T12:34:56.000Z");
});
