<template>
  <main class="release">
    <div class="container">
      <div class="release__content">
        <div class="release__header">
          <img src="@/assets/images/introMiniImg.png" alt="Monolog Farmacevta 2" class="release__image" />
          <div class="release__info">
            <h1 class="release__title">Монолог фармацевта 2</h1>
            <p class="release__subtitle">Kusuriya no Hitorigoto 2nd Season</p>
            <div class="release__details">
              <span class="release__rating">16+</span>
            </div>
            <ul class="release__meta">
              <li>Тип: <span>ТВ</span></li>
              <li>Сезон: <span>Зима</span></li>
              <li>Жанры: <span>Драма • Исторический</span></li>
              <li>Год выхода: <span>2025</span></li>
              <li>Всего эпизодов: <span>24 эпизода</span></li>
              <li>Общее время просмотра: <span>3 часа, 36 минут</span></li>
            </ul>
            <button class="release__button"><fa :icon="['fas', 'play']" /> <span>Смотреть с 1 эпизода</span></button>
          </div>
        </div>
        <div class="release__description">
          <p>Ещё недавно она была простой служанкой, а теперь стала одной из приближённых самого императора! Экцентричная девушка по имени Маомао, благодаря своему стойкому характеру и глубоким познаниям в фармацевтике, продолжает строить себе успешную карьеру в императорском дворе. Теперь перед ней стоит следующая задача: ей надо помогать беременной супруге императора Гёкуё, а именно обеспечить её здоровье и безопасность. И если с первым всё будет более-менее просто, то со вторым могут возникнуть проблемы. Вообще, беременность императриц должна быть делом строжайшей секретности, но это ведь императорский дворец. Здесь интриги и подлые удары в спину происходят чуть ли не чаще, чем чаепития и официальные приёмы. Так что просто находиться героине точно не будет.</p>
        </div>
        <div class="release__player">
          <div class="container">
            <iframe class="release__iframe" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>

</script>

<style src="./Release.scss"></style>