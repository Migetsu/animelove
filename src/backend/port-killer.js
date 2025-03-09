import { exec } from 'child_process';
import { platform } from 'os';

const PORT = 3000;
const isWindows = platform() === 'win32';

console.log(`🔍 Поиск процессов, использующих порт ${PORT}...`);

// Выбираем команду в зависимости от операционной системы
const command = isWindows
  ? `netstat -ano | findstr :${PORT}`
  : `lsof -i :${PORT} | grep LISTEN`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log(`✅ Не найдено активных процессов на порту ${PORT}`);
    process.exit(0);
  }

  if (stderr) {
    console.error(`❌ Ошибка: ${stderr}`);
    process.exit(1);
  }

  console.log(`📋 Найдены процессы на порту ${PORT}:`);
  console.log(stdout);

  // Извлекаем PID процесса с улучшенной обработкой для Windows
  let pid;
  if (isWindows) {
    // Улучшенный regex для Windows netstat вывода
    // Ищем строки, которые содержат наш порт, и берем последнее число (PID)
    const lines = stdout.split('\n').filter(line => line.includes(`:${PORT}`));
    
    if (lines.length > 0) {
      // Берем первую строку с нужным портом
      const line = lines[0];
      console.log(`Анализ строки: ${line}`);
      
      // Разделяем строку на части по пробелам и ищем последний не-пустой элемент
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (/^\d+$/.test(lastPart)) {
          pid = lastPart;
          console.log(`Найден PID: ${pid}`); // Добавлен лог для проверки
        }
      }
    }
  } else {
    // В Unix/Linux/Mac PID обычно во втором столбце
    const matches = stdout.match(/\S+\s+(\d+)/);
    pid = matches ? matches[1] : null;
  }

  // Проверка на валидность PID
  if (!pid || pid === '0' || isNaN(parseInt(pid))) {
    console.error('❌ Не удалось определить корректный PID процесса');
    console.error('Найденный PID:', pid);
    
    // Альтернативный подход - использовать npx kill-port
    console.log('🔄 Попытка использовать встроенный kill-port...');
    exec('npx kill-port 3000', (killPortError) => {
      if (killPortError) {
        console.error('❌ Не удалось освободить порт:', killPortError.message);
      } else {
        console.log('✅ Порт успешно освобожден через kill-port');
      }
      process.exit(killPortError ? 1 : 0);
    });
    return;
  }

  console.log(`🔪 Завершение процесса с PID: ${pid}`);

  // Команда для завершения процесса
  const killCommand = isWindows
    ? `taskkill /F /PID ${pid}`
    : `kill -9 ${pid}`;

  exec(killCommand, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error(`❌ Ошибка при завершении процесса: ${killError.message}`);
      process.exit(1);
    }

    if (killStderr) {
      console.error(`❌ Ошибка: ${killStderr}`);
      process.exit(1);
    }

    console.log('✅ Процесс успешно завершен');
    console.log(killStdout);

    // Проверяем, что порт освобожден
    setTimeout(() => {
      console.log('🔄 Проверка, что порт освобожден...');
      exec(command, (checkError) => {
        if (checkError) {
          console.log(`✅ Порт ${PORT} успешно освобожден!`);
        } else {
          console.warn(`⚠️ Порт ${PORT} всё еще может быть занят.`);
        }
        process.exit(0);
      });
    }, 1000);
  });
});
