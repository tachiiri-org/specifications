# Payload Schema Contract (Request/Response) & Compatibility

## Goal

- operation の意味論（catalog）に加えて、request/response payload を契約として固定する。
- 大規模化で起きる「フィールド追加/削除/型変更/enum拡張」による互換性事故を防ぐ。
- スキーマが仕様リポジトリの一次情報となり、実装差分・ドリフトを CI で検知できる状態にする。

## Scope

- operation catalog に存在する operation の request/response schema
- 互換性（backward compatible / breaking）
- error shape 以外の business payload
- pagination / filtering / sorting の共通語彙（必要な operation のみ）

## Design Principles

- schema は「利用者が依存してよい契約」を表現し、内部実装を露出しない。
- schema は operation 単位であり、transport（path/method）に依存しない。
- 互換性判断は機械的（rules）で行い、人の解釈に依存しない。
- schema は “共有共通化” より “契約境界の安定” を優先する（ただし再利用のための $ref は許可）。

## Invariants (Must Not Break)

### Schema per operation

- operation catalog の各 item（key）には request/response の schema が 1つずつ対応する。
- schema が未定義の operation は「公開契約が未確定」とみなし、原則として production へ出してはならない（例外は明示）。

### Contract version coupling

- schema の breaking change は必ず contract-version の変更として表現される。
- 同一 contract-version 内での以下は breaking とする:
  - required field の追加
  - field の削除
  - field の型変更
  - enum の削除・意味変更
  - meaning の変更（同じ形でも意味が変わる）

### Backward-compatible rules (Minimum)

- 後方互換として許されるのは原則として以下のみ:
  - optional field の追加
  - enum の追加（unknown を安全に扱う前提がある場合のみ）
- optional→required は breaking。

### Strictness and unknown fields

- request:
  - unknown field の扱いは operation ごとに明示される（deny 推奨）。
- response:
  - response の unknown top-level field の追加は原則禁止（将来の拡張余地は明示的に確保する）。

### Error payload independence

- error shape は `rules/error_shape_contract.md` に従い、operation schema の対象外とする。
- business response schema と error schema を混在させない。

## Schema Location & Format (Normative)

- schema は `schemas/operations/{operation_key}.json` に配置する。
  - 例: `schemas/operations/billing/invoice/core/create.json`
- format は JSON Schema（draft はリポジトリで固定）を使用する。
- 各 schema ファイルは少なくとも以下を含む:
  - `operation_key`
  - `request` schema
  - `response` schema
  - `compatibility` metadata（optional/breaking の判定根拠を機械検査で参照できる形）

## Pagination / Filtering / Sorting (Recommended standard)

- pagination を持つ read operation は、原則として以下のいずれかを採用し、schema に明示する:
  - cursor-based: `cursor` / `next_cursor`
  - page-based: `page` / `page_size`
- filtering は allowlist のみ（field 名は schema で明示）。
- sorting は allowlist のみ（field 名と order は enum）。

## Failure modes

- payload が暗黙知になり、クライアントが実装に依存して壊れる。
- “後方互換のつもり”の変更が required 化などで実質 breaking になる。
- operation は同じでも経路・クライアントごとに shape が割れて運用不能になる。

## Related Specifications

- domain/http.md
- domain/operation.md
- rules/operation_schema_contract.md
- rules/schema_compatibility.md
- rules/contract_version_rollout.md
- rules/error_shape_contract.md
