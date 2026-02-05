# Rule: Runtime Config Loading & Enforcement Contract

## Goal

- lint に合格した仕様(JSON)が、runtime で “実際に強制される” ことを保証する。
- 「lint は通るが実装が無視する」ドリフトを防ぐ。

## Applies

- 各コンポーネント（bff/gateway/adapter）の起動・設定ロード
- def/boundary\_\*.json
- rules/\* catalog
- npm で配布される spec package

## Rule (Must)

### 1) Deterministic loading

- runtime は spec を以下のいずれかの方法で決定的にロードする：
  - npm package の特定バージョン
  - 署名付きアセット（内容ハッシュで pin）
- “ディレクトリ探索” による暗黙ロードは禁止（repo_layout の方針と整合）。

### 2) Fail-closed defaults for security invariants

- 以下の不変条件を満たせない場合、runtime は fail-closed を基本とする：
  - token verification（auth.token_profile）
  - headers pipeline/order と allowlist
  - contract-version requirement（internal）
  - error algorithm / error shape
  - cookie emitter / cookie propagation 禁止

### 3) Runtime validation (Minimum)

- 起動時に以下を最低限検証する（lint と同等の “必須項目欠落” を拒否）：
  - boundary JSON の required keys
  - referenced catalog/schema path の存在
  - preserve list と mapping の整合

### 4) Observability

- ロードした spec の識別子を観測できる形で残す：
  - spec package version
  - effective_from
  - content hash（任意）

## Failure modes

- 実装が一部ルールを無視し、環境差で事故る。
- ロードが非決定で “本番だけ違う” が起きる。
- セキュリティ系の欠落を warn で流し、重大事故になる。
