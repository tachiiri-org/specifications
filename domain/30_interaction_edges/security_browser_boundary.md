# Security Browser Boundary

## Goal

- ブラウザ境界（Browser ⇄ Front/BFF）での攻撃面（CSRF/CORS/credential漏洩/ヘッダ偽装）を最小化しつつ、アプリ追加・BFF追加でもルールが破綻しない形にする。

## Scope

- Browser ⇄ front（Cloudflare Pages + Functions）
- Browser ⇄ bff（Cloudflare Workers）
- front ⇄ bff（存在する場合）
- bff ⇄ gateway（Cloudflare Workers）
- gateway ⇄ adapter（Cloudflare Workers）

## Assumptions

- 認証の起点は Auth0。
- ブラウザセッションは cookie（`__Host-session`）で扱う。
- CSRF 対策は double submit cookie（`__Host-csrf` + `x-csrf-token`）を採用する。
- CORS は原則 same-origin を維持する（例外は明示的に追加する）。

## Invariants (Must Not Break)

### Cookie boundary

- セッションクッキー（`__Host-session`）と CSRF クッキー（`__Host-csrf`）は **BFF が発行する**。
- gateway / adapter へ cookie を伝播しない（downstream へは bearer で伝える）。
- cookie は `__Host-*` を利用し、Domain 属性を使わない（サブドメイン共有を前提にしない）。

### CSRF

- state-changing（POST/PUT/PATCH/DELETE）は CSRF チェックを必須とする。
- CSRF の判定は「Originチェック + token（二重送信）」で行う。
- `Origin` が欠落しているリクエストは deny とする（例外を作らない）。

### CORS

- 認証済みリクエスト（cookieを含む）を扱うエンドポイントで、無制限な cross-origin を許可しない。
- 許可する origin / headers / methods は最小化する。
- ブラウザから送る必要があるカスタムヘッダ（例：`x-csrf-token`, `x-idempotency-key`）は CORS の allowlist に必ず含める。

### Header trust

- ブラウザは `authorization` を使わない（BFF で reject する）。
- upstream が付けうる “疑似的な本人情報ヘッダ” を gateway / adapter は受け付けない（identity headers forbidden）。

## Non-goals

- サードパーティサイトへの埋め込み（iframe）を許可すること（`frame-ancestors 'none'` 前提）。
- 複数サブドメイン間で cookie を共有する設計（`__Host-*` 前提）。
- ブラウザ直アクセスの全API公開（ブラウザが使うのは BFF 境界まで、が基本）。

## Failure modes (What can go wrong)

- CORS allowlist にヘッダが無く preflight が失敗し、機能が環境/オリジン差で壊れる。
- front が `set-cookie` を透過/生成してしまい、cookie発行者の境界が崩れる（セキュリティ事故 + デバッグ不能）。
- same-origin 前提のままアプリを増やし、例外追加が場当たり的に増殖して矛盾が出る。
- `authorization` や identity 相当ヘッダがブラウザから混入し、境界が曖昧になる。

## Change checklist

- 新しいブラウザ向けヘッダを追加する場合：
  - CORS allow headers に追加したか
  - BFF inbound allowlist に追加したか
  - ログ/リダクション方針（observability_redaction）に影響がないか
- 新しいオリジン（別ドメイン/サブドメイン）を増やす場合：
  - same-origin を維持できるか（BFFをオリジンごとに分ける必要はないか）
  - CSRF origin 設定と矛盾しないか
  - `__Host-*` cookie の運用（ホスト名戦略）が破綻しないか
- cookie を扱うコンポーネントを変更する場合：
  - cookie emitter の境界（BFFのみ）が保たれているか
  - gateway/adapter に cookie が到達しないことを確認したか
