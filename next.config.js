const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  reactStrictMode: true,
  output: "standalone",
  onDemandEntries: {
    maxInactiveAge: 30 * 1000,
    pagesBufferLength: 2,
  },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json",
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@tabler/icons-react'],
  },
  transpilePackages: ['handsontable', '@handsontable/react'],
  compress: true,
};

module.exports = nextConfig;
