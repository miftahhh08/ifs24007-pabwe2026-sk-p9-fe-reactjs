import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function inlineMainCss() {
  return {
    name: 'inline-main-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      if (!bundle) return html
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const linkRe = new RegExp(`<link[^>]+href="[^"]*/${escaped}"[^>]*>`)
          if (linkRe.test(html)) {
            html = html.replace(linkRe, () => `<style>${chunk.source}</style>`)
            delete bundle[fileName]
          }
        }
      }
      return html
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  // Alamat backend untuk build produksi (kosong = pakai proxy /api saat dev)
  define: { __API_BASE__: JSON.stringify(env.VITE_API_BASE_URL || '') },
  resolve:
    mode === 'test'
      ? {}
      : {
          alias: {
            'react-dom/test-utils': 'preact/test-utils',
            'react-dom/client': 'preact/compat/client',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime',
            react: 'preact/compat',
          },
        },
  plugins: [react(), tailwindcss(), inlineMainCss()],
  build: {
    target: 'esnext',
    sourcemap: true,
    modulePreload: { polyfill: false },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', 'src/**/*.test.{js,jsx}'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
}
})
