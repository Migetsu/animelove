<template>
    <section class="main__upcoming">
        <div class="main__upcoming-slider" :style="{ transform: `translateX(-${slideIndex * 100}%)` }">
            <div class="main__upcoming-slide" v-for="movie in upcomings" :key="movie.id">
                <img src="@/assets/images/bg.svg" alt="" class="main__upcoming-slide-img">
                <div class="main__upcoming-content">
                    <div class="main__upcoming-info">
                        <h1 class="main__upcoming-content-title">{{ movie.title }}</h1>
                        <div class="main__upcoming-content-meta">
                            <span class="main__upcoming-content-genre">{{ movie.genre }}</span>
                            <span class="main__upcoming-content-episodes">{{ movie.episodes }} серий</span>
                        </div>
                        <p class="main__upcoming-content-text">{{ movie.overview }}</p>
                        <div class="main__upcoming-content-action">
                            <BtnMore :id="movie.id" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="main__upcoming-nav">
            <div class="main__upcoming-nav-arrow main__upcoming-nav-prev" @click="slidePrev">
                <span>&#10094;</span>
            </div>
            <div class="main__upcoming-nav-arrow main__upcoming-nav-next" @click="slideNext">
                <span>&#10095;</span>
            </div>
        </div>
        
        <div class="main__upcoming-pagination">
            <div v-for="(_, dotIdx) in upcomings.length" :key="dotIdx" 
                 class="main__upcoming-pagination-dot"
                 :class="{ 'active': slideIndex === dotIdx }"
                 @click="slideTo(dotIdx)">
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const upcomings = ref([
    {
        title: 'Title',
        overview: 'Overview for this anime with detailed description and interesting facts about the plot and characters.',
        backdrop_path: 'backdrop_path',
        id: 1,
        genre: 'Приключения, Фэнтези',
        episodes: 12
    },
    {
        title: 'Title2',
        overview: 'Overview two with more information about this exciting anime series that fans are looking forward to.',
        backdrop_path: 'backdrop_path',
        id: 2,
        genre: 'Боевик, Драма',
        episodes: 24
    },
    {
        title: 'Title3',
        overview: 'Overview three containing all the details about this upcoming release that anime fans should know about.',
        backdrop_path: 'backdrop_path',
        id: 3,
        genre: 'Романтика, Комедия',
        episodes: 13
    },
    {
        title: 'Title4',
        overview: 'Overview four with the most interesting information about this highly anticipated anime release.',
        backdrop_path: 'backdrop_path',
        id: 4,
        genre: 'Мистика, Ужасы',
        episodes: 10
    }
]);

const slideIndex = ref(0);
const timeout = ref(null);
const sliding = ref(false);
const slideDelay = 7000;

const startAutoSlide = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        if (!sliding.value) {
            slideNext();
        } else {
            startAutoSlide();
        }
    }, slideDelay);
};

const slideNext = () => {
    if (sliding.value) return;
    sliding.value = true;
    
    slideIndex.value = (slideIndex.value + 1) % upcomings.value.length;
    
    setTimeout(() => {
        sliding.value = false;
        startAutoSlide();
    }, 600);
};

const slidePrev = () => {
    if (sliding.value) return;
    sliding.value = true;
    
    slideIndex.value = (slideIndex.value - 1 + upcomings.value.length) % upcomings.value.length;
    
    setTimeout(() => {
        sliding.value = false;
        startAutoSlide();
    }, 600);
};

const slideTo = (index) => {
    if (sliding.value || slideIndex.value === index) return;
    sliding.value = true;
    
    slideIndex.value = index;
    
    setTimeout(() => {
        sliding.value = false;
        startAutoSlide();
    }, 600);
};

onMounted(() => {
    startAutoSlide();
});

onBeforeUnmount(() => {
    clearTimeout(timeout.value);
});
</script>