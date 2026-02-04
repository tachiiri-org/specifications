# Rule: Request-ID Requirement Semantics (Pre/Post Processing)

## Goal

- request-id 要件の解釈ズレにより、
  - browser で誤って必須扱いされる
  - lint と runtime の判断が食い違う
    といった事故を防ぐ。
- 「いつ存在すべきか」を機械的に区別できる形にする。

## Rule (Must)

### Requirement timing must be explicit

- request-id に関する requirement は、
  以下のいずれかとして明示されなければならない:
  - pre_processing
  - post_processing

### Browser entry boundary semantics

- browser → BFF 境界では:
  - request-id の pre_processing 要件を持ってはならない
  - post_processing でのみ「存在必須」を宣言できる

### Internal boundary semantics

- BFF → Gateway / Gateway → Adapter では:
  - pre_processing で request-id 必須
  - passthrough または overwrite は許可されるが、欠落は禁止

## Expected JSON shape (Guideline)

```json
{
  "observability": {
    "request_id": {
      "generate": true,
      "requirement_timing": "post_processing"
    }
  }
}
```

or

```json
{
  "observability": {
    "request_id": {
      "requirement_timing": "pre_processing"
    }
  }
}
```

## Applies to

- rules/request_id_policy.md
- boundary\_\* .observability.request_id
- header requirements validation

## Failure modes

- browser 由来リクエストが request-id 欠落で 400 になる
- lint と runtime の「必須判断」がズレる
- 複数層で生成・検査の責務が混在する

```

**効果**
- `headers.requirements` と `request-id` を混同しない
- lint が「pre か post か」を明示的に検査可能
```
