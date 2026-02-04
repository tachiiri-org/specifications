# Rule: Contract Version Rollout (Dual Accept Window)

## Goal

- contract-version の段階ロールアウト（両対応期間）を安全に行う。
- 境界ごとの “受理バージョン” がドリフトして、環境差や順序差で壊れる事故を防ぐ。
- breaking_change と accepted の関係を機械的に一貫させる。

## Rule (Must)

### 1) Internal boundaries must be explicit

- internal boundary（bff_to_gateway, gateway_to_adapter）は:
  - http.contract_version.mode = required
  - http.contract_version.accepted を必ず定義する（explicit_list でよい）

### 2) Dual-accept is allowed only when not breaking

- accepted.mode=explicit_list の items が複数（例: ["1","2"]）のとき:
  - breaking_change は false でなければならない（互換期間を表すため）
- breaking_change = true のとき:
  - accepted.items は 1つのみ（単一バージョン）でなければならない

### 3) Deterministic ordering and uniqueness

- accepted.items は:
  - 重複禁止
  - 文字列として昇順ソート（例: ["1","2","3"]）
  - 空配列禁止

### 4) Header and allowlists must be coherent

- http.contract_version.header は "x-contract-version" を基本とする。
- internal boundaries では以下が満たされなければならない:
  - headers.requirements.inbound_must_include に "x-contract-version"
  - headers.requirements.outbound_must_include に "x-contract-version"
  - 各境界の allowlist に "x-contract-version" が含まれる（落とさない）

## Failure modes

- 先にデプロイされた層が新versionを送るが、下流が未対応で落ちる。
- 両対応期間なのに breaking_change=true で運用判断が誤る。
- items が未ソート/重複で、実装差分（最初一致など）が出る。
- ヘッダが allowlist から落ちて “突然 400” が出る。
