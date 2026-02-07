# Idempotency Semantics & Responsibility

## Goal

- 副作用を伴う操作を「再送・重複・障害復旧」に対して安全にする。
- idempotency を HTTP の再送制御ではなく **意味論**として固定し、境界の責務を割らない。
- interactive（browser起点）/ automation（service起点）/ ops（運用起点）いずれの起点でも一貫する語彙にする。

## Design Principles

- idempotency は **意味論の問題**であり、HTTP の再送制御ではない。
- 副作用を持つ最終地点が idempotency の owner になる。
- 上流は「検証・透過」に徹し、**完結させない**。

## Definitions (Normative Vocabulary)

### Idempotency key

- 同一の「意味的操作（semantic action）」を表現するキー。
- key は起点（originator）が生成し、adapter まで end-to-end に透過される。

### Originator (Key generator)

- 同一操作に対し、同一 key を発行する責任主体。
- 起点種別（例）:
  - interactive originator（browser / UI起点）
  - automation originator（scheduled job / remediation など service起点）
  - ops originator（運用ツール起点）
- 具体の識別や伝播方法（ヘッダ名/claim名等）は L1 (tool-spec repos) を正とする。

## Invariants (Must Not Break)

### Ownership (Must)

- idempotency の最終責任（owner）は **adapter** とする。
- BFF / gateway は idempotency を「完結」させてはならない。

### End-to-End Semantic Identity (Must)

- 同一の semantic action は end-to-end で **同一の idempotency key** で表現される。
- key の生成主体は originator であり、browser に限定しない。
- 上流は key の存在と形式を検証し、下流へ透過する。

### Scope of Uniqueness (Normative)

idempotency の一意性は **key だけ**ではなく、少なくとも以下の組で保証される:

- service (or adapter identifier)
- operation_key
- contract_version
- tenant_id
- actor_id
- normalized input fingerprint
- idempotency_key

> 異なる service / contract-version 間で同一 idempotency_key が衝突してはならない。

### Retry Safety (Must)

- retry は idempotency-key が存在する場合のみ許可される。
- idempotency を完結させない境界での retry は、**validate-only**（存在検証・透過・観測）に限定する。
- external_effect / irreversible に対し、key 無し retry を許可してはならない。

### Replay Semantics (Must)

- 成功済み操作への再送（duplicate）は **stored response replay** として扱う。
- replay のレスポンスは以下を満たす:
  - HTTP status とレスポンス body（business payload）は **初回成功時と同一**でなければならない。
  - `x-idempotency-key` はレスポンスに付与してよい（任意。付与する場合は全境界で一貫させる）。
  - `x-request-id` は **各リクエストで新規生成**されうる（観測のため）。
    - ただし observability には必ず idempotency-key を記録する。

- inflight な操作への再送は:
  - 同一 key であることを確認した上で
    - wait（推奨）または
    - “processing” を表すレスポンス（例: 202）を返してよい
  - いずれの場合も副作用の二重実行を起こしてはならない。

### Retention tiers (Recommended baseline)

- idempotency 記録（key→結果）は TTL を持つ（具体値は L1 (tool-spec repos)/環境）。
- default: 24h 以上（推奨）
- billing-grade / irreversible:
  - days〜weeks オーダー（推奨）
  - TTL 短縮は明示的に宣言されなければならない

## Boundary Responsibilities (Conceptual)

### Originator → BFF (interactive/automation/ops)

- originator は idempotency-key を生成する主体である。
- 同一の semantic action に対して同じ key を使う責任を持つ。

### BFF

- key の存在・形式を検証し、下流へ透過する。
- retry / 再送を許可する場合でも、意味的な一意性を保持しない。

### Gateway

- key を透過する。
- routing / retry による副作用重複を防ぐため、必ず key 前提で動作する。

### Adapter

- idempotency を完結させる唯一のコンポーネント。
- key + fingerprint により、一意性・衝突・再生を判断する。

## Machine-enforced contracts (Moved out of this file)

- 具体のヘッダ名・境界JSONキー・lint項目など、machine-checkable な契約は L1 (tool-spec repos) に置く。
- 本ファイルは「意味論（owner/uniqueness/replay/originator）」を正とし、機械契約は参照で統一する。

## Non-goals

- read-only 操作の完全な重複排除。
- すべての内部処理への一律強制（ただし external_effect/irreversible では key 必須を崩さない）。
- 利用者に idempotency の存在を意識させること。

## Failure modes

- 上流で idempotency を完結させ、副作用が分裂する。
- retry が key 無しで実行され、二重実行が起きる。
- fingerprint が弱く、異なる操作が同一扱いされる。
- replay の返し方が実装ごとに違い、クライアントが壊れる。
- TTL が短く、同一操作が時間差で二重実行される。

## Related Specifications

- interaction_edges/http.md
- operational_semantics/limits.md
- constitution/operation.md
- constitution/observability.md
