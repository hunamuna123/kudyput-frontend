# Roadmap фронтенда Deep Krai

## Назначение

Этот roadmap задает frontend-план с приоритетом:

1. Сначала собрать screenshot-ready и screencast-ready experience.
2. При этом UI должен выглядеть и ощущаться так же, как в будущей релизной версии.
3. После съемочного этапа этот же UI должен без перелома перейти в полноценный MVP product flow.

Frontend не должен быть "одноразовым демо-лендингом". Даже если часть данных временно мокается, интерфейсы, маршруты, экранная логика и visual language должны быть релизного качества.

## GDD как источник истины

Главный источник истины для frontend-плана:

- [deep_krai_gdd.md](/c:/Users/lowcoware/Projects/kudyput-frontend/docs/deep_krai_gdd.md)

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

1. Nuxt app shell:
   - app root;
   - default layout;
   - home page.

2. Marketing/promo modules:
   - hero;
   - showcase slider;
   - features section;
   - locations section.

3. Shared visual base:
   - theme colors;
   - fonts;
   - base styling;
   - navbar;
   - footer.

4. Initial reusable UI:
   - button;
   - section title.

### Частично реализовано

1. Visual identity exists, but the product-screen system is not normalized yet.
2. There is an app shell, but not a real product route tree.
3. There is a minimal store, but not a real data layer.

### Пока не реализовано

1. `/vibe/voice`
2. `/vibe/result`
3. `/map`
4. `/location/:id` or `/location/:slug`
5. `/trip/new`
6. auth UI
7. swipe flow
8. route screen
9. host onboarding screens
10. booking/story/weather/B2G screens

### Что это значит для планирования

Фронтенд-роадмап стартует с качественного landing-shell, а не с полноценного продуктового UI:

- F0 is partially done.
- The main near-term work is not "more landing polish", but converting the shell into real product screens.
- Biggest blockers are:
  - product routing;
  - data layer;
  - all key demo screens.

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

## Фаза F0. Основа визуальной системы

### Цель

Закрепить визуальный язык продукта, на котором потом будут собраны все demo и product screens.

### GDD alignment

Подготавливает визуальный фундамент для всех экранов из sitemap GDD.

### Текущее состояние

Частично уже сделано.

### Уже реализовано

1. Theme tokens
2. Fonts
3. Base styling
4. Navbar/footer
5. Initial UI primitives

### Что осталось доделать

1. Привести все CTA/кнопки к общим UI-компонентам.
2. Добавить переиспользуемые примитивы card/badge/stat/input/screen-shell.
3. Принять решение, нужен ли PrimeVue прямо сейчас.

### Следующий handoff

Блокеров со стороны бэкенда нет. Это можно усиливать сразу.

### Результаты фазы

1. Токены темы
2. Иерархия шрифтов и типографики
3. Система поверхностей/card/button/input
4. Правила отступов между секциями
5. Правила анимации
6. Правила адаптивной сетки

### Текущее состояние

Уже есть:

- цвета темы;
- шрифты;
- базовые стили;
- navbar/footer;
- landing-секции.

### Что дальше нужно

1. Вынести переиспользуемые UI-примитивы:
   - button
   - badge
   - card
   - stat chip
   - input shell
   - section container
   - screen header
2. Убрать разнобой между вручную написанными кнопками и `AppButton`.
3. Решить, нужен ли PrimeVue реально, или он пока просто тащит лишнюю сложность.

### Критерии готовности

1. Новый экран собирается из уже существующих UI-паттернов.
2. Нет ощущения "лендинг отдельно, продукт отдельно".

---

## Фаза F1. Информационная архитектура продуктового флоу

### Цель

Перестроить проект из просто landing page в product shell.

### GDD alignment

Прямая привязка к sitemap и journey из GDD:

- `/vibe`
- `/trip/new`
- `/trip/:id/join`
- `/location/:slug`
- map/product screens

### Текущее состояние

Не реализовано в product sense.

### Уже реализовано

1. `/`
2. default layout

### Что осталось доделать

1. Product route tree
2. Marketing vs app navigation structure
3. Transitions between demo-critical screens

### Следующий handoff

Can start as soon as backend payloads are frozen.

### Результаты фазы

1. Маршруты:
   - `/`
   - `/vibe/voice`
   - `/vibe/result`
   - `/map`
   - `/location/:id` or `/location/:slug`
   - `/trip/new`
   - optional `/demo`

