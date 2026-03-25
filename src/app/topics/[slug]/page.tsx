import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Subtopic } from "@/lib/types";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [{ data: topic }, { data: subtopics }] = await Promise.all([
    supabase.from("topics").select("*").eq("slug", slug).single(),
    supabase.from("subtopics").select("*").eq("parent_topic_slug", slug).order("name"),
  ]);

  if (!topic) notFound();

  const practiceLevels = [
    { label: "Easy", worksheet: topic.easy, key: null },
    { label: "Medium", worksheet: topic.medium, key: null },
    { label: "Hard", worksheet: topic.hard, key: null },
  ].filter((p) => p.worksheet);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        <Link href="/topics" className="hover:text-gray-600">Topics</Link>
        {topic.main_area && (
          <>
            {" / "}
            <Link href={`/topics?area=${encodeURIComponent(topic.main_area)}`} className="hover:text-gray-600">
              {topic.main_area}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-gray-700">{topic.name}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">{topic.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Lesson */}
          {topic.lesson && (
            <section>
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">Lesson</h2>
              <div
                className="prose prose-sm max-w-none text-gray-700 [&_iframe]:w-full [&_iframe]:rounded [&_iframe]:border [&_iframe]:border-gray-200"
                dangerouslySetInnerHTML={{ __html: topic.lesson }}
              />
            </section>
          )}

          {/* Subtopics */}
          {subtopics && subtopics.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">Subtopics</h2>
              <ul className="space-y-1">
                {subtopics.map((st: Subtopic) => (
                  <li key={st.id} className="flex items-center gap-2 text-sm px-3 py-2 bg-white border border-gray-100 rounded">
                    <span className="text-gray-400">•</span>
                    {st.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Video */}
          {topic.video && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Video</h3>
              <a
                href={topic.video}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline break-all"
              >
                Watch Video →
              </a>
            </section>
          )}

          {/* Practice Materials */}
          {(practiceLevels.length > 0 || topic.practice_problems_sheet) && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Practice Materials</h3>
              <div className="space-y-2">
                {practiceLevels.map(({ label, worksheet }) => (
                  <a
                    key={label}
                    href={worksheet!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>{label}</span>
                    <span className="text-gray-400">PDF →</span>
                  </a>
                ))}
                {topic.practice_problems_sheet && (
                  <a
                    href={topic.practice_problems_sheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>Practice Problems</span>
                    <span className="text-gray-400">PDF →</span>
                  </a>
                )}
                {topic.answer_key_sheet && (
                  <a
                    href={topic.answer_key_sheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>Answer Key</span>
                    <span className="text-gray-400">PDF →</span>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Meta */}
          {topic.main_area && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Area</h3>
              <Link
                href={`/topics?area=${encodeURIComponent(topic.main_area)}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {topic.main_area}
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
