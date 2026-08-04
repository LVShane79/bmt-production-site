import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../lib/site";
import ResourceHero from "../components/ResourceHero";
import ResponsibilityMatrix from "./ResponsibilityMatrix";

export const metadata: Metadata = {
  title: "AV Scope Responsibility Matrix",
  description: "Assign commercial AV scope responsibilities across the owner, integrator, IT, electrical, architect, and general contractor.",
  alternates: { canonical: "/resources/responsibility-matrix" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "AV Scope Responsibility Matrix",
    description: "Assign system, infrastructure, programming, testing, and turnover responsibilities before gaps become change orders.",
    url: "/resources/responsibility-matrix",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};
export default function ResponsibilityMatrixPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMT AV Scope Responsibility Matrix",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/resources/responsibility-matrix"),
    description: metadata.description,
    isAccessibleForFree: true,
    provider: { "@id": organizationId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return <main><JsonLd data={schema} /><SiteHeader /><ResourceHero number="04" kicker="Coordination tool" title="AV Scope" emphasis="Responsibility Matrix." description="Assign the party responsible for each system, infrastructure, programming, coordination, testing, and turnover requirement before gaps become change orders." /><ResponsibilityMatrix /><SiteFooter /></main>;
}
