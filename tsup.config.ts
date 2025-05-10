import { defineConfig } from 'tsup';
import { copy } from 'fs-extra';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/react/index.tsx',
        'src/server/index.ts',
        'src/server/utils/roles.ts',
        'src/vue/index.ts',
    ],
    format: ['cjs', 'esm'],
    dts: {
        // Generate .d.ts files
        resolve: true, // Handle all dependencies and ensure proper type resolution
        entry: {
            index: 'src/index.ts',
            'react/index': 'src/react/index.tsx',
            'server/index': 'src/server/index.ts',
            'vue/index': 'src/vue/index.ts'
        }
    },
    clean: true,
    external: [
        'react',
        'react-dom',
        'next',
        'vue',
        'framer-motion',
        'qrcode.react',
        '@chakra-ui/react',
        '@chakra-ui/icons',
        '@emotion/react',
        '@emotion/styled'
    ],
    sourcemap: true,
    async onSuccess() {
        // Copy assets to dist folder
        try {
            await copy('src/react/assets', 'dist/react/assets');
            console.log('✓ Assets copied to dist/react/assets');
        } catch (err) {
            console.error('Failed to copy assets:', err);
        }
    }
});