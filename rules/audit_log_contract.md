# Rule: Audit Log Contract (Irreversible / External Effect)

## Goal

- 不可逆操作・外部副作用の証跡を必ず残し、後から説明・監査できる状態を保証する。
- 通常ログとは別の “監査イベント” として、必須フィールドを固定する。

## Rule (Must)

### Applies

- operation catalog の `classification` に `irreversible` または `external_effect` を含む operations
- 特に billing operations

### Required audit fields (Minimum)

audit event は少なくとも以下を含む（存在しない場合は null ではなく “欠落を禁止” し、取得不能なら別途 error とする）:

- `event_time`（ISO 8601）
- `tenant_id`
- `actor_id`
- `operation_key`（catalog の key）
- `result`（success|fail）
- `request_id`
- `idempotency_key`（hash可。少なくとも相関できる値）
- `resource_id`（取得できる場合は必須）
- billing の場合:
  - `amount_minor`（integer）
  - `currency`（ISO 4217）
  - `provider`（string）
  - `provider_transaction_id`（取得できる場合は必須）

### Redaction

- audit event に PII/secret を含めない（必要なら token 化された参照のみ）。

## Failure modes

- 返金・課金の説明ができない。
- request-id だけでは追跡できず、証跡が分断する。
