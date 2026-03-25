import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function MathIntroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: intro } = await supabase
    .from("math_intros")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!intro) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        <Link href="/math-intros" className="hover:text-gray-600">Math Intros</Link>
        {" / "}
        <span className="text-gray-700">{intro.name}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">{intro.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main lesson content */}
        <div className="lg:col-span-2">
          {intro.lesson ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 [&_iframe]:w-full [&_iframe]:rounded [&_iframe]:border [&_iframe]:border-gray-200"
              dangerouslySetInnerHTML={{ __html: intro.lesson }}
            />
          ) : (
            <p className="text-gray-500 text-sm">No lesson content available.</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {intro.video && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Video</h3>
              <a
                href={intro.video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Watch Video →
              </a>
            </section>
          )}

          {(intro.practice_problems_sheet || intro.answer_key_sheet) && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Practice Materials</h3>
              <div className="space-y-2">
                {intro.practice_problems_sheet && (
                  <a
                    href={intro.practice_problems_sheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>Practice Problems</span>
                    <span className="text-gray-400">PDF →</span>
                  </a>
                )}
                {intro.answer_key_sheet && (
                  <a
                    href={intro.answer_key_sheet}
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

          {intro.main_area && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Area</h3>
              <span className="text-sm text-gray-700">{intro.main_area}</span>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
