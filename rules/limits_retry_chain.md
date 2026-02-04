# Rule: Timeout/Retry Chain Safety

## Goal

- retry と timeout の組み合わせで上流が詰まる事故を防ぐ。
- 経路全体のタイムアウト連鎖を不変条件として固定する。

## Rule (Must)

### Topology reference (Must)

- 経路（path）は `rules/topology.json` の `graph.paths` を参照する。
- 「上流境界（upstream_layer）」は、同一 path 内で 1つ手前に位置する boundary を指す。

### 1) Retry budget must fit into upstream layer timeout

- retry が enabled な境界では、以下を満たすように timeout を設定する:

  (upstream_timeout_ms \* max_attempts) + backoff_total_ms < upstream_layer_timeout_ms

- `backoff_total_ms` は、その境界で発生しうる待ち時間の総和とする。
  - 例: backoff_ms が [0, 200] で max_attempts=2 の場合 backoff_total_ms = 200
  - 例: backoff_ms が [0, 100, 200] の場合 backoff_total_ms = 300

### 2) Client-facing boundary ordering

- client-facing 境界（browser→BFF）では:

  client_timeout_ms > upstream_timeout_ms

### 3) Downstream timeouts must be non-increasing along the same path

- 同一 path の下流 boundary ほど upstream_timeout_ms は短い（または等しい）こと。

## Notes

- 具体値は boundary JSON を正とする。
- この rule は「相対関係」を固定する。

## Failure modes

- retry で待ち時間が積み上がり、上流のワーカーが枯渇する
- client timeout が先に切れてリトライ嵐が起きる
- 上流は失敗（タイムアウト）したが、下流は成功し二重実行/整合性事故が起きる

## Change checklist

- retry を有効化/拡張したか
  - max_attempts / backoff / retry対象の拡張が rule 式を満たすか
- timeout を変更したか
  - topology の各 path で単調性（下流ほど短い/等しい）を満たすか
  - browser→BFF で client_timeout_ms > upstream_timeout_ms を満たすか
- path/boundary を追加・変更したか
  - `rules/topology.json` を更新したか
