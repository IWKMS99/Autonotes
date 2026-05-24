import React from 'react';
import { useTheme } from 'app/theme';
import { Icon } from 'shared';
import './ThemeToggle.css';

export const ThemeToggle = ({ compact = false }) => {
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleToggle = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: event.clientX || buttonRect.left + (buttonRect.width / 2),
      y: event.clientY || buttonRect.top + (buttonRect.height / 2),
    };

    toggleTheme(origin);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''}`}
      onClick={handleToggle}
      aria-label={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-pressed={isDarkTheme}
      title={isDarkTheme ? 'Сейчас включена тёмная тема' : 'Сейчас включена светлая тема'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <Icon name={isDarkTheme ? 'moon' : 'sun'} size={18} />
      </span>

      {!compact && (
        <span className="theme-toggle__text">
          {isDarkTheme ? 'Тёмная' : 'Светлая'}
        </span>
      )}
    </button>
  );
};
