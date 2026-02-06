# Async Jobs & Eventing Semantics (Large-scale Baseline)

## Goal

- async 実行を “別世界” にせず、actor/tenant/authz/idempotency を同期と同一哲学で扱う。

## Invariants (Must Not Break)

### Identity & tenant continuity

- job/event は必ず `tenant_id` を持つ。
- `actor_id` は executor（service/ops actor）を表す。
- human 起点の場合は `initiator_actor_id` を必須とする。
- identity は verified claims 相当として扱い、任意注入を許さない。

### Executor vs Initiator separation

- executor（actor_id）:
  - AuthZ / 実行責務の主体
- initiator:
  - audit / 相関 / 説明責任の主体
- initiator を AuthZ 入力に使用してはならない。

### Exactly-once effect (Semantic)

- producer は `event_id` を付与。
- consumer は dedupe を行い、副作用を一度に限定する。

### Event schema is versioned (Required)

- event は `event_type` と `event_version` により識別され、schema version を持つ。
- version skew / dual accept / sunset / breaking change の扱いは
  `20_operational_semantics/event_version_rollout.md` を正とする。

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

- 20_operational_semantics/idempotency.md
- 20_operational_semantics/billing.md
- 20_operational_semantics/event_version_rollout.md
- 00_constitution/observability.md
