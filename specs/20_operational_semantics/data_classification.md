# Data Classification & Propagation Semantics

## Goal

- データの機微度を語彙として固定し、派生・複製・分析時の事故を防ぐ。
- deletion / residency / audit と一貫した判断軸を提供する。

## Scope

- data sensitivity classification
- propagation targets
- interaction with deletion & residency

## Data Classification (Normative Vocabulary)

- **public**
- **internal**
- **confidential**
- **restricted**

## Invariants (Must Not Break)

### Classification Is Explicit (Must)

- すべての永続化データは分類を持つ。
- 暗黙の default classification を作らない。

### Propagation Is Controlled (Must)

- データの派生先（cache, search, analytics 等）は明示される。
- classification ごとに許可される propagation target は限定される。

### No Classification Downgrade (Must)

- 派生・複製によって機微度を下げてはならない。
- 低分類に変換する場合は anonymization 等の別仕様が必要（本仕様へ混ぜない）。

## Interaction with Other Domains

- deletion:
  - `20_operational_semantics/deletion_propagation_contract.md` に従う
- residency:
  - 法域・リージョン制約と整合する（20_operational_semantics/data_residency.md）
- audit:
  - restricted / confidential は audit 強度を引き上げうる（00_constitution/observability.md）

## Failure modes

- 高機微データが analytics に流入する。
- classification が曖昧で運用判断が割れる。
- 削除済みデータが派生先に残る。

## Related Specifications

- 20_operational_semantics/data_tenant_safety.md
- 20_operational_semantics/deletion_propagation_contract.md
- 20_operational_semantics/data_residency.md
- 00_constitution/observability.md
