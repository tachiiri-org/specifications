# Breaking Change Checklist (Repository-wide)

Use this checklist when changing any specification content.

If any item in **A** is true, the change is likely **MAJOR**.

## A. Normative meaning changes (MAJOR candidates)

- A **MUST / MUST NOT** requirement changed in meaning or scope.
- An **Invariant / Prohibition** changed (tightened or relaxed).
- A **Responsibility boundary** moved (who owns enforcement changed).
- A **Compatibility principle** changed (what counts as breaking/compatible changed).
- A **Vocabulary** term changed in meaning, was removed, renamed, or reclassified.
- A policy that prevents drift or post-hoc mixing was relaxed or removed.

## B. Additions that may still be breaking (review carefully)

- New vocabulary introduced that forces new inputs or interpretations for existing systems.
- New required behaviors introduced indirectly via “default semantics”.
- New cross-tenant / global exception paths introduced.

If any item in B applies, treat as MAJOR unless you can justify compatibility.

## C. Backward-compatible changes (typically MINOR)

- New documents added that do not change existing normative meaning.
- New normative rules that are explicitly scoped to new domains/contract-versions.
- Additional clarifications that do not alter requirements.

## D. Editorial changes (PATCH)

- Typos, wording cleanup, formatting changes with no semantic meaning change.
- Link fixes.
- Reordering sections without changing content meaning.

## Required PR notes

For changes that touch normative meaning, PR description MUST include:

- What changed (spec-ids)
- Why it changed
- Compatibility strategy (SemVer impact)
- Rollout/dual-accept notes if applicable
