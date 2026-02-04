# Rule: Mode-dependent Fields

## Goal

- mode とフィールドの整合を機械的に保証し、空配列などの曖昧表現を排除する。

## Rule (Must)

### same_origin_only

- mode = same_origin_only の場合、以下のフィールドは **存在してはならない**：
  - cors.allowed_origin.items
  - csrf.origin.allowed_origins
  - その他 explicit list 前提の items / allowed\_\* 配列

### explicit_list

- mode = explicit_list の場合、items は必須。
- items は空配列を禁止する（空は "全拒否" と "未設定" を混同するため）。

## Applies to

- cors_allowed_origin
- csrf_origin_allowed_origins
- その他 mode + items 型のフィールド

## Failure modes

- items: [] が環境差・実装差で「未設定」扱いになり、事故が起きる。
- same_origin_only のはずなのに例外リストが残り、境界が曖昧になる。
