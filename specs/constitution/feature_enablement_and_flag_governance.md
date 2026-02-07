# Feature Enablement & Flag Governance (Constitution)

## Goal

- feature flag / 段階有効化を裏仕様にしない。
- contract-version / rollout と衝突しない安全柵を固定する。

## Scope

- feature flag / enablement state（語彙は固定しない）
- tenant単位の特例
- contract-version との関係（原則）
- 具体評価地点/実装は L1 (tool-spec repos)

## Invariants (Must Not Break)

- feature flag は AuthZ の代替にしてはならない。
- contract-version を跨ぐ意味変更は、互換性戦略なしに許可されない。
- tenant 特例（この tenant だけ特別）は必ず理由・期限を持つ。
- hidden default enable は禁止（初期状態を明示する）。

## Related Specifications

- constitution/authorization.md
- constitution/claims_compatibility.md
- operational_semantics/feature_enablement_and_flag_governance.md
