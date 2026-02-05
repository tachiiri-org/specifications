function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function eqArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])
}

export function lintInternalRoutingContract(boundary) {
  if (boundary.boundary !== "bff_to_gateway") return

  const http = boundary.http
  if (!http || typeof http !== "object") {
    throw new Error(`${where(boundary)}: http is required`)
  }

  if (http.rpc_style !== "json_rpc_over_http") {
    throw new Error(`${where(boundary)}: http.rpc_style must be "json_rpc_over_http" for bff_to_gateway`)
  }

  const r = http.routing
  if (!r || typeof r !== "object") {
    throw new Error(`${where(boundary)}: http.routing is required for bff_to_gateway`)
  }

  if (r.mode !== "enabled") {
    throw new Error(`${where(boundary)}: http.routing.mode must be "enabled" for bff_to_gateway`)
  }
  if (r.api_prefix !== "/internal") {
    throw new Error(`${where(boundary)}: http.routing.api_prefix must be "/internal"`)
  }
  if (r.rpc_endpoint !== "/internal/rpc") {
    throw new Error(`${where(boundary)}: http.routing.rpc_endpoint must be "/internal/rpc"`)
  }

  const expectedAllowed = ["/internal/rpc"]
  if (!eqArray(r.allowed_paths, expectedAllowed)) {
    throw new Error(`${where(boundary)}: http.routing.allowed_paths must equal ${JSON.stringify(expectedAllowed)}`)
  }

  const other = r.on_other_paths
  if (!other || typeof other !== "object") {
    throw new Error(`${where(boundary)}: http.routing.on_other_paths is required`)
  }
  if (other.action !== "reject") {
    throw new Error(`${where(boundary)}: http.routing.on_other_paths.action must be "reject"`)
  }
  if (other.status !== 404) {
    throw new Error(`${where(boundary)}: http.routing.on_other_paths.status must be 404`)
  }
  if (other.error_code !== "not_found") {
    throw new Error(`${where(boundary)}: http.routing.on_other_paths.error_code must be "not_found"`)
  }
}
