# Human-reviewed Gmail sending — inactive source implementation

This feature is not an autonomous outreach sequence. The owner edits and saves an internal draft, reviews the exact saved version and each recipient/message, records the actual requested or invited business context, and explicitly clicks Send. Research acceptance and a published address do not establish permission to send. A human click does not override Gmail's policies. Ambiguous promotional contexts require resolution before use; ordinary requested information and genuinely in-scope invited business correspondence are not treated as newsletter enrollment.

## Connection and permissions

The app has its own Google web OAuth client. It never borrows the assistant's Gmail connector or the contact form's SMTP app password. Existing Labs and contact notifications are unchanged.

Production redirect URI: `https://blackmountain.tech/api/admin/crm/gmail/callback`.

The implementation requires `https://www.googleapis.com/auth/gmail.send` and `https://www.googleapis.com/auth/gmail.readonly`. Send is sensitive; readonly is restricted. Readonly grants access to the whole mailbox, not only Sent. Code limits reconciliation reads to relevant sent-message candidates. It also permits read-only alias inspection, so no settings-write, compose, modify, full-mail, or domain-wide delegation scope is requested. `gmail.metadata` cannot perform the required `q` Message-ID search.

Google Cloud project/client ownership, Workspace organization and Internal audience eligibility must be verified, not assumed. An internal organizational app is appropriate only when the account/project actually qualifies. Otherwise applicable consent-screen publishing, restricted-scope verification/security assessment and testing-user/token lifetime requirements must be resolved. A separate explicit owner grant is required. No actual OAuth authorization or account configuration is part of source testing.

The expected primary mailbox is pinned separately from the fixed sender alias `info@blackmountain.tech`; an accepted send-as alias is not assumed to be the primary login. Connection establishment and runtime use validate the relevant identity/alias. OAuth state is owner/session bound, short lived and consumed once, with PKCE. Refresh tokens are encrypted server-side with a separately configured runtime key, not exposed to browsers or logs. Operational OAuth records are excluded from logical CRM backups; restore requires deliberate disconnect/reconnection and must not retain a previously active connection accidentally.

## Safety and outcome model

- A fresh saved `review_ready` draft/version, exact recipient list (1–10), reviewed context and successful pre-campaign backup are required.
- Current history, opt-out, bounce and no-further-contact holds are checked again at the durable claim boundary. No historical record is rewritten to manufacture eligibility.
- The server controls From/To and MIME construction. No client-supplied BCC, CC, arbitrary headers or sender alias is accepted.
- A unique durable claim is made before each provider request. Repeated clicks, concurrent requests and replays cannot acquire that claim again.
- Gmail does not provide an application idempotency key. A deterministic Message-ID supports reconciliation; it is **not** a guarantee that Gmail deduplicates messages.
- Timeout, malformed receipt, process interruption or a crash between provider acceptance and database finalization is UNKNOWN. Such attempts are never automatically resent or reclaimed after a lease. A search returning nothing does not prove that nothing was sent.
- Receipt reconciliation requires the exact expected sent-message identity and content. Only verified provider evidence can resolve UNKNOWN to sent. No reconciliation action sends an email.
- Sent means Gmail accepted the message, not delivered, read or replied. No fabricated delivery state is recorded. Attempts and outcomes are append-only; legacy outreach history remains preserved.
- There is no scheduler, follow-up enrollment, automatic external draft creation, background retry or automatic sender activation.

## Release gates

1. Complete all local mock endpoint/UI/transport/SQL tests, aggregate checks and independent review. No real credentials or real sends in tests.
2. Review migration 0007 and take an exact-byte private backup before applying it. Extend logical backup schema to include all send review/attempt/outcome records; test restore preserves replay protections and unknown states.
3. Explicitly authorize and configure the application-owned Google OAuth client, exact redirect, scopes, owner identity and secret-storage key. Verify Google account/client policy requirements and the accepted sender alias. Keep sending disabled throughout setup.
4. Run owner-approved connection checks; do not infer permission to send test mail from OAuth consent. A separate exact-recipient/message send test requires explicit approval.
5. Enable the Send kill switch only after all release and provider-policy gates pass. Reconciliation can remain available while new sends are disabled.
6. During recovery, disable sending and OAuth connection use. Restore captured attempts/outcomes and reconcile post-snapshot sends before reconnecting; an older backup is never a license to resend.

A complete source implementation is not a claim that production Gmail is connected. Deployment, migration, secret configuration, OAuth grant and actual sends remain distinct approvals.

## Official references (checked October 30, 2026)

- [Gmail send scopes and API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send)
- [Send-as alias read scopes](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.settings.sendAs/list)
- [Message search and metadata-scope limitation](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)
- [Gmail scope classifications](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Google OAuth web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Workspace API user-data/developer policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)
- [Gmail program policies](https://support.google.com/mail/answer/16734397)
- [Sender guidelines](https://support.google.com/mail/answer/81126)

## Runtime configuration names (values not provisioned)

- `CRM_GMAIL_CONNECTION_ENABLED`: explicit connection/OAuth gate.
- `CRM_GMAIL_SEND_ENABLED`: separate send kill switch; defaults off.
- `CRM_APP_ORIGIN`: exactly `https://blackmountain.tech`.
- `CRM_GMAIL_CLIENT_ID`, `CRM_GMAIL_CLIENT_SECRET`: dedicated approved Google web client.
- `CRM_GMAIL_TOKEN_KEY`: canonical base64 encoding of 32 random bytes, separately managed secret, never in source/logs/backups.
- `CRM_GMAIL_OWNER_EMAIL`: exact authorized primary mailbox, distinct from the accepted fixed From alias where necessary.

App disconnect removes its local connection and pending OAuth state. Google Account permission revocation is a separate owner action; disconnect cannot undo a request already accepted by Gmail. No new credential or grant is created by this source change.
