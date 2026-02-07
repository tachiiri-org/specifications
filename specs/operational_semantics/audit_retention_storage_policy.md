# Audit Retention & Storage Policy (Value-free Baseline)

## Goal

- 不可逆操作/外部副作用の説明責任を満たせるよう、audit を通常ログと混同しない。
- audit の保持と改ざん耐性の「最低限の枠」を値なしで固定する。

## Scope

- audit events（`irreversible` / `external_effect` と結合）
- audit の保持方針（明示義務）
- 監査ストレージの改ざん耐性（最低限の前提）
- 具体の日数・ストレージ製品の選定は扱わない

## Invariants (Must Not Break)

### 1) Audit is distinct from logs (Must)

- audit は通常ログ（application logs）と同一の保持・同一のストレージとして扱ってはならない。
- audit は「消えてよい運用ログ」と混在してはならない。

### 2) Audit is required for specific operations (Must)

- `irreversible` / `external_effect` を持つ operation は audit event を必須とする。
- audit event の shape と必須フィールドは L1 (tool-spec repos) を正とする。

### 3) Retention policy is explicit (Must)

- audit の保持方針は明示されなければならない（値は環境で決める）。
- “ログと同じだから”のような暗黙保持を禁止する。

### 4) Minimum tamper-resistance baseline (Must)

- audit の保存先は、最低限として append-only 相当の性質を前提にできること。
- 追記と検証が可能であり、後から恣意的に書き換えられる設計を標準としない。

> 具体の実現方式（WORM、署名チェーン等）は Out-of-Scope。

## Non-goals

- audit retention の具体日数・具体ストレージ製品の固定。
- 監査検索UIや運用手順の標準化。

## Failure modes

- audit が短期で消え、説明不能になる。
- 通常ログと混在して redaction/rotation の都合で欠落する。
- 改ざん耐性がなく、監査として成立しない。

## Related Specifications

- constitution/observability.md
- constitution/operation.md
- constitution/global_defaults.md
