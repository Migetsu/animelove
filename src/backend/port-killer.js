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

  // Извлекаем PID процесса
  let pid;
  if (isWindows) {
    // В Windows PID находится в последнем столбце
    const matches = stdout.match(/\s+(\d+)\s*$/m);
    pid = matches ? matches[1] : null;
  } else {
    // В Unix/Linux/Mac PID обычно во втором столбце
    const matches = stdout.match(/\S+\s+(\d+)/);
    pid = matches ? matches[1] : null;
  }

  if (!pid) {
    console.error('❌ Не удалось определить PID процесса');
    process.exit(1);
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
