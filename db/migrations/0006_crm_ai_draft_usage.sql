-- Additive private-AI reservation ledger. Apply only with separately approved activation.
CREATE TABLE IF NOT EXISTS crm_ai_draft_usage (
  id text PRIMARY KEY,
  owner_id text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  state text NOT NULL CHECK (state IN ('reserved','completed','failed','uncertain')),
  estimated_usd_micros bigint NOT NULL CHECK (estimated_usd_micros >= 0),
  input_tokens integer NOT NULL CHECK (input_tokens BETWEEN 0 AND 3000),
  output_tokens integer NOT NULL CHECK (output_tokens BETWEEN 0 AND 1000),
  provider text NOT NULL CHECK (provider='openai'),
  model text NOT NULL CHECK (model='openai/gpt-5.4-mini'),
  completed_at timestamptz,
  error_code text,
  CHECK ((state='completed' AND completed_at IS NOT NULL) OR state <> 'completed')
);
CREATE INDEX IF NOT EXISTS crm_ai_draft_usage_owner_requested_idx ON crm_ai_draft_usage (owner_id, requested_at DESC);
