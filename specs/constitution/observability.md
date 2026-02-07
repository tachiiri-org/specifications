# Observability Design

## Goal

- 障害時に「何が・どこで・誰に」起きたかを再構築できる。
- セキュリティ・プライバシーを損なわずに運用可能な可観測性を持つ。
- エラーを外へ透過しない設計でも、内部で切り分け可能にする。

## Scope

- logging / metrics / tracing
- sampling / redaction
- error classification（内部用）
- audit events（不可逆/外部副作用の監査）
- audit retention / storage baseline（値なし）
- metrics における高カーディナリティ禁止（ID類の扱い）

## Design Principles

- observability は **後付けできない前提**で設計する。
- すべてのリクエストに「追跡可能な最低限の情報」を残す。
- PII は原則ログに出さない（hash or drop）。
- 利用者の error status は契約として固定し、内部は分類フィールドで補う。
- audit は通常ログと混同しない（保持・ストレージの扱いを分離できる）。

## Invariants (Must Not Break)

### Logs

- 構造化ログ（JSON）を前提とする。
- request-id / operation(or route) / status / latency は必須。
- component ごとに required field を固定する（具体フィールド集合はL1で定義してよい）。
- エラー時は内部向けに以下を追加できる（外へは返さない）:
  - `error_class`（validation/authn/authz/timeout/upstream/network/bug/overload）
  - `fault_domain`（front/bff/gateway/adapter/external）
  - `upstream_status`（あれば）

### Metrics

- 成功/失敗を counter で必ず取る。
- latency は histogram で取得する。
- label は高カーディナリティを避ける。
- operation は “制御された集合” のみ label にする（L1のcatalog由来）。

#### Metrics label cardinality guard (Must)

- 以下は metrics の label に使用してはならない（must-not）:
  - `request_id` / `correlation_id` / `trace_id`
  - `actor_id` / `subject_id` / email 等の識別子
  - idempotency-key 等の準識別子
- これらは logs / traces（必要なら hash/drop 方針の上）で相関する。

### Tracing

- traceparent は passthrough。
- サンプリングはデフォルト低め、エラーは 100%（方針。具体率は値なのでL1で定義）。

### Redaction

- authorization / cookie / set-cookie は drop。
- idempotency-key 等の準識別子は hash（ログに平文で出さない）。
- redaction ルールは component 間で一貫させる。

### Audit events (Must)

- `irreversible` / `external_effect` 相当の操作は audit event を生成する。
- audit event は通常ログとは別に扱える（別ストレージ・別保持期間）。
- audit event の必須フィールド集合は L1で固定し、全ツールで満たすこと。

### Audit retention & storage baseline (Must)

- audit は通常ログと同一保持にしない。
- audit の保持方針は明示されなければならない（具体値は本仕様では固定しない）。
- audit の保存先は、最低限として append-only 相当の性質を前提にできること。

## Non-goals

- 全リクエストの完全トレース（コスト過多）。
- PII を含む詳細なユーザー行動ログ。
- audit retention の具体日数やストレージ製品の固定。
- 観測設定のJSONキーやlint契約（L1の責務）。

## Failure modes

- 情報が足りず、再現できない障害が増える。
- ログに PII が混入し、事故対応コストが跳ね上がる。
- metrics の label 爆発で監視基盤が破綻する。
- 502 正規化により原因が区別不能になる（分類フィールドが無い場合）。
- 不可逆操作の監査証跡が残らず、後から説明不能になる。

## Related Specifications

- constitution/operation.md
- constitution/global_defaults.md
- constitution/policy_decision_trace.md
- operational_semantics/operation_slo_baseline.md
- operational_semantics/audit_retention_storage_policy.md
