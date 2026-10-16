# BMT labs migration preparation

Status (2026-10-16): preview preparation in draft PR #1. The migration branch was pushed and deployed to a Vercel preview. Production has not been switched, no secret value has been moved, and neither legacy Site has been retired. Production cutover remains blocked on acceptance checks and a securely configured OpenAI key.

Draft PR: https://github.com/LVShane79/bmt-production-site/pull/1
Verified earlier preview (commit b06a737): https://black-mountain-technologies-i1u0co8ws-blackmountaintech.vercel.app

This revision incorporates main commit d14295a9adf4f01f66cb74af36cdb3e4aed5915f, including the Wi-Fi security and AV identity lessons, without changing their content. It retains Speaker CSS isolation commit b06a737d2ad3284293815052a08f788a94b29e9d.

## Baselines and destinations

- BMT source archive baseline: LVShane79/bmt-production-site commit 2e2b09757353bd86329b55ee1692e1b09f60cb7f.
- Vercel project: black-mountain-technologies, prj_gMYgm1Ok86g7vQ2LDJc9iSuUEb41, BMT team team_ZyhGojpsRUOhly97AwGJJ3iw.
- Projection UI is already native Next.js at https://blackmountain.tech/resources/projection-lab. Its API is /api/projectors.
- Speaker Lab: https://bmt-speaker-lab.lvshane79.chatgpt.site, published v9, commit 18119b58500cd1644674cf27765420564e4f8c6c. Preview destination: /resources/speaker-lab in the same BMT project; not promoted to production.
- Projection Sites service: https://bmt-projection-lab.lvshane79.chatgpt.site, published v9, commit b081c7701a799120b057262f2b9cf934001a9f1b.
- Both Sites publication records report succeeded, and both Sites are public. Both database overviews return zero bindings/tables. Each has one runtime secret name: OPENAI_API_KEY. Secret values were not requested, printed, copied, or stored.

## Projection implementation inventory

The original production /api/projectors endpoint has a native OpenAI Responses API implementation and falls back to the Projection Site only when OPENAI_API_KEY is absent. The migration branch removes that fallback. An environment-metadata-only check on 2026-10-16 confirmed that key is absent from the BMT Vercel project.

Native implementation dependency: https://api.openai.com/v1/responses, web_search tool, existing model identifier gpt-5.6-luna. Successful model availability, billing, permissions, and web-search behavior still require a real preview smoke test; mocked tests do not establish these.

The browser calculator contains reference projector data, geometric and brightness calculations, PDF/text specification import via pdfjs-dist, manual equipment entry, shortlisting, and share-state links using a design query parameter. No localStorage/sessionStorage usage was found in the calculator. Imported PDFs/text are processed locally. Source UI calls its same-origin /api/projectors only for AI research. The inspected UI does not use a database or login flow.

Migration patch: replace the Sites fallback with a clear 503 explaining that manual entry, local specification import, and the calculator remain available. The native AI request and UI response contract are unchanged. Do not merge or promote this patch to production until the Vercel key is securely configured and real preview lookups succeed, or production AI lookup will become unavailable. Preview deployment is authorized and deliberately exposes the handled no-key state.

## Speaker implementation inventory

The v9 archive download initially failed authorization. After explicit user approval for temporary source-repository access, the supported credential flow retrieved the repository. HEAD exactly matches published v9: 18119b58500cd1644674cf27765420564e4f8c6c. No token was persisted; automatic publishing was not requested. The pristine source was left unchanged.

The production UI is React/Next-compatible TSX. Its only app backend is /api/speakers, supporting speaker and amplifier AI research through the OpenAI Responses API and web_search. It uses the same existing model identifier as Projection. Empty Drizzle schema, unused auth helper, Cloudflare worker, Vite build adapter, and Sites metadata are scaffold/platform code, not required app dependencies; these were not carried into BMT.

The port preserves original calculation, drag-layout, 70 V/Low-Z, amplifier/speaker manual entry, local PDF/text extraction, shortlists/library, and share-state logic. Original CSS is scoped under .speaker-lab; assets are namespaced under /speaker-lab. Type-only API cleanup and a documented browser-state hydration lint exception adapt it to the BMT repository rules. No new npm dependency is required. Public access remains public.

Important data transfer: the custom speaker library is saved in browser localStorage as bmt-speaker-library. Browser storage belongs to its origin and does not transfer automatically from the Sites URL to blackmountain.tech. Keep the old Site available until custom libraries are transferred. A connected-computer task can export the exact old-origin library and restore it under the new origin after a verified backup and user-authorized handoff. Alternatively, existing Copy project link captures the selected speaker, amplifier, room, layout, and system state; its project query parameter is unchanged by the port and can be carried to the new path. It captures one selected speaker rather than the whole library. This migration has not read or altered anyone's browser library, and makes no claim that it has transferred existing personal data.

