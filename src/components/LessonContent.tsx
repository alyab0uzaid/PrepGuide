import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx";

export default function LessonContent({ content }: { content: string }) {
  return (
    <div className="lesson-content">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeSlug],
          },
        }}
        components={mdxComponents}
      />
    </div>
  );
}
