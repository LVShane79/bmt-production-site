import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../app/resources/projection-lab/ProjectorCalculator.tsx', import.meta.url), 'utf8');
const searchStart = source.indexOf('  async function search()');
const searchEnd = source.indexOf('  async function importSpecification', searchStart);
assert.ok(searchStart >= 0 && searchEnd > searchStart, 'Search handlers must be available for regression tests');
const handlers = stripTypeScriptTypes(source.slice(searchStart, searchEnd));
const plain = value => JSON.parse(JSON.stringify(value));
const query = '  Epson classroom projector  ';
const constraints = { minDistance: '18', maxDistance: '30', screen: '180', resolution: 'WUXGA or better', mounting: 'Ceiling', connections: 'HDBaseT' };
const option = index => ({ brand: 'Fixture', model: `Projector ${index}`, lumens: 8000, resolution: 'WUXGA', throwMin: 1.2, throwMax: 2, lens: `Lens ${index}`, shiftVUp: 50, shiftVDown: 50, shiftH: 20, source: 'https://example.com/spec', note: 'Test fixture only' });
const options = count => Array.from({ length: count }, (_, index) => option(index + 1));

function harness({ input = query, response = () => Response.json({ projectors: options(3) }), refs = {} } = {}) {
  const state = { query: input, searching: false, message: 'Previous message', results: [option(0)] };
  const calls = [];
  const transitions = [];
  const searchInFlight = { current: false };
  const scope = {
    Error, query: input, constraints, searching: false, searchInFlight,
    searchInputRef: { current: null }, resultsRef: { current: null }, dialogRef: { current: null },
    ...refs,
    fetch: async (url, init) => { calls.push({ url, init }); return response(); },
  };
  for (const name of ['query', 'searching', 'message', 'results']) {
    scope[`set${name[0].toUpperCase()}${name.slice(1)}`] = value => {
      state[name] = value;
      transitions.push({ name, value });
      // Keep the render closure stale, just as repeated Enter events can be
      // handled before React has committed setSearching(true).
    };
  }
  const context = vm.createContext(scope);
  vm.runInContext(`${handlers}\nthis.runSearch = search; this.showResults = showSearchResults;`, context);
  return { state, calls, transitions, searchInFlight, search: context.runSearch, showResults: context.showResults };
}

for (const count of [3, 5]) {
  test(`Projection search retains all ${count} returned options and the original query`, async () => {
    const projectors = options(count);
    const run = harness({ response: () => Response.json({ projectors }) });
    await run.search();
    assert.deepEqual(plain(run.state.results), projectors);
    assert.equal(run.state.query, query);
    assert.equal(run.state.message, '');
    assert.equal(run.state.searching, false);
    assert.equal(run.searchInFlight.current, false);
    assert.equal(run.calls.length, 1);
    assert.equal(run.calls[0].url, '/api/projectors');
    assert.equal(run.calls[0].init.method, 'POST');
    assert.deepEqual(JSON.parse(run.calls[0].init.body), { query, constraints });
    assert.deepEqual(run.transitions.filter(({ name }) => name === 'searching').map(({ value }) => value), [true, false]);
  });
}

test('Projection search accepts the legacy single-projector response', async () => {
  const projector = option(1);
  const run = harness({ response: () => Response.json({ projector }) });
  await run.search();
  assert.deepEqual(plain(run.state.results), [projector]);
  assert.equal(run.state.message, '');
});

test('Projection empty query gives useful feedback without contacting the service', async () => {
  const run = harness({ input: ' \t\n ' });
  await run.search();
  assert.equal(run.calls.length, 0);
  assert.match(run.state.message, /enter.*manufacturer.*projector.*lens.*requirement/i);
  assert.equal(run.state.query, ' \t\n ');
  assert.equal(run.state.searching, false);
  assert.equal(run.searchInFlight.current, false);
});

