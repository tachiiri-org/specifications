function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function isSortedAsc(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false
  }
  return true
}

export function lintPreserveStatusForHygiene(boundary) {
  const preserve = boundary.http?.errors?.propagation?.preserve_status_for
  if (!preserve) return

  if (!Array.isArray(preserve)) {
    throw new Error(`${where(boundary)}: http.errors.propagation.preserve_status_for must be array`)
  }
  for (const x of preserve) {
    if (typeof x !== "number" || !Number.isInteger(x)) {
      throw new Error(`${where(boundary)}: http.errors.propagation.preserve_status_for must contain integers only`)
    }
  }
  if (uniq(preserve).length !== preserve.length) {
    throw new Error(`${where(boundary)}: http.errors.propagation.preserve_status_for must not contain duplicates`)
  }
  if (!isSortedAsc(preserve)) {
    throw new Error(`${where(boundary)}: http.errors.propagation.preserve_status_for must be sorted ascending`)
  }
}
