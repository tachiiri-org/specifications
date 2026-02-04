function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isSortedAsc(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (String(arr[i - 1]) > String(arr[i])) return false
  }
  return true
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintContractVersionRollout(boundariesByName) {
  for (const b of Object.values(boundariesByName)) {
    const cv = b.http?.contract_version
    if (!cv) continue

    // internal boundaries policy (best-effort based on boundary name)
    const isInternal = b.boundary === "bff_to_gateway" || b.boundary === "gateway_to_adapter"
    if (isInternal) {
      if (cv.mode !== "required") {
        throw new Error(`${where(b)}: internal boundary must have http.contract_version.mode="required"`)
      }
      if (!cv.header || cv.header !== "x-contract-version") {
        throw new Error(`${where(b)}: internal boundary must use http.contract_version.header="x-contract-version"`)
      }

      const reqIn = b.headers?.requirements?.inbound_must_include ?? []
      const reqOut = b.headers?.requirements?.outbound_must_include ?? []
      if (!has(reqIn, "x-contract-version")) {
        throw new Error(`${where(b)}: headers.requirements.inbound_must_include must include "x-contract-version"`)
      }
      if (!has(reqOut, "x-contract-version")) {
        throw new Error(`${where(b)}: headers.requirements.outbound_must_include must include "x-contract-version"`)
      }
    }

    const accepted = cv.accepted
    if (!accepted) continue

    if (accepted.mode === "explicit_list") {
      const items = accepted.items
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error(`${where(b)}: http.contract_version.accepted.items must be non-empty for explicit_list`)
      }

      const uniq = new Set(items)
      if (uniq.size !== items.length) {
        throw new Error(`${where(b)}: http.contract_version.accepted.items must not contain duplicates`)
      }

      if (!isSortedAsc(items)) {
        throw new Error(`${where(b)}: http.contract_version.accepted.items must be sorted ascending (string order)`)
      }

      // breaking_change semantics
      if (items.length > 1 && b.breaking_change === true) {
        throw new Error(`${where(b)}: breaking_change=true is incompatible with multi-accepted contract versions`)
      }
      if (items.length === 1 && b.breaking_change === false) {
        // allowed (steady state). no-op
      }
      if (items.length === 1 && b.breaking_change === true) {
        // allowed (hard cutover)
      }
    }
  }
}
