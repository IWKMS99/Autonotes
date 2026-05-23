import React from 'react';
import { AppProviders } from './providers';
import { AppRouter } from './router';

export const App = () => (
  <AppProviders>
    <div className="App">
      <AppRouter />
    </div>
  </AppProviders>
);
