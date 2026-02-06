# Tenant Lifecycle Semantics

## Goal

- tenant を「存在するかどうか」ではなく「状態を持つ主体」として扱う。
- 停止・削除・復旧に関する判断が、境界・実装・環境ごとに揺れないよう、
  状態語彙と責務分離を固定する。
- 大規模運用で頻出する “静かな事故”（課金継続・復活・越境参照）を防ぐ。

## Scope

- tenant status vocabulary
- state transition semantics
- enforcement responsibility (gateway vs adapter)
- lifecycle observability (audit / events)

## Tenant Status Vocabulary (Normative)

すべての tenant は以下いずれかの `tenant_status` を必ず持つ。

- **active**
  - 通常稼働状態

- **suspended**
  - 規約違反・未払い等による一時停止
  - データは保持されるが、不可逆操作は禁止される

- **closing**
  - 契約終了処理中
  - 削除・エクスポート等の終端処理のみが許可される

- **deleted**
  - 論理削除済み
  - 原則として tenant は不可視・不可操作

- **purged**
  - 物理削除完了
  - 復旧不能

## Invariants (Must Not Break)

### Status is explicit and authoritative

- tenant の可否は必ず `tenant_status` によって判断する。
- “データが残っている/見える” などの状況推論で代替してはならない。

### Enforcement responsibility

- **最終的な拒否責務は adapter にある**。
- gateway / BFF は早期拒否してよいが、
  adapter の判断を代替してはならない。

### Capability baseline (Informative)

以下は **値なしの直感的ベースライン例**であり、最終的な許可/拒否は operation 単位の定義に従う。
（特に read の扱いは operation によって変わりうる。）

| status    | read       | mutate | irreversible / external_effect |
| --------- | ---------- | ------ | ------------------------------ |
| active    | allow      | allow  | allow                          |
| suspended | allow\*    | deny   | deny                           |
| closing   | restricted | deny   | deny                           |
| deleted   | deny       | deny   | deny                           |
| purged    | deny       | deny   | deny                           |

\* read の許可/制限は operation 単位で明示される。

### Exception introduction rule (Must)

- tenant_status に対する例外（例: suspended でも特定 mutate を許可する等）を導入する場合は:
  - operation 単位で明示し（暗黙デフォルト化しない）
  - 監査・可観測性を伴い
  - 互換性戦略（contract-version を上げる必要があるか）を明確にする
- “運用都合”で環境差分として例外を混入させてはならない。

### No implicit revival

- `deleted` / `purged` 状態の tenant は、
  いかなる操作によっても暗黙に復活してはならない。
- 復活を許す場合は **新しい tenant_id を発行**する。

## State Transitions (Semantic)

- permitted transitions は以下に限定される:
  - active → suspended
  - suspended → active
  - active/suspended → closing
  - closing → deleted
  - deleted → purged

- skipping transitions（例: active → deleted）は許容されない。

## Observability & Audit

- tenant_status の変更は必ず audit 対象とする。
- audit には最低限以下を含む:
  - tenant_id
  - previous_status / new_status
  - actor_id（human/system）
  - request_id / correlation_id
  - event_time

## Failure Modes (What this spec prevents)

- 停止 tenant が課金・外部連携を継続する。
- 削除済み tenant が復旧や再投入で復活する。
- gateway と adapter で tenant 判定が割れる。

## Related Specifications

- 20_operational_semantics/data_tenant_safety.md
- 20_operational_semantics/data_persistence.md
- 00_constitution/authorization.md
