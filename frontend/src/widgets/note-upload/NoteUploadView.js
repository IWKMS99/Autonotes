import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Icon,
  cardHoverMotion,
  cardTapMotion,
  listItemMotion,
  listMotion,
  reducedListItemMotion,
} from 'shared';
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
  const shouldReduceMotion = useReducedMotion();

  const itemMotion = shouldReduceMotion ? reducedListItemMotion : listItemMotion;
  const hoverMotion = shouldReduceMotion ? undefined : cardHoverMotion;
  const tapMotion = shouldReduceMotion ? undefined : cardTapMotion;

  const fadeInMotion = shouldReduceMotion
    ? {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12 },
    }
    : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -6 },
      transition: { duration: 0.18 },
    };

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
    <section className="note-upload-page ui-page-shell">
      <motion.header
        className="ui-page-header ui-page-header--split"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="ui-page-header__content">
          <p className="ui-page-header__eyebrow">Новый материал</p>
          <h1 className="ui-page-header__title">Создать конспект</h1>
          <p className="ui-page-header__description">
            Загрузите фотографии доски, слайдов или учебных материалов. Мы обработаем изображения и подготовим структурированный конспект.
          </p>
        </div>

        <div className="ui-page-header__actions">
          <Link to="/dashboard" className="btn btn-secondary">
            <Icon name="arrowLeft" size={18} />
            <span>К списку конспектов</span>
          </Link>
        </div>
      </motion.header>

      <div className="note-upload-layout">
        <motion.form
          className="note-upload-form card"
          onSubmit={handleSubmit}
          aria-busy={loading}
          aria-describedby={[
            dropzoneHintId,
            error ? errorId : null,
            loading ? progressId : null,
          ].filter(Boolean).join(' ')}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.03 }}
        >
          <div className="note-upload-form__section">
            <div className="note-upload-section-heading">
              <span className="note-upload-section-heading__icon" aria-hidden="true">
                <Icon name="dashboard" size={22} />
              </span>
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
              <span className="note-upload-section-heading__icon" aria-hidden="true">
                <Icon name="image" size={22} />
              </span>
              <div>
                <h2 className="note-upload-section-heading__title">Файлы</h2>
                <p className="note-upload-section-heading__description" id={dropzoneHintId}>
                  Поддерживаются изображения JPG, PNG и GIF. Максимальный размер одного файла — 50 MB.
                </p>
              </div>
            </div>

            <motion.div
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
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { scale: dragActive ? 1.01 : 1 }
              }
              transition={{ duration: 0.16 }}
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

              <AnimatePresence mode="wait">
                {hasPreviews ? (
                  <motion.div
                    key="preview"
                    className="note-upload-preview"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="note-upload-preview__header">
                      <div>
                        <p className="note-upload-preview__title">
                          Выбрано файлов: {previews.length}
                        </p>
                        <p className="note-upload-preview__description">
                          Нажмите на область, чтобы добавить ещё файлы.
                        </p>
                      </div>
                    </div>

                    <motion.div
                      className="note-upload-preview-grid"
                      initial="initial"
                      animate="animate"
                      variants={listMotion}
                    >
                      <AnimatePresence initial={false}>
                        {previews.map((preview, index) => (
                          <motion.article
                            key={preview.id || `${preview.name}-${index}`}
                            className="note-upload-preview-card"
                            variants={itemMotion}
                            initial="initial"
                            animate="animate"
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 0.96, y: -8 }
                            }
                            whileHover={hoverMotion}
                            whileTap={tapMotion}
                            layout={!shouldReduceMotion}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <img
                              src={preview.data}
                              alt={`Предпросмотр файла ${preview.name}`}
                              className="note-upload-preview-card__image"
                            />

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
                              <Icon name="close" size={16} />
                            </button>
                          </motion.article>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="note-upload-empty-state"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                  >
                    <motion.div
                      className={`note-upload-empty-state__icon ${dragActive ? 'note-upload-empty-state__icon--active' : ''}`}
                      aria-hidden="true"
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { scale: dragActive ? 1.06 : 1 }
                      }
                      transition={{ duration: 0.16 }}
                    >
                      <Icon name={dragActive ? 'plus' : 'image'} size={42} />
                    </motion.div>
                    <p className="note-upload-empty-state__title">
                      {dragActive ? 'Отпустите файлы здесь' : 'Перетащите изображения сюда'}
                    </p>
                    <p className="note-upload-empty-state__description">
                      или нажмите на область, чтобы выбрать файлы вручную
                    </p>
                    <span className="btn btn-secondary btn-sm note-upload-empty-state__button" aria-hidden="true">
                      Выбрать файлы
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div
                className="note-upload-progress"
                id={progressId}
                aria-live="polite"
                {...fadeInMotion}
              >
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
                  <motion.div
                    className="note-upload-progress__bar"
                    initial={false}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                id={errorId}
                className="ui-alert ui-alert--error"
                role="alert"
                {...fadeInMotion}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

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
        </motion.form>

        <motion.aside
          className="note-upload-help card"
          aria-labelledby="upload-help-title"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
        >
          <h2 id="upload-help-title" className="note-upload-help__title">
            Как получить лучший результат
          </h2>

          <ul className="note-upload-help__list">
            <li>
              <Icon name="check" size={18} />
              <span>Загружайте чёткие фотографии без сильного размытия.</span>
            </li>
            <li>
              <Icon name="image" size={18} />
              <span>Старайтесь фотографировать материалы ровно и без больших наклонов.</span>
            </li>
            <li>
              <Icon name="dashboard" size={18} />
              <span>Текст на изображениях должен быть достаточно крупным и читаемым.</span>
            </li>
            <li>
              <Icon name="books" size={18} />
              <span>Для одной темы лучше загружать несколько связанных изображений сразу.</span>
            </li>
          </ul>
        </motion.aside>
      </div>
    </section>
  );
};