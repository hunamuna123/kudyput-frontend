import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: "http://141.98.7.225:8380",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@pinia/nuxt", "shadcn-nuxt"],

  pinia: {
    storesDirs: ["./store/**"],
  },

  shadcn: {
    prefix: "Ui",
    componentDir: "./app/components/ui",
  },
});