# Repository Layout & Responsibility Boundaries

## Goal

- 仕様リポジトリが大規模化しても「置き場の解釈」がブレないようにする。
- ファイル配置の矛盾（境界責務の混在・重複定義・参照経路のカオス）を防ぐ。
- “どこに何を置くべきか” を将来機械検査（lint）に落とし込める最小の規約を固定する。
- 仕様検討（TODO）を安全に置ける staging 領域を明示し、未定義仕様が本仕様へ混入する事故を防ぐ。

## Scope

- specifications/ 配下のディレクトリ構造
- MD/JSON/PUML の置き場と責務
- staging（Deferred-but-Scoped）領域の契約

## Canonical Layout (Normative)

This repository is organized at top-level as:

- `00_constitution/`
- `10_staging_frames/`
- `20_operational_semantics/`
- `30_interaction_edges/`
- `def/`
- `schemas/`
- `lint/`

## Definitions

- **Constitution (00_constitution/)**
  - 仕様全体で揺れてはいけない語彙・責務境界・禁止・互換性原則（値なし）。

- **Operational Semantics (20_operational_semantics/)**
  - 運用上の意味論（idempotency, deletion, persistence, tenancy safety 等）。

- **Interaction Edges (30_interaction_edges/)**
  - 境界（browser/session/http/webhook 等）と相互作用の意味論。

- **Staging Frames (10_staging_frames/)**
  - next_todos / Deferred-but-Scoped（検討中）を “枠（frame）” として置く場所。
  - ここに置かれる文書は **non-normative**。
  - ただし「導入時に何を壊してはいけないか」「どう昇格するか」の制約は強く書く。

- **Machine-contract artifacts (`def/`, `schemas/`, `lint/`)**
  - L1（各ツール仕様定義）における機械契約（schema/lint/contract）を保持する領域。

## Invariants (Must Not Break)

### Single responsibility per file

- 各ファイルは 1 つの責務を持つ。
- 1ファイルが複数の責務境界（語彙・運用意味論・境界I/O）をまたがない。

### Staging does not leak (Must)

- `00_constitution/`, `20_operational_semantics/`, `30_interaction_edges/` は
  `10_staging_frames/` を参照してはならない。
- `10_staging_frames/` は定義済み仕様を参照してよい（前提・制約の記述のため）。

### Promotion is explicit (Must)

- Staging Frames の内容を「仕様として採用」する場合、次のいずれかへ明示的に昇格する:
  - `00_constitution/`（語彙・不変条件・責務境界）
  - `20_operational_semantics/`（運用意味論）
  - `30_interaction_edges/`（境界・輸送・相互作用）
- 昇格時には互換性（breaking/compatible）と rollout 方針（dual-accept 等）を明示する。

## Boundary & Machine-contract note (Non-normative but important)

- 本リポジトリは憲法/意味論を中心に置く。
- 実際の機械契約（schema/lint/contract）は L1（各ツール仕様定義）で保持する。
- したがって 00_constitution は JSONキー形や required keys を固定しない（語彙と禁止のみを固定する）。

## Change Checklist

- 新しい仕様ファイルを追加したか
  - 置き場がこの規約に合っているか（00/20/30 or 10）
- staging（10_staging_frames）に置くべきものを 00/20/30 に置いていないか
- 00/20/30 が staging を参照していないか
- staging を昇格したか
  - 昇格先（00/20/30）が明示され、参照が差し替えられているか
  - 互換性/rollout が明示されているか

## Failure Modes

- staging が正規仕様として参照され、未定義仕様が本番に混入する。
- 同じ概念（語彙/禁止/意味論）が複数ディレクトリに分散し、正が揺れる。
