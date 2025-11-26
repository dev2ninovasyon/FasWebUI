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
    ignoreDuringBuilds: true,
  },
  distDir: "build",
  output: "standalone",
};

module.exports = nextConfig;
