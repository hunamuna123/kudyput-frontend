import { defineStore } from 'pinia'

export const api = defineStore('apiUrl', {
    state: () => ({
        url: '1.1.1.1:8000',
    }),
})