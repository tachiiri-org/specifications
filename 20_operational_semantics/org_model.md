# Organization Hierarchy, Groups & Teams (Tenant-scoped Directory Model)

## Goal

- 組織階層 / グループ / チーム構造を、tenant-scoped な “directory/entitlement” として標準化する。
- actor/subject/tenant/initiator の憲法を汚さずに、権限・可視性・運用の拡張余地を作る。
- “AuthZ 入力 claims に org 構造を混ぜる”設計を抑止し、ドリフトを防ぐ。

## Scope

- 組織の語彙（org unit / group / team）
- tenant 内スコープの不変条件（tenant isolation）
- roles/scopes との結合方針（発行 or lookup）
- directory lookup の失敗時の挙動（degraded / deny）

## Definitions

### Org Unit (OU)

- tenant 内の階層単位（例: 部門）。
- OU の階層は tenant 内で閉じる（tenant を跨がない）。

### Group

- メンバー集合（静的/動的いずれもあり得る）。
- 権限付与（role/scope）や可視性制御の単位になりうる。

### Team

- 運用上のまとまり（プロダクト/プロジェクト単位等）。
- Group と同一視しない（語彙上区別する）。

### Directory

- OU/Group/Team の正規データソース（IdP/SCIM/内部Directory等）。
- adapter が参照する場合は connector として扱える（dependency semantics と整合）。

## Invariants (Must Not Break)

### 1) Tenant isolation (Must)

- OU/Group/Team は必ず単一 tenant に属する。
- tenant を跨ぐ “共有グループ” は禁止（導入する場合は別 contract-version）。

### 2) Do not pollute AuthZ input claims (Must)

- internal boundaries の AuthZ 入力は `domain/00_constitution/authorization.md` の allowed claims に限定する。
- `org_path` / `group_ids` 等の org 構造を AuthZ 入力 claims として直接追加してはならない。
- org 構造を使って認可する場合は、以下いずれかに畳み込む:
  - A) roles/scopes の発行元（IdP/Directory）側で解決し、roles/scopes に反映する
  - B) adapter が directory を参照（lookup）し、policy evaluation の内部入力として利用する
    - ただし “新しい token claims を後付けで混ぜる” は禁止

### 3) Failure semantics are explicit (Must)

- directory lookup が必要な operation では、失敗時の挙動を operation 単位で明示する:
  - deny（推奨: 安全側）
  - degraded（read のみ等）
- “lookup できないなら許可する” の暗黙 fallback は禁止。

### 4) Observability (Must)

- directory lookup の有無・結果（success/timeout/deny）は observability に分類して記録できる。
- directory から PII をログに落とさない（hash/drop）。

## Failure modes

- org 構造が token claims に混入し、境界ごとに解釈が割れる。
- group/team を human identity と同一視して confused deputy が起きる。
- directory 障害で “暗黙許可” が発生し権限事故になる。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/00_constitution/authorization.md
- domain/00_constitution/identity.md
- domain/00_constitution/observability.md
- domain/20_operational_semantics/dependency_connector_change_semantics.md
