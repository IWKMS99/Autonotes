import { act, renderHook, waitFor } from '@testing-library/react';
import { useDashboardNotes } from './useDashboardNotes';

jest.mock('entities/note', () => ({
  fetchNotes: jest.fn(),
  fetchNotesStatus: jest.fn(),
}));

jest.mock('shared', () => ({
  ASYNC_STATUS: {
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
  },
  NOTE_STATUS: {
    PROCESSING: 'PROCESSING',
  },
  createAsyncState: jest.fn((state) => state),
  formatRuDateTime: jest.fn((value) => `formatted:${value}`),
}));

const { fetchNotes, fetchNotesStatus } = require('entities/note');

const baseNotes = [
  {
    id: 1,
    title: 'Alpha note',
    summaryText: 'First summary',
    status: 'COMPLETED',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Beta note',
    summaryText: 'Second summary',
    status: 'COMPLETED',
    createdAt: '2024-01-02T10:00:00.000Z',
    updatedAt: '2024-01-02T10:00:00.000Z',
  },
];

describe('useDashboardNotes', () => {
  let setIntervalSpy;
  let clearIntervalSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  test('loads notes on mount and marks request as success', async () => {
    fetchNotes.mockResolvedValueOnce(baseNotes);

    const { result } = renderHook(() => useDashboardNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(2);
    });

    expect(fetchNotes).toHaveBeenCalledTimes(1);
  });

  test('filters notes by search query', async () => {
    fetchNotes.mockResolvedValueOnce(baseNotes);

    const { result } = renderHook(() => useDashboardNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(2);
    });

    act(() => {
      result.current.setSearchQuery('second');
    });

    expect(result.current.filteredAndSortedNotes).toHaveLength(1);
    expect(result.current.filteredAndSortedNotes[0].id).toBe(2);
  });

  test('sorts notes by title in ascending order', async () => {
    fetchNotes.mockResolvedValueOnce(baseNotes);

    const { result } = renderHook(() => useDashboardNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(2);
    });

    act(() => {
      result.current.setSortBy('title');
      result.current.setSortOrder('asc');
    });

    expect(result.current.filteredAndSortedNotes.map((note) => note.title)).toEqual([
      'Alpha note',
      'Beta note',
    ]);
  });

  test('polls only processing notes and stops when they are completed', async () => {
    fetchNotes.mockResolvedValueOnce([
      baseNotes[0],
      {
        ...baseNotes[1],
        status: 'PROCESSING',
      },
    ]);

    fetchNotesStatus.mockResolvedValueOnce([
      {
        id: 2,
        status: 'COMPLETED',
        updatedAt: '2024-01-02T11:00:00.000Z',
        summaryPreview: 'Ready',
      },
    ]);

    const { result } = renderHook(() => useDashboardNotes());

    await waitFor(() => {
      expect(fetchNotesStatus).toHaveBeenCalledWith([2]);
    });

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.notes.find((note) => note.id === 2).status).toBe('COMPLETED');
    });

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(fetchNotesStatus).toHaveBeenCalledTimes(1);
  });
});

