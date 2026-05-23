import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import './NotesDashboardView.css';

const statusLabels = {
  PROCESSING: 'Обрабатывается',
  COMPLETED: 'Готово',
  FAILED: 'Ошибка',
};

const statusIcons = {
  PROCESSING: '⏳',
  COMPLETED: '✅',
  FAILED: '⚠️',
};

const getStatusClassName = (status) => {
  if (status === 'COMPLETED') {
    return 'status-completed';
  }

  if (status === 'FAILED') {
    return 'status-failed';
  }

  return 'status-processing';
};

const getNotePreview = (note) => {
  const text = note.summaryText || note.content || note.description || '';

  if (!text) {
    return 'Конспект пока не содержит текстового описания.';
  }

  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
};

export const NotesDashboardView = ({
  notes,
  filteredNotes,
  searchTerm,
  sortBy,
  sortOrder,
  isLoading,
  error,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onRetry,
  formatDate,
  getTimeAgo,
}) => {
  const searchId = useId();
  const sortById = useId();
  const sortOrderId = useId();

  if (isLoading) {
    return (
      <section className="ui-center-state" aria-live="polite" aria-busy="true">
        <span className="loading-spinner ui-loading-spinner--lg" aria-hidden="true" />
        <p className="ui-center-state__text">Загружаем ваши конспекты...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="ui-center-state" role="alert">
        <div className="ui-center-state__icon" aria-hidden="true">⚠️</div>
        <h1 className="ui-page-header__title">Не удалось загрузить конспекты</h1>
        <p className="ui-center-state__text">{error}</p>
        <button type="button" onClick={onRetry} className="btn btn-primary">
          Попробовать снова
        </button>
      </section>
    );
  }

  const totalNotes = notes.length;
  const completedNotes = notes.filter((note) => note.status === 'COMPLETED').length;
  const processingNotes = notes.filter((note) => note.status === 'PROCESSING').length;
  const failedNotes = notes.filter((note) => note.status === 'FAILED').length;

  return (
    <section className="dashboard-page ui-page-shell">
      <header className="ui-page-header ui-page-header--split">
        <div className="ui-page-header__content">
          <p className="ui-page-header__eyebrow">Рабочее пространство</p>
          <h1 className="ui-page-header__title">Мои конспекты</h1>
          <p className="ui-page-header__description">
            Управляйте загруженными материалами, отслеживайте обработку и быстро находите нужные конспекты.
          </p>
        </div>

        <div className="ui-page-header__actions">
          <Link to="/upload" className="btn btn-primary">
            <span aria-hidden="true">➕</span>
            <span>Новый конспект</span>
          </Link>
        </div>
      </header>

      <div className="dashboard-stats" aria-label="Статистика конспектов">
        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">📚</span>
          <div>
            <p className="dashboard-stat-card__label">Всего</p>
            <p className="dashboard-stat-card__value">{totalNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">✅</span>
          <div>
            <p className="dashboard-stat-card__label">Готово</p>
            <p className="dashboard-stat-card__value">{completedNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">⏳</span>
          <div>
            <p className="dashboard-stat-card__label">В обработке</p>
            <p className="dashboard-stat-card__value">{processingNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">⚠️</span>
          <div>
            <p className="dashboard-stat-card__label">С ошибкой</p>
            <p className="dashboard-stat-card__value">{failedNotes}</p>
          </div>
        </article>
      </div>

      {totalNotes > 0 && (
        <div className="ui-toolbar dashboard-toolbar" aria-label="Фильтры и сортировка">
          <div className="ui-field">
            <label className="ui-field__label" htmlFor={searchId}>
              Поиск
            </label>
            <input
              id={searchId}
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="form-input dashboard-toolbar__search"
              placeholder="По названию или содержимому"
              autoComplete="off"
            />
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor={sortById}>
              Сортировка
            </label>
            <select
              id={sortById}
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value)}
              className="form-input"
            >
              <option value="createdAt">По дате создания</option>
              <option value="updatedAt">По дате обновления</option>
              <option value="title">По названию</option>
              <option value="status">По статусу</option>
            </select>
          </div>

          <div className="ui-field">
            <label className="ui-field__label" htmlFor={sortOrderId}>
              Порядок
            </label>
            <select
              id={sortOrderId}
              value={sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value)}
              className="form-input"
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>
      )}

      {totalNotes === 0 ? (
        <div className="ui-empty-card">
          <div className="ui-empty-card__icon" aria-hidden="true">📝</div>
          <h2 className="ui-empty-card__title">Пока нет конспектов</h2>
          <p className="ui-empty-card__description">
            Загрузите изображения учебных материалов, и Autonotes подготовит для вас структурированный конспект.
          </p>
          <Link to="/upload" className="btn btn-primary">
            Создать первый конспект
          </Link>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="ui-empty-card">
          <div className="ui-empty-card__icon" aria-hidden="true">🔎</div>
          <h2 className="ui-empty-card__title">Ничего не найдено</h2>
          <p className="ui-empty-card__description">
            Попробуйте изменить поисковый запрос или параметры сортировки.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => onSearchChange('')}>
            Очистить поиск
          </button>
        </div>
      ) : (
        <div className="dashboard-grid" aria-label="Список конспектов">
          {filteredNotes.map((note) => {
            const fileCount = note.images?.length || note.files?.length || 0;

            return (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="dashboard-note-card card interactive-card"
                aria-label={`Открыть конспект ${note.title}`}
              >
                <div className="dashboard-note-card__header">
                  <div className="dashboard-note-card__title-wrap">
                    <h2 className="dashboard-note-card__title">{note.title}</h2>
                    <p className="dashboard-note-card__date">
                      {formatDate(note.createdAt)}
                      {getTimeAgo && (
                        <span> · {getTimeAgo(note.createdAt)}</span>
                      )}
                    </p>
                  </div>

                  <span className={`status-badge ${getStatusClassName(note.status)}`}>
                    <span aria-hidden="true">{statusIcons[note.status] || '⏳'}</span>
                    <span>{statusLabels[note.status] || note.status}</span>
                  </span>
                </div>

                <p className="dashboard-note-card__preview">
                  {getNotePreview(note)}
                </p>

                <div className="dashboard-note-card__footer">
                  <span className="dashboard-note-card__meta">
                    <span aria-hidden="true">🖼️</span>
                    {fileCount} {fileCount === 1 ? 'файл' : 'файлов'}
                  </span>

                  <span className="dashboard-note-card__open">
                    Открыть
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};