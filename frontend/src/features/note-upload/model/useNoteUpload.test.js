import { renderHook, act, waitFor } from '@testing-library/react';
import { useNoteUpload } from './useNoteUpload';

jest.mock('entities/note', () => ({
  createNoteRequest: jest.fn(),
}));

jest.mock('shared', () => ({
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_UPLOAD_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB
}));

const { createNoteRequest } = require('entities/note');

describe('useNoteUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('initializes with correct default values', () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useNoteUpload(onSuccess));

    expect(result.current.formData).toEqual({ title: '', files: [] });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.previews).toEqual([]);
    expect(result.current.dragActive).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.isSubmitDisabled).toBe(true);
  });

  test('handles input change for title', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));

    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'My Note' },
      });
    });

    expect(result.current.formData.title).toBe('My Note');
    expect(result.current.error).toBe('');
  });

  test('validates file type', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    act(() => {
      result.current.handleFileChange({
        target: { files: [invalidFile] },
      });
    });

    expect(result.current.error).toContain('должны быть изображениями');
    expect(result.current.formData.files).toEqual([]);
  });

  test('validates file size', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
    const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleFileChange({
        target: { files: [largeFile] },
      });
    });

    expect(result.current.error).toContain('слишком большой');
    expect(result.current.formData.files).toEqual([]);
  });

  test('accepts valid image files and creates previews', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleFileChange({
        target: { files: [validFile] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
      expect(result.current.previews).toHaveLength(1);
      expect(result.current.error).toBe('');
    });
  });

  test('prevents duplicate files', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const file1 = new File(['content1'], 'test.jpg', { type: 'image/jpeg' });

    // Add first file
    act(() => {
      result.current.handleFileChange({
        target: { files: [file1] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
    });

    // Try to add same file again
    act(() => {
      result.current.handleFileChange({
        target: { files: [file1] },
      });
    });

    await waitFor(() => {
      expect(result.current.error).toContain('уже добавлены');
      expect(result.current.formData.files).toHaveLength(1);
    });
  });

  test('removes file by index', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
    });

    act(() => {
      result.current.removeFile(0);
    });

    expect(result.current.formData.files).toHaveLength(0);
    expect(result.current.previews).toHaveLength(0);
  });

  test('handles drag events correctly', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));

    // dragenter
    act(() => {
      result.current.handleDrag(new Event('dragenter', { bubbles: true }));
    });
    expect(result.current.dragActive).toBe(true);

    // dragleave
    act(() => {
      result.current.handleDrag(new Event('dragleave', { bubbles: true }));
    });
    expect(result.current.dragActive).toBe(false);

    // dragover
    act(() => {
      result.current.handleDrag(new Event('dragover', { bubbles: true }));
    });
    expect(result.current.dragActive).toBe(true);
  });

  test('prevents drag during loading', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'Test Note' },
      });
    });

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
    });

    createNoteRequest.mockImplementation(
      () => new Promise(() => {})
    );

    act(() => {
      result.current.handleSubmit(
        new Event('submit', { bubbles: true })
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    const dragEvent = new Event('dragenter', { bubbles: true });
    dragEvent.preventDefault = jest.fn();
    dragEvent.stopPropagation = jest.fn();

    act(() => {
      result.current.handleDrag(dragEvent);
    });

    expect(result.current.dragActive).toBe(false);
  });

  test('handles file drop', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    const dropEvent = new Event('drop', { bubbles: true });
    dropEvent.dataTransfer = { files: [file] };
    dropEvent.preventDefault = jest.fn();
    dropEvent.stopPropagation = jest.fn();

    act(() => {
      result.current.handleDrop(dropEvent);
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
      expect(result.current.dragActive).toBe(false);
    });
  });

  test('requires title before submit', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));

    expect(result.current.isSubmitDisabled).toBe(true);

    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'Test' },
      });
    });

    expect(result.current.isSubmitDisabled).toBe(true); // Still disabled - no files
  });

  test('submits form with real upload progress', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useNoteUpload(onSuccess));
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    // Add file and title
    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'Test Note' },
      });
    });

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
    });

    // Mock createNoteRequest to simulate upload progress
    createNoteRequest.mockImplementation((title, files, onProgress) => {
      onProgress(25);
      onProgress(50);
      onProgress(75);
      onProgress(99);
      return Promise.resolve();
    });

    // Submit form
    act(() => {
      result.current.handleSubmit(
        new Event('submit', { bubbles: true })
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.uploadProgress).toBe(100);
      expect(result.current.error).toBe('');
    });

    // Wait for success callback
    jest.advanceTimersByTime(500);
    expect(onSuccess).toHaveBeenCalled();
  });

  test('handles upload error', async () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'Test Note' },
      });
    });

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      expect(result.current.formData.files).toHaveLength(1);
    });

    const errorMessage = 'Network error';
    createNoteRequest.mockRejectedValueOnce(new Error(errorMessage));

    act(() => {
      result.current.handleSubmit(
        new Event('submit', { bubbles: true })
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain(errorMessage);
      expect(result.current.uploadProgress).toBe(0);
    });
  });

  test('validates empty title on submit', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));

    act(() => {
      result.current.handleSubmit(
        new Event('submit', { bubbles: true })
      );
    });

    expect(result.current.error).toContain('Введите название');
  });

  test('validates empty files on submit', () => {
    const { result } = renderHook(() => useNoteUpload(() => {}));

    act(() => {
      result.current.handleInputChange({
        target: { name: 'title', value: 'Test' },
      });
    });

    act(() => {
      result.current.handleSubmit(
        new Event('submit', { bubbles: true })
      );
    });

    expect(result.current.error).toContain('файл');
  });
});
