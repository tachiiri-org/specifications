function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintRedactionMinimum(boundary) {
  const ob = boundary.observability
  if (!ob || ob.mode !== "enabled") return

  const r = ob.redaction
  if (!r || typeof r !== "object") {
    throw new Error(`${where(boundary)}: observability.mode=enabled requires observability.redaction`)
  }

  const drop = r.drop_headers
  if (!Array.isArray(drop)) {
    throw new Error(`${where(boundary)}: observability.redaction.drop_headers must be array`)
  }

  for (const h of ["authorization", "cookie", "set-cookie"]) {
    if (!has(drop, h)) {
      throw new Error(`${where(boundary)}: observability.redaction.drop_headers must include "${h}"`)
    }
  }

  const redactHeaders = r.redact_headers
  if (!Array.isArray(redactHeaders)) {
    throw new Error(`${where(boundary)}: observability.redaction.redact_headers must be array`)
  }
  if (!has(redactHeaders, "x-idempotency-key")) {
    throw new Error(`${where(boundary)}: observability.redaction.redact_headers must include "x-idempotency-key"`)
  }

  const strategy = r.redact_strategy
  if (!strategy || typeof strategy !== "object") {
    throw new Error(`${where(boundary)}: observability.redaction.redact_strategy must exist`)
  }
  if (strategy.default !== "hash") {
    throw new Error(`${where(boundary)}: observability.redaction.redact_strategy.default must be "hash"`)
  }
  if (strategy.hash_algorithm !== "sha256") {
    throw new Error(`${where(boundary)}: observability.redaction.redact_strategy.hash_algorithm must be "sha256"`)
  }
  if (strategy.salt_source !== "deployment_secret") {
    throw new Error(`${where(boundary)}: observability.redaction.redact_strategy.salt_source must be "deployment_secret"`)
  }
}
