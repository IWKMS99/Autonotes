import { fetchNotes } from './noteApi';

const mockGet = jest.fn();

jest.mock('shared', () => ({
  apiClient: { get: (...args) => mockGet(...args) },
  throwHttpError: (error) => {
    throw error;
  },
  ALLOWED_FILE_TYPES: ['image/jpeg'],
  MAX_FILE_SIZE: 10,
}));

describe('fetchNotes', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test('supports legacy array response', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Legacy', images: [] }],
    });

    const result = await fetchNotes();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Legacy');
  });

  test('loads multiple paged responses and merges content', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          content: [{ id: 1, title: 'P1', imageCount: 1 }],
          page: 0,
          size: 1,
          totalPages: 3,
          last: false,
        },
      })
      .mockResolvedValueOnce({ data: { content: [{ id: 2, title: 'P2', imageCount: 2 }] } })
      .mockResolvedValueOnce({ data: { content: [{ id: 3, title: 'P3', imageCount: 3 }] } });

    const result = await fetchNotes();
    expect(result.map((n) => n.id)).toEqual([1, 2, 3]);
  });

  test('keeps available pages when one page request fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockGet
      .mockResolvedValueOnce({
        data: {
          content: [{ id: 1, title: 'P1' }],
          page: 0,
          size: 1,
          totalPages: 3,
          last: false,
        },
      })
      .mockRejectedValueOnce(new Error('page 1 failed'))
      .mockResolvedValueOnce({ data: { content: [{ id: 3, title: 'P3' }] } });

    const result = await fetchNotes();
    expect(result.map((n) => n.id)).toEqual([1, 3]);
    warnSpy.mockRestore();
  });
});