2. Layouts:
   - marketing layout
   - app/product layout

3. Navigation model:
   - landing -> product CTA
   - product flow transitions

### Почему именно сейчас

Скринкаст надо снимать не как скролл лендинга, а как последовательность product screens.

### Критерии готовности

1. Скринкаст можно снять как реальный app flow.
2. Не требуется прыгать между несвязанными промо-блоками.

---

## Фаза F2. Demo data layer

### Цель

Сделать чистый способ подмены данных без разбрасывания хардкода по экранам.

### GDD alignment

Сохраняет соответствие frontend state моделям из GDD и backend contracts.

### Текущее состояние

Практически не реализовано.

### Уже реализовано

1. Minimal API URL store only.

### Что осталось доделать

1. Feature stores
2. composables
3. mock/API switch
4. typed DTO strategy

### Следующий handoff

Backend Phase 0 should feed this phase with payload examples.

### Результаты фазы

1. `stores/` по сущностям:
   - auth
   - vibe
   - locations
   - trips
   - map

2. `composables/`:
   - `useApiClient`
   - `useDemoMode`
   - `useVoiceProfile`
   - `useRecommendations`
   - `useMapLocations`
   - `useLocationDetail`

3. Demo fixtures:
   - demo vibe passport
   - demo map points
   - demo location details
   - demo-предпросмотр маршрута

4. Data-source policy:
   - `mock`
   - `api`
   - `hybrid`

### Важно

Временные mock data должны совпадать с backend payloads.

### Критерии готовности

1. Можно переключаться между mock и API без переписывания UI.
2. Компоненты не знают, откуда пришли данные.

---

## Фаза F3. Стартовый экран для скринкаста

### Цель

Собрать первый кадр скринкаста: стартовый экран с двумя CTA.

### GDD alignment

Прямое покрытие:

- Feature 1
- "Выбери свой путь"

### Текущее состояние

Частично реализовано на базе current hero.

### Уже реализовано

1. Hero visual direction
2. CTA area

### Что осталось доделать

1. Explicit 2-CTA product entry
2. More product-like framing
3. Screenshot/screencast polish

### Следующий handoff

Блокеров со стороны бэкенда нет.

### Результаты фазы

1. Hero screen как product entry, а не просто маркетинговый блок.
2. Два CTA:
   - `ИИ подберет`
   - `Выберу сам`
3. Анимация/композиция, подходящая для opening shot.
4. Mobile and desktop polish.

### Замечания

Текущий `HeroSection` можно использовать как базу, но его надо превратить в реальный entry-screen продукта.

### Критерии готовности

1. Кадр screenshot-worthy.
2. Переход к следующему экрану выглядит естественно.

---

## Фаза F4. Экран голосового ввода

### Цель

Собрать второй кадр скринкаста: voice input + AI thinking.

### GDD alignment

Прямое покрытие:

- Feature 1
- Voice-to-Vibe user flow

### Текущее состояние

Не реализовано.

### Уже реализовано

1. Только общие визуальные основы.

### Что осталось доделать

1. Маршрут/экран
2. Состояние записи
3. Состояние "ИИ думает"
4. Интеграция отправки

### Следующий handoff

Нужна заморозка voice-payload со стороны бэкенда, а не полная готовность реального AI.

### Результаты фазы

1. Экран `/vibe/voice`
2. Большой CTA с микрофоном
3. Состояния:
   - ожидание
   - запись
   - загрузка
   - "ИИ думает"
   - success
   - error
4. Voice waveform / pulse / ambient motion
5. Submit integration with backend contract

### Временное упрощение

Допустимо:

- не писать реальную запись с микрофона в первую итерацию;
- использовать готовый demo clip / stub submit;
- но UX должен быть релизоподобным.

### Что нельзя подделывать визуально

- loading state;
- transition into passport;
- timing and pacing.

### Критерии готовности

1. Экран годится в скринкаст без оправданий.
2. Переход в passport seamless.

---

## Фаза F5. Экран Vibe Passport

### Цель

Собрать strongest AI-proof экран для скриншота и middle shot скринкаста.

### GDD alignment

Прямое покрытие:

- Feature 1
- vibe axes visualization
- summary/tags output

### Текущее состояние

Не реализовано.

