<template>
    <section class="main__media" v-if="popularMovieStore.popularMovies">
        <div class="container-wide">
            <router-link to="/" class="main__media-title">
                <span>Последние обновления</span>
                <fa icon="chevron-right" class="main__media-arrow" />
            </router-link>
            <div class="main__media-grid">
                <div class="main__media-item" v-for="movie in displayedMovies" :key="movie.id">
                    <img src="@/assets/images/introMiniImg.png" alt="" class="main__media-item-img">
                    <div class="main__media-item-overlay">
                        <h3 class="main__media-item-title">{{ movie.title }}</h3>
                        <div class="main__media-item-rating">
                            <span>Рейтинг: {{ movie.vote_average }}</span>
                        </div>
                        <p class="main__media-item-overview">{{ movie.overview }}</p>
                        <router-link :to="`/`" class="main__media-item-button">
                            Смотреть
                        </router-link>
                    </div>
                    <router-link :to="`/`" class="main__media-item-link">
                    </router-link>
                </div>
            </div>
        </div>
    </section>
    <div class="loading" v-else>
        <div class="loading__spiner"></div>
    </div>
</template>

<script setup>
import { onUnmounted, ref, onMounted, computed } from 'vue'
import { usePopularMovieStore } from '@/store/popularMovieStore.js'
import { useIndexStore } from '@/store/indexStore.js'

const popularMovieStore = usePopularMovieStore();
const indexStore = useIndexStore();

const cardsToShow = ref(6); 

const updateCardsToShow = () => {
    if (window.innerWidth > 768 && window.innerWidth <= 1024) {
        cardsToShow.value = 4; 
    } else {
        cardsToShow.value = 6; 
    }
};

const displayedMovies = computed(() => {
    return popularMovieStore.popularMovies?.slice(0, cardsToShow.value) || [];
});

onMounted(() => {
    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);
});

onUnmounted(() => {
    window.scrollTo(0, 0);
    window.removeEventListener('resize', updateCardsToShow);
});
</script>

<style></style>