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
    const firstPageResponse = await apiClient.get('/notes');
    const firstPayload = firstPageResponse.data;

    if (Array.isArray(firstPayload)) {
      return mapNotesDto(firstPayload);
    }

    const firstContent = firstPayload?.content || [];
    if (firstPayload?.last || (firstPayload?.totalPages ?? 1) <= 1) {
      return mapNotesDto(firstContent);
    }

    const totalPages = firstPayload.totalPages;
    const size = firstPayload.size || 20;
    const requests = [];

    for (let page = 1; page < totalPages; page += 1) {
      requests.push(apiClient.get('/notes', { params: { page, size, sort: 'createdAt,desc' } }));
    }

    const otherResponses = await Promise.all(requests);
    const merged = [...firstContent, ...otherResponses.flatMap((res) => res.data?.content || [])];
    return mapNotesDto(merged);
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
