# Rule: Cookie Emitters

## Goal

- セッション/CSRF cookie の発行点を単一化し、責任境界を壊さない。
- cookie の下流伝播や意図しない set-cookie の混入を防ぐ。

## Rule (Must)

- セッション cookie（`__Host-session`）と CSRF cookie（`__Host-csrf`）を **発行できるのは BFF のみ**。
- front / gateway / adapter は `set-cookie` を **生成しない**。必要なら **明示的に drop** する。
- gateway / adapter へ cookie を **伝播しない**（リクエスト・レスポンスともに）。

## Rationale

- cookie はブラウザ境界で完結させるべきで、下流に流すと監査や事故調査が困難になる。
- BFF 以外が cookie を触れると、「どこで付与/更新されたか」が不明になり、セキュリティと運用性が同時に落ちる。

## Applies to

- header allow/drop（front/bff/gateway/adapter）
- cookie_set_rules
- http_auth（cookie許可区間）
- observability（cookie/set-cookie の redaction/drop）

## Expected enforcement (How)

- BFF:
  - cookie を発行してよい（`set-cookie` を outbound で許可）
- front:
  - `set-cookie` を outbound allowlist から外す
  - 可能なら outbound drop に `set-cookie` を追加し強制する
- gateway / adapter:
  - inbound で `cookie` を drop（すでに drop リストに含める）
  - outbound で `set-cookie` を drop（必要なら追加）

## Failure modes

- front が `set-cookie` を透過してしまい、cookie emitter 境界が崩れる。
- gateway/adapter が cookie を受け取り、ログやキャッシュや再試行で意図せず漏洩・再利用される。
- 複数箇所で cookie を更新し、セッション不整合（突然ログアウト等）が発生する。

## Change checklist

- front の outbound allowlist に `set-cookie` が含まれていないか
- front の outbound drop に `set-cookie` を入れるべき変更ではないか
- gateway/adapter の inbound drop に `cookie` が含まれているか
- observability の redaction/drop に cookie / set-cookie が含まれているか
