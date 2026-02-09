# Mini Survey Backend Implementation

このディレクトリに、ミニサーベイ向けのバックエンド実装（SQL設計・トランザクション処理・CSV整形）を追加しました。

## 追加内容

- `migrations/001_create_mini_survey_tables.sql`
  - 以下のテーブルを作成
    - `mini_survey`
    - `mini_survey_question`
    - `mini_survey_option`
    - `mini_survey_response`（`member_id`, `status`, `started_at`, `completed_at` を含む）
    - `mini_survey_answer`（`question_id`, `answer_value_json` を含む）
    - `mini_survey_response_snapshot`
  - スナップショット属性は最低限 `member_id/specialty/hospital_type/prefecture/years_in_practice` を保持。
  - `facility_size` は仕様会議での最終確定を前提に nullable で先行追加。

- `src/miniSurveyService.js`
  - 公開時通知: `publishMiniSurvey`
  - 回答完了トランザクション: `completeMiniSurveyResponse`
    - `point_ledger` に `reason = mini_survey_complete`, `survey_id` を記録
    - 100pt を即時付与
    - 同一トランザクションで回答完了通知を追加
  - CSVエクスポート整形: `buildMiniSurveyCsv`
    - 「1行=回答者×サーベイ（1人1回）」
    - 「列=属性スナップショット+各設問回答」

- `test/miniSurveyService.test.js`
  - トランザクション内で必要な SQL が発行されることを確認
  - CSV整形の列順・内容保証を確認

## 実行

```bash
npm test
```

（`test/panel` 配下で実行）
