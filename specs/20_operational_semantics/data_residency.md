# Data Residency, Sovereignty & Jurisdiction (Tenant-level Policy)

## Goal

- 法域・データ主権（GDPR / residency 等）を、tenant の属性とデータカテゴリの契約として固定する。
- persistence / backup / analytics / propagation が暗黙に越境しないようにする。
- “運用判断”ではなく “仕様語彙”で placement と制約を表現できるようにする。

## Scope

- tenant の residency 属性（region/policy）
- データカテゴリ（PII/Billing/Logs/Audit）の越境可否
- backup/restore/analytics への波及（propagation）
- 例外導入の versioning

## Definitions

### Residency region

- データを保存すべきリージョン（例: eu, us, jp）。
- 表現の具体値は def/ の設定を正とし、domain では語彙のみ固定する。

### Sovereignty policy

- 越境可否・暗号化要件・保持期間などの制約セット。

## Invariants (Must Not Break)

### 1) Tenant-level authority

- residency は tenant の属性として扱い、tenant を跨いだ推論をしない。
- tenant_scoped data は tenant の residency に従う。

### 2) Category-aware constraints

- データは少なくとも以下のカテゴリに分類される（20_operational_semantics/data_persistence.md）:
  - PII / Billing / Logs / Audit
- 越境（cross-region）可否はカテゴリごとに明示できる必要がある。
- “全部同じ扱い”を暗黙にしない。

### 3) Propagation is explicit

- 派生保存先（cache/search/warehouse/backup/logs）への波及は明示する（20_operational_semantics/deletion_propagation_contract.md）。
- analytics/warehouse が residency 制約を破る設計は禁止（導入するなら別 policy として明示）。

### 4) Restore safety

- backup/restore は residency と tenant isolation を破壊してはならない（20_operational_semantics/disaster_recovery.md, 20_operational_semantics/data_tenant_safety.md）。
- purge 済み PII を restore で復活させない（20_operational_semantics/deletion_propagation_contract.md）。

## Recommended minimal config surface (Informative)

- tenant:
  - residency.region
  - residency.policy_id (string)
- category policy:
  - allow_cross_region_replication: true/false
  - allowed_regions: list
  - encryption_required: true/false
  - retention_tier: short/long (具体期間は def/)

## Non-goals

- GDPR 等の法令条文の網羅。
- 国別税制・監査制度の詳細。

## Failure modes

- backup/analytics が暗黙越境し、規制違反になる。
- logs/audit の保持が residency と矛盾し、説明不能になる。
- restore で tenant 混入や purge 復活が起きる。

## Related Specifications

- 20_operational_semantics/data_persistence.md
- 20_operational_semantics/data_tenant_safety.md
- 20_operational_semantics/deletion_propagation_contract.md
- 20_operational_semantics/disaster_recovery.md
- 00_constitution/observability.md
