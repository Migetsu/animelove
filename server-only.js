import { exec } from 'child_process';
import http from 'http';

console.log("======================================================");
console.log("  ЗАПУСК СЕРВЕРА АВТОРИЗАЦИИ SHIKIMORI  ");
console.log("======================================================");

// Простая проверка доступности порта 3000
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Запуск сервера
async function startServer() {
  // Проверяем порт
  const isPortFree = await checkPort(3000);
  
  if (!isPortFree) {
    console.log("⚠️ Порт 3000 уже используется. Пытаемся освободить...");
    try {
      await import('./src/backend/port-killer.js');
    } catch (err) {
      console.error("❌ Не удалось освободить порт:", err);
      process.exit(1);
    }
  }
  
  // Запускаем сервер
  try {
    console.log("🚀 Запуск сервера авторизации...");
    await import('./src/backend/server.js');
  } catch (err) {
    console.error("❌ Ошибка при запуске сервера:", err);
    process.exit(1);
  }
}

startServer();
