import assert from "node:assert/strict";
import test from "node:test";
import { createVercelGatewayTransport, orchestrateCrmAiPreview, crmAiDraftPolicy } from "../app/lib/crm-ai-drafting.ts";

const preview={campaignNames:["Capacity conversation"],subject:"A note",body:"Owner-reviewed evidence only."};
const input={requestId:"request",ownerId:"owner",companyName:"Public company",sources:[{url:"https://example.test/source",publisher:"Publisher",excerpt:"Public source",capacityHypothesis:"Unverified hypothesis"}]};
const args={model:crmAiDraftPolicy.model,provider:"openai",zeroDataRetention:true,store:false,reasoning:"none",maxOutputTokens:1000,prompt:"Public evidence only"};
function response(content=JSON.stringify(preview),usage={prompt_tokens:12,completion_tokens:3}){return new Response(JSON.stringify({choices:[{message:{content}}],usage}),{status:200});}

test("concrete Gateway fetch emits exact privacy/routing contract once and reads provider usage",async()=>{
 const calls=[];const transport=createVercelGatewayTransport(async (...values)=>{calls.push(values);return response();},"synthetic-test-token");
 assert.deepEqual(await transport.generate(args),{...preview,usage:{inputTokens:12,outputTokens:3}});
 assert.equal(calls.length,1);assert.equal(calls[0][0],"https://ai-gateway.vercel.sh/v1/chat/completions");
 const request=calls[0][1];assert.equal(request.method,"POST");assert.equal(request.headers.Authorization,"Bearer synthetic-test-token");
 const body=JSON.parse(request.body);assert.equal(body.model,"openai/gpt-5.4-mini");assert.equal(body.store,false);assert.equal(body.stream,false);assert.equal(body.max_completion_tokens,1000);assert.deepEqual(body.reasoning,{effort:"none"});assert.deepEqual(body.providerOptions,{gateway:{only:["openai"],zeroDataRetention:true}});assert.deepEqual(body.messages,[{role:"user",content:args.prompt}]);assert.equal(body.response_format.json_schema.strict,true);
 for(const forbidden of ["tools","user","metadata","fallbacks","models"])assert.equal(body[forbidden],undefined);
});

test("concrete transport fails without credentials and never retries failures or malformed output",async()=>{
 let calls=0;await assert.rejects(createVercelGatewayTransport(async()=>{calls++;return response();},"").generate(args),/OIDC/);assert.equal(calls,0);
 for(const makeResponse of [()=>new Response("unavailable",{status:503}),()=>response("not json"),()=>response(JSON.stringify({...preview,subject:""})),()=>new Response(JSON.stringify({choices:[]})),()=>new Response("invalid envelope")]){
  calls=0;await assert.rejects(createVercelGatewayTransport(async()=>{calls++;return makeResponse();},"synthetic").generate(args));assert.equal(calls,1);
 }
});

function harness(overrides={}){const calls=[];const deps={counter:{count:()=>0},reservation:{reserve:async value=>{calls.push(["reserve",value]);return "created";},finish:async value=>{calls.push(["finish",value]);}},transport:{generate:async value=>{calls.push(["generate",value]);return {...preview,usage:{inputTokens:12,outputTokens:3}};}}};return {calls,deps:{...deps,...overrides}};}

test("all replay states block concrete generation, including an invalid undefined reservation result",async()=>{
 for(const state of ["reserved","completed","failed","uncertain",undefined]){const {calls,deps}=harness({reservation:{reserve:async()=>state,finish:async()=>assert.fail("replay cannot settle")}});await assert.rejects(orchestrateCrmAiPreview(deps,input),/replay blocked/);assert.equal(calls.length,0);}
});

test("valid provider input usage up to 400000 settles independently of prompt byte guard",async()=>{
 const {calls,deps}=harness({transport:{generate:async()=>({...preview,usage:{inputTokens:400000,outputTokens:1000}})}});assert.deepEqual(await orchestrateCrmAiPreview(deps,input),preview);assert.equal(calls[0][1].estimatedUsdMicros,304500);assert.deepEqual(calls.at(-1)[1].usage,{inputTokens:400000,outputTokens:1000});assert.equal(calls.at(-1)[1].state,"completed");
});

test("invalid or missing usage keeps a full uncertain reservation and returns no preview",async()=>{
 for(const usage of [undefined,{inputTokens:-1,outputTokens:3},{inputTokens:400001,outputTokens:3},{inputTokens:1.5,outputTokens:3},{inputTokens:12,outputTokens:1001},{inputTokens:12,outputTokens:NaN}]){const {calls,deps}=harness({transport:{generate:async()=>({...preview,usage})}});await assert.rejects(orchestrateCrmAiPreview(deps,input),/usage/);assert.ok(calls.filter(x=>x[0]==="finish").every(x=>x[1].state==="uncertain"));assert.equal(calls.some(x=>x[1]?.state==="completed"),false);}
});

test("transport, invalid output, and settlement errors never release a potentially billed reservation",async()=>{
 for(const generate of [async()=>{throw Error("timeout");},async()=>({...preview,subject:"",usage:{inputTokens:12,outputTokens:3}})]){const {calls,deps}=harness({transport:{generate}});await assert.rejects(orchestrateCrmAiPreview(deps,input));assert.equal(calls.at(-1)[1].state,"uncertain");assert.equal(calls.some(x=>x[1]?.state==="failed"),false);}
 const {calls,deps}=harness();deps.reservation.finish=async value=>{calls.push(["finish",value]);throw Error("database unavailable");};await assert.rejects(orchestrateCrmAiPreview(deps,input),/database unavailable/);assert.equal(calls.at(-1)[1].state,"uncertain");assert.equal(calls.filter(x=>x[0]==="generate").length,1);
});

test("oversize UTF-8 prompt is rejected before reservation or provider",async()=>{const {calls,deps}=harness();await assert.rejects(orchestrateCrmAiPreview(deps,{...input,companyName:"🚧".repeat(1000)}),/size limit/);assert.deepEqual(calls,[]);});
