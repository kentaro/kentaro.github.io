import * as fs from 'fs';
import * as path from 'path';
import { fetchPodcastFeed } from '../lib/podcast';

async function main() {
  console.log('Generating podcast data...');

  try {
    const rssUrl = 'https://anchor.fm/s/6877a570/podcast/rss';
    const podcastData = await fetchPodcastFeed(rssUrl);

    // データをpublicディレクトリに保存
    const outputDir = path.join(process.cwd(), 'public', 'data');
    const outputFile = path.join(outputDir, 'podcast.json');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSONファイルとして保存
    fs.writeFileSync(outputFile, JSON.stringify(podcastData, null, 2));

    console.log(`Generated podcast data with ${podcastData.episodes.length} episodes`);
    console.log(`Output: ${outputFile}`);
  } catch (error) {
    console.error('Error generating podcast data:', error);
    process.exit(1);
  }
}

main();
