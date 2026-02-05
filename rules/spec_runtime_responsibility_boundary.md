# Spec / Runtime Responsibility Boundary

## Goal

- 仕様（spec）と実装（runtime）の責務境界を明確にし、
  大規模組織・複数SaaS運用でも解釈が揺れないようにする。
- 「lintは通るが実装が無視する」「実装が独自判断する」
  といったドリフトを防ぐ。

## Scope

- specifications (MD / JSON)
- runtime components (gateway / bff / adapter)
- enforcement responsibilities
- failure posture (fail-open / fail-closed)

## Core Principle

> **Spec defines truth. Runtime enforces truth.**  
> Spec は意味を定義し、runtime はそれを忠実に強制する。

## Responsibilities of Spec (Normative)

Spec は以下を定義する責務を持つ：

- 意味論（semantics）
  - identity / tenant / actor
  - authorization
  - idempotency
  - deletion
  - event compatibility
- 境界と責務分離
  - gateway / bff / adapter の役割
- 不変条件（invariants）
  - 禁止事項
  - default behavior
- 許される例外の表現方法

Spec は **実装戦略・最適化・運用手順** を定義しない。

## Responsibilities of Runtime (Normative)

Runtime は以下を保証する責務を持つ：

- Spec に定義された意味論を **そのまま適用** する。
- Spec に反する挙動を **fail-closed** にする。
- Spec に存在しない判断を **独自に導入しない**。

Runtime は以下を行ってはならない：

- Spec の省略・解釈変更
- 環境差による意味論の変更
- “一時的対応” を恒久化すること

## Fail-Closed Defaults

以下の領域で Spec を満たせない場合、
runtime は原則として **fail-closed** を取る：

- authentication / token verification
- authorization
- idempotency
- tenant isolation
- contract-version enforcement
- error shape / error algorithm
- external_effect protection

Fail-open を許可する場合は、
Spec において **明示的に例外として定義** されなければならない。

## Determinism

- Runtime における spec 解決は決定的でなければならない。
- 起動時点で：
  - 適用される spec の識別子
  - version / effective boundary
    を確定できなければならない。

## Observability

Runtime は以下を観測可能にする：

- 適用中の spec identifier
- spec version / boundary
- spec 違反による拒否（error class として）

Spec は観測の中身を定義し、  
Runtime はそれを欠落なく実装する。

## Change Handling

- Spec の変更は runtime の再デプロイなしに
  意味論を変えてはならない。
- breaking change は：
  - 明示的に宣言され
  - versioned に roll out される

## Failure Modes (What this spec prevents)

- 実装が spec の一部を無視して独自判断する。
- 環境差（prod/stg）で意味論が変わる。
- lintとruntimeの挙動が乖離する。
