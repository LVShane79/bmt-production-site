import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { freshnessFor, hiringSignalNotice, ntaState, syntheticEvidence, validateManualEvidence } from "../app/lib/research-foundation.ts";
import { companyHoldReasons, companyReviewWrite, validateCompanyReview } from "../app/lib/company-review.ts";
import { crmAiDraftEligibilitySql, crmAiDraftingStatus, validateCrmAiDraftRequest } from "../app/lib/crm-ai-drafting.ts";
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
test("existing research companies accept a distinct source while duplicate URLs preserve evidence",async()=>{const db=new PGlite();const migration=await readFile("db/migrations/0004_research_campaign_foundation.sql","utf8");await db.exec("CREATE TABLE crm_leads (id text PRIMARY KEY, normalized_company text UNIQUE); CREATE TABLE crm_campaign_drafts (id text PRIMARY KEY);");await db.exec(migration);await db.exec("INSERT INTO crm_research_companies (id,company_name,normalized_company,created_by) VALUES ('c','Fixture','fixture','owner'); INSERT INTO crm_research_evidence (id,company_id,canonical_url,publisher,excerpt,fetched_at,confidence,freshness,signal_type,capacity_hypothesis,created_by) VALUES ('one','c','https://fixture.test/one','Fixture','Original',now(),'low','fresh','other','Review','owner'); INSERT INTO crm_research_evidence (id,company_id,canonical_url,publisher,excerpt,fetched_at,confidence,freshness,signal_type,capacity_hypothesis,created_by) VALUES ('two','c','https://fixture.test/two','Fixture','Second',now(),'low','fresh','other','Review','owner')");await assert.rejects(db.exec("INSERT INTO crm_research_evidence (id,company_id,canonical_url,publisher,excerpt,fetched_at,confidence,freshness,signal_type,capacity_hypothesis,created_by) VALUES ('duplicate','c','https://fixture.test/one','Fixture','Changed',now(),'low','fresh','other','Review','owner')"));assert.equal((await db.query("SELECT excerpt FROM crm_research_evidence WHERE id='one'")).rows[0].excerpt,"Original");assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_evidence WHERE company_id='c'")).rows[0].count,2);await db.close();});
test("research save reports visible duplicate and existing-company outcomes",async()=>{const [route,source,link]=await Promise.all([readFile("app/api/admin/crm/research-evidence/route.ts","utf8"),readFile("app/admin/crm/research-panel.tsx","utf8"),readFile("app/admin/crm/campaign-evidence-link.tsx","utf8")]);assert.match(route,/WITH lead AS/);assert.match(route,/ON CONFLICT \(company_id,canonical_url\) DO NOTHING/);assert.match(route,/already saved for this company/);assert.match(route,/existing company/);assert.match(source,/body\.error/);assert.match(source,/Retry research storage/);assert.match(source,/fieldset disabled=\{!view\.canWrite\}/);assert.match(source,/view\.showEmpty&&/);assert.match(link,/researchReady/);assert.match(link,/disabled=\{!researchReady/);});
test("research save renders ready-state success and duplicate feedback",async()=>{const source=await readFile("app/admin/crm/research-panel.tsx","utf8");assert.match(source,/body\.message\?\?/);assert.match(source,/notice&&!view\.showUnavailable/);assert.match(source,/role="status">\{notice\}/);});
test("owner company review only permits explicit non-Nevada or Nevada clearance paths",()=>{
 const base={id:"company",expectedVersion:"1",geography:"Reno, Nevada",geographyStatus:"nevada",ntaReviewState:"cleared",reviewState:"owner_review",rationale:"Owner verified the Nevada NTA decision."};
 assert.deepEqual(validateCompanyReview(base),base);
 assert.deepEqual(validateCompanyReview({...base,geography:"Denver, Colorado",geographyStatus:"non_nevada",ntaReviewState:"not_applicable"}),{...base,geography:"Denver, Colorado",geographyStatus:"non_nevada",ntaReviewState:"not_applicable"});
 for(const invalid of [{...base,geographyStatus:"unknown",ntaReviewState:"not_applicable"},{...base,ntaReviewState:"not_applicable"},{...base,geographyStatus:"unknown",ntaReviewState:"cleared"},{...base,ntaReviewState:"hold"}])assert.equal(validateCompanyReview(invalid),null);
 assert.match(companyHoldReasons({geography_status:"unknown",nta_review_state:"unresolved",review_state:"research"}).join(" "),/unknown.*unresolved/i);
 assert.match(companyHoldReasons({geography_status:"nevada",nta_review_state:"hold",review_state:"rejected"}).join(" "),/rejected.*hold/i);
});
test("company-review migration rejects bypasses and retains auditable decisions",async()=>{
 const db=new PGlite();for(const file of ["0004_research_campaign_foundation.sql","0005_company_review_controls.sql"]){if(file.startsWith("0004"))await db.exec("CREATE TABLE crm_leads (id text PRIMARY KEY, normalized_company text UNIQUE); CREATE TABLE crm_campaign_drafts (id text PRIMARY KEY);");await db.exec(await readFile(`db/migrations/${file}`,"utf8"));}
 await db.exec("INSERT INTO crm_research_companies (id,company_name,normalized_company,created_by) VALUES ('c','Fixture','fixture','owner')");
 await assert.rejects(db.exec("INSERT INTO crm_research_company_reviews (id,company_id,expected_version,geography,geography_status,nta_review_state,review_state,rationale,reviewed_by) VALUES ('bad-audit','c','v0','Unknown','unknown','not_applicable','rejected','bad audit decision','owner')"));
 await assert.rejects(db.exec("UPDATE crm_research_companies SET geography='Unknown',geography_status='unknown',nta_review_state='not_applicable',review_state='owner_review',review_rationale='bad',reviewed_by='owner',reviewed_at=now() WHERE id='c'"));
 await assert.rejects(db.exec("UPDATE crm_research_companies SET geography='Reno',geography_status='nevada',nta_review_state='hold',review_state='owner_review',review_rationale='bad',reviewed_by='owner',reviewed_at=now() WHERE id='c'"));
 await db.exec("UPDATE crm_research_companies SET geography='Reno, Nevada',geography_status='nevada',nta_review_state='cleared',review_state='owner_review',review_rationale='Reviewed NTA clearance',reviewed_by='owner',reviewed_at=now() WHERE id='c'; INSERT INTO crm_research_company_reviews (id,company_id,expected_version,geography,geography_status,nta_review_state,review_state,rationale,reviewed_by) VALUES ('audit','c','old','Reno, Nevada','nevada','cleared','owner_review','Reviewed NTA clearance','owner')");
 assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_company_reviews WHERE company_id='c'")).rows[0].count,1);await db.close();
});
test("executed company-review write is atomic, concurrency-safe, and preserves immutable audit history",async()=>{
 const db=new PGlite();await db.exec("CREATE TABLE crm_leads (id text PRIMARY KEY, normalized_company text UNIQUE); CREATE TABLE crm_campaign_drafts (id text PRIMARY KEY);");for(const file of ["0004_research_campaign_foundation.sql","0005_company_review_controls.sql"])await db.exec(await readFile(`db/migrations/${file}`,"utf8"));
 await db.exec("INSERT INTO crm_research_companies (id,company_name,normalized_company,created_by) VALUES ('c','Fixture','fixture','owner')");
 const version=(await db.query("SELECT floor(extract(epoch FROM updated_at)*1000000)::bigint::text AS version FROM crm_research_companies WHERE id='c'")).rows[0].version;
 const review=validateCompanyReview({id:"c",expectedVersion:version,geography:"Reno, Nevada",geographyStatus:"nevada",ntaReviewState:"cleared",reviewState:"owner_review",rationale:"Owner cleared the Nevada NTA review."});assert.ok(review);
 const first=companyReviewWrite(review,"owner","audit-1"),winner=await db.query(first.sql,first.params);assert.equal(winner.rows.length,1);
 const stale=await db.query(companyReviewWrite(review,"owner","audit-stale").sql,companyReviewWrite(review,"owner","audit-stale").params);assert.equal(stale.rows.length,0);assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_company_reviews WHERE company_id='c'")).rows[0].count,1);
 const current=(await db.query("SELECT floor(extract(epoch FROM updated_at)*1000000)::bigint::text AS version,review_rationale FROM crm_research_companies WHERE id='c'")).rows[0];
 const collision={...review,expectedVersion:current.version,rationale:"This update must roll back when the audit ID collides."};const failed=companyReviewWrite(collision,"owner","audit-1");await assert.rejects(db.query(failed.sql,failed.params));
 const after=(await db.query("SELECT review_rationale FROM crm_research_companies WHERE id='c'")).rows[0];assert.equal(after.review_rationale,current.review_rationale);assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_company_reviews WHERE company_id='c'")).rows[0].count,1);
 await assert.rejects(db.exec("UPDATE crm_research_company_reviews SET rationale='rewrite' WHERE id='audit-1'"));await assert.rejects(db.exec("DELETE FROM crm_research_company_reviews WHERE id='audit-1'"));await assert.rejects(db.exec("DELETE FROM crm_research_companies WHERE id='c'"));assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_research_company_reviews WHERE id='audit-1'")).rows[0].count,1);await db.close();
});
test("company review endpoint is owner-gated, concurrency-protected, and UI keeps clearance separate",async()=>{
 const [route,ui,migration]=await Promise.all([readFile("app/api/admin/crm/company-review/route.ts","utf8"),readFile("app/admin/crm/research-panel.tsx","utf8"),readFile("db/migrations/0005_company_review_controls.sql","utf8")]);
 assert.match(route,/ownerOrUnauthorized/);assert.match(route,/companyReviewWrite/);assert.match(route,/crypto\.randomUUID/);assert.doesNotMatch(route,/crm_leads|crm_campaign_recipients|sendMail|nodemailer/i);
 assert.match(ui,/Owner company review/);assert.match(ui,/Separate from evidence acceptance/);assert.match(ui,/Record owner company review/);assert.match(ui,/NTA decision/);assert.match(ui,/companyHoldReasons/);
 assert.match(migration,/ADD COLUMN IF NOT EXISTS review_rationale/);assert.match(migration,/crm_research_company_reviews/);assert.match(migration,/unknown or Nevada geography cannot be not_applicable/);assert.doesNotMatch(migration,/ALTER TABLE crm_leads/);
});
test("private AI draft scaffold fails closed and retains campaign evidence holds",async()=>{
 const valid={draftId:"draft",messageVersion:"123",evidenceIds:["one","two"]};assert.deepEqual(validateCrmAiDraftRequest(valid),valid);assert.equal(validateCrmAiDraftRequest({...valid,evidenceIds:[]}),null);assert.equal(validateCrmAiDraftRequest({...valid,evidenceIds:["1","2","3","4"]}),null);assert.deepEqual(crmAiDraftingStatus,{enabled:false,provider:"none",reason:"configuration_required"});
 assert.match(crmAiDraftEligibilitySql,/^SELECT e\.id FROM/);assert.match(crmAiDraftEligibilitySql,/owner_review/);assert.match(crmAiDraftEligibilitySql,/nta_review_state='cleared'/);assert.match(crmAiDraftEligibilitySql,/lead\.history_state='clear'/);assert.match(crmAiDraftEligibilitySql,/lead\.status NOT IN \('Bounced','Opted out'\)/);assert.doesNotMatch(crmAiDraftEligibilitySql,/editable_notes|message_body/i);
 const [route,ui,doc]=await Promise.all([readFile("app/api/admin/crm/ai-drafts/route.ts","utf8"),readFile("app/admin/crm/campaign-evidence-link.tsx","utf8"),readFile("docs/crm-ai-drafting.md","utf8")]);assert.match(route,/ownerOrUnauthorized/);assert.match(route,/crmAiDraftEligibilitySql/);assert.match(route,/No CRM content was sent/);assert.doesNotMatch(route,/fetch\(|OPENAI_API_KEY|sendMail|nodemailer/i);assert.match(ui,/Create AI suggestion/);assert.match(ui,/cannot save, approve, attach, or send/);assert.match(doc,/CRM_AI_DRAFTING_MAX_REQUESTS_PER_HOUR/);assert.match(doc,/never lead email, notes, recipient IDs, history, or draft body/i);
});
