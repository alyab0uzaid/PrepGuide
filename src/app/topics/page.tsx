import Link from "next/link";
import { getAllTopics, type TopicMeta } from "@/lib/content";

const AREA_ORDER = [
  "Algebra",
  "Advanced Math",
  "Problem Solving and Data Analysis",
  "Additional Topics in Math",
];

export default function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  // searchParams is a Promise in Next.js 15 but we read it synchronously via the prop
  const topics = getAllTopics();

  const allAreas = AREA_ORDER.filter((a) => topics.some((t) => t.area === a));

  const grouped: Record<string, TopicMeta[]> = {};
  for (const topic of topics) {
    const key = topic.area ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(topic);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Topics</h1>
        <p className="text-sm text-gray-500">
          Select a topic to study its lesson, subtopics, and practice materials.
        </p>
      </div>

      <div className="space-y-10">
        {allAreas.map((area) => {
          const areaTopics = grouped[area] ?? [];
          if (!areaTopics.length) return null;
          return (
            <div key={area}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {area}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {areaTopics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-sm">{topic.title}</div>
                      {topic.subtopics?.length > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {topic.subtopics.slice(0, 3).join(" · ")}
                          {topic.subtopics.length > 3 ? ` +${topic.subtopics.length - 3} more` : ""}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-300 group-hover:text-gray-500 text-lg leading-none flex-shrink-0">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
