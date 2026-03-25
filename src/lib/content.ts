import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface TopicMeta {
  title: string;
  slug: string;
  area: string;
  order: number;
  subtopics: string[];
  video?: string;
  practiceSheet?: string;
  answerKey?: string;
  easy?: string;
  medium?: string;
  hard?: string;
  filePath: string;
}

export interface MathIntroMeta {
  title: string;
  slug: string;
  order: number;
  area?: string;
  video?: string;
  practiceSheet?: string;
  answerKey?: string;
  filePath: string;
}

// ── Topics ────────────────────────────────────────────────────────────────────

function getTopicFiles(): string[] {
  const areas = ["algebra", "advanced-math", "problem-solving", "additional-topics"];
  const files: string[] = [];
  for (const area of areas) {
    const dir = path.join(CONTENT_ROOT, "topics", area);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".mdx")) files.push(path.join(dir, file));
    }
  }
  return files;
}

export function getAllTopics(): TopicMeta[] {
  return getTopicFiles()
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return { ...data, filePath } as TopicMeta;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getTopicBySlug(slug: string): { meta: TopicMeta; content: string } | null {
  const files = getTopicFiles();
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      return { meta: { ...data, filePath } as TopicMeta, content };
    }
  }
  return null;
}

// ── Math Intros ───────────────────────────────────────────────────────────────

function getMathIntroFiles(): string[] {
  const dir = path.join(CONTENT_ROOT, "math-intros");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(dir, f));
}

export function getAllMathIntros(): MathIntroMeta[] {
  return getMathIntroFiles()
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return { ...data, filePath } as MathIntroMeta;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getMathIntroBySlug(slug: string): { meta: MathIntroMeta; content: string } | null {
  for (const filePath of getMathIntroFiles()) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      return { meta: { ...data, filePath } as MathIntroMeta, content };
    }
  }
  return null;
}
