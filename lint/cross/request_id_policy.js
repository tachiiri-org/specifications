function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function has(arr, x) {
  return Array.isArray(arr) && arr.includes(x)
}

export function lintRequestIdPolicy(pathSeq, boundariesByName) {
  // Identify key boundaries by role (best-effort)
  const bffBoundary = boundariesByName[pathSeq[0]] // browser->bff
  if (!bffBoundary) return

  // 1) BFF should generate/overwrite request id
  const gen = bffBoundary.observability?.request_id?.generation
  if (!gen) {
    throw new Error(`${where(bffBoundary)}: observability.request_id.generation is required for BFF entry boundary`)
  }
  const genAt = gen.generate_if_missing_at ?? []
  const overwriteAt = gen.overwrite_at ?? []
  if (!has(genAt, "bff")) {
    throw new Error(`${where(bffBoundary)}: request_id.generation.generate_if_missing_at must include "bff"`)
  }
  if (!has(overwriteAt, "bff")) {
    throw new Error(`${where(bffBoundary)}: request_id.generation.overwrite_at must include "bff"`)
  }

  // 2) Browser-origin x-request-id should not be trusted (drop or overwritten)
  const inboundDrop = bffBoundary.headers?.inbound?.drop ?? []
  if (!has(inboundDrop, "x-request-id")) {
    throw new Error(`${where(bffBoundary)}: headers.inbound.drop must include "x-request-id" (do not trust browser request-id)`)
  }

  // 3) Downstream (gateway/adapter) must require inbound x-request-id
  for (let i = 1; i < pathSeq.length; i++) {
    const b = boundariesByName[pathSeq[i]]
    if (!b) continue

    const req = b.headers?.requirements?.inbound_must_include ?? []
    if (!has(req, "x-request-id")) {
      throw new Error(`${where(b)}: headers.requirements.inbound_must_include must include "x-request-id"`)
    }
  }
}
