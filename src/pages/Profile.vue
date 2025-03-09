<template>
  <main class="profile">
    <div class="container">
      <h1 class="profile__title">Мой профиль</h1>
      <div v-if="loading" class="profile__loading">
        <p>Загрузка данных профиля...</p>
      </div>
      <div v-else-if="error" class="profile__error">
        <p>{{ error }}</p>
        <button @click="logout" class="profile__button">Выйти</button>
      </div>
      <div v-else class="profile__content">
        <p>Вы успешно авторизованы через Shikimori!</p>
        <button @click="logout" class="profile__button">Выйти</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const error = ref(null);

onMounted(() => {
  // Проверяем наличие токена
  const token = localStorage.getItem('shikimori_token');
  
  if (!token) {
    error.value = "Не авторизован. Пожалуйста, войдите через Shikimori.";
    loading.value = false;
    return;
  }
  
  // Здесь можно сделать запрос к API Shikimori для получения данных профиля
  // Это заглушка, так что просто завершаем загрузку
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

function logout() {
  localStorage.removeItem('shikimori_token');
  localStorage.removeItem('shikimori_refresh_token');
  localStorage.removeItem('shikimori_token_expires_at');
  router.push('/');
}
</script>

<style scoped>
.profile {
  margin-top: 100px;
  color: white;
}

.profile__title {
  margin-bottom: 20px;
}

.profile__content, .profile__loading, .profile__error {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.profile__button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #5e35b1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.profile__error {
  color: #ff5252;
}
</style>
