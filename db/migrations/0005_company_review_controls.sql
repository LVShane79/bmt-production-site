-- Additive owner-review controls. Apply manually only after backup and signed review.
-- No lead, recipient, evidence, draft, delivery, or suppression data is changed.
ALTER TABLE crm_research_companies ADD COLUMN IF NOT EXISTS review_rationale text;
ALTER TABLE crm_research_companies ADD COLUMN IF NOT EXISTS reviewed_by text;
ALTER TABLE crm_research_companies ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE TABLE IF NOT EXISTS crm_research_company_reviews (
  id text PRIMARY KEY,
  company_id text NOT NULL REFERENCES crm_research_companies(id) ON DELETE CASCADE,
  expected_version text NOT NULL,
  geography text NOT NULL,
  geography_status text NOT NULL CHECK (geography_status IN ('unknown','nevada','non_nevada')),
  nta_review_state text NOT NULL CHECK (nta_review_state IN ('unresolved','hold','not_applicable','cleared')),
  review_state text NOT NULL CHECK (review_state IN ('research','owner_review','rejected')),
  rationale text NOT NULL CHECK (btrim(rationale) <> ''),
  reviewed_by text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_research_company_reviews_company_idx ON crm_research_company_reviews (company_id, reviewed_at DESC);

CREATE OR REPLACE FUNCTION crm_validate_research_company_review() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.nta_review_state='not_applicable' AND NEW.geography_status <> 'non_nevada' THEN
    RAISE EXCEPTION 'unknown or Nevada geography cannot be not_applicable' USING ERRCODE='23514';
  END IF;
  IF NEW.nta_review_state='cleared' AND NEW.geography_status <> 'nevada' THEN
    RAISE EXCEPTION 'NTA clearance requires explicit Nevada geography' USING ERRCODE='23514';
  END IF;
  IF NEW.review_state='owner_review' AND NOT ((NEW.geography_status='nevada' AND NEW.nta_review_state='cleared') OR (NEW.geography_status='non_nevada' AND NEW.nta_review_state='not_applicable')) THEN
    RAISE EXCEPTION 'owner_review requires explicit Nevada clearance or verified non-Nevada not-applicable status' USING ERRCODE='23514';
  END IF;
  IF (NEW.reviewed_by IS NOT NULL OR NEW.reviewed_at IS NOT NULL OR NEW.review_rationale IS NOT NULL) AND (NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL OR NEW.review_rationale IS NULL OR btrim(NEW.review_rationale)='') THEN
    RAISE EXCEPTION 'company review metadata requires reviewer, time, and rationale' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS crm_research_company_review_valid ON crm_research_companies;
CREATE TRIGGER crm_research_company_review_valid BEFORE INSERT OR UPDATE ON crm_research_companies FOR EACH ROW EXECUTE FUNCTION crm_validate_research_company_review();
