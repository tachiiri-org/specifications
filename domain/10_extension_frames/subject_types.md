# Subject Types (Human vs Non-human) - Versioned Extension

## Goal

- subject（“誰として”）の語彙を拡張する場合に備え、導入条件と安全柵を固定する。
- subject の拡張が AuthZ の不変条件（single executor / trust boundary）を壊さないようにする。

## Scope

- subject_type の enum 拡張（例: human, device, workload）
- actor_type と subject の関係（must-not の見直しを含む）
- versioning と互換性

## Invariants (Must Not Break)

### 1) Versioned introduction

- subject_type の enum 拡張は breaking とみなし、contract-version を上げる。
- 既存 contract-version へ後付けしない。

### 2) Executor remains the only AuthZ identity

- AuthZ 入力の主体は actor（executor）のみ。
- subject は “as/for whom” の意味であり、executor を置換しない。

### 3) Trust boundary

- subject 情報も verified claims 由来であること（注入禁止）。
- header/query/body での subject 注入は禁止。

### 4) Explicit semantics per subject_type

- 新しい subject_type を導入する場合、その意味を operation/policy と矛盾なく定義する。
- “device を主体にする”場合、device identity と attestation の仕様が必要（domain/10_extension_frames/authn_methods.md と整合）。

## Non-goals

- 端末改竄対策や attestation の詳細。
- ユースケース別の全面設計（必要なら別 domain）。

## Failure modes

- subject が executor 扱いになり認可が崩れる。
- device 情報が曖昧に混入し監査不能になる。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/10_extension_frames/authn_methods.md
- domain/00_constitution/authorization.md
- domain/00_constitution/observability.md
