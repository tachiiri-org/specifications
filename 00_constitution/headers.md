# Header Processing & Trust Boundary

## Goal

- ヘッダを通じた情報注入・漏洩・境界破壊を防ぐ。
- コンポーネントごとに「信頼できるヘッダ」を明確にする。
- 大規模化で起きる “allowlist ドリフト” を検知できる設計原則を固定する。

## Scope

- front / bff / gateway / adapter
- header pipeline / precedence / normalize
- inbound/outbound allowlist と default drop
- duplicates policy
- hop-by-hop drop
- header to authn（authorization等）

## Design Principles

- ヘッダは **すべて信頼しない前提**で処理する。
- allowlist を基本とし、default drop とする。
- 役割ごとに扱えるヘッダを固定する。
- “trust できないが運用上観測したい” ものは、別名に変換して隔離してよい（任意）。

## Invariants (Must Not Break)

### Pipeline Order

- normalize → hop-by-hop drop → explicit drop → allow → default drop
- pipeline の順序はすべての component で一貫させる。

### Normalization

- すべてのヘッダ名は lowercase に正規化する。
- hop-by-hop ヘッダは最初に drop する。

### Duplicates

- 原則: 同一ヘッダ名が複数存在する場合は reject（400）。
- 例外:
  - `set-cookie` は複数値を許容する（ただし cookie emitter 境界に従う）。
- カンマ結合（join）は行わない（曖昧さを残さない）。

### Allow / Drop

- inbound / outbound ともに explicit allowlist を使う。
- allowlist に無いヘッダは default drop する。
- browser 起点の `authorization` は BFF で reject する。

### Trust Boundary

- browser が付けうる識別系ヘッダ（IP / forwarded 系）を信頼しない。
- gateway / adapter は browser / upstream の cookie を受け取らない。
- identity に関わるヘッダは bearer token のみに集約する。
- identity 相当ヘッダ（`x-actor-*` 等）は downstream で reject する。

## Non-goals

- 任意ヘッダの透過。
- 利用者入力ヘッダの活用（ABテスト等）。
- forwarded / edge 情報を認可に利用すること。
- allowlist の具体セットやJSONキー形の固定（L1の責務）。

## Failure modes

- allowlist 更新漏れで必要なヘッダが silently drop される。
- drop 順序の不整合で、コンポーネント間の挙動が変わる。
- identity / auth 関連ヘッダが境界を越えて漏れる。
- 重複ヘッダの扱いが曖昧で、実装差分が攻撃面になる。

## Change checklist

- 新しいヘッダを追加したか
  - inbound / outbound allowlist を更新したか（L1）
  - CORS / CSRF / redaction に反映したか（該当する場合）
  - pipeline order の一貫性を維持しているか
