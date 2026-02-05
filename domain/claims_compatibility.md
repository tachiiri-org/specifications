# Identity Claims Compatibility & Governance

## Goal

- identity claims（token に含まれる語彙）の進化を、破壊的変更から守る。
- 「後付けで claims を増やして既存 AuthZ に混ぜる」事故を防ぐ。
- 境界（BFF / gateway / adapter）と contract-version 戦略を一貫させる。

## Scope

- identity / authorization で使用される claims
- claims set の versioning
- backward compatibility / breaking change の判定
- deprecation / sunset

## Definitions

### Claim

- token に含まれる key-value の identity 情報。
- AuthZ に使用される claims は `domain/authorization.md` に列挙されたものに限定される。

### Claims Set

- 1 つの token profile における「許可された claims の集合」。
- `claims_set_version` により識別される。

### Claims Set Version

- claims 集合の意味論的 version。
- 例: `"claims_set_version": "v1"`

## Invariants (Must Not Break)

### Explicit Claims Set

- token は必ず `claims_set_version` を持つ。
- boundary は受理する `claims_set_version` を明示する。

### No Silent Claim Addition

- AuthZ 入力として使える claims の追加は **breaking change** とみなす。
- breaking change は contract-version を上げずに導入してはならない。

### Separation of Concerns

- claims は「識別・認可判断の入力」であり、
  説明・監査・可観測性のための付帯情報を混ぜてはならない。
- explanation / trace / reason 系の情報は claims ではなく observability に属する。

### Delegation Safety

- delegation / impersonation に必要な claims は、
  別 domain + 別 contract-version でのみ導入される。
- 既存 claims set への後付けは禁止。

## Compatibility Rules

### Backward-compatible changes (Allowed)

- AuthZ に **使用しない** optional claims の追加
- 既存 claims の意味を変えない metadata 的拡張

### Breaking changes (Not allowed without version bump)

- AuthZ 入力として使える claims の追加
- 既存 claims の意味変更
- claims の型・必須性の変更
- subject/actor/tenant の意味論に影響する変更

## Deprecation & Sunset

- claims の非推奨化は以下を必ず持つ：
  - deprecated_since
  - sunset (date or release id)
- sunset 到達後の claims は不正として扱われる。

## Failure modes

- claims が増殖し、どこで認可が変わるか分からなくなる。
- service actor に human 前提の claims が混入する。
- 境界ごとに claims 解釈が異なり、環境差分が出る。

## Related Specifications

- domain/identity.md
- domain/authorization.md
- domain/authz_and_ops_scaling.md
- rules/jwt_token_profile.md
