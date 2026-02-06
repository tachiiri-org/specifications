# Cost, Abuse & Resource Exhaustion Protection

## Goal

- 悪用・暴走・想定外利用によるコスト爆発を防ぐ。
- 可用性と請求責任を両立させる。

## Scope

- quota / budget
- abuse detection
- graceful degradation

## Definitions

- **Quota**
  - tenant / actor / operation 単位の上限。

- **Budget**
  - 金額・リソース消費の上限。

## Invariants (Must Not Break)

### Deterministic enforcement

- 制限は runtime input（claims / operation）に基づく。
- ヘッダやクライアント指定を信頼しない。

### Semantic errors

- 制限超過は 429 または domain-specific error として返す。
- 502 等へ正規化してはならない。

### Audit and observability

- 制限発動は観測可能である。
- billing / quota は監査と相関可能である。

## Failure modes

- 悪用で請求が跳ねる
- 制限が曖昧で運用判断が割れる
- サイレントに機能停止する

## Related Specifications

- 20_operational_semantics/limits.md
