# Cross-tenant Access & Exception Semantics

## Goal

- tenant isolation を破らずに、大規模運用で不可避な「例外」を型として定義する。
- 暗黙の tenant 跨ぎ処理を絶対に許さない。
- 例外導入時の破壊的影響を最小化する。

## Scope

- cross-tenant read/write
- aggregation / consolidation
- audit / billing exceptions
- exception observability

## Baseline Rule (Invariant)

- tenant を跨ぐ操作は **原則禁止**。
- 禁止を破る唯一の方法は、本 domain に従った **明示的例外**である。

## Exception Introduction Rule (Must)

cross-tenant 例外を導入する場合、以下を満たさなければならない：

- **operation 単位で明示**される（catalog / schema metadata 等）
- **contract-version を上げる**
- 例外は type を持ち、観測・監査・期限を伴う

> 注:
>
> - 「環境差分」や「運用都合」で暗黙に横断を許すことは禁止。
> - “実装がたまたま横断できる”状態も仕様違反とみなす。

## Exception Categories (Normative)

以下はいずれも **contract-version 必須**：

### 1) Audit Aggregation

- 複数 tenant の audit を集約して参照する。
- 元 tenant_id は必ず保持される。

### 2) Billing Consolidation

- 親子 tenant / 組織単位での請求集約。
- 課金操作そのものは tenant 単位で完結する。

### 3) Managed Service Operations

- ops/service actor による限定的な横断操作。
- human actor は原則使用禁止。

## Required Semantics for Any Exception (Must)

- 明示的な `exception_type`
- 対象 tenant の allowlist（source/target の識別ができること）
- actor_type 制約
- 強制 audit
- sunset または期限（time-bounded）
- operation 単位の宣言（catalog/schema metadata）

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

- 00_constitution/actor_subject_tenant_model.md
- 20_operational_semantics/data_tenant_safety.md
- 20_operational_semantics/billing.md
- 20_operational_semantics/support_and_ops.md
- 00_constitution/observability.md
