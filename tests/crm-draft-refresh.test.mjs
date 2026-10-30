import assert from "node:assert/strict";
import test from "node:test";
import { campaignDraftFingerprint, campaignDraftFreshness, isCampaignDraftList } from "../app/lib/crm-draft-refresh.ts";

const draft={id:"a",name:"Campaign",subject:"Subject",body:"Body",state:"draft",lead_ids:["lead-a"],updated_version:"1"};
test("Email freshness fails closed until a successful refresh",()=>{
  for(const status of ["idle","loading","error"]){
    assert.equal(campaignDraftFreshness("a","1",[draft],status),"unverified");
    assert.equal(campaignDraftFreshness(null,null,[draft],status),"unverified");
  }
  assert.equal(campaignDraftFreshness("a","1",[draft],"ready"),"current");
  assert.equal(campaignDraftFreshness("a","1",[{...draft,updated_version:"2"}],"ready"),"changed");
  assert.equal(campaignDraftFreshness("a","1",[],"ready"),"missing");
  for(const state of ["approved","archived"])assert.equal(campaignDraftFreshness("a","1",[{...draft,state}],"ready"),"locked");
  assert.equal(campaignDraftFreshness(null,null,[],"ready"),"current");
});
test("dirty detection covers all editable fields and recipient order without mixing saved version identity",()=>{
  const baseline=campaignDraftFingerprint(draft);
  for(const patch of [{name:"New"},{subject:"New"},{body:"New"},{state:"review_ready"},{lead_ids:["lead-b"]}])assert.notEqual(campaignDraftFingerprint({...draft,...patch}),baseline);
  assert.equal(campaignDraftFingerprint({...draft,updated_version:"2"}),baseline);
  assert.notEqual(campaignDraftFingerprint({...draft,lead_ids:["a","b"]}),campaignDraftFingerprint({...draft,lead_ids:["b","a"]}));
});
test("malformed refresh responses cannot authorize copying or saving cached drafts",()=>{
  assert.equal(isCampaignDraftList([draft]),true);assert.equal(isCampaignDraftList([]),true);
  assert.equal(isCampaignDraftList([draft,{...draft,id:"b",state:"approved"},{...draft,id:"c",state:"archived"}]),true);
  for(const value of [{error:"unavailable"},null,[null],[{...draft,updated_version:null}],[{...draft,lead_ids:"a"}],[{...draft,body:undefined}],[{...draft,state:"unreviewed"}]])assert.equal(isCampaignDraftList(value),false);
});
