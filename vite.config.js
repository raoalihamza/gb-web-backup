import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Add this to handle absolute imports from src
      'src': resolve(__dirname, 'src'),
      'services': resolve(__dirname, 'src/services'),
      'shared': resolve(__dirname, 'src/shared'),
      'hooks': resolve(__dirname, 'src/hooks'),
      'containers': resolve(__dirname, 'src/containers'),
      'components': resolve(__dirname, 'src/components'),
      'screens': resolve(__dirname, 'src/screens'),
      'utils': resolve(__dirname, 'src/utils'),
      'assets': resolve(__dirname, 'src/assets'),
      'constants': resolve(__dirname, 'src/constants'),
      'atomicComponents': resolve(__dirname, 'src/atomicComponents'),
      // Node.js polyfills
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      process: 'process/browser',
      buffer: 'buffer'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'crypto-browserify',
      '@material-ui/core',
      '@material-ui/icons',
      'recharts',
      'lodash',
      'moment',
      'axios',
      'bootstrap',
      'reactstrap',
      'smoothscroll-polyfill',
      'jquery',
      'popper.js'
    ],
    exclude: [
      'devextreme',
      'devextreme-react'
    ],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ],
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    commonjsOptions: {
      include: [/devextreme/, /node_modules/]
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api", "import", "global-builtin", "color-functions"],
        charset: false // This fixes the charset conflict
      }
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove();
              }
            }
          }
        }
      ]
    }
  }
})