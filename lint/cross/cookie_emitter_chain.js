function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

function mustNotInclude(boundary, listPath, arr, forbidden) {
  for (const h of forbidden) {
    if (has(arr, h)) {
      throw new Error(`${where(boundary)}: ${listPath} must not include "${h}"`)
    }
  }
}

function mustInclude(boundary, listPath, arr, required) {
  for (const h of required) {
    if (!has(arr, h)) {
      throw new Error(`${where(boundary)}: ${listPath} must include "${h}"`)
    }
  }
}

export function lintCookieEmitterChain(boundariesByName) {
  // browser_to_bff: BFF is the only cookie emitter -> must allow set-cookie on outbound.
  {
    const b = boundariesByName["browser_to_bff"]
    if (b) {
      const outAllow = b.headers?.outbound?.allow ?? []
      mustInclude(b, "headers.outbound.allow", outAllow, ["set-cookie"])

      // Defensive: internal cookies must not propagate beyond browser boundary.
      // (Inbound from browser may include cookie, but should never be allowed on internal boundaries.)
    }
  }

  // bff_to_gateway: must not allow cookie or set-cookie
  {
    const b = boundariesByName["bff_to_gateway"]
    if (b) {
      mustNotInclude(b, "headers.bff_outbound.allow", b.headers?.bff_outbound?.allow ?? [], ["cookie", "set-cookie"])
      mustNotInclude(b, "headers.gateway_inbound.allow", b.headers?.gateway_inbound?.allow ?? [], ["cookie", "set-cookie"])
    }
  }

  // gateway_to_adapter: must not allow cookie or set-cookie
  {
    const b = boundariesByName["gateway_to_adapter"]
    if (b) {
      mustNotInclude(b, "headers.gateway_outbound.allow", b.headers?.gateway_outbound?.allow ?? [], ["cookie", "set-cookie"])
      mustNotInclude(b, "headers.adapter_inbound.allow", b.headers?.adapter_inbound?.allow ?? [], ["cookie", "set-cookie"])
    }
  }
}
