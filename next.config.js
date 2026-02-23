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
      '@handsontable/react',
      'exceljs',
      'xlsx',
      '@react-pdf/renderer',
      'apexcharts',
      'react-apexcharts',
      'lexical',
      '@lexical/react',
      '@lexical/rich-text',
      '@lexical/list',
      '@lexical/code',
      '@lexical/history',
      '@lexical/utils',
      '@lexical/plain-text',
      '@lexical/markdown',
      '@lexical/html',
      '@lexical/link',
      '@lexical/selection'
    ],
  },
};

module.exports = nextConfig;
