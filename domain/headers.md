# Header Processing & Trust Boundary

## Goal

- ヘッダを通じた情報注入・漏洩・境界破壊を防ぐ。
- コンポーネントごとに「信頼できるヘッダ」を明確にする。
- 大規模化で起きる “allowlist ドリフト” を機械検知できる形にする。

## Scope

- front / bff / gateway / adapter
- header_pipeline
- header_precedence
- header_normalize
- header_to_allow_inbound / outbound
- header_to_drop_inbound / outbound
- header_hop_by_hop_drop
- header_to_authn
- header_duplicates / join_policy

## Design Principles

- ヘッダは **すべて信頼しない前提**で処理する。
- allowlist を基本とし、default drop とする。
- 役割ごとに扱えるヘッダを固定する。
- “trust できないが運用上観測したい” ものは、別名に変換して隔離する（任意）。

## Invariants (Must Not Break)

### Pipeline Order

- normalize → hop-by-hop drop → explicit drop → allow → default drop
- pipeline の順序はすべての component で一貫させる。
- **すべての boundary JSON は `headers.pipeline_order` を必ず持つ（機械検査で必須）。**
  - 例:
    - ["normalize","drop_hop_by_hop","explicit_drop","allow","default_drop"]

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

## Required JSON keys (Machine-checkable, Must)

- すべての boundary JSON は以下を持つ:
  - `headers.pipeline_order`
  - `headers.inbound.allow`
  - `headers.inbound.drop`
  - `headers.outbound.allow`
  - `headers.outbound.drop`
  - `headers.duplicates.policy`（デフォルト reject の明示）
  - `headers.requirements`（必要ヘッダの必須性を明示する場合）
- internal boundaries（bff_to_gateway, gateway_to_adapter）では:
  - request header `cookie` を allow してはならない
  - response header `set-cookie` を allow してはならない

## Non-goals

- 任意ヘッダの透過。
- 利用者入力ヘッダの活用（ABテスト等）。
- forwarded / edge 情報を認可に利用すること。

## Failure modes

- allowlist 更新漏れで必要なヘッダが silently drop される。
- drop 順序の不整合で、コンポーネント間の挙動が変わる。
- identity / auth 関連ヘッダが境界を越えて漏れる。
- 重複ヘッダの扱いが曖昧で、実装差分が攻撃面になる。

## Change checklist

- 新しいヘッダを追加したか
  - inbound / outbound allowlist を更新したか
  - CORS / CSRF / redaction に反映したか
  - `headers.pipeline_order` が全 boundary JSON に存在することを確認したか
