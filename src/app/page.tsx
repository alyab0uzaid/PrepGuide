import Link from "next/link";
import { getAllTopics, getAllMathIntros } from "@/lib/content";
import { supabase } from "@/lib/supabase";

const AREA_ORDER = [
  "Algebra",
  "Advanced Math",
  "Problem Solving and Data Analysis",
  "Additional Topics in Math",
]; // must match normalised area names from generate-content.ts AREA_DISPLAY

export default async function HomePage() {
  const topics = getAllTopics();
  const intros = getAllMathIntros();
  const { data: practices } = await supabase.from("qb_practices").select("id");

  const areaCounts: Record<string, number> = {};
  for (const t of topics) {
    if (t.area) areaCounts[t.area] = (areaCounts[t.area] ?? 0) + 1;
  }

  const sections = [
    {
      title: "Topics",
      href: "/topics",
      description: "Lessons, subtopics, and practice materials organized by SAT area.",
      stat: `${topics.length} topics`,
    },
    {
      title: "QB Practice",
      href: "/practice",
      description: "Question bank worksheets — Easy, Medium, and Hard — with answer keys.",
      stat: `${practices?.length ?? 0} practice sets`,
    },
    {
      title: "Math Intros",
      href: "/math-intros",
      description: "Strategy guides including how to use Desmos effectively.",
      stat: `${intros.length} guides`,
    },
  ];

  const orderedAreas = AREA_ORDER.filter((a) => areaCounts[a]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PrepGuide</h1>
        <p className="text-gray-500">SAT math prep. Pick a section to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-400 transition-colors"
          >
            <h2 className="font-semibold text-base mb-1">{s.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{s.description}</p>
            <span className="text-xs text-gray-400">{s.stat}</span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Browse by Area
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {orderedAreas.map((area) => (
            <Link
              key={area}
              href={`/topics?area=${encodeURIComponent(area)}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors"
            >
              <span className="text-sm font-medium">{area}</span>
              <span className="text-xs text-gray-400">{areaCounts[area]} topics</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
