import type { Metadata } from "next";
import { JsonLd } from "../../components/JsonLd";
import { SiteFooter, SiteHeader } from "../../components/SiteShell";
import { absoluteUrl, organizationId } from "../../lib/site";
import ChecklistTool, { ChecklistSection } from "../components/ChecklistTool";
import ResourceHero from "../components/ResourceHero";

export const metadata: Metadata = {
  title: "AV Commissioning & Acceptance Checklist",
  description:
    "A practical commercial AV commissioning and acceptance checklist from Black Mountain Technologies.",
  alternates: { canonical: "/resources/commissioning" },
  openGraph: {
    type: "website",
    siteName: "Black Mountain Technologies",
    title: "AV Commissioning & Acceptance Checklist",
    description:
      "A practical verification sequence for AV installation quality, system performance, user workflows, and project turnover.",
    url: "/resources/commissioning",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — engineering better AV projects" }],
  },
};

const sections: ChecklistSection[] = [
  {
    title: "Installation readiness",
    description: "Confirm the system is complete enough to begin meaningful testing.",
    items: [
      "Verify equipment is installed, labeled, secured, ventilated, and serviceable",
      "Confirm cabling is terminated, tested, dressed, and labeled at both ends",
      "Compare installed equipment and topology with approved submittals and drawings",
      "Verify power, grounding, network connectivity, and rack thermal conditions",
      "Confirm device firmware and software versions are approved and documented",
      "Record open installation deficiencies before functional testing begins",
    ],
  },
  {
    title: "Audio performance",
    description: "Test routing, gain structure, intelligibility, processing, and coverage.",
    items: [
      "Verify every audio source and destination route",
      "Set gain structure and confirm operation without clipping or audible noise",
      "Test microphones, automixing, gating, priority, and mute behavior",
      "Verify acoustic echo cancellation and far-end reference routing",
      "Confirm loudspeaker polarity, zoning, tap settings, and level consistency",
      "Evaluate speech intelligibility and program-audio quality in occupied areas",
      "Test assisted-listening and accessibility audio systems",
      "Store final DSP files, presets, and configuration backups",
    ],
  },
  {
    title: "Video and presentation",
    description: "Validate every signal path, format, display mode, and presentation workflow.",
    items: [
      "Test every wired and wireless presentation input",
      "Verify supported resolutions, aspect ratios, scaling, and content protection",
      "Confirm display and projector power, input, blanking, and source behavior",
      "Verify image alignment, focus, geometry, color, and brightness",
      "Test video distribution, switching, routing, and failover behavior",
      "Confirm digital signage, confidence monitors, and overflow displays",
    ],
  },
  {
    title: "Conferencing and collaboration",
    description: "Test the complete meeting experience from both ends of a real call.",
    items: [
      "Place calls using every supported conferencing platform",
      "Verify near-end and far-end audio quality",
      "Test camera framing, presets, tracking, privacy, and image quality",
      "Verify content sharing, confidence views, and dual-screen behavior",
      "Test mute synchronization, volume, call, privacy, and camera controls",
      "Confirm calendar, room scheduling, directory, and join-button workflows",
      "Test BYOD and guest-device workflows",
      "Verify USB extension, peripheral switching, and host handoff behavior",
    ],
  },
  {
    title: "Control and automation",
    description: "Confirm predictable operation across normal, unusual, and recovery conditions.",
    items: [
      "Test every control page, button, slider, preset, and feedback state",
      "Verify room-combine, divisible-space, and partition-sensor behavior",
      "Test startup, shutdown, timeout, occupancy, and after-hours modes",
      "Confirm lighting, shades, HVAC, security, and other integrated-system controls",
      "Test invalid selections, unavailable devices, and user-facing error messages",
      "Power-cycle the system and verify automatic recovery in the intended state",
      "Store final control code, user-interface files, and configuration backups",
    ],
  },
  {
    title: "Network and monitoring",
    description: "Verify the AV network configuration, capacity, security, and support path.",
    items: [
      "Confirm device names, IP addresses, VLANs, gateways, DNS, and time synchronization",
      "Verify QoS, multicast, IGMP, uplinks, and switch configuration",
      "Confirm PoE availability, consumption, and reserve capacity",
      "Test AV-over-IP routing, subscriptions, latency, and stream recovery",
      "Verify monitoring, alerting, logging, and remote-support access",
      "Confirm credential ownership, password policy, and secure handoff",
      "Export final switch, endpoint, and management-platform configurations",
    ],
  },
  {
    title: "Acceptance and turnover",
    description: "Close the gap between a working system and an accepted project.",
    items: [
      "Complete representative end-to-end user scenarios in every room type",
      "Verify accessibility and code-required functions",
      "Complete end-user and support-team training",
      "Deliver as-built drawings, source files, configurations, licenses, and test records",
      "Deliver warranties, manuals, spare parts, and service-contact information",
      "Document remaining punch-list items, owners, priorities, and due dates",
      "Confirm client acceptance criteria have been met or record specific exceptions",
      "Obtain stakeholder acceptance or document the required path to acceptance",
    ],
  },
];

export default function CommissioningPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMT AV Commissioning & Acceptance Checklist",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/resources/commissioning"),
    description: metadata.description,
    isAccessibleForFree: true,
    provider: { "@id": organizationId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main>
      <JsonLd data={schema} />
      <SiteHeader />
      <ResourceHero
        number="05"
        kicker="Acceptance checklist"
        title="Commissioning &"
        emphasis="Acceptance."
        description="A practical verification sequence for installation quality, system performance, user workflows, documentation, training, and project turnover."
      />
      <ChecklistTool storageKey="bmt-commissioning" title="Commissioning" sections={sections} />
      <SiteFooter />
    </main>
  );
}
