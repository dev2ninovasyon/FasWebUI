const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  reactStrictMode: false,
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@tabler/icons-react'],
  },
};

module.exports = nextConfig;
