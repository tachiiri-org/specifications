# Rule: CSRF Double Submit Cookie

## Goal

- cookie session を使う browser → BFF の state-changing を CSRF から守る。
- 例外を作らず、環境差で壊れない検証手順を固定する。

## Rule (Must)

### Applies

- 対象境界: browser ⇄ BFF（browser_to_bff）
- 対象メソッド: POST / PUT / PATCH / DELETE
- OPTIONS（preflight）は CSRF 対象外（ただし CORS policy に従う）

### Origin check

- `Origin` が欠落しているリクエストは deny とする。
- `Origin` は原則 same-origin のみ許可する。
- 例外（許可 origin の追加）は explicit list とし、理由を domain に記録する。

### Double submit token

- CSRF token は BFF がランダム生成する（推奨 128-bit 以上）。
- BFF は CSRF cookie `__Host-csrf` を発行する。
- ブラウザは header `x-csrf-token` を送信する。
- BFF は `__Host-csrf` と `x-csrf-token` の一致を検証する。
- 比較は constant-time compare を使用する。

### Cookie attributes

- `__Host-csrf`:
  - Secure: true
  - Path: /
  - Domain: forbidden
  - HttpOnly: false（header に載せるため JS から読める必要がある）
  - SameSite: lax（または strict。採用値は boundary JSON を正とする）
- `__Host-session`:
  - Secure: true
  - Path: /
  - Domain: forbidden
  - HttpOnly: true
  - SameSite: lax（または strict。採用値は boundary JSON を正とする）

### Errors

- CSRF 失敗は 403 を返す（詳細は返さない）。
- observability には内部用 reason を記録してよい（利用者には返さない）。

## Non-goals

- third-party origin からの credentials 付き API 利用
- iframe 埋め込みの許可（`frame-ancestors 'none'` 前提）

## Failure modes

- `Origin` 欠落を許可して bypass される。
- CSRF cookie を HttpOnly にして header に載せられず壊れる。
- allowed headers / CORS と整合せず preflight で壊れる。

## Change checklist

- 新しい state-changing endpoint を追加したか
  - CSRF 対象であることを確認したか
- 新しい origin を追加したか
  - allowed list / 理由の記録 / CORS 設定が揃っているか
- cookie 属性を変更したか
  - `__Host-*` 前提と矛盾していないか
