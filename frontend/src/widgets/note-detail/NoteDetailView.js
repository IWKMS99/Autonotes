import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { STATUS_TEXTS, formatRuDateTime } from 'shared';
import './NoteDetailView.css';

export const NoteDetailView = ({ note, deleteLoading, onDelete }) => (
  <div className="slide-up">
    <nav className="note-detail-nav"><Link to="/dashboard" className="note-detail-back-link">← Назад</Link></nav>
    <div className="note-detail-header">
      <div className="note-detail-header__content">
        <h1 className="note-detail-header__title">{note.title}</h1>
        <div className="note-detail-header__meta"><p className="note-detail-header__meta-item">📅 {formatRuDateTime(note.createdAt)}</p></div>
      </div>
      <div className="note-detail-actions">
        <div className={`status-badge status-${note.status.toLowerCase()} note-detail-status-badge`}>{STATUS_TEXTS[note.status] || note.status}</div>
        <button onClick={onDelete} disabled={deleteLoading} className="btn btn-danger note-detail-delete-button">{deleteLoading ? 'Удаление...' : 'Удалить'}</button>
      </div>
    </div>

    <div className="note-detail-content-grid">
      <div className="card note-detail-card">
        <h3>Прикрепленные файлы</h3>
        <div className="note-detail-files-grid">
          {(note.images || []).map((image, idx) => <div key={image.id || idx} className="note-detail-file-card">{image.originalFileName || `Изображение ${idx + 1}`}</div>)}
        </div>
      </div>

      {note.summaryText && (
        <div className="card note-detail-summary-card">
          <h3>Конспект</h3>
          <div className="markdown-container note-detail-markdown">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{note.summaryText}</ReactMarkdown>
          </div>
        </div>
      )}

      {note.status === 'PROCESSING' && <div className="note-detail-status-state note-detail-status-state--processing">Идет анализ...</div>}
      {note.status === 'FAILED' && <div className="note-detail-status-state note-detail-status-state--failed">Ошибка обработки</div>}
    </div>
  </div>
);
