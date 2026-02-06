# Change & Release Lifecycle Governance

## Goal

- 仕様・schema・event・runtime behavior の変更を
  **運用上の状態遷移**として統制する。
- “出し方次第で壊れる” 状態を防ぎ、
  rollback / abort が意味論的に成立することを保証する。

## Scope

- compatible / breaking release
- rollout / abort / rollback
- release と runtime behavior の関係

## Core Vocabulary

- **Release**
  - 意味論の変更単位（schema / boundary / catalog を束ねうる）

- **Rollout**
  - release を段階的に有効化する行為

- **Abort**
  - rollout 途中での中断（未有効化領域へ戻す）

- **Rollback**
  - 既に有効化された release を撤回する行為

## Invariants (Must Not Break)

### Release is explicit

- すべての変更は release として宣言される。
- “設定を変えただけ”“flagを切っただけ” で意味論が変わってはならない。

### Compatibility is respected

- compatible release:
  - dual accept / rollback が可能
- breaking release:
  - dual accept を前提にしない
  - rollback 不可または限定的であることを事前に明示する

### Abort vs Rollback distinction

- abort は **未有効化領域のみ**に適用される。
- rollback は **意味論の後退**を伴い、必ず制約を持つ。

### Runtime state safety

- rollback が runtime state（永続化・外部副作用）を
  不整合にしてはならない。
- rollback 不可能な変更は、その旨を release metadata として明示する。

## Failure Modes

- rollback 不能な変更が暗黙に混入する
- abort/rollback の境界が曖昧で二重実行が起きる
- 環境ごとに release 状態が割れる
