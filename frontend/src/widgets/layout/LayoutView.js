import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from 'features/theme-toggle';
import { Icon } from 'shared';
import './LayoutView.css';

const navItems = [
  {
    to: '/dashboard',
    icon: 'books',
    label: 'Конспекты',
    description: 'Все загруженные материалы',
  },
  {
    to: '/upload',
    icon: 'plus',
    label: 'Новый',
    description: 'Загрузить материалы',
  },
  {
    to: '/profile',
    icon: 'user',
    label: 'Профиль',
    description: 'Аккаунт и статистика',
  },
];

export const LayoutView = ({ username, onLogout, children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const dockNavItems = navItems.length;
  const dockActionItems = 2;

  return (
    <div className="layout-shell">
      <main className="layout-main">
        <div className="container">
          {children}
        </div>
      </main>

      <nav className="layout-dock" aria-label="Основная навигация">
        <div
          className="layout-dock__inner"
          style={{
            '--dock-nav-items': dockNavItems,
            '--dock-action-items': dockActionItems,
          }}
        >
          <div className="layout-dock__links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`layout-dock__link ${isActive(item.to) ? 'layout-dock__link--active' : ''}`}
                aria-current={isActive(item.to) ? 'page' : undefined}
                aria-label={item.description}
                title={item.description}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="layout-dock__actions">
            <ThemeToggle compact />

            <button
              type="button"
              onClick={onLogout}
              className="layout-dock__icon-button"
              aria-label={`Выйти из аккаунта ${username || ''}`.trim()}
              title="Выйти из аккаунта"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};
