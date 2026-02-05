# Rule: Spec Package Versioning (npm distribution)

## Goal

- “仕様(JSON)を npm で配布する” 前提で、spec_version / breaking_change と
  npm package version（SemVer）の対応を固定し、利用側が事故らないようにする。

## Applies

- package.json（仕様パッケージ）
- rules/\*.json（spec_version / breaking_change / effective_from を持つもの）
- CI（spec-lint）

## Rule (Must)

### 1) SemVer mapping

- npm package version を `MAJOR.MINOR.PATCH` とする。
- 仕様の breaking_change=true を含むリリースは MAJOR を上げなければならない。
- breaking_change=false の場合：
  - 仕様追加（互換）を MINOR
  - 修正（lint/説明/typo 等、仕様意味が変わらない）を PATCH

### 2) Effective date must be present

- 配布する JSON（rules/def/catalog 等）には `effective_from` を必須とする。
- effective_from は “そのパッケージが有効になる日” であり、未来日でもよい。

### 3) Runtime must pin versions

- runtime は “floating latest” を前提にしない。
- 依存する spec package version を明示的に固定（pin）すること。

## Failure modes

- breaking が MINOR で出て一斉障害になる。
- runtime が latest を引いて突然壊れる。
- effective_from が無く、いつから適用か分からない。
