# Rule: AuthZ Policy Must Come From Operation Catalog

## Goal

- 認可ポリシー（必要 scope/role）を operation 単位で固定し、
  境界実装差分・分散定義によるドリフトを防ぐ。

## Rule (Must)

- adapter（PDP）は、認可判断の根拠を `rules/operation_catalog.json` の operation.authz から取得する。
- gateway/BFF は、認可ポリシーを独自定義して「最終判断」を完結させてはならない。
  - 早期拒否を行う場合でも、判断根拠のソースは operation catalog でなければならない。

## AuthZ decision contract (Must)

- deny は常に:
  - status: 403
  - error_code: "forbidden"
- 403 は preserve list に含まれ、error mapping で変換されない。

## Failure modes

- 認可ルールが複数箇所で別定義になり、環境差・経路差で挙動が割れる。
- gateway が「判断を完結」させ、adapter の意味論と乖離する。
- operation 追加時に policy 未定義で default allow になり、重大事故につながる。
