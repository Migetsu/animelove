import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== ПРОВЕРКА КОНФИГУРАЦИИ SHIKIMORI ===');

// Проверяем наличие необходимых переменных
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Ошибка: Отсутствуют CLIENT_ID или CLIENT_SECRET');
  console.log('Проверьте файл .env и убедитесь, что он содержит необходимые переменные');
  process.exit(1);
}

console.log('✅ CLIENT_ID найден');
console.log('✅ CLIENT_SECRET найден');

const REDIRECT_URI = 'http://localhost:3000/auth/callback';
console.log('ℹ️ REDIRECT_URI:', REDIRECT_URI);

console.log('\nВыполняем тестовый запрос к Shikimori...');

// Создадим тестовый запрос для проверки конфигурации
async function testConfig() {
  try {
    // Не используем реальный код, просто проверяем ответ на ошибку invalid_client
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', 'test_code');  // Заведомо неверный код
    params.append('redirect_uri', REDIRECT_URI);

    await axios.post('https://shikimori.one/oauth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    // Ожидаем ошибку, но она должна быть связана с неверным кодом, а не с аутентификацией клиента
    if (error.response?.data?.error === 'invalid_client') {
      console.error('❌ Ошибка аутентификации клиента!');
      console.error('Причина:', error.response.data.error_description);
      console.error('\nВозможные причины:');
      console.error('1. CLIENT_ID или CLIENT_SECRET не соответствуют зарегистрированным в Shikimori');
      console.error('2. REDIRECT_URI не соответствует указанному в Shikimori');
      console.error('\nНеобходимые действия:');
      console.error('1. Проверьте регистрацию приложения на https://shikimori.one/oauth/applications');
      console.error(`2. Убедитесь, что Redirect URI настроен как ${REDIRECT_URI}`);
    } else if (error.response?.data?.error === 'invalid_grant') {
      console.log('✅ Конфигурация клиента корректна! (Получена ошибка invalid_grant, что ожидаемо для тестового кода)');
    } else {
      console.error('❌ Непредвиденная ошибка:', error.response?.data || error.message);
    }
  }
}

testConfig();
