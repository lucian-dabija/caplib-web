import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/react/index.ts',
        'src/server/index.ts',
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