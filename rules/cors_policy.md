# Rule: CORS Policy

## Goal

- 認証付きブラウザリクエストを安全に受け付ける。
- オリジン・ヘッダ・メソッドの許可範囲を最小に保ち、例外を管理可能にする。

## Rule (Must)

- 認証情報（cookie / credentials）を扱うエンドポイントは、原則 **same-origin only** とする。
- CORS は BFF 境界でのみ有効化する。
- 許可する origin / headers / methods は explicit list とする。
- ブラウザから送る必要があるカスタムヘッダは、必ず CORS allow headers に含める。

## Rationale

- credentials 付き CORS は設定ミスが即セキュリティ事故につながる。
- gateway / adapter は「ブラウザを知らない」層であり、CORS を持ち込まない方が境界が明確になる。
- same-origin を原則にすることで、CSRF / cookie / CSP の設計と整合する。

## Applies to

- cors_allow_credentials
- cors_allowed_origin
- cors_allowed_headers
- cors_allowed_methods
- cors_exposed_headers
- cors_vary
- http_csrf

## Expected enforcement (How)

### BFF

- `Access-Control-Allow-Credentials` を有効にできる。
- allowed origins:
  - 原則 same-origin
  - 例外は明示的に追加し、理由を domain に記録する。
- allowed headers:
  - `content-type`
  - `x-csrf-token`
  - `x-idempotency-key`
  - `traceparent`
- allowed methods:
  - GET / POST / PUT / PATCH / DELETE / OPTIONS（最小限）

### Gateway / Adapter

- CORS は無効。
- `Origin` ヘッダは inbound で drop する。

## Non-goals

- 任意の third-party origin からの API 利用。
- 公開 API（API key ベース）用途への最適化。

## Failure modes

- custom header を追加したが CORS allow headers に入れ忘れ、preflight で失敗する。
- same-origin 前提のままフロントを増やし、場当たり的な例外が増殖する。
- gateway/adapter に CORS ロジックが入り、境界が崩れる。

## Change checklist

- 新しいブラウザ向けヘッダを追加したか
  - CORS allow headers に含めたか
- 新しいオリジンを追加したか
  - same-origin を破らずに対応できるか
  - 例外の場合、domain に理由を書いたか
- credentials を含むリクエストか
  - gateway / adapter に CORS が漏れていないか
