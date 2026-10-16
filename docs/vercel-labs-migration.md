# BMT labs migration preparation

Status: local preparation only. No deployment, GitHub push, live link change, secret change, or Sites retirement has occurred.

## Baselines and destinations

- BMT source archive baseline: LVShane79/bmt-production-site commit 2e2b09757353bd86329b55ee1692e1b09f60cb7f.
- Vercel project: black-mountain-technologies, prj_gMYgm1Ok86g7vQ2LDJc9iSuUEb41, BMT team team_ZyhGojpsRUOhly97AwGJJ3iw.
- Projection UI is already native Next.js at https://blackmountain.tech/resources/projection-lab. Its API is /api/projectors.
- Speaker Lab: https://bmt-speaker-lab.lvshane79.chatgpt.site, published v9, commit 18119b58500cd1644674cf27765420564e4f8c6c. Proposed destination: /resources/speaker-lab in the same BMT project.
- Projection Sites service: https://bmt-projection-lab.lvshane79.chatgpt.site, published v9, commit b081c7701a799120b057262f2b9cf934001a9f1b.
- Both Sites publication records report succeeded, and both Sites are public. Both database overviews return zero bindings/tables. Each has one runtime secret name: OPENAI_API_KEY. Secret values were not requested, printed, copied, or stored.

## Projection implementation inventory

The existing /api/projectors endpoint has a complete native OpenAI Responses API implementation. It falls back to the Projection Site only when OPENAI_API_KEY is absent. An environment-metadata-only check on 2026-10-16 confirmed that key is absent from the BMT Vercel project.

Native implementation dependency: https://api.openai.com/v1/responses, web_search tool, existing model identifier gpt-5.6-luna. Successful model availability, billing, permissions, and web-search behavior still require a real preview smoke test; mocked tests do not establish these.

The browser calculator contains reference projector data, geometric and brightness calculations, PDF/text specification import via pdfjs-dist, manual equipment entry, shortlisting, and share-state links using a design query parameter. No localStorage/sessionStorage usage was found in the calculator. Imported PDFs/text are processed locally. Source UI calls its same-origin /api/projectors only for AI research. The inspected UI does not use a database or login flow.

Local patch: replace the Sites fallback with a clear 503 explaining that manual entry, local specification import, and the calculator remain available. The native AI request and UI response contract are unchanged. Do not merge/deploy this patch until the Vercel key is securely configured and a real preview lookup succeeds, or the production AI lookup will become unavailable.

## Speaker implementation inventory

The v9 archive download initially failed authorization. After explicit user approval for temporary source-repository access, the supported credential flow retrieved the repository. HEAD exactly matches published v9: 18119b58500cd1644674cf27765420564e4f8c6c. No token was persisted; automatic publishing was not requested. The pristine source was left unchanged.

The production UI is React/Next-compatible TSX. Its only app backend is /api/speakers, supporting speaker and amplifier AI research through the OpenAI Responses API and web_search. It uses the same existing model identifier as Projection. Empty Drizzle schema, unused auth helper, Cloudflare worker, Vite build adapter, and Sites metadata are scaffold/platform code, not required app dependencies; these were not carried into BMT.

The port preserves original calculation, drag-layout, 70 V/Low-Z, amplifier/speaker manual entry, local PDF/text extraction, shortlists/library, and share-state logic. Original CSS is scoped under .speaker-lab; assets are namespaced under /speaker-lab. Type-only API cleanup and a documented browser-state hydration lint exception adapt it to the BMT repository rules. No new npm dependency is required. Public access remains public.

Important data transfer: the custom speaker library is saved in browser localStorage as bmt-speaker-library. Browser storage belongs to its origin and does not transfer automatically from the Sites URL to blackmountain.tech. Keep the old Site available until custom libraries are transferred. A connected-computer task can export the exact old-origin library and restore it under the new origin after a verified backup and user-authorized handoff. Alternatively, existing Copy project link captures the selected speaker, amplifier, room, layout, and system state; its project query parameter is unchanged by the port and can be carried to the new path. It captures one selected speaker rather than the whole library. This migration has not read or altered anyone's browser library, and makes no claim that it has transferred existing personal data.

Existing project links remain usable on the old Site while it remains hosted. Before any retirement, decide how to preserve or redirect legacy URLs with their query strings. No old Site was edited or deleted.

## Smallest deployment shape

Keep the public BMT labs in the existing BMT Next.js GitHub repository and Vercel project. Add Speaker at /resources/speaker-lab, native API endpoint(s), and required assets; change existing resource links and structured data only after preview acceptance. Keep Projection's existing URL unchanged. One Vercel runtime secret can support both labs if the user approves that scope; use a server-only variable, never NEXT_PUBLIC_. External OpenAI model execution remains a service dependency even when all application hosting runs on Vercel.

The owner's longer-term structure is OneDrive for files/source archives, GitHub for code history, and Vercel for hosting with few projects. BMT website/labs come first. Other BMT apps require separate data/auth migration planning; private CRM and Time Tracker must not be placed into public resource routes. No other apps were changed here.

## Verification and cutover gate

1. Exact Speaker v9 source obtained. Save its pristine source archive to the authorized OneDrive workflow.
2. Speaker port completed locally on an isolated branch; keep current URLs and services working.
3. User securely configures OPENAI_API_KEY for the intended Vercel preview and production scope. Do not ask for its value in chat or retrieve/decrypt the existing Sites secret.
4. Type-check, lint, production build, and run unit/API regression tests.
5. Deploy an authorized preview. Verify desktop/mobile layout, all calculator modes, known engineering fixtures, library/manual equipment entry, PDF/text imports, AI success and failure states, source citations, share-link round trips, print/export paths, and Speaker persistence/export/import behavior.
6. Capture browser network evidence: neither lab may request a chatgpt.site runtime URL during supported flows. Confirm neither app exposes API keys in client assets.
7. Compare existing resource pages, site navigation, contact flow, learning tools, and SEO routes to baseline. Avoid sending real contact emails in a smoke test without approval.
8. User approves production switch after reviewing preview results. Preserve prior deploy and both Sites for rollback.
9. Verify production UI and AI requests after promotion. Only then discuss legacy URL redirects/retirement. Sites must not be deleted merely because a Vercel preview works.

## Tests completed

- Production Next.js build passed, including TypeScript and 36 static pages.
- Repository ESLint passed.
- node --test tests/*.test.mjs: 17 tests passed, covering both native API response contracts, missing-key behavior without Sites networking, invalid upstream data, local spec parsers, layout geometry, 70 V/Low-Z physics fixtures, and Unicode v1 project-link round trips.
- node tests/http-smoke.mjs: 11 checks passed against a real local production Next.js server: six page/sitemap routes, three Speaker assets, and both APIs' missing-key 503 responses.
- No migration change was pushed or deployed.

Unit tests use mocked NextResponse/fetch against stripped actual route source. The HTTP checks use the real built app with no app secrets. These do not establish live model availability or successful AI research.

Cloud-browser localhost navigation was blocked by connection/URL authority restrictions. No browser workaround was attempted. Desktop/mobile visual checks, interactive PDF upload, drag/touch behavior, actual share-link browser navigation, and network inspection remain gates on an authorized Vercel preview. Nothing is ready for live cutover until those and real AI lookups pass.
