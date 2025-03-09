/**
 * Утилита для проверки работы бэкенд-сервера
 */

/**
 * Проверяет доступность бэкенд-сервера с несколькими попытками
 * @param {string} apiUrl - Базовый URL API
 * @param {number} retries - Количество попыток (по умолчанию 3)
 * @param {number} delay - Задержка между попытками в мс (по умолчанию 2000)
 * @returns {Promise<boolean>} - true, если сервер доступен, false в противном случае
 */
export async function isServerAvailable(apiUrl, retries = 3, delay = 2000) {
  console.log(`Проверка доступности сервера: ${apiUrl} (попыток осталось: ${retries})`);

  // Функция для создания задержки
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Попытка ${attempt} из ${retries}...`);
      
      // Таймаут для запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${apiUrl}/api/status`, {
          method: 'GET',
          mode: 'no-cors', // Это не даст данных ответа, но успешно, если сервер существует
          cache: 'no-cache',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        console.log(`Сервер ответил со статусом: ${response.status}`);
        return true;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.warn(`Попытка ${attempt} не удалась:`, fetchError.message);
        
        if (attempt < retries) {
          console.log(`Ожидание ${delay}мс перед следующей попыткой...`);
          await wait(delay);
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке сервера:', error);
      if (attempt < retries) {
        await wait(delay);
      }
    }
  }
  
  console.error(`Сервер недоступен после ${retries} попыток`);
  return false;
}

/**
 * Запускает бэкенд-сервер, используя системную команду по умолчанию
 */
export function openServerCommand() {
  const isWindows = navigator.platform.includes('Win');
  
  let command = isWindows 
    ? 'start cmd /c "npm run server"' 
    : 'terminal -e "npm run server"';
  
  console.log('Рекомендуется выполнить в терминале:', command);
  
  return {
    command,
    instructions: 'Пожалуйста, откройте терминал и выполните команду: npm run server'
  };
}

/**
 * Проверяет, запущены ли фронтенд и сервер через одну команду (dev:all)
 * @returns {boolean}
 */
export function isDualServerMode() {
  // Проверяем наличие в URL параметра, который можно добавить при запуске dev:all
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('dualServer') || window.localStorage.getItem('dualServerMode') === 'true';
}
