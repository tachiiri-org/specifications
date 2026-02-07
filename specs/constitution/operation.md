# Operation Semantics & Classification

## Operation Categories (Sets)

operation は以下の分類を **集合（set / array）として** 持つ:

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

## Invariants (Must Not Break)

### Explicit Classification

- classification は暗黙推論してはならない。
- すべての state-changing operation は、少なくとも 1 つの非-read カテゴリを持つ。

### Idempotency Coupling

- mutate / irreversible / external_effect operation では、idempotency が必須となる（運用意味論側で具体化する）。
- read operation では、idempotency は要求しない。

### Authorization Coupling

- 認可は operation 分類と結合して評価される。
- read と mutate は異なる認可強度を持ちうる。

### Retry Coupling

- irreversible / external_effect operation では、retry は idempotency 前提でのみ許可される（運用意味論側で具体化する）。

## Non-goals

- REST resource modeling の定義。
- operation 実装手法の制約。
- operation catalog の具体集合（L1の責務）。

## Failure modes

- read に見える operation が副作用を持つ。
- irreversible operation に retry が無制限にかかる。
- operation の性質が人依存で解釈される。

## Related Specifications

- operational_semantics/idempotency.md
- constitution/authorization.md
- operational_semantics/operation_slo_baseline.md
