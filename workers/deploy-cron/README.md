# deploy-cron

`.github/workflows/deploy.yml` を毎時23分に `workflow_dispatch` で起動する Cloudflare Worker。

GitHub Actions の `schedule` は混雑時に間引かれ、毎時設定でも1日4〜6回しか発火しない
（2026-08-26 以降。cron の分をずらしても改善しなかった）。外部フィード（note / Zenn / podcast 等）を
取り込むための定期ビルドを確実に回すため、起動だけを Cloudflare の Cron Trigger に移した。

## デプロイ

```sh
cd workers/deploy-cron
npm install
npx wrangler secret put GITHUB_TOKEN   # kentaro.github.io の Actions: Read and write を持つ fine-grained PAT
npx wrangler deploy
```

## 動作確認

```sh
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=23+*+*+*+*"
gh run list -R kentaro/kentaro.github.io --event workflow_dispatch --limit 3
```
