import { createHash, randomUUID } from "node:crypto";

export const crmBackupTables = [
  "crm_leads", "crm_outreach_history", "crm_campaign_imports", "crm_campaign_drafts",
  "crm_campaign_recipients", "crm_work_outcomes",
  "crm_research_cohorts", "crm_research_companies", "crm_research_evidence", "crm_campaign_evidence_versions",
] as const;
/** Bump this deliberately when a migration adds CRM data that must enter exports. */
export const crmBackupSchemaVersion = "crm-data-tables/v2";
export type CrmBackupTable = (typeof crmBackupTables)[number];
export type BackupTrigger = "daily" | "pre_campaign" | "manual";
export type BackupState = "running" | "succeeded" | "failed";
export type SqlClient = { query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> };
export type BackupManifest = {
  format: "bmt-crm-logical-backup/v1"; capturedAt: string; sourceCommit: string; schemaVersion: string;
  runId: string; tables: Record<CrmBackupTable, { count: number; sha256: string }>; payloadSha256: string;
};
export type LogicalBackup = { manifest: BackupManifest; data: Record<CrmBackupTable, Record<string, unknown>[]> };
export type BackupDestination = { name: string; upload(input: { runId: string; manifest: BackupManifest; payload: string }): Promise<{ sha256: string }> };

const canonical = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
};
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const quote = (name: string) => `"${name}"`;

export async function exportCrmLogicalBackup(sql: SqlClient, options: { runId?: string; capturedAt?: string; sourceCommit?: string; schemaVersion?: string } = {}): Promise<LogicalBackup> {
  // One SQL statement gives PostgreSQL a single MVCC snapshot across all tables;
  // separate requests could otherwise capture a partially-updated CRM record.
  const fields = crmBackupTables.map(table => `'${table}',COALESCE((SELECT jsonb_agg(row_data) FROM (SELECT * FROM ${quote(table)} ORDER BY 1) row_data),'[]'::jsonb)`).join(",");
  const known = crmBackupTables.map(table => `'${table}'`).join(",");
  const row = (await sql.query<{ data: Record<CrmBackupTable, Record<string, unknown>[]>; unknown_tables: string[] }>(`SELECT jsonb_build_object(${fields}) AS data,COALESCE((SELECT jsonb_agg(table_name ORDER BY table_name) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'crm_%' AND table_name <> 'crm_backup_runs' AND table_name NOT IN (${known})),'[]'::jsonb) AS unknown_tables`))[0];
  if (!row?.data) throw new Error("CRM backup export returned no data");
  if (row.unknown_tables?.length) throw new Error(`CRM backup export blocked: unrecognized CRM tables (${row.unknown_tables.join(", ")}); extend crmBackupTables and bump crmBackupSchemaVersion`);
  const data = Object.fromEntries(crmBackupTables.map(table => [table, row.data[table] ?? []])) as Record<CrmBackupTable, Record<string, unknown>[]>;
  const payload = canonical(data);
  const tables = Object.fromEntries(crmBackupTables.map(table => [table, { count: data[table].length, sha256: sha256(canonical(data[table])) }])) as BackupManifest["tables"];
  return { data, manifest: { format: "bmt-crm-logical-backup/v1", capturedAt: options.capturedAt ?? new Date().toISOString(), sourceCommit: options.sourceCommit ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "unconfigured", schemaVersion: options.schemaVersion ?? crmBackupSchemaVersion, runId: options.runId ?? randomUUID(), tables, payloadSha256: sha256(payload) } };
}

export function serializeLogicalBackup(backup: LogicalBackup): string { return canonical({ manifest: backup.manifest, data: backup.data }); }
export function validateLogicalBackup(backup: LogicalBackup): boolean {
  if (backup.manifest.format !== "bmt-crm-logical-backup/v1" || backup.manifest.schemaVersion !== crmBackupSchemaVersion || backup.manifest.payloadSha256 !== sha256(canonical(backup.data))) return false;
  const expected = new Set(crmBackupTables); const actual = Object.keys(backup.data);
  if (actual.length !== expected.size || actual.some(table => !expected.has(table as CrmBackupTable))) return false;
  return crmBackupTables.every(table => backup.manifest.tables[table]?.count === backup.data[table]?.length && backup.manifest.tables[table]?.sha256 === sha256(canonical(backup.data[table])));
}

/** Explicit restore helper for an already-empty reviewed target. It never contacts a provider. */
export async function restoreCrmLogicalBackup(sql: SqlClient, backup: LogicalBackup): Promise<void> {
  if (!validateLogicalBackup(backup)) throw new Error("CRM restore blocked: invalid or unrecognized backup manifest");
  for (const table of crmBackupTables) for (const row of backup.data[table]) {
    const keys = Object.keys(row); if (!keys.length) continue;
    await sql.query(`INSERT INTO ${quote(table)} (${keys.map(quote).join(",")}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(",")})`, keys.map(key => row[key]));
  }
}

export async function runBackup(sql: SqlClient, destination: BackupDestination, trigger: BackupTrigger, options: Parameters<typeof exportCrmLogicalBackup>[1] = {}): Promise<LogicalBackup> {
  const runId = options.runId ?? randomUUID();
  const inserted = await sql.query<{ id: string }>("INSERT INTO crm_backup_runs (id,trigger,state) VALUES ($1,$2,'running') ON CONFLICT DO NOTHING RETURNING id", [runId, trigger]);
  if (!inserted.length) throw new Error("backup run already exists or another backup for this trigger is running");
  try {
    const backup = await exportCrmLogicalBackup(sql, { ...options, runId });
    const payload = serializeLogicalBackup(backup);
    const receipt = await destination.upload({ runId, manifest: backup.manifest, payload });
    if (receipt.sha256 !== sha256(payload)) throw new Error("backup destination hash verification failed");
    await sql.query("UPDATE crm_backup_runs SET state='succeeded',completed_at=now(),manifest_sha256=$2,destination=$3 WHERE id=$1 AND state='running'", [runId, backup.manifest.payloadSha256, destination.name]);
    return backup;
  } catch (error) {
    await sql.query("UPDATE crm_backup_runs SET state='failed',completed_at=now(),error_code='backup_failed',error_detail=$2 WHERE id=$1 AND state='running'", [runId, error instanceof Error ? error.message.slice(0, 500) : "unknown backup error"]);
    throw error;
  }
}

/** Explicit recovery only: a scheduler must never silently reclaim a possibly-live upload. */
export async function markExpiredBackupRunsFailed(sql: SqlClient, olderThan: string): Promise<number> {
  const rows = await sql.query<{ id: string }>("UPDATE crm_backup_runs SET state='failed',completed_at=now(),error_code='lease_expired',error_detail='Run exceeded its reviewed lease and requires a fresh backup.' WHERE state='running' AND requested_at < $1 RETURNING id", [olderThan]);
  return rows.length;
}

/** A sender integration must call this before any delivery attempt. This module never sends email. */
export async function requireSuccessfulPreCampaignBackup(sql: SqlClient, runId: string): Promise<void> {
  const rows = await sql.query<{ state: BackupState }>("SELECT state FROM crm_backup_runs WHERE id=$1 AND trigger='pre_campaign'", [runId]);
  if (rows[0]?.state !== "succeeded") throw new Error("campaign send blocked: pre-campaign backup did not succeed");
}

export const backupConfiguration = { dailyScheduleEnabled: false, providerConfigured: false, automaticRetentionEnabled: false, recommendedRetention: "daily for 35 days; monthly for 12 months; delete only after owner approval" } as const;
