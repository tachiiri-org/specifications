# Service Operations Governance (Ops Governance Domain in L0)

## Purpose

本ディレクトリは、大規模SaaSを **人間が運用する現実** と
L0 内の仕様ドメイン（constitution / operational_semantics / interaction_edges）の間を接続する
**運用ガバナンス領域** を定義する。

Ops Governance が扱うのは以下である：

- 人間が関与する **運用行為の状態遷移**
- 通常状態からの **逸脱（incident / emergency）**
- 変更・緊急対応・復旧の **判断責務と不変条件**

## Relationship to Other Layers

- **constitution**
  - 不変の原理・責務・禁止事項を定義する
  - Ops Governance はこれを前提とし、例外を新たに作らない

- **operational_semantics**
  - 技術的意味論（idempotency / audit / data / async 等）
  - Ops Governance はそれらを「いつ・誰が・なぜ使うか」を定義する

- **interaction_edges**
  - 境界・輸送・確立のルール
  - Ops Governance は transport や header を直接扱わない

## What Ops Governance Covers

- Release / rollback / abort の運用状態遷移
- Incident の宣言・制御・終了条件
- Security / dependency failure の運用対応
- 緊急時の runtime configuration 制御

## Non-goals (Must Not)

- 組織構造、オンコール体制、担当者表
- 数値目標（SLO/SLA/MTTR 等）
- ツール選定、CI/CD 実装詳細
- Runbook や手順書の詳細

Ops Governance は「**何が許され、何が許されないか**」を語る。
「どう実装するか」「誰が何時にやるか」は語らない。
