function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function isLowercaseHeaderName(x) {
  return isNonEmptyString(x) && x === x.toLowerCase()
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

export function lintHeadersLowercase(boundary) {
  const h = boundary.headers
  if (!h || typeof h !== "object") return

  // Pragmatic approach: validate typical list paths by scanning for arrays under headers.*
  // and enforcing that elements are lowercase strings (for header-name lists).
  walk(h, (node, path) => {
    if (!Array.isArray(node)) return

    // We only target arrays whose path name implies "header list".
    // This avoids falsely touching arrays like pipeline_order (already strict-checked elsewhere).
    const joined = path.join(".")
    const last = path[path.length - 1] ?? ""
    const hint = [
      "allow",
      "drop",
      "drop_hop_by_hop",
      "forbidden_identity_headers",
      "inbound_must_include",
      "outbound_must_include",
      "vary",
      "exposed_headers",
      "allowed_headers"
    ]

    const shouldCheck = hint.includes(last) || hint.some((x) => joined.endsWith(x))
    if (!shouldCheck) return

    for (const v of node) {
      if (!isLowercaseHeaderName(v)) {
        throw new Error(`${where(boundary)}: headers.${joined} must contain lowercase header names only (got ${JSON.stringify(v)})`)
      }
    }
  })
}
