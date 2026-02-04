# Rule: JWT Token Profile Contract

## Goal

- bearer token (JWT) の検証条件を boundary JSON に固定し、環境差・実装差による事故を防ぐ。
- issuer/audience/algs/jwks/clock skew/required claims を「具体値」として扱い、MDの意図だけに依存しない。

## Applies

- auth.transport = bearer の boundary
- gateway / adapter など、token verification を行うコンポーネントが存在する境界

## Rule (Must)

### Required config

- auth.transport = bearer の boundary は `auth.token_profile` を必ず持つ。

`auth.token_profile` は以下を満たす:

- type = jwt
- allowed_algs: 非空配列（広げる場合は breaking とみなす）
- issuer: 非空文字列
- audience: 非空文字列
- jwks:
  - source = env
  - env_var: 非空文字列
  - cache_ttl_sec: number (>0)
- max_clock_skew_sec: number (0..60 を推奨上限として固定)
- required_claims: 非空配列（最低限 iss/aud/exp/sub を含む）

### Verification checks consistency (minimum)

- inbound verification checks は少なくとも以下を含むこと:
  - verify_signature
  - verify_issuer
  - verify_audience
  - verify_expiration

## Failure modes

- issuer/audience の解釈が実装ごとに違い、環境差で authn が崩れる。
- alg 許可が広がり、想定外の署名方式が通る。
- jwks 取得が曖昧で、鍵ローテーションやキャッシュが壊れる。
- clock skew が無制限になり、exp の意味が弱まる。
