import React from 'react';
import { formatRuDate } from 'shared';
import './ProfileView.css';

const getInitial = (username) => username?.charAt(0)?.toUpperCase() || 'U';

const getProcessedPercent = (stats) => {
  if (!stats?.totalNotes) {
    return 0;
  }

  return Math.round((stats.processedNotes / stats.totalNotes) * 100);
};

const ProfileInfoField = ({ icon, title, value, variant }) => (
  <div className="profile-info-field">
    <span className="profile-info-field__icon" aria-hidden="true">
      {icon}
    </span>

    <div className="profile-info-field__content">
      <h3 className="profile-info-field__title">
        {title}
      </h3>
      <p className={`profile-info-field__value ${variant ? `profile-info-field__value--${variant}` : ''}`}>
        {value || 'Не указано'}
      </p>
    </div>
  </div>
);

const ProfileStatCard = ({ icon, label, value, description, variant }) => (
  <article className={`profile-stat-card profile-stat-card--${variant || 'default'}`}>
    <span className="profile-stat-card__icon" aria-hidden="true">
      {icon}
    </span>

    <div>
      <p className="profile-stat-card__value">
        {value}
      </p>
      <h3 className="profile-stat-card__label">
        {label}
      </h3>
      {description && (
        <p className="profile-stat-card__description">
          {description}
        </p>
      )}
    </div>
  </article>
);

export const ProfileView = ({ profile, stats = {}, onLogout }) => {
  const safeStats = {
    totalNotes: stats.totalNotes || 0,
    processedNotes: stats.processedNotes || 0,
    totalSize: stats.totalSize || 0,
  };

  const processedPercent = getProcessedPercent(safeStats);

  if (!profile) {
    return (
      <section className="ui-empty-card" role="status">
        <div className="ui-empty-card__icon" aria-hidden="true">👤</div>
        <h1 className="ui-empty-card__title">Профиль не найден</h1>
        <p className="ui-empty-card__description">
          Не удалось получить данные пользователя. Попробуйте обновить страницу или войти снова.
        </p>
      </section>
    );
  }

  return (
    <section className="profile-page ui-page-shell slide-up">
      <header className="profile-hero card" aria-labelledby="profile-title">
        <div className="profile-hero__avatar" aria-hidden="true">
          {getInitial(profile.username)}
        </div>

        <div className="profile-hero__content">
          <p className="ui-page-header__eyebrow">Аккаунт</p>

          <h1 id="profile-title" className="profile-hero__title">
            {profile.username || 'Пользователь'}
          </h1>

          <p className="profile-hero__description">
            Здесь собраны данные профиля, статистика по конспектам и действия с аккаунтом.
          </p>

          <div className="profile-hero__meta" aria-label="Краткая информация о профиле">
            <span className="profile-hero__meta-item">
              <span aria-hidden="true">✉️</span>
              <span>{profile.email || 'Email не указан'}</span>
            </span>

            <span className="profile-hero__meta-item">
              <span aria-hidden="true">📅</span>
              <span>С нами с {formatRuDate(profile.createdAt)}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="profile-content-grid">
        <section className="profile-panel card" aria-labelledby="profile-info-title">
          <div className="profile-section-heading">
            <span className="profile-section-heading__icon" aria-hidden="true">🧾</span>
            <div>
              <h2 id="profile-info-title" className="profile-section-heading__title">
                Данные профиля
              </h2>
              <p className="profile-section-heading__description">
                Основная информация, связанная с вашим аккаунтом.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <ProfileInfoField
              icon="🆔"
              title="ID пользователя"
              value={profile.id}
              variant="code"
            />

            <ProfileInfoField
              icon="👤"
              title="Имя пользователя"
              value={profile.username}
              variant="primary"
            />

            <ProfileInfoField
              icon="✉️"
              title="Email"
              value={profile.email}
            />

            <ProfileInfoField
              icon="📅"
              title="Дата регистрации"
              value={formatRuDate(profile.createdAt)}
            />
          </div>
        </section>

        <section className="profile-panel card" aria-labelledby="profile-stats-title">
          <div className="profile-section-heading">
            <span className="profile-section-heading__icon" aria-hidden="true">📊</span>
            <div>
              <h2 id="profile-stats-title" className="profile-section-heading__title">
                Статистика
              </h2>
              <p className="profile-section-heading__description">
                Обзор активности и объёма загруженных материалов.
              </p>
            </div>
          </div>

          <div className="profile-stats-grid" aria-label="Статистика конспектов">
            <ProfileStatCard
              icon="📚"
              label="Конспектов"
              value={safeStats.totalNotes}
              description="Всего создано"
              variant="primary"
            />

            <ProfileStatCard
              icon="✅"
              label="Обработано"
              value={safeStats.processedNotes}
              description={`${processedPercent}% от общего числа`}
              variant="success"
            />

            <ProfileStatCard
              icon="💾"
              label="Загружено"
              value={`${safeStats.totalSize} MB`}
              description="Общий размер файлов"
              variant="neutral"
            />
          </div>
        </section>

        <aside className="profile-account-card card" aria-labelledby="profile-account-title">
          <div>
            <h2 id="profile-account-title" className="profile-account-card__title">
              Управление аккаунтом
            </h2>
            <p className="profile-account-card__description">
              Завершите текущую сессию, если работаете на общем устройстве.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="btn btn-danger profile-logout-button"
          >
            <span aria-hidden="true">🚪</span>
            <span>Выйти из аккаунта</span>
          </button>
        </aside>
      </div>
    </section>
  );
};