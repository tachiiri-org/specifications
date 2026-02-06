# Browser Response Security Headers (Browser Boundary)

## Goal

- ブラウザ境界（Browser ⇄ BFF/Front）での防御ヘッダを契約化し、
  “環境差・実装差で抜ける” 事故を防ぐ。
- CORS/CSRF と矛盾しない形で、clickjacking / MIME sniffing / XSS の基礎防御を固定する。

## Scope

- Browser-facing responses（front/bff）
- CSP / frame-ancestors / X-Content-Type-Options / Referrer-Policy 等
- Exceptions (must be explicit and versioned)

## Invariants (Must Not Break)

### Default deny posture

- “必要がある場合のみ緩める” を原則とする。
- 例外（iframe 許可、unsafe-inline など）は operation/endpoint 単位で明示し、暗黙を作らない。

### Minimum header set (Recommended baseline)

- `Content-Security-Policy`（または `Content-Security-Policy-Report-Only` を併用）
  - `frame-ancestors 'none'` を基本（埋め込みを許可しない）
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`（例: strict-origin-when-cross-origin）
- `Permissions-Policy`（必要最小限）
- `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy`（適用できる範囲で）

### Cookie/session interaction

- cookie は BFF が発行し、`__Host-*` 前提と整合する。
- CSP/CORS/CSRF の設計と矛盾する例外を導入しない。

## Required JSON (Recommended)

- browser_to_bff（または front 相当）には、security headers の設定が JSON で宣言できること：
  - enabled
  - required_headers（explicit list）
  - exceptions（explicit list + reason）

## Failure modes

- 一部環境で CSP が抜け、XSS 影響が最大化する。
- iframe 許可が場当たり的に増殖し、clickjacking が成立する。
- MIME sniffing で意図しない実行が起きる。

## Related Specifications

- domain/30_interaction_edges/security_browser_boundary.md
- rules/cors_policy.md
- rules/csrf_double_submit.md
