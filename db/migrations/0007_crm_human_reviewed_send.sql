-- Additive human-reviewed sending ledger. This does not activate OAuth or send mail.
CREATE TABLE crm_send_reviews (
 id text PRIMARY KEY, owner_id text NOT NULL, draft_id text NOT NULL REFERENCES crm_campaign_drafts(id),
 draft_version text NOT NULL, sender_alias text NOT NULL CHECK(sender_alias='info@blackmountain.tech'),
 subject text NOT NULL, body text NOT NULL, recipients jsonb NOT NULL CHECK(jsonb_typeof(recipients)='array'),
 backup_run_id text NOT NULL, reviewed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE crm_send_attempts (
 id text PRIMARY KEY, review_id text NOT NULL REFERENCES crm_send_reviews(id),
 draft_id text NOT NULL REFERENCES crm_campaign_drafts(id), draft_version text NOT NULL,
 lead_id text NOT NULL REFERENCES crm_leads(id), recipient_email text NOT NULL,
 message_id text NOT NULL UNIQUE, claimed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(draft_id,draft_version,lead_id), UNIQUE(draft_id,draft_version,recipient_email)
);
CREATE TABLE crm_send_outcomes (
 id text PRIMARY KEY, attempt_id text NOT NULL REFERENCES crm_send_attempts(id),
 state text NOT NULL CHECK(state IN ('sent','failed','unknown')),
 provider_message_id text, provider_thread_id text, detail_code text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(state<>'sent' OR (provider_message_id IS NOT NULL AND btrim(provider_message_id)<>''))
);
CREATE INDEX crm_send_outcomes_attempt_idx ON crm_send_outcomes(attempt_id,recorded_at);
-- Operational OAuth material is deliberately not a logical backup payload. Restore requires reconnect.
CREATE TABLE crm_gmail_connections (
 owner_id text PRIMARY KEY, mailbox_email text NOT NULL, encrypted_refresh_token text NOT NULL, granted_scopes text[] NOT NULL, connected_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE crm_gmail_oauth_states (
 state_hash text PRIMARY KEY, owner_id text NOT NULL, browser_hash text NOT NULL,
 encrypted_verifier text NOT NULL, expires_at timestamptz NOT NULL, consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION crm_reject_send_ledger_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 RAISE EXCEPTION 'send review, attempt and outcome records are immutable' USING ERRCODE='55000';
END $$;
CREATE TRIGGER crm_send_reviews_immutable BEFORE UPDATE OR DELETE ON crm_send_reviews FOR EACH ROW EXECUTE FUNCTION crm_reject_send_ledger_mutation();
CREATE TRIGGER crm_send_attempts_immutable BEFORE UPDATE OR DELETE ON crm_send_attempts FOR EACH ROW EXECUTE FUNCTION crm_reject_send_ledger_mutation();
CREATE TRIGGER crm_send_outcomes_immutable BEFORE UPDATE OR DELETE ON crm_send_outcomes FOR EACH ROW EXECUTE FUNCTION crm_reject_send_ledger_mutation();

CREATE FUNCTION crm_create_send_review(p_id text,p_owner text,p_draft text,p_version text,p_recipients jsonb,p_backup_run_id text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE d crm_campaign_drafts%ROWTYPE; wanted integer; actual jsonb; r jsonb;
BEGIN
 IF p_owner IS NULL OR btrim(p_owner)='' OR p_id IS NULL OR btrim(p_id)='' OR jsonb_typeof(p_recipients) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'invalid send review'; END IF;
 wanted:=jsonb_array_length(p_recipients);
 IF wanted<1 OR wanted>10 THEN RAISE EXCEPTION 'invalid recipient count'; END IF;
 -- Same lock order as draft saver: leads before draft; serialize recipient changes.
 PERFORM l.id FROM crm_leads l JOIN crm_campaign_recipients cr ON cr.lead_id=l.id WHERE cr.draft_id=p_draft ORDER BY l.id FOR UPDATE OF l;
 SELECT * INTO d FROM crm_campaign_drafts WHERE id=p_draft FOR UPDATE;
 IF NOT FOUND OR d.state<>'review_ready' OR floor(extract(epoch FROM d.updated_at)*1000000)::bigint::text<>p_version THEN RAISE EXCEPTION 'draft version changed or not review ready' USING ERRCODE='P0002'; END IF;
 IF NOT EXISTS(SELECT 1 FROM crm_backup_runs WHERE id=p_backup_run_id AND trigger='pre_campaign' AND state='succeeded' AND btrim(coalesce(manifest_sha256,''))<>'' AND btrim(coalesce(destination,''))<>'' AND requested_at>=d.updated_at AND completed_at>=d.updated_at) THEN RAISE EXCEPTION 'successful current pre-campaign backup required'; END IF;
 PERFORM c.id FROM crm_research_companies c JOIN crm_campaign_recipients cr ON cr.lead_id=c.proposed_lead_id WHERE cr.draft_id=p_draft ORDER BY c.id FOR UPDATE OF c;
 IF d.sender_alias<>'info@blackmountain.tech' OR d.subject~E'[\\r\\n]' OR length(d.subject)>240 OR btrim(d.subject)='' OR length(d.body)>8000 OR btrim(d.body)='' THEN RAISE EXCEPTION 'invalid message'; END IF;
 SELECT jsonb_agg(jsonb_build_object('leadId',l.id,'email',lower(btrim(l.email))) ORDER BY cr.position) INTO actual
 FROM crm_campaign_recipients cr JOIN crm_leads l ON l.id=cr.lead_id WHERE cr.draft_id=p_draft
 AND l.history_state='clear' AND l.status NOT IN ('Bounced','Opted out') AND coalesce(l.next_step,'')<>'Monitor for reply; no further automated outreach' AND NOT EXISTS(SELECT 1 FROM crm_research_companies c WHERE c.proposed_lead_id=l.id AND (c.review_state<>'owner_review' OR NOT ((c.geography_status='non_nevada' AND c.nta_review_state='not_applicable' AND btrim(coalesce(c.geography,''))<>'') OR (c.geography_status='nevada' AND c.nta_review_state='cleared'))))
 AND l.email IS NOT NULL AND l.email!~E'[\\r\\n]' AND l.email~'^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
 IF actual IS NULL OR jsonb_array_length(actual)<>wanted OR (SELECT count(*) FROM crm_campaign_recipients WHERE draft_id=p_draft)<>wanted
 OR (SELECT count(DISTINCT lower(btrim(x->>'email'))) FROM jsonb_array_elements(p_recipients) x)<>wanted
 OR actual<>(SELECT jsonb_agg(jsonb_build_object('leadId',x->>'leadId','email',x->>'email') ORDER BY n) FROM jsonb_array_elements(p_recipients) WITH ORDINALITY AS e(x,n)) THEN
 RAISE EXCEPTION 'recipient eligibility or reviewed list changed' USING ERRCODE='23514'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(p_recipients) LOOP
  IF coalesce(r->>'contextKind','') NOT IN ('requested','invited') OR length(btrim(coalesce(r->>'contextEvidence','')))<10 OR length(r->>'contextEvidence')>2000
  OR length(btrim(coalesce(r->>'contextSource','')))<3 OR length(r->>'contextSource')>2000
  OR coalesce(r->>'contextDate','')!~'^\d{4}-\d{2}-\d{2}$' OR (r->>'contextDate')::date>current_date
  OR length(btrim(coalesce(r->>'purpose','')))<5 OR length(r->>'purpose')>1000 THEN RAISE EXCEPTION 'requested or invited context evidence and exact purpose required'; END IF;
 END LOOP;
 INSERT INTO crm_send_reviews(id,owner_id,draft_id,draft_version,sender_alias,subject,body,recipients,backup_run_id) VALUES(p_id,p_owner,p_draft,p_version,d.sender_alias,d.subject,d.body,p_recipients,p_backup_run_id);
 RETURN p_id;
END $$;

CREATE FUNCTION crm_claim_send_attempt(p_id text,p_owner text,p_review text,p_lead text,p_message_id text)
RETURNS TABLE(attempt_id text,result text) LANGUAGE plpgsql AS $$
DECLARE existing_id text; r crm_send_reviews%ROWTYPE; d crm_campaign_drafts%ROWTYPE; item jsonb; actual jsonb;
BEGIN
 SELECT * INTO r FROM crm_send_reviews WHERE id=p_review AND owner_id=p_owner;
 IF NOT FOUND THEN RAISE EXCEPTION 'send review missing'; END IF;
 -- Fixed lock serializes claims across review IDs for the same draft version.
 PERFORM pg_advisory_xact_lock(1129467202,1);
 SELECT a.id INTO existing_id FROM crm_send_attempts a WHERE a.draft_id=r.draft_id AND a.draft_version=r.draft_version AND a.lead_id=p_lead;
 IF FOUND THEN RETURN QUERY SELECT existing_id,'existing'::text; RETURN; END IF;
 PERFORM l.id FROM crm_leads l JOIN crm_campaign_recipients cr ON cr.lead_id=l.id WHERE cr.draft_id=r.draft_id ORDER BY l.id FOR UPDATE OF l;
 SELECT * INTO d FROM crm_campaign_drafts WHERE id=r.draft_id FOR UPDATE;
 IF NOT FOUND OR d.state<>'review_ready' OR floor(extract(epoch FROM d.updated_at)*1000000)::bigint::text<>r.draft_version OR d.subject<>r.subject OR d.body<>r.body THEN RAISE EXCEPTION 'reviewed draft changed' USING ERRCODE='P0002'; END IF;
 PERFORM c.id FROM crm_research_companies c JOIN crm_campaign_recipients cr ON cr.lead_id=c.proposed_lead_id WHERE cr.draft_id=r.draft_id ORDER BY c.id FOR UPDATE OF c;
 SELECT jsonb_agg(jsonb_build_object('leadId',l.id,'email',lower(btrim(l.email))) ORDER BY cr.position) INTO actual FROM crm_campaign_recipients cr JOIN crm_leads l ON l.id=cr.lead_id WHERE cr.draft_id=r.draft_id
 AND l.history_state='clear' AND l.status NOT IN ('Bounced','Opted out') AND coalesce(l.next_step,'')<>'Monitor for reply; no further automated outreach' AND NOT EXISTS(SELECT 1 FROM crm_research_companies c WHERE c.proposed_lead_id=l.id AND (c.review_state<>'owner_review' OR NOT ((c.geography_status='non_nevada' AND c.nta_review_state='not_applicable' AND btrim(coalesce(c.geography,''))<>'') OR (c.geography_status='nevada' AND c.nta_review_state='cleared'))));
 IF actual IS DISTINCT FROM (SELECT jsonb_agg(jsonb_build_object('leadId',x->>'leadId','email',x->>'email') ORDER BY n) FROM jsonb_array_elements(r.recipients) WITH ORDINALITY e(x,n)) THEN RAISE EXCEPTION 'recipient eligibility changed' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM crm_backup_runs WHERE id=r.backup_run_id AND trigger='pre_campaign' AND state='succeeded' AND btrim(coalesce(manifest_sha256,''))<>'' AND btrim(coalesce(destination,''))<>'' AND requested_at>=d.updated_at AND completed_at>=d.updated_at) THEN RAISE EXCEPTION 'successful current pre-campaign backup required'; END IF;
 SELECT x INTO item FROM jsonb_array_elements(r.recipients) x WHERE x->>'leadId'=p_lead;
 IF item IS NULL OR p_id IS NULL OR btrim(p_id)='' OR p_message_id IS NULL OR p_message_id!~'^<[A-Za-z0-9._-]+@blackmountain\.tech>$' THEN RAISE EXCEPTION 'invalid send attempt'; END IF;
 SELECT a.id INTO existing_id FROM crm_send_attempts a WHERE a.draft_id=r.draft_id AND a.draft_version=r.draft_version AND a.recipient_email=item->>'email';
 IF FOUND THEN RETURN QUERY SELECT existing_id,'existing'::text; RETURN; END IF;
 IF EXISTS(SELECT 1 FROM crm_send_attempts a WHERE (a.recipient_email=item->>'email' OR a.lead_id=p_lead) AND NOT EXISTS(SELECT 1 FROM crm_send_outcomes o WHERE o.attempt_id=a.id AND o.state IN ('sent','failed'))) THEN RAISE EXCEPTION 'recipient has unresolved send outcome; reconcile before any new attempt' USING ERRCODE='23514'; END IF;
 INSERT INTO crm_send_attempts(id,review_id,draft_id,draft_version,lead_id,recipient_email,message_id) VALUES(p_id,p_review,r.draft_id,r.draft_version,p_lead,item->>'email',p_message_id);
 RETURN QUERY SELECT p_id,'created'::text;
END $$;

-- A claim with no outcome is UNKNOWN, never permission to retry. Only new 'created' can send.
CREATE FUNCTION crm_finish_send_attempt(p_id text,p_owner text,p_attempt text,p_state text,p_provider_id text,p_thread_id text,p_code text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE previous text;
BEGIN
 PERFORM a.id FROM crm_send_attempts a JOIN crm_send_reviews r ON r.id=a.review_id WHERE a.id=p_attempt AND r.owner_id=p_owner FOR UPDATE OF a;
 IF NOT FOUND THEN RAISE EXCEPTION 'send attempt missing'; END IF;
 SELECT state INTO previous FROM crm_send_outcomes WHERE attempt_id=p_attempt ORDER BY recorded_at DESC,id DESC LIMIT 1;
 IF previous IS NOT NULL THEN RETURN previous; END IF;
 IF p_state NOT IN ('sent','failed','unknown') OR p_code IS NULL OR length(p_code)>100 THEN RAISE EXCEPTION 'invalid send outcome'; END IF;
 INSERT INTO crm_send_outcomes(id,attempt_id,state,provider_message_id,provider_thread_id,detail_code) VALUES(p_id,p_attempt,p_state,p_provider_id,p_thread_id,p_code);
 RETURN p_state;
END $$;
-- Called only after server verifies a Gmail SENT receipt against immutable attempt/message content.
-- No-receipt is never proof of failure and cannot unlock a resend.
CREATE FUNCTION crm_reconcile_send_attempt(p_id text,p_owner text,p_attempt text,p_provider_id text,p_thread_id text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE previous text;
BEGIN
 PERFORM a.id FROM crm_send_attempts a JOIN crm_send_reviews r ON r.id=a.review_id WHERE a.id=p_attempt AND r.owner_id=p_owner FOR UPDATE OF a;
 IF NOT FOUND THEN RAISE EXCEPTION 'send attempt missing'; END IF;
 SELECT state INTO previous FROM crm_send_outcomes WHERE attempt_id=p_attempt ORDER BY recorded_at DESC,id DESC LIMIT 1;
 IF previous IN ('sent','failed') THEN RETURN previous; END IF;
 INSERT INTO crm_send_outcomes(id,attempt_id,state,provider_message_id,provider_thread_id,detail_code,recorded_at) VALUES(p_id,p_attempt,'sent',p_provider_id,p_thread_id,'receipt_reconciled',GREATEST(clock_timestamp(),(SELECT max(recorded_at)+interval '1 microsecond' FROM crm_send_outcomes WHERE attempt_id=p_attempt))); 
 RETURN 'sent';
END $$;

-- Complete only a still-present one-use OAuth claim. Disconnect deletes state before connection,
-- so an in-flight callback cannot resurrect credentials after owner disconnect.
CREATE FUNCTION crm_complete_gmail_connection(p_state_hash text,p_owner text,p_browser_hash text,p_mailbox text,p_encrypted_token text,p_scopes text[])
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
 PERFORM state_hash FROM crm_gmail_oauth_states WHERE state_hash=p_state_hash AND owner_id=p_owner AND browser_hash=p_browser_hash AND consumed_at IS NOT NULL AND expires_at>clock_timestamp() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF btrim(coalesce(p_mailbox,''))='' OR btrim(coalesce(p_encrypted_token,''))='' OR cardinality(p_scopes)<1 THEN RAISE EXCEPTION 'invalid Gmail connection'; END IF;
 INSERT INTO crm_gmail_connections(owner_id,mailbox_email,encrypted_refresh_token,granted_scopes) VALUES(p_owner,p_mailbox,p_encrypted_token,p_scopes)
 ON CONFLICT(owner_id) DO UPDATE SET mailbox_email=excluded.mailbox_email,encrypted_refresh_token=excluded.encrypted_refresh_token,granted_scopes=excluded.granted_scopes,connected_at=clock_timestamp();
 DELETE FROM crm_gmail_oauth_states WHERE state_hash=p_state_hash AND owner_id=p_owner;
 RETURN true;
END $$;
CREATE FUNCTION crm_disconnect_gmail(p_owner text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 DELETE FROM crm_gmail_oauth_states WHERE owner_id=p_owner;
 DELETE FROM crm_gmail_connections WHERE owner_id=p_owner;
END $$;
