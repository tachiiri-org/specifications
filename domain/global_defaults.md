# Global Defaults (Cross-domain Baseline)

## Goal

- 仕様全体に散らばる「標準方針（defaults）」を 1 箇所に固定し、暗黙知を排除する。
- 例外導入を operation / domain / contract-version 単位で明示できる状態にする。
- “大規模化でバラける”領域（authz/identity/retry/audit/global resources）を統一語彙にする。

## Scope

- AuthN/AuthZ の標準方針（外部レスポンス、内部観測）
- identity/claims の標準方針（trust boundary）
- retry/idempotency/audit の標準方針（operation classification 連動）
- global resource（tenant_scoped=false）を扱うときの標準方針
- 例外導入の方法（versioning / explicitness）

## Defaults (Normative)

### 1) AuthZ failure response

- AuthZ failure は **403** を返す。
- “存在秘匿のための 404 偽装” は **global default にしない**。
  - 導入する場合は operation 単位で明示し、contract-version を上げる。

### 2) AuthN vs AuthZ separation

- AuthN failure は 401。
- AuthZ failure は 403。
- gateway/BFF は最終判断（PDP）にならない（adapter PDP を維持）。

### 3) Identity source & trust boundary

- internal boundaries（BFF→Gateway→Adapter）で identity の source は **verified token claims のみ**。
- header/query/body による identity 相当情報の注入（`x-actor-*` 等）は拒否。
- browser は identity を主張できず、BFF が session を検証して identity を確立する。

### 4) Operation classification coupling

- operation の分類は暗黙推論しない（explicit）。
- `mutate` / `irreversible` / `external_effect` を含む operation は:
  - idempotency 必須（domain/idempotency.md）
  - retry は explicit で無制限禁止（domain/async_jobs_events.md / rules/async_event_contract.md）
- `irreversible` / `external_effect` は audit 必須（domain/observability.md, rules/audit_log_contract.md）。

### 5) Global resources baseline

- global resource は **例外**であり、暗黙に作らない（domain/data_tenant_safety.md）。
- global resource は `tenant_scoped=false` を明示し、観測上の `tenant_id` は `"__global__"` を取りうる。
- global write は ops/service actor に限定し、human actor による global write を許可しない。
- global read は allowlist 制御（operation 単位で明示）。

### 6) Policy explanation & traces baseline

- 利用者へのレスポンスに AuthZ の詳細理由は返さない（403 の一般説明のみ）。
- 内部観測（logs/metrics/traces/audit）には decision trace を記録してよい（domain/policy_decision_trace.md）。

## Exception & Versioning Rules (Normative)

- defaults を破る例外は、以下いずれかで明示する:
  - operation 単位（catalog / schema metadata）
  - domain 単位（domain/\*.md）
  - contract-version（boundary JSON accepted versions）
- defaults を破る例外を “環境差分” として導入してはならない。
- claims を AuthZ 入力に追加する変更は breaking とみなす（domain/authorization.md）。

## Non-goals

- 具体の boundary JSON 値（timeout/size/ttl 等）の固定（def/ を正とする）。
- 組織の権限設計（RBAC/ABAC）の詳細定義。

## Failure modes

- 例外が暗黙に増殖し、境界ごとに挙動が割れる。
- “404偽装” が default 化し、運用・監査が破綻する。
- global resource が暗黙に増え、human actor による越境操作が混入する。

## Related Specifications

- domain/actor_subject_tenant_model.md
- domain/authorization.md
- domain/identity.md
- domain/operation.md
- domain/idempotency.md
- domain/observability.md
- domain/data_tenant_safety.md
- domain/policy_decision_trace.md