### Уже реализовано

1. Только общие основы типографики и layout.

### Что осталось доделать

1. Визуализация осей
2. Блок summary/tags
3. Композиция passport-экрана
4. CTA на переход к карте

### Следующий handoff

Needs stable `/profile/voice` response example.

### Результаты фазы

1. Экран `/vibe/result`
2. Components:
   - axes visualization
   - vibe summary
   - extracted tags
   - optional transcript preview
3. CTA:
   - `Показать рекомендации`
   - optional `Уточнить свайпами`

### Требование к дизайну

Этот экран должен выглядеть максимально финально. Это один из двух ключевых слайдов презентации.

### Критерии готовности

1. Есть screenshot-ready state.
2. Нет временных лейблов/заглушек/технических текстов.

---

## Фаза F6. Экран карты рекомендаций

### Цель

Собрать главный wow-экран для презентации: карта с рекомендованными точками.

### GDD alignment

Прямое покрытие:

- Feature 2
- map experience after profiling/trip context

### Текущее состояние

Не реализовано.

### Уже реализовано

1. Только промо-секция локаций как визуальный референс.

### Что осталось доделать

1. Настоящий экран карты
2. Spatial-композиция для демо
3. Overlays рекомендаций
4. Интеграция DTO

### Следующий handoff

Главный блокер здесь — map payload со стороны бэкенда.

### Результаты фазы

1. Экран `/map`
2. Hero spatial map composition:
   - outline/scene of Krasnodar region
   - glowing markers
   - selected recommendation markers
   - layered depth and atmosphere
3. Side panel / overlay with recommendation snippets
4. Optional mode switch:
   - recommendations
   - all locations

### Важно

На первой итерации допустимо не делать честный full 3D globe. Но экран должен выглядеть как будущий продукт, а не как placeholder chart.

### Технический подход

Можно идти этапами:

1. beautiful pseudo-3D map scene;
2. interactive map with mock points;
3. backend-fed points;
4. richer spatial interactions later.

### Критерии готовности

1. Это лучший визуал в презентации.
2. Подходит и для скриншота, и для скринкаста.

---

## Фаза F7. Экран Location Detail / 3D Preview

### Цель

Собрать финальный кадр скринкаста.

### GDD alignment

Прямое покрытие:

- Feature 3
- bridge from map/recommendation to concrete place

### Текущее состояние

Не реализовано.

### Уже реализовано

1. Только визуальный референс через текущую секцию карточек.

### Что осталось доделать

1. Detail page
2. media/3D preview shell
3. CTA section

### Следующий handoff

Can start once backend location detail payload and demo content are frozen.

### Результаты фазы

1. Экран `/location/:id`
2. Detail hero:
   - title
   - category
   - image or 3D preview
   - short description
   - tags
   - CTA `Собрать маршрут`
3. Optional faux-3D preview block if real splat viewer еще не готов

### Временное упрощение

Если real 3D-splat не готов:

- используем красивый pseudo-immersive preview container;
- но layout должен остаться тем же и потом принять реальный viewer.

### Критерии готовности

1. Третий скриншот можно брать отсюда.
2. Экран выглядит как реальный product detail page.

---

## Фаза F7.5. Техническое усиление после демо

### Цель

Сразу после сборки и съемки demo-first UI убрать замечания, которые на review будут выглядеть как неаккуратная или хрупкая база для роста продукта.

### Почему именно здесь

До demo-first можно терпеть отдельные временные компромиссы ради скорости, но после демо они начнут мешать масштабировать landing-shell в настоящий продуктовый UI.

### Обязательные исправления по текущему code review

1. Broken navigation:
   - navbar/footer ведут на `#routes`, `#about`, `#locations`, но не все эти точки реально существуют как product IA;
   - footer ведет на `/host`, а такого маршрута пока нет.
   - Почему это плохо:
     - интерфейс обещает структуру приложения, которой еще нет;
     - marketing/navigation слой начинает расходиться с реальным product flow;
     - на review это считывается как слабая информационная архитектура и хрупкая навигация.

2. Hardcoded API endpoint:
   - store держит `1.1.1.1:8000`;
   - это не годится ни для dev, ни для deploy, ни для feature stores.
   - Почему это плохо:
     - конфигурация окружений зашивается в код;
     - дальше такие исключения быстро расползаются по приложению;
     - на review это выглядит как отсутствие нормального runtime config/data layer.

