# HTTP Contracts & RPC Boundary

## Goal

- HTTP を「輸送層」として使い、意味論は contract / operation に集約する。
- フロント増加・BFF増加・adapter増加に耐える API 境界を作る。
- エラー・content-type・routing・version の判断を境界に局所化する。

## Scope

- bff ⇄ gateway
- gateway ⇄ adapter
- http_methods / http_rpc_style / http_routing / http_content_types / http_errors / http_catalog
- contract_versioning / compatibility（transport-level）

## Design Principles

- HTTP verb は表現力よりも **安定性を優先**する。
- 意味論は path/method ではなく operation と schema（catalog）に寄せる。
- 外部 REST の表現は adapter 内に閉じ、内部境界は operation として統一する。

## Invariants (Must Not Break)

### RPC over HTTP

- BFF → gateway は JSON-RPC over HTTP とする。
- gateway → adapter は operation-catalog over HTTP とする。
- ルーティングは **宣言された operation のみ**に限定する（未実装は 404）。

### Methods

- bff → gateway / gateway → adapter の operation 呼び出しは POST に統一する。
- browser-facing の GET は「ナビゲーション/表示」に限定し、内部境界には持ち込まない。
- state-changing は operation の classification により判定される（domain/00_constitution/operation.md）。

### Content-Type

- request / response は原則 `application/json` のみ。
- state-changing operation での JSON 不正・BOM・非 UTF-8 は reject する。
- content negotiation は行わない（`Accept` は無視してよい）。

### Routing

- BFF→gateway:
  - `rpc_endpoint` のみを入口とする（他の path は 404）。
- gateway→adapter:
  - routing は operation catalog を唯一の正とし、catalog 外は 404（implemented-only routing）。

> 注: operation schema の参照パスは catalog が唯一の正であり推測してはならない（domain/20_operational_semantics/payload_schema.md, rules/operation_schema_contract.md）。

### Error Semantics

- adapter の内部エラー詳細を、BFF まで透過させない。
- gateway / BFF は「境界エラー」に正規化する（preserve list 以外は安全側）。
- error mapping の評価順序と shape は rules を正とする：
  - rules/error_mapping.md
  - rules/error_shape_contract.md

> 注: 本 domain は “HTTP境界でどう扱うか” を固定し、error shape の一次情報は rules に置く。

### Compatibility & Versioning (Transport)

- internal boundaries（BFF ⇄ Gateway / Gateway ⇄ Adapter）は `x-contract-version` を扱う。
- boundary JSON は「必須 여부」だけでなく「受理する version 範囲」を明示できなければならない。
- payload/schema の互換性（breaking/compatible）は rules と 20 を正とする（本 domain では再定義しない）:
  - domain/20_operational_semantics/schema_compatibility.md
  - rules/contract_version_rollout.md

### Contract Version Requirement (Must)

- BFF ⇄ Gateway: `x-contract-version` を必須とする。
- Gateway ⇄ Adapter: `x-contract-version` を必須とする。
- Browser ⇄ BFF: `x-contract-version` は必須としない。
- 未指定の場合の挙動（例）:
  - reject
  - status: 400
  - error_code: "contract_version_required"
  - error shape は rules/error_shape_contract.md に従う

## Required JSON keys (Machine-checkable, Must)

- internal boundaries（bff_to_gateway, gateway_to_adapter）は:
  - `http.contract_version.mode`
  - `http.contract_version.accepted`
  - `http.errors.propagation.algorithm`
  - `http.errors.propagation.preserve_status_for`（403/429等を含むこと）
  - `headers.requirements.*`（x-contract-version が落ちないこと）
- catalog routing を行う境界は:
  - implemented-only routing（catalog外は404）が存在すること

## Non-goals

- RESTful な表現（verb / resource / status を厳密に使い分けること）
- 人間が curl しやすい API
- 任意の content-type 対応
- 内部境界での GET キャッシュ最適化

## Failure modes

- POST/GET/PUT が内部境界で混在して contract が崩れる。
- adapter の内部エラーをそのまま返し、API が不安定化する。
- routing が自由になり、未実装 operation が静かに通る。
- contract-version の管理が曖昧で、ロールアウト順序で壊れる。

## Change checklist

- 新しい operation を追加したか
  - catalog に登録したか
  - 未実装時の挙動（404）が守られているか
- 新しい error code / status を追加したか
  - error mapping / preserve list / error shape に矛盾しないか
- contract-version を変更したか
  - accepted 範囲と両対応期間、ロールアウト順序は rules/contract_version_rollout.md と整合するか

## Related Specifications

- domain/00_constitution/operation.md
- domain/20_operational_semantics/payload_schema.md
- domain/20_operational_semantics/schema_compatibility.md
- rules/operation_schema_contract.md
- rules/schema_compatibility.md
- rules/contract_version_rollout.md
- rules/error_shape_contract.md
- rules/error_mapping.md
