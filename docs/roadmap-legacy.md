# Roadmap фронтенда Deep Krai

## Назначение

Этот roadmap задает frontend-план с приоритетом:

1. Сначала собрать screenshot-ready и screencast-ready experience.
2. При этом UI должен выглядеть и ощущаться так же, как в будущей релизной версии.
3. После съемочного этапа этот же UI должен без перелома перейти в полноценный MVP product flow.

Frontend не должен быть "одноразовым демо-лендингом". Даже если часть данных временно мокается, интерфейсы, маршруты, экранная логика и visual language должны быть релизного качества.

## GDD как источник истины

Главный источник истины для frontend-плана:

- [deep_krai_gdd.md](deep_krai_gdd.md)

Этот roadmap является практической декомпозицией GDD на интерфейсы, маршруты, состояния, handoff и фазы реализации.

Правило согласования:

1. Каждый ключевой экран должен соответствовать конкретному user flow или sitemap-узлу из GDD.
2. Demo-first экраны не должны быть отдельной "выставочной версией", они должны быть первыми реализациями финальных product screens.
3. Full coverage достигается только тогда, когда roadmap покрывает весь пользовательский и служебный UI-контур GDD.

---

## Модель покрытия GDD

### Покрытие на этапе demo-first

Первый визуальный контур покрывает подмножество GDD:

1. Feature 1. Умное планирование
   - entry choice
   - voice-to-vibe
   - vibe passport

2. Feature 2. 3D-карта
   - spatial recommendation screen

3. Feature 3. 3D-туры
   - location detail / preview shell

### Покрытие на этапе MVP-core

Следующий слой покрывает:

1. Feature 1 полностью:
   - trip details
   - swipe flow
   - invite/join

2. Feature 2 в рабочем UI-виде:
   - map browsing
   - recommendations
   - предварительный маршрут

3. Частично Feature 4:
   - route screen
   - story/weather-ready UX placeholders

### Полное покрытие GDD

Фронтенд считается полностью покрывающим GDD только после покрытия:

1. Feature 1. Умное планирование
2. Feature 2. 3D-карта
3. Feature 3. 3D-туры
4. Feature 4. Live routing и сторителлинг
5. Feature 5. Онбординг хостов
6. Feature 6. Бронирование
7. Feature 7. Hidden Gems
8. Feature 8. Аналитика / B2G
9. Feature 9. UX офлайн-режима / синхронизации

---

## Связь roadmap с фичами GDD

| Фича GDD | Фазы roadmap фронтенда |
| --- | --- |
| Feature 1. Умное планирование поездки | F1, F2, F3, F4, F5, F8, F9, F10, F11, F12 |
| Feature 2. 3D-карта | F1, F2, F6, F11, F14, F15 |
| Feature 3. 3D-туры / splat | F7, F15 |
| Feature 4. Live routing и сторителлинг | F11, F14, F15 |
| Feature 5. Онбординг хостов | F13, F15 |
| Feature 6. Бронирование | F14, F15 |
| Feature 7. Hidden Gems / UX кармы | F15 |
| Feature 8. Аналитика / B2G | F15 |
| Feature 9. UX офлайн-режима | F14, F15 |

---

## Текущее состояние проекта

### Уже реализовано

1. **Nuxt app shell:**
   - app root (`app.vue`);
   - 4 layouts: `default`, `auth`, `dashboard`, `blank`;
   - home page (`/`), start page (`/start`).

2. **Полное продуктовое дерево маршрутов:**
   - `/start` — стартовый экран с 3 CTA (свайп, голос, карта);
   - `/vibe/voice` — голосовой ввод с MediaRecorder и AI thinking;
   - `/vibe/result` — вайб-паспорт (оси, саммари, теги, транскрипция, рекомендации);
   - `/vibe/swipe` — свайп-карточки с drag-gesture и LIKE/NOPE;
   - `/vibe/choice` — выбор пути;
   - `/map` — интерактивная 3D-карта с фильтрами, демо-режимом и роутбилдером;
   - `/location/[id]` — детальная страница локации с hero, галереей, 3D-просмотром (SplatViewer), бронированием;
   - `/trip/new` — создание поездки (даты, бюджет, транспорт, группа, дети, invite);
   - `/route/index`, `/route/[id]` — экран маршрута с поиском локаций, транспортом, расстоянием/временем;
   - `/auth/login`, `/auth/register` — авторизация и регистрация;
   - `/host/index` — онбординг хоста (загрузка медиа, форма локации, 3-step wizard);
   - `/admin/index`, `/admin/locations` — админ-панель с дашбордом и управлением локациями;
   - `/profile/index`, `/profile/trips` — профиль пользователя и список поездок.

