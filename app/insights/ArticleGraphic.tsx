import Image from "next/image";

type GraphicProps = {
  slug: string;
  index?: number;
  variant?: "card" | "hero";
};

function DocumentationGraphic() {
  return (
    <div className="graphic-subject documentation-subject">
      <div className="doc-sheet sheet-back"><span>AV-201</span></div>
      <div className="doc-sheet sheet-front">
        <span>AV-401</span>
        <div className="rack-outline"><i /><i /><i /><i /><i /></div>
        <div className="signal-run run-a" />
        <div className="signal-run run-b" />
        <div className="doc-node doc-node-a" />
        <div className="doc-node doc-node-b" />
      </div>
      <div className="risk-callout"><strong>?</strong><span>FIELD<br />DECISION</span></div>
      <div className="graphic-leader documentation-leader" />
    </div>
  );
}

function StandardsGraphic() {
  return (
    <div className="graphic-subject standards-subject">
      <div className="standard-column proven-column">
        <span>PROVEN</span>
        <div className="module"><i /><i /><i /><i /></div>
        <div className="module"><i /><i /><i /></div>
        <small>STANDARD 04</small>
      </div>
      <div className="decision-axis"><i /><strong>vs.</strong><i /></div>
      <div className="standard-column evaluate-column">
        <span>EVALUATE</span>
        <div className="module new-module"><i /><i /><i /><i /></div>
        <div className="module new-module"><i /><i /><i /></div>
        <small>OPTION 07</small>
      </div>
      <div className="evidence-line"><span>EVIDENCE</span><i /></div>
    </div>
  );
}

function ListeningGraphic() {
  return (
    <div className="graphic-subject listening-subject">
      <div className="priority-rings"><i /><i /><i /></div>
      <div className="priority-node must-node"><strong>01</strong><span>MUST</span></div>
      <div className="priority-node should-node"><strong>02</strong><span>SHOULD</span></div>
      <div className="priority-node could-node"><strong>03</strong><span>COULD</span></div>
      <div className="budget-axis"><span>NEED</span><i /><span>IMPACT</span><i /><span>BUDGET</span></div>
      <div className="decision-zone">ALIGN</div>
    </div>
  );
}

function FieldNotesGraphic() {
  return (
    <div className="graphic-subject field-subject">
      <div className="field-plan">
        <span>FIELD CONDITION</span>
        <div className="field-room room-one" />
        <div className="field-room room-two" />
        <div className="field-door" />
        <div className="dimension dimension-x">12&apos;-6&quot;</div>
        <div className="dimension dimension-y">8&apos;-0&quot;</div>
      </div>
      <div className="markup-cloud"><strong>LESSON</strong><span>VERIFY BEFORE RELEASE</span></div>
      <div className="markup-arrow" />
      <div className="field-check"><i>✓</i><span>CAPTURED<br />IN STANDARD</span></div>
    </div>
  );
}

export function ArticleGraphic({ slug, index = 1, variant = "card" }: GraphicProps) {
  const articleImage = slug === "ndi-101-video-over-ip"
    ? {
        src: "/insights/ndi-101-networked-video.jpg",
        alt: "Professional PTZ camera distributing NDI video through an IP network to production displays",
      }
    : slug === "ipmx-101-open-av-over-ip-standard"
      ? {
          src: "/insights/ipmx-101-open-av-over-ip.jpg",
          alt: "Professional AV sources and displays interconnected through an IPMX media network",
        }
      : null;

  if (articleImage) {
    return (
      <div className={`editorial-graphic editorial-${variant} graphic-${slug}`}>
        <Image
          className="ndi-cover-image"
          src={articleImage.src}
          alt={articleImage.alt}
          fill
          priority={variant === "hero"}
          sizes={variant === "hero" ? "(max-width: 760px) 100vw, 55vw" : "(max-width: 980px) 100vw, 33vw"}
        />
      </div>
    );
  }

  let subject = <DocumentationGraphic />;
  let code = "DOCUMENTATION / RISK";

  if (slug === "standardization-vs-innovation") {
    subject = <StandardsGraphic />;
    code = "STANDARDS / JUDGMENT";
  } else if (slug === "listening-first-technology-budgets") {
    subject = <ListeningGraphic />;
    code = "DISCOVERY / BUDGET";
  } else if (slug === "field-notes-from-real-projects") {
    subject = <FieldNotesGraphic />;
    code = "FIELD NOTES / LESSONS";
  }

  return (
    <div className={`editorial-graphic editorial-${variant} graphic-${slug}`} aria-hidden="true">
      <div className="editorial-grid" />
      <div className="graphic-coordinate coord-top">01&nbsp;&nbsp;&nbsp;02&nbsp;&nbsp;&nbsp;03&nbsp;&nbsp;&nbsp;04</div>
      <div className="graphic-coordinate coord-side">A<br />B<br />C</div>
      {subject}
      <div className="graphic-titleblock">
        <span>FIG. {String(index).padStart(2, "0")}</span>
        <strong>{code}</strong>
        <i>BMT / INSIGHTS</i>
      </div>
    </div>
  );
}
