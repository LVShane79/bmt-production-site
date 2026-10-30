import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createCrmAiPreviewGate } from "../app/lib/crm-ai-preview-state.ts";

test("AI preview gate rejects duplicate clicks synchronously", () => {
  const gate = createCrmAiPreviewGate();
  const ticket = gate.begin("draft-A:v1:e1");
  assert.ok(ticket);
  assert.equal(gate.begin("draft-A:v1:e1"), null);
  assert.equal(gate.finish(ticket), true);
  assert.ok(gate.begin("draft-A:v1:e1"));
});

test("late response after selecting another draft cannot populate its preview", async () => {
  const gate = createCrmAiPreviewGate();
  const ticket = gate.begin("draft-A:v1:e1");
  let resolve;
  const response = new Promise(r => { resolve = r; });
  let preview = null;
  let currentContext = "draft-A:v1:e1";
  const completion = response.then(value => {
    if (gate.isCurrent(ticket, currentContext)) preview = value;
  });
  gate.invalidate();
  currentContext = "draft-B:v1:e2";
  resolve("A's preview");
  await completion;
  assert.equal(preview, null);
});

test("older completion cannot overwrite or clear a newer in-flight request", () => {
  const gate = createCrmAiPreviewGate();
  const first = gate.begin("draft-A:v1:e1");
  gate.invalidate();
  const second = gate.begin("draft-A:v1:e2");
  assert.equal(gate.isCurrent(first, "draft-A:v1:e2"), false);
  assert.equal(gate.finish(first), false);
  assert.equal(gate.isCurrent(second, "draft-A:v1:e2"), true);
  assert.equal(gate.begin("draft-A:v1:e2"), null);
  assert.equal(gate.finish(second), true);
});

test("version, evidence, readiness changes and unmount invalidate results", () => {
  for (const changed of ["draft-A:v2:e1", "draft-A:v1:e2", "unavailable"]) {
    const gate = createCrmAiPreviewGate();
    const ticket = gate.begin("draft-A:v1:e1");
    assert.equal(gate.isCurrent(ticket, changed), false);
  }
  const gate = createCrmAiPreviewGate();
  const ticket = gate.begin("draft-A:v1:e1");
  gate.invalidate();
  assert.equal(gate.isCurrent(ticket, "draft-A:v1:e1"), false);
  assert.ok(gate.begin("draft-A:v1:e1"), "returning to a prior context permits a fresh explicit request");
});

test("UI wires preview tickets to pending controls and local-only editable fields", async () => {
  const source = await readFile("app/admin/crm/campaign-evidence-link.tsx", "utf8");
  assert.match(source, /aiGate\.current\.begin\(context\)/);
  assert.match(source, /isCurrent\(ticket,latestContext\.current\)/);
  assert.match(source, /aiPending&&aiContext===context/);
  assert.match(source, /return\(\)=>\{gate\.invalidate\(\);setAiPending\(false\);setPreview\(null\);setAiNotice\(""\);\}/);
  assert.match(source, /invalidateAi\(\);setDraftId/);
  assert.match(source, /invalidateAi\(\);setChosen/);
  assert.match(source, /aiContext===context&&preview/);
  assert.match(source, /<AiPreviewEditor/);
  for (const field of ["updated_version", "review_state", "nta_review_state", "geography_status", "freshness", "fetched_at"]) assert.ok(source.includes(field));
  assert.match(source, /no automatic retry was made/);
});

