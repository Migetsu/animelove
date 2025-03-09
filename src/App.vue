<template>
  <div class="wrapper">
    <Navbar/>
    <Navbar2/>
    <router-view></router-view>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar/Navbar.vue'
import Navbar2 from '@/components/Navbar2/Navbar2.vue'
</script>

<style>

</style>