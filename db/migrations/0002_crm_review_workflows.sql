-- Review-only CRM workflow extension. Apply manually after backup and owner review.
-- This migration is additive; it never changes crm_leads or crm_outreach_history.
CREATE TABLE IF NOT EXISTS crm_campaign_drafts (
  id text PRIMARY KEY,
  name text NOT NULL,
  sender_alias text NOT NULL CHECK (sender_alias = 'info@blackmountain.tech'),
  subject text NOT NULL,
  body text NOT NULL,
  state text NOT NULL CHECK (state IN ('draft','review_ready','approved','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS crm_campaign_recipients (
  draft_id text NOT NULL REFERENCES crm_campaign_drafts(id) ON DELETE CASCADE,
  lead_id text NOT NULL REFERENCES crm_leads(id),
  position integer NOT NULL CHECK (position BETWEEN 1 AND 10),
  PRIMARY KEY (draft_id, lead_id),
  UNIQUE (draft_id, position)
);
CREATE TABLE IF NOT EXISTS crm_work_outcomes (
  id text PRIMARY KEY,
  lead_id text NOT NULL REFERENCES crm_leads(id),
  channel text NOT NULL CHECK (channel IN ('email','call','manual')),
  outcome text NOT NULL,
  note text,
  reported_by text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_work_outcomes_lead_reported_idx ON crm_work_outcomes (lead_id, reported_at DESC);

-- One statement, one transaction: the route never performs a pre-read then mutates.
CREATE OR REPLACE FUNCTION crm_save_campaign_draft(
  p_id text, p_expected_version text, p_name text, p_subject text, p_body text,
  p_state text, p_lead_ids text[]
) RETURNS TABLE(id text, updated_version text) LANGUAGE plpgsql AS $$
DECLARE wanted integer := cardinality(p_lead_ids); qualified integer; distinct_emails integer;
BEGIN
  IF wanted IS NULL OR wanted < 1 OR wanted > 10 OR p_state NOT IN ('draft','review_ready')
     OR (SELECT count(DISTINCT lead_id) FROM unnest(p_lead_ids) AS lead_id) <> wanted THEN
    RAISE EXCEPTION 'invalid campaign draft' USING ERRCODE='22023';
  END IF;
  PERFORM lead.id FROM crm_leads AS lead WHERE lead.id = ANY(p_lead_ids) FOR UPDATE;
  SELECT count(*), count(DISTINCT lower(btrim(email))) INTO qualified, distinct_emails
    FROM crm_leads AS lead WHERE lead.id = ANY(p_lead_ids) AND lead.email IS NOT NULL AND btrim(lead.email) <> ''
      AND lead.history_state='clear' AND lead.status NOT IN ('Bounced','Opted out')
      AND COALESCE(lead.next_step,'') <> 'Monitor for reply; no further automated outreach';
  IF qualified <> wanted OR distinct_emails <> wanted THEN
    RAISE EXCEPTION 'recipient eligibility changed' USING ERRCODE='23514';
  END IF;
  IF p_expected_version IS NULL THEN
    INSERT INTO crm_campaign_drafts (id,name,sender_alias,subject,body,state)
      VALUES (p_id,p_name,'info@blackmountain.tech',p_subject,p_body,p_state);
  ELSE
    UPDATE crm_campaign_drafts SET name=p_name,subject=p_subject,body=p_body,state=p_state,updated_at=now()
      WHERE crm_campaign_drafts.id=p_id
        AND floor(extract(epoch FROM updated_at)*1000000)::bigint::text=p_expected_version;
    IF NOT FOUND THEN RAISE EXCEPTION 'draft changed or missing' USING ERRCODE='P0002'; END IF;
  END IF;
  DELETE FROM crm_campaign_recipients WHERE draft_id=p_id;
  INSERT INTO crm_campaign_recipients (draft_id,lead_id,position)
    SELECT p_id, entry.lead_id, entry.position::integer
      FROM unnest(p_lead_ids) WITH ORDINALITY AS entry(lead_id,position);
  RETURN QUERY SELECT p_id, floor(extract(epoch FROM updated_at)*1000000)::bigint::text FROM crm_campaign_drafts WHERE crm_campaign_drafts.id=p_id;
END $$;
