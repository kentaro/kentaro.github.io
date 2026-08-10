# E2E 検証ログ

検証日: 2026-08-10 / 環境: macOS, Node v25.2.1, wrangler v4（`npm run dev` によるローカル実行、`http://127.0.0.1:8787/mcp`）

## 1. MCP プロトコルレベル（curl / Streamable HTTP）

### initialize

```
$ curl -s -X POST http://127.0.0.1:8787/mcp \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2026-07-28","capabilities":{},"clientInfo":{"name":"curl-test","version":"1.0.0"}}}'

data: {"result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true}},
"serverInfo":{"name":"kentarokuribayashi-com","version":"1.0.0"}, ...}
```

### tools/list

7ツールが公開されていることを確認:

```
get_page, get_profile, list_blog_posts, list_journal_entries,
list_podcast_episodes, list_works, search_site
```

### tools/call（全ツール）

| 呼び出し | 結果 |
|---|---|
| `search_site {query: "Elixir", limit: 3}` | プロフィール等がヒット、スニペット・スコア付きで返却 |
| `get_profile {}` | プロフィール全文（経歴・研究業績）を返却 |
| `get_page {path: "/profile"}` | 該当ページ本文を返却 |
| `list_blog_posts {year: 2025, limit: 3}` | 2025年の記事1件を返却 |
| `list_journal_entries {year: 2026, month: 8, limit: 3}` | 2026年8月の日記3件（8/9, 8/8, …）を返却 |
| `list_podcast_episodes {limit: 3}` | 「情報科学のまわり道」最新3エピソードを返却 |
| `list_works {category: "slide", limit: 3}` | スライド3件を返却 |
| `get_page {path: "/nonexistent"}` | `isError: true` + 案内メッセージ（エラーハンドリング確認） |

## 2. 実 MCP クライアント（Claude Code）からの E2E

```
$ claude -p "Connect to the kentarosite MCP server. First call the
  list_podcast_episodes tool with limit 3, then call search_site with query
  Nostr and limit 3. Report the raw titles you got from each tool." \
  --mcp-config '{"mcpServers":{"kentarosite":{"type":"http","url":"http://127.0.0.1:8787/mcp"}}}' \
  --strict-mcp-config \
  --allowedTools "mcp__kentarosite__list_podcast_episodes,mcp__kentarosite__search_site"
```

出力（抜粋）:

> 両ツールとも接続・実行に成功しました。
>
> `list_podcast_episodes` (limit 3) — ポッドキャスト名: 情報科学のまわり道
> 1. #44 ポッドキャスト再開と「本当のこと」をめぐって
> 2. #43 あいかわらずOpenClawで遊んでる
> 3. #42 この頃のAIエージェントの使い方（OpenClaw、Claude Code）
>
> `search_site` (query: Nostr, limit 3) — ヒット総数 1 件
> 1. 2026年8月3日 — /journal/2026/08/2026年8月3日（スニペットに「ElixirとNostrで、
>    インターネットから見えない分散SNS「Engawa」を作りました」を含む）

## 3. サイト側 WebMCP（`src/lib/webmcp.ts`）

`navigator.modelContext` はChrome 146+ の実験実装のため、スタブハーネス（Node上で
`navigator.modelContext.registerTool` をスタブし、実データ `search-data.json` で実行）
により機能検証:

```
registered tools: search_site, get_profile, get_page, open_page
search_site total: 3
first hit: 2025年、AI前提のホームページ作り直し―ObsidianをヘッドレスCMSとした静的サイト（全文検索つき） /blog/...
get_profile title: プロフィール
idempotent registration: OK
ALL WEBMCP HARNESS CHECKS PASSED
```

あわせて `next dev` でトップページが正常描画されること（API未実装ブラウザで
no-op になること）を確認。

## 4. 本番デプロイ後の検証（2026-08-10）

### リモートMCPサーバ（Cloudflare Workers）

- `npx wrangler deploy` で workers.dev にデプロイ後、ゾーンルート
  `kentarokuribayashi.com/mcp` / `kentarokuribayashi.com/mcp/*` を有効化
- ルート伝播完了後、`https://kentarokuribayashi.com/mcp` への initialize /
  tools/call を12連続で送信し全て 200 を確認。サイト本体（`/` 等）への影響なし
- 実MCPクライアント（Claude Code）から本番URLに接続し、`get_profile` と
  `search_site`（query: 奄美）の実行に成功

### サイト側 WebMCP（ブラウザ実機）

Chrome 151（`--enable-experimental-web-platform-features` +
WebMCP features 有効）+ puppeteer-core で https://kentarokuribayashi.com を開き:

```
API check: {"navigatorModelContext":true,"documentModelContext":true,
            "modelContextTesting":true,"chromeVersion":"151.0.0.0"}
listTools(): get_page, get_profile, open_page, search_site の4ツールを確認
executeTool("search_site", {query:"Elixir", limit:2}):
  「『プログラミングElixir 第2版』を読んでいまこそElixirに入門しよう」等
  2件をスコア・スニペット付きで返却
```

通常の Chrome（フラグ無効）では API が存在せず no-op となることも確認済み。
なお手元の Chrome で試す場合は `chrome://flags/#enable-webmcp-testing` を
Enabled にして再起動する。
