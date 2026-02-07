# Delegation Context Transport (Constitution)

## Goal

- delegation/impersonation を内部境界で安全に運搬し、注入や混入を防ぐ。
- transport が増えても「信頼境界」「受理条件」「AuthZ入力禁止」が壊れないよう固定する。

## Scope

- internal boundaries における delegation context の transport（意味論）
- trust boundary と受理条件（値は固定しない）
- 具体の境界I/O（HTTPヘッダ名、token profile、schema）は interaction_edges (L0) と L1 (tool-spec repos) に委譲する

## Invariants (Must Not Break)

- delegation context は verified token claims としてのみ運搬する。
- `x-*` 等のヘッダ注入、query/body 注入は禁止。
- 受理できる delegation context の形は claims_set_version / contract-version 戦略で明示する。
- delegation context は AuthZ 入力に使用しない（制約・監査・相関用途に限定）。
- delegation context の存在有無で、既存 AuthZ の意味が暗黙に変化してはならない（must-not）。

## Informative: Shape guidance (Non-normative)

- delegation_mode: delegation | impersonation
- delegated_subject_id / delegated_subject_type（該当する場合）
- delegate_id / delegate_type（該当する場合）
- delegation_reason（短文）
- expires_at
- delegation_chain（v1では禁止。導入時はversioned）
