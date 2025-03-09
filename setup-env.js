import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnv() {
  console.log("\n====== Настройка окружения для AnimeLove ======\n");
  
  try {
    // Запрашиваем данные у пользователя
    const clientId = await question('Введите CLIENT_ID из Shikimori: ');
    const clientSecret = await question('Введите CLIENT_SECRET из Shikimori: ');
    const githubUsername = await question('Введите ваше имя пользователя GitHub: ');
    const repoName = await question('Введите название репозитория (по умолчанию - animelove): ') || 'animelove';
    const renderAppName = await question('Введите название приложения на Render (по умолчанию - animelove-api): ') || 'animelove-api';
    
    // Создаем содержимое файла .env
    const envContent = `CLIENT_ID=${clientId}
CLIENT_SECRET=${clientSecret}
GITHUB_PAGES_URL=https://${githubUsername}.github.io/${repoName}
RENDER_APP_NAME=${renderAppName}
RENDER_EXTERNAL_URL=https://${renderAppName}.onrender.com`;

    // Создаем файл .env в корневой директории
    await fs.writeFile(path.join(__dirname, '.env'), envContent);
    console.log('✅ Создан файл .env в корневой директории');
    
    // Создаем файл .env в директории backend
    const backendDir = path.join(__dirname, 'src', 'backend');
    await fs.mkdir(backendDir, { recursive: true });
    await fs.writeFile(path.join(backendDir, '.env'), envContent);
    console.log('✅ Создан файл .env в директории backend');
    
    // Обновляем render.yaml
    const renderYamlPath = path.join(__dirname, 'render.yaml');
    let renderYamlContent = await fs.readFile(renderYamlPath, 'utf8');
    
    // Заменяем placeholder значения
    renderYamlContent = renderYamlContent
      .replace(/name: animerealm-api/g, `name: ${renderAppName}`)
      .replace(/your-github-username\/animelove\.git/g, `${githubUsername}/${repoName}.git`)
      .replace(/https:\/\/your-github-username\.github\.io\/animerealm/g, `https://${githubUsername}.github.io/${repoName}`);
    
    await fs.writeFile(renderYamlPath, renderYamlContent);
    console.log('✅ Обновлен файл render.yaml');
    
    // Обновляем config.js
    const configPath = path.join(__dirname, 'src', 'config.js');
    let configContent = await fs.readFile(configPath, 'utf8');
    
    // Заменяем placeholder значения
    configContent = configContent
      .replace(/const RENDER_APP_NAME = ['"].*?['"]/g, `const RENDER_APP_NAME = '${renderAppName}'`)
      .replace(/const GITHUB_USERNAME = ['"].*?['"]/g, `const GITHUB_USERNAME = '${githubUsername}'`)
      .replace(/const REPO_NAME = ['"].*?['"]/g, `const REPO_NAME = '${repoName}'`);
    
    await fs.writeFile(configPath, configContent);
    console.log('✅ Обновлен файл config.js');
    
    // Обновляем vite.config.js для правильного базового пути
    const viteConfigPath = path.join(__dirname, 'vite.config.js');
    let viteConfigContent = await fs.readFile(viteConfigPath, 'utf8');
    
    viteConfigContent = viteConfigContent
      .replace(/base: mode === 'production' \? '\/.*?\/' : '\/'/g, 
               `base: mode === 'production' ? '/${repoName}/' : '/'`);
    
    await fs.writeFile(viteConfigPath, viteConfigContent);
    console.log('✅ Обновлен файл vite.config.js');
    
    console.log('\n✅ Настройка завершена успешно!');
    console.log(`\n📋 Сводка настроек:
  - CLIENT_ID: ${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}
  - CLIENT_SECRET: ${clientSecret ? '************' : 'Не задан!'}
  - GitHub Pages URL: https://${githubUsername}.github.io/${repoName}
  - Render App: ${renderAppName}
  - Репозиторий: ${repoName}
    `);
    
    console.log("\n🚀 Следующие шаги:");
    console.log("1. Запустите локально: npm run dev:all");
    console.log(`2. Создайте репозиторий на GitHub с названием '${repoName}'`);
    console.log(`3. Добавьте ваш репозиторий как remote: git remote add origin https://github.com/${githubUsername}/${repoName}.git`);
    console.log("4. Отправьте код в репозиторий: git push -u origin main");
    console.log(`5. Создайте сервис на Render, используя ваш GitHub репозиторий ${repoName}`);
    console.log("6. На Render добавьте переменные окружения CLIENT_ID и CLIENT_SECRET");
    console.log("7. Разверните GitHub Pages: npm run deploy");
    
  } catch (error) {
    console.error('Ошибка при настройке окружения:', error);
  } finally {
    rl.close();
  }
}

setupEnv();
