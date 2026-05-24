import { useState } from 'react';
import { loginUser, registerUser, setToken } from 'entities/user';
import { ASYNC_STATUS, createAsyncState } from 'shared';

export const useAuthForm = (mode, onSuccess) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [requestState, setRequestState] = useState(createAsyncState());
  const isRegister = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRequestState(createAsyncState({ status: ASYNC_STATUS.LOADING }));

    try {
      const username = formData.username.trim();
      const email = formData.email.trim();
      const password = formData.password;

      const token = isRegister
        ? await registerUser(username, email, password)
        : await loginUser(username, password);

      setToken(token);
      setRequestState(createAsyncState({ status: ASYNC_STATUS.SUCCESS }));
      onSuccess();
    } catch (error) {
      setRequestState(createAsyncState({ status: ASYNC_STATUS.ERROR, error: error.message || 'Произошла ошибка' }));
    }
  };

  return {
    formData,
    isRegister,
    handleChange,
    handleSubmit,
    isLoading: requestState.status === ASYNC_STATUS.LOADING,
    error: requestState.error,
  };
};
