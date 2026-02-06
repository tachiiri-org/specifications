import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT_DIR = "specs";
const OUT_FILE = "spec.manifest.json";

const LAYER_RULES = [
  { prefix: "00_constitution/", layer: "00", idPrefix: "l00." },
  { prefix: "20_operational_semantics/", layer: "20", idPrefix: "l20." },
  { prefix: "30_interaction_edges/", layer: "30", idPrefix: "l30." },
  { prefix: "40_service_operations_governance/", layer: "40", idPrefix: "l40." },
];

const ROOT_FILE_IDS = new Map([
  ["00_purpose.md", "root.purpose"],
  ["10_non_goals.md", "root.non_goals"],
  ["00_constitution_scope.md", "root.constitution_scope"],
  ["README.md", "root.index"],
]);

const ALLOWED_STATUS = new Set(["draft", "stable", "deprecated"]);

function toTopic(fileBaseName) {
  return fileBaseName.replace(/\.md$/i, "");
}

function titleFromFilename(fileBaseName) {
  const topic = toTopic(fileBaseName);
  return topic
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

async function listMdFiles(dirAbs) {
  const out = [];
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dirAbs, e.name);
    if (e.isDirectory()) out.push(...(await listMdFiles(p)));
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) out.push(p);
  }
  return out;
}

/**
 * Minimal YAML front-matter parser (restricted).
 * Supports:
 * - key: scalar
 * - key:
 *     - item
 *     - item
 */
function parseFrontMatter(mdText) {
  const m = mdText.match(/^\s*---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return { fm: null, body: mdText };

  const raw = m[1];
  const body = mdText.slice(m[0].length);

  const lines = raw.split("\n");
  const fm = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)\s*$/);
    if (!kv) {
      throw new Error(`Invalid front-matter line: "${line}"`);
    }

    const key = kv[1];
    const rest = kv[2];

    if (rest === "") {
      // list block expected
      const arr = [];
      i++;
      while (i < lines.length) {
        const l = lines[i];
        const mm = l.match(/^\s*-\s*(.+?)\s*$/);
        if (!mm) break;
        arr.push(mm[1]);
        i++;
      }
      fm[key] = arr;
      continue;
    }

    // scalar
    fm[key] = coerceScalar(rest);
    i++;
  }

  return { fm, body };
}

function coerceScalar(s) {
  const v = s.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  // strip quotes if present
  const qm = v.match(/^"(.*)"$/) || v.match(/^'(.*)'$/);
  if (qm) return qm[1];
  return v;
}

function readH1(mdBody) {
  const m = mdBody.match(/^\s*#\s+(.+?)\s*$/m);
  return m?.[1]?.trim() ?? null;
}

function classify(relPathFromRootDir) {
  const base = path.basename(relPathFromRootDir);

  if (!relPathFromRootDir.includes("/")) {
    const id = ROOT_FILE_IDS.get(base);
    if (!id) return null;
    return { id, layer: "root" };
  }

  for (const r of LAYER_RULES) {
    if (relPathFromRootDir.startsWith(r.prefix)) {
      if (r.layer === "40" && base.toLowerCase() === "readme.md") {
        return { id: "l40.service_operations_governance.readme", layer: "40" };
      }
      const topic = toTopic(base);
      return { id: `${r.idPrefix}${topic}`, layer: r.layer };
    }
  }
  return null;
}

function defaultNormative(layer, relPathFromRootDir) {
  if (layer === "root") return relPathFromRootDir !== "README.md";
  if (layer === "40") return relPathFromRootDir !== "40_service_operations_governance/README.md";
  return true;
}

function defaultStatus() {
  return "stable";
}

function validateSpecEntry(entry, idSet) {
  if (!entry.id || typeof entry.id !== "string") throw new Error(`Invalid id: ${entry.id}`);
  if (idSet.has(entry.id)) throw new Error(`Duplicate spec id: ${entry.id}`);
  idSet.add(entry.id);

  if (!entry.path.startsWith(`${ROOT_DIR}/`)) throw new Error(`Path must start with "${ROOT_DIR}/": ${entry.path}`);
  if (!ALLOWED_STATUS.has(entry.status)) throw new Error(`Invalid status "${entry.status}" for ${entry.id}`);

  if (!Array.isArray(entry.related_ids)) throw new Error(`related_ids must be array for ${entry.id}`);
  for (const rid of entry.related_ids) {
    if (typeof rid !== "string") throw new Error(`related_ids must be string array for ${entry.id}`);
  }
}

async function main() {
  const rootAbs = path.resolve(ROOT_DIR);
  const filesAbs = await listMdFiles(rootAbs);

  const specs = [];
  const unclassified = [];

  for (const abs of filesAbs) {
    const relFromSpecs = path.relative(rootAbs, abs).replaceAll("\\", "/");
    const meta = classify(relFromSpecs);
    if (!meta) {
      unclassified.push(relFromSpecs);
      continue;
    }

    const txt = await fs.readFile(abs, "utf8");
    const { fm, body } = parseFrontMatter(txt);

    const h1 = readH1(body);
    const base = path.basename(relFromSpecs);

    const title =
      (typeof fm?.title === "string" && fm.title.trim()) ||
      h1 ||
      titleFromFilename(base);

    const status =
      (typeof fm?.status === "string" && fm.status.trim()) || defaultStatus();

    const normative =
      typeof fm?.normative === "boolean" ? fm.normative : defaultNormative(meta.layer, relFromSpecs);

    const related_ids = Array.isArray(fm?.related_ids) ? fm.related_ids : [];

    specs.push({
      id: meta.id,
      title,
      layer: meta.layer,
      path: `${ROOT_DIR}/${relFromSpecs}`,
      normative_default: normative,
      status,
      related_ids
    });
  }

  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified markdown files under ${ROOT_DIR}/:\n` + unclassified.map((s) => `- ${s}`).join("\n")
    );
  }

  // sort for stable diffs
  specs.sort((a, b) => a.id.localeCompare(b.id));

  // validation passes that require full list
  const idSet = new Set();
  for (const s of specs) validateSpecEntry(s, idSet);

  // validate related_ids exist
  for (const s of specs) {
    for (const rid of s.related_ids) {
      if (!idSet.has(rid)) {
        throw new Error(`Unknown related_id "${rid}" referenced from ${s.id}`);
      }
    }
  }

  const manifest = {
    schema_version: 1,
    root_dir: ROOT_DIR,
    specs
  };

  const json = JSON.stringify(manifest, null, 2) + "\n";
  await fs.writeFile(path.resolve(OUT_FILE), json, "utf8");
  process.stdout.write(`Wrote ${OUT_FILE} (${specs.length} specs)\n`);
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
