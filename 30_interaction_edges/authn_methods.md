c:30_interaction_edges/authn_methods.md

```md
# Authentication Establishment Methods (Cookie / Bearer JWT / API Key / mTLS / Device Context)

## Goal

- 認証方式（credential method）が増えても、内部境界の意味論（actor/tenant/authz）が壊れないようにする。
- “確立後は verified claims のみ” を維持し、輸送差分を境界内に閉じる。
- server-to-server を含む多様な credential 方式を、境界責務として導入可能にする。

## Scope

- AuthN establishment at edges (browser / server-to-server)
- transport differences (cookie, header, mtls)
- normalization into verified token claims
- method-specific minimum handling (redaction, verification)

## Definitions

### Credential Method (AuthN)

- client-facing / entry boundary で identity を確立する方式。
- 例:
  - cookie_session
  - bearer_token (jwt)
  - api_key
  - mtls
  - device_context (attestation as context)

### Establishment point

- identity を確立する場所（以降は検証のみ）。
- browser: BFF
- server-to-server: gateway または専用 entry boundary（設計で決める）

> 注: establishment point の具体（どの boundary か、どのヘッダ/トランスポートか）は def の boundary JSON を正とする。

## Invariants (Must Not Break)

### 1) Single establishment point per boundary (Must)

- 境界（edge）での identity 確立点は、責務として明示される。
- “同じ境界で複数の確立点が並立”してはならない（解釈差分と事故の温床）。

### 2) Internal identity source is verified claims (Must)

- internal boundaries（BFF→Gateway→Adapter）の identity source は常に verified claims のみ。
- api_key / mtls / device_context は establishment point で claims に正規化される。
- header/query/body による identity 注入は禁止（00_constitution/headers.md, 00_constitution/identity.md）。

### 3) Actor type unambiguous (Must)

- actor_type は human/service/ops のいずれかで明示され、混同を許さない。
- api_key / mtls により service actor を human と同一視してはならない。

### 4) Tenant continuity (Must)

- tenant-scoped 操作は `tenant_id` を必須とする。
- server-to-server の場合でも tenant を暗黙推論してはならない（establishment point で確定する）。

### 5) Versioned introduction (Must)

- 新しい credential method を導入し、内部境界まで流す場合は contract-version を上げる。
- “既存トークンの claims を後付けで増やす”変更は breaking とみなす（claims compatibility を正とする）。

## Method profiles (Normative minimum)

### Cookie session (Browser ⇄ BFF)

- browser は identity を主張できない。BFF が session を検証して identity を確立する。
- browser 由来の `authorization` は reject される（00_constitution/identity.md）。
- BFF は internal 用の bearer token（JWT）を発行し、以降は token claims のみを伝播する。

### Bearer JWT (Internal boundaries)

- gateway / adapter は inbound で JWT を必ず検証する（署名/issuer/audience/exp）。
- 検証失敗は 401。

### API Key (Server-to-server)

- establishment point で key を検証し、service/ops actor の claims を発行する。
- key 値はログに残さない（hash/drop）。
- key の権限は roles/scopes として表現される（詳細モデルは固定しない）。

### mTLS (Server-to-server)

- establishment point で client certificate を検証し、service/ops actor の claims を発行する。
- subject DN 等の可変情報を AuthZ 入力に使わない（内部の識別子へ正規化する）。

### Device context

- 端末識別は “attestation context” として扱い、actor/subject の憲法と混ぜない。
- device を主体（subject_type の拡張等）として扱う場合は、別 contract-version が必要（subject types を正とする）。

## Non-goals

- OIDC/PKCE/DPoP の詳細標準化。
- 端末改竄対策（jailbreak 等）の詳細。
- secrets の置き場（00_constitution/secrets_and_keys.md を正とする）。

## Failure modes

- 確立点が増えて identity が複数箇所で確立され、境界の意味が割れる。
- api_key が human actor と同一視され、権限事故が起きる。
- device 情報が AuthZ 入力に混入し、互換性と監査が破綻する。

## Related Specifications

- 00_constitution/identity.md
- 00_constitution/headers.md
- 00_constitution/authorization.md
- 00_constitution/secrets_and_keys.md
- 00_constitution/global_defaults.md
- 00_constitution/claims_compatibility.md
- 00_constitution/subject_types.md
- 30_interaction_edges/session.md
- 30_interaction_edges/client_types.md
```

c:30_interaction_edges/browser_response_security_headers.md

```md
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

- 30_interaction_edges/security_browser_boundary.md
```

c:30_interaction_edges/client_types.md

