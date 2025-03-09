import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePopularMovieStore = defineStore('popularMovie', () => {
    const popularMovies = ref([
        {
            id: 1,
            title: "Атака титанов",
            poster_path: "introMiniImg.png",
            overview: "История о борьбе человечества с гигантскими человекоподобными существами.",
            vote_average: 8.7
        },
        {
            id: 2,
            title: "Клинок, рассекающий демонов",
            poster_path: "introMiniImg.png",
            overview: "Юный Танджиро, чья семья была убита демонами, становится охотником на демонов.",
            vote_average: 8.5
        },
        {
            id: 3,
            title: "Токийский гуль",
            poster_path: "introMiniImg.png",
            overview: "История о парне, который становится наполовину гулем после несчастного случая.",
            vote_average: 8.2
        },
        {
            id: 4,
            title: "Стальной алхимик",
            poster_path: "introMiniImg.png",
            overview: "Братья Элрик ищут способ вернуть свои тела после неудачной попытки воскресить мать.",
            vote_average: 9.0
        },
        {
            id: 5,
            title: "Наруто",
            poster_path: "introMiniImg.png",
            overview: "История о молодом ниндзя Наруто Узумаки, мечтающем стать Хокаге.",
            vote_average: 8.4
        },
        {
            id: 6,
            title: "Ван Пис",
            poster_path: "introMiniImg.png",
            overview: "Приключения пирата Монки Д. Луффи и его команды в поисках легендарного сокровища.",
            vote_average: 8.6
        }
    ])
    
    const selectedMovie = ref(null)
    
    const setSelectedMovie = (movie) => {
        selectedMovie.value = movie
    }
    
    return { popularMovies, selectedMovie, setSelectedMovie }
})
