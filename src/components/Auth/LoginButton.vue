<template>
  <button class="login-button" @click="login" :disabled="isLoading">
    <fa :icon="['fas', 'user']" class="login-button__icon" v-if="!isLoading" />
    <fa :icon="['fas', 'spinner']" class="login-button__icon fa-spin" v-else />
    <span v-if="!isLoading">Войти через Shikimori</span>
    <span v-else>{{ statusMessage }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import config from '@/config.js';

const isLoading = ref(false);
const statusMessage = ref('Проверка сервера...');

async function login() {
  isLoading.value = true;
  
  try {
    const CLIENT_ID = config.SHIKIMORI_CONFIG.CLIENT_ID;
    const REDIRECT_URI = config.SHIKIMORI_CONFIG.REDIRECT_URI;
    
    console.log('Окружение:', config.isGitHubPages ? 'GitHub Pages' : (config.isRender ? 'Render' : 'Локальная разработка'));
    console.log('API URL:', config.API_URL);
    console.log('REDIRECT URI:', REDIRECT_URI);
    
    // Для GitHub Pages проверяем доступность Render API
    if (config.isGitHubPages) {
      statusMessage.value = 'Проверка доступности Render сервера...';
      
      try {
        // Тестовый запрос для проверки доступности API
        const response = await fetch(`${config.API_URL}/api/status`, { 
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Render API доступен:', data);
        } else {
          console.warn('Render API ответил с ошибкой:', response.status);
        }
      } catch (error) {
        console.warn('Предупреждение: Render API не доступен:', error);
        // Продолжаем работу даже при недоступности API
        // Соединение будет установлено при редиректе на Shikimori
      }
    }
    // Для локальной разработки проверяем доступность локального сервера
    else if (config.isLocal) {
      statusMessage.value = 'Проверка доступности сервера...';
      
      try {
        // Сначала пробуем обычный CORS-запрос
        await fetch(`${config.API_URL}/api/status`, { 
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        
        console.log('Сервер отвечает через CORS');
      } catch (corsError) {
        console.warn('CORS ошибка, пробуем no-cors режим...', corsError);
        
        try {
          // Если CORS не работает, пробуем запрос без CORS
          await fetch(config.API_URL, { 
            mode: 'no-cors' 
          });
          
          console.log('Сервер доступен (без CORS)');
        } catch (error) {
          throw new Error('Сервер авторизации не запущен или недоступен. Запустите команду "npm run server"');
        }
      }
    }
    
    // Если мы дошли сюда, можно перейти к авторизации
    statusMessage.value = 'Перенаправление на Shikimori...';
    const authUrl = `https://shikimori.one/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user_rates+comments+topics`;
    
    console.log('Перенаправление на:', authUrl);
    window.location.href = authUrl;
  } catch (error) {
    console.error('Ошибка:', error);
    alert(`Ошибка при авторизации: ${error.message}`);
  } finally {
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
</style>
