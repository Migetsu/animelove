<template>
  <button class="login-button" @click="login" :disabled="isLoading">
    <fa :icon="['fas', 'user']" class="login-button__icon" v-if="!isLoading" />
    <fa :icon="['fas', 'spinner']" class="login-button__icon fa-spin" v-else />
    <span v-if="!isLoading">Войти через Shikimori</span>
    <span v-else>{{ statusMessage }}</span>
  </button>
  <div v-if="error" class="login-error">
    <p>{{ error }}</p>
    <button v-if="showRetryButton" @click="login" class="login-retry-button">
      Попробовать снова
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import config from '@/config.js';

const isLoading = ref(false);
const statusMessage = ref('Подготовка...');
const error = ref(null);
const showRetryButton = ref(false);

async function login() {
  isLoading.value = true;
  error.value = null;
  showRetryButton.value = false;
  
  try {
    const CLIENT_ID = config.SHIKIMORI_CONFIG.CLIENT_ID;
    const REDIRECT_URI = config.SHIKIMORI_CONFIG.REDIRECT_URI;
    
    console.log('Окружение:', config.isGitHubPages ? 'GitHub Pages' : (config.isRender ? 'Render' : 'Локальная разработка'));
    console.log('API URL:', config.API_URL);
    console.log('REDIRECT URI:', REDIRECT_URI);
    
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
    // Для локальной разработки проверяем доступность локального сервера
    else if (config.isLocal) {
      statusMessage.value = 'Проверка доступности сервера...';
      
      try {
        // Сначала пробуем обычный CORS-запрос
        const response = await fetch(`${config.API_URL}/api/status`, { 
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Сервер авторизации вернул статус ${response.status}`);
        }
        
        console.log('Сервер отвечает через CORS');
      } catch (corsError) {
        console.warn('CORS ошибка, пробуем no-cors режим...', corsError);
        error.value = 'Сервер авторизации недоступен. Запустите команду "npm run server"';
        
        try {
          // Если CORS не работает, пробуем запрос без CORS
          await fetch(config.API_URL, { 
            mode: 'no-cors' 
          });
          
          console.log('Сервер доступен (без CORS)');
          error.value = null;
        } catch (fetchError) {
          console.error('Ошибка запроса:', fetchError);
          error.value = 'Сервер авторизации не запущен или недоступен. Запустите команду "npm run server"';
          throw new Error('Сервер авторизации не запущен или недоступен. Запустите команду "npm run server"');
        }
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
