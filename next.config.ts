/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Configuración moderna para ignorar errores en el despliegue */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;