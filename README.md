# Creative PM — 制作物管理アプリ（MVP）

社内マーケ部門の販促物（LP / サムネイル / リーフレット / 看板 / のぼり 等）を
**進行ステータスとタスク**で管理するためのアプリです。

将来的にデザイン作成を補助するツール（テンプレ自動生成、ブランド準拠チェック、
画像/コピー生成 AI など）を積み増せる構造を意識しています。

## MVP の機能

- **カンバンボード**（トップ）: ステータス別に制作物を一覧
  - 企画 / 制作中 / レビュー / 修正中 / 完成 / 公開中
  - 種別フィルタ + 全文検索
- **一覧（テーブル）ビュー**: ステータス・種別・期日で絞り込み
- **制作物の詳細**:
  - メタ情報（依頼者、制作担当、納期、サイズ、公開先 URL、タグ）
  - チェックリスト形式の **タスク管理**
  - **コメント／フィードバック** スレッド
  - ワンクリックでのステータス変更
- **CRUD**: 新規作成・編集・削除
- 空状態から **サンプルデータをワンクリック投入**

## 技術スタック

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Server Actions（API ルート不要のシンプル構成）

## Vercel にデプロイする

### 手順

1. **このリポジトリを Vercel にインポート**
   - [Vercel dashboard](https://vercel.com/new) で GitHub を連携
   - リポジトリ `taohshima/creative` を選び、ブランチ `claude/design-project-management-app-QcDQg` を指定

2. **Postgres を用意**
   - Vercel のプロジェクト → **Storage → Create Database → Neon** を選択
   - 自動で `DATABASE_URL` がプロジェクトの環境変数に設定される
   - 無料枠で十分動きます

3. **Deploy をクリック**
   - 初回ビルドで `prisma db push` が走り、テーブルが自動作成されます

4. **デプロイ完了後、トップページで「サンプルデータを投入」ボタンを押す**

### 必要な環境変数

| 名前 | 説明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 接続文字列。Vercel Postgres / Neon / Supabase いずれもOK |

## ローカル開発

```bash
# 1. .env を用意（DATABASE_URL を Postgres に向ける）
cp .env.example .env
# DATABASE_URL を編集（Neon 無料DBがおすすめ）

# 2. セットアップ
npm install
npm run setup   # prisma generate + db push + seed

# 3. 起動
npm run dev     # http://localhost:3000
```

## データモデル概要

- `Item` — 制作物本体。種別（`type`）でカテゴリ分け、`status` で進行管理
- `Task` — 制作物に紐づくチェックリスト項目
- `Comment` — 制作物に対するフィードバック

種別ごとの専用メタデータ（看板の設置場所、印刷物の入稿仕様 等）は
今は `notes` / `size` の自由記述で吸収し、必要に応じて専用カラムに昇格する想定。

## 将来の拡張ポイント

- ファイル添付・バージョン管理（S3互換ストレージ連携）
- 通知（Slack / メール）
- ブランド資産管理（ロゴ・カラー・フォント・コピー）← AI支援の土台
- AI支援
  - キャンペーンの「目的」から構成案・コピー案を生成
  - ブランドガイド準拠チェック（カラー / フォント / トーン）
  - LP のサムネイル自動生成
- 権限管理（依頼者・デザイナー・承認者）
