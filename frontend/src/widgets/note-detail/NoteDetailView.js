import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { STATUS_TEXTS, formatRuDateTime, Icon } from 'shared';
import './NoteDetailView.css';

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

const getFileName = (file, index) => (
  file.originalFileName
  || file.fileName
  || file.name
  || `Изображение ${index + 1}`
);

const getFileSize = (file) => {
  if (!file.size) {
    return 'Размер не указан';
  }

  return `${(file.size / 1024 / 1024).toFixed(1)} MB`;
};

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="note-detail-markdown-heading note-detail-markdown-heading--1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="note-detail-markdown-heading note-detail-markdown-heading--2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="note-detail-markdown-heading note-detail-markdown-heading--3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="note-detail-markdown-paragraph">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="note-detail-markdown-list">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="note-detail-markdown-list">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="note-detail-markdown-list-item">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="note-detail-markdown-blockquote">
      {children}
    </blockquote>
  ),
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code className="note-detail-markdown-inline-code" {...props}>
          {children}
        </code>
      );
    }

    return (
      <pre className="note-detail-markdown-code-block">
        <code className="note-detail-markdown-code-block__code" {...props}>
          {children}
        </code>
      </pre>
    );
  },
  hr: () => <hr className="note-detail-markdown-divider" />,
};

export const NoteDetailView = ({ note, deleteLoading, onDelete }) => {
  const images = note.images || [];
  const hasSummary = Boolean(note.summaryText?.trim());
  const statusText = STATUS_TEXTS[note.status] || note.status;
  const statusIcon = statusIcons[note.status] || 'clock';

  return (
    <section className="note-detail-page ui-page-shell slide-up">
      <nav className="note-detail-breadcrumbs" aria-label="Навигация по конспекту">
        <Link to="/dashboard" className="note-detail-back-link">
          <Icon name="arrowLeft" size={18} />
          <span>К списку конспектов</span>
        </Link>
      </nav>

      <header className="note-detail-hero card">
        <div className="note-detail-hero__content">
          <p className="ui-page-header__eyebrow">Конспект</p>

          <h1 className="note-detail-hero__title">
            {note.title}
          </h1>

          <div className="note-detail-hero__meta" aria-label="Информация о конспекте">
            <span className="note-detail-hero__meta-item">
              <Icon name="calendar" size={16} />
              <span>Создан: {formatRuDateTime(note.createdAt)}</span>
            </span>

            {note.updatedAt && (
              <span className="note-detail-hero__meta-item">
                <Icon name="refresh" size={16} />
                <span>Обновлён: {formatRuDateTime(note.updatedAt)}</span>
              </span>
            )}

            <span className="note-detail-hero__meta-item">
              <Icon name="image" size={16} />
              <span>{images.length} {images.length === 1 ? 'файл' : 'файлов'}</span>
            </span>
          </div>
        </div>

        <div className="note-detail-hero__actions">
          <span
            className={`status-badge ${getStatusClassName(note.status)} note-detail-status-badge`}
            aria-label={`Статус конспекта: ${statusText}`}
          >
            <Icon name={statusIcon} size={16} />
            <span>{statusText}</span>
          </span>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleteLoading}
            className="btn btn-danger note-detail-delete-button"
          >
            {deleteLoading ? (
              <span className="loading-spinner" aria-hidden="true" />
            ) : (
              <Icon name="trash" size={18} />
            )}
            <span>{deleteLoading ? 'Удаляем...' : 'Удалить конспект'}</span>
          </button>
        </div>
      </header>

      {note.status === 'PROCESSING' && (
        <section className="note-detail-status-state note-detail-status-state--processing" role="status" aria-live="polite">
          <div className="note-detail-status-state__icon note-detail-status-state__icon--processing" aria-hidden="true">
            <Icon name="clock" size={48} />
          </div>
          <h2 className="note-detail-status-state__title note-detail-status-state__title--processing">
            Конспект обрабатывается
          </h2>
          <p className="note-detail-status-state__description note-detail-status-state__description--processing">
            Мы анализируем изображения и подготовим итоговый текст. Страница обновляется автоматически.
          </p>
        </section>
      )}

      {note.status === 'FAILED' && (
        <section className="note-detail-status-state note-detail-status-state--failed" role="alert">
          <div className="note-detail-status-state__icon note-detail-status-state__icon--failed" aria-hidden="true">
            <Icon name="warning" size={48} />
          </div>
          <h2 className="note-detail-status-state__title note-detail-status-state__title--failed">
            Не удалось обработать конспект
          </h2>
          <p className="note-detail-status-state__description note-detail-status-state__description--failed">
            Попробуйте создать новый конспект с более чёткими изображениями или меньшим количеством файлов.
          </p>
          <Link to="/upload" className="btn btn-primary">
            <Icon name="plus" size={18} />
            <span>Создать новый конспект</span>
          </Link>
        </section>
      )}

      <div className="note-detail-content-grid">
        <section className="card note-detail-card" aria-labelledby="note-files-title">
          <div className="note-detail-section-heading">
            <span className="note-detail-section-heading__icon" aria-hidden="true">
              <Icon name="image" size={22} />
            </span>
            <div>
              <h2 id="note-files-title" className="note-detail-section-heading__title">
                Прикреплённые файлы
              </h2>
              <p className="note-detail-section-heading__description">
                Материалы, которые использовались для создания конспекта.
              </p>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="note-detail-files-grid">
              {images.map((image, index) => (
                <article key={image.id || `${getFileName(image, index)}-${index}`} className="note-detail-file-card">
                  <span className="note-detail-file-card__icon" aria-hidden="true">
                    <Icon name="file" size={20} />
                  </span>

                  <div className="note-detail-file-card__content">
                    <h3 className="note-detail-file-card__name" title={getFileName(image, index)}>
                      {getFileName(image, index)}
                    </h3>
                    <p className="note-detail-file-card__order">
                      Файл {image.orderIndex !== undefined ? image.orderIndex + 1 : index + 1} · {getFileSize(image)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="note-detail-files-empty">
              <span className="note-detail-files-empty__icon" aria-hidden="true">
                <Icon name="file" size={40} />
              </span>
              <p>Файлы не найдены</p>
            </div>
          )}
        </section>

        <section className="card note-detail-summary-card" aria-labelledby="note-summary-title">
          <div className="note-detail-summary-heading">
            <span className="note-detail-summary-heading__icon" aria-hidden="true">
              <Icon name="fileText" size={22} />
            </span>
            <div>
              <h2 id="note-summary-title" className="note-detail-summary-heading__title">
                Итоговый конспект
              </h2>
              <p className="note-detail-summary-heading__description">
                Структурированный результат обработки материалов.
              </p>
            </div>
          </div>

          {hasSummary ? (
            <div className="markdown-container note-detail-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {note.summaryText}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="note-detail-summary-empty">
              <span className="note-detail-summary-empty__icon" aria-hidden="true">
                <Icon name={note.status === 'PROCESSING' ? 'clock' : 'fileText'} size={42} />
              </span>
              <h3 className="note-detail-summary-empty__title">
                {note.status === 'PROCESSING'
                  ? 'Конспект скоро появится'
                  : 'Текст конспекта пока недоступен'}
              </h3>
              <p className="note-detail-summary-empty__description">
                {note.status === 'PROCESSING'
                  ? 'После завершения обработки результат появится в этом блоке.'
                  : 'Попробуйте создать новый конспект или проверить статус обработки позже.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};