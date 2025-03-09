import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIndexStore = defineStore('index', () => {
    const imageFullUrl = ref('/src/assets/images/')
    
    return { imageFullUrl }
})