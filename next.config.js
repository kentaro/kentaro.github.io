/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // 静的HTMLとして出力
  images: {
    unoptimized: true,  // GitHub Pagesで必要
  },
  trailingSlash: true,  // 各ページに末尾のスラッシュを追加
  distDir: 'build',     // 出力ディレクトリ
};

module.exports = nextConfig; 