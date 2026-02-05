# Authentication Assurance & Step-up Semantics

## Goal

- 認証強度（assurance）を UI / 実装依存にせず、意味論として固定する。
- 重要操作に対する step-up 認証を、後付け混入なく導入可能にする。
- claims の増殖や AuthZ との責務混在を防ぐ。

## Scope

- authentication assurance level
- step-up requirement
- operation classification との結合
- session / verified context

## Definitions

### Authentication Assurance Level (AAL)

- identity がどの程度の強度で確認されたかを示す抽象語彙。
- 実装・プロトコルには依存しない。

例（非規範的）:

- aal_low
- aal_medium
- aal_high

### Step-up Authentication

- 既存 session / identity に対し、
  追加の認証を要求して assurance level を引き上げる行為。

## Invariants (Must Not Break)

### Assurance Is Not Authorization

- authentication assurance は認可（AuthZ）ではない。
- assurance の不足は「再認証要求」であり、403 に正規化してはならない。

### No Claims Explosion

- assurance level は AuthZ 入力 claims として扱わない。
- token claims に assurance を後付け追加する設計は禁止。

### Operation-bound Requirement

- step-up 要否は operation 単位で定義される。
- endpoint / UI / client type によって変えてはならない。

### Verified Context

- step-up の結果は session または verified context として扱う。
- internal boundary では「検証済み状態」としてのみ参照される。

## Failure Semantics

- assurance 不足時の挙動は operation ごとに定義される：
  - step-up required
  - deny
- 無条件 deny を default にしない。

## Failure modes

- UI 実装ごとに step-up 条件が分岐する。
- assurance を claims に混ぜ、互換性が壊れる。
- 重要操作が弱い認証で実行される。

## Related Specifications

- domain/00_constitution/identity.md
- domain/00_constitution/authorization.md
- domain/00_constitution/operation.md
- domain/30_interaction_edges/session.md
