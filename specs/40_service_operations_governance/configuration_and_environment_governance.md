# Configuration & Environment Governance Semantics

## Goal

- 環境差分（prod/staging/etc）が
  契約・意味論を破壊しないよう統制する。
- “設定だから例外”を許さない。

## Scope

- runtime configuration
- environment separation
- config rollout / rollback
- emergency configuration

## Invariants (Must Not Break)

### Configuration is versioned (Must)

- すべての有効設定は version / revision として識別できる。
- live-edit を一次運用にしない。

### Config change follows release semantics (Must)

- 設定変更は change / release と同等に扱われる。
- rollback 不可能な設定変更は禁止。

### Environment difference is explicit (Must)

- 環境差分は：
  - 明示的に定義され
  - 意味論（authz / tenant / contract）を変えない。
- “prod だけ特別”を暗黙に作らない。

### Emergency config is temporary (Must)

- emergency config は必ず期限を持つ。
- 恒久設定へ昇格する場合は、通常 release を経る。

## Failure modes

- 設定変更で静かに挙動が変わる。
- rollback 不能なフラグが残留する。
- 環境差分が原因不明の障害を生む。

## Related Specifications

- 20_operational_semantics/feature_enablement_and_flag_governance.md
- 00_constitution/global_defaults.md