```md
# Client Types & Client Boundary Semantics

## Goal

- browser / mobile / desktop / server-to-server の差分を「輸送・確立・保護」の語彙として固定し、
  クライアント種別が増えても core の意味論（tenant/actor/authz/idempotency/error/obs）を壊さない。
- ブラウザ前提（cookie/CSRF/CORS）を “client type の一実装” に落とし、他クライアントでも同じ基盤を適用可能にする。

## Scope

- client type classification
- session vs token (AuthN establishment)
- CSRF/CORS applicability
- idempotency key generation responsibility
- request-id generation responsibility (trust boundary)
- transport-level hardening (optional future extensions)

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

### CSRF is browser-only (by default)

- CSRF は cookie credential を使う場合にのみ必要となる。
- bearer_token を使う client boundary では CSRF を適用しない（例外導入は別 contract-version）。

### CORS is browser-only (by default)

- CORS は browser のみ対象とし、BFF 境界に局所化する。
- native/desktop/server_to_server に CORS 概念を持ち込まない。

### Request ID trust boundary

- client 由来の request-id は信頼しない。
- request-id は最初の trust boundary で生成/上書きされる（BFF が存在する場合はBFF）。

### Idempotency key generation responsibility

- state-changing operation の idempotency key は「ユーザー操作単位」で client 側が生成する。
- browser/native/desktop の違いがあっても、end-to-end で同一 key が透過される。

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
- AuthN establishment: client obtains token (OIDC/PKCE etc. is out-of-scope here)
- CSRF: not applicable (default)
- CORS: not applicable
- request-id: first trust boundary generates/overwrites
- idempotency-key: client generates per user action (state-changing)

### 3) desktop_app

- credential_mode: bearer_token
- CSRF/CORS: not applicable
- request-id / idempotency-key: same as native_app

### 4) server_to_server

- credential_mode: bearer_token (or mTLS/api-key via separate contract-version)
- CSRF/CORS: not applicable
- request-id: upstream generates; first boundary requires pre-processing presence (may overwrite allowed)
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

> 分類基準は `10_non_goals.md` を参照。

### Permanent Non-goals

- モバイルの端末識別や jailbreak 対策等の詳細。

### Deferred-but-Scoped

- OIDC/PKCE/DPoP/mTLS の導入枠（導入時は別 domain + contract-version）。

### Out-of-Scope Implementation Details

- クライアント SDK/端末固有実装の詳細。

## Failure modes

- bearer client に CSRF を誤適用し、実装差で壊れる
- browser の cookie 前提が他 client に漏れ、境界が曖昧になる
- request-id を client 入力で信頼して偽装される

## Related Specifications

- 30_interaction_edges/security_browser_boundary.md
- 30_interaction_edges/session.md
- 00_constitution/identity.md
- 30_interaction_edges/http.md
- 20_operational_semantics/idempotency.md
- 00_constitution/authorization.md
- 30_interaction_edges/authn_methods.md
- 00_constitution/global_defaults.md
```

c:30_interaction_edges/http.md

```md
# HTTP Contracts & RPC Boundary

## Goal

- HTTP を「輸送層」として使い、意味論は contract / operation に集約する。
- フロント増加・BFF増加・adapter増加に耐える API 境界を作る。
- エラー・メソッド・content-type・routing の判断を局所化する。

## Scope

- bff ⇄ gateway
- gateway ⇄ adapter
- http_methods / http_rpc_style / http_routing / http_content_types / http_errors / http_catalog
- contract_versioning / compatibility

## Design Principles

- HTTP verb は表現力よりも **安定性を優先**する。
- 意味論は path / body / rpc_method / operation に寄せる。
- API の可用性と安全性は「わかりやすさ」より優先される。
- 外部 REST の表現は adapter 内に閉じ、内部境界は operation として統一する。

## Invariants (Must Not Break)

### RPC over HTTP

- BFF → gateway は JSON-RPC over HTTP とする。
- gateway → adapter は operation-catalog over HTTP とする。
- ルーティングは **宣言された operation のみ**に限定する（未実装は 404）。

### Methods

- bff → gateway / gateway → adapter の operation 呼び出しは POST に統一する。
- browser-facing の GET は「ナビゲーション/表示」に限定し、内部境界には持ち込まない。
- state-changing は内部境界では operation の分類で判定する。

### Content-Type

- request / response は原則 `application/json` のみ。
- state-changing operation での JSON 不正・BOM・非 UTF-8 は reject する。
- `Accept` は基本的に無視してよい（content negotiation はしない）。
  - もし検査する場合は `application/json` のみ許可（拡張は breaking）。

### Routing

- BFF→gateway:
  - `rpc_endpoint` のみを入口とする（他の path は 404）。
- gateway→adapter:
  - `/{service}/{resource}/{property}/{operation}` は catalog に存在するもののみ許可する。

### Error Semantics

- adapter のエラー詳細を、BFF まで透過させない。
- gateway / BFF は「境界エラー」に正規化する（preserve list 以外は安全側）。
- 利用者に返す status は **契約として固定**し、内部の詳細は observability にのみ残す。
- error mapping の評価順序は L1（各ツール仕様定義） に従い、boundary JSON で algorithm を明示する。

### Error Shape (Contract)

- 境界で返すエラーは必ず以下の shape を満たす（JSON）。
- `always_use_error_shape: true` は、この shape を必ず適用することを意味する。

{
"error": {
"code": "string",
"message": "string",
"request_id": "string"
}
}

- message は最小の一般説明に留める（内部原因は返さない）。
- 追加フィールドは原則禁止。必要なら contract-version を上げる。

### Compatibility & Versioning

- `x-contract-version` は境界で必須になりうる（境界仕様JSONを正とする）。
- boundary JSON は「必須 여부」だけでなく「受理する version 範囲」を明示できなければならない。
  - accepted:
    - explicit_list（例: ["1"]）
    - range（例: min/max）
- 互換性ルール（最低限）:
  - 追加: optional field の追加は後方互換
  - 変更/削除: breaking（バージョンを上げる）
  - enum 追加: 後方互換だが、unknown を安全に扱う
- バージョン移行は「両対応期間」を設け、段階的に切り替える。

### Contract Version Requirement (Must)

- BFF ⇄ Gateway: `x-contract-version` を必須とする。
- Gateway ⇄ Adapter: `x-contract-version` を必須とする。
- Browser ⇄ BFF: `x-contract-version` は必須としない。
- 未指定の場合の挙動:
  - reject
  - status: 400
  - error_code: "contract_version_required"

## Required JSON keys (Machine-checkable, Must)

- internal boundaries（bff_to_gateway, gateway_to_adapter）は:
  - `http.contract_version.mode`
  - `http.contract_version.accepted`
  - `http.errors.propagation.algorithm`
  - `http.errors.propagation.preserve_status_for`（403/429等を含むこと）
  - `headers.requirements.*`（x-contract-version が落ちないこと）
- catalog routing を行う境界は:
  - “implemented-only routing” の設定（catalog外は404）が存在すること

## Non-goals

- RESTful な表現（verb / resource / status を厳密に使い分けること）
- 人間が curl しやすい API
- 任意の content-type 対応
- 内部境界での GET キャッシュ最適化

## Failure modes

- REST 的拡張を始め、POST/GET/PUT が内部境界で混在して contract が崩れる。
- adapter の内部エラーをそのまま返し、API が不安定化する。
- routing が自由になり、未実装 operation が静かに通る。
- contract-version の管理が曖昧で、ロールアウト順序で壊れる。

## Change checklist

- 新しい operation を追加したか
  - catalog に登録したか
  - 未実装時の挙動（404）が守られているか
- 新しい error code / status を追加したか
  - preserve list / mapping / error shape に矛盾しないか
- contract-version を変更したか
  - accepted 範囲と両対応期間、ロールアウト順序は定義されているか
```

