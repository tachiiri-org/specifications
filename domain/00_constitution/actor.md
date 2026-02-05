# Actor Semantics (Entry Point)

## Goal

- actor/subject/tenant/initiator の意味論の参照点を 1つに固定する。
- 参照先のファイル名変更や分割があっても、他仕様の related links が壊れないようにする。

## Canonical Spec

- domain/00_constitution/actor_subject_tenant_model.md

## Notes

- actor/subject/initiator の語彙・不変条件・failure modes は上記 canonical spec を正とする。
- delegation/impersonation は別 domain + contract-version で導入する（後付けで混ぜない）。
- cross-domain defaults（403/claims/trust boundary/global resource 等）は domain/00_constitution/global_defaults.md を参照する。
