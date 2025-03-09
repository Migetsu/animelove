<template>
    <div class="main__upcoming-item" v-if="slideView == idx">
        <img src="@/assets/images/bg.svg" alt="" class="main__upcoming-item-img slide-bg-animation">
        <div class="main__upcoming-content">
            <div class="main__upcoming-info">
                <h1 class="main__upcoming-content-title slide-right-animation">{{ movie.title }}</h1>
                <div class="main__upcoming-content-meta slide-right-animation">
                    <span class="main__upcoming-content-genre">{{ movie.genre }}</span>
                    <span class="main__upcoming-content-episodes">{{ movie.episodes }} серий</span>
                </div>
                <p class="main__upcoming-content-text slide-right-animation">{{ movie.overview }}</p>
                <div class="main__upcoming-content-action slide-right-animation">
                    <BtnMore :id="movie.id" />
                </div>
            </div>
        </div>

        <div class="main__upcoming-nav">
            <div class="main__upcoming-nav-arrow main__upcoming-nav-prev" @click="$emit('slidePrev')">
                <span>&#10094;</span>
            </div>
            <div class="main__upcoming-nav-arrow main__upcoming-nav-next" @click="$emit('slideNext')">
                <span>&#10095;</span>
            </div>
        </div>
        
        <div class="main__upcoming-pagination">
            <div v-for="(_, dotIdx) in totalSlides" :key="dotIdx" 
                 class="main__upcoming-pagination-dot"
                 :class="{ 'active': slideView === dotIdx }"
                 @click="$emit('slideTo', dotIdx)">
            </div>
        </div>
    </div>
</template>

<script setup>
import { useIndexStore } from '@/store/indexStore.js'
const props = defineProps({
    movie: Object,
    idx: Number,
    slideView: Number,
    next: Object,
    totalSlides: {
        type: Number,
        required: true
    }
})

let indexStore = useIndexStore()
</script>

<style></style>