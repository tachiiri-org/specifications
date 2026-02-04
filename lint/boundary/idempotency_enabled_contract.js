function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintIdempotencyEnabledContract(boundary) {
  const idem = boundary.http?.idempotency
  if (!idem || idem.mode !== "enabled") return

  // fingerprint must exist and include minimal set
  const fp = idem.fingerprint
  if (!fp || typeof fp !== "object") {
    throw new Error(`${where(boundary)}: http.idempotency.mode=enabled requires http.idempotency.fingerprint`)
  }
  const include = fp.include
  if (!Array.isArray(include) || include.length === 0) {
    throw new Error(`${where(boundary)}: http.idempotency.fingerprint.include must be non-empty array`)
  }
  for (const req of ["x-idempotency-key", "body_hash"]) {
    if (!has(include, req)) {
      throw new Error(`${where(boundary)}: http.idempotency.fingerprint.include must include "${req}"`)
    }
  }

  // conflict_rule must exist
  const cr = idem.conflict_rule?.same_key_different_fingerprint
  if (!cr || typeof cr !== "object") {
    throw new Error(`${where(boundary)}: http.idempotency.mode=enabled requires http.idempotency.conflict_rule.same_key_different_fingerprint`)
  }
  if (cr.action !== "reject" || cr.status !== 409 || cr.error_code !== "idempotency_key_conflict") {
    throw new Error(`${where(boundary)}: http.idempotency.conflict_rule.same_key_different_fingerprint must be {action:reject,status:409,error_code:idempotency_key_conflict}`)
  }

  // response_replay must exist
  const rr = idem.response_replay
  if (!rr || typeof rr !== "object") {
    throw new Error(`${where(boundary)}: http.idempotency.mode=enabled requires http.idempotency.response_replay`)
  }

  // storage must exist
  const st = idem.storage
  if (!st || typeof st !== "object") {
    throw new Error(`${where(boundary)}: http.idempotency.mode=enabled requires http.idempotency.storage`)
  }
  if (!st.type) {
    throw new Error(`${where(boundary)}: http.idempotency.storage.type is required`)
  }
}
