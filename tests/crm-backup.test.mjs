import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { exportCrmLogicalBackup, markExpiredBackupRunsFailed, requireSuccessfulPreCampaignBackup, runBackup, validateLogicalBackup } from "../app/lib/crm-backup.ts";

const migration = async db => { for (const file of ["0001_bmt_crm.sql", "0002_crm_review_workflows.sql", "20261028_crm_backup_ledger.sql"]) await db.exec(await readFile(`db/migrations/${file}`, "utf8")); };
const client = db => ({ query: async (sql, params = []) => (await db.query(sql, params)).rows });
const seed = async db => { await db.query("INSERT INTO crm_leads (id,company,normalized_company,market,website,tier,score,status,history_state,created_at,updated_at) VALUES ('lead-1','Acme','acme','Denver','https://acme.test','A',12,'Research','clear',now(),now())"); await db.query("INSERT INTO crm_outreach_history (id,lead_id,occurred_at,event_type,detail) VALUES ('history-1','lead-1',now(),'imported','{}')"); await db.query("INSERT INTO crm_campaign_imports (id,imported_at,source_checksum) VALUES ('import-1',now(),'checksum-1')"); await db.query("INSERT INTO crm_campaign_drafts (id,name,sender_alias,subject,body,state) VALUES ('draft-1','Test','info@blackmountain.tech','Hi','Body','draft')"); await db.query("INSERT INTO crm_campaign_recipients (draft_id,lead_id,position) VALUES ('draft-1','lead-1',1)"); await db.query("INSERT INTO crm_work_outcomes (id,lead_id,channel,outcome,reported_by) VALUES ('outcome-1','lead-1','manual','reviewed','owner')"); };

test("logical backup round-trips actual CRM migrations with synthetic data", async () => {
 const source = new PGlite(); await migration(source); await seed(source);
 const backup = await exportCrmLogicalBackup(client(source), { runId: "roundtrip", capturedAt: "2026-10-28T00:00:00.000Z", sourceCommit: "test" }); assert.equal(validateLogicalBackup(backup), true);
 const restored = new PGlite(); await migration(restored);
 for (const [table, rows] of Object.entries(backup.data)) for (const row of rows) { const keys = Object.keys(row); await restored.query(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")})`, keys.map(key => row[key])); }
 for (const table of ["crm_leads","crm_outreach_history","crm_campaign_imports","crm_campaign_drafts","crm_campaign_recipients","crm_work_outcomes"]) assert.equal((await restored.query(`SELECT count(*)::int AS count FROM ${table}`)).rows[0].count, 1, table);
 await assert.rejects(restored.query("INSERT INTO crm_campaign_recipients (draft_id,lead_id,position) VALUES ('missing','lead-1',2)"));
 await source.close(); await restored.close();
});
test("backup ledger is idempotent, verifies readback, and blocks a failed campaign backup", async () => {
 const db = new PGlite(); await migration(db); await seed(db); const sql = client(db);
 const destination = { name: "test", upload: async ({ payload }) => ({ sha256: (await import("../app/lib/crm-backup.ts")).sha256(payload) }) };
 await runBackup(sql, destination, "pre_campaign", { runId: "ok" }); await requireSuccessfulPreCampaignBackup(sql, "ok");
 await assert.rejects(runBackup(sql, destination, "pre_campaign", { runId: "ok" }), /already exists/);
 await assert.rejects(runBackup(sql, { name: "bad", upload: async () => ({ sha256: "wrong" }) }, "pre_campaign", { runId: "bad" }), /hash verification/);
 await assert.rejects(requireSuccessfulPreCampaignBackup(sql, "bad"), /blocked/); await db.close();
});
test("corruption, unknown upload failures, and stale locks fail closed until an explicit recovery", async () => {
 const db = new PGlite(); await migration(db); await seed(db); const sql = client(db); const backup = await exportCrmLogicalBackup(sql, { runId:"corrupt" });
 assert.equal(validateLogicalBackup({ ...backup, data: { ...backup.data, crm_leads: [] } }), false);
 await assert.rejects(runBackup(sql, { name:"unknown", upload: async () => { throw new Error("upload outcome unknown"); } }, "daily", { runId:"unknown" }), /unknown/);
 await assert.rejects(requireSuccessfulPreCampaignBackup(sql, "unknown"), /blocked/);
 const good = { name:"test", upload: async ({ payload }) => ({ sha256: (await import("../app/lib/crm-backup.ts")).sha256(payload) }) };
 await runBackup(sql, good, "daily", { runId:"retry-after-unknown" });
 await sql.query("INSERT INTO crm_backup_runs (id,trigger,state,requested_at) VALUES ('stale','pre_campaign','running','2000-01-01T00:00:00Z')");
 await assert.rejects(runBackup(sql, { name:"test", upload:async()=>({sha256:""}) }, "pre_campaign", { runId:"blocked" }), /already exists|another backup/);
 assert.equal(await markExpiredBackupRunsFailed(sql, "2001-01-01T00:00:00Z"), 1);
 assert.equal((await sql.query("SELECT state FROM crm_backup_runs WHERE id='stale'"))[0].state, "failed"); await db.close();
});
test("a newly introduced CRM table blocks export until the explicit schema whitelist is extended", async () => {
 const db = new PGlite(); await migration(db); await seed(db); await db.exec("CREATE TABLE crm_research_companies (id text PRIMARY KEY)");
 await assert.rejects(exportCrmLogicalBackup(client(db)), /unrecognized CRM tables \(crm_research_companies\)/); await db.close();
});
