function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function mustBeNonEmptyStringArray(boundary, path, arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`${where(boundary)}: ${path} must be non-empty array`)
  }
  for (const x of arr) {
    if (!isNonEmptyString(x)) {
      throw new Error(`${where(boundary)}: ${path} must contain non-empty strings only`)
    }
  }
}

function mustInclude(boundary, path, arr, required) {
  for (const x of required) {
    if (!arr.includes(x)) {
      throw new Error(`${where(boundary)}: ${path} must include "${x}"`)
    }
  }
}

export function lintTokenProfile(boundary) {
  const transport = boundary.auth?.transport
  if (transport !== "bearer") return

  const tp = boundary.auth?.token_profile
  if (!tp || typeof tp !== "object") {
    throw new Error(`${where(boundary)}: auth.token_profile is required when auth.transport="bearer"`)
  }

  if (tp.type !== "jwt") {
    throw new Error(`${where(boundary)}: auth.token_profile.type must be "jwt"`)
  }

  mustBeNonEmptyStringArray(boundary, "auth.token_profile.allowed_algs", tp.allowed_algs)

  // Keep this strict for now (expanding alg set is risky; treat as breaking).
  const allowed = ["RS256"]
  if (JSON.stringify(tp.allowed_algs) !== JSON.stringify(allowed)) {
    throw new Error(`${where(boundary)}: auth.token_profile.allowed_algs must be exactly ${JSON.stringify(allowed)}`)
  }

  if (!isNonEmptyString(tp.issuer)) {
    throw new Error(`${where(boundary)}: auth.token_profile.issuer must be non-empty string`)
  }
  if (!isNonEmptyString(tp.audience)) {
    throw new Error(`${where(boundary)}: auth.token_profile.audience must be non-empty string`)
  }

  const jwks = tp.jwks
  if (!jwks || typeof jwks !== "object") {
    throw new Error(`${where(boundary)}: auth.token_profile.jwks must exist`)
  }
  if (jwks.source !== "env") {
    throw new Error(`${where(boundary)}: auth.token_profile.jwks.source must be "env"`)
  }
  if (!isNonEmptyString(jwks.env_var)) {
    throw new Error(`${where(boundary)}: auth.token_profile.jwks.env_var must be non-empty string`)
  }
  if (typeof jwks.cache_ttl_sec !== "number" || !(jwks.cache_ttl_sec > 0)) {
    throw new Error(`${where(boundary)}: auth.token_profile.jwks.cache_ttl_sec must be number > 0`)
  }

  if (typeof tp.max_clock_skew_sec !== "number" || tp.max_clock_skew_sec < 0) {
    throw new Error(`${where(boundary)}: auth.token_profile.max_clock_skew_sec must be number >= 0`)
  }
  if (tp.max_clock_skew_sec > 60) {
    throw new Error(`${where(boundary)}: auth.token_profile.max_clock_skew_sec must be <= 60`)
  }

  mustBeNonEmptyStringArray(boundary, "auth.token_profile.required_claims", tp.required_claims)
  mustInclude(boundary, "auth.token_profile.required_claims", tp.required_claims, ["iss", "aud", "exp", "sub"])

  // Minimum check list consistency (prevents partial implementations)
  const checks = boundary.auth?.gateway_inbound_verification?.checks ?? boundary.auth?.gateway_inbound?.checks
  if (Array.isArray(checks)) {
    mustInclude(boundary, "auth.*.checks", checks, [
      "verify_signature",
      "verify_issuer",
      "verify_audience",
      "verify_expiration"
    ])
  } else {
    // If bearer boundary doesn't declare checks subtree, it's too ambiguous.
    throw new Error(`${where(boundary)}: bearer boundary must declare inbound verification checks (auth.gateway_inbound_verification.checks or auth.gateway_inbound.checks)`)
  }
}
