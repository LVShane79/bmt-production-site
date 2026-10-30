import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as drafting from "../app/lib/crm-ai-drafting.ts";

// Execute the actual POST source, with only infrastructure replaced. No Next
// server, Clerk account, database, credentials, or provider network is contacted.
const source=await readFile("app/api/admin/crm/ai-drafts/route.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
class NextResponse extends Response {static json(body,init){return new NextResponse(JSON.stringify(body),{...init,headers:{"content-type":"application/json",...init?.headers}});}}
const requestBody={draftId:"draft",messageVersion:"123",requestId:"request",evidenceIds:["evidence"]};
const row={id:"evidence",company_name:"Public Company",canonical_url:"https://example.test/source",publisher:"Public Publisher",excerpt:"Accepted public evidence",capacity_hypothesis:"Unverified hypothesis",email:"must-not-leak@example.test",editable_notes:"PRIVATE NOTE",message_body:"PRIVATE DRAFT"};
const preview={campaignNames:["Capacity discussion"],subject:"Public subject",body:"Public body"};
function harness(options={}){
 const calls=[];const env={CRM_AI_DRAFTING_ENABLED:"true",OPENAI_API_KEY:"synthetic-token",DATABASE_URL:"synthetic-database",...options.env};
 const sql={query:async (...args)=>{calls.push(["query",args]);if(options.queryError)throw Error("private database connection details");return options.rows??[row];}};
 const reservation={reserve:async value=>{calls.push(["reserve",value]);return options.reservationState??"created";},finish:async value=>{calls.push(["finish",value]);if(options.settlementError)throw Error("private settlement error");}};
 const transport={generate:async value=>{calls.push(["generate",value]);if(options.transportError)throw Error("private provider error");return {...preview,...options.output,usage:options.usage===null?undefined:options.usage??{inputTokens:12,outputTokens:3}};}};
 const modules={"@neondatabase/serverless":{neon:()=>sql},"next/server":{NextResponse},"../../../../lib/admin-auth":{ownerOrUnauthorized:async()=>{calls.push(["auth"]);return options.authResponse??{kind:"owner",userId:"owner",email:"owner@example.test"};}},"../../../../lib/crm-ai-drafting":{...drafting,createCrmAiReservation:()=>reservation,createOpenAiDraftTransport:()=>transport}};
 const routeModule={exports:{}};runInNewContext(`(function(require,module,exports,process){${compiled}\n})`,{Error})(name=>{assert.ok(modules[name],`unexpected infrastructure import ${name}`);return modules[name];},routeModule,routeModule.exports,{env});
 return {calls,post:body=>routeModule.exports.POST(new Request("https://local.test/api/admin/crm/ai-drafts",{method:"POST",headers:{"content-type":"application/json"},body:typeof body==="string"?body:JSON.stringify(body??requestBody)}))};
}

test("actual POST denies unauthenticated/forbidden before storage or transport",async()=>{for(const status of [401,403]){const {calls,post}=harness({authResponse:NextResponse.json({error:"denied"},{status})});assert.equal((await post()).status,status);assert.deepEqual(calls,[["auth"]]);}});
test("actual POST defaults disabled and rejects malformed input and missing storage before queries",async()=>{
 for(const [options,body,status] of [[{env:{CRM_AI_DRAFTING_ENABLED:undefined}},undefined,503],[{env:{OPENAI_API_KEY:undefined}},undefined,503],[{},"not json",400],[{},{...requestBody,evidenceIds:[]},400],[{env:{DATABASE_URL:undefined}},undefined,503]]){const {calls,post}=harness(options);const result=await post(body);assert.equal(result.status,status);assert.deepEqual(calls,[["auth"]]);assert.equal(result.headers.get("Cache-Control"),"private, no-store");}
});
test("actual POST rejects missing, partial, or mixed-company evidence with no reservation",async()=>{
 for(const [rows,body] of [[[],requestBody],[[row],{...requestBody,evidenceIds:["evidence","missing"]}],[[row,{...row,id:"two",company_name:"Other Company"}],{...requestBody,evidenceIds:["evidence","two"]}]]){const {calls,post}=harness({rows});assert.equal((await post(body)).status,409);assert.deepEqual(calls.map(x=>x[0]),["auth","query"]);assert.equal(calls[1][1][0],drafting.crmAiDraftEligibilitySql);assert.deepEqual(Array.from(calls[1][1][1]),[body.draftId,body.evidenceIds,body.messageVersion]);}
});
test("actual POST uses only whitelisted evidence, reserves before generating, and returns unsaved preview",async()=>{
 const {calls,post}=harness();const result=await post();assert.equal(result.status,200);const body=await result.json();assert.deepEqual(body.preview,preview);assert.match(body.note,/nothing was saved, attached, approved, or sent/);assert.equal(result.headers.get("Cache-Control"),"private, no-store");assert.deepEqual(calls.map(x=>x[0]),["auth","query","reserve","generate","finish"]);const prompt=calls.find(x=>x[0]==="generate")[1].prompt;assert.match(prompt,/Public Company/);assert.match(prompt,/Accepted public evidence/);assert.doesNotMatch(prompt,/must-not-leak|PRIVATE NOTE|PRIVATE DRAFT|owner@example|synthetic-/);assert.equal(calls.at(-1)[1].state,"completed");assert.equal(calls.filter(x=>x[0]==="query").length,1);
});
test("actual POST blocks every replay without generation",async()=>{for(const reservationState of ["reserved","completed","failed","uncertain"]){const {calls,post}=harness({reservationState});assert.equal((await post()).status,409);assert.equal(calls.some(x=>x[0]==="generate"),false);}});
test("actual POST fails closed on database/provider/settlement errors and does not expose infrastructure details",async()=>{
 for(const options of [{queryError:true},{transportError:true},{settlementError:true}]){const {calls,post}=harness(options);const result=await post();assert.equal(result.status,503);assert.doesNotMatch(await result.text(),/private database|private provider|private settlement/);assert.ok(calls.filter(x=>x[0]==="generate").length<=1);if(!options.queryError)assert.equal(calls.at(-1)[1].state,"uncertain");}
});
test("actual POST rejects missing/over-cap usage and malformed preview without saving or regenerating",async()=>{
 for(const options of [{usage:null},{usage:{inputTokens:1047577,outputTokens:1}},{usage:{inputTokens:1,outputTokens:1001}},{output:{subject:""}}]){const {calls,post}=harness(options);const result=await post();assert.equal(result.status,409);assert.equal(calls.filter(x=>x[0]==="generate").length,1);assert.equal(calls.at(-1)[1].state,"uncertain");}
});

