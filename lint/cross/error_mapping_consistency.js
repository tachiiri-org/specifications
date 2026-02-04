function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintErrorPreserve403(pathSeq, boundariesByName) {
  // Apply to all boundaries on a path that have http.errors.propagation
  for (const name of pathSeq) {
    const b = boundariesByName[name]
    if (!b) continue

    const p = b.http?.errors?.propagation
    if (!p) continue

    const preserve = p.preserve_status_for ?? []
    if (!has(preserve, 403)) {
      throw new Error(`${where(b)}: http.errors.propagation.preserve_status_for must include 403`)
    }
  }
}
