function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintBoundaryNameMatchesTopology(topology, boundariesByName) {
  const topoFile = topology.__file ?? "rules/topology.json"
  const edges = topology.graph?.boundaries ?? []

  for (const e of edges) {
    const name = e.boundary
    const b = boundariesByName[name]
    if (!b) continue

    if (b.boundary !== name) {
      throw new Error(`${topoFile}: boundary "${name}" spec_file JSON has mismatched boundary value: ${where(b)}`)
    }
  }
}
