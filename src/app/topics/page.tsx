import Link from "next/link";
import { supabase } from "@/lib/supabase";
export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, slug, main_area, order_num, number_subtopics, video, practice_problems_sheet")
    .order("order_num", { ascending: true });

  const allAreas = Array.from(new Set((topics ?? []).map((t) => t.main_area).filter(Boolean))) as string[];

  const filtered = area
    ? (topics ?? []).filter((t) => t.main_area === area)
    : (topics ?? []);

  // Group by main_area when no filter active
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped: Record<string, any[]> = {};
  for (const t of filtered) {
    const key = t.main_area ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Topics</h1>
        <p className="text-sm text-gray-500">Select a topic to view its lesson, subtopics, and practice materials.</p>
      </div>

      {/* Area filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/topics"
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            !area ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 hover:border-gray-400"
          }`}
        >
          All
        </Link>
        {allAreas.map((a) => (
          <Link
            key={a}
            href={`/topics?area=${encodeURIComponent(a)}`}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              area === a ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 hover:border-gray-400"
            }`}
          >
            {a}
          </Link>
        ))}
      </div>

      {/* Topic groups */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([areaName, areaTopics]) => (
          <div key={areaName}>
            {!area && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{areaName}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {areaTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="flex items-start justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors"
                >
                  <div>
                    <div className="font-medium">{topic.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {topic.number_subtopics ? `${topic.number_subtopics} subtopics` : ""}
                      {topic.number_subtopics && topic.video ? " · " : ""}
                      {topic.video ? "Video" : ""}
                      {(topic.number_subtopics || topic.video) && topic.practice_problems_sheet ? " · " : ""}
                      {topic.practice_problems_sheet ? "Practice" : ""}
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg leading-none mt-0.5">›</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
