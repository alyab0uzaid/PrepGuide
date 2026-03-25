import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import { parse as parseCSV } from "csv-parse/sync";
import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require("cheerio");

// ─── Area normalisation (CSV name → display name) ─────────────────────────────
const AREA_DISPLAY: Record<string, string> = {
  "Heart of Algebra": "Algebra",
  "Passport to Advanced Math": "Advanced Math",
  "Problem Solving and Data Analysis": "Problem Solving and Data Analysis",
  "Additional Topics in Math": "Additional Topics in Math",
  // legacy / already-normalised names pass through unchanged
  "Algebra": "Algebra",
  "Advanced Math": "Advanced Math",
};

// ─── Area slug map (keyed on display name) ────────────────────────────────────
const AREA_DIR: Record<string, string> = {
  "Algebra": "algebra",
  "Advanced Math": "advanced-math",
  "Problem Solving and Data Analysis": "problem-solving",
  "Additional Topics in Math": "additional-topics",
};

// ─── Read CSV helper ──────────────────────────────────────────────────────────
function readCsv(filename: string): Record<string, string>[] {
  const p = path.join(__dirname, "..", filename);
  const content = fs.readFileSync(p, "utf-8");
  return parseCSV(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

// ─── Escape bare { } in MDX text (outside math and JSX) ──────────────────────
function escapeBareLatexBraces(mdx: string): string {
  // Tokenize the MDX into segments: $$...$$ blocks, $...$ spans, JSX tags, and plain text.
  // Only escape { and } in plain text segments.
  const segments: { text: string; isProtected: boolean }[] = [];
  const tokenRe = /(\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$|<[A-Z][a-zA-Z]*[^>]*\/>|<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>)/g;

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(mdx)) !== null) {
    if (match.index > last) {
      segments.push({ text: mdx.slice(last, match.index), isProtected: false });
    }
    segments.push({ text: match[0], isProtected: true });
    last = match.index + match[0].length;
  }
  if (last < mdx.length) {
    segments.push({ text: mdx.slice(last), isProtected: false });
  }

  return segments
    .map(({ text, isProtected }) => {
      if (isProtected) return text;
      // In unprotected text: escape bare { and } that MDX would try to parse as JS expressions.
      // Use \{ and \} which MDX 2 renders as literal braces.
      return text.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    })
    .join("");
}

