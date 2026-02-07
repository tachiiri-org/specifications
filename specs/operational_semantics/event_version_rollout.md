# Event Version Rollout & Compatibility Semantics

## Goal

- 非同期イベント/ジョブの進化を、producer / consumer の独立デプロイ下でも安全に行う。
- “なんとなく後方互換” を排除し、version 受理範囲と廃止期限を意味論として固定する。
- 本ファイルを event 互換性（accepted_versions / dual accept / sunset）の一次参照にする。

## Scope

- event / async job payloads
- producer / consumer version skew
- dual accept period
- deprecation & sunset

## Core Concepts

- **event_type**
  - 意味的に一貫したイベントの識別子
- **event_version**
  - event_type に対する schema version
- **accepted_versions**
  - consumer が受理する version の集合

## Invariants (Must Not Break)

### Explicit acceptance

- consumer は「どの version を受理するか」を明示する。
- 暗黙の “最新のみ受理” を前提にしない。

### Dual accept is bounded

- 複数 version を受理する期間（dual accept）は必ず期限を持つ。
- 期限なき dual accept は仕様違反とみなす。

### Breaking change isolation

- breaking change を含む変更は:
  - 新しい event_version
  - または新しい event_type
    のいずれかで表現する。

## Compatibility Semantics

### Breaking changes (not allowed as “compatible”)

以下は breaking change とみなされる:

- required field の追加
- field の削除
- field 型の変更
- enum の削除
- required context（tenant_id 等）の変更

### Compatible changes (allowed)

- optional field の追加
- enum 値の追加（unknown を安全に処理できる前提）

## Rollout Semantics

### Recommended ordering

1. consumer が新 version を受理できるようにする（dual accept）
2. producer が新 version を emit する
3. sunset 到来後、旧 version の受理を停止する

### Sunset

- sunset は以下いずれかで表現される:
  - 明示的な日付
  - 明示的な release identifier
- sunset 到達後の旧 version 受信は不正とみなされる。

## Observability

- event_type / event_version は常に観測可能である。
- compatibility 違反は retry ではなく契約違反として扱う。

## Failure Modes (What this spec prevents)

- producer 先行で consumer が落ちる。
- dual accept が無期限に残り運用負債になる。
- breaking change が互換変更として混入する。

## Related Specifications

- operational_semantics/async_jobs_events.md