c:30_interaction_edges/security_browser_boundary.md

```md
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
```

c:30_interaction_edges/session.md

```md
# Session Semantics (Browser Boundary)

## Goal

- browser session（cookie）を安全に管理し、CSRF と整合させる。
- session 発行点・更新・失効の責務を固定し、境界崩壊を防ぐ。

## Scope

- Browser ⇄ BFF session cookie
- session rotation / logout / revoke
- cookie attributes
- CSRF coupling

## Invariants (Must Not Break)

### Issuer boundary

- session cookie（\_\_Host-session）を発行できるのは BFF のみ（cookie emitter ルール）。
- gateway/adapter に cookie を伝播しない。

### Rotation / lifetime

- session は更新（rotation）可能であること。
- session lifetime は短め（推奨）とし、延長の条件は明示される。

### Logout / revoke

- logout は session を無効化する（server-side revoke または短TTL+ローテ戦略）。
- logout の結果が adapter に漏れない（cookie はBFFで完結）。

## Required rules

- cookie 発行点: L1（各ツール仕様定義）
- CSRF: L1（各ツール仕様定義）

## Failure modes

- cookie emitter が増え、どこでセッションが変わったか追えない。
- rotation がなく盗難時の影響が大きい。
- logout が不完全で再利用される。

## Related Specifications

- 30_interaction_edges/security_browser_boundary.md
- 00_constitution/identity.md
```

c:30_interaction_edges/webhook.md

```md
# Webhook Security & Idempotency

## Goal

- 決済・外部連携の webhook を安全に受け付ける。
- 署名検証・リプレイ防止・重複配信を仕様として固定し、実装差分を防ぐ。

## Scope

- inbound webhooks（external -> adapter or gateway -> adapter）
- signature verification
- replay protection（timestamp/nonce）
- idempotency for delivery duplication
- observability / audit coupling

## Invariants (Must Not Break)

### Signature verification

- webhook は必ず署名検証する。
- 未署名、検証失敗は 401/403 で拒否する（詳細は返さない）。

### Replay protection

- timestamp を検証し、許容ウィンドウ外は拒否する。
- nonce（または event_id）により再送（replay）を検知できる。

### Idempotency

- provider の event_id（または同等）で重複配信を抑止する。
- 重複は “同一結果の再生” として扱い、副作用を二重実行しない。

### Observability / Audit

- webhook による external_effect は audit と整合する（必要なら audit event を生成）。

## Required rules

- 署名検証・リプレイ防止の最低要件は L1（各ツール仕様定義） を正とする。

## Failure modes

- 署名未検証で外部から状態変更される。
- replay で二重処理が発生する。
- webhook の処理結果が監査と整合しない。

## Related Specifications

- 20_operational_semantics/billing.md
- 20_operational_semantics/idempotency.md
```
