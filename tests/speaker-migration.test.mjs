import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const apiSource = fs.readFileSync(new URL('../app/api/speakers/route.ts', import.meta.url), 'utf8');
const uiSource = fs.readFileSync(new URL('../app/resources/speaker-lab/SpeakerCalculator.tsx', import.meta.url), 'utf8');
const apiJs = stripTypeScriptTypes(apiSource).replace(/import \{ NextRequest, NextResponse \} from "next\/server";/, '').replace(/export /g, '') + '\nthis.POST=POST;';
function handler(key, result) {
  const calls=[];
  const context=vm.createContext({ process:{env:key?{OPENAI_API_KEY:'test-placeholder'}:{}},NextResponse:{json:(body,init)=>Response.json(body,init)},fetch:async(url,options)=>{calls.push({url,options});return Response.json({output_text:JSON.stringify(result)});} });
  vm.runInContext(apiJs,context);
  return {calls,post:body=>context.POST({json:async()=>body})};
}
const speaker={brand:'Fixture',model:'Ceiling speaker',coverage:90,sensitivity:90,taps:[30,7.5,15],impedance:8};
const amplifier={brand:'Fixture',model:'Amplifier',channels:2,power70v:500,minImpedance:4,lowZRatings:[{ohms:8,watts:250},{ohms:4,watts:500}]};

test('Speaker API has no Sites, Cloudflare, or ChatGPT-auth runtime dependency',()=>{
  assert.doesNotMatch(apiSource,/chatgpt\.site|cloudflare|chatgpt-auth|from.*db\//i);
});
test('Speaker API missing key returns 503 without networking',async()=>{
  const api=handler(false);
  assert.equal((await api.post({query:'fixture'})).status,503);
  assert.equal(api.calls.length,0);
});
test('Speaker request calls OpenAI and normalizes taps',async()=>{
  const api=handler(true,speaker); const response=await api.post({query:'fixture speaker'});
  assert.equal(response.status,200);
  assert.deepEqual((await response.json()).speaker,{...speaker,taps:[7.5,15,30]});
  assert.equal(api.calls[0].url,'https://api.openai.com/v1/responses');
});
test('Amplifier request preserves both 70 V and Low-Z data',async()=>{
  const api=handler(true,amplifier); const response=await api.post({kind:'amplifier',query:'fixture amp'});
  assert.equal(response.status,200);assert.deepEqual((await response.json()).amplifier,amplifier);
  assert.match(JSON.parse(api.calls[0].options.body).input,/power-amplifier/);
});
test('Speaker empty query and unusable data are handled',async()=>{
  assert.equal((await handler(true,speaker).post({query:''})).status,400);
  assert.equal((await handler(true,{}).post({query:'fixture'})).status,422);
});

// Test the original component's pure helpers without mounting or changing them.
const helperSource=uiSource.slice(uiSource.indexOf('function parseTaps'),uiSource.indexOf('export default function SpeakerCalculator'));
const helpers=vm.createContext({TextEncoder,TextDecoder,btoa,atob});
vm.runInContext(stripTypeScriptTypes(helperSource)+'\nthis.helpers={parseTaps,arrangedPositions,encodeProject,decodeProject,extractSpeakerFromText,extractAmplifierFromText,parseRatings};',helpers);
const h=helpers.helpers;
const plain=value=>JSON.parse(JSON.stringify(value));
test('Speaker project links round-trip Unicode and old v1 state',()=>{
  const fixture={v:1,speaker:{...speaker,model:'Ceiling Ω'},amplifier,tap:15,room:{length:30,width:20,ceiling:10,ear:4},spl:{target:75,loss:3,headroom:6},layout:{positions:[{x:25,y:50}]},system:{mode:'70v',ampWatts:500,speakerOhms:8,channels:2,speakersPerChannel:4,loadLimit:80,cableLength:100,wireR:2.525}};
  assert.deepEqual(plain(h.decodeProject(h.encodeProject(fixture))),fixture);
});
test('Tap parsing and layout arrangement preserve expected geometry',()=>{
  assert.deepEqual(plain(h.parseTaps('30, 7.5 / 15 bad -1')),[7.5,15,30]);
  assert.deepEqual(plain(h.arrangedPositions(1)),[{x:50,y:50}]);
  assert.equal(h.arrangedPositions(24).length,24);
  assert.ok(h.arrangedPositions(24).every(p=>p.x>0&&p.x<100&&p.y>0&&p.y<100));
});
test('Local speaker and amplifier spec text parsers preserve usable fields',()=>{
  const s=h.extractSpeakerFromText('Coverage 90 degrees. Sensitivity 90 dB. 70V taps 7.5 W 15 W 30 W. Impedance 8 ohms.','Fixture Speaker.txt');
  assert.equal(s.coverage,90);assert.equal(s.sensitivity,90);assert.deepEqual(plain(s.taps),[7.5,15,30]);
  const a=h.extractAmplifierFromText('2-channel. 70V 500 W. 8 ohms 250 W. 4 ohms 500 W.','Fixture Amp.txt');
  assert.equal(a.channels,2);assert.equal(a.power70v,500);assert.equal(a.minImpedance,4);
});
test('Speaker UI transpiles as TSX and retains origin-local library and shared project key',()=>{
  const compiled=ts.transpileModule(uiSource,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
  assert.equal(compiled.diagnostics?.length,0);
  assert.match(uiSource,/localStorage\.getItem\("bmt-speaker-library"\)/);
  assert.match(uiSource,/get\("project"\)/);
  assert.doesNotMatch(uiSource,/chatgpt\.site/);
});

test('Speaker core physics matches a known simple fixture',()=>{
  const core=uiSource.slice(uiSource.indexOf('    const height = Math.max(.1, ceiling - ear);'),uiSource.indexOf('\n  }, [speaker, tap'));
  const context=vm.createContext({ceiling:10,ear:4,speaker:{coverage:90,sensitivity:90},tap:15,roomL:30,roomW:20,loss:3,ampWatts:500,loadLimit:80,speakersPerChannel:4,channels:2,cableLength:100,wireR:2.525,speakerOhms:8,amplifier:{minImpedance:4}});
  const result=vm.runInContext(`(()=>{${core}})()`,context);
  assert.equal(result.height,6);assert.ok(Math.abs(result.radius-6)<1e-10);
  assert.equal(result.channelLoad,60);assert.equal(result.totalLoad,120);assert.equal(result.reserve,440);
  assert.equal(result.lowZLoad,2);assert.equal(result.maxParallelSpeakers,2);assert.equal(result.wattsPerSpeaker,125);
});