for (const [name, payload] of [['null payload', null], ['missing options', {}], ['empty options', { projectors: [] }]]) {
  test(`Projection search explains ${name} instead of silently resetting`, async () => {
    const run = harness({ response: () => Response.json(payload) });
    await run.search();
    assert.deepEqual(plain(run.state.results), []);
    assert.match(run.state.message, /no equipment options.*try.*model.*specification.*manual/i);
    assert.equal(run.state.query, query);
    assert.equal(run.state.searching, false);
    assert.equal(run.searchInFlight.current, false);
  });
}

test('Projection non-JSON response produces readable retry feedback', async () => {
  const run = harness({ response: () => new Response('<html>Service unavailable</html>', { status: 502, headers: { 'content-type': 'text/html' } }) });
  await run.search();
  assert.match(run.state.message, /unreadable response.*try again/i);
  assert.doesNotMatch(run.state.message, /unexpected token|syntaxerror|<html>/i);
  assert.deepEqual(plain(run.state.results), []);
  assert.equal(run.state.query, query);
  assert.equal(run.state.searching, false);
  assert.equal(run.searchInFlight.current, false);
});

test('Projection HTTP error preserves the service explanation and clears stale results', async () => {
  const message = 'AI lookup is unavailable. Use a specification sheet or manual entry.';
  const run = harness({ response: () => Response.json({ error: message }, { status: 503 }) });
  await run.search();
  assert.equal(run.state.message, message);
  assert.deepEqual(plain(run.state.results), []);
  assert.equal(run.state.query, query);
  assert.equal(run.state.searching, false);
  assert.equal(run.searchInFlight.current, false);
});

test('Projection HTTP error without a service message still gives retry feedback', async () => {
  const run = harness({ response: () => Response.json({}, { status: 500 }) });
  await run.search();
  assert.match(run.state.message, /lookup failed.*try again/i);
  assert.equal(run.state.searching, false);
  assert.equal(run.searchInFlight.current, false);
});

test('Projection network rejection releases the lock so the user can retry', async () => {
  let attempt = 0;
  const run = harness({ response: () => {
    if (++attempt === 1) throw new Error('Network connection interrupted');
    return Response.json({ projectors: options(3) });
  } });
  await run.search();
  assert.equal(run.state.message, 'Network connection interrupted');
  assert.equal(run.searchInFlight.current, false);
  assert.equal(run.state.searching, false);
  await run.search();
  assert.equal(run.calls.length, 2);
  assert.equal(run.state.results.length, 3);
  assert.equal(run.state.message, '');
  assert.equal(run.state.query, query);
});

test('Projection repeated Enter while in flight makes exactly one request', async () => {
  let resolveResponse;
  const pending = new Promise(resolve => { resolveResponse = resolve; });
  const run = harness({ response: () => pending });
  const first = run.search();
  assert.equal(run.state.searching, true);
  assert.equal(run.searchInFlight.current, true);
  assert.deepEqual(plain(run.state.results), []);
  assert.equal(run.state.message, '');
  const transitionCount = run.transitions.length;
  await Promise.all([run.search(), run.search(), run.search()]);
  assert.equal(run.calls.length, 1);
  assert.equal(run.transitions.length, transitionCount, 'Repeated Enter must not reset pending feedback');
  resolveResponse(Response.json({ projectors: options(5) }));
  await first;
  assert.equal(run.state.results.length, 5);
  assert.equal(run.state.query, query);
  assert.equal(run.state.searching, false);
  assert.equal(run.searchInFlight.current, false);
});

test('View results dismisses the keyboard, focuses without scrolling, then scrolls the dialog', () => {
  const events = [];
  const run = harness({ refs: {
    searchInputRef: { current: { blur: () => events.push(['blur']) } },
    resultsRef: { current: { focus: value => events.push(['focus', plain(value)]), getBoundingClientRect: () => ({ top: 920 }) } },
    dialogRef: { current: { scrollTop: 240, getBoundingClientRect: () => ({ top: 80 }), scrollTo: value => events.push(['scroll', plain(value)]) } },
  } });
  run.showResults();
  assert.deepEqual(events, [['blur'], ['focus', { preventScroll: true }], ['scroll', { top: 1064, behavior: 'smooth' }]]);
});

