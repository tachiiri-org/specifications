# Rule: Schema Compatibility & Breaking Change Detection (Machine-enforceable)

## Goal

- schema 変更が後方互換か breaking かを機械的に判定し、contract-version 戦略と矛盾させない。
- “人のレビューで見落とす”互換性事故を CI で防ぐ。

## Applies

- schemas/operations/\*\*.json
- boundary\_\* .http.contract_version
- rules/contract_version_rollout.md

## Rule (Must)

### 0) Fixed schema standard

- JSON Schema draft は 1つに固定する（例: 2020-12）。
- schema ファイルはその draft を明示する（`$schema`）。

### 1) Breaking change classification

以下は breaking change として扱い、CI は失敗しなければならない（同一 contract-version 内の場合）:

- request:
  - required の追加
  - field の削除
  - field の型変更
  - enum の削除
  - additionalProperties の許容範囲縮小（allow→deny 等）
- response:
  - required の追加
  - field の削除
  - field の型変更
  - enum の削除
  - top-level shape の変更

### 2) Backward-compatible changes

以下は後方互換として許可できる（ただし条件付き）:

- optional field の追加（request/response）
- enum の追加（request/response）
  - ただし “unknown を安全に扱う” が前提であり、operation がそれを満たす旨を schema metadata に明示すること

### 3) Contract-version coherence

- internal boundaries（bff_to_gateway, gateway_to_adapter）の `http.contract_version.accepted.items` に複数バージョンが存在する（両対応期間）場合:
  - schema の変更は “後方互換のみ” でなければならない。
- breaking change を含む schema が導入される場合:
  - accepted.items は単一にし、breaking_change=true の運用ルールと整合すること（`rules/contract_version_rollout.md`）。

### 4) Change metadata (Required)

- schema ファイルは互換性判定の説明として以下を持つ:
  - `compatibility.change_type`: `compatible | breaking`
  - `compatibility.reason`: string（短い根拠）
  - `compatibility.effective_from`: release-id or YYYY-MM-DD

CI は change_type と diff 結果が矛盾する場合に失敗する（self-assertion を許さない）。

## Failure modes

- optional のつもりで required を増やし、段階ロールアウト中に壊れる。
- enum 追加で古いクライアントが落ちる（unknown handling 未定義）。
- accepted/version と schema の変更が噛み合わず、順序依存で障害が出る。
