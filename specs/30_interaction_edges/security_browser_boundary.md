# Security Browser Boundary

## Goal

- ブラウザ境界（Browser ⇄ Front/BFF）での攻撃面（CSRF/CORS/credential漏洩/ヘッダ偽装）を最小化しつつ、
  アプリ追加・BFF追加でもルールが破綻しない形にする。

## Scope

- Browser ⇄ front（存在する場合）
- Browser ⇄ bff
- front ⇄ bff（存在する場合）
- bff ⇄ gateway
- gateway ⇄ adapter

## Invariants (Must Not Break)

### Cookie boundary (Must)

- セッションクッキー（`__Host-session`）と CSRF クッキー（`__Host-csrf`）は **BFF が発行する**。
- gateway / adapter へ cookie を伝播しない（downstream へは bearer で伝える）。
- cookie は `__Host-*` を利用し、Domain 属性を使わない（サブドメイン共有を前提にしない）。

### CSRF (Must)

- cookie credential を扱う state-changing は CSRF チェックを必須とする。
- CSRF の判定は「Originチェック + token（二重送信）」で行う。
- `Origin` が欠落しているリクエストは deny とする（例外を作らない）。

### CORS (Must)

- 認証済みリクエスト（cookieを含む）を扱うエンドポイントで、無制限な cross-origin を許可しない。
- 許可する origin / headers / methods は最小化する。
- ブラウザから送る必要があるカスタムヘッダ（例: `x-csrf-token`, `x-idempotency-key`）は CORS の allowlist に必ず含める。

### Header trust (Must)

- ブラウザは `authorization` を使わない（BFF で reject する）。
- upstream が付けうる “疑似的な本人情報ヘッダ” を gateway / adapter は受け付けない（identity headers forbidden）。

## Non-goals

- サードパーティサイトへの埋め込み（iframe）を許可すること（`frame-ancestors 'none'` 前提）。
- 複数サブドメイン間で cookie を共有する設計（`__Host-*` 前提）。
- ブラウザ直アクセスの全API公開（ブラウザが使うのは BFF 境界まで、が基本）。

## Failure modes

- CORS allowlist にヘッダが無く preflight が失敗し、機能が環境/オリジン差で壊れる。
- front が `set-cookie` を透過/生成してしまい、cookie発行者の境界が崩れる。
- same-origin 前提のままアプリを増やし、例外追加が場当たり的に増殖して矛盾が出る。
- `authorization` や identity 相当ヘッダがブラウザから混入し、境界が曖昧になる。

## Related Specifications

- 30_interaction_edges/session.md
- 30_interaction_edges/browser_response_security_headers.md
- 00_constitution/identity.md
- 00_constitution/headers.md
