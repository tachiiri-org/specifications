# Actor, Subject, and Tenant Model

## Goal

- 「誰が」「誰として」「どのテナントで」行動しているかを明確に定義する。
- service 拡張・代理実行・internal call が増えても意味論が壊れないようにする。

## Scope

- identity claims
- actor / subject / tenant
- human actor / service actor

## Definitions

- **Tenant**
  - 論理的な所有境界。
  - データ・操作・課金・可視性の上位スコープ。

- **Actor**
  - 行為の主体。
  - tenant 内で一意。
  - human または service のいずれか。

- **Subject**
  - actor が「誰として」行動しているかを表す identity。
  - 通常は user identity。

## Invariants (Must Not Break)

### Tenant Isolation

- すべての actor は単一の tenant に属する。
- tenant を跨ぐ操作は明示的に禁止される（特別な設計がない限り）。

### Single Actor per Request

- 1 リクエストには 1 actor のみが存在する。
- 複数 actor の混在は許可しない。

### Transport Rules

- actor / subject 情報は **token claims のみ**から取得する。
- `x-actor-*` 等の header による actor 注入は拒否される。

### Delegation & Impersonation

- actor の委譲・なりすまし（impersonation）は **非対応**とする。
- 将来対応する場合は、別 domain と contract-version で導入する。

## Non-goals

- RBAC / ABAC の具体モデル定義。
- 組織階層・グループ管理の標準化。

## Failure modes

- tenant 跨ぎ操作が静かに通る。
- service actor が user と同一視され、認可が崩れる。
- header 注入により actor が偽装される。

## Related Specifications

- domain/identity.md
- domain/authorization.md
