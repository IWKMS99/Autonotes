import React from 'react';
import { formatRuDate } from 'shared';
import './ProfileView.css';

export const ProfileView = ({ profile, stats, onLogout }) => (
  <div className="slide-up">
    <div className="ui-page-header"><h1 className="ui-page-header__title">Профиль</h1></div>
    <div className="ui-page-narrow">
      {profile && (
        <div className="card ui-card-padded">
          <div className="profile-grid">
            <div><h3>ID пользователя</h3><p className="profile-field__value profile-field__value--code">{profile.id}</p></div>
            <div><h3>Имя пользователя</h3><p className="profile-field__value profile-field__value--primary">{profile.username}</p></div>
            <div><h3>Email</h3><p className="profile-field__value">{profile.email}</p></div>
            <div><h3>Дата регистрации</h3><p className="profile-field__value">{formatRuDate(profile.createdAt)}</p></div>
          </div>
          <div className="profile-stats-grid">
            <div className="profile-stat-card"><div className="profile-stat-card__value">{stats.totalNotes}</div><div className="profile-stat-card__label">Конспектов</div></div>
            <div className="profile-stat-card"><div className="profile-stat-card__value">{stats.processedNotes}</div><div className="profile-stat-card__label">Обработано</div></div>
            <div className="profile-stat-card"><div className="profile-stat-card__value">{stats.totalSize} MB</div><div className="profile-stat-card__label">Загружено</div></div>
          </div>
        </div>
      )}
      <div className="ui-actions-row profile-actions"><button onClick={onLogout} className="btn btn-danger profile-logout-button">Выйти</button></div>
    </div>
  </div>
);
