function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function eqArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])
}

export function lintHeaderPipelineOrder(boundary) {
  const expected = ["normalize", "drop_hop_by_hop", "explicit_drop", "allow", "default_drop"]
  const actual = boundary.headers?.pipeline_order

  if (!Array.isArray(actual)) {
    throw new Error(`${where(boundary)}: headers.pipeline_order must be array`)
  }

  if (!eqArray(actual, expected)) {
    throw new Error(
      `${where(boundary)}: headers.pipeline_order must exactly equal ${JSON.stringify(expected)} (got ${JSON.stringify(actual)})`
    )
  }
}
