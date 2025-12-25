/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development with dynamic routes
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // For Electron app, we need to disable some webpack features
  // Commented out for Vercel deployment
  /*
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  */
  // Output standalone for Docker deployment
  output: 'standalone',
}

module.exports = nextConfig