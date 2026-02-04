function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintTimeoutRetryChain(pathSeq, boundaries) {
  for (let i = 1; i < pathSeq.length; i++) {
    const upstream = boundaries[pathSeq[i - 1]]
    const current = boundaries[pathSeq[i]]

    const retry = current.http?.retry
    if (!retry || retry.mode !== "enabled") continue

    const timeout = current.http?.timeouts?.upstream_timeout_ms
    const attempts = retry.max_attempts
    const backoff = Array.isArray(retry.backoff_ms) ? retry.backoff_ms.reduce((a, b) => a + b, 0) : 0

    if (typeof timeout !== "number" || typeof attempts !== "number") {
      throw new Error(`${where(current)}: timeout_retry_chain requires http.timeouts.upstream_timeout_ms and retry.max_attempts`)
    }

    const total = timeout * attempts + backoff

    const upstreamTimeout = upstream.http?.timeouts?.upstream_timeout_ms
    if (typeof upstreamTimeout !== "number") {
      throw new Error(`${where(upstream)}: upstream boundary must define http.timeouts.upstream_timeout_ms`)
    }

    if (total >= upstreamTimeout) {
      throw new Error(
        `${where(current)}: retry budget ${total}ms exceeds upstream timeout ${upstreamTimeout}ms (upstream: ${where(upstream)})`
      )
    }
  }
}
