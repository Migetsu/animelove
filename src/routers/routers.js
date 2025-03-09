import { createRouter, createWebHashHistory } from 'vue-router'
import config from '@/config.js'
import Home from '@/pages/Home.vue'

export const routers = createRouter({
    // Используем хэш-маршрутизацию для совместимости с GitHub Pages
    history: createWebHashHistory(),
    // Базовый путь на основе окружения
    base: config.BASE_PATH,
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/catalog', name: 'catalog', component: () => import('@/pages/Catalog/Catalog.vue')},
        {path: '/new', name: 'new', component: () => import('@/pages/New/New.vue')},
        {path: '/popular', name: 'popular', component: () => import('@/pages/Popular/Popular.vue')},
        {path: '/releases/release/:id', name: 'releaseId', component: () => import('@/pages/Release/Release.vue')},
        {path: '/auth/callback', name: 'callback', component: () => import('@/pages/Callback.vue')},
        {path: '/profile', name: 'profile', component: () => import('@/pages/Profile.vue')}
    ]
})