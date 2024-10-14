/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true,
    },
    env: {
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'replicate.delivery',
            port: '',
            pathname: '/pbxt/**',
          },
        ],
      }
  };
  
  export default nextConfig;