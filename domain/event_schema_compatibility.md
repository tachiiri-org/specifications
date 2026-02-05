# Rule: Event Schema Compatibility & Breaking Change Detection (Machine-enforceable)

## Goal

- event/job の schema 変更が breaking か compatible かを機械的に判定し、
  rollout（dual accept）と矛盾させない。
- “人のレビューで見落とす”互換性事故を CI で防ぐ。

## Applies

- schemas/events/\*.json
- rules/events_catalog.json
- rules/event_version_rollout.md

## Rule (Must)

### 0) Fixed schema standard

- JSON Schema draft は 1つに固定し、混在は禁止する（例: 2020-12）。
- schema ファイルは `$schema` を明示する。

### 1) Breaking change classification (Minimum)

以下は breaking change とする（同一 event_type で version を上げずに混入禁止）：

- required の追加
- field の削除
- field の型変更
- enum の削除
- additionalProperties の許容範囲縮小
- required_context の必須項目変更（tenant_id/correlation_id/event_id/actor_id など）

### 2) Backward-compatible changes (Minimum)

以下は後方互換として許可できる（条件付き）：

- optional field の追加
- enum の追加（unknown を安全に扱う前提がある場合）
  - unknown handling を schema metadata に明示すること

### 3) Catalog coherence

- events_catalog の item.version と schema の version は一致しなければならない。
- schema_path は存在しなければならない。

### 4) Change metadata (Required)

- schema ファイルは互換性判定の説明として以下を持つ：
  - `compatibility.change_type`: compatible | breaking
  - `compatibility.reason`: string（短い根拠）
  - `compatibility.effective_from`: release-id or YYYY-MM-DD

CI は change_type と diff 結果が矛盾する場合に失敗する（self-assertion を許さない）。

## Failure modes

- required 追加が紛れ、consumer が落ちる。
- dual accept 期間中に breaking が入って片系が破綻する。
- required_context が揺れて tenant/監査が崩れる。
