# CRM backup foundation

This implementation exports a consistent, application-level logical snapshot of every current CRM data table: leads, history, import markers, campaign drafts and recipients, work outcomes, research cohorts and companies, research evidence, campaign-evidence snapshots, and immutable company-review audits. It uses a deterministic SHA-256 manifest. The mutable backup-run ledger is intentionally not included in its own artifact. It records run state in `crm_backup_runs`; a reused run ID is safely rejected, and only one active run per trigger is allowed. A future campaign sender must obtain a successful `pre_campaign` run ID through `requireSuccessfulPreCampaignBackup` before it can attempt delivery.

The explicit whitelist is `crm-data-tables/v3`. Any newly migrated `crm_*` table (other than the self-referential `crm_backup_runs` ledger) blocks export until it is explicitly added to the whitelist, tests, and a bumped schema version.

Nothing is enabled by this code: no cron, provider connection, OAuth, upload, database migration, retention deletion, or email sending. The OneDrive adapter is intentionally an injected boundary: it must return the SHA-256 of the actual bytes it read back from the destination. Unknown upload outcomes fail closed; a fresh run ID is required for a retry. A crashed `running` record blocks the same trigger until an explicit, reviewed lease-expiry recovery marks it failed; it is never silently reclaimed.

Recommended (not enabled) retention: daily backups for 35 days and monthly backups for 12 months. Deletion requires a separate owner-approved policy.

## Later activation approvals

1. Apply migrations `0001`, `0002`, `0003_crm_backup_ledger`, `0004_research_campaign_foundation`, and `0005_company_review_controls` to the production CRM after an owner-reviewed snapshot.
2. Authorize the exact OneDrive destination `Black Mountain Technologies/Business Development CRM`, Microsoft delegated permissions, and a secure credential/deployment configuration.
3. Review the scheduled daily export timing and enable the scheduler provider explicitly.
4. Approve a sender integration only after it invokes the pre-campaign gate; failed or absent backups must block delivery.
