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

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintExternalConnectorCoupling(operationCatalog, connectorsSpec, boundariesByName) {
  const catFile = whereFile(operationCatalog, "rules/operation_catalog.json")
  const conFile = whereFile(connectorsSpec, "rules/connectors.json")

  const items = operationCatalog?.catalog?.items
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`${catFile}: catalog.items must be non-empty array`)
  }

  const connectors = connectorsSpec?.connectors?.items
  if (!Array.isArray(connectors) || connectors.length === 0) {
    throw new Error(`${conFile}: connectors.items must be non-empty array`)
  }

  const byId = new Map()
  for (const c of connectors) {
    const id = c?.connector_id
    if (!isNonEmptyString(id)) throw new Error(`${conFile}: connector_id must be non-empty`)
    if (byId.has(id)) throw new Error(`${conFile}: duplicate connector_id: ${id}`)
    byId.set(id, c)
  }

  // 1) operation -> connector existence + classification coupling
  for (const op of items) {
    const key = op?.key
    if (!isNonEmptyString(key)) continue

    const connectorId = op?.connector_id
    if (!isNonEmptyString(connectorId)) {
      throw new Error(`${catFile}: ${key}: connector_id must be non-empty string`)
    }

    if (!byId.has(connectorId)) {
      throw new Error(`${catFile}: ${key}: connector_id "${connectorId}" not found in ${conFile}`)
    }

    const cls = op?.classification
    if (!Array.isArray(cls) || cls.length === 0) {
      throw new Error(`${catFile}: ${key}: classification must be non-empty array`)
    }

    // If operation uses external connector, it must declare external_effect.
    if (!has(cls, "external_effect")) {
      throw new Error(`${catFile}: ${key}: external connector operation must include classification "external_effect"`)
    }
  }

  // 2) boundary adapter_to_external must be within connector maxima (defaults)
  const b = boundariesByName["adapter_to_external"]
  if (!b) return

  const bTimeout = b.http?.timeouts?.upstream_timeout_ms
  const bRetry = b.http?.retry
  const bAttempts = bRetry?.max_attempts
  const bBackoff = Array.isArray(bRetry?.backoff_ms) ? bRetry.backoff_ms.reduce((a, x) => a + x, 0) : 0

  if (typeof bTimeout !== "number") {
    throw new Error(`${whereBoundary(b)}: http.timeouts.upstream_timeout_ms must be number`)
  }
  if (!bRetry || bRetry.mode !== "enabled") {
    throw new Error(`${whereBoundary(b)}: http.retry.mode must be "enabled" for external boundary`)
  }
  if (typeof bAttempts !== "number" || !(bAttempts >= 1)) {
    throw new Error(`${whereBoundary(b)}: http.retry.max_attempts must be number >= 1`)
  }

  // Determine which connectors are actually used by operations
  const usedConnectors = uniq(items.map((op) => op?.connector_id).filter(isNonEmptyString))

  for (const cid of usedConnectors) {
    const c = byId.get(cid)
    const maxT = c?.timeouts?.timeout_ms_max
    const maxA = c?.retry?.max_attempts_max
    const maxBackoff = c?.retry?.backoff_ms_max_total

    if (typeof maxT !== "number") throw new Error(`${conFile}: ${cid}: timeouts.timeout_ms_max must be number`)
    if (typeof maxA !== "number") throw new Error(`${conFile}: ${cid}: retry.max_attempts_max must be number`)
    if (typeof maxBackoff !== "number") throw new Error(`${conFile}: ${cid}: retry.backoff_ms_max_total must be number`)

    if (bTimeout > maxT) {
      throw new Error(
        `${whereBoundary(b)}: upstream_timeout_ms ${bTimeout} exceeds connector "${cid}" timeout_ms_max ${maxT} (source: ${conFile})`
      )
    }
    if (bAttempts > maxA) {
      throw new Error(
        `${whereBoundary(b)}: retry.max_attempts ${bAttempts} exceeds connector "${cid}" max_attempts_max ${maxA} (source: ${conFile})`
      )
    }
    if (bBackoff > maxBackoff) {
      throw new Error(
        `${whereBoundary(b)}: retry.backoff total ${bBackoff}ms exceeds connector "${cid}" backoff_ms_max_total ${maxBackoff}ms (source: ${conFile})`
      )
    }
  }
}
