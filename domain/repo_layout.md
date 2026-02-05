# Repository Layout & Responsibility Boundaries

## Goal

- 仕様リポジトリが大規模化しても「置き場の解釈」がブレないようにする。
- ファイル配置の矛盾（境界責務の混在・重複定義・参照経路のカオス）を防ぎ、
  仕様の増加がそのまま崩壊につながる状況を避ける。
- “どこに何を置くべきか” を機械検査（lint）に落とし込める最小の規約を固定する。

## Scope

- specifications/ 配下のディレクトリ構造
- MD/JSON/PUML の置き場と責務
- “canonical catalog” の扱い（operation/events/topology/connectors 等）
- schema（operation/event/payload）の配置方針
- lint 対象にできる配置ルール（将来の拡張前提）

## Definitions

- **Domain (domain/)**
  - 意味論・語彙・不変条件・設計意図を記述する MD 群。
  - 「何が正しいか（invariants）」と「なぜそうするか（rationale）」を分離しつつ保持する。

- **Rule (rules/)**
  - cross-file / cross-boundary の不変条件と、その参照元（canonical catalogs）を置く。
  - rules/ は「複数ファイルをまたいで検査される前提」の場所である。

- **Definition (def/)**
  - デプロイ可能な責務境界（front/bff/gateway/adapter 等）や運用上の具体決定を JSON で置く。
  - def/ の JSON は「実行時に適用される具体設定」であり、原則 normative とする。

- **Schema (schemas/)**
  - operation / event / payload の JSON schema を置く。
  - schema は “形” を固定するものであり、catalog（rules/）から参照される。

- **Lint (lint/)**
  - 機械検査（CI）用の実装と、lint が参照する検査用 schema（lint/schema/）を置く。
  - 仕様（rules/def/schemas）そのものではない。

- **Pending (pending/)**
  - 未確定・検討中の草案を隔離する。
  - pending/ は “参照されない” 前提であり、runtime/lint の正規入力にならない。

## Invariants (Must Not Break)

### Schemas are referenced, never inferred

- schema は catalog（rules/）から明示的に参照される。
- 実装・lint が operation_key からパスを推測することは禁止。
- path 変更は catalog 変更として扱われ、breaking になりうる。

### Schema directory depth

- 深さ制限は **推奨**とし、正は catalog 参照である。

### Single responsibility per directory

- 各ディレクトリは 1 つの責務を持つ。
- 1 つの JSON/MD/Schema が複数の責務境界（boundary/rule/catalog/schema）をまたがない。

### Canonical catalogs live in rules/

- 複数境界から参照される “canonical catalog” は rules/ に置く。
  - 例: operation catalog / topology / connectors / events catalog
- canonical catalog を def/ に置いてはならない（境界固有設定と混ざり、参照の正が揺れるため）。

### Boundary definitions live in def/

- boundary\_\* のような「境界の具体設定」は def/ に置く。
- boundary が参照する外部の canonical catalog は rules/ から参照する。

### Schemas are referenced, not discovered

- schema は catalog から `schema.path` 等で参照される “固定アセット” として扱う。
- 実装や lint が “ディレクトリ探索” で暗黙に schema を解決してはならない。
  - 例: operation_key からパスを推測する行為は禁止（推測はドリフト源）。

### Schema directory depth is bounded (2-level max)

- schemas/ の階層は深くしすぎない。
- operation schema は原則として次のいずれかに従う（推奨は A）:
  - A) `schemas/operations/<service>/<flat_name>.vN.json`
  - B) `schemas/operations/<flat_name>.vN.json`
- `<service>/<resource>/<property>/<operation>/...` のような深い階層は避ける
  （将来の再編で path 移動が breaking になりやすいため）。

### Root documents are “constitution”, not “rules”

- リポジトリの全体方針（purpose/principles）は root に置く。
- purpose/principles は rules/ に移動しない（個別ルールと同格に見え、優先順位が落ちるため）。

## Directory Contracts (Must)

### Root (specifications/)

- リポジトリ憲法・入口ドキュメントを置く。
  - 例: `00_purpose.md`（推奨: 数字で先頭固定）
- PUML は root に残してもよいが、増える場合は puml/ へ集約してよい。

### domain/

- domain/\*.md は意味論・語彙・不変条件を記述する。
- domain/ は “どの boundary にも依存しない” 抽象層である。
  - 例外: boundary 名や catalog 名を参照してもよいが、具体の値や環境差分を持たない。

### rules/

- cross-file invariants を MD で置く（lint による検査対象になりうる）。
- canonical catalogs を JSON で置く（複数境界から参照される前提）。
  - 例: `operation_catalog.json`, `topology.json`, `connectors.json`, `events_catalog.json`
- rules/ の JSON は “参照される正” であり、別ディレクトリに複製してはならない。

### def/

- boundary JSON（例: boundary_browser_to_bff.json）は def/ に置く。
- def/ の JSON は runtime/lint の入力であり、self-contained を基本とする。
  - ただし canonical catalog 参照（rules/）は許可される。

### schemas/

- operation/event の schema を置く。
- schema はファイル名に version を含める（例: `.v1.json`）。
- schema の互換性方針は `domain/schema_compatibility.md` を正とする。

### lint/

- lint 実装（JS）と lint 用の schema を置く。
- lint は rules/def/schemas を入力として参照する（pending を参照しない）。

### pending/

- 仕様に昇格する前の草案を置く。
- pending を rules/def/schemas から参照してはならない。

## Naming Conventions (Recommended)

- root の憲法: `00_purpose.md` のように番号で固定する。
- canonical catalogs: `<noun>_catalog.json`（例: operation_catalog.json, events_catalog.json）
- schema:
  - operation: `<service>_<resource>_<property>_<operation>.vN.json`（flat）
  - event: `<domain>.<event_name>.vN.json` または `<service>.<event_name>.vN.json`
- boundary: `boundary_<from>_to_<to>.json` を基本とする（必要なら現行名を維持してよい）。

## Change Checklist

- 新しい仕様ファイルを追加したか
  - 置き場がこの規約に合っているか（domain/rules/def/schemas/pending）
- canonical catalog を追加/変更したか
  - rules/ にあるか
  - 参照パスが boundary や lint と整合しているか
- schema を追加/移動したか
  - catalog 参照（schema.path 等）が更新されているか
  - 深い階層になっていないか（2-level max）
- purpose/principles を変更したか
  - root にあり続けているか（rules/ に紛れ込んでいないか）

## Failure Modes

- 同じ概念（catalog/語彙/設定）が複数ディレクトリに分散し、正が揺れる。
- schema のパス推測が始まり、実装差分で互換性が壊れる。
- 深い階層が増えて移動が頻発し、参照更新漏れが恒常化する。
- pending が参照され始め、未確定仕様が本番に混入する。
