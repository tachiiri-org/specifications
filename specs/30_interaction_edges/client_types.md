# Client Types & Client Boundary Semantics

## Goal

- browser / mobile / desktop / server-to-server の差分を「輸送・確立・保護」の語彙として固定し、
  クライアント種別が増えても core の意味論（tenant/actor/authz/idempotency/error/obs）を壊さない。
- ブラウザ前提（cookie/CSRF/CORS）を “client type の一実装” に落とし、他クライアントでも同じ基盤を適用可能にする。

## Scope

- client type classification
- session vs token（AuthN establishment）
- CSRF/CORS applicability
- idempotency key generation responsibility（originator）
- request-id generation responsibility（trust boundary）
- server-to-server credential の導入枠（method 参照）

## Definitions

- **Client Type**
  - 呼び出し主体の種別。少なくとも以下を扱う:
    - browser（cookie session）
    - native_app（mobile）
    - desktop_app
    - server_to_server

- **Client Boundary**
  - client と最初の trust boundary（通常 BFF または gateway）の間。

- **AuthN Establishment**
  - identity を「確立」する行為。以降は token / claims の検証のみになる。

- **Credential Mode**
  - client boundary で使う credential の方式:
    - cookie_session
    - bearer_token

## Invariants (Must Not Break)

### Core invariants are client-agnostic

- tenant/actor/subject の意味論は client type に依存しない。
- AuthZ の PDP は adapter に固定する。
- operation-based の語彙・契約は client type に依存しない。

### Identity source is always verified claims (internal)

- internal boundaries（BFF→gateway, gateway→adapter）では identity は bearer token の verified claims のみ。
- header injection（x-actor-\* 等）は client type に関係なく reject される。

### CSRF is cookie-only (by default)

- CSRF は cookie credential を使う場合にのみ必要となる。
- bearer_token を使う client boundary では CSRF を適用しない（例外導入は別 contract-version）。

### CORS is browser-only (by default)

- CORS は browser のみ対象とし、BFF 境界に局所化する。
- native/desktop/server_to_server に CORS 概念を持ち込まない。

### Request ID trust boundary

- client 由来の request-id は信頼しない。
- request-id は最初の trust boundary で生成/上書きされる（BFF が存在する場合は BFF）。

### Idempotency key generation responsibility (Aligned with 20)

- state-changing operation の idempotency key は “originator” が生成する。
- browser/native/desktop の user action 起点では client が originator になりうる。
- server_to_server / automation では caller（service）が originator になる。
- end-to-end で同一 key が透過され、最終 owner は adapter（20_operational_semantics/idempotency.md）。

## Client Type Profiles (Normative)

### 1) browser

- credential_mode: cookie_session
- AuthN establishment: BFF（cookie session を確立）
- CSRF: required（double submit cookie）
- CORS: enabled at BFF only（same-origin default）
- request-id: BFF generates/overwrites
- idempotency-key: browser generates per user action (state-changing)

### 2) native_app (mobile)

- credential_mode: bearer_token
- AuthN establishment: client obtains token（取得手順は out-of-scope）
- CSRF: not applicable (default)
- CORS: not applicable
- request-id: first trust boundary generates/overwrites
- idempotency-key: client generates per user action (state-changing)

### 3) desktop_app

- credential_mode: bearer_token
- CSRF/CORS: not applicable
- request-id / idempotency-key: same as native_app

### 4) server_to_server

- credential_mode: bearer_token（または api_key/mtls を authn_methods に従い導入）
- CSRF/CORS: not applicable
- request-id: upstream generates; first boundary may overwrite（trust boundary での一貫性を保つ）
- idempotency-key: caller generates when invoking state-changing operations

## Required JSON keys (Machine-checkable, Must)

- boundary JSON は `client.type` を持つ（browser|native_app|desktop_app|server_to_server）。
- credential_mode に応じて以下が整合する:
  - cookie_session の場合:
    - CSRF / cookie emitter / CORS policy が有効
  - bearer_token の場合:
    - CSRF/CORS のフィールドは存在しない（mode-dependent fields rule と整合）
- browser_to_bff の request-id requirement_timing は post_processing のみ許可。
- native/desktop の entry boundary では request-id requirement_timing は pre_processing を基本とする。

## Non-goals

- モバイルの端末識別や jailbreak 対策等の詳細。
- OIDC/PKCE/DPoP/mTLS の導入詳細（導入枠は別 domain + contract-version で行う）。

## Failure modes

- bearer client に CSRF を誤適用し、実装差で壊れる。
- browser の cookie 前提が他 client に漏れ、境界が曖昧になる。
- request-id を client 入力で信頼して偽装される。

## Related Specifications

- 30_interaction_edges/security_browser_boundary.md
- 30_interaction_edges/session.md
- 00_constitution/identity.md
- 30_interaction_edges/http.md
- 20_operational_semantics/idempotency.md
- 00_constitution/authorization.md
- 30_interaction_edges/authn_methods.md
- 00_constitution/global_defaults.md
