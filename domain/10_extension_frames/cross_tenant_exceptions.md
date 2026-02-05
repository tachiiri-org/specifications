# Cross-tenant Access & Exception Semantics

## Goal

- tenant isolation を破らずに、大規模運用で不可避な「例外」を型として定義する。
- 暗黙の tenant 跨ぎ処理を絶対に許さない。
- 例外導入時の破壊的影響を最小化する。

## Scope

- cross-tenant read/write
- aggregation / consolidation
- audit / billing exceptions

## Baseline Rule (Invariant)

- tenant を跨ぐ操作は **原則禁止**。
- 禁止を破る唯一の方法は、本 domain に従った明示的例外である。

## Exception Categories (Normative)

以下はいずれも **別 domain + contract-version 必須**：

### 1) Audit Aggregation

- 複数 tenant の audit を集約して参照する。
- 元 tenant_id は必ず保持される。

### 2) Billing Consolidation

- 親子 tenant / 組織単位での請求集約。
- 課金操作そのものは tenant 単位で完結する。

### 3) Managed Service Operations

- ops/service actor による限定的な横断操作。
- human actor は原則使用禁止。

## Required Semantics for Any Exception

- 明示的な exception type
- 対象 tenant の allowlist
- actor_type 制約
- 強制 audit
- sunset または期限

## Observability

- cross-tenant exception は必ず観測可能である：
  - exception_type
  - source_tenant_id
  - target_tenant_id(s)

## Failure modes

- tenant 跨ぎが静かに成立する。
- データ漏洩の原因が追跡できない。
- 運用都合で例外が常態化する。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/20_operational_semantics/data_tenant_safety.md
- domain/20_operational_semantics/billing.md
- domain/20_operational_semantics/support_and_ops.md
