# AuthZ Scaling & Ops Baseline (SLO / Audit Retention)

## Goal

- 大規模化で避けられない複雑性（service-to-service、組織/階層、委譲、運用SLO、監査保持）を、
  既存の “operation-based + adapter PDP” の哲学を崩さずに拡張できるようにする。
- 「後で必要になって場当たり的に入れて壊れる」領域を、先に仕様として枠組み化する。

## Scope

- service actor / internal calls
- delegated execution / impersonation（将来導入の枠）
- operation SLO（分類ベース）
- audit retention / storage policy（最低限）

## Invariants (Must Not Break)

### Adapter PDP remains final

- AuthZ の最終判断責任（PDP）は adapter に固定する。
- service-to-service が増えても、この不変条件は変わらない。

### Service actor is distinct

- service actor は human actor と区別され、claims で明示される。
- service actor が human と同一視される設計は禁止する（権限事故の温床）。

### Delegation/Impersonation is versioned

- delegation / impersonation を導入する場合:
  - 別 domain として導入し
  - contract-version を上げ
  - claims の追加は breaking として扱う
- “後付けで claims を増やして既存AuthZに混ぜる”のは禁止。

### SLO is classification-based

- operation の classification（read/mutate/irreversible/external_effect）に基づき、
  最低限の SLO 指標（availability/latency/error budget）を固定する。
- SLO の例外（特定 operation の厳格化）は operation 単位で明示し、暗黙を作らない。

### Audit retention is explicit

- Audit は Logs と同一保持にしない。
- `irreversible` / `external_effect` は audit event が必須であり、保持期間と改ざん耐性（最低限 append-only 前提）を明示する。

## Non-goals

> 分類基準は `10_non_goals.md` を参照。

### Permanent Non-goals

- 人手運用による例外的な認可判定（仕様外の裁量判断）。

### Deferred-but-Scoped

- delegation/impersonation の詳細モデル導入（別 domain + contract-version）。
- support contract / policy trace / global defaults と結合した運用拡張。

### Out-of-Scope Implementation Details

- SLO 数値・保持期間の具体値。

## Failure modes

- service actor が user 扱いになり、権限が崩壊する。
- delegation が場当たり的に入り、tenant/actor の意味論が壊れる。
- SLO がサービスごとにバラバラで、運用判断が統一できない。
- audit が短期で消えて説明不能になる。

## Related Specifications

- domain/authorization.md
- domain/actor.md
- domain/observability.md
- domain/operation.md
- rules/operation_slo_contract.md
- rules/audit_retention_policy.md
