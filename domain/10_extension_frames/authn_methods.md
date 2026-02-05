# Authentication Method Extensions (API Key / mTLS / Device Identity)

## Goal

- AuthN の確立方式が増えても、内部境界の意味論（actor/tenant/authz）が壊れないようにする。
- “確立後は verified claims のみ” を維持し、輸送差分を境界内に閉じる。
- server-to-server を含む多様な credential 方式を versioned に導入可能にする。

## Scope

- AuthN establishment の語彙（api_key / mtls / device_identity）
- claims への正規化（actor_id/actor_type/tenant_id の不変条件）
- internal boundaries の検証要件（verification）
- 方式追加の versioning ルール

## Definitions

### Credential Method (AuthN)

- client boundary で identity を確立する方式。
- 例:
  - api_key
  - mtls
  - device_identity
  - cookie_session
  - bearer_token (jwt)

### Establishment point

- identity を確立する場所（以降は検証のみ）。
- browser: BFF
- server-to-server: gateway または専用 entry boundary（設計により決める）

## Invariants (Must Not Break)

### 1) Internal identity source is verified claims

- internal boundaries（BFF→Gateway→Adapter）の identity source は常に verified claims のみ。
- api_key / mtls / device_identity は “確立点” で claims に正規化される。
- header/query/body による identity 注入は禁止（domain/00_constitution/headers.md, domain/00_constitution/identity.md）。

### 2) Actor type unambiguous

- actor_type は human/service/ops のいずれかで明示され、混同を許さない。
- api_key / mtls / device_identity によって service actor を human と同一視してはならない。

### 3) Tenant continuity

- tenant-scoped 操作は `tenant_id` を必須とする。
- server-to-server の場合でも tenant を暗黙推論してはならない（確立点で確定する）。

### 4) Versioned introduction

- 新しい credential method を internal boundary に導入する場合は contract-version を上げる。
- “既存トークンの claims を後付けで増やす”変更は breaking とみなす（domain/00_constitution/authorization.md）。

## Method profiles (Normative minimum)

### API Key

- 確立点で key を検証し、service/ops actor の claims を発行する。
- key 値はログに残さない（hash/drop）。
- key の権限は roles/scopes として表現される。

### mTLS

- 確立点で client certificate を検証し、service/ops actor の claims を発行する。
- subject DN 等の可変情報を AuthZ 入力に使わない（内部の識別子へ正規化する）。

### Device identity

- 端末識別は “attestation context” として扱い、actor/subject の憲法と混ぜない。
- device を主体として扱いたい場合は別 domain + contract-version で導入する（subject 拡張の議論）。

## Non-goals

- OIDC/PKCE/DPoP の詳細標準化。
- 端末改竄対策（jailbreak 等）の詳細。
- secrets の置き場（domain/00_constitution/secrets_and_keys.md を正とする）。

## Failure modes

- 確立点が増えて identity が複数箇所で確立され、境界の意味が割れる。
- api_key が human actor と同一視され、権限事故が起きる。
- device 情報が AuthZ 入力に混入し、互換性と監査が破綻する。

## Related Specifications

- domain/00_constitution/identity.md
- domain/00_constitution/headers.md
- domain/00_constitution/authorization.md
- domain/30_interaction_edges/client_types.md
- domain/00_constitution/secrets_and_keys.md
- domain/00_constitution/global_defaults.md
