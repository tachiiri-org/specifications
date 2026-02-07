# Non-goal Taxonomy (Repository-wide)

## Purpose

- This file defines a shared taxonomy for describing non-goals consistently across domains.
- This repository distinguishes:
  - **Defined specifications** (normative, enforceable),
  - **Operational governance specifications** (L0 ops governance domain),
  - **Staged work** (planned / under discussion).

## Clarification: Operations vs Non-goals

Human operations are **not** a non-goal.

- Operational _mechanics_ and _state transitions_
  are defined in `service_ops_governance/`.
- Organizational structure, staffing, schedules, and tools
  remain out-of-scope.

## Taxonomy

### Permanent Non-goals

- Areas that this specification set intentionally does not cover on a permanent basis.

### Deferred-but-Scoped (Planned, Framed)

- Areas that are intentionally planned and framed, but are not yet defined as enforceable specifications.
- “Deferred-but-Scoped” is **not** excluded; it is included as a roadmap with constraints.
- The constraints (how it must be introduced, what it must not break) MUST be declared in the staging frame.
- Detailed models, concrete rules, and machine-checkable artifacts are introduced later through promotion.

### Out-of-Scope Implementation Details

- Vendor selections, concrete numeric thresholds, protocol-level choices, and other implementation details excluded from semantic contracts.

## Operational Rules for Deferred-but-Scoped Areas (Must)

### 1) Staging is discoverable but non-normative

- Deferred-but-Scoped content MUST be placed under the repository’s staging area
  (see `next_todos/` in `constitution/repo_layout.md`).
- Staging documents exist to make upcoming scope explicit, but MUST NOT be treated as normative inputs.

### 2) No silent mixing into defined semantics

- Post-hoc mixing of new authorization inputs, claims, actor/subject semantics, or exception paths
  into existing defined domains MUST NOT occur silently.
- Any such evolution MUST be introduced via explicit promotion (L1 tool-spec repos plus def/schemas) and versioning.

### 3) Promotion rule (Staged → Defined)

Promotion from Deferred-but-Scoped staging into defined specifications MUST:

- Declare a contract-version or equivalent compatibility strategy when semantics change
- Follow compatibility and breaking-change policy
- Respect dual-accept rollout rules where applicable
- Preserve all existing prohibitions and invariants
- Add machine-checkable enforcement where applicable (L1 tool-spec repos and/or schemas/)

### 4) Reference boundary

- Defined specifications (in `constitution/`, `operational_semantics/`, `interaction_edges/`,
  L1 tool-spec repos, `def/`, `schemas/`) MUST NOT depend on staging documents.
- Staging documents MAY reference defined specs as prerequisites.
- Cross-staging references are allowed, but MUST remain non-normative.

## Usage in Domain Documents (Recommended)

- Domain-level `Non-goals` sections SHOULD classify entries as:
  - `Permanent Non-goals`
  - `Deferred-but-Scoped`
  - `Out-of-Scope Implementation Details`

- When a `Deferred-but-Scoped` entry is listed, it SHOULD include:
  - the staging frame reference (file path),
  - what invariants it must not break,
  - and the intended promotion target(s) (L1 tool-spec repos and/or def/schemas).
