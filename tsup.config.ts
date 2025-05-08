import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/react/index.tsx',
        'src/server/index.ts',
        'src/server/utils/roles.ts',
        'src/vue/index.ts',
    ],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: [
        'react',
        'react-dom',
        'next',
        'vue',
        'framer-motion',
        'qrcode.react'
    ],
    sourcemap: true,
});