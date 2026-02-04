export function lintIdempotencyE2E(path, boundaries) {
  const adapter = boundaries[path[path.length - 1]]

  const adapterIdempotency = adapter.http?.idempotency
  const adapterOwnsIdempotency = adapterIdempotency?.mode === "enabled"
  if (!adapterOwnsIdempotency) {
    return
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
