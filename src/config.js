/**
 * Конфигурация для разных окружений
 */

// Определяем текущую среду выполнения
const isProduction = import.meta.env.PROD;
const hostname = window.location.hostname;

// Определяем тип окружения
const isGitHubPages = hostname.includes('github.io');
const isRender = hostname.includes('onrender.com');
const isLocal = !isProduction || hostname === 'localhost' || hostname === '127.0.0.1';

// Название вашего приложения на Render и GitHub
// Эти значения заменяются скриптом setup-env.js
const RENDER_APP_NAME = 'animelove-api';
const GITHUB_USERNAME = 'your-github-username';
const REPO_NAME = 'animelove';  // Имя репозитория для GitHub Pages

// Настройки для API и базовых URL
let API_URL, BASE_PATH, AUTH_REDIRECT_URL;

if (isGitHubPages) {
  // На GitHub Pages - API находится на Render
  API_URL = `https://${RENDER_APP_NAME}.onrender.com`;
  BASE_PATH = `/${REPO_NAME}/`;
  AUTH_REDIRECT_URL = `${API_URL}/auth/callback`;
} else if (isRender) {
  // На Render всё находится на одном домене
  API_URL = '';  // пустая строка = относительные URL на том же домене
  BASE_PATH = '/';
  AUTH_REDIRECT_URL = '/auth/callback';
} else {
  // Локальная разработка
  API_URL = 'http://localhost:3000';
  BASE_PATH = '/';
  AUTH_REDIRECT_URL = `${API_URL}/auth/callback`;
}

// Конфигурация для Shikimori OAuth
// ВАЖНО: ID и URI должны точно соответствовать настройкам в Shikimori
const SHIKIMORI_CONFIG = {
  CLIENT_ID: 'XpCddxtIwd3GA26uhftF-EFxEaSXG-bsUosO9ll65mQ',
  REDIRECT_URI: AUTH_REDIRECT_URL
};

// Подробное логирование конфигурации
console.log('=== Shikimori OAuth Config ===');
console.log('CLIENT_ID:', SHIKIMORI_CONFIG.CLIENT_ID);
console.log('REDIRECT_URI:', SHIKIMORI_CONFIG.REDIRECT_URI);
console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('Platform:', isGitHubPages ? 'GitHub Pages' : (isRender ? 'Render' : 'Local'));

// ВАЖНО: Предупреждение, если конфигурация отличается от регистрации в Shikimori
console.log('\n⚠️ ВАЖНО: REDIRECT_URI в Shikimori приложении должен быть настроен как:');
console.log(SHIKIMORI_CONFIG.REDIRECT_URI);
console.log('Проверьте настройки на https://shikimori.one/oauth/applications\n');

export default {
  isProduction,
  isGitHubPages,
  isRender,
  isLocal,
  API_URL,
  BASE_PATH,
  SHIKIMORI_CONFIG,
  GITHUB_PAGES_URL: `https://${GITHUB_USERNAME}.github.io/${REPO_NAME}`,
  RENDER_APP_URL: `https://${RENDER_APP_NAME}.onrender.com`
};
