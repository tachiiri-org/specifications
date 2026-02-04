import fs from "fs"
import path from "path"

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}

function lintSchemaPaths(operationCatalog) {
  const items = operationCatalog?.catalog?.items
  if (!Array.isArray(items)) {
    throw new Error("operation_catalog catalog.items must be an array")
  }

  for (const item of items) {
    const schemaPath = item?.schema?.path
    if (!schemaPath || typeof schemaPath !== "string") {
      throw new Error(`operation_catalog item missing schema.path for key: ${item?.key ?? "unknown"}`)
    }
    if (!schemaPath.startsWith("schemas/")) {
      throw new Error(`schema.path must point under schemas/: ${schemaPath}`)
    }

    const resolved = path.resolve(schemaPath)
    if (!fs.existsSync(resolved)) {
      throw new Error(`schema.path does not exist: ${schemaPath}`)
    }

    if (schemaPath.startsWith("schemas/operations/")) {
      const rel = path.relative(path.join("schemas", "operations"), schemaPath)
      const segments = rel.split(path.sep).filter(Boolean)
      if (segments.length > 2) {
        throw new Error(`schemas/operations depth must be <= 2: ${schemaPath}`)
      }
    }
  }
}

function lintOperationSchemaDepth() {
  const operationsDir = path.join(process.cwd(), "schemas", "operations")
  if (!fs.existsSync(operationsDir)) return

  const files = listFilesRecursive(operationsDir)
  for (const filePath of files) {
    const rel = path.relative(operationsDir, filePath)
    const segments = rel.split(path.sep).filter(Boolean)
    if (segments.length > 2) {
      throw new Error(`schemas/operations depth must be <= 2: ${filePath}`)
    }
  }
}

export function lintSchemaPathPolicy(operationCatalog) {
  lintSchemaPaths(operationCatalog)
  lintOperationSchemaDepth()
}
