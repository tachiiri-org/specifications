function whereFile(obj, fallback) {
  return obj.__file ?? fallback
}

function whereBoundary(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function sort(arr) {
  return [...arr].sort()
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

function renderKey(op, fmt) {
  // 現状の schema/lint 体系は "{service}/{resource}/{property}/{operation}" 前提。
  // 将来的に fmt が増えるならテンプレ展開へ拡張。
  if (fmt !== "{service}/{resource}/{property}/{operation}") {
    throw new Error(`Unsupported operation_key_format: ${fmt}`)
  }
  return `${op.service}/${op.resource}/${op.property}/${op.operation}`
}

export function lintOperationCatalogConsistency(operationCatalog, boundariesByName) {
  const catFile = whereFile(operationCatalog, "rules/operation_catalog.json")

  const catalog = operationCatalog.catalog
  const fmt = catalog?.operation_key_format
  if (!isNonEmptyString(fmt)) {
    throw new Error(`${catFile}: catalog.operation_key_format must be non-empty string`)
  }

  const items = catalog?.items
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${catFile}: catalog.items must be non-empty array`)
  }

  // 1) Validate classification vocabulary + coherence
  const allowed = new Set(["read", "mutate", "irreversible", "external_effect"])

  const opKeys = new Set()
  for (const op of items) {
    const { key, service, resource, property, operation, classification } = op ?? {}

    if (!isNonEmptyString(key)) {
      throw new Error(`${catFile}: operation item.key must be non-empty string`)
    }
    if (opKeys.has(key)) {
      throw new Error(`${catFile}: duplicate operation key: ${key}`)
    }
    opKeys.add(key)

    if (![service, resource, property, operation].every(isNonEmptyString)) {
      throw new Error(`${catFile}: ${key}: must have non-empty service/resource/property/operation`)
    }

    // hardening: key must be consistent with fields + operation_key_format
    const expectedKey = renderKey(op, fmt)
    if (key !== expectedKey) {
      throw new Error(`${catFile}: ${key}: key must equal "${expectedKey}" (derived from fields)`)
    }

    if (!Array.isArray(classification) || classification.length === 0) {
      throw new Error(`${catFile}: ${key}: classification must be non-empty array`)
    }
    if (uniq(classification).length !== classification.length) {
      throw new Error(`${catFile}: ${key}: classification must not contain duplicates`)
    }
    for (const c of classification) {
      if (!allowed.has(c)) {
        throw new Error(`${catFile}: ${key}: unknown classification "${c}"`)
      }
    }

    // read must not mix with others
    if (classification.includes("read")) {
      const others = classification.filter((c) => c !== "read")
      if (others.length > 0) {
        throw new Error(`${catFile}: ${key}: read must not mix with ${JSON.stringify(others)}`)
      }
    }

    // 2) idempotency coupling (minimum)
    const idemRequired = op.idempotency?.required
    if (typeof idemRequired !== "boolean") {
      throw new Error(`${catFile}: ${key}: idempotency.required must be boolean`)
    }

    const isReadOnly = classification.length === 1 && has(classification, "read")
    const needsIdem =
      classification.includes("mutate") ||
      classification.includes("irreversible") ||
      classification.includes("external_effect")

    if (!isReadOnly && needsIdem !== true) {
      // This should not happen given the allowed set, but keep it explicit.
      throw new Error(`${catFile}: ${key}: non-read classification must include mutate/irreversible/external_effect`)
    }

    if (!isReadOnly && idemRequired !== true) {
      throw new Error(`${catFile}: ${key}: non-read operation must have idempotency.required=true`)
    }
    if (isReadOnly && idemRequired !== false) {
      throw new Error(`${catFile}: ${key}: read operation must have idempotency.required=false`)
    }
  }

  // 3) Derive idempotency-required operation KEYS from classification
  const idemRequiredKeys = new Set()
  for (const op of items) {
    const cls = op.classification
    const needs =
      cls.includes("mutate") ||
      cls.includes("irreversible") ||
      cls.includes("external_effect")
    if (needs) idemRequiredKeys.add(op.key)
  }

  // 4) Check gateway_to_adapter idempotency requirement list matches derived set (full keys)
  const b = boundariesByName["gateway_to_adapter"]
  if (!b) return

  const list = b.http?.idempotency?.require_key?.require_header_on_route_operations
  if (!Array.isArray(list)) {
    throw new Error(`${whereBoundary(b)}: http.idempotency.require_key.require_header_on_route_operations must be array`)
  }

  const a = sort(uniq(list))
  const e = sort(Array.from(idemRequiredKeys))

  if (JSON.stringify(a) !== JSON.stringify(e)) {
    throw new Error(
      `${whereBoundary(b)}: idempotency required operation list mismatch.\n` +
      `- boundary: ${JSON.stringify(a)}\n` +
      `- derived from catalog: ${JSON.stringify(e)}\n` +
      `Note: derived set is based on operations whose classification include mutate/irreversible/external_effect.`
    )
  }
}
