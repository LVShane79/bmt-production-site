import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync('app/globals.css', 'utf8');
const component = readFileSync('app/learn/it-for-av/LessonMarkdown.tsx', 'utf8');
test('lesson tables preserve words and readable columns without shrinking text', () => {
  const table = css.match(/\.lesson-markdown table\s*\{([^}]+)\}/)[1];
  assert.match(table, /overflow-wrap:\s*normal/);
  assert.match(table, /word-break:\s*normal/);
  assert.match(table, /font-size:\s*\.92rem/);
  assert.match(css, /\.lesson-markdown th, \.lesson-markdown td\s*\{[^}]*min-width:\s*10rem/);
});
test('wide lesson tables remain keyboard-accessible scrolling regions', () => {
  assert.match(css, /\.lesson-table-scroll\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(component, /role="region"/);
  assert.match(component, /aria-label="Lesson comparison table; scroll horizontally if needed"/);
  assert.match(component, /tabIndex=\{0\}/);
});
