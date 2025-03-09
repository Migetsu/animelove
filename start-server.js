import { execSync } from 'child_process';

console.log('🚀 Запуск сервера авторизации Shikimori...');

try {
  // Проверяем, что порт свободен
  console.log('1️⃣ Освобождаем порт 3000...');
  try {
    execSync('node src/backend/port-killer.js', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️ Порт уже свободен или не удалось его освободить');
  }

  // Запускаем сервер
  console.log('2️⃣ Запускаем сервер...');
  execSync('node server-only.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Не удалось запустить сервер:', error.message);
  process.exit(1);
}
