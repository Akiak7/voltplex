import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

const ROOT = process.cwd();
const structuresDir = path.join(ROOT, "structures");
const schemaPath = path.join(ROOT, "schema", "structure.schema.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

let failed = false;
const seen = new Set();

for (const entry of fs.readdirSync(structuresDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const dir = path.join(structuresDir, entry.name);
  const metaPath = path.join(dir, "meta.json");
  const previewPath = path.join(dir, "preview.png");

  if (!fs.existsSync(metaPath)) {
    console.error(`Missing meta.json in ${entry.name}`);
    failed = true;
    continue;
  }

  if (!fs.existsSync(previewPath)) {
    console.error(`Missing preview.png in ${entry.name}`);
    failed = true;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    console.error(`Invalid JSON in ${entry.name}/meta.json`);
    failed = true;
    continue;
  }

  if (!validate(meta)) {
    console.error(`Schema errors in ${entry.name}:`, validate.errors);
    failed = true;
  }

  if (meta.slug !== entry.name) {
    console.error(`Slug mismatch: folder=${entry.name}, meta.slug=${meta.slug}`);
    failed = true;
  }

  if (seen.has(meta.slug)) {
    console.error(`Duplicate slug: ${meta.slug}`);
    failed = true;
  }
  seen.add(meta.slug);

  const structurePath = path.join(dir, meta.file || "");
  if (!meta.file || !fs.existsSync(structurePath)) {
    console.error(`Missing structure file "${meta.file}" in ${entry.name}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Validation passed.");
