import type { Metadata } from "next";
import { ArrowIcon, SiteFooter, SiteHeader } from "../components/SiteShell";
import { ArticleGraphic } from "./ArticleGraphic";
import { articles } from "./articles";

export const metadata: Metadata = {
  title: "Engineering Insights",
  description:
    "Field-tested thinking on commercial AV documentation, network planning, design judgment, and project delivery from Black Mountain Technologies.",
  alternates: { canonical: "/insights" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "Engineering Insights",
    description:
      "Practical thinking for people who design, sell, coordinate, install, and support commercial AV systems.",
    url: "/insights",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

const [featured, ...remaining] = articles;

export default function InsightsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="insights-hero">
        <div>
          <p className="eyebrow"><span /> BMT knowledge library</p>
          <h1>Engineering<br /><em>Insights.</em></h1>
        </div>
        <div className="insights-hero-copy">
          <p>
            Practical thinking for people who design, sell, coordinate, install, and support commercial AV systems.
          </p>
          <span>Documentation · Networks · Judgment · Field notes</span>
        </div>
        <div className="insights-axis" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </section>

      <section className="insight-categories" aria-label="Insight categories">
        <span>Explore by subject</span>
        <a href="#engineering-practice">Engineering practice</a>
        <a href="#design-judgment">Design judgment</a>
        <a href="#client-relationships">Client relationships</a>
        <a href="#field-notes">Field notes</a>
      </section>

      <section className="featured-insight" id="engineering-practice">
        <ArticleGraphic slug={featured.slug} index={1} />
        <article>
          <p className="eyebrow dark"><span /> Featured insight</p>
          <p className="article-kicker">{featured.label} <i /> {featured.readTime}</p>
          <h2>{featured.title}</h2>
          <p className="article-excerpt">{featured.excerpt}</p>
          <a className="text-link dark-link" href={`/insights/${featured.slug}`}>Read the article <ArrowIcon /></a>
        </article>
      </section>

      <section className="insight-library" aria-labelledby="library-heading">
        <div className="library-heading">
          <p className="eyebrow dark"><span /> Latest thinking</p>
          <h2 id="library-heading">Useful enough to save.<br />Clear enough to use.</h2>
        </div>
        <div className="article-card-grid">
          {remaining.map((article, index) => (
            <article
              className="article-card"
              id={article.category === "Field Notes" ? undefined : article.category.toLowerCase().replaceAll(" ", "-")}
              key={article.slug}
            >
              <ArticleGraphic slug={article.slug} index={index + 2} />
              <div className="article-card-copy">
                <p className="article-kicker">{article.category} <i /> {article.readTime}</p>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href={`/insights/${article.slug}`} aria-label={`Read ${article.title}`}>Read insight <ArrowIcon /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="field-notes-intro" id="field-notes">
        <div className="field-note-mark"><span>FN</span><strong>001+</strong></div>
        <div>
          <p className="eyebrow"><span /> Field notes</p>
          <h2>Lessons that only become obvious after somebody has lived them.</h2>
        </div>
        <div className="field-notes-copy">
          <p>
            Short, anonymized stories from design rooms, coordination calls, job sites, and commissioning days—shared to make the next project better.
          </p>
          <p className="field-rule">Protect the client. Explain the lesson. Leave the reader with something useful.</p>
        </div>
      </section>

      <section className="insights-cta">
        <p className="eyebrow dark"><span /> Build with confidence</p>
        <div>
          <h2>Need another set of experienced eyes on an AV project?</h2>
          <a className="button button-dark" href="/contact">Discuss a project <ArrowIcon /></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
