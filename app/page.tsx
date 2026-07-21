/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial AV Engineering for Integrators | Black Mountain Technologies",
  description:
    "Engineered documentation, AV network design, and practical consulting for commercial AV integrators that need more capacity and fewer surprises.",
};

const outcomes = [
  { value: "01", label: "Fewer RFIs", detail: "Questions resolved before they reach the field." },
  { value: "02", label: "Cleaner installs", detail: "Documentation technicians can actually build from." },
  { value: "03", label: "Protected margins", detail: "Less rework, clearer scope, and better coordination." },
  { value: "04", label: "More capacity", detail: "Senior engineering support without adding overhead." },
];

const services = [
  {
    number: "01",
    title: "Engineered documentation",
    description:
      "Construction documents, shop drawings, as-builts, specifications, and coordination packages developed around how AV systems are actually installed.",
    items: ["System diagrams", "Rack elevations", "Floor plans + details"],
  },
  {
    number: "02",
    title: "Network design",
    description:
      "Practical infrastructure planning for AV-over-IP systems—from topology and addressing through switch requirements, pathways, and ownership boundaries.",
    items: ["Topology + VLAN planning", "IP schedules", "Infrastructure coordination"],
  },
  {
    number: "03",
    title: "Technical consulting",
    description:
      "Independent design judgment, project reviews, and ongoing engineering support that helps your team make better decisions without manufacturer lock-in.",
    items: ["Design reviews", "Technical due diligence", "Project support"],
  },
];

const process = [
  ["Understand", "We listen for the operational need, project constraints, and the decisions that will shape the budget."],
  ["Define", "We establish scope, system boundaries, responsibilities, and the infrastructure required to succeed."],
  ["Document", "We translate intent into coordinated, readable information the entire project team can use."],
  ["Support", "We stay available as the project evolves, answering questions and protecting the design intent."],
];

function TechnicalDrawing() {
  return (
    <div className="technical-drawing" aria-label="Conceptual commercial AV engineering drawing">
      <div className="drawing-grid" />
      <div className="drawing-index drawing-index-x">01&nbsp;&nbsp;&nbsp;02&nbsp;&nbsp;&nbsp;03&nbsp;&nbsp;&nbsp;04&nbsp;&nbsp;&nbsp;05</div>
      <div className="drawing-index drawing-index-y">A<br />B<br />C<br />D</div>

      <div className="building building-a"><span>A</span></div>
      <div className="building building-b"><span>B</span></div>
      <div className="building building-c"><span>C</span></div>
      <div className="building building-d"><span>D</span></div>

      <div className="signal-path path-one" />
      <div className="signal-path path-two" />
      <div className="signal-path path-three" />

      <div className="node node-1"><i /></div>
      <div className="node node-2"><i /></div>
      <div className="node node-3"><i /></div>
      <div className="node node-4"><i /></div>
      <div className="node node-5"><i /></div>

      <div className="drawing-note note-a"><strong>MDF-01</strong><span>PRIMARY HEAD-END</span></div>
      <div className="drawing-note note-b"><strong>IDF-02</strong><span>NETWORK DISTRIBUTION</span></div>
      <div className="drawing-note note-c"><strong>AV-301</strong><span>SYSTEM OVERVIEW</span></div>

      <div className="north-arrow"><span>N</span><i /></div>
      <div className="drawing-stamp"><span>CONCEPT</span><strong>AV / IT</strong></div>
    </div>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Black Mountain Technologies home">
          <img src="/bmt-logo-white.png" alt="Black Mountain Technologies" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#approach">Approach</a>
          <a href="#insights">Insights</a>
        </nav>
        <a className="header-cta" href="#contact">Discuss a project <ArrowIcon /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Commercial AV engineering</p>
          <h1>Engineering better<br /><em>AV projects.</em></h1>
          <p className="hero-lede">
            Engineered documentation, network design, and practical consulting for commercial AV integrators that need more capacity and fewer surprises.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Discuss a project <ArrowIcon /></a>
            <a className="text-link" href="#services">Explore our work <span>↓</span></a>
          </div>
        </div>
        <div className="hero-visual">
          <TechnicalDrawing />
          <p className="visual-caption"><span>FIG. 01</span> Systems become buildable when decisions become visible.</p>
        </div>
        <div className="hero-meta">
          <span>Documentation</span><i />
          <span>Network design</span><i />
          <span>Technical consulting</span>
        </div>
      </section>

      <section className="outcomes" aria-labelledby="outcomes-heading">
        <div className="section-intro">
          <p className="eyebrow dark"><span /> What clients gain</p>
          <h2 id="outcomes-heading">The work is technical.<br />The outcome is confidence.</h2>
        </div>
        <div className="outcome-grid">
          {outcomes.map((item) => (
            <article className="outcome" key={item.value}>
              <span className="number">{item.value}</span>
              <h3>{item.label}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="services" id="services" aria-labelledby="services-heading">
        <div className="services-heading">
          <p className="eyebrow"><span /> What we do</p>
          <h2 id="services-heading">Senior engineering support,<br />built around your team.</h2>
          <p>
            Black Mountain Technologies works behind the scenes with commercial AV integrators—adding judgment, documentation capacity, and technical clarity where it matters most.
          </p>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="approach" id="approach" aria-labelledby="approach-heading">
        <div className="approach-heading">
          <p className="eyebrow dark"><span /> How BMT works</p>
          <h2 id="approach-heading">Good documentation starts<br />before the first line is drawn.</h2>
        </div>
        <div className="process-line" />
        <div className="process-grid">
          {process.map(([title, text], index) => (
            <article className="process-step" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="insights" id="insights">
        <div className="insight-visual" aria-hidden="true">
          <div className="isometric iso-one" />
          <div className="isometric iso-two" />
          <div className="iso-grid" />
          <span className="iso-label label-one">COORDINATION</span>
          <span className="iso-label label-two">INFRASTRUCTURE</span>
          <span className="iso-label label-three">INTENT</span>
        </div>
        <div className="insight-copy">
          <p className="eyebrow"><span /> Engineering insights</p>
          <h2>Useful thinking for people who build real systems.</h2>
          <p>
            Practical notes on AV documentation, network planning, design judgment, and the project decisions that prevent expensive surprises.
          </p>
          <a className="text-link light" href="/insights">Read engineering insights <ArrowIcon /></a>
        </div>
      </section>

      <section className="contact" id="contact">
        <p className="eyebrow dark"><span /> Start a conversation</p>
        <div className="contact-layout">
          <h2>Have an AV project that needs<br />more engineering capacity?</h2>
          <div>
            <p>
              Tell us what you are working on, where the risk is, and what your team needs to move forward with confidence.
            </p>
            <a className="button button-dark" href="mailto:info@blackmountain.tech?subject=BMT%20Project%20Inquiry">Discuss a project <ArrowIcon /></a>
          </div>
        </div>
      </section>

      <footer>
        <img src="/bmt-logo-graphite.png" alt="Black Mountain Technologies" />
        <p>Commercial AV engineering for integrators.</p>
        <div>
          <a href="mailto:info@blackmountain.tech">info@blackmountain.tech</a>
          <a href="https://www.blackmountain.tech">blackmountain.tech</a>
        </div>
        <span>© 2026 Black Mountain Technologies</span>
      </footer>
    </main>
  );
}
