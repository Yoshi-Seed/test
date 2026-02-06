# 卵巣がん患者向けWebスクリーニングシステム - セットアップガイド

## 🎉 完成しました！

卵巣がん体験者を対象としたWebインタビュースクリーニングシステムが完成しました。

## 📱 デモサイト

**今すぐアクセス**: https://8080-ib0e1hqr41o9784g8wb3g-ea026bf9.sandbox.novita.ai

## 📂 ファイル構成

```
screening/
├── index.html      # メインHTML（質問画面、スクリーンアウト、申込フォーム）
├── styles.css      # レスポンシブデザイン対応スタイルシート
├── script.js       # スクリーニングロジック
└── README.md       # 詳細ドキュメント
```

## ✨ 実装された機能

### 1. 7つの質問（Yes/No形式）
- Q1: 調査主体の確認（製薬会社・マスコミではない）
- Q2: 機密管理の確認
- Q3: 卵巣がん診断歴
- Q4: 診断時期（2015年以降）
- Q5: 現在の治療状況
- Q6: インタビュー参加意思
- Q7: 個人情報共有の同意

### 2. 自動判定ロジック
- ✅ すべて「はい」→ 申込フォームへ
- ❌ 1つでも「いいえ」→ スクリーンアウト

### 3. 申込フォーム
- お名前、メールアドレス、電話番号の入力
- 「申し込む」ボタンでメールアプリ起動
- 個人情報取り扱いの同意文言表示

### 4. デザイン特徴
- 🎨 医療調査に適した落ち着いたブルー系配色
- 📱 完全レスポンシブ（スマホ・タブレット・PC対応）
- 📊 プログレスバーで進捗表示
- ✨ スムーズなアニメーション
- 💙 配慮のある表現（評価的・否定的な言葉なし）

## 🚀 デプロイ方法

### オプション1: GitHub Pages（推奨）
```bash
# すでにリポジトリにプッシュ済み
# GitHubの Settings > Pages で有効化するだけ
```

### オプション2: Netlify
1. [Netlify](https://www.netlify.com/)にログイン
2. `screening`フォルダをドラッグ&ドロップ
3. 自動デプロイ完了

### オプション3: Vercel
```bash
npm i -g vercel
cd screening
vercel
```

### オプション4: Cloudflare Pages
1. [Cloudflare Pages](https://pages.cloudflare.com/)にログイン
2. GitHubリポジトリと連携
3. `screening`ディレクトリを指定

## ⚙️ カスタマイズ

### メールアドレスの変更
`script.js`の156行目を編集：
```javascript
const recipientEmail = 'interview@example.com'; // ← ここを変更
```

### 色の変更
`styles.css`の`:root`セクション：
```css
:root {
    --primary-color: #4a6fa5;      /* メインカラー */
    --success-color: #5a9e6f;      /* 成功時の色 */
    /* 他の色も変更可能 */
}
```

### 質問内容の変更
`script.js`の`questions`配列を編集

## 🧪 ローカルテスト

```bash
cd /home/user/webapp/screening

# Python 3の場合
python3 -m http.server 8080

# Node.jsの場合
npx http-server -p 8080
```

ブラウザで `http://localhost:8080` にアクセス

## 📊 Git & Pull Request

### コミット履歴
```bash
✅ feat(screening): add ovarian cancer interview web screening application
```

### Pull Request
**URL**: https://github.com/Yoshi-Seed/test/pull/2

**ブランチ**: `genspark_ai_developer` → `main`

## 🔧 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: Flexbox、グリッド、アニメーション、レスポンシブデザイン
- **Vanilla JavaScript**: ライブラリ不要、純粋なJavaScript
- **Progressive Enhancement**: 段階的機能向上

## 🌐 ブラウザサポート

| ブラウザ | バージョン |
|---------|----------|
| Chrome | 最新 ✅ |
| Firefox | 最新 ✅ |
| Safari | 最新 ✅ |
| Edge | 最新 ✅ |
| iOS Safari | 12+ ✅ |
| Android Chrome | 最新 ✅ |

## 🔒 プライバシー

- サーバー不要（クライアントサイドのみ）
- データ保存なし
- ユーザーのメールクライアントを使用
- HTTPS推奨

## 📝 メモ

1. **メールアドレスの設定を忘れずに**
   - `script.js`の`recipientEmail`を実際のアドレスに変更してください

2. **デプロイ前のチェック**
   - すべてのリンクが正しく動作するか確認
   - スマートフォンでの表示確認
   - メール送信のテスト

3. **本番環境推奨事項**
   - HTTPSを使用
   - Google Analytics等のアクセス解析を追加（必要に応じて）
   - エラートラッキング（Sentryなど）の導入検討

## 🎯 次のステップ

1. ✅ デモサイトで動作確認
2. ✅ Pull Requestをレビュー・マージ
3. ⏭️ メールアドレスをカスタマイズ
4. ⏭️ 本番環境にデプロイ
5. ⏭️ 実際の患者さんでテスト

---

**作成日**: 2025年2月6日  
**作成者**: GenSpark AI Developer  
**プロジェクト**: 卵巣がん体験者の会スマイリー
