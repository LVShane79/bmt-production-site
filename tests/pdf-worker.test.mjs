import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { ESLint } from 'eslint';
import { preparePdfWorker } from '../scripts/prepare-pdf-worker.mjs';

const require = createRequire(import.meta.url);
for (const [lab, component] of [['speaker-lab', 'SpeakerCalculator'], ['projection-lab', 'ProjectorCalculator']]) {
  const source = fs.readFileSync(new URL(`../app/resources/${lab}/${component}.tsx`, import.meta.url), 'utf8');
  const start = source.indexOf('async function readSpecificationText(');
  const fn = source.slice(start, source.indexOf('\n}\n', start) + 2);
  function reader(pdfjs) {
    const context = vm.createContext({ mockPdfjs: pdfjs });
    vm.runInContext(stripTypeScriptTypes(fn).replace('await import("pdfjs-dist")', 'mockPdfjs') + '\nthis.read = readSpecificationText;', context);
    return context.read;
  }
  test(`${lab} PDF reader configures a same-origin string worker and extracts every page`, async () => {
    let workerSrc;
    let seenData;
    const pdfjs = {
      GlobalWorkerOptions: { set workerSrc(value) { assert.equal(typeof value, 'string'); workerSrc = value; } },
      getDocument(options) {
        seenData = options.data;
        return { promise: Promise.resolve({ numPages: 2, getPage: async n => ({ getTextContent: async () => ({ items: [{ str: `page ${n}` }, { type: 'artifact' }] }) }) }) };
      },
    };
    const data = new Uint8Array([37, 80, 68, 70]).buffer;
    assert.equal(await reader(pdfjs)({ type: 'application/pdf', name: 'Fixture.pdf', arrayBuffer: async () => data }), 'page 1 \npage 2 ');
    assert.equal(workerSrc, '/labs/pdfjs/pdf.worker.min.mjs');
    assert.equal(seenData, data);
    assert.doesNotMatch(fn, /\?url|worker\.default/);
  });
  test(`${lab} text-file fallback does not load or configure PDF.js`, async () => {
    assert.equal(await reader(null)({ type: 'text/plain', name: 'Fixture.txt', text: async () => 'local fixture' }), 'local fixture');
  });
}

test('worker preparation copies the exact installed PDF.js worker bytes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'bmt-pdf-worker-'));
  try {
    const destination = await preparePdfWorker(directory);
    assert.equal(destination, path.join(directory, 'public/labs/pdfjs/pdf.worker.min.mjs'));
    assert.deepEqual(await readFile(destination), await readFile(require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')));
    assert.match(await readFile(destination, 'utf8'), /WorkerMessageHandler/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('both build and dev prepare the installed worker, and lint excludes generated vendor code', async () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.build, 'node scripts/prepare-pdf-worker.mjs && next build');
  assert.equal(pkg.scripts.dev, 'node scripts/prepare-pdf-worker.mjs && next dev');
  const installed = require('pdfjs-dist/package.json');
  assert.equal(installed.version, pkg.dependencies['pdfjs-dist']);
  assert.equal(await new ESLint().isPathIgnored('public/labs/pdfjs/pdf.worker.min.mjs'), true);
});
