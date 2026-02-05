# Rule: AuthZ Error Contract & Enforcement

## Goal

- 認可失敗（AuthZ failure）の利用者向け契約を固定し、境界実装差分で崩れないようにする。
- error mapping / normalization により AuthZ error が別ステータスへ変換される事故を防ぐ。
- 403 を維持したまま内部で切り分け可能にする（observability）。

## Rule (Must)

### Status contract

- AuthZ failure は必ず HTTP 403 を返す。
- 403 は preserve list に含まれていなければならない。

### Mapping prohibition

- AuthZ failure は error mapping によって 502 等へ正規化してはならない。
- upstream の 403 を「意味論的に AuthZ」と扱う場合、preserve されること。

### Error shape

- 境界で返す error は error shape（always_use_error_shape）に従う。
- message は最小限とし、詳細理由を含めない。

### Observability classification

- AuthZ failure 時、内部ログ/イベントに以下を残す:
  - error_class: authz
  - fault_domain: (front|bff|gateway|adapter|external) のいずれか
  - denied_operation（operation が分かる境界のみ）
  - actor_id / tenant_id（存在する場合）

## Applies to

- rules/error_mapping.md
- rules/error_observability_classification.md
- domain/00_constitution/authorization.md
- boundary\_\* .http.errors
- boundary\_\* .observability

## Failure modes

- 認可失敗が 502 に化けて原因不明になる。
- preserve list から 403 が漏れて、環境差で壊れる。
- 403 が返るが分類が無く、運用で切り分け不能になる。
