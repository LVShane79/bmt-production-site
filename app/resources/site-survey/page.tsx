import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../lib/site";
import ChecklistTool, { ChecklistSection } from "../components/ChecklistTool";
import ResourceHero from "../components/ResourceHero";

export const metadata: Metadata = {
  title: "AV Site Survey Checklist",
  description: "A field-ready commercial AV site survey checklist from Black Mountain Technologies.",
  alternates: { canonical: "/resources/site-survey" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "AV Site Survey Checklist",
    description: "Document spaces, existing AV systems, infrastructure, access, and coordination conditions in the field.",
    url: "/resources/site-survey",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

const sections: ChecklistSection[] = [
  { title: "Room and use", description: "Document the physical space and how it operates.", items: [
    "Confirm room dimensions, ceiling height, and finished floor elevation",
    "Identify room capacity, furniture layouts, and primary use cases",
    "Record viewing distances, sightline obstructions, and mounting surfaces",
    "Document ambient light, window orientation, and lighting zones",
    "Note acoustic conditions, divisible partitions, and adjacent noise sources",
  ]},
  { title: "Existing AV systems", description: "Understand what stays, what goes, and what may be reused.", items: [
    "Photograph and identify existing displays, projectors, loudspeakers, microphones, and cameras",
    "Record equipment manufacturer, model, condition, and ownership status",
    "Test current user workflows and document known complaints",
    "Identify existing control, conferencing, DSP, and signal-distribution platforms",
    "Confirm demolition, reuse, relocation, and owner-furnished equipment expectations",
  ]},
  { title: "Infrastructure", description: "Verify the pathways and services the system will depend on.", items: [
    "Locate racks, closets, floor boxes, junction boxes, sleeves, and cable pathways",
    "Confirm available rack space, ventilation, grounding, access, and service clearances",
    "Document branch circuits, receptacles, emergency power, and UPS requirements",
    "Identify network switches, ports, PoE capacity, VLAN ownership, and demarcation points",
    "Verify cable distances and pathway capacity between endpoints and head-end locations",
  ]},
  { title: "Coordination and access", description: "Capture conditions that affect installation and delivery.", items: [
    "Identify ceiling type, above-ceiling access, plenum conditions, and structural attachment points",
    "Document wall construction, blocking, backing, and finish restrictions",
    "Confirm accessibility requirements and control-device mounting constraints",
    "Record site access, working hours, security, badging, parking, and material-staging rules",
    "Identify hazardous materials, occupied-space restrictions, and special permits",
  ]},
  { title: "Survey closeout", description: "Leave with enough evidence to support the next decision.", items: [
    "Capture wide, detail, rack, ceiling, pathway, wall, and infrastructure photographs",
    "Mark photo locations and device positions on a plan or sketch",
    "List unanswered questions, required destructive investigation, and follow-up owners",
    "Confirm discrepancies between field conditions and available drawings",
    "Review critical findings with the site contact before leaving",
  ]},
];

export default function SiteSurveyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMT AV Site Survey Checklist",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/resources/site-survey"),
    description: metadata.description,
    isAccessibleForFree: true,
    provider: { "@id": organizationId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return <main><JsonLd data={schema} /><SiteHeader /><ResourceHero number="03" kicker="Field checklist" title="AV Site Survey" emphasis="Checklist." description="A structured field workflow for documenting spaces, existing systems, infrastructure, access, and coordination conditions before design decisions are locked." /><ChecklistTool storageKey="bmt-site-survey" title="Site survey" sections={sections} allowMultipleAreas /><SiteFooter /></main>;
}
