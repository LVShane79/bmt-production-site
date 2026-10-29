"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

export type SearchLesson = {
  course: string;
  title: string;
  href: string;
  text: string;
};

function excerpt(text: string, query: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const position = normalized.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (position < 0) return normalized.slice(0, 185) + (normalized.length > 185 ? "…" : "");
  const start = Math.max(0, position - 72);
  const end = Math.min(normalized.length, position + query.length + 118);
  return (start > 0 ? "…" : "") + normalized.slice(start, end) + (end < normalized.length ? "…" : "");
}

function normalizedSearchText(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function LearnSearch({ lessons }: { lessons: SearchLesson[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const results = useMemo(() => {
    const term = normalizedSearchText(query);
    if (!term) return [];
    return lessons.filter((lesson) => normalizedSearchText(`${lesson.course} ${lesson.title} ${lesson.text}`).includes(term));
  }, [lessons, query]);

  return (
    <section className="learn-search" aria-labelledby="learn-search-title">
      <div>
        <p className="eyebrow dark"><span /> Search every published lesson</p>
        <h2 id="learn-search-title">Find the detail<br />you need.</h2>
        <p>Search lesson titles, headings, topics, and full visible lesson text. Try “Dante,” “VLAN,” or “microphone.”</p>
      </div>
      <div className="learn-search-panel">
        <label htmlFor={inputId}>Search Learn</label>
        <input id={inputId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every published lesson" />
        {!query.trim() ? <p className="learn-search-note">Enter a term to search {lessons.length} published lessons.</p> : results.length === 0 ? <p className="learn-search-note" role="status">No published lessons mention “{query.trim()}”. Try a broader term.</p> : <div className="learn-search-results" aria-live="polite">
          <p>{results.length} {results.length === 1 ? "lesson" : "lessons"} found</p>
          <ul>
            {results.map((lesson) => <li key={lesson.href}>
              <span>{lesson.course}</span>
              <Link href={lesson.href}>{lesson.title}</Link>
              <p>{excerpt(lesson.text, query.trim())}</p>
            </li>)}
          </ul>
        </div>}
      </div>
    </section>
  );
}
