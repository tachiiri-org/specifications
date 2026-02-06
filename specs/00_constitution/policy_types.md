# Policy Types, PDP & PEP Semantics

## Goal

- 認可（AuthZ）以外の policy 判断を統一語彙で扱う。
- 「どこで判断し、どこで拒否するか」を policy 種別ごとに固定する。
- 大規模化による判断責務の分散・混乱を防ぐ。
- policy 拒否の意味（status）を境界横断で維持し、上流の再分類を防ぐ。

## Scope

- authorization
- rate limiting
- quota / budget
- abuse / business rules
- failure semantics（statusの意味の保持。値なし）

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

### Explicit Policy Type (Must)

- すべての policy 判断は type を持つ。
- type 不明な判断は禁止。

### PDP Location Is Fixed (Must)

- authz PDP は adapter に固定（`00_constitution/authorization.md`）。
- 他 policy も PDP 位置を domain / boundary 契約で明示する（具体はL1/運用意味論へ）。

### PEP Does Not Decide (Must)

- PEP（gateway / adapter）は結果を enforce するのみ。
- 判断結果を変更してはならない。

### Early Rejection Rule (Must)

- 上流での早期拒否は許可されるが、最終判断を代替してはならない。

### Failure semantics must not be reclassified (Must)

- policy 拒否の意味（status と policy_type の対応）を上流で別意味に正規化してはならない。
  - 例: rate/quota/budget 拒否を authz（403）へ正規化しない。
  - 例: 下流の authz deny（403）を上流が 404/502 に正規化しない。
- 例外は operation 単位で明示し、互換性戦略（contract-version 等）を伴う。

## Failure Semantics (Normative)

- policy type に応じたエラーコードを返す（境界の正規化で潰さない）:
  - authz → 403
  - rate/quota/budget → 429 または domain 固有（ただし意味を別種へ再分類しない）
- 502 等への正規化で原因を不可視化しない（内部分類と整合させる）。

## Observability

- policy 判断は以下を観測できる:
  - policy_type
  - decision (allow/deny)
  - policy_id (if any)
  - operation_key

## Failure modes

- 複数箇所で判断され、結果が分岐する。
- rate/quota が authz と混ざり理由不明になる。
- gateway が意味論的判断を始める。
- 上流の正規化で policy 種別が消え、運用が壊れる。

## Related Specifications

- 00_constitution/policy_evaluation.md
- 00_constitution/authorization.md
- 00_constitution/global_defaults.md
- 20_operational_semantics/limits.md
- 20_operational_semantics/cost_abuse_resource_exhaustion_protection.md
