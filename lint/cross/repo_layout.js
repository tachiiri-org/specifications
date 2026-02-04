import fs from "fs"
import path from "path"

const IGNORED_DIRS = new Set(["node_modules", ".git"])

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8")
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`Invalid JSON: ${filePath}\n${e.message}`)
  }
}

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      files.push(...listFilesRecursive(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}

function findFilesByBasename(rootDir, fileName) {
  return listFilesRecursive(rootDir).filter((filePath) => path.basename(filePath) === fileName)
}

function lintCanonicalCatalogs(rootDir) {
  const rulesDir = path.join(rootDir, "rules")
  const defDir = path.join(rootDir, "def")

  const requiredCatalogs = ["operation_catalog.json", "topology.json", "connectors.json"]
  const optionalCatalogs = ["events_catalog.json"]

  for (const catalog of requiredCatalogs) {
    const rulesPath = path.join(rulesDir, catalog)
    if (!fs.existsSync(rulesPath)) {
      throw new Error(`Missing canonical catalog in rules/: ${rulesPath}`)
    }
    const defPath = path.join(defDir, catalog)
    if (fs.existsSync(defPath)) {
      throw new Error(`Canonical catalog must not live in def/: ${defPath}`)
    }
  }

  for (const catalog of optionalCatalogs) {
    const matches = findFilesByBasename(rootDir, catalog)
    if (matches.length === 0) continue
    for (const match of matches) {
      if (path.dirname(match) !== rulesDir) {
        throw new Error(`Optional canonical catalog must live in rules/: ${match}`)
      }
    }
  }
}

function lintBoundaryPlacement(rootDir) {
  const defDir = path.join(rootDir, "def")
  const boundaryFiles = listFilesRecursive(rootDir).filter((filePath) => {
    const base = path.basename(filePath)
    return base.startsWith("boundary_") && base.endsWith(".json")
  })

  for (const boundaryFile of boundaryFiles) {
    if (!boundaryFile.startsWith(defDir + path.sep)) {
      throw new Error(`Boundary JSON must live in def/: ${boundaryFile}`)
    }
  }
}

function lintPendingReferences(rootDir) {
  const jsonDirs = ["def", "rules", "schemas"].map((dir) => path.join(rootDir, dir))
  const jsonFiles = jsonDirs.flatMap((dir) =>
    listFilesRecursive(dir).filter((filePath) => filePath.endsWith(".json"))
  )

  const offenders = []

  function walk(value, pathParts, filePath) {
    if (typeof value === "string") {
      if (value.includes("pending/")) {
        offenders.push(`${filePath} -> ${pathParts.join(".") || "(root)"}`)
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, [...pathParts, `[${index}]`], filePath))
      return
    }
    if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        walk(nested, [...pathParts, key], filePath)
      }
    }
  }

  for (const filePath of jsonFiles) {
    const data = readJson(filePath)
    walk(data, [], filePath)
  }

  if (offenders.length > 0) {
    throw new Error(`pending/ references detected:\n- ${offenders.join("\n- ")}`)
  }
}

export function lintRepoLayout() {
  const rootDir = process.cwd()
  lintCanonicalCatalogs(rootDir)
  lintBoundaryPlacement(rootDir)
  lintPendingReferences(rootDir)
}
