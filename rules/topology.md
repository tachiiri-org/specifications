# Rule: Boundary Topology (Request Path Graph)

## Goal

- boundary 間の「経路（path）」を機械が参照できる形で固定する。
- timeout/retry chain や、必須ヘッダ伝播、idempotency end-to-end などの cross-boundary ルール検査の前提を統一する。
- 「どの境界がどの順序で呼ばれるか」を仕様として安定化し、実装や運用の暗黙知に依存しない。

## Rule (Must)

- すべての cross-boundary ルール検査は `rules/topology.json` を唯一のトポロジ参照元とする。
- `rules/topology.json` には以下を含める:
  - ノード定義（browser/bff/gateway/adapter など）
  - 境界（boundaries）の定義（boundary名、from_node/to_node、spec_file）
  - 経路（paths）の定義（boundary名の列）

- `paths` の各経路は「上流→下流」の順序で列挙する。
- `paths` に存在する境界列のみを「有効な呼び出し経路」として扱い、未定義な経路はルール検査で拒否できる。

## Clarification: "front" node handling

- このトポロジは「boundary JSON で規定される contract 境界」を対象とする。
- 静的配信やページ描画など、boundary JSON の対象外の hop はこの graph に含めない。
- もし front を contract 境界として扱う場合は、front 専用の boundary JSON を追加し、
  `rules/topology.json` の nodes/boundaries/paths を更新する。

## Applies to (examples)

- Timeout/Retry Chain Safety（上流・下流の関係を確定するため）
- Idempotency End-to-End（end-to-end 透過の検査対象経路を確定するため）
- Header Trust Boundary（header allow/drop の一貫性を経路で検査するため）
- Contract Versioning（経路ごとの要求を検査するため）

## Non-goals

- 実行時の動的ルーティングの表現（それは catalog/実装の責務）。
- すべての micro-path（例: front→static asset）までの網羅。

## Failure modes

- 経路が暗黙知になり、timeout/retry の連鎖検査ができず事故る。
- 境界が増えたときに「どのルールがどの経路に適用されるか」が曖昧になる。
- lint が参照するトポロジが複数存在してドリフトする。

## Change checklist

- 新しい boundary JSON を追加したか
  - `rules/topology.json` の nodes / boundaries / paths を更新したか
- 既存 boundary の順序が変わったか（BFF追加や gateway split 等）
  - 影響する cross-boundary ルール（timeout/retry, idempotency, header, contract）を再検査したか
