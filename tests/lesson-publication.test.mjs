import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const added = JSON.parse(readFileSync('app/learn/it-for-av/additional-lessons.json','utf8'));
test('completed lessons extend the library through 25 without repeating the USB primer',()=>{
 assert.deepEqual(added.map(x=>x.number),Array.from({length:12},(_,i)=>i+14));
 assert.equal(new Set(added.map(x=>x.slug)).size,added.length);
 assert.equal(added.at(-1).slug,'usb-extension-and-usb-over-ip');
 assert.match(added.at(-1).markdown,/\/learn\/it-for-av\/usb-for-av/);
});
test('public instructional content has no internal identifiers or chat rendering artifacts',()=>{
 const all=JSON.stringify(added)+readFileSync('app/learn/it-for-av/snmp-lab.json','utf8')+readFileSync('app/learn/it-for-av/practical-examples.json','utf8');
 assert.doesNotMatch(all,/bmtadmin|bmt-monitor|BMT should|BMT Network Manager|BMT projects|info@blackmountain\.tech||||```mermaid|\\\\\[/);
});
test('course and lesson graphic inventories cover every lesson',()=>{
 for(const path of ['app/learn/it-for-av/page.tsx','app/learn/it-for-av/[slug]/page.tsx']) {
 const source=readFileSync(path,'utf8');
 const kinds=source.match(/const graphicKinds = (\[[^;]+\]) as const;/)[1];
 assert.equal(JSON.parse(kinds).length,25);
 }
});
