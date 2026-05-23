import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthForm } from 'features';
import { AuthFormView } from 'widgets';

export const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const model = useAuthForm(mode, () => navigate('/profile'));

  return (
    <AuthFormView
      mode={mode}
      formData={model.formData}
      isLoading={model.isLoading}
      error={model.error}
      onChange={model.handleChange}
      onSubmit={model.handleSubmit}
    />
  );
};
