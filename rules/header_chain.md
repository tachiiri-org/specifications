# Rule: Header Allowlist Chain Consistency

## Goal

- allowlist の更新漏れ（ドリフト）でヘッダが silently drop / reject される事故を防ぐ。
- boundary 内の upstream->downstream のヘッダ許可が矛盾しないことを機械的に保証する。

## Rule (Must)

### 1) Boundary-local allowlist chain

- request 方向の同一 boundary 内で、以下を満たすこと：
  - upstream_outbound.allow ⊆ downstream_inbound.allow

対象（現行）:

- bff_to_gateway:
  - upstream_outbound.allow = headers.bff_outbound.allow
  - downstream_inbound.allow = headers.gateway_inbound.allow
- gateway_to_adapter:
  - upstream_outbound.allow = headers.gateway_outbound.allow
  - downstream_inbound.allow = headers.adapter_inbound.allow

### 2) Forbidden headers must not be allowed on internal boundaries

- internal boundaries（bff_to_gateway, gateway_to_adapter）では以下を許可してはならない：
  - request header: cookie
  - response header: set-cookie

## Notes

- このルールは「境界内の整合」を対象とする（path全体の派生検査は別途拡張可能）。
- 例外を作る場合は、boundary JSON の責務境界で表現し、lintを拡張する。

## Failure modes

- upstream は送ったつもりだが downstream が許可しておらずドリフトする。
- cookie / set-cookie が内部へ入り boundary が壊れる。
