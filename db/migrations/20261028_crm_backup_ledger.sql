-- Backup foundation only. No scheduler, storage provider, or deletion policy is enabled by this migration.
CREATE TABLE IF NOT EXISTS crm_backup_runs (
  id text PRIMARY KEY,
  trigger text NOT NULL CHECK (trigger IN ('daily','pre_campaign','manual')),
  state text NOT NULL CHECK (state IN ('running','succeeded','failed')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  manifest_sha256 text,
  destination text,
  error_code text,
  error_detail text,
  CHECK ((state = 'running' AND completed_at IS NULL) OR (state <> 'running' AND completed_at IS NOT NULL)),
  CHECK ((state = 'succeeded' AND manifest_sha256 IS NOT NULL) OR state <> 'succeeded')
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_backup_runs_active_trigger_idx
  ON crm_backup_runs (trigger) WHERE state = 'running';
