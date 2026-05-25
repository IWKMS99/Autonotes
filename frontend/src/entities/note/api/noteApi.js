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
      settled.forEach((result) => {
        if (result.status === 'fulfilled') {
          merged.push(...(result.value.data?.content || []));
          return;
        }
        // Keep already loaded pages to avoid breaking dashboard if one page fails.
      });
    }

    if (totalPages > MAX_FETCH_PAGES) {
      // Keep the list bounded for responsiveness in the UI.
    }

    return mapNotesDto(merged);
  } catch (error) {
    throwHttpError(error);
  }
};

export const createNoteRequest = async (title, files, onUploadProgress) => {
  try {
    const filesArray = Array.isArray(files) ? files : [files];
    filesArray.forEach(validateFile);

    const formData = new FormData();
    formData.append('title', title);
    filesArray.forEach((file) => formData.append('files', file));

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    // Always provide an onUploadProgress handler to axios. If caller didn't
    // pass a callback, the handler becomes a no-op. This ensures consistent
    // behavior and makes upload progress observable in tests and in the UI.
    config.onUploadProgress = (progressEvent) => {
      try {
        if (typeof onUploadProgress !== 'function') {
          return;
        }

        // progressEvent.lengthComputable indicates if Content-Length header is present
        if (!progressEvent.lengthComputable || !progressEvent.total) {
          // If total size is unknown, we can't calculate exact progress
          // but we can still indicate that upload is happening
          onUploadProgress(0);
          return;
        }

        // Calculate actual upload progress based on bytes loaded vs total
        const percentComplete = Math.min(
          99, // Cap at 99% - 100% is when response is received
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );

        onUploadProgress(percentComplete);
      } catch (e) {
        // Swallow errors from progress handler to avoid breaking upload
      }
    };

    const response = await apiClient.post('/notes', formData, config);

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
