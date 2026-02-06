# Delegation & Impersonation (Operational Semantics)

## Goal

- delegation/impersonation を運用上の事故（恒久化・監査欠落・期限切れの扱い不一致）にしない。
- 失敗意味論と enforcement 責務を固定する。
- executor/initiator/subject の憲法（single executor / non-authz initiator）を壊さない。

## Scope

- expiry enforcement
- audit requirements（具体フィールド集合はL1へ）
- deny/default semantics
- support/break-glass との衝突回避（運用上の取り扱い）
- idempotency との結合（external_effect/irreversible）

## Invariants (Must Not Break)

### Expiry enforcement (Must)

- expires_at 到達後は delegation/impersonation を無効として扱う。
- 無効時のデフォルトは deny（fail-closed）。
- 例外（grace 等）を導入する場合は operation 単位で明示し、互換性戦略を伴う。

### Audit coupling (Must)

- delegation/impersonation を伴う操作は audit 必須。
- audit は操作結果（allow/deny と実行結果）と相関可能でなければならない。
- executor（actor）と initiator/delegate を区別して追跡できること。

### Idempotency interaction (Must)

- external_effect/irreversible を伴う delegation/impersonation 操作は idempotency を必須とする。
- idempotency owner は executor（actor）であり、delegate/initiator は owner にならない。

## Failure modes

- 期限切れの扱いが境界ごとに割れて、恒久特権化する。
- 監査が欠落し説明不能になる。
- delegate と executor が混ざり、責任主体が不明確になる。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/00_constitution/authorization.md
- domain/00_constitution/observability.md
- domain/20_operational_semantics/idempotency.md
- domain/20_operational_semantics/support_and_ops.md
