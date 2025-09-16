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
      // Node.js polyfills for your dependencies
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
    global: 'globalThis',
    'process.env': 'process.env'
  },
  optimizeDeps: {
    include: [
      // Core React
      'react',
      'react-dom',
      // Firebase
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/analytics',
      // Heavy dependencies
      'crypto-browserify',
      '@material-ui/core',
      '@material-ui/icons',
      'devextreme',
      'devextreme-react',
      'recharts',
      'react-big-calendar',
      'react-csv',
      'react-datepicker',
      'react-color',
      'react-select',
      'react-toastify',
      'react-map-gl',
      'mapbox-gl',
      // Utilities
      'lodash',
      'moment',
      'axios',
      'bootstrap',
      'reactstrap',
      'smoothscroll-polyfill'
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
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'material-ui': ['@material-ui/core', '@material-ui/icons'],
          'devextreme': ['devextreme', 'devextreme-react'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'charts': ['recharts', 'react-big-calendar'],
          'vendor': ['lodash', 'moment', 'axios']
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`
      }
    }
  }
})