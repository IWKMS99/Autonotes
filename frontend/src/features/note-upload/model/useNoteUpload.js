import { useEffect, useRef, useState } from 'react';
import { createNoteRequest } from 'entities/note';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const getFileSizeMb = (file) => (file.size / 1024 / 1024).toFixed(1);

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

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validateFiles = (selectedFiles) => {
    if (selectedFiles.length === 0) {
      return 'Выберите хотя бы один файл для загрузки';
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Все файлы должны быть изображениями JPG, PNG или GIF';
      }

      if (file.size > MAX_FILE_SIZE) {
        return `Файл "${file.name}" слишком большой. Максимальный размер — 50 MB`;
      }
    }

    return '';
  };

  const createPreviews = (selectedFiles) => {
    const previewPromises = selectedFiles.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve({
          name: file.name,
          size: getFileSizeMb(file),
          data: event.target.result,
        });
      };

      reader.onerror = () => {
        reject(new Error(`Не удалось прочитать файл "${file.name}"`));
      };

      reader.readAsDataURL(file);
    }));

    return Promise.all(previewPromises);
  };

  const validateAndProcessFiles = async (files) => {
    const selectedFiles = Array.from(files || []);
    const validationError = validateFiles(selectedFiles);

    if (validationError) {
      setError(validationError);
      resetFileInput();
      return false;
    }

    try {
      const nextPreviews = await createPreviews(selectedFiles);

      setFormData((prev) => ({
        ...prev,
        files: selectedFiles,
      }));
      setPreviews(nextPreviews);
      setError('');

      return true;
    } catch (previewError) {
      setError(previewError.message || 'Не удалось подготовить предпросмотр файлов');
      resetFileInput();
      return false;
    }
  };

  const handleFileChange = (event) => {
    validateAndProcessFiles(event.target.files);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) {
      return;
    }

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    }

    if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) {
      return;
    }

    setDragActive(false);

    if (event.dataTransfer.files?.length) {
      validateAndProcessFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, fileIndex) => fileIndex !== index),
    }));

    setPreviews((prev) => prev.filter((_, previewIndex) => previewIndex !== index));
    resetFileInput();

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      await createNoteRequest(formData.title.trim(), formData.files);

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