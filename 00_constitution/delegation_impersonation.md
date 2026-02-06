# Delegation & Impersonation (Constitutional Semantics)

## Goal

- delegation / impersonation を導入しても actor/subject/initiator/tenant の憲法を壊さない。
- “後付けで claims を増やして既存 AuthZ に混ぜる”事故を防ぐ。
- 責任主体（executor）を曖昧にしない。

## Scope

- delegation（on-behalf-of）
- impersonation（act-as）
- executor / initiator / delegate の語彙（値や具体キーは固定しない）
- versioned introduction の原則
- 監査・期限の必須性（運用詳細は 20 に委譲）

## Definitions (Normative Vocabulary)

- **Executor (actor)**
  - 実行主体。AuthZ の入力として扱う唯一の主体。
- **Initiator**
  - 操作の起点主体。監査・相関用途のみで、AuthZ 入力に使用しない。
- **Delegate**
  - executor に権限を一時的に付与する主体。
  - executor と同一視してはならない。
- **Impersonation**
  - executor が別 subject として振る舞う行為（通常の user action では禁止）。

## Invariants (Must Not Break)

### 1) Single executor per request (Must)

- AuthZ 入力の executor（actor）は常に 1つ。
- delegation/impersonation により複数 actor を AuthZ 入力に混ぜることは禁止。

### 2) Initiator/delegate are non-authz (Must)

- initiator*\* / delegate*\* は監査・相関用途のみ。
- AuthZ 入力に使用してはならない。

### 3) Time-bound (Must)

- delegation/impersonation は必ず期限（expiry/expires_at 相当）を持つ。
- 恒久的委譲は禁止。

### 4) Strong audit is mandatory (Must)

- delegation/impersonation を伴う操作は監査が必須。
- 監査の具体フィールド集合・保存先・保持は 20 と L1 により固定する。

### 5) Versioned introduction only (Must)

- delegation/impersonation を導入する場合は、互換性戦略（contract-version / claims_set_version 等）を明示する。
- 既存 semantics へ後付け混入してはならない。

### 6) Transport & trust boundary (Must)

- delegation/impersonation の情報は verified な内部伝播のみ許容する。
- header/query/body による注入は禁止。
- 内部伝播が必要な場合は token claims として運搬し、claims_set_version により受理範囲を明示する。

### 7) Impersonation is restricted (Must)

- impersonation は ops/service actor のみ許容する。
- human actor による impersonation を禁止する（support/break-glass は別設計で明示する）。

## Informative: Decisions for v1

- delegation chain（多段）は v1 では禁止（単段のみ）。
- 多段委譲は新しい互換性戦略で導入する。

## Related Specifications

- 00_constitution/actor_subject_tenant_model.md
- 00_constitution/authorization.md
- 00_constitution/claims_compatibility.md
- 00_constitution/observability.md
- 20_operational_semantics/delegation_impersonation.md
- 30_interaction_edges/delegation_context_transport.md
