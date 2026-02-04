# Rule: Request ID Policy

## Goal

- 1リクエストを end-to-end で一意に追跡可能にする。
- 重複・偽装・欠落した request-id による観測不能状態を防ぐ。

## Rule (Must)

- `x-request-id` は **BFF で生成・上書きする**。
- browser 由来の `x-request-id` は信頼しない。
- gateway / adapter は inbound で `x-request-id` を必須とする。
- outbound では常に `x-request-id` を付与する。

## Requirement timing semantics (Must)

- browser → BFF 境界の request-id 要件は:
  - pre-processing では要求してはならない
  - post-processing での存在必須を意味する
- internal boundary（BFF→gateway, gateway→adapter）では:
  - pre-processing で request-id 必須とする

- requirement timing は
  `rules/request_id_requirement_semantics.md`
  に従って boundary JSON に明示されなければならない。

## Rationale

- request-id は「観測用 ID」であり、利用者入力を信頼すべきではない。
- BFF は最初の信頼境界であり、生成点として最適。
- timing を曖昧にすると、browser 境界で誤 reject が起きる。

## Applies to

- observability_request_id
- boundary\_\* .observability.request_id
- header allow/drop / requirements

## Failure modes

- browser 由来の request-id を信頼し、ログ偽装が可能になる。
- 一部のレイヤで request-id が欠落し、追跡不能になる。
- 境界ごとに「いつ必須か」の解釈が割れる。
