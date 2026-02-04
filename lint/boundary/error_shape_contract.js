function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function walk(obj, visit, path = []) {
  if (!obj || typeof obj !== "object") return
  visit(obj, path)
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, visit, path.concat(String(i))))
  } else {
    for (const [k, v] of Object.entries(obj)) {
      walk(v, visit, path.concat(k))
    }
  }
}

export function lintErrorShapeContract(boundary) {
  const p = boundary.http?.errors?.propagation
  if (!p) return

  // 1) always_use_error_shape must be explicitly true when propagation exists.
  if (p.always_use_error_shape !== true) {
    throw new Error(`${where(boundary)}: http.errors.propagation.always_use_error_shape must be true when propagation exists`)
  }

  // 2) JSON response must be possible if we always apply error shape.
  const ct = boundary.http?.content_types
  const acceptedResp = ct?.accepted_response
  if (!Array.isArray(acceptedResp) || !acceptedResp.includes("application/json")) {
    throw new Error(`${where(boundary)}: http.content_types.accepted_response must include "application/json" when always_use_error_shape=true`)
  }

  const defResp = ct?.default_response
  if (!isNonEmptyString(defResp) || !defResp.toLowerCase().startsWith("application/json")) {
    throw new Error(`${where(boundary)}: http.content_types.default_response must start with "application/json" when always_use_error_shape=true`)
  }

  // 3) error mapping targets must exist (prevents partial/ambiguous implementations).
  if (typeof p.map_4xx_to !== "number") {
    throw new Error(`${where(boundary)}: http.errors.propagation.map_4xx_to must be number`)
  }
  if (typeof p.map_5xx_to !== "number") {
    throw new Error(`${where(boundary)}: http.errors.propagation.map_5xx_to must be number`)
  }
  if (typeof p.network_error_to !== "number") {
    throw new Error(`${where(boundary)}: http.errors.propagation.network_error_to must be number`)
  }

  // 4) defaults must exist to keep status deterministic.
  const d = boundary.http?.errors?.defaults
  if (typeof d?.default_status !== "number") {
    throw new Error(`${where(boundary)}: http.errors.defaults.default_status must be number when propagation exists`)
  }

  // 5) request-id policy must exist (error shape includes request_id).
  // We do not validate full semantics here (cross-lint already checks path behavior),
  // but require the config subtree to exist to avoid silent omission.
  const rid = boundary.observability?.request_id
  if (!rid || !isNonEmptyString(rid.header)) {
    throw new Error(`${where(boundary)}: observability.request_id.header must exist when always_use_error_shape=true`)
  }

  // 6) Reject configs that include error_code must have non-empty string.
  // This is a pragmatic enforcement of "error.code is part of contract and must not be empty".
  walk(boundary, (node, path) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return
    if (Object.prototype.hasOwnProperty.call(node, "error_code")) {
      const v = node.error_code
      if (!isNonEmptyString(v)) {
        const at = path.length ? path.join(".") : "(root)"
        throw new Error(`${where(boundary)}: error_code must be non-empty string at ${at}`)
      }
    }
  })
}
