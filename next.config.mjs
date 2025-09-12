/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivar headers de seguridad en desarrollo
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
          }
        ],
      },
    ];
  },
};

export default nextConfig;