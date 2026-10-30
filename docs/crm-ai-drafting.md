# Private CRM AI drafting scaffold

The feature is deliberately disabled by default. When enabled with the explicit feature flag, it verifies an owner session, current draft version, accepted fresh evidence, company geography/NTA review, and live recipient holds before making one synchronous preview request. It never saves, attaches, approves, or sends a CRM draft.

Activation requires `CRM_AI_DRAFTING_ENABLED=true`, Vercel's deployment-provided `VERCEL_OIDC_TOKEN`, migration 0006, and the separately approved AI Gateway/credit configuration. The code fixes `openai/gpt-5.4-mini`, OpenAI-only routing, ZDR, `store:false`, `reasoning:none`, no tools, no fallbacks, no retries, a 3,000 UTF-8-byte prompt cap, 1,000 output tokens, and 5/minute, 20/day, 300/month, $3/month application limits. The byte cap is a size guard, not an exact token count. The provider payload contains only company name plus owner-accepted source URL, publisher, excerpt, and capacity hypothesis—never lead email, notes, recipient IDs, history, or draft body.

Older activation notes may reference `CRM_AI_DRAFTING_MAX_REQUESTS_PER_HOUR` and `CRM_AI_DRAFTING_MAX_OUTPUT_TOKENS`; they are not runtime controls. The reviewed fixed policy above is the enforcement point.

Each request atomically reserves $0.3045 (the conservative 400,000-input-token plus 1,000-output-token ceiling stated for approval). Successful responses must return valid usage and settle immutable actual input/output token counts and actual cost; excess reservation is released. Missing usage or an ambiguous transport outcome remains an uncertain full reservation. Reusing a request ID cannot regenerate a preview.

Generated text must remain an editable preview. It must not save a draft, attach evidence, approve a draft, create a recipient, change company/evidence review state, or send email.
