# Automation vs Human Operations Boundary (Constitution)

## Goal

- 人間操作と自動化操作を同一視しない。
- 誰が判断したのか分からない operation を排除する。

## Scope

- automation actor の位置づけ（語彙は増やさない）
- human approval boundary の原則
- audit attribution の原則

## Invariants (Must Not Break)

- automation は human と同一の権限を自動取得してはならない。
- automation は actor_type を増設せず、service actor として表現する（権限は明示的付与のみ）。
- irreversible/external_effect を実行する automation は、強い監査要件を満たさなければならない。
- human 承認が必要な操作は operation 単位で明示される（暗黙判定禁止）。

## Related Specifications

- constitution/actor_subject_tenant_model.md
- constitution/observability.md
- constitution/operation.md
- operational_semantics/automation_operations.md
