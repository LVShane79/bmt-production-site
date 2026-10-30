# Private CRM AI drafting scaffold

The scaffold is deliberately disabled. It verifies an owner session, current draft version, accepted fresh evidence, company geography/NTA review, and live recipient holds before it returns an unavailable response. It makes no provider request and sends no CRM content anywhere.

Later activation requires all of these explicit settings and approvals: `CRM_AI_DRAFTING_ENABLED=true`, an isolated private CRM provider credential (not an existing public-calculator key), an approved model identifier, `CRM_AI_DRAFTING_MAX_REQUESTS_PER_HOUR`, `CRM_AI_DRAFTING_MAX_OUTPUT_TOKENS`, and a documented monthly spend cap. The provider payload must contain only company name plus owner-accepted source URL, publisher, excerpt, and capacity hypothesis—never lead email, notes, recipient IDs, history, or draft body unless separately approved.

Generated text must remain an editable preview. It must not save a draft, attach evidence, approve a draft, create a recipient, change company/evidence review state, or send email.
