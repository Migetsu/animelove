import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd());
  
  return {
    // Базовый путь для сборки на GitHub Pages
    base: mode === 'production' ? '/animelove/' : '/',
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: true,
    },
    // Добавляем переменные окружения для клиента
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
    server: {
      port: 5173,
      strictPort: true,
      // Настраиваем прокси для локальной разработки, если нужно
      proxy: {
        // '/api': 'http://localhost:3000'
      }
    }
  }
});