# Rule: Operation Catalog Contract (Machine-enforceable)

## Goal

- gateway → adapter の routing を「実装済み operation のみ」に限定し、未実装が静かに通る事故を防ぐ。
- operation の分類（read/mutate/irreversible/external_effect）を仕様として固定し、
  idempotency / retry / authz と結合する論点をドリフトさせない。

## Applies

- rules/operation_catalog.json
- boundary_gateway_to_adapter.http.catalog (implemented_operations_only)
- boundary_gateway_to_adapter.http.idempotency.require_key.require_header_on_route_operations

## Rule (Must)

### 1) Implemented-only routing

- `rules/operation_catalog.json` の `operations` が「実装済み operation の全集合」である。
- gateway → adapter は catalog に存在しない operation を必ず 404 にする（implemented_operations_only）。

### 2) Explicit classification

- すべての operation は `categories` を必ず持つ（空は禁止）。
- `categories` は以下の集合からのみ選ぶ:
  - read | mutate | irreversible | external_effect

### 3) Classification coherence

- read は「状態を変更しない」を意味するため、read と mutate/irreversible/external_effect の混在は禁止。
  - つまり、`categories` に "read" を含む場合、配列長は 1 でなければならない。

### 4) Idempotency coupling

- `categories` に mutate / irreversible / external_effect が含まれる operation は idempotency 必須。
- idempotency 必須 operation は boundary JSON の
  `http.idempotency.require_key.require_header_on_route_operations`
  に operation 名として含まれていなければならない。

## Failure modes

- catalog が無い/不一致で、未実装 operation が通ってしまう。
- 分類が曖昧で、idempotency の必須性が境界でブレる。
- read に副作用が混入し、retry/キャッシュ/監査が壊れる。
