# Data Tenant Safety, Ownership & Persistence Contract

## Goal

- マルチテナントSaaSで最重要の事故（tenant跨ぎ読み書き、削除漏れ、復旧不整合）を仕様として防ぐ。
- persistence の設計判断を暗黙知にせず、境界・実装差分を機械検査できる形にする。
- AuthZ（operation-based）と ownership（resource単位）を、永続化・検索・監査に矛盾なく接続する。

## Scope

- tenant scoping（DB/ストレージ/検索/キャッシュ）
- resource_id の生成規約
- ownership check（adapter責務）とデータアクセス
- retention/deletion/backup/restore（最低限の契約）
- cache key / index key の tenant 含有

## Invariants (Must Not Break)

### Tenant key everywhere

- 永続化されるすべての tenant-scoped record は `tenant_id` を必ず持つ。
- すべての primary/unique key（論理キー含む）は、tenant 分離を破らない形で設計される:
  - 例: (tenant_id, resource_id) の複合キー
  - 例: resource_id がグローバル一意なら、tenant_id を必ず別カラムとして保持し、クエリに必須条件として入れる。

### Query must be tenant-bound

- tenant-scoped data の read/update/delete は、必ず tenant_id を条件に含む。
- “tenant_id無し検索”を許す場合は、明示的に global resource として domain で宣言し、別 contract-version とする。

### Cache/index scoping

- cache key / secondary index / search index のキーには tenant_id を必ず含める。
- tenant_id を含まない key は “global” とみなし、扱いは別仕様とする。

### Resource identifier strategy

- resource_id の生成戦略は domain ごとに固定し、推測耐性・衝突耐性を満たす:
  - 推奨: ULID/UUIDv7 等（順序性が必要なら明示）
- resource_id に可変情報（email/name 等）を混ぜてはならない。

### Ownership is adapter-owned

- ownership（レコード単位のアクセス可否）判断は adapter の責務である。
- gateway/BFF は ownership の最終判断をしてはならない（早期拒否は可）。

### Retention & deletion are explicit

- retention は暗黙無期限にしない。
- category（PII/Billing/Logs/Audit）ごとに retention と deletion 方針を明示する。
- “削除”は論理削除/物理削除のいずれか（または両方）を category ごとに固定し、曖昧にしない。

### Backup/restore coherence (Minimum)

- Billing/Audit は復旧時に不整合が出ないよう、整合単位（スナップショット境界）を明示する。
- restore 手順で tenant 跨ぎ混入を起こさない（tenant_id の境界を崩さない）。

## Required specifications (Must)

- 各 domain は以下を持つ（少なくとも “PII/Billing/Logs/Audit” に対して）:
  - data category と retention/deletion 方針
  - encryption at rest の前提
- adapter は observability に tenant_id / actor_id / operation_key / resource_id（可能なら）を相関として記録できる（レスポンスには含めない）。

## Failure modes

- tenant 跨ぎ読み書きが静かに成立する（最悪の事故）。
- cache/index が tenant を含まず、別 tenant のデータが見える。
- deletion/retention が曖昧で、規制/監査/漏洩時の被害が最大化する。
- restore で tenant が混ざり、原因追跡不能になる。

## Related Specifications

- domain/resource_ownership.md
- domain/authorization.md
- domain/data_persistence.md
- rules/tenant_persistence_contract.md
- rules/audit_log_contract.md
