# Policy Explanation & Decision Trace (Internal Observability)

## Goal

- 認可・各種ポリシの decision を、利用者へ露出せずに内部で再構築可能にする。
- “なぜ deny されたか” を incident/audit/trace から追える状態を仕様化する。
- 大規模化しても decision trace の最低要件がブレないよう固定する。

## Scope

- AuthZ decision trace（adapter PDP）
- policy evaluation（将来: quota/rate/business policy）への拡張余地
- 外部レスポンスと内部記録の分離

## Definitions

### Decision trace

- allow/deny の判断結果と、その参照規則（rule）・対象（operation）を結びつける内部記録。

### Explanation

- 利用者へ返す説明ではなく、内部運用のための根拠情報。

## Invariants (Must Not Break)

### 1) No detailed reasons in user response

- AuthZ failure は 403 を返す。
- 利用者へのレスポンスに rule_id / 条件 / 属性値 等の詳細を返さない（`constitution/authorization.md`）。

### 2) PDP ownership

- AuthZ の PDP は adapter。
- decision trace の一次生成者は adapter（推奨）。上流は補助情報を付与してよいが、判断を代替しない。

### 3) Minimal required fields (Normative)

decision trace は最低限以下を持つ（保存先は logs/audit/trace いずれでもよいが要件は満たすこと）:

- event_time
- request_id（または correlation_id / trace_id で相関可能）
- tenant_id
- actor_id
- actor_type (human|service|ops)
- subject_id（存在する場合のみ）
- subject_type（存在する場合のみ）
- operation_key
- decision (allow|deny)
- rule_id（または policy_ref）
- pdp = adapter

### 4) Redaction / secrecy

- decision trace に PII/secrets を含めない。
- 入力属性（claims/payload）を丸ごと残さない。
- 準識別子（idempotency-key 等）は hash/drop 方針を適用する（`constitution/observability.md`）。

### 5) Versioning

- decision trace の shape を拡張する場合、互換性を意識する。
- “外部へ explanation を出す”機能を導入する場合は operation 単位で明示し、互換性戦略を伴う。

## Non-goals

- 説明 UI / 管理画面の設計。
- policy DSL の標準化。

## Failure modes

- deny の理由が追えず、運用が属人化する。
- trace に機微情報が混入し、二次事故になる。
- 上流が独自に PDP し始め、判断が割れる。

## Related Specifications

- constitution/authorization.md
- constitution/policy_evaluation.md
- constitution/observability.md
- constitution/global_defaults.md
