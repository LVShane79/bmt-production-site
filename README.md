# Black Mountain Technologies

Production website for Black Mountain Technologies, built with Next.js and deployed on Vercel.

- Live site: [blackmountain.tech](https://blackmountain.tech)
- Production repository: [LVShane79/bmt-production-site](https://github.com/LVShane79/bmt-production-site)

## Engineering Insights workflow

The website's published article records live in
[`app/insights/articles.ts`](app/insights/articles.ts). Each article needs a
unique slug, approved category, label, title, excerpt, read time, search focus,
publication and modification dates, and structured sections.

The route at [`app/insights/[slug]/page.tsx`](app/insights/%5Bslug%5D/page.tsx)
generates article pages, metadata, canonical URLs, Open Graph information, and
Article structured data from those records. Article-specific visuals are
selected in [`app/insights/ArticleGraphic.tsx`](app/insights/ArticleGraphic.tsx).

For a new article:

1. Draft and fact-check the article in the BMT Blogs project.
2. Add the approved record to `app/insights/articles.ts`.
3. Add or intentionally reuse an `ArticleGraphic` treatment.
4. Run the production build and review the article page on desktop and mobile.
5. Commit and push to `main` only after BMT approval. Vercel publishes the
   connected production branch.

Cloud chats may read this public repository for current website context. A
cloud chat still needs an authorized GitHub connection or a local handoff to
commit and publish changes; public read access alone does not grant write
access.

## Local development

```bash
pnpm install
pnpm dev
```

## Verification

```bash
pnpm lint
pnpm build
```
