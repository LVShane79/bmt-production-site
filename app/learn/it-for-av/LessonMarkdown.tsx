import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
export function markdownHeadings(content: string) {
  return [...content.matchAll(/^## (.+)$/gm)].map((match) => ({ text: match[1], id: headingId(match[1]) }));
}
export function LessonMarkdown({ content }: { content: string }) {
  return <div className="lesson-markdown"><Markdown remarkPlugins={[remarkGfm]} components={{
    h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
    table: ({ children }) => <div className="lesson-table-scroll" role="region" aria-label="Lesson comparison table; scroll horizontally if needed" tabIndex={0}><table>{children}</table></div>,
  }}>{content}</Markdown></div>;
}
