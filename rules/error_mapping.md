# Rule: Error Mapping & Normalization

## Goal

- 下流（adapter / 外部API）の不安定さを上流に漏らさない。
- 利用者に返す HTTP error を契約として安定させる。

## Rule (Must)

- adapter のエラーは、gateway / BFF で **正規化**する。
- 想定外の 4xx / 5xx は安全側（502）に寄せる。
- 利用者に意味がある error status のみを preserve する。

## Evaluation order (Must)

- error mapping は実装差分が出やすいので、評価順序を契約として固定する。
- boundary JSON の `http.errors.propagation.algorithm` は必須であり、以下のいずれかでなければならない:
  - `preserve_then_map_then_shape`

### Algorithm: preserve_then_map_then_shape

1. Preserve:
   - upstream status が `preserve_status_for` に含まれる場合、status は維持する。
2. Map:
   - preserve されなかった場合のみ:
     - 4xx は `map_4xx_to`
     - 5xx は `map_5xx_to`
     - network error は `network_error_to`
3. Shape:
   - `always_use_error_shape: true` の場合、レスポンスは error shape に正規化する。

## Preserved Errors (Contract)

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 413 Payload Too Large
- 415 Unsupported Media Type
- 422 Unprocessable Entity
- 429 Too Many Requests
- 431 Request Header Fields Too Large
- 503 Service Unavailable

それ以外は原則 502 に正規化する。

## Rationale

- adapter や外部 API のエラー仕様は変化しやすい。
- error を透過すると、利用者側が adapter 実装に依存してしまう。
- error shape を統一することで、クライアント実装・監視が安定する。
- evaluation order が曖昧だと、403/404 などが 502 に化けて運用不能になる。

## Applies to

- http_errors
- http_retry
- observability_events
- observability_metrics

## Expected enforcement (How)

- lint:
  - `http.errors.propagation.algorithm` の必須化
  - preserve/map の整合（preserve に含まれる status が map されないこと）
- runtime:
  - gateway/BFF の境界で algorithm に従い正規化

## Non-goals

- adapter 内部原因の詳細な表現
- クライアント向けのデバッグ情報提供

## Failure modes

- adapter のエラーコードがそのまま表に出て互換性が壊れる。
- preserve list から 403 が漏れて、環境差で壊れる。
- evaluation order が実装ごとに異なり、status が境界で変化する。

## Change checklist

- 新しい error status を返す実装を入れたか
  - preserve list に追加したか
- retry 対象エラーか
  - retry policy と矛盾しないか
- observability（metrics / logs）で区別できるか
- `http.errors.propagation.algorithm` を満たすか
