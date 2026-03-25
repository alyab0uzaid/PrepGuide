import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local before anything else
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function readCsv(filename: string): Record<string, string>[] {
  const csvPath = path.join(__dirname, "..", filename);
  const content = fs.readFileSync(csvPath, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
}

async function seedTopics() {
  console.log("Seeding topics...");
  const rows = readCsv("PrepGuide - Topics - 6684076278f6355301e37191.csv");

  const topics = rows
    .filter((r) => r["Archived"] !== "true" && r["Topic Name"])
    .map((r) => ({
      id: r["Item ID"],
      name: r["Topic Name"],
      slug: r["Slug"],
      main_area: r["Main Area"] || null,
      order_num: r["Order"] ? parseInt(r["Order"]) : null,
      lesson: r["Lesson"] || null,
      video: r["Video"] || null,
      practice_problems_sheet: r["Practice Problems Sheet"] || null,
      answer_key_sheet: r["Answer Key Sheet"] || null,
      easy: r["Easy"] || null,
      medium: r["Medium"] || null,
      hard: r["Hard"] || null,
      image: r["Image"] || null,
      number_subtopics: r["Number Subtopics"] ? parseInt(r["Number Subtopics"]) : null,
      created_at: r["Created On"] ? new Date(r["Created On"]).toISOString() : null,
    }));

  const { error } = await supabase.from("topics").upsert(topics, { onConflict: "id" });
  if (error) console.error("Error seeding topics:", error.message);
  else console.log(`  Inserted ${topics.length} topics`);
}

async function seedSubtopics() {
  console.log("Seeding subtopics...");
  const rows = readCsv("PrepGuide - Subtopics - 6684077f11d3f5a17ab9e1cb.csv");

  const subtopics = rows
    .filter((r) => r["Archived"] !== "true" && r["Name"])
    .map((r) => ({
      id: r["Item ID"],
      name: r["Name"],
      slug: r["Slug"],
      parent_topic_slug: r["Parent topic"] || null,
    }));

  const { error } = await supabase.from("subtopics").upsert(subtopics, { onConflict: "id" });
  if (error) console.error("Error seeding subtopics:", error.message);
  else console.log(`  Inserted ${subtopics.length} subtopics`);
}

async function seedQBPractices() {
  console.log("Seeding QB Practices...");
  const rows = readCsv("PrepGuide - QB Practices - 66b7d57438401814fa1e2aa6.csv");

  const practices = rows
    .filter((r) => r["Archived"] !== "true" && r["Name"])
    .map((r) => ({
      id: r["Item ID"],
      name: r["Name"],
      slug: r["Slug"],
      order_num: r["Order"] ? parseInt(r["Order"]) : null,
      easy: r["Easy"] || null,
      easy_key: r["Easy Key"] || null,
      medium: r["Medium"] || null,
      medium_key: r["Medium Key"] || null,
      hard: r["Hard"] || null,
      hard_key: r["Hard Key"] || null,
    }));

  const { error } = await supabase.from("qb_practices").upsert(practices, { onConflict: "id" });
  if (error) console.error("Error seeding QB Practices:", error.message);
  else console.log(`  Inserted ${practices.length} QB Practices`);
}

async function seedMathIntros() {
  console.log("Seeding Math Intros...");
  const rows = readCsv("PrepGuide - Math Intros - 66a8d92543c8200d9c2a1885.csv");

  const intros = rows
    .filter((r) => r["Archived"] !== "true" && r["Topic Name"])
    .map((r) => ({
      id: r["Item ID"],
      name: r["Topic Name"],
      slug: r["Slug"],
      order_num: r["Order"] ? parseInt(r["Order"]) : null,
      main_area: r["Main Area"] || null,
      lesson: r["Lesson"] || null,
      video: r["Video"] || null,
      practice_problems_sheet: r["Practice Problems Sheet"] || null,
      answer_key_sheet: r["Answer Key Sheet"] || null,
    }));

  const { error } = await supabase.from("math_intros").upsert(intros, { onConflict: "id" });
  if (error) console.error("Error seeding Math Intros:", error.message);
  else console.log(`  Inserted ${intros.length} Math Intros`);
}

async function main() {
  console.log("Starting seed...\n");
  await seedTopics();
  await seedSubtopics();
  await seedQBPractices();
  await seedMathIntros();
  console.log("\nSeed complete.");
}

main().catch(console.error);
