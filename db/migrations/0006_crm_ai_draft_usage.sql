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
CREATE OR REPLACE FUNCTION crm_reserve_ai_draft_usage(p_id text,p_owner text,p_estimated_usd_micros bigint,p_input_tokens integer,p_output_tokens integer) RETURNS text LANGUAGE plpgsql AS $$
DECLARE existing text; minute_count integer; day_count integer; month_count integer; month_cost bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_owner));
  SELECT state INTO existing FROM crm_ai_draft_usage WHERE id=p_id;
  IF FOUND THEN RETURN existing; END IF;
  SELECT count(*) FILTER (WHERE requested_at>=clock_timestamp()-interval '1 minute'),count(*) FILTER (WHERE requested_at>=date_trunc('day',clock_timestamp())),count(*) FILTER (WHERE requested_at>=date_trunc('month',clock_timestamp())),COALESCE(sum(estimated_usd_micros) FILTER (WHERE requested_at>=date_trunc('month',clock_timestamp()) AND state IN ('reserved','completed','uncertain')),0) INTO minute_count,day_count,month_count,month_cost FROM crm_ai_draft_usage WHERE owner_id=p_owner;
  IF minute_count>=5 OR day_count>=20 OR month_count>=300 OR month_cost+p_estimated_usd_micros>3000000 THEN RAISE EXCEPTION 'AI drafting budget or rate limit exceeded' USING ERRCODE='P0001'; END IF;
  INSERT INTO crm_ai_draft_usage (id,owner_id,state,estimated_usd_micros,input_tokens,output_tokens,provider,model) VALUES (p_id,p_owner,'reserved',p_estimated_usd_micros,p_input_tokens,p_output_tokens,'openai','openai/gpt-5.4-mini');
  RETURN 'reserved';
END $$;
CREATE OR REPLACE FUNCTION crm_finish_ai_draft_usage(p_id text,p_state text,p_error_code text DEFAULT NULL) RETURNS text LANGUAGE plpgsql AS $$
DECLARE current_state text;
BEGIN SELECT state INTO current_state FROM crm_ai_draft_usage WHERE id=p_id FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'AI usage reservation missing'; END IF; IF current_state<>'reserved' THEN RETURN current_state; END IF; IF p_state NOT IN ('completed','failed','uncertain') THEN RAISE EXCEPTION 'invalid AI usage final state'; END IF; UPDATE crm_ai_draft_usage SET state=p_state,completed_at=CASE WHEN p_state='completed' THEN clock_timestamp() ELSE NULL END,error_code=left(p_error_code,120) WHERE id=p_id; RETURN p_state; END $$;
