# Limits & Resource Protection

## Goal

- 単一リクエストやスパイクによるシステム全体の不安定化を防ぐ。
- failure を「速く・小さく・局所的」に起こす。

## Scope

- body / header size limits
- timeout
- concurrency
- queueing
- retry_timeouts_chain

## Design Principles

- limit は「安全弁」であり、性能最適化ではない。
- 落とすなら早く落とす（fail fast）。
- 境界ごとに limit を持つ。
- limit の具体値は boundary JSON を正とする（MD は不変条件と意図のみ）。

## Invariants (Must Not Break)

### Size Limits

- request / response の最大サイズを境界ごとに明示する（boundary JSON）。
- 超過時は 413 / 431 を返す。

### Timeouts (Chaining)

- upstream timeout は必ず設定する（boundary JSON）。
- 連鎖不変条件（例）:
  - client_timeout > front/bff upstream_timeout >= bff->gateway upstream_timeout >= gateway->adapter upstream_timeout
- retry がある境界では、`max_attempts` と `upstream_timeout` の積が上流のタイムアウトを超えないようにする。

### Concurrency / Queueing

- per-instance concurrency を制限する（boundary JSON）。
- queue を許可する場合、最大長と on_exceed の挙動を固定する。

## Non-goals

- 高負荷耐性の最大化（それは別のスケーリング戦略で行う）。
- 無制限な burst 吸収。

## Failure modes

- timeout が未設定でワーカーが枯渇する。
- queue が無限に伸び、遅延地獄になる。
- limit 不一致により、境界ごとに挙動が変わる。
- retry と timeout の積で上流が詰まる。

## Change checklist

- 新しい route / operation を追加したか
  - limit override が必要か（boundary JSON）
- retry と timeout の組み合わせは安全か
- エラーステータスが contract に合っているか
