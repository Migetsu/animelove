<template>
    <main class="catalog">
        <div class="container">
            <h1 class="catalog__title">Каталог</h1>
            <form action="" class="catalog__search">
                <input type="text" class="catalog__search-input" placeholder="Поиск по каталогу">
                <button class="catalog__search-button"><fa :icon="['fas', 'search']" class="nav__search-icon" /></button>
            </form>
            <div class="catalog__content">
                <div class="catalog__content-list">
                    <router-link :to="`/anime/1`" class="catalog__content-list-item">
                        <img src="@/assets/images/introMiniImg.png" alt="">
                        <h3 class="catalog__content-list-item-title">Title</h3>
                        <p class="catalog__content-list-item-type">TV сериал</p>
                    </router-link>
                </div>
                <div class="catalog__filters">
                    <div class="catalog__filters-item catalog__genres">
                        <h3>Жанры <span>Любые ></span></h3>
                    </div>
                    <div class="catalog__filters-item">
                        <h3>Возрастной рейтинг</h3>
                        <ul>
                            <li><label @click="toggleAgeRating('none')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="ageRatingFilters.none" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Нет</span>
                                </label></li>
                            <li><label @click="toggleAgeRating('six')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="ageRatingFilters.six" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>6+</span>
                                </label></li>
                            <li><label @click="toggleAgeRating('twelve')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="ageRatingFilters.twelve" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>12+</span>
                                </label></li>
                            <li><label @click="toggleAgeRating('sixteen')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="ageRatingFilters.sixteen" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>16+</span>
                                </label></li>
                            <li><label @click="toggleAgeRating('eighteen')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="ageRatingFilters.eighteen" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>18+</span>
                                </label></li>
                        </ul>
                    </div>
                    <div class="catalog__filters-item">
                        <h3>Тип</h3>
                        <ul>
                            <li><label @click="toggleType('tv')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="typeFilters.tv" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>TV сериал</span>
                                </label></li>
                            <li><label @click="toggleType('movie')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="typeFilters.movie" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Фильм</span>
                                </label></li>
                            <li><label @click="toggleType('special')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="typeFilters.special" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Спешл</span>
                                </label></li>
                            <li><label @click="toggleType('ova')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="typeFilters.ova" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>OVA</span>
                                </label></li>
                            <li><label @click="toggleType('ona')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="typeFilters.ona" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>ONA</span>
                                </label></li>
                        </ul>
                    </div>
                    <div class="catalog__filters-item">
                        <h3>Статус тайтла</h3>
                        <ul>
                            <li><label @click="toggleStatus('ongoing')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="statusFilters.ongoing" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Онгоинг</span>
                                </label></li>
                            <li><label @click="toggleStatus('completed')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="statusFilters.completed" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Завершён</span>
                                </label></li>
                            <li><label @click="toggleStatus('announced')">
                                    <fa class="filters-icon" :icon="['far', 'square']" v-if="statusFilters.announced" />
                                    <fa class="filters-icon sec-icon" :icon="['fas', 'square-plus']" v-else /> <span>Анонс</span>
                                </label></li>
                        </ul>
                    </div>
                    <div class="catalog__filters-item">
                        <h3>Мои списки</h3>
                        <ul>
                            <li><label @click="toggleList('watching')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.watching" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Смотрю</span>
                                </label></li>
                            <li><label @click="toggleList('planned')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.planned" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Запланировано</span>
                                </label></li>
                            <li><label @click="toggleList('dropped')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.dropped" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Брошено</span>
                                </label></li>
                            <li><label @click="toggleList('completed')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.completed" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Просмотрено</span>
                                </label></li>
                            <li><label @click="toggleList('favorite')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.favorite" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Любимые</span>
                                </label></li>
                            <li><label @click="toggleList('rewatching')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.rewatching" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Пересматриваю</span>
                                </label></li>
                            <li><label @click="toggleList('onhold')">
                                    <fa :icon="['far', 'square']" v-if="listFilters.onhold" />
                                    <fa :icon="['fas', 'square-plus']" v-else /> <span>Отложено</span>
                                </label></li>
                        </ul>
                    </div>
                    <div class="catalog__filters-btns">
                        <button class="catalog__filters-btn">Сбросить</button>
                        <button class="catalog__filters-btn">Применить</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue';

const ageRatingFilters = ref({
    none: true,
    six: true,
    twelve: true,
    sixteen: true,
    eighteen: true
});

const typeFilters = ref({
    tv: true,
    movie: true,
    special: true,
    ova: true,
    ona: true
});

const statusFilters = ref({
    ongoing: true,
    completed: true,
    announced: true
});

const listFilters = ref({
    watching: true,
    planned: true,
    dropped: true,
    completed: true,
    favorite: true,
    rewatching: true,
    onhold: true
});

function toggleAgeRating(rating) {
    ageRatingFilters.value[rating] = !ageRatingFilters.value[rating];
}

function toggleType(type) {
    typeFilters.value[type] = !typeFilters.value[type];
}

function toggleStatus(status) {
    statusFilters.value[status] = !statusFilters.value[status];
}

function toggleList(list) {
    listFilters.value[list] = !listFilters.value[list];
}
</script>

<style lang="scss"></style>