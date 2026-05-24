import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedPage, presenceMotion, reducedPresenceMotion } from 'shared';
import './AuthFormView.css';

export const AuthFormView = ({
  mode,
  formData,
  isLoading,
  error,
  onChange,
  onSubmit,
}) => {
  const generatedId = useId();
  const isRegister = mode === 'register';

  const usernameId = `${generatedId}-username`;
  const emailId = `${generatedId}-email`;
  const passwordId = `${generatedId}-password`;
  const errorId = `${generatedId}-error`;

  const submitLabel = isRegister ? 'Создать аккаунт' : 'Войти';
  const loadingLabel = isRegister ? 'Создаём аккаунт...' : 'Входим...';

  return (
    <main className="auth-page">
      <AnimatedPage
        as="section"
        className="auth-card card"
        aria-labelledby="auth-title"
        variants={presenceMotion}
        reducedVariants={reducedPresenceMotion}
      >
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">
            Autonotes
          </p>

          <h1 id="auth-title" className="auth-card__title">
            {isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}
          </h1>

          <p className="auth-card__description">
            {isRegister
              ? 'Зарегистрируйтесь, чтобы загружать материалы и получать автоматические конспекты.'
              : 'Войдите в аккаунт, чтобы продолжить работу с конспектами.'}
          </p>
        </div>

        {error && (
          <div id={errorId} className="ui-alert ui-alert--error auth-card__alert" role="alert">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={onSubmit}
          aria-busy={isLoading}
          aria-describedby={error ? errorId : undefined}
        >
          <div className="form-group">
            <label className="form-label" htmlFor={usernameId}>
              Имя пользователя
            </label>
            <input
              id={usernameId}
              type="text"
              name="username"
              value={formData.username}
              onChange={onChange}
              required
              autoComplete="username"
              className="form-input"
              placeholder="Введите имя пользователя"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              disabled={isLoading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor={emailId}>
                Email адрес
              </label>
              <input
                id={emailId}
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                autoComplete="email"
                className="form-input"
                placeholder="name@example.com"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? errorId : undefined}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor={passwordId}>
              Пароль
            </label>
            <input
              id={passwordId}
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="form-input"
              placeholder="Минимум 6 символов"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary btn-block auth-form__submit">
            {isLoading && <span className="loading-spinner" aria-hidden="true" />}
            <span>{isLoading ? loadingLabel : submitLabel}</span>
          </button>
        </form>

        <p className="auth-card__switch">
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          {' '}
          <Link to={isRegister ? '/login' : '/register'} className="auth-card__switch-link">
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </Link>
        </p>
      </AnimatedPage>
    </main>
  );
};
