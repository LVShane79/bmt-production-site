import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source=await readFile("app/admin/crm/ai-preview-editor.tsx","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const draft={id:"draft-A",name:"Original",updated_version:"v1",lead_ids:["lead-A"]};
const preview={campaignNames:["Suggested name","Alternative"],subject:"Suggested subject",body:"Suggested body"};
function mount(fetchImpl){
 const slots=[];let index=0;const cleanups=[];const saved=[];const calls=[];
 const react={useState(initial){const slot=index++;if(!(slot in slots))slots[slot]=initial;return [slots[slot],value=>{slots[slot]=typeof value==="function"?value(slots[slot]):value;}];},useRef(initial){const slot=index++;return slots[slot]??=( {current:initial});},useEffect(effect){const slot=index++;if(!slots[slot]){slots[slot]=true;cleanups.push(effect());}}};
 const jsx=(type,props)=>({type,props});const modules={react,"react/jsx-runtime":{jsx,jsxs:jsx}};const exports={};
 runInNewContext(`(function(require,exports){${compiled}\n})`,{fetch:async(...args)=>{calls.push(args);return fetchImpl(...args);}})(name=>modules[name],exports);
 return {calls,saved,render(){index=0;return exports.AiPreviewEditor({draft,preview,onSaved:value=>saved.push(value)});},unmount(){for(const cleanup of cleanups)cleanup?.();}};
}
function nodes(node){return !node||typeof node!=="object"?[]:[node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(nodes)];}
const fields=tree=>nodes(tree).filter(x=>["input","textarea"].includes(x.type));
const button=tree=>nodes(tree).find(x=>x.type==="button");
const response=(status,value)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json"}});
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

test("AI editor generation and edits remain local until the explicit versioned internal save",async()=>{
 const ui=mount(async()=>response(200,{...draft,name:"Edited name",updated_version:"v2"}));
 const tree=ui.render();assert.equal(ui.calls.length,0);
 fields(tree).forEach((field,i)=>field.props.onChange({target:{value:["Edited name","Edited subject","Edited body"][i]}}));
 assert.equal(ui.calls.length,0);button(ui.render()).props.onClick();await tick();
 assert.equal(ui.calls.length,1);assert.equal(ui.calls[0][0],"/api/admin/crm/campaign-drafts");assert.equal(ui.calls[0][1].method,"PUT");
 assert.deepEqual(JSON.parse(ui.calls[0][1].body),{id:"draft-A",updatedVersion:"v1",name:"Edited name",subject:"Edited subject",body:"Edited body",state:"draft",leadIds:["lead-A"]});
 assert.equal(ui.saved[0].updated_version,"v2");
});
test("AI editor prevents same-tick duplicate saves and disables pending fields",async()=>{
 let resolve;const deferred=new Promise(r=>{resolve=r;});const ui=mount(()=>deferred);const save=button(ui.render()).props.onClick;save();save();assert.equal(ui.calls.length,1);assert.equal(ui.render().props.disabled,true);resolve(response(200,{...draft,updated_version:"v2"}));await tick();assert.equal(ui.saved.length,1);
});
test("save conflict retains edits, displays review guidance, and never retries",async()=>{
 const ui=mount(async()=>response(409,{error:"stale"}));fields(ui.render())[1].props.onChange({target:{value:"Owner edits"}});button(ui.render()).props.onClick();await tick();assert.equal(fields(ui.render())[1].props.value,"Owner edits");assert.match(JSON.stringify(ui.render()),/Reload the draft before saving/);assert.equal(ui.calls.length,1);assert.equal(ui.saved.length,0);
});
test("ambiguous save failure preserves local edits without claiming nothing was saved",async()=>{
 const ui=mount(async()=>{throw Error("network failure");});button(ui.render()).props.onClick();await tick();assert.match(JSON.stringify(ui.render()),/Could not confirm the save/);assert.equal(ui.calls.length,1);assert.equal(ui.saved.length,0);
});
test("unmount drops late save responses and invalid response identity is rejected",async()=>{
 let resolve;const ui=mount(()=>new Promise(r=>{resolve=r;}));button(ui.render()).props.onClick();ui.unmount();resolve(response(200,{...draft,updated_version:"v2"}));await tick();assert.equal(ui.saved.length,0);
 const invalid=mount(async()=>response(200,{...draft,id:"draft-B",updated_version:"v2"}));button(invalid.render()).props.onClick();await tick();assert.equal(invalid.saved.length,0);assert.match(JSON.stringify(invalid.render()),/could not be verified/);
});