// ─── HTML → MDX converter ─────────────────────────────────────────────────────
function htmlToMdx(rawHtml: string): string {
  if (!rawHtml) return "";

  // Strip zero-width joiners and non-breaking spaces used as spacers
  let html = rawHtml
    .replace(/\u200D/g, "")
    .replace(/&zwj;/g, "")
    .replace(/‍/g, "");

  // Pre-process: replace Desmos iframes with placeholder tags before cheerio parses
  html = html.replace(
    /<iframe[^>]*src=['"]https:\/\/www\.desmos\.com\/calculator\/([a-zA-Z0-9]+)['"][^>]*>[\s\S]*?<\/iframe>/gi,
    (_, id) => `<desmos-embed data-id="${id}"></desmos-embed>`
  );

  // Pre-process: remove SVG wrapping divs, keep SVG inline but tag it
  html = html.replace(
    /<div[^>]*data-rt-embed-type[^>]*>([\s\S]*?)<\/div>/gi,
    (_, inner) => {
      if (inner.trim().startsWith("<?xml") || inner.trim().startsWith("<svg")) {
        return `<figure-block>${inner}</figure-block>`;
      }
      return inner;
    }
  );

  const $ = cheerio.load(html);
  let mdx = "";

  function processNode(node: any): string {
    if (node.type === "text") {
      return node.data || "";
    }

    if (node.type !== "tag") return "";

    const el = node;
    const tag = (el.tagName || el.name || "").toLowerCase();
    const children = el.children || [];
    const innerText = children.map(processNode).join("");
    const innerTrimmed = innerText.trim();

    // Skip empty nodes (but allow self-handled custom tags through)
    const SELF_HANDLED = ["desmos-embed", "figure-block", "br", "hr"];
    if (!innerTrimmed && !SELF_HANDLED.includes(tag)) return "";

    // Skip spacer paragraphs (only whitespace or zero-width chars)
    if (tag === "p" && !innerTrimmed) return "";

    switch (tag) {
      // ── Headings (Webflow TOC marker aware) ──────────────────────────────
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        // Strip [fs-toc-hN] markers whether bare or wrapped in bold (**...**)
        const cleaned = innerTrimmed
          .replace(/\*{0,2}\[fs-toc-h\d\]\*{0,2}/g, "")
          .trim();
        const level = parseInt(tag[1]);
        return "\n" + "#".repeat(level) + " " + cleaned + "\n\n";
      }

      // ── Paragraphs ────────────────────────────────────────────────────────
      case "p":
        return innerTrimmed + "\n\n";

      // ── Inline formatting ─────────────────────────────────────────────────
      case "strong":
      case "b":
        return `**${innerTrimmed}**`;
      case "em":
      case "i":
        // Don't wrap display math blocks in italic markers — breaks MDX parser
        if (innerTrimmed.startsWith("$$")) return innerTrimmed;
        return `*${innerTrimmed}*`;
      case "u":
        return `<u>${innerTrimmed}</u>`;
      case "code":
        return `\`${innerTrimmed}\``;

      // ── Links ─────────────────────────────────────────────────────────────
      case "a": {
        const href = $(el).attr("href") || "";
        return `[${innerTrimmed}](${href})`;
      }

      // ── Lists ─────────────────────────────────────────────────────────────
      case "ul": {
        const items = children
          .filter((c) => (c as any).tagName === "li")
          .map((c) => "- " + processChildren(c as any).trim())
          .join("\n");
        return "\n" + items + "\n\n";
      }
      case "ol": {
        const items = children
          .filter((c) => (c as any).tagName === "li")
          .map((c, i) => `${i + 1}. ` + processChildren(c as any).trim())
          .join("\n");
        return "\n" + items + "\n\n";
      }
      case "li":
        return innerTrimmed;

      // ── Line break ────────────────────────────────────────────────────────
      case "br":
        return "\n";

      // ── Desmos embed placeholder (pre-processed) ─────────────────────────
      case "desmos-embed": {
        const id = $(el).attr("data-id") || "";
        return id ? `\n<Desmos id="${id}" />\n\n` : "";
      }

      // ── Figure/SVG block (pre-processed) — extract to file ────────────────
      case "figure-block": {
        const innerHtml = ($(el).html() || "").trim();
        if (!innerHtml) return "";
        const svgPath = extractSvgToFile(innerHtml);
        return `\n<Figure src="${svgPath}" />\n\n`;
      }

      // ── Divs ─────────────────────────────────────────────────────────────
      case "div":
        return processChildren(el);

      // ── Spans ─────────────────────────────────────────────────────────────
      case "span":
        return innerText;

      // ── Tables ────────────────────────────────────────────────────────────
      case "table": {
        const rows = $(el).find("tr").toArray();
        const mdRows = rows.map((row) => {
          const cells = $(row).find("td, th").toArray();
          return "| " + cells.map((c) => $(c).text().trim()).join(" | ") + " |";
        });
        if (mdRows.length === 0) return "";
        const header = mdRows[0];
        const sep = header.replace(/[^|]/g, "-").replace(/\|(-+)\|/g, "|---|");
        return "\n" + [header, sep, ...mdRows.slice(1)].join("\n") + "\n\n";
      }

      default:
        return innerText;
    }
  }

  function processChildren(el: any): string {
    return (el.children || []).map(processNode).join("");
  }

  // Process top-level children
  $("body").children().each((_, el) => {
    mdx += processNode(el as any);
  });

  // Strip any remaining [fs-toc-hN] markers (e.g. in bold paragraphs used as fake headings)
  mdx = mdx.replace(/\[fs-toc-h\d\]/g, "");

  // Collapse 3+ newlines to 2
  mdx = mdx.replace(/\n{3,}/g, "\n\n").trim();

  // ── Post-process MDX for safe math syntax ────────────────────────────────
  // remark-math processes $$ and $ at the TOKENIZER level (before MDX's JSX parser).
  // \[...\] and \(...\) are only processed at the remark level (AFTER JSX parsing),
  // so any { } inside them would be seen by the JSX parser and cause acorn errors.

  // 1. Display math: \[...\] → $$\n...\n$$ (ensure blank line before so $$ is always block-level)
  mdx = mdx.replace(/\\\[\n?([\s\S]*?)\n?\\\]/g, (_, inner) => `\n\n$$\n${inner.trim()}\n$$\n\n`);

  // 2. Inline math: \(...\) → $...$
  mdx = mdx.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner}$`);

  // 3. Wrap any remaining bare LaTeX environments (\begin{...\end{}) in $$
  //    These appear in <p> tags that had no math delimiters in the original HTML.
  mdx = mdx.replace(
    /(^|\n\n)((?:(?!\$\$)[^\n])*\\begin\{[\s\S]*?\\end\{[^}]+\}(?:(?!\$\$)[^\n])*)/g,
    (_, pre, env) => `${pre}\n$$\n${env.trim()}\n$$\n`
  );

  // 4. Final sweep: escape any bare { } that made it through (not inside $$ or $ or JSX).
  //    Split into segments, process only text segments (not math or JSX).
  mdx = escapeBareLatexBraces(mdx);

  // Collapse 3+ newlines again after post-processing
  mdx = mdx.replace(/\n{3,}/g, "\n\n").trim();

  return mdx;
}

// ─── Write file (create dirs as needed) ──────────────────────────────────────
function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  wrote: ${path.relative(process.cwd(), filePath)}`);
}

