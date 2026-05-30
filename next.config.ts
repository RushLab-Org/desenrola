import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // ADR-022 Marco 4: aceitar uploads de print/áudio em Server Actions.
    // Áudio WhatsApp 3min ≈ 1-3 MB; base64 adiciona ~33%. 10MB cobre com folga.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
