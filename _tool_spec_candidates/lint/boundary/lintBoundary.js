import { loadBoundariesWithFiles } from "../util/loaders.js"
import { lintContractVersion } from "./contract_version.js"
import { lintErrorAlgorithm } from "./error_algorithm.js"
import { lintIdempotencyRetry } from "./idempotency_retry.js"
import { lintModeDependentFields } from "./mode_dependent_fields.js"
import { lintErrorShapeContract } from "./error_shape_contract.js"
import { lintCsrfFailureContract } from "./csrf_failure_contract.js"
import { lintRateLimitConfig } from "./rate_limit_config.js"
import { lintObservabilityEventsRequired } from "./observability_events_required.js"
import { lintHeaderPipelineOrder } from "./header_pipeline_order.js"
import { lintCanonicalJsonRules } from "./canonical_json_rules.js"
import { lintNoMessageFields } from "./no_message_fields.js"
import { lintErrorClassification } from "./error_classification.js"
import { lintTokenProfile } from "./token_profile.js"
import { lintAuthzContract } from "./authz_contract.js"

// NEW
import { lintInternalRoutingContract } from "./internal_routing_contract.js"
import { lintHeaderRequirementsShape } from "./header_requirements_shape.js"
import { lintBrowserSessionCsrfCoupling } from "./browser_session_csrf_coupling.js"
import { lintRedactionMinimum } from "./redaction_minimum.js"
import { lintPreserveStatusForHygiene } from "./preserve_status_for_hygiene.js"
import { lintHeadersLowercase } from "./headers_lowercase.js"
import { lintObservabilityEventsVocabulary } from "./observability_events_vocabulary.js"
import { lintIdempotencyEnabledContract } from "./idempotency_enabled_contract.js"

export async function lintBoundary() {
  const boundaries = loadBoundariesWithFiles()
  for (const b of boundaries) {
    lintNoMessageFields(b)

    lintContractVersion(b)
    lintErrorAlgorithm(b)
    lintIdempotencyRetry(b)
    lintModeDependentFields(b)
    lintErrorShapeContract(b)
    lintCsrfFailureContract(b)
    lintRateLimitConfig(b)
    lintObservabilityEventsRequired(b)
    lintHeaderPipelineOrder(b)
    lintCanonicalJsonRules(b)
    lintErrorClassification(b)
    lintTokenProfile(b)
    lintAuthzContract(b)

    // NEW
    lintInternalRoutingContract(b)
    lintHeaderRequirementsShape(b)
    lintBrowserSessionCsrfCoupling(b)
    lintRedactionMinimum(b)
    lintPreserveStatusForHygiene(b)
    lintHeadersLowercase(b)
    lintObservabilityEventsVocabulary(b)
    lintIdempotencyEnabledContract(b)
  }
}
