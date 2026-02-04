# Async Jobs & Eventing Semantics (Large-scale Baseline)

## Goal

- 同期HTTPだけでは表現できない処理（遅延、外部連携、再試行、集約）を “別世界” にせず、同じ契約哲学で統一する。
- retry/replay/重複配信を安全に扱い、external_effect を二重実行しない。
- 監査・可観測性・権限（tenant/actor）をイベント/ジョブでも一貫させる。

## Scope

- job queue / scheduled jobs / background processing
- domain events（publish/consume）
- delivery retry / at-least-once / dedupe
- event schema / versioning
- dead-letter / poison message

## Invariants (Must Not Break)

### Identity & tenant continuity

- async job / event は必ず tenant_id を持つ。
- actor_id は可能な限り持つ（human起点の場合は必須、system起点は service actor として明示）。
- identity は “verified claims 相当”のコンテキストとして扱い、任意注入を許さない。

### Exactly-once effect (Semantic)

- delivery が at-least-once でも、external_effect/irreversible の意味論は “一度だけ” を保証する。
- そのために:
  - producer は `event_id` を付与
  - consumer（adapter 相当の最終地点）は dedupe を行う
  - idempotency（key/fingerprint）と接続する

### Event schema is versioned

- event は schema を持ち、version を持つ。
- breaking change は新 version として導入し、旧 version の受理期間（dual accept）を設ける。

### Retry & backoff are explicit

- retry は explicit な対象・回数・backoff を持つ。
- poison（繰り返し失敗）は dead-letter に送る（握りつぶさない）。

### Observability & audit

- job/event でも request_id 相当の相関ID（例: `trace_id` / `correlation_id`）を必須とする。
- external_effect を起こす job/event は audit event を生成する（または audit と相関できる情報を残す）。

## Failure modes

- event 重複で二重課金/二重作成が起きる。
- schema が暗黙で、consumer が壊れる。
- poison message が無限リトライしてワーカーが枯渇する。
- tenant/actor が欠落し、監査・原因追跡が不能になる。

## Related Specifications

- domain/idempotency.md
- domain/billing.md
- domain/observability.md
- rules/async_event_contract.md
- rules/audit_log_contract.md
