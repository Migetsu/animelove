<template>
  <main class="main">
    <Upcoming/>
    <New/>
  </main>
</template>

<script setup>
import {ref, reactive, computed, onMounted, onUnmounted} from 'vue'
import Upcoming from '@/components/Upcoming/Upcoming.vue'
import New from '@/components/New/New.vue'

onUnmounted(() => {
  window.scrollTo(0, 0);
})
</script>

<style>

</style>