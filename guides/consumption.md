# Consumption Guide

Consumers SHOULD resolve documents by **spec-id** via `spec.manifest.json`, rather than hardcoding file paths.

## What this package provides

- `spec.manifest.json` (exported as `@your-scope/service-specifications/manifest`)
- Markdown specs under `specs/**`

## Node.js example (recommended)

> Note: this is a “read-only” package. It ships Markdown and an index manifest.

```js
import manifest from "@your-scope/service-specifications/manifest";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Resolve the installed package location
const manifestAbs =
  require.resolve("@your-scope/service-specifications/manifest");
const pkgRoot = path.dirname(manifestAbs);

// Resolve by spec-id
const specId = "l00.identity";
const spec = manifest.specs.find((s) => s.id === specId);
if (!spec) throw new Error(`Unknown spec id: ${specId}`);

// Read the Markdown
const mdAbs = path.resolve(pkgRoot, "..", spec.path);
const md = fs.readFileSync(mdAbs, "utf8");

console.log(md.slice(0, 200));
```

## Policy: path hardcoding is discouraged

- Consumers MAY read `specs/**` directly for tooling, but SHOULD NOT hardcode concrete file paths for business logic.
- Use spec-id + manifest lookup to stay resilient to future reorganization.

## Suggested consumer responsibilities

- Pin package versions (SemVer).
- In CI, verify required spec-ids exist (manifest lookup).
- If you generate doc sites or link graphs, consume `related_ids` from front-matter/manifest.
