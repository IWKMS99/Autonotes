import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from 'app/App';

jest.mock('react-router-dom', () => {
  const React = require('react');

  const matchPath = (routePath, currentPath) => {
    if (!routePath) return false;
    if (routePath === currentPath) return true;
    const routeParts = routePath.split('/').filter(Boolean);
    const pathParts = currentPath.split('/').filter(Boolean);
    if (routeParts.length !== pathParts.length) return false;
    return routeParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
  };

  return {
    BrowserRouter: ({ children }) => <>{children}</>,
    Routes: ({ children }) => {
      const currentPath = global.location.pathname;
      const routes = React.Children.toArray(children).filter(React.isValidElement);
      const matched = routes.find((route) => matchPath(route.props.path, currentPath));
      return matched ? matched.props.element : null;
    },
    Route: () => null,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    Navigate: ({ to }) => {
      global.history.replaceState({}, 'Navigate', to);
      return <div>auth-login</div>;
    },
    useLocation: () => ({ pathname: global.location.pathname }),
  };
}, { virtual: true });

jest.mock('pages', () => ({
  AuthPage: ({ mode }) => <div>auth-{mode}</div>,
  DashboardPage: () => <div>dashboard-page</div>,
  NoteDetailPage: () => <div>note-detail-page</div>,
  NoteUploadPage: () => <div>note-upload-page</div>,
  ProfilePage: () => <div>profile-page</div>,
}));

jest.mock('widgets', () => ({
  LayoutView: ({ children }) => <div>{children}</div>,
}));

jest.mock('entities/user', () => ({
  getUsernameFromToken: jest.fn(() => 'tester'),
  clearToken: jest.fn(),
}));

const renderAt = (path) => {
  window.history.pushState({}, 'Test page', path);
  return render(<App />);
};

describe('App routing smoke', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('redirects unauthenticated user from protected route to login', async () => {
    renderAt('/dashboard');
    expect(await screen.findByText('auth-login')).toBeInTheDocument();
  });

  test('opens dashboard for authenticated user', async () => {
    localStorage.setItem('token', 'fake.jwt.token');
    renderAt('/dashboard');
    expect(await screen.findByText('dashboard-page')).toBeInTheDocument();
  });

  test('opens note detail route for authenticated user', async () => {
    localStorage.setItem('token', 'fake.jwt.token');
    renderAt('/notes/42');
    expect(await screen.findByText('note-detail-page')).toBeInTheDocument();
  });
});
