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
- wire-level ambiguity の排除（無効ヘッダの扱い、join禁止）

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
- wire-level ambiguity を残す正規化（例: 複数行折り返し前提、曖昧な結合）は行わない。

### Invalid Header Syntax (Must)

- 無効なヘッダ構文（不正文字・不正改行・解析不能）は **reject（400）** する。
- 解析不能なまま downstream に透過してはならない（must-not）。
- どの文字を無効とみなすか等の具体は実装/L1でよいが、**「解析不能は拒否」**は不変条件とする。

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
- allowlist の具体セットやJSONキー形の固定（L1 (tool-spec repos) の責務）。

## Failure modes

- allowlist 更新漏れで必要なヘッダが silently drop される。
- drop 順序の不整合で、コンポーネント間の挙動が変わる。
- identity / auth 関連ヘッダが境界を越えて漏れる。
- 重複ヘッダの扱いが曖昧で、実装差分が攻撃面になる。
- 無効ヘッダが透過し、境界差で解釈が分岐する。

## Change checklist

- 新しいヘッダを追加したか
  - inbound / outbound allowlist を更新したか（L1 (tool-spec repos)）
  - CORS / CSRF / redaction に反映したか（該当する場合）
  - pipeline order の一貫性を維持しているか
  - duplicates / invalid syntax の扱いに曖昧さがないか
