/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // 静的HTMLとして出力
  images: {
    unoptimized: true,  // GitHub Pagesで必要
  },
  trailingSlash: false,  // URLの末尾のスラッシュを削除
  distDir: 'build',     // 出力ディレクトリ
};

module.exports = nextConfig; 