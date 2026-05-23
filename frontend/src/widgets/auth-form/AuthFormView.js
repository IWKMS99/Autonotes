import React from 'react';
import { Link } from 'react-router-dom';

export const AuthFormView = ({
  mode,
  formData,
  isLoading,
  error,
  onChange,
  onSubmit,
}) => {
  const isRegister = mode === 'register';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)', padding: 'var(--spacing-4)' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 'var(--spacing-8)', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={onSubmit} style={{ marginBottom: 'var(--spacing-6)' }}>
          <h1>{isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}</h1>
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input type="text" name="username" value={formData.username} onChange={onChange} required className="form-input" />
          </div>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Email адрес</label>
              <input type="email" name="email" value={formData.email} onChange={onChange} required className="form-input" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input type="password" name="password" value={formData.password} onChange={onChange} required className="form-input" minLength={6} />
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%' }}>
            {isLoading ? 'Загрузка...' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        {error && <div className="note-upload-error">{error}</div>}

        <p>
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          <Link to={isRegister ? '/login' : '/register'} style={{ marginLeft: 6 }}>
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </Link>
        </p>
      </div>
    </div>
  );
};
