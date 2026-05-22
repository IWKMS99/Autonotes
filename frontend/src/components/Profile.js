import React, { useEffect, useState } from 'react';
import { getProfile, logout, getUsernameFromToken } from '../services/authService';
import { getAllNotes } from '../services/noteService';
import './Profile.css';

const ProfileLoadingState = () => (
  <div className="ui-center-state">
    <div className="loading-spinner ui-loading-spinner--lg"></div>
    <p className="ui-center-state__text">
      Загрузка профиля...
    </p>
  </div>
);

const ProfileErrorState = ({ message }) => (
  <div className="ui-center-state">
    <div className="ui-center-state__icon">
      ⚠️
    </div>
    <h2 className="profile-error-title">Ошибка загрузки</h2>
    <p className="ui-center-state__text">{message}</p>
  </div>
);

const ProfileHeader = () => (
  <div className="ui-page-header">
    <div className="ui-page-header__icon">
      👤
    </div>
    <h1 className="ui-page-header__title">
      Профиль
    </h1>
    <p className="ui-page-header__description">
      Информация о вашем аккаунте
    </p>
  </div>
);

const getProfileFieldValueClassName = (variant) => {
  const baseClassName = 'profile-field__value';

  if (!variant) {
    return baseClassName;
  }

  return `${baseClassName} ${baseClassName}--${variant}`;
};

const ProfileField = ({ icon, title, value, variant }) => (
  <div>
    <div className="profile-field__header">
      <span className="profile-field__icon">{icon}</span>
      <h3 className="profile-field__title">
        {title}
      </h3>
    </div>
    <p className={getProfileFieldValueClassName(variant)}>
      {value}
    </p>
  </div>
);

const ProfileStatCard = ({ value, label, variant }) => (
  <div className="profile-stat-card">
    <div className={`profile-stat-card__value profile-stat-card__value--${variant}`}>
      {value}
    </div>
    <div className="profile-stat-card__label">
      {label}
    </div>
  </div>
);

const ProfileStats = ({ stats }) => (
  <div className="ui-section-divider">
    <div className="ui-section-title">
      <span className="ui-section-title__icon">📊</span>
      <h3 className="ui-section-title__text">
        Статистика
      </h3>
    </div>

    <div className="profile-stats-grid">
      <ProfileStatCard
        value={stats.totalNotes}
        label="Конспектов"
        variant="primary"
      />

      <ProfileStatCard
        value={stats.processedNotes}
        label="Обработано"
        variant="success"
      />

      <ProfileStatCard
        value={`${stats.totalSize} MB`}
        label="Загружено"
        variant="neutral"
      />
    </div>
  </div>
);

const ProfileActions = ({ onLogout }) => (
  <div className="ui-actions-row profile-actions">
    <button
      onClick={onLogout}
      className="btn btn-danger profile-logout-button"
    >
      🚪 Выйти из аккаунта
    </button>
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalNotes: 0,
    processedNotes: 0,
    totalSize: 0
  });

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const username = getUsernameFromToken();

        if (!username) {
          throw new Error('Не удалось получить имя пользователя из токена.');
        }

        const profileData = await getProfile(username);
        setProfile(profileData);

        const notes = await getAllNotes();

        const totalNotes = notes.length;
        const processedNotes = notes.filter(note => note.status === 'COMPLETED').length;

        const totalSize = notes.reduce((size, note) => {
          const noteSize = note.images?.reduce((imgSize, img) => {
            return imgSize + (img.size || 0);
          }, 0) || 0;

          return size + noteSize;
        }, 0);

        setStats({
          totalNotes,
          processedNotes,
          totalSize: Math.round(totalSize / (1024 * 1024))
        });
      } catch (err) {
        setError(err.message || 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
  return <ProfileLoadingState />;
}

  if (error) {
  return <ProfileErrorState message={error} />;
}

  return (
    <div className="slide-up">
      <ProfileHeader />

      <div className="ui-page-narrow">
        {profile && (
          <div className="card ui-card-padded">
            <div className="profile-grid">
              <ProfileField
                icon="🆔"
                title="ID пользователя"
                value={profile.id}
                variant="code"
              />

              <ProfileField
                icon="👤"
                title="Имя пользователя"
                value={profile.username}
                variant="primary"
              />

              <ProfileField
                icon="📧"
                title="Email адрес"
                value={profile.email}
              />

              <ProfileField
                icon="📅"
                title="Дата регистрации"
                value={new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
            </div>

            <ProfileStats stats={stats} />
          </div>
        )}

        <ProfileActions onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Profile;