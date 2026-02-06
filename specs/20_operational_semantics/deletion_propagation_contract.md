# Deletion Propagation Contract

## Goal

- “削除” を単一ストレージ操作ではなく、
  データ派生構造全体に対する意味論として固定する。
- cache / search / analytics / backup を含む波及漏れを防ぐ。
- restore による「削除済みデータの復活」を防止する。

## Scope

- tenant-scoped data
- PII / billing / audit / logs categories
- derived storage (cache, index, warehouse, logs, backup)

## Core Concepts

- **logical deletion**
  - 論理フラグによる削除
  - restore 可能

- **physical deletion (purge)**
  - 実体削除
  - restore 不可

- **propagation target**
  - 元データから派生・複製される保存先

## Invariants (Must Not Break)

### Deletion is semantic, not local (Must)

- 削除は「その storage から消えた」では完結しない。
- 派生先すべてに対して一貫した削除意味論を持つ。

### Tenant boundary preservation (Must)

- propagation target は tenant 境界を壊してはならない。
- tenant_scoped なデータは、派生先でも tenant_id を含む。

### Restore safety (Must)

- purge 済みデータは restore で復活してはならない。
- logical deletion の restore は、明示された boundary 内でのみ許可される。

## Required Deletion Semantics

tenant_scoped なデータカテゴリは、最低限以下を定義できなければならない:

- deletion_mode:
  - none | logical | physical
- retention expectation（期間または条件）
- propagation_targets:
  - cache
  - search_index
  - analytics_warehouse
  - logs
  - backup
  - audit_store（該当する場合）

各 propagation target は以下の意味論を持つ:

- deletion_strategy:
  - tombstone
  - hard_delete
  - ttl_expire
  - reindex
  - redact_only（logs/audit向け）
- restore_behavior:
  - never_restore
  - conditional_restore
  - restore_with_filter

## Special Categories

### PII

- physical deletion（purge）が最終状態であること。
- purge 後は restore 不可であること。

### Billing / Audit

- append-only が原則。
- “削除” は不可視化または tombstone によって表現される。
- restore 境界（snapshot / log replay）は固定される。

### Logs

- logs は運用観測のための派生先であり、原則として append-only 相当である。
- logs に対する “削除” は次を満たす:
  - PII/secret を含めない（redaction/drop/hash を優先）
  - 既に出力済みログの完全削除を前提としない（redact_only/ttl_expire 等で意味論を表現する）
- “ログがあるから削除不要” のような扱いは禁止（retention は明示）。

## Failure Modes (What this spec prevents)

- DB から消えたが search index に残る。
- cache に削除済み tenant のデータが残り誤表示される。
- backup restore により削除済み PII が復活する。
- logs/audit が削除方針と矛盾し、説明不能になる。

## Related Specifications

- 20_operational_semantics/data_persistence.md
- 20_operational_semantics/data_classification.md
- 20_operational_semantics/disaster_recovery.md
- 00_constitution/observability.md
