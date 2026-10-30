-- Additive private-AI ledger. This migration does not enable a provider or modify CRM drafts.
CREATE TABLE IF NOT EXISTS crm_ai_draft_usage (
  id text PRIMARY KEY, owner_id text NOT NULL, requested_at timestamptz NOT NULL DEFAULT now(),
  state text NOT NULL CHECK (state IN ('reserved','completed','failed','uncertain')),
  estimated_usd_micros bigint NOT NULL CHECK (estimated_usd_micros >= 0),
  input_tokens integer NOT NULL CHECK (input_tokens BETWEEN 0 AND 3000),
  output_tokens integer NOT NULL CHECK (output_tokens BETWEEN 0 AND 1000),
  actual_input_tokens integer, actual_output_tokens integer, actual_usd_micros bigint,
  provider text NOT NULL CHECK (provider='openai'), model text NOT NULL CHECK (model='gpt-4.1-mini'),
  completed_at timestamptz, settled_at timestamptz, error_code text,
  CHECK ((state='completed' AND completed_at IS NOT NULL AND settled_at IS NOT NULL AND actual_input_tokens IS NOT NULL AND actual_output_tokens IS NOT NULL AND actual_usd_micros IS NOT NULL) OR state <> 'completed')
);
CREATE INDEX IF NOT EXISTS crm_ai_draft_usage_owner_requested_idx ON crm_ai_draft_usage (owner_id, requested_at DESC);
CREATE OR REPLACE FUNCTION crm_reserve_ai_draft_usage(p_id text,p_owner text,p_estimated_usd_micros bigint,p_input_tokens integer,p_output_tokens integer) RETURNS text LANGUAGE plpgsql AS $$
DECLARE existing text; minute_count integer; day_count integer; month_count integer; month_cost bigint; reserved_at timestamptz;
BEGIN
  -- One application-wide lock: different authorized owner IDs share the $3 budget.
  -- Keep the namespace fixed; an owner-derived lock would allow cross-owner races.
  PERFORM pg_advisory_xact_lock(1129467201,1);
  reserved_at := clock_timestamp();
  SELECT state INTO existing FROM crm_ai_draft_usage WHERE id=p_id;
  IF FOUND THEN RETURN existing; END IF;
  SELECT count(*) FILTER (WHERE requested_at>=reserved_at-interval '1 minute'),count(*) FILTER (WHERE requested_at>=date_trunc('day',reserved_at)),count(*) FILTER (WHERE requested_at>=date_trunc('month',reserved_at)) INTO minute_count,day_count,month_count FROM crm_ai_draft_usage WHERE owner_id=p_owner;
  SELECT COALESCE(sum(CASE WHEN state='completed' THEN actual_usd_micros ELSE estimated_usd_micros END),0) INTO month_cost FROM crm_ai_draft_usage WHERE requested_at>=date_trunc('month',reserved_at) AND state IN ('reserved','completed','uncertain');
  IF minute_count>=5 OR day_count>=20 OR month_count>=300 OR month_cost+p_estimated_usd_micros>3000000 THEN RAISE EXCEPTION 'AI drafting budget or rate limit exceeded' USING ERRCODE='P0001'; END IF;
  INSERT INTO crm_ai_draft_usage (id,owner_id,requested_at,state,estimated_usd_micros,input_tokens,output_tokens,provider,model) VALUES (p_id,p_owner,reserved_at,'reserved',p_estimated_usd_micros,p_input_tokens,p_output_tokens,'openai','gpt-4.1-mini');
  RETURN 'created';
END $$;
CREATE OR REPLACE FUNCTION crm_finish_ai_draft_usage(p_id text,p_state text,p_actual_input_tokens integer DEFAULT NULL,p_actual_output_tokens integer DEFAULT NULL,p_error_code text DEFAULT NULL) RETURNS text LANGUAGE plpgsql AS $$
DECLARE current_state text; actual_cost bigint;
BEGIN
  SELECT state INTO current_state FROM crm_ai_draft_usage WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'AI usage reservation missing'; END IF;
  IF current_state<>'reserved' THEN RETURN current_state; END IF;
  IF p_state NOT IN ('completed','failed','uncertain') THEN RAISE EXCEPTION 'invalid AI usage final state'; END IF;
  IF p_state='completed' THEN
    -- Provider usage includes protocol/schema overhead; the 3,000-byte prompt guard
    -- is not an actual-token limit. The conservative reservation covers this ceiling.
    IF p_actual_input_tokens IS NULL OR p_actual_output_tokens IS NULL OR p_actual_input_tokens<0 OR p_actual_input_tokens>1047576 OR p_actual_output_tokens<0 OR p_actual_output_tokens>1000 THEN RAISE EXCEPTION 'invalid AI usage settlement'; END IF;
    actual_cost:=ceil(p_actual_input_tokens*0.4+p_actual_output_tokens*1.6);
    UPDATE crm_ai_draft_usage SET state='completed',actual_input_tokens=p_actual_input_tokens,actual_output_tokens=p_actual_output_tokens,actual_usd_micros=actual_cost,completed_at=clock_timestamp(),settled_at=clock_timestamp(),error_code=NULL WHERE id=p_id;
  ELSE
    UPDATE crm_ai_draft_usage SET state=p_state,error_code=left(p_error_code,120) WHERE id=p_id;
  END IF;
  RETURN p_state;
END $$;


