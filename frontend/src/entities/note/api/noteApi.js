import { apiClient, throwHttpError, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from 'shared';
import { mapNoteDto, mapNotesDto } from '../model/noteMapper';

const DEFAULT_PAGE_SIZE = 20;
const MAX_FETCH_PAGES = 50;
const PAGE_BATCH_SIZE = 5;

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

    const totalPages = Number.isFinite(firstPayload?.totalPages) ? firstPayload.totalPages : 1;
    const pagesToLoad = Math.min(totalPages, MAX_FETCH_PAGES);
    const size = firstPayload.size || DEFAULT_PAGE_SIZE;
    const merged = [...firstContent];

    for (let startPage = 1; startPage < pagesToLoad; startPage += PAGE_BATCH_SIZE) {
      const requests = [];
      const endPage = Math.min(startPage + PAGE_BATCH_SIZE, pagesToLoad);

      for (let page = startPage; page < endPage; page += 1) {
        requests.push(apiClient.get('/notes', { params: { page, size, sort: 'createdAt,desc' } }));
      }

      const settled = await Promise.allSettled(requests);
      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          merged.push(...(result.value.data?.content || []));
          return;
        }
        // Keep already loaded pages to avoid breaking dashboard if one page fails.
        // eslint-disable-next-line no-console
        console.warn(`Failed to load notes page ${startPage + index}:`, result.reason);
      });
    }

    if (totalPages > MAX_FETCH_PAGES) {
      // eslint-disable-next-line no-console
      console.warn(`Notes list truncated to first ${MAX_FETCH_PAGES} pages.`);
    }

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
