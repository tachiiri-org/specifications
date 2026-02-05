function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function eqArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])
}

export function lintIdempotencyRetry(boundary) {
  const idem = boundary.http?.idempotency
  const retry = boundary.http?.retry
  if (!retry || retry.mode !== "enabled") return

  // Common hardening for any retry-enabled boundary
  if (typeof retry.max_attempts !== "number" || !(retry.max_attempts >= 1)) {
    throw new Error(`${where(boundary)}: retry.max_attempts must be number >= 1 when retry.mode=enabled`)
  }

  const allowed = [502, 503, 504]
  if (!eqArray(retry.retry_on_status, allowed)) {
    throw new Error(`${where(boundary)}: retry.retry_on_status must be [502,503,504] when retry.mode=enabled`)
  }

  if (!retry.retry_on_network_error) {
    throw new Error(`${where(boundary)}: retry.retry_on_network_error must be true when retry.mode=enabled`)
  }

  if (!retry.retry_gate?.require_idempotency_key_when_state_changing) {
    throw new Error(`${where(boundary)}: retry.retry_gate.require_idempotency_key_when_state_changing must be true`)
  }

  // Additional tightening: validate_only + retry must also satisfy same invariants (already covered above)
  if (idem?.mode === "validate_only") {
    // no extra rules beyond the common hardening (kept for readability)
  }
}
