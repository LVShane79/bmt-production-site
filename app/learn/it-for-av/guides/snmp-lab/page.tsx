import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../../../components/SiteShell";
import { LessonMarkdown, markdownHeadings } from "../../LessonMarkdown";
import lab from "../../snmp-lab.json";
export const metadata: Metadata = {
  title: "Set up your own SNMP lab",
  description: "An optional hands-on LibreNMS companion guide for read-only AV network monitoring, polling, traps and syslog.",
  alternates: { canonical: "/learn/it-for-av/guides/snmp-lab" },
};
export default function SnmpLabPage() {
  return <main><SiteHeader /><article className="lesson-page"><header className="lesson-hero"><div className="lesson-breadcrumb"><Link href="/learn/it-for-av">IT for AV</Link><span>/</span><span>Companion guide</span></div><p className="article-kicker light-kicker">Optional hands-on lab</p><h1>Set up your own SNMP lab</h1><p>Give your AV network a memory. Start with an isolated lab and read-only monitoring, then apply the lessons through an approved deployment plan.</p></header><div className="lesson-layout"><aside className="lesson-rail"><span>In this guide</span><ol>{markdownHeadings(lab.markdown).map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol><Link href="/learn/it-for-av/snmp-and-syslog-for-av">← Back to Lesson 14: SNMP and syslog</Link></aside><div className="lesson-body"><LessonMarkdown content={lab.markdown} /></div></div></article><SiteFooter /></main>;
}
