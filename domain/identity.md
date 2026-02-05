# Identity & Authentication Boundary

## Goal

- 利用者の identity を一度だけ確立し、以降は安全に伝播・検証できるようにする。
- browser 由来の入力と、内部で信頼できる identity 情報を明確に分離する。

## Scope

- Browser ⇄ BFF
- BFF ⇄ Gateway
- Gateway ⇄ Adapter
- identity_transport
- identity_verification
- identity_actor_model
- identity_token_profile (jwt)
- header_to_authn
- identity\_\*\_headers

## Design Principles

- identity は **境界で確立し、内部では検証するのみ**。
- browser 入力は信用しない。
- identity 情報は bearer token に集約する。
- token の具体値（issuer/audience/ttl/keys 等）は boundary JSON を正とする。

## Invariants (Must Not Break)

### Identity Establishment

- browser ⇄ BFF 間では cookie session を用いる。
- identity を「確立」するのは BFF のみ。
- browser から送られる `authorization` ヘッダは reject する。

### Identity Transport

- BFF ⇄ gateway / gateway ⇄ adapter は bearer token を用いる。
- bearer token は header のみで伝播し、cookie では運ばない。
- identity 情報を表すヘッダ（`x-actor-*` 等）を transport しない。

### Token Profile (JWT)

- bearer token は署名付き JWT（JWS）を基本とする。
- gateway / adapter は inbound で JWT を必ず検証する:
  - signature / issuer / audience / expiration / scope/role（必要に応じて）
- verification に失敗した場合、401 を返す。
- 失効は短 TTL を基本とし、緊急時は鍵ローテーションで封じる。

### Trust Boundary

- gateway / adapter は decoded claims のみを利用する。
- alternative な identity ヘッダを reject する。

## Non-goals

> 分類基準は `10_non_goals.md` を参照。

### Permanent Non-goals

- 認可（AuthZ）モデルや権限 DSL の定義（domain/authorization.md の責務）。
- 組織・グループ・階層の標準化。

### Deferred-but-Scoped

- API key や mTLS 等、JWT 以外の認証方式導入（導入時は別 domain + contract-version）。
- claims 互換性、鍵ローテーション、assurance の運用枠。

### Out-of-Scope Implementation Details

- issuer/audience/TTL/鍵素材などの具体値。

## Failure modes

- browser 由来の `authorization` を受け入れてしまい、BFF の確立点が崩れる。
- cookie が内部境界へ流れ、信頼境界が壊れる。
- issuer/audience/algs 等の検証条件が実装差でブレ、環境差で AuthN が壊れる。
- `x-actor-*` 等の擬似 identity ヘッダが混入し、actor/tenant の意味論が破綻する。

## Related Specifications

- domain/authn_assurance.md
- domain/identity_key_rotation.md
- domain/claims_compatibility.md
- domain/actor.md
- domain/actor_subject_tenant_model.md
- domain/authorization.md
- domain/headers.md
- domain/session.md
- domain/security_browser_boundary.md
- domain/secrets_and_keys.md
- domain/client_types.md
- domain/authn_methods.md
- domain/global_defaults.md
