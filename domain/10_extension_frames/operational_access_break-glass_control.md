# Operational Access & Break-glass Control

## Goal

- 障害対応・調査のための特権操作を「仕様化された例外」として扱う。
- 暗黙の裏口・SSH運用・即席スクリプトを排除する。

## Scope

- admin / ops access
- break-glass mode
- emergency operation

## Definitions

- **Break-glass Operation**
  - 通常の authz を超えて許可される操作。

- **Ops Actor**
  - service actor と明確に区別された運用主体。

## Invariants (Must Not Break)

### Explicit declaration

- break-glass operation は catalog に明示される。
- 通常 operation にフラグを足して流用してはならない。

### Strong audit

- すべての break-glass 操作は audit event 必須。
- reason / ticket / incident_id を関連付ける。

### Time-bound

- break-glass は永続的権限にしてはならない。
- 有効期限または明示 revoke を持つ。

## Failure modes

- 障害対応が裏技化する
- 誰が何を壊したか分からない
- 恒久的な特権が残る

## Related Specifications

- domain/00_constitution/authorization.md
- rules/audit_log_contract.md
