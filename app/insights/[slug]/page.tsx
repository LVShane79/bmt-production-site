/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../components/JsonLd";
import { ArrowIcon, SiteFooter, SiteHeader } from "../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../lib/site";
import { ArticleGraphic } from "../ArticleGraphic";
import { articles, getArticle } from "../articles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const socialImage = article.image || "/og.png";
  const socialImageAlt = article.imageAlt || "Black Mountain Technologies — engineering better AV projects";
  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.focus, "commercial AV engineering", "Black Mountain Technologies"],
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `/insights/${article.slug}`,
      siteName: "Black Mountain Technologies",
      images: [{ url: socialImage, width: article.image ? 1400 : 1200, height: article.image ? 788 : 630, alt: socialImageAlt }],
      publishedTime: article.publishedAt,
      modifiedTime: article.modifiedAt,
      authors: ["Black Mountain Technologies"],
      tags: [article.focus, article.category, "commercial AV engineering"],
    },
  };
}

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    inLanguage: "en-US",
    image: absoluteUrl(article.image || "/og.png"),
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/insights/${article.slug}`),
    },
  };

  return (
    <main>
      <SiteHeader />
      <JsonLd data={schema} />

      <article>
        <header className="article-hero">
          <div className="article-breadcrumb">
            <a href="/insights">Engineering Insights</a><span>/</span><span>{article.category}</span>
          </div>
          <p className="article-kicker light-kicker">{article.label} <i /> {article.readTime}</p>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.excerpt}</p>
          <div className="article-byline">
            <span>Published by</span>
            <strong>Black Mountain Technologies</strong>
          </div>
          <ArticleGraphic slug={article.slug} variant="hero" />
        </header>

        <div className="article-layout">
          <aside className="article-rail">
            <span>In this insight</span>
            <ol>
              {article.sections.map((section, index) => (
                <li key={section.heading}><a href={`#section-${index + 1}`}>{section.heading}</a></li>
              ))}
            </ol>
            <a href="/insights">← All insights</a>
          </aside>

          <div className="article-body">
            <p className="article-opening">{article.excerpt}</p>
            {article.sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.heading}>
                <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.pullQuote && <blockquote>{section.pullQuote}</blockquote>}
              </section>
            ))}
            <div className="article-conclusion">
              <span>BMT principle</span>
              <p>Reduce uncertainty early, while decisions are still inexpensive to change.</p>
            </div>
          </div>
        </div>
      </article>

      <section className="related-insights">
        <p className="eyebrow dark"><span /> Continue reading</p>
        <div>
          {related.map((item) => (
            <a href={`/insights/${item.slug}`} key={item.slug}>
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <i>Read insight <ArrowIcon /></i>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
