# CRM backup foundation

This implementation exports a consistent, application-level logical snapshot of every current CRM data table: leads, history, import markers, campaign drafts and recipients, work outcomes, research cohorts and companies, research evidence, campaign-evidence snapshots, immutable company-review audits, and the AI drafting usage ledger (including reservations, terminal outcomes, actual token counts, and spend). It uses a deterministic SHA-256 manifest. The mutable backup-run ledger is intentionally not included in its own artifact. It records run state in `crm_backup_runs`; a reused run ID is safely rejected, and only one active run per trigger is allowed. A future campaign sender must obtain a successful `pre_campaign` run ID through `requireSuccessfulPreCampaignBackup` before it can attempt delivery.

The explicit whitelist is `crm-data-tables/v5`. Any newly migrated `crm_*` table (other than the explicitly operational `crm_backup_runs`, `crm_gmail_connections`, and `crm_gmail_oauth_states` tables) blocks export until it is explicitly added to the whitelist, tests, and a bumped schema version.

Nothing is enabled by this code: no cron, provider connection, OAuth, upload, database migration, retention deletion, or email sending. The OneDrive adapter is intentionally an injected boundary: it must return the SHA-256 of the actual bytes it read back from the destination. Unknown upload outcomes fail closed; a fresh run ID is required for a retry. A crashed `running` record blocks the same trigger until an explicit, reviewed lease-expiry recovery marks it failed; it is never silently reclaimed.

Recommended (not enabled) retention: daily backups for 35 days and monthly backups for 12 months. Deletion requires a separate owner-approved policy.

## Later activation approvals

1. Apply migrations `0001`, `0002`, `0003_crm_backup_ledger`, `0004_research_campaign_foundation`, `0005_company_review_controls`, `0006_crm_ai_draft_usage`, and `0007_crm_human_reviewed_send` only during the separately approved rollout after an owner-reviewed snapshot. Until 0007 is approved and applied, production remains on its matching v4 exporter.
2. Authorize the exact OneDrive destination `Black Mountain Technologies/Business Development CRM`, Microsoft delegated permissions, and a secure credential/deployment configuration.
3. Review the scheduled daily export timing and enable the scheduler provider explicitly.
4. Approve a sender integration only after it invokes the pre-campaign gate; failed or absent backups must block delivery.


## AI ledger and restore compatibility

Historical version v4 required migration 0006 and exports all `crm_ai_draft_usage` rows. Restoring to an already-empty, fully migrated target preserves original request IDs, request timestamps, states, reservations, and actual usage/cost; it does not reset the monthly spend window or regenerate completed/uncertain requests. A target with any CRM data (including usage rows) is rejected. Existing immutable evidence and company-review audit checks remain intact.

Historical v3 artifacts remain historical backups, but the current v5 restore helper deliberately rejects them (and v4 artifacts) rather than silently substituting an empty AI ledger. Restoring an old artifact requires a separately reviewed recovery plan for the missing usage/spend history. Before first applying 0006, take the pre-migration snapshot using the reviewed v3 table set; after 0006 and before 0007, use v4. Do not run a newer exporter against an older schema.

Recovery preserves spend captured in the snapshot, not requests made afterward. Keep AI drafting disabled during any restore and reconcile post-snapshot provider usage/reservations before re-enabling it; never treat an older backup as permission to reset or replenish the current-month budget.

## Human-reviewed Send ledger (migration 0007; schema v5)

After 0007, `crm-data-tables/v5` adds `crm_send_reviews`, `crm_send_attempts`, and
`crm_send_outcomes` in dependency order. These append-only rows preserve the exact
reviewed message/context, provider attempt identity, uncertainty, and receipt
history. A claim without an outcome is **unknown**, not a failed or retryable send.
Restoring a captured claim never authorizes sending it again. v4 and earlier
manifests are rejected by the v5 restore helper rather than silently omitting
send protection. Before 0007, continue using the matching deployed v4 exporter.

`crm_gmail_connections` and `crm_gmail_oauth_states` are explicitly operational:
refresh-token ciphertext and OAuth state are **not exported**. The restore target
must have both tables empty, in addition to every logical CRM data table. Restore
will not delete or disconnect an existing connection itself. Reconnect only by a
separately authorized owner OAuth flow; never copy tokens or encryption keys into
backup files. `crm_backup_runs` remains a separate operational record, not a
logical payload table. Reviews preserve the backup run ID as audit text; a new
claim still requires a currently successful pre-campaign backup whose requested/start time is at least
as new as the saved draft; upload completion alone is not snapshot freshness.

Restore is not a rewind of Gmail: any snapshot can omit messages attempted after
capture. Keep the Send kill switch disabled throughout recovery, reconcile all
post-snapshot activity against the provider before enabling it, and retain
unresolved attempts as unknown. Neither an empty Sent search nor a restored old
backup proves that mail was not sent. Immutable ledger triggers must stay enabled;
restore only inserts captured rows into a separately reviewed empty target.

Eligibility is checked under row locks at each claim boundary. A hold recorded after a committed claim cannot retract an already transmitted message; there are no background or delayed-send workers. Keep the kill switch off while investigating any uncertainty.

Unknown/no-outcome attempts block a new claim for the same recipient or lead across draft versions and campaigns; editing or cloning a draft cannot silently bypass unresolved provider history. Only exact receipt reconciliation resolves that uncertainty.
