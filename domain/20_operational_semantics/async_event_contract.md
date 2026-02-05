# Rule: Async Event/Job Contract (Machine-enforceable)

## Goal

- event/job を “第二の契約境界” として扱い、重複・互換性・監査を機械的に保証する。
- async 実行においても actor / initiator / tenant の意味論を崩さない。

## Applies

- schemas/events/\*_/_.json
- rules/events_catalog.json
- domain/20_operational_semantics/async_jobs_events.md
- domain/00_constitution/actor_subject_tenant_model.md

## Rule (Must)

### 1) Schema presence

- event/job type ごとに schema ファイルが存在する:
  - `schemas/events/{event_key}.vN.json`
- schema は少なくとも以下を含む:
  - `event_type`
  - `version`
  - `payload` schema
  - `required_context`

### 2) Required context (Normative)

`required_context` は必ず以下を含む:

- `tenant_id`
- `event_id`（dedupe 用、一意）
- `correlation_id`（request/trace 相当）
- `actor_id`
  - **executor を表す actor**
  - 原則として service / ops actor
- `actor_type`（human|service|ops）

human 起点である場合は、必ず以下を追加する:

- `initiator_actor_id`
- `initiator_actor_type`（human|service|ops）

> 注:
>
> - `actor_id` は AuthZ・実行責務の主体
> - `initiator_actor_id` は監査・追跡用途のみ（AuthZ 入力禁止）

`subject_id` / `subject_type` は human actor の場合にのみ存在しうる。

- `subject_type` は存在する場合 `"human"` 固定とする（現時点）。
- service/ops actor に `subject_id` / `subject_type` が存在してはならない（must-not）。

### 3) Dedupe requirement for effectful consumers

- classification が `irreversible` または `external_effect` の consumer は:
  - `event_id` による dedupe を必須とする
  - 既処理 event_id は「同一結果の再生」として扱う

### 4) Retry policy

- retry は explicit でなければならない:
  - max_attempts
  - retry_on（分類）
  - backoff
- max_attempts の無制限は禁止。

### 5) Compatibility

- breaking change は version を上げる。
- dual accept は期限必須。

## Failure modes

- executor と initiator が混同され、認可や監査が崩れる。
- event_id 不備で二重実行が起きる。
- retry 無限で障害が増幅する。
