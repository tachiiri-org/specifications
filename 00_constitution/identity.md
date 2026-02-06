# Identity & Authentication Boundary

## Goal

- 利用者の identity を一度だけ確立し、以降は安全に伝播・検証できるようにする。
- browser 由来の入力と、内部で信頼できる identity 情報を明確に分離する。

## Scope

- Browser ⇄ BFF
- BFF ⇄ Gateway
- Gateway ⇄ Adapter
- identity establishment / transport / verification（値や具体プロファイルはL1）

## Design Principles

- identity は **境界で確立し、内部では検証するのみ**。
- browser 入力は信用しない。
- identity 情報は bearer token に集約する。
- token の具体値（issuer/audience/ttl/keys 等）は L1仕様を正とする。

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
- gateway / adapter は inbound で token を必ず検証する（具体検証条件はL1）。
- verification に失敗した場合、401 を返す。
- 失効は短 TTL を基本とし、緊急時は鍵ローテーションで封じる。

### Trust Boundary

- internal boundaries は decoded claims のみを利用する。
- alternative な identity ヘッダを reject する。

## Non-goals

- 認可（AuthZ）モデルや権限 DSL の定義（`00_constitution/authorization.md` の責務）。
- 組織・グループ・階層の標準化。
- issuer/audience/TTL/鍵素材などの具体値（L1の責務）。

## Deferred-but-Scoped (Staging)

- assurance / step-up の意味論拡張: `00_constitution/authn_assurance.md`
- key rotation / issuer governance: `00_constitution/identity_key_rotation.md`
- claims set の拡張ガバナンス: `00_constitution/claims_compatibility.md`（憲法）＋ L1の実装
- 非JWT方式や追加authn手段: `30_interaction_edges/authn_methods.md`（境界）＋必要なら10で拡張

## Failure modes

- browser 由来の `authorization` を受け入れてしまい、BFF の確立点が崩れる。
- cookie が内部境界へ流れ、信頼境界が壊れる。
- 検証条件が実装差でブレ、環境差で AuthN が壊れる。
- `x-actor-*` 等の擬似 identity ヘッダが混入し、actor/tenant の意味論が破綻する。

## Related Specifications

- 00_constitution/actor.md
- 00_constitution/actor_subject_tenant_model.md
- 00_constitution/authorization.md
- 00_constitution/headers.md
- 00_constitution/secrets_and_keys.md
- 00_constitution/global_defaults.md
- 30_interaction_edges/session.md
- 30_interaction_edges/security_browser_boundary.md
- 30_interaction_edges/client_types.md
- 30_interaction_edges/authn_methods.md

- 00_constitution/authn_assurance.md
- 00_constitution/identity_key_rotation.md
