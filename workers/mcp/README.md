# kentarokuribayashi.com MCP Server

kentarokuribayashi.com のコンテンツを AI エージェントから利用できるようにする、Cloudflare Workers 上のリモート MCP サーバ。

- 本番エンドポイント: `https://site.kentarokuribayashi.com/mcp`（Streamable HTTP、stateless。`https://kentarokuribayashi.com/mcp` でも接続可）
- 実装: [Agents SDK](https://developers.cloudflare.com/agents/) の `createMcpHandler` + MCP TypeScript SDK v2（MCP spec 2026-07-28 / 2025-11-25 の両クライアントに対応）
- データソース: サイトのビルド時に生成される静的 JSON（`search-data.json` / `data/podcast.json` / `works/feed-data.json`）を本番サイトから取得し、15分キャッシュ。Worker 側に独自の状態は持たない

## 公開ツール

| ツール | 説明 |
|---|---|
| `get_profile` | プロフィール全文（経歴・研究業績・著作等） |
| `search_site` | サイト全文検索（`query`, `section`: all/blog/journal, `limit`） |
| `get_page` | パス指定でページ本文を取得（`path`） |
| `list_blog_posts` | ブログ記事一覧（`year`, `limit`） |
| `list_journal_entries` | 日記一覧（`year`, `month`, `limit`） |
| `list_podcast_episodes` | ポッドキャストエピソード一覧（`limit`） |
| `list_works` | 外部発信（note・技術ブログ・スライド・動画・音楽）一覧（`category`, `limit`) |
| `get_journal_by_date` | 日付指定で日記を取得（`date`: YYYY-MM-DD） |
| `on_this_day` | 歴代の「この日」の日記を全年横断で取得（`month`, `day`。省略時はJSTの今日） |
| `random_page` | ランダムに1ページ取得（`section`） |
| `get_recent_updates` | ブログ・日記・ポッドキャスト・works横断の最新更新（`limit`） |
| `search_podcast` | ポッドキャストのタイトル・説明を全文検索（`query`, `limit`） |
| `site_stats` | サイト統計（セクション別件数・期間・エピソード数・worksカテゴリ別件数） |

## ローカル開発

```sh
cd workers/mcp
npm install
npm run dev   # http://localhost:8787/mcp
```

MCP クライアントからの接続例（Claude Code）:

```sh
claude mcp add --transport http kentarosite http://localhost:8787/mcp
```

検証手順と実際のログは [VERIFICATION.md](./VERIFICATION.md) を参照。

## デプロイ

[DEPLOY.md](./DEPLOY.md) を参照。**本番デプロイはサイトオーナーの確認後に手動で行う。**
