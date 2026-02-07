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
- エラー意味（status/error_class等）の境界横断の保持（value-free）

## Reserved Vocabulary (Normative)

### Tenant sentinel for global resources

- `tenant_id="__global__"` は、**global resource（`tenant_scoped=false`）の観測上の予約値**としてのみ許容する。
- `tenant_scoped=true` の operation で `"__global__"` を使ってはならない。
- `"__global__"` を許容する operation は、L1仕様（operation metadata / catalog 等）で明示されなければならない。

## Defaults (Normative)

### 1) AuthZ failure response

- AuthZ failure は **403** を返す。
- “存在秘匿のための 404 偽装” は **global default にしない**。
  - 導入する場合は operation 単位で明示し、互換性戦略（contract-version 等）を伴う。

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
- classification は集合（set/array）として扱われ、複数分類を持ちうる（`constitution/operation.md`）。
- `mutate` / `irreversible` / `external_effect` を含む operation は:
  - idempotency を必須とする（運用意味論側の責務）
  - retry は explicit で無制限禁止（運用意味論側の責務）
- `irreversible` / `external_effect` は audit を必須とする（`constitution/observability.md`）。

### 5) Global resources baseline

- global resource は **例外**であり、暗黙に作らない。
- global resource は `tenant_scoped=false` を明示し、観測上の `tenant_id` は `"__global__"` を取りうる。
- global write は ops/service actor に限定し、human actor による global write を許可しない。
- global read は allowlist 制御（operation 単位で明示）。

### 6) Policy explanation & traces baseline

- 利用者へのレスポンスに AuthZ の詳細理由は返さない（403 の一般説明のみ）。
- 内部観測（logs/metrics/traces/audit）には decision trace を記録してよい（`constitution/policy_decision_trace.md`）。

### 7) Status meaning must not be reclassified across boundaries (Must)

- 上流コンポーネントは、下流が確定させた **エラー意味（status と種別）を別意味に再分類してはならない**。
  - 例: 下流の AuthZ deny（403）を上流が 404/502 に正規化しない。
  - 例: 下流の AuthN failure（401）を上流が 403 に正規化しない。
  - 例: rate/quota/budget の拒否（429 等）を上流が authz（403）へ正規化しない。
- 例外が必要な場合は、**operation 単位で明示**し、互換性戦略（contract-version 等）を伴う。
- “環境差分” として再分類を導入してはならない。

### 8) SLO & audit retention baseline (Value-free)

- SLO の最低限の枠は classification に基づく（値は固定しない）。
- audit retention / storage は明示されなければならない（値は固定しない）。

## Exception & Versioning Rules (Normative)

- defaults を破る例外は、以下いずれかで明示する:
  - operation 単位（L1仕様の catalog / metadata 等）
  - domain 単位（domainの明示ルール）
  - contract-version（boundary が受理する version の明示）
- defaults を破る例外を “環境差分” として導入してはならない。
- claims を AuthZ 入力に追加する変更は breaking とみなす（`constitution/authorization.md`）。

## Non-goals

- 具体の境界設定値（timeout/size/ttl 等）の固定（L1の責務）。
- 組織の権限設計（RBAC/ABAC）の詳細定義。

## Failure modes

- 例外が暗黙に増殖し、境界ごとに挙動が割れる。
- “404偽装” が default 化し、運用・監査が破綻する。
- global resource が暗黙に増え、human actor による越境操作が混入する。
- エラー正規化が上流都合で行われ、原因が不透明になる（運用が壊れる）。

## Related Specifications

- constitution/actor_subject_tenant_model.md
- constitution/authorization.md
- constitution/identity.md
- constitution/operation.md
- constitution/observability.md
- constitution/policy_decision_trace.md
- constitution/policy_types.md
- operational_semantics/data_tenant_safety.md
