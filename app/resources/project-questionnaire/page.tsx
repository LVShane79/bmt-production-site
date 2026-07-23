import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import QuestionnaireForm from "./QuestionnaireForm";

export const metadata: Metadata = {
  title: "AV Project Questionnaire",
  description:
    "A practical commercial AV discovery questionnaire for defining project goals, spaces, systems, infrastructure, stakeholders, constraints, and deliverables.",
};

export default function ProjectQuestionnairePage() {
  return (
    <main>
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
