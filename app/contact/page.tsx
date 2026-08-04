import type { Metadata } from "next";
import { ArrowIcon, SiteFooter, SiteHeader } from "../components/SiteShell";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Discuss a commercial AV documentation, network design, engineering review, or technical consulting project with Black Mountain Technologies.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "Discuss a Commercial AV Project",
    description:
      "Bring Black Mountain Technologies the incomplete scope, schedule pressure, network question, or drawing package that needs experienced engineering support.",
    url: "/contact",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

const nextSteps = [
  ["01", "We review the fit", "We look at the project stage, schedule, deliverables, and where experienced engineering support can make a measurable difference."],
  ["02", "We clarify the unknowns", "A focused conversation establishes scope, responsibilities, available information, and the decisions that need to happen next."],
  ["03", "We define the engagement", "You receive a clear next step—whether that is a drawing package, a technical review, ongoing support, or simply useful direction."],
];

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow"><span /> Start a conversation</p>
          <h1>Let&apos;s make the<br /><em>project clearer.</em></h1>
        </div>
        <div className="contact-hero-intro">
          <p>
            Bring us the incomplete scope, the schedule pressure, the network question, or the drawing package that needs another experienced set of eyes.
          </p>
          <a href="mailto:info@blackmountain.tech">info@blackmountain.tech <ArrowIcon /></a>
        </div>
        <div className="contact-hero-axis" aria-hidden="true">
          <span>DISCOVERY</span><i /><span>DEFINITION</span><i /><span>DELIVERY</span>
        </div>
      </section>

      <section className="contact-workspace">
        <aside className="contact-rail">
          <p className="eyebrow dark"><span /> A useful first note</p>
          <h2>What helps us understand the work.</h2>
          <ul>
            <li><span>01</span>What the project is</li>
            <li><span>02</span>Where it stands today</li>
            <li><span>03</span>What your team needs</li>
            <li><span>04</span>When the decision matters</li>
          </ul>
          <div className="direct-contact">
            <span>Prefer to write directly?</span>
            <a href="mailto:info@blackmountain.tech">info@blackmountain.tech <ArrowIcon /></a>
            <p>Commercial AV engineering support for integrators across the United States.</p>
          </div>
        </aside>
        <ContactForm />
      </section>

      <section className="contact-next" aria-labelledby="contact-next-heading">
        <div className="contact-next-heading">
          <p className="eyebrow dark"><span /> What happens next</p>
          <h2 id="contact-next-heading">A practical conversation.<br />A defined next step.</h2>
        </div>
        <div className="contact-next-grid">
          {nextSteps.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
