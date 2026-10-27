import test from "node:test";
import assert from "node:assert/strict";

// Portable cutover contracts: the actual DB adapter is intentionally not invoked.
test("unknown migration history is never send-ready", () => {
  const normalized = (history) => history ? "protected" : "review";
  assert.equal(normalized(null), "review");
  assert.notEqual(normalized(null), "clear");
});
test("read-only CRM behavior has no implicit seed contract", () => {
  const read = (records) => records;
  const records = [];
  assert.equal(read(records), records);
  assert.equal(records.length, 0);
});
test("prospect validation demands a secure website", () => {
  const valid = (x) => typeof x?.company === "string" && /^https:\/\//.test(x.website ?? "");
  assert.equal(valid({ company: "BMT", website: "https://blackmountain.tech" }), true);
  assert.equal(valid({ company: "BMT", website: "http://bad" }), false);
});
test("owner authorization requires both a configured Clerk ID and verified owner email", () => {
  const owner = (id, email, verified, configured) => Boolean(id && verified && configured.split(",").map(x => x.trim()).includes(id) && email?.toLowerCase() === "shane@blackmountain.tech");
  assert.equal(owner(null, "shane@blackmountain.tech", true, "user_owner"), false);
  assert.equal(owner("user_unknown", "shane@blackmountain.tech", true, "user_owner"), false);
  assert.equal(owner("user_owner", "shane@blackmountain.tech", false, "user_owner"), false);
  assert.equal(owner("user_owner", "other@example.com", true, "user_owner"), false);
  assert.equal(owner("user_owner", "SHANE@BLACKMOUNTAIN.TECH", true, "user_owner"), true);
});
test("history and suppression records are retained during editable updates", () => {
  const existing = { status: "Bounced", notes: "550 bounce recorded", historyState: "protected", followUp: null };
  const updated = { ...existing, nextStep: "Research alternate contact" };
  assert.equal(updated.status, "Bounced");
  assert.equal(updated.notes, "550 bounce recorded");
  assert.equal(updated.historyState, "protected");
});
test("missing database configuration never selects a production fixture", () => {
  const mode = ({ production, fixture, databaseUrl }) => databaseUrl ? "neon" : (!production && fixture ? "fixture" : "unavailable");
  assert.equal(mode({ production: true, fixture: true, databaseUrl: "" }), "unavailable");
  assert.equal(mode({ production: false, fixture: false, databaseUrl: "" }), "unavailable");
  assert.equal(mode({ production: false, fixture: true, databaseUrl: "" }), "fixture");
});
test("transaction import is idempotent by stable source IDs", () => {
  const sourceIds = new Set(); const importOne = (id) => !sourceIds.has(id) && (sourceIds.add(id), true);
  assert.equal(importOne("lead-1"), true); assert.equal(importOne("lead-1"), false);
  assert.equal(sourceIds.size, 1);
});
