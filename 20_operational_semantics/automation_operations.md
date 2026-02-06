# Automation Operations (Operational Semantics)

## Goal

- automation の暴走、誤作動、責任主体の曖昧化を運用意味論で止める。

## Scope

- scheduled jobs / remediation
- approval boundary（operation単位）
- idempotency/audit の結合

## Invariants (Must Not Break)

### Idempotency owner (Must)

- automation の idempotency key は executor（service actor）が生成・所有する。
- human initiator（存在する場合）は idempotency owner にならない。

### Approval boundary (Must)

- human approval が必要な operation は operation 単位で明示する。
- approval が必要な operation は、approval 無しの実行を deny（fail-closed）するのがデフォルト。

### Audit coupling (Must)

- automation が irreversible/external_effect を実行する場合、audit を必須とする。
- audit は “automation 実行” と “起点（human/automation/system）” を区別して相関できなければならない。

## Failure modes

- automation が human と同等権限で暴走する。
- approval が暗黙化して抜け道ができる。
- 監査が欠落し説明不能になる。
