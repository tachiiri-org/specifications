function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

export function lintObservabilityEventsVocabulary(boundary) {
  const ob = boundary.observability
  if (!ob || ob.mode !== "enabled") return

  const events = ob.events
  if (!events) return // events自体を必須化はしていない（別lintで必要時のみ要求している）

  if (!Array.isArray(events)) {
    throw new Error(`${where(boundary)}: observability.events must be array when present`)
  }
  for (const e of events) {
    if (!isNonEmptyString(e)) {
      throw new Error(`${where(boundary)}: observability.events must contain non-empty strings only`)
    }
  }
  if (uniq(events).length !== events.length) {
    throw new Error(`${where(boundary)}: observability.events must not contain duplicates`)
  }

  // Allowed vocabulary (extend here when adding new events)
  const allowed = new Set([
    "authn_verified",
    "authn_rejected",
    "route_not_found",
    "csrf_rejected",
    "rate_limited",
    "idempotency_conflict",
    "idempotency_replayed",
    "upstream_error",
    "authz_denied"
  ])

  for (const e of events) {
    if (!allowed.has(e)) {
      throw new Error(`${where(boundary)}: unknown observability event "${e}" (must be one of ${JSON.stringify(Array.from(allowed).sort())})`)
    }
  }
}
