import Link from "next/link";
import { notFound } from "next/navigation";
import { getMathIntroBySlug, getAllMathIntros } from "@/lib/content";
import LessonContent from "@/components/LessonContent";

export async function generateStaticParams() {
  return getAllMathIntros().map((i) => ({ slug: i.slug }));
}

export default async function MathIntroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getMathIntroBySlug(slug);
  if (!result) notFound();

  const { meta, content } = result;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-4">
        <Link href="/math-intros" className="hover:text-gray-600">Math Intros</Link>
        {" / "}
        <span className="text-gray-700">{meta.title}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">{meta.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <LessonContent content={content} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {(meta.practiceSheet || meta.answerKey) && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-400 mb-3">
                Practice Materials
              </h3>
              <div className="space-y-2">
                {meta.practiceSheet && (
                  <a
                    href={meta.practiceSheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>Practice Sheet</span>
                    <span className="text-gray-400 text-xs">PDF →</span>
                  </a>
                )}
                {meta.answerKey && (
                  <a
                    href={meta.answerKey}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <span>Answer Key</span>
                    <span className="text-gray-400 text-xs">PDF →</span>
                  </a>
                )}
              </div>
            </section>
          )}

          {meta.video && (
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-400 mb-3">
                Video
              </h3>
              <a
                href={meta.video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Watch Video →
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
