# Autonotes — Architecture (LikeC4)

Диаграммы архитектуры для [issue #7](https://github.com/IWKMS99/Autonotes/issues/7): **Frontend**, **Backend** и **ML Service** (часть платформы, код в разработке).

Модель — [LikeC4](https://likec4.dev/) as code, синхронизирована со структурой репозитория.

## Диаграммы

| Уровень | View ID | Описание |
|---------|---------|----------|
| **C1** | `c1_system_context` | Студент ↔ Autonotes |
| **C2** | `c2_containers` | Все контейнеры (Frontend, Backend, ML, PG, MinIO, RabbitMQ) |
| **C2** | `c2_async_processing` | Только async-цепочка: outbox → MQ → ML → result |
| **C3** | `c3_backend` | Spring: controllers, security, notes, outbox, filestorage |
| **C3** | `c3_frontend` | React: router, services, UI, Axios |
| **C3** | `c3_ml` | Планируемый ML pipeline (#planned) |
| **Dynamic** | `dynamic_auth` | Sequence: регистрация / логин |
| **Dynamic** | `dynamic_create_note` | Sequence: upload → ML → polling |

## Быстрый старт

```bash
cd architecture
npm install
npm start
```

Расширение VS Code: [LikeC4](https://marketplace.visualstudio.com/items?itemName=likec4.likec4-vscode).

## Экспорт PNG

```bash
npm run export:png
```

Файлы: `dist/src/<view-id>.png`.

## Структура исходников

```text
architecture/src/
  _spec.c4                      # типы: actor, system, webapp, service, component, ...
  model.c4                      # C1/C2: контейнеры и инфраструктура
  model-components-backend.c4   # C3 backend (extend)
  model-components-frontend.c4  # C3 frontend (extend)
  model-components-ml.c4        # C3 ML (extend, #planned)
  model.views.c4                # C1, C2
  model.views-c3.c4             # C3
  model.views-dynamic.c4        # dynamic sequence views
```

## Контракты (кратко)

### REST `/api/v1`

| Операция | Метод |
|----------|-------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Notes | `POST /notes` (multipart), `GET /notes`, `GET /notes/{id}`, `DELETE /notes/{id}` |

### RabbitMQ `notes.exchange`

**Out:** `NoteProcessingEvent` → `notes.process.queue` (`notes.created`)

**In:** `NoteResultDto` ← `notes.results.queue` (`notes.completed`)

### MinIO

Backend пишет при upload; ML читает по `filePaths` из события.
