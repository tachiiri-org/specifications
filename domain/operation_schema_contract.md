# Rule: Operation Schema Presence & Binding (Machine-enforceable)

## Goal

- operation catalog と request/response schema を 1:1 に結合し、未定義・参照ズレを CI で検知する。
- schema を「実装の参考」ではなく「契約の一次情報」として扱う。

## Applies

- rules/operation_catalog.json
- schemas/operations/\*\*.json

## Rule (Must)

### 1) Presence

- operation catalog の `catalog.items[].key` ごとに、対応する schema ファイルが存在しなければならない:
  - `schemas/operations/{key}.json`
- 例外を作る場合は、catalog item に `schema.required=false` を明示する（デフォルト true）。

### 2) Key match

- schema ファイル内の `operation_key` は、ファイルパスの key と一致しなければならない。

### 3) Minimal shape

- schema ファイルは少なくとも以下を持つ:
  - `operation_key`
  - `request`（JSON Schema）
  - `response`（JSON Schema）
- `request` / `response` の root type は object を基本とする（primitive を返す場合は例外として明示）。

### 4) Error is excluded

- `request/response` schema は error payload を含めてはならない。
- error は `rules/error_shape_contract.md` のみで定義される。

### 5) Schema draft is fixed

- JSON Schema の draft はリポジトリで固定し、混在は禁止する（具体値は `rules/schema_compatibility.md` が正）。

## Failure modes

- operation は追加されたが schema が無く、クライアント契約が暗黙知になる。
- key の参照がズレ、別 operation の schema を誤って適用する。

## Notes (Informative)

- schema.required=false の operation は “internal-only / experimental” などの扱いを想定するが、
  その場合でも error/limits/authz 等の契約は通常通り適用される。
