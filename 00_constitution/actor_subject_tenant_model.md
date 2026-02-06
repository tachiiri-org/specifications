# Actor, Subject, Tenant, and Initiator Model

## Goal

- 「誰が（executor/actor）」「誰を起点として（initiator）」「誰として（subject）」「どのテナントで」行動しているかを明確に定義する。
- service 拡張・internal call・async/job が増えても意味論が壊れないようにする。
- AuthZ 入力（PDP）に使う identity を安定化し、監査・追跡のための起点情報と混同しない。

## Scope

- identity claims（internal boundaries）
- actor / subject / tenant / initiator
- human actor / service actor / ops actor
- async job / event context の主体表現（高レベル）

## Definitions

### Tenant

- 論理的な所有境界。
- データ・操作・課金・可視性の上位スコープ。
- すべての tenant-scoped な操作は `tenant_id` を必須とする。

> 例外: global resource（`tenant_scoped=false`）は例外領域として別途扱う。
> 観測上の予約値として `tenant_id="__global__"` を用いてよい（ただし `tenant_scoped=false` の場合に限る）。
> 予約値の詳細と安全柵は `00_constitution/global_defaults.md` を正とする。

### Actor (Executor)

- 行為を「実行する主体」（executor）。
- AuthZ の入力として扱う唯一の主体。
- `actor_id` は常に存在し、`tenant_id` と組で解釈される（global resource の例外は上記注記）。
- actor は以下のいずれかの種別を持つ（語彙）:
  - human
  - service
  - ops

> 注: actor 種別の表現方法（claim 名などの具体）は L1（各ツール仕様定義）で固定する。
> 本ドメインは「種別が明示され、human/service/ops の混同が起きない」ことを不変条件とする。

### Subject (End-user Identity)

- end-user identity（人の主体）を表す。
- 原則として user identity を指し、human actor の場合にのみ存在する。
- `subject_id` は以下を満たす:
  - human actor の場合: 必須（subject はそのユーザー本人）
  - service / ops actor の場合: 存在してはならない（must-not）
- `subject_type` は存在する場合、必ず `"human"` とする（現時点の語彙は human のみ）。

> subject_type の拡張は breaking とみなし、versioned にのみ導入できる。
> 将来拡張は `00_constitution/subject_types.md` を起点に行う。

### Initiator (Origin / Triggering Actor)

- 処理を「起点として発火させた主体」（追跡・監査・因果関係のための語彙）。
- AuthZ の入力には使用しない（must-not）。
- async/job/event の世界で特に重要になる。
- 代表フィールド（語彙）:
  - `initiator_actor_id`
  - `initiator_actor_type`（human/service/ops）

## Invariants (Must Not Break)

### 1) Tenant Isolation

- すべての actor は単一の tenant に属する。
- tenant を跨ぐ操作は明示的に禁止される（特別な設計がない限り）。
- tenant の取得元は verified claims または確立済み session に限定される（Transport Rules を参照）。

> 例外（global resource）を導入する場合の安全柵は `00_constitution/global_defaults.md` を正とする。

### 2) AuthZ Input: Single Executor per Request

- 1 リクエスト（internal boundary の 1 call）に対して、AuthZ 入力として扱う actor（executor）は常に 1つである。
- `initiator_actor_id` 等の起点情報は並存してよいが、AuthZ 入力に使用してはならない。

### 3) Actor Type Must Be Unambiguous

- human / service / ops の混同を許さない。
- service actor を human actor と同一視する設計は禁止する。
- ops actor は通常の user actor と混同してはならない（特権操作・監査要件と結合する）。

### 4) Transport Rules (Trust Boundary)

#### Browser boundary (Browser ⇄ BFF)

- browser は identity を「主張」できない。BFF が session を検証し identity を確立する。
- browser 由来の `authorization` は reject される（`00_constitution/identity.md` を正とする）。
- BFF は確立した identity から internal 用の claims を生成し、以降は token claims としてのみ伝播する。

#### Internal boundaries (BFF ⇄ Gateway ⇄ Adapter)

- actor/subject/tenant 情報は **検証済み token claims のみ**から取得する。
- `x-actor-*` 等の header による actor 注入は拒否される。
- header/query/body による identity 相当情報の注入は許可しない。

### 5) Delegation & Impersonation (Not present by default)

- delegation/impersonation は **既存の意味論へ後付け混入してはならない**。
- “後付けで claims を増やして既存 AuthZ に混ぜる” のは禁止。
- 将来導入は `00_constitution/delegation_impersonation.md` を起点とし、domain + contract-version で行う。

### 6) Async / Job / Event Context Consistency

- async job / event は必ず `tenant_id` を持つ（global resource の例外は `00_constitution/global_defaults.md`）。
- async job / event における `actor_id` は **executor（service/ops actor）** を表す（AuthZ 入力の主体）。
- human 起点の追跡が必要な場合、`initiator_actor_id` を必須とする（ただし AuthZ 入力には使用禁止）。
- `subject_id` / `subject_type` は human actor の場合にのみ存在しうる（service/ops では must-not）。

> 目的: worker 実行（service actor）と、起点 human（initiator）を混同しない。
> 監査・相関は initiator を使い、実行権限の判断（PDP）は executor を使う。

## Non-goals

- RBAC / ABAC の具体モデル定義。
- 組織階層・グループ管理の標準化。
- token の具体プロファイル（issuer/audience/ttl 等）の固定（L1の境界仕様の責務）。

## Failure modes

- tenant 跨ぎ操作が静かに通る。
- service actor が user と同一視され、confused deputy が発生し認可が崩れる。
- header 注入により actor が偽装される。
- async/job/event で executor と initiator が混同され、監査・追跡・責任分界が崩れる。
- service/ops に subject_id が混入し、「誰として」が曖昧になり誤認可や監査欠落が起きる。

## Related Specifications

- 00_constitution/actor.md
- 00_constitution/identity.md
- 00_constitution/authorization.md
- 00_constitution/headers.md
- 00_constitution/policy_evaluation.md
- 00_constitution/global_defaults.md
- 00_constitution/policy_decision_trace.md
- 20_operational_semantics/async_jobs_events.md
- 20_operational_semantics/data_tenant_safety.md

- 00_constitution/authn_assurance.md
- 00_constitution/claims_compatibility.md
- 20_operational_semantics/org_model.md
- 00_constitution/delegation_impersonation.md
- 00_constitution/subject_types.md
- 00_constitution/identity_key_rotation.md
