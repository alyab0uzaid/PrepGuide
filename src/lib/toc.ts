export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

/** Mirrors the slug algorithm used by rehype-slug (github-slugger style). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars except space/hyphen
    .replace(/\s+/g, "-")        // spaces → hyphens
    .replace(/-+/g, "-")         // collapse multiple hyphens
    .replace(/^-|-$/g, "");      // trim leading/trailing hyphens
}

/** Extract h2 and h3 headings from raw MDX content (after frontmatter). */
export function extractToc(content: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const seen: Record<string, number> = {};

  for (const line of content.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    const text = m[2].trim();
    const base = slugify(text);

    // Handle duplicate headings the same way github-slugger does
    const count = seen[base] ?? 0;
    const id = count === 0 ? base : `${base}-${count}`;
    seen[base] = count + 1;

    entries.push({ level, text, id });
  }

  return entries;
}
