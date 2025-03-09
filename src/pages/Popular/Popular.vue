<template>
    <main class="popular">
    <div class="container">
      <div class="popular__title">Популярное</div>
      <div class="popular__content">
        <router-link :to="`/`" class="popular__content-item">
          <img src="@/assets/images/introMiniImg.png" alt="">
          <h3 class="popular__content-item-title">Title</h3>
          <p class="popular__content-item-type">TV сериал</p>
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>

</script>

<style>

</style>