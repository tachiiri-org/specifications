# Identity Key Rotation & Issuer Governance

## Goal

- JWT 検証鍵・issuer の変更や追加を安全に行える語彙を固定する。
- 緊急ローテーション・多 issuer 運用時でも AuthN を壊さない。
- 実装差・環境差による検証失敗を防ぐ。

## Scope

- JWT signing key (JWKS)
- key rotation / overlap
- issuer allowlist
- verification cache

## Definitions

### Issuer

- JWT を発行する主体。
- gateway / adapter は allowlist に含まれる issuer のみを受理する。

### Signing Key

- JWT の署名に使用される鍵。
- 公開鍵は JWKS として取得される。

### Rotation Overlap

- 旧鍵と新鍵を同時に受理する期間。

## Invariants (Must Not Break)

### Explicit Issuer Allowlist

- 境界は受理する issuer の allowlist を明示する。
- allowlist 外 issuer の token は reject（401）。

### Rotation Overlap Is Mandatory

- 鍵ローテーション時は overlap 期間を必ず設ける。
- overlap 無しの鍵切り替えは禁止。

### Cache With Expiry

- JWKS の取得結果は cache される。
- cache TTL と失効条件は実装で明示されなければならない。

### No Secrets in Spec

- 秘密鍵・実鍵値は仕様リポジトリに書かない。
- 参照方法（JWKS URL / secret locator）のみを記述する。

## Failure Handling

- JWKS 取得失敗時の挙動は明示される：
  - fail-fast
  - cached-only
- silent accept（検証スキップ）は禁止。

## Failure modes

- 鍵切り替えで全リクエストが401になる。
- issuer が増え、境界ごとに挙動が割れる。
- キャッシュ不備で検証遅延がスパイクする。

## Related Specifications

- domain/00_constitution/identity.md
- domain/00_constitution/secrets_and_keys.md
- rules/jwt_token_profile.md
