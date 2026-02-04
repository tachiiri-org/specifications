# Rule: Canonical JSON Number Normalization (for Hashing)

## Goal

- idempotency fingerprint の `canonical_json` で、言語差・実装差による hash 不一致を防ぐ。
- JSON number 表現の揺れ（1 / 1.0 / 1e0 等）を deterministic に正規化する。

## Scope

- http.idempotency.fingerprint.body_hash.input.encoding.type = canonical_json
- number_representation = normalized_json_number

## Rule (Must)

- canonical JSON で number を扱う場合、以下の正規化を必須とする:
  - 符号:
    - `-0` は `0` として扱う（`-0` を禁止/正規化）
  - 指数表現:
    - exponent 表現（e/E）は禁止し、十進表現に正規化する
  - 末尾の .0:
    - `1.0` は `1` に正規化する
  - 余計な leading zero:
    - `01` のような表現は reject（JSON的にも不正）
  - 小数の末尾ゼロ:
    - `1.2300` は `1.23` に正規化する
  - 小数点のみ:
    - `.5` は reject（JSONとして不正）
  - Infinity / NaN:
    - reject

## Test vectors (Must)

- 実装は以下の入力を同一表現へ正規化し、同一 hash になること:

### Equivalent numbers (same normalized form)

- `1` == `1.0` == `1.00` -> `1`
- `0` == `-0` -> `0`
- `10.50` == `10.5000` -> `10.5`

### Rejections

- `1e0` / `1E0` (exponent) -> reject
- `NaN` / `Infinity` -> reject
- `.5` -> reject
- `01` -> reject

## Rationale

- JSON number は text なので、数値として等価でも byte 表現が異なりうる。
- hashing に使う canonical 化は、実装のブレが即「同一操作なのに別操作扱い」に直結する。

## Applies to

- boundary_gateway_to_adapter.http.idempotency.fingerprint.body_hash
- boundary_bff_to_gateway.http.idempotency.fingerprint.body_hash（存在する場合）
- rules/idempotency_end_to_end.md

## Failure modes

- 同一操作が別 fingerprint になり、重複実行・再送扱いが崩れる。
- 一部言語実装で指数表現を出してしまい、互換性が壊れる。

## Change checklist

- canonical_json の実装を追加/変更したか
  - test vectors を満たすか
  - exponent を拒否しているか
