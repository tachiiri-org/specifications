# Domain Index (L0)

This package distributes layered specification documents (MD) as a stable, versioned npm artifact.

- Specifications are written primarily for AI and automated systems, and secondarily for humans.
- The documents define vocabulary, responsibility boundaries, invariants/prohibitions, and compatibility principles.
- Concrete runtime values, catalogs, and tool-specific implementation details belong outside this repository.

## Layer definitions

- **L0**: This specification repository (`specs/` and its documents).
- **L1**: Tool-spec repos (separate repositories that hold machine contracts such as `def/`, `schemas/`, and `lint/`).
- The directory names under `specs/` are semantic domains, not layers.

## Repository / Package Layout

- `specs/constitution/` — constitutional vocabulary, responsibility boundaries, invariants, prohibitions (L0)
- `specs/operational_semantics/` — operational semantics, safety, migration, compatibility governance
- `specs/interaction_edges/` — external interaction edges (HTTP, browser boundary, session, webhook, etc.)
- `specs/service_ops_governance/` — operational governance (change/release/incident/security ops)

Machine-friendly index:

- `spec.manifest.json` — stable spec-id based lookup (paths, layer, status, related_ids)

## Canonical entry points

- `specs/constitution/actor_subject_tenant_model.md`
- `specs/constitution/authorization.md`
- `specs/constitution/identity.md`
- `specs/constitution/global_defaults.md`
- `specs/constitution/claims_compatibility.md`
- `specs/operational_semantics/data_tenant_safety.md`
- `specs/interaction_edges/http.md`
- `specs/service_ops_governance/README.md`

## Consumption

See `docs/consumption.md`.

## Versioning policy (SemVer)

- **MAJOR**: breaking change in normative meaning (Must/Prohibitions/Invariants/Compatibility principles)
- **MINOR**: backward-compatible additions to normative specs
- **PATCH**: editorial fixes with no semantic change
