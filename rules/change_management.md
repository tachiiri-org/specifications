# Change Management Semantics (Minimal)

## Goal

- 仕様と実装の変更が大規模化しても、breaking/compatible の扱いが揺れないようにする。
- “後で必要になって場当たり的に入れて壊れる” を防ぐ。

## Scope

- contract-version rollout (HTTP)
- schema compatibility (operation/event)
- spec package versioning
- deprecation and sunset

## Invariants (Must Not Break)

### Explicit breaking

- breaking change は必ず明示される：
  - contract-version の更新（HTTP）
  - event version の更新（event/job）
  - または operation/event_type の新設
- breaking を “同一 version 内の変更” で表現してはならない。

### Dual accept window is time-bounded

- dual accept（両対応）は許可されるが、sunset（期限）を持つ。
- 期限なしの両対応は禁止（永続運用負債になるため）。

### Rollout ordering is safe-by-default

- rollout の順序差で壊れない設計を優先する：
  - consumer が先に対応（dual accept）
  - producer が後から新 version を出す
- 例外（producer 先行）を作る場合は契約として明示する。

## Failure modes

- breaking が紛れ、段階ロールアウトで壊れる。
- 両対応が期限なしで残り、運用判断が崩れる。
- 環境ごとに受理範囲がズレて事故る。

## Related Specifications

- rules/contract_version_rollout.md
- domain/20_operational_semantics/schema_compatibility.md
- rules/event_version_rollout.md
- rules/spec_package_versioning.md
