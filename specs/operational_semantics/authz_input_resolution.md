# Authorization Input Resolution (Operational Semantics)

## Goal

- adapter 実装の属人化・非決定性・失敗時の挙動分裂を防ぐ。
- “lookup failure を 403（authz deny）に混ぜる” 等の誤分類を防ぎ、運用で原因が追えるようにする。

## Scope

- adapter-side lookup/computation の determinism
- cache/consistency の扱い（値は固定しない）
- failure semantics（デフォルトと例外）
- observability（resolver failure の分類）

## Invariants (Must Not Break)

### Determinism (Must)

- adapter-side resolution は deterministic でなければならない。
- 同一リクエスト内で判断材料が揺れてはならない（request-scoped consistency）。

### Side-effect free (Must)

- resolution は副作用を持ってはならない（書き込み禁止）。
- 外部呼び出しを含む場合でも、AuthZ 判断のための read-only であること。

### Failure semantics (Must)

- lookup failure / timeout / inconsistent data のデフォルトは fail-closed とする。
- fail-closed の実装は少なくとも以下を満たす:
  - “silent allow” をしてはならない。
  - failure を authz deny（403）へ **正規化してはならない**（原因不可視化を防ぐ）。
- 推奨デフォルト:
  - resolver failure は 503（または domain の一時失敗）として扱い、
    AuthZ decision trace/observability に “resolution_failed” を記録する。
- 例外（degraded allow 等）を導入する場合は operation 単位で明示し、監査・可観測性を伴う（暗黙 fallback 禁止）。

> 注:
>
> - 403 は “AuthZ deny” の意味を持つため、resolution の故障と混ぜない。
> - 実際のエラー形/コードの機械契約は L1 (tool-spec repos) を正とする。

### Caching (Recommended)

- cache を用いる場合、staleness と invalidation を明示する（値は固定しない）。
- cache により allow/deny が環境差で割れないよう、評価順序とフォールバックを固定する（実装推論禁止）。

### Observability (Must)

- resolution の有無・結果を観測できる:
  - attempted: true/false
  - outcome: success | timeout | not_found | inconsistent | error
- PII/secret を観測に含めない（hash/drop）。

## Failure modes

- lookup failure が silent allow になり権限逸脱する。
- 非決定性により同一条件で判断が揺れる。
- cache 差で環境ごとに認可が割れる。
- resolver failure が 403 に混ざり、運用で原因が追えない。

## Related Specifications

- constitution/authz_input_resolution.md
- constitution/authorization.md
- constitution/policy_decision_trace.md
- constitution/global_defaults.md
