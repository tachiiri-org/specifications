# Rule: Async Event/Job Contract (Machine-enforceable)

## Goal

- event/job を “第二の契約境界” として扱い、重複・互換性・監査を機械的に保証する。

## Applies

- schemas/events/\*\*.json
- def/events.json（event catalog, optional）
- domain/async_jobs_events.md

## Rule (Must)

### 1) Schema presence

- event/job type ごとに schema ファイルが存在する:
  - `schemas/events/{event_type}.json`
- schema は少なくとも:
  - `event_type`
  - `version`
  - `payload` schema
  - `required_context`（tenant_id, correlation_id 等）
    を含む。

### 2) Required context (Minimum)

- required_context は必ず以下を含む:
  - `tenant_id`
  - `correlation_id`（request_id/trace相当）
  - `event_id`（dedupe用）
- human 起点の event は `actor_id` を必須とする。

### 3) Dedupe requirement for effectful consumers

- classification が `irreversible` または `external_effect` に相当する consumer は:
  - `event_id` による dedupe を必須とする
  - 既処理 event_id は “同一結果の再生” として扱う（再実行しない）

### 4) Retry policy

- event/job の retry は explicit でなければならない:
  - max_attempts
  - retry_on（分類: network/timeout/overload 等）
  - backoff
- max_attempts の無制限は禁止。

### 5) Compatibility

- schema の breaking change は version を上げる。
- dual accept を行う場合、受理 version の範囲を宣言し、移行期限を持つ。

## Failure modes

- event_id が無く二重実行が起きる。
- version が曖昧で consumer が壊れる。
- retry が無限で障害が増幅する。
