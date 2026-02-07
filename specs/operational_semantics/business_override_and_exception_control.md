# Business Override & Exception Control (Operational Semantics)

## Goal

- override が system behavior に与える影響を deterministic にし、失効を事故らせない。

## Scope

- override evaluation order（評価順序）
- expiry enforcement
- failure semantics
- observability/audit の最低要件

## Invariants (Must Not Break)

### Evaluation order (Must)

- override が存在する場合の評価順序を固定する（実装推論禁止）。
- override は “policy の変更”として扱われ、policy_type と結合して評価される。

### Expiry enforcement (Must)

- expiry 到達後は override を無効として扱う。
- 無効時のデフォルトは通常ルールへ戻す（silent persist 禁止）。

### Failure semantics (Must)

- override の参照/評価に失敗した場合のデフォルトは fail-closed（deny または通常ルール）とし、
  どちらかを policy_type/operation 単位で固定する。

## Failure modes

- override が失効せず恒久特権化する。
- 評価順序が割れて環境差分が出る。
- 監査できず説明不能になる。
