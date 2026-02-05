# Billing / Payment Semantics

## Goal

- 課金・請求・返金などの external_effect を安全に扱う。
- 二重課金を防ぎ、監査可能な形で「誰が・いつ・何を・いくら」実行したかを再構築できる。
- 決済プロバイダ差分を adapter 内に閉じつつ、境界の意味論を固定する。

## Scope

- billing/invoice/_, billing/payment/_ 相当の operations
- external payment provider interaction（adapter 内）
- idempotency / replay / audit
- money representation / rounding
- PCI/PII constraints（ログ・保持）

## Invariants (Must Not Break)

### Idempotency (Billing-grade)

- external_effect を伴う billing operation は idempotency 必須。
- adapter は provider への呼び出しにも idempotency を適用する（provider がサポートする場合）。
- replay は stored response replay とし、結果を変えてはならない。

### Money representation

- 金額は **minor units（整数）** で表現する（例: JPY=1円, USD=1セント）。
- 小数（float）で金額を表現してはならない。
- 通貨コードは ISO 4217 形式の文字列（例: "JPY", "USD"）を使用する。

### State transitions (Minimum)

- billing の状態は adapter（または billing service）側で一貫して管理する。
- “成功” の定義（例: charge captured / invoice created）は operation ごとに catalog で明示する。
- “外部成功だが内部失敗” の復旧は adapter の責務であり、上流へ不安定な中間状態を露出させない。

### Auditability (Must)

- irreversible / external_effect の billing operations は audit event を必ず生成する。
- audit event は `rules/audit_log_contract.md` に従う。

### PCI / secrets

- カード番号・CVC 等の機微情報は:
  - ログに出さない
  - 永続化しない
  - adapter はトークン化済みの参照（payment_method_token 等）を扱う前提とする。

## Required JSON keys (Machine-checkable, Must)

- billing の external_effect operations は operation catalog で:
  - `classification` に `external_effect`（必要なら `irreversible` も）を含む
  - `idempotency.required: true`
  - `authz` が定義されている
- adapter 側（または gateway_to_adapter の設定）で:
  - idempotency replay/inflight 方針
  - audit event 有効化（または audit sink 設定）
  - PII redaction 設定
    が存在すること

## Non-goals

- 決済プロバイダの実装詳細の標準化（adapter 内に閉じる）。
- すべての国・通貨・税制の網羅。

## Failure modes

- idempotency が弱く二重課金する。
- 金額を float で扱い丸め誤差が監査不整合になる。
- 監査証跡が欠落し、後から説明不能になる。
- 機微情報がログ/永続化に混入し重大事故になる。

## Related Specifications

- domain/20_operational_semantics/idempotency.md
- domain/00_constitution/observability.md
- rules/payment_idempotency.md
- rules/audit_log_contract.md
- rules/pii_redaction_contract.md
