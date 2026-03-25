import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function PracticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: practice } = await supabase
    .from("qb_practices")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!practice) notFound();

  const levels = [
    {
      label: "Easy",
      worksheet: practice.easy,
      key: practice.easy_key,
      description: "Foundational problems to build confidence with the core concept.",
    },
    {
      label: "Medium",
      worksheet: practice.medium,
      key: practice.medium_key,
      description: "Intermediate problems that reflect typical SAT difficulty.",
    },
    {
      label: "Hard",
      worksheet: practice.hard,
      key: practice.hard_key,
      description: "Challenging problems aimed at top scorers.",
    },
  ].filter((l) => l.worksheet || l.key);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        <Link href="/practice" className="hover:text-gray-600">QB Practice</Link>
        {" / "}
        <span className="text-gray-700">{practice.name}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">{practice.name}</h1>

      <div className="space-y-4">
        {levels.map(({ label, worksheet, key, description }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="font-semibold text-base">{label}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {worksheet && (
                <a
                  href={worksheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Download Worksheet
                </a>
              )}
              {key && (
                <a
                  href={key}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded hover:border-gray-400 transition-colors"
                >
                  Answer Key
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {levels.length === 0 && (
        <p className="text-gray-500 text-sm">No worksheets available yet.</p>
      )}
    </div>
  );
}
