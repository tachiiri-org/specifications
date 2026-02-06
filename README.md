# Domain Index (L0)

This package distributes layered specification documents (MD) as a stable, versioned npm artifact.

- Specifications are written primarily for AI and automated systems, and secondarily for humans.
- The documents define vocabulary, responsibility boundaries, invariants/prohibitions, and compatibility principles.
- Concrete runtime values, catalogs, and tool-specific implementation details belong outside this repository.

## Repository / Package Layout

- `specs/00_constitution/` — constitutional vocabulary, responsibility boundaries, invariants, prohibitions (L0)
- `specs/20_operational_semantics/` — operational semantics, safety, migration, compatibility governance
- `specs/30_interaction_edges/` — external interaction edges (HTTP, browser boundary, session, webhook, etc.)
- `specs/40_service_operations_governance/` — operational governance (change/release/incident/security ops)

Machine-friendly index:

- `spec.manifest.json` — stable spec-id based lookup (paths, layer, status, related_ids)

## Canonical entry points

- `specs/00_constitution/actor_subject_tenant_model.md`
- `specs/00_constitution/authorization.md`
- `specs/00_constitution/identity.md`
- `specs/00_constitution/global_defaults.md`
- `specs/00_constitution/claims_compatibility.md`
- `specs/20_operational_semantics/data_tenant_safety.md`
- `specs/30_interaction_edges/http.md`
- `specs/40_service_operations_governance/README.md`

## Consumption

See `docs/consumption.md`.

## Versioning policy (SemVer)

- **MAJOR**: breaking change in normative meaning (Must/Prohibitions/Invariants/Compatibility principles)
- **MINOR**: backward-compatible additions to normative specs
- **PATCH**: editorial fixes with no semantic change
