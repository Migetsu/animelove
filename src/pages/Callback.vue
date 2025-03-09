<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import config from "@/config.js";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const statusMessage = ref("Авторизация...");
const diagnosticInfo = ref(null);

onMounted(async () => {
  try {
    // Собираем диагностическую информацию для отладки
    diagnosticInfo.value = {
      url: window.location.href,
      params: route.query,
      time: new Date().toString(),
      environment: {
        isProduction: config.isProduction,
        isGitHubPages: config.isGitHubPages,
        isRender: config.isRender,
        isLocal: config.isLocal,
        apiUrl: config.API_URL,
        basePath: config.BASE_PATH,
        ghPagesUrl: config.GITHUB_PAGES_URL,
        renderAppUrl: config.RENDER_APP_URL
      }
    };
    
    // Проверяем наличие токена в URL (для GitHub Pages -> Render поток)
    if (route.query.token) {
      statusMessage.value = "Токен получен, сохранение...";
      
      localStorage.setItem("shikimori_token", route.query.token);
      
      if (route.query.refresh) {
        localStorage.setItem("shikimori_refresh_token", route.query.refresh);
      }
      
      if (route.query.expires_in) {
        localStorage.setItem("shikimori_token_expires_at", 
          new Date().getTime() + (parseInt(route.query.expires_in) * 1000));
      }
      
      statusMessage.value = "Авторизация успешна, перенаправление...";
      setTimeout(() => router.push("/profile"), 1000);
      return;
    }
    
    // Проверяем параметры URL
    const code = route.query.code;
    const routeError = route.query.error;
    
    if (routeError) {
      throw new Error(`Ошибка авторизации: ${routeError}. ${route.query.message || ''}`);
    }
    
    if (!code) {
      throw new Error("OAuth2 код не найден в URL.");
    }
    
    statusMessage.value = "Обмен кода на токен...";
    
    // Определяем куда отправлять запрос в зависимости от окружения
    // Для GitHub Pages перенаправляем на Render для обработки
    if (config.isGitHubPages) {
      const redirectUrl = `${config.API_URL}/auth/process?code=${code}&redirect=${encodeURIComponent(window.location.origin + window.location.pathname + '#/profile')}`;
      statusMessage.value = "Перенаправление на Render для обработки...";
      console.log("Перенаправление на:", redirectUrl);
      window.location.href = redirectUrl;
      return;
    }
    
    // Для Render используем относительные пути
    const tokenUrl = config.isRender 
      ? '/api/auth/callback'  // Относительный путь на том же домене
      : `${config.API_URL}/api/auth/callback`; // Полный путь для локальной разработки
    
    try {
      statusMessage.value = `Запрос к API на ${tokenUrl}...`;
      console.log("Отправка запроса на:", tokenUrl);
      console.log("С параметрами:", { code });
      
      const response = await axios.post(tokenUrl, { code });
      
      if (!response.data || !response.data.access_token) {
        console.error("Ошибка: ответ сервера не содержит токен", response);
        throw new Error("Сервер вернул ответ без токена. Проверьте логи сервера.");
      }
      
      // Сохранение токенов
      localStorage.setItem("shikimori_token", response.data.access_token);
      
      if (response.data.refresh_token) {
        localStorage.setItem("shikimori_refresh_token", response.data.refresh_token);
      }
      
      if (response.data.expires_in) {
        localStorage.setItem("shikimori_token_expires_at", 
          new Date().getTime() + (response.data.expires_in * 1000));
      }
      
      statusMessage.value = "Авторизация успешна, перенаправление...";
      setTimeout(() => router.push("/profile"), 1000);
    } catch (apiError) {
      console.error("API Error:", apiError);
      
      // Детальная информация об ошибке
      const errorDetails = {
        message: apiError.message,
        response: apiError.response ? {
          status: apiError.response.status,
          statusText: apiError.response.statusText,
          data: apiError.response.data
        } : null,
        request: apiError.request ? "Запрос был отправлен, но ответ не получен" : null,
      };
      
      diagnosticInfo.value.apiError = errorDetails;
      throw new Error(`Ошибка API: ${apiError.message}. ${apiError.response?.data?.error || ''}`);
    }
  } catch (err) {
    console.error("Ошибка авторизации:", err);
    statusMessage.value = "Ошибка авторизации";
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="auth-callback">
    <div class="container">
      <div class="auth-callback__content">
        <h1>{{ statusMessage }}</h1>
        <div v-if="loading" class="auth-callback__loader"></div>
        <div v-if="error" class="auth-callback__error">
          <p>{{ error }}</p>
          <div v-if="diagnosticInfo" class="auth-callback__diagnostic">
            <h3>Диагностическая информация:</h3>
            <pre>{{ JSON.stringify(diagnosticInfo, null, 2) }}</pre>
          </div>
          <button @click="$router.push('/')" class="auth-callback__button">
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-callback {
  margin-top: 100px;
  text-align: center;
  color: white;
}

.auth-callback__content {
  padding: 40px;
  border-radius: 8px;
  background-color: #1c1c1c;
}

.auth-callback__loader {
  margin: 20px auto;
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #5e35b1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-callback__error {
  margin-top: 20px;
  color: #ff5252;
}

.auth-callback__diagnostic {
  margin-top: 20px;
  background-color: #272727;
  padding: 15px;
  border-radius: 5px;
  text-align: left;
  overflow-x: auto;
}

.auth-callback__button {
  margin-top: 20px;
  background-color: #5e35b1;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>