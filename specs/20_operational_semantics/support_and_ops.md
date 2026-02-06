# Support & Operations Semantics (Incidents / Break-glass / Support Tooling)

## Goal

- 大規模SaaSの運用（障害対応・調査・復旧・補正）を「人の裁量」ではなく
  契約（operation/event/audit）として固定し、属人化と裏口を排除する。
- break-glass を “仕様化された例外” として扱い、監査・期限・理由付けを必須化する。

## Scope

- incident response vocabulary (severity, incident_id)
- break-glass operations
- support operations (investigation / mitigation / repair / backfill trigger)
- audit & observability coupling
- support tooling expectations (console / workflows)

## Definitions

- **Incident**
  - 障害または重大な運用事象。
  - 一意な `incident_id`（または ticket_id）で追跡される。

- **Severity**
  - 影響度分類（例: S0〜S3）。意味は組織で決めるが、語彙は固定する。

- **Support Operation**
  - 運用目的で実行される operation（調査・緩和・復旧・補正）。

- **Break-glass Operation**
  - 通常権限では許可されないが、緊急時に限定的に許可される operation。
  - 恒久権限ではなく、期限と理由により統制される。

- **Ops Actor**
  - 運用主体。human actor と service actor のいずれもあり得るが、claims で明示される。
  - 通常の user actor と混同してはならない。

## Invariants (Must Not Break)

### No ad-hoc privileged channels

- SSH 直叩き・DB直更新・隠しエンドポイント等の “裏口” を正当化しない。
- 運用で必要な操作は、原則として operation catalog に昇格させる（support operations）。

### Support is operation-based

- support 操作も operation として定義され、schema を持つ。
- catalog 外操作は禁止（表現は catalog 契約に従う）。

### PDP remains adapter

- support/break-glass であっても、AuthZの最終判断（PDP）は adapter。
- gateway/BFF が “運用だからOK” と判断してはならない。

### Strong audit is mandatory for break-glass

- break-glass operation は必ず audit event を生成する。
- audit には、最低限として次を含めて相関可能であること:
  - tenant_id
  - actor_id（ops actor）
  - operation_key
  - result
  - request_id
  - incident_id（または ticket_id）
  - reason（短文）
- PII/secret は含めない（redaction 方針に従う）。

### Time-bound privilege

- break-glass は時間制限される（expires_at 等）。
- revoke（無効化）可能であること。
- 恒久的な特権（恒久委譲/恒久break-glass）は許可しない。

### Tenant isolation

- support 操作は tenant_id を必須とし、tenant跨ぎは禁止（例外は別 contract-version）。

### External effect safety

- support 操作で external_effect を起こす場合:
  - idempotency 必須
  - audit 必須
  - retry は保守的（無制限禁止）

## Support Operation Classes (Recommended vocabulary)

- **investigation**
  - 調査（read-only）。原則として mutate を含めない。
- **mitigation**
  - 緩和（例: feature disable, throttle, tenant suspend）。影響範囲を限定する。
- **repair**
  - 修復（データ補正、再計算トリガ等）。再実行可能であること。
- **recovery**
  - 復旧（DLQ re-drive, replay trigger）。重複安全が必須。
- **break_glass**
  - 緊急特権（最小化、期限必須）。

## Machine-enforced contracts (Moved out of this file)

- catalog metadata / audit shape / incident binding 等の具体キーや機械検査は、機械契約（schema/lint/contract）は L1（各ツール仕様定義）で定義する。
- 本ファイルは「運用意味論（裏口禁止・監査必須・期限必須・PDP固定）」を正とする。

## Non-goals

- 組織のオンコール体制設計（シフト、担当表）。
- すべての運用手順（runbook）の詳細標準化。

## Failure modes

- 運用のための裏口が増殖し、監査不能になる
- break-glass が恒久権限化して権限事故になる
- support 操作が tenant 跨ぎで実行され、重大事故になる

## Related Specifications

- 00_constitution/global_defaults.md
- 00_constitution/policy_decision_trace.md
- 00_constitution/authorization.md
- 00_constitution/policy_evaluation.md
- 00_constitution/actor_subject_tenant_model.md
- 20_operational_semantics/operational_access_break_glass.md
- 20_operational_semantics/idempotency.md
- 20_operational_semantics/async_jobs_events.md
- 20_operational_semantics/data_tenant_safety.md
