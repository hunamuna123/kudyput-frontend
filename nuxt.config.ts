import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://api.kudytudy.raitokyokai.tech",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@pinia/nuxt", "shadcn-nuxt", "@vite-pwa/nuxt"],

  pinia: {
    storesDirs: ["./store/**"],
  },

  shadcn: {
    prefix: "Ui",
    componentDir: "./app/components/ui",
  },

  // Full PWA configuration
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-64.png"],

    manifest: {
      name: "КудыТуды — Скрытые места Кубани",
      short_name: "КудыТуды",
      description: "Исследуй скрытые локации Краснодарского края. Винодельни, фермы, тропы, гастро-точки и камерные места.",
      lang: "ru",
      theme_color: "#1A1A2E",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      scope: "/",
      categories: ["travel", "lifestyle", "navigation"],
      icons: [
        {
          src: "/icon-64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      screenshots: [],
      shortcuts: [
        {
          name: "Карта",
          short_name: "Карта",
          url: "/map",
          icons: [{ src: "/icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Новая поездка",
          short_name: "Поездка",
          url: "/trip/new",
          icons: [{ src: "/icon-192.png", sizes: "192x192" }],
        },
        {
          name: "Профиль",
          short_name: "Профиль",
          url: "/profile",
          icons: [{ src: "/icon-192.png", sizes: "192x192" }],
        },
      ],
    },

    workbox: {
      // Navigation fallback for SPA/SSG routes
      navigateFallback: "/",
      navigateFallbackDenylist: [/^\/api\//, /^\/ws\//],

      // Cache strategies
      runtimeCaching: [
        // API responses — Network First with 5 min cache
        {
          urlPattern: /^https?:\/\/.*\/api\/v1\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 5, // 5 minutes
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 10,
          },
        },
        // Location images — Cache First (images rarely change)
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            expiration: {
              maxEntries: 300,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // Google Fonts — Cache First
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\//i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-stylesheets",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-webfonts",
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // OSRM route API — Network First
        {
          urlPattern: /^https:\/\/router\.project-osrm\.org\//i,
          handler: "NetworkFirst",
          options: {
            cacheName: "osrm-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60, // 1 hour
            },
            networkTimeoutSeconds: 15,
          },
        },
        // Terrain/map tiles — Cache First
        {
          urlPattern: /\.(?:terrain|quantized-mesh|bin)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "terrain-cache",
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            },
          },
        },
        // Audio stories / splat files — Cache First
        {
          urlPattern: /\.(?:mp3|wav|ogg|splat|ply)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "media-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
            },
          },
        },
      ],

      // Pre-cache critical app shell
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

      // Skip waiting on new SW
      skipWaiting: true,
      clientsClaim: true,

      // Clean old caches
      cleanupOutdatedCaches: true,
    },

    // Dev options (for testing SW in dev)
    devOptions: {
      enabled: false,
      type: "module",
    },

    // Client configuration
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600, // Check for updates every hour
    },
  },

  // SEO/Meta defaults
  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      title: "КудыТуды — Скрытые места Кубани",
      meta: [
        { name: "description", content: "Исследуй скрытые локации Краснодарского края. Винодельни, фермы, тропы, гастро-точки и камерные места." },
        { name: "theme-color", content: "#1A1A2E" },
        { name: "format-detection", content: "telephone=no" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "КудыТуды" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "КудыТуды — Скрытые места Кубани" },
        { property: "og:description", content: "Исследуй скрытые локации Краснодарского края" },
        { property: "og:image", content: "/icon-512.png" },
        { property: "og:site_name", content: "КудыТуды" },
        { property: "og:locale", content: "ru_RU" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "КудыТуды — Скрытые места Кубани" },
        { name: "twitter:description", content: "Исследуй скрытые локации Краснодарского края" },
        { name: "twitter:image", content: "/icon-512.png" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "msapplication-TileColor", content: "#1A1A2E" },
        { name: "msapplication-TileImage", content: "/icon-192.png" },
      ],
      link: [
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", href: "/icon-64.png" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },

  // Nitro production optimizations
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: false,
    },
    routeRules: {
      // Cache static assets aggressively
      "/icon-*.png": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/apple-touch-icon.png": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/favicon.ico": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      // API proxy (optional — if you serve API from same domain)
      "/api/**": { proxy: process.env.NUXT_PUBLIC_API_BASE ? `${process.env.NUXT_PUBLIC_API_BASE}/api/**` : undefined },
    },
  },
});