# Delegation & Impersonation (Versioned Introduction, vNext)

## Goal

- delegation / impersonation を導入する際に、actor/subject/initiator/tenant の憲法を壊さずに拡張する。
- “後付けで claims を増やして既存 AuthZ に混ぜる”事故を防ぐ。
- 監査・期限・理由を必須にし、恒久特権化を防ぐ。

## Scope

- delegation（on-behalf-of）
- impersonation（act-as）
- delegation chain（多段）
- audit / trace requirements
- contract-version と互換性

## Definitions

### Executor (Actor)

- 実行主体。AuthZ 入力として扱う唯一の主体（domain/00_constitution/actor_subject_tenant_model.md）。

### Subject

- “誰として”の主体。
- vNext では subject の意味を拡張し得るが、必ず versioned に導入する。

### Initiator

- 起点主体。AuthZ 入力に使用しない。

### Delegation context (New vocabulary)

- delegation/impersonation を表す付帯コンテキスト。
- 例（語彙の候補。具体 keys は contract-version で固定する）:
  - delegation_mode: delegation|impersonation
  - delegation_chain: list of (delegator_id, delegator_type, delegated_at)
  - delegated_subject_id / delegated_subject_type
  - delegation_reason (short)
  - delegation_expires_at

## Invariants (Must Not Break)

### 1) Single executor per request remains

- AuthZ 入力の executor（actor）は常に 1つ。
- delegation により “複数 actor を AuthZ 入力に混ぜる”ことは禁止。

### 2) Initiator remains non-authz

- initiator\_\* は監査・相関用途のみ。
- delegation の導入後も initiator を AuthZ 入力に使用してはならない。

### 3) Explicit, versioned introduction

- delegation/impersonation を導入する場合:
  - 別 domain として導入し（本ファイル）
  - contract-version を上げる
  - boundary JSON / schema / catalog を揃えて更新する
- “既存 token に claims を足して混ぜるだけ”は禁止（domain/_misc/authz_and_ops_scaling.md）。

### 4) Strong audit is mandatory

- delegation/impersonation を伴う operation は audit event を必須とする（最低限）:
  - tenant_id
  - actor_id (executor)
  - actor_type
  - initiator_actor_id（存在する場合）
  - operation_key
  - decision/result
  - delegation_mode
  - delegated_subject_id（適用される場合）
  - delegation_chain（短縮表現でもよいが相関可能にする）
  - reason
  - expires_at

### 5) Time-bound

- delegation は必ず期限（expires_at）を持つ。
- 恒久的な委譲は許可しない（別設計が必要）。

## Non-goals

- 具体の UI/ワークフロー（承認フロー等）。
- 組織階層との結合（domain/10_extension_frames/org_model.md の責務）。

## Failure modes

- executor と subject が混ざり confused deputy が発生する。
- delegation が恒久特権化し、運用事故になる。
- claims の後付けで既存 AuthZ が破壊される。

## Related Specifications

- domain/00_constitution/actor_subject_tenant_model.md
- domain/00_constitution/authorization.md
- domain/_misc/authz_and_ops_scaling.md
- domain/20_operational_semantics/support_and_ops.md
- domain/00_constitution/observability.md
- rules/audit_log_contract.md
