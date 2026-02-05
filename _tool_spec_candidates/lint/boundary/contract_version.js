function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintContractVersion(boundary) {
  const cv = boundary.http?.contract_version
  if (!cv) return

  if (cv.mode === "required") {
    if (!cv.accepted) {
      throw new Error(`${where(boundary)}: contract_version.mode=required but accepted is missing`)
    }
  }

  if (cv.accepted?.mode === "explicit_list") {
    if (!Array.isArray(cv.accepted.items) || cv.accepted.items.length === 0) {
      throw new Error(`${where(boundary)}: contract_version.accepted.items must be non-empty`)
    }
  }
}
