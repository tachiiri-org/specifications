# Rule: Tenant Persistence Contract (Machine-enforceable)

## Goal

- tenant 分離が “実装規約” でなく “検査可能な契約” になるようにする。
- 永続化・キャッシュ・検索の tenant スコープ漏れを CI で検知する。

## Applies

- adapter 実装が参照する persistence definitions（将来: persistence.json / migrations manifest）
- rules/topology.json（adapter の責務境界の確認）
- domain/data_tenant_safety.md

## Rule (Must)

### 1) Tenant-scoped storage declarations

- 永続化カテゴリごとに storage 宣言（例: `def/persistence_*.json`）を持つこと。
- 各 storage 宣言は:
  - category（PII/Billing/Logs/Audit）
  - tenant_scoped: true/false
  - primary_key_fields（配列、空禁止）
  - required_fields（配列、空禁止）
    を持つ。

### 2) tenant_scoped=true の場合の必須条件

- required_fields に `tenant_id` を含むこと。
- primary_key_fields に tenant 分離が成立する形で `tenant_id` を含めること
  - 例外: resource_id がグローバル一意でも tenant_id は required_fields に必須。

### 3) Cache/search index

- cache/index 宣言が存在する場合、tenant_scoped=true では key_fields に `tenant_id` を含むこと。

### 4) Restore safety metadata (Minimum)

- Billing/Audit category は restore 単位を表す metadata を持つこと（例: snapshot boundary / append-only）。

## Failure modes

- DB は tenant_id を持つが、cache/index が tenant を含まず漏洩する。
- PK が tenant を含まず、衝突や混入が起きる。
