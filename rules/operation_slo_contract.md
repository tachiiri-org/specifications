# Rule: Operation SLO Contract (Machine-enforceable Baseline)

## Goal

- 大規模運用の共通言語として、operation classification ベースの最低SLOを固定する。
- “重要操作の扱いがチームごとに違う”問題を防ぐ。

## Applies

- rules/operation_catalog.json
- domain/authz_and_ops_scaling.md

## Rule (Must)

### 1) Baseline SLO per classification

- catalog item は `slo` を持ってよい。
- `slo` を持たない場合でも、以下の baseline を適用する（計測・アラートの最低基準）:

- read:
  - latency 目標: p95 を計測対象にする（具体値は環境設定）
  - error budget: 4xx/5xx を分類して集計
- mutate:
  - latency: p95 + p99 を計測対象
  - error budget: retry対象エラー（502/503/504）を区別
- irreversible/external_effect:
  - latency: p95 + p99
  - error budget: 失敗率を厳格に集計
  - audit event 必須（`rules/audit_log_contract.md` と整合）

### 2) SLO overrides are explicit

- 特定 operation を厳しくする場合、catalog item に `slo.override` を明示する。
- “暗黙でこの操作は重要”は禁止。

### 3) Observability binding

- SLO 集計に必要なラベルは “制御された集合” からのみ使う（catalog由来の operation_key 等）。
- 高カーディナリティ（email等）をラベルに使ってはならない。

## Failure modes

- 重要操作が通常操作と同じ扱いで、障害影響が把握できない。
- SLO が属人化し、運用判断が統一できない。
