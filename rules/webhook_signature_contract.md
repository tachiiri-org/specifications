# Rule: Webhook Signature & Replay Protection (Minimum Contract)

## Goal

- webhook の未署名/改ざん/リプレイを防ぎ、実装差分をなくす。

## Rule (Must)

### Signature verification

- 署名ヘッダ（provider固有）を必須とし、欠落は reject。
- 署名検証は constant-time compare を使用する。
- 検証失敗は 401 または 403（どちらかに固定し、providerごとに揺らさない）。

### Timestamp window

- timestamp を検証し、許容ウィンドウ外は reject。
- 許容ウィンドウ（秒）は設定として明示する（環境依存で暗黙にしない）。

### Replay detection

- provider の event_id / nonce を保存し、重複を検知する。
- 重複は replay（同一結果の再生）として扱い、副作用を二重実行しない。

## Failure modes

- webhook を偽装され状態が改ざんされる。
- replay で二重処理が発生する。
