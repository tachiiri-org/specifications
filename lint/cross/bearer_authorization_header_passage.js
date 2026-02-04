function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

function requireHas(boundary, path, arr, header) {
  if (!Array.isArray(arr)) {
    throw new Error(`${where(boundary)}: ${path} must be array`)
  }
  if (!has(arr, header)) {
    throw new Error(`${where(boundary)}: ${path} must include "${header}"`)
  }
}

export function lintBearerAuthorizationHeaderPassage(boundariesByName) {
  for (const b of Object.values(boundariesByName)) {
    if (b.auth?.transport !== "bearer") continue

    // If boundary requires Authorization, ensure allowlists keep it.
    const requireAuth = b.auth?.require_authorization_header === true
    if (!requireAuth) continue

    if (b.boundary === "bff_to_gateway") {
      requireHas(b, "headers.bff_outbound.allow", b.headers?.bff_outbound?.allow, "authorization")
      requireHas(b, "headers.gateway_inbound.allow", b.headers?.gateway_inbound?.allow, "authorization")
      continue
    }

    if (b.boundary === "gateway_to_adapter") {
      requireHas(b, "headers.gateway_outbound.allow", b.headers?.gateway_outbound?.allow, "authorization")
      requireHas(b, "headers.adapter_inbound.allow", b.headers?.adapter_inbound?.allow, "authorization")
      continue
    }

    // For any future bearer boundaries, fail fast until an explicit mapping is added.
    throw new Error(`${where(b)}: bearer boundary with require_authorization_header=true must be added to lintBearerAuthorizationHeaderPassage mapping`)
  }
}
