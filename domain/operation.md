# Operation Semantics & Classification

## Goal

- operation の「性質」を明示し、retry / idempotency / authZ / CSRF 等との結合点を固定する。
- 命名や routing だけでは表現できない意味論を安定させる。

## Scope

- operation catalog
- state-changing 判定
- effect 特性

## Operation Categories

- **read**
  - 状態を変更しない。
- **mutate**
  - 内部状態を変更する。
- **irreversible**
  - 外部副作用を持ち、取り消し不能。
- **external_effect**
  - 外部 API / billing / provisioning 等を伴う。

## Invariants (Must Not Break)

### Explicit Classification

- すべての state-changing operation は、少なくとも 1 つの非-read カテゴリを持つ。
- operation の分類は暗黙に推論してはならない。

### Idempotency Coupling

- mutate / irreversible / external_effect operation では、idempotency が必須となる。
- read operation では、idempotency は要求しない。

### Authorization Coupling

- 認可は operation 分類と結合して評価される。
- read と mutate は異なる認可強度を持ちうる。

### Retry Coupling

- irreversible / external_effect operation では、retry は idempotency 前提でのみ許可される。

## Non-goals

- REST resource modeling の定義。
- operation 実装手法の制約。

## Failure modes

- read に見える operation が副作用を持つ。
- irreversible operation に retry が無制限にかかる。
- operation の性質が人依存で解釈される。

## Related Specifications

- rules/operation_catalog_governance.md
- domain/idempotency.md
- domain/authorization.md
