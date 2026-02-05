# HTTP Contracts & RPC Boundary

## Goal

- HTTP を「輸送層」として使い、意味論は contract / operation に集約する。
- フロント増加・BFF増加・adapter増加に耐える API 境界を作る。
- エラー・メソッド・content-type・routing の判断を局所化する。

## Scope

- bff ⇄ gateway
- gateway ⇄ adapter
- http_methods / http_rpc_style / http_routing / http_content_types / http_errors / http_catalog
- contract_versioning / compatibility

## Design Principles

- HTTP verb は表現力よりも **安定性を優先**する。
- 意味論は path / body / rpc_method / operation に寄せる。
- API の可用性と安全性は「わかりやすさ」より優先される。
- 外部 REST の表現は adapter 内に閉じ、内部境界は operation として統一する。

## Invariants (Must Not Break)

### RPC over HTTP

- BFF → gateway は JSON-RPC over HTTP とする。
- gateway → adapter は operation-catalog over HTTP とする。
- ルーティングは **宣言された operation のみ**に限定する（未実装は 404）。

### Methods

- bff → gateway / gateway → adapter の operation 呼び出しは POST に統一する。
- browser-facing の GET は「ナビゲーション/表示」に限定し、内部境界には持ち込まない。
- state-changing は内部境界では operation の分類で判定する。

### Content-Type

- request / response は原則 `application/json` のみ。
- state-changing operation での JSON 不正・BOM・非 UTF-8 は reject する。
- `Accept` は基本的に無視してよい（content negotiation はしない）。
  - もし検査する場合は `application/json` のみ許可（拡張は breaking）。

### Routing

- BFF→gateway:
  - `rpc_endpoint` のみを入口とする（他の path は 404）。
- gateway→adapter:
  - `/{service}/{resource}/{property}/{operation}` は catalog に存在するもののみ許可する。

### Error Semantics

- adapter のエラー詳細を、BFF まで透過させない。
- gateway / BFF は「境界エラー」に正規化する（preserve list 以外は安全側）。
- 利用者に返す status は **契約として固定**し、内部の詳細は observability にのみ残す。
- error mapping の評価順序は rules/error_mapping.md に従い、boundary JSON で algorithm を明示する。

### Error Shape (Contract)

- 境界で返すエラーは必ず以下の shape を満たす（JSON）。
- `always_use_error_shape: true` は、この shape を必ず適用することを意味する。

{
"error": {
"code": "string",
"message": "string",
"request_id": "string"
}
}

- message は最小の一般説明に留める（内部原因は返さない）。
- 追加フィールドは原則禁止。必要なら contract-version を上げる。

### Compatibility & Versioning

- `x-contract-version` は境界で必須になりうる（境界仕様JSONを正とする）。
- boundary JSON は「必須 여부」だけでなく「受理する version 範囲」を明示できなければならない。
  - accepted:
    - explicit_list（例: ["1"]）
    - range（例: min/max）
- 互換性ルール（最低限）:
  - 追加: optional field の追加は後方互換
  - 変更/削除: breaking（バージョンを上げる）
  - enum 追加: 後方互換だが、unknown を安全に扱う
- バージョン移行は「両対応期間」を設け、段階的に切り替える。

### Contract Version Requirement (Must)

- BFF ⇄ Gateway: `x-contract-version` を必須とする。
- Gateway ⇄ Adapter: `x-contract-version` を必須とする。
- Browser ⇄ BFF: `x-contract-version` は必須としない。
- 未指定の場合の挙動:
  - reject
  - status: 400
  - error_code: "contract_version_required"

## Required JSON keys (Machine-checkable, Must)

- internal boundaries（bff_to_gateway, gateway_to_adapter）は:
  - `http.contract_version.mode`
  - `http.contract_version.accepted`
  - `http.errors.propagation.algorithm`
  - `http.errors.propagation.preserve_status_for`（403/429等を含むこと）
  - `headers.requirements.*`（x-contract-version が落ちないこと）
- catalog routing を行う境界は:
  - “implemented-only routing” の設定（catalog外は404）が存在すること

## Non-goals

- RESTful な表現（verb / resource / status を厳密に使い分けること）
- 人間が curl しやすい API
- 任意の content-type 対応
- 内部境界での GET キャッシュ最適化

## Failure modes

- REST 的拡張を始め、POST/GET/PUT が内部境界で混在して contract が崩れる。
- adapter の内部エラーをそのまま返し、API が不安定化する。
- routing が自由になり、未実装 operation が静かに通る。
- contract-version の管理が曖昧で、ロールアウト順序で壊れる。

## Change checklist

- 新しい operation を追加したか
  - catalog に登録したか
  - 未実装時の挙動（404）が守られているか
- 新しい error code / status を追加したか
  - preserve list / mapping / error shape に矛盾しないか
- contract-version を変更したか
  - accepted 範囲と両対応期間、ロールアウト順序は定義されているか
