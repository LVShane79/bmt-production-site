import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, SiteFooter, SiteHeader } from "../../components/SiteShell";
import { LessonGraphic } from "./LessonGraphic";
import { lessons } from "./lessons";

export const metadata: Metadata = {
  title: "IT for AV — Practical Networking Course",
  description: "A progressive, plain-English networking and security course built for commercial AV professionals by Black Mountain Technologies.",
  alternates: { canonical: "/learn/it-for-av" },
  openGraph: {
    title: "IT for AV — Practical Networking Course",
    description: "Learn the IT underneath modern commercial AV, from Ethernet and IP addressing through VLANs, multicast, security, and AV-over-IP.",
    url: "/learn/it-for-av",
    siteName: "Black Mountain Technologies",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Black Mountain Technologies — IT for AV" }],
  },
};

const graphicKinds = ["layers", "layers", "physical", "switch", "subnet", "services", "vlan", "route", "multicast", "qos", "wifi", "security", "identity", "monitoring", "security", "route", "security", "usb", "multicast"] as const;

export default function CoursePage() {
  return (
    <main>
      <SiteHeader />
      <section className="course-hero">
        <div className="course-hero-copy">
          <p className="eyebrow"><span /> BMT learning series · Course 01</p>
          <h1>IT for <em>AV.</em></h1>
          <p>A progressive networking and security course for commercial AV people who know the equipment—and want the missing IT details filled in properly.</p>
          <div className="course-stats">
            <span><strong>{lessons.length}</strong> lessons available</span>
            <span><strong>8–16</strong> minutes each</span>
            <span><strong>Free</strong> no sign-in</span>
          </div>
        </div>
        <LessonGraphic kind="vlan" figure="00" />
      </section>

      <section className="course-intro">
        <div>
          <p className="eyebrow dark"><span /> Why this exists</p>
          <h2>AV runs on networks.<br />That makes networking part of the job.</h2>
        </div>
        <div>
          <p>This course starts at the physical cable and works upward—without assuming that recognizing an acronym means understanding what it actually does.</p>
          <p>Each lesson connects first principles to systems AV engineers encounter in the field: Dante, Q-SYS, control processors, cameras, wireless presentation, AV-over-IP, and the switches underneath all of it.</p>
        </div>
      </section>

      <section className="course-roadmap" aria-labelledby="course-lessons">
        <header>
          <p className="eyebrow dark"><span /> Current path</p>
          <h2 id="course-lessons">Start at the top.<br />Build the whole model.</h2>
        </header>
        <div className="lesson-card-grid">
          {lessons.map((lesson, index) => (
            <article className="lesson-card" key={lesson.slug}>
              <LessonGraphic kind={graphicKinds[index]} figure={String(lesson.number).padStart(2, "0")} compact />
              <div className="lesson-card-copy">
                <p><span>Lesson {String(lesson.number).padStart(2, "0")}</span><i />{lesson.readTime}</p>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <Link href={`/learn/it-for-av/${lesson.slug}`}>Start lesson <ArrowIcon /></Link>
              </div>
            </article>
          ))}

        </div>
      </section>

      <section className="course-coming">
        <p className="eyebrow"><span /> Where we are headed</p>
        <div>
          <h2>From packets to production.</h2>
          <p>Continue into practical monitoring, certificates, remote access, USB and AV-over-IP architecture. Future lessons explore individual media platforms and complete AV network commissioning.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
