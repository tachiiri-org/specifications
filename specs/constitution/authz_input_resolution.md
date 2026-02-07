# Authorization Input Resolution (Constitution)

## Goal

- AuthZ に必要な情報が「どこで・どう解決されるか」を増設可能にしつつ、
  claims の後付け混入・責務混在を防ぐ。

## Scope

- AuthZ input categories（語彙）
- token / directory / lookup / computation の責務分離（原則）
- adapter-side resolution の許容条件（原則）
- 具体 schema/keys/実装は L1 (tool-spec repos)

## Definitions (Normative Vocabulary)

- **Identity claims**
  - tenant_id / actor_id / actor_type / (subject_id, subject_type)
- **Issued attributes**
  - roles / scopes（IdP/directory 由来）
- **Resolved attributes**
  - organization membership / subscription tier / entitlement 等
  - token に後付けせず、request-scoped internal context として解決されうる

## Invariants (Must Not Break)

- AuthZ 入力として使用できる claims は `constitution/authorization.md` の allowed claims に限定する。
- 新しい判断材料を token に後付けで混ぜない（claims explosion 禁止）。
- adapter-side resolution を行う場合でも、AuthZ 入力 claims を拡張した扱いにしてはならない。
- resolution の失敗意味論は暗黙 default にせず、operational_semantics (L0) で固定する。

## Related Specifications

- constitution/authorization.md
- constitution/claims_compatibility.md
- operational_semantics/authz_input_resolution.md
