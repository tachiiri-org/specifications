# Identity Key Rotation & Issuer Governance (Interaction Edge)

## Goal

- JWT 検証鍵・issuer の変更や追加を安全に行える原則を固定する。

## Scope

- issuer allowlist
- rotation overlap
- verification cache（値は固定しない）
- failure handling（挙動の明示必須）

## Invariants (Must Not Break)

- 境界は受理する issuer allowlist を明示する。
- allowlist 外 issuer の token は reject（401）。
- 鍵ローテーション時は overlap 期間を必ず設ける（overlap 無しは禁止）。
- JWKS/検証情報の cache は許容するが、TTL/失効条件は明示されなければならない（値は固定しない）。
- 取得失敗時の挙動（fail-fast/cached-only 等）は明示される。
- 検証スキップ（silent accept）は禁止。
- secrets（秘密鍵・実鍵値）は仕様に書かない（参照方式のみ）。

## Related Specifications

- 00_constitution/identity.md
- 00_constitution/secrets_and_keys.md
