# Authorization (AuthZ) Semantics

## Goal

- 「誰が・どの operation を実行できるか」を一貫した意味論で定義する。
- 認可判断の責任境界を固定し、境界ごとの差分や事故を防ぐ。
- 認証（AuthN）と明確に分離し、仕様と実装の責務を安定させる。

## Scope

- internal boundaries（BFF ⇄ Gateway ⇄ Adapter）
- operation 単位の認可
- scope / role / permission に基づく判断（モデル詳細は定義しない）
- 認可失敗時の意味論（レスポンス／observability）

## Design Principles

- 認可は **operation 単位**で行う。
- 認可判断は **意味論**であり、UI や transport に依存しない。
- 認可の最終判断点は、副作用を実行する最終地点に置く。

## Invariants (Must Not Break)

### Separation from Authentication

- 認可は「本人確認（AuthN）」が成功した後にのみ評価される。
- 認証失敗と認可失敗は異なる意味を持つ。
  - AuthN failure → 401
  - AuthZ failure → 403

### Decision Ownership (PDP)

- **認可の最終判断責任（PDP）は adapter にある。**
- BFF / gateway は、認可判断を「完結」させてはならない。
  - 事前検証・早期拒否は許されるが、最終判断ではない。

### Operation-based Authorization

- 認可は HTTP method / path ではなく **operation** に対して行う。
- 同一 operation は、どの経路・どの client から呼ばれても同じ認可意味を持つ。

### Token-derived Context

- 認可判断に用いる情報は、**検証済み token claims のみ**とする。
- header / query / body による権限指定や identity 注入は行わない。

### Allowed claims for AuthZ (Must)

- AuthZ の入力として使用してよい claims は以下に限定する（追加は breaking change とみなす）:
  - `tenant_id`
  - `actor_id`
  - `actor_type`
  - `subject_id`（存在する場合）
  - `subject_type`（存在する場合。現時点では "human" のみ）
  - `roles`（配列）
  - `scopes`（配列）
- 上記以外（例: email, display_name, ip 相当）は AuthZ 入力に使用してはならない。
- `initiator_*` は監査・相関用途のみであり、AuthZ 入力に使用してはならない（must-not）。

### Failure Semantics (Response)

- 認可失敗時は:
  - HTTP status: 403
  - 利用者に詳細理由は返さない。
- 内部 observability には、reason / rule / operation を記録してよい（レスポンスには含めない）。

### Existence confidentiality (Recommended default)

- 標準方針:
  - **AuthZ failure は 403 を返す**（存在秘匿のために 404 へ偽装しない）。
- 例外（存在秘匿が必要）を導入する場合:
  - operation 単位で明示し、互換性戦略（contract-version 等）を伴う。
  - “404偽装” は global default にしない。

## Non-goals

- 認可に無関係なプロフィール属性（email/display_name等）を AuthZ 入力として扱うこと。
- 具体的なポリシー記述言語・エンジン実装の選定。
- 境界JSONのキー/形・エラー伝播設定などの **機械契約**（L1の境界仕様とlintの責務）。

## Observability

- authz failure は以下を内部ログに記録してよい:
  - actor_id
  - actor_type
  - tenant_id
  - subject_id（あれば）
  - operation_key
  - rule_id
  - decision（allow/deny）

## Related Specifications

- 00_constitution/actor_subject_tenant_model.md
- 00_constitution/actor.md
- 00_constitution/identity.md
- 00_constitution/policy_evaluation.md
- 00_constitution/operation.md
- 00_constitution/observability.md
- 00_constitution/global_defaults.md
- 00_constitution/policy_decision_trace.md

- 00_constitution/role_scope_governance.md
- 00_constitution/claims_compatibility.md
- 10_extension_frames/policy_types.md
- 10_extension_frames/delegation_impersonation.md
- 10_extension_frames/subject_types.md