Existing project links remain usable on the old Site while it remains hosted. Before any retirement, decide how to preserve or redirect legacy URLs with their query strings. No old Site was edited or deleted.

## Smallest deployment shape

Keep the public BMT labs in the existing BMT Next.js GitHub repository and Vercel project. Add Speaker at /resources/speaker-lab, native API endpoint(s), and required assets; stage resource-link and structured-data changes in the preview and release them to production only after preview acceptance. Keep Projection's existing URL unchanged. One Vercel runtime secret can support both labs if the user approves that scope; use a server-only variable, never NEXT_PUBLIC_. External OpenAI model execution remains a service dependency even when all application hosting runs on Vercel.

The owner's longer-term structure is OneDrive for files/source archives, GitHub for code history, and Vercel for hosting with few projects. BMT website/labs come first. Other BMT apps require separate data/auth migration planning; private CRM and Time Tracker must not be placed into public resource routes. No other apps were changed here.

## Verification and cutover gate

1. Exact Speaker v9 source obtained and its pristine source archive saved to the authorized OneDrive BMT Labs folder. Archive size: 1,739,149 bytes; SHA-256: cf0e2f1ae88c93967a956ef51ba2122e7fd6c8863840f85724c8964a553b29cd.
2. Speaker port pushed to an isolated branch and draft PR #1; Vercel preview deployed. Keep current production URLs and services working.
3. User securely configures OPENAI_API_KEY for the intended Vercel preview and production scope. Do not ask for its value in chat or retrieve/decrypt the existing Sites secret.
4. Type-check, lint, production build, and run unit/API regression tests.
5. Deploy an authorized preview. Verify desktop/mobile layout, all calculator modes, known engineering fixtures, library/manual equipment entry, PDF/text imports, AI success and failure states, source citations, share-link round trips, print/export paths, and Speaker persistence/export/import behavior.
6. Capture browser network evidence: neither lab may request a chatgpt.site runtime URL during supported flows. Confirm neither app exposes API keys in client assets.
7. Compare existing resource pages, site navigation, contact flow, learning tools, and SEO routes to baseline. Avoid sending real contact emails in a smoke test without approval.
8. User approves production switch after reviewing preview results. Preserve prior deploy and both Sites for rollback.
9. Verify production UI and AI requests after promotion. Only then discuss legacy URL redirects/retirement. Sites must not be deleted merely because a Vercel preview works.

## Earlier test evidence

These results apply to the original migration preparation before main's later lesson update. They are not a claim that this newer merged revision has already passed reruns.

- Production Next.js build passed, including TypeScript and 36 static pages.
- Repository ESLint passed.
- node --test tests/*.test.mjs: 17 tests passed, covering both native API response contracts, missing-key behavior without Sites networking, invalid upstream data, local spec parsers, layout geometry, 70 V/Low-Z physics fixtures, and Unicode v1 project-link round trips.
- node tests/http-smoke.mjs: 11 checks passed against a real local production Next.js server: six page/sitemap routes, three Speaker assets, and both APIs' missing-key 503 responses.
- The migration was subsequently pushed as draft PR #1 and preview deployment b06a737 reached READY.

Unit tests use mocked NextResponse/fetch against stripped actual route source. The HTTP checks use the real built app with no app secrets. These do not establish live model availability or successful AI research.

Initial cloud-browser localhost navigation was blocked by connection/URL authority restrictions; later QA uses the authorized public Vercel preview. Interactive PDF upload was interrupted without a conclusive result. Do not count an interrupted or unrun check as passed. Desktop/mobile acceptance, PDF upload, drag/touch behavior, share-link navigation, and network evidence must be recorded against the final preview. Successful real AI lookups remain blocked until the user securely configures the Vercel key.

## Current revision verification

The replacement task's cloud shell disconnected on 2026-10-16 before reruns. GitHub and Vercel connectors remain available. Main's four lesson files are incorporated by their exact blob identities in a two-parent merge commit; no production branch is modified. A preview-specific build command may run the production build, lint, the 17 unit/API tests, and 11 local HTTP checks without changing project-wide settings. Consult the final preview build logs and PR acceptance summary for actual results; this document does not predeclare them passed.

The latest source archive and acceptance record must identify the final migration commit. Earlier migration archives predating b06a737 do not contain the CSS-isolation correction and are historical snapshots, not the final release source.
