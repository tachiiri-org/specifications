# Rule: Rate Limit / Quota (429) Semantics & Ownership

## Goal

- 429 を「どこで」「何を単位に」発生させるかを固定し、境界の増加や運用変更でドリフトしないようにする。
- 429 が error mapping により 502 等へ変換され、原因不明になる事故を防ぐ。
- ヘッダに依存しない（信頼境界を破らない）レート制御キーを使う。

## Rule (Must)

### Status contract

- Rate limit / quota 超過は必ず:
  - HTTP status: 429
  - error_code: "rate_limited"
- 429 は preserve list に含まれていなければならない（正規化で別ステータスへ変換しない）。

### Ownership

- browser -> bff:
  - 入口保護として BFF が 429 を生成してよい（owner=bff）。
  - キーは header ではなく runtime 情報（例: client_ip）を用いる。
- internal（bff->gateway, gateway->adapter）:
  - 429 は gateway または adapter が生成してよい（owner=gateway|adapter）。
  - tenant/actor/operation 等の claims / route に基づく制御を基本とする。

### Deterministic algorithm

- 429 を生成する場合、アルゴリズムは必ず boundary JSON の limits.rate_limit に明示する。
- algorithm は token_bucket を基本とし、capacity/refill を明示する。
- retry-after は秒で明示し、実装はそれに従う。

## Failure modes

- 429 が 502 に化け、原因不明の障害に見える。
- rate limit のキーがヘッダ由来になり、偽装可能になる。
- boundary ごとに単位（tenant/actor/operation）がズレて、運用の解釈が崩れる。
