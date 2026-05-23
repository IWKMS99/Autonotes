import React from 'react';

export const LoadingState = ({ text }) => (
  <div className="ui-center-state">
    <div className="loading-spinner ui-loading-spinner--lg"></div>
    <p className="ui-center-state__text">{text}</p>
  </div>
);

export const ErrorState = ({ title = 'Ошибка загрузки', message, action }) => (
  <div className="ui-center-state">
    <div className="ui-center-state__icon">⚠️</div>
    <h2>{title}</h2>
    <p className="ui-center-state__text">{message}</p>
    {action}
  </div>
);

export const EmptyState = ({ icon = '📄', title, description, action }) => (
  <div className="ui-center-state">
    <div className="ui-center-state__icon">{icon}</div>
    <h2>{title}</h2>
    {description && <p className="ui-center-state__text">{description}</p>}
    {action}
  </div>
);
