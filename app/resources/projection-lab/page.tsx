import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { absoluteUrl, organizationId } from "../../lib/site";
import ProjectorCalculator from "./ProjectorCalculator";
import "./projection-lab.css";

export const metadata: Metadata = {
  title: "Projector Throw, Lens Shift & Brightness Calculator",
  description:
    "Calculate projector screen geometry, throw distance, lens range, lens shift, and preliminary image brightness for commercial AV design.",
  alternates: { canonical: "/resources/projection-lab" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "BMT Projection Lab",
    description:
      "A practical projection throw, lens shift, and screen-brightness calculator for commercial AV design.",
    url: "/resources/projection-lab",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BMT Projection Lab" }],
  },
};

export default function ProjectionLabPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMT Projection Lab",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description: metadata.description,
    url: absoluteUrl("/resources/projection-lab"),
    isAccessibleForFree: true,
    provider: { "@id": organizationId },
  };

  return (
    <>
      <JsonLd data={schema} />
      <ProjectorCalculator />
    </>
  );
}
