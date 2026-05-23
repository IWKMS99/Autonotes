import { apiClient, throwHttpError, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from 'shared';
import { mapNoteDto, mapNotesDto } from '../model/noteMapper';

const validateFile = (file) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Неподдерживаемый формат файла. Используйте JPG, PNG или GIF.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Размер файла не должен превышать ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }
};

export const fetchNotes = async () => {
  try {
    const response = await apiClient.get('/notes');
    return mapNotesDto(response.data);
  } catch (error) {
    throwHttpError(error);
  }
};

export const createNoteRequest = async (title, files) => {
  try {
    const filesArray = Array.isArray(files) ? files : [files];
    filesArray.forEach(validateFile);

    const formData = new FormData();
    formData.append('title', title);
    filesArray.forEach((file) => formData.append('files', file));

    const response = await apiClient.post('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return mapNoteDto(response.data);
  } catch (error) {
    throwHttpError(error);
  }
};

export const fetchNoteById = async (id) => {
  try {
    const response = await apiClient.get(`/notes/${id}`);
    return mapNoteDto(response.data);
  } catch (error) {
    throwHttpError(error);
  }
};

export const removeNoteById = async (id) => {
  try {
    await apiClient.delete(`/notes/${id}`);
  } catch (error) {
    throwHttpError(error);
  }
};
