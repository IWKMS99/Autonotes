const mapImage = (image) => ({
  ...image,
  size: image.size || image.fileSizeBytes || 0,
  orderIndex: image.orderIndex ?? 0,
});

export const mapNoteDto = (note) => ({
  ...note,
  summaryText: note.summaryText || note.summaryPreview || '',
  images: (note.images || []).map(mapImage),
  imageCount: Number.isFinite(note.imageCount) ? note.imageCount : (note.images || []).length,
});

export const mapNotesDto = (notes) => (notes || []).map(mapNoteDto);
