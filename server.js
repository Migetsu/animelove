/**
 * Единая точка входа для запуска сервера
 * Используется как в локальной разработке, так и на Render.com
 */

console.log('🚀 Запуск сервера AnimeLove...');

// Просто импортируем основной файл сервера
import './src/backend/server.js';

// Обработка неперехваченных исключений для стабильности
process.on('uncaughtException', (err) => {
  console.error('❌ Неперехваченное исключение:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение обещания:', reason);
});
