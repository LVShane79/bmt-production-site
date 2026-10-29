import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("app/learn/page.tsx", "utf8");
const audio = readFileSync("app/learn/audio/lessons.ts", "utf8");
const search = readFileSync("app/learn/LearnSearch.tsx", "utf8");
const itLessons = readFileSync("app/learn/it-for-av/lessons.ts", "utf8");
test("Learn search indexes all published IT and Audio lessons", () => {
  assert.match(page, /audioLessons\.map/);
  assert.match(page, /text: `\$\{lesson\.objectives\.join/);
  assert.match(audio, /Audio 101: What Sound Is/);
  assert.match(itLessons, /Dante/);
});
test("search remains case-insensitive, handles punctuation, no results, and an empty query", () => {
  assert.match(search, /normalizedSearchText/);
  assert.match(search, /replace\(\/\[\^\\p\{L\}\\p\{N\}\]\+\/gu, " "\)/);
  assert.match(search, /if \(!term\) return \[\]/);
  assert.match(search, /No published lessons mention/);
  assert.match(search, /query\.trim\(\)/);
  assert.match(search, /normalizedSearchText\(query\)\.split\(" "\)\[0\]/);
});
test("audio publication retains the complete lesson series and original reference links", () => {
  assert.equal((audio.match(/number: [123], slug:/g) || []).length, 3);
  assert.match(audio, /https:\/\/openstax\.org\/books\/physics\/pages\/14-1-speed-of-sound-frequency-and-wavelength/);
  assert.match(audio, /https:\/\/royerlabs\.com\/faqs\//);
  assert.match(audio, /Do not assume phantom power is universally safe or universally harmful/);
});
test("polar-pattern SVG paths are local to their translated panels", () => {
  const graphic = readFileSync("app/learn/audio/AudioGraphic.tsx", "utf8");
  assert.match(graphic, /title:"Cardioid", d:"M115 190/);
  assert.match(graphic, /title:"Figure eight", d:"M115 190/);
  assert.match(graphic, /title:"Omnidirectional", d:"M115 125/);
  assert.doesNotMatch(graphic, /title:"Cardioid", d:"M320/);
  assert.doesNotMatch(graphic, /title:"Figure eight", d:"M560/);
  assert.match(graphic, /transform={`translate\(\$\{x\} 0\)`}/);
});
