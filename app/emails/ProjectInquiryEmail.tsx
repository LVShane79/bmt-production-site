import type { CSSProperties } from "react";

export type ProjectInquiry = {
  inquiryId: string;
  submittedAt: string;
  name: string;
  email: string;
  company: string;
  location: string;
  service: string;
  stage: string;
  timing: string;
  details: string;
};

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
  maxWidth: "680px",
  padding: "36px",
};

const label: CSSProperties = {
  color: "#596568",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  margin: "0 0 6px",
  textTransform: "uppercase",
};

const value: CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.55,
  margin: "0 0 22px",
};

export function ProjectInquiryEmail({ inquiry }: { inquiry: ProjectInquiry }) {
  const submitted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date(inquiry.submittedAt));

  return (
    <div style={page}>
      <div style={card}>
        <p style={{ ...label, color: "#007f7b" }}>Project inquiry / {inquiry.inquiryId}</p>
        <h1 style={{ fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em", margin: "10px 0 8px" }}>
          New BMT project inquiry
        </h1>
        <p style={{ color: "#596568", fontSize: "14px", lineHeight: 1.6, margin: "0 0 32px" }}>
          Submitted {submitted}. Reply directly to this message to respond to {inquiry.name}.
        </p>

        <table cellPadding="0" cellSpacing="0" role="presentation" style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: "24px", verticalAlign: "top", width: "50%" }}>
                <p style={label}>Name</p>
                <p style={value}>{inquiry.name}</p>
              </td>
              <td style={{ verticalAlign: "top", width: "50%" }}>
                <p style={label}>Work email</p>
                <p style={value}><a href={`mailto:${inquiry.email}`} style={{ color: "#007f7b" }}>{inquiry.email}</a></p>
              </td>
            </tr>
            <tr>
              <td style={{ paddingRight: "24px", verticalAlign: "top" }}>
                <p style={label}>Company</p>
                <p style={value}>{inquiry.company || "Not provided"}</p>
              </td>
              <td style={{ verticalAlign: "top" }}>
                <p style={label}>Project location</p>
                <p style={value}>{inquiry.location || "Not provided"}</p>
              </td>
            </tr>
            <tr>
              <td style={{ paddingRight: "24px", verticalAlign: "top" }}>
                <p style={label}>Help needed</p>
                <p style={value}>{inquiry.service}</p>
              </td>
              <td style={{ verticalAlign: "top" }}>
                <p style={label}>Project stage</p>
                <p style={value}>{inquiry.stage}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={label}>Desired timing</p>
        <p style={value}>{inquiry.timing || "Not provided"}</p>

        <div style={{ borderTop: "1px solid #d4dcda", marginTop: "10px", paddingTop: "26px" }}>
          <p style={label}>Project details</p>
          <p style={{ ...value, whiteSpace: "pre-wrap" }}>{inquiry.details}</p>
        </div>

        <p style={{ borderTop: "1px solid #d4dcda", color: "#7a8587", fontSize: "11px", lineHeight: 1.6, margin: "28px 0 0", paddingTop: "18px" }}>
          Black Mountain Technologies · blackmountain.tech · Inquiry {inquiry.inquiryId}
        </p>
      </div>
    </div>
  );
}
