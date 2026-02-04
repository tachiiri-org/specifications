# Rule: Payment/Billing Idempotency (Billing-grade)

## Goal

- billing の external_effect（課金・返金等）で二重実行を防ぐ。
- provider 側の重複排除と内部の重複排除を整合させる。

## Rule (Must)

### Applies

- operation catalog の `classification` に `external_effect` を含む operations
- 特に billing/\* の charge/capture/refund/create 相当

### Requirements

- 対象 operation は:
  - idempotency.required = true
  - adapter は idempotency owner である
- adapter は provider 呼び出しに対しても idempotency を適用する:
  - provider が Idempotency-Key を持つ場合、内部 `x-idempotency-key` を安全に派生/マッピングして送る
  - provider が event_id を返す場合、それを監査（audit）に記録する

### Minimum retention

- billing-grade の idempotency 記録 TTL は **24時間以上**（短縮は breaking とみなす）。

## Failure modes

- 同一ユーザー操作が二重課金になる。
- provider 側と内部側の idempotency がずれて不整合になる。
