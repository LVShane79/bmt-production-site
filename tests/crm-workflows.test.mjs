import assert from "node:assert/strict";
import test from "node:test";
import { campaignRecipientIds, maxCampaignRecipients, validateCampaignDraft } from "../app/lib/crm-workflows.ts";
import { matchesCrmVersion } from "../app/lib/crm.ts";

const lead=(overrides={})=>({id:"a",email:"a@example.test",status:"Research",historyState:"clear",nextStep:"Review",...overrides});
const draft=(overrides={})=>({name:"October review",subject:"Hello",body:"A reviewed draft",state:"draft",leadIds:["a"],...overrides});
test("campaign drafts cap selections at ten and reject duplicate recipient IDs",()=>{
 assert.equal(validateCampaignDraft(draft({leadIds:Array.from({length:maxCampaignRecipients+1},(_,i)=>String(i))})),null);
 assert.equal(validateCampaignDraft(draft({leadIds:["a","a"]})),null);
});
test("campaign drafts select only history-clear and non-suppressed email records",()=>{
 const input=validateCampaignDraft(draft()); assert.ok(input);
 assert.deepEqual(campaignRecipientIds(input,[lead()]),["a"]);
 assert.equal(campaignRecipientIds(input,[lead({historyState:"protected"})]),null);
 assert.equal(campaignRecipientIds(input,[lead({status:"Bounced"})]),null);
 assert.equal(campaignRecipientIds(input,[lead({nextStep:"Monitor for reply; no further automated outreach"})]),null);
});
test("campaign drafts reject canonical duplicate email recipients",()=>{
 const input=validateCampaignDraft(draft({leadIds:["a","b"]})); assert.ok(input);
 assert.equal(campaignRecipientIds(input,[lead(),lead({id:"b",email:"A@EXAMPLE.TEST"})]),null);
});
test("optimistic concurrency rejects a stale editor while allowing the current version",()=>{
 assert.equal(matchesCrmVersion("2026-10-27T17:00:00.000Z","2026-10-27T17:00:00.000Z"),true);
 assert.equal(matchesCrmVersion("2026-10-27T17:00:01.000Z","2026-10-27T17:00:00.000Z"),false);
});
