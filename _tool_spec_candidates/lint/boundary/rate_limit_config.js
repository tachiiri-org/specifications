function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function isPositiveNumber(x) {
  return typeof x === "number" && Number.isFinite(x) && x > 0
}

export function lintRateLimitConfig(boundary) {
  const rl = boundary.limits?.rate_limit
  if (!rl) return

  if (!isNonEmptyString(rl.mode)) {
    throw new Error(`${where(boundary)}: limits.rate_limit.mode must be non-empty string`)
  }
  if (rl.mode === "disabled") return

  if (rl.mode !== "enabled") {
    throw new Error(`${where(boundary)}: limits.rate_limit.mode must be "enabled" or "disabled"`)
  }

  if (!isNonEmptyString(rl.owner)) {
    throw new Error(`${where(boundary)}: limits.rate_limit.owner must be non-empty string`)
  }

  if (rl.status !== 429) {
    throw new Error(`${where(boundary)}: limits.rate_limit.status must be 429`)
  }
  if (rl.error_code !== "rate_limited") {
    throw new Error(`${where(boundary)}: limits.rate_limit.error_code must be "rate_limited"`)
  }

  if (rl.algorithm !== "token_bucket") {
    throw new Error(`${where(boundary)}: limits.rate_limit.algorithm must be "token_bucket"`)
  }

  const scopes = rl.scopes
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new Error(`${where(boundary)}: limits.rate_limit.scopes must be non-empty array`)
  }

  for (const [i, s] of scopes.entries()) {
    if (!s || typeof s !== "object") {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}] must be object`)
    }
    if (!isNonEmptyString(s.name)) {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].name must be non-empty string`)
    }
    if (!Array.isArray(s.key_fields) || s.key_fields.length === 0 || s.key_fields.some(k => !isNonEmptyString(k))) {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].key_fields must be non-empty string array`)
    }

    const b = s.bucket
    if (!b || typeof b !== "object") {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].bucket is required`)
    }
    if (!isPositiveNumber(b.capacity)) {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].bucket.capacity must be positive number`)
    }
    if (!isPositiveNumber(b.refill_per_second)) {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].bucket.refill_per_second must be positive number`)
    }

    const onExceed = s.on_exceed
    if (!onExceed || typeof onExceed !== "object") {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].on_exceed is required`)
    }
    if (onExceed.action !== "reject") {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].on_exceed.action must be "reject"`)
    }
    if (typeof onExceed.retry_after_seconds !== "number" || onExceed.retry_after_seconds < 0) {
      throw new Error(`${where(boundary)}: limits.rate_limit.scopes[${i}].on_exceed.retry_after_seconds must be number >= 0`)
    }
  }

  // Safety: ensure 429 is preserved if this boundary has error mapping
  const preserve = boundary.http?.errors?.propagation?.preserve_status_for
  if (preserve && (!Array.isArray(preserve) || !preserve.includes(429))) {
    throw new Error(`${where(boundary)}: limits.rate_limit is enabled but http.errors.propagation.preserve_status_for must include 429`)
  }
}
