# Secrets & Key Management

## Goal

- JWT 検証鍵、暗号鍵、外部APIキー等の扱いを標準化し、漏洩・ローテ不備を防ぐ。
- “どこに置き、どう更新し、どう失効させるか” を仕様化する。
- 仕様リポジトリ（specifications/）を **秘密情報の正（source of truth）にしない**。

## Scope

- JWT verification keys / JWKS
- encryption keys
- external provider API keys
- rotation / revocation
- secret reference（値ではなく参照方式）

## Invariants (Must Not Break)

### No secrets in repo

- secrets（鍵・トークン・API key・クレデンシャル）は仕様リポジトリに書かない。
- 仕様に書けるのは **参照方法のみ**:
  - env var 名
  - secret store key 名（例: "secret://..." のような参照）
  - runtime が解決する locator（値は含めない）

### Samples are non-normative

- サンプル（例: `*.example.*`）を置く場合:
  - 実運用で使える値を含めない（ダミーのみ）
  - ファイル名で “example / sample” を明示する
  - normative inputs に含めない

### Rotation

- すべての鍵/トークンはローテーション可能でなければならない。
- JWT は短 TTL + 鍵ローテで失効を担保する。
- secret の更新は “無停止” を前提にできる設計を推奨する（cache + periodic refresh 等）。

### Least privilege

- コンポーネントごとに必要最小限の secret のみを参照する。
- 同一 secret を複数コンポーネントが共有して横展開する設計を避ける。

## Non-goals

- 参照方式の具体フォーマット（locator構文）や、secret store 製品の固定。
- 検証/参照設定のJSONキーやlint契約（L1の責務）。

## Failure modes

- repo に秘密が残り、回収不能になる。
- 鍵の失効ができず、漏洩時に封じ込め不能になる。
- 共有キーを複数コンポーネントが参照し、横展開事故になる。

## Related Specifications

- constitution/identity.md
- constitution/identity_key_rotation.md
