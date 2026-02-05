# Policy Types, PDP & PEP Semantics

## Goal

- 認可（AuthZ）以外の policy 判断を統一語彙で扱う。
- 「どこで判断し、どこで拒否するか」を policy 種別ごとに固定する。
- 大規模化による判断責務の分散・混乱を防ぐ。

## Scope

- authorization
- rate limiting
- quota / budget
- abuse / business rules

## Policy Types (Normative Vocabulary)

- **authz**
  - 操作の許可・拒否
- **rate**
  - 単位時間あたりの回数制御
- **quota**
  - 総量制限（回数・件数）
- **budget**
  - 金額・コスト制御
- **business**
  - ドメイン固有ルール

## Invariants (Must Not Break)

### Explicit Policy Type

- すべての policy 判断は type を持つ。
- type 不明な判断は禁止。

### PDP Location Is Fixed

- authz PDP は adapter に固定。
- 他 policy も PDP 位置を domain ごとに明示する。

### PEP Does Not Decide

- PEP（gateway / adapter）は結果を enforce するのみ。
- 判断結果を変更してはならない。

### Early Rejection Rule

- 上流での早期拒否は許可されるが、
  最終判断を代替してはならない。

## Failure Semantics

- policy type に応じたエラーコードを返す：
  - authz → 403
  - rate/quota/budget → 429 or domain-specific
- 502 等への正規化は禁止。

## Observability

- policy 判断は以下を観測できる：
  - policy_type
  - decision (allow/deny)
  - policy_id (if any)
  - operation_key

## Failure modes

- 複数箇所で判断され、結果が分岐する。
- rate/quota が authz と混ざり理由不明になる。
- gateway が意味論的判断を始める。

## Related Specifications

- domain/00_constitution/policy_evaluation.md
- domain/00_constitution/authorization.md
- domain/20_operational_semantics/limits.md
- domain/20_operational_semantics/cost_abuse_resource_exhaustion_protection.md
