# Authentication Establishment Methods (Cookie / Bearer JWT / API Key / mTLS / Device Context)

## Goal

- 認証方式（credential method）が増えても、内部境界の意味論（actor/tenant/authz）が壊れないようにする。
- “確立後は verified claims のみ” を維持し、輸送差分を境界内に閉じる。
- browser / server-to-server を含む多様な credential 方式を、**edge の責務**として導入可能にする。

## Scope

- AuthN establishment at edges（browser / server-to-server）
- transport differences（cookie, header, mtls）
- normalization into verified token claims（内部境界に渡すのは verified claims のみ）
- method-specific minimum handling（redaction, verification, rotation reference）

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

### 1) Single establishment point per edge (Must)

- edge での identity 確立点は、責務として明示される。
- “同じ edge で複数の確立点が並立”してはならない（解釈差分と事故の温床）。

### 2) Internal identity source is verified claims (Must)

- internal boundaries（BFF→Gateway→Adapter）の identity source は常に verified claims のみ。
- api_key / mtls / device_context は establishment point で **verified claims に正規化**される。
- header/query/body による identity 注入は禁止（domain/00_constitution/headers.md, domain/00_constitution/identity.md）。

### 3) Actor type unambiguous (Must)

- actor_type は human/service/ops のいずれかで明示され、混同を許さない。
- api_key / mtls により service actor を human と同一視してはならない。

### 4) Tenant continuity (Must)

- tenant-scoped 操作は `tenant_id` を必須とする。
- server-to-server の場合でも tenant を暗黙推論してはならない（establishment point で確定する）。

### 5) Versioned introduction (Must)

- 新しい credential method を導入し、内部境界まで流す場合は contract-version を上げる。
- “既存トークンの claims を後付けで増やす”変更は breaking とみなす（claims set / schema compatibility を正とする）。

## Method profiles (Normative minimum)

### Cookie session (Browser ⇄ BFF)

- browser は identity を主張できない。BFF が session を検証して identity を確立する。
- browser 由来の `authorization` は reject される（domain/00_constitution/identity.md）。
- BFF は internal 用の bearer token（JWT）を発行し、以降は token claims のみを伝播する。

### Bearer JWT (Internal boundaries)

- internal boundaries（gateway / adapter）は inbound で JWT を必ず検証する。
- 検証要件（issuer allowlist / key rotation / cache）は **別仕様**を正とする：
  - domain/20_operational_semantics/identity_key_rotation.md（issuer / JWKS / rotation）
  - rules/jwt_token_profile.md（token profile）

> 注: 本ファイルは “edge の責務” を固定する。検証詳細は 20 / rules が一次情報。

### API Key (Server-to-server)

- establishment point で key を検証し、service/ops actor の verified claims を発行する。
- key 値はログに残さない（hash/drop）。
- key の権限は roles/scopes として表現される（詳細モデルは固定しない）。

### mTLS (Server-to-server)

- establishment point で client certificate を検証し、service/ops actor の verified claims を発行する。
- subject DN 等の可変情報を AuthZ 入力に使わない（内部の識別子へ正規化する）。

### Device context

- 端末識別は “attestation context” として扱い、actor/subject の憲法と混ぜない。
- device を主体（subject_type の拡張等）として扱う場合は、別 contract-version が必要（subject types / delegation 等の拡張仕様を正とする）。

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
- domain/00_constitution/secrets_and_keys.md
- domain/00_constitution/global_defaults.md
- domain/20_operational_semantics/identity_key_rotation.md
- domain/20_operational_semantics/claims_compatibility.md
- domain/20_operational_semantics/schema_compatibility.md
- domain/30_interaction_edges/session.md
- domain/30_interaction_edges/client_types.md
- rules/jwt_token_profile.md
