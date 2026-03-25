import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { QBPractice } from "@/lib/types";

export default async function PracticePage() {
  const { data: practices } = await supabase
    .from("qb_practices")
    .select("*")
    .order("order_num", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">QB Practice</h1>
        <p className="text-sm text-gray-500">
          SAT-style question bank worksheets organized by topic. Each set includes Easy, Medium, and Hard levels with answer keys.
        </p>
      </div>

      <div className="space-y-2">
        {(practices ?? []).map((p: QBPractice, i: number) => {
          const levels = [
            { label: "Easy", has: !!p.easy },
            { label: "Medium", has: !!p.medium },
            { label: "Hard", has: !!p.hard },
          ].filter((l) => l.has);

          return (
            <Link
              key={p.id}
              href={`/practice/${p.slug}`}
              className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                <span className="font-medium">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {levels.map(({ label }) => (
                  <span
                    key={label}
                    className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500"
                  >
                    {label}
                  </span>
                ))}
                <span className="text-gray-300 text-lg leading-none">›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
