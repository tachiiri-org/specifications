# Identity Key Rotation & Issuer Governance (Interaction Edge)

## Goal

- JWT 検証鍵・issuer の変更や追加を安全に行える原則を固定する。
- “鍵が取れない/更新された” ときの挙動が環境差分にならないようにする。

## Scope

- issuer allowlist
- rotation overlap（複数鍵の同時受理期間）
- verification cache（値は固定しない）
- failure handling（挙動の明示必須）
- secrets exposure prohibition（鍵値は書かない）

## Invariants (Must Not Break)

- 境界は受理する issuer allowlist を明示する。
- allowlist 外 issuer の token は reject（401）。
- 鍵ローテーション時は overlap 期間を必ず設ける（overlap 無しは禁止）。
- JWKS/検証情報の cache は許容するが、TTL/失効条件は明示されなければならない（値は固定しない）。
- 取得失敗時の挙動（fail-fast/cached-only/degraded 等）は明示される。
- 検証スキップ（silent accept）は禁止。
- secrets（秘密鍵・実鍵値）は仕様に書かない（参照方式のみ）。

## Failure modes

- issuer 追加が暗黙で入り、境界ごとに受理範囲が割れる。
- overlap 無しでローテが走り、一部環境で 401 が大量発生する。
- JWKS 取得障害で挙動が不定になり、事故調査不能になる。

## Related Specifications

- constitution/identity.md
- constitution/secrets_and_keys.md
- constitution/claims_compatibility.md
- interaction_edges/authn_methods.md
