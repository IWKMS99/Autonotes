import React from 'react';
import { render, screen } from '@testing-library/react';
import { LayoutView } from './LayoutView';

jest.mock('features/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">theme-toggle</button>,
}));

jest.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        const ReactLib = require('react');
        return ({ children, ...props }) => ReactLib.createElement(tag, props, children);
      },
    }
  ),
  useReducedMotion: () => false,
}), { virtual: true });

jest.mock('shared', () => ({
  Icon: () => <span>icon</span>,
  menuMotion: {},
  pageMotion: {},
  reducedMenuMotion: {},
  reducedPageMotion: {},
}), { virtual: true });

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: '/dashboard' }),
}), { virtual: true });

describe('LayoutView smoke', () => {
  test('renders navigation and children', () => {
    render(
      <LayoutView username="tester" onLogout={() => {}}>
        <div>layout-child</div>
      </LayoutView>
    );

    expect(screen.getByText('Конспекты')).toBeInTheDocument();
    expect(screen.getByText('layout-child')).toBeInTheDocument();
    expect(screen.getByText('theme-toggle')).toBeInTheDocument();
  });
});
