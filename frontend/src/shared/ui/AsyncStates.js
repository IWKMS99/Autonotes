import React from 'react';
import { AnimatedPage } from './AnimatedPage';
import { presenceMotion, reducedPresenceMotion } from '../lib/motion';

export const LoadingState = ({ text }) => (
  <AnimatedPage
    className="ui-center-state"
    variants={presenceMotion}
    reducedVariants={reducedPresenceMotion}
  >
    <div className="loading-spinner ui-loading-spinner--lg" />
    <p className="ui-center-state__text">{text}</p>
  </AnimatedPage>
);

export const ErrorState = ({ title = 'Ошибка загрузки', message, action }) => (
  <AnimatedPage
    className="ui-center-state"
    variants={presenceMotion}
    reducedVariants={reducedPresenceMotion}
  >
    <div className="ui-center-state__icon">!</div>
    <h2>{title}</h2>
    <p className="ui-center-state__text">{message}</p>
    {action}
  </AnimatedPage>
);

export const EmptyState = ({ icon = '•', title, description, action }) => (
  <AnimatedPage
    className="ui-center-state"
    variants={presenceMotion}
    reducedVariants={reducedPresenceMotion}
  >
    <div className="ui-center-state__icon">{icon}</div>
    <h2>{title}</h2>
    {description && <p className="ui-center-state__text">{description}</p>}
    {action}
  </AnimatedPage>
);
