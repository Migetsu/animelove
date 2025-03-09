<template>
  <button class="login-button" @click="login" :disabled="isLoading">
    <fa :icon="['fas', 'user']" class="login-button__icon" v-if="!isLoading" />
    <fa :icon="['fas', 'spinner']" class="login-button__icon fa-spin" v-else />
    <span v-if="!isLoading">Войти через Shikimori</span>
    <span v-else>{{ statusMessage }}</span>
  </button>
  <div v-if="error" class="login-error">
    <p>{{ error }}</p>
    <div v-if="showServerTip" class="login-server-tip">
      <p>Сервер авторизации не запущен. Запустите его с помощью команды:</p>
      <pre>npm run server</pre>
      <button @click="retryWithServerStart" class="login-retry-button">
        Запустить сервер и повторить
      </button>
    </div>
    <button v-if="showRetryButton" @click="login" class="login-retry-button">
      Попробовать снова
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import config from '@/config.js';
import { isServerAvailable, openServerCommand, isDualServerMode } from '@/utils/serverChecker';

const isLoading = ref(false);
const statusMessage = ref('Подготовка...');
const error = ref(null);
const showRetryButton = ref(false);
const showServerTip = ref(false);
const isDualMode = ref(false);

// Проверяем режим запуска при монтировании компонента
onMounted(() => {
  isDualMode.value = isDualServerMode();
  
  // Если запущен режим dual server, устанавливаем соответствующий флаг в localStorage
  if (import.meta.env.VITE_DUAL_SERVER === 'true') {
    window.localStorage.setItem('dualServerMode', 'true');
    isDualMode.value = true;
  }
  
  console.log('Режим двойного запуска:', isDualMode.value ? 'Включен' : 'Выключен');
});

async function retryWithServerStart() {
  const { instructions } = openServerCommand();
  alert(`${instructions}\n\nПосле запуска сервера нажмите "Попробовать снова"`);
  showRetryButton.value = true;
}

async function login() {
  isLoading.value = true;
  error.value = null;
  showRetryButton.value = false;
  showServerTip.value = false;
  
  try {
    const CLIENT_ID = config.SHIKIMORI_CONFIG.CLIENT_ID;
    const REDIRECT_URI = config.SHIKIMORI_CONFIG.REDIRECT_URI;
    
    console.log('Окружение:', config.isGitHubPages ? 'GitHub Pages' : (config.isRender ? 'Render' : 'Локальная разработка'));
    console.log('API URL:', config.API_URL);
    console.log('REDIRECT URI:', REDIRECT_URI);
    
    // Для локальной разработки проверяем, доступен ли сервер
    if (config.isLocal) {
      statusMessage.value = 'Проверка доступности сервера...';
      
      // Если запущен режим dual server, добавляем задержку и больше попыток
      const retries = isDualMode.value ? 5 : 3;
      const delay = isDualMode.value ? 3000 : 2000;
      
      // Если режим dual server, даем серверу дополнительное время на запуск
      if (isDualMode.value) {
        console.log('Запущен режим dual server, ожидаем запуск сервера...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const serverAvailable = await isServerAvailable(config.API_URL, retries, delay);
      
      if (!serverAvailable) {
        // Особое сообщение для режима dual server
        if (isDualMode.value) {
          throw new Error('Сервер авторизации не успел запуститься. Пожалуйста, подождите несколько секунд и повторите попытку.');
        } else {
          throw new Error('Сервер авторизации не запущен. Запустите команду "npm run server" или "npm run dev:all"');
        }
      }
    }
    
    // Для GitHub Pages проверяем доступность Render API
    if (config.isGitHubPages) {
      statusMessage.value = 'Проверка доступности сервера...';
      
      try {
        // Тестовый запрос для проверки доступности API с увеличенным таймаутом
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${config.API_URL}/api/status`, { 
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Render API доступен:', data);
        } else {
          console.warn('Render API ответил с ошибкой:', response.status);
          throw new Error(`Сервер авторизации вернул ошибку: ${response.status}`);
        }
      } catch (error) {
        console.warn('Предупреждение: Render API не доступен:', error);
        
        // Продолжаем работу даже при недоступности API, но показываем предупреждение
        error.value = `Сервер авторизации может быть недоступен. Авторизация может не работать. (${error.message})`;
        showRetryButton.value = true;
        
        // Даем пользователю прочитать сообщение перед тем, как продолжить
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Если мы дошли сюда, можно перейти к авторизации
    statusMessage.value = 'Перенаправление на Shikimori...';
    
    // Проверяем наличие CLIENT_ID
    if (!CLIENT_ID) {
      throw new Error('CLIENT_ID не настроен. Обратитесь к администратору.');
    }
    
    const authUrl = `https://shikimori.one/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=user_rates+comments+topics`;
    
    console.log('Перенаправление на:', authUrl);
    window.location.href = authUrl;
  } catch (error) {
    console.error('Ошибка:', error);
    error.value = `Ошибка при авторизации: ${error.message}`;
    
    // Проверяем, связана ли ошибка с недоступностью сервера
    if (error.message.includes('не запущен') || error.message.includes('не успел')) {
      showServerTip.value = true;
    }
    
    showRetryButton.value = true;
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #5e35b1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #4527a0;
}

.login-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.login-button__icon {
  font-size: 16px;
}

.login-error {
  color: #ff5252;
  margin-top: 8px;
  font-size: 14px;
  max-width: 300px;
}

.login-server-tip {
  margin-top: 10px;
  padding: 10px;
  background-color: #353535;
  border-radius: 5px;
}

.login-server-tip pre {
  background-color: #252525;
  padding: 8px;
  border-radius: 4px;
  margin: 5px 0;
  overflow-x: auto;
}

.login-retry-button {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #616161;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.login-retry-button:hover {
  background-color: #757575;
}
</style>
