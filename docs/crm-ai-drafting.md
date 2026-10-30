# Private CRM AI drafting scaffold

The feature is deliberately disabled by default. When enabled with the explicit feature flag, it verifies an owner session, current draft version, accepted fresh evidence, company geography/NTA review, and live recipient holds before making one synchronous preview request. Generation never saves, attaches, approves, or sends a CRM draft; the owner may explicitly save reviewed edits through a separate action.

Activation requires `CRM_AI_DRAFTING_ENABLED=true`, the existing deployment-provided `OPENAI_API_KEY`, migration 0006, and the separately approved existing OpenAI connection. No key values are exposed to the client or logs, and the public Speaker/Projector Lab endpoints are not called or changed. The code fixes `gpt-4.1-mini` on the direct OpenAI Responses API with explicit `service_tier:"default"` (standard pricing, not inherited priority tier), `store:false`, no reasoning parameter (this is a non-reasoning model), a 45-second timeout, no tools, no fallbacks, no retries, a 3,000 UTF-8-byte prompt cap, 1,000 output tokens, and per-owner 5/minute, 20/day, 300/month request limits with one shared $3/month application budget across all authorized owner IDs. The byte cap is a size guard, not an exact token count. The provider payload contains only company name plus owner-accepted source URL, publisher, excerpt, and capacity hypothesis—never lead email, notes, recipient IDs, history, or draft body.

Older activation notes may reference `CRM_AI_DRAFTING_MAX_REQUESTS_PER_HOUR` and `CRM_AI_DRAFTING_MAX_OUTPUT_TOKENS`; they are not runtime controls. The reviewed fixed policy above is the enforcement point.

Each request atomically reserves $0.420631 (the conservative full 1,047,576-token context plus 1,000-output-token ceiling, at $0.40/M input and $1.60/M output). Provider-reported input usage (including protocol/schema overhead) may be up to 1,047,576 tokens; the 3,000-byte prompt guard is not a token count. Successful responses must return valid usage and settle immutable actual input/output token counts and actual cost; excess reservation is released. Missing or invalid usage, invalid output, or an ambiguous transport outcome remains an uncertain full reservation. Reusing a request ID cannot regenerate a preview.

Generated text starts as an editable preview. Only the separate, explicit owner Save action may update the internal draft via the existing version/recipient-gated endpoint. Generation and editing never automatically save a draft, attach evidence, approve a draft, create a recipient, change company/evidence review state, or send email.



## Billing and retention boundary

This uses the existing OpenAI account billing, not Vercel AI Gateway free credits. The shared $3 monthly ledger limits this CRM feature only; it does not cap the account’s other Lab usage. `store:false` disables Responses application-state storage but is not Zero Data Retention: standard abuse-monitoring logs can be retained for up to 30 days. No ZDR guarantee is made. No tools or web search are enabled, and manual source capture remains separate from AI drafting.

Verified reference: [OpenAI GPT-4.1 mini context and pricing](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), and [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data). Recheck pricing before activation if this policy is stale.

## Model maintenance deadline

OpenAI announced GPT-4.1 mini retirement for **January 14, 2027** in its [October 14, 2026 deprecation notice](https://developers.openai.com/api/docs/deprecations#2026-10-14-gpt-4-series-model-deprecations). This release deliberately keeps the currently supported, reviewed model. Review a replacement model, context ceiling, pricing, ledger formula, and tests before that date. There is no automatic fallback or silent model substitution; if the pinned model becomes unavailable, drafting fails closed.
