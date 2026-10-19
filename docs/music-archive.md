# 音楽ページのデータ更新

`/music` は `public/data/media.json` の保存済み作品と、ビルド時に取得した RSS の新着を結合する。YouTube は音楽作品・演奏・音楽制作に関する動画、SoundCloud は公開トラック全件が対象。

YouTube の掲載対象は `src/lib/music-videos.json` の動画 ID で指定する。新しい音楽動画を公開したら、このリストに ID を追加して全件同期を実行する。一般の開発動画や音声日記が音楽ページに混ざらないよう、自動のキーワード判定は使わない。SoundCloud の新着は RSS から自動で追加する。

## 全件同期

ローカルに `yt-dlp` を用意して実行する。API キーは不要。

```sh
npx ts-node --project tsconfig.node.json src/scripts/sync-media.ts
npx ts-node --project tsconfig.node.json src/scripts/check-media.ts
```

同期は YouTube の通常動画・ライブ・Shorts と SoundCloud のトラックを最後まで取得する。件数と必須メタデータを検証してから保存し、取得失敗時には保存済みファイルを書き換えない。過去の掲載分も保持する。意図して掲載を取り下げる YouTube 動画は ID リストから削除する。

更新した ID リストと `public/data/media.json` を一緒にコミットする。RSS は直近の投稿しか返さないため、ビルド中に追加された新着を将来のビルドでも確実に保持するには、定期的に全件同期してスナップショットを更新する。CI のビルドには `yt-dlp` は不要。

## 検証済みの収録範囲

2026年10月19日の全件取得では YouTube に通常動画111件、ライブ13件、Shorts10件があり、音楽関連29件を選定した。SoundCloud は公開トラック33件を収録した。各作品は配信元の公開日時・説明・サムネイルを保持する。
