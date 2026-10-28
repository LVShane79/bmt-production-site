-- Additive, review-only research foundation. Apply manually after backup and owner review.
-- It deliberately does not alter crm_leads, crm_outreach_history, or any send state.
CREATE TABLE IF NOT EXISTS crm_research_cohorts (
  id text PRIMARY KEY,
  name text NOT NULL,
  criteria jsonb NOT NULL,
  state text NOT NULL CHECK (state IN ('draft','active','archived')) DEFAULT 'draft',
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS crm_research_companies (
  id text PRIMARY KEY,
  cohort_id text REFERENCES crm_research_cohorts(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  normalized_company text NOT NULL,
  website text,
  geography text,
  geography_status text NOT NULL CHECK (geography_status IN ('unknown','nevada','non_nevada')) DEFAULT 'unknown',
  nta_review_state text NOT NULL CHECK (nta_review_state IN ('unresolved','hold','not_applicable','cleared')) DEFAULT 'unresolved',
  review_state text NOT NULL CHECK (review_state IN ('research','owner_review','rejected')) DEFAULT 'research',
  proposed_lead_id text REFERENCES crm_leads(id),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(normalized_company)
);
CREATE TABLE IF NOT EXISTS crm_research_evidence (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES crm_research_companies(id) ON DELETE CASCADE,
  canonical_url text NOT NULL,
  publisher text NOT NULL,
  excerpt text NOT NULL,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('low','medium','high')),
  freshness text NOT NULL CHECK (freshness IN ('fresh','aging','stale')),
  signal_type text NOT NULL CHECK (signal_type IN ('hiring','expansion','project','other')),
  capacity_hypothesis text NOT NULL,
  owner_review_state text NOT NULL CHECK (owner_review_state IN ('pending','accepted','rejected')) DEFAULT 'pending',
  version integer NOT NULL DEFAULT 1,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, canonical_url)
);
-- Immutable provenance snapshot for future campaign/result ledgers. A draft approval is not send authorization.
CREATE TABLE IF NOT EXISTS crm_campaign_evidence_versions (
  draft_id text NOT NULL REFERENCES crm_campaign_drafts(id) ON DELETE CASCADE,
  evidence_id text NOT NULL REFERENCES crm_research_evidence(id),
  evidence_version integer NOT NULL,
  message_version text NOT NULL,
  message_subject text NOT NULL,
  message_body text NOT NULL,
  linked_by text NOT NULL,
  linked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (draft_id, evidence_id, evidence_version, message_version)
);
CREATE INDEX IF NOT EXISTS crm_research_evidence_company_idx ON crm_research_evidence(company_id, fetched_at DESC);

-- Evidence and draft provenance are append-only once captured. Correcting a source
-- requires a new evidence row/version; snapshots used by later results cannot drift.
CREATE OR REPLACE FUNCTION crm_reject_research_snapshot_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'crm_research_evidence' AND TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'owner_review_state') = (to_jsonb(OLD) - 'owner_review_state') THEN
    RETURN NEW; -- owner disposition is the sole mutable review field; source payload never changes.
  END IF;
  RAISE EXCEPTION 'research evidence and campaign evidence snapshots are immutable' USING ERRCODE='55000';
END $$;
CREATE TRIGGER crm_research_evidence_immutable
  BEFORE UPDATE OR DELETE ON crm_research_evidence
  FOR EACH ROW EXECUTE FUNCTION crm_reject_research_snapshot_mutation();
CREATE TRIGGER crm_campaign_evidence_versions_immutable
  BEFORE UPDATE OR DELETE ON crm_campaign_evidence_versions
  FOR EACH ROW EXECUTE FUNCTION crm_reject_research_snapshot_mutation();
