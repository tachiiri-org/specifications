# Rule: Error Classification for Observability

## Goal

- 利用者向けの status を固定したまま、内部で原因切り分けを可能にする。

## Rule (Must)

- gateway / adapter / bff は、エラー時に内部観測フィールドを付与してよい（レスポンスには含めない）。
- 最低限以下をログ/イベントに残す:
  - `error_class`: validation | authn | authz | timeout | upstream | network | bug | overload
  - `fault_domain`: front | bff | gateway | adapter | external
- upstream の status がある場合、`upstream_status` として記録してよい（レスポンスへは出さない）。

## Non-goals

- 利用者へのデバッグ情報提供

## Failure modes

- 502 が増えると原因が全く分からない
- upstream の不安定さが同じ顔になる
