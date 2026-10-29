import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/SiteShell";
import { LearnSearch, type SearchLesson } from "./LearnSearch";
import { lessons as itLessons } from "./it-for-av/lessons";

export const metadata: Metadata = {
  title: "Learn — Practical AV Courses",
  description: "Practical, vendor-neutral lessons for commercial AV professionals: IT, audio, video, and control.",
  alternates: { canonical: "/learn" },
};

function lessonText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(lessonText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(lessonText).join(" ");
  return "";
}

const searchLessons: SearchLesson[] = itLessons.map((lesson) => ({
  course: "IT for AV",
  title: lesson.title,
  href: `/learn/it-for-av/${lesson.slug}`,
  text: lessonText(lesson),
}));

const courses = [
  { number: "01", title: "IT for AV", description: "Networking, security, multicast, timing, and practical AV-over-IP engineering.", count: `${itLessons.length} lessons`, href: "/learn/it-for-av", action: "Explore IT for AV" },
  { number: "02", title: "Audio", description: "Sound fundamentals, rooms, microphones, gain structure, and DSP—built from first principles.", count: "Lessons in editorial review", href: "#audio", action: "Audio is next", coming: true },
  { number: "03", title: "Video", description: "Signal paths, display systems, transport, and the practical details behind dependable video.", count: "Coming soon", href: "#video", action: "On the roadmap", coming: true },
  { number: "04", title: "Control", description: "How control systems, interfaces, logic, and integration boundaries fit together.", count: "Coming soon", href: "#control", action: "On the roadmap", coming: true },
];

export default function LearnPage() {
  return <main>
    <SiteHeader />
    <section className="learn-hero">
      <p className="eyebrow"><span /> BMT learning series</p>
      <h1>Learn the systems<br />behind <em>AV.</em></h1>
      <p>Clear, practical lessons for the work that happens before, during, and after an AV system comes alive.</p>
      <a href="#courses">Browse courses ↓</a>
    </section>
    <section className="learn-courses" id="courses" aria-labelledby="courses-title">
      <header><p className="eyebrow dark"><span /> Choose a path</p><h2 id="courses-title">Start where the<br />system starts.</h2></header>
      <div className="learn-course-grid">
        {courses.map((course) => <article className={course.coming ? "learn-course-card is-coming" : "learn-course-card"} id={course.title.toLocaleLowerCase()} key={course.title}>
          <span>{course.number}</span><p>{course.count}</p><h3>{course.title}</h3><p>{course.description}</p>
          {course.coming ? <span className="learn-course-coming">{course.action}</span> : <Link href={course.href}>{course.action} →</Link>}
        </article>)}
      </div>
    </section>
    <LearnSearch lessons={searchLessons} />
    <section className="learn-principles"><p className="eyebrow"><span /> Built for the field</p><div><h2>Useful before<br />the rack is open.</h2><p>Lessons explain the “why,” then connect it to a real commissioning, troubleshooting, or design decision. The material is vendor-neutral and designed to grow with the platform.</p></div></section>
    <SiteFooter />
  </main>;
}
