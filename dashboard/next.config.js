/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/dashboard/whatsapp', destination: '/whatsapp' },
      { source: '/dashboard/inbox', destination: '/inbox' },
      { source: '/dashboard/knowledge', destination: '/knowledge' },
      { source: '/dashboard/ai-config', destination: '/ai-config' },
      { source: '/dashboard/conversations', destination: '/conversations' },
      { source: '/dashboard/pipeline', destination: '/pipeline' },
      { source: '/dashboard/analytics', destination: '/analytics' },
    ]
  },
  images: {
    domains: ['localhost', 'ui-avatars.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
