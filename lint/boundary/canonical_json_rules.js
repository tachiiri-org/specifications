function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function shallowEqObj(a, b) {
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false
  const ak = Object.keys(a).sort()
  const bk = Object.keys(b).sort()
  if (ak.length !== bk.length) return false
  for (let i = 0; i < ak.length; i++) {
    if (ak[i] !== bk[i]) return false
    const k = ak[i]
    if (a[k] !== b[k]) return false
  }
  return true
}

export function lintCanonicalJsonRules(boundary) {
  const enc = boundary.http?.idempotency?.fingerprint?.body_hash?.input?.encoding
  if (!enc) return

  if (enc.type !== "canonical_json") return

  const rules = enc.rules
  const expected = {
    object_member_order: "sort_keys",
    omit_insignificant_whitespace: true,
    string_encoding: "utf-8",
    number_representation: "normalized_json_number",
    array_order: "preserve"
  }

  if (!rules || typeof rules !== "object") {
    throw new Error(`${where(boundary)}: canonical_json encoding requires input.encoding.rules`)
  }

  if (!shallowEqObj(rules, expected)) {
    throw new Error(
      `${where(boundary)}: canonical_json rules must exactly equal ${JSON.stringify(expected)} (got ${JSON.stringify(rules)})`
    )
  }
}
