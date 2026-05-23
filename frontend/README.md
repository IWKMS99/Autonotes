# 🎓 Autonotes Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![React Router](https://img.shields.io/badge/React_Router-7.9+-orange?logo=reactrouter)
![Axios](https://img.shields.io/badge/Axios-HTTP_client-green)

Клиентское приложение для сервиса Autonotes.

</div>

## ✨ Особенности реализации

*   **Аутентификация**: Полная поддержка JWT (хранение в LocalStorage, интерцепторы Axios для добавления заголовка `Authorization`, авто-логаут при 401 ошибке).
*   **Real-time UX**: Дэшборд автоматически опрашивает сервер (Polling) каждые 5 секунд, если в списке есть конспекты со статусом `PROCESSING`, чтобы пользователь увидел результат без перезагрузки страницы.
*   **Валидация**: Проверка типов файлов (изображения JPG/PNG/GIF) и размера (до 50 МБ) на клиенте перед отправкой.
*   **Защищенные маршруты**: Guard в `app/router.js` не позволяет неавторизованным пользователям попасть на внутренние страницы.

## 🚀 Запуск в составе Docker Compose (Рекомендуемый способ)

Фронтенд является частью общего `docker-compose.yml` проекта. Для запуска всего приложения (включая бэкенд и базу данных) выполните команду в корневой директории проекта:

```bash
docker compose up --build -d
```
После этого приложение будет доступно по адресу **http://localhost:3000**.

## 💻 Запуск для локальной разработки

Этот способ подходит, если вы хотите работать только над фронтендом, при условии, что бэкенд-сервис уже запущен.

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
Создайте файл `.env` в этой папке (`frontend/.env`):
```properties
REACT_APP_API_BASE_URL=/api/v1
```

### 3. Запуск dev-сервера
```bash
npm start
```
Приложение откроется на `http://localhost:3000`.

## 📡 Взаимодействие с API

Приложение использует библиотеку **Axios** для всех HTTP-запросов. Конфигурация находится в `src/shared/api/client.js`.

### 🔐 Глобальная конфигурация (Axios)
*   **Base URL**: Берется из переменной окружения `REACT_APP_API_BASE_URL`.
*   **Request Interceptor**: Автоматически добавляет заголовок `Authorization: Bearer <token>`, если токен есть в `localStorage`.
*   **Response Interceptor**: Если сервер возвращает `401 Unauthorized`, приложение автоматически удаляет токен и перенаправляет пользователя на `/login`.

## 📁 FSD Structure

```text
src/
  app/        # bootstrap, providers, router
  pages/      # page composition (no direct API calls)
  widgets/    # composed UI blocks
  features/   # use-cases and orchestration
  entities/   # domain API + mappers
  shared/     # shared api client, ui states, utils, constants
```

## 🧱 FSD Architecture Rules

В проекте используется Feature-Sliced Design со слоями:
- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

Правила импорта:
- Импорты идут только сверху вниз по слоям: `app -> pages -> widgets -> features -> entities -> shared`.
- Запрещены обратные зависимости (например `entities` не импортирует `features/pages/widgets/app`).
- Срезы импортируются через public API (`index.js`) слоя/среза.
- В `pages` запрещены прямые HTTP/API-вызовы и бизнес-логика: только композиция виджетов и wiring feature-сценариев.
- API, DTO mapping и вычисления домена размещаются в `entities/*` и `features/*/model`.

Проверка границ слоёв выполняется ESLint-правилами в `package.json`.
