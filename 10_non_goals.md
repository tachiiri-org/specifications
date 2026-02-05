# Non-goal Taxonomy (Repository-wide)

## Purpose

- This file defines a shared taxonomy for describing non-goals consistently across domains.

## Taxonomy

### Permanent Non-goals

- Areas that this specification set intentionally does not cover on a permanent basis.

### Deferred-but-Scoped

- Areas where the frame is already part of the specification (vocabulary, invariants, and introduction conditions are defined), while detailed models and implementations are staged later.
- Deferred-but-Scoped is **not** treated as “excluded non-goal”; it is treated as “included by scoped frame.”
- Introduction MUST occur through explicit domain + contract-version evolution; silent mixing is forbidden.

### Out-of-Scope Implementation Details

- Vendor selections, concrete numeric thresholds, and protocol-level implementation choices excluded from semantic contracts.

## Operational Rules for Deferred-but-Scoped Areas

- Deferred-but-Scoped domains are considered “in specification” once a domain frame exists.
- Detailed implementation may be explored under `pending/` and promoted to `domain/`, `rules/`, `def/`, or `schemas/`.
- Promotion MUST remain compatible with contract-version governance, compatibility policy, and dual-accept rollout strategy.
- Existing prohibitions (including post-hoc claim injection into AuthZ inputs) MUST NOT be violated.

## Usage in Domain Documents

- Domain-level `Non-goals` sections SHOULD classify entries as: `Permanent Non-goals`, `Deferred-but-Scoped`, and `Out-of-Scope Implementation Details`.
