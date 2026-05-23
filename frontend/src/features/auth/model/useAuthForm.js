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
      const token = isRegister
        ? await registerUser(formData.username, formData.email, formData.password)
        : await loginUser(formData.username, formData.password);

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
