# Specifications: Purpose & Principles

## Development Principles

- These documents define system specifications.
- Specifications are written primarily for AI and automated systems, and secondarily for humans.
- The system is designed under the assumption that it will grow large:
  - multiple teams and owners,
  - multiple frontends, BFFs, gateways, and adapters,
  - frequent incremental changes over a long lifespan.
- Therefore, specifications must prioritize:
  - explicit boundaries,
  - stable invariants,
  - deterministic behavior across components,
  - resistance to configuration drift.

## Normative Language (RFC 2119-style)

- **MUST / MUST NOT**: absolute requirements.
- **SHOULD / SHOULD NOT**: strongly recommended; deviation requires explicit rationale.
- **MAY**: optional.

## Document Types & Responsibility

### File responsibility (Must)

- Each file must have a single clear responsibility.
- File boundaries must match an executable responsibility boundary:
  - a deployable component boundary (front/bff/gateway/adapter), or
  - a contract boundary (front↔bff, bff↔gateway, gateway↔adapter), or
  - a rule boundary that can be enforced deterministically.

### Formats

- JSON files define concrete configuration decisions that can be applied mechanically.
- MD files define intent, scope, invariants, and enforcement rules.
- PUML files describe structure only.

### Normative vs Informative

- In MD:
  - Sections titled **Invariants (Must Not Break)** and **Rule (Must)** are **normative**.
  - Sections titled **Rationale / Notes / Examples / Failure modes / Change checklist** are **informative** unless explicitly marked otherwise.
- JSON is always normative where applicable (it drives runtime and lint).

## JSON Policies

- JSON may represent either:
  - a boundary-level configuration (preferred), or
  - an atomic configuration unit (archived when no longer primary).

- Boundary-level JSON files are the primary specifications.
- Atomic JSON files are kept only as archived reference materials.

- Split JSON properties by responsibility boundary
  (front↔bff, bff↔gateway, gateway↔adapter),
  not by reuse or abstraction.

- Avoid "swiss army knife" files.
- Do not create shared/common/base/policy JSON files.

- Do not reference other specification files from JSON.
- Each JSON file must be self-contained and contradiction-free.

## Vocabulary Stability (Must)

- Specification vocabularies are part of the contract and must be stable.
- Once introduced, top-level and domain-level vocabulary MUST NOT change
  without a breaking change.

### Canonical vocabularies (Must)

#### Operation catalog (canonical)

This repository uses the following canonical shape for the operation catalog JSON:

- Top-level metadata:
  - `spec_version` (integer >= 1)
  - `breaking_change` (boolean)
  - `effective_from` (string: release-id or YYYY-MM-DD)
- Catalog envelope:
  - `catalog` (object)
    - `operation_key_format` (string, canonical key format)
    - `items` (array, canonical array name)

Each operation item MUST have:

- `key`
- `service`
- `resource`
- `property`
- `operation`
- `classification`

Operation classification vocabulary is fixed to:

- `read | mutate | irreversible | external_effect`

Renaming or aliasing (e.g. `operations`, `categories`) is forbidden without a breaking change.

#### Boundary JSON vocabulary stability (canonical envelope)

- The top-level envelope is common:
  - `spec_version`, `breaking_change`, `effective_from`,
  - `boundary`, `deployment`,
  - `http`, `auth`, `headers`, `observability`, `limits`
- Boundary-specific concerns MUST live under boundary-specific subtrees,
  which are OPTIONAL and schema-validated (e.g., `cors`, `cookies`, `catalog`, `routing`).

- Unknown keys are rejected by schema/lint (at least for critical subtrees, progressively hardened).
  - Minimum hardened subtrees (Must):
    - `http`, `auth`, `headers`, `observability`, `limits`

- Commonality is enforced by schema/lint, not by shared JSON files.

## Consistency (Current)

- MD is the source of invariants; JSON is the source of concrete decisions.
- When an invariant exists in MD, all relevant boundary JSON must reflect it.
- Rules in `rules/` define cross-file invariants as deterministic checks.

## Mandatory machine-only metadata (Must)

- Every boundary JSON and every rule JSON must include:
  - `spec_version: integer (>=1)`
  - `breaking_change: boolean`
  - `effective_from: string (release-id or YYYY-MM-DD)`

## Drift prevention (Must)

- Drift prevention must be enforceable:
  - `rules/` directory defines cross-file invariants as deterministic checks.
  - changes that violate rules must fail CI.

## Deterministic algorithms (Must)

- When a field implies algorithmic behavior, the algorithm MUST be made explicit
  in boundary JSON or rules (and checked by lint), to prevent implementation drift.
  - Example: error mapping evaluation order
  - Example: canonical JSON number normalization

## Spec change policy (Must)

- Any breaking change MUST be expressed as one (or more) of:
  - boundary JSON `breaking_change: true` + contract-version update strategy, or
  - introducing a new operation key (preferred for semantic breaks), or
  - introducing a new domain/rule with a new contract-version.
- Backward-compatible changes SHOULD be dual-accepted during a rollout window
  (see `rules/contract_version_rollout.md`).

## Examples (Informative)

- Example blocks in MD are not normative by default.
- Example JSON fragments in MD MUST be treated as illustrative only unless referenced by a Rule section.
