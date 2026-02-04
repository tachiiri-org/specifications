export function lintIdempotencyE2E(path, boundaries) {
  const adapter = boundaries[path[path.length - 1]]

  if (adapter.http?.idempotency?.mode !== "enabled") {
    throw new Error(
      `[${adapter.boundary}] adapter must own idempotency`
    )
  }

  for (let i = 0; i < path.length - 1; i++) {
    const b = boundaries[path[i]]
    if (b.http?.idempotency?.owner) {
      throw new Error(
        `[${b.boundary}] upstream boundary must not own idempotency`
      )
    }
  }
}
