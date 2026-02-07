# Session Semantics (Browser Boundary)

## Goal

- browser session（cookie）を安全に管理し、CSRF と整合させる。
- session 発行点・更新・失効の責務を固定し、境界崩壊を防ぐ。

## Scope

- Browser ⇄ BFF session cookie
- session rotation / logout / revoke
- cookie attributes
- CSRF coupling

## Invariants (Must Not Break)

### Issuer boundary (Must)

- session cookie（`__Host-session`）を発行できるのは BFF のみ（cookie emitter ルール）。
- gateway/adapter に cookie を伝播しない。

### Rotation / lifetime (Must)

- session は更新（rotation）可能であること。
- session lifetime は短め（推奨）とし、延長の条件は明示される。

### Logout / revoke (Must)

- logout は session を無効化する（server-side revoke または短TTL+ローテ戦略）。
- logout の結果が adapter に漏れない（cookie は BFF で完結）。

## Required rules

- cookie 発行点: L1 (tool-spec repos)
- CSRF: L1 (tool-spec repos)

## Failure modes

- cookie emitter が増え、どこでセッションが変わったか追えない。
- rotation がなく盗難時の影響が大きい。
- logout が不完全で再利用される。

## Related Specifications

- interaction_edges/security_browser_boundary.md
- constitution/identity.md
