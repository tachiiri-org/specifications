function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0
}

export function lintAuthzContract(boundary) {
  const az = boundary.authz
  if (!az) return

  if (az.mode !== "operation_based") {
    throw new Error(`${where(boundary)}: authz.mode must be "operation_based"`)
  }

  if (az.pdp !== "adapter") {
    throw new Error(`${where(boundary)}: authz.pdp must be "adapter"`)
  }

  const pep = az.pep
  if (!Array.isArray(pep) || pep.length === 0) {
    throw new Error(`${where(boundary)}: authz.pep must be non-empty array`)
  }

  const dc = az.decision_context
  if (!dc || typeof dc !== "object") {
    throw new Error(`${where(boundary)}: authz.decision_context is required`)
  }
  if (dc.operation_source !== "route.operation") {
    throw new Error(`${where(boundary)}: authz.decision_context.operation_source must be "route.operation"`)
  }
  if (dc.identity_source !== "verified_token_claims_only") {
    throw new Error(`${where(boundary)}: authz.decision_context.identity_source must be "verified_token_claims_only"`)
  }

  const od = az.on_denied
  if (!od || typeof od !== "object") {
    throw new Error(`${where(boundary)}: authz.on_denied is required`)
  }
  if (od.status !== 403) {
    throw new Error(`${where(boundary)}: authz.on_denied.status must be 403`)
  }
  if (!isNonEmptyString(od.error_code) || od.error_code !== "forbidden") {
    throw new Error(`${where(boundary)}: authz.on_denied.error_code must be "forbidden"`)
  }

  const ob = az.observability?.on_denied
  if (!ob || typeof ob !== "object") {
    throw new Error(`${where(boundary)}: authz.observability.on_denied is required`)
  }
  if (ob.error_class !== "authz") {
    throw new Error(`${where(boundary)}: authz.observability.on_denied.error_class must be "authz"`)
  }
  if (!isNonEmptyString(ob.emit_event)) {
    throw new Error(`${where(boundary)}: authz.observability.on_denied.emit_event must be non-empty string`)
  }
  if (!Array.isArray(ob.log_fields) || ob.log_fields.length === 0) {
    throw new Error(`${where(boundary)}: authz.observability.on_denied.log_fields must be non-empty array`)
  }

  // Hardening: operation-catalog–based authz contract must be explicit
  const ps = az.policy_source
  if (!ps || typeof ps !== "object") {
    throw new Error(`${where(boundary)}: authz.policy_source is required when authz exists`)
  }
  if (ps.type !== "operation_catalog") {
    throw new Error(`${where(boundary)}: authz.policy_source.type must be "operation_catalog"`)
  }
  if (!isNonEmptyString(ps.operation_key_format)) {
    throw new Error(`${where(boundary)}: authz.policy_source.operation_key_format must be non-empty string`)
  }

  const cb = az.catalog_binding
  if (!cb || typeof cb !== "object") {
    throw new Error(`${where(boundary)}: authz.catalog_binding is required when authz exists`)
  }
  if (cb.mode !== "required") {
    throw new Error(`${where(boundary)}: authz.catalog_binding.mode must be "required"`)
  }
  if (cb.source !== "rules/operation_catalog.json") {
    throw new Error(`${where(boundary)}: authz.catalog_binding.source must be "rules/operation_catalog.json"`)
  }
}
