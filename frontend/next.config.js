/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    env: {
        NEXT_PUBLIC_KRATOS_PUBLIC_URL: process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || 'http://localhost:4433',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
}

module.exports = nextConfig
