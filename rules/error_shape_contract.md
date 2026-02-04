# Rule: Error Shape Contract (Machine-enforceable)

## Goal

- 境界で返す error の shape を契約として固定し、追加フィールド混入で互換性が壊れる事故を防ぐ。
- 利用者向けレスポンスを最小・安定にしつつ、内部観測は別経路に分離する。

## Scope

- boundary\_\*.http.errors.propagation.always_use_error_shape = true
- gateway / bff の境界レスポンス

## Rule (Must)

- always_use_error_shape = true の場合、エラーレスポンス body は必ず以下の shape を満たす:

{
"error": {
"code": "string",
"message": "string",
"request_id": "string"
}
}

- `error` 直下の追加フィールドは禁止（互換性崩壊を防ぐ）。
- `error.code` は contract の一部であり、空文字は禁止する。
- `error.message` は一般的な最小説明に留め、内部原因を含めない。
- `request_id` は observability の request-id と一致する。

## Enforcement (Must)

- CI で以下を機械検査する:
  - error shape の必須フィールド存在
  - 追加フィールド禁止（errorオブジェクト内）
  - content-type が application/json であること
- 内部原因（error_class 等）は observability にのみ出す（レスポンスに含めない）。

## Non-goals

- 利用者へのデバッグ情報提供
- adapter 内部例外の透過

## Failure modes

- 追加フィールドが混入し、クライアントが依存してしまう。
- request_id が欠落し、障害時に追跡不能になる。

## Change checklist

- 新しい error_code を追加したか
  - rules/error_mapping.md と整合するか
- error message を変えたか
  - 内部原因が漏れていないか
- request_id が必ず入るか
