import { execSync } from "node:child_process";

function parseArgs(argv) {
  const args = { range: null, fail: false };
  for (const a of argv.slice(2)) {
    if (a === "--fail") args.fail = true;
    else if (a.startsWith("--range=")) args.range = a.slice("--range=".length);
  }
  return args;
}

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

function main() {
  const { range, fail } = parseArgs(process.argv);
  const diffRange = range ?? "HEAD~1...HEAD";

  // Unified=0 reduces noise; we only care about changed lines.
  const diff = run(`git diff --unified=0 ${diffRange} -- "specs/**/*.md"`);
  if (!diff.trim()) {
    console.log("[breaking-check] No changes in specs/**/*.md");
    return;
  }

  const patterns = [
    /\bMUST NOT\b/i,
    /\bMUST\b/i,
    /\bSHOULD NOT\b/i,
    /\bSHOULD\b/i,
    /\bINVARIANT\b/i,
    /\bPROHIBITION\b/i
  ];

  const hits = [];
  const lines = diff.split("\n");
  let currentFile = null;

  for (const line of lines) {
    const fm = line.match(/^\+\+\+\s+b\/(.+)$/);
    if (fm) {
      currentFile = fm[1];
      continue;
    }
    if (!currentFile) continue;

    // Only added/removed lines; ignore diff headers
    if (!(line.startsWith("+") || line.startsWith("-"))) continue;
    if (line.startsWith("+++") || line.startsWith("---")) continue;

    const content = line.slice(1);
    if (patterns.some((p) => p.test(content))) {
      hits.push({ file: currentFile, line });
    }
  }

  if (hits.length === 0) {
    console.log(`[breaking-check] No normative-keyword hits detected in ${diffRange}`);
    return;
  }

  console.log(`[breaking-check] Potential normative/breaking changes detected (${hits.length}):`);
  for (const h of hits) {
    console.log(`- ${h.file}: ${h.line}`);
  }
  console.log("");
  console.log("[breaking-check] Review docs/breaking-change-checklist.md");

  if (fail) {
    console.error("[breaking-check] Failing because --fail is set.");
    process.exit(1);
  }
}

main();
