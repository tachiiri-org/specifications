# Release & Compatibility Governance

## Goal

- 大規模SaaSを複数運用する前提で、仕様・schema・event・contract-version の変更を
  「人の判断」ではなく「語彙と状態遷移」で統制する。
- 段階ロールアウト・切り戻し・互換期間を機械検査と運用判断の共通言語にする。

## Scope

- contract-version
- schema / event compatibility
- release lifecycle
- deprecation / removal
- emergency rollback

## Definitions

- **Release**
  - 仕様または契約の意味論的な変更単位。
  - 複数の JSON / schema / catalog 更新を束ねうる。

- **Release ID**
  - release を一意に識別するID（例: `rel-2026-02-billing-v3`）。
  - schema / boundary / event metadata から参照可能であること。

- **Compatibility Mode**
  - `compatible` / `breaking`

- **Dual Accept Window**
  - 複数 version を同時受理する期間。
  - breaking change では許可されない。

## Invariants (Must Not Break)

### Explicit release declaration (Must)

- すべての breaking change は release 単位で宣言される。
- 「schema だけ」「boundary だけ」の単独 breaking は禁止。

### Compatibility coherence (Must)

- compatible release:
  - dual accept window が存在してよい
- breaking release:
  - 単一 version のみを accept する
  - rollout 順序が明示される

### No silent removal (Must)

- field / operation / event の削除は、
  - deprecated → grace period → removal
    の段階を必ず踏む。

### Rollback safety (Must)

- rollback は「以前の release を再 deploy」する形で成立しなければならない。
- runtime state に irreversible な変更を残してはならない。

## Failure modes

- schema と boundary の version が噛み合わず環境差で壊れる
- rollback 不能な変更が混入する
- 運用判断が属人化する

## Related Specifications

- 00_constitution/claims_compatibility.md
- 20_operational_semantics/event_version_rollout.md
- 20_operational_semantics/payload_schema.md
