# Constitution Scope (What belongs here / What does not)

## Goal

このリポジトリ（以下「Constitution」）は、複数のSaaS/ツールを大規模に運用するための
**共通の“憲法（L0）”** を定義する。

Constitution が固定するのは、各ツール間で揺れてはいけない以下の性質である。

- 語彙（Vocabulary）
- 責務境界（Responsibility Boundaries）
- 不変条件（Invariants / Must Not Break）
- 禁止事項（Prohibitions）
- 互換性・移行の原則（Compatibility Principles）

Constitution は **システムがどう設計・運用されても破ってはならない原理** を定義する。
具体の運用判断や人間の介入手順は、Constitution の外で扱う。

Constitution は **具体の値（timeouts, retry回数, retention日数等）** や
**ツール固有の定義（operation catalog / topology / connectors 等）**
および **運用の状態遷移（release / incident 等）** を持たない。

## Non-goal

Constitution は次を目的としない。

- 各ツールの具体設計（gateway/adapter の分割や採用技術の固定）
- 具体の運用値（SLOの数値、timeout値、rate limit値、retention日数など）の統一
- operation / event / connector の具体カタログを提供すること
- JSON / schema / lint 実装を提供すること
- **人間運用の手順・判断・状態遷移（release / incident / emergency）の定義**

※ 人間運用に関わる状態遷移は
`service_ops_governance/` に分離して定義される。

## Definition: Tool Specification Repository

Constitution を参照して実際に運用・実装可能な仕様を定義するリポジトリを「Tool Spec Repo」と呼ぶ。

Tool Spec Repo が持つべきもの（例）:

- tool の topology（nodes/boundaries/paths の具体）
- operation catalog（gateway facade / adapter operations を含む）
- events catalog（event types / versions）
- boundary definitions（browser_to_bff 等の具体設定）
- schemas（operations/events の schema）
- connectors（外部SPの定義と制約）
- persistence / retention / audit storage policy（具体）
- lint（JSON検証、cross-file検査、CI）

Constitution は、Tool Spec Repo が **何を定義すべきか** の“要求”を語彙として与えるが、
Tool Spec Repo の具体値を与えない。

## What belongs in Constitution (MUST)

Constitution に含めるのは、以下の性質を持つものに限る。

### 1) Vocabulary (Normative)

- tenant / actor / subject
- service actor vs human actor
- operation classification（read/mutate/irreversible/external_effect）
- idempotency / request_id / correlation_id / event_id
- error shape / error_class / fault_domain
- audit event（不可逆/外部副作用の監査語彙）
- data categories（PII/Billing/Logs/Audit）

### 2) Responsibility boundaries (Normative)

- 認証の確立点（例: browser境界でのcookie、内部境界でのbearer）
- 認可の最終判断点（PDP）と enforcement の場所（PEP）
- idempotency の owner
- cookie emitter の単一性
- “token claims only” の原則（header注入禁止）

### 3) Invariants / Prohibitions (Normative)

- tenant isolation（tenant跨ぎ禁止の原則）
- single actor per request（混在禁止）
- identity headers injection の禁止（x-actor-\* 等）
- error shape の追加フィールド禁止
- PII/secret のログ禁止（drop/hash 語彙）
- audit event の必須性（external_effect/irreversible）

### 4) Compatibility principles (Normative)

- breaking / compatible の定義（何が破壊的変更か）
- contract-version / schema-version の考え方
- dual accept window の原則（breaking時は単一バージョン等）
- schema compatibility の原則（required追加、型変更、削除等）

## What does NOT belong in Constitution (MUST NOT)

Constitution に含めてはならないもの（値・具体集合・環境依存・実装）を明示する。

### 1) Concrete values (Environment / Tool dependent)

- timeout_ms / retry.max_attempts / backoff_ms
- rate limit capacity/refill
- retention_days / TTL / audit保持日数の具体
- SLOの数値目標（p95目標値など）
- webhook timestamp window の秒数
- CORS allowed origin の具体リスト

### 2) Concrete catalogs (Tool specific sets)

- operation catalog（keyの全集合）
- events catalog（event_typeの全集合）
- connectors catalog（利用する外部SPの全集合）
- tool topology（paths/boundariesの具体）

※Constitution は catalog の“必要性”や“満たすべき条件”を語るが、集合そのものは持たない。

### 3) Runtime boundary definitions / Deployment configs

- def/\*（boundary JSON、persistence宣言、audit storage policy 等）
- secrets の参照方法や env var の具体（issuer/audience/jwks などの値）
- feature flags や rollout 手順の具体

### 4) JSON / Schema / Lint implementation

- lint/\*\*（lint実装、CI検査コード）
- lint/schema/\*\*（lint用schema）
- schemas/\*\*（operation/event schema の具体ファイル）
- JSONの配布物（npm package）

Constitution は MD（人間が読む一次情報）として保持することを原則とし、
機械検査は Tool Spec Repo 側で行う。

## Overlap rule: When a concept appears in both places

同一概念が Constitution と Tool Spec Repo の両方に現れる場合、以下に従う。

- Constitution:
  - 語彙、責務境界、不変条件、禁止、互換性原則（値なし）
- Tool Spec Repo:
  - 具体値、具体集合、環境依存、実装詳細

Constitution に具体値を入れ始めた場合、それは原則として誤りである。
（例外が必要なら “別テンプレ/別リポジトリ” として扱う。）

## Minimum checklist for Tool Spec Repo (Recommended)

Tool Spec Repo は少なくとも以下を持つことを推奨する。

- topology: nodes/boundaries/paths
- operation catalog: classification/authz/idempotency/audit/data classification
- boundary definitions: headers/http/errors/observability/csrf/idempotency/retry/limits
- schemas: operation schemas / event schemas
- async: event/job semantics + retry/dedupe + dead-letter
- persistence: tenant scoping / retention / deletion / restore safety
- lint: schema validation + cross-file invariants
- CI: lint実行と配布（npmなど）

## Change policy (Constitution)

Constitution の変更は強い影響を持つため、以下を原則とする。

- 語彙の追加は“破壊的”になりうる（入力が増え、解釈差が生まれるため）
- 不変条件の緩和は事故リスクを増やす（理由と代替策が必要）
- 禁止事項の解除は特に慎重に扱う（監査・セキュリティに直結する）
- 値を入れない（値が必要なら Tool Spec Repo 側へ）
