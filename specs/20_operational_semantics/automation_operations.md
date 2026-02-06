# Automation Operations (Operational Semantics)

## Goal

- automation の暴走、誤作動、責任主体の曖昧化を運用意味論で止める。
- automation を human と同一視せず、executor/initiator/audit を分離する。

## Scope

- scheduled jobs / remediation
- approval boundary（operation単位）
- idempotency/audit の結合

## Invariants (Must Not Break)

### Identity model alignment (Must)

- automation の executor は service actor として表現される（00_constitution/automation_human_boundary.md）。
- human 起点が存在する場合は initiator として表現し、executor と混同しない。
- initiator を AuthZ 入力に使用してはならない。

### Idempotency originator (Must)

- automation の idempotency key は originator（通常は automation executor / service actor）が生成する。
- human initiator（存在する場合）は idempotency owner にならない。
- idempotency の最終 owner は adapter である（20_operational_semantics/idempotency.md）。

### Approval boundary (Must)

- human approval が必要な operation は operation 単位で明示する。
- approval が必要な operation は、approval 無しの実行を deny（fail-closed）するのがデフォルト。
- “approval 必要かどうか” を実装推論や環境差分で決めてはならない。

### Audit coupling (Must)

- automation が irreversible/external_effect を実行する場合、audit を必須とする。
- audit は “automation 実行（executor）” と “起点（initiator）” を区別して相関できなければならない。
- audit に PII/secret を含めない（redaction 方針に従う）。

## Failure modes

- automation が human と同等権限で暴走する。
- approval が暗黙化して抜け道ができる。
- 監査が欠落し説明不能になる。
- idempotency が弱く、再試行で二重実行が起きる。

## Related Specifications

- 20_operational_semantics/idempotency.md
- 00_constitution/automation_human_boundary.md
- 00_constitution/actor_subject_tenant_model.md
- 00_constitution/observability.md
