# Disaster Recovery (DR) Semantics

## Goal

- 障害復旧（DR）を「運用手順」ではなく「意味論」として固定する。
- マルチSaaS・マルチリージョン環境において、
  復旧時に起きがちな二重実行・監査欠落・tenant混入を防ぐ。
- DR時も通常時と同じ“契約の世界”が成立することを保証する。

## Scope

- RPO / RTO の語彙
- restore / failover semantics
- idempotency / external effect の扱い
- tenant isolation during restore

## Core Vocabulary

- **RPO (Recovery Point Objective)**
  - 復旧時に許容される最大のデータ損失範囲

- **RTO (Recovery Time Objective)**
  - サービス復旧までに許容される最大時間

- **restore boundary**
  - データを整合的に復旧する単位
  - snapshot / log replay 等で定義される

- **degraded mode**
  - DR中に限定機能で稼働する状態

## Invariants (Must Not Break)

### DR does not change semantics

- DR は “状態” を変えても “意味” を変えてはならない。
- 通常時に禁止されている操作は、DRを理由に許可されてはならない。

### No double execution of irreversible effects

- external_effect / irreversible 操作は、
  DR / failover / retry を跨いでも **一度だけ** 実行される。
- 二重実行を検知・防止できない operation は、
  DR 計画に組み込まれてはならない。

### Idempotency is mandatory for DR safety

- external_effect を伴う operation は、
  idempotency を前提として意味論が定義される。
- idempotency の記録は restore boundary を跨いでも失われてはならない。

### Tenant isolation during restore

- restore は tenant 境界を破壊してはならない。
- 復旧されたデータは必ず tenant_id と整合する。
- tenant 間の混入は重大障害として扱われる。

## Restore Semantics

### Read operations

- restore / degraded mode においても read は原則許可される。
- ただし staleness（古さ）は RPO の範囲内で明示的に許容される。

### Mutating / irreversible operations

- DR中に以下を許可してはならない：
  - external_effect
  - irreversible mutation
- 許可される場合は例外として明示されなければならない。

## Observability & Audit

- DR モード移行・解除は audit 対象とする。
- 以下は必ず観測可能である：
  - DR開始/終了時刻
  - 適用された restore boundary
  - degraded mode の有無

## Failure Modes (What this spec prevents)

- failover中に二重課金・二重通知が発生する。
- auditが失われ、後から障害説明ができなくなる。
- restoreでtenantが混入し、データ漏洩が起きる。

## Related Specifications

- domain/idempotency.md
- domain/billing.md
- domain/data_tenant_safety.md
- rules/audit_log_contract.md
