function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintObservabilityEventsRequired(boundary) {
  const events = boundary.observability?.events

  // If CSRF is enabled, we require csrf_rejected event registration
  const csrfEnabled = boundary.http?.csrf?.mode === "enabled"
  if (csrfEnabled) {
    if (!Array.isArray(events) || !has(events, "csrf_rejected")) {
      throw new Error(`${where(boundary)}: http.csrf.mode=enabled requires observability.events to include "csrf_rejected"`)
    }
  }

  // If rate limit is enabled, we require rate_limited event registration
  const rl = boundary.limits?.rate_limit
  if (rl?.mode === "enabled") {
    if (!Array.isArray(events) || !has(events, "rate_limited")) {
      throw new Error(`${where(boundary)}: limits.rate_limit.mode=enabled requires observability.events to include "rate_limited"`)
    }
  }

  // If idempotency is enabled (owner boundary), require idempotency events
  const idem = boundary.http?.idempotency
  if (idem?.mode === "enabled") {
    if (!Array.isArray(events) || !has(events, "idempotency_replayed") || !has(events, "idempotency_conflict")) {
      throw new Error(`${where(boundary)}: http.idempotency.mode=enabled requires observability.events to include "idempotency_replayed" and "idempotency_conflict"`)
    }
  }
}
