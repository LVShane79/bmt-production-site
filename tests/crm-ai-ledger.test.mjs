import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const migration = await readFile("db/migrations/0006_crm_ai_draft_usage.sql", "utf8");
const reservationCost = 304500;

async function ledger(t) {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(migration);
  return db;
}
async function reserve(db, id, owner = "owner", cost = reservationCost) {
  return (await db.query("SELECT crm_reserve_ai_draft_usage($1,$2,$3,0,1000) AS state", [id, owner, cost])).rows[0].state;
}
async function finish(db, id, state, input = null, output = null) {
  return (await db.query("SELECT crm_finish_ai_draft_usage($1,$2,$3,$4,'fixture') AS state", [id, state, input, output])).rows[0].state;
}
async function usage(db, id) {
  return (await db.query("SELECT * FROM crm_ai_draft_usage WHERE id=$1", [id])).rows[0];
}

test("AI ledger shares the monthly dollar budget across distinct owner IDs", async t => {
  const db = await ledger(t);
  // Nine reservations consume $2.7405, even when every request has a distinct owner.
  for (let i = 0; i < 9; i++) assert.equal(await reserve(db, `r-${i}`, `owner-${i}`), "created");
  await assert.rejects(reserve(db, "over-budget", "another-owner"), /budget or rate limit/);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_ai_draft_usage")).rows[0].count, 9);
  assert.match(migration, /pg_advisory_xact_lock\(1129467201,1\)/);
  assert.doesNotMatch(migration, /pg_advisory_xact_lock\(hashtext\(p_owner\)\)/);
  // This executes SQL semantics sequentially; it is not a real PostgreSQL concurrency test.
});

test("AI ledger settles provider overhead above 3000 tokens up to the conservative ceiling", async t => {
  const db = await ledger(t);
  await reserve(db, "overhead");
  assert.equal(await finish(db, "overhead", "completed", 3001, 3), "completed");
  assert.equal((await usage(db, "overhead")).actual_usd_micros, 2265);
  await reserve(db, "ceiling");
  assert.equal(await finish(db, "ceiling", "completed", 400000, 1000), "completed");
  const row = await usage(db, "ceiling");
  assert.equal(row.actual_input_tokens, 400000);
  assert.equal(row.actual_output_tokens, 1000);
  assert.equal(row.actual_usd_micros, reservationCost);
  assert.ok(row.completed_at);
  assert.ok(row.settled_at);
});

test("AI ledger rejects missing, negative and above-ceiling actual usage without releasing reservation", async t => {
  const db = await ledger(t);
  await reserve(db, "invalid-usage");
  for (const [input, output] of [[null, 0], [0, null], [-1, 0], [400001, 0], [0, -1], [0, 1001]]) {
    await assert.rejects(finish(db, "invalid-usage", "completed", input, output), /invalid AI usage settlement/);
    assert.equal((await usage(db, "invalid-usage")).state, "reserved");
  }
  assert.equal(await finish(db, "invalid-usage", "uncertain"), "uncertain");
  assert.equal((await usage(db, "invalid-usage")).estimated_usd_micros, reservationCost);
});

test("AI ledger replays every state without creating another reservation or changing terminal settlement", async t => {
  const db = await ledger(t);
  for (const state of ["reserved", "completed", "failed", "uncertain"]) {
    const id = `state-${state}`;
    assert.equal(await reserve(db, id), "created");
    if (state !== "reserved") assert.equal(await finish(db, id, state, state === "completed" ? 12 : null, state === "completed" ? 3 : null), state);
    const before = await usage(db, id);
    assert.equal(await reserve(db, id), state);
    assert.equal(await reserve(db, id, "different-owner"), state);
    if (state !== "reserved") {
      assert.equal(await finish(db, id, "completed", 400000, 1000), state);
      assert.equal(await finish(db, id, "uncertain"), state);
    }
    assert.deepEqual(await usage(db, id), before);
  }
  assert.equal((await db.query("SELECT count(*)::int AS count FROM crm_ai_draft_usage")).rows[0].count, 4);
});

test("AI ledger retains uncertain spend and releases only confirmed completed excess", async t => {
  const db = await ledger(t);
  for (let i = 0; i < 9; i++) {
    await reserve(db, `retained-${i}`, `owner-${i}`);
    await finish(db, `retained-${i}`, "uncertain");
  }
  await assert.rejects(reserve(db, "uncertain-over", "other"), /budget or rate limit/);
  // Terminal uncertain outcomes cannot be silently converted into cheap completions.
  assert.equal(await finish(db, "retained-0", "completed", 0, 0), "uncertain");
  await assert.rejects(reserve(db, "still-over", "other"), /budget or rate limit/);
  await db.exec("TRUNCATE crm_ai_draft_usage");
  await reserve(db, "settled");
  await finish(db, "settled", "completed", 12, 3);
  assert.equal((await usage(db, "settled")).actual_usd_micros, 23);
  assert.equal(await reserve(db, "remaining-dollar-boundary", "other", 2999977), "created");
  await assert.rejects(reserve(db, "one-micro-over", "third", 1), /budget or rate limit/);
});

test("AI ledger enforces the five-per-minute boundary per owner including failed attempts", async t => {
  const db = await ledger(t);
  for (let i = 0; i < 5; i++) {
    assert.equal(await reserve(db, `minute-${i}`), "created");
    await finish(db, `minute-${i}`, "failed");
  }
  await assert.rejects(reserve(db, "sixth"), /budget or rate limit/);
  assert.equal(await reserve(db, "other-owner", "other"), "created");
});

test("AI ledger enforces the twenty-per-day boundary outside the minute window", async t => {
  const db = await ledger(t);
  const { seconds } = (await db.query("SELECT extract(epoch FROM clock_timestamp()-date_trunc('day',clock_timestamp()))::int AS seconds")).rows[0];
  if (seconds < 120) return t.skip("Day and minute windows overlap during the first two minutes of the day.");
  await db.exec("INSERT INTO crm_ai_draft_usage(id,owner_id,requested_at,state,estimated_usd_micros,input_tokens,output_tokens,provider,model) SELECT 'day-'||i,'owner',clock_timestamp()-interval '2 minutes','failed',304500,0,1000,'openai','openai/gpt-5.4-mini' FROM generate_series(1,19) i");
  assert.equal(await reserve(db, "twentieth"), "created");
  await assert.rejects(reserve(db, "twenty-first"), /budget or rate limit/);
});

test("AI ledger enforces the three-hundred-per-month boundary outside the day window", async t => {
  const db = await ledger(t);
  const { first_day } = (await db.query("SELECT date_trunc('day',clock_timestamp())=date_trunc('month',clock_timestamp()) AS first_day")).rows[0];
  if (first_day) return t.skip("Day and month windows coincide on the first day; the stricter daily limit applies.");
  await db.exec("INSERT INTO crm_ai_draft_usage(id,owner_id,requested_at,state,estimated_usd_micros,input_tokens,output_tokens,provider,model) SELECT 'month-'||i,'owner',date_trunc('month',clock_timestamp()),'failed',304500,0,1000,'openai','openai/gpt-5.4-mini' FROM generate_series(1,299) i");
  assert.equal(await reserve(db, "three-hundredth"), "created");
  await assert.rejects(reserve(db, "three-hundred-first"), /budget or rate limit/);
});
