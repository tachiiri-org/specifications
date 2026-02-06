# Role & Scope Governance (Lifecycle & Compatibility)

## Goal

- role / scope の無秩序な増殖と互換性崩壊を防ぐ。
- RBAC / ABAC の詳細モデルを定義せずに、
  “使ってよい形・壊してはいけない原則”だけを固定する。

## Scope

- role / scope naming
- lifecycle (introduction / deprecation / sunset)
- actor type separation

## Invariants (Must Not Break)

### Separation by Actor Type (Must)

- human actor 用 role/scope と service / ops actor 用 role/scope を混同してはならない。
- service actor に human 前提の role を付与してはならない。

### Stable Meaning (Must)

- role / scope の意味を後から変更してはならない。
- 意味変更は breaking change とみなす。

### No Structural Assumptions (Must)

- role / scope に階層・継承・推論を前提としない。
- 推論が必要なモデルは別仕様として導入する（本ファイルに後付けしない）。

## Lifecycle

### Introduction (Must)

- 新しい role / scope は:
  - 目的
  - 対象 actor type
  - 影響 operation
    を明示して導入される（具体の集合はL1で持つ）。

### Deprecation (Must)

- deprecated_since を必須とする。
- 非推奨化しても即削除してはならない。

### Sunset (Must)

- sunset（date or release id）を必須とする。
- sunset 到達後の role/scope は不正とみなされる。

## Failure modes

- role 名は同じだが意味が違う。
- ops 用 role が user に付与される。
- 古い role が消えず、恒久特権になる。

## Related Specifications

- 00_constitution/authorization.md
- 00_constitution/claims_compatibility.md
- 00_constitution/actor_subject_tenant_model.md