// ─── SVG extraction state ─────────────────────────────────────────────────────
let svgCounter = 0;
let currentSlug = "";

function extractSvgToFile(svgHtml: string): string {
  svgCounter++;
  const filename = `${currentSlug}-${svgCounter}.svg`;
  const publicPath = path.join(__dirname, "..", "public", "diagrams", filename);
  const svgContent = svgHtml.replace(/<\?xml[^>]*\?>/g, "").trim();
  writeFile(publicPath, svgContent);
  return `/diagrams/${filename}`;
}

// ─── Generate Topics ─────────────────────────────────────────────────────────
function generateTopics(subtopicMap: Record<string, string[]>) {
  console.log("\nGenerating topics...");
  const rows = readCsv("PrepGuide - Topics - 6684076278f6355301e37191.csv");

  for (const r of rows) {
    if (r["Archived"] === "true" || !r["Topic Name"]) continue;

    const name = r["Topic Name"];
    const slug = r["Slug"];
    const area = AREA_DISPLAY[r["Main Area"]] || r["Main Area"] || "Additional Topics in Math";
    const order = r["Order"] || "";
    const video = r["Video"] || "";
    const practiceSheet = r["Practice Problems Sheet"] || "";
    const answerKey = r["Answer Key Sheet"] || "";
    const easy = r["Easy"] || "";
    const medium = r["Medium"] || "";
    const hard = r["Hard"] || "";
    const lessonHtml = r["Lesson"] || "";
    const subtopics = subtopicMap[slug] || [];

    const areaDir = AREA_DIR[area] || "additional-topics";
    svgCounter = 0;
    currentSlug = slug;
    const lessonMdx = htmlToMdx(lessonHtml);

    const frontmatter = [
      "---",
      `title: "${name.replace(/"/g, '\\"')}"`,
      `slug: "${slug}"`,
      `area: "${area}"`,
      `order: ${order || 0}`,
      subtopics.length ? `subtopics:\n${subtopics.map((s) => `  - "${s.replace(/"/g, '\\"')}"`).join("\n")}` : "subtopics: []",
      video ? `video: "${video}"` : "",
      practiceSheet ? `practiceSheet: "${practiceSheet}"` : "",
      answerKey ? `answerKey: "${answerKey}"` : "",
      easy ? `easy: "${easy}"` : "",
      medium ? `medium: "${medium}"` : "",
      hard ? `hard: "${hard}"` : "",
      "---",
    ]
      .filter((l) => l !== "")
      .join("\n");

    const content = `${frontmatter}\n\n${lessonMdx}\n`;
    const filePath = path.join(
      __dirname, "..", "content", "topics", areaDir, `${slug}.mdx`
    );
    writeFile(filePath, content);
  }
}

// ─── Generate Math Intros ─────────────────────────────────────────────────────
function generateMathIntros() {
  console.log("\nGenerating math intros...");
  const rows = readCsv("PrepGuide - Math Intros - 66a8d92543c8200d9c2a1885.csv");

  for (const r of rows) {
    if (r["Archived"] === "true" || !r["Topic Name"]) continue;

    const name = r["Topic Name"];
    const slug = r["Slug"];
    const order = r["Order"] || "";
    const area = r["Main Area"] || "";
    const video = r["Video"] || "";
    const practiceSheet = r["Practice Problems Sheet"] || "";
    const answerKey = r["Answer Key Sheet"] || "";
    const lessonHtml = r["Lesson"] || "";

    svgCounter = 0;
    currentSlug = slug;
    const lessonMdx = htmlToMdx(lessonHtml);

    const frontmatter = [
      "---",
      `title: "${name.replace(/"/g, '\\"')}"`,
      `slug: "${slug}"`,
      `order: ${order || 0}`,
      area ? `area: "${area}"` : "",
      video ? `video: "${video}"` : "",
      practiceSheet ? `practiceSheet: "${practiceSheet}"` : "",
      answerKey ? `answerKey: "${answerKey}"` : "",
      "---",
    ]
      .filter((l) => l !== "")
      .join("\n");

    const content = `${frontmatter}\n\n${lessonMdx}\n`;
    const filePath = path.join(__dirname, "..", "content", "math-intros", `${slug}.mdx`);
    writeFile(filePath, content);
  }
}

// ─── Build subtopic map ───────────────────────────────────────────────────────
function buildSubtopicMap(): Record<string, string[]> {
  const rows = readCsv("PrepGuide - Subtopics - 6684077f11d3f5a17ab9e1cb.csv");
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (r["Archived"] === "true" || !r["Name"]) continue;
    const parent = r["Parent topic"];
    if (!parent) continue;
    if (!map[parent]) map[parent] = [];
    map[parent].push(r["Name"]);
  }
  return map;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Building content from CSVs...");
  const subtopicMap = buildSubtopicMap();
  generateTopics(subtopicMap);
  generateMathIntros();
  console.log("\nDone.");
}

main().catch(console.error);
