# Operational Access & Break-glass Operations

## Goal

- 障害対応・調査のための特権操作を「仕様化された例外」として扱う。
- 暗黙の裏口・属人対応・恒久特権を排除する。
- 監査・期限・理由付けを必須化する。

## Scope

- support operations
- break-glass operations
- audit & observability coupling
- tenant isolation baseline

## Vocabulary (Normative)

### Support Operation Classes

- **investigation**
- **mitigation**
- **repair**
- **recovery**
- **break_glass**

## Invariants (Must Not Break)

### 1) Operation-based Support (Must)

- support / break-glass はすべて operation として定義される。
- catalog 外操作は禁止。

### 2) Adapter PDP remains final (Must)

- support / break-glass であっても AuthZ の最終判断（PDP）は adapter にある。
- gateway/BFF が意味論的判断を代替してはならない。

### 3) Strong audit for break-glass (Must)

- break_glass は必ず audit event を生成する。
- 最低限以下は必須：
  - tenant_id
  - actor_id (ops actor)
  - actor_type
  - operation_key
  - result
  - reason
  - incident_id or ticket_id
  - request_id

### 4) Time-bound privilege (Must)

- break_glass は期限付きである。
- revoke 可能でなければならない。
- 恒久的な特権（恒久委譲/恒久break-glass）は許可しない。

### 5) Tenant isolation (Must)

- support 操作は tenant 跨ぎ禁止（例外は cross-tenant exception として別 contract-version）。
- human actor の break_glass をデフォルトで許可しない（ops/service actor に限定）。

## Failure modes

- 運用の裏口が増殖する。
- 誰が何をしたか説明できない。
- break-glass が恒久権限化する。

## Related Specifications

- domain/00_constitution/authorization.md
- domain/00_constitution/actor_subject_tenant_model.md
- domain/20_operational_semantics/support_and_ops.md
- domain/20_operational_semantics/cross_tenant_exceptions.md
- domain/00_constitution/observability.md
- rules/audit_log_contract.md
