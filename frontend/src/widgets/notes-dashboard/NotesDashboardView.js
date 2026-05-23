import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { formatDate as defaultFormatDate, getTimeAgo as defaultGetTimeAgo, Icon } from 'shared';
import './NotesDashboardView.css';

const statusLabels = {
  PROCESSING: 'Обрабатывается',
  COMPLETED: 'Готово',
  FAILED: 'Ошибка',
};

const statusIcons = {
  PROCESSING: 'clock',
  COMPLETED: 'check',
  FAILED: 'warning',
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
  notes = [],
  filteredNotes = [],
  searchTerm = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
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

  const formatNoteDate = typeof formatDate === 'function'
    ? formatDate
    : defaultFormatDate;

  const getNoteTimeAgo = typeof getTimeAgo === 'function'
    ? getTimeAgo
    : defaultGetTimeAgo;

  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeFilteredNotes = Array.isArray(filteredNotes) ? filteredNotes : [];

  const handleSearchChange = typeof onSearchChange === 'function'
    ? onSearchChange
    : () => {};

  const handleSortByChange = typeof onSortByChange === 'function'
    ? onSortByChange
    : () => {};

  const handleSortOrderChange = typeof onSortOrderChange === 'function'
    ? onSortOrderChange
    : () => {};

  const handleRetry = typeof onRetry === 'function'
    ? onRetry
    : () => window.location.reload();

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
        <div className="ui-center-state__icon" aria-hidden="true">
          <Icon name="warning" size={44} />
        </div>
        <h1 className="ui-page-header__title">Не удалось загрузить конспекты</h1>
        <p className="ui-center-state__text">{error}</p>
        <button type="button" onClick={handleRetry} className="btn btn-primary">
          Попробовать снова
        </button>
      </section>
    );
  }

  const totalNotes = safeNotes.length;
  const completedNotes = safeNotes.filter((note) => note.status === 'COMPLETED').length;
  const processingNotes = safeNotes.filter((note) => note.status === 'PROCESSING').length;
  const failedNotes = safeNotes.filter((note) => note.status === 'FAILED').length;

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
            <Icon name="plus" size={18} />
            <span>Новый конспект</span>
          </Link>
        </div>
      </header>

      <div className="dashboard-stats" aria-label="Статистика конспектов">
        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">
            <Icon name="books" size={24} />
          </span>
          <div>
            <p className="dashboard-stat-card__label">Всего</p>
            <p className="dashboard-stat-card__value">{totalNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">
            <Icon name="check" size={24} />
          </span>
          <div>
            <p className="dashboard-stat-card__label">Готово</p>
            <p className="dashboard-stat-card__value">{completedNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">
            <Icon name="clock" size={24} />
          </span>
          <div>
            <p className="dashboard-stat-card__label">В обработке</p>
            <p className="dashboard-stat-card__value">{processingNotes}</p>
          </div>
        </article>

        <article className="dashboard-stat-card card">
          <span className="dashboard-stat-card__icon" aria-hidden="true">
            <Icon name="warning" size={24} />
          </span>
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
              onChange={(event) => handleSearchChange(event.target.value)}
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
              onChange={(event) => handleSortByChange(event.target.value)}
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
              onChange={(event) => handleSortOrderChange(event.target.value)}
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
          <div className="ui-empty-card__icon" aria-hidden="true">
            <Icon name="books" size={48} />
          </div>
          <h2 className="ui-empty-card__title">Пока нет конспектов</h2>
          <p className="ui-empty-card__description">
            Загрузите изображения учебных материалов, и Autonotes подготовит для вас структурированный конспект.
          </p>
          <Link to="/upload" className="btn btn-primary">
            Создать первый конспект
          </Link>
        </div>
      ) : safeFilteredNotes.length === 0 ? (
        <div className="ui-empty-card">
          <div className="ui-empty-card__icon" aria-hidden="true">
            <Icon name="search" size={48} />
          </div>
          <h2 className="ui-empty-card__title">Ничего не найдено</h2>
          <p className="ui-empty-card__description">
            Попробуйте изменить поисковый запрос или параметры сортировки.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => handleSearchChange('')}>
            Очистить поиск
          </button>
        </div>
      ) : (
        <div className="dashboard-grid" aria-label="Список конспектов">
          {safeFilteredNotes.map((note) => {
            const fileCount = note.images?.length || note.files?.length || 0;
            const timeAgoText = getNoteTimeAgo(note.createdAt);

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
                      {formatNoteDate(note.createdAt)}
                      {timeAgoText && <span> · {timeAgoText}</span>}
                    </p>
                  </div>

                  <span className={`status-badge ${getStatusClassName(note.status)}`}>
                    <Icon name={statusIcons[note.status] || 'clock'} size={14} />
                    <span>{statusLabels[note.status] || note.status}</span>
                  </span>
                </div>

                <p className="dashboard-note-card__preview">
                  {getNotePreview(note)}
                </p>

                <div className="dashboard-note-card__footer">
                  <span className="dashboard-note-card__meta">
                    <Icon name="image" size={16} />
                    {fileCount} {fileCount === 1 ? 'файл' : 'файлов'}
                  </span>

                  <span className="dashboard-note-card__open">
                    Открыть
                    <Icon name="arrowRight" size={16} />
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