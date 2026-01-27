/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    // TODO: Consider enabling modularizeImports for material when https://github.com/mui/material-ui/issues/36218 is resolved
    // '@mui/material': {
    //   transform: '@mui/material/{{member}}',
    // },
  },
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  distDir: "build",
  output: "standalone",

  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@tabler/icons-react'],
    // Use SWC for faster compilation
    swcMinify: true,
  },

  // Webpack optimizations - Only add what's necessary, performance tweaks are redundant with Turbopack
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
