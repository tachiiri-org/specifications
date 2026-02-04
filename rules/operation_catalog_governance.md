# Rule: Operation Catalog Governance

## Goal

- operation が増えても命名衝突・互換性崩壊・ロールアウト事故を起こさない。
- “implemented_operations_only” を破綻させない。

## Rule (Must)

### Naming

- operation は `{service}/{resource}/{property}/{operation}` の4要素で一意でなければならない。
- 命名は lower_snake_case を基本とし、空文字・予約語を禁止する。
- `operation` は動詞（create/charge/provision/update/delete 等）で表現する。

### Versioning

- 破壊的変更は新しい `x-contract-version`（または新 operation）で行う。
- 同一 contract-version 内での breaking change（削除・型変更・意味変更）は禁止する。
- 互換期間中は gateway が複数 contract-version を受けてもよい（受理範囲は boundary JSON を正とする）。

### Compatibility rules (minimum)

- フィールド追加: optional のみ許可（後方互換）
- フィールド削除/必須化/型変更: breaking
- enum 追加: 後方互換（unknown を安全に扱う）
- エラー status の追加: preserve list と mapping を更新しない限り外へ出さない

### Implemented-only routing

- catalog に存在しない operation は必ず 404。
- 未実装 operation が “通ってしまう” ルーティングは禁止。

## Non-goals

- RESTful な resource modeling の強制
- 人手での動的ルーティング追加

## Failure modes

- 命名衝突で運用が崩壊する
- breaking change が混入し、段階ロールアウトで壊れる
- 未実装 operation が静かに通る

## Change checklist

- 新しい operation を追加したか
  - 命名規約に従っているか
  - catalog 登録と未実装時404が守られているか
- 互換性に影響する変更か
  - contract-version 戦略に従っているか
