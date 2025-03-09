<template>
    <header class="header2">
        <nav class="header2__nav">
            <div class="header2__nav-container">
                <ul class="header2__nav-list">
                    <li>
                        <router-link class="header2__nav-link" to="/">
                            <span>Закладки</span>
                            <fa :icon="['fas', 'bookmark']" />
                        </router-link>
                    </li>
                    <li>
                        <router-link class="header2__nav-link" to="/">
                            <span>Каталог</span>
                            <fa :icon="['fas', 'layer-group']" />
                        </router-link>
                    </li>
                    <li>
                        <router-link class="header2__nav-link" to="/">
                            <span>Главная</span>
                            <fa :icon="['fas', 'house']" />
                        </router-link>
                    </li>
                    <li>
                        <router-link class="header2__nav-link" to="/">
                            <span>Уведомления</span>
                            <fa :icon="['fas', 'bell']" />
                        </router-link>
                    </li>
                    <li>
                        <router-link class="header2__nav-link" to="/">
                            <span>Меню</span>
                            <fa :icon="['fas', 'bars']" />
                        </router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const links = reactive([
    { title: 'Меню', url: '/catalog' },
    { title: 'Новинки', url: '/new' },
    { title: 'Популярное', url: '/popular' },
])
</script>

<style></style>