# Rule: Audit Retention & Tamper-Resistance Baseline

## Goal

- external_effect/irreversible の説明責任を満たすために、監査データの保持と改ざん耐性を最低限固定する。
- Logs と Audit を混同して短期削除する事故を防ぐ。

## Applies

- domain/billing.md
- domain/data_persistence.md
- rules/audit_log_contract.md
- domain/authz_and_ops_scaling.md

## Rule (Must)

### 1) Retention separation

- Audit retention は Logs retention より短くしてはならない。
- Billing に関わる audit は、運用要件に応じた長期保持を前提とする（具体値は環境設定として明示）。

### 2) Append-only expectation (Minimum)

- Audit storage は append-only を前提とする。
- 変更/削除が必要な場合は “訂正イベント（correction）” として追記し、原本を書き換えない。

### 3) Required metadata

- Audit storage 設定は少なくとも以下を明示する:
  - retention_days（または同等）
  - deletion_mode（physical/logical/none）
  - tamper_resistance_mode（append_only 等）
  - backup_policy（enabled + 最低限の復旧期待）

### 4) PII/secret exclusion

- Audit には PII/secret を含めない（token化参照のみ）。
- redaction ルールは `rules/pii_redaction_contract.md` と整合する。

## Failure modes

- 監査が消えて返金/課金の説明不能になる。
- 書き換え可能な監査で、改ざん疑義を否定できない。
- 監査に機微情報が混入し重大事故になる。
