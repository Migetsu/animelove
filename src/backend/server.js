import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Получаем текущую директорию для правильной загрузки .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ищем .env файлы в разных местах
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '..', '.env')
];

// Пробуем загрузить .env из разных мест
let envFound = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Загружены переменные окружения из ${envPath}`);
    envFound = true;
    break;
  }
}

if (!envFound) {
  console.warn('⚠️ Файл .env не найден. Используются только переменные окружения системы.');
}

const app = express();

// Определяем режим работы
const isProd = process.env.NODE_ENV === 'production';
// Обновлено: используем системный PORT от Render или наш порт по умолчанию
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
const GITHUB_PAGES_URL = process.env.GITHUB_PAGES_URL;

// Проверяем наличие необходимых переменных
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn(`⚠️ Отсутствуют обязательные переменные окружения:
    CLIENT_ID: ${CLIENT_ID ? 'OK' : 'отсутствует'}
    CLIENT_SECRET: ${CLIENT_SECRET ? 'OK' : 'отсутствует'}`);
  console.warn('Выполните команду: npm run setup-env');
}

// Формируем redirect_uri в зависимости от окружения
// Обновлено: исправление для корректной работы на Render
const REDIRECT_URI = isProd 
  ? `${RENDER_URL || process.env.RENDER_EXTERNAL_URL || "https://animerealm-api.onrender.com"}/auth/callback`
  : "http://localhost:3000/auth/callback";

console.log(`Режим: ${isProd ? 'Продакшн' : 'Разработка'}`);
console.log(`REDIRECT_URI: ${REDIRECT_URI}`);
console.log(`Render URL: ${RENDER_URL || process.env.RENDER_EXTERNAL_URL || 'Не определен'}`);
console.log(`GitHub Pages URL: ${GITHUB_PAGES_URL || 'Не определен'}`);

// Добавляем подробное логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [REQUEST] ${req.method} ${req.url}`);
  console.log(`[HEADERS] Origin: ${req.headers.origin}`);
  next();
});

// Улучшенные настройки CORS для поддержки различных источников
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем все запросы без происхождения (полезно для некоторых инструментов)
    if (!origin) {
      callback(null, '*');
      return;
    }
    
    // Всегда разрешаем запросы с GitHub Pages, локальных хостов 
    if (origin.includes('github.io') || 
        origin.includes('localhost') || origin.includes('127.0.0.1') || 
        origin.includes('.onrender.com')) {
      console.log(`[CORS] Разрешен доступ для ${origin}`);
      callback(null, origin);
      return;
    }

    // В продакшне разрешаем все источники для простоты
    if (isProd) {
      console.log(`[CORS] Продакшн-режим, разрешен доступ для ${origin}`);
      callback(null, origin);
      return;
    }

    // Для других случаев проверяем источник
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];
    
    console.log(`[CORS] Запрос с origin: ${origin}`);
    
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      console.log(`[CORS] Разрешен доступ для ${origin}`);
      callback(null, origin);
    } else {
      console.log(`[CORS] Доступ разрешен с ограничениями для ${origin}`);
      callback(null, allowedOrigins[0]); 
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 часа
}));

