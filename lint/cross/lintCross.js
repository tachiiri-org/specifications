import {
  loadTopology,
  loadBoundariesMap,
  loadOperationCatalog,
  loadConnectorsSpec
} from "../util/loaders.js"

import { lintTopologyIntegrity } from "./topology_integrity.js"
import { lintTimeoutRetryChain } from "./timeout_retry_chain.js"
import { lintTimeoutChainMonotonic } from "./timeout_chain_monotonic.js"
import { lintRequestIdPolicy } from "./request_id_policy.js"
import { lintErrorPreserve403 } from "./error_mapping_consistency.js"
import { lintIdempotencyE2E } from "./idempotency_end_to_end.js"
import { lintContractVersionRequirement } from "./contract_version_requirement.js"
import { lintBoundaryNameMatchesTopology } from "./boundary_name_matches_topology.js"

import { lintHeaderAllowlistChain } from "./header_allowlist_chain.js"
import { lintCookieEmitterChain } from "./cookie_emitter_chain.js"
import { lintOperationCatalogConsistency } from "./operation_catalog_consistency.js"
import { lintAuthzPdpOwnership } from "./authz_pdp_ownership.js"
import { lintOperationAuthzRequirements } from "./operation_authz_requirements.js"

import { lintForbiddenErrorCodeOrigin } from "./forbidden_error_code_origin.js"
import { lintContractVersionRollout } from "./contract_version_rollout.js"

// NEW (existing in your file)
import { lintBearerAuthorizationHeaderPassage } from "./bearer_authorization_header_passage.js"

// NEW (added for multi-tenant + external connectors)
import { lintRequiredClaimsInvariants } from "./required_claims_invariants.js"
import { lintExternalConnectorCoupling } from "./external_connector_coupling.js"

export async function lintCross() {
  const topology = loadTopology()
  lintTopologyIntegrity(topology)

  const boundaries = loadBoundariesMap()

  // Ensure boundary JSON "boundary" value matches topology reference
  lintBoundaryNameMatchesTopology(topology, boundaries)

  // Cross-ish rules independent from path enumeration
  lintHeaderAllowlistChain(boundaries)
  lintCookieEmitterChain(boundaries)

  // bearer auth must actually pass through allowlists
  lintBearerAuthorizationHeaderPassage(boundaries)

  // NEW: boundary-level invariants derived from boundary self-usage (claims.* references must be required_claims)
  for (const b of Object.values(boundaries)) {
    lintRequiredClaimsInvariants(b)
  }

  // Operation catalog consistency (routing/idempotency/authz coupling)
  const operationCatalog = loadOperationCatalog()
  lintOperationCatalogConsistency(operationCatalog, boundaries)
  lintOperationAuthzRequirements(operationCatalog)

  // NEW: external connector coupling (optional if connectors.json is present)
  // - operation_catalog: connector_id existence + external_effect coupling
  // - adapter_to_external boundary defaults stay within connector maxima
  const connectorsSpec = loadConnectorsSpec({ optional: true })
  if (connectorsSpec) {
    lintExternalConnectorCoupling(operationCatalog, connectorsSpec, boundaries)
  }

  // Phase 7: forbidden origin partitioning
  lintForbiddenErrorCodeOrigin(boundaries)

  // Phase 9: contract version rollout safety
  lintContractVersionRollout(boundaries)

  for (const path of topology.graph.paths) {
    const seq = path.boundaries
    lintTimeoutRetryChain(seq, boundaries)
    lintTimeoutChainMonotonic(seq, boundaries)
    lintRequestIdPolicy(seq, boundaries)
    lintErrorPreserve403(seq, boundaries)
    lintIdempotencyE2E(seq, boundaries)
    lintContractVersionRequirement(seq, boundaries)

    // PDP ownership
    lintAuthzPdpOwnership(seq, boundaries)
  }
}
