import fs from "fs"
import path from "path"

import Ajv2020 from "ajv/dist/2020.js"
import addFormats from "ajv-formats"

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8")
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`Invalid JSON: ${filePath}\n${e.message}`)
  }
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .map((name) => path.join(dir, name))
    .filter((p) => fs.statSync(p).isFile())
    .filter(predicate)
}

function formatAjvErrors(errors) {
  return (errors ?? [])
    .map((err) => {
      const at = err.instancePath && err.instancePath.length > 0 ? err.instancePath : "/"
      const msg = err.message ?? "schema violation"
      const extra = err.params ? ` params=${JSON.stringify(err.params)}` : ""
      return `- at ${at}: ${msg}${extra}`
    })
    .join("\n")
}

export async function lintSchemas() {
  const root = process.cwd()

  const schemaDir = path.join(root, "lint", "schema")
  const defDir = path.join(root, "def")
  const rulesDir = path.join(root, "rules")

  const boundarySchemaPath = path.join(schemaDir, "boundary.schema.json")
  const topologySchemaPath = path.join(schemaDir, "topology.schema.json")
  const operationCatalogSchemaPath = path.join(schemaDir, "operation_catalog.schema.json")

  if (!fs.existsSync(boundarySchemaPath)) {
    throw new Error(`Missing schema file: ${boundarySchemaPath}`)
  }
  if (!fs.existsSync(topologySchemaPath)) {
    throw new Error(`Missing schema file: ${topologySchemaPath}`)
  }
  if (!fs.existsSync(operationCatalogSchemaPath)) {
    throw new Error(`Missing schema file: ${operationCatalogSchemaPath}`)
  }

  const boundarySchema = readJson(boundarySchemaPath)
  const topologySchema = readJson(topologySchemaPath)
  const operationCatalogSchema = readJson(operationCatalogSchemaPath)

  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    allowUnionTypes: true
  })
  addFormats(ajv)

  // P2: compile cache
  const compiled = new Map()
  function getValidator(schema, schemaName) {
    if (compiled.has(schemaName)) return compiled.get(schemaName)
    const validate = ajv.compile(schema)
    compiled.set(schemaName, validate)
    return validate
  }

  function validateWith(schema, schemaName, filePath) {
    const validate = getValidator(schema, schemaName)
    const data = readJson(filePath)

    const ok = validate(data)
    if (!ok) {
      const details = formatAjvErrors(validate.errors)
      throw new Error(`Schema validation failed: ${filePath}\n${details}`)
    }
  }

  // 1) topology.json
  const topologyPath = path.join(rulesDir, "topology.json")
  if (!fs.existsSync(topologyPath)) {
    throw new Error(`Missing required file: ${topologyPath}`)
  }
  validateWith(topologySchema, "topology", topologyPath)

  // 2) operation_catalog.json
  const operationCatalogPath = path.join(rulesDir, "operation_catalog.json")
  if (!fs.existsSync(operationCatalogPath)) {
    throw new Error(`Missing required file: ${operationCatalogPath}`)
  }
  validateWith(operationCatalogSchema, "operation_catalog", operationCatalogPath)

  // 3) all boundary JSONs under def/
  if (!fs.existsSync(defDir)) {
    throw new Error(`Missing directory: ${defDir}`)
  }

  const boundaryFiles = listFiles(defDir, (p) =>
    path.basename(p).startsWith("boundary_") && p.endsWith(".json")
  )

  if (boundaryFiles.length === 0) {
    throw new Error(`No boundary_*.json files found under: ${defDir}`)
  }

  for (const filePath of boundaryFiles) {
    validateWith(boundarySchema, "boundary", filePath)
  }
}
