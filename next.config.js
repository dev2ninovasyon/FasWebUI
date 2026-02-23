/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    qualities: [25, 50, 75, 95, 100],
  },
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@tabler/icons-react": {
      transform: "@tabler/icons-react/dist/esm/icons/{{member}}",
    }
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/system',
      '@mui/lab',
      '@mui/x-date-pickers',
      '@mui/x-tree-view',
      'lodash',
      'date-fns',
      'handsontable',
      '@handsontable/react'
    ],
  },
};

module.exports = nextConfig;
