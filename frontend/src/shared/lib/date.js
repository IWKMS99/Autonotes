export const formatRuDateTime = (dateValue) => {
  if (!dateValue) {
    return 'Дата не указана';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Дата не указана';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatRuDate = formatDate;

export const getTimeAgo = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'только что';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} мин. назад`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ч. назад`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} дн. назад`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} мес. назад`;
  }

  const years = Math.floor(months / 12);

  return `${years} г. назад`;
};