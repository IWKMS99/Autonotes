import React, { useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from 'shared';
import './LayoutView.css';

const navItems = [
  {
    to: '/dashboard',
    icon: 'books',
    label: 'Конспекты',
    description: 'Все загруженные материалы'
  },
  {
    to: '/upload',
    icon: 'plus',
    label: 'Новый конспект',
    description: 'Загрузить материалы'
  },
  {
    to: '/profile',
    icon: 'user',
    label: 'Профиль',
    description: 'Аккаунт и статистика'
  }
];

export const LayoutView = ({ username, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuId = useId();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="layout-shell">
      <header className="layout-header">
        <div className="container layout-header__inner">
          <Link to="/dashboard" className="layout-logo" aria-label="Autonotes — перейти к конспектам">
            <span className="layout-logo__mark" aria-hidden="true">
              <Icon name="logo" size={24} />
            </span>
            <span className="layout-logo__text">Autonotes</span>
          </Link>

          <nav className="desktop-nav layout-desktop-nav" aria-label="Основная навигация">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`layout-nav-link ${isActive(item.to) ? 'layout-nav-link--active' : ''}`}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="layout-header__actions">
            <Link
              to="/profile"
              className={`desktop-username layout-user-link ${isActive('/profile') ? 'layout-user-link--active' : ''}`}
              aria-current={isActive('/profile') ? 'page' : undefined}
            >
              <span className="layout-user-link__avatar" aria-hidden="true">
                {username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <span className="layout-user-link__name">{username || 'Профиль'}</span>
            </Link>

            <button type="button" onClick={onLogout} className="desktop-logout btn btn-ghost">
              <Icon name="logout" size={18} />
              <span>Выйти</span>
            </button>

            <button
              type="button"
              className="mobile-menu-btn layout-mobile-toggle"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id={mobileMenuId} className="layout-mobile-nav" aria-label="Мобильная навигация">
            <div className="container layout-mobile-nav__inner">
              <div className="layout-mobile-user">
                <span className="layout-user-link__avatar" aria-hidden="true">
                  {username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <div>
                  <p className="layout-mobile-user__label">Вы вошли как</p>
                  <p className="layout-mobile-user__name">{username || 'Пользователь'}</p>
                </div>
              </div>

              <div className="layout-mobile-nav__links">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`layout-mobile-nav__link ${isActive(item.to) ? 'layout-mobile-nav__link--active' : ''}`}
                    aria-current={isActive(item.to) ? 'page' : undefined}
                  >
                    <span className="layout-mobile-nav__icon" aria-hidden="true">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span>
                      <span className="layout-mobile-nav__title">{item.label}</span>
                      <span className="layout-mobile-nav__description">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <button type="button" onClick={onLogout} className="btn btn-secondary btn-block">
                <Icon name="logout" size={18} />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="layout-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};