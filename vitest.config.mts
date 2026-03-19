import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            all: true,
            include: [
                'src/api/**/*.{ts,tsx}',
                'src/utils/**/*.{ts,tsx}',
                'src/store/**/*.{ts,tsx}',
                'src/components/**/*.{ts,tsx}',
                'src/app/**/components/**/*.{ts,tsx}',
                'src/app/auth/authForms/**/*.{ts,tsx}',
            ],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/__tests__/**',
                'src/test/**',
                'src/**/*.d.ts',
                'src/**/index.{ts,tsx}',
                'src/app/**/page.tsx',
                'src/app/**/page.ts',
                'src/app/**/layout.tsx',
                'src/app/**/loading.tsx',
                'src/app/**/error.tsx',
                'src/app/**/global-error.tsx',
                'src/app/**/not-found.tsx',
            ],
            reporter: ['text', 'json', 'html'],
        },
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
