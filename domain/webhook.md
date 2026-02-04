# Webhook Security & Idempotency

## Goal

- 決済・外部連携の webhook を安全に受け付ける。
- 署名検証・リプレイ防止・重複配信を仕様として固定し、実装差分を防ぐ。

## Scope

- inbound webhooks（external -> adapter or gateway -> adapter）
- signature verification
- replay protection（timestamp/nonce）
- idempotency for delivery duplication
- observability / audit coupling

## Invariants (Must Not Break)

### Signature verification

- webhook は必ず署名検証する。
- 未署名、検証失敗は 401/403 で拒否する（詳細は返さない）。

### Replay protection

- timestamp を検証し、許容ウィンドウ外は拒否する。
- nonce（または event_id）により再送（replay）を検知できる。

### Idempotency

- provider の event_id（または同等）で重複配信を抑止する。
- 重複は “同一結果の再生” として扱い、副作用を二重実行しない。

### Observability / Audit

- webhook による external_effect は audit と整合する（必要なら audit event を生成）。

## Required rules

- 署名検証・リプレイ防止の最低要件は `rules/webhook_signature_contract.md` を正とする。

## Failure modes

- 署名未検証で外部から状態変更される。
- replay で二重処理が発生する。
- webhook の処理結果が監査と整合しない。

## Related Specifications

- domain/billing.md
- domain/idempotency.md
- rules/webhook_signature_contract.md
- rules/audit_log_contract.md
