import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { getNoteById, deleteNote } from '../services/noteService';
import { STATUS_TEXTS } from '../utils/constants';
import './NoteDetail.css';

const NoteDetailLoadingState = () => (
  <div className="ui-center-state">
    <div className="loading-spinner ui-loading-spinner--lg"></div>
    <p className="ui-center-state__text">
      Загрузка конспекта...
    </p>
  </div>
);

const NoteDetailErrorState = ({ message }) => (
  <div className="ui-center-state">
    <div className="ui-center-state__icon">
      ⚠️
    </div>
    <h2 className="note-detail-state-title">Ошибка загрузки</h2>
    <p className="ui-center-state__text">{message}</p>
    <Link to="/dashboard" className="btn btn-primary">
      Вернуться к списку
    </Link>
  </div>
);

const NoteDetailEmptyState = () => (
  <div className="ui-center-state">
    <div className="ui-center-state__icon note-detail-state-icon--muted">
      📄
    </div>
    <h2 className="note-detail-state-title">Конспект не найден</h2>
    <p className="ui-center-state__text">
      Возможно, он был удален или у вас нет доступа к нему
    </p>
    <Link to="/dashboard" className="btn btn-primary">
      Вернуться к списку
    </Link>
  </div>
);

const NoteDetailBackLink = () => (
  <nav className="note-detail-nav">
    <Link to="/dashboard" className="note-detail-back-link">
      <span>←</span>
      Назад к списку конспектов
    </Link>
  </nav>
);

const NoteDetailHeaderInfo = ({ note, formatDate }) => (
  <div className="note-detail-header__content">
    <h1 className="note-detail-header__title">
      {note.title}
    </h1>

    <div className="note-detail-header__meta">
      <p className="note-detail-header__meta-item">
        📅 {formatDate(note.createdAt)}
      </p>

      {note.updatedAt && note.updatedAt !== note.createdAt && (
        <p className="note-detail-header__meta-item note-detail-header__meta-item--muted">
          ✏️ Обновлено {formatDate(note.updatedAt)}
        </p>
      )}
    </div>
  </div>
);

const NoteDetailActions = ({ note, deleteLoading, onDelete }) => (
  <div className="note-detail-actions">
    <div className={`status-badge status-${note.status.toLowerCase()} note-detail-status-badge`}>
      {STATUS_TEXTS[note.status] || note.status}
    </div>

    <button
      onClick={onDelete}
      disabled={deleteLoading}
      className="btn btn-danger note-detail-delete-button"
    >
      {deleteLoading ? (
        <>
          <span className="loading-spinner note-detail-delete-spinner"></span>
          Удаление...
        </>
      ) : (
        <>
          <span>🗑️</span>
          Удалить
        </>
      )}
    </button>
  </div>
);

const NoteDetailFileItem = ({ image, index }) => (
  <div className="note-detail-file-card">
    <span className="note-detail-file-card__icon">📄</span>

    <div className="note-detail-file-card__content">
      <p className="note-detail-file-card__name">
        {image.originalFileName || `Изображение ${index + 1}`}
      </p>
      <p className="note-detail-file-card__order">
        #{index + 1} в последовательности
      </p>
    </div>
  </div>
);

const NoteDetailFilesEmptyState = () => (
  <div className="note-detail-files-empty">
    <span className="note-detail-files-empty__icon">📭</span>
    Файлы не найдены
  </div>
);

const NoteDetailFilesSection = ({ images }) => (
  <div className="card note-detail-card">
    <div className="note-detail-section-heading">
      <span className="note-detail-section-heading__icon">📎</span>
      <h3 className="note-detail-section-heading__title">
        Прикрепленные файлы
      </h3>
    </div>

    {images && images.length > 0 ? (
      <div className="note-detail-files-grid">
        {images
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((image, idx) => (
            <NoteDetailFileItem
              key={image.id || idx}
              image={image}
              index={idx}
            />
          ))}
      </div>
    ) : (
      <NoteDetailFilesEmptyState />
    )}
  </div>
);

