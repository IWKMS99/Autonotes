import React, { useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ThemeToggle } from 'features/theme-toggle';
import {
  Icon,
  menuMotion,
  pageMotion,
  reducedMenuMotion,
  reducedPageMotion,
} from 'shared';
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
  const shouldReduceMotion = useReducedMotion();

  const isActive = (path) => location.pathname === path;

  const activePageMotion = shouldReduceMotion ? reducedPageMotion : pageMotion;
  const activeMenuMotion = shouldReduceMotion ? reducedMenuMotion : menuMotion;

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

            <ThemeToggle />

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

        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.nav
              id={mobileMenuId}
              className="layout-mobile-nav"
              aria-label="Мобильная навигация"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={activeMenuMotion}
            >
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

                <ThemeToggle />

                <button type="button" onClick={onLogout} className="btn btn-secondary btn-block">
                  <Icon name="logout" size={18} />
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <motion.main
        key={location.pathname}
        className="layout-main"
        initial="initial"
        animate="animate"
        variants={activePageMotion}
      >
        <div className="container">
          {children}
        </div>
      </motion.main>
    </div>
  );
};