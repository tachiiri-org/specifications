# Async Jobs & Eventing Semantics (Large-scale Baseline)

## Goal

- async 実行を “別世界” にせず、actor/tenant/authz/idempotency を同期と同一哲学で扱う。
- delivery（配送）と effect（副作用）を分離し、at-least-once delivery 下で effect を一度に制限する。

## Invariants (Must Not Break)

### Identity & tenant continuity (Must)

- job/event は必ず `tenant_id` を持つ（global resource の例外は 00_constitution/global_defaults.md に従う）。
- job/event の `actor_id` は executor を表す。
- async の executor は **service/ops actor** でなければならない（human actor は must-not）。
- human 起点の追跡が必要な場合は `initiator_actor_id` を必須とする（ただし AuthZ 入力に使用してはならない）。
- `subject_id` / `subject_type` は service/ops executor の job/event では must-not（human identity は initiator 側で表現する）。

### Executor vs Initiator separation (Must)

- executor（actor_id）:
  - AuthZ / 実行責務の主体
- initiator:
  - audit / 相関 / 説明責任の主体
- initiator を AuthZ 入力に使用してはならない。

### Delivery vs Effect (Semantic)

- delivery（配送）は at-least-once を前提としてよい。
- effect（副作用）は **一度に限定**されなければならない。

### Dedupe / Exactly-once effect (Must)

- producer は `event_id` を付与する。
- consumer は dedupe を行い、副作用を一度に限定する。
- dedupe の最低限の一意性スコープは、少なくとも以下を含むこと（具体は L1）:
  - tenant_id
  - event_type
  - event_id
  - producer identity（producer/service identifier 等）
- event_id だけで十分でない場合、追加のスコープ要素を L1 で固定する（実装推論禁止）。

### Event schema is versioned (Required)

- event は `event_type` と `event_version` により識別され、schema version を持つ。
- version skew / dual accept / sunset / breaking change の扱いは
  `20_operational_semantics/event_version_rollout.md` を正とする。

### Retry & backoff are explicit (Must)

- retry は explicit な対象・回数・backoff を持つ（値は L1/環境で決める）。
- poison（繰り返し失敗）は dead-letter に送る（握りつぶさない）。

### Observability & audit (Must)

- job/event でも request_id 相当の相関ID（例: `trace_id` / `correlation_id`）を必須とする。
- external_effect / irreversible を起こす job/event は audit event を生成する（または audit と相関できる情報を残す）。
- event_type / event_version / event_id は観測可能であること。

## Failure modes

- event 重複で二重課金/二重作成が起きる。
- schema が暗黙で、consumer が壊れる。
- poison message が無限リトライしてワーカーが枯渇する。
- tenant/actor が欠落し、監査・原因追跡が不能になる。
- executor と initiator が混同され、責任分界が崩れる。

## Related Specifications

- 20_operational_semantics/idempotency.md
- 20_operational_semantics/billing.md
- 20_operational_semantics/event_version_rollout.md
- 00_constitution/actor_subject_tenant_model.md
- 00_constitution/observability.md
- 00_constitution/global_defaults.md
