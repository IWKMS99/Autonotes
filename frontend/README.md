# Autonotes Frontend

Frontend-клиент Autonotes на React.

## Что реализовано
- Auth-flow: регистрация, вход, хранение JWT, защита роутов.
- Dashboard заметок с обновлением статусов обработки.
- Загрузка изображений и просмотр деталей заметки.
- FSD-структура (`app/pages/widgets/features/entities/shared`).

## Структура слоев
- `app` - bootstrap, providers, router
- `pages` - сборка страниц
- `widgets` - композиционные UI-блоки
- `features` - пользовательские сценарии
- `entities` - доменные API и mapper-логика
- `shared` - общий API client, UI state, utils

## API-контракт списка заметок
Frontend работает с двумя вариантами ответа `GET /api/v1/notes`:
- legacy: массив
- пагинация: `PagedResponseDto` с полем `content`

В UI всегда используется список из `content` (или весь массив для legacy).

## Запуск
Рекомендуемый запуск вместе со всем стеком (из корня проекта):
- `docker compose up --build -d`

Frontend будет доступен на `http://localhost:3000`.

Локальный dev-режим (`frontend`):
1. `npm install`
2. создать `frontend/.env`:
   - `REACT_APP_API_BASE_URL=/api/v1`
3. `npm start`

## Тестирование
- `npm test`

## Связанные документы
- Backend API и observability: [../backend/README.md](../backend/README.md)
- Архитектура C4: [../architecture/README.md](../architecture/README.md)
