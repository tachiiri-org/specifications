# Incident Lifecycle & Emergency Controls

## Goal

- incident を “運用裁量” ではなく **仕様化された状態遷移**として扱う。
- emergency 操作を一時的・監査可能・終了条件付きにする。

## Scope

- incident declaration / mitigation / closure
- break-glass activation
- emergency override の制御

## Incident States

- **declared**
  - incident が公式に認識された状態

- **mitigating**
  - 影響緩和操作が実行中

- **stabilized**
  - 影響は収束したが、恒久対応は未完了

- **closed**
  - incident は終了した

## Invariants (Must Not Break)

### Incident is explicit

- incident は明示的に宣言されなければならない。
- “障害っぽいから特別対応” は許されない。

### Emergency controls are incident-bound

- emergency 操作は incident に紐づいてのみ実行できる。
- incident が closed になった時点で無効化される。

### No silent privilege expansion

- incident を理由に恒久権限を付与してはならない。
- 例外はすべて期限付きである。

### Auditability

- incident state の遷移は audit 可能である。
- break-glass / emergency 操作は必ず audit と相関できる。

## Failure Modes

- incident が宣言されずに特権操作が常態化する
- emergency が解除されず恒久化する
- 事後に「何が起きたか」説明できない
