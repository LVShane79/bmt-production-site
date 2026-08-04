import type { Metadata } from "next";
import { JsonLd } from "../components/JsonLd";
import { ArrowIcon, SiteFooter, SiteHeader } from "../components/SiteShell";
import { TrackedLink } from "../components/TrackedLink";
import { absoluteUrl, organizationId } from "../lib/site";

export const metadata: Metadata = {
  title: "AV Engineering Resources",
  description:
    "Practical commercial AV tools, checklists, templates, and field guides from Black Mountain Technologies.",
  alternates: { canonical: "/resources" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "Practical AV Engineering Resources",
    description:
      "Free commercial AV calculators, checklists, templates, and field guidance from Black Mountain Technologies.",
    url: "/resources",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

const workflowResources = [
  {
    number: "04",
    label: "Field checklist",
    title: "AV Site Survey Checklist",
    description: "Document spaces, existing systems, infrastructure, access, and coordination conditions in the field.",
    href: "/resources/site-survey",
  },
  {
    number: "05",
    label: "Coordination tool",
    title: "Scope Responsibility Matrix",
    description: "Assign system, infrastructure, programming, testing, and turnover responsibilities across the project team.",
    href: "/resources/responsibility-matrix",
  },
  {
    number: "06",
    label: "Acceptance checklist",
    title: "AV Commissioning & Acceptance Checklist",
    description:
      "Verify installation quality, system performance, user workflows, documentation, training, and turnover.",
    href: "/resources/commissioning",
  },
];

export default function ResourcesPage() {
  const resources = [
    { name: "BMT Speaker Lab", url: "https://bmt-speaker-lab.lvshane79.chatgpt.site" },
    { name: "BMT Projection Lab", url: absoluteUrl("/resources/projection-lab") },
    { name: "AV Project Questionnaire", url: absoluteUrl("/resources/project-questionnaire") },
    { name: "AV Site Survey Checklist", url: absoluteUrl("/resources/site-survey") },
    { name: "AV Scope Responsibility Matrix", url: absoluteUrl("/resources/responsibility-matrix") },
    { name: "AV Commissioning & Acceptance Checklist", url: absoluteUrl("/resources/commissioning") },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BMT AV Engineering Resources",
    description: metadata.description,
    url: absoluteUrl("/resources"),
    provider: { "@id": organizationId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: resource.name,
          url: resource.url,
          isAccessibleForFree: true,
        },
      })),
    },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <SiteHeader />

      <section className="resources-hero">
        <div>
          <p className="eyebrow"><span /> BMT resource center</p>
          <h1>Useful tools for<br /><em>better AV work.</em></h1>
        </div>
        <div className="resources-hero-copy">
          <p>
            Practical calculators, checklists, templates, and field guidance—built to turn engineering decisions into clear next steps.
          </p>
          <span>Tools · Checklists · Templates · Guides</span>
        </div>
        <div className="resources-grid-mark" aria-hidden="true" />
      </section>

      <section className="featured-resource" aria-labelledby="speaker-lab-heading">
        <div className="resource-diagram" aria-hidden="true">
          <div className="resource-room">
            <i className="resource-speaker speaker-one">1</i>
            <i className="resource-speaker speaker-two">2</i>
            <i className="resource-speaker speaker-three">3</i>
            <i className="resource-speaker speaker-four">4</i>
            <span className="coverage-circle coverage-one" />
            <span className="coverage-circle coverage-two" />
            <span className="coverage-circle coverage-three" />
            <span className="coverage-circle coverage-four" />
          </div>
          <p><span>FIG. 01</span> Interactive loudspeaker layout workspace</p>
        </div>

        <article>
          <p className="eyebrow dark"><span /> Featured tool · Free resource</p>
          <span className="resource-index">01 / TOOL</span>
          <h2 id="speaker-lab-heading">BMT Speaker Lab</h2>
          <p>
            Explore loudspeaker coverage geometry, compare simplified SPL estimates, and check constant-voltage or Low-Z amplifier loading in one visual workspace.
          </p>
          <ul>
            <li>Drag speakers into position on a room layout</li>
            <li>Add speaker and amplifier specifications</li>
            <li>Review coverage, tap loading, and channel limits</li>
          </ul>
          <TrackedLink
            className="button button-dark"
            href="https://bmt-speaker-lab.lvshane79.chatgpt.site"
            target="_blank"
            rel="noreferrer"
            eventName="resource_open"
            eventProperties={{ resource: "speaker_lab", destination: "external" }}
          >
            Open Speaker Lab <ArrowIcon />
          </TrackedLink>
          <small>Opens the interactive tool in a new window.</small>
        </article>
      </section>

      <section className="featured-resource featured-resource-projector" aria-labelledby="projection-lab-heading">
        <article>
          <p className="eyebrow dark"><span /> Featured tool · Free resource</p>
          <span className="resource-index">02 / TOOL</span>
          <h2 id="projection-lab-heading">BMT Projection Lab</h2>
          <p>
            Solve screen geometry, lens-driven throw distance, lens shift, and preliminary image brightness in one practical workspace.
          </p>
          <ul>
            <li>Select common screen sizes or enter a custom diagonal</li>
            <li>Compare lens throw ranges and projector placement</li>
            <li>Check optical alignment, shift, and room brightness</li>
          </ul>
          <TrackedLink
            className="button button-dark"
            href="/resources/projection-lab"
            eventName="resource_open"
            eventProperties={{ resource: "projection_lab", destination: "internal" }}
          >
            Open Projection Lab <ArrowIcon />
          </TrackedLink>
          <small>Opens the interactive calculator on the BMT website.</small>
        </article>

        <div className="resource-diagram projection-diagram" aria-hidden="true">
          <div className="projection-room">
            <div className="projection-ceiling" />
            <div className="projection-projector"><i /><span>LENS</span></div>
            <div className="projection-beam" />
            <div className="projection-screen"><span>16:9</span></div>
            <div className="projection-distance"><i /><span>THROW RANGE</span><i /></div>
          </div>
          <p><span>FIG. 02</span> Lens-driven projection geometry workspace</p>
        </div>
      </section>

      <section className="secondary-resource">
        <div>
          <span>03 / DISCOVERY TOOL</span>
          <p className="eyebrow dark"><span /> New resource</p>
          <h2>AV Project Questionnaire</h2>
        </div>
        <div>
          <p>
            Capture goals, spaces, users, systems, infrastructure, stakeholders, schedule, budget, and project risks in a structured brief your team can copy or print.
          </p>
          <a className="button button-dark" href="/resources/project-questionnaire">Open questionnaire <ArrowIcon /></a>
        </div>
      </section>

      <section className="resource-roadmap">
        <div className="resource-roadmap-heading">
          <p className="eyebrow dark"><span /> BMT project workflow</p>
          <h2>Useful from discovery<br />through turnover.</h2>
          <p>
            Start with project definition, document the field, assign responsibilities, and verify the finished system.
          </p>
        </div>
        <div className="resource-roadmap-grid">
          {workflowResources.map((item) => (
            <article key={item.number}>
              <div><span>{item.number}</span><b>Available now</b></div>
              <p>{item.label}</p>
              <h3><a className="resource-title-link" href={item.href}>{item.title}</a></h3>
              <small>{item.description}</small>
              <a href={item.href}>Open resource <ArrowIcon /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="resources-cta">
        <p className="eyebrow dark"><span /> Built from experience</p>
        <div>
          <h2>Have an idea for a tool your AV team would actually use?</h2>
          <a className="button button-dark" href="/contact">Tell us about it <ArrowIcon /></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
