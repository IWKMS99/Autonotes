const mapImage = (image) => ({
  ...image,
  size: image.size || 0,
  orderIndex: image.orderIndex ?? 0,
});

export const mapNoteDto = (note) => ({
  ...note,
  images: (note.images || []).map(mapImage),
});

export const mapNotesDto = (notes) => (notes || []).map(mapNoteDto);