3. Design system drift:
   - есть `AppButton` и `SectionTitle`, но реальные модули продолжают рисовать кнопки/заголовки вручную;
   - это быстро разъедет UI по мере роста экранов.
   - Почему это плохо:
     - один и тот же паттерн начинает жить в нескольких несовместимых реализациях;
     - каждый новый экран повышает стоимость визуальных правок;
     - на review это выглядит как отсутствие контроля над frontend architecture.

4. Unused heavy dependency layer:
   - PrimeVue уже подключен в проект, но фактически не используется;
   - это лишняя сложность, пока не принято осознанное решение по UI stack.
   - Почему это плохо:
     - в проект уже занесен второй UI-слой без явной пользы;
     - появляется риск смешения собственных компонентов и чужой дизайн-системы;
     - на review это выглядит как лишняя зависимость и неясное архитектурное направление.

5. Hero/showcase code not yet product-safe:
   - inline styles;
   - remote image usage in promo slider;
   - no unified product navigation behavior.
   - Почему это плохо:
     - promo-only код начинает притворяться продуктовым фундаментом;
     - потом такие секции приходится либо переписывать, либо тащить внутрь app flow как технический долг;
     - на review это выглядит как смешение маркетингового shell и продуктового UI.

### Результаты фазы

1. Clean navigation map
2. Настоящая env-driven конфигурация API
3. Shared UI primitives enforced in modules
4. PrimeVue keep/remove decision
5. Reduced promo-only leftovers before MVP screens multiply

### Критерии готовности

1. Frontend is no longer just a pretty shell with hidden drift.
2. New product screens can be built without duplicating patterns.
3. Demo UI smoothly evolves into MVP UI instead of forking away from it.

---

## Phase F8. Trip Details Screen

### Goal

После съемочного минимума закрыть первый обязательный MVP step из настоящего продукта.

### GDD alignment

Прямое покрытие:

- Feature 1
- Trip Details

### Текущее состояние

Не реализовано.

### Уже реализовано

1. No dedicated product form yet.

### Что осталось доделать

1. Trip form UI
2. form state
3. API integration
4. post-submit transition

### Следующий handoff

Backend trip API already exists, so this can move quickly after demo screens.

### Deliverables

1. Экран `/trip/new`
2. Form blocks:
   - dates
   - budget
   - transport
   - group
   - format
3. Интеграция сохранения в бэкенд
4. Успешный переход в flow маршрута/рекомендаций

### Acceptance criteria

1. Экран выглядит как продуктовый, а не как временный.
2. Он собирается из общей UI-системы, а не верстается заново вручную.

---

## Phase F9. Auth Flow

### Goal

Добавить реальные auth state и protected product flow.

### GDD alignment

Поддерживающий слой для всех защищенных user journeys из GDD.

### Текущее состояние

Не реализовано на UI-уровне.

### Уже реализовано

1. No real auth UX yet.

### Что осталось доделать

1. Auth views or modal flow
2. token persistence
3. protected routing

### Следующий handoff

Backend auth APIs already exist, so frontend auth is mostly an execution task.

### Deliverables

1. login/register screens or modal flow
2. auth store
3. JWT persistence
4. guard for protected screens

### Why not first

Auth важен, но не должен блокировать visual demo-first сборку.

---

## Phase F10. Swipe Flow

### Goal

Достроить альтернативный путь в vibe flow.

### GDD alignment

Прямое покрытие:

- Feature 1
- Emotional 3D Swipe

### Текущее состояние

Не реализовано.

### Уже реализовано

1. None.

### Что осталось доделать

1. Swipe scene screen
2. card interactions
3. progress/finalize transition

### Следующий handoff

Backend scenes/swipe/finalize APIs already exist, so this is mostly a frontend build task once priorities reach it.

### Deliverables

1. `/vibe/swipe`
2. swipe cards/scenes
3. progress state
4. finalize transition

---

## Phase F11. Route Screen

### Goal

После trip details довести core user journey до маршрута.

### GDD alignment

Покрывает:

- Feature 1 финальный туристический сценарий
- Feature 2 route presentation
- часть Feature 4

### Deliverables

1. Экран предварительного маршрута
2. ordered stops
3. fit explanations
4. timing/distance summary

### Implementation path

