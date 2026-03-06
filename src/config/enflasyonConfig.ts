const isProduction = process.env.NODE_ENV === 'production';

export const ENFLASYON_BASE_URL = isProduction
    ? "https://enflasyon.fas-audit.com.tr"
    : "https://localhost:44375";
