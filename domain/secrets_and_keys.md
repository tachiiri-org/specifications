# Secrets & Key Management

## Goal

- JWT 検証鍵、暗号鍵、外部APIキー等の扱いを標準化し、漏洩・ローテ不備を防ぐ。
- “どこに置き、どう更新し、どう失効させるか” を仕様化する。

## Scope

- JWT JWKS / signing keys
- encryption keys
- external provider API keys
- rotation / revocation
- environment variable conventions

## Invariants (Must Not Break)

### No secrets in repo/spec JSON

- secrets は仕様リポジトリに書かない（`secrets.json` を運用で持つ場合でも、仕様の正は env/secret store）。
- boundary JSON には “参照方法” のみを書く（例: env var 名）。

### Rotation

- すべての鍵/トークンはローテーション可能でなければならない。
- JWT は短 TTL + 鍵ローテで失効を担保する。

### Least privilege

- コンポーネントごとに必要最小限の secret のみを参照する。

## Required JSON keys (Machine-checkable, Must)

- JWT を検証する境界は `auth.token_profile` を持ち、JWKS 参照（env var）を明示する（`rules/jwt_token_profile.md`）。
- external provider を呼ぶ adapter は:
  - provider key の参照元（env var / secret store）を明示できる（実装側設定で可）

## Failure modes

- 鍵の失効ができず、漏洩時に封じ込め不能になる。
- 共有キーを複数コンポーネントが参照し、横展開する。
- repo に秘密が残り、回収不能になる。

## Related Specifications

- domain/identity.md
- rules/jwt_token_profile.md
