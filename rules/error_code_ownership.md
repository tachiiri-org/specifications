# Rule: Error Code Ownership

## Goal

- error_code の生成責務を境界ごとに固定し、
  意味論的な最終判断点（PDP）がずれる事故を防ぐ。

## Rule (Must)

### AuthZ forbidden

- error_code = "forbidden" を生成できるのは adapter のみ。
- gateway / BFF は forbidden を生成してはならない。
- upstream から伝播された forbidden は preserve されること。

### CSRF forbidden

- error_code = "csrf_forbidden" は BFF のみ生成してよい。
- gateway / adapter は csrf_forbidden を生成してはならない。

### Mapping interaction

- forbidden / csrf_forbidden は:
  - HTTP status = 403
  - preserve list に必ず含まれる
  - error mapping により別 status に変換されてはならない

## Applies to

- rules/forbidden_status_origin.md
- rules/error_mapping.md
- domain/authorization.md
- domain/security_browser_boundary.md
- boundary\_\* .http.errors

## Failure modes

- gateway が forbidden を生成して AuthZ を完結させる
- CSRF 失敗と AuthZ 失敗が混同される
- 403 が 502 に正規化され原因不明になる