test('View results clamps scrolling at the dialog start and tolerates an absent input', () => {
  const events = [];
  const run = harness({ refs: {
    resultsRef: { current: { focus: () => {}, getBoundingClientRect: () => ({ top: 10 }) } },
    dialogRef: { current: { scrollTop: 0, getBoundingClientRect: () => ({ top: 30 }), scrollTo: value => events.push(plain(value)) } },
  } });
  run.showResults();
  assert.deepEqual(events, [{ top: 0, behavior: 'smooth' }]);
});

test('View results safely ignores a dismissed dialog or unavailable results', () => {
  for (const refs of [{}, { dialogRef: { current: {} } }, { resultsRef: { current: {} } }]) {
    assert.doesNotThrow(() => harness({ refs }).showResults());
  }
});

// Render the real AI-tab JSX with fixture state. This checks user-visible
// feedback without a network service or a browser and avoids duplicating JSX.
const ast = ts.createSourceFile('ProjectorCalculator.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let aiExpression;
function findAiTab(node) {
  if (ts.isJsxExpression(node) && node.expression?.getText(ast).startsWith('dialogTab === "ai" &&')) aiExpression = node.expression;
  ts.forEachChild(node, findAiTab);
}
findAiTab(ast);
assert.ok(aiExpression, 'The AI search tab must be present');
const renderCode = ts.transpileModule(`function renderSearch() { return (${aiExpression.getText(ast)}); }\nthis.renderSearch = renderSearch;`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, jsxFactory: 'React.createElement', jsxFragmentFactory: 'React.Fragment' },
}).outputText;
function renderSearch(overrides = {}) {
  const context = vm.createContext({
    React, dialogTab: 'ai', query, constraints, searching: false, message: '', results: [], searchInputRef: { current: null },
    search() {}, setQuery() {}, setConstraints() {}, showSearchResults() {}, ...overrides,
  });
  vm.runInContext(renderCode, context);
  return renderToStaticMarkup(context.renderSearch());
}
function feedback(html) {
  const searchBoxIndex = html.indexOf('class="search-box"');
  const feedbackIndex = html.indexOf('class="search-feedback"');
  const constraintsIndex = html.indexOf('class="constraint-grid"');
  assert.ok(searchBoxIndex >= 0 && searchBoxIndex < feedbackIndex && feedbackIndex < constraintsIndex, 'Feedback must appear immediately after the search controls, before mobile constraints');
  const region = html.slice(feedbackIndex, constraintsIndex);
  assert.match(region, /role="status"/);
  assert.match(region, /aria-live="polite"/);
  assert.match(region, /aria-atomic="true"/);
  return region;
}

for (const count of [1, 3, 5]) {
  test(`Projection ${count}-option success renders the count and View results above constraints`, () => {
    const html = renderSearch({ results: options(count) });
    const region = feedback(html);
    assert.match(region, new RegExp(`${count} researched option${count === 1 ? '' : 's'} found\\.`));
    assert.match(region, />View results ↓<\/button>/);
    assert.match(html, /value="  Epson classroom projector  "/);
  });
}

test('Projection pending feedback remains visible above constraints and disables Search', () => {
  const html = renderSearch({ searching: true });
  assert.match(feedback(html), /Researching manufacturer sources.*about a minute/);
  assert.match(html, /<button disabled="">Researching…<\/button>/);
  assert.doesNotMatch(html, /View results/);
});

test('Projection error feedback is visible above constraints with no success action', () => {
  const message = 'No equipment options were returned. Try a specific model.';
  const html = renderSearch({ message });
  assert.ok(feedback(html).includes(message));
  assert.equal(html.split(message).length - 1, 1);
  assert.doesNotMatch(html, /View results/);
});

test('Projection result navigation is wired to the input, dialog and focusable result destination', () => {
  assert.match(source, /<input\s+ref=\{searchInputRef\}\s+value=\{query\}/);
  assert.match(source, /<section\s+ref=\{dialogRef\}\s+className="dialog"/);
  assert.match(source, /onClick=\{showSearchResults\}>View results/);
  assert.match(source, /<div\s+ref=\{resultsRef\}\s+tabIndex=\{-1\}\s+aria-label="Equipment search results"\s+className="search-results"/);
});
