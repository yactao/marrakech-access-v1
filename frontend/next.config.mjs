/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permet le build même avec des erreurs TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Permet le build même avec des erreurs ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
