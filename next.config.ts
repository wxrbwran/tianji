import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Optimize webpack cache to reduce serialization warnings
    config.cache = {
      type: 'filesystem',
      compression: 'gzip',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    };

    // Optimize module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Image optimization (works for both Vercel and Cloudflare)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;

// Only initialize Cloudflare adapter in development or when explicitly deploying to Cloudflare
// This prevents conflicts when deploying to Vercel
const isVercel = process.env.VERCEL === '1';
// const isCloudflarePages = process.env.CF_PAGES === '1';

// Initialize Cloudflare adapter for:
// 1. Local development (to test Cloudflare-specific features)
// 2. Cloudflare Pages deployment
// But NOT for Vercel deployment (to avoid EPIPE errors)
if (!isVercel || (process.env.NODE_ENV === 'development')) {
  initOpenNextCloudflareForDev();
}
