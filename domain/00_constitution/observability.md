# Observability Design

## Goal

- 障害時に「何が・どこで・誰に」起きたかを再構築できる。
- セキュリティ・プライバシーを損なわずに運用可能な可観測性を持つ。
- エラーを外へ透過しない設計でも、内部で切り分け可能にする。

## Scope

- logging
- metrics
- tracing
- sampling
- redaction
- error_classification
- audit events（不可逆操作の監査）

## Design Principles

- observability は **後付けできない前提**で設計する。
- すべてのリクエストに「追跡可能な最低限の情報」を残す。
- PII は原則ログに出さない（hash or drop）。
- 利用者の error status は契約として固定し、内部は分類フィールドで補う。

## Invariants (Must Not Break)

### Logs

- 構造化ログ（JSON）を前提とする。
- request-id / operation(or route) / status / latency は必須。
- component ごとに required field を固定する。
- エラー時は内部向けに以下を追加できる（外へは返さない）:
  - `error_class`（validation/authn/authz/timeout/upstream/network/bug/overload）
  - `fault_domain`（front/bff/gateway/adapter/external）
  - `upstream_status`（あれば）

### Metrics

- 成功/失敗を counter で必ず取る。
- latency は histogram で取得する。
- label は高カーディナリティを避ける。
- operation は “制御された集合” のみ label にする（catalog 由来）。

### Tracing

- traceparent は passthrough。
- サンプリングはデフォルト低め、エラーは 100%。

### Redaction

- authorization / cookie / set-cookie は drop。
- idempotency-key 等の準識別子は hash（ログに平文で出さない）。
- redaction ルールは component 間で一貫させる。

### Audit events (Must)

- `irreversible` / `external_effect` 相当（特に billing）の操作は audit event を生成する。
- audit event は通常ログとは別に扱える（別ストレージ・別保持期間）。
- audit event の必須フィールドは `rules/audit_log_contract.md` を正とする。

## Required JSON keys (Machine-checkable, Must)

- observability を持つ境界は boundary JSON に以下を持つ:
  - `observability.request_id`（requirement timing の明示を含む）
  - `observability.error_classification`（enabled/log_only/required_fields）
  - `observability.redaction`（drop/hash ルール）
- billing / external_effect を実行する adapter は:
  - audit event を有効化する設定（または audit sink 連携設定）を持つ

## Non-goals

- 全リクエストの完全トレース（コスト過多）。
- PII を含む詳細なユーザー行動ログ。

## Failure modes

- 情報が足りず、再現できない障害が増える。
- ログに PII が混入し、事故対応コストが跳ね上がる。
- metrics の label 爆発で監視基盤が破綻する。
- 502 正規化により原因が区別不能になる（分類フィールドが無い場合）。
- 不可逆操作の監査証跡が残らず、後から説明不能になる。

## Change checklist

- 新しいヘッダ / フィールドを追加したか
  - redaction 対象に含めたか
- 新しい error type を追加したか
  - `error_class` / イベント / カウンタに反映したか
- billing / external_effect を追加したか
  - audit event 契約に適合するか
