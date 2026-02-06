# Business Override & Exception Control (Constitution)

## Goal

- 営業/CS/Ops による “例外扱い” を裏仕様にせず、事故に変わるのを防ぐ。

## Scope

- quota/rate/budget/billing 等の override（原則）
- justification / expiry / audit の必須性（値は固定しない）

## Invariants (Must Not Break)

- override は必ず期限を持つ（expiry 必須）。
- override は必ず理由（justification）を持つ。
- override は audit 対象である。
- 恒久 override は禁止。
- override は環境差分で導入してはならない（仕様として明示する）。

## Related Specifications

- 00_constitution/policy_types.md
- 00_constitution/observability.md
- 20_operational_semantics/business_override_and_exception_control.md
