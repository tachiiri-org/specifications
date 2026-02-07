# Feature Enablement & Flag Governance (Operational Semantics)

## Goal

- rollout/rollback を事故らせず、enablement が環境差分にならないようにする。

## Scope

- evaluation timing（明示必須。値は固定しない）
- propagation/caching（明示必須。値は固定しない）
- emergency disable
- observability/audit

## Invariants (Must Not Break)

- flag の評価地点（BFF/gateway/adapter 等）は暗黙にしない。L1 (tool-spec repos) で明示する。
- cache/propagation により tenant ごとに状態が割れる場合、その整合性モデルを明示する（値は固定しない）。
- emergency disable は即時性要件がある前提で設計し、無効化を観測/監査できるようにする。
- enable/disable の結果が cost/limits/billing に影響する場合、暗黙連動は禁止（明示が必要）。

## Failure modes

- 誤有効化/誤無効化の影響範囲が分からない。
- 伝播遅延で tenant 間不整合が出る。
- rollback できず運用停止する。
