/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['copyrights-islands-express-man.trycloudflare.com'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    CONVEX_URL: process.env.CONVEX_URL,
  },
  allowedDevOrigins: ['172.17.252.94'],
}

export default nextConfig
