import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const [{ data: topics }, { data: practices }, { data: intros }] = await Promise.all([
    supabase.from("topics").select("id, main_area").neq("main_area", null),
    supabase.from("qb_practices").select("id"),
    supabase.from("math_intros").select("id"),
  ]);

  // Count topics per main area
  const areaCounts: Record<string, number> = {};
  for (const t of topics ?? []) {
    if (t.main_area) areaCounts[t.main_area] = (areaCounts[t.main_area] ?? 0) + 1;
  }

  const sections = [
    {
      title: "Topics",
      href: "/topics",
      description: "Study math topics grouped by subject area — lessons, subtopics, and practice materials.",
      stat: `${topics?.length ?? 0} topics across ${Object.keys(areaCounts).length} areas`,
    },
    {
      title: "QB Practice",
      href: "/practice",
      description: "Download Easy, Medium, and Hard SAT-style question bank worksheets with answer keys.",
      stat: `${practices?.length ?? 0} practice sets`,
    },
    {
      title: "Math Intros",
      href: "/math-intros",
      description: "Introductory guides and strategy lessons, including how to optimize Desmos.",
      stat: `${intros?.length ?? 0} guides`,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PrepGuide</h1>
        <p className="text-gray-600">Your SAT math prep platform. Pick a section to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-400 transition-colors"
          >
            <h2 className="font-semibold text-lg mb-1">{s.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{s.description}</p>
            <span className="text-xs text-gray-400">{s.stat}</span>
          </Link>
        ))}
      </div>

      {Object.keys(areaCounts).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Topics by Area</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(areaCounts).map(([area, count]) => (
              <Link
                key={area}
                href={`/topics?area=${encodeURIComponent(area)}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-sm hover:border-gray-400 transition-colors"
              >
                {area}
                <span className="text-xs text-gray-400">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
