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

### Catalog is authoritative for schema paths

- schema の参照パスは **catalog（rules/operation_catalog.json の schema.path 等）が唯一の正**である。
- 実装・lint が operation_key から schema パスを推測してはならない（探索禁止）。
- schema の配置は repo_layout の方針に従うが、最終的な正は catalog 参照である。

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

## Schema Format (Normative intent)

- format は JSON Schema を使用する（draft 等の固定は rules/L1 側で定義する）。
- schema が表現すべき最小要素（operation_key, request/response, versioning metadata 等）は rules/L1 の機械契約に従う。

## Machine-enforced contracts (Defined elsewhere)

- JSON Schema の draft、ファイル構造、必須フィールド、互換性判定ロジックは rules および L1（各ツール仕様定義）で定義する。
- 本ファイルは「catalogが正」「互換性の意味論」を正とする。

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
- schema path の推測や探索が入り、環境差分で壊れる。

## Related Specifications

- domain/30_interaction_edges/http.md
- domain/00_constitution/operation.md
- domain/00_constitution/repo_layout.md
- rules/operation_schema_contract.md
- rules/schema_compatibility.md
- rules/contract_version_rollout.md
- rules/error_shape_contract.md
