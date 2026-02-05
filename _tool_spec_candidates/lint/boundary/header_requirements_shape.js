function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isLowercaseHeaderName(s) {
  return typeof s === "string" && s.trim().length > 0 && s === s.toLowerCase()
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function validateList(boundary, path, arr) {
  if (!Array.isArray(arr)) {
    throw new Error(`${where(boundary)}: ${path} must be array`)
  }
  for (const x of arr) {
    if (!isLowercaseHeaderName(x)) {
      throw new Error(`${where(boundary)}: ${path} must contain lowercase non-empty strings only (got ${JSON.stringify(x)})`)
    }
  }
  if (uniq(arr).length !== arr.length) {
    throw new Error(`${where(boundary)}: ${path} must not contain duplicates`)
  }
}

export function lintHeaderRequirementsShape(boundary) {
  const req = boundary.headers?.requirements
  if (!req) return

  if (typeof req !== "object") {
    throw new Error(`${where(boundary)}: headers.requirements must be object`)
  }

  if ("inbound_must_include" in req) {
    validateList(boundary, "headers.requirements.inbound_must_include", req.inbound_must_include)
  }
  if ("outbound_must_include" in req) {
    validateList(boundary, "headers.requirements.outbound_must_include", req.outbound_must_include)
  }
}
