# Rule: Error Classification Contract for Observability

## Goal

- 利用者向け status/error shape を固定したまま、内部で原因切り分けできる状態を保証する。
- "502 正規化" が増えても、運用上の分類が必ず残るようにする。

## Rule (Must)

### Applies

- http.errors.propagation が存在する boundary（gateway/bff 等）

### Contract

- エラー時に observability 側へ以下の分類フィールドを残す:
  - error_class
  - fault_domain
- これらの分類フィールドは **レスポンスには含めない**（log_only）。

### Required config

- 対象 boundary は boundary JSON に `observability.error_classification` を必ず持つ。
- `observability.error_classification` は以下を満たす:
  - mode = enabled
  - log_only = true
  - required_fields に ["error_class","fault_domain"] を含む
  - allowed_error_class / allowed_fault_domain は空配列禁止（explicitly enumerated）

### Allowed enums

- allowed_error_class:
  - validation | authn | authz | timeout | upstream | network | bug | overload
- allowed_fault_domain:
  - front | bff | gateway | adapter | external

## Failure modes

- 502 が増えて原因が区別不能になる（分類が無い）。
- 実装ごとに分類キーがブレて、集計/アラートが壊れる。
- 分類をレスポンスへ混入させ、契約が崩れる。
