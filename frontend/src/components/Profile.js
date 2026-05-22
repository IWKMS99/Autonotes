import React, { useEffect, useState } from 'react';
import { getProfile, logout, getUsernameFromToken } from '../services/authService';
import { getAllNotes } from '../services/noteService';
import './Profile.css';

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
    return (
      <div className="center-state">
        <div className="loading-spinner loading-spinner--lg"></div>
        <p className="center-state__text">
          Загрузка профиля...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-state">
        <div className="center-state__icon">
          ⚠️
        </div>
        <h2 className="profile-error-title">Ошибка загрузки</h2>
        <p className="center-state__text">{error}</p>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="page-header">
        <div className="page-header__icon">
          👤
        </div>
        <h1 className="page-header__title">
          Профиль
        </h1>
        <p className="page-header__description">
          Информация о вашем аккаунте
        </p>
      </div>

      <div className="page-narrow">
        {profile && (
          <div className="card card-padded">
            <div className="profile-grid">
              <div>
                <div className="profile-field__header">
                  <span className="profile-field__icon">🆔</span>
                  <h3 className="profile-field__title">
                    ID пользователя
                  </h3>
                </div>
                <p className="profile-field__value profile-field__value--code">
                  {profile.id}
                </p>
              </div>

              <div>
                <div className="profile-field__header">
                  <span className="profile-field__icon">👤</span>
                  <h3 className="profile-field__title">
                    Имя пользователя
                  </h3>
                </div>
                <p className="profile-field__value profile-field__value--primary">
                  {profile.username}
                </p>
              </div>

              <div>
                <div className="profile-field__header">
                  <span className="profile-field__icon">📧</span>
                  <h3 className="profile-field__title">
                    Email адрес
                  </h3>
                </div>
                <p className="profile-field__value">
                  {profile.email}
                </p>
              </div>

              <div>
                <div className="profile-field__header">
                  <span className="profile-field__icon">📅</span>
                  <h3 className="profile-field__title">
                    Дата регистрации
                  </h3>
                </div>
                <p className="profile-field__value">
                  {new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="section-divider">
              <div className="section-title">
                <span className="section-title__icon">📊</span>
                <h3 className="section-title__text">
                  Статистика
                </h3>
              </div>

              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="profile-stat-card__value profile-stat-card__value--primary">
                    {stats.totalNotes}
                  </div>
                  <div className="profile-stat-card__label">
                    Конспектов
                  </div>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-card__value profile-stat-card__value--success">
                    {stats.processedNotes}
                  </div>
                  <div className="profile-stat-card__label">
                    Обработано
                  </div>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-card__value profile-stat-card__value--neutral">
                    {stats.totalSize} MB
                  </div>
                  <div className="profile-stat-card__label">
                    Загружено
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="actions-row profile-actions">
          <button
            onClick={handleLogout}
            className="btn btn-danger profile-logout-button"
          >
            🚪 Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;