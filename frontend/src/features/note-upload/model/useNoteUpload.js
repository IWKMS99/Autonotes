import { useEffect, useRef, useState } from 'react';
import { createNoteRequest } from 'entities/note';

export const useNoteUpload = (onSuccess) => {
  const [formData, setFormData] = useState({ title: '', files: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const successTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndProcessFiles = (files) => {
    const selectedFiles = Array.from(files);
    if (selectedFiles.length === 0) return false;

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

    setFormData((prev) => ({ ...prev, files: selectedFiles }));

    const newPreviews = [];
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews[index] = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(1),
          data: event.target.result,
        };
        if (newPreviews.filter(Boolean).length === selectedFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setError('');
    return true;
  };

  const handleFileChange = (e) => validateAndProcessFiles(e.target.files);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndProcessFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Введите название конспекта');
      return;
    }
    if (!formData.files.length) {
      setError('Выберите хотя бы один файл для загрузки');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await createNoteRequest(formData.title, formData.files);
      setUploadProgress(100);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      successTimeoutRef.current = setTimeout(onSuccess, 500);
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setError(err.message || 'Ошибка при загрузке конспекта');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    isSubmitDisabled: loading || !formData.title.trim() || formData.files.length === 0,
  };
};
