import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import './NoteUploadView.css';

const getDropzoneClassName = ({ dragActive, hasPreviews, loading }) => [
  'note-upload-dropzone',
  dragActive ? 'note-upload-dropzone--active' : '',
  hasPreviews ? 'note-upload-dropzone--filled' : '',
  loading ? 'note-upload-dropzone--loading' : '',
].filter(Boolean).join(' ');

export const NoteUploadView = (props) => {
  const {
    formData,
    loading,
    error,
    previews,
    dragActive,
    uploadProgress,
    fileInputRef,
    handleInputChange,
    handleFileChange,
    handleDrag,
    handleDrop,
    removeFile,
    handleSubmit,
    isSubmitDisabled,
  } = props;

  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const fileInputId = `${generatedId}-files`;
  const dropzoneHintId = `${generatedId}-dropzone-hint`;
  const errorId = `${generatedId}-error`;
  const progressId = `${generatedId}-progress`;

  const hasPreviews = previews.length > 0;

  const handleDropzoneKeyDown = (event) => {
    if (loading) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <section className="note-upload-page ui-page-shell slide-up">
      <header className="ui-page-header ui-page-header--split">
        <div className="ui-page-header__content">
          <p className="ui-page-header__eyebrow">Новый материал</p>
          <h1 className="ui-page-header__title">Создать конспект</h1>
          <p className="ui-page-header__description">
            Загрузите фотографии доски, слайдов или учебных материалов. Мы обработаем изображения и подготовим структурированный конспект.
          </p>
        </div>

        <div className="ui-page-header__actions">
          <Link to="/dashboard" className="btn btn-secondary">
            <span aria-hidden="true">←</span>
            <span>К списку конспектов</span>
          </Link>
        </div>
      </header>

      <div className="note-upload-layout">
        <form
          className="note-upload-form card"
          onSubmit={handleSubmit}
          aria-busy={loading}
          aria-describedby={[
            dropzoneHintId,
            error ? errorId : null,
            loading ? progressId : null,
          ].filter(Boolean).join(' ')}
        >
          <div className="note-upload-form__section">
            <div className="note-upload-section-heading">
              <span className="note-upload-section-heading__icon" aria-hidden="true">✏️</span>
              <div>
                <h2 className="note-upload-section-heading__title">Название</h2>
                <p className="note-upload-section-heading__description">
                  Используйте понятное название, чтобы потом быстро найти конспект.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={titleId}>
                Название конспекта <span aria-hidden="true">*</span>
              </label>
              <input
                id={titleId}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input note-upload-title-input"
                placeholder="Например: Лекция по математическому анализу"
                autoComplete="off"
                required
                disabled={loading}
                aria-invalid={error && !formData.title.trim() ? 'true' : undefined}
                aria-describedby={error ? errorId : undefined}
              />
            </div>
          </div>

          <div className="note-upload-form__section">
            <div className="note-upload-section-heading">
              <span className="note-upload-section-heading__icon" aria-hidden="true">🖼️</span>
              <div>
                <h2 className="note-upload-section-heading__title">Файлы</h2>
                <p className="note-upload-section-heading__description" id={dropzoneHintId}>
                  Поддерживаются изображения JPG, PNG и GIF. Максимальный размер одного файла — 50 MB.
                </p>
              </div>
            </div>

            <div
              role="button"
              tabIndex={loading ? -1 : 0}
              onKeyDown={handleDropzoneKeyDown}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={getDropzoneClassName({ dragActive, hasPreviews, loading })}
              aria-label={hasPreviews ? 'Изменить выбранные файлы' : 'Выбрать файлы для загрузки'}
              aria-describedby={dropzoneHintId}
              aria-disabled={loading}
            >
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple
                onChange={handleFileChange}
                className="note-upload-file-input"
                disabled={loading}
              />

              {hasPreviews ? (
                <div className="note-upload-preview">
                  <div className="note-upload-preview__header">
                    <div>
                      <p className="note-upload-preview__title">
                        Выбрано файлов: {previews.length}
                      </p>
                      <p className="note-upload-preview__description">
                        Нажмите на область, чтобы выбрать другие файлы.
                      </p>
                    </div>
                  </div>

                  <div className="note-upload-preview-grid">
                    {previews.map((preview, index) => (
                      <article key={`${preview.name}-${index}`} className="note-upload-preview-card">
                        <img src={preview.data} alt={`Предпросмотр файла ${preview.name}`} className="note-upload-preview-card__image" />

                        <div className="note-upload-preview-card__meta">
                          <p className="note-upload-preview-card__name" title={preview.name}>
                            {preview.name}
                          </p>
                          <p className="note-upload-preview-card__size">
                            {preview.size} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFile(index);
                          }}
                          className="note-upload-preview-card__remove"
                          aria-label={`Удалить файл ${preview.name}`}
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="note-upload-empty-state">
                  <div className={`note-upload-empty-state__icon ${dragActive ? 'note-upload-empty-state__icon--active' : ''}`} aria-hidden="true">
                    {dragActive ? '📥' : '☁️'}
                  </div>
                  <p className="note-upload-empty-state__title">
                    {dragActive ? 'Отпустите файлы здесь' : 'Перетащите изображения сюда'}
                  </p>
                  <p className="note-upload-empty-state__description">
                    или нажмите на область, чтобы выбрать файлы вручную
                  </p>
                  <span className="btn btn-secondary btn-sm note-upload-empty-state__button" aria-hidden="true">
                    Выбрать файлы
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="note-upload-progress" id={progressId} aria-live="polite">
              <div className="note-upload-progress__header">
                <span className="note-upload-progress__label">Создаём конспект</span>
                <span className="note-upload-progress__value">{uploadProgress}%</span>
              </div>
              <div
                className="note-upload-progress__track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={uploadProgress}
                aria-label="Прогресс загрузки"
              >
                <div className="note-upload-progress__bar" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div id={errorId} className="ui-alert ui-alert--error" role="alert">
              {error}
            </div>
          )}

          <div className="note-upload-actions">
            <Link to="/dashboard" className="btn btn-secondary note-upload-cancel-link">
              Отмена
            </Link>

            <button
              type="submit"
              className="btn btn-primary note-upload-submit-button"
              disabled={isSubmitDisabled}
            >
              {loading && <span className="loading-spinner" aria-hidden="true" />}
              <span>{loading ? 'Создаём конспект...' : 'Создать конспект'}</span>
            </button>
          </div>
        </form>

        <aside className="note-upload-help card" aria-labelledby="upload-help-title">
          <h2 id="upload-help-title" className="note-upload-help__title">
            Как получить лучший результат
          </h2>

          <ul className="note-upload-help__list">
            <li>
              <span aria-hidden="true">💡</span>
              <span>Загружайте чёткие фотографии без сильного размытия.</span>
            </li>
            <li>
              <span aria-hidden="true">📐</span>
              <span>Старайтесь фотографировать материалы ровно и без больших наклонов.</span>
            </li>
            <li>
              <span aria-hidden="true">🔤</span>
              <span>Текст на изображениях должен быть достаточно крупным и читаемым.</span>
            </li>
            <li>
              <span aria-hidden="true">📚</span>
              <span>Для одной темы лучше загружать несколько связанных изображений сразу.</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
};