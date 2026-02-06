# Operation SLO Baseline (Classification-based)

## Goal

- 大規模化しても、運用上の SLO の「最低限の枠」がサービスごとに分裂しないようにする。
- operation の性質（classification）に基づく SLO の結び付けを、値なしで仕様化する。
- “後から必要になって場当たり的に入れて壊れる”状態を防ぐ。

## Scope

- operation classification（read/mutate/irreversible/external_effect）と SLO の結合
- SLO の例外導入（operation 単位の明示）
- 値そのもの（数値）は扱わない

## Invariants (Must Not Break)

### 1) SLO is classification-based (Value-free)

- SLO は operation の classification に基づいて適用される。
- SLO を HTTP path/method やサービス慣習で暗黙に推論してはならない。

### 2) Minimum SLO dimensions (Must)

- すべての operation は、少なくとも以下の運用次元で評価可能でなければならない:
  - availability
  - latency
  - error budget / error rate

> 数値目標（例: p95、%）は本仕様では固定しない（Tool Spec Repo / 環境で決める）。

### 3) Exceptions are explicit (Must)

- 特定 operation を例外的に厳格化/緩和する場合、operation 単位で明示しなければならない。
- “サービスAは厳しめ”のような暗黙差分を作ってはならない。

### 4) Classification governs observability (Must)

- SLO 評価に必要な観測は、classification と結合して整合する必要がある。
  - `external_effect` / `irreversible` は、失敗時の fault_domain / error_class の識別が必須。
  - `read` はキャッシュ等の影響を受けうるため、境界ごとの差分は boundary JSON で明示する（値ではなく方針）。

## Non-goals

- SLO の具体数値（目標値・予算・しきい値）の固定。
- 組織体制やオンコール運用プロセスの標準化。

## Failure modes

- サービスごとに SLO の意味が違い、運用判断が統一できない。
- path/method ベースの推論が混入し、catalog と実装が乖離する。
- 例外が暗黙化して incident 時に判断不能になる。

## Related Specifications

- 00_constitution/operation.md
- 00_constitution/observability.md
- 00_constitution/global_defaults.md
