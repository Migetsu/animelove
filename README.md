# AnimeRealm

## Настройка Shikimori API

### 1. Регистрация приложения
1. Откройте https://shikimori.one/oauth/applications
2. Нажмите "New Application"
3. Заполните форму:
   - **Name**: AnimеRealm (или другое имя)
   - **Redirect URI**: `http://localhost:3000/auth/callback`
   - **Scopes**: выберите user_rates, comments, topics

### 2. Конфигурация окружения
1. Создайте файл `.env` в папке `src/backend/`
2. Добавьте в него следующее содержимое:
