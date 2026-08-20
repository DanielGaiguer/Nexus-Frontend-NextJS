import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Há um package-lock.json solto em C:\Users\gaigu (fora deste repo, de
  // outro projeto qualquer) que faz o Turbopack tentar inferir a raiz do
  // workspace ali em vez de aqui. Fixamos explicitamente.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
