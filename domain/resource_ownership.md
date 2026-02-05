# Resource Ownership & Tenant Data Access

## Goal

- AuthZ の “許可/拒否” を、データアクセス（ownership）と矛盾なく結合する。
- tenant 内の resource 所有・参照可能範囲を明確化し、実装の暗黙知化を防ぐ。

## Scope

- tenant-scoped resources
- actor/subject と resource の ownership
- adapter 内での最終 enforcement（PDP/PEPと整合）

## Invariants (Must Not Break)

### Tenant scoping

- すべての resource は単一 tenant に属する。
- tenant_id は verified claims からのみ取得する。

### Ownership check is adapter-owned

- ownership（レコード単位のアクセス可否）判断は adapter の責務。
- gateway/BFF は ownership の最終判断をしてはならない。

### Stable identifiers

- ownership 判定に用いる識別子は stable な ID のみ（actor_id / actor_type / subject_id / tenant_id / resource_id）。
- email/name 等の可変情報を ownership に使ってはならない。

## Required JSON / Catalog expectations (Must)

- ownership を要する operations は catalog で authz 要件を持つこと。
- adapter 実装は observability に:
  - tenant_id / actor_id / operation / resource_id（可能なら）
    を記録してよい（レスポンスには含めない）。

## Non-goals

- 組織階層・グループの標準化。
- ownership DSL の標準化。

## Failure modes

- tenant を跨いだデータアクセスが静かに成立する。
- gateway で ownership を推測し実装差分が出る。
- 可変情報をキーにして監査・復旧が不能になる。

## Related Specifications

- domain/actor.md
- domain/authorization.md
- domain/policy_evaluation.md
