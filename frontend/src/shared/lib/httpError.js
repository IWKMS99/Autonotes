export const throwHttpError = (error) => {
  if (error.response?.data) {
    const message = error.response.data.message || error.response.data.error;
    const status = error.response.status;
    const customError = new Error(message);
    customError.status = status;
    throw customError;
  }
  throw error;
};
