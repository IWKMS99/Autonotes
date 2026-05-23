import { apiClient, throwHttpError } from 'shared';

export const registerUser = async (username, email, password) => {
  try {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data.token;
  } catch (error) {
    throwHttpError(error);
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data.token;
  } catch (error) {
    throwHttpError(error);
  }
};

export const getUserProfile = async (username) => {
  try {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    throwHttpError(error);
  }
};