1. demo route
2. backend heuristic route
3. future graph-driven route

---

## Phase F12. Group Trip Screens

### Goal

Добавить invite/join and group planning.

### GDD alignment

Прямое покрытие:

- Feature 1
- group planning section

### Deliverables

1. invite state
2. join screen
3. members list
4. group preference summary

---

## Phase F13. Host Onboarding Screens

### Goal

Собрать второй большой сценарий продукта после tourist core.

### GDD alignment

Прямое покрытие:

- Feature 5

### Deliverables

1. `/host`
2. voice + video upload flow
3. progress state
4. generated draft location page

---

## Phase F14. Booking + Storytelling + Weather

### Goal

Постепенно расширить product depth после core MVP.

### GDD alignment

Покрывает:

- Feature 4
- Feature 6
- часть Feature 9

### Deliverables

1. booking screens
2. route storytelling player
3. weather state on map
4. live reroute UX

---

## Phase F15. Analytics/B2G/Full GDD

### Goal

Довести фронт до полного покрытия GDD.

### GDD alignment

Контрольная фаза, в которой roadmap должен закрыть весь оставшийся UI-контур GDD.

### Must include

1. B2G views
2. analytics pages
3. hidden gems UX
4. host dashboards
5. richer map and offline-related UX

---

## Frontend Sprint Plan

## Sprint F1. Product Shell + Design System

### Frontend work

1. Split marketing/app layouts
2. Create product routes
3. Normalize buttons/cards/badges
4. Introduce data layer and demo fixtures

### Backend dependency

Needs only Phase 0 payload freeze.

---

## Sprint F2. Opening + Voice

### Frontend work

1. Start screen
2. Voice input screen
3. AI thinking transition

### Backend dependency

Needs:

1. `/profile/voice` contract
2. demo response examples

---

## Sprint F3. Passport + Map

### Frontend work

1. Vibe passport
2. Recommendation map
3. Map markers and overlays

### Backend dependency

Needs:

1. `/profile/finalize`
2. `/map/locations`

---

## Sprint F4. Location Detail + Final Demo Polish

### Frontend work

1. location detail
2. route CTA
3. screenshot polish
4. screencast polish

### Backend dependency

Needs:

1. `/locations/{id}`
2. optional route preview

---

## Sprint F5. Trip Details + True App Flow

### Frontend work

1. trip details screen
2. route transition
3. auth integration
4. replace demo navigation shortcuts with real flow

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

1. Vibe passport
2. Recommendation map
3. Location detail / 3D preview

## First screencast

Можно снимать сразу после F4, даже если еще не готовы:

- auth
- real trip details persistence
- real route building
- invite/group flow

При условии, что визуально это уже выглядит как финальный продукт.

---

## Планка качества

## Готово для демо

- экраны выглядят как финальные;
- данные могут быть частично замоканы;
- переходы и состояния отполированы;
- скриншоты можно напрямую вставлять в презентацию.

## Готово для MVP

- core flow подключен к бэкенду:
  - auth
  - vibe
  - trip details
  - recommendations
  - location detail
  - предварительный маршрут

## Полное покрытие GDD

- реализованы все туристические, хостовые, routing-, media-, booking-, live-, аналитические и B2G-сценарии.

---

## Риски

### Риск 1. Энергия landing page не переносится в продуктовый flow

Как снижать:

- рано переходить от секций к настоящим экранам;
- не строить демо вокруг простого скролла страницы.

### Риск 2. Красивое демо, но неправильная будущая архитектура

Как снижать:

- использовать нормальные маршруты, store и composables;
- держать переключение mock/API в одном месте.

### Риск 3. Полировка UI без синхронизации с бэкендом

Как снижать:

- рано замораживать форму payload;
- строить фронтенд только на переданных и согласованных контрактах.

---

## Definition of done фронтенда по этапам

### Demo-first готов

- первый 30-секундный скринкаст можно записать;
- все 2-3 ключевых скриншота для презентации можно экспортировать;
- экраны уже соответствуют целевому релизному виду и ощущению.

### Core MVP готов

- пользователь может пройти реальный продуктовый сценарий с интеграцией с бэкендом;
- demo-хаки заменены внутри без редизайна экранов.

### Полное покрытие GDD

- frontend covers complete Deep Krai product vision across tourist, host, routing, weather, booking, storytelling, and B2G layers.
