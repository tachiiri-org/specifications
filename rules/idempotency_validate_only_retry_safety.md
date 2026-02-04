# Rule: Idempotency Validate-only Retry Safety

## Goal

- validate-only 境界で retry を許可する場合に、危険な拡張で事故が起きないように制約する。

## Rule (Must)

- idempotency.mode = validate_only で retry を enabled にする場合、以下を必須とする：
  - retry.retry_on_status は [502, 503, 504] のみ（追加禁止）
  - retry.retry_on_network_error = true
  - retry_gate.require_idempotency_key_when_state_changing = true
  - retry.apply_to_methods は state-changing を含む場合、POST に限定する（拡張禁止）

## Applies to

- boundary_bff_to_gateway.http.idempotency
- boundary_bff_to_gateway.http.retry

## Failure modes

- retry 対象が広がり、下流の副作用が重複実行される。
- key なし retry が混入し、二重実行事故になる。
