<template>
  <main class="new">
    <div class="container">
      <div class="new__title">Новое</div>
      <div class="new__content">
        <router-link :to="`/`" class="new__content-item">
          <img src="@/assets/images/introMiniImg.png" alt="">
          <h3 class="new__content-item-title">Title</h3>
          <p class="new__content-item-type">TV сериал</p>
        </router-link>
      </div>
    </div>
  </main>
</template>

<script>
export default {

}
</script>

<style></style>