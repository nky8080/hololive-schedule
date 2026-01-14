import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pagesでリポジトリ名がパスに含まれる場合は以下を設定
  basePath: '/hololive-schedule',
  assetPrefix: '/hololive-schedule',
};

export default nextConfig;
