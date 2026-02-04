# Rule: PII / Secret Redaction Contract

## Goal

- PII や secret のログ混入を仕様として防ぐ。
- 境界が増えても redaction がドリフトしないようにする。

## Rule (Must)

### Always drop (Never log)

- `authorization`
- `cookie`
- `set-cookie`
- external provider secrets / api keys（ヘッダ・クエリ・body いずれも）

### Hash (Do not log in cleartext)

- `x-idempotency-key`
- session identifiers（もしログ対象にするなら hash のみ）
- webhook event_id（必要なら hash でも可）

### Applies

- boundary JSON の `observability.redaction`（drop/hash の具体設定）
- すべての component のログ出力

## Failure modes

- 漏洩時の被害が最大化する。
- 本番ログが規制・監査要件に抵触する。
