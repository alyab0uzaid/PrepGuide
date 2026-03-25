import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function MathIntrosPage() {
  const { data: intros } = await supabase
    .from("math_intros")
    .select("id, name, slug, order_num, main_area, video, practice_problems_sheet")
    .order("order_num", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Math Intros</h1>
        <p className="text-sm text-gray-500">
          Strategy guides and introductory lessons — including how to use Desmos effectively on the SAT.
        </p>
      </div>

      <div className="space-y-2">
        {(intros ?? []).map((intro, i: number) => (
          <Link
            key={intro.id}
            href={`/math-intros/${intro.slug}`}
            className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
              <div>
                <div className="font-medium">{intro.name}</div>
                {intro.main_area && (
                  <div className="text-xs text-gray-400 mt-0.5">{intro.main_area}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {intro.video && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">Video</span>}
              {intro.practice_problems_sheet && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">Practice</span>
              )}
              <span className="text-gray-300 text-lg leading-none">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
