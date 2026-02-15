# Mini Survey

シンプルな簡易アンケート作成・配信ツール

## 機能

- Survey作成（最大5問）
- 質問タイプ: 単一選択 / 複数選択 / 自由記述
- 公開リンクで配信
- 回答データをCSVダウンロード

## セットアップ

### 1. Supabaseプロジェクト作成

[Supabase](https://supabase.com) でプロジェクトを作成し、SQL Editorで `setup_supabase.sql` を実行

### 2. 環境変数設定

```bash
cp .env.example .env
```

`.env` にSupabaseの認証情報を設定:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

### 3. 起動

```bash
pnpm install
pnpm dev
```

## 使い方

| URL | 説明 |
|-----|------|
| `/` | 管理画面（Survey一覧） |
| `/create` | Survey新規作成 |
| `/edit/:id` | Survey編集 |
| `/s/:id` | 公開回答フォーム |

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL)
