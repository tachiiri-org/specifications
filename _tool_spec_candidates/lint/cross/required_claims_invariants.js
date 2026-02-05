function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function mustBeStringArray(boundary, path, arr) {
  if (!Array.isArray(arr)) {
    throw new Error(`${where(boundary)}: ${path} must be array`)
  }
  for (const x of arr) {
    if (!isNonEmptyString(x)) {
      throw new Error(`${where(boundary)}: ${path} must contain non-empty strings only`)
    }
  }
}

function claimRefToRequiredClaim(ref) {
  // "claims.tenant_id" -> "tenant_id"
  // "claims.actor.actor_id" -> "actor.actor_id"
  if (!isNonEmptyString(ref)) return null
  if (!ref.startsWith("claims.")) return null
  return ref.slice("claims.".length)
}

function collectClaimRefs(boundary) {
  const refs = []

  // authz.decision_context.claims_mapping: { tenant_id: "claims.tenant_id", ... }
  const mapping = boundary.authz?.decision_context?.claims_mapping
  if (mapping && typeof mapping === "object") {
    for (const v of Object.values(mapping)) refs.push(v)
  }

  // limits.rate_limit.scopes[].key_fields
  const scopes = boundary.limits?.rate_limit?.scopes
  if (Array.isArray(scopes)) {
    for (const s of scopes) {
      const kf = s?.key_fields
      if (Array.isArray(kf)) refs.push(...kf)
    }
  }

  // http.idempotency.fingerprint.include
  const fp = boundary.http?.idempotency?.fingerprint?.include
  if (Array.isArray(fp)) refs.push(...fp)

  // http.idempotency.inflight_lock.scope_fields
  const sf = boundary.http?.idempotency?.inflight_lock?.scope_fields
  if (Array.isArray(sf)) refs.push(...sf)

  return refs
}

export function lintRequiredClaimsInvariants(boundary) {
  const transport = boundary.auth?.transport
  if (transport !== "bearer") return

  const required = boundary.auth?.token_profile?.required_claims
  mustBeStringArray(boundary, "auth.token_profile.required_claims", required)

  const claimRefs = collectClaimRefs(boundary)
  const needed = new Set()
  for (const r of claimRefs) {
    const c = claimRefToRequiredClaim(r)
    if (c) needed.add(c)
  }

  // Hard requirement for multi-tenant boundaries (minimum)
  if (boundary.boundary === "gateway_to_adapter") {
    needed.add("tenant_id")
    needed.add("actor.actor_id")
  }

  const missing = []
  for (const c of needed) {
    if (!required.includes(c)) missing.push(c)
  }

  if (missing.length > 0) {
    throw new Error(
      `${where(boundary)}: auth.token_profile.required_claims is missing required claims derived from boundary usage: ${JSON.stringify(missing)}`
    )
  }
}
