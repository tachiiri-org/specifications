function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function asSet(arr) {
  return new Set(Array.isArray(arr) ? arr : [])
}

function diff(a, b) {
  // a \ b
  const out = []
  for (const x of a) if (!b.has(x)) out.push(x)
  return out
}

function ensureSubset({
  boundary,
  upstreamPath,
  downstreamPath,
  upstreamAllow,
  downstreamAllow
}) {
  const up = asSet(upstreamAllow)
  const down = asSet(downstreamAllow)

  const missing = diff(up, down)
  if (missing.length > 0) {
    throw new Error(
      `${where(boundary)}: header allowlist drift: ${upstreamPath} must be subset of ${downstreamPath}; missing in downstream: ${JSON.stringify(missing)}`
    )
  }
}

function ensureNotAllowed({ boundary, listPath, allowList, forbidden }) {
  const s = asSet(allowList)
  const bad = forbidden.filter((h) => s.has(h))
  if (bad.length > 0) {
    throw new Error(
      `${where(boundary)}: forbidden header(s) present in ${listPath}: ${JSON.stringify(bad)}`
    )
  }
}

// Boundary-local checks for the request direction.
export function lintHeaderAllowlistChain(boundariesByName) {
  // bff_to_gateway: headers.bff_outbound.allow ⊆ headers.gateway_inbound.allow
  {
    const b = boundariesByName["bff_to_gateway"]
    if (b) {
      ensureSubset({
        boundary: b,
        upstreamPath: "headers.bff_outbound.allow",
        downstreamPath: "headers.gateway_inbound.allow",
        upstreamAllow: b.headers?.bff_outbound?.allow,
        downstreamAllow: b.headers?.gateway_inbound?.allow
      })

      // internal boundary must not allow cookie / set-cookie
      ensureNotAllowed({
        boundary: b,
        listPath: "headers.bff_outbound.allow",
        allowList: b.headers?.bff_outbound?.allow,
        forbidden: ["cookie", "set-cookie"]
      })
      ensureNotAllowed({
        boundary: b,
        listPath: "headers.gateway_inbound.allow",
        allowList: b.headers?.gateway_inbound?.allow,
        forbidden: ["cookie", "set-cookie"]
      })
    }
  }

  // gateway_to_adapter: headers.gateway_outbound.allow ⊆ headers.adapter_inbound.allow
  {
    const b = boundariesByName["gateway_to_adapter"]
    if (b) {
      ensureSubset({
        boundary: b,
        upstreamPath: "headers.gateway_outbound.allow",
        downstreamPath: "headers.adapter_inbound.allow",
        upstreamAllow: b.headers?.gateway_outbound?.allow,
        downstreamAllow: b.headers?.adapter_inbound?.allow
      })

      // internal boundary must not allow cookie / set-cookie
      ensureNotAllowed({
        boundary: b,
        listPath: "headers.gateway_outbound.allow",
        allowList: b.headers?.gateway_outbound?.allow,
        forbidden: ["cookie", "set-cookie"]
      })
      ensureNotAllowed({
        boundary: b,
        listPath: "headers.adapter_inbound.allow",
        allowList: b.headers?.adapter_inbound?.allow,
        forbidden: ["cookie", "set-cookie"]
      })
    }
  }

  // browser_to_bff: CORS allow headers ⊆ headers.inbound.allow (preflight success guarantee)
  {
    const b = boundariesByName["browser_to_bff"]
    if (b && b.cors?.allowed_headers?.mode === "explicit_list") {
      const corsAllow = b.cors?.allowed_headers?.items
      const inboundAllow = b.headers?.inbound?.allow

      ensureSubset({
        boundary: b,
        upstreamPath: "cors.allowed_headers.items",
        downstreamPath: "headers.inbound.allow",
        upstreamAllow: corsAllow,
        downstreamAllow: inboundAllow
      })
    }
  }

  // browser_to_bff: CORS exposed headers ⊆ headers.outbound.allow
  // (if a header is "exposed" but not allowed outbound, browser will never see it)
  {
    const b = boundariesByName["browser_to_bff"]
    if (b && b.cors?.exposed_headers?.mode === "explicit_list") {
      const exposed = b.cors?.exposed_headers?.items
      const outboundAllow = b.headers?.outbound?.allow

      ensureSubset({
        boundary: b,
        upstreamPath: "cors.exposed_headers.items",
        downstreamPath: "headers.outbound.allow",
        upstreamAllow: exposed,
        downstreamAllow: outboundAllow
      })
    }
  }
}
