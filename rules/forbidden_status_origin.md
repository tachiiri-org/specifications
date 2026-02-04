# Rule: 403(forbidden) Origin & Error Code Partitioning

## Goal

- 403 を「AuthZ failure」と「その他の 403（CSRF等）」で混同させない。
- 上流（BFF/gateway）が AuthZ の最終判断点（PDP）になってしまう事故を防ぐ。
- error mapping で 403 が 502 などへ変換される事故も防ぐ（preserve の前提維持）。

## Rule (Must)

### 1) AuthZ forbidden is adapter-only (PDP)

- AuthZ failure の利用者向け契約は:
  - status: 403
  - error_code: "forbidden"
- error_code="forbidden" を **生成してよいのは adapter(PDP) のみ**。
- BFF / gateway は "forbidden" を生成してはならない（伝播は可）。

### 2) CSRF forbidden must be distinct

- CSRF failure の利用者向け契約は:
  - status: 403
  - error_code: "csrf_forbidden"
- CSRF の 403 は AuthZ forbidden と区別されなければならない。

### 3) Preserve 403

- 403 は preserve list に含まれていなければならない。
- error mapping により 403 を別ステータスへ変換してはならない。

## Failure modes

- CSRF 失敗を AuthZ failure と誤認し、運用判断が崩れる。
- gateway/BFF が 403(forbidden) を生成して AuthZ を完結させてしまう。
- 403 が 502 に化け、原因不明な 502 が増える。
