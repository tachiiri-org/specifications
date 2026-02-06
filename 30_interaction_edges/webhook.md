# Webhook Security & Idempotency

## Goal

- 決済・外部連携の webhook を安全に受け付ける。
- 署名検証・リプレイ防止・重複配信を仕様として固定し、実装差分を防ぐ。

## Scope

- inbound webhooks（external -> adapter または gateway -> adapter）
- signature verification
- replay protection（timestamp/nonce）
- idempotency for delivery duplication
- observability / audit coupling

## Invariants (Must Not Break)

### Signature verification

- webhook は必ず署名検証する。
- 未署名、検証失敗は reject（詳細は返さない）。
- 返す status / error shape は境界の機械契約（schema/lint/contract）に従う（固定値を本仕様で持たない）。

### Replay protection

- timestamp を検証し、許容ウィンドウ外は reject する。
- nonce（または provider event_id）により再送（replay）を検知できる。

### Idempotency

- provider の event_id（または同等）で重複配信を抑止する。
- 重複は “同一結果の再生” として扱い、副作用を二重実行しない（20_operational_semantics/idempotency.md）。

### Observability / Audit

- webhook による external_effect は audit と整合する（必要なら audit event を生成）。
- provider event_id と internal correlation_id（または request_id）を相関できること。

## Required rules

- 署名検証・リプレイ防止の最低要件は L1（各ツール仕様定義） を正とする。

## Failure modes

- 署名未検証で外部から状態変更される。
- replay で二重処理が発生する。
- webhook の処理結果が監査と整合しない。

## Related Specifications

- 20_operational_semantics/billing.md
- 20_operational_semantics/idempotency.md
