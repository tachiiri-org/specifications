function whereCatalog(c) {
  return c.__file ? `${c.__file}` : `rules/operation_catalog.json`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintOperationAuthzRequirements(operationCatalog) {
  const file = whereCatalog(operationCatalog)
  const items = operationCatalog.catalog?.items ?? []
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${file}: catalog.items must be non-empty array`)
  }

  const seen = new Set()

  for (const op of items) {
    const key = op.key
    if (!isNonEmptyString(key)) {
      throw new Error(`${file}: operation item.key must be non-empty string`)
    }
    if (seen.has(key)) {
      throw new Error(`${file}: duplicate operation key: ${key}`)
    }
    seen.add(key)

    // authz must exist and must not be empty
    const az = op.authz
    if (!az || typeof az !== "object") {
      throw new Error(`${file}: ${key}: authz is required`)
    }
    if (!isNonEmptyString(az.mode)) {
      throw new Error(`${file}: ${key}: authz.mode must be non-empty string`)
    }
    const scopes = az.required_scopes_all_of
    const roles = az.required_roles_any_of
    if (!Array.isArray(scopes) || scopes.length === 0 || scopes.some(s => !isNonEmptyString(s))) {
      throw new Error(`${file}: ${key}: authz.required_scopes_all_of must be non-empty string array`)
    }
    if (!Array.isArray(roles) || roles.length === 0 || roles.some(r => !isNonEmptyString(r))) {
      throw new Error(`${file}: ${key}: authz.required_roles_any_of must be non-empty string array`)
    }

    // classification must exist
    const cls = op.classification ?? []
    if (!Array.isArray(cls) || cls.length === 0) {
      throw new Error(`${file}: ${key}: classification must be non-empty array`)
    }

    // idempotency coupling (minimum): if non-read category exists, idempotency.required must be true
    const idemRequired = op.idempotency?.required
    if (typeof idemRequired !== "boolean") {
      throw new Error(`${file}: ${key}: idempotency.required must be boolean`)
    }

    const isReadOnly = cls.length === 1 && has(cls, "read")
    if (!isReadOnly && idemRequired !== true) {
      throw new Error(`${file}: ${key}: non-read operation must have idempotency.required=true`)
    }
    if (isReadOnly && idemRequired !== false) {
      throw new Error(`${file}: ${key}: read operation must have idempotency.required=false`)
    }
  }
}
