import type { NextConfig } from 'next';
import dotenvExpand from 'dotenv-expand';
import { loadEnv, defineConfig } from 'vite';
const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
        
      },
    ],
  },
export default defineConfig(({ mode }) => {
  // This check is important!
  if (mode === 'development') {
    const env = loadEnv(mode, process.cwd(), '');
    dotenvExpand.expand({ parsed: env });
  }

  return {
    ...
  };
});
};

export default nextConfig;
