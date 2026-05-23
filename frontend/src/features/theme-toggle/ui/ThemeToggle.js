import React from 'react';
import { useTheme } from 'app/theme';
import { Icon } from 'shared';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-pressed={isDarkTheme}
      title={isDarkTheme ? 'Сейчас включена тёмная тема' : 'Сейчас включена светлая тема'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <Icon name={isDarkTheme ? 'moon' : 'sun'} size={18} />
      </span>

      <span className="theme-toggle__text">
        {isDarkTheme ? 'Тёмная' : 'Светлая'}
      </span>
    </button>
  );
};