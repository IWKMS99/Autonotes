const buildHttpError = (error) => {
  const responseData = error?.response?.data;
  const status = error?.response?.status;
  const message = responseData?.message
    || responseData?.error
    || (error?.code === 'ECONNABORTED' ? 'Превышено время ожидания ответа сервера' : null)
    || error?.message
    || 'Не удалось выполнить запрос. Проверьте подключение к сети.';

  const customError = new Error(message);
  if (status) {
    customError.status = status;
  }
  return customError;
};

export const throwHttpError = (error) => {
  throw buildHttpError(error);
};
