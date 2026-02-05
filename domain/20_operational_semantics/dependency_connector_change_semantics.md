# Dependency & Connector Change Semantics

## Goal

- 外部API・基盤サービスの変更が、SaaS全体の意味論を破壊しないようにする。
- 「外部が壊れた時にどう劣化するか」を仕様として固定する。

## Scope

- external connectors
- provider outage / rate-limit
- degraded behavior
- fallback / disablement

## Definitions

- **Connector**
  - 外部依存点（payment provider, storage, SaaS API 等）。

- **Degraded Mode**
  - 完全失敗ではなく、機能制限付きで提供する状態。

- **Connector Contract**
  - timeout / retry / audit / data classification を含む依存契約。

## Invariants (Must Not Break)

### Explicit failure semantics

- connector failure は以下のいずれかとして扱われる:
  - fail-fast
  - retryable
  - degraded
  - disabled

### External effect safety

- degraded / retry 中に external_effect を二重実行してはならない。
- audit/event と必ず相関できる。

### Contract isolation

- 外部仕様変更は adapter 内で吸収する。
- 上流（gateway/BFF）に外部由来の差分を漏らさない。

## Failure modes

- provider 差分が直接 API 契約に現れる
- 障害時に無限 retry で雪崩れる
- 部分成功が説明不能になる

## Related Specifications

- rules/connectors.json
- domain/20_operational_semantics/billing.md
