# Operation Semantics & Classification

## Operation Categories (Sets)

operation は以下の分類を **集合として** 持つ:

- read
- mutate
- irreversible
- external_effect

### Semantic clarifications

- irreversible:
  - 取り消し不能であること
  - 外部/内部を問わない（例: PII purge）
- external_effect:
  - 外部システムとの相互作用
  - reversible である場合もある

> operation は複数分類を同時に持ちうる。

## Invariants

- classification は暗黙推論してはならない。
- irreversible / external_effect は idempotency 必須。

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
