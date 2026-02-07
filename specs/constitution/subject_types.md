# Subject Types (Human vs Non-human) - Versioned Extension

## Goal

- subject（“誰として”）の語彙を拡張する場合に備え、導入条件と安全柵を固定する。

## Scope

- subject_type の enum 拡張
- actor_type と subject の関係
- versioning と互換性原則

## Invariants (Must Not Break)

- 現行 contract では subject_type は "human" のみ。
- subject_type の enum 拡張は breaking とみなし、互換性戦略（contract-version/claims_set_version 等）を伴う。
- executor は actor のみ（AuthZ入力の主体は actor）。subject は executor を置換しない。
- subject 情報も verified claims 由来であること（注入禁止）。

## Related Specifications

- constitution/actor_subject_tenant_model.md
- constitution/authorization.md
- constitution/observability.md
- interaction_edges/authn_methods.md
