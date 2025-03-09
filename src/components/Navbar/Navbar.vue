<template>
    <header class="header">
        <nav class="header__nav">
            <div class="header__nav-container container">
                <ul class="header__nav-list">
                    <li>
                        <router-link to="/" class="header__nav-logo">
                            <img src="@/assets/images/logo.svg" alt="Logo">
                        </router-link>
                    </li>
                    <li v-for="link in links" :key="link.url">
                        <router-link :to="link.url" class="header__nav-link">
                            {{ link.title }}
                        </router-link>
                    </li>
                    <!-- Удалена ссылка на ShikimoriCheck -->
                </ul>
                <div class="header__nav-list2">
                    <div class="header__nav-form">
                        <form action="" class="nav__search">
                            <input type="text" class="nav__search-input" placeholder="Поиск">
                            <button type="submit" class="nav__search-button">
                                <fa :icon="['fas', 'search']" class="nav__search-icon" />
                            </button>
                        </form>
                    </div>
                    <div class="header__nav-profile profile" v-if="isLoggedIn">
                        <router-link to="/profile">
                            <fa :icon="['fas', 'user']" />
                        </router-link>
                    </div>
                    <LoginButton v-else />
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import LoginButton from '@/components/Auth/LoginButton.vue'

const links = reactive([
    { title: 'Релизы', url: '/catalog' },
    { title: 'Новинки', url: '/new' },
    { title: 'Популярное', url: '/popular' },
])

const isLoggedIn = computed(() => {
    return !!localStorage.getItem('shikimori_token');
})
</script>

<style></style>