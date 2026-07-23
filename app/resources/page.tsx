import type { Metadata } from "next";
import { ArrowIcon, SiteFooter, SiteHeader } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "AV Engineering Resources",
  description:
    "Practical commercial AV tools, checklists, templates, and field guides from Black Mountain Technologies.",
};

const roadmap = [
  {
    number: "02",
    label: "Checklists",
    title: "Field-ready workflows",
    description: "Site survey, commissioning, turnover, and preventive-maintenance checklists built for real project teams.",
  },
  {
    number: "03",
    label: "Templates",
    title: "Repeatable project documents",
    description: "Scope worksheets, acceptance testing forms, closeout packages, and coordination templates.",
  },
  {
    number: "04",
    label: "Calculators",
    title: "More design tools",
    description: "Display sizing, network bandwidth, storage, power, and other focused engineering utilities.",
  },
];

export default function ResourcesPage() {
  return (
    <main>
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
          <a
            className="button button-dark"
            href="https://bmt-speaker-lab.lvshane79.chatgpt.site"
            target="_blank"
            rel="noreferrer"
          >
            Open Speaker Lab <ArrowIcon />
          </a>
          <small>Opens the interactive tool in a new window.</small>
        </article>
      </section>

      <section className="resource-roadmap">
        <div className="resource-roadmap-heading">
          <p className="eyebrow dark"><span /> What comes next</p>
          <h2>A growing library,<br />organized around the work.</h2>
          <p>
            Speaker Lab is the first release. Additional BMT resources will be added here as they are ready to use.
          </p>
        </div>
        <div className="resource-roadmap-grid">
          {roadmap.map((item) => (
            <article key={item.number}>
              <div><span>{item.number}</span><b>In development</b></div>
              <p>{item.label}</p>
              <h3>{item.title}</h3>
              <small>{item.description}</small>
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
