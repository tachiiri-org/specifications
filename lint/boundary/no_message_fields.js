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

export function lintNoMessageFields(boundary) {
  walk(boundary, (node, path) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return

    if (Object.prototype.hasOwnProperty.call(node, "message")) {
      const at = path.length ? path.join(".") : "(root)"
      throw new Error(`${where(boundary)}: natural language is forbidden in JSON: key "message" found at ${at}`)
    }
  })
}
