function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintErrorAlgorithm(boundary) {
  const algo = boundary.http?.errors?.propagation?.algorithm
  if (!algo) {
    throw new Error(`${where(boundary)}: http.errors.propagation.algorithm is required`)
  }

  if (algo !== "preserve_then_map_then_shape") {
    throw new Error(`${where(boundary)}: unsupported error propagation algorithm: ${algo}`)
  }
}
