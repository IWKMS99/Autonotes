import { mapNoteDto } from './noteMapper';

describe('noteMapper', () => {
  test('uses summaryPreview fallback and imageCount from DTO', () => {
    const result = mapNoteDto({
      id: 1,
      title: 'A',
      summaryPreview: 'preview',
      imageCount: 7,
      images: [{ id: 11, fileSizeBytes: 100 }],
    });

    expect(result.summaryText).toBe('preview');
    expect(result.imageCount).toBe(7);
    expect(result.images[0].size).toBe(100);
  });

  test('falls back imageCount to images length', () => {
    const result = mapNoteDto({
      id: 2,
      title: 'B',
      images: [{ id: 1 }, { id: 2 }],
    });

    expect(result.imageCount).toBe(2);
    expect(result.summaryText).toBe('');
  });
});
