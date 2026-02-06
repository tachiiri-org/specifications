# Data Tenant Safety (Isolation, Containment & Restore Safety)

## Goal

- tenant 境界（isolation）を、保存・派生・復旧・運用操作の全経路で破らない。
- “静かな混入”（別 tenant のデータが見える/書ける/復旧で混ざる）を仕様レベルで排除する。
- global resource（tenant_scoped=false）や cross-tenant 例外を、暗黙ではなく型として隔離する。

## Scope

- tenant-scoped data の保存・派生・移送（cache/index/warehouse/logs/backup 等）
- restore / backfill / replay / reconciliation
- global resource（tenant_scoped=false）との境界
- cross-tenant exception の導入条件（型・監査・期限）
- enforcement の責務（最終は adapter）

## Invariants (Must Not Break)

### 1) Tenant boundary is the primary containment

- すべての tenant-scoped data は単一 tenant に属する。
- 永続化・派生先（cache/search/analytics/logs/backup 等）でも tenant_id を保持し、境界を失ってはならない。
- tenant_id の取得元は verified identity context（claims/session 等）に限定し、payload/header から推論しない。

### 2) Cross-tenant is forbidden by default

- tenant を跨ぐ read/write は原則禁止。
- 禁止を破る唯一の方法は、`domain/20_operational_semantics/cross_tenant_exceptions.md` に従った明示的例外である。
- “運用都合” “環境差分” “内部だから” による暗黙許可は禁止。

### 3) Global resource is explicitly typed (Exception)

- global resource は例外であり、暗黙に作らない。
- global resource を扱う場合は `tenant_scoped=false` を明示し、
  観測上の tenant_id は `"__global__"` を取りうる（ただし tenant-scoped operation では使用禁止）。
- global write は ops/service actor に限定し、human actor の global write を許可しない。

### 4) Restore safety (No contamination)

- backup/restore は tenant 混入を絶対に起こしてはならない。
- restore boundary（snapshot/log replay 等）を跨いでも、tenant_id の整合性が保たれる必要がある。
- purge 済み PII を restore で復活させてはならない（削除波及契約に従う）。

### 5) Backfill/replay safety (No external effect by default)

- migration/backfill/reprocessing は、デフォルトで external_effect を起こしてはならない。
- external_effect を伴う例外を導入する場合は operation 単位で明示し、監査・idempotency を必須とする。

## Failure modes

- 別 tenant のデータが検索/キャッシュ/分析に混入する。
- restore により tenant 境界が崩れ、漏洩が発生する。
- “内部処理”として暗黙の cross-tenant が成立する。
- global resource が暗黙に増殖し、human actor が越境 write できてしまう。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/00_constitution/global_defaults.md
- domain/20_operational_semantics/cross_tenant_exceptions.md
- domain/20_operational_semantics/deletion_propagation_contract.md
- domain/20_operational_semantics/disaster_recovery.md
- domain/20_operational_semantics/data_residency.md
- domain/20_operational_semantics/data_persistence.md
- domain/20_operational_semantics/data_classification.md
- domain/20_operational_semantics/data_migration_backfill_reconciliation.md
