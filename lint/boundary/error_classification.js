function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function mustIncludeAll(boundary, path, arr, required) {
  for (const x of required) {
    if (!arr.includes(x)) {
      throw new Error(`${where(boundary)}: ${path} must include "${x}"`)
    }
  }
}

function mustBeNonEmptyStringArray(boundary, path, arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`${where(boundary)}: ${path} must be non-empty array`)
  }
  for (const x of arr) {
    if (!isNonEmptyString(x)) {
      throw new Error(`${where(boundary)}: ${path} must contain non-empty strings only`)
    }
  }
  if (uniq(arr).length !== arr.length) {
    throw new Error(`${where(boundary)}: ${path} must not contain duplicates`)
  }
}

export function lintErrorClassification(boundary) {
  const p = boundary.http?.errors?.propagation
  if (!p) return // only applies when propagation exists

  const ec = boundary.observability?.error_classification
  if (!ec || typeof ec !== "object") {
    throw new Error(`${where(boundary)}: observability.error_classification is required when http.errors.propagation exists`)
  }

  if (ec.mode !== "enabled") {
    throw new Error(`${where(boundary)}: observability.error_classification.mode must be "enabled"`)
  }

  if (ec.log_only !== true) {
    throw new Error(`${where(boundary)}: observability.error_classification.log_only must be true`)
  }

  mustBeNonEmptyStringArray(boundary, "observability.error_classification.required_fields", ec.required_fields)
  mustIncludeAll(boundary, "observability.error_classification.required_fields", ec.required_fields, [
    "error_class",
    "fault_domain"
  ])

  mustBeNonEmptyStringArray(boundary, "observability.error_classification.allowed_error_class", ec.allowed_error_class)
  mustBeNonEmptyStringArray(boundary, "observability.error_classification.allowed_fault_domain", ec.allowed_fault_domain)

  // Enforce stable enum vocabulary (prevents drift across components)
  const requiredErrorClass = [
    "validation",
    "authn",
    "authz",
    "timeout",
    "upstream",
    "network",
    "bug",
    "overload"
  ]
  const requiredFaultDomain = ["front", "bff", "gateway", "adapter", "external"]

  mustIncludeAll(boundary, "observability.error_classification.allowed_error_class", ec.allowed_error_class, requiredErrorClass)
  mustIncludeAll(boundary, "observability.error_classification.allowed_fault_domain", ec.allowed_fault_domain, requiredFaultDomain)
}
