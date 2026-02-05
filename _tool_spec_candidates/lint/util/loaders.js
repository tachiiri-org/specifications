import fs from "fs"
import path from "path"

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8")
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`Invalid JSON: ${filePath}\n${e.message}`)
  }
}

export function loadTopology() {
  const filePath = path.resolve("rules", "topology.json")
  if (!fs.existsSync(filePath)) throw new Error(`Missing required file: ${filePath}`)
  const obj = readJson(filePath)
  obj.__file = filePath
  return obj
}

export function loadOperationCatalog() {
  const filePath = path.resolve("rules", "operation_catalog.json")
  if (!fs.existsSync(filePath)) throw new Error(`Missing required file: ${filePath}`)
  const obj = readJson(filePath)
  obj.__file = filePath
  return obj
}

// NEW: connectors spec (optional)
export function loadConnectorsSpec({ optional = false } = {}) {
  const filePath = path.resolve("rules", "connectors.json")
  if (!fs.existsSync(filePath)) {
    if (optional) return null
    throw new Error(`Missing required file: ${filePath}`)
  }
  const obj = readJson(filePath)
  obj.__file = filePath
  return obj
}

export function loadBoundariesWithFiles() {
  const defDir = path.resolve("def")
  if (!fs.existsSync(defDir)) throw new Error(`Missing directory: ${defDir}`)

  const files = fs
    .readdirSync(defDir)
    .filter((f) => f.startsWith("boundary_") && f.endsWith(".json"))
    .map((f) => path.join(defDir, f))

  if (files.length === 0) throw new Error(`No boundary_*.json files found under: ${defDir}`)

  return files.map((filePath) => {
    const b = readJson(filePath)
    b.__file = filePath
    return b
  })
}

export function loadBoundariesMap() {
  const map = {}
  for (const b of loadBoundariesWithFiles()) {
    if (!b.boundary || typeof b.boundary !== "string") {
      throw new Error(`Boundary missing "boundary" string: ${b.__file}`)
    }
    if (map[b.boundary]) {
      throw new Error(
        `Duplicate boundary name "${b.boundary}"\n- ${map[b.boundary].__file}\n- ${b.__file}`
      )
    }
    map[b.boundary] = b
  }
  return map
}

export function resolveSpecFile(specFile) {
  // spec_file is like "def/boundary_xxx.json"
  const filePath = path.resolve(specFile)
  return filePath
}

export function fileExists(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile()
}
