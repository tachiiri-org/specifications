# Rule: Idempotency End-to-End

## Goal

- ブラウザ起点の操作（特に state-changing 操作）に対して、二重送信・再試行・ネットワーク断を安全に扱えること。
- retry / replay / conflict の挙動が、コンポーネント境界を越えて一貫すること。
- 「どこで必須か」を境界仕様（JSON）として固定し、突然の 400 を発生させない。

## Rule (Must)

- `x-idempotency-key` は **ブラウザ → BFF → gateway → adapter** まで透過できなければならない。
- state-changing operation（create / charge / provision 等）では、`x-idempotency-key` が必須。
- idempotency の **最終責任（owner）は adapter** とする。
- retry は idempotency-key がある場合のみ許可する。

## Boundary requirement (Must)

### Browser → BFF (browser_to_bff)

- browser 起点の state-changing（POST/PUT/PATCH/DELETE）は、BFF 境界で **idempotency-key 必須** として扱う。
- これを **boundary JSON の具体値として明示**する（MD のみでの宣言は禁止）。
  - missing の場合:
    - reject
    - status: 400
    - error_code: "idempotency_key_required"

### BFF → Gateway (bff_to_gateway)

- BFF は inbound で受け取った `x-idempotency-key` を gateway に透過する。
- BFF 自身では idempotency を完結させない（validate-only または非保持）。
- retry を行う場合は「key 必須 + 保守的な retry 対象」に固定する。

### Gateway → Adapter (gateway_to_adapter)

- gateway は idempotency-key を adapter に透過する。
- retry は idempotency-key が存在する場合のみ許可する。

### Adapter

- adapter は idempotency-key + fingerprint により一意性を担保する。
- duplicate:
  - 成功後 → stored response replay
  - inflight → wait or 202 を返す

## Rationale

- BFF や gateway で retry を行うと、下流の副作用が重複するリスクがある。
- adapter が最終的な副作用（外部 API / storage / provision）を持つため、そこで一意性を担保するのが最も安全。
- ブラウザで生成された key を end-to-end で使うことで、「ユーザー操作単位」での再送抑止が可能になる。
- 必須性を browser 境界で明示しないと、後から BFF→gateway の要件変更で突然 400 が発生しうる。

## Applies to

- cors_allowed_headers（`x-idempotency-key`）
- header_to_allow_inbound / outbound
- http_idempotency
- http_retry
- idempotency\_\*（fingerprint / storage / replay / conflict）

## Non-goals

- GET や read-only 操作の完全な重複排除。
- ユーザー操作以外（内部定期処理など）への強制適用。

## Failure modes

- front / BFF で `x-idempotency-key` を落とし、下流で二重実行が起きる。
- retry が key 無しで実行され、外部 API への重複リクエストが発生する。
- fingerprint 定義が不十分で、異なる操作が同一 key として扱われる。
- browser 境界で必須性が宣言されず、後から突然 400 が増える。

## Change checklist

- 新しい state-changing endpoint / 操作を追加したか
  - browser→BFF で key 必須として扱われているか（boundary JSON）
  - adapter 側 require_key / fingerprint に含まれているか
- header allowlist / CORS に `x-idempotency-key` が含まれているか
- retry 設定が idempotency 前提になっているか
