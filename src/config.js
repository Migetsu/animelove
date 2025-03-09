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
const RENDER_APP_NAME = 'animelove';
const GITHUB_USERNAME = 'migetsu';
const REPO_NAME = 'animelove';

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

// Конфигурация для Shikimori OAuth - убедимся, что Redirect URI корректно определен
const SHIKIMORI_CONFIG = {
  CLIENT_ID: 'XpCddxtIwd3GA26uhftF-EFxEaSXG-bsUosO9ll65mQ',
  REDIRECT_URI: AUTH_REDIRECT_URL
};

// Только минимальное логирование в продакшене
if (!isProduction) {
  console.log('=== Shikimori OAuth Config ===');
  console.log('CLIENT_ID:', SHIKIMORI_CONFIG.CLIENT_ID);
  console.log('REDIRECT_URI:', SHIKIMORI_CONFIG.REDIRECT_URI);
  console.log('Environment:', isProduction ? 'Production' : 'Development');
  console.log('Platform:', isGitHubPages ? 'GitHub Pages' : (isRender ? 'Render' : 'Local'));
}

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
