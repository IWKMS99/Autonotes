export const NOTE_STATUS = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export const STATUS_COLORS = {
  [NOTE_STATUS.PROCESSING]: '#f59e0b',
  [NOTE_STATUS.COMPLETED]: '#10b981',
  [NOTE_STATUS.FAILED]: '#ef4444',
};

export const STATUS_TEXTS = {
  [NOTE_STATUS.PROCESSING]: 'В обработке',
  [NOTE_STATUS.COMPLETED]: 'Готов',
  [NOTE_STATUS.FAILED]: 'Ошибка',
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

export const ACCEPTED_FILE_EXTENSIONS_TEXT = 'JPG, PNG, GIF';