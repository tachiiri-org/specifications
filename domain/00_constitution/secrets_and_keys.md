# Secrets & Key Management

## Goal

- JWT 検証鍵、暗号鍵、外部APIキー等の扱いを標準化し、漏洩・ローテ不備を防ぐ。
- “どこに置き、どう更新し、どう失効させるか” を仕様化する。
- 仕様リポジトリ（specifications/）を **秘密情報の正（source of truth）にしない**。

## Scope

- JWT JWKS / signing keys
- encryption keys
- external provider API keys
- rotation / revocation
- environment variable conventions
- secret reference in boundary/connector definitions

## Invariants (Must Not Break)

### No secrets in repo/spec JSON

- secrets（鍵・トークン・API key・クレデンシャル）は仕様リポジトリに書かない。
- `def/*.json` / `rules/*.json` / `schemas/*.json` は secrets を含んではならない。
- 仕様に書けるのは **参照方法のみ**：
  - env var 名
  - secret store key 名（例: "secret://..." のような参照）
  - runtime が解決する locator（値は含めない）

### Samples are non-normative

- サンプル（例: `secrets.example.json`）を置く場合：
  - 実運用で使える値を含めない（ダミーのみ）
  - ファイル名で “example / sample” を明示する
  - lint の入力（normative inputs）に含めない

### Rotation

- すべての鍵/トークンはローテーション可能でなければならない。
- JWT は短 TTL + 鍵ローテで失効を担保する。
- secret の更新は “無停止” を前提にできる設計を推奨する（cache + periodic refresh 等）。

### Least privilege

- コンポーネントごとに必要最小限の secret のみを参照する。
- 同一 secret を複数コンポーネントが共有して横展開する設計を避ける。

## Required JSON keys (Machine-checkable, Must)

- JWT を検証する境界は `auth.token_profile` を持ち、JWKS 参照（env var または secret locator）を明示する（`rules/jwt_token_profile.md`）。
- external provider を呼ぶ adapter（connector を持つ operation を含む）は：
  - provider key の参照元（env var / secret store locator）を明示できる（実装側設定でもよいが “参照方式” は仕様で宣言できること）。

## Failure modes

- repo に秘密が残り、回収不能になる。
- 鍵の失効ができず、漏洩時に封じ込め不能になる。
- 共有キーを複数コンポーネントが参照し、横展開事故になる。

## Related Specifications

- domain/00_constitution/identity.md
- rules/jwt_token_profile.md
