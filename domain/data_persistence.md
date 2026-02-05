# Data Persistence & Retention

## Goal

- データの保存・暗号化・保持期間・削除を仕様として固定し、運用と実装差分を防ぐ。
- PII / billing データを安全に扱い、監査・復旧に耐える。

## Scope

- persistence categories（PII / billing / logs / audit）
- encryption at rest / in transit
- retention / deletion
- backup / restore expectations（高レベル）

## Invariants (Must Not Break)

### Categorization

- 保存データは少なくとも以下に分類される:
  - PII（個人情報）
  - Billing（請求/決済関連）
  - Logs（運用ログ）
  - Audit（監査イベント）

### Retention is explicit

- retention は “暗黙の無期限” にしない。
- category ごとの retention 期間は設定として明示される（JSONまたは環境設定）。
- deletion（論理削除/物理削除）の方針は category ごとに固定する。

### Encryption

- PII / Billing は at rest で暗号化される。
- secrets（鍵・トークン）は永続化しない（必要なら専用 secret store を使う）。

## Required config (Recommended minimum)

- Logs:
  - 低 retention（短期）＋ redaction
- Audit:
  - 長 retention（要件に応じて）＋改ざん耐性（少なくとも append-only 前提）
- Billing:
  - 監査と整合する retention と restore 方針

## Non-goals

- 法域ごとの完全対応（必要になった時点で別仕様として拡張する）。
- 具体DB製品の固定。

## Failure modes

- 無期限保持で漏洩時の被害が最大化する。
- audit が短期で消えて説明不能になる。
- secrets がDBに混入して横展開事故になる。

## Related Specifications

- domain/observability.md
- rules/pii_redaction_contract.md
- rules/audit_log_contract.md
- domain/deletion_propagation_contract.md
- domain/data_tenant_safety.md
- domain/disaster_recovery.md
- domain/data_residency.md
- domain/global_defaults.md
