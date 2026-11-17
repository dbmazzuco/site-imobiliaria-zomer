import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Dados do site da Zomer: relidos no máximo 1h depois da última leitura (em
    // segundo plano, na próxima visita). Se a releitura falhar, a última versão
    // boa continua no ar por até 30 dias, em vez de a vitrine sumir.
    zomer: {
      stale: 300, // 5 min no navegador
      revalidate: 60 * 60, // 1h
      expire: 60 * 60 * 24 * 30, // 30 dias
    },
  },
  images: {
    // Fotos servidas direto do sistema da Zomer (AgiWeb). Sem otimização da Vercel
    // para não gastar a cota de transformações de imagem do plano gratuito.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
