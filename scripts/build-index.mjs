import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const structuresDir = path.join(ROOT, "structures");
const outPath = path.join(ROOT, "index.json");

const records = [];

if (fs.existsSync(structuresDir)) {
  for (const entry of fs.readdirSync(structuresDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const folder = path.join(structuresDir, entry.name);
    const metaPath = path.join(folder, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

    records.push({
      ...meta,
      preview_url: `structures/${meta.slug}/preview.png`,
      file_url: `structures/${meta.slug}/${meta.file}`
    });
  }
}

records.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
console.log(`Wrote ${records.length} entries to index.json`);