const NoteDetailSummarySection = ({ children }) => (
  <div className="card note-detail-summary-card">
    <div className="note-detail-summary-heading">
      <span className="note-detail-summary-heading__icon">📝</span>
      <h3 className="note-detail-summary-heading__title">
        Конспект
      </h3>
    </div>

    <div className="markdown-container note-detail-markdown">
      {children}
    </div>
  </div>
);

const noteDetailMarkdownComponents = {
  h1: ({ children }) => (
    <h1 className="note-detail-markdown-heading-1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="note-detail-markdown-heading-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="note-detail-markdown-heading-3">
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
  strong: ({ children }) => (
    <strong className="note-detail-markdown-strong">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="note-detail-markdown-emphasis">
      {children}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="note-detail-markdown-blockquote">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => (
    inline ? (
      <code className="note-detail-markdown-inline-code">
        {children}
      </code>
    ) : (
      <pre className="note-detail-markdown-code-block">
        <code className="note-detail-markdown-code-block__code">
          {children}
        </code>
      </pre>
    )
  ),
  hr: () => (
    <hr className="note-detail-markdown-divider" />
  )
};

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNote = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const noteData = await getNoteById(noteId);
      setNote(noteData);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки конспекта');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    let interval;
    if (note && note.status === 'PROCESSING') {
      interval = setInterval(() => {
        fetchNote(true); // Обновляем данные в фоне
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [note?.status, fetchNote]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот конспект?')) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteNote(noteId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ошибка при удалении конспекта');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PROCESSING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Готов';
      case 'PROCESSING': return 'В обработке';
      case 'FAILED': return 'Ошибка обработки';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading && !note) {
    return <NoteDetailLoadingState />;
  }

  if (error) {
    return <NoteDetailErrorState message={error} />;
  }

  if (!note) {
    return <NoteDetailEmptyState />;
  }

  return (
    <div className="slide-up">
      <NoteDetailBackLink />

      <div className="note-detail-header">
        <NoteDetailHeaderInfo
          note={note}
          formatDate={formatDate}
        />

        <NoteDetailActions
          note={note}
          deleteLoading={deleteLoading}
          onDelete={handleDelete}
        />
      </div>

      <div className="note-detail-content-grid">
        <NoteDetailFilesSection images={note.images} />

        {note.summaryText && (
          <NoteDetailSummarySection>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={noteDetailMarkdownComponents}
            >
              {note.summaryText}
            </ReactMarkdown>
          </NoteDetailSummarySection>
        )}

        {note.status === 'PROCESSING' && (
          <div style={{
            backgroundColor: '#fefce8',
            border: '1px solid var(--warning-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-8)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              ⏳
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              color: '#92400e',
              margin: '0 0 var(--spacing-3) 0'
            }}>
              Идет анализ...
            </h3>
            <p style={{
              color: '#b45309',
              margin: 0,
              fontSize: 'var(--font-size-base)'
            }}>
              ИИ обрабатывает ваши фотографии. Результат появится здесь автоматически.
            </p>
            <div style={{
              marginTop: 'var(--spacing-4)',
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <div className="loading-spinner"></div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Обработка может занять несколько минут
              </span>
            </div>
          </div>
        )}

        {note.status === 'FAILED' && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid var(--error-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-8)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-4)',
              color: 'var(--error-color)'
            }}>
              ❌
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              color: 'var(--error-color)',
              margin: '0 0 var(--spacing-3) 0'
            }}>
              Ошибка обработки
            </h3>
            <p style={{
              color: '#dc2626',
              margin: '0 0 var(--spacing-6) 0',
              fontSize: 'var(--font-size-base)'
            }}>
              Не удалось обработать фотографии. Попробуйте загрузить их снова с лучшим качеством.
            </p>
            <Link to="/upload" className="btn btn-primary">
              Загрузить заново
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;