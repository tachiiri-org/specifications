function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintContractVersionRequirement(pathSeq, boundariesByName) {
  for (const name of pathSeq) {
    const b = boundariesByName[name]
    if (!b) continue

    // Convention: browser_to_bff must NOT require contract version.
    if (name === "browser_to_bff") {
      const cv = b.http?.contract_version
      if (cv?.mode === "required") {
        throw new Error(`${where(b)}: browser_to_bff must not require x-contract-version`)
      }
      continue
    }

    // Internal boundaries must require contract version.
    if (name === "bff_to_gateway" || name === "gateway_to_adapter") {
      const cv = b.http?.contract_version
      if (!cv || cv.mode !== "required") {
        throw new Error(`${where(b)}: ${name} must require http.contract_version.mode="required"`)
      }
      if (!cv.header || typeof cv.header !== "string") {
        throw new Error(`${where(b)}: ${name} must define http.contract_version.header`)
      }
      if (!cv.accepted) {
        throw new Error(`${where(b)}: ${name} must define http.contract_version.accepted`)
      }
    }
  }
}
