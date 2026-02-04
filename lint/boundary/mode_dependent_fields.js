function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function hasOwn(obj, key) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key)
}

export function lintModeDependentFields(boundary) {
  // CORS: allowed_origin
  const cors = boundary.cors
  if (cors?.allowed_origin?.mode === "same_origin_only") {
    if (hasOwn(cors.allowed_origin, "items")) {
      throw new Error(`${where(boundary)}: cors.allowed_origin.mode=same_origin_only must not have items`)
    }
  }
  if (cors?.allowed_origin?.mode === "explicit_list") {
    if (!Array.isArray(cors.allowed_origin.items) || cors.allowed_origin.items.length === 0) {
      throw new Error(`${where(boundary)}: cors.allowed_origin.mode=explicit_list requires non-empty items`)
    }
  }

  // CORS: allowed_headers / allowed_methods / exposed_headers / vary (if explicit_list, must have non-empty items)
  const listFields = ["allowed_headers", "allowed_methods", "exposed_headers", "vary"]
  for (const f of listFields) {
    const x = cors?.[f]
    if (!x) continue

    if (x.mode === "explicit_list") {
      if (!Array.isArray(x.items) || x.items.length === 0) {
        throw new Error(`${where(boundary)}: cors.${f}.mode=explicit_list requires non-empty items`)
      }
    }
  }

  // CSRF: origin.allowed_origin (same_origin_only must not have items-like fields)
  const csrf = boundary.http?.csrf
  if (csrf?.origin?.allowed_origin?.mode === "same_origin_only") {
    if (hasOwn(csrf.origin.allowed_origin, "items")) {
      throw new Error(`${where(boundary)}: http.csrf.origin.allowed_origin.mode=same_origin_only must not have items`)
    }
  }
}
