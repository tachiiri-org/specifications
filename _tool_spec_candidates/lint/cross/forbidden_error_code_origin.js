function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function walk(obj, visit, path = []) {
  if (!obj || typeof obj !== "object") return
  visit(obj, path)
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, visit, path.concat(String(i))))
  } else {
    for (const [k, v] of Object.entries(obj)) {
      walk(v, visit, path.concat(k))
    }
  }
}

export function lintForbiddenErrorCodeOrigin(boundariesByName) {
  const allowedGeneratorBoundary = "gateway_to_adapter"

  for (const b of Object.values(boundariesByName)) {
    const file = where(b)

    walk(b, (node, path) => {
      if (!node || typeof node !== "object" || Array.isArray(node)) return

      // "生成"っぽい箇所に限定（on_fail / on_missing / on_exceed など）
      // ここでは pragmatically に action=reject + error_code="forbidden" を検出する
      if (node.action === "reject" && node.error_code === "forbidden") {
        if (b.boundary !== allowedGeneratorBoundary) {
          const at = path.length ? path.join(".") : "(root)"
          throw new Error(`${file}: forbidden (error_code="forbidden") must be generated only by ${allowedGeneratorBoundary}; found at ${at}`)
        }
      }
    })
  }
}
