# Rule: Incident Traceability Minimum (Correlation Keys)

## Goal

- エラー正規化（502 など）が増えても、障害時に “何が・どこで・誰に” を再構築できる最低限の相関キーを固定する。
- リクエスト/非同期/外部連携が混ざっても追跡が途切れないようにする。

## Applies

- domain/00_constitution/observability.md
- rules/request_id_policy.md
- domain/20_operational_semantics/async_jobs_events.md
- rules/audit_log_contract.md

## Rule (Must)

### 1) Required correlation keys per world

- HTTP request world:
  - request_id（x-request-id）
  - tenant_id（claims）
  - actor_id（claims、human 起点なら必須）
  - operation_key（catalog）
  - idempotency_key（hash 推奨）
- Async event/job world:
  - correlation_id（trace 相当、request_id と接続できること）
  - event_id（dedupe 用）
  - tenant_id
  - actor_id（human 起点なら必須）
- External-effect / audit world:
  - request_id
  - idempotency_key（相関できる形）
  - provider_transaction_id（取得できる場合は必須）

### 2) No leakage to response

- これらの相関キーは、レスポンスに追加フィールドとして混入させない。
- 観測（logs/metrics/tracing/audit）で担保する。

### 3) Redaction rules

- idempotency_key は平文でログしない（hash）。
- secrets/PII は rules/pii_redaction_contract.md に従い drop/hash。

## Failure modes

- 502 正規化で原因が一切辿れない。
- 非同期で追跡が途切れて二重実行を説明できない。
- 相関のために PII をログに出して事故る。
