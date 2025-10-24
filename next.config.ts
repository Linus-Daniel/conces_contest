import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "storage.googleapis.com",
      "images.unsplash.com",
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
    ],
    // Enable optimized images
    formats: ['image/webp', 'image/avif'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  // Compress responses
  compress: true,
  // Generate standalone output for better deployment
  output: 'standalone',
  // Enable SWC minification
  swcMinify: true,
  // Configure headers for better caching
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        // Cache API responses appropriately
        source: '/api/projects',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=120, stale-while-revalidate=600'
          }
        ]
      },
      {
        // Don't cache SSE endpoints
        source: '/api/vote/stream',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
