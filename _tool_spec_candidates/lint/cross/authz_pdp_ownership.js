function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintAuthzPdpOwnership(pathSeq, boundariesByName) {
  // PDP must be only at the last boundary (adapter-side responsibility),
  // and only if authz subtree exists.
  for (let i = 0; i < pathSeq.length; i++) {
    const b = boundariesByName[pathSeq[i]]
    if (!b) continue

    const pdp = b.authz?.pdp
    if (!pdp) continue

    // Must be adapter
    if (pdp !== "adapter") {
      throw new Error(`${where(b)}: authz.pdp must be "adapter"`)
    }

  }
}
