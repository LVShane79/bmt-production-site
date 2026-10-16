import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { absoluteUrl, organizationId } from "../../lib/site";
import SpeakerCalculator from "./SpeakerCalculator";
import "./speaker-lab.css";

export const metadata: Metadata = {
  title: "Speaker Coverage, SPL & Amplifier Calculator",
  description: "Visual speaker coverage, SPL, amplifier loading, and 70.7 V tap calculator for preliminary AV system design.",
  alternates: { canonical: "/resources/speaker-lab" },
  openGraph: { title: "BMT Speaker Lab", url: "/resources/speaker-lab", images: [{ url: "/og.png", width: 1200, height: 630 }] },
};

export default function SpeakerLabPage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "BMT Speaker Lab", applicationCategory: "DesignApplication", operatingSystem: "Web", description: metadata.description, url: absoluteUrl("/resources/speaker-lab"), isAccessibleForFree: true, provider: { "@id": organizationId } }} />
    <SpeakerCalculator />
  </>;
}
