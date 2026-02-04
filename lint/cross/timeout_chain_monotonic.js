function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintTimeoutChainMonotonic(pathSeq, boundariesByName) {
  // 1) client-facing boundary ordering: client_timeout_ms > upstream_timeout_ms for browser_to_bff
  const entry = boundariesByName[pathSeq[0]]
  if (entry && entry.boundary === "browser_to_bff") {
    const up = entry.http?.timeouts?.upstream_timeout_ms
    const client = entry.http?.timeouts?.client_timeout_ms
    if (typeof up !== "number" || typeof client !== "number") {
      throw new Error(`${where(entry)}: browser_to_bff must define http.timeouts.upstream_timeout_ms and client_timeout_ms`)
    }
    if (!(client > up)) {
      throw new Error(`${where(entry)}: browser_to_bff must satisfy client_timeout_ms > upstream_timeout_ms`)
    }
  }

  // 2) downstream non-increasing along the same path
  let prev = null
  for (const name of pathSeq) {
    const b = boundariesByName[name]
    if (!b) continue

    const t = b.http?.timeouts?.upstream_timeout_ms
    if (typeof t !== "number") {
      throw new Error(`${where(b)}: boundary must define http.timeouts.upstream_timeout_ms`)
    }

    if (prev !== null && t > prev) {
      throw new Error(`${where(b)}: upstream_timeout_ms must be non-increasing along the path (prev=${prev}, current=${t})`)
    }
    prev = t
  }
}
