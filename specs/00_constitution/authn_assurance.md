# Authentication Assurance & Step-up Semantics

## Goal

- 認証強度（assurance）を UI / 実装依存にせず、意味論として固定する。
- 重要操作に対する step-up 認証を、後付け混入なく導入可能にする。
- claims の増殖や AuthZ との責務混在を防ぐ。

## Scope

- authentication assurance level（語彙）
- step-up requirement（原則）
- verified context（session等の検証済み状態）
- 具体プロトコル/方式は 30/L1

## Invariants (Must Not Break)

### 1) Assurance Is Not Authorization

- assurance 不足は AuthZ failure（403）に正規化してはならない。
- assurance 不足は「再認証/追加認証要求」で扱う。

### 2) No Claims Explosion (Must)

- assurance を AuthZ 入力 claims として扱ってはならない。
- 既存 token claims に assurance を後付け追加して “AuthZ 入力に混ぜる” 設計は禁止。

### 3) Operation-bound Requirement (Must)

- step-up 要否は operation 単位で定義される。
- endpoint/UI/client type によって条件を変えてはならない。

### 4) Verified Context Is Referenced, Not Asserted

- step-up の結果は session または verified context として扱う。
- internal boundary では注入ではなく参照としてのみ扱う。

## Related Specifications

- 00_constitution/identity.md
- 00_constitution/authorization.md
- 00_constitution/claims_compatibility.md
- 30_interaction_edges/step_up.md
- 30_interaction_edges/session.md
- 30_interaction_edges/authn_methods.md
