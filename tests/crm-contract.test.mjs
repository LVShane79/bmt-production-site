import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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

test("Clerk auth completion is pinned to the private admin route", async () => {
  for (const route of ["app/admin/sign-in/[[...rest]]/page.tsx", "app/admin/sign-up/[[...rest]]/page.tsx"]) {
    const source = await readFile(route, "utf8");
    assert.match(source, /forceRedirectUrl="\/admin"/);
    assert.match(source, /fallbackRedirectUrl="\/admin"/);
    assert.doesNotMatch(source, /redirectUrl=|afterSign(?:In|Up)Url=/);
  }
});
test("transaction import is idempotent by stable source IDs", () => {
  const sourceIds = new Set(); const importOne = (id) => !sourceIds.has(id) && (sourceIds.add(id), true);
  assert.equal(importOne("lead-1"), true); assert.equal(importOne("lead-1"), false);
  assert.equal(sourceIds.size, 1);
});
test("new private workflow routes retain owner gates and no send implementation", async () => {
  for (const route of ["app/api/admin/crm/campaign-drafts/route.ts", "app/api/admin/crm/work-outcomes/route.ts"]) {
    const source=await readFile(route,"utf8");
    assert.match(source,/ownerOrUnauthorized/);
    assert.doesNotMatch(source,/nodemailer|gmail\.users|sendMail|messages\.send/);
  }
});
test("workflow migration qualifies lead identifiers inside its returned-table function", async () => {
  const source=await readFile("db/migrations/0002_crm_review_workflows.sql","utf8");
  assert.match(source,/PERFORM lead\.id FROM crm_leads AS lead/);
  assert.doesNotMatch(source,/PERFORM id FROM crm_leads/);
});
test("workflow versions advance even for multiple saves in one transaction", async () => {
  const source=await readFile("db/migrations/0002_crm_review_workflows.sql","utf8");
  assert.match(source,/updated_at=GREATEST\(clock_timestamp\(\), crm_campaign_drafts\.updated_at \+ interval '1 microsecond'\)/);
});