// Явное добавление CORS заголовков для всех маршрутов
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Улучшенная обработка preflight запросов
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Обработка preflight запроса для ${req.url}`);
    return res.status(204).end();
  }
  
  next();
});

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Улучшенный маршрут для обработки перенаправления с GitHub Pages
app.get("/auth/process", async (req, res) => {
  try {
    console.log("=== GET /auth/process ВЫЗВАН ===");
    console.log("Query параметры:", req.query);
    
    const { code, redirect } = req.query;
    
    if (!code) {
      console.error("Код авторизации отсутствует");
      return res.redirect(`${redirect || `${GITHUB_PAGES_URL}/#/auth/callback`}?error=no_code`);
    }
    
    console.log("Код авторизации получен:", code);
    console.log("Redirect параметр:", redirect);
    
    try {
      // Обмениваем код на токен с детальным логированием
      console.log("Отправляем запрос на обмен кода на токен...");
      console.log("URL: https://shikimori.one/oauth/token");
      console.log("Параметры:", {
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET ? "***SECRET***" : "MISSING",
        code: code,
        redirect_uri: REDIRECT_URI,
      });
      
      // ИСПРАВЛЕНИЕ: Используем URL-encoded формат с повышенными таймаутами
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', CLIENT_ID);
      params.append('client_secret', CLIENT_SECRET);
      params.append('code', code);
      params.append('redirect_uri', REDIRECT_URI);
      
      const response = await axios.post("https://shikimori.one/oauth/token", params, {
        timeout: 30000, // Увеличиваем таймаут до 30 секунд
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'AnimeRealm/1.0 (https://github.com/Migetsu/animelove)'
        },
        maxRedirects: 5,
        validateStatus: status => status < 500 // Принимаем любой статус < 500
      });
      
      console.log("Токен успешно получен, данные ответа:");
      console.log("access_token:", response.data.access_token ? "получен" : "отсутствует");
      console.log("refresh_token:", response.data.refresh_token ? "получен" : "отсутствует");
      console.log("expires_in:", response.data.expires_in);
      
      // Проверяем, содержит ли redirect URL параметры запроса
      let finalRedirectUrl;
      const tokenParams = `token=${response.data.access_token}&refresh=${response.data.refresh_token}&expires_in=${response.data.expires_in}`;
      const redirectUrl = redirect || `${GITHUB_PAGES_URL}/#/auth/callback`;
      
      finalRedirectUrl = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}${tokenParams}`;
      
      console.log("Перенаправление на:", finalRedirectUrl);
      return res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error("Ошибка при обмене кода на токен:", error.response?.data || error.message);
      console.error("Запрос был отправлен на:", "https://shikimori.one/oauth/token");
      console.error("Статус:", error.response?.status);
      console.error("Заголовки ответа:", error.response?.headers);
      
      // Проверяем, не связана ли проблема с таймаутом или сетью
      if (error.code === 'ECONNABORTED' || !error.response) {
        return res.redirect(`${redirect || `${GITHUB_PAGES_URL}/#/auth/callback`}?error=timeout&message=${encodeURIComponent('Timeout connecting to Shikimori API')}`);
      }
      
      return res.redirect(`${redirect || `${GITHUB_PAGES_URL}/#/auth/callback`}?error=token_error&message=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    console.error("Ошибка в /auth/process:", error);
    res.status(500).send("Внутренняя ошибка сервера: " + error.message);
  }
});

// Стандартный маршрут callback для авторизации
app.get("/auth/callback", (req, res) => {
  try {
    console.log("=== GET /auth/callback ВЫЗВАН ===");
    console.log("Query параметры:", req.query);
    
    const code = req.query.code;
    
    if (!code) {
      console.error("Код авторизации отсутствует");
      return res.redirect(isProd 
        ? `${GITHUB_PAGES_URL}/#/auth/callback?error=no_code` 
        : 'http://localhost:5173/#/auth/callback?error=no_code');
    }
    
    console.log("Код авторизации получен:", code);
    
    // На Render направляем запрос на обработку внутренним API
    if (isProd) {
      // Добавляем encodeURIComponent для безопасного формирования URL
      const encodedGithubPagesUrl = encodeURIComponent(`${GITHUB_PAGES_URL}/#/auth/callback`);
      const redirectUrl = `/auth/process?code=${code}&redirect=${encodedGithubPagesUrl}`;
      console.log("Перенаправление на process:", redirectUrl);
      return res.redirect(redirectUrl);
    }
    
    // Для локальной разработки перенаправляем на клиент
    const localRedirectUrl = `http://localhost:5173/#/auth/callback?code=${code}`;
    console.log("Перенаправление на (локальный):", localRedirectUrl);
    return res.redirect(localRedirectUrl);
  } catch (error) {
    console.error("Ошибка в /auth/callback:", error);
    res.status(500).send("Внутренняя ошибка сервера: " + error.message);
  }
});

// API статуса сервера - расширяем для проверки работы CORS
app.get("/api/status", (req, res) => {
  console.log(`[API] Запрос статуса сервера от ${req.headers.origin || 'неизвестного источника'}`);
  
  res.json({ 
    status: "Server is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    render_url: RENDER_URL || process.env.RENDER_EXTERNAL_URL || 'Not set',
    github_pages_url: GITHUB_PAGES_URL || 'Not set',
    cors_origin: req.headers.origin || 'No origin header',
    request_details: {
      method: req.method,
      path: req.path,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
      }
    }
  });
});

