import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const AppProviders = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);
