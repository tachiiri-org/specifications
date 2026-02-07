# Runtime Configuration & Emergency Controls

## Goal

- runtime configuration の変更を
  **release か emergency か** に厳密に分類する。
- 環境差分や属人対応を防ぐ。

## Scope

- runtime config
- emergency disable / enable
- configuration rollback

## Invariants (Must Not Break)

### Config change classification

- 通常の config change:
  - release lifecycle に従う
- emergency config change:
  - incident に紐づく

### No silent config mutation

- runtime config の直接変更を正当化しない。
- “一時的だから” は理由にならない。

### Emergency config is temporary

- emergency config には必ず解除条件がある。
- incident close と同時に無効化される。

### Observability

- config change は観測可能でなければならない。
- 値の中身ではなく **変更が起きた事実**を記録する。

## Failure Modes

- config が環境ごとにズレる
- emergency flag が恒久化する
- 変更理由が後から追えない
