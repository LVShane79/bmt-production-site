import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3123'],{cwd:new URL('../',import.meta.url),env:{PATH:process.env.PATH,HOME:process.env.HOME,NODE_ENV:'production',OPENAI_API_KEY:''},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
try {
  let ready=false;
  for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:3123/resources/speaker-lab');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  assert.ok(ready,logs);
  for(const [path,contains] of [['/resources/speaker-lab','Start with any speaker.'],['/resources/projection-lab','Projection'],['/resources','/resources/speaker-lab'],['/','Black Mountain'],['/learn/it-for-av','AV'],['/sitemap.xml','/resources/speaker-lab']]){
    const r=await fetch('http://127.0.0.1:3123'+path);assert.equal(r.status,200,path);assert.ok((await r.text()).includes(contains),path);console.log('PASS GET '+path);
  }
  for(const path of ['/speaker-lab/bmt-monogram-white.png','/speaker-lab/bmt-lockup-white.png','/og.png']){assert.equal((await fetch('http://127.0.0.1:3123'+path)).status,200,path);console.log('PASS asset '+path);}
  const worker=await fetch('http://127.0.0.1:3123/labs/pdfjs/pdf.worker.min.mjs');
  assert.equal(worker.status,200,'PDF worker');
  assert.match(worker.headers.get('content-type') || '', /javascript/);
  const workerBytes=Buffer.from(await worker.arrayBuffer());
  assert.deepEqual(workerBytes,await readFile(require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')));
  assert.match(workerBytes.toString('utf8'), /WorkerMessageHandler/);
  console.log('PASS same-origin PDF worker JavaScript');
  for(const path of ['/api/projectors','/api/speakers']){const r=await fetch('http://127.0.0.1:3123'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'Fixture'})});assert.equal(r.status,503,path);assert.match((await r.json()).error,/manual/);console.log('PASS no-key '+path);}
}finally{server.kill('SIGTERM');}
