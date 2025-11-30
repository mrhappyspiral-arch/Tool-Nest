/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
}

module.exports = nextConfig


