import { resolveSpecFile, fileExists } from "../util/loaders.js"

export function lintTopologyIntegrity(topology) {
  const topoFile = topology.__file ?? "rules/topology.json"

  const nodes = new Set(topology.graph?.nodes ?? [])
  const boundaries = topology.graph?.boundaries ?? []
  const paths = topology.graph?.paths ?? []

  if (nodes.size === 0) throw new Error(`${topoFile}: graph.nodes must be non-empty`)
  if (!Array.isArray(boundaries) || boundaries.length === 0)
    throw new Error(`${topoFile}: graph.boundaries must be non-empty`)
  if (!Array.isArray(paths) || paths.length === 0) throw new Error(`${topoFile}: graph.paths must be non-empty`)

  const boundaryIndex = new Map()
  for (const b of boundaries) {
    if (!nodes.has(b.from_node)) {
      throw new Error(`${topoFile}: boundary "${b.boundary}" from_node not in graph.nodes: ${b.from_node}`)
    }
    if (!nodes.has(b.to_node)) {
      throw new Error(`${topoFile}: boundary "${b.boundary}" to_node not in graph.nodes: ${b.to_node}`)
    }

    if (boundaryIndex.has(b.boundary)) {
      throw new Error(`${topoFile}: duplicate graph.boundaries boundary name: ${b.boundary}`)
    }
    boundaryIndex.set(b.boundary, b)

    const specPath = resolveSpecFile(b.spec_file)
    if (!fileExists(specPath)) {
      throw new Error(`${topoFile}: spec_file does not exist for boundary "${b.boundary}": ${specPath}`)
    }
  }

  for (const p of paths) {
    const seq = p.boundaries ?? []
    if (!Array.isArray(seq) || seq.length === 0) {
      throw new Error(`${topoFile}: path "${p.path_id}" boundaries must be non-empty array`)
    }

    // 1) referenced boundaries exist
    for (const name of seq) {
      if (!boundaryIndex.has(name)) {
        throw new Error(`${topoFile}: path "${p.path_id}" references unknown boundary: ${name}`)
      }
    }

    // 2) chain continuity: to_node == next.from_node
    for (let i = 0; i < seq.length - 1; i++) {
      const cur = boundaryIndex.get(seq[i])
      const next = boundaryIndex.get(seq[i + 1])
      if (cur.to_node !== next.from_node) {
        throw new Error(
          `${topoFile}: path "${p.path_id}" boundary chain mismatch at index ${i}: "${cur.boundary}" to_node=${cur.to_node} != next "${next.boundary}" from_node=${next.from_node}`
        )
      }
    }
  }
}
