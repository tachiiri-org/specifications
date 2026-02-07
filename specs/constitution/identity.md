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

- 認可（AuthZ）モデルや権限 DSL の定義（`constitution/authorization.md` の責務）。
- 組織・グループ・階層の標準化。
- issuer/audience/TTL/鍵素材などの具体値（L1 (tool-spec repos) の責務）。

## Deferred-but-Scoped (Staging / Boundary-level)

- assurance / step-up の境界設計（transport/UI/edge）: `interaction_edges/step_up.md` / `interaction_edges/session.md`
  - 憲法レイヤの意味論は `constitution/authn_assurance.md` を正とする。
- key rotation / issuer governance の境界実装詳細: L1 (tool-spec repos)
  - 憲法レイヤの原則は `constitution/identity_key_rotation.md` を正とする。
- claims set の受理・dual-accept・境界実装詳細: L1 (tool-spec repos)
  - 憲法レイヤのガバナンスは `constitution/claims_compatibility.md` を正とする。
- 非JWT方式や追加authn手段（境界）: `interaction_edges/authn_methods.md`（必要なら10で拡張）

## Failure modes

- browser 由来の `authorization` を受け入れてしまい、BFF の確立点が崩れる。
- cookie が内部境界へ流れ、信頼境界が壊れる。
- 検証条件が実装差でブレ、環境差で AuthN が壊れる。
- `x-actor-*` 等の擬似 identity ヘッダが混入し、actor/tenant の意味論が破綻する。

## Related Specifications

- constitution/actor.md
- constitution/actor_subject_tenant_model.md
- constitution/authorization.md
- constitution/headers.md
- constitution/secrets_and_keys.md
- constitution/global_defaults.md
- constitution/claims_compatibility.md
- interaction_edges/session.md
- interaction_edges/security_browser_boundary.md
- interaction_edges/client_types.md
- interaction_edges/authn_methods.md

- constitution/authn_assurance.md
- constitution/identity_key_rotation.md
