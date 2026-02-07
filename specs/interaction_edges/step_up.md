# Step-up Authentication (Interaction Edge)

## Goal

- step-up を境界で扱うとき、UI分岐や claims 混入によるドリフトを防ぐ。
- “不足は再認証で解く” を contract として固定し、403（authz deny）へ誤正規化しない。

## Scope

- session/verified context としての step-up
- internal boundary での参照原則
- エラーの意味（値や具体コードは L1 (tool-spec repos)）

## Invariants (Must Not Break)

- step-up の結果は claims ではなく verified context（session 等）として扱う。
- internal boundary へ step-up 情報を注入しない（claims として増やさない）。
- assurance 不足は 403 に正規化しない（再認証/step-up へ誘導する）。

## Failure modes

- step-up が claims へ混入し、互換性（claims set）と監査が破綻する。
- assurance 不足が 403 扱いになり、UX と運用原因切り分けが崩れる。
