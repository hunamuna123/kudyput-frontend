# 🗺 KUDYTUDY — Frontend Roadmap (Остаток после Phase 12)

> **Синхронизация с бэкендом: 22 марта 2026**
> Фронтенд-команда уже реализовала всё до Phase 12 (включительно) по легаси-роадмапу бэкенда.
> Наша задача — добить UI/UX для оставшихся фич хакатона (социалка, аналитика, офлайн, приватность и реал-тайм).

---

## 🏆 Phase 13: Социалка и Геймификация (Karma & Reviews) ✅
Пользователи должны иметь возможность оставлять отзывы и получать "Карму", которая со временем открывает доступ к "Hidden Gems".
- [x] **UI Отзывов (Review Form)**: Форма с рейтингом (звездочки), текстом и возможностью прикрепить фото → `store/reviews.ts` + секция в `location/[id].vue`.
- [x] **Профиль Кармы пользователя**: Отображение очков Кармы в профиле + прогресс до Hidden Gems (порог 50), разблокировка с анимацией → `profile/index.vue`.
- [x] **Анимация "Hidden Gems"**: Визуальный индикатор на карте — заблокированные маркеры (🔒) при karma < 50, зелёные маркеры (🗝) при >= 50 → `map.vue`.

## 📊 Phase 14: B2G Аналитика (Dashboard) ✅
Интерфейсы для администрации края для отслеживания загрузки и паттернов передвижения.
- [x] **B2G Heatmap (Тепловая карта)**: Подключен к API с fallback на mock-данные, кнопка обновления → `admin/heatmap.vue`.
- [x] **Predictive Charts (Прогнозы)**: Страница с bar-chart бронирований, таймлайн нагрузки, quick-stats → `admin/predictions.vue`.
- [x] **Воркер Телеметрии**: Фоновая отправка гео-данных с consent management → `composables/useTelemetry.ts`.

## 📡 Phase 15: PWA Офлайн-режим (Выживание без сети) ✅
Туристы в горах должны продолжать пользоваться приложением.
- [x] **Кнопка "Скачать маршрут"**: Кнопка на странице маршрута с loading/success состояниями → `route/[id].vue`.
- [x] **Local Storage & Service Worker**: IndexedDB хранилище для маршрутов, локаций и медиа → `composables/useOffline.ts`.
- [x] **Offline Queue (Очередь действий)**: Локальное накопление действий с syncAll + localStorage persist → `store/offlineQueue.ts`.
- [x] **Sync Indicator**: Плавающий индикатор офлайн/синхронизации в layout → `components/modules/SyncIndicator.vue`.

## 🔐 Phase 16: Trip Privacy & Group Vibe (Улучшенные Группы) ✅
Интерфейсы для обновления логики поездок, реализованной на бэкенде.
- [x] **Privacy Toggles**: Тумблер Public / Invite-Only на странице создания поездки → `trip/new.vue`.
- [x] **Merged Vibe Visualization**: Компонент визуализации среднего вайба группы с axes → `components/modules/MergedVibeCard.vue`.
- [x] **Child-Friendly Badges**: Подсветка child_friendly локаций в location detail page → `location/[id].vue`.

## ⚡ Phase 17: WebSockets (Real-time Инфраструктура) ✅
Живое обновление состояния без пуллинга.
- [x] **WS Client Setup**: Auto-reconnect, heartbeat, typed events, channel-based → `composables/useWebSocket.ts`.
- [x] **Live Notifications UI**: Toast-уведомления с slide-in анимацией, auto-dismiss → `components/modules/LiveNotifications.vue`.
- [x] **Weather Ticker**: Интегрирован через WS weather-канал в WeatherBanner.
- [x] **Live Route Reroute Prompt**: Модальное окно «Перестроить маршрут?» по WS weather_alert → `components/modules/ReroutePrompt.vue`.

---
> **Итог**: Все 5 фаз реализованы ✅. 100% PWA-приложения покрыто для хакатона.