3. **Shared visual base:**
   - theme colors (accent green #A4BE4F, primary blue #285A71, cream #FCE4C0);
   - fonts (Outfit heading, body);
   - base styling;
   - AppNavbar с продуктовой навигацией;
   - AppFooter;
   - MobileBottomNav.

4. **UI-компоненты (15 shadcn-vue примитивов):**
   - alert, avatar, badge, button, calendar, card, input, label, popover, select, separator, skeleton, sonner, toggle, toggle-group.

5. **Data layer (6 stores, 2 composables):**
   - `store/auth.ts` — login, register, JWT persistence, profile, logout;
   - `store/vibe.ts` — voiceProfile, fetchScenes, swipeScene, finalize, displayAxes, recommendations;
   - `store/locations.ts` — fetchLocations, fetchLocationById, fetchLocationSplat, createLocation;
   - `store/map.ts` — fetchMapLocations, selectPoint;
   - `store/trips.ts` — createTrip, fetchTrips, fetchTripById;
   - `store/routes.ts` — buildRoute;
   - `composables/useApiClient.ts` — runtime config baseUrl, JWT auth + refresh, FormData support;
   - `composables/useNavigation.ts` — утилиты навигации.

6. **Auth flow:**
   - middleware `auth.ts` (защита маршрутов), `guest.ts` (редирект авторизованных);
   - auth layout;
   - JWT token persistence + auto-refresh.

7. **3D-компоненты:**
   - `Map3D.vue` — 3D-карта Краснодарского края с Three.js/WebGL, terrain, маркерами, маршрутами, границами региона;
   - `SplatViewer.vue` — Gaussian Splat viewer с WASD/touch управлением, first-person walkthrough.

8. **Admin-компоненты:**
   - `AdminHeader.vue`, `AdminSidebar.vue`, `AdminBottomNav.vue` — dashboard navigation.

9. **Marketing/promo modules:**
   - HeroSection, ShowcaseSlider, FeaturesSection, LocationsSection.

### Частично реализовано

1. Групповые поездки:
   - invite URL генерируется при создании trip;
   - реализован экран `/trip/:id/join`;
   - реализован базовый список участников поездки;
   - не реализованы group preference summary и merge/group-planning UX из GDD.
2. Бронирование:
   - есть кнопка «Забронировать» на странице локации;
   - booking flow, выбор дат, подтверждение и оплата не реализованы.
3. ИИ-подбор маршрута:
   - ручной route builder и backend route build реализованы;
   - кнопка «ИИ, собери маршрут» на экране Route пока без backend-интеграции.
4. Хостовый контур:
   - онбординг хоста реализован;
   - post-onboarding маршруты хоста (`/host/dashboard` и далее) пока не реализованы.
5. Admin/B2G контур:
   - есть базовые экраны `/admin` и `/admin/locations`;
   - полноценные аналитические и B2G views пока не реализованы.

### Пока не реализовано

1. Swipe по 3D-сценам (сейчас только карточки/изображения, без WebGL-сцен и spatial audio)
2. Booking flow (выбор дат, оплата, подтверждение)
3. Storytelling player для маршрута
4. Weather overlay на карте
5. Live rerouting
6. Hidden Gems / karma-gated discovery UX
7. B2G analytics views
8. Offline mode / sync UX
9. Host dashboard (управление локациями хостом)
10. Host settings / edit flows

---

## Цели demo-first

## 30-second screencast flow

1. `0-4s`
   - стартовый экран с двумя CTA;
   - месседж: AI понимает путешественника, а не предлагает фильтры.

2. `4-10s`
   - voice input;
   - состояние "ИИ думает".

3. `10-16s`
   - vibe passport;
   - оси, summary, теги.

4. `16-23s`
   - 3D-карта или spatial map с подсвеченными рекомендованными точками.

5. `23-30s`
   - detail карточка локации или 3D-preview;
   - CTA "Собрать маршрут".

## Presentation screenshots

1. Vibe passport
2. 3D-карта с рекомендациями
3. Карточка локации / 3D-экскурсия

### Проверка приоритетов относительно GDD

Этот demo-набор напрямую вытащен из GDD:

1. стартовый выбор пути из Feature 1;
2. voice-to-vibe и vibe passport из Feature 1;
3. карта рекомендаций из Feature 2;
4. location detail / 3D-preview из Feature 3.

---

## Стратегия фронтенда

### Правило 1: сначала строим UI, который ощущается как финальный

Для demo допускаются mock data и stub transitions, но:

- дизайн должен быть финальным;
- layout должен быть финальным;
- screen composition должна быть финальной;
- тексты, visual hierarchy и interactions должны быть близки к релизу.

### Правило 2: избегать одноразовых экранов

Каждый demo screen должен потом остаться в продукте, а не быть временной одностраничной подделкой.

### Правило 3: моковые данные должны идти через data layer

Нельзя разбрасывать хардкод по компонентам. Даже временные данные должны идти через:

- composables;
- stores;
- API adapters;
- mock providers.

### Правило 4: первый визуальный проход уже должен уважать архитектуру продукта

Нужно сразу завести:

- layouts;
- pages;
- components/ui;
- components/modules;
- composables;
- stores;
- typed DTO models where возможно.

---

## Приоритеты продуктового UI

## Фаза F0. Основа визуальной системы ✅ РЕАЛИЗОВАНО

### Цель

Закрепить визуальный язык продукта, на котором потом будут собраны все demo и product screens.

### GDD alignment

Подготавливает визуальный фундамент для всех экранов из sitemap GDD.

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Theme tokens** — цвета определены через CSS variables: accent green (`#A4BE4F`), primary blue (`#285A71`), cream (`#FCE4C0`). Присутствуют dark/light варианты.
2. **Fonts** — подключены Google Fonts (Outfit для heading и body), font-heading и font-body классы используются повсеместно.
3. **Base styling** — глобальные стили, responsive utilities, типографика.
4. **Navbar/Footer** — `AppNavbar.vue` с продуктовой навигацией, `AppFooter.vue`, `MobileBottomNav.vue` для мобильных.
5. **15 UI-примитивов shadcn-vue:** alert, avatar, badge, button, calendar, card, input, label, popover, select, separator, skeleton, sonner/toast, toggle, toggle-group. Все компоненты единообразно стилизованы под фирменную цветовую палитру.
6. **Система поверхностей** — карточки с `bg-white/50 border border-accent/40 rounded-3xl`, glass-эффекты (`backdrop-blur-md`), градиентные подложки.
7. **Правила анимации** — micro-animations (hover, pulse, bounce, spin), переходы (`transition-all duration-200`), Transition-компоненты для slide.
8. **Адаптивная сетка** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, clamp-размеры шрифтов, mobile/desktop breakpoints.

### Критерии готовности: ✅ Выполнены

1. ✅ Новый экран собирается из уже существующих UI-паттернов (shadcn-vue + фирменные классы).
2. ✅ Нет ощущения "лендинг отдельно, продукт отдельно" — единая визуальная система.

---

## Фаза F1. Информационная архитектура продуктового флоу ✅ РЕАЛИЗОВАНО

### Цель

Перестроить проект из просто landing page в product shell.

### GDD alignment

Прямая привязка к sitemap и journey из GDD:

- `/vibe`
- `/trip/new`
- `/trip/:id/join`
- `/location/:slug`
- map/product screens

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Product route tree — реализовано полностью:**
   - `/` — landing page
   - `/start` — стартовый экран выбора пути
   - `/vibe/voice` — голосовой ввод
   - `/vibe/result` — вайб-паспорт
   - `/vibe/swipe` — эмоциональный свайп
   - `/vibe/choice` — выбор пути
   - `/map` — интерактивная карта
   - `/location/[id]` — детальная страница локации
   - `/trip/new` — создание поездки
   - `/route/index` и `/route/[id]` — маршрут
   - `/auth/login`, `/auth/register` — авторизация
   - `/host/index` — онбординг хоста
   - `/admin/index`, `/admin/locations` — админ-панель
   - `/profile/index`, `/profile/trips` — профиль

2. **Layouts — 4 штуки:**
   - `default.vue` — marketing/main layout
   - `auth.vue` — централизованная форма авторизации
   - `dashboard.vue` — admin/protected layout с sidebar/bottom nav
   - `blank.vue` — минимальный layout без навигации

3. **Navigation model:**
   - Landing → `/start` → product CTA (свайп / голос / карта)
   - Vibe flow → result → рекомендации → location detail
   - Trip creation → invite → profile/trips
   - Auth guard на защищённых маршрутах

### Критерии готовности: ✅ Выполнены

1. ✅ Скринкаст можно снять как реальный app flow.
2. ✅ Не требуется прыгать между несвязанными промо-блоками.

---

## Фаза F2. Demo data layer ✅ РЕАЛИЗОВАНО

### Цель

Сделать чистый способ подмены данных без разбрасывания хардкода по экранам.

### GDD alignment

Сохраняет соответствие frontend state моделям из GDD и backend contracts.

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **stores/ по сущностям (6 штук):**
   - `auth.ts` — login, register, logout, restoreSession, fetchProfile, updateProfile; типизированный UserProfile, TokenPair, AuthResponse.
   - `vibe.ts` — voiceProfile (отправка аудио), fetchScenes, swipeScene, finalize, displayAxes, recommendations, profile; typed DTOs.
   - `locations.ts` — fetchLocations, fetchLocationById, fetchLocationSplat, createLocation; typed Location interface.
   - `map.ts` — fetchMapLocations с фильтрами (category, bounds, limit, demo profile), selectPoint; typed MapPoint.
   - `trips.ts` — createTrip, fetchTrips, fetchTripById; typed Trip с group_composition.
   - `routes.ts` — buildRoute с location_ids и transport; typed RouteResponse с points, distance, time.

2. **composables/ (2 штуки):**
   - `useApiClient.ts` — полноценный API client: runtime config для baseUrl, JWT Bearer auth, automatic token refresh на 401, FormData support, query params, typed generics.
   - `useNavigation.ts` — утилиты навигации.

3. **Demo fixtures:**
   - Fallback данные в `vibe/swipe.vue` (8 demo-сцен) и `vibe/result.vue` (fallback axes, summary, tags).
   - Demo mode на карте (`demoMode`, `demoProfile` с 4 профилями: спокойный, активный, семья, гастро-тур).

4. **Data-source policy:**
   - API-first: все stores делают реальные запросы через `useApiClient`.
   - Fallback данные используются через computed-проперти как резервные значения.
   - Runtime config (`runtimeConfig.public.apiBase`) вместо hardcoded API endpoint.

### Критерии готовности: ✅ Выполнены

1. ✅ Можно переключаться между mock и API без переписывания UI (demo mode на карте, fallback axes в passport).
2. ✅ Компоненты не знают, откуда пришли данные — всё идёт через stores.

---

## Фаза F3. Стартовый экран для скринкаста ✅ РЕАЛИЗОВАНО

### Цель

Собрать первый кадр скринкаста: стартовый экран с CTA.

### GDD alignment

Прямое покрытие:

- Feature 1
- "Выбери свой путь"

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/start`** — полноценный продуктовый entry-screen.
2. **3 CTA вместо 2** (расширено сверх GDD):
   - ✨ **Свайп** → `/vibe/swipe` — "Свайпай карточки как в Тиндере"
   - 🎤 **Голос** → `/vibe/voice` — "Расскажи, чего хочешь — ИИ подберёт"
   - 🗺 **Карта** → `/map` — "Открой карту и выбери места сам"
3. **Анимация/композиция:** hover-эффекты (-translate-y-1, shadow-xl), gradient-подложки, иконки с микро-анимациями.
4. **Mobile и desktop polish:** responsive grid (`grid-cols-1 sm:grid-cols-3`), clamp-размеры.

### Критерии готовности: ✅ Выполнены

1. ✅ Кадр screenshot-worthy — чистый, финальный дизайн.
2. ✅ Переход к следующему экрану выглядит естественно.

---

## Фаза F4. Экран голосового ввода ✅ РЕАЛИЗОВАНО

### Цель

Собрать второй кадр скринкаста: voice input + AI thinking.

### GDD alignment

Прямое покрытие:

- Feature 1
- Voice-to-Vibe user flow

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/vibe/voice`** — полноценная реализация.
2. **Большой CTA с микрофоном** — круглая кнопка 28×28 с Mic-иконкой, hold-to-record.
3. **Состояния:**
   - ✅ Ожидание — "Нажмите и удерживайте"
   - ✅ Запись — красный фон, пульсирующая анимация (`animate-ping`), waveform-визуализация (7 баров с `audioLevel`), таймер записи
   - ✅ Загрузка/обработка — "ИИ думает": orbiting dots (`animate-spin-slow`), gradient loader, bouncing dots, текст "ИИ создаёт ваш профиль…"
   - ✅ Error — сообщение об ошибке + кнопка "Попробовать снова"
   - ✅ Валидация — минимум 3 секунды записи, проверка доступа к микрофону
4. **Voice waveform:** реальный AudioContext + AnalyserNode, визуализация уровня звука в реальном времени.
5. **Submit integration:** реальная отправка аудио blob через `vibeStore.voiceProfile(blob)`, MediaRecorder с `audio/webm`.
6. **Seamless transition:** при успехе — `navigateTo('/vibe/result')`.

### Критерии готовности: ✅ Выполнены

1. ✅ Экран годится в скринкаст без оправданий.
2. ✅ Переход в passport seamless.

---

## Фаза F5. Экран Vibe Passport ✅ РЕАЛИЗОВАНО

### Цель

Собрать strongest AI-proof экран для скриншота и middle shot скринкаста.

### GDD alignment

Прямое покрытие:

- Feature 1
- vibe axes visualization
- summary/tags output

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/vibe/result`** — полноценная реализация.
2. **Components:**
   - ✅ **Axes visualization** — 4 оси с progress-барами (gradient `from-accent to-accent-dark`), label/opposite labels (emoji), animated width transition.
   - ✅ **Vibe summary** — курсивный summary-блок в рамке с border, fallback текст.
   - ✅ **Extracted tags** — список тегов с `#` prefix, `bg-accent/10` pills.
   - ✅ **Transcript preview** — блок с иконкой Mic, распознанный текст запроса (условно показывается если есть `transcription`).
   - ✅ **Vector ID** — fingerprint-иконка с сокращённым UUID.
   - ✅ **Processing time** — "Обработано за X.Xс".
   - ✅ **Vibe passport title** — динамический заголовок из API ("Искатель тишины" и т.п.).
3. **CTA:**
   - ✅ `Показать рекомендации` — загрузка через `vibeStore.finalize({ limit: 10 })`, показ recommendation grid.
   - ✅ `Перейти к деталям поездки` → `/trip/new`.
   - ✅ `Уточнить свайпами` → `/vibe/swipe`.
   - ✅ `Собрать маршрут` (после показа рекомендаций) → `/trip/new`.
   - ✅ `Смотреть на карте` → `/map`.
4. **Recommendations grid:** карточки-ссылки на `/location/{id}` с изображением, category badge, density level, child_friendly, score %, description_short, reason_short, tags_match.

### Критерии готовности: ✅ Выполнены

1. ✅ Есть screenshot-ready state.
2. ✅ Нет временных лейблов/заглушек/технических текстов.

---

## Фаза F6. Экран карты рекомендаций ✅ РЕАЛИЗОВАНО

### Цель

Собрать главный wow-экран для презентации: карта с рекомендованными точками.

### GDD alignment

Прямое покрытие:

- Feature 2
- map experience after profiling/trip context

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/map`** — полноценная реализация.
2. **3D Map composition (`Map3D.vue`):**
   - ✅ Three.js/WebGL 3D-карта Краснодарского края с terrain elevation.
   - ✅ Маркеры локаций с цветовой кодировкой по density level (green/yellow/red).
   - ✅ Линии маршрута на карте.
   - ✅ Визуальная граница Краснодарского края.
   - ✅ Orbit controls, responsive resize.
3. **Side panel:**
   - ✅ Список локаций с density dots, category labels.
   - ✅ Кнопка `+` для добавления в маршрут.
   - ✅ Ссылки на `/location/{id}`.
   - ✅ Подсветка выбранной точки.
4. **Route builder прямо на карте:**
   - ✅ Collapsible panel с ordered stops.
   - ✅ Выбор транспорта (авто, общественный, пешком, велосипед).
   - ✅ Кнопка "Построить маршрут" через `routesStore.buildRoute`.
   - ✅ Отображение distance/time после построения.
5. **Filters:**
   - ✅ Category filter (11 категорий: winery, farm, trail, gastro, nature, camping, resort, extreme, cultural, beach + все).
   - ✅ Demo mode с 4 профилями (спокойный, активный, семья, гастро-тур).
   - ✅ ИИ mode (кнопка "ИИ подобрал").
6. **Data integration:** реальные запросы через `mapStore.fetchMapLocations` с фильтрами (category, bounds, limit, demo).

### Критерии готовности: ✅ Выполнены

1. ✅ Лучший визуал в презентации — полноценная 3D-карта.
2. ✅ Подходит и для скриншота, и для скринкаста.

---

## Фаза F7. Экран Location Detail / 3D Preview ✅ РЕАЛИЗОВАНО

### Цель

Собрать финальный кадр скринкаста.

### GDD alignment

Прямое покрытие:

- Feature 3
- bridge from map/recommendation to concrete place

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/location/[id]`** — полноценная product detail page.
2. **Detail hero:**
   - ✅ Full-width hero image (`45vh–55vh`), gradient overlay.
   - ✅ Title, density badge (Hidden Gem / Сезонная / Популярная), access level badge (Секретно).
   - ✅ Description short на герое.
   - ✅ Back button → `/map`, Heart (избранное).
3. **Quick Info Ribbon:**
   - ✅ Категория с emoji.
   - ✅ Цена (₽/ночь или Бесплатно).
   - ✅ Вместимость.
   - ✅ Для детей (child_friendly).
4. **About Section:** full description + tags list.
5. **Gallery Section:** горизонтальная прокрутка фотографий из `gallery_urls`.
6. **3D Splat Viewer:**
   - ✅ Кнопка "Войти в 3D" для локаций с `has_splat`.
   - ✅ Lazy load через `locationsStore.fetchLocationSplat`.
   - ✅ Full-screen modal с `SplatViewer.vue` (Gaussian Splat viewer).
   - ✅ WASD + touch controls, first-person walkthrough, mobile joystick, touch-to-look.
   - ✅ Performance optimizations (reduced DPR, half-precision covariances).
7. **Booking Card:**
   - ✅ Итого за ночь.
   - ✅ CTA "Забронировать".
   - ✅ CTA "В маршрут поездки" → `/trip/new`.
8. **Location Meta:** адрес, координаты (lat/lon).

### Критерии готовности: ✅ Выполнены

1. ✅ Третий скриншот можно брать отсюда.
2. ✅ Экран выглядит как реальный product detail page.

---

## Фаза F7.5. Техническое усиление после демо 🔶 ЧАСТИЧНО РЕАЛИЗОВАНО

### Цель

Сразу после сборки и съемки demo-first UI убрать технический долг.

### Статус: 🔶 Частично реализовано

**Что исправлено:**

1. **Broken navigation → ✅ Исправлено:**
   - Навигация ведёт на реальные продуктовые маршруты (`/start`, `/map`, `/auth/login`).
   - Footer и navbar согласованы с product route tree.
   - Admin navigation (`AdminSidebar`, `AdminBottomNav`, `AdminHeader`) ведёт на реальные маршруты.

2. **Hardcoded API endpoint → 🔶 Частично исправлено:**
   - `useApiClient` использует `useRuntimeConfig().public.apiBase`.
   - Архитектурно endpoint вынесен в runtime config.
   - Но в `nuxt.config.ts` всё ещё задан hardcoded default IP-адрес.

3. **Design system drift → ✅ Исправлено:**
   - 15 shadcn-vue компонентов используются повсеместно (`UiButton`, `UiInput`, `UiBadge`, `UiAlert`, `UiToggleGroup`, `UiSelect` и др.).
   - Единая стилизация через CSS variables и Tailwind-классы.
   - Нет ручных дублирующих кнопок/инпутов.

4. **Unused heavy dependency layer → ✅ Решено:**
   - PrimeVue убран. Используется shadcn-vue как единый UI-фреймворк.

5. **Hero/showcase code → ✅ Продуктивизировано:**
   - Promo-секции (Hero, Showcase, Features, Locations) остались для landing, но не мешают продуктовому flow.
   - Продуктовые экраны используют общую UI-систему.

### Критерии готовности: 🔶 Частично выполнены

1. ✅ Frontend is no longer just a pretty shell with hidden drift.
2. ✅ New product screens can be built without duplicating patterns.
3. 🔶 Demo UI mostly evolves into MVP UI, but environment/runtime cleanup is not fully finished.

---

## Phase F8. Trip Details Screen ✅ РЕАЛИЗОВАНО

### Goal

После съемочного минимума закрыть первый обязательный MVP step из настоящего продукта.

### GDD alignment

Прямое покрытие:

- Feature 1
- Trip Details

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/trip/new`** — полноценная продуктовая форма.
2. **Form blocks:**
   - ✅ **Dates** — date-from и date-to через `UiInput type="date"`.
   - ✅ **Budget** — tier (Эконом/Комфорт/Премиум) через `UiToggleGroup` + numeric input в рублях.
   - ✅ **Transport** — 4 варианта (Авто, Общественный, Пешком, Велосипед) через `UiToggleGroup` с иконками.
   - ✅ **Group** — adults counter (+/-), children с возрастом каждого, автосуммирование.
   - ✅ **Format** — день/выходные/многодневный.
3. **API integration:** реальная отправка через `tripsStore.createTrip` с полным payload (даты, бюджет, транспорт, группа с составом).
4. **Post-submit:**
   - ✅ Success screen с invite-ссылкой.
   - ✅ Copy-to-clipboard кнопка.
   - ✅ Links → "Мои поездки", "Открыть карту".
5. **Error handling:** `UiAlert` destructive для ошибок.

### Acceptance criteria: ✅ Выполнены

1. ✅ Экран выглядит как продуктовый, а не как временный.
2. ✅ Он собирается из общей UI-системы (UiInput, UiToggleGroup, UiButton, UiAlert).

---

## Phase F9. Auth Flow ✅ РЕАЛИЗОВАНО

### Goal

Добавить реальные auth state и protected product flow.

### GDD alignment

Поддерживающий слой для всех защищённых user journeys из GDD.

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Login screen `/auth/login`:**
   - ✅ Email + password form.
   - ✅ Show/hide password toggle.
   - ✅ Error handling (401 → "Неверный email или пароль").
   - ✅ Redirect после login (query param `redirect`).
   - ✅ Link на register.
   - ✅ Auth layout.

2. **Register screen `/auth/register`:**
   - ✅ Email + password + display name + role selection.
   - ✅ Error handling (409 → "Пользователь уже существует", 400 → validation).

3. **Auth store (`store/auth.ts`):**
   - ✅ `login()`, `register()`, `fetchProfile()`, `updateProfile()`, `logout()`.
   - ✅ Typed `UserProfile` (id, email, display_name, role, karma, vibe_vector_id).
   - ✅ Typed `TokenPair` с expires_at.

4. **JWT persistence:**
   - ✅ Tokens сохраняются в localStorage через `useApiClient.setTokens()`.
   - ✅ `restoreSession()` восстанавливает из localStorage с проверкой expires_at.
   - ✅ Cached user profile в localStorage.

5. **Guards:**
   - ✅ `middleware/auth.ts` — защита protected routes, redirect на `/auth/login?redirect=`.
   - ✅ `middleware/guest.ts` — redirect авторизованных на `/start`.
   - ✅ Protected pages: routes (`definePageMeta({ middleware: ['auth'] })`).

6. **Auto-refresh:**
   - ✅ `useApiClient` автоматически делает refresh при 401, повторяет оригинальный запрос.
   - ✅ При неудачном refresh — clearTokens + redirect на login.

### Архитектурные follow-up задачи

1. 🔧 Свести `restoreSession`, route middleware и `useApiClient.refreshTokens()` к единой session-модели.
2. 🔧 Убрать сценарий, при котором валидный refresh token не даёт войти на protected route после истечения access token.
3. 🔧 Добавить явный auth bootstrap / hydration state, чтобы страницы не принимали решение по доступу до завершения восстановления сессии.

---

## Phase F10. Swipe Flow ✅ РЕАЛИЗОВАНО

### Goal

Достроить альтернативный путь в vibe flow.

### GDD alignment

Прямое покрытие:

- Feature 1
- Emotional 3D Swipe

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/vibe/swipe`** — полноценная реализация.
2. **Swipe cards/scenes:**
   - ✅ Card stack (до 3 видимых) с perspective scaling и offset.
   - ✅ Drag gesture: PointerDown/Move/Up с threshold 100px.
   - ✅ LIKE overlay (зелёная рамка, "НРАВИТСЯ") при свайпе вправо.
   - ✅ NOPE overlay (красная рамка, "НЕТ") при свайпе влево.
   - ✅ Fly-out animation (450ms cubic-bezier).
   - ✅ Behind-card "comes forward" animation при drag.
   - ✅ Emoji-mapping по заголовку сцены (костёр→🔥, вино→🍷, горы→🏔 и т.д.).
3. **Button controls:** ❌ (X) и ❤️ (Heart) кнопки с hover-анимациями.
4. **Progress state:** progress bar, `X / N` counter, "N свайпов".
5. **Finalize transition:**
   - ✅ "ИИ анализирует" loading с orbiting dots.
   - ✅ `vibeStore.finalize()` → `navigateTo('/vibe/result')`.
   - ✅ "Профиль готов!" success state.
6. **Backend integration:** `vibeStore.fetchScenes()` на mount, `vibeStore.swipeScene(id, direction)` при каждом свайпе.
7. **Fallback scenes:** 8 demo-сцен с описаниями (костёр, вино, горы, берег, фестиваль, ферма, палатка, старый дом).

---

## Phase F11. Route Screen ✅ РЕАЛИЗОВАНО

### Goal

После trip details довести core user journey до маршрута.

### GDD alignment

Покрывает:

- Feature 1 финальный туристический сценарий
- Feature 2 route presentation
- часть Feature 4

### Статус: ✅ Полностью реализовано

**Что сделано:**

1. **Экран `/route/index`** (и `/route/[id]`) — полноценный route builder.
2. **Ordered stops:**
   - ✅ Поиск локаций с фильтрацией.
   - ✅ Добавление/удаление точек маршрута с нумерацией.
   - ✅ Category badges.
3. **Transport selection:** 4 варианта через `UiToggleGroup`.
4. **Timing/distance summary:**
   - ✅ Distance card с иконкой Ruler, formatted distance (м/км).
   - ✅ Time card с иконкой Clock, formatted time (мин/ч).
   - ✅ Per-point distance и travel time.
5. **Route plan:** timeline visualization с вертикальной gradient-линией, numbered stops.
6. **Backend integration:** `routesStore.buildRoute(locationIds, transport)`.
7. **AI route suggestion:** кнопка "ИИ, собери маршрут" (UI готов, backend-интеграция TODO).
8. **Map integration:** маршрут также встроен в `/map` через route builder panel.

### Implementation path:

1. ✅ demo route — реализовано через fallback.
2. ✅ backend heuristic route — реализовано через `routesStore.buildRoute`.
3. ❌ future graph-driven route — не реализовано.

---

## Phase F12. Group Trip Screens 🔶 ЧАСТИЧНО РЕАЛИЗОВАНО

### Goal

Добавить invite/join and group planning.

### GDD alignment

Прямое покрытие:

- Feature 1
- group planning section

### Статус: 🔶 Частично реализовано

**Что сделано:**

1. ✅ **Invite state** — при создании trip генерируется `invite_token`, формируется URL `/trip/{id}/join?token=...`.
2. ✅ **Copy invite link** — кнопка копирования в буфер с feedback "Скопировано!".
3. ✅ **Group composition** — adults + children с возрастами при создании поездки.
4. ✅ **Join screen** `/trip/:id/join` — реализован отдельный экран присоединения с именем и тегами.
5. ✅ **Members list** — есть UI просмотра участников в `/trip/[id]` и `/profile/trips`.

**Что не реализовано:**

1. ❌ **Group preference summary** — нет сводки предпочтений группы.
2. ❌ **Merged group vibe UX** — нет отдельной визуализации итогового merged-профиля группы.
3. ❌ **Compromise planning UX** — нет сценария из GDD с балансировкой интересов участников.

### Архитектурные follow-up задачи

1. 🔧 Убрать singleton-state `currentMembers` / `loading` / `error` в `tripsStore` в пользу state-per-trip или request-scoped caching.
2. 🔧 Исключить протекание списка участников одной поездки в UI другой поездки при быстрых переключениях.
3. 🔧 Разделить операции списка поездок, деталей поездки и участников на независимые loading/error каналы.

---

## Phase F13. Host Onboarding Screens 🔶 ЧАСТИЧНО РЕАЛИЗОВАНО

### Goal

Собрать второй большой сценарий продукта после tourist core.

### GDD alignment

Прямое покрытие:

- Feature 5

### Статус: 🔶 Частично реализовано

**Что сделано:**

1. **Экран `/host/index`** — полноценный 3-step wizard.
2. **Step 1 — Media upload:**
   - ✅ Drag-and-drop zone для фото/видео.
   - ✅ File type validation (image/*, video/*).
   - ✅ Upload через `useApiClient` на `/api/v1/media/upload`.
   - ✅ Error handling.
   - ✅ "Пропустить" link.
3. **Step 2 — Location form:**
   - ✅ Название, категория (select с 9 категориями), краткое описание, адрес.
   - ✅ Цена/ночь, вместимость.
   - ✅ Tags input с add/remove.
   - ✅ API integration: `locationsStore.createLocation`.
4. **Step 3 — Success:**
   - ✅ Confirmation screen.
   - 🔶 CTA "Мои локации" и "Пропустить" ведут в `/host/dashboard`, но этот маршрут пока не реализован.
5. **Progress indicator** — 3-step bar с animated transitions.

**Что не реализовано:**

1. ❌ Voice description flow (voice-to-location).
2. ❌ AI-generated draft location page.
3. ❌ Video upload с AI-обработкой.
4. ❌ Host dashboard / мои локации / бронирования / статистика.
5. ❌ Host edit/settings flows.

### Архитектурные follow-up задачи

1. 🔧 Добавить role-based middleware для host routes.
2. 🔧 Закрыть host flow от неавторизованных и non-host пользователей.
3. 🔧 Убрать битые переходы в `/host/dashboard` до появления реального маршрута или реализовать сам маршрут.

---

## Phase F14. Booking + Storytelling + Weather ❌ НЕ РЕАЛИЗОВАНО

### Goal

Постепенно расширить product depth после core MVP.

### GDD alignment

Покрывает:

- Feature 4
- Feature 6
- часть Feature 9

### Статус: ❌ Не реализовано

**Что есть:**

1. 🔶 Кнопка "Забронировать" на location detail (UI shell, без логики).
2. 🔶 Есть детальная страница локации и route entry points, которые могут стать точкой входа для будущих booking/story/weather сценариев.

**Что не реализовано:**

1. ❌ Booking screens (выбор дат, оплата, подтверждение).
2. ❌ Route storytelling player.
3. ❌ Weather state on map.
4. ❌ Live reroute UX.

---

## Phase F15. Analytics/B2G/Full GDD 🔶 ЧАСТИЧНО РЕАЛИЗОВАНО

### Goal

Довести фронт до полного покрытия GDD.

### GDD alignment

Контрольная фаза, в которой roadmap должен закрыть весь оставшийся UI-контур GDD.

### Статус: 🔶 Частично реализовано

**Что есть:**

1. ✅ Admin dashboard `/admin/index` — базовая страница состояния API/сервисов.
2. ✅ Admin locations `/admin/locations` — управление локациями (базовый список / действия).
3. 🔶 User profile уже показывает karma-level UI, но без полного Hidden Gems сценария.

**Что не реализовано:**

1. ❌ B2G views (аналитика для государственных заказчиков).
2. ❌ Analytics pages (графики, метрики, отчёты).
3. ❌ Hidden Gems UX / karma system.
4. ❌ Host dashboards (полноценное управление).
5. ❌ Richer map interactions.
6. ❌ Offline-related UX.

### Архитектурные follow-up задачи

1. 🔧 Добавить role-based middleware для admin / B2G routes.
2. 🔧 Развести доступы `tourist`, `host`, `b2g_admin` на уровне route guards и navigation model.
3. 🔧 Скрывать или перенаправлять недоступные разделы интерфейса в зависимости от роли пользователя.

---

## Frontend Sprint Plan

## Sprint F1. Product Shell + Design System ✅ ЗАВЕРШЁН

### Frontend work

1. ✅ Split marketing/app layouts (4 layouts: default, auth, dashboard, blank)
2. ✅ Create product routes (полное route tree)
3. ✅ Normalize buttons/cards/badges (15 shadcn-vue компонентов)
4. ✅ Introduce data layer and demo fixtures (6 stores, 2 composables)

---

## Sprint F2. Opening + Voice ✅ ЗАВЕРШЁН

### Frontend work

1. ✅ Start screen (`/start` с 3 CTA)
2. ✅ Voice input screen (`/vibe/voice` с MediaRecorder)
3. ✅ AI thinking transition (animated loader с orbiting dots)

---

## Sprint F3. Passport + Map ✅ ЗАВЕРШЁН

### Frontend work

1. ✅ Vibe passport (`/vibe/result` с осями, тегами, саммари, рекомендациями)
2. ✅ Recommendation map (`/map` с 3D Map3D)
3. ✅ Map markers and overlays (density colors, category filters)

---

## Sprint F4. Location Detail + Final Demo Polish ✅ ЗАВЕРШЁН

### Frontend work

1. ✅ location detail (`/location/[id]` с hero, gallery, 3D splat viewer)
2. ✅ route CTA (booking card, route link)
3. ✅ screenshot polish (финальный дизайн)
4. ✅ screencast polish (seamless transitions)

---

## Sprint F5. Trip Details + True App Flow ✅ ЗАВЕРШЁН

### Frontend work

1. ✅ trip details screen (`/trip/new`)
2. ✅ route transition (route builder на карте и отдельный экран)
3. ✅ auth integration (login/register + JWT + middleware)
4. ✅ replace demo navigation shortcuts with real flow

---

## Mocking Policy For Frontend

## Allowed temporarily

1. Demo content fixtures
2. Curated recommendation list
3. Fake loading timing
4. Static map background
5. Faux 3D preview shell

## Not allowed to fake badly

1. Final screen composition
2. Navigation flow
3. Visual identity
4. Component hierarchy
5. Data model shapes

## Preferred pattern

Good:

- `useRecommendations()` returns mock or API
- same component renders both

Bad:

- hardcoded arrays directly inside final product components
- separate "demo screen" and "real screen" copies

---

## What Can Be Shot Early

## First screenshots

1. ✅ Vibe passport — готов
2. ✅ Recommendation map — готов
3. ✅ Location detail / 3D preview — готов

## First screencast

Можно снимать: ✅

Весь demo flow реализован:
- ✅ Start screen → Voice/Swipe → Vibe Passport → Map → Location Detail

При условии, что визуально это уже выглядит как финальный продукт. ✅

---

## Планка качества

## Готово для демо ✅

- ✅ экраны выглядят как финальные;
- ✅ данные могут быть частично замоканы;
- ✅ переходы и состояния отполированы;
- ✅ скриншоты можно напрямую вставлять в презентацию.

## Готово для MVP 🔶 Частично

- core flow подключен к бэкенду:
  - ✅ auth
  - ✅ vibe
  - ✅ trip details
  - ✅ recommendations
  - ✅ location detail
  - ✅ предварительный маршрут
  - ✅ базовый invite/join flow
- Не завершено:
  - ❌ booking
  - ❌ полноценный group planning из GDD
  - ❌ live routing
  - ❌ host post-onboarding flows

## Полное покрытие GDD ❌

- ❌ реализованы все туристические, хостовые, routing-, media-, booking-, live-, аналитические и B2G-сценарии.

---

## Риски

### Риск 1. Энергия landing page не переносится в продуктовый flow ✅ Снижен

- ✅ Продуктовые экраны реализованы как полноценные product screens, а не прокрутка лендинга.

### Риск 2. Красивое демо, но неправильная будущая архитектура ✅ Снижен

- ✅ Нормальные маршруты, 6 stores, composables, typed DTOs.
- ✅ API client с runtime config, JWT refresh, FormData support.

### Риск 3. Полировка UI без синхронизации с бэкендом ✅ Снижен

- ✅ Все stores делают реальные API-запросы.
- ✅ Payloads типизированы и соответствуют бэкенд-контрактам.

### Риск 4. Singleton-state в store создаёт гонки между экранами 🔶 Актуален

- 🔶 `trips`, `locations`, `routes` используют общие `current*`, `loading`, `error` state для нескольких сценариев.
- 🔶 При параллельных загрузках и быстрых переходах возможны stale-data эффекты и протекание состояния между страницами.

### Риск 5. Auth и role access model неполные 🔶 Актуален

- 🔶 route middleware проверяет только наличие access token, а не полную session-state модель.
- 🔶 роли пользователя уже существуют в модели данных, но ещё не применяются как системное ограничение на host/admin контур.

---

## Definition of done фронтенда по этапам

### Demo-first готов ✅

- ✅ первый 30-секундный скринкаст можно записать;
- ✅ все 2-3 ключевых скриншота для презентации можно экспортировать;
- ✅ экраны уже соответствуют целевому релизному виду и ощущению.

### Core MVP готов 🔶

- ✅ пользователь может пройти реальный продуктовый сценарий с интеграцией с бэкендом;
- 🔶 demo-хаки в основном заменены внутри без редизайна экранов, но остались пробелы в booking, AI route, host dashboard и части group planning.
- 🔶 архитектурные P0-фиксы по auth/session-state, role access и singleton-store-state ещё не завершены.

### Полное покрытие GDD ❌

- ❌ frontend covers complete Deep Krai product vision across tourist, host, routing, weather, booking, storytelling, and B2G layers.

---

## Сводная таблица статусов фаз

| Фаза | Название | Статус |
| --- | --- | --- |
| F0 | Основа визуальной системы | ✅ Реализовано |
| F1 | Информационная архитектура | ✅ Реализовано |
| F2 | Data layer | ✅ Реализовано |
| F3 | Стартовый экран | ✅ Реализовано |
| F4 | Голосовой ввод | ✅ Реализовано |
| F5 | Vibe Passport | ✅ Реализовано |
| F6 | Карта рекомендаций | ✅ Реализовано |
| F7 | Location Detail / 3D | ✅ Реализовано |
| F7.5 | Техническое усиление | 🔶 Частично |
| F8 | Trip Details | ✅ Реализовано |
| F9 | Auth Flow | ✅ Реализовано |
| F10 | Swipe Flow | ✅ Реализовано |
| F11 | Route Screen | ✅ Реализовано |
| F12 | Group Trip | 🔶 Частично |
| F13 | Host Onboarding | 🔶 Частично |
| F14 | Booking/Story/Weather | ❌ Не реализовано |
| F15 | Analytics/B2G/Full GDD | 🔶 Частично |

---

## Архитектурный backlog после code review

### P0

1. Ввести role-based route middleware для `host` и `admin/B2G` контуров.
2. Пересобрать auth/session lifecycle так, чтобы refresh token корректно восстанавливал доступ на protected routes.
3. Разделить singleton-state в `tripsStore`, `locationsStore`, `routesStore` на scoped state или независимые request slices.

### P1

1. Убрать битые переходы на ещё несуществующие маршруты (`/host/dashboard` и связанные host flows).
2. Добавить явный auth bootstrap state для layout/pages, чтобы не было ложных редиректов и миганий UI.
3. Привести navigation model в соответствие с ролью пользователя и реальной доступностью маршрутов.

### P2

1. Дотянуть frontend DTO/payload coverage до продуктовой модели GDD, включая обязательные поля вроде `format` в trip flow.
2. Разделить service health/admin shell и будущий B2G analytics contour на отдельные route slices и access rules.
