import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../app/api/projectors/route.ts', import.meta.url), 'utf8');
const js = stripTypeScriptTypes(source)
  .replace(/import \{ NextRequest, NextResponse \} from "next\/server";/, '')
  .replace(/export /g, '') + '\nthis.POST = POST;';
function handler({ key, upstream } = {}) {
  const calls = [];
  const context = vm.createContext({
    process: { env: key ? { OPENAI_API_KEY: key } : {} },
    NextResponse: { json: (body, init) => Response.json(body, init) },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (!upstream) throw new Error('Unexpected network call');
      return upstream(url, options);
    },
  });
  vm.runInContext(js, context);
  return { calls, post: (body) => context.POST({ json: async () => body }) };
}
const option = { brand: 'Test', model: 'Fixture', lumens: 8000, resolution: 'WUXGA', throwMin: 1.2, throwMax: 2, lens: 'Fixture lens', shiftVUp: 50, shiftVDown: 50, shiftH: 20, source: 'https://example.com/spec', note: 'Test fixture only' };

test('migration removes all Sites dependency from projector API', () => {
  assert.doesNotMatch(source, /chatgpt\.site/);
});
test('empty query is rejected without network access', async () => {
  const api = handler();
  assert.equal((await api.post({ query: ' ' })).status, 400);
  assert.equal(api.calls.length, 0);
});
test('missing Vercel key is a clear 503 and never contacts Sites', async () => {
  const api = handler();
  const response = await api.post({ query: 'test projector' });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /calculator.*import.*manually/);
  assert.equal(api.calls.length, 0);
});
test('configured key uses OpenAI directly and preserves UI response contract', async () => {
  const api = handler({ key: 'test-placeholder', upstream: async () => Response.json({ output_text: JSON.stringify({ options: [option] }) }) });
  const response = await api.post({ query: 'test projector', constraints: { mounting: 'Ceiling' } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.projector, option);
  assert.deepEqual(result.projectors, [option]);
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].url, 'https://api.openai.com/v1/responses');
  const request = JSON.parse(api.calls[0].options.body);
  assert.match(request.input, /mounting: Ceiling/);
  assert.equal(request.tool_choice, 'required');
});
test('upstream failure produces a handled error response', async () => {
  const api = handler({ key: 'test-placeholder', upstream: async () => Response.json({ error: { message: 'Upstream unavailable' } }, { status: 503 }) });
  const response = await api.post({ query: 'test' });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, 'Upstream unavailable');
});
test('incomplete AI data is rejected', async () => {
  const api = handler({ key: 'test-placeholder', upstream: async () => Response.json({ output_text: '{"options":[{"brand":"Test"}]}' }) });
  assert.equal((await api.post({ query: 'test' })).status, 422);
});
test('nested Responses text is accepted', async () => {
  const api = handler({ key: 'test-placeholder', upstream: async () => Response.json({ output: [{ content: [{ type: 'output_text', text: JSON.stringify({ options: [option] }) }] }] }) });
  assert.equal((await api.post({ query: 'test' })).status, 200);
});
