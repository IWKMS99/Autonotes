import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createNote } from '../services/noteService';
import './NoteUploadForm.css';

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

    // Проверяем каждый файл
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

    // Создаем превью для каждого файла
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
      // Имитация прогресса загрузки
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

      // Небольшая задержка для отображения 100%
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
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--spacing-8)',
        maxWidth: 600,
        margin: '0 auto var(--spacing-8) auto'
      }}>
        <div style={{
          width: 80,
          height: 80,
          backgroundColor: 'var(--primary-light)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-6)',
          fontSize: '2.5rem'
        }}>
          📷
        </div>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: '0 0 var(--spacing-3) 0'
        }}>
          Новый конспект
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-lg)',
          margin: 0,
          maxWidth: 400,
          margin: '0 auto'
        }}>
          Загрузите фотографии доски, и ИИ создаст для вас подробный конспект
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label className="form-label">
              Название конспекта *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Например: Лекция по дифференциальным уравнениям"
              className="form-input"
              disabled={loading}
              style={{ fontSize: 'var(--font-size-lg)' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label className="form-label">
              Фотографии доски *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-8)',
                textAlign: 'center',
                backgroundColor: dragActive ? 'var(--primary-light)' : previews.length > 0 ? 'var(--background-color)' : 'var(--surface-color)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                opacity: loading ? 0.7 : 1
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={loading}
              />

              {previews.length > 0 ? (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 'var(--spacing-4)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          backgroundColor: 'var(--surface-color)',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <img
                          src={preview.data}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          style={{
                            position: 'absolute',
                            top: 'var(--spacing-2)',
                            right: 'var(--spacing-2)',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-sm)'
                          }}
                        >
                          ✕
                        </button>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                          padding: 'var(--spacing-3) var(--spacing-2)',
                          color: 'white'
                        }}>
                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {preview.name}
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            opacity: 0.8
                          }}>
                            {preview.size} MB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    📎 Выбрано файлов: {previews.length}.
                    <span style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
                      {' '}Нажмите для добавления еще файлов
                    </span>
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: 'var(--spacing-4)',
                    color: dragActive ? 'var(--primary-color)' : 'var(--text-muted)'
                  }}>
                    {dragActive ? '📥' : '📸'}
                  </div>
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: '0 0 var(--spacing-2) 0'
                  }}>
                    {dragActive ? 'Отпустите файлы здесь' : 'Выберите фотографии'}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    margin: '0 0 var(--spacing-4) 0',
                    fontSize: 'var(--font-size-base)'
                  }}>
                    {dragActive ? 'Файлы будут загружены' : 'Перетащите файлы сюда или нажмите для выбора'}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-2)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <span>📷</span>
                    <span>JPG, PNG, GIF до 50MB каждый</span>
                  </div>
                </div>
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
      </div>
    </div>
  );
};

export default NoteUploadForm;