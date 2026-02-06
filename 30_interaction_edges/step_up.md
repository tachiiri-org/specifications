# Step-up Authentication (Interaction Edge)

## Goal

- step-up を境界で扱うとき、UI分岐やclaims混入によるドリフトを防ぐ。

## Scope

- session/verified context としての step-up
- internal boundary での参照原則
- エラーの意味（値や具体コードはL1）

## Invariants (Must Not Break)

- step-up の結果は claims ではなく verified context（session等）として扱う。
- internal boundary へは注入せず、確立済み状態として参照する。
- assurance 不足は 403 に正規化しない（再認証/step-up へ誘導する）。
