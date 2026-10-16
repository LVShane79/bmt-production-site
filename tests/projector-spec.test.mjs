import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app/resources/projection-lab/ProjectorCalculator.tsx', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('function filenameIdentity'), source.indexOf('async function readSpecificationText')) + source.slice(source.indexOf('function parseVerticalLensShift'), source.indexOf('function projectionGeometryStatus'));
const context = vm.createContext({});
vm.runInContext(stripTypeScriptTypes(helpers) + '\nthis.extract = extractProjectorFromText;', context);
function extract(shift) { return context.extract(`8000 lumens. WUXGA. Throw ratio 1.2-2.0:1. ${shift}`, 'Fixture Projector.pdf'); }

test('Projector text extraction preserves explicit asymmetric vertical shift signs and order', () => {
  for (const range of ['+60% / -40%', '+60 / -40%', '+60% / −40%', '−40% / +60%']) {
    const result = extract(`Vertical lens shift ${range}. Horizontal lens shift 20%.`);
    assert.equal(result.shiftVUp, 60, range); assert.equal(result.shiftVDown, 40, range);
    assert.equal(result.shiftH, 20); assert.equal(result.throwMin, 1.2); assert.equal(result.throwMax, 2);
    assert.doesNotMatch(result.note, /manual review required/);
  }
});
test('Projector text extraction preserves explicit symmetric ± and +/- vertical shifts', () => {
  for (const range of ['±35%', '+/-35%', '+ / - 35%']) {
    const result = extract(`Lens shift vertical: ${range}. Horizontal lens shift 20%.`);
    assert.equal(result.shiftVUp, 35, range); assert.equal(result.shiftVDown, 35, range);
  }
});
test('Projector text extraction leaves missing or unsupported vertical ranges reviewable', () => {
  for (const range of ['', 'Vertical lens shift 60%.', 'Vertical lens shift +60%.', 'Vertical lens shift +60% / +40%.', 'Vertical lens shift up 60, down 40.']) {
    const result = extract(`${range} Horizontal lens shift 20%.`);
    assert.equal(result.shiftVUp, 0, range); assert.equal(result.shiftVDown, 0, range);
    assert.match(result.note, /Vertical lens-shift range is missing or unsupported.*manual review required/);
    assert.equal(result.shiftH, 20);
  }
});
test('Projector text extraction flags absent horizontal shift without losing known vertical limits', () => {
  const result = extract('Vertical lens shift +60% / -40%.');
  assert.equal(result.shiftVUp, 60); assert.equal(result.shiftVDown, 40); assert.equal(result.shiftH, 0);
  assert.match(result.note, /Horizontal lens shift was not found.*manual review required/);
});