// API для обмена кода на токен
app.post("/api/auth/callback", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    console.log("Получен код авторизации:", code);
    console.log("Отправка запроса в Shikimori с redirect_uri:", REDIRECT_URI);
    
    // Проверяем наличие необходимых данных
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("ОШИБКА: Отсутствуют CLIENT_ID или CLIENT_SECRET в переменных окружения");
      return res.status(500).json({ 
        error: "Missing credentials",
        details: "CLIENT_ID или CLIENT_SECRET не настроены. Запустите 'npm run setup-env' или обновите файл .env"
      });
    }
    
    // Логируем данные запроса (без секретов)
    console.log("Параметры запроса к Shikimori:", {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: "***SECRET***",
      code: code,
      redirect_uri: REDIRECT_URI,
    });
    
    // Используем URL-encoded формат с повышенными таймаутами
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    
    const response = await axios.post("https://shikimori.one/oauth/token", params, {
      timeout: 30000, // Увеличиваем таймаут до 30 секунд
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'AnimeRealm/1.0 (https://github.com/Migetsu/animelove)'
      },
      maxRedirects: 5
    });

    console.log("Получен ответ от Shikimori:", {
      status: response.status,
      hasAccessToken: !!response.data?.access_token,
      hasRefreshToken: !!response.data?.refresh_token,
      expiresIn: response.data?.expires_in
    });
    
    res.json(response.data);
  } catch (error) {
    console.error("OAuth error:", error);
    
    // Подробная информация об ошибке
    const errorDetail = {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : "No response received",
      request: error.request ? "Request was sent" : "Request was not sent"
    };
    
    console.error("Detailed error:", JSON.stringify(errorDetail, null, 2));
    
    res.status(500).json({ 
      error: "Failed to fetch access token",
      details: error.response?.data || error.message,
      serverInfo: {
        clientIdPresent: !!CLIENT_ID,
        clientSecretPresent: !!CLIENT_SECRET,
        redirectUri: REDIRECT_URI
      }
    });
  }
});

// Домашняя страница с информацией
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Сервер авторизации Shikimori</title>
        <style>
          body { background: #081b29; color: white; font-family: Arial; text-align: center; padding: 50px; }
          pre { background: #333; padding: 10px; text-align: left; word-break: break-all; }
          .button { background: #5e35b1; color: white; padding: 10px 20px; border: none; 
                   border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
          .info { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 800px; }
        </style>
      </head>
      <body>
        <h1>Сервер авторизации Shikimori</h1>
        
        <div class="info">
          <h2>Информация о сервере</h2>
          <p>Режим: ${isProd ? 'Продакшн' : 'Разработка'}</p>
          <p>REDIRECT_URI: ${REDIRECT_URI}</p>
        </div>
        
        <div class="info">
          <h2>Проверка основного маршрута</h2>
          <a href="/auth/callback?code=test_code" class="button">Тестировать маршрут</a>
        </div>
        
        <div class="info">
          <h2>Тестовый URL для авторизации:</h2>
          <pre>https://shikimori.one/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user_rates+comments+topics</pre>
          <a href="https://shikimori.one/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user_rates+comments+topics" 
             class="button" target="_blank">Проверить авторизацию Shikimori</a>
        </div>
      </body>
    </html>
  `);
});

// Обработка 404 ошибок
app.use((req, res) => {
  console.error(`404: ${req.method} ${req.url} не найден`);
  res.status(404).send(`
    <html>
      <head>
        <title>404 - Маршрут не найден</title>
        <style>body { background: #081b29; color: white; text-align: center; padding: 50px; }</style>
      </head>
      <body>
        <h1>404 - Маршрут не найден</h1>
        <p>Путь: ${req.method} ${req.url}</p>
        <p><a href="/" style="color: #5e35b1;">Вернуться на главную</a></p>
      </body>
    </html>
  `);
});

// Обработка внутренних ошибок
app.use((err, req, res, next) => {
  console.error("Внутренняя ошибка сервера:", err);
  res.status(500).send("Внутренняя ошибка сервера");
});

// Запуск основного сервера
const server = app.listen(PORT, '0.0.0.0', () => {  // Используем 0.0.0.0 для привязки ко всем интерфейсам
  console.log(`
🔥 Сервер запущен и доступен по адресу: http://localhost:${PORT}
📝 Ожидание запросов на маршрут: http://localhost:${PORT}/auth/callback
📊 Проверьте работу сервера открыв: http://localhost:${PORT}
  `);
});

// Обработка ошибок при запуске сервера
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Порт ${PORT} уже используется! Возможно сервер уже запущен.`);
    console.error(`⚠️ Попробуйте остановить все процессы Node.js и запустить сервер заново.`);
  } else {
    console.error(`⚠️ Ошибка при запуске сервера:`, err);
  }
  process.exit(1);
});