import type { CSSProperties } from "react";

const page: CSSProperties = {
  backgroundColor: "#eef1ed",
  color: "#182022",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "32px 16px",
};

const card: CSSProperties = {
  backgroundColor: "#f8f9f6",
  border: "1px solid #d4dcda",
  margin: "0 auto",
  maxWidth: "640px",
  padding: "38px",
};

export function ProjectAcknowledgementEmail({
  name,
  inquiryId,
}: {
  name: string;
  inquiryId: string;
}) {
  return (
    <div style={page}>
      <div style={card}>
        <p style={{ color: "#007f7b", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Inquiry received / {inquiryId}
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.035em", margin: "14px 0 20px" }}>
          Thanks, {name}. We have it.
        </h1>
        <p style={{ color: "#445154", fontSize: "16px", lineHeight: 1.7, margin: "0 0 20px" }}>
          Black Mountain Technologies received your project inquiry. We will review the project stage, requested support, and timing before replying from <strong>info@blackmountain.tech</strong>.
        </p>
        <p style={{ color: "#445154", fontSize: "16px", lineHeight: 1.7, margin: "0 0 28px" }}>
          If drawings, scopes, or other project documents would help explain the work, you can reply to this email and attach them.
        </p>
        <a
          href="https://blackmountain.tech/resources"
          style={{ backgroundColor: "#182022", color: "#f5f6f2", display: "inline-block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "14px 18px", textDecoration: "none", textTransform: "uppercase" }}
        >
          Explore BMT resources
        </a>
        <p style={{ borderTop: "1px solid #d4dcda", color: "#7a8587", fontSize: "11px", lineHeight: 1.6, margin: "34px 0 0", paddingTop: "18px" }}>
          Black Mountain Technologies · Commercial AV engineering support for integrators across the United States.
        </p>
      </div>
    </div>
  );
}
