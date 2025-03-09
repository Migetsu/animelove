<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import config from "@/config.js";
import { isServerAvailable, isDualServerMode } from "@/utils/serverChecker";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const statusMessage = ref("Авторизация...");
const diagnosticInfo = ref(null);
const isServerDown = ref(false);
const isDualMode = ref(false);

onMounted(async () => {
  // Проверяем, запущен ли режим dual server
  isDualMode.value = isDualServerMode();
  
  if (import.meta.env.VITE_DUAL_SERVER === 'true') {
    window.localStorage.setItem('dualServerMode', 'true');
    isDualMode.value = true;
  }
  
  console.log('Режим двойного запуска:', isDualMode.value ? 'Включен' : 'Выключен');
  
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
        isDualServerMode: isDualMode.value,
        apiUrl: config.API_URL,
        basePath: config.BASE_PATH,
        ghPagesUrl: config.GITHUB_PAGES_URL,
        renderAppUrl: config.RENDER_APP_URL
      }
    };
    
    // В режиме локальной разработки проверяем доступность сервера
    if (config.isLocal) {
      statusMessage.value = "Проверка доступности сервера...";
      
      // Если запущен режим dual server, используем больше попыток и задержку
      const retries = isDualMode.value ? 5 : 3;
      const delay = isDualMode.value ? 3000 : 2000;
      
      // В режиме dual server добавляем дополнительную задержку
      if (isDualMode.value) {
        console.log('Запущен режим dual server, ожидаем запуск сервера...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const serverAvailable = await isServerAvailable(config.API_URL, retries, delay);
      
      if (!serverAvailable) {
        isServerDown.value = true;
        if (isDualMode.value) {
          throw new Error("Сервер не успел запуститься. Пожалуйста, подождите несколько секунд и обновите страницу.");
        } else {
          throw new Error("Локальный сервер недоступен. Пожалуйста, запустите команду: npm run server");
        }
      }
    }
    
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
      // Добавляем более подробную информацию об ошибке
      let errorMessage = `Ошибка авторизации: ${routeError}.`;
      
      if (routeError === 'timeout') {
        errorMessage = 'Превышено время ожидания ответа от Shikimori API. Сервер может быть перегружен или недоступен.';
      } else if (routeError === 'token_error') {
        errorMessage = 'Ошибка получения токена доступа. Проверьте настройки приложения.';
      }
      
      if (route.query.message) {
        errorMessage += ` ${route.query.message}`;
      }
      
      throw new Error(errorMessage);
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
    // ИЗМЕНЕНО: Всегда используем прокси для локальной разработки
    const tokenUrl = config.isLocal 
      ? '/api/auth/callback' // Используем прокси через Vite
      : (config.isRender 
          ? '/api/auth/callback' // Относительный путь на том же домене
          : `${config.API_URL}/api/auth/callback`); // Полный путь для других случаев
    
    try {
      statusMessage.value = `Запрос к API на ${tokenUrl}...`;
      console.log("Отправка запроса на:", tokenUrl);
      console.log("С параметрами:", { code });
      
      // Добавляем withCredentials для правильной обработки CORS
      const response = await axios.post(tokenUrl, { code }, { 
        timeout: 30000, // Увеличиваем таймаут до 30 секунд
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: false // Для работы с прокси
      });
      
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
      // Специальная обработка для прокси-ошибок
      console.error("API Error:", apiError);
      
      // Если основной запрос через прокси не сработал, пробуем прямой запрос к серверу
      if (config.isLocal && !apiError.response) {
        try {
          console.log("Пробуем прямой запрос в обход прокси...");
          const directUrl = `${config.DIRECT_SERVER_URL}/api/auth/callback`;
          console.log("Прямой URL:", directUrl);
          
          const directResponse = await axios.post(directUrl, { code }, { 
            timeout: 30000,
            headers: { 
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
          });
          
          if (directResponse.data && directResponse.data.access_token) {
            console.log("Прямой запрос успешен");
            
            // Сохранение токенов
            localStorage.setItem("shikimori_token", directResponse.data.access_token);
            
            if (directResponse.data.refresh_token) {
              localStorage.setItem("shikimori_refresh_token", directResponse.data.refresh_token);
            }
            
            if (directResponse.data.expires_in) {
              localStorage.setItem("shikimori_token_expires_at", 
                new Date().getTime() + (directResponse.data.expires_in * 1000));
            }
            
            statusMessage.value = "Авторизация успешна, перенаправление...";
            setTimeout(() => router.push("/profile"), 1000);
            return;
          }
        } catch (directError) {
          console.error("Прямой запрос также не удался:", directError);
        }
      }
      
      // Детальная информация об ошибке
      const errorDetails = {
        message: apiError.message,
        response: apiError.response ? {
          status: apiError.response.status,
          statusText: apiError.response.statusText,
          data: apiError.response.data,
          headers: apiError.response.headers
        } : null,
        request: apiError.request ? "Запрос был отправлен, но ответ не получен" : null,
        config: apiError.config ? {
          url: apiError.config.url,
          method: apiError.config.method,
          headers: apiError.config.headers,
          timeout: apiError.config.timeout
        } : null
      };
      
      diagnosticInfo.value.apiError = errorDetails;
      
      // Проверяем, не связана ли ошибка с отсутствием сервера
      if (!apiError.response && config.isLocal) {
        isServerDown.value = true;
        throw new Error(`Локальный сервер авторизации не запущен или недоступен. Запустите команду "npm run server" в терминале.`);
      }
      
      // Добавляем проверку на ошибку сети или таймаут
      if (apiError.code === 'ECONNABORTED') {
        throw new Error(`Тайм-аут при соединении с API. Сервер может быть перегружен. Попробуйте повторить позже.`);
      } else if (!apiError.response) {
        throw new Error(`Ошибка сети при соединении с API. Проверьте подключение к интернету.`);
      }
      
      throw new Error(`Ошибка API: ${apiError.message}. ${apiError.response?.data?.error || 'Проверьте настройки приложения'}`);
    }
  } catch (err) {
    console.error("Ошибка авторизации:", err);
    statusMessage.value = "Ошибка авторизации";
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function openTerminalWithCommand() {
  if (isDualMode.value) {
    alert('Сервер должен был запуститься автоматически. Пожалуйста, подождите несколько секунд и повторите попытку.');
  } else {
    alert('Пожалуйста, откройте терминал и выполните команду: npm run server');
  }
}
</script>

<template>
  <div class="auth-callback">
    <div class="container">
      <div class="auth-callback__content">
        <h1>{{ statusMessage }}</h1>
        <div v-if="loading" class="auth-callback__loader"></div>
        <div v-if="error" class="auth-callback__error">
          <p>{{ error }}</p>
          
          <div v-if="isServerDown" class="auth-callback__server-down">
            <h3>Сервер не запущен!</h3>
            <p>Для работы авторизации необходимо запустить сервер командой:</p>
            <pre>npm run server</pre>
            <button @click="openTerminalWithCommand" class="auth-callback__button auth-callback__button--primary">
              Показать инструкцию
            </button>
          </div>
          
          <div v-if="diagnosticInfo" class="auth-callback__diagnostic">
            <h3>Диагностическая информация:</h3>
            <pre>{{ JSON.stringify(diagnosticInfo, null, 2) }}</pre>
          </div>
          <div class="auth-callback__actions">
            <button @click="$router.push('/')" class="auth-callback__button">
              Вернуться на главную
            </button>
            <button @click="window.location.reload()" class="auth-callback__button auth-callback__button--secondary">
              Повторить попытку
            </button>
          </div>
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

.auth-callback__server-down {
  margin: 20px auto;
  padding: 15px;
  background-color: #3c1c1c;
  border-radius: 8px;
  text-align: left;
  max-width: 600px;
}

.auth-callback__server-down pre {
  background-color: #252525;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
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

.auth-callback__button--primary {
  background-color: #4caf50;
}

.auth-callback__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.auth-callback__button--secondary {
  background-color: #616161;
}

.auth-callback__button--secondary:hover {
  background-color: #757575;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>