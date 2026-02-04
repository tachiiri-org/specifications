function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

export function lintCsrfFailureContract(boundary) {
  const csrf = boundary.http?.csrf
  if (!csrf || csrf.mode !== "enabled") return

  const onFail = csrf.on_fail
  if (!onFail || typeof onFail !== "object") {
    throw new Error(`${where(boundary)}: http.csrf.mode=enabled requires http.csrf.on_fail`)
  }

  if (onFail.status !== 403) {
    throw new Error(`${where(boundary)}: http.csrf.on_fail.status must be 403`)
  }

  if (!isNonEmptyString(onFail.error_code)) {
    throw new Error(`${where(boundary)}: http.csrf.on_fail.error_code must be non-empty`)
  }

  if (onFail.error_code !== "csrf_forbidden") {
    throw new Error(`${where(boundary)}: http.csrf.on_fail.error_code must be "csrf_forbidden"`)
  }

  const compare = csrf.token?.validate?.compare
  if (compare !== "constant_time") {
    throw new Error(`${where(boundary)}: http.csrf.token.validate.compare must be "constant_time"`)
  }
}
