import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const LayoutView = ({ username, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72, padding: 0 }}>
          <Link to="/dashboard" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}>🎓 Autonotes</Link>
          <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: 'var(--spacing-6)' }}>
            <Link to="/dashboard" className="btn btn-ghost" style={{ color: isActive('/dashboard') ? 'var(--primary-color)' : 'var(--text-secondary)' }}>📚 Конспекты</Link>
            <Link to="/upload" className="btn btn-primary">➕ Новый конспект</Link>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <Link to="/profile" className="btn btn-ghost">👤 {username}</Link>
            <button onClick={onLogout} className="btn btn-ghost">🚪 Выйти</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn" style={{ display: 'none' }}>{mobileMenuOpen ? '✕' : '☰'}</button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, padding: 'var(--spacing-8) 0' }}><div className="container">{children}</div></main>
    </div>
  );
};
