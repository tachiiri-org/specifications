# Rule: AuthZ Operation Contract & PDP Ownership (Machine-enforceable)

## Goal

- 認可（AuthZ）を operation 単位の意味論として固定し、境界ごとの差分・事故を防ぐ。
- AuthZ failure の利用者向け契約（403）を維持し、error mapping で 502 等へ化ける事故を防ぐ。
- PDP（最終判断点）を adapter に固定し、gateway/BFF が判断を完結させる事故を防ぐ。

## Applies

- boundary_gateway_to_adapter.authz
- domain/authorization.md
- domain/policy_evaluation.md
- rules/authz_error_semantics.md
- rules/operation_catalog.json

## Rule (Must)

### 1) Operation-based

- authz.mode は `operation_based` とする。
- 認可判断に使う operation は `route.operation` から得る（method/path で完結させない）。

### 2) PDP ownership

- authz.pdp は `adapter` のみ許可する。
- 上流（browser→bff, bff→gateway）は authz.pdp を持ってはならない。

### 3) Identity source

- 認可判断に用いる identity は検証済み token claims のみ（verified_token_claims_only）。

### 4) Deny contract

- authz deny は必ず:
  - status: 403
  - error_code: "forbidden"
- deny は error mapping で別 status に変換されない（preserve されること）。

### 5) Observability classification

- authz deny 時、内部観測として最低限:
  - error_class: authz
  - operation (service/resource/property/operation のうち取得できるもの)
  - actor_id / tenant_id（存在する場合）
    を残す設定を持つ（レスポンスには含めない）。

## Failure modes

- gateway が認可判断を完結し、adapter の意味論とズレる。
- 403 が preserve されず 502 に化けて原因不明になる。
- operation ではなく path/method で認可が始まり、経路差で挙動が割れる。
