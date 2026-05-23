import React from 'react';
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
    formData, loading, error, previews, dragActive, uploadProgress, fileInputRef,
    handleInputChange, handleFileChange, handleDrag, handleDrop, removeFile, handleSubmit, isSubmitDisabled,
  } = props;

  return (
    <div className="slide-up">
      <div className="ui-page-header"><h1 className="ui-page-header__title">Новый конспект</h1></div>
      <div className="note-upload-form">
        <form onSubmit={handleSubmit}>
          <div className="note-upload-form-group">
            <label className="form-label" htmlFor="note-title">Название конспекта *</label>
            <input id="note-title" type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input note-upload-title-input" disabled={loading} />
          </div>

          <div className="note-upload-form-group">
            <label className="form-label" htmlFor="note-files">Фотографии доски *</label>
            <div role="button" tabIndex={loading ? -1 : 0} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !loading && fileInputRef.current?.click()} className={getDropzoneClassName({ dragActive, hasPreviews: previews.length > 0, loading })}>
              <input id="note-files" ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="note-upload-file-input" disabled={loading} />
              {previews.length > 0 ? (
                <div className="note-upload-preview-grid">
                  {previews.map((preview, index) => (
                    <div key={index} className="note-upload-preview-card">
                      <img src={preview.data} alt={preview.name} className="note-upload-preview-card__image" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="note-upload-preview-card__remove">✕</button>
                    </div>
                  ))}
                </div>
              ) : <p>Перетащите файлы или нажмите для выбора</p>}
            </div>
          </div>

          {loading && <div className="note-upload-progress__value">{uploadProgress}%</div>}
          {error && <div className="note-upload-error">{error}</div>}

          <div className="note-upload-actions">
            <Link to="/dashboard" className="btn btn-secondary">Отмена</Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled}>{loading ? 'Создание...' : 'Создать конспект'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
