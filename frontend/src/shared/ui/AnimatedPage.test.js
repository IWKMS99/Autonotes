import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnimatedPage } from './AnimatedPage';

jest.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        const ReactLib = require('react');
        return ({ children, layout, variants, initial, animate, exit, transition, whileHover, whileTap, ...props }) => ReactLib.createElement(tag, props, children);
      },
    }
  ),
  useReducedMotion: () => false,
}));

describe('AnimatedPage', () => {
  test('renders children and className', () => {
    render(
      <AnimatedPage className="test-page">
        <span>content</span>
      </AnimatedPage>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(document.querySelector('.test-page')).toBeInTheDocument();
  });

  test('supports custom element via as', () => {
    render(
      <AnimatedPage as="section">
        <span>section-content</span>
      </AnimatedPage>
    );

    expect(document.querySelector('section')).toBeInTheDocument();
    expect(screen.getByText('section-content')).toBeInTheDocument();
  });
});
