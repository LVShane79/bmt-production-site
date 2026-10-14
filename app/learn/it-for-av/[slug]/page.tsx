import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/JsonLd";
import { SiteFooter, SiteHeader } from "../../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../../lib/site";
import { LessonGraphic } from "../LessonGraphic";
import { getLesson, lessons } from "../lessons";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return {
    title: `Lesson ${lesson.number}: ${lesson.title}`,
    description: lesson.description,
    alternates: { canonical: `/learn/it-for-av/${lesson.slug}` },
    openGraph: {
      type: "article",
      title: `IT for AV — ${lesson.title}`,
      description: lesson.description,
      url: `/learn/it-for-av/${lesson.slug}`,
      siteName: "Black Mountain Technologies",
      publishedTime: lesson.publishedAt,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — IT for AV" }],
    },
  };
}

const graphicKinds = ["layers", "layers", "physical", "switch", "subnet", "services", "vlan", "route", "multicast", "qos", "wifi"] as const;

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const lessonIndex = lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = lessons[lessonIndex - 1];
  const next = lessons[lessonIndex + 1];
  const schema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.description,
    datePublished: lesson.publishedAt,
    inLanguage: "en-US",
    learningResourceType: "Lesson",
    educationalLevel: "Beginner to intermediate",
    isPartOf: { "@type": "Course", name: "IT for AV", url: absoluteUrl("/learn/it-for-av") },
    provider: { "@id": organizationId },
    url: absoluteUrl(`/learn/it-for-av/${lesson.slug}`),
  };

  return (
    <main>
      <SiteHeader />
      <JsonLd data={schema} />
      <article className="lesson-page">
        <header className="lesson-hero">
          <div className="lesson-breadcrumb"><Link href="/learn/it-for-av">IT for AV</Link><span>/</span><span>Lesson {String(lesson.number).padStart(2, "0")}</span></div>
          <div className="lesson-hero-grid">
            <div>
              <p className="article-kicker light-kicker">{lesson.shortTitle} <i /> {lesson.readTime} read</p>
              <h1>{lesson.title}</h1>
              <p>{lesson.description}</p>
            </div>
            <LessonGraphic kind={graphicKinds[lessonIndex]} figure={String(lesson.number).padStart(2, "0")} />
          </div>
        </header>

        <div className="lesson-layout">
          <aside className="lesson-rail">
            <span>In this lesson</span>
            <ol>
              <li><a href="#objectives">Learning objectives</a></li>
              {lesson.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`}>{section.heading}</a></li>)}
              <li><a href="#field-examples">AV field examples</a></li>
              <li><a href="#exercise">Exercise + review</a></li>
            </ol>
            <Link href="/learn/it-for-av">← Course index</Link>
          </aside>

          <div className="lesson-body">
            <section className="lesson-objectives" id="objectives">
              <span>LEARNING OBJECTIVES</span>
              <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
            </section>

            {lesson.sections.map((section, index) => (
              <section className="lesson-content-section" id={`section-${index + 1}`} key={section.heading}>
                <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.graphic && index > 0 && <LessonGraphic kind={section.graphic} figure={`${lesson.number}.${index + 1}`} compact />}
              </section>
            ))}

            <section className="lesson-field-examples" id="field-examples">
              <span>BMT / FIELD APPLICATION</span>
              <h2>Put it in an AV system.</h2>
              <div>{lesson.examples.map((example) => <article key={example.title}><h3>{example.title}</h3><p>{example.text}</p></article>)}</div>
            </section>

            <section className="lesson-glossary">
              <span>COMPACT GLOSSARY</span>
              <dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
            </section>

            <section className="lesson-exercise" id="exercise">
              <span>FIELD EXERCISE</span>
              <h2>{lesson.exercise.title}</h2>
              <p>{lesson.exercise.prompt}</p>
            </section>

            <section className="lesson-review">
              <span>CHECK YOUR MODEL</span>
              <h2>Three quick questions.</h2>
              {lesson.review.map((item, index) => (
                <details key={item.question}>
                  <summary><i>{String(index + 1).padStart(2, "0")}</i>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>

            <div className="lesson-next-note"><span>WHERE THIS GOES NEXT</span><p>{lesson.next}</p></div>
          </div>
        </div>
      </article>

      <nav className="lesson-pagination" aria-label="Lesson navigation">
        {previous ? <Link href={`/learn/it-for-av/${previous.slug}`}><span>← Previous lesson</span><strong>{previous.title}</strong></Link> : <Link href="/learn/it-for-av"><span>← Course</span><strong>IT for AV index</strong></Link>}
          {next ? <Link href={`/learn/it-for-av/${next.slug}`}><span>Next lesson →</span><strong>{next.title}</strong></Link> : <div><span>Next lesson</span><strong>Wi-Fi Security and Identity</strong><i>Coming next</i></div>}
      </nav>
      <SiteFooter />
    </main>
  );
}
