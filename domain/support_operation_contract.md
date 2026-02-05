# Support & Break-glass Operation Contract

## Goal

- 運用・障害対応の操作を「仕様化された例外」として固定する。
- 裏口・属人対応・恒久特権を排除する。
- 監査・期限・理由付けを必須化する。

## Scope

- support operations
- break-glass operations
- audit & observability coupling

## Support Operation Classes (Normative)

- **investigation**
- **mitigation**
- **repair**
- **recovery**
- **break_glass**

## Invariants (Must Not Break)

### Operation-based Support

- support 操作はすべて operation として定義される。
- catalog 外操作は禁止。

### Adapter PDP

- support / break-glass であっても、
  AuthZ の最終判断（PDP）は adapter にある。

### Strong Audit for Break-glass

- break_glass は必ず audit event を生成する。
- 以下は必須：
  - tenant_id
  - actor_id (ops actor)
  - operation_key
  - result
  - reason
  - incident_id or ticket_id
  - request_id

### Time-bound Privilege

- break_glass は期限付きである。
- revoke 可能でなければならない。

### Tenant Isolation

- support 操作は tenant 跨ぎ禁止（例外は別 domain）。

## Failure modes

- 運用の裏口が増殖する。
- 誰が何をしたか説明できない。
- break-glass が恒久権限化する。

## Related Specifications

- domain/authorization.md
- domain/support_and_ops.md
- domain/idempotency.md
- rules/audit_log_contract.md
