# Data Migration, Backfill & Reconciliation

## Goal

- 既存データの修正・補正・再計算を、安全かつ説明可能に行う。
- migration が tenant / audit / external_effect の意味論を壊さないようにする。

## Scope

- schema migration
- data backfill
- reprocessing / replay
- reconciliation jobs

## Definitions

- **Migration**
  - schema / structure の変更。

- **Backfill**
  - 既存データに対する再計算・補完。

- **Reconciliation**
  - 不整合検出と修正。

## Invariants (Must Not Break)

### Tenant isolation

- migration/backfill は必ず tenant_id を持つ。
- tenant を跨ぐ処理は禁止（例外は明示）。

### External effect prohibition

- backfill は external_effect を起こしてはならない。
- billing / webhook / external API 呼び出しは禁止。

### Auditability

- migration/backfill は audit event または log として識別可能である。

### Idempotency

- backfill job は再実行可能でなければならない。

## Failure modes

- 再計算で課金が再実行される
- tenant 混入が起きる
- 修正理由が追跡不能になる

## Related Specifications

- operational_semantics/data_tenant_safety.md
- operational_semantics/async_jobs_events.md
