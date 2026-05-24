import React from 'react';
import {
  AnimatedItem,
  AnimatedList,
  AnimatedPage,
  formatRuDate,
  Icon,
  presenceMotion,
  reducedPresenceMotion,
  sectionMotion,
} from 'shared';
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
      <Icon name={icon} size={20} />
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
      <Icon name={icon} size={24} />
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
    totalFiles: stats.totalFiles || 0,
    totalSizeBytes: stats.totalSizeBytes || 0,
    totalSize: stats.totalSize || 0,
  };

  const processedPercent = getProcessedPercent(safeStats);
  const hasRealSize = safeStats.totalSizeBytes > 0;

  if (!profile) {
    return (
      <AnimatedPage
        as="section"
        className="ui-empty-card"
        role="status"
        variants={presenceMotion}
        reducedVariants={reducedPresenceMotion}
      >
        <div className="ui-empty-card__icon" aria-hidden="true">
          <Icon name="user" size={48} />
        </div>
        <h1 className="ui-empty-card__title">Профиль не найден</h1>
        <p className="ui-empty-card__description">
          Не удалось получить данные пользователя. Попробуйте обновить страницу или войти снова.
        </p>
      </AnimatedPage>
    );
  }

  return (
    <section className="profile-page ui-page-shell">
      <AnimatedPage
        as="header"
        className="profile-hero card"
        aria-labelledby="profile-title"
        variants={sectionMotion}
      >
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
              <Icon name="fileText" size={16} />
              <span>{profile.email || 'Email не указан'}</span>
            </span>

            <span className="profile-hero__meta-item">
              <Icon name="calendar" size={16} />
              <span>С нами с {formatRuDate(profile.createdAt)}</span>
            </span>
          </div>
        </div>
      </AnimatedPage>

      <AnimatedList className="profile-content-grid">
        <AnimatedItem as="section" className="profile-panel card" aria-labelledby="profile-info-title">
          <div className="profile-section-heading">
            <span className="profile-section-heading__icon" aria-hidden="true">
              <Icon name="document" size={22} />
            </span>
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
              icon="dashboard"
              title="ID пользователя"
              value={profile.id}
              variant="code"
            />

            <ProfileInfoField
              icon="user"
              title="Имя пользователя"
              value={profile.username}
              variant="primary"
            />

            <ProfileInfoField
              icon="fileText"
              title="Email"
              value={profile.email}
            />

            <ProfileInfoField
              icon="calendar"
              title="Дата регистрации"
              value={formatRuDate(profile.createdAt)}
            />
          </div>
        </AnimatedItem>

        <AnimatedItem as="section" className="profile-panel card" aria-labelledby="profile-stats-title">
          <div className="profile-section-heading">
            <span className="profile-section-heading__icon" aria-hidden="true">
              <Icon name="dashboard" size={22} />
            </span>
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
              icon="books"
              label="Конспектов"
              value={safeStats.totalNotes}
              description="Всего создано"
              variant="primary"
            />

            <ProfileStatCard
              icon="check"
              label="Обработано"
              value={safeStats.processedNotes}
              description={`${processedPercent}% от общего числа`}
              variant="success"
            />

            <ProfileStatCard
              icon="file"
              label="Загружено"
              value={hasRealSize ? `${safeStats.totalSize} MB` : `${safeStats.totalFiles} файлов`}
              description={hasRealSize ? 'Общий размер файлов' : 'Общее количество загруженных файлов'}
              variant="neutral"
            />
          </div>
        </AnimatedItem>

        <AnimatedItem as="aside" className="profile-account-card card" aria-labelledby="profile-account-title">
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
            <Icon name="logout" size={18} />
            <span>Выйти из аккаунта</span>
          </button>
        </AnimatedItem>
      </AnimatedList>
    </section>
  );
};
