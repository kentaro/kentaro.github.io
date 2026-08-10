# 本番反映手順

⚠️ この手順はサイトオーナー（栗林）の確認のうえ、手動で実行する。CI からの自動デプロイは行っていない。

## 前提

- Cloudflare アカウント（kentarokuribayashi.com のゾーンを管理しているもの）
- `wrangler` がログイン済みであること（`npx wrangler login` または `CLOUDFLARE_API_TOKEN`）

## 1. Workers へのデプロイ（workers.dev で動作確認）

```sh
cd workers/mcp
npm install
npx wrangler deploy
```

`https://kentarokuribayashi-com-mcp.<account>.workers.dev/mcp` が MCP エンドポイントになる。まずこの URL で動作確認するのが安全（ゾーン設定に一切触れない）。

動作確認:

```sh
curl -s -X POST https://kentarokuribayashi-com-mcp.<account>.workers.dev/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"1.0.0"}}}'
```

## 2. 本番 URL（現在の構成）

以下の2つが有効になっている（`wrangler.jsonc` の `routes` に対応）:

- **`https://site.kentarokuribayashi.com/mcp`** — Workers カスタムドメイン（正式なエンドポイント）
- `https://kentarokuribayashi.com/mcp` — ゾーンルート（`/mcp` と `/mcp/*` のみ Worker へ。サイト本体の他のパスには影響しない）

## 3. クライアント設定例

```sh
# Claude Code
claude mcp add --transport http kentarosite https://site.kentarokuribayashi.com/mcp
```

Claude Desktop など Streamable HTTP 直接対応のないクライアントは `mcp-remote` プロキシ経由:

```json
{
  "mcpServers": {
    "kentarosite": {
      "command": "npx",
      "args": ["mcp-remote", "https://site.kentarokuribayashi.com/mcp"]
    }
  }
}
```

## 運用メモ

- コンテンツはサイトの静的 JSON を都度取得（15分メモリキャッシュ + Cloudflare CDN キャッシュ）なので、サイトを再ビルドすれば MCP 側も最大15分遅れで追従する。Worker の再デプロイは不要
- `search-data.json` は約9MBで、コールドスタート時のフェッチ＋パースにやや CPU を使う。Workers 無料プランの CPU 制限（10ms/リクエスト）に当たる場合は、有料プラン（Standard）にするか、ビルド時に軽量インデックスを生成する方式に切り替える
- 認証なしの読み取り専用サーバ（公開データのみを返す）なので、公開しても情報露出の増加はない

## サイト側の WebMCP（参考）

`src/lib/webmcp.ts` はブラウザ標準の WebMCP（`navigator.modelContext` / `document.modelContext`、Chrome 146+ で実験実装）向けのツール登録で、GitHub Pages のデプロイ（通常のサイトビルド）だけで有効になる。Cloudflare 側の設定変更は不要。API 未実装のブラウザでは何もしない。
