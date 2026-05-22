import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createNote } from '../services/noteService';
import './NoteUploadForm.css';

const NoteUploadHeader = () => (
  <div className="ui-page-header">
    <div className="ui-page-header__icon">
      📷
    </div>
    <h1 className="ui-page-header__title">
      Новый конспект
    </h1>
    <p className="ui-page-header__description note-upload-header-description">
      Загрузите фотографии доски, и ИИ создаст для вас подробный конспект
    </p>
  </div>
);

const NoteUploadEmptyDropzone = ({ dragActive }) => (
  <div>
    <div className={[
      'note-upload-empty-state__icon',
      dragActive ? 'note-upload-empty-state__icon--active' : ''
    ].filter(Boolean).join(' ')}>
      {dragActive ? '📥' : '📸'}
    </div>

    <h3 className="note-upload-empty-state__title">
      {dragActive ? 'Отпустите файлы здесь' : 'Выберите фотографии'}
    </h3>

    <p className="note-upload-empty-state__description">
      {dragActive ? 'Файлы будут загружены' : 'Перетащите файлы сюда или нажмите для выбора'}
    </p>

    <div className="note-upload-empty-state__hint">
      <span>📷</span>
      <span>JPG, PNG, GIF до 50MB каждый</span>
    </div>
  </div>
);

const NoteUploadPreviewCard = ({ preview, index, onRemove }) => (
  <div className="note-upload-preview-card">
    <img
      src={preview.data}
      alt={`Превью файла ${index + 1}`}
      className="note-upload-preview-card__image"
    />

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove(index);
      }}
      className="note-upload-preview-card__remove"
      aria-label={`Удалить файл ${preview.name}`}
    >
      ✕
    </button>

    <div className="note-upload-preview-card__meta">
      <div className="note-upload-preview-card__name">
        {preview.name}
      </div>
      <div className="note-upload-preview-card__size">
        {preview.size} MB
      </div>
    </div>
  </div>
);

const NoteUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    files: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAndProcessFiles = (files) => {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Все файлы должны быть изображениями (JPG, PNG, GIF)');
        return false;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('Размер каждого файла не должен превышать 50MB');
        return false;
      }
    }

    setFormData(prev => ({
      ...prev,
      files: selectedFiles
    }));

    const newPreviews = [];
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = { name: file.name, size: (file.size / 1024 / 1024).toFixed(1), data: e.target.result };
        if (newPreviews.filter(p => p).length === selectedFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setError('');
    return true;
  };

  const handleFileChange = (e) => {
    validateAndProcessFiles(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFormData(prev => ({ ...prev, files: newFiles }));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Введите название конспекта');
      return;
    }

    if (!formData.files || formData.files.length === 0) {
      setError('Выберите хотя бы один файл для загрузки');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await createNote(formData.title, formData.files);
      setUploadProgress(100);
      clearInterval(progressInterval);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке конспекта');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="slide-up">
      <NoteUploadHeader />
      <div className="note-upload-form">
        <form onSubmit={handleSubmit}>
          <div className="note-upload-form-group">
            <label className="form-label" htmlFor="note-title">
              Название конспекта *
            </label>
            <input
              id="note-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Например: Лекция по дифференциальным уравнениям"
              className="form-input note-upload-title-input"
              disabled={loading}
            />
          </div>

          <div className="note-upload-form-group">
            <label className="form-label" htmlFor="note-files">
              Фотографии доски *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={[
                'note-upload-dropzone',
                dragActive ? 'note-upload-dropzone--active' : '',
                previews.length > 0 ? 'note-upload-dropzone--filled' : '',
                loading ? 'note-upload-dropzone--loading' : ''
              ].filter(Boolean).join(' ')}
            >
              <input
                id="note-files"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="note-upload-file-input"
                disabled={loading}
              />

              {previews.length > 0 ? (
                <div>
                  <div className="note-upload-preview-grid">
                    {previews.map((preview, index) => (
                      <NoteUploadPreviewCard
                        key={index}
                        preview={preview}
                        index={index}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>

                  <p className="note-upload-selected-files-text">
                    📎 Выбрано файлов: {previews.length}.
                    <span className="note-upload-selected-files-action">
                      {' '}Нажмите для добавления еще файлов
                    </span>
                  </p>
                </div>
              ) : (
                <NoteUploadEmptyDropzone dragActive={dragActive} />
              )}
            </div>
          </div>

          {loading && (
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-2)'
              }}>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  Загрузка файлов...
                </span>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  {uploadProgress}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                backgroundColor: 'var(--background-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'width var(--transition-normal)'
                }}></div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: 'var(--spacing-4)',
              backgroundColor: '#fef2f2',
              border: '1px solid var(--error-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error-color)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--spacing-6)'
            }}>
              <span style={{ fontWeight: '500' }}>Ошибка:</span> {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/dashboard"
              className="btn btn-secondary"
              style={{
                flex: '1 1 auto',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || formData.files.length === 0}
              className="btn btn-primary"
              style={{
                flex: '2 1 auto',
                fontSize: 'var(--font-size-base)',
                padding: 'var(--spacing-4) var(--spacing-6)'
              }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ marginRight: 'var(--spacing-2)' }}></span>
                  Создание конспекта...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Создать конспект
                </>
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default NoteUploadForm;