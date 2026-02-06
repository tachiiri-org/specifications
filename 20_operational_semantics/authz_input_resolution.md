# Authorization Input Resolution (Operational Semantics)

## Goal

- adapter 実装の属人化・非決定性・失敗時の挙動分裂を防ぐ。

## Scope

- adapter-side lookup/computation の determinism
- cache/consistency の扱い（値は固定しない）
- failure semantics（デフォルトと例外）

## Invariants (Must Not Break)

### Determinism (Must)

- adapter-side resolution は deterministic でなければならない。
- 同一リクエスト内で判断材料が揺れてはならない（request-scoped consistency）。

### Side-effect free (Must)

- resolution は副作用を持ってはならない（書き込み禁止）。
- 外部呼び出しを含む場合でも、AuthZ 判断のための read-only であること。

### Failure semantics (Must)

- lookup failure / timeout / inconsistent data のデフォルトは deny（fail-closed）。
- 例外（degraded allow 等）を導入する場合は operation 単位で明示し、監査・可観測性を伴う。

### Caching (Recommended)

- cache を用いる場合、staleness と invalidation を明示する（値は固定しない）。
- cache により allow/deny が環境差で割れないよう、評価順序とフォールバックを固定する。

## Failure modes

- lookup failure が silent allow になり権限逸脱する。
- 非決定性により同一条件で判断が揺れる。
- cache 差で環境ごとに認可が割れる。
