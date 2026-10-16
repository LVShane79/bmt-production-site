import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../app/resources/projection-lab/ProjectorCalculator.tsx', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('function projectionGeometryStatus'), source.indexOf('export default function ProjectorCalculator'));
const context = vm.createContext({ TextEncoder, TextDecoder, btoa, atob, URL });
vm.runInContext(stripTypeScriptTypes(helpers) + '\nthis.helpers = { projectionGeometryStatus, encodeProjectionDesign, decodeProjectionDesign };', context);
const h = context.helpers;
const plain = value => JSON.parse(JSON.stringify(value));
const projector = { brand: 'Fixture', model: 'Projector Ω', lumens: 8500, resolution: 'WUXGA', throwMin: 1.44, throwMax: 2.32, shiftVUp: 67, shiftVDown: 67, shiftH: 30, note: 'Reference — vérifier' };
const defaults = { ratios: { '16:9': 16 / 9 }, presets: { normal: { fc: 50 } }, aspect: '16:9', screenInput: 180, projector, calculationMode: 'screen', knownDistance: 24, selectedThrow: 1.88, mountDistance: 24, brightnessMode: 'calibrated', measuredLumens: 6500, lightLoss: 25, gain: 1, ambient: 'normal', projectionAlignment: 'center', screenBottom: 3, manualLensHeight: 8, horizontalOffset: 0, chassisDepth: 2.3, lensInset: .15, serviceClearance: 1 };
const core = source.slice(source.indexOf('    const ratio = ratios[aspect];'), source.indexOf('\n  }, [aspect'));
function calculate(overrides = {}) {
  return vm.runInContext(`(() => {${core}})()`, vm.createContext({ ...defaults, ...overrides }));
}
function status(overrides = {}) {
  const calc = calculate(overrides);
  return { calc, badge: h.projectionGeometryStatus(calc.distanceFit, calc.shiftFit) };
}

test('Projection geometry badge passes the valid default fixture', () => {
  const { calc, badge } = status();
  assert.equal(calc.distanceFit, true); assert.equal(calc.shiftFit, true);
  assert.equal(badge.pass, true); assert.equal(badge.label, 'Geometry passes');
  assert.match(source, /projectionGeometryStatus\(calc\.distanceFit, calc\.shiftFit\)/);
  assert.match(source, /status-pill \$\{geometryStatus\.pass/);
});
test('Projection geometry badge rejects invalid throw with valid lens shift', () => {
  const { calc, badge } = status({ calculationMode: 'fit', knownDistance: 50 });
  assert.equal(calc.distanceFit, false); assert.equal(calc.shiftFit, true);
  assert.equal(badge.pass, false); assert.equal(badge.label, 'Review throw distance');
});
test('Projection geometry badge rejects invalid shift with valid throw', () => {
  const { calc, badge } = status({ horizontalOffset: 10 });
  assert.equal(calc.distanceFit, true); assert.equal(calc.shiftFit, false);
  assert.equal(badge.pass, false); assert.equal(badge.label, 'Review lens shift');
});
test('Projection geometry badge identifies combined throw and shift failure', () => {
  const { badge } = status({ calculationMode: 'fit', knownDistance: 50, horizontalOffset: 10 });
  assert.equal(badge.pass, false); assert.equal(badge.label, 'Review throw + lens shift');
});

test('Projection share links round-trip Unicode equipment data', () => {
  const design = { v: 2, projector, aspect: '16:9' };
  assert.deepEqual(plain(h.decodeProjectionDesign(h.encodeProjectionDesign(design))), design);
});
test('Projection decoder preserves old ASCII and Latin-1 links', () => {
  for (const model of ['Fixture', 'Café']) {
    const old = { aspect: '16:9', screenInput: 180, projector: { brand: 'Legacy', model } };
    assert.deepEqual(plain(h.decodeProjectionDesign(btoa(JSON.stringify(old)))), old);
  }
});

const stateNames = ['aspect', 'screenInput', 'customSize', 'projectionAlignment', 'gain', 'ambient', 'lightLoss', 'screenBottom', 'horizontalOffset', 'projector', 'calculationMode', 'mountDistance', 'knownDistance', 'selectedThrow', 'manualLensHeight', 'chassisDepth', 'lensInset', 'serviceClearance', 'brightnessMode', 'measuredLumens', 'brightnessUnit'];
const effect = source.slice(source.indexOf('  useEffect(() => {'), source.indexOf('  }, []);') + '  }, []);'.length);
function restore(encoded, initial = {}) {
  const restored = { ...initial };
  const scope = { URL, location: { href: 'https://example.com/resources/projection-lab?design=' + encodeURIComponent(encoded) }, ratios: { '16:9': 16 / 9, '16:10': 1.6 }, presets: { normal: { fc: 50 }, dim: { fc: 30 } }, screenPresets: { '16:9': [180], '16:10': [189] }, decodeProjectionDesign: h.decodeProjectionDesign, useEffect: fn => fn(), activateProjector: value => { restored.projector = value; } };
  for (const name of stateNames) scope['set' + name[0].toUpperCase() + name.slice(1)] = value => { restored[name] = value; };
  vm.runInContext(stripTypeScriptTypes(effect), vm.createContext(scope));
  return plain(restored);
}
test('Projection share writer and hydration preserve complete non-default design settings', () => {
  const state = { aspect: '16:10', screenInput: 193, customSize: true, projectionAlignment: 'manual', gain: 1.2, ambient: 'dim', lightLoss: 20, screenBottom: 4, horizontalOffset: 2, projector, calculationMode: 'fit', mountDistance: 22, knownDistance: 50, selectedThrow: 1.7, manualLensHeight: 9, chassisDepth: 3, lensInset: .25, serviceClearance: 2, brightnessMode: 'measured', measuredLumens: 4200, brightnessUnit: 'nits' };
  const expression = source.match(/url\.searchParams\.set\("design", (encodeProjectionDesign\(\{[^;]+\}\))\);/)?.[1];
  assert.ok(expression, 'share writer must use the tested UTF-8 encoder');
  const encoded = vm.runInContext(expression, vm.createContext({ ...state, encodeProjectionDesign: h.encodeProjectionDesign }));
  assert.deepEqual(restore(encoded), state);
});
test('Projection legacy hydration keeps defaults for settings absent from old links', () => {
  const initial = { calculationMode: 'screen', knownDistance: 24, brightnessMode: 'calibrated', manualLensHeight: 8 };
  const old = { aspect: '16:9', screenInput: 180, projectionAlignment: 'center', projector: { brand: 'Legacy', model: 'Café' } };
  assert.deepEqual(restore(btoa(JSON.stringify(old)), initial), { ...initial, ...old });
});
test('Projection invalid shared state leaves the initial design intact', () => {
  const initial = { calculationMode: 'screen', knownDistance: 24 };
  assert.deepEqual(restore('invalid-fixture', initial), initial);
});
