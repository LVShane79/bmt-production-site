import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { freshnessFor, hiringSignalNotice, ntaState, syntheticEvidence, validateManualEvidence } from "../app/lib/research-foundation.ts";
import { researchPanelView } from "../app/lib/research-panel-state.ts";

test("manual evidence preserves provenance and rejects non-canonical source URLs",()=>{
 const good=validateManualEvidence({companyName:"Example Integrator",canonicalUrl:"https://example.test/jobs",publisher:"Example",excerpt:"Hiring AV engineers.",capacityHypothesis:"May be balancing delivery capacity; verify with owner.",signalType:"hiring",confidence:"medium",geography:"unknown"});
 assert.ok(good); assert.equal(good.canonicalCompany,"example integrator");
 assert.equal(validateManualEvidence({...good,canonicalUrl:"http://example.test"}),null);
 assert.match(hiringSignalNotice("hiring"),/not proof/i);
});
test("freshness and Nevada NTA review default safely",()=>{
 assert.equal(freshnessFor("2026-10-27T00:00:00.000Z",new Date("2026-10-28T00:00:00.000Z")),"fresh");
 assert.equal(freshnessFor("2026-06-01T00:00:00.000Z",new Date("2026-10-28T00:00:00.000Z")),"stale");
 assert.equal(ntaState("unknown"),"unresolved"); assert.equal(ntaState("nevada"),"hold"); assert.equal(ntaState("non_nevada"),"not_applicable");
});
test("synthetic adapter is deterministic and labeled, never live research",()=>{
 const result=syntheticEvidence({companyName:"Fixture Co",canonicalUrl:"https://fixture.test/source"});
 assert.equal(result.publisher,"Synthetic test adapter"); assert.match(result.excerpt,/Synthetic fixture/);
});
test("research panel distinguishes loading, unavailable, empty, and recovered storage",()=>{
 assert.deepEqual(researchPanelView("loading",0),{canWrite:false,showEmpty:false,showLoading:true,showUnavailable:false});
 assert.deepEqual(researchPanelView("unavailable",0),{canWrite:false,showEmpty:false,showLoading:false,showUnavailable:true});
 assert.deepEqual(researchPanelView("ready",0),{canWrite:true,showEmpty:true,showLoading:false,showUnavailable:false});
 assert.deepEqual(researchPanelView("ready",1),{canWrite:true,showEmpty:false,showLoading:false,showUnavailable:false});
});
test("research migration is additive, preserves campaign evidence snapshots, and APIs are owner-gated",async()=>{
 const [migration,route,linkRoute]=await Promise.all([readFile("db/migrations/0004_research_campaign_foundation.sql","utf8"),readFile("app/api/admin/crm/research-evidence/route.ts","utf8"),readFile("app/api/admin/crm/campaign-evidence/route.ts","utf8")]);
 assert.match(migration,/CREATE TABLE IF NOT EXISTS crm_research_evidence/); assert.match(migration,/message_subject text NOT NULL/); assert.match(migration,/message_body text NOT NULL/); assert.match(migration,/crm_campaign_evidence_versions/); assert.doesNotMatch(migration,/ALTER TABLE crm_leads/);
 assert.match(route,/ownerOrUnauthorized/); assert.match(route,/normalized_company/); assert.doesNotMatch(route,/UPDATE crm_leads|INSERT INTO crm_leads|fetch\(|openai|sendMail|gmail/i);
 assert.match(linkRoute,/ownerOrUnauthorized/); assert.match(linkRoute,/e\.fetched_at>=now\(\)-interval '30 days'/); assert.match(linkRoute,/e\.fetched_at<=now\(\)/); assert.match(linkRoute,/nta_review_state='not_applicable'.*geography_status='non_nevada'/); assert.match(linkRoute,/c\.review_state='owner_review'/); assert.match(linkRoute,/lead\.history_state='clear'/); assert.match(linkRoute,/lead\.status NOT IN \('Bounced','Opted out'\)/); assert.match(linkRoute,/COALESCE\(lead\.next_step,''\)/); assert.match(linkRoute,/message_subject,message_body/); assert.doesNotMatch(linkRoute,/sendMail|gmail|nodemailer/i);
});
test("research migration executes with isolated prerequisites and leaves CRM leads untouched",async()=>{
 const db=new PGlite(); const migration=await readFile("db/migrations/0004_research_campaign_foundation.sql","utf8");
 await db.exec("CREATE TABLE crm_leads (id text PRIMARY KEY, normalized_company text UNIQUE); CREATE TABLE crm_campaign_drafts (id text PRIMARY KEY);");
 await db.exec(migration);
 await db.query("INSERT INTO crm_research_companies (id,company_name,normalized_company,created_by) VALUES ('c1','Fixture','fixture','owner')");
 await db.query("INSERT INTO crm_research_evidence (id,company_id,canonical_url,publisher,excerpt,fetched_at,confidence,freshness,signal_type,capacity_hypothesis,created_by) VALUES ('e1','c1','https://fixture.test','Fixture','Evidence','2026-10-28T00:00:00Z','low','fresh','hiring','Review only','owner')");
 assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_evidence")).rows[0].count,1); await db.close();
});
test("source payload and campaign provenance snapshots cannot be edited or deleted",async()=>{
 const db=new PGlite(); const migration=await readFile("db/migrations/0004_research_campaign_foundation.sql","utf8"); await db.exec("CREATE TABLE crm_leads (id text PRIMARY KEY, normalized_company text UNIQUE); CREATE TABLE crm_campaign_drafts (id text PRIMARY KEY);"); await db.exec(migration);
 await db.exec("INSERT INTO crm_research_companies (id,company_name,normalized_company,created_by) VALUES ('c','C','c','o'); INSERT INTO crm_research_evidence (id,company_id,canonical_url,publisher,excerpt,fetched_at,confidence,freshness,signal_type,capacity_hypothesis,created_by) VALUES ('e','c','https://x.test','X','Original','2026-10-28','low','fresh','other','Review','o'); INSERT INTO crm_campaign_drafts VALUES ('d'); INSERT INTO crm_campaign_evidence_versions (draft_id,evidence_id,evidence_version,message_version,message_subject,message_body,linked_by) VALUES ('d','e',1,'v1','Subject snapshot','Body snapshot','o');");
 await db.exec("UPDATE crm_research_evidence SET owner_review_state='accepted' WHERE id='e'");
 await assert.rejects(db.exec("UPDATE crm_research_evidence SET excerpt='Changed' WHERE id='e'")); await assert.rejects(db.exec("DELETE FROM crm_campaign_evidence_versions WHERE draft_id='d'")); await db.close();
});
test("research screen disables writes when storage is unavailable and supports retry recovery",async()=>{const [source,link]=await Promise.all([readFile("app/admin/crm/research-panel.tsx","utf8"),readFile("app/admin/crm/campaign-evidence-link.tsx","utf8")]);assert.match(source,/Disabled — configuration required/);assert.match(source,/Retry research storage/);assert.match(source,/fieldset disabled=\{!view\.canWrite\}/);assert.match(source,/view\.showEmpty&&/);assert.match(source,/disabled=\{!view\.canWrite\}/);assert.match(link,/researchReady/);assert.match(link,/disabled=\{!researchReady/);});
