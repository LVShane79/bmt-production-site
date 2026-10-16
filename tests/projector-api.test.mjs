import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../app/api/projectors/route.ts', import.meta.url), 'utf8');
const js = stripTypeScriptTypes(source)
  .replace(/import \{ NextRequest, NextResponse \} from "next\/server";/, '')
  .replace(/export /g, '') + '\nthis.POST = POST;';
function handler({ key, upstream, abortSignal = AbortSignal } = {}) {
  const calls = [];
  const started = Promise.withResolvers();
  const context = vm.createContext({
    AbortSignal: abortSignal,
    Error,
    DOMException,
    process: { env: key ? { OPENAI_API_KEY: key } : {} },
    NextResponse: { json: (body, init) => Response.json(body, init) },
    fetch: async (url, options) => {
      calls.push({ url, options });
      started.resolve();
      if (!upstream) throw new Error('Unexpected network call');
      return upstream(url, options);
    },
  });
  vm.runInContext(js, context);
  return { calls, started: started.promise, post: (body) => context.POST({ json: async () => body }) };
}
const option = { brand: 'Test', model: 'Fixture', lumens: 8000, resolution: 'WUXGA', throwMin: 1.2, throwMax: 2, lens: 'Fixture lens', shiftVUp: 50, shiftVDown: 50, shiftH: 20, source: 'https://example.com/spec', note: 'Test fixture only' };

// Advance the request deadline without real timers or paid upstream requests.
function timeoutClock() {
  let now = 0;
  const timeouts = [];
  return {
    timeouts,
    AbortSignal: {
      timeout(milliseconds) {
        const controller = new AbortController();
        timeouts.push({ milliseconds, deadline: now + milliseconds, controller });
        return controller.signal;
      },
    },
    advance(milliseconds) {
      now += milliseconds;
      for (const { deadline, controller } of timeouts) {
        if (now >= deadline && !controller.signal.aborted) {
          controller.abort(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
        }
      }
    },
  };
}

function rejectOnAbort(signal, bodyRead = false) {
  assert.ok(signal instanceof AbortSignal, 'The upstream request must receive its deadline signal');
  return new Promise((resolve, reject) => {
    const abort = () => reject(bodyRead ? new DOMException('The operation was aborted.', 'AbortError') : signal.reason);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

async function assertTimeoutResponse(response) {
  assert.equal(response.status, 504);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ['error']);
  assert.equal(typeof body.error, 'string');
  assert.match(body.error, /timed out|too long/i);
  assert.match(body.error, /try again|retry/i);
  assert.match(body.error, /calculator|manual|import/i);
  assert.ok(body.error.length < 400, 'The timeout error must stay concise and safe for the UI');
}

test('migration removes all Sites dependency from projector API', () => {
  assert.doesNotMatch(source, /chatgpt\.site/);
});
test('projector research uses Node with a 60-second function budget', () => {
  assert.match(source, /export const runtime\s*=\s*["']nodejs["']/);
  assert.match(source, /export const maxDuration\s*=\s*60\s*;/);
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
test('research gets a 55-second abort budget below the function limit', async () => {
  const clock = timeoutClock();
  const api = handler({
    key: 'test-placeholder',
    abortSignal: clock.AbortSignal,
    upstream: async () => Response.json({ output_text: JSON.stringify({ options: [option] }) }),
  });
  assert.equal((await api.post({ query: 'test projector' })).status, 200);
  assert.deepEqual(clock.timeouts.map(({ milliseconds }) => milliseconds), [55_000]);
  assert.equal(api.calls[0].options.signal, clock.timeouts[0].controller.signal);
  assert.equal(api.calls[0].options.signal.aborted, false);
});
test('research can complete after the former 25-second Edge initial-response limit', async () => {
  const clock = timeoutClock();
  const upstream = Promise.withResolvers();
  const api = handler({ key: 'test-placeholder', abortSignal: clock.AbortSignal, upstream: () => upstream.promise });
  const pending = api.post({ query: 'test projector' });
  await api.started;
  clock.advance(30_000);
  assert.equal(api.calls[0].options.signal.aborted, false);
  upstream.resolve(Response.json({ output_text: JSON.stringify({ options: [option] }) }));
  const response = await pending;
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).projectors, [option]);
});
test('a stalled upstream fetch returns helpful JSON at the 55-second deadline', async () => {
  const clock = timeoutClock();
  const api = handler({ key: 'test-placeholder', abortSignal: clock.AbortSignal, upstream: (url, { signal }) => rejectOnAbort(signal) });
  const pending = api.post({ query: 'test projector' });
  await api.started;
  const signal = api.calls[0].options.signal;
  clock.advance(54_999);
  assert.equal(signal.aborted, false);
  clock.advance(1);
  assert.equal(signal.aborted, true);
  assert.equal(signal.reason.name, 'TimeoutError');
  await assertTimeoutResponse(await pending);
});
test('the same deadline handles an AbortError while reading the upstream response body', async () => {
  const clock = timeoutClock();
  const bodyStarted = Promise.withResolvers();
  const api = handler({
    key: 'test-placeholder',
    abortSignal: clock.AbortSignal,
    upstream: async (url, { signal }) => ({
      ok: true,
      json: () => {
        bodyStarted.resolve();
        return rejectOnAbort(signal, true);
      },
    }),
  });
  const pending = api.post({ query: 'test projector' });
  await bodyStarted.promise;
  clock.advance(55_000);
  await assertTimeoutResponse(await pending);
  assert.equal(clock.timeouts.length, 1, 'Reading the body must not restart the deadline');
});
test('a non-timeout network failure keeps the handled 422 response', async () => {
  const api = handler({ key: 'test-placeholder', upstream: async () => { throw new Error('Network unavailable'); } });
  const response = await api.post({ query: 'test' });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, 'Network unavailable');
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
