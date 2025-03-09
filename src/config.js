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
  // Локальная разработка - используем прокси через Vite
  API_URL = ''; // Используем относительные URL для работы через прокси
  BASE_PATH = '/';
  AUTH_REDIRECT_URL = '/auth/callback';
}

// Конфигурация для Shikimori OAuth
const SHIKIMORI_CONFIG = {
  CLIENT_ID: 'XpCddxtIwd3GA26uhftF-EFxEaSXG-bsUosO9ll65mQ',
  REDIRECT_URI: isLocal 
    ? "http://localhost:3000/auth/callback" // Для OAuth используем прямой URL сервера
    : AUTH_REDIRECT_URL
};

export default {
  isProduction,
  isGitHubPages,
  isRender,
  isLocal,
  API_URL,
  BASE_PATH,
  SHIKIMORI_CONFIG,
  GITHUB_PAGES_URL: `https://${GITHUB_USERNAME}.github.io/${REPO_NAME}`,
  RENDER_APP_URL: `https://${RENDER_APP_NAME}.onrender.com`,
  // Прямой URL сервера для особых случаев
  DIRECT_SERVER_URL: 'http://localhost:3000'
};
