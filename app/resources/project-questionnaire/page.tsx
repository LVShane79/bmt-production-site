import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../lib/site";
import QuestionnaireForm from "./QuestionnaireForm";

export const metadata: Metadata = {
  title: "AV Project Questionnaire",
  description:
    "A practical commercial AV discovery questionnaire for defining project goals, spaces, systems, infrastructure, stakeholders, constraints, and deliverables.",
  alternates: { canonical: "/resources/project-questionnaire" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "AV Project Questionnaire",
    description:
      "A structured commercial AV discovery tool for project goals, spaces, technology, infrastructure, stakeholders, and constraints.",
    url: "/resources/project-questionnaire",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

export default function ProjectQuestionnairePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMT AV Project Questionnaire",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/resources/project-questionnaire"),
    description: metadata.description,
    isAccessibleForFree: true,
    provider: { "@id": organizationId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <SiteHeader />
      <section className="questionnaire-hero">
        <div>
          <p className="eyebrow"><span /> BMT resource 02 · Discovery tool</p>
          <h1>AV Project<br /><em>Questionnaire.</em></h1>
        </div>
        <div className="questionnaire-hero-copy">
          <p>
            A structured starting point for defining project goals, users, spaces, technology, infrastructure, responsibilities, and constraints.
          </p>
          <span>Complete it collaboratively or use it to prepare for a discovery meeting.</span>
        </div>
      </section>
      <QuestionnaireForm />
      <SiteFooter />
    </main>
  );
}
