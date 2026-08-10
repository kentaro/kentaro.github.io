# kentarokuribayashi.com MCP Server

kentarokuribayashi.com のコンテンツを AI エージェントから利用できるようにする、Cloudflare Workers 上のリモート MCP サーバ。

- エンドポイント: `/mcp`（Streamable HTTP、stateless）
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
