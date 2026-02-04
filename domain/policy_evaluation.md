# Policy Evaluation & Enforcement

## Goal

- 「どこで判断し」「どこで拒否するか」を固定し、責務の混在を防ぐ。

## Scope

- authorization
- rate / quota / business policy（将来）

## Definitions

- **Policy Decision Point (PDP)**
  - 許可/拒否を意味論として判断する場所。

- **Policy Enforcement Point (PEP)**
  - 判断結果を強制する場所。

## Invariants (Must Not Break)

### PDP Location

- 認可の PDP は **adapter** に存在する。
- gateway / BFF は PDP にならない。

### PEP Location

- PEP は gateway / adapter に配置できる。
- PEP は判断を変更してはならない。

### Early Rejection

- 上流での早期拒否は許可されるが、
  - 意味論的な最終判断を代替してはならない。

## Non-goals

- 認可ルール言語の標準化。
- 外部 Policy Engine 連携。

## Failure modes

- 複数箇所で判断が行われ、結果が分岐する。
- gateway が意味論的判断を始める。

## Related Specifications

- domain/authorization.md
